import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup, clearError, setPendingVerification, googleLogin } from "../../../store/slices/authSlice";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Sparkles } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { signupLoading, error } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        mode: "onBlur",
    });

    const password = watch("password", "");

    const passwordStrength = useMemo(() => {
        if (!password) return { level: 0, text: "", color: "" };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) return { level: 1, text: "Weak", color: "bg-red-500" };
        if (strength <= 3) return { level: 2, text: "Medium", color: "bg-cyan-500" };
        return { level: 3, text: "Strong", color: "bg-green-500" };
    }, [password]);

    const onSubmit = async (data) => {
        dispatch(clearError());

        const result = await dispatch(
            signup({ name: data.name, email: data.email, password: data.password })
        );

        if (signup.fulfilled.match(result)) {
            if (result.payload.requiresVerification) {
                dispatch(setPendingVerification({ email: data.email, name: data.name }));
                navigate("/verify-otp", { state: { email: data.email, name: data.name } });
            } else if (result.payload.success) {
                navigate("/");
            }
        }
    };

    // Google Login Handler
    const handleGoogleLogin = useGoogleLogin({
        flow: 'implicit',
        scope: 'openid profile email',
        onSuccess: async (tokenResponse) => {
            try {
                dispatch(clearError());
                console.log('🔑 Token received:', tokenResponse);

                // Get user info from Google using the access token
                const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });

                console.log('👤 User info received:', userInfo.data);

                // Send user info to our backend
                const payload = {
                    credential: tokenResponse.access_token,
                    userInfo: userInfo.data
                };
                console.log('📤 Sending to backend:', payload);

                const result = await dispatch(googleLogin(payload));

                if (googleLogin.fulfilled.match(result)) {
                    navigate('/');
                }
            } catch (error) {
                console.error('❌ Google login error:', error);
            }
        },
        onError: () => {
            console.error('Google Sign-In failed');
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-5 md:p-10 bg-[#09090b] relative overflow-hidden font-mulish">
            {/* Clean Background with Character Pattern */}
            <div className="fixed inset-0 pointer-events-none">

                {/* Character/Symbol Pattern Overlay */}
                {/* Character/Symbol Pattern Overlay - Shadows Into Light */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="transcript-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                            <text x="12" y="24" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-12, 12, 24)">?</text>
                            <text x="165" y="40" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(25, 165, 40)">Ж</text>
                            <text x="88" y="55" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-8, 88, 55)">汉</text>
                            <text x="140" y="85" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(15, 140, 85)">#</text>
                            <text x="30" y="95" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(30, 30, 95)">Ñ</text>
                            <text x="75" y="115" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-20, 75, 115)">$</text>
                            <text x="180" y="130" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(10, 180, 130)">Ф</text>
                            <text x="15" y="155" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-35, 15, 155)">%</text>
                            <text x="110" y="160" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(45, 110, 160)">¿</text>
                            <text x="55" y="175" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-15, 55, 175)">字</text>
                            <text x="155" y="185" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(20, 155, 185)">Ω</text>
                            <text x="190" y="70" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-10, 190, 70)">{`}`}</text>
                            <text x="50" y="30" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-25, 50, 30)">Д</text>
                            <text x="95" y="10" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(12, 95, 10)">&</text>
                            <text x="125" y="145" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-40, 125, 145)">|</text>
                            <text x="170" y="105" fontSize="14" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(18, 170, 105)">书</text>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#transcript-pattern)" style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)' }} />
                </svg>
            </div>

            {/* Card */}
            <div className="w-full max-w-[440px] glass-card rounded-3xl relative z-10 animate-[fadeInUp_0.6s_ease-out] overflow-hidden">
                {/* Subtle Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                <div className="px-10 pt-8 pb-3 text-center">
                    <img src="/favicon1.png" alt="" className="w-12 h-12 mx-auto mb-5" />
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Create Account
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Join the Prosmic platform
                    </p>
                </div>

                <div className="px-10 pb-12 pt-2">
                    {error && (
                        <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-sm animate-[shake_0.3s_ease]">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-neutral-300 text-sm font-medium ml-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    className={`w-full py-3.5 px-4 pl-12 bg-white/[0.03] border rounded-xl text-white text-sm outline-none transition-all duration-300 placeholder:text-white/20
                    ${errors.name
                                            ? "border-red-500/50 bg-red-500/5"
                                            : "border-white/10 group-hover:border-cyan-500/30 focus:border-cyan-500/50"
                                        }`}
                                    placeholder="John Doe"
                                    {...register("name", {
                                        required: "Name is required",
                                        minLength: { value: 2, message: "Name must be at least 2 characters" },
                                    })}
                                />
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] transition-colors duration-300 ${errors.name ? "text-red-400" : "text-neutral-500 group-hover:text-cyan-400"}`} />
                            </div>
                            {errors.name && (
                                <span className="text-red-400 text-xs ml-1 mt-1 font-medium">{errors.name.message}</span>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-neutral-300 text-sm font-medium ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    className={`w-full py-3.5 px-4 pl-12 bg-white/[0.03] border rounded-xl text-white text-sm outline-none transition-all duration-300 placeholder:text-white/20
                    ${errors.email
                                            ? "border-red-500/50 bg-red-500/5"
                                            : "border-white/10 group-hover:border-cyan-500/30 focus:border-cyan-500/50"
                                        }`}
                                    placeholder="name@example.com"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                                    })}
                                />
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] transition-colors duration-300 ${errors.email ? "text-red-400" : "text-neutral-500 group-hover:text-cyan-400"}`} />
                            </div>
                            {errors.email && (
                                <span className="text-red-400 text-xs ml-1 mt-1 font-medium">{errors.email.message}</span>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-neutral-300 text-sm font-medium ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full py-3.5 px-4 pl-12 pr-12 bg-white/[0.03] border rounded-xl text-white text-sm outline-none transition-all duration-300 placeholder:text-white/20
                    ${errors.password
                                            ? "border-red-500/50 bg-red-500/5"
                                            : "border-white/10 group-hover:border-cyan-500/30 focus:border-cyan-500/50"
                                        }`}
                                    placeholder="Min 6 characters, 1 number"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                                        pattern: { value: /\d/, message: "Must include a number" },
                                    })}
                                />
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] transition-colors duration-300 ${errors.password ? "text-red-400" : "text-neutral-500 group-hover:text-cyan-400"}`} />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Strength Meter */}
                            {password && (
                                <div className="flex flex-col gap-1.5 px-1 mt-1">
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3].map((l) => (
                                            <div key={l} className={`flex-1 h-1 rounded-full transition-all duration-500 ${passwordStrength.level >= l ? passwordStrength.color : "bg-white/5"}`} />
                                        ))}
                                    </div>
                                    <span className={`text-xs font-medium ${passwordStrength.level === 1 ? "text-red-400" : passwordStrength.level === 2 ? "text-cyan-500" : "text-emerald-400"}`}>
                                        Password strength: {passwordStrength.text}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="mt-4 py-4 px-6 bg-cyan-500/60 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg shadow-cyan-500/10 hover:shadow-emerald-500/20"
                            disabled={signupLoading}
                        >
                            {signupLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-[#0d0f13]/30 border-t-[#0d0f13] rounded-full animate-spin" />
                                    Creating account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative mt-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#1a1c21] text-neutral-400">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign-In Button */}
                        <button
                            type="button"
                            onClick={() => handleGoogleLogin()}
                            className="w-full py-3.5 px-4 bg-[#212123] hover:bg-[#171717] border border-white/10 rounded-xl text-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 group"
                            disabled={signupLoading}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm font-medium">Sign up with Google</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-neutral-400 text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
