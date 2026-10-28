const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const http = require("node:http");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../server");
const db = require("../config/db");

const email = `step3-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
const password = "Step3Password-2026!";
let server;
let baseUrl;
let token;

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

before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await db.execute("DELETE FROM users WHERE email = ?", [email]);
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await db.end();
});

describe("registration", () => {
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

describe("login and JWT authentication", () => {
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
});

describe("authorization and CORS", () => {
    it("denies an ordinary user access to an admin route", async () => {
        const { response } = await request("/api/auth/admin-test", {
            headers: { Authorization: `Bearer ${token}` }
        });
        assert.equal(response.status, 403);
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
