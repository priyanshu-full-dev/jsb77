import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, User } from 'lucide-react';

export default function AuthModal({
  authModal,
  type,
  isOpen,
  onClose,
  onLoginSuccess,
}) {
  const activeType = type || authModal || (isOpen ? 'login' : null);
  // 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState(
    typeof activeType === 'string' ? activeType : 'login'
  );

  // Login tabs: 'userId' | 'mobile'
  const [loginTab, setLoginTab] = useState('userId');

  // Mobile login sub-option: 'password' | 'otp'
  const [mobileAuthType, setMobileAuthType] = useState('password');

  // Form input states
  const [userId, setUserId] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referCode, setReferCode] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Inline validation errors state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeType) {
      setMode(typeof activeType === 'string' ? activeType : 'login');
      setErrors({});
      setIsDemoLoading(false);
    }
  }, [activeType]);

  const shouldRender = isOpen !== undefined ? isOpen : !!activeType;
  if (!shouldRender) return null;

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (loginTab === 'userId') {
      if (!userId.trim()) {
        newErrors.userId = 'Please Enter User ID';
      }
      if (!password) {
        newErrors.password = 'password must be at least 6 characters';
      } else if (password.length < 6) {
        newErrors.password = 'password must be at least 6 characters';
      }
    } else {
      // mobileTab
      if (!mobile.trim()) {
        newErrors.mobile = 'Please Enter Mobile Number';
      }
      if (mobileAuthType === 'password') {
        if (!password) {
          newErrors.password = 'password must be at least 6 characters';
        } else if (password.length < 6) {
          newErrors.password = 'password must be at least 6 characters';
        }
      } else {
        if (!otp.trim()) {
          newErrors.otp = 'Please Enter OTP';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const user = loginTab === 'userId' ? userId : mobile;
    if (onLoginSuccess) onLoginSuccess({ username: user, balance: 1500, exposure: 0 });
    onClose();
  };

  const handleDemoLogin = () => {
    setIsDemoLoading(true);
    setTimeout(() => {
      setIsDemoLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({ username: 'Demo', balance: 1500, exposure: 0 });
      }
      onClose();
    }, 650);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!mobile.trim()) newErrors.mobile = 'Please Enter Mobile Number';
    if (!username.trim()) newErrors.username = 'Please Enter Username';
    if (!password || password.length < 6) newErrors.password = 'password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    alert(`Registered successfully as ${username || mobile}!`);
    if (onLoginSuccess) onLoginSuccess({ username: username || mobile, balance: 1500 });
    onClose();
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!mobile.trim()) newErrors.mobile = 'Please Enter Mobile Number';
    if (!password || password.length < 6) newErrors.password = 'password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    alert('Password updated successfully! Please login with your new password.');
    setMode('login');
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-1.5 sm:px-4 py-2 sm:py-4 overflow-y-auto custom-scrollbar select-none"
      style={{
        backgroundImage: `url('/games/registerFootball-B6CeyOhX.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div className="w-[calc(100%-6px)] max-w-[420px] bg-[#07161b] border-[1.5px] border-white rounded-[14px] px-3 py-3 sm:px-4 sm:py-4 relative shadow-[0_20px_60px_rgba(0,0,0,0.95)] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2.5 text-white/90 hover:text-amber-400 text-2xl font-light cursor-pointer transition-colors leading-none p-1"
          aria-label="Close"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {/* Brand Logo Header */}
        <div className="flex items-center justify-center mt-1 mb-3">
          <img
            src="/games/login/public.avif"
            alt="KuberBook333"
            className="h-[40px] sm:h-[46px] max-w-[85%] object-contain drop-shadow-md"
            loading="eager"
          />
        </div>

        {/* -------------------- 1. LOGIN VIEW -------------------- */}
        {mode === 'login' && (
          <div>
            {/* Mobile Number / User ID Tab Switcher */}
            <div className="w-full h-[40px] rounded-[6px] border border-[#b6842d] flex overflow-hidden mb-2.5 bg-[#050f12]">
              <button
                type="button"
                onClick={() => {
                  setLoginTab('mobile');
                  setErrors({});
                }}
                style={
                  loginTab === 'mobile'
                    ? { background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }
                    : {}
                }
                className={`flex-1 text-[13.5px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                  loginTab === 'mobile'
                    ? 'text-black font-extrabold shadow-sm'
                    : 'bg-[#050f12] text-white hover:bg-[#091a20]'
                }`}
              >
                Mobile Number
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginTab('userId');
                  setErrors({});
                }}
                style={
                  loginTab === 'userId'
                    ? { background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }
                    : {}
                }
                className={`flex-1 text-[13.5px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                  loginTab === 'userId'
                    ? 'text-black font-extrabold shadow-sm'
                    : 'bg-[#050f12] text-white hover:bg-[#091a20]'
                }`}
              >
                User ID
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} noValidate>
              {/* User ID / Mobile Input */}
              {loginTab === 'userId' ? (
                <div className="mb-2">
                  <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center gap-2.5 shadow-xs">
                    <User size={16} className="text-black shrink-0" fill="currentColor" />
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => {
                        setUserId(e.target.value);
                        clearError('userId');
                      }}
                      placeholder="Enter User ID*"
                      className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                    />
                  </div>
                  {errors.userId && (
                    <p className="text-[#ff4d4f] text-[12px] font-medium text-left mt-1 px-1">
                      {errors.userId}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-2">
                  {/* Mobile Number Input with Flag & Country Code */}
                  <div className="w-full h-[42px] bg-white rounded-[5px] px-2.5 flex items-center gap-2 shadow-xs">
                    <div className="flex items-center gap-1 shrink-0 text-gray-900 font-bold text-[13px] border-r border-gray-300 pr-2">
                      <span className="text-base leading-none">🇮🇳</span>
                      <span>{countryCode}</span>
                      <span className="text-[9px] text-gray-700 ml-0.5">▼</span>
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        clearError('mobile');
                      }}
                      placeholder="Enter Mobile Number*"
                      className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none px-1"
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-[#ff4d4f] text-[12px] font-medium text-left mt-1 px-1">
                      {errors.mobile}
                    </p>
                  )}

                  {/* Radio buttons for Password vs OTP */}
                  <div className="flex items-center gap-5 text-white my-2 px-1 font-bold text-[14px]">
                    {/* Password Radio */}
                    <label
                      onClick={() => setMobileAuthType('password')}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          mobileAuthType === 'password'
                            ? 'border-[#d6a538]'
                            : 'border-white'
                        }`}
                      >
                        {mobileAuthType === 'password' && (
                          <span className="w-2 h-2 rounded-full bg-[#d6a538]" />
                        )}
                      </span>
                      <span>Password</span>
                    </label>

                    {/* OTP Radio */}
                    <label
                      onClick={() => setMobileAuthType('otp')}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          mobileAuthType === 'otp'
                            ? 'border-[#d6a538]'
                            : 'border-white'
                        }`}
                      >
                        {mobileAuthType === 'otp' && (
                          <span className="w-2 h-2 rounded-full bg-[#d6a538]" />
                        )}
                      </span>
                      <span>OTP</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Password or OTP Input */}
              {loginTab === 'userId' || mobileAuthType === 'password' ? (
                <div className="mb-1.5">
                  <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center justify-between shadow-xs">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError('password');
                      }}
                      placeholder="Enter Password*"
                      className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-900 hover:text-black ml-2 cursor-pointer p-0.5"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[#ff4d4f] text-[12px] font-medium text-left mt-1 px-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-1.5">
                  <div className="w-full h-[42px] bg-white rounded-[5px] pl-3 pr-1 flex items-center justify-between shadow-xs">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        clearError('otp');
                      }}
                      placeholder="Enter OTP*"
                      className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => alert(`OTP sent to ${countryCode}${mobile || 'your mobile number'}`)}
                      style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                      className="text-black font-extrabold text-[11.5px] px-3 py-1.5 rounded-[4px] shrink-0 hover:brightness-110 active:scale-95 transition-transform"
                    >
                      GET OTP
                    </button>
                  </div>
                  {errors.otp && (
                    <p className="text-[#ff4d4f] text-[12px] font-medium text-left mt-1 px-1">
                      {errors.otp}
                    </p>
                  )}
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="text-right mb-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrors({});
                  }}
                  className="text-white text-[13px] font-bold underline decoration-white hover:text-[#ffd700] transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Buttons Row */}
              <div className="flex gap-2.5 mb-2.5">
                <button
                  type="button"
                  disabled={isDemoLoading}
                  onClick={handleDemoLogin}
                  style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                  className="flex-1 h-[42px] text-black font-bold text-[14px] rounded-[5px] shadow-sm hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center whitespace-nowrap"
                >
                  {isDemoLoading ? (
                    <div className="w-5 h-5 border-[2.5px] border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Login With Demo ID'
                  )}
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                  className="flex-1 h-[42px] text-black font-bold text-[14px] rounded-[5px] shadow-sm hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center"
                >
                  Log In
                </button>
              </div>

              {/* Download APK Button */}
              <button
                type="button"
                onClick={() => alert('Downloading KuberBook333 Android APK...')}
                style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                className="w-full h-[42px] text-black font-bold text-[14px] rounded-[5px] shadow-sm hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 mb-2.5"
              >
                <span>Download APK</span>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1556-.2696.0633-.6144-.2063-.77-.2698-.1556-.6144-.0633-.77.2063l-2.0232 3.5042c-1.4423-.658-3.053-.9845-4.878-.9845s-3.4357.3265-4.878.9845l-2.0232-3.5042c-.1556-.2696-.5002-.3619-.77-.2063-.2696.1556-.3619.5004-.2063.77l1.996 3.4572C4.3006 10.9765 2.5 13.9686 2.5 17.5h19c0-3.5314-1.8006-6.5235-3.6185-8.1786" />
                </svg>
              </button>

              {/* WhatsApp ID Section */}
              <p className="text-[13px] text-white text-center font-medium mb-1.5">
                Get Your Ready-Made ID From WhatsApp
              </p>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                className="w-full h-[42px] text-black font-black text-[14.5px] uppercase tracking-wider rounded-[5px] shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center mb-2.5"
              >
                WHATSAPP NOW
              </a>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-2.5">
                <div className="border-t border-[#b6842d]/60 w-full"></div>
                <span className="bg-[#07161b] px-3 text-white text-[12px] font-extrabold uppercase tracking-wider absolute">
                  OR
                </span>
              </div>

              {/* Login With Telegram */}
              <div className="text-center mb-2">
                <p className="text-white text-[12.5px] font-black mb-1.5 uppercase tracking-wide">
                  LOGIN WITH
                </p>
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform mx-auto cursor-pointer"
                  aria-label="Login with Telegram"
                >
                  <img src="/games/login/download.png" alt="Telegram" className="w-10 h-10 object-contain rounded-xl" />
                </a>
              </div>

              {/* Join Now Link */}
              <div className="text-center text-[13px] text-white font-medium mb-2.5">
                Don't Have An Account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrors({});
                  }}
                  className="text-[#ebda8d] font-bold underline hover:text-amber-300 cursor-pointer ml-1"
                >
                  Join Now
                </button>
              </div>

              {/* Trust Badges (Gamcare, SSL, 18+) */}
              <div className="flex items-center justify-around px-2 pt-2.5 pb-0.5 border-t border-white/20 text-white">
                <img
                  src="/games/login/game-care.svg"
                  alt="GamCare"
                  className="h-9 w-auto object-contain"
                />
                <img
                  src="/games/login/restricted-regions-logo.svg"
                  alt="SSL Secure"
                  className="h-8 w-auto object-contain"
                />
                <img
                  src="/games/login/underage-logo.svg"
                  alt="18+"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </form>
          </div>
        )}

        {/* -------------------- 2. FORGOT PASSWORD VIEW -------------------- */}
        {mode === 'forgot' && (
          <div>
            <form onSubmit={handleForgotSubmit} noValidate>
              {/* Mobile Number with integrated GET OTP */}
              <div className="mb-2.5">
                <div className="w-full h-[42px] bg-white rounded-[5px] pl-2.5 pr-1 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-1 shrink-0 text-gray-900 font-bold text-[13px] border-r border-gray-300 pr-2 mr-1">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span>{countryCode}</span>
                    <span className="text-[9px] text-gray-700 ml-0.5">▼</span>
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      clearError('mobile');
                    }}
                    placeholder="Enter Mobile Number*"
                    className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none px-1"
                  />
                  <button
                    type="button"
                    onClick={() => alert(`OTP sent to ${countryCode}${mobile || 'your mobile number'}`)}
                    style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                    className="text-white font-extrabold text-[12px] px-3 py-1.5 rounded-[4px] shrink-0 hover:brightness-110 active:scale-95 transition-transform"
                  >
                    GET OTP
                  </button>
                </div>
                {errors.mobile && (
                  <p className="text-[#ff4d4f] text-[12px] font-medium text-left mt-1 px-1">
                    {errors.mobile}
                  </p>
                )}
              </div>

              {/* Enter Password* */}
              <div className="mb-2.5">
                <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center justify-between shadow-xs">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError('password');
                    }}
                    placeholder="Enter Password*"
                    className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-900 hover:text-black ml-2 cursor-pointer p-0.5"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[#ff4d4f] text-[12px] font-medium text-left mt-1 px-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Enter Confirm Password* */}
              <div className="mb-3">
                <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center justify-between shadow-xs">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError('confirmPassword');
                    }}
                    placeholder="Enter Confirm Password*"
                    className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-900 hover:text-black ml-2 cursor-pointer p-0.5"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[#ff4d4f] text-[12px] font-medium text-left mt-1 px-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* UPDATE PASSWORD Button */}
              <button
                type="submit"
                style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                className="w-full h-[42px] text-white font-extrabold text-[15px] uppercase tracking-wide rounded-[5px] shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer mb-3"
              >
                UPDATE PASSWORD
              </button>

              {/* Remember Your Password? LOG IN */}
              <div className="text-center text-[13px] text-white font-medium mb-1.5">
                Remember Your Password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrors({});
                  }}
                  className="text-[#ebda8d] font-bold underline hover:text-amber-300 cursor-pointer ml-1"
                >
                  LOG IN
                </button>
              </div>

              {/* Create New Account */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrors({});
                  }}
                  className="text-[#ebda8d] text-[13px] font-bold hover:text-amber-300 cursor-pointer"
                >
                  Create New Account
                </button>
              </div>
            </form>
          </div>
        )}

        {/* -------------------- 3. REGISTER VIEW -------------------- */}
        {mode === 'register' && (
          <div>
            <form onSubmit={handleRegisterSubmit} noValidate>
              {/* Mobile with Country Code & OTP */}
              <div className="w-full h-[42px] bg-white rounded-[5px] pl-2.5 pr-1 flex items-center justify-between mb-2.5 shadow-xs">
                <div className="flex items-center gap-1 shrink-0 text-gray-900 font-bold text-[13px] border-r border-gray-300 pr-2 mr-1">
                  <span className="text-base leading-none">🇮🇳</span>
                  <span>{countryCode}</span>
                  <span className="text-[9px] text-gray-700 ml-0.5">▼</span>
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    clearError('mobile');
                  }}
                  placeholder="Enter Mobile Number*"
                  className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none px-1"
                />
                <button
                  type="button"
                  onClick={() => alert(`OTP sent to ${countryCode}${mobile || 'your mobile number'}`)}
                  style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                  className="text-white font-extrabold text-[12px] px-3 py-1.5 rounded-[4px] shrink-0 hover:brightness-110 active:scale-95 transition-transform"
                >
                  GET OTP
                </button>
              </div>
              {errors.mobile && (
                <p className="text-[#ff4d4f] text-[12px] font-medium text-left -mt-1.5 mb-2 px-1">
                  {errors.mobile}
                </p>
              )}

              {/* Username Input */}
              <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center mb-2.5 shadow-xs">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearError('username');
                  }}
                  placeholder="Enter username"
                  className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                />
              </div>
              {errors.username && (
                <p className="text-[#ff4d4f] text-[12px] font-medium text-left -mt-1.5 mb-2 px-1">
                  {errors.username}
                </p>
              )}

              {/* Choose Password */}
              <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center mb-2.5 shadow-xs">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError('password');
                  }}
                  placeholder="Choose your password"
                  className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                />
              </div>
              {errors.password && (
                <p className="text-[#ff4d4f] text-[12px] font-medium text-left -mt-1.5 mb-2 px-1">
                  {errors.password}
                </p>
              )}

              {/* Confirm Password */}
              <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center mb-2.5 shadow-xs">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError('confirmPassword');
                  }}
                  placeholder="Confirm password"
                  className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[#ff4d4f] text-[12px] font-medium text-left -mt-1.5 mb-2 px-1">
                  {errors.confirmPassword}
                </p>
              )}

              {/* Refer Code */}
              <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center mb-2.5 shadow-xs">
                <input
                  type="text"
                  value={referCode}
                  onChange={(e) => setReferCode(e.target.value)}
                  placeholder="Refer code"
                  className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                />
              </div>

              {/* Register Button */}
              <button
                type="submit"
                style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                className="w-full h-[42px] text-black font-extrabold text-[14.5px] rounded-[5px] shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer mb-2.5"
              >
                Register
              </button>

              {/* WhatsApp ID Section */}
              <p className="text-[13px] text-white text-center font-medium mb-1.5">
                Get Your Ready-Made ID From WhatsApp
              </p>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                className="w-full h-[42px] text-black font-black text-[14.5px] uppercase tracking-wider rounded-[5px] shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center mb-2.5"
              >
                WHATSAPP NOW
              </a>

              {/* Log In Link */}
              <div className="text-center text-[13px] text-white font-medium">
                Already have account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrors({});
                  }}
                  className="text-[#ebda8d] font-bold uppercase hover:text-amber-300 cursor-pointer ml-1"
                >
                  LOG IN
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
