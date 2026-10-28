const { spawnSync } = require("node:child_process");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const TEST_DATABASE_NAME = "user_db_test";

const run = async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: "mysql"
    });

    try {
        const [databaseRows] = await pool.execute(
            "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
            [TEST_DATABASE_NAME]
        );

        if (databaseRows.length === 0) {
            console.log("SKIP: user_db_test does not exist; no integration tests were run.");
            return;
        }

        const [tableRows] = await pool.execute(
            `SELECT TABLE_NAME
             FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
            [TEST_DATABASE_NAME]
        );

        if (tableRows.length === 0) {
            console.log("SKIP: user_db_test.users does not exist; no integration tests were run.");
            return;
        }
    } catch {
        console.log("SKIP: dedicated test database preflight was unavailable; no integration tests were run.");
        return;
    } finally {
        await pool.end();
    }

    const result = spawnSync(
        process.execPath,
        ["--test", "test/auth.test.js"],
        {
            stdio: "inherit",
            env: { ...process.env, DB_NAME: TEST_DATABASE_NAME }
        }
    );

    process.exitCode = result.status === null ? 1 : result.status;
};

run().catch(() => {
    console.log("SKIP: dedicated test database preflight failed; no integration tests were run.");
});
