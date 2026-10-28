const bcrypt = require("bcryptjs");
const db = require("../config/db");
require("dotenv").config();
const readline = require("node:readline");

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

const promptHidden = () => new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        return reject(new Error("ADMIN_PASSWORD is missing and an interactive terminal is required"));
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    process.stdout.write("Admin password: ");
    const onData = (chunk) => {
        const character = chunk.toString();
        if (character === "\n" || character === "\r" || character === "\u0004") {
            process.stdin.setRawMode(false);
            process.stdin.removeListener("data", onData);
            rl.close();
            process.stdout.write("\n");
            resolve(password);
            return;
        }

        if (character === "\u0003") {
            process.stdin.setRawMode(false);
            process.stdin.removeListener("data", onData);
            rl.close();
            reject(new Error("Administrator creation cancelled"));
            return;
        }

        if (character === "\u007f") {
            password = password.slice(0, -1);
        } else {
            password += character;
        }
    };

    let password = "";
    rl.pause();
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
});

const validateAdminInput = (name, email, password) => {
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedName ||
        normalizedName.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
        typeof password !== "string" ||
        password.length < MIN_PASSWORD_LENGTH ||
        Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
        throw new Error("Provide a valid admin name, email, and password of at least 8 characters and at most 72 bytes");
    }

    return { normalizedName, normalizedEmail };
};

const createAdmin = async () => {
    try {
        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL;
        if (!name || !email) {
            throw new Error("ADMIN_NAME and ADMIN_EMAIL must be configured");
        }

        const password = process.env.ADMIN_PASSWORD || await promptHidden();
        const { normalizedName, normalizedEmail } = validateAdminInput(name, email, password);

        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
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
            [normalizedName, normalizedEmail, hashedPassword, "admin"]
        );

        console.log("Admin account created successfully.");
        console.log("Admin ID:", result.insertId);
        console.log("Email:", email);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await db.end().catch((error) => {
            console.error("Could not close the database connection:", error.message);
        });
    }
};

createAdmin();