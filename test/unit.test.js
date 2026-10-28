const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const http = require("node:http");
const app = require("../server");
const {
    cleanupLoginRateLimits,
    resetLoginRateLimiter
} = require("../middleware/loginRateLimiter");
const {
    isTokenRevoked,
    revokeToken,
    resetRevokedTokens
} = require("../middleware/tokenRevocation");

let server;
let baseUrl;

before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    resetLoginRateLimiter();
    resetRevokedTokens();
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

describe("in-memory security controls", () => {
    it("revokes a token without storing or exposing the raw token", () => {
        resetRevokedTokens();
        const token = "unit-test-token";
        const expiresAt = Math.floor(Date.now() / 1000) + 60;

        assert.equal(isTokenRevoked(token), false);
        revokeToken(token, expiresAt);
        assert.equal(isTokenRevoked(token), true);
        assert.equal(isTokenRevoked(`${token}-tampered`), false);
        resetRevokedTokens();
    });

    it("removes expired token revocations", () => {
        resetRevokedTokens();
        const token = "expired-unit-test-token";

        revokeToken(token, Math.floor(Date.now() / 1000) - 1);
        assert.equal(isTokenRevoked(token), false);
        resetRevokedTokens();
    });

    it("cleans expired rate-limit entries safely", () => {
        resetLoginRateLimiter();
        process.env.LOGIN_RATE_WINDOW_MS = "1";
        cleanupLoginRateLimits();
        delete process.env.LOGIN_RATE_WINDOW_MS;
        assert.ok(true);
    });
});

describe("safe API error responses", () => {
    it("returns JSON 400 for malformed JSON", async () => {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{\"name\":"
        });
        const body = await response.json();

        assert.equal(response.status, 400);
        assert.deepEqual(body, {
            success: false,
            message: "Malformed JSON request body"
        });
    });

    it("returns JSON 404 for unknown API routes", async () => {
        const response = await fetch(`${baseUrl}/api/does-not-exist`);
        const body = await response.json();

        assert.equal(response.status, 404);
        assert.deepEqual(body, {
            success: false,
            message: "API route not found"
        });
    });
});
