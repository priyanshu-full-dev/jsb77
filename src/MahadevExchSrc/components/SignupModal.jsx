import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaEye,
  FaEyeSlash,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";
import {
  IoPaperPlane,
  IoCloseSharp,
  IoChevronBackSharp,
} from "react-icons/io5";

import { useDispatch, useSelector } from "react-redux";
import { selectSite, selectSiteLogo } from "../../utils/helper/commonSelectors";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSitesByDomain, SendOtp, signUp } from "../../api";
import { generatePresignedUrl } from "../../utils/helper/generatePresignedUrl";
import { t } from "../utils/language";

const SignupModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const siteDetails = useSelector(selectSite());
  const siteData = useSelector(selectSite());
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userData, setUserData] = useState(null);

  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [params, setParams] = useState({});
  const siteLogo = useSelector(selectSiteLogo());
  const [step, setStep] = useState("signup");
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    mobile: "",
    userName: "",
    name: "",
    password: "",
    confirmPassword: "",
    x_panel_type: "user",
    commission: 0,
    openingBalance: 0,
    availableBalance: 0,
    creditReference: 0,
    partnership: 0,
    currency: "INR",
    exposureLimit: 200000,
    exposure: 0,
    createdBy: "",
    referredBy: "",
    deviceIp: "0.0.0",
    role: "",
    domain: "",
    ownerDomainId: "",
    otp: "",
    isSignupUser: true,
    layout: "asianexchange",
    siteID: "",
  });

  const [form, setForm] = useState({
    country: "BD (+880)",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    signupCode: "",
  });

  const [errors, setErrors] = useState({});

  // ---------------- referral ----------------

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const referral = queryParams.get("referral");

    if (referral) {
      setParams({ referral });
      document.cookie = `referral=${referral}; path=/`;
    } else {
      const match = document.cookie.match(/(^| )referral=([^;]+)/);
      if (match) {
        setParams({ referral: match[2] });
      }
    }
  }, []);

  // ---------------- site details ----------------

  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const domainName = window.location.host;
        const response = await getSitesByDomain(domainName);
        const siteDetails = response?.data;

        setUserData(siteDetails);

        setFormData((prev) => ({
          ...prev,
          createdBy:
            siteDetails?.createdBy?._id ||
            siteDetails?.siteDetails?.createrId ||
            "",
          role: siteDetails?.userRoleId || "",
          domain: siteDetails?.siteDetails?.domainDetails?._id || "",
          ownerDomainId: siteDetails?.siteDetails?.admindomainName?._id || "",
          ...(params.referral && { referredBy: params.referral }),
        }));
      } catch (error) {
        console.error("Failed to fetch site details:", error);
      }
    };

    fetchSiteDetails();
  }, []);

  // ---------------- siteID fix ----------------

  useEffect(() => {
    if (siteDetails?._id) {
      setFormData((prev) => ({
        ...prev,
        siteID: siteDetails._id,
      }));
    }
  }, [siteDetails]);

  // ---------------- input change ----------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    if (name === "username") {
      setFormData((prev) => ({
        ...prev,
        userName: value,
      }));
    }

    if (name === "password") {
      setFormData((prev) => ({
        ...prev,
        password: value,
      }));
    }

    if (name === "confirmPassword") {
      setFormData((prev) => ({
        ...prev,
        confirmPassword: value,
      }));
    }

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  // ---------------- phone ----------------

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setForm({
      ...form,
      phone: value,
    });

    setFormData((prev) => ({
      ...prev,
      mobile: value,
      userName: value,
      name: value,
    }));
  };

  // ---------------- password validation ----------------

  const validatePassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@]{6,}$/;

    const hasInvalidSpecialChar = /[^A-Za-z\d@]/.test(password);

    if (!strongPasswordRegex.test(password) || hasInvalidSpecialChar) {
      setPasswordError(
        "Use 6+ chars: uppercase, lowercase, number, '@' optional.",
      );
    } else {
      setPasswordError("");
    }
  };

  // ---------------- validation ----------------

  const validate = () => {
    const newErrors = {};

    if (!form.phone.trim()) {
      newErrors.phone = "Phone No is mandatory";
    }

    if (!form.username.trim()) {
      newErrors.username = "User Name is mandatory";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is mandatory";
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is mandatory";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------------- send OTP ----------------

  const handleSubmit = async () => {
    if (!validate()) return;
    if (passwordError) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        password: form.password,
        confirmPassword: form.confirmPassword,
      };

      const response = await signUp(payload);

      if (response?.data?.message === "User created successfully") {
        toast.success("Registration Successful");
        onClose();
        navigate("/");
      } else {
        toast.error(response?.data?.message || "Signup failed");
      }
    } catch (err) {
      toast.error("Signup failed");
      console.log(err);
    }

    setIsLoading(false);
  };

  // ---------------- confirm OTP ----------------

  const handleConfirmOtp = async () => {
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        password: form.password,
        confirmPassword: form.confirmPassword,
        otp: otp,
      };

      const response = await signUp(payload);

      if (response?.data?.message === "User created successfully") {
        toast.success("Registration Successful");
        onClose();
        navigate("/");
      } else {
        toast.error(response?.data?.message || "Signup failed");
      }
    } catch (err) {
      toast.error("Signup failed");
      console.log(err);
    }

    setIsLoading(false);
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
    <div className="fixed inset-0 z-[999999] flex items-center justify-center px-2">
      {/* Overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/80 z-[1]" />

      <div className="relative z-[2] w-full md:w-[420px] modal-open">
        {step === "otp" && (
          <button
            onClick={() => setStep("signup")}
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

        <div className="relative bg-[#1a1a1a] w-full md:w-[420px] rounded-[10px] p-4 px-6 shadow-xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logoUrl} className="h-[26px]" alt="logo" />
          </div>

          {step === "signup" && (
            <>
              {/* Phone */}
              <div className="flex gap-3 mb-1">
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-[120px] bg-transparent border border-white rounded-[8px] px-3 py-1.5 text-[12px] text-white"
                />

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder={t("Phone Number", "ফোন নম্বর")}
                  className="flex-1 bg-transparent border border-white rounded-[8px] px-3 py-1.5 text-[12px] text-white"
                />
              </div>

              <div className="text-[red] text-[11px] min-h-[13px]">
                <p className="!mb-1">{errors.phone}</p>
              </div>

              {/* Username */}
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={t("Username", "ইউজারনেম")}
                className="w-full mb-1 bg-transparent border border-white rounded-[8px] px-3 py-1.5 text-[12px] text-white"
              />

              <div className="text-[red] text-[11px] min-h-[13px]">
                <p className="!mb-1">{errors.username}</p>
              </div>

              {/* Password */}
              <div className="relative mb-1">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={(e) => {
                    handleChange(e);
                    validatePassword(e.target.value);
                  }}
                  placeholder={t("Password", "পাসওয়ার্ড")}
                  className="w-full bg-transparent border border-white rounded-[8px] px-3 py-1.5 text-[12px] text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-[6px] text-white"
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="text-[red] text-[11px] min-h-[13px]">
                <p className="!mb-1">{errors.password}</p>
              </div>

              {/* Confirm Password */}
              <div className="relative mb-1">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder={t("Confirm Password", "পাসওয়ার্ড নিশ্চিত করুন")}
                  className="w-full bg-transparent border border-white rounded-[8px] px-3 py-1.5 text-[12px] text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-[6px] text-white"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="text-[red] text-[11px] min-h-[13px]">
                <p className="!mb-1">{errors.confirmPassword}</p>
              </div>

              {/* Signup Code */}
              <input
                name="signupCode"
                value={form.signupCode}
                onChange={handleChange}
                placeholder={t("Enter Signup Code (Optional)", "সাইনআপ কোড লিখুন (ঐচ্ছিক)")}
                className="w-full mb-4 bg-transparent border border-white rounded-[8px] px-3 py-1.5 text-[12px] text-white"
              />

              {/* Terms */}
              <p className="text-white text-[10px] mb-2">
                {t(
                  "'By clicking 'Sign Up', you confirm that you are of legal age in your country and accept the terms of playbangla777.com.",
                  "'সাইন আপ' বোতামে ক্লিক করে আপনি নিশ্চিত করছেন যে আপনি আপনার দেশের প্রাপ্তবয়স্ক বয়সে পৌঁছেছেন এবং playbangla777.com-এর শর্তাবলী মেনে নিচ্ছেন।"
                )}
              </p>

              {/* Signup */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-white text-black font-extrabold py-2 text-[14px] rounded-[8px] mb-1"
              >
                {isLoading ? t("Sending OTP...", "ওটিপি পাঠানো হচ্ছে...") : t("Sign Up", "সাইন আপ")}
              </button>

              <p className="text-center text-[14px] font-extrabold text-white mb-1">
                {t("OR", "অথবা")}
              </p>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${siteData?.whatsappSupport}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-green-500 py-2 text-[14px] rounded-[8px] text-white font-extrabold mb-6"
              >
                <FaWhatsapp size={22} />
                {t("Get ID on WhatsApp", "হোয়াটসঅ্যাপে আইডি নিন")}
              </a>

              {/* Features */}
              <div className="flex justify-between text-white text-[11px] mb-4">
                <div className="flex items-center gap-1">
                  <img src="/upgrade-plan.png" height={32} width={32} alt="" />
                  <div className="flex flex-col text-[10px] items-start">
                    <p className="-mb-1">playbangla777.com</p>
                    <p>{t("Upgrade Benefits", "আপগ্রেড সুবিধা")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <img src="/user-sign-up.png" height={32} width={32} alt="" />
                  <div className="flex flex-col text-[10px] items-start">
                    <p className="-mb-1">{t("Personal Support", "ব্যক্তিগত সাপোর্ট")}</p>
                    <p>{t("24/7 Assistance", "২৪/৭ সহায়তা")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <img src="/support-24.png" height={32} width={32} alt="" />
                  <div className="flex flex-col text-[10px] items-start">
                    <p className="-mb-1">{t("24/7 Instant", "২৪/৭ দ্রুত")}</p>
                    <p>{t("Withdrawal", "উত্তোলন")}</p>
                  </div>
                </div>
              </div>

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
            </>
          )}

          {step === "otp" && (
            <div className="relative   rounded-[10px] ">
              <h2 className="text-white text-center font-bold text-[28px] mb-4">
                Enter OTP
              </h2>

              <p className="text-white text-[14px] mb-2">
                Check your mobile for the OTP
              </p>

              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter Otp"
                className="w-full mb-1 bg-transparent border border-white rounded-[8px] px-3 py-2 text-[12px] text-white"
              />

              <div className="flex justify-between items-center mt-4 text-white text-[14px]">
                <span>OTP is only valid for 5 minutes</span>

                <button
                  onClick={handleSubmit}
                  className="border border-white px-4 py-1 rounded"
                >
                  Resend OTP
                </button>
              </div>

              <button
                onClick={handleConfirmOtp}
                disabled={isLoading}
                className="w-full bg-white text-black font-extrabold py-2 text-[14px] rounded-[8px] mb-4 mt-12"
              >
                {isLoading ? "Processing..." : "CONFIRM"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default SignupModal;
