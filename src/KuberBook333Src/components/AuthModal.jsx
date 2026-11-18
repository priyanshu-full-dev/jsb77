import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { Demo, login, signUp, forgotPassword, createLoginRecord, getSitesByDomain } from '../../api';
import { loginSuccess } from '../../redux/slices/userSlice';
import { setAccountType } from '../../redux/slices/accountSlice';
import { selectSite } from '../../utils/helper/commonSelectors';

export default function AuthModal({
  authModal,
  type,
  isOpen,
  onClose,
  onLoginSuccess,
}) {
  const dispatch = useDispatch();
  const siteDetails = useSelector(selectSite());
  const activeType = type || authModal || (isOpen ? 'login' : null);

  // 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState(
    typeof activeType === 'string' ? activeType : 'login'
  );

  // Login tabs: 'userId' | 'mobile'
  const [loginTab, setLoginTab] = useState('userId');

  // Form input states
  const [userId, setUserId] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Inline validation errors state
  const [errors, setErrors] = useState({});
  const [apiSiteData, setApiSiteData] = useState(null);
  const [referral, setReferral] = useState('');

  // 1. Referral query & cookie tracking (matching Mahadev)
  useEffect(() => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const ref = queryParams.get('referral');
      if (ref) {
        setReferral(ref);
        document.cookie = `referral=${ref}; path=/`;
      } else {
        const match = document.cookie.match(/(^| )referral=([^;]+)/);
        if (match) {
          setReferral(match[2]);
        }
      }
    } catch (err) {
      console.error('Referral parse error:', err);
    }
  }, []);

  // 2. Fetch site metadata for real database user insertion (createdBy, role, domain, ownerDomainId)
  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const domainName =
          window.location.host.includes('localhost') ||
          window.location.host.includes('127.0.0.1')
            ? 'asianexchange.club'
            : window.location.host;
        const response = await getSitesByDomain(domainName);
        if (response?.data) {
          setApiSiteData(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch site details for AuthModal:', err);
      }
    };
    fetchSiteDetails();
  }, []);

  useEffect(() => {
    if (activeType) {
      setMode(typeof activeType === 'string' ? activeType : 'login');
      setErrors({});
      setIsDemoLoading(false);
      setIsLoginLoading(false);
      setIsRegisterLoading(false);
    }
  }, [activeType]);

  const shouldRender = isOpen !== undefined ? isOpen : !!activeType;
  if (!shouldRender) return null;

  const clearError = (field) => {
    if (errors[field] || errors.general) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        delete next.general;
        return next;
      });
    }
  };

  // ---------------- LOGIN HANDLER (100% SOCKET BASED WITH REST FALLBACK) ----------------
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = {};

    let enteredUser = '';
    if (loginTab === 'userId') {
      if (!userId.trim()) {
        newErrors.userId = 'Please Enter User ID';
      }
      enteredUser = userId.trim();
    } else {
      const cleanMob = mobile.replace(/\D/g, '').slice(-10);
      if (!cleanMob || cleanMob.length < 10) {
        newErrors.mobile = 'Please Enter 10-digit Mobile Number';
      }
      enteredUser = cleanMob;
    }

    if (!password) {
      newErrors.password = 'Password is mandatory';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoginLoading(true);

    try {
      // Direct REST Login (no socket)
      const restRes = await login({
        userName: enteredUser,
        username: enteredUser,
        password: password.trim(),
        x_panel_type: 'user',
      });
      const resData = restRes?.data || restRes;

      if (restRes?.success && (resData?.token || (resData?.success && resData?.userdata?.token) || resData?.userdata)) {
        const token = resData.token || resData.userdata?.token;
        const userdata = resData.user || resData.userdata || { username: enteredUser };
        const formattedUser = {
          ...userdata,
          username: userdata?.username || userdata?.userName || enteredUser,
          balance: userdata?.availableBalance ?? userdata?.balance ?? 0,
          availableBalance: userdata?.availableBalance ?? userdata?.balance ?? 0,
          exposure: userdata?.exposure ?? 0,
          token: token || 'real-token',
          _id: userdata?._id || '',
        };

        if (token) localStorage.setItem('token', token);
        if (userdata?._id) localStorage.setItem('userId', userdata._id);
        if (userdata) localStorage.setItem('userdata', JSON.stringify(userdata));
        localStorage.setItem('kuber_user', JSON.stringify(formattedUser));

        dispatch(loginSuccess({ token, userData: formattedUser, loggedInType: 'real' }));
        dispatch(setAccountType({ userData: formattedUser, type: 'real' }));

        createLoginRecord({ userName: enteredUser }).catch(() => {});

        toast.success(resData?.message || 'Login successful!');
        if (onLoginSuccess) onLoginSuccess(formattedUser);
        onClose();
        return;
      }

      const errMsg = resData?.message || restRes?.data?.message || 'Invalid username or password';
      toast.error(errMsg);
      setErrors({ general: errMsg });
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to login. Please try again.';
      toast.error(errMsg);
      setErrors({ general: errMsg });
    } finally {
      setIsLoginLoading(false);
    }
  };

  // ---------------- DEMO LOGIN HANDLER ----------------
  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      const res = await Demo();
      const demoData = res?.data || res;

      if (demoData && demoData.token) {
        const { token, userdata } = demoData;
        if (token) localStorage.setItem('token', token);
        if (userdata?._id) localStorage.setItem('userId', userdata._id);

        const formattedUser = {
          ...userdata,
          username: 'Demo',
          userName: 'Demo',
          balance: userdata?.availableBalance ?? 2000,
          availableBalance: userdata?.availableBalance ?? 2000,
          exposure: userdata?.exposure ?? 0,
          token,
          _id: userdata?._id,
          isDemo: true,
        };

        localStorage.setItem('kuber_user', JSON.stringify(formattedUser));

        dispatch(loginSuccess({ userData: formattedUser, loggedInType: 'demo', token }));
        dispatch(setAccountType({ userData: formattedUser, type: 'demo' }));

        toast.success('Demo account created successfully!');
        if (onLoginSuccess) onLoginSuccess(formattedUser);
        onClose();
        return;
      }
    } catch (err) {
      console.warn('Demo API fallback:', err);
    } finally {
      setIsDemoLoading(false);
    }

    // Local fallback for demo if API unreachable
    const fallbackToken = 'demo-token-' + Date.now();
    const fallbackDemo = {
      username: 'Demo',
      userName: 'Demo',
      balance: 10000,
      availableBalance: 10000,
      exposure: 0,
      isDemo: true,
      token: fallbackToken,
      _id: 'demo_guest',
    };
    localStorage.setItem('token', fallbackToken);
    localStorage.setItem('userId', fallbackDemo._id);
    localStorage.setItem('kuber_user', JSON.stringify(fallbackDemo));
    dispatch(loginSuccess({ userData: fallbackDemo, loggedInType: 'demo', token: fallbackToken }));
    dispatch(setAccountType({ userData: fallbackDemo, type: 'demo' }));
    toast.success('Demo account created successfully!');
    if (onLoginSuccess) onLoginSuccess(fallbackDemo);
    onClose();
  };

  // ---------------- REGISTRATION / SIGN UP HANDLER (NO OTP - EXACT MAHADEV FLOW) ----------------
  const handleRegisterSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = {};

    const cleanPhone = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) newErrors.mobile = 'Please Enter a valid 10-digit Mobile Number';
    if (!username.trim()) newErrors.username = 'Please Enter Username';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm Password is mandatory';
    if (password && confirmPassword && password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsRegisterLoading(true);
    try {
      let cachedSite = null;
      try {
        cachedSite = JSON.parse(localStorage.getItem('siteDetails') || '{}');
      } catch {
        cachedSite = {};
      }

      const createdById =
        apiSiteData?.createdBy?._id ||
        apiSiteData?.siteDetails?.createrId ||
        siteDetails?.createdBy?._id ||
        siteDetails?.createrId ||
        siteDetails?.siteDetails?.createrId ||
        cachedSite?.createdBy?._id ||
        cachedSite?.createrId ||
        '6a8d85907a10e78fbbcd5cee';

      const roleId =
        apiSiteData?.userRoleId ||
        siteDetails?.userRoleId ||
        siteDetails?.siteDetails?.userRoleId ||
        cachedSite?.userRoleId ||
        '6a8553b2e180c5acfc1e3fc3';

      const domainId =
        apiSiteData?.siteDetails?.domainDetails?._id ||
        apiSiteData?.domainDetails?._id ||
        siteDetails?.domainDetails?._id ||
        siteDetails?.siteDetails?.domainDetails?._id ||
        cachedSite?.domainDetails?._id ||
        '6a85553b526a2dbeb187f070';

      const ownerDomainId =
        apiSiteData?.siteDetails?.admindomainName?._id ||
        apiSiteData?.admindomainName?._id ||
        siteDetails?.admindomainName?._id ||
        siteDetails?.siteDetails?.admindomainName?._id ||
        cachedSite?.admindomainName?._id ||
        '6a85553b526a2dbeb187f071';

      const siteId =
        apiSiteData?.siteDetails?._id ||
        apiSiteData?._id ||
        siteDetails?.siteDetails?._id ||
        siteDetails?._id ||
        cachedSite?.siteDetails?._id ||
        cachedSite?._id ||
        '6a859c4209b8c3333c187921';

      // Build full database payload matching Mahadev's exact structure
      const payload = {
        mobile: cleanPhone,
        phone: cleanPhone,
        userName: cleanPhone, // Backend expects 10-digit mobile number as userName
        name: cleanPhone,     // Backend expects 10-digit mobile number as name
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
        otp: '',
        x_panel_type: 'user',
        commission: 0,
        openingBalance: 0,
        availableBalance: 0,
        creditReference: 0,
        partnership: 0,
        currency: 'INR',
        exposureLimit: 200000,
        exposure: 0,
        createdBy: createdById,
        referredBy: referralCode.trim() || referral || '',
        deviceIp: '0.0.0',
        role: roleId,
        domain: domainId,
        ownerDomainId: ownerDomainId || domainId,
        siteID: siteId,
        isSignupUser: true,
        layout: apiSiteData?.siteDetails?.layout || siteDetails?.layout || 'asianexchange',
      };

      console.log('KuberBook333 Signup Payload before sending:', payload);

      const response = await signUp(payload);
      console.log('KuberBook333 Signup Response:', response);

      if (
        response?.data?.message === 'User created successfully' ||
        response?.data?.success ||
        response?.success
      ) {
        toast.success(response?.data?.message || 'Registration Successful!');

        // 1. Direct auto-login if token is in signup response
        const directToken = response?.data?.token || response?.token || response?.data?.userdata?.token;
        const directUser = response?.data?.userdata || response?.userdata || response?.data?.user;
        if (directToken && directUser) {
          if (directToken) localStorage.setItem('token', directToken);
          if (directUser?._id) localStorage.setItem('userId', directUser._id);
          const formattedUser = {
            ...directUser,
            username: directUser.username || directUser.userName || cleanPhone,
            balance: directUser.availableBalance ?? 0,
            availableBalance: directUser.availableBalance ?? 0,
            exposure: directUser.exposure ?? 0,
            token: directToken,
            _id: directUser._id,
          };
          localStorage.setItem('kuber_user', JSON.stringify(formattedUser));

          dispatch(
            loginSuccess({
              token: directToken,
              userData: formattedUser,
              loggedInType: 'real',
            })
          );
          dispatch(
            setAccountType({
              userData: formattedUser,
              type: 'real',
            })
          );

          createLoginRecord({ userName: cleanPhone }).catch(() => {});
          if (onLoginSuccess) onLoginSuccess(formattedUser);
          onClose();
          return;
        }

        // 2. Direct REST auto-login with cleanPhone (no socket)
        try {
          const loginPayload = {
            userName: cleanPhone,
            username: cleanPhone,
            password: password.trim(),
            x_panel_type: 'user',
          };

          const loginRes = await login(loginPayload);

          const loginData = loginRes?.data || loginRes;
          if (loginData?.token || loginData?.userdata?.token || loginRes?.success) {
            const token = loginData.token || loginData.userdata?.token || loginRes?.token;
            const userdata = loginData.user || loginData.userdata || loginRes?.userdata || { username: cleanPhone };
            const formattedUser = {
              ...userdata,
              username: userdata.username || userdata.userName || cleanPhone,
              balance: userdata.availableBalance ?? 0,
              availableBalance: userdata.availableBalance ?? 0,
              exposure: userdata.exposure ?? 0,
              token: token,
              _id: userdata._id || '',
            };

            if (token) localStorage.setItem('token', token);
            if (userdata?._id) localStorage.setItem('userId', userdata._id);
            localStorage.setItem('kuber_user', JSON.stringify(formattedUser));

            dispatch(
              loginSuccess({
                token: token,
                userData: formattedUser,
                loggedInType: 'real',
              })
            );
            dispatch(
              setAccountType({
                userData: formattedUser,
                type: 'real',
              })
            );

            createLoginRecord({ userName: cleanPhone }).catch(() => {});
            if (onLoginSuccess) onLoginSuccess(formattedUser);
            onClose();
            return;
          }
        } catch (err) {
          console.error('Auto login error after signup:', err);
        }

        // Fallback: switch to login tab with phone populated
        setMode('login');
        setLoginTab('mobile');
        setMobile(cleanPhone);
        setUserId(cleanPhone);
        setErrors({});
      } else {
        const errorMsg =
          response?.data?.message ||
          response?.message ||
          'Registration failed. Please check your details.';
        setErrors({ general: errorMsg });
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setErrors({ general: errMsg });
      toast.error(errMsg);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD HANDLER ----------------
  const handleForgotSubmit = async (e) => {
    e?.preventDefault();
    const cleanPhone = mobile.replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrors({ mobile: 'Please Enter 10-digit Mobile Number' });
      return;
    }

    try {
      const res = await forgotPassword({ phone: cleanPhone });
      toast.success(res?.data?.message || 'Instructions sent to your mobile.');
      setMode('login');
      setErrors({});
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to process request.';
      toast.error(errMsg);
      setErrors({ general: errMsg });
    }
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
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value.replace(/\D/g, ''));
                        clearError('mobile');
                      }}
                      placeholder="Enter Mobile Number (10 digits)*"
                      className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none px-1"
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-[#ff4d4f] text-[12px] font-medium text-left mt-1 px-1">
                      {errors.mobile}
                    </p>
                  )}
                </div>
              )}

              {/* Password Input */}
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

              {/* General Error Banner */}
              {errors.general && (
                <div className="w-full bg-red-950/80 border border-red-500/80 text-red-200 text-[12px] font-semibold px-2.5 py-1.5 rounded-[5px] mb-2.5 text-center">
                  {errors.general}
                </div>
              )}

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
                  disabled={isLoginLoading}
                  style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                  className="flex-1 h-[42px] text-black font-bold text-[14px] rounded-[5px] shadow-sm hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center"
                >
                  {isLoginLoading ? (
                    <div className="w-5 h-5 border-[2.5px] border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Log In'
                  )}
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
              {/* General Error Banner */}
              {errors.general && (
                <div className="w-full bg-red-950/80 border border-red-500/80 text-red-200 text-[12px] font-semibold px-2.5 py-1.5 rounded-[5px] mb-2.5 text-center">
                  {errors.general}
                </div>
              )}

              {/* Mobile Number */}
              <div className="mb-2.5">
                <div className="w-full h-[42px] bg-white rounded-[5px] px-2.5 flex items-center gap-2 shadow-xs">
                  <div className="flex items-center gap-1 shrink-0 text-gray-900 font-bold text-[13px] border-r border-gray-300 pr-2 mr-1">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span>{countryCode}</span>
                    <span className="text-[9px] text-gray-700 ml-0.5">▼</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, ''));
                      clearError('mobile');
                    }}
                    placeholder="Enter Mobile Number (10 digits)*"
                    className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none px-1"
                  />
                </div>
                {errors.mobile && (
                  <p className="text-[#ff4d4f] text-[12px] font-medium text-left mt-1 px-1">
                    {errors.mobile}
                  </p>
                )}
              </div>

              {/* RESET PASSWORD Button */}
              <button
                type="submit"
                style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                className="w-full h-[42px] text-white font-extrabold text-[15px] uppercase tracking-wide rounded-[5px] shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer mb-3"
              >
                RESET PASSWORD
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

        {/* -------------------- 3. REGISTER VIEW (NO OTP - EXACT MAHADEV FLOW) -------------------- */}
        {mode === 'register' && (
          <div>
            <form onSubmit={handleRegisterSubmit} noValidate>
              {/* General Error Banner */}
              {errors.general && (
                <div className="w-full bg-red-950/80 border border-red-500/80 text-red-200 text-[12px] font-semibold px-2.5 py-1.5 rounded-[5px] mb-2.5 text-center">
                  {errors.general}
                </div>
              )}

              {/* Phone Number Field */}
              <div className="w-full h-[42px] bg-white rounded-[5px] px-2.5 flex items-center gap-2 mb-2.5 shadow-xs">
                <div className="flex items-center gap-1 shrink-0 text-gray-900 font-bold text-[13px] border-r border-gray-300 pr-2 mr-1">
                  <span className="text-base leading-none">🇮🇳</span>
                  <span>{countryCode}</span>
                  <span className="text-[9px] text-gray-700 ml-0.5">▼</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, ''));
                    clearError('mobile');
                  }}
                  placeholder="Enter Phone Number (10 digits)*"
                  className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none px-1"
                />
                <span className="text-[11px] font-bold text-[#b6842d] pr-1 select-none">
                  {mobile.replace(/\D/g, '').length}/10
                </span>
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
                  placeholder="Enter username*"
                  className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                />
              </div>
              {errors.username && (
                <p className="text-[#ff4d4f] text-[12px] font-medium text-left -mt-1.5 mb-2 px-1">
                  {errors.username}
                </p>
              )}

              {/* Choose Password */}
              <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center justify-between mb-2.5 shadow-xs">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError('password');
                  }}
                  placeholder="Choose your password*"
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
                <p className="text-[#ff4d4f] text-[12px] font-medium text-left -mt-1.5 mb-2 px-1">
                  {errors.password}
                </p>
              )}

              {/* Confirm Password */}
              <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center justify-between mb-2.5 shadow-xs">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError('confirmPassword');
                  }}
                  placeholder="Confirm password*"
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
                <p className="text-[#ff4d4f] text-[12px] font-medium text-left -mt-1.5 mb-2 px-1">
                  {errors.confirmPassword}
                </p>
              )}

              {/* Refer Code */}
              <div className="w-full h-[42px] bg-white rounded-[5px] px-3 flex items-center mb-2.5 shadow-xs">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Refer code (Optional)"
                  className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 font-medium focus:outline-none"
                />
              </div>

              {/* Terms Note */}
              <p className="text-white/80 text-[10.5px] leading-tight mb-2.5 px-1">
                By clicking 'Register', you confirm that you are of legal age (18+) and accept our terms and conditions.
              </p>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isRegisterLoading}
                style={{ background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)' }}
                className="w-full h-[42px] text-black font-extrabold text-[14.5px] rounded-[5px] shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer mb-2.5 flex items-center justify-center"
              >
                {isRegisterLoading ? (
                  <div className="w-5 h-5 border-[2.5px] border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Register'
                )}
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
