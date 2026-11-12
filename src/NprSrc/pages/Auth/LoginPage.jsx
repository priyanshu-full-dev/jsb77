import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronLeft, FaCheck } from "react-icons/fa";

export const LoginPage = ({ initialMode = "login", onBack, onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterRoute =
    location.pathname.includes("register") || initialMode === "register";
  const [mode, setMode] = useState(isRegisterRoute ? "register" : "login");

  // Form states
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "register") {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (phone.length < 10) {
        alert("Please enter a valid 10-digit mobile number!");
        return;
      }
      if (!agreeTerms) {
        alert("Please accept the terms and conditions to proceed.");
        return;
      }
    }

    const loggedUser = {
      username: username.trim() || "prish07",
      balance: "0.00",
    };

    try {
      localStorage.setItem("npr_user", JSON.stringify(loggedUser));
    } catch {
      // ignore storage error
    }

    if (onLoginSuccess) {
      onLoginSuccess(loggedUser);
    }

    if (onBack) {
      onBack();
    } else {
      navigate("/");
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
        <h2 className="text-center text-[#0045b8] text-[22px] font-bold tracking-tight mb-6">
          {mode === "login" ? "Login" : "Register"}
        </h2>

        {/* =======================
            LOGIN FORM
           ======================= */}
        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            {/* Username */}
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] mb-4 transition font-normal"
              autoCapitalize="none"
            />

            {/* Password */}
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] mb-4 transition font-normal"
            />

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
                Remember
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full h-[48px] rounded-lg bg-gradient-to-b from-[#1872f2] via-[#0356e0] to-[#062d75] border border-[#389aff]/40 text-white text-[16px] font-bold shadow-[0_4px_12px_rgba(6,45,117,0.35)] hover:brightness-105 active:scale-[0.98] transition mb-4 cursor-pointer"
            >
              Login
            </button>

            {/* Bottom Links (Register & Forgot password?) */}
            <div className="w-full flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-[#0045b8] text-[14px] font-bold underline hover:opacity-80 transition cursor-pointer"
              >
                Register
              </button>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Please contact JSB77 24/7 Customer Service on WhatsApp to reset your password."
                  )
                }
                className="text-[#0045b8] text-[14px] font-bold underline hover:opacity-80 transition cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </form>
        ) : (
          /* =======================
             REGISTER FORM (Same to Same)
             ======================= */
          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            {/* 1. Username */}
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] mb-4 transition font-normal"
              autoCapitalize="none"
            />

            {/* 2. Password */}
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] mb-4 transition font-normal"
            />

            {/* 3. Confirm password */}
            <input
              type="password"
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] mb-4 transition font-normal"
            />

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
                placeholder="10 digit phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="flex-1 h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] font-normal"
              />
            </div>

            {/* 5. Invitation code */}
            <input
              type="text"
              placeholder="Invitation code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full h-[46px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-[15px] px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] mb-5 transition font-normal"
            />

            {/* 6. Terms Checkbox (I am 18 years old and agree to the terms & conditions of JILIEVO.CLUB) */}
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
                I am 18 years old and agree to the terms &amp; conditions of
                JILIEVO.CLUB
              </span>
            </div>

            {/* 7. Register Button */}
            <button
              type="submit"
              className="w-full h-[48px] rounded-lg bg-gradient-to-b from-[#1872f2] via-[#0356e0] to-[#062d75] border border-[#389aff]/40 text-white text-[16px] font-bold shadow-[0_4px_12px_rgba(6,45,117,0.35)] hover:brightness-105 active:scale-[0.98] transition mb-4 cursor-pointer"
            >
              Register
            </button>

            {/* Link back to Login */}
            <div className="w-full flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[#0045b8] text-[14px] font-bold underline hover:opacity-80 transition cursor-pointer"
              >
                Already have an account? Login
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
