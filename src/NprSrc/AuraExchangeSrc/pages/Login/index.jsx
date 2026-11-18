import { useEffect, useState, useCallback } from "react";

import {
  X,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  selectSiteLoginColor,
  selectSiteLogo,
  selectDomainID, // Fixed naming convention
  selectSiteName,
  selectSiteFevicon,
  IsSignUpButton,
  selectSite,
} from "../../../../utils/helper/commonSelectors";
import { loginSuccess } from "../../../../redux/slices/userSlice";
import { setAccountType } from "../../../../redux/slices/accountSlice";
import { createLoginRecord } from "../../../../api";

import Loader from "../../../../utils/Loader";
import {
  generatePresignedUrl,
  formatS3PathStyle,
} from "../../../../utils/helper/generatePresignedUrl";
import API, {
  refreshSessionExpiryTimer,
} from "../../../../api/axios";
import ExposureToast from "../../components/ExposureToast";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const domainId = useSelector(selectDomainID());

  const loginBtnColor = useSelector(selectSiteLoginColor());

  const siteName = useSelector(selectSiteName());
  const siteLogo = useSelector(selectSiteLogo());
  const siteFavIcon = useSelector(selectSiteFevicon());
  const [logoUrl, setLogoUrl] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const cached = localStorage.getItem("siteLogoUrl");
        return cached ? formatS3PathStyle(cached) : null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    domainId: domainId || "", // Ensure domainId is not undefined
    x_panel_type: "user",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState({ demo: false, real: false });
  const previousRoute = useSelector((state) => state.route.previousRoute);

  const siteDetails = useSelector(selectSite());

  const loginBgColor = siteDetails?.loginBgColor;

  const SignUpButton = useSelector(IsSignUpButton());

  // Site/domain configuration can arrive asynchronously after this page mounts.
  useEffect(() => {
    if (!domainId) return;
    setFormData((prev) =>
      prev.domainId === domainId ? prev : { ...prev, domainId },
    );
  }, [domainId]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const LOGIN_SESSION_DURATION = 2 * 60 * 60 * 1000;

  // const LOGIN_SESSION_DURATION = 10 * 1000;

  const saveLoginExpiry = () => {
    const expiryTime = Date.now() + LOGIN_SESSION_DURATION;
    localStorage.setItem("loginExpiryAt", String(expiryTime));
    refreshSessionExpiryTimer();
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm() || loading.real) return;

      setLoading((prev) => ({ ...prev, real: true }));
      const loginStartedAt = Date.now();

      try {
        // The API controller reads domainid from the request header.
        const requestDomainId =
          siteDetails?.domainDetails?._id ||
          domainId ||
          formData.domainId ||
          "";

        if (!requestDomainId) {
          throw new Error("Site configuration is not ready. Please try again.");
        }

        const payload = {
          userName: formData.userName.trim(),
          password: formData.password,
          x_panel_type: formData.x_panel_type || "user",
        };

        const { data: response } = await API.post(
          "/api/v1/users/login",
          payload,
          {
            headers: { Domainid: requestDomainId },
          },
        );

        console.info("[LOGIN API PERFORMANCE]", {
          totalMs: Date.now() - loginStartedAt,
          result: response?.success ? "SUCCESS" : "FAILED",
        });

        if (response?.success) {
          const { token, userdata } = response;
          saveLoginExpiry();

          toast.dismiss();
          toast.success(
            <ExposureToast
              type="success"
              subtitle="User successfully logged in"
            />,
          );

          localStorage.setItem("userId", userdata?._id || "");

          dispatch(
            loginSuccess({
              userData: userdata,
              loggedInType: "real",
              token,
            }),
          );

          dispatch(setAccountType({ userData: userdata, type: "real" }));

          const targetRoute =
            previousRoute && previousRoute !== "/login" && previousRoute !== "/"
              ? previousRoute
              : "/cricket";
          navigate(targetRoute, { replace: true });

          createLoginRecord().catch((err) =>
            console.error("Login record error:", err),
          );
        } else {
          const message = response?.message || "";
          const errorMessage = message
            .toLowerCase()
            .includes("your account has been")
            ? message
            : message || "Invalid Login Details.";

          toast.error(<ExposureToast type="error" subtitle={errorMessage} />);
        }
      } catch (error) {
        console.error("Login API error:", error);

        const message = error?.response?.data?.message || error?.message || "";
        const errorMessage = message
          .toLowerCase()
          .includes("your account has been")
          ? message
          : error?.code === "ECONNABORTED"
            ? "Login request timed out. Please try again."
            : message && message !== "Network Error"
              ? message
              : "Unable to connect. Please check your internet and try again.";

        toast.error(<ExposureToast type="error" subtitle={errorMessage} />);
      } finally {
        setLoading((prev) => ({ ...prev, real: false }));
      }
    },
    [
      dispatch,
      domainId,
      formData,
      loading.real,
      navigate,
      previousRoute,
      siteDetails,
      validateForm,
    ],
  );

  const handleDemoAccount = useCallback(async () => {
    setLoading((prev) => ({ ...prev, demo: true }));
    try {
      // TODO: Replace with actual API call for demo account creation
      const res = {
        data: {
          token: "demo_token",
          userdata: {
            _id: "Demo",
            name: "Demo",
            userName: "Democlient",
            commission: 0,
            openingBalance: 0,
            creditReference: 0,
            partnership: 0,
            currency: "INR",
            mobile: "NA",
            exposureLimit: 0,
            exposure: "00",
            availableBalance: "000",
            refProfitLoss: 0,
            domain: "NA",
            status: "active",
            deleted: false,
            deviceIp: "NA",
            isOnline: false,
            createdBy: "NA",
            ownerDomainId: "NA",
            isVerified: true,
            createdAt: new Date().toISOString(),
            isReadOnly: false,
          },
        },
      };

      const { token, userdata } = res.data;
      saveLoginExpiry();

      dispatch(setAccountType({ type: "demo" }));
      dispatch(
        loginSuccess({
          userData: userdata,
          loggedInType: "demo",
          token,
        }),
      );

      toast.dismiss();
      toast.success(
        <ExposureToast type="success" subtitle="User sucsessfull loged" />,
      );
      const targetRoute =
        previousRoute && previousRoute !== "/login" && previousRoute !== "/"
          ? previousRoute
          : "/cricket";
      navigate(targetRoute, { replace: true });
      // const response = await getCurrentRecord();
    } catch (error) {
      console.error("Error creating demo account:", error);
      toast.error("Failed to create demo account. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, demo: false }));
    }
  }, [dispatch, navigate, previousRoute]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const cachedLogo = localStorage.getItem("siteLogoUrl");
        const cachedLogoKey = localStorage.getItem("siteLogoKey");

        if (cachedLogo && cachedLogoKey === siteLogo) {
          setLogoUrl(formatS3PathStyle(cachedLogo));
        } else if (siteLogo) {
          const logoPresigned = await generatePresignedUrl(siteLogo);
          setLogoUrl(logoPresigned);
          localStorage.setItem("siteLogoUrl", logoPresigned);
          localStorage.setItem("siteLogoKey", siteLogo);
        }

        // if (siteFavIcon) {
        //   const favPresigned = await generatePresignedUrl(siteFavIcon);
        //   setFavIconUrl(favPresigned);
        // }

        if (siteName) {
          document.title = siteName;
        }
      } catch (error) {
        console.error("Error fetching site assets:", error);
      }
    };

    if (siteLogo || siteFavIcon || siteName) {
      fetchAssets();
    }
  }, [siteLogo, siteFavIcon, siteName]);

  if (window.location.host === "raftaarclub.com") {
    return (
      <div className="min-h-screen bg-[#04101f] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative diagonal glow streaks — top-left */}
        <div className="pointer-events-none absolute -top-10 -left-10 w-56 h-56 opacity-70">
          <div className="absolute w-[2px] h-40 bg-gradient-to-b from-[#3ee06a] to-transparent rotate-45 top-0 left-6 blur-[0.5px]" />
          <div className="absolute w-[2px] h-32 bg-gradient-to-b from-[#3ee06a] to-transparent rotate-45 top-6 left-16 blur-[0.5px]" />
          <div className="absolute w-[2px] h-24 bg-gradient-to-b from-[#3ee06a] to-transparent rotate-45 top-10 left-24 blur-[0.5px]" />
        </div>

        {/* Decorative diagonal glow streaks — bottom-right */}
        <div className="pointer-events-none absolute -bottom-10 -right-10 w-56 h-56 opacity-70">
          <div className="absolute w-[2px] h-40 bg-gradient-to-t from-[#3ee06a] to-transparent rotate-45 bottom-0 right-6 blur-[0.5px]" />
          <div className="absolute w-[2px] h-32 bg-gradient-to-t from-[#3ee06a] to-transparent rotate-45 bottom-6 right-16 blur-[0.5px]" />
          <div className="absolute w-[2px] h-24 bg-gradient-to-t from-[#3ee06a] to-transparent rotate-45 bottom-10 right-24 blur-[0.5px]" />
        </div>

        {/* Subtle dotted texture on the sides */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />

        {/* Close button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 right-6 w-9 h-9 rounded-md border border-[#3ee06a] flex items-center justify-center text-[#3ee06a] hover:bg-[#3ee06a]/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-20 object-contain"
              />
            ) : (
              <span className="text-white font-black text-3xl italic">
                {siteName || "Raftaar"}
              </span>
            )}
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-white text-[26px] font-extrabold">
              Welcome <span className="text-[#3ee06a]">Back!</span>
            </h1>
            <p className="text-[#9baabf] text-[13.5px] font-sans mt-1">
              Login to continue your winning journey
            </p>
            <div className="mx-auto mt-4 w-40 h-[2px] bg-gradient-to-r from-transparent via-[#3ee06a] to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile number field — bound to the same formData.userName / handleInputChange */}
            <div className="relative">
              <div className="flex items-center bg-[#0a1a33] border border-[#1c2c4a] rounded-xl px-4 h-[54px] gap-2">
                <Phone size={18} className="text-[#3ee06a] flex-shrink-0" />
                <button
                  type="button"
                  className="flex items-center gap-1 text-white text-[14px] font-sans flex-shrink-0 pr-2 border-r border-[#1c2c4a]"
                >
                  <span>🇮🇳</span>
                  <ChevronDown size={14} className="text-[#9baabf]" />
                  <span className="ml-1">+91</span>
                </button>
                <input
                  type="text"
                  name="userName"
                  placeholder="Mobile number"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent focus:shadow-none text-white placeholder-[#5c6780] text-[14px] font-sans outline-none border-none"
                />
              </div>
              {errors.userName && (
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.userName}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="flex items-center bg-[#0a1a33] border border-[#1c2c4a] rounded-xl px-4 h-[54px] gap-2">
                <Lock size={18} className="text-[#3ee06a] flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent focus:shadow-none text-white placeholder-[#5c6780] text-[14px] font-sans outline-none border-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[#9baabf] hover:text-white transition-colors flex-shrink-0"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between px-0.5">
              <label className="flex items-center gap-2 text-[#c7cfdb] text-[13px] font-sans cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="peer sr-only"
                />
                <span className="w-[18px] h-[18px] rounded-[4px] border border-[#3ee06a] flex items-center justify-center peer-checked:bg-[#3ee06a]/20">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="#3ee06a"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Remember me
              </label>

              {SignUpButton && (
                <Link
                  to="/reset-password"
                  className="text-[#3ee06a] text-[13px] font-sans font-bold"
                >
                  Forgot password?
                </Link>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading.real}
                className="w-full h-[54px] rounded-full text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(62,224,106,0.35)]"
                style={{
                  background: `linear-gradient(180deg, ${loginBtnColor?.start || "#3ee06a"
                    }, ${loginBtnColor?.end || "#1f9c48"})`,
                }}
              >
                {loading.real ? (
                  <>
                    <Loader />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 py-1">
                <span className="flex-1 h-px bg-[#1c3a28]" />
                <span className="text-[#3ee06a] text-[12px] font-sans font-bold">
                  OR
                </span>
                <span className="flex-1 h-px bg-[#1c3a28]" />
              </div>

              <button
                type="button"
                onClick={handleDemoAccount}
                disabled={loading.demo}
                className="w-full h-[54px] rounded-full text-white font-bold text-[14.5px] flex items-center justify-center gap-2 bg-[#0a1a33] border border-[#1c2c4a]"
              >
                {loading.demo ? (
                  <>
                    <Loader />
                    <span>Creating Demo...</span>
                  </>
                ) : (
                  <>
                    <User size={18} />
                    <span>Login With Demo ID</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>

            {SignUpButton && (
              <p className="text-center text-[#9baabf] text-[13px] font-sans pt-1">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#3ee06a] font-bold">
                  Sign Up
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="!h-[100vh] flex flex-col items-center justify-center  relative overflow-hidden"
      style={{
        background: `linear-gradient(-180deg, ${loginBgColor?.start} 0%, ${loginBgColor?.end} 100%)`,
      }}
    >
      <button
        className="absolute top-6 right-6 text-black p-1 text-bold rounded-md hover:text-gray-700 transition-colors"
        onClick={() => navigate("/")}
        style={{
          backgroundImage: `linear-gradient(180deg, ${loginBgColor?.buttonBgColor?.start || "#000"
            }, ${loginBgColor?.buttonBgColor?.end || "#000"})`,
        }}
      >
        <X size={24} />
      </button>

      <div className="w-[70%]">
        <div className="flex justify-center">
          {logoUrl && <img src={logoUrl} alt={siteName} className="h-14" />}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          <div className="relative">
            <input
              type="text"
              name="userName"
              placeholder="Username"
              value={formData.userName}
              onChange={handleInputChange}
              className={`w-full px-4 h-[40px] pr-8 bg-white rounded-[5px] border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.userName ? "border-red-500" : ""
                }`}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <User size={20} className="text-gray-600" fill="black" />
            </div>
            {errors.userName && (
              <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 h-[40px] pr-8 bg-white rounded-[5px] border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.password ? "border-red-500" : ""
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-6 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showPassword ? (
                <EyeOff size={20} fill="black" />
              ) : (
                <Eye size={20} />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            {SignUpButton && (
              <div className="text-end text-gray-300 text-sm font-bold pt-2">
                <Link to={"/reset-password"} className="">
                  Forgot Password?
                </Link>
              </div>
            )}
          </div>
          <div className="space-y-1 pt-2">
            <button
              type="submit"
              className="w-full py-3 font-bold rounded-lg transition-colors duration-200 flex justify-center items-center space-x-3"
              disabled={loading.real}
              style={{
                background: `linear-gradient(180deg, ${loginBgColor?.buttonBgColor?.start || "#045662"
                  }, ${loginBgColor?.buttonBgColor?.end || "#045662"})`,
                color: loginBgColor?.buttonTextColor || "#ffffff",
              }}
            >
              {loading.real ? (
                <>
                  <Loader />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleDemoAccount}
              className="w-full py-3  font-bold rounded-lg transition-colors duration-200 flex justify-center items-center space-x-3"
              disabled={loading.demo}
              style={{
                background: `linear-gradient(180deg, ${loginBgColor?.buttonBgColor?.start || "#045662"
                  }, ${loginBgColor?.buttonBgColor?.end || "#045662"})`,
                color: loginBgColor?.buttonTextColor || "#ffffff",
              }}
            >
              {loading.demo ? (
                <>
                  <Loader />
                  <span>Creating Demo...</span>
                </>
              ) : (
                <span>Login with Demo ID</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
