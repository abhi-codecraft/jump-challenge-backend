const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Access denied." });
    }

    try {
        // Verify token (Remove 'Bearer ' prefix before verifying)
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user data to request
        next(); // Proceed to the next middleware
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
