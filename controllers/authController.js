const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return process.env.JWT_SECRET;
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedName = typeof name === "string" ? name.trim() : "";
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!normalizedName || !normalizedEmail || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (normalizedName.length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
            password.length < MIN_PASSWORD_LENGTH ||
            Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid name, email, and password of at least 8 characters and at most 72 bytes"
            });
        }

        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        // 3. Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Create the new user
        const [result] = await db.execute(
            `INSERT INTO users (name, email, password, user_type)
             VALUES (?, ?, ?, ?)`,
            [normalizedName, normalizedEmail, hashedPassword, "user"]
        );

        // 5. Send success response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: result.insertId,
                name: normalizedName,
                email: normalizedEmail,
                user_type: "user"
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!normalizedEmail ||
            typeof password !== "string" ||
            password.length < MIN_PASSWORD_LENGTH ||
            Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required; password must be at least 8 characters and at most 72 bytes"
            });
        }

        // 2. Find user by email
        const [users] = await db.execute(
            "SELECT id, name, email, password, user_type FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        const user = users[0];

        // 3. Compare entered password with bcrypt hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        // 4. Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                user_type: user.user_type
            },
            getJwtSecret(),
            {
                expiresIn: "1h",
                algorithm: "HS256"
            }
        );

        // 5. Return successful login response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                user_type: user.user_type
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.execute(
            `SELECT id, name, email, user_type, created_at
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Get current user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};