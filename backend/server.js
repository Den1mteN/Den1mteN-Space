
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
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-m4v"
        ];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error("Only MP4, WEBM, MOV and M4V video files are allowed"));

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


// LAUNCH WEEK STATUS AND PIONEER COUNT
app.get("/api/launch-status", async (req, res) => {
    const launchStartIso = "2026-10-09T21:00:00.000Z";
    const launchEndIso = "2026-10-17T21:00:00.000Z";

    const launchStart = Date.parse(launchStartIso);
    const launchEnd = Date.parse(launchEndIso);
    const now = Date.now();

    const phase = now < launchStart
        ? "countdown"
        : now < launchEnd
            ? "launch"
            : "ended";

    const day = phase === "launch"
        ? Math.floor((now - launchStart) / (24 * 60 * 60 * 1000)) + 1
        : 0;

    // Optional authentication: public visitors can read the status too.
    let currentUserId = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const decoded = jwt.verify(
                authHeader.slice(7),
                process.env.JWT_SECRET
            );

            const candidateId = Number(decoded.id);

            if (Number.isInteger(candidateId) && candidateId > 0) {
                currentUserId = candidateId;
            }
        } catch (err) {
            // Invalid or expired optional token: return public status.
            currentUserId = null;
        }
    }

    try {
        const result = await pool.query(
            `
            SELECT
                COUNT(*)::integer AS pioneer_count,
                COALESCE(
                    BOOL_OR(id = $3::integer),
                    FALSE
                ) AS is_pioneer
            FROM users
            WHERE created_at >= $1::timestamp
              AND created_at < $2::timestamp
            `,
            [
                "2026-10-09 21:00:00",
                "2026-10-17 21:00:00",
                currentUserId
            ]
        );

        return res.json({
            success: true,
            phase,
            day,
            campaignDays: 8,
            serverNow: new Date(now).toISOString(),
            launchStart: launchStartIso,
            launchEnd: launchEndIso,
            pioneerCount: result.rows[0].pioneer_count,
            isPioneer: result.rows[0].is_pioneer
        });
    } catch (err) {
        console.error("GET /api/launch-status error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to load Launch Week status"
        });
    }
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

// UPDATE CHAT MESSAGE — ADMIN ONLY
app.put(
    "/api/chat/:id",
    authMiddleware,
    async (req, res) => {

        try {

            if (!req.user || req.user.role !== "admin") {

                return res.status(403).json({
                    success: false,
                    message: "Admin access required"
                });

            }

            const messageId =
                Number(req.params.id);

            const { content } =
                req.body;

            if (
                !Number.isInteger(messageId) ||
                messageId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid message id"
                });

            }

            if (
                typeof content !== "string" ||
                !content.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Message cannot be empty"
                });

            }

            const result =
                await pool.query(
                    `
                    UPDATE chat_messages
                    SET content = $1
                    WHERE id = $2
                    RETURNING
                        id,
                        user_id,
                        content,
                        created_at
                    `,
                    [
                        content.trim(),
                        messageId
                    ]
                );

            if (result.rowCount === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Message not found"
                });

            }

            return res.json({
                success: true,
                message: "Message updated",
                chatMessage: result.rows[0]
            });

        } catch (err) {

            console.error(
                "PUT /api/chat/:id error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Database error"
            });

        }

    }
);


// DELETE CHAT MESSAGE — ADMIN ONLY
app.delete(
    "/api/chat/:id",
    authMiddleware,
    async (req, res) => {

        try {

            if (!req.user || req.user.role !== "admin") {

                return res.status(403).json({
                    success: false,
                    message: "Admin access required"
                });

            }

            const messageId =
                Number(req.params.id);

            if (
                !Number.isInteger(messageId) ||
                messageId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid message id"
                });

            }

            const result =
                await pool.query(
                    `
                    DELETE FROM chat_messages
                    WHERE id = $1
                    RETURNING id
                    `,
                    [messageId]
                );

            if (result.rowCount === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Message not found"
                });

            }

            return res.json({
                success: true,
                message: "Message deleted",
                messageId: result.rows[0].id
            });

        } catch (err) {

            console.error(
                "DELETE /api/chat/:id error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Database error"
            });

        }

    }
);

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
                COALESCE(comment_counts.comments_count, 0)::integer AS comments_count,
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
            LEFT JOIN (
                SELECT
                    post_id,
                    COUNT(*) AS comments_count
                FROM comments
                GROUP BY post_id
            ) comment_counts
                ON comment_counts.post_id = posts.id
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

// =====================================
// REAL GENIUS: admin overrides for video comments + admin video title edit
// Registered BEFORE the old owner-only video comment routes, so these win.
// =====================================

app.put("/api/video-comments/:id", authMiddleware, async (req, res) => {

    try {

        const commentId = geniusParseId(req.params.id);

        const content =
            typeof req.body.content === "string"
                ? req.body.content.trim()
                : "";

        if (!commentId || !content || content.length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment id or content"
            });
        }

        const result = await pool.query(
            `
            UPDATE video_comments
            SET content = $1
            WHERE id = $2
            AND (user_id = $3 OR $4::boolean)
            RETURNING id, video_id, user_id, content, created_at
            `,
            [content, commentId, req.user.id, req.user.role === "admin"]
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

        console.error("PUT /api/video-comments/:id (admin override) error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.delete("/api/video-comments/:id", authMiddleware, async (req, res) => {

    try {

        const commentId = geniusParseId(req.params.id);

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment id"
            });
        }

        const result = await pool.query(
            `
            DELETE FROM video_comments
            WHERE id = $1
            AND (user_id = $2 OR $3::boolean)
            RETURNING id
            `,
            [commentId, req.user.id, req.user.role === "admin"]
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

        console.error("DELETE /api/video-comments/:id (admin override) error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.put("/api/videos/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin only" });
        }

        const videoId = geniusParseId(req.params.id);

        const title =
            typeof req.body.title === "string"
                ? req.body.title.trim()
                : "";

        if (!videoId || !title || title.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Invalid video id or title"
            });
        }

        const result = await pool.query(
            `
            UPDATE videos
            SET title = $1
            WHERE id = $2
            RETURNING id, title
            `,
            [title, videoId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        res.json({ success: true, video: result.rows[0] });

    } catch (err) {

        console.error("PUT /api/videos/:id error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

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


// =====================================
// NOTES SUMMARY
// =====================================

app.get("/api/notes/summary", authMiddleware, async (req, res) => {

    try {

        const userId = req.user.id;

        const result = await pool.query(`
            SELECT

                (
                    SELECT COUNT(*)
                    FROM notes
                    WHERE user_id = $1
                )::integer AS notes_count,

                (
                    SELECT COUNT(*)
                    FROM tasks
                    WHERE user_id = $1
                )::integer AS tasks_count,

                (
                    SELECT COUNT(*)
                    FROM reminders
                    WHERE user_id = $1
                )::integer AS reminders_count,

                (
                    SELECT COUNT(*)
                    FROM goals
                    WHERE user_id = $1
                )::integer AS goals_count

        `, [userId]);

        return res.json({
            success: true,
            stats: result.rows[0]
        });

    } catch (err) {

        console.error(
            "GET /api/notes/summary error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Notes summary"
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


    // GET rows (public)
    app.get("/api/" + tableName, async (req, res) => {
        try {
            let result;

            if (tableName === "tournament1_scorers") {
                result = await pool.query(`
                    SELECT
                        nickname,
                        games,
                        goals_scored AS goals
                    FROM tournament1_stats
                    WHERE games > 0
                    ORDER BY goals_scored DESC, nickname ASC
                    LIMIT 3
                `);
            } else if (tableName === "tournament1_defense") {
                result = await pool.query(`
                    SELECT
                        nickname,
                        games,
                        goals_conceded
                    FROM tournament1_stats
                    WHERE games > 0
                    ORDER BY goals_conceded ASC,
                             goals_scored DESC,
                             nickname ASC
                    LIMIT 3
                `);
            } else {
                result = await pool.query(
                    `SELECT * FROM ${tableName} ORDER BY ${orderBy}`
                );
            }

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
"(wins * 3 + draws) DESC, (goals_scored - goals_conceded) DESC, goals_scored DESC, nickname ASC"
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


// DELETE conference (admin only)
app.delete("/api/conferences/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin only"
            });

        }

        const conferenceId =
            Number(req.params.id);

        if (
            !Number.isInteger(conferenceId) ||
            conferenceId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid conference id"
            });

        }

        const result = await pool.query(
            `
            DELETE FROM conference_rooms
            WHERE id = $1
            RETURNING
                id,
                name,
                room_name
            `,
            [conferenceId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Conference not found"
            });

        }

        res.json({
            success: true,
            message: "Conference deleted",
            conference: result.rows[0]
        });

    } catch (err) {

        console.error(
            "DELETE /api/conferences/:id error:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});


// =====================================
// GENIUS PHOTOS (Real Genius tab)
// =====================================

// =====================================
// GENIUS PHOTOS: extended GET, views, comment edit/delete, admin caption edit
// Inserted BEFORE the original GET /api/genius-photos, so this GET wins.
// =====================================

function geniusParseId(value) {

    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;

}

function geniusOptionalUserId(req) {

    const authHeader = req.headers.authorization;

    if (!authHeader) return null;

    try {

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return decoded.id;

    } catch (err) {

        return null;

    }

}

app.get("/api/genius-photos", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                gp.id,
                gp.image_url,
                gp.caption,
                gp.created_at,
                gp.views_count,
                (
                    SELECT COUNT(*)
                    FROM genius_photo_likes
                    WHERE photo_id = gp.id
                )::integer AS likes_count,
                (
                    SELECT COUNT(*)
                    FROM genius_photo_comments
                    WHERE photo_id = gp.id
                )::integer AS comments_count,
                EXISTS (
                    SELECT 1
                    FROM genius_photo_likes
                    WHERE photo_id = gp.id
                    AND user_id = $1
                ) AS liked_by_me
            FROM genius_photos gp
            ORDER BY gp.created_at DESC
            `,
            [geniusOptionalUserId(req)]
        );

        res.json({ success: true, photos: result.rows });

    } catch (err) {

        console.error("GET /api/genius-photos (extended) error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.post("/api/genius-photos/:id/view", async (req, res) => {

    try {

        const photoId = geniusParseId(req.params.id);

        if (!photoId) {
            return res.status(400).json({ success: false, message: "Invalid photo id" });
        }

        const result = await pool.query(
            `
            UPDATE genius_photos
            SET views_count = views_count + 1
            WHERE id = $1
            RETURNING views_count
            `,
            [photoId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Photo not found" });
        }

        res.json({ success: true, views_count: result.rows[0].views_count });

    } catch (err) {

        console.error("POST /api/genius-photos/:id/view error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.put("/api/genius-photo-comments/:id", authMiddleware, async (req, res) => {

    try {

        const commentId = geniusParseId(req.params.id);

        const content =
            typeof req.body.content === "string"
                ? req.body.content.trim()
                : "";

        if (!commentId || !content || content.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment id or content"
            });
        }

        const result = await pool.query(
            `
            UPDATE genius_photo_comments
            SET content = $1
            WHERE id = $2
            AND (user_id = $3 OR $4::boolean)
            RETURNING id, photo_id, user_id, content, created_at
            `,
            [content, commentId, req.user.id, req.user.role === "admin"]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Comment not found or access denied"
            });
        }

        res.json({ success: true, comment: result.rows[0] });

    } catch (err) {

        console.error("PUT /api/genius-photo-comments/:id error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.delete("/api/genius-photo-comments/:id", authMiddleware, async (req, res) => {

    try {

        const commentId = geniusParseId(req.params.id);

        if (!commentId) {
            return res.status(400).json({ success: false, message: "Invalid comment id" });
        }

        const result = await pool.query(
            `
            DELETE FROM genius_photo_comments
            WHERE id = $1
            AND (user_id = $2 OR $3::boolean)
            RETURNING id
            `,
            [commentId, req.user.id, req.user.role === "admin"]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Comment not found or access denied"
            });
        }

        res.json({ success: true, commentId: result.rows[0].id });

    } catch (err) {

        console.error("DELETE /api/genius-photo-comments/:id error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.put("/api/genius-photos/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin only" });
        }

        const photoId = geniusParseId(req.params.id);

        if (!photoId || typeof req.body.caption !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid photo id or caption"
            });
        }

        const caption = req.body.caption.trim();

        if (caption.length > 300) {
            return res.status(400).json({
                success: false,
                message: "Caption is too long"
            });
        }

        const result = await pool.query(
            `
            UPDATE genius_photos
            SET caption = $1
            WHERE id = $2
            RETURNING id, caption
            `,
            [caption || null, photoId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Photo not found" });
        }

        res.json({ success: true, photo: result.rows[0] });

    } catch (err) {

        console.error("PUT /api/genius-photos/:id error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

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



/* =====================================
   GENIUS PHOTO LIKES
===================================== */

// Like / unlike a photo
app.post("/api/genius-photos/:id/like", authMiddleware, async (req, res) => {
    try {
        const photoId = req.params.id;
        const userId = req.user.id;

        const photo = await pool.query(
            "SELECT id FROM genius_photos WHERE id = $1",
            [photoId]
        );

        if (photo.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Photo not found"
            });
        }

        const existingLike = await pool.query(
            `DELETE FROM genius_photo_likes
             WHERE photo_id = $1 AND user_id = $2
             RETURNING id`,
            [photoId, userId]
        );

        let liked = false;

        if (existingLike.rowCount === 0) {
            const inserted = await pool.query(
                `INSERT INTO genius_photo_likes (photo_id, user_id)
                 VALUES ($1, $2)
                 ON CONFLICT (photo_id, user_id) DO NOTHING
                 RETURNING id`,
                [photoId, userId]
            );

            liked = inserted.rowCount > 0;
        }

        const count = await pool.query(
            `SELECT COUNT(*)::integer AS likes_count
             FROM genius_photo_likes
             WHERE photo_id = $1`,
            [photoId]
        );

        res.json({
            success: true,
            liked,
            likes_count: count.rows[0].likes_count
        });
    } catch (err) {
        console.error("POST /api/genius-photos/:id/like error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


/* =====================================
   GENIUS PHOTO COMMENTS
===================================== */

// Get comments for a photo
app.get("/api/genius-photos/:id/comments", async (req, res) => {
    try {
        const photoId = req.params.id;

        const photo = await pool.query(
            "SELECT id FROM genius_photos WHERE id = $1",
            [photoId]
        );

        if (photo.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Photo not found"
            });
        }

        const result = await pool.query(
            `SELECT
                c.id,
                c.photo_id,
                c.user_id,
                c.content,
                c.created_at,
                u.username
             FROM genius_photo_comments c
             JOIN users u ON u.id = c.user_id
             WHERE c.photo_id = $1
             ORDER BY c.created_at ASC`,
            [photoId]
        );

        res.json({
            success: true,
            comments: result.rows
        });
    } catch (err) {
        console.error("GET /api/genius-photos/:id/comments error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// Add a comment to a photo
app.post("/api/genius-photos/:id/comments", authMiddleware, async (req, res) => {
    try {
        const photoId = req.params.id;
        const userId = req.user.id;
        const content = typeof req.body.content === "string"
            ? req.body.content.trim()
            : "";

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });
        }

        if (content.length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Comment is too long"
            });
        }

        const photo = await pool.query(
            "SELECT id FROM genius_photos WHERE id = $1",
            [photoId]
        );

        if (photo.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Photo not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO genius_photo_comments (photo_id, user_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, photo_id, user_id, content, created_at`,
            [photoId, userId, content]
        );

        const user = await pool.query(
            "SELECT username FROM users WHERE id = $1",
            [userId]
        );

        res.status(201).json({
            success: true,
            comment: {
                ...result.rows[0],
                username: user.rows[0]?.username || "Користувач"
            }
        });
    } catch (err) {
        console.error("POST /api/genius-photos/:id/comments error:", err);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// =====================================
// DASHBOARD
// =====================================

app.get("/api/dashboard", authMiddleware, async (req, res) => {

    try {

        const userId = req.user.id;

        // -----------------------------
        // STATISTICS
        // -----------------------------

        const statsResult = await pool.query(`
            SELECT

                (
                    SELECT COUNT(*)
                    FROM notes
                    WHERE user_id = $1
                )::integer AS notes_count,

                (
                    SELECT COUNT(*)
                    FROM forum_posts
                    WHERE user_id = $1
                )::integer AS forum_posts_count,

                (
                    SELECT COUNT(*)
                    FROM post_likes
                    JOIN posts
                        ON posts.id = post_likes.post_id
                    WHERE posts.user_id = $1
                )::integer
                +
                (
                    SELECT COUNT(*)
                    FROM forum_post_likes
                    JOIN forum_posts
                        ON forum_posts.id = forum_post_likes.post_id
                    WHERE forum_posts.user_id = $1
                )::integer AS likes_count,

                (
                    SELECT COALESCE(SUM(views_count), 0)
                    FROM posts
                    WHERE user_id = $1
                )::integer AS blog_views

        `, [userId]);


        // -----------------------------
        // LATEST ACTIVITY
        // -----------------------------

        const activityResult = await pool.query(`
            SELECT *
            FROM (

                -- New note
                SELECT
                    'note' AS type,
                    '📝' AS icon,
                    'Created note' AS action,
                    title AS item,
                    created_at
                FROM notes
                WHERE user_id = $1

                UNION ALL

                -- New forum topic
                SELECT
                    'forum_post' AS type,
                    '💬' AS icon,
                    'Created forum topic' AS action,
                    title AS item,
                    created_at
                FROM forum_posts
                WHERE user_id = $1

                UNION ALL

                -- Comment on Blog
                SELECT
                    'comment' AS type,
                    '💬' AS icon,
                    'Commented on blog post' AS action,
                    posts.title AS item,
                    comments.created_at
                FROM comments
                JOIN posts
                    ON posts.id = comments.post_id
                WHERE comments.user_id = $1

                UNION ALL

                -- Comment on eFootball forum
                SELECT
                    'forum_comment' AS type,
                    '💬' AS icon,
                    'Commented on forum topic' AS action,
                    forum_posts.title AS item,
                    forum_comments.created_at
                FROM forum_comments
                JOIN forum_posts
                    ON forum_posts.id = forum_comments.post_id
                WHERE forum_comments.user_id = $1

                UNION ALL

                -- Like received on Blog post
                SELECT
                    'post_like' AS type,
                    '❤️' AS icon,
                    'Your blog post received a like' AS action,
                    posts.title AS item,
                    post_likes.created_at
                FROM post_likes
                JOIN posts
                    ON posts.id = post_likes.post_id
                WHERE posts.user_id = $1

                UNION ALL

                -- Like received on forum topic
                SELECT
                    'forum_like' AS type,
                    '❤️' AS icon,
                    'Your forum topic received a like' AS action,
                    forum_posts.title AS item,
                    forum_post_likes.created_at
                FROM forum_post_likes
                JOIN forum_posts
                    ON forum_posts.id = forum_post_likes.post_id
                WHERE forum_posts.user_id = $1

            ) AS activity

            ORDER BY created_at DESC
            LIMIT 10
        `, [userId]);


        return res.json({
            success: true,

            stats: statsResult.rows[0],

            activity: activityResult.rows

        });

    } catch (err) {

        console.error("GET /api/dashboard error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard"
        });

    }

});


// =====================================
// TOURNAMENT 1 — MATCHES, STATE, FINISH
// =====================================

function matchDelta(myScore, oppScore) {

    return {
        games: 1,
        wins: myScore > oppScore ? 1 : 0,
        draws: myScore === oppScore ? 1 : 0,
        losses: myScore < oppScore ? 1 : 0,
        goals_scored: myScore,
        goals_conceded: oppScore
    };

}

// sign = 1 додає внесок матчу гравцю, sign = -1 знімає його (для видалення матчу)
async function applyMatchDelta(client, playerId, myScore, oppScore, sign) {

    const d = matchDelta(myScore, oppScore);

    await client.query(
        `
        UPDATE tournament1_stats
        SET
            games = GREATEST(games + $2, 0),
            wins = GREATEST(wins + $3, 0),
            draws = GREATEST(draws + $4, 0),
            losses = GREATEST(losses + $5, 0),
            goals_scored = GREATEST(goals_scored + $6, 0),
            goals_conceded = GREATEST(goals_conceded + $7, 0),
            updated_at = NOW()
        WHERE id = $1
        `,
        [
            playerId,
            sign * d.games,
            sign * d.wins,
            sign * d.draws,
            sign * d.losses,
            sign * d.goals_scored,
            sign * d.goals_conceded
        ]
    );

}

app.get("/api/tournament1_state", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT finished, finished_at, title FROM tournament1_state WHERE id = 1"
        );

        const archived = await pool.query(
            "SELECT COUNT(*)::int AS c FROM tournament_archive"
        );

        const state = result.rows[0] || {
            finished: false,
            finished_at: null,
            title: "Турнір СПІВТОВАРИСТВА"
        };

        state.suggested_title = "Турнір СПІВТОВАРИСТВА №" + (archived.rows[0].c + 1);

        res.json({
            success: true,
            state: state
        });

    } catch (err) {

        console.error("GET /api/tournament1_state error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.get("/api/tournament1_matches", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                m.id,
                m.score1,
                m.score2,
                m.created_at,
                p1.id AS player1_id,
                p1.nickname AS player1_nickname,
                p2.id AS player2_id,
                p2.nickname AS player2_nickname
            FROM tournament1_matches m
            JOIN tournament1_stats p1 ON p1.id = m.player1_id
            JOIN tournament1_stats p2 ON p2.id = m.player2_id
            ORDER BY m.created_at DESC, m.id DESC
            `
        );

        res.json({ success: true, matches: result.rows });

    } catch (err) {

        console.error("GET /api/tournament1_matches error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.post("/api/tournament1_matches", authMiddleware, async (req, res) => {

    const client = await pool.connect();

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({ success: false, message: "Admin only" });

        }

        const player1Id = parseInt(req.body.player1_id, 10);
        const player2Id = parseInt(req.body.player2_id, 10);
        const score1 = parseInt(req.body.score1, 10);
        const score2 = parseInt(req.body.score2, 10);

        if (![player1Id, player2Id, score1, score2].every(Number.isInteger)) {

            return res.status(400).json({ success: false, message: "Invalid data" });

        }

        if (player1Id === player2Id) {

            return res.status(400).json({ success: false, message: "Choose two different players" });

        }

        if (score1 < 0 || score2 < 0) {

            return res.status(400).json({ success: false, message: "Score cannot be negative" });

        }

        await client.query("BEGIN");

        const state = await client.query(
            "SELECT finished FROM tournament1_state WHERE id = 1 FOR UPDATE"
        );

        if (state.rows[0] && state.rows[0].finished) {

            await client.query("ROLLBACK");

            return res.status(409).json({ success: false, message: "Tournament is already finished" });

        }

        const players = await client.query(
            "SELECT id FROM tournament1_stats WHERE id = ANY($1::int[]) FOR UPDATE",
            [[player1Id, player2Id]]
        );

        if (players.rowCount !== 2) {

            await client.query("ROLLBACK");

            return res.status(404).json({ success: false, message: "Player not found" });

        }

        const match = await client.query(
            `
            INSERT INTO tournament1_matches (player1_id, player2_id, score1, score2)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            `,
            [player1Id, player2Id, score1, score2]
        );

        await applyMatchDelta(client, player1Id, score1, score2, 1);
        await applyMatchDelta(client, player2Id, score2, score1, 1);

        await client.query("COMMIT");

        res.status(201).json({ success: true, matchId: match.rows[0].id });

    } catch (err) {

        await client.query("ROLLBACK").catch(() => {});

        console.error("POST /api/tournament1_matches error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    } finally {

        client.release();

    }

});

app.delete("/api/tournament1_matches/:id", authMiddleware, async (req, res) => {

    const client = await pool.connect();

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({ success: false, message: "Admin only" });

        }

        const matchId = parseInt(req.params.id, 10);

        if (!Number.isInteger(matchId)) {

            return res.status(400).json({ success: false, message: "Invalid id" });

        }

        await client.query("BEGIN");

        const state = await client.query(
            "SELECT finished FROM tournament1_state WHERE id = 1 FOR UPDATE"
        );

        if (state.rows[0] && state.rows[0].finished) {

            await client.query("ROLLBACK");

            return res.status(409).json({ success: false, message: "Tournament is already finished" });

        }

        const found = await client.query(
            "SELECT id, player1_id, player2_id, score1, score2 FROM tournament1_matches WHERE id = $1 FOR UPDATE",
            [matchId]
        );

        if (found.rowCount === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({ success: false, message: "Match not found" });

        }

        const m = found.rows[0];

        await applyMatchDelta(client, m.player1_id, m.score1, m.score2, -1);
        await applyMatchDelta(client, m.player2_id, m.score2, m.score1, -1);

        await client.query("DELETE FROM tournament1_matches WHERE id = $1", [m.id]);

        await client.query("COMMIT");

        res.json({ success: true, message: "Match deleted" });

    } catch (err) {

        await client.query("ROLLBACK").catch(() => {});

        console.error("DELETE /api/tournament1_matches/:id error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    } finally {

        client.release();

    }

});

app.post("/api/tournament1_finish", authMiddleware, async (req, res) => {

    const client = await pool.connect();

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({ success: false, message: "Admin only" });

        }

        await client.query("BEGIN");

        const state = await client.query(
            "SELECT finished FROM tournament1_state WHERE id = 1 FOR UPDATE"
        );

        if (state.rows[0] && state.rows[0].finished) {

            await client.query("ROLLBACK");

            return res.status(409).json({ success: false, message: "Tournament is already finished" });

        }

        const players = await client.query(
            "SELECT * FROM tournament1_stats ORDER BY id"
        );

        const transferred = [];
        const skipped = [];

        for (const p of players.rows) {

            const upd = await client.query(
                `
                UPDATE player_stats
                SET
                    games = games + $1,
                    wins = wins + $2,
                    draws = draws + $3,
                    losses = losses + $4,
                    goals_scored = goals_scored + $5,
                    goals_conceded = goals_conceded + $6,
                    updated_at = NOW()
                WHERE id = (
                    SELECT id FROM player_stats
                    WHERE LOWER(nickname) = LOWER($7)
                    ORDER BY id
                    LIMIT 1
                )
                RETURNING id
                `,
                [
                    p.games, p.wins, p.draws, p.losses,
                    p.goals_scored, p.goals_conceded, p.nickname
                ]
            );

            if (upd.rowCount === 1) {
                transferred.push(p.nickname);
            } else {
                skipped.push(p.nickname);
            }

        }

        const standings = players.rows
            .map(function (p) {
                return {
                    nickname: p.nickname,
                    games: p.games,
                    wins: p.wins,
                    draws: p.draws,
                    losses: p.losses,
                    goals_scored: p.goals_scored,
                    goals_conceded: p.goals_conceded,
                    points: p.wins * 3 + p.draws,
                    goal_difference: p.goals_scored - p.goals_conceded
                };
            })
            .sort(function (a, b) {
                return b.points - a.points ||
                    b.goal_difference - a.goal_difference ||
                    b.goals_scored - a.goals_scored ||
                    a.nickname.localeCompare(b.nickname);
            });

        standings.forEach(function (s, i) {
            s.place = i + 1;
        });

        const matchesCount = await client.query(
            "SELECT COUNT(*)::int AS c FROM tournament1_matches"
        );

        const titleRow = await client.query(
            "SELECT title FROM tournament1_state WHERE id = 1"
        );

        const scorersRows = await client.query(
            "SELECT nickname, games, goals FROM tournament1_scorers ORDER BY goals DESC, nickname ASC"
        );

        const defenseRows = await client.query(
            "SELECT nickname, games, clean_sheets FROM tournament1_defense ORDER BY clean_sheets DESC, nickname ASC"
        );

        await client.query(
            `
            INSERT INTO tournament_archive
                (title, winner_nickname, standings, matches_count, scorers, defense)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
                titleRow.rows[0] ? titleRow.rows[0].title : "Турнір СПІВТОВАРИСТВА",
                standings.length ? standings[0].nickname : null,
                JSON.stringify(standings),
                matchesCount.rows[0].c,
                JSON.stringify(scorersRows.rows),
                JSON.stringify(defenseRows.rows)
            ]
        );

        await client.query(
            "UPDATE tournament1_state SET finished = TRUE, finished_at = NOW() WHERE id = 1"
        );

        await client.query("COMMIT");

        res.json({ success: true, transferred: transferred, skipped: skipped });

    } catch (err) {

        await client.query("ROLLBACK").catch(() => {});

        console.error("POST /api/tournament1_finish error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    } finally {

        client.release();

    }

});


// =====================================
// TOURNAMENT ARCHIVE
// =====================================

app.get("/api/tournament_archive", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                a.id,
                a.title,
                a.finished_at,
                a.winner_nickname,
                a.standings,
                a.scorers,
                a.defense,
                a.matches_count,
                COALESCE(
                    a.winner_avatar_custom,
                    (
                        SELECT u.avatar_url
                        FROM users u
                        WHERE LOWER(u.username) = LOWER(a.winner_nickname)
                        ORDER BY u.id
                        LIMIT 1
                    )
                ) AS winner_avatar_url
            FROM tournament_archive a
            ORDER BY a.finished_at DESC, a.id DESC
            `
        );

        res.json({ success: true, tournaments: result.rows });

    } catch (err) {

        console.error("GET /api/tournament_archive error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.delete("/api/tournament_archive/:id", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({ success: false, message: "Admin only" });

        }

        const archiveId = parseInt(req.params.id, 10);

        if (!Number.isInteger(archiveId)) {

            return res.status(400).json({ success: false, message: "Invalid id" });

        }

        const result = await pool.query(
            "DELETE FROM tournament_archive WHERE id = $1 RETURNING id",
            [archiveId]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({ success: false, message: "Archive entry not found" });

        }

        res.json({ success: true, message: "Archive entry deleted" });

    } catch (err) {

        console.error("DELETE /api/tournament_archive/:id error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});


// =====================================
// TOURNAMENT LIFECYCLE + WINNER AVATAR
// =====================================

const winnerAvatarUploadDir = "/var/www/myproject/assets/images/winners";

const winnerAvatarStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, winnerAvatarUploadDir);

    },

    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname).toLowerCase();

        cb(null, `winner-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);

    }

});

const uploadWinnerAvatar = multer({

    storage: winnerAvatarStorage,

    limits: { fileSize: 5 * 1024 * 1024 },

    fileFilter: function (req, file, cb) {

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));

        }

    }

});

// перевірка ролі ДО завантаження файлу, щоб не-адмін не міг класти файли на диск
function tournamentAdminOnly(req, res, next) {

    if (!req.user || req.user.role !== "admin") {

        return res.status(403).json({ success: false, message: "Admin only" });

    }

    next();

}



// =====================================
// EFOOTBALL SHOWCASE IMAGES
// =====================================

// Дозволені файли задаються сервером, шлях із запиту не використовується.
const efootballShowcaseFiles = Object.freeze({
    "best-squad": "/var/www/myproject/images/склак_Fedir_Riabov.png",
    "best-division": "/var/www/myproject/images/місце.png"
});

const efootballShowcaseUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "image/png") {
            return cb(new Error("Дозволено завантажувати лише PNG-зображення."));
        }
        cb(null, true);
    }
});

function efootballShowcaseUploadMiddleware(req, res, next) {
    efootballShowcaseUpload.single("image")(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || "Не вдалося завантажити зображення."
            });
        }
        next();
    });
}

// Публічне читання зображень із вимкненим кешуванням.
app.get("/api/efootball/showcase-image/:key", async (req, res) => {
    const imagePath = efootballShowcaseFiles[req.params.key];

    if (!imagePath) {
        return res.status(404).end();
    }

    try {
        await fs.promises.access(imagePath, fs.constants.R_OK);
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.set("Pragma", "no-cache");

        return res.sendFile(imagePath, function (err) {
            if (err && !res.headersSent) {
                if (err.code !== "ENOENT") {
                    console.error("EFOOTBALL SHOWCASE GET error:", err);
                }
                res.status(err.code === "ENOENT" ? 404 : 500).end();
            }
        });
    } catch (err) {
        if (err.code !== "ENOENT") {
            console.error("EFOOTBALL SHOWCASE GET error:", err);
        }
        return res.status(err.code === "ENOENT" ? 404 : 500).end();
    }
});

// Завантажувати або замінювати фото може тільки адміністратор.
app.post(
    "/api/efootball/showcase-image/:key",
    authMiddleware,
    tournamentAdminOnly,
    efootballShowcaseUploadMiddleware,
    async (req, res) => {
        const imagePath = efootballShowcaseFiles[req.params.key];

        if (!imagePath) {
            return res.status(404).json({
                success: false,
                message: "Невідома панель."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Вибери PNG-файл."
            });
        }

        const pngSignature = Buffer.from([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
        ]);

        if (
            req.file.buffer.length < pngSignature.length ||
            !req.file.buffer.subarray(0, pngSignature.length).equals(pngSignature)
        ) {
            return res.status(400).json({
                success: false,
                message: "Файл не є коректним PNG-зображенням."
            });
        }

        const temporaryPath =
            imagePath + ".upload-" + process.pid + "-" + Date.now();

        try {
            await fs.promises.writeFile(temporaryPath, req.file.buffer, {
                mode: 0o664
            });

            // Атомарна заміна: не залишаємо частково записане зображення.
            await fs.promises.rename(temporaryPath, imagePath);

            return res.json({
                success: true,
                message: "Зображення оновлено.",
                imageUrl: "/api/efootball/showcase-image/" + req.params.key
            });
        } catch (err) {
            await fs.promises.unlink(temporaryPath).catch(() => {});
            console.error("EFOOTBALL SHOWCASE upload error:", err);

            return res.status(500).json({
                success: false,
                message: "Не вдалося зберегти зображення."
            });
        }
    }
);

// Видалення теж захищене серверною перевіркою адміністратора.
app.delete(
    "/api/efootball/showcase-image/:key",
    authMiddleware,
    tournamentAdminOnly,
    async (req, res) => {
        const imagePath = efootballShowcaseFiles[req.params.key];

        if (!imagePath) {
            return res.status(404).json({
                success: false,
                message: "Невідома панель."
            });
        }

        try {
            await fs.promises.unlink(imagePath);

            return res.json({
                success: true,
                message: "Зображення видалено."
            });
        } catch (err) {
            if (err.code === "ENOENT") {
                return res.status(404).json({
                    success: false,
                    message: "Зображення вже відсутнє."
                });
            }

            console.error("EFOOTBALL SHOWCASE delete error:", err);

            return res.status(500).json({
                success: false,
                message: "Не вдалося видалити зображення."
            });
        }
    }
);


// =====================================
// POLLS (eFootball voting blocks)
// =====================================

app.get("/api/polls", async (req, res) => {

    try {

        let currentUserId = null;

        const authHeader = req.headers.authorization;

        if (authHeader) {

            try {

                const token = authHeader.split(" ")[1];

                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                currentUserId = decoded.id;

            } catch (err) {

                currentUserId = null;

            }

        }

        const block = req.query.block === "video" || req.query.block === "photo"
            ? req.query.block
            : null;

        // активні зверху, завершені опускаються нижче
        const pollsRes = await pool.query(
            `
            SELECT
                p.id,
                p.block,
                p.question,
                p.media_type,
                p.media_url,
                p.ends_at,
                p.closed_at,
                p.created_at,
                (p.closed_at IS NULL AND (p.ends_at IS NULL OR p.ends_at > NOW())) AS active
            FROM polls p
            WHERE ($1::text IS NULL OR p.block = $1)
            ORDER BY active DESC, p.created_at DESC, p.id DESC
            `,
            [block]
        );

        const ids = pollsRes.rows.map(p => p.id);

        let options = [];
        const myVotes = {};

        if (ids.length > 0) {

            const optRes = await pool.query(
                `
                SELECT
                    o.id,
                    o.poll_id,
                    o.label,
                    o.image_url,
                    o.position,
                    COUNT(v.id)::int AS votes
                FROM poll_options o
                LEFT JOIN poll_votes v ON v.option_id = o.id
                WHERE o.poll_id = ANY($1::int[])
                GROUP BY o.id
                ORDER BY o.poll_id, o.position, o.id
                `,
                [ids]
            );

            options = optRes.rows;

            if (currentUserId) {

                const myRes = await pool.query(
                    "SELECT poll_id, option_id FROM poll_votes WHERE user_id = $1 AND poll_id = ANY($2::int[])",
                    [currentUserId, ids]
                );

                myRes.rows.forEach(r => { myVotes[r.poll_id] = r.option_id; });

            }

        }

        const polls = pollsRes.rows.map(p => {

            const opts = options.filter(o => o.poll_id === p.id);

            return Object.assign({}, p, {
                options: opts,
                total_votes: opts.reduce((sum, o) => sum + o.votes, 0),
                my_option_id: myVotes[p.id] || null
            });

        });

        res.json({ success: true, polls: polls });

    } catch (err) {

        console.error("GET /api/polls error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.post("/api/polls/:id/vote", authMiddleware, async (req, res) => {

    try {

        const pollId = parseInt(req.params.id, 10);
        const optionId = parseInt(req.body.option_id, 10);

        if (!Number.isInteger(pollId) || !Number.isInteger(optionId)) {

            return res.status(400).json({ success: false, message: "Invalid data" });

        }

        const poll = await pool.query(
            "SELECT (closed_at IS NULL AND (ends_at IS NULL OR ends_at > NOW())) AS active FROM polls WHERE id = $1",
            [pollId]
        );

        if (poll.rowCount === 0) {

            return res.status(404).json({ success: false, message: "Poll not found" });

        }

        if (!poll.rows[0].active) {

            return res.status(409).json({ success: false, message: "Голосування вже завершено" });

        }

        const option = await pool.query(
            "SELECT id FROM poll_options WHERE id = $1 AND poll_id = $2",
            [optionId, pollId]
        );

        if (option.rowCount === 0) {

            return res.status(400).json({ success: false, message: "Invalid option" });

        }

        // один голос на акаунт: повторний голос змінює вибір
        await pool.query(
            `
            INSERT INTO poll_votes (poll_id, option_id, user_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (poll_id, user_id)
            DO UPDATE SET option_id = EXCLUDED.option_id, created_at = NOW()
            `,
            [pollId, optionId, req.user.id]
        );

        res.json({ success: true });

    } catch (err) {

        console.error("POST /api/polls/:id/vote error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});


// =====================================
// LAUNCH WEEK — AUTOMATIC SUMMARY POST
// Runs after campaign end and is safe across restarts.
// =====================================
const LAUNCH_WEEK_SUMMARY_KEY = "launch-week-2026-summary";
const LAUNCH_WEEK_END_UTC = Date.parse("2026-10-17T21:00:00.000Z");
let launchWeekSummaryCheckRunning = false;

async function publishLaunchWeekSummaryIfDue() {
    if (Date.now() < LAUNCH_WEEK_END_UTC) {
        return;
    }

    if (launchWeekSummaryCheckRunning) {
        return;
    }

    launchWeekSummaryCheckRunning = true;

    let client = null;
    let transactionOpen = false;

    try {
        client = await pool.connect();

        await client.query("BEGIN");
        transactionOpen = true;

        // Serialize concurrent checks using a transaction-scoped lock.
        await client.query(
            "SELECT pg_advisory_xact_lock(hashtext($1))",
            [LAUNCH_WEEK_SUMMARY_KEY]
        );

        const existing = await client.query(
            `
            SELECT post_id
            FROM public.launch_week_publications
            WHERE publication_key = $1
            `,
            [LAUNCH_WEEK_SUMMARY_KEY]
        );

        if (existing.rows.length > 0) {
            await client.query("COMMIT");
            transactionOpen = false;
            return;
        }

        const countResult = await client.query(
            `
            SELECT COUNT(*)::integer AS pioneer_count
            FROM users
            WHERE created_at >= $1::timestamp
              AND created_at < $2::timestamp
            `,
            [
                "2026-10-09 21:00:00",
                "2026-10-17 21:00:00"
            ]
        );

        const pioneerCount = Number(countResult.rows[0].pioneer_count);

        const countLine = pioneerCount === 1
            ? "До First Wave приєднався 1 учасник."
            : `До First Wave приєдналися ${pioneerCount} учасників.`;

        const title = "🚀 Launch Week 2026 — підсумок First Wave";

        const content = [
            "🚀 Launch Week 2026 завершився!",
            "",
            "Дякуємо всім, хто приєднався до Den1mteN Space під час запуску.",
            countLine,
            "",
            "🏅 Відзнака Pioneer залишається з учасниками першої хвилі.",
            "",
            "Це лише початок — Space продовжує розвиватися!"
        ].join("\n");

        // The existing posts table is used; author is the confirmed admin account.
        const postResult = await client.query(
            `
            INSERT INTO posts (user_id, title, content, image_url)
            VALUES ($1, $2, $3, NULL)
            RETURNING id
            `,
            [1, title, content]
        );

        const postId = postResult.rows[0].id;

        await client.query(
            `
            INSERT INTO public.launch_week_publications
                (publication_key, post_id)
            VALUES ($1, $2)
            `,
            [LAUNCH_WEEK_SUMMARY_KEY, postId]
        );

        await client.query("COMMIT");
        transactionOpen = false;

        console.log("Launch Week summary post created:", postId);
    } catch (err) {
        if (client && transactionOpen) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Launch Week summary rollback failed.");
            }
        }

        console.error(
            "Launch Week summary check failed:",
            err.message
        );
    } finally {
        if (client) {
            client.release();
        }

        launchWeekSummaryCheckRunning = false;
    }
}

// If the server is offline at the campaign end, the next startup catches up.
publishLaunchWeekSummaryIfDue();
setInterval(publishLaunchWeekSummaryIfDue, 60 * 1000);


// =====================================
// POLLS ADMIN (create / edit / close / delete)
// =====================================

const pollsFs = require("fs");

const pollsUploadDir = "/var/www/myproject/assets/images/polls";

const pollStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, pollsUploadDir);

    },

    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname).toLowerCase();

        cb(null, `poll-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);

    }

});

const uploadPollFiles = multer({

    storage: pollStorage,

    limits: { fileSize: 100 * 1024 * 1024, files: 12 },

    fileFilter: function (req, file, cb) {

        const images = ["image/jpeg", "image/png", "image/webp", "image/gif"];

        const allowed = file.fieldname === "media"
            ? images.concat(["video/mp4"])
            : images;

        if (allowed.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error("Недозволений тип файлу"));

        }

    }

});

// помилки multer віддаємо як JSON, щоб форма могла їх показати
function pollUpload(req, res, next) {

    uploadPollFiles.any()(req, res, function (err) {

        if (err) {

            return res.status(400).json({ success: false, message: err.message || "Upload error" });

        }

        next();

    });

}

function discardPollFiles(files) {

    (files || []).forEach(function (f) {

        pollsFs.unlink(f.path, function () {});

    });

}

function pollFileUrl(file) {

    return "/assets/images/polls/" + file.filename;

}

// картинки варіантів не більше 5 МБ (відео-вкладення дозволено до 100 МБ)
function pollHasOversizedImage(files) {

    return (files || []).some(function (f) {

        return f.fieldname !== "media" && f.size > 5 * 1024 * 1024;

    });

}

function parsePollEnd(value) {

    if (value === undefined || value === null || value === "") {

        return { ok: true, value: null };

    }

    const d = new Date(value);

    if (isNaN(d.getTime())) return { ok: false, value: null };

    return { ok: true, value: d.toISOString() };

}

app.post("/api/polls", authMiddleware, tournamentAdminOnly, pollUpload, async (req, res) => {

    const files = req.files || [];

    function reject(message) {

        discardPollFiles(files);

        return res.status(400).json({ success: false, message: message });

    }

    const block = req.body.block;
    const question = (req.body.question || "").toString().trim();

    let labels = null;

    try {

        labels = JSON.parse(req.body.options || "[]");

    } catch (e) {

        labels = null;

    }

    if (block !== "video" && block !== "photo") return reject("Невірний блок");

    if (!question || question.length > 300) return reject("Питання обов'язкове (до 300 символів)");

    if (!Array.isArray(labels) || labels.length < 2 || labels.length > 8) {

        return reject("Потрібно від 2 до 8 варіантів");

    }

    labels = labels.map(function (l) { return String(l).trim(); });

    if (labels.some(function (l) { return !l || l.length > 120; })) {

        return reject("Кожен варіант має бути непорожнім (до 120 символів)");

    }

    const end = parsePollEnd(req.body.ends_at);

    if (!end.ok || (end.value && new Date(end.value) <= new Date())) {

        return reject("Некоректна дата завершення");

    }

    if (pollHasOversizedImage(files)) return reject("Картинка варіанта більша за 5 МБ");

    const mediaFile = files.find(function (f) { return f.fieldname === "media"; });
    const mediaKind = (req.body.media_type || "").toString();

    let mediaType = null;
    let mediaUrl = null;

    if (mediaKind === "youtube") {

        const link = (req.body.youtube_url || "").toString().trim();

        if (!/^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[\w-]+/.test(link)) {

            return reject("Потрібне embed-посилання YouTube (https://www.youtube.com/embed/...)");

        }

        mediaType = "youtube";
        mediaUrl = link;

    } else if (mediaKind === "video" || mediaKind === "photo") {

        if (!mediaFile) return reject("Файл вкладення не вибрано");

        if ((mediaKind === "video") !== (mediaFile.mimetype === "video/mp4")) {

            return reject("Тип файлу не збігається з обраним вкладенням");

        }

        mediaType = mediaKind;
        mediaUrl = pollFileUrl(mediaFile);

    } else if (mediaFile) {

        return reject("Не вказано тип вкладення");

    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // у блоці лишається одне активне голосування: попереднє завершується й опускається в архів
        await client.query(
            `
            UPDATE polls
            SET closed_at = NOW()
            WHERE block = $1
              AND closed_at IS NULL
              AND (ends_at IS NULL OR ends_at > NOW())
            `,
            [block]
        );

        const poll = await client.query(
            `
            INSERT INTO polls (block, question, media_type, media_url, ends_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `,
            [block, question, mediaType, mediaUrl, end.value]
        );

        for (let i = 0; i < labels.length; i++) {

            const img = files.find(function (f) { return f.fieldname === "image_" + i; });

            await client.query(
                "INSERT INTO poll_options (poll_id, label, image_url, position) VALUES ($1, $2, $3, $4)",
                [poll.rows[0].id, labels[i], img ? pollFileUrl(img) : null, i + 1]
            );

        }

        await client.query("COMMIT");

        res.status(201).json({ success: true, pollId: poll.rows[0].id });

    } catch (err) {

        await client.query("ROLLBACK").catch(() => {});

        discardPollFiles(files);

        console.error("POST /api/polls error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    } finally {

        client.release();

    }

});

app.put("/api/polls/:id", authMiddleware, tournamentAdminOnly, pollUpload, async (req, res) => {

    const files = req.files || [];

    function reject(status, message) {

        discardPollFiles(files);

        return res.status(status).json({ success: false, message: message });

    }

    const pollId = parseInt(req.params.id, 10);

    if (!Number.isInteger(pollId)) return reject(400, "Invalid id");

    if (files.some(function (f) { return !/^image_\d+$/.test(f.fieldname); })) {

        return reject(400, "Вкладення голосування змінюється лише при створенні");

    }

    if (pollHasOversizedImage(files)) return reject(400, "Картинка варіанта більша за 5 МБ");

    let question = null;

    if (req.body.question !== undefined) {

        question = req.body.question.toString().trim();

        if (!question || question.length > 300) {

            return reject(400, "Питання обов'язкове (до 300 символів)");

        }

    }

    let labels = [];

    if (req.body.labels) {

        try {

            labels = JSON.parse(req.body.labels);

        } catch (e) {

            return reject(400, "Некоректні підписи");

        }

        const bad = !Array.isArray(labels) || labels.some(function (l) {

            return !Number.isInteger(l.id) ||
                !String(l.label || "").trim() ||
                String(l.label).trim().length > 120;

        });

        if (bad) return reject(400, "Некоректні підписи");

    }

    const hasEnd = req.body.ends_at !== undefined;
    const end = parsePollEnd(req.body.ends_at);

    if (hasEnd && !end.ok) return reject(400, "Некоректна дата завершення");

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const found = await client.query(
            "SELECT id FROM polls WHERE id = $1 FOR UPDATE",
            [pollId]
        );

        if (found.rowCount === 0) {

            await client.query("ROLLBACK");

            return reject(404, "Poll not found");

        }

        if (question !== null) {

            await client.query("UPDATE polls SET question = $1 WHERE id = $2", [question, pollId]);

        }

        if (hasEnd) {

            await client.query("UPDATE polls SET ends_at = $1 WHERE id = $2", [end.value, pollId]);

        }

        for (const l of labels) {

            await client.query(
                "UPDATE poll_options SET label = $1 WHERE id = $2 AND poll_id = $3",
                [String(l.label).trim(), l.id, pollId]
            );

        }

        for (const f of files) {

            const m = /^image_(\d+)$/.exec(f.fieldname);

            await client.query(
                "UPDATE poll_options SET image_url = $1 WHERE id = $2 AND poll_id = $3",
                [pollFileUrl(f), parseInt(m[1], 10), pollId]
            );

        }

        await client.query("COMMIT");

        res.json({ success: true });

    } catch (err) {

        await client.query("ROLLBACK").catch(() => {});

        discardPollFiles(files);

        console.error("PUT /api/polls/:id error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    } finally {

        client.release();

    }

});

app.post("/api/polls/:id/close", authMiddleware, tournamentAdminOnly, async (req, res) => {

    try {

        const pollId = parseInt(req.params.id, 10);

        if (!Number.isInteger(pollId)) {

            return res.status(400).json({ success: false, message: "Invalid id" });

        }

        const result = await pool.query(
            "UPDATE polls SET closed_at = COALESCE(closed_at, NOW()) WHERE id = $1 RETURNING id",
            [pollId]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({ success: false, message: "Poll not found" });

        }

        res.json({ success: true });

    } catch (err) {

        console.error("POST /api/polls/:id/close error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

app.post("/api/polls/:id/reopen", authMiddleware, tournamentAdminOnly, async (req, res) => {

    const client = await pool.connect();

    try {

        const pollId = parseInt(req.params.id, 10);

        if (!Number.isInteger(pollId)) {

            return res.status(400).json({ success: false, message: "Invalid id" });

        }

        await client.query("BEGIN");

        const found = await client.query(
            "SELECT block FROM polls WHERE id = $1 FOR UPDATE",
            [pollId]
        );

        if (found.rowCount === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({ success: false, message: "Poll not found" });

        }

        // у блоці лишається одне активне голосування
        await client.query(
            `
            UPDATE polls
            SET closed_at = NOW()
            WHERE block = $1
              AND id <> $2
              AND closed_at IS NULL
              AND (ends_at IS NULL OR ends_at > NOW())
            `,
            [found.rows[0].block, pollId]
        );

        await client.query(
            `
            UPDATE polls
            SET closed_at = NULL,
                ends_at = CASE WHEN ends_at <= NOW() THEN NULL ELSE ends_at END
            WHERE id = $1
            `,
            [pollId]
        );

        await client.query("COMMIT");

        res.json({ success: true });

    } catch (err) {

        await client.query("ROLLBACK").catch(() => {});

        console.error("POST /api/polls/:id/reopen error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    } finally {

        client.release();

    }

});

app.delete("/api/polls/:id", authMiddleware, tournamentAdminOnly, async (req, res) => {

    try {

        const pollId = parseInt(req.params.id, 10);

        if (!Number.isInteger(pollId)) {

            return res.status(400).json({ success: false, message: "Invalid id" });

        }

        const result = await pool.query(
            "DELETE FROM polls WHERE id = $1 RETURNING id",
            [pollId]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({ success: false, message: "Poll not found" });

        }

        res.json({ success: true });

    } catch (err) {

        console.error("DELETE /api/polls/:id error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});


app.post("/api/tournament1_new", authMiddleware, tournamentAdminOnly, async (req, res) => {

    const client = await pool.connect();

    try {

        let title = (req.body.title || "").toString().trim();

        if (title.length > 100) {

            return res.status(400).json({ success: false, message: "Title is too long" });

        }

        await client.query("BEGIN");

        const state = await client.query(
            "SELECT finished FROM tournament1_state WHERE id = 1 FOR UPDATE"
        );

        if (state.rows[0] && !state.rows[0].finished) {

            await client.query("ROLLBACK");

            return res.status(409).json({ success: false, message: "A tournament is already running" });

        }

        if (!title) {

            const archived = await client.query(
                "SELECT COUNT(*)::int AS c FROM tournament_archive"
            );

            title = "Турнір СПІВТОВАРИСТВА №" + (archived.rows[0].c + 1);

        }

        // порядок важливий: матчі посилаються на гравців
        await client.query("DELETE FROM tournament1_matches");
        await client.query("DELETE FROM tournament1_stats");
        await client.query("DELETE FROM tournament1_scorers");
        await client.query("DELETE FROM tournament1_defense");

        await client.query(
            "UPDATE tournament1_state SET finished = FALSE, finished_at = NULL, title = $1 WHERE id = 1",
            [title]
        );

        await client.query("COMMIT");

        res.status(201).json({ success: true, title: title });

    } catch (err) {

        await client.query("ROLLBACK").catch(() => {});

        console.error("POST /api/tournament1_new error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    } finally {

        client.release();

    }

});


app.post(
    "/api/tournament_archive/:id/avatar",
    authMiddleware,
    tournamentAdminOnly,
    uploadWinnerAvatar.single("avatar"),
    async (req, res) => {

    try {

        const archiveId = parseInt(req.params.id, 10);

        if (!Number.isInteger(archiveId)) {

            return res.status(400).json({ success: false, message: "Invalid id" });

        }

        if (!req.file) {

            return res.status(400).json({ success: false, message: "Image file is required" });

        }

        const avatarUrl = `/assets/images/winners/${req.file.filename}`;

        const result = await pool.query(
            "UPDATE tournament_archive SET winner_avatar_custom = $1 WHERE id = $2 RETURNING id",
            [avatarUrl, archiveId]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({ success: false, message: "Archive entry not found" });

        }

        res.json({ success: true, avatarUrl: avatarUrl });

    } catch (err) {

        console.error("POST /api/tournament_archive/:id/avatar error:", err);

        res.status(500).json({ success: false, message: "Database error" });

    }

});

// ===== TOP ACTIVE (Launch Week) =====
const TOP_ACTIVE_PERIODS = {
    "launch-2026": {
        start: "2026-10-09 21:00:00",
        end: "2026-10-17 21:00:00",
        endIso: "2026-10-17T21:00:00.000Z"
    }
};

const TOP_ACTIVE_EXCLUDED_USERNAMES = [
    "den1mten", "first", "user", "trying", "admin_efootball", "admin_blog"
];

async function getTopActive(periodKey, limit) {
    const period = TOP_ACTIVE_PERIODS[periodKey];
    if (!period) return null;

    const result = await pool.query(`
        WITH activity AS (
          SELECT user_id, created_at, 5 AS pts FROM forum_posts
          UNION ALL SELECT user_id, created_at, 5 FROM posts
          UNION ALL SELECT user_id, created_at, 3 FROM comments
          UNION ALL SELECT user_id, created_at, 3 FROM track_comments
          UNION ALL SELECT user_id, created_at, 3 FROM video_comments
          UNION ALL SELECT user_id, created_at, 3 FROM genius_photo_comments
          UNION ALL SELECT user_id, created_at, 3 FROM forum_comments
          UNION ALL SELECT user_id, created_at, 1 FROM chat_messages
          UNION ALL SELECT user_id, created_at, 1 FROM post_likes
          UNION ALL SELECT user_id, created_at, 1 FROM track_likes
          UNION ALL SELECT user_id, created_at, 1 FROM video_likes
          UNION ALL SELECT user_id, created_at, 1 FROM genius_photo_likes
          UNION ALL SELECT user_id, created_at, 1 FROM forum_post_likes
          UNION ALL SELECT user_id, created_at, 1 FROM forum_comment_likes
          UNION ALL SELECT user_id, created_at, 1 FROM poll_votes
        ),
        notes_raw AS (
          SELECT user_id, created_at FROM notes
          UNION ALL SELECT user_id, created_at FROM tasks
          UNION ALL SELECT user_id, created_at FROM goals
          UNION ALL SELECT user_id, created_at FROM reminders
        ),
        notes_daily AS (
          SELECT user_id, LEAST(COUNT(*), 3) AS pts
          FROM notes_raw
          WHERE created_at >= $1::timestamp AND created_at < $2::timestamp
          GROUP BY user_id, (created_at + interval '3 hours')::date
        ),
        combined AS (
          SELECT user_id, pts, 1 AS actions FROM activity
          WHERE created_at >= $1::timestamp AND created_at < $2::timestamp
          UNION ALL SELECT user_id, pts, 1 FROM notes_daily
        )
        SELECT u.id, u.username, SUM(c.pts)::integer AS points, SUM(c.actions)::integer AS actions
        FROM combined c
        JOIN users u ON u.id = c.user_id
        WHERE u.role <> 'admin'
          AND lower(u.username) <> ALL($3::text[])
        GROUP BY u.id, u.username
        ORDER BY points DESC, actions DESC, u.username ASC
        LIMIT $4::integer
    `, [period.start, period.end, TOP_ACTIVE_EXCLUDED_USERNAMES, limit]);

    return result.rows;
}

app.get("/api/top-active", async (req, res) => {
    try {
        const periodKey = String(req.query.period || "launch-2026");
        if (!TOP_ACTIVE_PERIODS[periodKey]) {
            return res.status(400).json({ success: false, message: "Unknown period" });
        }

        const rows = await getTopActive(periodKey, 5);
        res.json({
            success: true,
            period: periodKey,
            periodEnd: TOP_ACTIVE_PERIODS[periodKey].endIso,
            rows: rows.map((r, i) => ({ place: i + 1, username: r.username, points: r.points }))
        });
    } catch (err) {
        console.error("GET /api/top-active error:", err);
        res.status(500).json({ success: false, message: "Failed to load top active" });
    }
});
// ===== END TOP ACTIVE =====

// ===== LAUNCH SUMMARY (auto-post) =====
const LAUNCH_SUMMARY_PERIOD = "launch-2026";
const LAUNCH_SUMMARY_KEY = "launch-2026-summary";
const LAUNCH_SUMMARY_TEST_KEY = "launch-2026-summary-test";
const LAUNCH_SUMMARY_TEST_ENABLED = false;
const LAUNCH_SUMMARY_TEST_AT = Date.now() + 3 * 60 * 1000;
const LAUNCH_SUMMARY_AUTHOR = "admin_Blog";

function buildLaunchSummaryText(rows, isTest) {
    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    const lines = rows.map((r, i) => medals[i] + " " + r.username + " — " + r.points + " балів");
    const title = (isTest ? "[ТЕСТ] " : "") + "🚀 Підсумки Launch Week";
    const content = [
        "Launch Week завершився — дякуємо кожному, хто був з нами ці 8 днів!",
        "",
        "🏆 Топ-5 найактивніших:",
        ...lines,
        "",
        "Бали рахувалися за дописи, коментарі, лайки, голоси в опитуваннях і повідомлення в чаті.",
        "Переможці отримають відзнаку Launch Week.",
        "Дякуємо, що ростете разом з Den1mteN Space!"
    ].join("\n");
    return { title, content };
}

async function publishLaunchSummary(eventKey, badgePeriod, isTest) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const lock = await client.query(
            "INSERT INTO launch_events (key) VALUES ($1) ON CONFLICT (key) DO NOTHING RETURNING key",
            [eventKey]
        );
        if (lock.rowCount === 0) {
            await client.query("ROLLBACK");
            return false;
        }
        const rows = await getTopActive(LAUNCH_SUMMARY_PERIOD, 5);
        const author = await client.query("SELECT id FROM users WHERE username = $1", [LAUNCH_SUMMARY_AUTHOR]);
        if (author.rowCount === 0) throw new Error("Author account not found");
        for (let i = 0; i < rows.length; i++) {
            await client.query(
                "INSERT INTO user_badges (user_id, badge_key, period_key, place, points) VALUES ($1, 'top-active', $2, $3, $4) ON CONFLICT (user_id, badge_key, period_key) DO NOTHING",
                [rows[i].id, badgePeriod, i + 1, rows[i].points]
            );
        }
        const post = buildLaunchSummaryText(rows, isTest);
        await client.query("INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3)", [author.rows[0].id, post.title, post.content]);
        await client.query("COMMIT");
        console.log("Launch summary published:", eventKey);
        return true;
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("publishLaunchSummary error:", err);
        return false;
    } finally {
        client.release();
    }
}

async function checkLaunchSummary() {
    try {
        const now = Date.now();
        const end = Date.parse(TOP_ACTIVE_PERIODS[LAUNCH_SUMMARY_PERIOD].endIso);
        if (now >= end) {
            await publishLaunchSummary(LAUNCH_SUMMARY_KEY, LAUNCH_SUMMARY_PERIOD, false);
        }
        if (LAUNCH_SUMMARY_TEST_ENABLED && now >= LAUNCH_SUMMARY_TEST_AT) {
            await publishLaunchSummary(LAUNCH_SUMMARY_TEST_KEY, LAUNCH_SUMMARY_PERIOD + "-test", true);
        }
    } catch (err) {
        console.error("checkLaunchSummary error:", err);
    }
}

setInterval(checkLaunchSummary, 30 * 1000);
setTimeout(checkLaunchSummary, 5 * 1000);
// ===== END LAUNCH SUMMARY =====

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});



