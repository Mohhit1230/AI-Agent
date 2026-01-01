import { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyResetOTP, resetPassword, clearError } from "../../../store/slices/authSlice";
import { Lock, AlertCircle, ShieldCheck, Sparkles, Eye, EyeOff, ArrowRight } from "lucide-react";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { resetLoading, error, resetToken: storedToken } = useSelector((state) => state.auth);

    const [step, setStep] = useState(storedToken ? 2 : 1);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
    const [newPasswords, setNewPasswords] = useState({ password: "", confirmPassword: "" });
    const [success, setSuccess] = useState(false);

    const email = location.state?.email;
    const inputRefs = useRef([]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1].focus();
    };

    const handleVerifyOtp = async () => {
        const otpString = otp.join("");
        if (otpString.length !== 6) return;
        dispatch(clearError());
        const result = await dispatch(verifyResetOTP({ email, otp: otpString }));
        if (verifyResetOTP.fulfilled.match(result)) setStep(2);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        dispatch(clearError());
        const result = await dispatch(resetPassword({
            resetToken: storedToken,
            password: newPasswords.password,
            confirmPassword: newPasswords.confirmPassword
        }));
        if (resetPassword.fulfilled.match(result)) setSuccess(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 md:p-10 bg-gradient-to-br from-[#0f1115] via-[#11181c] to-[#0f1115] relative overflow-hidden font-mulish">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-[440px] bg-[#1a1c21]/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative z-10 animate-[fadeInUp_0.6s_ease-out] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500 opacity-50" />

                <div className="px-10 pt-12 pb-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 relative group">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-2xl group-hover:bg-cyan-500/30 transition-all duration-500" />
                        <div className="relative w-full h-full bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500">
                            {success ? <Sparkles size={30} className="text-[#0d0f13]" /> : <ShieldCheck size={30} className="text-[#0d0f13]" />}
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {success ? "All Set!" : step === 1 ? "Verify Identity" : "New Password"}
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        {success ? "Account secured successfully" : step === 1 ? `Validating reset for ${email}` : "Create your new security credentials"}
                    </p>
                </div>

                <div className="px-10 pb-12 pt-4">
                    {error && (
                        <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-sm animate-[shake_0.3s_ease]">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center animate-[fadeInUp_0.4s_ease-out]">
                            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                                Your password has been updated. <br /> You can now sign in with your new key.
                            </p>
                            <Link to="/login" className="flex items-center justify-center gap-2 w-full py-3.5 bg-cyan-500/60 rounded-xl text-white font-bold hover:scale-[1.01] transition-all shadow-lg shadow-emerald-500/10">
                                Back to Log In
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : step === 1 ? (
                        <div className="flex flex-col gap-8">
                            <div className="flex justify-between gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        value={digit}
                                        maxLength={1}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1].focus()}
                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-xl text-center text-2xl font-bold text-white outline-none focus:border-emerald-500/50"
                                    />
                                ))}
                            </div>
                            <button
                                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                                onClick={handleVerifyOtp}
                                disabled={otp.some(d => !d) || resetLoading}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-[#0d0f13] font-bold transition-all shadow-lg shadow-emerald-500/10"
                            >
                                {resetLoading ? (
                                    <div className="w-5 h-5 border-2 border-[#0d0f13]/30 border-t-[#0d0f13] rounded-full animate-spin" />
                                ) : (
                                    "Verify Recovery Code"
                                )}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-neutral-300 text-sm font-medium ml-1">New Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        className="w-full py-3.5 px-4 pl-12 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm outline-none transition-all focus:border-emerald-500/50"
                                        placeholder="••••••••"
                                        required
                                        value={newPasswords.password}
                                        onChange={(e) => setNewPasswords({ ...newPasswords, password: e.target.value })}
                                    />
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-emerald-400" />
                                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-neutral-300 text-sm font-medium ml-1">Confirm New Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        className="w-full py-3.5 px-4 pl-12 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm outline-none transition-all focus:border-emerald-500/50"
                                        placeholder="••••••••"
                                        required
                                        value={newPasswords.confirmPassword}
                                        onChange={(e) => setNewPasswords({ ...newPasswords, confirmPassword: e.target.value })}
                                    />
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-emerald-400" />
                                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={resetLoading}
                                className="mt-2 py-4 bg-cyan-500/60 rounded-xl text-white font-bold transition-all hover:scale-[1.01]"
                            >
                                {resetLoading ? "Updating..." : "Reset Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
