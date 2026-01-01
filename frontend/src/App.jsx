import { useState, useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import Preloader from "./components/Preloader";
import { Routes, Route } from "react-router-dom";
import About from "./components/pages/About";
import Home from "./components/pages/Home/Home";
import store from "./store";
import { checkAuth } from "./store/slices/authSlice";
import {
  Login,
  Signup,
  VerifyOTP,
  ForgotPassword,
  ResetPassword,
} from "./components/pages/auth";
import ProtectedRoute, { GuestRoute } from "./components/ProtectedRoute";

// Auth initializer component
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuth());
  }, [dispatch]);

  return children;
};

function AppContent() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <AuthInitializer>
      {showPreloader && (
        <Preloader onComplete={() => setShowPreloader(false)} />
      )}
      <Routes>
        {/* Main Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home showPreloader={showPreloader} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <GuestRoute>
              <VerifyOTP />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />
      </Routes>
    </AuthInitializer>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
