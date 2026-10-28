const attempts = new Map();

const getLimit = () => {
    const value = Number.parseInt(process.env.LOGIN_RATE_LIMIT || "5", 10);
    return Number.isInteger(value) && value > 0 ? value : 5;
};

const getWindowMs = () => {
    const value = Number.parseInt(process.env.LOGIN_RATE_WINDOW_MS || "900000", 10);
    return Number.isInteger(value) && value > 0 ? value : 900000;
};

const getClientKey = (req) => req.ip || req.socket.remoteAddress || "unknown";

const loginRateLimiter = (req, res, next) => {
    const now = Date.now();
    const key = getClientKey(req);
    const current = attempts.get(key);

    if (!current || now - current.startedAt >= getWindowMs()) {
        attempts.set(key, { startedAt: now, count: 1 });
        return next();
    }

    if (current.count >= getLimit()) {
        return res.status(429).json({
            success: false,
            message: "Too many login attempts. Please try again later."
        });
    }

    current.count += 1;
    return next();
};

const cleanupLoginRateLimits = () => {
    const now = Date.now();
    for (const [key, entry] of attempts) {
        if (now - entry.startedAt >= getWindowMs()) {
            attempts.delete(key);
        }
    }
};

const resetLoginRateLimiter = () => attempts.clear();

module.exports = {
    loginRateLimiter,
    cleanupLoginRateLimits,
    resetLoginRateLimiter
};
