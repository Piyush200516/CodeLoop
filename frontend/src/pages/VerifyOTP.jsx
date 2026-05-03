import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function VerifyOTP() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // Get email from route state if arriving from Register
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            toast.error('Email not found. Please log in or register again.');
            navigate('/register');
        }
    }, [email, navigate]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Handle pasting
        if (value.length > 1) {
            const pastedData = value.slice(0, 6).split('');
            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) newOtp[index + i] = pastedData[i];
            }
            setOtp(newOtp);
            const nextIndex = Math.min(index + pastedData.length, 5);
            inputRefs.current[nextIndex]?.focus();
        } else {
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', {
                email,
                otp: otpString
            });
            toast.success(data.message || 'Account verified!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
            // Clear inputs on failure
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        
        try {
            const { data } = await api.post('/auth/resend-otp', { email });
            toast.success(data.message || 'New OTP sent!');
            setResendCooldown(60); // 60 second cooldown
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">Verify Email</h1>
                    <p className="text-slate-400">
                        We've sent a 6-digit code to <span className="text-slate-200 font-medium">{email}</span>
                    </p>
                </div>

                <div className="card shadow-2xl">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="flex justify-between gap-2 sm:gap-4 px-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    maxLength="6"
                                    value={digit}
                                    onChange={e => handleChange(index, e.target.value)}
                                    onKeyDown={e => handleKeyDown(index, e)}
                                    className="w-10 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.some(d => !d)}
                            className="btn-primary w-full flex items-center justify-center py-3"
                        >
                            {loading ? (
                                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Verify Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendCooldown > 0}
                                className={`font-medium ${resendCooldown > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-brand-400 hover:text-brand-300'}`}
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
