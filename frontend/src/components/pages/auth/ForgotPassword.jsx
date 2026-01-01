import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearError } from "../../../store/slices/authSlice";
import { Mail, ArrowLeft, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { resetLoading, error } = useSelector((state) => state.auth);
    const [isSent, setIsSent] = useState(false);
    const [emailSent, setEmailSent] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        dispatch(clearError());
        const result = await dispatch(forgotPassword({ email: data.email }));
        if (forgotPassword.fulfilled.match(result)) {
            setIsSent(true);
            setEmailSent(data.email);
        }
    };

    if (isSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-5 md:p-10 bg-gradient-to-br from-[#0f1115] via-[#11181c] to-[#0f1115] relative overflow-hidden font-mulish">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full" />
                </div>
                <div className="w-full max-w-[400px] bg-[#1a1c21]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-10 shadow-2xl relative z-10 text-center animate-[fadeInUp_0.5s_ease-out]">
                    <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Reset Email Sent</h2>
                    <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                        We've sent a recovery code to <br /><span className="text-emerald-400 font-medium">{emailSent}</span>.
                    </p>
                    <button
                        onClick={() => navigate("/reset-password", { state: { email: emailSent } })}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-[#0d0f13] font-bold hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-emerald-500/10"
                    >
                        Enter Recovery Code
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-5 md:p-10 bg-gradient-to-br from-[#0f1115] via-[#11181c] to-[#0f1115] relative overflow-hidden font-mulish">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-[420px] bg-[#1a1c21]/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative z-10 animate-[fadeInUp_0.6s_ease-out] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-50" />
                <div className="px-10 pt-12 pb-6 text-center">
                    <Link to="/login" className="absolute top-8 left-8 p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-cyan-400 transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="w-16 h-16 mx-auto mb-6 relative group">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-2xl group-hover:bg-emerald-500/30 transition-all duration-500" />
                        <div className="relative w-full h-full bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500">
                            <KeyRound size={30} className="text-[#0d0f13]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-neutral-400 text-sm">Enter your email to receive a recovery code</p>
                </div>
                <div className="px-10 pb-12 pt-4">
                    {error && (
                        <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-sm animate-[shake_0.3s_ease]">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-neutral-300 text-sm font-medium ml-1">Email Address</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    className={`w-full py-3.5 px-4 pl-12 bg-white/[0.03] border rounded-xl text-white text-sm outline-none transition-all duration-300 placeholder:text-white/20
                    ${errors.email ? "border-red-500/50 bg-red-500/5" : "border-white/10 group-hover:border-cyan-500/30"}`}
                                    placeholder="name@example.com"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                                    })}
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] text-neutral-500 group-hover:text-cyan-400" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={resetLoading}
                            className="mt-2 py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl text-[#0d0f13] font-bold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg shadow-cyan-500/10"
                        >
                            {resetLoading ? "Sending Code..." : "Send Reset Code"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
