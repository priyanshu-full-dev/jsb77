import { useEffect, useState } from "react";

import {
  X,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  selectSiteLoginColor,
  selectSiteLogo,
  selectSiteName,
  selectSiteFevicon,
  selectSite,
  selectDomainID,
} from "../../../../utils/helper/commonSelectors";

import { generatePresignedUrl } from "../../../../utils/helper/generatePresignedUrl";

import {
  getSitesByDomain,
  SendOtp,
  signUp,
} from "../../../../api";

export default function SignUp() {
  const navigate = useNavigate();

  // =========================================================
  // SITE DATA
  // =========================================================

  const siteDetails = useSelector(selectSite());

  const loginBtnColor = useSelector(selectSiteLoginColor());
  const siteName = useSelector(selectSiteName());
  const siteLogo = useSelector(selectSiteLogo());
  const siteFavIcon = useSelector(selectSiteFevicon());
  const domainId = useSelector(selectDomainID());

  const loginBgColor = siteDetails?.loginBgColor;

  // =========================================================
  // STATES
  // =========================================================

  const [logoUrl, setLogoUrl] = useState(null);
  const [favIconUrl, setFavIconUrl] = useState(null);

  const [otpSent, setOtpSent] = useState(false);

  // Referral
  const [params, setParams] = useState({
    referral: null,
  });

  const [siteData, setUserData] = useState(null);

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [passwordError, setPasswordError] = useState("");

  // =========================================================
  // FORM DATA
  // =========================================================

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

    exposureLimit: 0,
    exposure: 0,

    createdBy: "",

    deviceIp: "0.0.0",

    role: "",
    domain: "",
    ownerDomainId: "",

    otp: "",

    isSignupUser: true,

    layout: "auraexchange",

    siteID: siteDetails?._id || "",

    // =======================================================
    // REFERRAL
    // =======================================================

    referralKey: "",
  });

  // =========================================================
  // GET REFERRAL FROM URL
  // =========================================================
  //
  // Supports BOTH:
  //
  // ?signUp=true&reffrel=6759564
  // ?signUp=true&referral=6759564
  //
  // Existing referral URLs do not need to change.
  //
  // =========================================================

  useEffect(() => {
    const queryParams = new URLSearchParams(
      window.location.search
    );

    const referral =
      queryParams.get("reffrel") ||
      queryParams.get("referral") ||
      null;

    setParams({
      referral,
    });

    console.log("====================================");
    console.log("Referral from URL:", referral);
    console.log("====================================");
  }, []);

  // =========================================================
  // FETCH SITE DETAILS
  // =========================================================

  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const domainName = window.location.host;

        const response = await getSitesByDomain(domainName);

        const details = response?.data;

        console.log("========== SITE DETAILS ==========");
        console.log(details);
        console.log("==================================");

        setUserData(details);
      } catch (error) {
        console.error(
          "Failed to fetch site details:",
          error
        );
      }
    };

    fetchSiteDetails();
  }, []);

  // =========================================================
  // SET FORM DATA
  // =========================================================

  useEffect(() => {
    if (!siteData) return;

    setFormData((prev) => ({
      ...prev,

      // =====================================================
      // IMPORTANT REFERRAL LOGIC
      // =====================================================
      //
      // Referral signup:
      // createdBy empty rahega.
      //
      // Normal signup:
      // site creator createdBy me jayega.
      //
      // =====================================================

      createdBy: siteData?.createdBy?._id || siteData?.siteDetails?.createrId,

      // =====================================================
      // ROLE
      // =====================================================

      role: siteData?.userRoleId || "",

      // =====================================================
      // DOMAIN
      // =====================================================

      domain:
        siteData?.siteDetails?.domainDetails?._id ||
        domainId ||
        "",

      // =====================================================
      // OWNER DOMAIN
      // =====================================================

      ownerDomainId:
        siteData?.siteDetails?.admindomainName?._id ||
        "",

      // =====================================================
      // REFERRAL KEY
      // =====================================================

      referralKey: params.referral || "",

      // =====================================================
      // SITE ID
      // =====================================================

      siteID:
        siteData?._id ||
        siteDetails?._id ||
        "",
    }));
  }, [
    siteData,
    params.referral,
    domainId,
    siteDetails?._id,
  ]);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (name === "password") {
      validatePassword(value);
    }
  };

  // =========================================================
  // MOBILE CHANGE
  // =========================================================

  const handleMobileChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setFormData((prev) => ({
      ...prev,

      mobile: value,

      // Mobile is also username
      userName: value,

      // Mobile is also name by default
      name: value,
    }));

    setErrors((prev) => ({
      ...prev,
      mobile: "",
    }));
  };

  // =========================================================
  // PASSWORD VALIDATION
  // =========================================================

  const validatePassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@]{6,}$/;

    const hasInvalidSpecialChar =
      /[^A-Za-z\d@]/.test(password);

    if (
      !strongPasswordRegex.test(password) ||
      hasInvalidSpecialChar
    ) {
      setPasswordError(
        "Use 6+ chars: uppercase, lowercase, number, '@' optional."
      );
    } else {
      setPasswordError("");
    }
  };

  // =========================================================
  // OTP CHANGE
  // =========================================================

  const handleOtpChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 4);

    setFormData((prev) => ({
      ...prev,
      otp: value,
    }));

    setErrors((prev) => ({
      ...prev,
      otp: "",
    }));
  };

  // =========================================================
  // GET OTP
  // =========================================================

  const handleGetOTP = async () => {
    if (!isMobileValid) {
      toast.error(
        "Please enter a valid mobile number"
      );

      return;
    }

    setIsOtpLoading(true);

    try {
      const response = await SendOtp({
        mobile: formData.mobile,
      });

      if (response?.success) {
        toast.success(
          response?.data?.message ||
            "OTP sent successfully"
        );

        setOtpSent(true);
      } else {
        toast.error(
          response?.data?.message ||
            "Failed to send OTP"
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Error sending OTP. Please try again."
      );
    } finally {
      setIsOtpLoading(false);
    }
  };

  // =========================================================
  // FORM VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    if (formData.mobile.length !== 10) {
      newErrors.mobile =
        "Mobile number must be 10 digits.";
    }

    if (!formData.name) {
      newErrors.name =
        "Name is required.";
    }

    if (!formData.password) {
      newErrors.password =
        "Password is required.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Confirm password is required.";
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (
      otpSent &&
      formData.otp.length !== 4
    ) {
      newErrors.otp =
        "OTP must be 4 digits.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error(
        "Please fix the form errors."
      );

      return;
    }

    // Password validation
    if (passwordError) {
      toast.error(
        "Please fix password requirements."
      );

      return;
    }

    setIsLoading(true);

    try {
      // =====================================================
      // SIGNUP PAYLOAD
      // =====================================================

      const payload = {
        ...formData,

        userName:
          formData.userName.trim(),

        // ===================================================
        // REFERRAL
        // ===================================================
        //
        // URL:
        //
        // ?reffrel=6759564
        //
        // OR
        //
        // ?referral=6759564
        //
        // referralKey explicitly send hoga.
        //
        ...(params.referral
          ? {
              referralKey:
                params.referral,
            }
          : {}),
      };

      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "========== SIGNUP PAYLOAD =========="
      );

      console.log(payload);

      console.log(
        "Referral Key:",
        payload.referralKey
      );

      console.log(
        "Created By:",
        payload.createdBy
      );

      console.log(
        "===================================="
      );

      // =====================================================
      // API
      // =====================================================

      const response =
        await signUp(payload);

      // =====================================================
      // SUCCESS
      // =====================================================

      if (response?.success) {
        toast.success(
          "Registration Successful!"
        );

        navigate("/", {
          replace: true,
        });
      } else {
        toast.error(
          response?.data?.message ||
            "Something went wrong"
        );
      }
    } catch (error) {
      console.error(
        "Signup Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // VALIDATIONS
  // =========================================================

  const isMobileValid =
    formData.mobile &&
    /^\d{10}$/.test(
      formData.mobile
    );

  // =========================================================
  // FETCH LOGO / FAVICON
  // =========================================================

  useEffect(() => {
    if (
      !siteLogo &&
      !siteFavIcon &&
      !siteName
    ) {
      return;
    }

    const fetchAssets = async () => {
      try {
        const [
          logoPresigned,
          favIconPresigned,
        ] = await Promise.all([
          siteLogo
            ? generatePresignedUrl(
                siteLogo
              )
            : Promise.resolve(null),

          siteFavIcon
            ? generatePresignedUrl(
                siteFavIcon
              )
            : Promise.resolve(null),
        ]);

        if (logoPresigned) {
          setLogoUrl(
            logoPresigned
          );
        }

        if (favIconPresigned) {
          setFavIconUrl(
            favIconPresigned
          );
        }

        if (siteName) {
          document.title =
            siteName;
        }
      } catch (error) {
        console.error(
          "Error fetching site assets:",
          error
        );

        toast.error(
          "Failed to load site assets. Please try again."
        );
      }
    };

    fetchAssets();
  }, [
    siteLogo,
    siteFavIcon,
    siteName,
  ]);

  // =========================================================
  // RAFTAAR CLUB UI
  // =========================================================

  if (
    window.location.host ===
    "raftaarclub.com"
  ) {
    return (
      <div className="min-h-screen bg-[#04101f] flex items-center justify-center p-4 relative overflow-hidden">

        {/* ===================================================
            DECORATIVE DIAGONAL GLOW — TOP LEFT
        =================================================== */}

        <div className="pointer-events-none absolute -top-10 -left-10 w-56 h-56 opacity-70">
          <div className="absolute w-[2px] h-40 bg-gradient-to-b from-[#3ee06a] to-transparent rotate-45 top-0 left-6 blur-[0.5px]" />

          <div className="absolute w-[2px] h-32 bg-gradient-to-b from-[#3ee06a] to-transparent rotate-45 top-6 left-16 blur-[0.5px]" />

          <div className="absolute w-[2px] h-24 bg-gradient-to-b from-[#3ee06a] to-transparent rotate-45 top-10 left-24 blur-[0.5px]" />
        </div>

        {/* ===================================================
            DECORATIVE DIAGONAL GLOW — BOTTOM RIGHT
        =================================================== */}

        <div className="pointer-events-none absolute -bottom-10 -right-10 w-56 h-56 opacity-70">
          <div className="absolute w-[2px] h-40 bg-gradient-to-t from-[#3ee06a] to-transparent rotate-45 bottom-0 right-6 blur-[0.5px]" />

          <div className="absolute w-[2px] h-32 bg-gradient-to-t from-[#3ee06a] to-transparent rotate-45 bottom-6 right-16 blur-[0.5px]" />

          <div className="absolute w-[2px] h-24 bg-gradient-to-t from-[#3ee06a] to-transparent rotate-45 bottom-10 right-24 blur-[0.5px]" />
        </div>

        {/* ===================================================
            DOT TEXTURE
        =================================================== */}

        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize:
              "10px 10px",
          }}
        />

        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize:
              "10px 10px",
          }}
        />

        {/* ===================================================
            CLOSE BUTTON
        =================================================== */}

        <button
          onClick={() =>
            navigate("/")
          }
          className="absolute top-6 right-6 w-9 h-9 rounded-md border border-[#3ee06a] flex items-center justify-center text-[#3ee06a] hover:bg-[#3ee06a]/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* ===================================================
            MAIN
        =================================================== */}

        <div className="w-full max-w-sm relative z-10">

          {/* =================================================
              LOGO
          ================================================= */}

          <div className="flex justify-center mb-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-20 object-contain"
              />
            ) : (
              <span className="text-white font-black text-3xl italic">
                {siteName ||
                  "Raftaar"}
              </span>
            )}
          </div>

          {/* =================================================
              HEADING
          ================================================= */}

          <div className="text-center mb-6">
            <h1 className="text-white text-[24px] font-extrabold leading-tight">
              Join{" "}
              <span className="text-[#3ee06a]">
                Raftaar Club
              </span>
            </h1>

            <p className="text-[#9baabf] text-[13px] font-sans mt-1 leading-snug">
              Create your account and
              start your winning journey
              with us
            </p>

            <div className="mx-auto mt-4 w-40 h-[2px] bg-gradient-to-r from-transparent via-[#3ee06a] to-transparent" />
          </div>

          {/* =================================================
              REFERRAL INDICATOR
          ================================================= */}

          {params.referral && (
            <div className="mb-4 text-center">
              <p className="text-[#3ee06a] text-xs font-bold">
                Referral signup
              </p>
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >

            {/* ===============================================
                MOBILE
            =============================================== */}

            <div className="relative">
              <div className="flex items-center bg-[#0a1a33] border border-[#1c2c4a] rounded-xl px-4 h-[54px] gap-2">

                <Phone
                  size={18}
                  className="text-[#3ee06a] flex-shrink-0"
                />

                <span className="flex items-center gap-1 text-white text-[14px] font-sans flex-shrink-0 pr-2 border-r border-[#1c2c4a]">
                  <span>
                    🇮🇳
                  </span>

                  <ChevronDown
                    size={14}
                    className="text-[#9baabf]"
                  />

                  <span className="ml-1">
                    +91
                  </span>
                </span>

                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile number"
                  value={
                    formData.mobile
                  }
                  onChange={
                    handleMobileChange
                  }
                  className="flex-1 bg-transparent focus:shadow-none text-white placeholder-[#5c6780] text-[14px] font-sans outline-none border-none min-w-0"
                />

                {/* <button
                  type="button"
                  onClick={
                    handleGetOTP
                  }
                  disabled={
                    !isMobileValid ||
                    isOtpLoading
                  }
                  className="px-4 py-2 text-[12px] rounded-lg text-white font-bold flex-shrink-0 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(180deg, ${
                      loginBtnColor?.start ||
                      "#3ee06a"
                    }, ${
                      loginBtnColor?.end ||
                      "#1f9c48"
                    })`,
                  }}
                >
                  {isOtpLoading
                    ? "..."
                    : "Get OTP"}
                </button> */}
              </div>

              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* ===============================================
                OTP
            =============================================== */}

            {otpSent && (
              <div>
                <div className="relative flex items-center bg-[#0a1a33] border border-[#1c2c4a] rounded-xl px-4 h-[54px] gap-2">

                  <ShieldCheck
                    size={18}
                    className="text-[#3ee06a] flex-shrink-0"
                  />

                  <span className="text-[#5c6780] text-[14px] font-sans flex-shrink-0">
                    Enter OTP
                  </span>

                  <div className="flex-1 flex items-center justify-end gap-1.5">
                    {Array.from({
                      length: 4,
                    }).map(
                      (_, i) => {
                        const digit =
                          (
                            formData.otp ||
                            ""
                          )[i];

                        return (
                          <div
                            key={i}
                            className="w-7 h-9 rounded-md bg-[#132a4d] border border-[#1c2c4a] flex items-center justify-center text-white text-[14px] font-bold"
                          >
                            {digit ? (
                              digit
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3a4a63]" />
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  <input
                    type="number"
                    id="otp"
                    name="otp"
                    value={
                      formData.otp
                    }
                    onChange={
                      handleOtpChange
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                  />
                </div>

                {errors.otp && (
                  <p className="text-red-500 text-xs mt-1 pl-1">
                    {errors.otp}
                  </p>
                )}
              </div>
            )}

            {/* ===============================================
                PASSWORD
            =============================================== */}

            <div className="relative">
              <div className="flex items-center bg-[#0a1a33] border border-[#1c2c4a] rounded-xl px-4 h-[54px] gap-2">

                <Lock
                  size={18}
                  className="text-[#3ee06a] flex-shrink-0"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleInputChange
                  }
                  className="flex-1 bg-transparent focus:shadow-none text-white placeholder-[#5c6780] text-[14px] font-sans outline-none border-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  className="text-[#9baabf] hover:text-white transition-colors flex-shrink-0"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.password}
                </p>
              )}

              {passwordError && (
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {passwordError}
                </p>
              )}
            </div>

            {/* ===============================================
                CONFIRM PASSWORD
            =============================================== */}

            <div className="relative">
              <div className="flex items-center bg-[#0a1a33] border border-[#1c2c4a] rounded-xl px-4 h-[54px] gap-2">

                <Lock
                  size={18}
                  className="text-[#3ee06a] flex-shrink-0"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={
                    handleInputChange
                  }
                  className="flex-1 bg-transparent focus:shadow-none text-white placeholder-[#5c6780] text-[14px] font-sans outline-none border-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  className="text-[#9baabf] hover:text-white transition-colors flex-shrink-0"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {
                    errors.confirmPassword
                  }
                </p>
              )}
            </div>

            {/* ===============================================
                BUTTON
            =============================================== */}

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[54px] rounded-full text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(62,224,106,0.35)] disabled:opacity-60"
                style={{
                  background: `linear-gradient(180deg, ${
                    loginBtnColor?.start ||
                    "#3ee06a"
                  }, ${
                    loginBtnColor?.end ||
                    "#1f9c48"
                  })`,
                }}
              >
                {isLoading ? (
                  <span>
                    Signing up...
                  </span>
                ) : (
                  <>
                    <span>
                      Sign Up
                    </span>

                    <ChevronRight
                      size={18}
                    />
                  </>
                )}
              </button>

              {/* =============================================
                  OR
              ============================================= */}

              <div className="flex items-center gap-3 py-1">
                <span className="flex-1 h-px bg-[#1c3a28]" />

                <span className="text-[#3ee06a] text-[12px] font-sans font-bold">
                  OR
                </span>

                <span className="flex-1 h-px bg-[#1c3a28]" />
              </div>
            </div>

            {/* ===============================================
                LOGIN
            =============================================== */}

            <p className="text-center text-[#9baabf] text-[13px] font-sans pt-1">
              Already have an account?{" "}

              <Link
                to="/login"
                className="text-[#3ee06a] font-bold"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================
  // DEFAULT UI FOR OTHER DOMAINS
  // =========================================================

  return (
    <div
      className="h-screen overflow-hidden flex flex-col items-center justify-center p-4 px-10 sm:px-0 relative"
      style={{
        background: `linear-gradient(-180deg, ${
          loginBgColor?.start ||
          "#000"
        } 0%, ${
          loginBgColor?.end ||
          "#000"
        } 100%)`,
      }}
    >

      {/* CLOSE */}

      <button
        className="absolute top-6 right-6 text-black p-1 text-bold rounded-md hover:text-gray-700 transition-colors"
        onClick={() =>
          navigate("/")
        }
        style={{
          backgroundImage: `linear-gradient(180deg, ${
            loginBtnColor?.start ||
            "#000"
          }, ${
            loginBtnColor?.end ||
            "#000"
          })`,
        }}
      >
        <X
          size={24}
          color="white"
        />
      </button>

      <div className="w-full max-w-sm space-y-8">

        {/* LOGO */}

        <div className="flex justify-center">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={siteName}
              className="h-14"
            />
          )}
        </div>

        {/* REFERRAL INDICATOR */}

        {params.referral && (
          <div className="text-center">
            <p className="text-white text-sm">
              Referral signup
            </p>
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >

          {/* MOBILE */}

          <div className="relative">
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile number"
              value={
                formData.mobile
              }
              onChange={
                handleMobileChange
              }
              className={`w-full px-4 py-3 pr-12 bg-white rounded-lg border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                errors.mobile
                  ? "border-red-500"
                  : ""
              }`}
            />

            <button
              type="button"
              className="px-4 py-2 absolute right-2 text-xs top-2 rounded-lg border-0 text-white placeholder-gray-500 focus:outline-none focus:ring-2"
              onClick={
                handleGetOTP
              }
              disabled={
                !isMobileValid ||
                isOtpLoading
              }
              style={{
                background: `linear-gradient(180deg, ${
                  loginBtnColor?.start ||
                  "#045662"
                }, ${
                  loginBtnColor?.end ||
                  "#045662"
                })`,
              }}
            >
              {isOtpLoading ? (
                <span className="font-bold">
                  ...
                </span>
              ) : (
                <span className="font-bold">
                  Get OTP
                </span>
              )}
            </button>

            {errors.mobile && (
              <p className="text-red-500 text-xs mt-1">
                {errors.mobile}
              </p>
            )}
          </div>

          {/* OTP */}

          {otpSent && (
            <div className="mb-3">
              <input
                type="number"
                id="otp"
                name="otp"
                className={`w-full px-4 py-3 pr-12 bg-white rounded-lg border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                  errors.otp
                    ? "border-red-500"
                    : ""
                }`}
                placeholder="Enter OTP"
                value={
                  formData.otp
                }
                onChange={
                  handleOtpChange
                }
              />

              {errors.otp && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.otp}
                </p>
              )}
            </div>
          )}

          {/* PASSWORD */}

          <div className="relative">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Password"
              value={
                formData.password
              }
              onChange={
                handleInputChange
              }
              className={`w-full px-4 py-3 pr-12 bg-white rounded-lg border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500"
                  : ""
              }`}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (prev) =>
                    !prev
                )
              }
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showPassword ? (
                <EyeOff
                  size={20}
                  fill="black"
                />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password}
            </p>
          )}

          {passwordError && (
            <p className="text-red-500 text-xs mt-1">
              {passwordError}
            </p>
          )}

          {/* CONFIRM PASSWORD */}

          <div className="relative">
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              placeholder="Confirm Password"
              value={
                formData.confirmPassword
              }
              onChange={
                handleInputChange
              }
              className={`w-full px-4 py-3 pr-12 bg-white rounded-lg border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-500"
                  : ""
              }`}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (prev) =>
                    !prev
                )
              }
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff
                  size={20}
                  fill="black"
                />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {
                errors.confirmPassword
              }
            </p>
          )}

          {/* SUBMIT */}

          <div className="space-y-1.5 pt-4">
            <button
              type="submit"
              className="w-full py-3 font-bold rounded-lg transition-colors duration-200 flex justify-center items-center space-x-3 disabled:opacity-60"
              disabled={isLoading}
              style={{
                background: `linear-gradient(180deg, ${
                  loginBtnColor?.start ||
                  "#045662"
                }, ${
                  loginBtnColor?.end ||
                  "#045662"
                })`,
                color:
                  siteDetails?.loginButtonTextColor ||
                  "#ffffff",
              }}
            >
              {isLoading ? (
                <span>
                  Signing up...
                </span>
              ) : (
                <span>
                  Sign Up
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}