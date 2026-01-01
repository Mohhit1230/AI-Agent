import jwt from "jsonwebtoken";
import User from "../models/User.js";

// JWT Token generation utilities
export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
};

// Authentication middleware
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        // Also check cookies
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please log in.",
            });
        }

        try {
            // Verify access token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User no longer exists.",
                });
            }

            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your email first.",
                    requiresVerification: true,
                });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token expired. Please refresh.",
                    tokenExpired: true,
                });
            }
            throw error;
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({
            success: false,
            message: "Not authorized.",
        });
    }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user) {
                    req.user = user;
                }
            } catch (error) {
                // Token invalid, but continue without user
            }
        }

        next();
    } catch (error) {
        next();
    }
};

// Rate limiting for auth routes
const rateLimitMap = new Map();

export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!rateLimitMap.has(key)) {
            rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const record = rateLimitMap.get(key);

        if (now > record.resetTime) {
            rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }

        if (record.count >= maxAttempts) {
            const timeLeft = Math.ceil((record.resetTime - now) / 1000 / 60);
            return res.status(429).json({
                success: false,
                message: `Too many attempts. Please try again in ${timeLeft} minutes.`,
            });
        }

        record.count++;
        next();
    };
};

// Clean up rate limit map periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap) {
        if (now > record.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 60000); // Clean every minute

export default { protect, optionalAuth, authRateLimit, generateAccessToken, generateRefreshToken };
