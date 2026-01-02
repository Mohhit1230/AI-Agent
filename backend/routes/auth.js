import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";
import {
    generateAccessToken,
    generateRefreshToken,
    protect,
    authRateLimit,
} from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
};

const accessTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

const refreshTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Helper to set auth cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
};

// Helper to clear auth cookies
const clearAuthCookies = (res) => {
    res.cookie("accessToken", "", { ...cookieOptions, maxAge: 0 });
    res.cookie("refreshToken", "", { ...cookieOptions, maxAge: 0 });
};

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

// ==================== SIGNUP ====================
router.post(
    "/signup",
    authRateLimit(10, 60 * 60 * 1000), // 10 attempts per hour
    [
        body("name")
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("Name must be between 2 and 50 characters"),
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Please enter a valid email"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
            .matches(/\d/)
            .withMessage("Password must contain a number"),
    ],
    validate,
    async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                if (!existingUser.isVerified) {
                    // Resend OTP for unverified user
                    const otp = existingUser.generateOTP();
                    await existingUser.save();
                    await sendEmail(email, "otp", [name, otp]);

                    return res.status(200).json({
                        success: true,
                        message: "Account exists but unverified. New OTP sent to your email.",
                        requiresVerification: true,
                        email,
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: "Email already registered. Please login.",
                });
            }

            // Create new user
            const user = new User({ name, email, password });
            const otp = user.generateOTP();
            await user.save();

            // Send verification email
            await sendEmail(email, "otp", [name, otp]);

            res.status(201).json({
                success: true,
                message: "Registration successful! Please verify your email.",
                requiresVerification: true,
                email,
            });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({
                success: false,
                message: "Registration failed. Please try again.",
            });
        }
    }
);

// ==================== VERIFY OTP ====================
router.post(
    "/verify-otp",
    authRateLimit(10, 15 * 60 * 1000), // 10 attempts per 15 minutes
    [
        body("email").isEmail().normalizeEmail(),
        body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
    ],
    validate,
    async (req, res) => {
        try {
            const { email, otp } = req.body;

            const user = await User.findOne({ email }).select("+otp.code +otp.expiresAt +otp.attempts +password");
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            const verification = user.verifyOTP(otp);
            if (!verification.valid) {
                await user.save();
                return res.status(400).json({
                    success: false,
                    message: verification.message,
                });
            }

            user.isVerified = true;
            await user.save();

            // Send welcome email
            await sendEmail(email, "welcome", [user.name]);

            // Generate tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Save refresh token to database
            user.refreshToken = refreshToken;
            await user.save();

            // Set cookies
            setAuthCookies(res, accessToken, refreshToken);

            res.status(200).json({
                success: true,
                message: "Email verified successfully! Welcome aboard! 🎉",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                },
            });
        } catch (error) {
            console.error("Verify OTP error:", error);
            res.status(500).json({
                success: false,
                message: "Verification failed. Please try again.",
            });
        }
    }
);

// ==================== RESEND OTP ====================
router.post(
    "/resend-otp",
    authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
    [body("email").isEmail().normalizeEmail()],
    validate,
    async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            if (user.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Email already verified. Please login.",
                });
            }

            const otp = user.generateOTP();
            await user.save();

            await sendEmail(email, "otp", [user.name, otp]);

            res.status(200).json({
                success: true,
                message: "New OTP sent to your email.",
            });
        } catch (error) {
            console.error("Resend OTP error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to send OTP. Please try again.",
            });
        }
    }
);

// ==================== LOGIN ====================
router.post(
    "/login",
    authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
    [
        body("email").isEmail().normalizeEmail(),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    validate,
    async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email }).select("+password +refreshToken");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password.",
                });
            }

            if (!user.isVerified) {
                // Send new OTP
                const otp = user.generateOTP();
                await user.save();
                await sendEmail(email, "otp", [user.name, otp]);

                return res.status(403).json({
                    success: false,
                    message: "Please verify your email first. New OTP sent.",
                    requiresVerification: true,
                    email,
                });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password.",
                });
            }

            // Update last login
            user.lastLogin = new Date();

            // Generate tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            user.refreshToken = refreshToken;
            await user.save();

            // Set cookies
            setAuthCookies(res, accessToken, refreshToken);

            res.status(200).json({
                success: true,
                message: "Login successful! 🎉",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                },
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Login failed. Please try again.",
            });
        }
    }
);

// ==================== FORGOT PASSWORD ====================
router.post(
    "/forgot-password",
    authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
    [body("email").isEmail().normalizeEmail()],
    validate,
    async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                // Don't reveal if user exists
                return res.status(200).json({
                    success: true,
                    message: "If an account exists, a reset code will be sent.",
                    email,
                });
            }

            const otp = user.generateOTP();
            await user.save();

            await sendEmail(email, "resetPassword", [user.name, otp]);

            res.status(200).json({
                success: true,
                message: "Password reset code sent to your email.",
                email,
            });
        } catch (error) {
            console.error("Forgot password error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to process request. Please try again.",
            });
        }
    }
);

// ==================== VERIFY RESET OTP ====================
router.post(
    "/verify-reset-otp",
    authRateLimit(5, 15 * 60 * 1000),
    [
        body("email").isEmail().normalizeEmail(),
        body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
    ],
    validate,
    async (req, res) => {
        try {
            const { email, otp } = req.body;

            const user = await User.findOne({ email }).select("+otp.code +otp.expiresAt +otp.attempts");
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            const verification = user.verifyOTP(otp);
            if (!verification.valid) {
                await user.save();
                return res.status(400).json({
                    success: false,
                    message: verification.message,
                });
            }

            // Generate a temporary reset token
            const resetToken = jwt.sign(
                { id: user._id, purpose: "password-reset" },
                process.env.JWT_SECRET,
                { expiresIn: "10m" }
            );

            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();

            res.status(200).json({
                success: true,
                message: "OTP verified. You can now reset your password.",
                resetToken,
            });
        } catch (error) {
            console.error("Verify reset OTP error:", error);
            res.status(500).json({
                success: false,
                message: "Verification failed. Please try again.",
            });
        }
    }
);

// ==================== RESET PASSWORD ====================
router.post(
    "/reset-password",
    authRateLimit(5, 15 * 60 * 1000),
    [
        body("resetToken").notEmpty(),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
            .matches(/\d/)
            .withMessage("Password must contain a number"),
        body("confirmPassword").custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
    ],
    validate,
    async (req, res) => {
        try {
            const { resetToken, password } = req.body;

            // Verify reset token
            let decoded;
            try {
                decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
                if (decoded.purpose !== "password-reset") {
                    throw new Error("Invalid token purpose");
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired reset token. Please request a new one.",
                });
            }

            const user = await User.findById(decoded.id).select("+resetPasswordToken +resetPasswordExpires");
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            if (user.resetPasswordToken !== resetToken || new Date() > user.resetPasswordExpires) {
                return res.status(400).json({
                    success: false,
                    message: "Reset token has expired. Please request a new one.",
                });
            }

            // Update password
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: "Password reset successful! You can now login with your new password.",
            });
        } catch (error) {
            console.error("Reset password error:", error);
            res.status(500).json({
                success: false,
                message: "Password reset failed. Please try again.",
            });
        }
    }
);

// ==================== REFRESH TOKEN ====================
router.post("/refresh-token", async (req, res) => {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required.",
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            clearAuthCookies(res);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token.",
            });
        }

        const user = await User.findById(decoded.id).select("+refreshToken");
        if (!user || user.refreshToken !== refreshToken) {
            clearAuthCookies(res);
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token.",
            });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        user.refreshToken = newRefreshToken;
        await user.save();

        // Set new cookies
        setAuthCookies(res, newAccessToken, newRefreshToken);

        res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully.",
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({
            success: false,
            message: "Token refresh failed.",
        });
    }
});

// ==================== LOGOUT ====================
router.post("/logout", async (req, res) => {
    try {
        // Get refresh token from cookie to find the user
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const user = await User.findById(decoded.id);
                if (user) {
                    user.refreshToken = undefined;
                    await user.save();
                }
            } catch (error) {
                // Token invalid, just clear cookies
            }
        }

        // Clear cookies
        clearAuthCookies(res);

        res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        console.error("Logout error:", error);
        clearAuthCookies(res);
        res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    }
});

// ==================== GET CURRENT USER ====================
router.get("/me", protect, async (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            isVerified: req.user.isVerified,
            createdAt: req.user.createdAt,
            lastLogin: req.user.lastLogin,
        },
    });
});

// ==================== CHECK AUTH STATUS ====================
router.get("/check", async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(200).json({
                success: true,
                isAuthenticated: false,
            });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user || !user.isVerified) {
                return res.status(200).json({
                    success: true,
                    isAuthenticated: false,
                });
            }

            return res.status(200).json({
                success: true,
                isAuthenticated: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                },
            });
        } catch (error) {
            // Token expired, try refresh
            return res.status(200).json({
                success: true,
                isAuthenticated: false,
                tokenExpired: true,
            });
        }
    } catch (error) {
        console.error("Check auth error:", error);
        res.status(200).json({
            success: true,
            isAuthenticated: false,
        });
    }
});

// ==================== GOOGLE AUTH ====================
router.post(
    "/google",
    authRateLimit(10, 15 * 60 * 1000), // 10 attempts per 15 minutes
    [
        body("credential").optional(),
        body("userInfo").optional().isObject()
    ],
    validate,
    async (req, res) => {
        try {
            const { credential, userInfo } = req.body;

            if (!credential && !userInfo) {
                return res.status(400).json({
                    success: false,
                    message: "Google authentication data is required.",
                });
            }

            let googleData;

            // If userInfo is provided (from useGoogleLogin), use it directly
            if (userInfo && userInfo.email) {
                googleData = {
                    sub: userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture
                };
            } else if (credential) {
                // Fetch user info from Google using the access token
                
                try {
                    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: {
                            'Authorization': `Bearer ${credential}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Google API error: ${response.status}`);
                    }

                    const userData = await response.json();

                    googleData = {
                        sub: userData.sub,
                        email: userData.email,
                        name: userData.name,
                        picture: userData.picture
                    };
                } catch (fetchError) {
                    console.error("❌ Failed to fetch user info:", fetchError.message);
                    return res.status(401).json({
                        success: false,
                        message: "Failed to verify Google credentials. Please try again.",
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Google authentication data.",
                });
            }

            const { sub: googleId, email, name, picture } = googleData;

            // Check if user exists
            let user = await User.findOne({ email }).select("+refreshToken");

            if (user) {
                // Update existing user
                if (!user.googleId) {
                    user.googleId = googleId;
                }
                if (!user.isVerified) {
                    user.isVerified = true;
                }
                if (!user.avatar && picture) {
                    user.avatar = picture;
                }
                user.lastLogin = new Date();
            } else {
                // Create new user
                user = new User({
                    name,
                    email,
                    googleId,
                    provider: "google",
                    avatar: picture,
                    isVerified: true,
                });

                // Send welcome email
                try {
                    await sendEmail(email, "welcome", [name]);
                } catch (emailError) {
                    console.error("Welcome email error:", emailError);
                    // Continue even if email fails
                }
            }

            // Generate tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            user.refreshToken = refreshToken;
            await user.save();

            // Set cookies
            setAuthCookies(res, accessToken, refreshToken);

            res.status(200).json({
                success: true,
                message: user.createdAt === user.updatedAt
                    ? "Account created successfully! Welcome aboard! 🎉"
                    : "Login successful! 🎉",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                },
            });
        } catch (error) {
            console.error("Google auth error:", error);
            res.status(500).json({
                success: false,
                message: "Google authentication failed. Please try again.",
            });
        }
    }
);

export default router;
