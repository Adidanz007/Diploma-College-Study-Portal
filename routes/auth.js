const express = require("express");
const { registerUser, loginUser, getCurrentUser } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

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