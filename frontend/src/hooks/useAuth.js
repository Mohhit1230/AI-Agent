import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
    login as loginAction,
    signup as signupAction,
    verifyOTP as verifyOTPAction,
    resendOTP as resendOTPAction,
    forgotPassword as forgotPasswordAction,
    verifyResetOTP as verifyResetOTPAction,
    resetPassword as resetPasswordAction,
    logout as logoutAction,
    checkAuth as checkAuthAction,
    getCurrentUser as getCurrentUserAction,
    clearError,
    setPendingVerification,
    clearPendingVerification,
    setResetToken,
    clearResetToken,
} from "../store/slices/authSlice";

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 */
export const useAuth = () => {
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);

    const login = useCallback(
        (email, password) => dispatch(loginAction({ email, password })),
        [dispatch]
    );

    const signup = useCallback(
        (name, email, password) => dispatch(signupAction({ name, email, password })),
        [dispatch]
    );

    const verifyOTP = useCallback(
        (email, otp) => dispatch(verifyOTPAction({ email, otp })),
        [dispatch]
    );

    const resendOTP = useCallback(
        (email) => dispatch(resendOTPAction({ email })),
        [dispatch]
    );

    const forgotPassword = useCallback(
        (email) => dispatch(forgotPasswordAction({ email })),
        [dispatch]
    );

    const verifyResetOTP = useCallback(
        (email, otp) => dispatch(verifyResetOTPAction({ email, otp })),
        [dispatch]
    );

    const resetPassword = useCallback(
        (resetToken, password, confirmPassword) =>
            dispatch(resetPasswordAction({ resetToken, password, confirmPassword })),
        [dispatch]
    );

    const logout = useCallback(() => dispatch(logoutAction()), [dispatch]);

    const checkAuth = useCallback(() => dispatch(checkAuthAction()), [dispatch]);

    const getCurrentUser = useCallback(
        () => dispatch(getCurrentUserAction()),
        [dispatch]
    );

    const handleClearError = useCallback(
        () => dispatch(clearError()),
        [dispatch]
    );

    const handleSetPendingVerification = useCallback(
        (data) => dispatch(setPendingVerification(data)),
        [dispatch]
    );

    const handleClearPendingVerification = useCallback(
        () => dispatch(clearPendingVerification()),
        [dispatch]
    );

    const handleSetResetToken = useCallback(
        (token) => dispatch(setResetToken(token)),
        [dispatch]
    );

    const handleClearResetToken = useCallback(
        () => dispatch(clearResetToken()),
        [dispatch]
    );

    return {
        // State
        user: auth.user,
        isAuthenticated: auth.isAuthenticated,
        loading: auth.loading,
        error: auth.error,
        pendingVerification: auth.pendingVerification,
        resetToken: auth.resetToken,
        signupLoading: auth.signupLoading,
        loginLoading: auth.loginLoading,
        verifyLoading: auth.verifyLoading,
        resetLoading: auth.resetLoading,

        // Actions
        login,
        signup,
        verifyOTP,
        resendOTP,
        forgotPassword,
        verifyResetOTP,
        resetPassword,
        logout,
        checkAuth,
        getCurrentUser,
        clearError: handleClearError,
        setPendingVerification: handleSetPendingVerification,
        clearPendingVerification: handleClearPendingVerification,
        setResetToken: handleSetResetToken,
        clearResetToken: handleClearResetToken,
    };
};

export default useAuth;
