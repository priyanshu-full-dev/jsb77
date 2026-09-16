import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FaLock, FaTag, FaCommentDots, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { SendOtp, getSitesByDomain, signUp } from "../../../api";
import { selectSite } from "../../../utils/helper/commonSelectors";

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const siteDetails = useSelector(selectSite());

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [referral, setReferral] = useState("");
  const [apiSiteData, setApiSiteData] = useState(null);

  const timerRef = useRef(null);

  // 1. Referral query & cookie tracking
  useEffect(() => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const ref = queryParams.get("referral");
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
      console.error("Referral parse error:", err);
    }
  }, []);

  // 2. Fetch site metadata for real database user insertion (createdBy, role, domain, ownerDomainId)
  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const domainName = window.location.host;
        const response = await getSitesByDomain(domainName);
        if (response?.data) {
          setApiSiteData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch site details for signup:", err);
      }
    };
    fetchSiteDetails();
  }, []);

  // 3. Countdown timer for OTP resend (60s)
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [otpTimer]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setPasswordError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Password validation helper
  const handlePasswordChange = (val) => {
    setPassword(val);
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#]{6,}$/;
    if (val.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
    } else if (!strongPasswordRegex.test(val)) {
      setPasswordError("Include uppercase, lowercase and a number.");
    } else {
      setPasswordError("");
    }
  };

  // Live OTP Sender
  const handleSendOtp = async () => {
    if (otpTimer > 0) {
      toast.info(`Please wait ${otpTimer} seconds before requesting a new OTP.`);
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setError("");
    setOtpLoading(true);

    try {
      const otpRes = await SendOtp({
        phone: cleanPhone,
        mobile: cleanPhone,
        userName: username.trim() || cleanPhone,
        country: "+91",
      });

      if (otpRes?.data?.success === false && otpRes?.data?.message) {
        setError(otpRes.data.message);
        toast.error(otpRes.data.message);
        return;
      }

      setOtpSent(true);
      setOtpTimer(60);
      setOtp("");
      toast.success(otpRes?.data?.message || `OTP sent successfully to +91 ${cleanPhone}`);
    } catch (err) {
      console.warn("SendOtp note:", err);
      setOtpSent(true);
      setOtpTimer(60);
      toast.info("If you received SMS OTP, enter it below or click 'Create Real Account' to submit.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Submit Registration To Real Database
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!username.trim()) {
      setError("Username is mandatory");
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
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

    setError("");
    setLoading(true);

    try {
      // Build full database payload matching Mahadev's exact structure
      const payload = {
        mobile: cleanPhone,
        userName: username.trim(),
        name: username.trim(),
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
        x_panel_type: "user",
        commission: 0,
        openingBalance: 0,
        availableBalance: 0,
        creditReference: 0,
        partnership: 0,
        currency: "INR",
        exposureLimit: 200000,
        exposure: 0,
        createdBy:
          apiSiteData?.createdBy?._id ||
          apiSiteData?.siteDetails?.createrId ||
          siteDetails?.createdBy?._id ||
          siteDetails?.createrId ||
          "",
        referredBy: referral || "",
        deviceIp: "0.0.0",
        role:
          apiSiteData?.userRoleId ||
          siteDetails?.userRoleId ||
          "",
        domain:
          apiSiteData?.siteDetails?.domainDetails?._id ||
          siteDetails?.domainDetails?._id ||
          "",
        ownerDomainId:
          apiSiteData?.siteDetails?.admindomainName?._id ||
          siteDetails?.admindomainName?._id ||
          "",
        otp: otp.trim(),
        isSignupUser: true,
        layout: "asianexchange",
        siteID:
          apiSiteData?.siteDetails?._id ||
          apiSiteData?._id ||
          siteDetails?._id ||
          "",
        promocode: promoCode.trim(),
      };

      const response = await signUp(payload);

      if (
        response?.data?.message === "User created successfully" ||
        response?.data?.success ||
        response?.success
      ) {
        toast.success(response?.data?.message || "Registration Successful! Please login.");
        onClose();
        if (onSwitchToLogin) onSwitchToLogin();
      } else {
        const errorMsg =
          response?.data?.message ||
          response?.message ||
          "Registration failed. Please check your details.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("signUp API error:", err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-[390px] rounded-2xl bg-white text-gray-900 shadow-2xl p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-150 font-sans max-h-[95vh] overflow-y-auto no-scrollbar">
        {/* Header: "Sign Up" & Close Button */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign Up</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center text-xs font-bold transition-transform active:scale-90 cursor-pointer shadow-xs"
          >
            ✕
          </button>
        </div>

        {/* Center Golden Brand Badge: "BOOK666" */}
        <div className="flex justify-center my-3">
          <div className="bg-[#ffd700] text-[#70081d] font-black text-3xl px-4 py-1 rounded-lg tracking-tight shadow-sm select-none italic font-sans">
            BOOK666
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 1. Username Field */}
          <div className="bg-[#f2f4f8] border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-red-600 transition">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Username"
              className="bg-transparent text-sm w-full outline-hidden font-medium text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          {/* 2. Phone Number Field + Counter */}
          <div>
            <div className="flex items-center gap-2 bg-[#f2f4f8] border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-red-600 transition">
              <span className="text-sm font-bold text-gray-800">+91</span>
              <span className="text-base leading-none">🇮🇳</span>
              <svg
                className="w-2.5 h-2.5 text-red-700 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="895XX6XXXX"
                className="bg-transparent text-sm w-full outline-hidden font-medium text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>
            <div className="text-right text-[11px] font-bold text-red-600 mt-0.5 pr-1">
              {phone.length}/10
            </div>
          </div>

          {/* 3. OTP Action Button */}
          <button
            type="button"
            disabled={otpTimer > 0 || otpLoading}
            onClick={handleSendOtp}
            className={`w-full py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-xs cursor-pointer ${
              otpTimer > 0 || otpLoading
                ? "bg-gray-400 cursor-not-allowed opacity-75"
                : "bg-[#9c6a74] hover:bg-[#8b5c65]"
            }`}
          >
            <FaCommentDots className="text-base" />
            <span>
              {otpLoading
                ? "Sending OTP..."
                : otpTimer > 0
                ? `Resend OTP in ${otpTimer}s`
                : otpSent
                ? "Resend OTP"
                : "Send OTP"}
            </span>
          </button>

          {/* 4. OTP Input Field */}
          <div className="bg-[#f2f4f8] border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-red-600 transition">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="bg-transparent text-sm w-full outline-hidden font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* 5. Password Field */}
          <div className="flex items-center justify-between bg-[#f2f4f8] border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-red-600 transition">
            <div className="flex items-center gap-2.5 w-full">
              <FaLock className="text-[#c10931] text-xs flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Password (Min 6 chars)"
                className="bg-transparent text-sm w-full outline-hidden font-medium text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#c10931] hover:opacity-80 p-0.5 focus:outline-hidden cursor-pointer"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-600 text-[11px] font-semibold pl-1 -mt-1">
              {passwordError}
            </p>
          )}

          {/* 6. Confirm Password Field */}
          <div className="flex items-center justify-between bg-[#f2f4f8] border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-red-600 transition">
            <div className="flex items-center gap-2.5 w-full">
              <FaLock className="text-[#c10931] text-xs flex-shrink-0" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="bg-transparent text-sm w-full outline-hidden font-medium text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#c10931] hover:opacity-80 p-0.5 focus:outline-hidden cursor-pointer"
            >
              {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>

          {/* 7. Promo Code Field */}
          <div className="flex items-center gap-2.5 bg-[#f2f4f8] border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-red-600 transition">
            <FaTag className="text-[#c10931] text-xs flex-shrink-0" />
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter Promocode (Optional)"
              className="bg-transparent text-sm w-full outline-hidden font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* 8. Terms Note */}
          <p className="text-gray-500 text-[10px] leading-tight px-1">
            By clicking &apos;Submit&apos;, you confirm that you are of legal age (18+) and accept our terms and conditions.
          </p>

          {/* 9. Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#680a1e] hover:bg-[#580718] text-white font-bold text-base tracking-wide shadow-md active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating Account..." : "Create Real Account"}
            </button>
          </div>

          {/* 10. Footer Link */}
          <div className="text-center pt-2 text-xs text-gray-800 font-medium">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
              className="text-[#680a1e] font-bold underline hover:text-red-700 cursor-pointer"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;
