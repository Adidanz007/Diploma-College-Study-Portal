const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const http = require("node:http");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../server");
const db = require("../config/db");
const { resetLoginRateLimiter } = require("../middleware/loginRateLimiter");
const { resetRevokedTokens } = require("../middleware/tokenRevocation");

const TEST_DATABASE_NAME = "user_db_test";
const integrationEnabled = process.env.DB_NAME === TEST_DATABASE_NAME;
const email = `step3-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
const adminEmail = `step3-admin-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
const password = "Step3Password-2026!";
const adminPassword = "Step3AdminPassword-2026!";
let server;
let baseUrl;
let token;
let adminToken;
let integrationStarted = false;

async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    let body = null;
    try {
        body = await response.json();
    } catch {
        // Non-JSON responses are still useful for CORS and static checks.
    }
    return { response, body };
}

before(async (context) => {
    if (!integrationEnabled) {
        context.skip("Integration tests require DB_NAME=user_db_test; development database was not used");
        return;
    }

    try {
        await db.query("SELECT 1");
    } catch {
        context.skip("Dedicated user_db_test database is unavailable; no integration data was changed");
        await db.end();
        return;
    }

    const adminHash = await bcrypt.hash(adminPassword, 12);
    const [adminResult] = await db.execute(
        "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)",
        ["Step 3 Test Admin", adminEmail, adminHash, "admin"]
    );
    adminToken = jwt.sign(
        { id: adminResult.insertId, email: adminEmail, user_type: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h", algorithm: "HS256" }
    );

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    integrationStarted = true;
});

after(async () => {
    if (!integrationStarted) {
        return;
    }

    await db.execute("DELETE FROM users WHERE email = ?", [email]);
    await db.execute("DELETE FROM users WHERE email = ?", [adminEmail]);
    resetLoginRateLimiter();
    resetRevokedTokens();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await db.end();
});

describe("registration", { skip: !integrationEnabled }, () => {
    it("registers a user with a bcrypt password and user role", async () => {
        const { response, body } = await request("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Step 3 Test User",
                email,
                password,
                user_type: "admin"
            })
        });

        assert.equal(response.status, 201);
        assert.equal(body.user.user_type, "user");
        assert.equal(body.user.password, undefined);

        const [rows] = await db.execute(
            "SELECT password, user_type FROM users WHERE email = ?",
            [email]
        );
        assert.equal(rows.length, 1);
        assert.notEqual(rows[0].password, password);
        assert.equal(await bcrypt.compare(password, rows[0].password), true);
        assert.equal(rows[0].user_type, "user");
    });

    it("rejects duplicate email registration", async () => {
        const { response } = await request("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Duplicate", email, password })
        });
        assert.equal(response.status, 409);
    });

    it("rejects invalid registration data", async () => {
        const { response } = await request("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "", email: "not-an-email", password: "short" })
        });
        assert.equal(response.status, 400);
    });

    it("rejects passwords that exceed bcrypt's 72-byte limit", async () => {
        const { response } = await request("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Long Password User",
                email: `long-${email}`,
                password: "😀".repeat(19)
            })
        });
        assert.equal(response.status, 400);
    });
});

describe("login and JWT authentication", { skip: !integrationEnabled }, () => {
    it("logs in and returns a JWT without a password", async () => {
        const { response, body } = await request("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        assert.equal(response.status, 200);
        assert.equal(typeof body.token, "string");
        assert.equal(body.user.password, undefined);
        token = body.token;
    });

    it("rejects an incorrect password", async () => {
        const { response } = await request("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: "WrongPassword-2026!" })
        });
        assert.equal(response.status, 401);
    });

    it("rate limits repeated login attempts", async () => {
        process.env.LOGIN_RATE_LIMIT = "3";
        process.env.LOGIN_RATE_WINDOW_MS = "60000";
        resetLoginRateLimiter();

        for (let attempt = 0; attempt < 3; attempt += 1) {
            const { response } = await request("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: "WrongPassword-2026!" })
            });
            assert.equal(response.status, 401);
        }

        const { response, body } = await request("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: "WrongPassword-2026!" })
        });
        assert.equal(response.status, 429);
        assert.equal(body.message, "Too many login attempts. Please try again later.");
        resetLoginRateLimiter();
        delete process.env.LOGIN_RATE_LIMIT;
        delete process.env.LOGIN_RATE_WINDOW_MS;
    });

    it("rejects a missing token", async () => {
        const { response } = await request("/api/auth/protected");
        assert.equal(response.status, 401);
    });

    it("rejects a malformed token", async () => {
        const { response } = await request("/api/auth/protected", {
            headers: { Authorization: "Bearer not-a-jwt" }
        });
        assert.equal(response.status, 401);
    });

    it("accepts a valid token", async () => {
        const { response, body } = await request("/api/auth/protected", {
            headers: { Authorization: `Bearer ${token}` }
        });
        assert.equal(response.status, 200);
        assert.equal(body.user.email, email);
    });

    it("rejects an expired token", async () => {
        const expiredToken = jwt.sign(
            { id: 1, email, user_type: "user" },
            process.env.JWT_SECRET,
            { expiresIn: -1, algorithm: "HS256" }
        );
        const { response } = await request("/api/auth/protected", {
            headers: { Authorization: `Bearer ${expiredToken}` }
        });
        assert.equal(response.status, 401);
    });

    it("rejects a tampered token", async () => {
        const tamperedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
        const { response } = await request("/api/auth/protected", {
            headers: { Authorization: `Bearer ${tamperedToken}` }
        });
        assert.equal(response.status, 401);
    });

    it("rejects a token with missing required claims", async () => {
        const incompleteToken = jwt.sign(
            { id: 1 },
            process.env.JWT_SECRET,
            { expiresIn: "1h", algorithm: "HS256" }
        );
        const { response } = await request("/api/auth/protected", {
            headers: { Authorization: `Bearer ${incompleteToken}` }
        });
        assert.equal(response.status, 401);
    });

    it("rejects a token signed with an unsupported algorithm", async () => {
        const unsupportedToken = jwt.sign(
            { id: 1, email, user_type: "user" },
            process.env.JWT_SECRET,
            { algorithm: "HS384", expiresIn: "1h" }
        );
        const { response } = await request("/api/auth/protected", {
            headers: { Authorization: `Bearer ${unsupportedToken}` }
        });
        assert.equal(response.status, 401);
    });

    it("logs out and rejects the revoked token", async () => {
        const login = await request("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        assert.equal(login.response.status, 200);

        const logout = await request("/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${login.body.token}` }
        });
        assert.equal(logout.response.status, 200);

        const protectedResponse = await request("/api/auth/protected", {
            headers: { Authorization: `Bearer ${login.body.token}` }
        });
        assert.equal(protectedResponse.response.status, 401);
    });
});

describe("authorization and CORS", { skip: !integrationEnabled }, () => {
    it("requires authentication for the admin route", async () => {
        const { response } = await request("/api/auth/admin-test");
        assert.equal(response.status, 401);
    });

    it("denies an ordinary user access to an admin route", async () => {
        const { response } = await request("/api/auth/admin-test", {
            headers: { Authorization: `Bearer ${token}` }
        });
        assert.equal(response.status, 403);
    });

    it("allows an authorized administrator to access the admin route", async () => {
        const { response, body } = await request("/api/auth/admin-test", {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert.equal(response.status, 200);
        assert.equal(body.user.user_type, "admin");
    });

    it("does not allow a tampered token to access the admin route", async () => {
        const tamperedToken = `${adminToken.slice(0, -1)}${adminToken.endsWith("a") ? "b" : "a"}`;
        const { response } = await request("/api/auth/admin-test", {
            headers: { Authorization: `Bearer ${tamperedToken}` }
        });
        assert.equal(response.status, 401);
    });

    it("allows the configured local origin", async () => {
        const { response } = await request("/api/test", {
            headers: { Origin: "http://localhost:5000" }
        });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5000");
    });

    it("does not allow an untrusted origin", async () => {
        const { response } = await request("/api/test", {
            headers: { Origin: "https://untrusted.example" }
        });
        assert.equal(response.status, 403);
        assert.equal(response.headers.get("access-control-allow-origin"), null);
    });
});
