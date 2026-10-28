const db = require("../config/db");

const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        // Make sure authentication middleware has already run
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!Number.isInteger(Number(req.user.id))) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        try {
            const [users] = await db.execute(
                "SELECT id, name, email, user_type FROM users WHERE id = ?",
                [req.user.id]
            );

            if (users.length === 0 || !allowedRoles.includes(users[0].user_type)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            req.user = {
                ...req.user,
                ...users[0]
            };
            return next();
        } catch (error) {
            console.error("Authorization lookup error:", error.message);
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }
    };
};

module.exports = authorizeRoles;