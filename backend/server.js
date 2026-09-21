
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
            ORDER BY videos.created_at DESC
            `,
            [currentUserId]
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

        const { title, description, sourceType, youtubeUrl } = req.body;

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
                (title, description, video_url, source_type)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                id, title, description, video_url, source_type, views_count, created_at
            `,
            [
                title,
                description || null,
                videoUrl,
                sourceType
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

