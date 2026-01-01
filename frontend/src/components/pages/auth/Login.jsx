import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError, setPendingVerification } from "../../../store/slices/authSlice";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Sparkles } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loginLoading, error } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onBlur",
    });

    const onSubmit = async (data) => {
        dispatch(clearError());

        const result = await dispatch(login({ email: data.email, password: data.password }));

        if (login.fulfilled.match(result)) {
            if (result.payload.requiresVerification) {
                dispatch(setPendingVerification({ email: data.email }));
                navigate("/verify-otp", { state: { email: data.email } });
            } else if (result.payload.success) {
                navigate("/");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 md:p-10 bg-gradient-to-br from-[#0f1115] via-[#11181c] to-[#0f1115] relative overflow-hidden font-mulish">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
            </div>

            {/* Card */}
            <div className="w-full max-w-[420px] bg-[#1a1c21]/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative z-10 animate-[fadeInUp_0.6s_ease-out] overflow-hidden">
                {/* Glow Header */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 opacity-50" />

                <div className="px-10 pt-8 pb-6 text-center">
                   
                       
                        <img src="/favicon1.png" alt="" className="w-12 h-12 mx-auto mb-5" />
                    
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Sign in to your Prosperity Agent account
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
                                            : "border-white/10 group-hover:border-emerald-500/30 focus:border-emerald-500/50"
                                        }`}
                                    placeholder="name@example.com"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                />
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] transition-colors duration-300 ${errors.email ? "text-red-400" : "text-neutral-500 group-hover:text-emerald-400"}`} />
                            </div>
                            {errors.email && (
                                <span className="text-red-400 text-xs ml-1 mt-1 font-medium">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-neutral-300 text-sm font-medium">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-cyan-400 text-xs hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full py-3.5 px-4 pl-12 pr-12 bg-white/[0.03] border rounded-xl text-white text-sm outline-none transition-all duration-300 placeholder:text-white/20
                    ${errors.password
                                            ? "border-red-500/50 bg-red-500/5"
                                            : "border-white/10 group-hover:border-emerald-500/30 focus:border-emerald-500/50"
                                        }`}
                                    placeholder="••••••••"
                                    {...register("password", {
                                        required: "Password is required",
                                    })}
                                />
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] transition-colors duration-300 ${errors.password ? "text-red-400" : "text-neutral-500 group-hover:text-emerald-400"}`} />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="text-red-400 text-xs ml-1 mt-1 font-medium">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="mt-2 py-4 px-6 bg-cyan-400/60 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95"
                            disabled={loginLoading}
                        >
                            {loginLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-[#0d0f13]/30 border-t-[#0d0f13] rounded-full animate-spin" />
                                    Logging in...
                                </div>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-neutral-400 text-sm">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
