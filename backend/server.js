
require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const pool = require("./db/postgres");
const app = express();

const postsUploadDir = "/var/www/myproject/assets/images/posts";

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, postsUploadDir);

    },

    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname).toLowerCase();

        const filename =
            `post-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

        cb(null, filename);

    }

});

const uploadPostImage = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));

        }

    }

});

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

// =====================================
// COMMUNITY CHAT
// =====================================

// GET chat messages
app.get("/api/chat", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                chat_messages.id,
                chat_messages.content,
                chat_messages.created_at,
                users.id AS user_id,
                users.username
            FROM chat_messages
            JOIN users
                ON chat_messages.user_id = users.id
            ORDER BY chat_messages.created_at ASC
        `);

        res.json({

            success: true,
            messages: result.rows

        });

    } catch (err) {

        console.error(
            "GET /api/chat error:",
            err
        );

        res.status(500).json({

            success: false,
            message: "Database error"

        });

    }

});

// POST chat message
app.post(
    "/api/chat",
    authMiddleware,
    async (req, res) => {

        try {

            const { content } = req.body;

            if (!content || !content.trim()) {

                return res.status(400).json({

                    success: false,
                    message: "Message cannot be empty"

                });

            }

            const result = await pool.query(
                `
                INSERT INTO chat_messages
                    (user_id, content)
                VALUES
                    ($1, $2)
                RETURNING
                    id,
                    user_id,
                    content,
                    created_at
                `,
                [
                    req.user.id,
                    content.trim()
                ]
            );

            res.status(201).json({

                success: true,
                message: "Message sent",
                chatMessage: result.rows[0]

            });

        } catch (err) {

            console.error(
                "POST /api/chat error:",
                err
            );

            res.status(500).json({

                success: false,
                message: "Database error"

            });

        }

    }
);

// =====================================
// BLOG POSTS
// =====================================

// GET all posts
app.get("/api/posts", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                posts.id,
                posts.title,
                posts.content,
                posts.image_url,
                posts.created_at,
                posts.updated_at,
                users.id AS user_id,
                users.username
            FROM posts
            JOIN users
                ON posts.user_id = users.id
            ORDER BY posts.created_at DESC
        `);

        res.json({

            success: true,

            posts: result.rows

        });

    } catch (err) {

        console.error("GET /api/posts error:", err);

        res.status(500).json({

            success: false,

            message: "Database error"

        });

    }

});


// POST new post
app.post(
    "/api/posts",
    authMiddleware,
    uploadPostImage.single("image"),
    async (req, res) => {
    try {

        const { title, content } = req.body;

        const imageUrl = req.file
    ? `/assets/images/posts/${req.file.filename}`
    : null;

        if (!title || !content) {

            return res.status(400).json({

                success: false,

                message: "Title and content are required"

            });

        }

        const result = await pool.query(

            `
            INSERT INTO posts
    (user_id, title, content, image_url)
VALUES
    ($1, $2, $3, $4)
            RETURNING
                id,
                user_id,
                title,
                content,
                image_url,
                created_at,
                updated_at
            `,

[
    req.user.id,
    title,
    content,
    imageUrl
]
        );

        res.status(201).json({

            success: true,

            message: "Post created",

            post: result.rows[0]

        });

    } catch (err) {

        console.error("POST /api/posts error:", err);

        res.status(500).json({

            success: false,

            message: "Database error"

        });

    }

});

// =====================================
// UPDATE POST
// =====================================

// =====================================
// MULTER ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("❌ MULTER ERROR:", err.code);
        console.error("❌ MULTER MESSAGE:", err.message);

        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.code}`,
            details: err.message
        });
    }

    if (err) {
        console.error("❌ UPLOAD ERROR:", err);

        return res.status(400).json({
            success: false,
            message: err.message || "Upload error"
        });
    }

    next();
});

app.put("/api/posts/:id", authMiddleware, async (req, res) => {

    try {

        const postId = req.params.id;
        const { title, content } = req.body;

        if (!title || !content) {

            return res.status(400).json({

                success: false,
                message: "Title and content are required"

            });

        }

        const result = await pool.query(

            `
            UPDATE posts
            SET
                title = $1,
                content = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            AND user_id = $4
            RETURNING
                id,
                user_id,
                title,
                content,
                created_at,
                updated_at
            `,

            [
                title,
                content,
                postId,
                req.user.id
            ]

        );

        if (result.rowCount === 0) {

            return res.status(404).json({

                success: false,
                message: "Post not found or access denied"

            });

        }

        res.json({

            success: true,
            message: "Post updated",
            post: result.rows[0]

        });

    } catch (err) {

        console.error("PUT /api/posts/:id error:", err);

        res.status(500).json({

            success: false,
            message: "Database error"

        });

    }

});


// =====================================
// DELETE POST
// =====================================

app.delete("/api/posts/:id", authMiddleware, async (req, res) => {

    try {

        const postId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM posts
            WHERE id = $1
            AND user_id = $2
            RETURNING id
            `,
            [
                postId,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Post not found or access denied"
            });

        }

        res.json({
            success: true,
            message: "Post deleted"
        });

    } catch (err) {

        console.error("DELETE /api/posts/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// =====================================
// CREATE COMMENT
// =====================================

app.post("/api/posts/:id/comments", authMiddleware, async (req, res) => {

    try {

        const postId = req.params.id;
        const { content } = req.body;

        if (!content || !content.trim()) {

            return res.status(400).json({

                success: false,
                message: "Comment content is required"

            });

        }

        // Check that post exists
        const postCheck = await pool.query(

            `
            SELECT id
            FROM posts
            WHERE id = $1
            `,

            [postId]

        );

        if (postCheck.rowCount === 0) {

            return res.status(404).json({

                success: false,
                message: "Post not found"

            });

        }

        // Create comment
        const result = await pool.query(

            `
            INSERT INTO comments
                (post_id, user_id, content)
            VALUES
                ($1, $2, $3)
            RETURNING
                id,
                post_id,
                user_id,
                content,
                created_at
            `,

            [
                postId,
                req.user.id,
                content.trim()
            ]

        );

        res.status(201).json({

            success: true,
            message: "Comment created",
            comment: result.rows[0]

        });

    } catch (err) {

        console.error("POST /api/posts/:id/comments error:", err);

        res.status(500).json({

            success: false,
            message: "Database error"

        });

    }

});


// =====================================
// GET COMMENTS FOR POST
// =====================================

app.get("/api/posts/:id/comments", async (req, res) => {

    try {

        const postId = req.params.id;

        // Check that post exists
        const postCheck = await pool.query(

            `
            SELECT id
            FROM posts
            WHERE id = $1
            `,

            [postId]

        );

        if (postCheck.rowCount === 0) {

            return res.status(404).json({

                success: false,
                message: "Post not found"

            });

        }

        // Get comments
        const result = await pool.query(

            `
            SELECT
                comments.id,
                comments.post_id,
                comments.user_id,
                comments.content,
                comments.created_at,
                users.username
            FROM comments
            JOIN users
                ON comments.user_id = users.id
            WHERE comments.post_id = $1
            ORDER BY comments.created_at ASC
            `,

            [postId]

        );

        res.json({

            success: true,
            comments: result.rows

        });

    } catch (err) {

        console.error("GET /api/posts/:id/comments error:", err);

        res.status(500).json({

            success: false,
            message: "Database error"

        });

    }

});

// =====================================
// UPDATE COMMENT
// =====================================

app.put("/api/comments/:id", authMiddleware, async (req, res) => {

    try {

        const commentId = req.params.id;
        const { content } = req.body;

        if (!content || !content.trim()) {

            return res.status(400).json({

                success: false,
                message: "Comment content is required"

            });

        }

        const result = await pool.query(

            `
            UPDATE comments
            SET content = $1
            WHERE id = $2
            AND user_id = $3
            RETURNING
                id,
                post_id,
                user_id,
                content,
                created_at
            `,

            [
                content.trim(),
                commentId,
                req.user.id
            ]

        );

        if (result.rowCount === 0) {

            return res.status(404).json({

                success: false,
                message: "Comment not found or access denied"

            });

        }

        res.json({

            success: true,
            message: "Comment updated",
            comment: result.rows[0]

        });

    } catch (err) {

        console.error("PUT /api/comments/:id error:", err);

        res.status(500).json({

            success: false,
            message: "Database error"

        });

    }

});

// =====================================
// DELETE COMMENT
// =====================================

app.delete("/api/comments/:id", authMiddleware, async (req, res) => {

    try {

        const commentId = req.params.id;

        const result = await pool.query(

            `
            DELETE FROM comments
            WHERE id = $1
            AND user_id = $2
            RETURNING id
            `,

            [
                commentId,
                req.user.id
            ]

        );

        if (result.rowCount === 0) {

            return res.status(404).json({

                success: false,
                message: "Comment not found or access denied"

            });

        }

        res.json({

            success: true,
            message: "Comment deleted",
            commentId: result.rows[0].id

        });

    } catch (err) {

        console.error("DELETE /api/comments/:id error:", err);

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

