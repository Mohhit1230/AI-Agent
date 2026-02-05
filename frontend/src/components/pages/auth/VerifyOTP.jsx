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

            <div className="w-full max-w-[460px] glass-card rounded-3xl relative z-10 animate-[fadeInUp_0.6s_ease-out] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                <div className="px-10 pt-12 pb-4 text-center">
                    <button onClick={() => navigate(-1)} className="absolute top-8 left-8 p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-cyan-400 transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="w-16 h-16 mx-auto mb-6 relative group">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-2xl group-hover:bg-cyan-500/30 transition-all duration-500" />
                        <div className="relative w-full h-full bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500">
                            <ShieldCheck size={30} className="text-[#0d0f13]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Verify OTP</h1>
                    <p className="text-neutral-400 text-sm">
                        Verification code sent to <span className="text-cyan-400 font-medium">{email}</span>
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
                                    className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-xl text-center text-2xl font-bold text-white outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-cyan-500/5"
                                />
                            ))}
                        </div>
                        <div className="flex flex-col gap-5">
                            <button
                                onClick={handleVerify}
                                disabled={otp.some(d => !d) || verifyLoading}
                                className="w-full py-4 px-6 bg-cyan-500/60 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-30"
                            >
                                {verifyLoading ? (
                                    <div className="w-5 h-5 border-2 border-[#0d0f13]/30 border-t-[#0d0f13] rounded-full animate-spin" />
                                ) : (
                                    "Verify Identity"
                                )}
                            </button>
                            <div className="text-center">
                                {canResend ? (
                                    <button onClick={handleResend} className="flex items-center justify-center gap-2 mx-auto text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                                        <RefreshCcw size={16} />
                                        Resend OTP
                                    </button>
                                ) : (
                                    <p className="text-neutral-500 text-sm">Resend code in <span className="text-cyan-400 font-medium">{timer}s</span></p>
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
