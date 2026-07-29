
require("dotenv").config();

const express = require("express");
const fs = require("fs");
const pool = require("./db/postgres");
const app = express();

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

app.use(express.json());
app.use("/api", authRoutes);
app.get("/api/me", authMiddleware, (req, res) => {

    res.json({

        success: true,

        user: req.user

    });

});

const NOTES_FILE = "notes.json";


// health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "server alive"
  });
});


// GET all notes
app.get("/api/notes", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(

            `
            SELECT
                id,
                title,
                content,
                created_at
            FROM notes
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,

            [req.user.id]

        );

        res.json({

            success: true,

            notes: result.rows

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Database error"

        });

    }

});

// POST new note
app.post("/api/notes", authMiddleware, async (req, res) => {

    try {

        const { title, content } = req.body;

        await pool.query(
            `
            INSERT INTO notes
            (user_id, title, content)
            VALUES
            ($1, $2, $3)
            `,
[
    req.user.id,
    title,
    content
]
        );

        res.json({
            success: true,
            message: "Note saved to PostgreSQL"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});
async function testDatabase() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected");
    console.log("Server time:", result.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed");
    console.error(err.message);
  }
}

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);

testDatabase();

app.delete("/api/notes/:id", authMiddleware, async (req, res) => {

    try {

        const noteId = req.params.id;

        const result = await pool.query(

            `
            DELETE FROM notes
            WHERE id = $1
            AND user_id = $2
            `,

            [
                noteId,
                req.user.id
            ]

        );

        if (result.rowCount === 0) {

            return res.status(404).json({

                success: false,

                message: "Note not found"

            });

        }

        res.json({

            success: true,

            message: "Note deleted"

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Database error"

        });

    }

});


app.put("/api/notes/:id", authMiddleware, async (req, res) => {

    try {

        const noteId = req.params.id;
        const { title, content } = req.body;

        const result = await pool.query(

            `
            UPDATE notes
            SET
                title = $1,
                content = $2
            WHERE id = $3
            AND user_id = $4
            `,

            [
                title,
                content,
                noteId,
                req.user.id
            ]

        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Note not found"
            });

        }

        res.json({
            success: true,
            message: "Note updated"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});

