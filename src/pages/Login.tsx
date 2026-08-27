import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context';

export default function Login() {
  const { setIsLoggedIn, addToast, navigate } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      addToast(`OTP sent to +91 ${phone}`, 'info');
    }, 1200);
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      addToast('Enter the 6-digit OTP', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsLoggedIn(true);
      addToast('Login successful! Welcome back.', 'success');
      navigate('orders');
    }, 1000);
  };

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background motif */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0D9A55]/12 to-[#0D9A55]/3 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] flex items-center justify-center shadow-[0_4px_16px_rgba(13,154,85,0.4)] mb-3">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Singh Medical Stores</h1>
          <p className="text-sm text-[#6B7280]">Retailer Portal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_48px_rgba(0,0,0,0.08)] p-7">
          {step === 'phone' ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#1C1C1E] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Login to your account</h2>
                <p className="text-sm text-[#6B7280]">Enter your registered mobile number</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-3 bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm text-[#6B7280] font-semibold shrink-0">+91</div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    placeholder="Enter 10-digit number"
                    className={`flex-1 px-4 py-3 bg-[#F5F7F5] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all ${phoneError ? 'border-red-400' : 'border-black/[0.08]'}`}
                  />
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3.5 bg-[#0D9A55] text-white rounded-2xl font-bold hover:bg-[#0A7A43] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(13,154,85,0.3)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Sending OTP...
                  </>
                ) : 'Send OTP →'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <button onClick={() => setStep('phone')} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors mb-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  Change number
                </button>
                <h2 className="text-lg font-bold text-[#1C1C1E] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Enter OTP</h2>
                <p className="text-sm text-[#6B7280]">
                  6-digit OTP sent to <span className="font-semibold text-[#1C1C1E]">+91 {phone}</span>
                </p>
                <p className="text-xs text-[#0D9A55] mt-1 font-medium">(Use any 6 digits for demo)</p>
              </div>

              <div className="flex gap-2 justify-between mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-10 h-12 text-center text-lg font-bold bg-[#F5F7F5] border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/40 focus:border-[#0D9A55] transition-all"
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3.5 bg-[#0D9A55] text-white rounded-2xl font-bold hover:bg-[#0A7A43] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(13,154,85,0.3)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Verifying...
                  </>
                ) : 'Verify & Login'}
              </button>

              <button className="w-full mt-3 text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors">
                Resend OTP in 30s
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          For retailer access only · Drug License required
        </p>
      </div>
    </div>
  );
}
