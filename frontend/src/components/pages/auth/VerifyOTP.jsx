import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyOTP, resendOTP, clearError } from "../../../store/slices/authSlice";
import { ShieldCheck, AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { verifyLoading, error } = useSelector((state) => state.auth);

    const email = location.state?.email || useSelector(state => state.auth.pendingVerification?.email);

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate("/signup");
            return;
        }

        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1].focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").substring(0, 6);
        if (/^\d+$/.test(data)) {
            const newOtp = [...otp];
            data.split("").forEach((char, i) => { newOtp[i] = char; });
            setOtp(newOtp);
            const nextIdx = Math.min(data.length, 5);
            inputRefs.current[nextIdx].focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join("");
        if (otpString.length !== 6) return;
        const result = await dispatch(verifyOTP({ email, otp: otpString }));
        if (verifyOTP.fulfilled.match(result) && result.payload.success) navigate("/");
    };

    const handleResend = async () => {
        if (!canResend) return;
        const result = await dispatch(resendOTP({ email }));
        if (resendOTP.fulfilled.match(result)) {
            setTimer(60);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0].focus();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 md:p-10 bg-gradient-to-br from-[#0f1115] via-[#11181c] to-[#0f1115] relative overflow-hidden font-mulish">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-[460px] bg-[#1a1c21]/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative z-10 animate-[fadeInUp_0.6s_ease-out] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 opacity-50" />

                <div className="px-10 pt-12 pb-4 text-center">
                    <button onClick={() => navigate(-1)} className="absolute top-8 left-8 p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-emerald-400 transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="w-16 h-16 mx-auto mb-6 relative group">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-2xl group-hover:bg-cyan-500/30 transition-all duration-500" />
                        <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500">
                            <ShieldCheck size={30} className="text-[#0d0f13]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Verify OTP</h1>
                    <p className="text-neutral-400 text-sm">
                        Verification code sent to <span className="text-emerald-400 font-medium">{email}</span>
                    </p>
                </div>

                <div className="px-10 pb-12 pt-8">
                    {error && (
                        <div className="flex items-center gap-2.5 p-3.5 mb-8 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-sm animate-[shake_0.3s_ease]">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    <div className="flex flex-col gap-8">
                        <div className="flex justify-between gap-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    value={digit}
                                    maxLength={1}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-xl text-center text-2xl font-bold text-white outline-none transition-all duration-300 focus:border-emerald-500/50 focus:bg-emerald-500/5"
                                />
                            ))}
                        </div>
                        <div className="flex flex-col gap-5">
                            <button
                                onClick={handleVerify}
                                disabled={otp.some(d => !d) || verifyLoading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-[#0d0f13] font-bold transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-30 shadow-lg shadow-emerald-500/10"
                            >
                                {verifyLoading ? "Verifying..." : "Verify Identity"}
                            </button>
                            <div className="text-center">
                                {canResend ? (
                                    <button onClick={handleResend} className="flex items-center justify-center gap-2 mx-auto text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                                        <RefreshCcw size={16} />
                                        Resend OTP
                                    </button>
                                ) : (
                                    <p className="text-neutral-500 text-sm">Resend code in <span className="text-emerald-400 font-medium">{timer}s</span></p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
