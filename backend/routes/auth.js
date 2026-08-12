const express = require("express");
const router = express.Router();

const {
    register,
    login,
    updateUsername,
    updateEmail,
    updatePassword
} = require("../controllers/authController");

const authMiddleware = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);

router.put("/account/username", authMiddleware, updateUsername);
router.put("/account/email", authMiddleware, updateEmail);
router.put("/account/password", authMiddleware, updatePassword);

module.exports = router;
