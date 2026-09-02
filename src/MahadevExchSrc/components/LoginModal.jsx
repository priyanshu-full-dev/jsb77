import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaEye, FaEyeSlash, FaFacebookF, FaInstagram } from "react-icons/fa";
import {
  IoPaperPlane,
  IoCloseSharp,
  IoChevronBackSharp,
} from "react-icons/io5";
import { subscribeToLogin } from "../../socketClient";
import { toast } from "react-toastify";
import { setAccountType } from "../../redux/slices/accountSlice";
import { useDispatch, useSelector } from "react-redux";
import { createLoginRecord, Demo, login } from "../../api";
import { loginSuccess } from "../../redux/slices/userSlice";
import { generatePresignedUrl } from "../../utils/helper/generatePresignedUrl";
import { t, isPort5177 } from "../utils/language";
import { selectSiteLogo } from "../../utils/helper/commonSelectors";

const LoginModal = ({ onClose }) => {
  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const siteLogo = useSelector(selectSiteLogo());

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    x_panel_type: "user",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validateLogin = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "User Name is mandatory";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is mandatory";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateForgot = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone No is mandatory";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = () => {
    if (!validateForgot()) return;

    console.log("Send OTP:", formData.phone);
  };

  const [loading, setLoading] = useState({ demo: false, real: false });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateLogin()) return;

    setLoading((prev) => ({ ...prev, real: true }));

    try {
      const response = await subscribeToLogin(formData);

      if (response.success) {
        const { token, userdata } = response;

        localStorage.setItem("userId", userdata?._id);

        dispatch(
          loginSuccess({
            userData: userdata,
            loggedInType: "real",
            token: token,
          }),
        );
        dispatch(
          setAccountType({
            userData: userdata,
            type: "real",
          }),
        );

        toast.success(response.message || t("Login successful", "লগইন সফল হয়েছে"));

        onClose();

        await createLoginRecord();
      } else {
        toast.error(response.message || "invalid credentials");
      }
    } catch (error) {
      console.error("Login API error:", error);
      toast.error("Failed to login. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, real: false }));
    }
  };

  const handleDemoAccount = async () => {
    setLoading((prev) => ({ ...prev, demo: true }));

    try {
      const res = await Demo();

      if (!res || !res.data || !res.data.token) {
        throw new Error("Invalid response from Demo API");
      }

      const { token, userdata } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userdata?._id);

      dispatch(
        loginSuccess({
          userData: userdata,
          loggedInType: "demo",
          token: token,
        }),
      );

      dispatch(
        setAccountType({
          userData: userdata,
          type: "demo",
        }),
      );

      toast.success(t("Demo account created", "ডেমো অ্যাকাউন্ট তৈরি হয়েছে"));
    } catch (error) {
      console.error("Error creating demo account:", error);
      toast.error("Failed to create demo account. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, demo: false }));
      onClose();
    }
  };

  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const cachedLogo = localStorage.getItem("siteLogoUrl");
        const cachedLogoKey = localStorage.getItem("siteLogoKey");

        if (cachedLogo && cachedLogoKey === siteLogo) {
          setLogoUrl(cachedLogo);
        } else if (siteLogo) {
          const logoPresigned = await generatePresignedUrl(siteLogo);
          setLogoUrl(logoPresigned);
          localStorage.setItem("siteLogoUrl", logoPresigned);
          localStorage.setItem("siteLogoKey", siteLogo);
        }
      } catch (error) {
        console.error("Error fetching site assets:", error);
      }
    };

    if (siteLogo) {
      fetchAssets();
    }
  }, [siteLogo]);

  const modal = (
    <div className="fixed w-full inset-0 z-[999999] flex items-center justify-center px-2">
      {/* Overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/80 z-[1]" />

      <div className="relative   w-[100%] md:w-[420px]  z-[2]">
        {/* Back */}
        {mode === "forgot" && (
          <button
            onClick={() => setMode("login")}
            className="absolute font-bold h-[50px] left-0 top-[-29px] bg-[#2c2c2c] text-white text-[12px] px-2 rounded-[10px]"
          >
            <div className="flex items-center gap-2 -mt-5">
              <IoChevronBackSharp size={18} />
            </div>
          </button>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute font-bold h-[50px] right-0 top-[-29px] bg-[#2c2c2c] text-white text-[12px] px-4 rounded-[10px]"
        >
          <div className="flex items-center gap-2 -mt-5">
            <span>{t("Close", "বন্ধ করুন")}</span>
            <IoCloseSharp size={18} />
          </div>
        </button>

        <div className="relative bg-[#1a1a1a] w-[100%] md:w-[420px] rounded-[10px] p-4 px-4  shadow-xl">
          <img
            src={isPort5177() ? "/Welcome516_en.jpg" : "/Welcome516.png"}
            alt=""
            className="w-full h-[182px] rounded"
          />

          {/* Logo */}
          <div className="flex justify-center ">
            <img
              src={logoUrl}
              className="h-[26px] mb-2"
              alt="logo"
            />
          </div>

          {mode === "login" && (
            <>
              <h3 className="text-white text-center font-extrabold text-[24px] mb-8">
               {t("Welcome Back!", "আবার স্বাগতম!")}
              </h3>

              {/* Username */}
              <input
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder={t("Username", "ইউজারনেম")}
                className="w-full mb-1 bg-transparent border border-white rounded-[8px] px-3 py-1.5 text-[12px] text-white"
              />

              <div className="text-[red] text-[11px] min-h-[13px]">
                <p className="!mb-1">{errors.userName}</p>
              </div>

              {/* Password */}
              <div className="relative mb-1">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("Password", "পাসওয়ার্ড")}
                  className="w-full bg-transparent border border-white rounded-[8px] px-3 py-1.5 text-[12px] text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-[8px] text-white"
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="text-[red] flex justify-between items-center text-[11px] min-h-[13px]">
                <p className="!mb-1">{errors.password}</p>
                <p
                  onClick={() => setMode("forgot")}
                  className="text-[12px]  underline text-[white]"
                >
                  {t("Forgot Username/Password?", "ইউজারনেম/পাসওয়ার্ড ভুলে গেছেন?")}
                </p>
              </div>

              {/* Signup */}
              <button
                onClick={handleSubmit}
                disabled={loading.real}
                className="w-full bg-white text-black font-extrabold py-2 mt-12 text-[14px] rounded-[8px] mb-4"
              >
                {loading.real ? t("Logging in...", "লগইন হচ্ছে...") : t("Login", "লগইন")}
              </button>

              <button
                onClick={handleDemoAccount}
                disabled={loading.demo}
                className="w-full border border-white text-white text-[14px] py-2 rounded-[8px] mb-4 font-bold"
              >
                {loading.demo ? t("Creating Demo...", "ডেমো তৈরি হচ্ছে...") : t("Demo Login", "ডেমো লগইন")}
              </button>
            </>
          )}

          {/* FORGOT MODE */}
          {mode === "forgot" && (
            <>
              <h3 className="text-white text-center font-extrabold text-[24px] mb-8">
                {t("Forgot Username", "ইউজারনেম ভুলে গেছেন")}
              </h3>

              <div className="flex gap-3 mb-1">
                <input
                  name="country"
                  placeholder="+91"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-[120px] bg-transparent border border-white rounded-[8px] px-3 py-2 text-[12px] text-white"
                />

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("Phone Number", "ফোন নম্বর")}
                  className="flex-1 bg-transparent border border-white rounded-[8px] px-3 py-2 text-[12px] text-white"
                />
              </div>

              <p className="text-red-500 text-[11px] min-h-[14px]">
                {formData.phone}
              </p>

              <button
                onClick={handleSendOTP}
                className="w-full bg-white text-black font-extrabold py-2 mt-10 text-[14px] rounded-[8px] mb-6"
              >
                {t("Send OTP", "ওটিপি পাঠান")}
              </button>
            </>
          )}

          {/* Social Icons */}
          <div className="flex justify-center gap-4">
            <div className="w-[38px] h-[38px] rounded-full bg-[#0088cc] flex items-center justify-center">
              <IoPaperPlane className="text-white text-xl" />
            </div>

            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
              <FaInstagram className="text-white text-xl" />
            </div>

            <div className="w-[38px] h-[38px] rounded-full bg-[#3b5998] flex items-center justify-center">
              <FaFacebookF className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default LoginModal;
