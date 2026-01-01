import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: `${API_URL}/api/auth`,
    withCredentials: true, 
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            error.response?.data?.tokenExpired &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                await api.post("/refresh-token");
                return api(originalRequest);
            } catch (refreshError) {
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ==================== ASYNC THUNKS ====================

// Check authentication status
export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/check");
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Auth check failed" });
        }
    }
);

// Sign up
export const signup = createAsyncThunk(
    "auth/signup",
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/signup", { name, email, password });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Signup failed" });
        }
    }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
    "auth/verifyOTP",
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/verify-otp", { email, otp });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Verification failed" });
        }
    }
);

// Resend OTP
export const resendOTP = createAsyncThunk(
    "auth/resendOTP",
    async ({ email }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/resend-otp", { email });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to resend OTP" });
        }
    }
);

// Login
export const login = createAsyncThunk(
    "auth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/login", { email, password });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Login failed" });
        }
    }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
    "auth/forgotPassword",
    async ({ email }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/forgot-password", { email });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to send reset code" });
        }
    }
);

// Verify Reset OTP
export const verifyResetOTP = createAsyncThunk(
    "auth/verifyResetOTP",
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/verify-reset-otp", { email, otp });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Verification failed" });
        }
    }
);

// Reset Password
export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async ({ resetToken, password, confirmPassword }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/reset-password", {
                resetToken,
                password,
                confirmPassword,
            });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Password reset failed" });
        }
    }
);

// Logout
export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/logout");
            return data;
        } catch (error) {
            // Still logout even if API fails
            return { success: true };
        }
    }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
    "auth/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/me");
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to get user" });
        }
    }
);

// ==================== INITIAL STATE ====================

const getPendingVerification = () => {
    try {
        const data = localStorage.getItem("pendingVerification");
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,

    // For OTP verification flow (persisted)
    pendingVerification: getPendingVerification(),

    // For password reset flow
    resetToken: null,

    // Loading states for specific actions
    signupLoading: false,
    loginLoading: false,
    verifyLoading: false,
    resetLoading: false,
};

// ==================== AUTH SLICE ====================

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setPendingVerification: (state, action) => {
            state.pendingVerification = action.payload;
        },
        clearPendingVerification: (state) => {
            state.pendingVerification = null;
        },
        setResetToken: (state, action) => {
            state.resetToken = action.payload;
        },
        clearResetToken: (state) => {
            state.resetToken = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ========== CHECK AUTH ==========
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = action.payload.isAuthenticated;
                state.user = action.payload.user || null;
                state.error = null;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            })

            // ========== SIGNUP ==========
            .addCase(signup.pending, (state) => {
                state.signupLoading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.signupLoading = false;
                if (action.payload.requiresVerification) {
                    const pendingData = { email: action.payload.email };
                    state.pendingVerification = pendingData;
                    localStorage.setItem("pendingVerification", JSON.stringify(pendingData));
                }
                state.error = null;
            })
            .addCase(signup.rejected, (state, action) => {
                state.signupLoading = false;
                state.error = action.payload?.message || "Signup failed";
            })

            // ========== VERIFY OTP ==========
            .addCase(verifyOTP.pending, (state) => {
                state.verifyLoading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.verifyLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.pendingVerification = null;
                localStorage.removeItem("pendingVerification");
                state.error = null;
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.verifyLoading = false;
                state.error = action.payload?.message || "Verification failed";
            })

            // ========== RESEND OTP ==========
            .addCase(resendOTP.pending, (state) => {
                state.verifyLoading = true;
                state.error = null;
            })
            .addCase(resendOTP.fulfilled, (state) => {
                state.verifyLoading = false;
                state.error = null;
            })
            .addCase(resendOTP.rejected, (state, action) => {
                state.verifyLoading = false;
                state.error = action.payload?.message || "Failed to resend OTP";
            })

            // ========== LOGIN ==========
            .addCase(login.pending, (state) => {
                state.loginLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loginLoading = false;
                if (action.payload.requiresVerification) {
                    const pendingData = { email: action.payload.email };
                    state.pendingVerification = pendingData;
                    localStorage.setItem("pendingVerification", JSON.stringify(pendingData));
                } else {
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    localStorage.removeItem("pendingVerification");
                }
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loginLoading = false;
                state.error = action.payload?.message || "Login failed";
            })

            // ========== FORGOT PASSWORD ==========
            .addCase(forgotPassword.pending, (state) => {
                state.resetLoading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.resetLoading = false;
                state.error = null;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.resetLoading = false;
                state.error = action.payload?.message || "Failed to send reset code";
            })

            // ========== VERIFY RESET OTP ==========
            .addCase(verifyResetOTP.pending, (state) => {
                state.resetLoading = true;
                state.error = null;
            })
            .addCase(verifyResetOTP.fulfilled, (state, action) => {
                state.resetLoading = false;
                state.resetToken = action.payload.resetToken;
                state.error = null;
            })
            .addCase(verifyResetOTP.rejected, (state, action) => {
                state.resetLoading = false;
                state.error = action.payload?.message || "Verification failed";
            })

            // ========== RESET PASSWORD ==========
            .addCase(resetPassword.pending, (state) => {
                state.resetLoading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.resetLoading = false;
                state.resetToken = null;
                state.error = null;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.resetLoading = false;
                state.error = action.payload?.message || "Password reset failed";
            })

            // ========== LOGOUT ==========
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.pendingVerification = null;
                state.resetToken = null;
                state.error = null;
            })
            .addCase(logout.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            })

            // ========== GET CURRENT USER ==========
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const {
    clearError,
    setPendingVerification,
    clearPendingVerification,
    setResetToken,
    clearResetToken,
} = authSlice.actions;

export default authSlice.reducer;
