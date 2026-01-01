import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup, clearError, setPendingVerification } from "../../../store/slices/authSlice";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Sparkles } from "lucide-react";

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
        return { level: 3, text: "Strong", color: "bg-emerald-500" };
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

    return (
        <div className="min-h-screen flex items-center justify-center p-5 md:p-10 bg-gradient-to-br from-[#0f1115] via-[#11181c] to-[#0f1115] relative overflow-hidden font-mulish">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
            </div>

            {/* Card */}
            <div className="w-full max-w-[440px] bg-[#1a1c21]/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative z-10 animate-[fadeInUp_0.6s_ease-out] overflow-hidden">
                {/* Glow Header */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 opacity-50" />

                <div className="px-10 pt-12 pb-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 relative group">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-2xl group-hover:bg-emerald-500/30 transition-all duration-500" />
                        <div className="relative w-full h-full bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500">
                            <Sparkles size={30} className="text-[#0d0f13]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Create Account
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Join the Prosperity Agent platform
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
                                            : "border-white/10 group-hover:border-emerald-500/30 focus:border-emerald-500/50"
                                        }`}
                                    placeholder="John Doe"
                                    {...register("name", {
                                        required: "Name is required",
                                        minLength: { value: 2, message: "Name must be at least 2 characters" },
                                    })}
                                />
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] transition-colors duration-300 ${errors.name ? "text-red-400" : "text-neutral-500 group-hover:text-emerald-400"}`} />
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
                                            : "border-white/10 group-hover:border-emerald-500/30 focus:border-emerald-500/50"
                                        }`}
                                    placeholder="Min 6 characters, 1 number"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                                        pattern: { value: /\d/, message: "Must include a number" },
                                    })}
                                />
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] transition-colors duration-300 ${errors.password ? "text-red-400" : "text-neutral-500 group-hover:text-emerald-400"}`} />
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
                            className="mt-4 py-4 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl text-[#0d0f13] font-bold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg shadow-cyan-500/10 hover:shadow-emerald-500/20"
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
