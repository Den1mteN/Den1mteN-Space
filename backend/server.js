
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

const avatarUploadDir = "/var/www/myproject/assets/images/avatars";

const avatarStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, avatarUploadDir);

    },

    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname).toLowerCase();

        const filename =
            `avatar-${req.user.id}-${Date.now()}${ext}`;

        cb(null, filename);

    }

});

const uploadAvatar = multer({

    storage: avatarStorage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error("Only JPG, PNG and WEBP images are allowed"));

        }

    }

});

const tracksUploadDir = "/var/www/myproject/assets/music";

const trackStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, tracksUploadDir);

    },

    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname).toLowerCase();

        const filename =
            `track-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

        cb(null, filename);

    }

});

const videosUploadDir = "/var/www/myproject/assets/videos";

const videoStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, videosUploadDir);

    },

    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname).toLowerCase();

        const filename =
            `video-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

        cb(null, filename);

    }

});

const uploadVideo = multer({

    storage: videoStorage,

    limits: {
        fileSize: 100 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "video/mp4"
        ];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error("Only MP4 video files are allowed"));

        }

    }

});
const geniusPhotosUploadDir = "/var/www/myproject/assets/images/genius";

const geniusPhotoStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, geniusPhotosUploadDir);

    },

    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname).toLowerCase();

        const filename =
            `genius-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

        cb(null, filename);

    }

});

const uploadGeniusPhoto = multer({

    storage: geniusPhotoStorage,

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
const uploadTrack = multer({

    storage: trackStorage,

    limits: {
        fileSize: 15 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "audio/mpeg",
            "audio/mp3",
            "audio/wav"
        ];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error("Only MP3 and WAV audio files are allowed"));

        }

    }

});
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use("/api", authRoutes);


app.get("/api/me", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                id,
                username,
                email,
                role,
                avatar_url
            FROM users
            WHERE id = $1
            `,
            [req.user.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        return res.json({

            success: true,
            user: result.rows[0]

        });

    } catch (err) {

        console.error("GET /api/me error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

});

app.post(
    "/api/account/avatar",
    authMiddleware,
    uploadAvatar.single("avatar"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Avatar file is required"
                });

            }

            const avatarUrl =
                `/assets/images/avatars/${req.file.filename}`;

            await pool.query(
                `
                UPDATE users
                SET avatar_url = $1
                WHERE id = $2
                `,
                [avatarUrl, req.user.id]
            );

            return res.json({

                success: true,
                avatar_url: avatarUrl

            });

        } catch (err) {

            console.error("POST /api/account/avatar error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to update avatar"
            });

        }

    }
);

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
                created_at,
                note_date
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

        const { title, content, note_date } = req.body;

        await pool.query(
            `
            INSERT INTO notes
            (user_id, title, content, note_date)
            VALUES
            ($1, $2, $3, COALESCE($4, CURRENT_DATE))
            `,
[
    req.user.id,
    title,
    content,
    note_date
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

        let currentUserId = null;

        const authHeader = req.headers.authorization;

        if (authHeader) {

            try {

                const token = authHeader.split(" ")[1];

                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                currentUserId = decoded.id;

            } catch (err) {

                currentUserId = null;

            }

        }

        const result = await pool.query(
            `
            SELECT
                posts.id,
                posts.title,
                posts.content,
                posts.image_url,
                posts.created_at,
                posts.updated_at,
                posts.views_count,
                users.id AS user_id,
                users.username,
                COALESCE(likes.likes_count, 0)::integer AS likes_count,
                EXISTS (
                    SELECT 1
                    FROM post_likes
                    WHERE post_likes.post_id = posts.id
                    AND post_likes.user_id = $1
                ) AS liked_by_me
            FROM posts
            JOIN users
                ON posts.user_id = users.id
            LEFT JOIN (
                SELECT
                    post_id,
                    COUNT(*) AS likes_count
                FROM post_likes
                GROUP BY post_id
            ) likes
                ON likes.post_id = posts.id
            ORDER BY posts.created_at DESC
            `,
            [currentUserId]
        );

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
// INCREMENT POST VIEW
// =====================================

app.post("/api/posts/:id/view", async (req, res) => {

    try {

        const postId = req.params.id;

        const result = await pool.query(
            `
            UPDATE posts
            SET views_count = views_count + 1
            WHERE id = $1
            RETURNING views_count
            `,
            [postId]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Post not found"
            });

        }

        res.json({

            success: true,
            views_count: result.rows[0].views_count

        });

    } catch (err) {

        console.error("POST /api/posts/:id/view error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// =====================================
// GET ALL TRACKS
// =====================================

app.get("/api/tracks", async (req, res) => {

    try {

        let currentUserId = null;

        const authHeader = req.headers.authorization;

        if (authHeader) {

            try {

                const token = authHeader.split(" ")[1];

                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                currentUserId = decoded.id;

            } catch (err) {

                currentUserId = null;

            }

        }

        const result = await pool.query(
            `
            SELECT
                tracks.id,
                tracks.title,
                tracks.artist,
                tracks.lyrics,
                tracks.file_url,
                tracks.views_count,
                tracks.created_at,
                    COALESCE(likes.likes_count, 0)::integer AS likes_count,
                COALESCE(comments.comments_count, 0)::integer AS comments_count,
                EXISTS (
                    SELECT 1
                    FROM track_likes
                    WHERE track_likes.track_id = tracks.id
                    AND track_likes.user_id = $1
                ) AS liked_by_me
            FROM tracks
            LEFT JOIN (
                SELECT
                    track_id,
                    COUNT(*) AS likes_count
                FROM track_likes
                GROUP BY track_id
            ) likes
                ON likes.track_id = tracks.id
            LEFT JOIN (
                SELECT
                    track_id,
                    COUNT(*) AS comments_count
                FROM track_comments
                GROUP BY track_id
            ) comments
                ON comments.track_id = tracks.id
            ORDER BY tracks.created_at DESC
            `,
            [currentUserId]
        );

        res.json({
            success: true,
            tracks: result.rows
        });

    } catch (err) {

        console.error("GET /api/tracks error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// CREATE TRACK (admin only)
// =====================================

app.post(
    "/api/tracks",
    authMiddleware,
    uploadTrack.single("audio"),
    async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });

        }

        const { title, artist, lyrics } = req.body;

        if (!title || !artist || !req.file) {

            return res.status(400).json({
                success: false,
                message: "Title, artist and audio file are required"
            });

        }

        const fileUrl =
            `/assets/music/${req.file.filename}`;

        const result = await pool.query(
            `
            INSERT INTO tracks
                (title, artist, lyrics, file_url)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                id, title, artist, lyrics, file_url, views_count, created_at
            `,
            [
                title,
                artist,
                lyrics || null,
                fileUrl
            ]
        );

        res.status(201).json({
            success: true,
            message: "Track created",
            track: result.rows[0]
        });

    } catch (err) {

        console.error("POST /api/tracks error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// =====================================
// UPDATE TRACK (admin only)
// =====================================

app.put("/api/tracks/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });

        }

        const { title, artist, lyrics } = req.body;

        if (!title || !artist) {

            return res.status(400).json({
                success: false,
                message: "Title and artist are required"
            });

        }

        const result = await pool.query(
            `
            UPDATE tracks
            SET
                title = $1,
                artist = $2,
                lyrics = $3
            WHERE id = $4
            RETURNING
                id,
                title,
                artist,
                lyrics,
                file_url,
                views_count,
                created_at
            `,
            [
                title.trim(),
                artist.trim(),
                lyrics ? lyrics.trim() : null,
                req.params.id
            ]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Track not found"
            });

        }

        res.json({
            success: true,
            message: "Track updated",
            track: result.rows[0]
        });

    } catch (err) {

        console.error("PUT /api/tracks/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// =====================================
// DELETE TRACK (admin only)
// =====================================

app.delete("/api/tracks/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });

        }

        const result = await pool.query(
            `
            DELETE FROM tracks
            WHERE id = $1
            RETURNING id
            `,
            [req.params.id]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Track not found"
            });

        }

        res.json({
            success: true,
            message: "Track deleted",
            trackId: result.rows[0].id
        });

    } catch (err) {

        console.error("DELETE /api/tracks/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// =====================================
// INCREMENT TRACK VIEW
// =====================================

app.post("/api/tracks/:id/view", async (req, res) => {

    try {

        const result = await pool.query(
            `
            UPDATE tracks
            SET views_count = views_count + 1
            WHERE id = $1
            RETURNING views_count
            `,
            [req.params.id]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Track not found"
            });

        }

        res.json({
            success: true,
            views_count: result.rows[0].views_count
        });

    } catch (err) {

        console.error("POST /api/tracks/:id/view error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// LIKE / UNLIKE TRACK
// =====================================

app.post("/api/tracks/:id/like", authMiddleware, async (req, res) => {

    try {

        const trackId = req.params.id;
        const userId = req.user.id;

        const trackCheck = await pool.query(
            `SELECT id FROM tracks WHERE id = $1`,
            [trackId]
        );

        if (trackCheck.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Track not found"
            });

        }

        const likeCheck = await pool.query(
            `
            SELECT id FROM track_likes
            WHERE track_id = $1 AND user_id = $2
            `,
            [trackId, userId]
        );

        let liked;

        if (likeCheck.rowCount > 0) {

            await pool.query(
                `
                DELETE FROM track_likes
                WHERE track_id = $1 AND user_id = $2
                `,
                [trackId, userId]
            );

            liked = false;

        } else {

            await pool.query(
                `
                INSERT INTO track_likes (track_id, user_id)
                VALUES ($1, $2)
                `,
                [trackId, userId]
            );

            liked = true;

        }

        const countResult = await pool.query(
            `
            SELECT COUNT(*)::integer AS likes_count
            FROM track_likes
            WHERE track_id = $1
            `,
            [trackId]
        );

        res.json({
            success: true,
            liked: liked,
            likes_count: countResult.rows[0].likes_count
        });

    } catch (err) {

        console.error("POST /api/tracks/:id/like error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// CREATE TRACK COMMENT
// =====================================

app.post("/api/tracks/:id/comments", authMiddleware, async (req, res) => {

    try {

        const trackId = req.params.id;
        const { content } = req.body;

        if (!content || !content.trim()) {

            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });

        }

        const trackCheck = await pool.query(
            `SELECT id FROM tracks WHERE id = $1`,
            [trackId]
        );

        if (trackCheck.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Track not found"
            });

        }

        const result = await pool.query(
            `
            INSERT INTO track_comments
                (track_id, user_id, content)
            VALUES
                ($1, $2, $3)
            RETURNING
                id, track_id, user_id, content, created_at
            `,
            [trackId, req.user.id, content.trim()]
        );

        res.status(201).json({
            success: true,
            message: "Comment created",
            comment: result.rows[0]
        });

    } catch (err) {

        console.error("POST /api/tracks/:id/comments error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// GET TRACK COMMENTS
// =====================================

app.get("/api/tracks/:id/comments", async (req, res) => {

    try {

        const trackId = req.params.id;

        const result = await pool.query(
            `
            SELECT
                track_comments.id,
                track_comments.track_id,
                track_comments.user_id,
                track_comments.content,
                track_comments.created_at,
                users.username
            FROM track_comments
            JOIN users
                ON track_comments.user_id = users.id
            WHERE track_comments.track_id = $1
            ORDER BY track_comments.created_at ASC
            `,
            [trackId]
        );

        res.json({
            success: true,
            comments: result.rows
        });

    } catch (err) {

        console.error("GET /api/tracks/:id/comments error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// UPDATE TRACK COMMENT
// =====================================

app.put("/api/track-comments/:id", authMiddleware, async (req, res) => {

    try {

        const { content } = req.body;

        if (!content || !content.trim()) {

            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });

        }

        const result = await pool.query(
            `
            UPDATE track_comments
            SET content = $1
            WHERE id = $2 AND user_id = $3
            RETURNING id, track_id, user_id, content, created_at
            `,
            [content.trim(), req.params.id, req.user.id]
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

        console.error("PUT /api/track-comments/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// DELETE TRACK COMMENT
// =====================================

app.delete("/api/track-comments/:id", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(
            `
            DELETE FROM track_comments
            WHERE id = $1 AND user_id = $2
            RETURNING id
            `,
            [req.params.id, req.user.id]
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

        console.error("DELETE /api/track-comments/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// =====================================
// GET ALL VIDEOS
// =====================================

app.get("/api/videos", async (req, res) => {

    try {

        let currentUserId = null;

        const authHeader = req.headers.authorization;

        if (authHeader) {

            try {

                const token = authHeader.split(" ")[1];

                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                currentUserId = decoded.id;

            } catch (err) {

                currentUserId = null;

            }

        }

        const result = await pool.query(
            `
            SELECT
                videos.id,
                videos.title,
                videos.description,
                videos.video_url,
                videos.source_type,
                videos.views_count,
                videos.created_at,
                COALESCE(likes.likes_count, 0)::integer AS likes_count,
                EXISTS (
                    SELECT 1
                    FROM video_likes
                    WHERE video_likes.video_id = videos.id
                    AND video_likes.user_id = $1
                ) AS liked_by_me
            FROM videos
            LEFT JOIN (
                SELECT
                    video_id,
                    COUNT(*) AS likes_count
                FROM video_likes
                GROUP BY video_id
            ) likes
                ON likes.video_id = videos.id
            WHERE videos.category IS NOT DISTINCT FROM $2
            ORDER BY videos.created_at DESC
            `,
            [currentUserId, req.query.category || null]
        );

        res.json({
            success: true,
            videos: result.rows
        });

    } catch (err) {

        console.error("GET /api/videos error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// CREATE VIDEO (admin only)
// =====================================

app.post(
    "/api/videos",
    authMiddleware,
    uploadVideo.single("video"),
    async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });

        }

        const { title, description, sourceType, youtubeUrl, category } = req.body;

        if (!title || !sourceType) {

            return res.status(400).json({
                success: false,
                message: "Title and source type are required"
            });

        }

        let videoUrl;

        if (sourceType === "youtube") {

            if (!youtubeUrl || !youtubeUrl.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "YouTube URL is required"
                });

            }

            videoUrl = youtubeUrl.trim();

        } else if (sourceType === "file") {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Video file is required"
                });

            }

            videoUrl = `/assets/videos/${req.file.filename}`;

        } else {

            return res.status(400).json({
                success: false,
                message: "Invalid source type"
            });

        }

        const result = await pool.query(
            `
            INSERT INTO videos
                (title, description, video_url, source_type, category)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING
                id, title, description, video_url, source_type, category, views_count, created_at
            `,
            [
                title,
                description || null,
                videoUrl,
                sourceType,
                category || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Video created",
            video: result.rows[0]
        });

    } catch (err) {

        console.error("POST /api/videos error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// =====================================
// UPDATE VIDEO (admin only)
// =====================================

app.put("/api/videos/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });

        }

        const {
            title,
            description,
            sourceType,
            videoUrl
        } = req.body;

        if (!title || !sourceType) {

            return res.status(400).json({
                success: false,
                message: "Title and source type are required"
            });

        }

        if (sourceType !== "youtube" && sourceType !== "file") {

            return res.status(400).json({
                success: false,
                message: "Invalid source type"
            });

        }

        if (sourceType === "youtube" && (!videoUrl || !videoUrl.trim())) {

            return res.status(400).json({
                success: false,
                message: "YouTube URL is required"
            });

        }

        let result;

        if (sourceType === "youtube") {

            result = await pool.query(
                `
                UPDATE videos
                SET
                    title = $1,
                    description = $2,
                    video_url = $3,
                    source_type = $4
                WHERE id = $5
                RETURNING
                    id,
                    title,
                    description,
                    video_url,
                    source_type,
                    views_count,
                    created_at
                `,
                [
                    title.trim(),
                    description ? description.trim() : null,
                    videoUrl.trim(),
                    sourceType,
                    req.params.id
                ]
            );

        } else {

            result = await pool.query(
                `
                UPDATE videos
                SET
                    title = $1,
                    description = $2,
                    source_type = $3
                WHERE id = $4
                RETURNING
                    id,
                    title,
                    description,
                    video_url,
                    source_type,
                    views_count,
                    created_at
                `,
                [
                    title.trim(),
                    description ? description.trim() : null,
                    sourceType,
                    req.params.id
                ]
            );

        }

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Video not found"
            });

        }

        res.json({
            success: true,
            message: "Video updated",
            video: result.rows[0]
        });

    } catch (err) {

        console.error("PUT /api/videos/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// =====================================
// DELETE VIDEO (admin only)
// =====================================

app.delete("/api/videos/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });

        }

        const result = await pool.query(
            `
            DELETE FROM videos
            WHERE id = $1
            RETURNING id
            `,
            [req.params.id]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Video not found"
            });

        }

        res.json({
            success: true,
            message: "Video deleted",
            videoId: result.rows[0].id
        });

    } catch (err) {

        console.error("DELETE /api/videos/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// INCREMENT VIDEO VIEW
// =====================================

app.post("/api/videos/:id/view", async (req, res) => {

    try {

        const result = await pool.query(
            `
            UPDATE videos
            SET views_count = views_count + 1
            WHERE id = $1
            RETURNING views_count
            `,
            [req.params.id]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Video not found"
            });

        }

        res.json({
            success: true,
            views_count: result.rows[0].views_count
        });

    } catch (err) {

        console.error("POST /api/videos/:id/view error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// LIKE / UNLIKE VIDEO
// =====================================

app.post("/api/videos/:id/like", authMiddleware, async (req, res) => {

    try {

        const videoId = req.params.id;
        const userId = req.user.id;

        const videoCheck = await pool.query(
            `SELECT id FROM videos WHERE id = $1`,
            [videoId]
        );

        if (videoCheck.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Video not found"
            });

        }

        const likeCheck = await pool.query(
            `
            SELECT id FROM video_likes
            WHERE video_id = $1 AND user_id = $2
            `,
            [videoId, userId]
        );

        let liked;

        if (likeCheck.rowCount > 0) {

            await pool.query(
                `
                DELETE FROM video_likes
                WHERE video_id = $1 AND user_id = $2
                `,
                [videoId, userId]
            );

            liked = false;

        } else {

            await pool.query(
                `
                INSERT INTO video_likes (video_id, user_id)
                VALUES ($1, $2)
                `,
                [videoId, userId]
            );

            liked = true;

        }

        const countResult = await pool.query(
            `
            SELECT COUNT(*)::integer AS likes_count
            FROM video_likes
            WHERE video_id = $1
            `,
            [videoId]
        );

        res.json({
            success: true,
            liked: liked,
            likes_count: countResult.rows[0].likes_count
        });

    } catch (err) {

        console.error("POST /api/videos/:id/like error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// CREATE VIDEO COMMENT
// =====================================

app.post("/api/videos/:id/comments", authMiddleware, async (req, res) => {

    try {

        const videoId = req.params.id;
        const { content } = req.body;

        if (!content || !content.trim()) {

            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });

        }

        const videoCheck = await pool.query(
            `SELECT id FROM videos WHERE id = $1`,
            [videoId]
        );

        if (videoCheck.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Video not found"
            });

        }

        const result = await pool.query(
            `
            INSERT INTO video_comments
                (video_id, user_id, content)
            VALUES
                ($1, $2, $3)
            RETURNING
                id, video_id, user_id, content, created_at
            `,
            [videoId, req.user.id, content.trim()]
        );

        res.status(201).json({
            success: true,
            message: "Comment created",
            comment: result.rows[0]
        });

    } catch (err) {

        console.error("POST /api/videos/:id/comments error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// GET VIDEO COMMENTS
// =====================================

app.get("/api/videos/:id/comments", async (req, res) => {

    try {

        const videoId = req.params.id;

        const result = await pool.query(
            `
            SELECT
                video_comments.id,
                video_comments.video_id,
                video_comments.user_id,
                video_comments.content,
                video_comments.created_at,
                users.username
            FROM video_comments
            JOIN users
                ON video_comments.user_id = users.id
            WHERE video_comments.video_id = $1
            ORDER BY video_comments.created_at ASC
            `,
            [videoId]
        );

        res.json({
            success: true,
            comments: result.rows
        });

    } catch (err) {

        console.error("GET /api/videos/:id/comments error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// UPDATE VIDEO COMMENT
// =====================================

app.put("/api/video-comments/:id", authMiddleware, async (req, res) => {

    try {

        const { content } = req.body;

        if (!content || !content.trim()) {

            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });

        }

        const result = await pool.query(
            `
            UPDATE video_comments
            SET content = $1
            WHERE id = $2 AND user_id = $3
            RETURNING id, video_id, user_id, content, created_at
            `,
            [content.trim(), req.params.id, req.user.id]
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

        console.error("PUT /api/video-comments/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// DELETE VIDEO COMMENT
// =====================================

app.delete("/api/video-comments/:id", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(
            `
            DELETE FROM video_comments
            WHERE id = $1 AND user_id = $2
            RETURNING id
            `,
            [req.params.id, req.user.id]
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

        console.error("DELETE /api/video-comments/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});
// =====================================
// LIKE / UNLIKE POST
// =====================================

app.post("/api/posts/:id/like", authMiddleware, async (req, res) => {

    try {

        const postId = req.params.id;
        const userId = req.user.id;

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

        const likeCheck = await pool.query(
            `
            SELECT id
            FROM post_likes
            WHERE post_id = $1
            AND user_id = $2
            `,
            [
                postId,
                userId
            ]
        );

        let liked;

        if (likeCheck.rowCount > 0) {

            await pool.query(
                `
                DELETE FROM post_likes
                WHERE post_id = $1
                AND user_id = $2
                `,
                [
                    postId,
                    userId
                ]
            );

            liked = false;

        } else {

            await pool.query(
                `
                INSERT INTO post_likes
                    (post_id, user_id)
                VALUES
                    ($1, $2)
                `,
                [
                    postId,
                    userId
                ]
            );

            liked = true;

        }

        const countResult = await pool.query(
            `
            SELECT COUNT(*)::integer AS likes_count
            FROM post_likes
            WHERE post_id = $1
            `,
            [postId]
        );

        res.json({

            success: true,
            liked: liked,
            likes_count: countResult.rows[0].likes_count

        });

    } catch (err) {

        console.error("POST /api/posts/:id/like error:", err);

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


// =====================================================
// TASKS// =====================================================

// GET all tasks
app.get("/api/tasks", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                id,
                text,
                task_date,
                completed,
                goal_id,
                created_at
            FROM tasks
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            tasks: result.rows
        });

    } catch (err) {
        console.error("GET /api/tasks error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }

});

// CREATE task
app.post("/api/tasks", authMiddleware, async (req, res) => {

    try {

        const { text, task_date, goal_id } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Task text is required"
            });
        }

        await pool.query(
            `
            INSERT INTO tasks
                (user_id, text, task_date, goal_id)
            VALUES
                ($1, $2, COALESCE($3, CURRENT_DATE), $4)
            `,
            [req.user.id, text.trim(), task_date, goal_id || null]
        );
        res.json({
            success: true,
            message: "Task created"
        });

    } catch (err) {
        console.error("POST /api/tasks error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }

});

// UPDATE task (toggle completed OR edit text) — власник only
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {

    try {

        const taskId = req.params.id;
        const { text, completed } = req.body;

        const result = await pool.query(
            `
            UPDATE tasks
            SET
                text = COALESCE($1, text),
                completed = COALESCE($2, completed)
            WHERE id = $3
            AND user_id = $4
            RETURNING id, text, task_date, completed, created_at
            `,
            [text, completed, taskId, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found or access denied"
            });
        }

        res.json({
            success: true,
            message: "Task updated",
            task: result.rows[0]
        });

    } catch (err) {
        console.error("PUT /api/tasks/:id error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }

});

// DELETE task — власник only
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {

    try {

        const taskId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM tasks
            WHERE id = $1
            AND user_id = $2
            RETURNING id
            `,
            [taskId, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found or access denied"
            });
        }

        res.json({
            success: true,
            message: "Task deleted",
            taskId: result.rows[0].id
        });

    } catch (err) {
        console.error("DELETE /api/tasks/:id error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }

});


// =====================================================
// GOALS
// =====================================================

// GET all goals
app.get("/api/goals", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                goals.id,
                goals.title,
                goals.description,
                goals.deadline,
                goals.progress_mode,
                goals.manual_progress,
                goals.completed,
                goals.created_at,
                COUNT(tasks.id)::integer AS tasks_total,
                COUNT(tasks.id) FILTER (WHERE tasks.completed)::integer AS tasks_completed,
                CASE
                    WHEN goals.progress_mode = 'tasks' THEN
                        COALESCE(
                            ROUND(
                                100.0 * COUNT(tasks.id) FILTER (WHERE tasks.completed)
                                / NULLIF(COUNT(tasks.id), 0)
                            ),
                            0
                        )
                    ELSE goals.manual_progress
                END AS progress
            FROM goals
            LEFT JOIN tasks
                ON tasks.goal_id = goals.id
            WHERE goals.user_id = $1
            GROUP BY goals.id
            ORDER BY goals.completed ASC, goals.deadline ASC NULLS LAST, goals.created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            goals: result.rows
        });

    } catch (err) {
        console.error("GET /api/goals error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }

});

// CREATE goal
app.post("/api/goals", authMiddleware, async (req, res) => {

    try {

        const { title, description, deadline, progress_mode } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO goals
                (user_id, title, description, deadline, progress_mode)
            VALUES
                ($1, $2, $3, $4, COALESCE($5, 'manual'))
            RETURNING
                id, title, description, deadline, progress_mode,
                manual_progress, completed, created_at
            `,
            [req.user.id, title.trim(), description || null, deadline || null, progress_mode]
        );

        res.status(201).json({
            success: true,
            message: "Goal created",
            goal: result.rows[0]
        });

    } catch (err) {
        console.error("POST /api/goals error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }

});

// UPDATE goal — власник only
app.put("/api/goals/:id", authMiddleware, async (req, res) => {

    try {

        const goalId = req.params.id;
        const { title, description, deadline, manual_progress, completed } = req.body;

        const result = await pool.query(
            `
            UPDATE goals
            SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                deadline = COALESCE($3, deadline),
                manual_progress = COALESCE($4, manual_progress),
                completed = COALESCE($5, completed)
            WHERE id = $6
            AND user_id = $7
            RETURNING
                id, title, description, deadline, progress_mode,
                manual_progress, completed, created_at
            `,
            [title, description, deadline, manual_progress, completed, goalId, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Goal not found or access denied"
            });
        }

        res.json({
            success: true,
            message: "Goal updated",
            goal: result.rows[0]
        });

    } catch (err) {
        console.error("PUT /api/goals/:id error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }

});

// DELETE goal — власник only
app.delete("/api/goals/:id", authMiddleware, async (req, res) => {

    try {

        const goalId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM goals
            WHERE id = $1
            AND user_id = $2
            RETURNING id
            `,
            [goalId, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Goal not found or access denied"
            });
        }

        res.json({
            success: true,
            message: "Goal deleted",
            goalId: result.rows[0].id
        });

    } catch (err) {
        console.error("DELETE /api/goals/:id error:", err);
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

// =====================================================
// EFOOTBALL FORUM ROUTES
// Використовує вже імпортовані в server.js:
//   const pool = require("./db/postgres");
//   const authMiddleware = require("./middleware/auth");
// Вставити цей блок у server.js (наприклад, перед app.listen(...))
// =====================================================


// -----------------------------------------------------
// GET ALL TOPICS (форум eFootball, список усіх тем)
// -----------------------------------------------------
app.get("/api/efootball/posts", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                forum_posts.id,
                forum_posts.user_id,
                forum_posts.title,
                forum_posts.content,
                forum_posts.created_at,
                forum_posts.updated_at,
                users.username,
                (
                    SELECT COUNT(*)::integer
                    FROM forum_comments
                    WHERE forum_comments.post_id = forum_posts.id
                ) AS comments_count,
                (
                    SELECT COUNT(*)::integer
                    FROM forum_post_likes
                    WHERE forum_post_likes.post_id = forum_posts.id
                ) AS likes_count
            FROM forum_posts
            JOIN users
                ON forum_posts.user_id = users.id
            ORDER BY forum_posts.created_at DESC
            `
        );

        res.json({
            success: true,
            posts: result.rows
        });

    } catch (err) {
        console.error("GET /api/efootball/posts error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// GET ONE TOPIC (перегляд однієї теми)
// -----------------------------------------------------
// -----------------------------------------------------
// НАЙОБГОВОРЮВАНІША ТЕМА (для головної сторінки)
// discussion_score = кількість коментарів + кількість унікальних коментаторів
// -----------------------------------------------------
app.get("/api/efootball/posts/popular", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                fp.id,
                fp.title,
                fp.content,
                fp.created_at,
                users.username,
                COUNT(DISTINCT fc.id)::integer AS comments_count,
                COUNT(DISTINCT fc.user_id)::integer AS unique_commenters,
                (
                    SELECT COUNT(*)::integer
                    FROM forum_post_likes
                    WHERE forum_post_likes.post_id = fp.id
                ) AS likes_count
            FROM forum_posts fp
            JOIN users
                ON fp.user_id = users.id
            LEFT JOIN forum_comments fc
                ON fc.post_id = fp.id
            GROUP BY fp.id, users.username
            ORDER BY
                (COUNT(DISTINCT fc.id) + COUNT(DISTINCT fc.user_id)) DESC,
                fp.created_at DESC
            LIMIT 1
            `
        );

        if (result.rowCount === 0) {
            return res.json({ success: true, post: null });
        }

        res.json({
            success: true,
            post: result.rows[0]
        });

    } catch (err) {
        console.error("GET /api/efootball/posts/popular error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});
app.get("/api/efootball/posts/:id", async (req, res) => {
    try {
        const postId = req.params.id;

        const result = await pool.query(
            `
            SELECT
                forum_posts.id,
                forum_posts.user_id,
                forum_posts.title,
                forum_posts.content,
                forum_posts.created_at,
                forum_posts.updated_at,
                users.username
            FROM forum_posts
            JOIN users
                ON forum_posts.user_id = users.id
            WHERE forum_posts.id = $1
            `,
            [postId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        res.json({
            success: true,
            post: result.rows[0]
        });

    } catch (err) {
        console.error("GET /api/efootball/posts/:id error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// CREATE TOPIC (створити нову тему)
// -----------------------------------------------------
app.post("/api/efootball/posts", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !title.trim() || !content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO forum_posts
                (user_id, title, content)
            VALUES
                ($1, $2, $3)
            RETURNING
                id, user_id, title, content, created_at, updated_at
            `,
            [req.user.id, title.trim(), content.trim()]
        );

        res.status(201).json({
            success: true,
            message: "Topic created",
            post: result.rows[0]
        });

    } catch (err) {
        console.error("POST /api/efootball/posts error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// UPDATE TOPIC (редагувати: власник АБО admin)
// -----------------------------------------------------
app.put("/api/efootball/posts/:id", authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content } = req.body;

        if (!title || !title.trim() || !content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // Ключовий момент: user_id = $2 (свій контент) АБО $3 = 'admin' (роль адміна)
        const result = await pool.query(
            `
            UPDATE forum_posts
            SET title = $1,
                content = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            AND (user_id = $4 OR $5 = 'admin')
            RETURNING
                id, user_id, title, content, created_at, updated_at
            `,
            [title.trim(), content.trim(), postId, req.user.id, req.user.role]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Topic not found or access denied"
            });
        }

        res.json({
            success: true,
            message: "Topic updated",
            post: result.rows[0]
        });

    } catch (err) {
        console.error("PUT /api/efootball/posts/:id error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// DELETE TOPIC (видалити: власник АБО admin)
// -----------------------------------------------------
app.delete("/api/efootball/posts/:id", authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM forum_posts
            WHERE id = $1
            AND (user_id = $2 OR $3 = 'admin')
            RETURNING id
            `,
            [postId, req.user.id, req.user.role]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Topic not found or access denied"
            });
        }

        res.json({
            success: true,
            message: "Topic deleted",
            postId: result.rows[0].id
        });

    } catch (err) {
        console.error("DELETE /api/efootball/posts/:id error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// CREATE COMMENT (коментувати будь-яку тему)
// -----------------------------------------------------
app.post("/api/efootball/posts/:id/comments", authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });
        }

        const postCheck = await pool.query(
            `SELECT id FROM forum_posts WHERE id = $1`,
            [postId]
        );

        if (postCheck.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO forum_comments
                (post_id, user_id, content)
            VALUES
                ($1, $2, $3)
            RETURNING
                id, post_id, user_id, content, created_at
            `,
            [postId, req.user.id, content.trim()]
        );

        res.status(201).json({
            success: true,
            message: "Comment created",
            comment: result.rows[0]
        });

    } catch (err) {
        console.error("POST /api/efootball/posts/:id/comments error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// GET COMMENTS FOR TOPIC
// -----------------------------------------------------
app.get("/api/efootball/posts/:id/comments", async (req, res) => {
    try {
        const postId = req.params.id;

        const result = await pool.query(
            `
            SELECT
                forum_comments.id,
                forum_comments.post_id,
                forum_comments.user_id,
                forum_comments.content,
                forum_comments.created_at,
                users.username,
                (
                    SELECT COUNT(*)::integer
                    FROM forum_comment_likes
                    WHERE forum_comment_likes.comment_id = forum_comments.id
                ) AS likes_count
            FROM forum_comments
            JOIN users
                ON forum_comments.user_id = users.id
            WHERE forum_comments.post_id = $1
            ORDER BY forum_comments.created_at ASC
            `,
            [postId]
        );

        res.json({
            success: true,
            comments: result.rows
        });

    } catch (err) {
        console.error("GET /api/efootball/posts/:id/comments error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// UPDATE COMMENT (редагувати: власник АБО admin)
// -----------------------------------------------------
app.put("/api/efootball/comments/:id", authMiddleware, async (req, res) => {
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
            UPDATE forum_comments
            SET content = $1
            WHERE id = $2
            AND (user_id = $3 OR $4 = 'admin')
            RETURNING
                id, post_id, user_id, content, created_at
            `,
            [content.trim(), commentId, req.user.id, req.user.role]
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
        console.error("PUT /api/efootball/comments/:id error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// DELETE COMMENT (видалити: власник АБО admin)
// -----------------------------------------------------
app.delete("/api/efootball/comments/:id", authMiddleware, async (req, res) => {
    try {
        const commentId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM forum_comments
            WHERE id = $1
            AND (user_id = $2 OR $3 = 'admin')
            RETURNING id
            `,
            [commentId, req.user.id, req.user.role]
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
        console.error("DELETE /api/efootball/comments/:id error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// TOGGLE LIKE ON TOPIC (лайк не залежить від автора)
// -----------------------------------------------------
app.post("/api/efootball/posts/:id/like", authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const postCheck = await pool.query(
            `SELECT id FROM forum_posts WHERE id = $1`,
            [postId]
        );

        if (postCheck.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        const likeCheck = await pool.query(
            `
            SELECT id
            FROM forum_post_likes
            WHERE post_id = $1 AND user_id = $2
            `,
            [postId, userId]
        );

        let liked;

        if (likeCheck.rowCount > 0) {
            await pool.query(
                `DELETE FROM forum_post_likes WHERE post_id = $1 AND user_id = $2`,
                [postId, userId]
            );
            liked = false;
        } else {
            await pool.query(
                `INSERT INTO forum_post_likes (post_id, user_id) VALUES ($1, $2)`,
                [postId, userId]
            );
            liked = true;
        }

        const countResult = await pool.query(
            `SELECT COUNT(*)::integer AS likes_count FROM forum_post_likes WHERE post_id = $1`,
            [postId]
        );

        res.json({
            success: true,
            liked: liked,
            likes_count: countResult.rows[0].likes_count
        });

    } catch (err) {
        console.error("POST /api/efootball/posts/:id/like error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// -----------------------------------------------------
// TOGGLE LIKE ON COMMENT (лайк не залежить від автора)
// -----------------------------------------------------
app.post("/api/efootball/comments/:id/like", authMiddleware, async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        const commentCheck = await pool.query(
            `SELECT id FROM forum_comments WHERE id = $1`,
            [commentId]
        );

        if (commentCheck.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        const likeCheck = await pool.query(
            `
            SELECT id
            FROM forum_comment_likes
            WHERE comment_id = $1 AND user_id = $2
            `,
            [commentId, userId]
        );

        let liked;

        if (likeCheck.rowCount > 0) {
            await pool.query(
                `DELETE FROM forum_comment_likes WHERE comment_id = $1 AND user_id = $2`,
                [commentId, userId]
            );
            liked = false;
        } else {
            await pool.query(
                `INSERT INTO forum_comment_likes (comment_id, user_id) VALUES ($1, $2)`,
                [commentId, userId]
            );
            liked = true;
        }

        const countResult = await pool.query(
            `SELECT COUNT(*)::integer AS likes_count FROM forum_comment_likes WHERE comment_id = $1`,
            [commentId]
        );

        res.json({
            success: true,
            liked: liked,
            likes_count: countResult.rows[0].likes_count
        });

    } catch (err) {
        console.error("POST /api/efootball/comments/:id/like error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});

// =====================================
// REMINDERS
// =====================================

// GET all reminders for current user
app.get("/api/reminders", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                id,
                reminder_date,
                reminder_time,
                text,
                created_at
            FROM reminders
            WHERE user_id = $1
            ORDER BY reminder_date ASC, reminder_time ASC NULLS LAST, created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            reminders: result.rows
        });

    } catch (err) {

        console.error("GET /api/reminders error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// POST new reminder
app.post("/api/reminders", authMiddleware, async (req, res) => {

    try {

        const {
            reminder_date,
            reminder_time,
            text
        } = req.body;

        if (!reminder_date || !text || !text.trim()) {

            return res.status(400).json({
                success: false,
                message: "Date and text are required"
            });

        }

        const result = await pool.query(
            `
            INSERT INTO reminders
                (user_id, reminder_date, reminder_time, text)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                id,
                reminder_date,
                reminder_time,
                text,
                created_at
            `,
            [
                req.user.id,
                reminder_date,
                reminder_time || null,
                text.trim()
            ]
        );

        res.status(201).json({
            success: true,
            reminder: result.rows[0]
        });

    } catch (err) {

        console.error("POST /api/reminders error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// DELETE reminder owned by current user
app.delete("/api/reminders/:id", authMiddleware, async (req, res) => {

    try {

        const reminderId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM reminders
            WHERE id = $1
            AND user_id = $2
            RETURNING id
            `,
            [
                reminderId,
                req.user.id
            ]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Reminder not found"
            });

        }

        res.json({
            success: true,
            message: "Reminder deleted",
            reminderId: result.rows[0].id
        });

    } catch (err) {

        console.error("DELETE /api/reminders/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// PLAYER STATS (eFootball achievements)
// =====================================

// GET all player stats (public, no auth — anyone can view the table)
app.get("/api/player-stats", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                id,
                nickname,
                games,
                wins,
                draws,
                losses,
                goals_scored,
                goals_conceded,
                (wins * 3 + draws) AS points,
                (goals_scored - goals_conceded) AS goal_difference,
                updated_at
            FROM player_stats
            ORDER BY points DESC, goal_difference DESC, nickname ASC
            `
        );

        res.json({
            success: true,
            players: result.rows
        });

    } catch (err) {

        console.error("GET /api/player-stats error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// POST new player row (admin only)
app.post("/api/player-stats", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin only"
            });

        }

        const { nickname } = req.body;

        if (!nickname || !nickname.trim()) {

            return res.status(400).json({
                success: false,
                message: "Nickname is required"
            });

        }

        const result = await pool.query(
            `
            INSERT INTO player_stats (nickname)
            VALUES ($1)
            RETURNING
                id,
                nickname,
                games,
                wins,
                draws,
                losses,
                goals_scored,
                goals_conceded,
                updated_at
            `,
            [nickname.trim()]
        );

        res.status(201).json({
            success: true,
            player: result.rows[0]
        });

    } catch (err) {

        console.error("POST /api/player-stats error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// PUT update player stats row (admin only)
app.put("/api/player-stats/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin only"
            });

        }

        const playerId = req.params.id;

        const {
            nickname,
            games,
            wins,
            draws,
            losses,
            goals_scored,
            goals_conceded
        } = req.body;

        const result = await pool.query(
            `
            UPDATE player_stats
            SET
                nickname = $1,
                games = $2,
                wins = $3,
                draws = $4,
                losses = $5,
                goals_scored = $6,
                goals_conceded = $7,
                updated_at = NOW()
            WHERE id = $8
            RETURNING
                id,
                nickname,
                games,
                wins,
                draws,
                losses,
                goals_scored,
                goals_conceded,
                updated_at
            `,
            [
                nickname,
                games,
                wins,
                draws,
                losses,
                goals_scored,
                goals_conceded,
                playerId
            ]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Player not found"
            });

        }

        res.json({
            success: true,
            player: result.rows[0]
        });

    } catch (err) {

        console.error("PUT /api/player-stats/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// DELETE player row (admin only)
app.delete("/api/player-stats/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin only"
            });

        }

        const playerId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM player_stats
            WHERE id = $1
            RETURNING id
            `,
            [playerId]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Player not found"
            });

        }

        res.json({
            success: true,
            message: "Player deleted",
            playerId: result.rows[0].id
        });

    } catch (err) {

        console.error("DELETE /api/player-stats/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

// =====================================
// TOURNAMENT 1 — STATS / SCORERS / DEFENSE
// =====================================

function registerSimpleStatsRoutes(tableName, columns, orderBy) {

    // GET all rows (public)
    app.get("/api/" + tableName, async (req, res) => {

        try {

            const result = await pool.query(
                `SELECT * FROM ${tableName} ORDER BY ${orderBy}`
            );

            res.json({
                success: true,
                rows: result.rows
            });

        } catch (err) {

            console.error("GET /api/" + tableName + " error:", err);

            res.status(500).json({
                success: false,
                message: "Database error"
            });

        }

    });

    // POST new row (admin only)
    app.post("/api/" + tableName, authMiddleware, async (req, res) => {

        try {

            if (req.user.role !== "admin") {

                return res.status(403).json({
                    success: false,
                    message: "Admin only"
                });

            }

            const { nickname } = req.body;

            if (!nickname || !nickname.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Nickname is required"
                });

            }

            const result = await pool.query(
                `INSERT INTO ${tableName} (nickname) VALUES ($1) RETURNING *`,
                [nickname.trim()]
            );

            res.status(201).json({
                success: true,
                row: result.rows[0]
            });

        } catch (err) {

            console.error("POST /api/" + tableName + " error:", err);

            res.status(500).json({
                success: false,
                message: "Database error"
            });

        }

    });

    // PUT update row (admin only)
    app.put("/api/" + tableName + "/:id", authMiddleware, async (req, res) => {

        try {

            if (req.user.role !== "admin") {

                return res.status(403).json({
                    success: false,
                    message: "Admin only"
                });

            }

            const rowId = req.params.id;
            const setClauses = [];
            const values = [];
            let i = 1;

            columns.forEach(function (col) {

                if (req.body[col] !== undefined) {

                    setClauses.push(`${col} = $${i}`);
                    values.push(req.body[col]);
                    i++;

                }

            });

            setClauses.push(`updated_at = NOW()`);
            values.push(rowId);

            const result = await pool.query(
                `UPDATE ${tableName} SET ${setClauses.join(", ")} WHERE id = $${i} RETURNING *`,
                values
            );

            if (result.rowCount === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Row not found"
                });

            }

            res.json({
                success: true,
                row: result.rows[0]
            });

        } catch (err) {

            console.error("PUT /api/" + tableName + "/:id error:", err);

            res.status(500).json({
                success: false,
                message: "Database error"
            });

        }

    });

    // DELETE row (admin only)
    app.delete("/api/" + tableName + "/:id", authMiddleware, async (req, res) => {

        try {

            if (req.user.role !== "admin") {

                return res.status(403).json({
                    success: false,
                    message: "Admin only"
                });

            }

            const result = await pool.query(
                `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`,
                [req.params.id]
            );

            if (result.rowCount === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Row not found"
                });

            }

            res.json({
                success: true,
                message: "Row deleted",
                rowId: result.rows[0].id
            });

        } catch (err) {

            console.error("DELETE /api/" + tableName + "/:id error:", err);

            res.status(500).json({
                success: false,
                message: "Database error"
            });

        }

    });

}

registerSimpleStatsRoutes(
    "tournament1_stats",
    ["nickname", "games", "wins", "draws", "losses", "goals_scored", "goals_conceded"],
    "wins DESC, nickname ASC"
);

registerSimpleStatsRoutes(
    "tournament1_scorers",
    ["nickname", "games", "goals"],
    "goals DESC, nickname ASC"
);

registerSimpleStatsRoutes(
    "tournament1_defense",
    ["nickname", "games", "clean_sheets"],
    "clean_sheets DESC, nickname ASC"
);

// =====================================
// 🎥 CONFERENCE ROOMS API
// =====================================

// GET active conferences
app.get("/api/conferences", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                name,
                room_name,
                created_by,
                created_at,
                is_active
            FROM conference_rooms
            WHERE is_active = TRUE
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            conferences: result.rows
        });

    } catch (err) {

        console.error("GET /api/conferences error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// POST create conference (admin only)
app.post("/api/conferences", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin only"
            });

        }

        const { name } = req.body;

        if (!name || !name.trim()) {

            return res.status(400).json({
                success: false,
                message: "Conference name is required"
            });

        }

        const cleanName = name.trim();

        const roomName =
            "Den1mteNSpace-Blog-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2, 10);

        const result = await pool.query(
            `
            INSERT INTO conference_rooms
                (name, room_name, created_by)
            VALUES
                ($1, $2, $3)
            RETURNING
                id,
                name,
                room_name,
                created_by,
                created_at,
                is_active
            `,
            [
                cleanName,
                roomName,
                req.user.id
            ]
        );

        res.status(201).json({
            success: true,
            conference: result.rows[0]
        });

    } catch (err) {

        console.error("POST /api/conferences error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// GENIUS PHOTOS (Real Genius tab)
// =====================================

app.get("/api/genius-photos", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT id, image_url, caption, created_at
            FROM genius_photos
            ORDER BY created_at DESC
            `
        );

        res.json({
            success: true,
            photos: result.rows
        });

    } catch (err) {

        console.error("GET /api/genius-photos error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

app.post(
    "/api/genius-photos",
    authMiddleware,
    uploadGeniusPhoto.single("photo"),
    async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });

        }

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Photo file is required"
            });

        }

        const imageUrl = `/assets/images/genius/${req.file.filename}`;
        const caption = req.body.caption || null;

        const result = await pool.query(
            `
            INSERT INTO genius_photos (image_url, caption)
            VALUES ($1, $2)
            RETURNING id, image_url, caption, created_at
            `,
            [imageUrl, caption]
        );

        res.status(201).json({
            success: true,
            message: "Photo uploaded",
            photo: result.rows[0]
        });

    } catch (err) {

        console.error("POST /api/genius-photos error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

app.delete("/api/genius-photos/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });

        }

        const result = await pool.query(
            `
            DELETE FROM genius_photos
            WHERE id = $1
            RETURNING id
            `,
            [req.params.id]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Photo not found"
            });

        }

        res.json({
            success: true,
            message: "Photo deleted",
            photoId: result.rows[0].id
        });

    } catch (err) {

        console.error("DELETE /api/genius-photos/:id error:", err);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});



