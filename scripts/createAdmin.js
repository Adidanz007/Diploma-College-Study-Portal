const bcrypt = require("bcryptjs");
const db = require("../config/db");
require("dotenv").config();

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

const createAdmin = async () => {
    try {
        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!name || !email || !password ||
            password.length < MIN_PASSWORD_LENGTH ||
            Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
            throw new Error("Admin name, email, and password are required; password must be at least 8 characters and at most 72 bytes");
        }

        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            console.log("Admin account already exists.");
            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert admin
        const [result] = await db.execute(
            `INSERT INTO users (name, email, password, user_type)
             VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, "admin"]
        );

        console.log("Admin account created successfully.");
        console.log("Admin ID:", result.insertId);
        console.log("Email:", email);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
};

createAdmin();