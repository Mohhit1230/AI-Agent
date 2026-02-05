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
            <div className="min-h-screen flex items-center justify-center p-5 md:p-10 bg-[#09090b] relative overflow-hidden font-mulish">
                <div className="absolute inset-0 pointer-events-none">

                    <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="transcript-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                                {/* Row 1 */}
                                <text x="10" y="30" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-12, 10, 30)">?</text>
                                <text x="60" y="30" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(25, 60, 30)">Ж</text>
                                <text x="110" y="30" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-8, 110, 30)">汉</text>
                                <text x="160" y="30" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(15, 160, 30)">#</text>

                                {/* Row 2 */}
                                <text x="35" y="80" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(30, 35, 80)">Ñ</text>
                                <text x="85" y="80" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-20, 85, 80)">$</text>
                                <text x="135" y="80" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(10, 135, 80)">Ф</text>
                                <text x="185" y="80" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-35, 185, 80)">%</text>

                                {/* Row 3 */}
                                <text x="10" y="130" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(45, 10, 130)">¿</text>
                                <text x="60" y="130" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-15, 60, 130)">字</text>
                                <text x="110" y="130" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(20, 110, 130)">Ω</text>
                                <text x="160" y="130" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-10, 160, 130)">{`}`}</text>

                                {/* Row 4 */}
                                <text x="35" y="180" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-25, 35, 180)">Д</text>
                                <text x="85" y="180" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(12, 85, 180)">&</text>
                                <text x="135" y="180" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(-40, 135, 180)">|</text>
                                <text x="185" y="180" fontSize="24" className="font-shadows" fill="white" style={{ fontWeight: 100 }} transform="rotate(18, 185, 180)">书</text>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#transcript-pattern)" style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)' }} />
                    </svg>
                </div>
                <div className="w-full max-w-[400px] glass-card rounded-3xl p-10 relative z-10 text-center animate-[fadeInUp_0.5s_ease-out]">
                    <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Reset Email Sent</h2>
                    <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                        We've sent a recovery code to <br /><span className="text-cyan-400 font-medium">{emailSent}</span>.
                    </p>
                    <button
                        onClick={() => navigate("/reset-password", { state: { email: emailSent } })}
                        className="w-full py-3.5 px-6 bg-cyan-500/60 rounded-xl text-white font-bold hover:scale-[1.02] active:scale-95 transition-all "
                    >
                        Enter Recovery Code
                    </button>
                </div>
            </div >
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-5 md:p-10 bg-[#09090b] relative overflow-hidden font-mulish">
            {/* Clean Background with Character Pattern */}
            <div className="absolute inset-0 pointer-events-none">

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

            <div className="w-full max-w-[420px] glass-card rounded-3xl relative z-10 animate-[fadeInUp_0.6s_ease-out] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <div className="px-10 pt-12 pb-6 text-center">
                    <Link to="/login" className="absolute top-8 left-8 p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-cyan-400 transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="w-16 h-16 mx-auto mb-6 relative group">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-2xl group-hover:bg-cyan-500/30 transition-all duration-500" />
                        <div className="relative w-full h-full bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500">
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
                            className="mt-2 py-3.5 px-6 bg-cyan-500/60 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-cyan-500/10"
                        >
                            {resetLoading ? (
                                <div className="w-5 h-5 border-2 mx-auto border-[#0d0f13]/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Send Reset Code"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
