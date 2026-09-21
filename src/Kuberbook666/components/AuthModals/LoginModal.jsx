import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { loginSuccess } from "../../../redux/slices/userSlice";
import { setAccountType } from "../../../redux/slices/accountSlice";
import { login, Demo, createLoginRecord } from "../../../api";
import { subscribeToLogin } from "../../../socketClient";

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [activeTab, setActiveTab] = useState("mobile"); // 'mobile' | 'userid'
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const username = (activeTab === "mobile" ? phone : userId).trim();
    if (!username) {
      setError(activeTab === "mobile" ? "Phone number is mandatory" : "User Id is mandatory");
      return;
    }
    if (!password.trim()) {
      setError("Password is mandatory");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 1. First try real-time socket login like Mahadev
      const socketPayload = {
        userName: username,
        username: username,
        password: password,
        x_panel_type: "user",
      };

      let response = null;
      try {
        response = await subscribeToLogin(socketPayload);
      } catch (err) {
        console.warn("Socket login failed, trying REST API fallback...", err);
      }

      if (response && response.success) {
        const { token, userdata } = response;
        if (token) localStorage.setItem("token", token);
        if (userdata?._id) localStorage.setItem("userId", userdata._id);

        dispatch(
          loginSuccess({
            userData: userdata,
            loggedInType: "real",
            token: token,
          })
        );
        dispatch(
          setAccountType({
            userData: userdata,
            type: "real",
          })
        );

        toast.success(response.message || "Login successful!");
        onClose();
        createLoginRecord({ userName: username }).catch(() => {});
        return;
      }

      // 2. Fallback to REST login API
      const restRes = await login({
        userName: username,
        username: username,
        password: password,
        x_panel_type: "user",
      });
      const resData = restRes?.data || restRes;
      if (resData?.token || (resData?.success && resData?.userdata?.token)) {
        const token = resData.token || resData.userdata?.token;
        const userdata = resData.user || resData.userdata || { username };
        if (token) localStorage.setItem("token", token);
        if (userdata?._id) localStorage.setItem("userId", userdata._id);

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

        toast.success(resData?.message || "Login successful!");
        onClose();
        createLoginRecord({ userName: username }).catch(() => {});
        return;
      }

      const errMsg = response?.message || resData?.message || "Invalid username or password";
      setError(errMsg);
      toast.error(errMsg);
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError("");
    try {
      const res = await Demo();
      const demoData = res?.data || res;

      if (demoData && demoData.token) {
        const { token, userdata } = demoData;
        localStorage.setItem("token", token);
        if (userdata?._id) localStorage.setItem("userId", userdata._id);

        dispatch(
          loginSuccess({
            userData: userdata,
            loggedInType: "demo",
            token: token,
          })
        );
        dispatch(
          setAccountType({
            userData: userdata,
            type: "demo",
          })
        );

        toast.success("Demo account created successfully!");
        onClose();
        return;
      }

      // Safe fallback if Demo API is offline
      const fallbackToken = "demo-token-" + Date.now();
      const fallbackUser = { _id: "demo_guest", username: "demo_guest", balance: 10000 };
      localStorage.setItem("token", fallbackToken);
      localStorage.setItem("userId", fallbackUser._id);

      dispatch(
        loginSuccess({
          token: fallbackToken,
          userData: fallbackUser,
          loggedInType: "demo",
        })
      );
      dispatch(
        setAccountType({
          userData: fallbackUser,
          type: "demo",
        })
      );

      toast.success("Demo account created successfully!");
      onClose();
    } catch (err) {
      console.error("Error creating demo account:", err);
      toast.error("Failed to create demo account. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-[390px] rounded-2xl bg-white text-gray-900 shadow-2xl p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-150 font-sans">
        {/* Header: "Log In" & Close Button */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Log In</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center text-xs font-bold transition-transform active:scale-90 cursor-pointer shadow-xs"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher: Mobile Number vs User Id */}
        <div className="flex bg-[#f2f3f7] p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab("mobile");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "mobile"
                ? "bg-[#680a1e] text-white shadow-sm"
                : "text-gray-800 hover:text-black"
            }`}
          >
            Mobile Number
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("userid");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "userid"
                ? "bg-[#680a1e] text-white shadow-sm"
                : "text-gray-800 hover:text-black"
            }`}
          >
            User Id
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === "mobile" ? (
            /* PHONE NUMBER FIELD */
            <div>
              <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wide mb-1">
                PHONE NUMBER
              </label>
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
            </div>
          ) : (
            /* USER ID FIELD */
            <div>
              <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wide mb-1">
                USER ID
              </label>
              <div className="flex items-center bg-[#f2f4f8] border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-red-600 transition">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="USER ID"
                  className="bg-transparent text-sm w-full outline-hidden font-medium text-gray-900 placeholder:text-gray-400 uppercase"
                  required
                />
              </div>
            </div>
          )}

          {/* PASSWORD FIELD */}
          <div>
            <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wide mb-1">
              Password
            </label>
            <div className="flex items-center justify-between bg-[#f2f4f8] border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-red-600 transition">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-transparent text-sm w-full outline-hidden font-medium text-gray-900 placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#c10931] hover:opacity-80 p-0.5 focus:outline-hidden cursor-pointer"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-left pt-0.5">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-xs font-bold text-gray-900 underline hover:text-[#680a1e]"
            >
              Forgot Password?
            </a>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#680a1e] hover:bg-[#580718] text-white font-bold text-sm tracking-wide shadow-md active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              disabled={demoLoading}
              onClick={handleDemoLogin}
              className="w-full py-3 rounded-xl bg-[#680a1e] hover:bg-[#580718] text-white font-bold text-sm tracking-wide shadow-md active:scale-98 transition cursor-pointer disabled:opacity-50"
            >
              {demoLoading ? "Creating Demo..." : "Login With Demo Id"}
            </button>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-3 text-xs text-gray-800 font-medium">
            New User?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToSignup();
              }}
              className="text-[#680a1e] font-bold underline hover:text-red-700 cursor-pointer"
            >
              Create an account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
