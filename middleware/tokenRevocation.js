const crypto = require("node:crypto");

const revokedTokens = new Map();

const getTokenHash = (token) => crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

const removeExpiredTokens = () => {
    const now = Math.floor(Date.now() / 1000);
    for (const [hash, expiresAt] of revokedTokens) {
        if (expiresAt <= now) {
            revokedTokens.delete(hash);
        }
    }
};

const revokeToken = (token, expiresAt) => {
    removeExpiredTokens();
    revokedTokens.set(getTokenHash(token), expiresAt);
};

const isTokenRevoked = (token) => {
    removeExpiredTokens();
    return revokedTokens.has(getTokenHash(token));
};

const resetRevokedTokens = () => revokedTokens.clear();

module.exports = {
    isTokenRevoked,
    revokeToken,
    resetRevokedTokens
};
