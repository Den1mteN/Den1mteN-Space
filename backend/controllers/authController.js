const pool = require("../db/postgres");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users
            (username, email, password_hash, status, role)
            VALUES
            ($1, $2, $3, 'active', 'user')`,
            [username, email, hashedPassword]
        );

        return res.json({
            success: true,
            message: "User created"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const user = result.rows[0];

        const passwordOk = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordOk) {
            return res.status(401).json({
                success: false,
                message: "Wrong password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        return res.json({
            success: true,
            message: "Login successful",
            token,

            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.updateUsername = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || !username.trim()) {
            return res.status(400).json({
                success: false,
                message: "Username is required"
            });
        }

        const newUsername = username.trim();

        if (newUsername.length < 3 || newUsername.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Username must be between 3 and 50 characters"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE username = $1 AND id != $2",
            [newUsername, req.user.id]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET username = $1
             WHERE id = $2
             RETURNING id, username, email, role`,
            [newUsername, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = result.rows[0];

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        return res.json({
            success: true,
            message: "Username updated",
            token,

            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.updateEmail = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and current password are required"
            });
        }

        const newEmail = email.trim().toLowerCase();

        // Перевіряємо поточний пароль
        const userResult = await pool.query(
            "SELECT id, username, email, password_hash, role FROM users WHERE id = $1",
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = userResult.rows[0];

        const passwordOk = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordOk) {
            return res.status(401).json({
                success: false,
                message: "Wrong password"
            });
        }

        // Перевіряємо, чи email уже зайнятий
        const existingEmail = await pool.query(
            "SELECT id FROM users WHERE email = $1 AND id != $2",
            [newEmail, req.user.id]
        );

        if (existingEmail.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Оновлюємо email
        const result = await pool.query(
            `
            UPDATE users
            SET email = $1
            WHERE id = $2
            RETURNING id, username, email, role
            `,
            [newEmail, req.user.id]
        );

        const updatedUser = result.rows[0];

        return res.json({
            success: true,
            message: "Email updated",

            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email
            }
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};

exports.updatePassword = async (req, res) => {

    try {

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {

            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });

        }

        if (newPassword.length < 6) {

            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });

        }

        const result = await pool.query(
            "SELECT id, password_hash FROM users WHERE id = $1",
            [req.user.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const user = result.rows[0];

        const passwordOk = await bcrypt.compare(
            currentPassword,
            user.password_hash
        );

        if (!passwordOk) {

            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });

        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await pool.query(
            `
            UPDATE users
            SET password_hash = $1
            WHERE id = $2
            `,
            [hashedPassword, req.user.id]
        );

        return res.json({
            success: true,
            message: "Password updated"
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};
