const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");

dotenv.config();
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || `http://localhost:${PORT}`)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);

// Serve frontend
app.use(express.static("public"));

// Basic test route
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Express server is working!"
    });
});

// Database test route
app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        res.json({
            success: true,
            message: "MySQL connection successful!",
            data: rows
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "MySQL connection failed"
        });
    }
});

app.use((error, req, res, next) => {
    if (error.message === "Origin is not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Origin is not allowed"
        });
    }

    console.error("Unhandled server error:", error.message);
    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// Start server
if (require.main === module) {
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET must be configured before starting the server");
        process.exitCode = 1;
    } else {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    }
}

module.exports = app;