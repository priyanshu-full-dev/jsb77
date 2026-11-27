import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaChevronLeft, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  login,
  signUp,
  SendOtp,
  forgotPassword,
  resetPassword,
  createLoginRecord,
  getSitesByDomain,
} from "../../../api";
import { loginSuccess } from "../../../redux/slices/userSlice";
import { setAccountType } from "../../../redux/slices/accountSlice";
import { setSiteDetails } from "../../../redux/slices/siteSlice";
import { selectSite } from "../../../utils/helper/commonSelectors";
import { useLanguage } from "../../context/LanguageContext";

export const LoginPage = ({ initialMode = "login", onBack, onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const siteDetails = useSelector(selectSite());
  const { t } = useLanguage();

  const isRegisterRoute =
    location.pathname.includes("register") || initialMode === "register";
  const isForgotRoute =
    location.pathname.includes("forgot") || initialMode === "forgot";
  const [mode, setMode] = useState(
    isForgotRoute ? "forgot" : isRegisterRoute ? "register" : "login"
  );

  // Form states
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [referralParam, setReferralParam] = useState("");
  const [remember, setRemember] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot Password states
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotOtpSending, setForgotOtpSending] = useState(false);
  const [forgotOtpCountdown, setForgotOtpCountdown] = useState(0);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiSiteData, setApiSiteData] = useState(null);

  // 1. Fetch domain/site details on mount (prerequisite for signup / login)
  useEffect(() => {
    const fetchSite = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const domainFromUrl = urlParams.get("domain");
        const envDomain = import.meta.env.VITE_SITE_DOMAIN;

        const domainName =
          domainFromUrl ||
          envDomain ||
          (window.location.host.includes("localhost") ||
          window.location.host.includes("127.0.0.1") ||
          window.location.host.includes("vercel.app")
            ? "jsb77.com"
            : window.location.host);

        const res = await getSitesByDomain(domainName);
        if (res?.data) {
          setApiSiteData(res.data);
          const raw = res.data;
          const normalized = raw?.siteDetails
            ? {
                ...raw.siteDetails,
                createdBy: raw.createdBy || raw.siteDetails?.createdBy,
                userRoleId: raw.userRoleId || raw.siteDetails?.userRoleId,
                domainDetails:
                  raw.siteDetails?.domainDetails || raw.domainDetails,
                admindomainName:
                  raw.siteDetails?.admindomainName || raw.admindomainName,
              }
            : raw;

          dispatch(setSiteDetails(normalized));
          localStorage.setItem("siteDetails", JSON.stringify(normalized));
        }
      } catch (err) {
        console.error("Site details fetch error:", err);
      }
    };
    fetchSite();
  }, [dispatch]);

  // 2. Parse referral query param or cookie
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("referral");
      if (ref) {
        setReferralParam(ref);
        setInviteCode(ref);
        document.cookie = `referral=${ref}; path=/`;
      } else {
        const match = document.cookie.match(/(^| )referral=([^;]+)/);
        if (match) {
          setReferralParam(match[2]);
          setInviteCode(match[2]);
        }
      }
    } catch (err) {
      console.error("Referral parse error:", err);
    }
  }, []);

  // 3. Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // 4. Countdown timer for Forgot Password OTP
  useEffect(() => {
    let timer;
    if (forgotOtpCountdown > 0) {
      timer = setInterval(() => {
        setForgotOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotOtpCountdown]);

  // Handle Send OTP
  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number first");
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setError("");
    setOtpSending(true);

    try {
      const res = await SendOtp({ mobile: cleanPhone });
      const resData = res?.data || res;
      if (res?.success && (resData?.success !== false)) {
        toast.success(resData?.message || "OTP sent successfully to your mobile!");
        setOtpCountdown(60);
      } else {
        const errorMsg = resData?.message || "Failed to send OTP. Please check your number.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.warn("Send OTP error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setOtpSending(false);
    }
  };

  // Clear errors on mode switch
  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setError("");
  };

  const handleBack = () => {
    if (mode === "forgot") {
      handleSwitchMode("login");
      return;
    }
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // =========================================================
  // FORGOT PASSWORD HANDLERS
  // =========================================================
  const handleForgotSendOtp = async () => {
    const cleanPhone = forgotPhone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number first");
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setError("");
    setForgotOtpSending(true);

    try {
      const domainId =
        apiSiteData?.siteDetails?.domainDetails?._id ||
        apiSiteData?.domainDetails?._id ||
        siteDetails?.domainDetails?._id ||
        siteDetails?.domain ||
        "6a85553b526a2dbeb187f070";

      const res = await forgotPassword({
        mobile: cleanPhone,
        domain: domainId,
      });

      const resData = res?.data || res;
      if (res?.success && resData?.success !== false) {
        toast.success(resData?.message || "OTP has been sent to your mobile!");
        setForgotOtpCountdown(60);
      } else {
        const errorMsg =
          resData?.message ||
          "User not found or failed to send OTP. Please check your number.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.warn("Forgot Password Send OTP error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setForgotOtpSending(false);
    }
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = forgotPhone.replace(/\D/g, "").slice(-10);

    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (!forgotOtp.trim()) {
      setError("SMS verification code is required");
      return;
    }
    if (!forgotNewPassword.trim()) {
      setError("Please enter a new password");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError("");
    setForgotLoading(true);

    try {
      const domainId =
        apiSiteData?.siteDetails?.domainDetails?._id ||
        apiSiteData?.domainDetails?._id ||
        siteDetails?.domainDetails?._id ||
        siteDetails?.domain ||
        "6a85553b526a2dbeb187f070";

      const res = await resetPassword({
        mobile: cleanPhone,
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword.trim(),
        domain: domainId,
      });

      const resData = res?.data || res;

      if (res?.success && resData?.success !== false) {
        toast.success(
          resData?.message || "Password reset successfully! Please login."
        );
        setUsername(cleanPhone);
        handleSwitchMode("login");
      } else {
        const errorMsg =
          resData?.message || "Failed to reset password. Please check the OTP.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.warn("Reset Password error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  // =========================================================
  // LOGIN SUBMIT HANDLER (REST API - bina socket)
  // =========================================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username is mandatory");
      return;
    }
    if (!password.trim()) {
      setError("Password is mandatory");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (apiSiteData) {
        const raw = apiSiteData;
        const normalized = raw?.siteDetails
          ? {
              ...raw.siteDetails,
              createdBy: raw.createdBy || raw.siteDetails?.createdBy,
              userRoleId: raw.userRoleId || raw.siteDetails?.userRoleId,
              domainDetails:
                raw.siteDetails?.domainDetails || raw.domainDetails,
              admindomainName:
                raw.siteDetails?.admindomainName || raw.admindomainName,
            }
          : raw;
        dispatch(setSiteDetails(normalized));
        localStorage.setItem("siteDetails", JSON.stringify(normalized));
      }

      const payload = {
        userName: username.trim(),
        password: password,
        x_panel_type: "user",
      };

      const res = await login(payload);
      const resData = res?.data || res;

      if (res?.success && (resData?.token || resData?.success)) {
        const token = resData?.token || resData?.userdata?.token;
        const userdata = resData?.userdata || resData?.user || {
          userName: username.trim(),
          name: username.trim(),
        };

        if (token) localStorage.setItem("token", token);
        if (userdata?._id) localStorage.setItem("userId", userdata._id);
        if (userdata) localStorage.setItem("userdata", JSON.stringify(userdata));

        const avail = Number(userdata?.availableBalance ?? 0);
        const expo = Number(userdata?.exposure ?? 0);
        const net = Math.max(0, avail - expo).toFixed(2);

        const userObj = {
          ...userdata,
          username: userdata?.userName || userdata?.name || username.trim(),
          balance: net,
          availableBalance: avail,
          exposure: expo,
        };
        localStorage.setItem("npr_user", JSON.stringify(userObj));

        dispatch(
          loginSuccess({
            token: token,
            userData: userdata,
            loggedInType: "real",
          })
        );
        dispatch(
          setAccountType({
            userData: userdata,
            type: "real",
          })
        );

        createLoginRecord({ userName: username.trim() }).catch(() => {});
        toast.success(resData?.message || "Login successful!");

        if (onLoginSuccess) {
          onLoginSuccess(userObj);
        }

        if (onBack) {
          onBack();
        } else {
          navigate("/");
        }
        return;
      }

      const errMsg =
        resData?.message ||
        res?.data?.message ||
        "Invalid username or password";
      setError(errMsg);
      toast.error(errMsg);
    } catch (err) {
      console.error("Login API error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REGISTER SUBMIT HANDLER (REST API - bina socket)
  // =========================================================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    if (!username.trim()) {
      setError("Username is mandatory");
      return;
    }
    if (!password.trim()) {
      setError("Password is mandatory");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!confirmPassword.trim()) {
      setError("Confirm Password is mandatory");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!otp.trim()) {
      setError("OTP is mandatory");
      return;
    }
    if (!agreeTerms) {
      setError("Please accept the terms and conditions to proceed");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Resolve domain & creator details
      let cachedSite = null;
      try {
        cachedSite = JSON.parse(localStorage.getItem("siteDetails") || "{}");
      } catch {
        cachedSite = {};
      }

      const domainDetails =
        apiSiteData?.domainDetails ||
        apiSiteData?.siteDetails?.domainDetails ||
        siteDetails?.domainDetails ||
        siteDetails?.siteDetails?.domainDetails ||
        cachedSite?.domainDetails;

      const admindomainName =
        apiSiteData?.admindomainName ||
        apiSiteData?.siteDetails?.admindomainName ||
        siteDetails?.admindomainName ||
        siteDetails?.siteDetails?.admindomainName ||
        cachedSite?.admindomainName;

      const domainId =
        domainDetails?._id ||
        siteDetails?.domain ||
        cachedSite?.domain ||
        "6a85553b526a2dbeb187f070";

      const ownerDomainId =
        admindomainName?._id ||
        siteDetails?.ownerDomainId ||
        cachedSite?.ownerDomainId ||
        "6a85553b526a2dbeb187f071";

      const roleId =
        apiSiteData?.userRoleId ||
        siteDetails?.userRoleId ||
        siteDetails?.siteDetails?.userRoleId ||
        cachedSite?.userRoleId ||
        "6a8553b2e180c5acfc1e3fc3";

      const createdById =
        apiSiteData?.createdBy?._id ||
        apiSiteData?.siteDetails?.createrId ||
        siteDetails?.createdBy?._id ||
        siteDetails?.createrId ||
        siteDetails?.siteDetails?.createrId ||
        cachedSite?.createdBy?._id ||
        cachedSite?.createrId ||
        "6a8d85907a10e78fbbcd5cee";

      const siteId =
        apiSiteData?.siteDetails?._id ||
        apiSiteData?._id ||
        siteDetails?.siteDetails?._id ||
        siteDetails?._id ||
        cachedSite?.siteDetails?._id ||
        cachedSite?._id ||
        "6a859c4209b8c3333c187921";

      const referralKey = inviteCode.trim() || referralParam || "";

      // 2. Build Registration Payload matching AuraExchange / Professor platform format
      const payload = {
        mobile: cleanPhone,
        userName: username.trim() || cleanPhone,
        name: username.trim() || cleanPhone,
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
        otp: otp.trim() || "1234",
        x_panel_type: "user",
        role: roleId,
        domain: domainId,
        ownerDomainId: ownerDomainId || domainId,
        createdBy: createdById,
        siteID: siteId,
        currency: "INR",
        referralKey: referralKey,
        commission: 0,
        openingBalance: 0,
        availableBalance: 0,
        creditReference: 0,
        partnership: 0,
        exposureLimit: 0,
        exposure: 0,
        deviceIp: "0.0.0",
        isSignupUser: true,
        layout: "auraexchange",
      };

      console.log("Signup Payload before sending:", payload);

      const res = await signUp(payload);
      const resData = res?.data || res;

      if (
        res?.success ||
        resData?.message === "User created successfully" ||
        resData?.success
      ) {
        toast.success(resData?.message || "User created successfully!");

        // 1. Direct auto-login if token is already in response
        const directToken = resData?.token || resData?.data?.token;
        const directUser = resData?.userdata || resData?.data?.userdata;

        if (directToken && directUser) {
          if (directToken) localStorage.setItem("token", directToken);
          if (directUser?._id) localStorage.setItem("userId", directUser._id);
          localStorage.setItem("userdata", JSON.stringify(directUser));

          const avail = Number(directUser?.availableBalance ?? 0);
          const expo = Number(directUser?.exposure ?? 0);
          const net = Math.max(0, avail - expo).toFixed(2);

          const userObj = {
            ...directUser,
            username: directUser.userName || directUser.name || username.trim(),
            balance: net,
            availableBalance: avail,
            exposure: expo,
          };
          localStorage.setItem("npr_user", JSON.stringify(userObj));

          dispatch(
            loginSuccess({
              token: directToken,
              userData: directUser,
              loggedInType: "real",
            })
          );
          dispatch(
            setAccountType({
              userData: directUser,
              type: "real",
            })
          );

          createLoginRecord({ userName: cleanPhone }).catch(() => {});

          if (onLoginSuccess) onLoginSuccess(userObj);
          if (onBack) onBack();
          else navigate("/");
          return;
        }

        // 2. Auto-login via REST Login API (no socket)
        try {
          const loginPayload = {
            userName: username.trim() || cleanPhone,
            password: password.trim(),
            x_panel_type: "user",
          };
          const loginRes = await login(loginPayload);
          const loginData = loginRes?.data || loginRes;

          if (loginRes?.success && (loginData?.token || loginData?.success)) {
            const token = loginData?.token || loginData?.userdata?.token;
            const userdata = loginData?.userdata || loginData?.user || {
              userName: username.trim() || cleanPhone,
            };

            if (token) localStorage.setItem("token", token);
            if (userdata?._id) localStorage.setItem("userId", userdata._id);
            localStorage.setItem("userdata", JSON.stringify(userdata));

            const avail = Number(userdata?.availableBalance ?? 0);
            const expo = Number(userdata?.exposure ?? 0);
            const net = Math.max(0, avail - expo).toFixed(2);

            const userObj = {
              ...userdata,
              username: userdata.userName || userdata.name || username.trim(),
              balance: net,
              availableBalance: avail,
              exposure: expo,
            };
            localStorage.setItem("npr_user", JSON.stringify(userObj));

            dispatch(
              loginSuccess({
                token: token,
                userData: userdata,
                loggedInType: "real",
              })
            );
            dispatch(
              setAccountType({
                userData: userdata,
                type: "real",
              })
            );

            createLoginRecord({ userName: cleanPhone }).catch(() => {});

            if (onLoginSuccess) onLoginSuccess(userObj);
            if (onBack) onBack();
            else navigate("/");
            return;
          }
        } catch (loginErr) {
          console.warn("Auto-login error after signup:", loginErr);
        }

        // Switch to login tab if auto-login didn't succeed immediately
        setMode("login");
        toast.info("Account created! Please log in.");
        return;
      }

      const errMsg =
        resData?.message ||
        res?.data?.message ||
        "Registration failed. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } catch (err) {
      console.error("Signup API error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0045b8] text-white flex flex-col justify-start px-4 pt-6 pb-12 select-none max-w-md mx-auto relative shadow-2xl">
      {/* 1. Top Bar: White Back Chevron */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-start text-white hover:opacity-80 active:scale-90 transition focus:outline-none cursor-pointer"
          title="Back"
          aria-label="Back"
        >
          <FaChevronLeft size={22} className="text-white drop-shadow-xs" />
        </button>
      </div>

      {/* 2. Official JSB77 Logo Centered */}
      <div className="flex justify-center items-center mb-6">
        <img
          src="/npr/jsb77_logo_white.png"
          alt="JSB77 Online Betting"
          className="h-14 sm:h-16 w-auto object-contain pointer-events-none drop-shadow-sm"
          draggable={false}
        />
      </div>

      {/* 3. White Form Card */}
      <div className="w-full bg-white text-gray-900 rounded-[22px] px-6 sm:px-7 pt-7 pb-6 shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
        {/* Card Title */}
        <h2 className="text-center text-[#0045b8] text-[22px] font-bold tracking-tight mb-4">
          {mode === "login"
            ? t("Login")
            : mode === "register"
            ? t("Register")
            : t("Forgot password")}
        </h2>

        {/* Error Banner */}
        {error && (
          <div className="w-full mb-4 px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[13px] leading-snug font-medium text-center animate-fadeIn">
            {error}
          </div>
        )}

        {/* =======================
            LOGIN FORM (bina socket)
           ======================= */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="w-full flex flex-col">
            {/* Username */}
            <input
              type="text"
              required
              placeholder={t("Username")}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] mb-4 transition font-normal"
              autoCapitalize="none"
              disabled={loading}
            />

            {/* Password with Eye Toggle */}
            <div className="relative flex items-center mb-4 w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={t("Password")}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] pl-4 pr-11 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] transition font-normal"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 h-full flex items-center justify-center text-[#0045b8] hover:opacity-80 transition cursor-pointer select-none focus:outline-none focus:ring-0 outline-none"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  /* Open Blue Eye */
                  <svg viewBox="0 0 24 16" className="w-[20px] h-[14px] text-[#0045b8]" fill="none">
                    <path
                      d="M12 1.5C5.6 1.5 1 8 1 8s4.6 6.5 11 6.5S23 8 23 8s-4.6-6.5-11-6.5z"
                      fill="currentColor"
                    />
                    <circle cx="12" cy="8" r="4.5" fill="#ffffff" />
                    <circle cx="12" cy="8" r="2.4" fill="currentColor" />
                  </svg>
                ) : (
                  /* Closed Eyelashes */
                  <svg viewBox="0 0 22 15" className="w-[18px] h-[13px] text-[#0045b8]" fill="none">
                    <path
                      d="M 2 3.5 C 4 8.5, 8 10.5, 11 10.5 C 14 10.5, 18 8.5, 20 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line x1="3.8" y1="6.5" x2="1.8" y2="9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="7.2" y1="9.2" x2="5.5" y2="12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="11" y1="10.5" x2="11" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="14.8" y1="9.2" x2="16.5" y2="12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="18.2" y1="6.5" x2="20.2" y2="9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember Checkbox */}
            <div className="flex items-center gap-2 mb-5 select-none">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition cursor-pointer ${
                  remember
                    ? "bg-[#0045b8] border-[#0045b8]"
                    : "bg-white border-gray-400"
                }`}
                title="Remember Me"
              >
                {remember && <FaCheck size={11} className="text-white" />}
              </button>
              <span
                onClick={() => setRemember(!remember)}
                className="text-[#0045b8] text-[14px] font-bold cursor-pointer"
              >
                {t("Remember")}
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] rounded-lg bg-gradient-to-b from-[#1872f2] via-[#0356e0] to-[#062d75] border border-[#389aff]/40 text-white text-[16px] font-bold shadow-[0_4px_12px_rgba(6,45,117,0.35)] hover:brightness-105 active:scale-[0.98] transition mb-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("Logging in...") : t("Login")}
            </button>

            {/* Bottom Links (Register & Forgot password?) */}
            <div className="w-full flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleSwitchMode("register")}
                className="text-[#0045b8] text-[14px] font-bold underline hover:opacity-80 transition cursor-pointer"
              >
                {t("Register")}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode("forgot")}
                className="text-[#0045b8] text-[14px] font-bold underline hover:opacity-80 transition cursor-pointer"
              >
                {t("Forgot password?")}
              </button>
            </div>
          </form>
        ) : mode === "register" ? (
          /* =======================
             REGISTER FORM (bina socket)
             ======================= */
          <form onSubmit={handleRegisterSubmit} className="w-full flex flex-col">
            {/* 1. Username */}
            <input
              type="text"
              required
              placeholder={t("Username")}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] mb-4 transition font-normal"
              autoCapitalize="none"
              disabled={loading}
            />

            {/* 2. Password with Eye Toggle */}
            <div className="relative flex items-center mb-4 w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={t("Password (minimum 6 characters)")}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] pl-4 pr-11 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] transition font-normal"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 h-full flex items-center justify-center text-[#0045b8] hover:opacity-80 transition cursor-pointer select-none focus:outline-none focus:ring-0 outline-none"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 16" className="w-[20px] h-[14px] text-[#0045b8]" fill="none">
                    <path
                      d="M12 1.5C5.6 1.5 1 8 1 8s4.6 6.5 11 6.5S23 8 23 8s-4.6-6.5-11-6.5z"
                      fill="currentColor"
                    />
                    <circle cx="12" cy="8" r="4.5" fill="#ffffff" />
                    <circle cx="12" cy="8" r="2.4" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 22 15" className="w-[18px] h-[13px] text-[#0045b8]" fill="none">
                    <path
                      d="M 2 3.5 C 4 8.5, 8 10.5, 11 10.5 C 14 10.5, 18 8.5, 20 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line x1="3.8" y1="6.5" x2="1.8" y2="9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="7.2" y1="9.2" x2="5.5" y2="12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="11" y1="10.5" x2="11" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="14.8" y1="9.2" x2="16.5" y2="12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="18.2" y1="6.5" x2="20.2" y2="9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>

            {/* 3. Confirm password with Eye Toggle */}
            <div className="relative flex items-center mb-4 w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder={t("Confirm password")}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] pl-4 pr-11 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] transition font-normal"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 h-full flex items-center justify-center text-[#0045b8] hover:opacity-80 transition cursor-pointer select-none focus:outline-none focus:ring-0 outline-none"
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 16" className="w-[20px] h-[14px] text-[#0045b8]" fill="none">
                    <path
                      d="M12 1.5C5.6 1.5 1 8 1 8s4.6 6.5 11 6.5S23 8 23 8s-4.6-6.5-11-6.5z"
                      fill="currentColor"
                    />
                    <circle cx="12" cy="8" r="4.5" fill="#ffffff" />
                    <circle cx="12" cy="8" r="2.4" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 22 15" className="w-[18px] h-[13px] text-[#0045b8]" fill="none">
                    <path
                      d="M 2 3.5 C 4 8.5, 8 10.5, 11 10.5 C 14 10.5, 18 8.5, 20 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line x1="3.8" y1="6.5" x2="1.8" y2="9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="7.2" y1="9.2" x2="5.5" y2="12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="11" y1="10.5" x2="11" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="14.8" y1="9.2" x2="16.5" y2="12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="18.2" y1="6.5" x2="20.2" y2="9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>

            {/* 4. Phone Row: [🇳🇵 +977] [10 digit phone number] */}
            <div className="flex items-center gap-3 w-full mb-4">
              {/* Left country code badge */}
              <div className="flex items-center justify-center gap-2 h-[46px] w-[105px] sm:w-[115px] bg-[#e8e8e8] rounded-lg select-none px-2.5 shrink-0">
                <img
                  src="/npr/lan/NP.svg"
                  alt="Nepal"
                  className="w-5 h-5 rounded-full object-cover shrink-0 shadow-xs"
                />
                <span className="text-[#0045b8] font-bold text-[15px] tracking-tight">
                  +977
                </span>
              </div>

              {/* Right phone input */}
              <input
                type="tel"
                required
                maxLength={10}
                placeholder={t("10 digit phone number")}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (error) setError("");
                }}
                className="flex-1 h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] font-normal"
                disabled={loading}
              />
            </div>

            {/* 5. OTP Row: [ OTP Input ] [ Send OTP Button ] */}
            <div className="flex items-center gap-2.5 w-full mb-4">
              <input
                type="text"
                required
                maxLength={6}
                placeholder={t("Enter OTP")}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (error) setError("");
                }}
                className="flex-1 h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] font-normal"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSending || otpCountdown > 0 || loading}
                className="h-[46px] px-3.5 rounded-lg bg-gradient-to-b from-[#1872f2] via-[#0356e0] to-[#062d75] border border-[#389aff]/40 text-white text-[13px] font-bold shadow-[0_2px_8px_rgba(6,45,117,0.25)] hover:brightness-105 active:scale-95 transition whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none flex items-center justify-center min-w-[95px]"
              >
                {otpSending
                  ? t("Sending...")
                  : otpCountdown > 0
                  ? `${otpCountdown}s`
                  : t("Send OTP")}
              </button>
            </div>

            {/* 6. Invitation code */}
            <input
              type="text"
              placeholder={t("Invitation code (optional)", "निमन्त्रणा कोड (ऐच्छिक)")}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] mb-5 transition font-normal"
              disabled={loading}
            />

            {/* 7. Terms Checkbox */}
            <div className="flex items-start gap-2.5 mb-6 select-none">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className={`w-[19px] h-[19px] min-w-[19px] rounded-[4px] border flex items-center justify-center transition cursor-pointer mt-0.5 ${
                  agreeTerms
                    ? "bg-[#0045b8] border-[#0045b8]"
                    : "bg-white border-gray-400"
                }`}
                title="Agree to Terms"
              >
                {agreeTerms && <FaCheck size={11} className="text-white" />}
              </button>
              <span
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="text-[#0045b8] text-[13px] sm:text-[13.5px] font-semibold leading-snug cursor-pointer"
              >
                {t(
                  "I am 18 years old and agree to the terms & conditions of JILIEVO.CLUB",
                  "म १८ वर्ष पुगेको छु र JILIEVO.CLUB का नियम र सर्तहरूसँग सहमत छु"
                )}
              </span>
            </div>

            {/* 8. Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] rounded-lg bg-gradient-to-b from-[#1872f2] via-[#0356e0] to-[#062d75] border border-[#389aff]/40 text-white text-[16px] font-bold shadow-[0_4px_12px_rgba(6,45,117,0.35)] hover:brightness-105 active:scale-[0.98] transition mb-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("Registering...") : t("Register")}
            </button>

            {/* Link back to Login */}
            <div className="w-full flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={() => handleSwitchMode("login")}
                className="text-[#0045b8] text-[14px] font-bold underline hover:opacity-80 transition cursor-pointer"
              >
                {t("Already have an account? Login")}
              </button>
            </div>
          </form>
        ) : (
          /* =======================
             FORGOT PASSWORD FORM
             ======================= */
          <form onSubmit={handleForgotResetSubmit} className="w-full flex flex-col">
            {/* Active Tab indicator (Only Mobile Number as requested) */}
            <div className="flex border-b border-gray-200 mb-6 justify-center">
              <div className="text-red-600 font-bold text-[16px] pb-2 border-b-2 border-red-600 px-5 select-none">
                {t("Mobile number")}
              </div>
            </div>

            {/* 1. Phone number with flag */}
            <div className="flex items-center gap-2 w-full mb-4">
              <div className="flex items-center justify-center gap-1.5 h-[46px] px-3 bg-[#e8e8e8] text-gray-800 rounded-lg text-[14px] font-semibold select-none shrink-0">
                <img
                  src="/npr/flag_nepal_circle.png"
                  alt="NP"
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
                <span className="text-[#0045b8] font-bold">+977</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder={t("10 digit phone number")}
                value={forgotPhone}
                onChange={(e) => {
                  setForgotPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (error) setError("");
                }}
                className="flex-1 h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] font-normal"
                disabled={forgotLoading}
              />
            </div>

            {/* 2. SMS Code with [ Get code ] button */}
            <div className="flex items-center gap-2.5 w-full mb-4">
              <input
                type="text"
                required
                maxLength={6}
                placeholder={t("SMS")}
                value={forgotOtp}
                onChange={(e) => {
                  setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (error) setError("");
                }}
                className="flex-1 h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] font-normal"
                disabled={forgotLoading}
              />
              <button
                type="button"
                onClick={handleForgotSendOtp}
                disabled={forgotOtpSending || forgotOtpCountdown > 0 || forgotLoading}
                className="h-[46px] px-4 rounded-lg bg-gradient-to-b from-[#1872f2] via-[#0356e0] to-[#062d75] border border-[#389aff]/40 text-white text-[13px] font-bold shadow-[0_2px_8px_rgba(6,45,117,0.25)] hover:brightness-105 active:scale-95 transition whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none flex items-center justify-center min-w-[95px]"
              >
                {forgotOtpSending
                  ? t("Sending...")
                  : forgotOtpCountdown > 0
                  ? `${forgotOtpCountdown}s`
                  : t("Get code")}
              </button>
            </div>

            {/* 3. New password with Eye Toggle */}
            <div className="relative flex items-center mb-6 w-full">
              <input
                type={forgotShowPassword ? "text" : "password"}
                required
                placeholder={t("Please enter a new password")}
                value={forgotNewPassword}
                onChange={(e) => {
                  setForgotNewPassword(e.target.value);
                  if (error) setError("");
                }}
                className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] pl-4 pr-11 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] transition font-normal"
                disabled={forgotLoading}
              />
              <button
                type="button"
                onClick={() => setForgotShowPassword(!forgotShowPassword)}
                tabIndex={-1}
                className="absolute right-3.5 h-full flex items-center justify-center text-[#0045b8] hover:opacity-80 transition cursor-pointer select-none focus:outline-none focus:ring-0 outline-none"
                title={forgotShowPassword ? "Hide password" : "Show password"}
                aria-label={forgotShowPassword ? "Hide password" : "Show password"}
              >
                {forgotShowPassword ? (
                  <svg viewBox="0 0 24 16" className="w-[20px] h-[14px] text-[#0045b8]" fill="none">
                    <path
                      d="M12 1.5C5.6 1.5 1 8 1 8s4.6 6.5 11 6.5S23 8 23 8s-4.6-6.5-11-6.5z"
                      fill="currentColor"
                    />
                    <circle cx="12" cy="8" r="4.5" fill="#ffffff" />
                    <circle cx="12" cy="8" r="2.4" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 22 15" className="w-[18px] h-[13px] text-[#0045b8]" fill="none">
                    <path
                      d="M 2 3.5 C 4 8.5, 8 10.5, 11 10.5 C 14 10.5, 18 8.5, 20 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line x1="4.5" y1="7.5" x2="2.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8.5" y1="9.5" x2="8" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="13.5" y1="9.5" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="17.5" y1="7.5" x2="19.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>

            {/* 4. Confirm Button */}
            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full h-[48px] rounded-lg bg-gradient-to-b from-[#1872f2] via-[#0356e0] to-[#062d75] border border-[#389aff]/40 text-white text-[16px] font-bold shadow-[0_4px_12px_rgba(6,45,117,0.35)] hover:brightness-105 active:scale-[0.98] transition mb-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {forgotLoading ? t("Resetting...") : t("Confirm")}
            </button>

            {/* 5. Bottom Services & Back to Login */}
            <div className="w-full flex flex-col items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  const siteDetailsObj = apiSiteData?.siteDetails || siteDetails;
                  const whatsapp = siteDetailsObj?.whatsappNumber || "9779800000000";
                  window.open(
                    `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=Hi,%20I%20need%20help%20with%20password%20reset`,
                    "_blank"
                  );
                }}
                className="text-[#0045b8] text-[14px] font-semibold underline hover:opacity-80 transition cursor-pointer"
              >
                {t("Services")}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode("login")}
                className="text-gray-500 hover:text-[#0045b8] text-[13px] font-medium transition cursor-pointer mt-1"
              >
                ← {t("Already have an account? Login")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

LoginPage.propTypes = {
  initialMode: PropTypes.string,
  onBack: PropTypes.func,
  onLoginSuccess: PropTypes.func,
};

export default LoginPage;
