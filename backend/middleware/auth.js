const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization;

    console.log("Authorization header:", authHeader);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    if (!authHeader) {

        return res.status(401).json({
            success: false,
            message: "No token"
        });

    }

    const token = authHeader.split(" ")[1];

    console.log("Token:", token);

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Decoded:", decoded);

        req.user = decoded;

        next();

    } catch (err) {

        console.error("JWT ERROR:", err);

        return res.status(401).json({
            success: false,
            message: err.message
        });

    }

};
