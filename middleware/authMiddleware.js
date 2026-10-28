const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            console.error("Authentication configuration error: JWT_SECRET is missing");
            return res.status(500).json({
                success: false,
                message: "Authentication is temporarily unavailable"
            });
        }

        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check if Authorization header exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required"
            });
        }

        // Expected format:
        // Authorization: Bearer <token>

        const parts = authHeader.trim().split(/\s+/);

        if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer" || !parts[1]) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        const token = parts[1];

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        if (!Number.isInteger(decoded.id) ||
            decoded.id < 1 ||
            typeof decoded.email !== "string" ||
            !["user", "admin"].includes(decoded.user_type)) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        // Store decoded user information
        req.user = decoded;

        // Continue to the requested route
        next();

    } catch (error) {
        if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
            console.error("Authentication middleware error:", error.message);
        }

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });
    }
};

module.exports = authenticateToken;