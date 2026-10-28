const express = require("express");
const { registerUser, loginUser, getCurrentUser } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { revokeToken } = require("../middleware/tokenRevocation");
const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login
router.post(
    "/login",
    require("../middleware/loginRateLimiter").loginRateLimiter,
    loginUser
);

router.post("/logout", authenticateToken, (req, res) => {
    revokeToken(req.authToken, req.user.exp);
    return res.status(200).json({
        success: true,
        message: "Logout successful"
    });
});

router.get(
    "/me",
    authenticateToken,
    getCurrentUser
);

router.get("/protected", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Authentication successful",
        user: req.user
    });
});

router.get(
    "/admin-test",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Admin access granted",
            user: req.user
        });
    }
);
module.exports = router;