import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Don't include password in queries by default
        },
        avatar: {
            type: String,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            code: {
                type: String,
                select: false,
            },
            expiresAt: {
                type: Date,
                select: false,
            },
            attempts: {
                type: Number,
                default: 0,
                select: false,
            },
        },
        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpires: {
            type: Date,
            select: false,
        },
        lastLogin: {
            type: Date,
        },
        refreshToken: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        attempts: 0,
    };
    return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (inputOTP) {
    if (!this.otp?.code || !this.otp?.expiresAt) {
        return { valid: false, message: "No OTP found. Please request a new one." };
    }

    if (this.otp.attempts >= 5) {
        return { valid: false, message: "Too many failed attempts. Please request a new OTP." };
    }

    if (new Date() > this.otp.expiresAt) {
        return { valid: false, message: "OTP has expired. Please request a new one." };
    }

    if (this.otp.code !== inputOTP) {
        this.otp.attempts += 1;
        return { valid: false, message: "Invalid OTP. Please try again." };
    }

    // Clear OTP after successful verification
    this.otp = { code: null, expiresAt: null, attempts: 0 };
    return { valid: true, message: "OTP verified successfully." };
};

const User = mongoose.model("User", userSchema);
export default User;
