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

        // Створюємо JWT
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
