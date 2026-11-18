import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { TbLogin2 } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";

import {
  getUserData,
  getUserId,
  selectSite,
  IsSignUpButton,
  selectSiteFevicon,
  selectSiteLoginColor,
  selectSiteLogo,
  selectSiteName,
  selectSiteSignUpColor,
} from "../../../../utils/helper/commonSelectors";

import {
  generatePresignedUrl,
  formatS3PathStyle,
} from "../../../../utils/helper/generatePresignedUrl";
import { fetchuserdata, getCasinoBalance } from "../../../../api";

import {
  updateAvailableBalance,
  updateExposureBalance,
} from "../../../../redux/slices/userSlice";

import { IoSettingsSharp } from "react-icons/io5";

import { updateSiteCasinoSlice } from "../../../../redux/slices/siteCasinoSlice";
import { toast } from "react-toastify";

import OpenBets from "../OpenBets/OpenBets";
import ThreeDotsLoader from "../../../../utils/ThreeDotsLoader";
import { useGradientColor } from "../../hooks/useThemeColors";
import { usePrimaryColor } from "./../../hooks/useThemeColors";

import { displayAuthModal } from "../../../../redux/slices/authModalSlice";
import Bets from "../../../../CommonComponents/Svg/Bets";
import ExposureDetailPopup from "../ExposureDetailsModel/exposure-detail-popup";
import { FaSignInAlt } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";

function TopHeader({ headerColor = { start: "#315195", end: "#14213D" } }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showModal: reduxShowModal } = useSelector(
    (state) => state?.authModal,
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const siteName = useSelector(selectSiteName());
  const siteLogo = useSelector(selectSiteLogo());
  const siteFavIcon = useSelector(selectSiteFevicon());
  const LoginBtnColor = useSelector(selectSiteLoginColor());
  const SignUpBtnColor = useSelector(selectSiteSignUpColor());
  const SignUpButton = useSelector(IsSignUpButton());

  const reduxIsLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const reduxUserData = useSelector(getUserData());
  const reduxUserId = useSelector(getUserId());
  const isRehydrated = useSelector((state) => state?._persist?.rehydrated);
  const siteDetails = useSelector(selectSite());

  const nprSavedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("npr_user") || localStorage.getItem("userdata");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const hasToken = useMemo(() => {
    try {
      return Boolean(localStorage.getItem("token"));
    } catch {
      return false;
    }
  }, []);

  const isLoggedIn = useMemo(() => {
    if (reduxIsLoggedIn) return true;
    if (hasToken && nprSavedUser) return true;
    if (isRehydrated) return false;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem("isLoggedIn") === "true";
      }
    } catch {
      return false;
    }
    return false;
  }, [reduxIsLoggedIn, hasToken, nprSavedUser, isRehydrated]);

  const userData = useMemo(() => {
    if (!isLoggedIn) return null;
    if (reduxUserData) return reduxUserData;
    if (nprSavedUser) return nprSavedUser;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem("userData");
        return raw ? JSON.parse(raw) : null;
      }
    } catch {
      return null;
    }
    return null;
  }, [isLoggedIn, reduxUserData, nprSavedUser]);

  const userId = isLoggedIn ? (reduxUserId || userData?._id) : null;

  const loginBgColor = siteDetails?.loginBgColor;

  const [favIconUrl, setFavIconUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [openBetsSide, setOpenBetsSide] = useState("");

  const gradientColor = useGradientColor();

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

        if (siteFavIcon) {
          const favPresigned = await generatePresignedUrl(siteFavIcon);
          setFavIconUrl(favPresigned);
        }

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

  const fetchBalanceData = useCallback(async () => {
    if (!userId) return;
    setIsLoadingBalance(true);
    try {
      const res = await fetchuserdata(userId);
      if (res?.success) {
        dispatch(updateAvailableBalance(res?.data?.userdata?.availableBalance));
        dispatch(updateExposureBalance(res?.data?.userdata?.exposure));
      }
    } catch (error) {
      console.error("Error fetching balance data:", error);
      toast.error("Failed to fetch balance");
    } finally {
      setIsLoadingBalance(false);
    }
  }, [userId, dispatch]);

  // const fetchData = async () => {
  //   try {
  //     const res = await getCasinoBalance({
  //       domainId: siteDetails?.domainName?._id || "",
  //       userDomainId: siteDetails?.domainName?._id || "",
  //     });
  //     dispatch(updateSiteCasinoSlice(res?.data?.data));
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  const handleLoginClick = () => setShowModal(true);
  const handleSignUpClick = () => navigate("/signup");
  const handleConfirm = () => {
    setShowModal(false);
    dispatch(displayAuthModal(""));
    navigate("/login");
  };
  const handleExit = () => {
    setShowModal(false);
    dispatch(displayAuthModal(""));
  };
  const handleOpenBets = () => setOpenBetsSide("bets");
  const handleRefreshBalance = () => fetchBalanceData();
  const handleClickSetting = () => navigate("/settings");

  return (
    <div className="fixed top-0 z-40 w-full">
      <Helmet>
        {favIconUrl && <link rel="icon" href={favIconUrl} />}
        <title>{siteName || "Exchange"}</title>
      </Helmet>

      {/* Universal Aura Top Header - Golden Yellow theme matching reference */}
      <div
        className="w-full text-black flex items-center justify-between px-3 shadow-xs select-none"
        style={{
          background: "#FDBB14",
          height: "60px",
        }}
      >
        {/* Left Side: Bets button (NO back button - exact match with reference) */}
        <div className="flex items-center">
          <div
            className="flex items-center gap-2 font-black text-black border border-black/25 bg-[#FFCA28] hover:bg-[#ffd54f] rounded-[6px] text-[15px] px-3.5 h-[38px] cursor-pointer select-none active:scale-95 transition shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
            onClick={handleOpenBets}
          >
            <Bets width="20px" height="20px" />
            <span>Bets</span>
          </div>
        </div>

        {/* Right Side: Main JSB Balance / Exposure / Refresh / Settings */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col text-[11px] leading-tight font-medium text-right">
            <span className="truncate max-w-[130px] text-[#4a3500]">
              Main <strong className="text-black font-black text-[13px]">JSB {Number((userData?.availableBalance ?? 0) - (userData?.exposure ?? 0)).toFixed(2)}</strong>
            </span>
            <span onClick={handleOpenPopup} className="cursor-pointer text-[#4a3500]">
              Exposure <strong className="text-black font-black text-[13px]">{Number(userData?.exposure ?? 0).toFixed(2)}</strong>
            </span>
          </div>

          <button
            className="w-[38px] h-[38px] flex items-center justify-center text-black border border-black/25 rounded-[6px] bg-[#FFCA28] hover:bg-[#ffd54f] active:scale-95 transition cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
            onClick={handleRefreshBalance}
            title="Refresh Balance"
          >
            <IoMdRefresh size={22} className={isLoadingBalance ? "animate-spin" : ""} />
          </button>

          <button
            className="w-[38px] h-[38px] flex items-center justify-center text-black border border-black/25 rounded-[6px] bg-[#FFCA28] hover:bg-[#ffd54f] active:scale-95 transition cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
            onClick={() => navigate("/members")}
            title="Settings"
          >
            <IoSettingsSharp size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(showModal || reduxShowModal === "login") && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60 px-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.3 }}
              className="text-white p-4  max-w-md w-full text-center relative"
              style={{
                background: `linear-gradient(-180deg, ${loginBgColor?.start} 0%, ${loginBgColor?.end} 100%)`,
              }}
            >
              <button
                className="h-7 w-7 absolute top-0.5 right-0.5 text-black text-lg font-bold bg-[#FD8F3B]"
                style={{ borderRadius: "50%" }}
                onClick={handleExit}
              >
                ×
              </button>
              <h2 className="text-md mt-5 font-bold">Non-Gambling Territories.</h2>
              <hr className="my-4 mb-4" />
              <p className="text-sm text-[14px] leading-[21px] font-bold mb-9">
                Connecting to our site from non gambling countries, it will be
                User's responsibility to ensure that their use of the service is
                lawful.
              </p>
              <p className="font-bold">Underage gambling is prohibited.</p>
              <hr className="my-4" />
              <p className="mb-9 text-[14px] font-bold">
                Please confirm if you are 18 years old and above as of today.
              </p>
              <div className="flex justify-center items-center pr-3 gap-2.5">
                <button
                  onClick={handleConfirm}
                  className="bg-white text-black px-1 text-[13px] rounded font-black h-[30px] w-[26vw]"
                >
                  Confirm
                </button>
                <button
                  onClick={handleExit}
                  className="border border-[white] bg-[black] text-white px-1 text-[13px] rounded font-bold h-[30px] w-[26vw]"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OpenBets openSide={openBetsSide} closeBets={() => setOpenBetsSide("")} />
      <AnimatePresence>
        {isPopupOpen && (
          <ExposureDetailPopup onClose={handleClosePopup} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TopHeader;
