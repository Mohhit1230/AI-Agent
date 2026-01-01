import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute - Wrapper component for routes that require authentication
 * 
 * Usage:
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 */
const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1115] gap-4">
                <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Authenticating</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return children;
};

/**
 * GuestRoute - Wrapper for routes that should only be accessible to non-authenticated users
 * (login, signup pages - redirect to home if already logged in)
 */
export const GuestRoute = ({ children, redirectTo = "/" }) => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f1115]">
                <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default ProtectedRoute;
