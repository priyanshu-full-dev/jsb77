import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { TbLogin2 } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { FaHistory } from "react-icons/fa";

import {
  getUserData,
  getUserId,
  selectSite,
  IsSignUpButton,
  selectSiteFevicon,
  selectSiteLoginColor,
  selectSiteLogo,
  selectSiteName,
  selectSiteTopHeaderColor,
} from "../../../../utils/helper/commonSelectors";

import { generatePresignedUrl } from "../../../../utils/helper/generatePresignedUrl";
import { fetchuserdata, getCasinoBalance } from "../../../../api";

import {
  updateAvailableBalance,
  updateExposureBalance,
} from "../../../../redux/slices/userSlice";

import { IoMdRefresh } from "react-icons/io";
import { updateSiteCasinoSlice } from "../../../../redux/slices/siteCasinoSlice";
import { toast } from "react-toastify";

import OpenBets from "../OpenBets/OpenBets";
import ThreeDotsLoader from "../../../../utils/ThreeDotsLoader";
import { useGradientColor } from "../../hooks/useThemeColors";
import { usePrimaryColor } from "./../../hooks/useThemeColors";

import { displayAuthModal } from "../../../../redux/slices/authModalSlice";

import ExposureDetailPopup from "../ExposureDetailsModel/exposure-detail-popup";
import CasinoRules from "../CasinoRules/CasinoRules";

function CasinoHeader({ headerColor = { start: "#315195", end: "#14213D" } }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const TopHeaderColor = useSelector(selectSiteTopHeaderColor());
  const { showModal: reduxShowModal } = useSelector(
    (state) => state?.authModal,
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCasinoOpen, setIsCasinoOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleCasinoRules = () => {
    setIsCasinoOpen(true);
  };

  const handleRulesClose = () => {
    setIsCasinoOpen(false);
  };

  const siteName = useSelector(selectSiteName());
  const siteLogo = useSelector(selectSiteLogo());
  const siteFavIcon = useSelector(selectSiteFevicon());
  const siteLoginButtonColor = useSelector(selectSiteLoginColor());
  const SignUpButton = useSelector(IsSignUpButton());
  const topBarColor = useSelector(
    (state) =>
      state?.site?.siteDetails?.topBarColor || {
        start: "#315195",
        end: "#14213D",
      },
  );

  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const userData = useSelector(getUserData());
  const userId = useSelector(getUserId());
  const siteDetails = useSelector(selectSite());
  const loginBgColor = siteDetails?.loginBgColor;

  const [logoUrl, setLogoUrl] = useState(null);
  const [favIconUrl, setFavIconUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [openBetsSide, setOpenBetsSide] = useState("");
  const PrimaryColor = usePrimaryColor();
  const gradientColor = useGradientColor();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        if (siteLogo) {
          const logoPresigned = await generatePresignedUrl(siteLogo);
          setLogoUrl(logoPresigned);
        }
        if (siteFavIcon) {
          const favIconPresigned = await generatePresignedUrl(siteFavIcon);
          setFavIconUrl(favIconPresigned);
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
    if (!userId || userId === "Demo") {
      setIsLoadingBalance(false);
      return;
    }
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
    <div className="fixed top-0 z-[1000] w-full">
      <Helmet>
        {favIconUrl && <link rel="icon" href={favIconUrl} />}
        <title>{siteName || "Exchange"}</title>
      </Helmet>

      {isLoggedIn ? (
        <div
          className="w-full text-white flex items-center justify-between px-1"
          style={{
            background: `linear-gradient(-180deg, ${headerColor?.start} 0%, ${headerColor?.end} 100%)`,
            height: "56px",
          }}
        >
          <div className="flex gap-2">
            <div
              style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.4)" }}
              className="flex items-center gap-1.5 justify-center font-bold text-white border border-[#0B1933] rounded-sm text-[14px] px-3 h-[40px]"
              onClick={handleCasinoRules}
            >
              Rules
            </div>

            <div
              style={{
                background: `linear-gradient(180deg, ${TopHeaderColor?.start || "#045662"
                  }, ${TopHeaderColor?.end || "#045662"})`,
              }}
              className="w-[72px] flex items-center gap-1 justify-center font-bold text-[black] border border-[#0B1933] rounded-md text-[13px] px-3.5 h-[40px] leading-[14px] text-center cursor-pointer active:scale-95 transition-transform"
              onClick={() => navigate("/casino")}
            >
              GAMING <br /> LOBBY
            </div>
          </div>

          <div className="flex items-center">
            {isLoadingBalance ? (
              <div className="flex flex-col text-[14px] space-y-1 font-[700] mr-5 items-center justify-center">
                <ThreeDotsLoader />
              </div>
            ) : (
              <div className="flex flex-col text-[12px] space-y-1 font-[700] mr-2">
                <span>
                  Main PTI {""}
                  {Math.floor(
                    (userData?.availableBalance || 0) -
                    Number(userData?.exposure || 0).toFixed(2),
                  )}
                </span>
                <span onClick={handleOpenPopup}>
                  Exposure(
                  <span className="text-[red]">
                    {Math.floor(userData?.exposure || 0)}
                  </span>
                  )
                </span>
              </div>
            )}

            <div className="mr-2.5">
              <p
                style={{
                  boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
                }}
                className="px-[1.86667vw] h-[40px] flex items-center justify-center text-white border border-[#0B1933] rounded-sm bg-transparent"
                onClick={handleRefreshBalance}
              >
                <IoMdRefresh size={24} fill="white" />
              </p>
            </div>

            <div>
              <p
                style={{
                  boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
                }}
                className="px-[1.86667vw] h-[40px] flex items-center justify-center text-white border border-[#0B1933] rounded-sm bg-transparent"
                onClick={handleOpenBets}
              >
                <FaHistory size={24} fill="white" />
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="w-full text-white flex items-center justify-between px-2"
          style={{
            background: `linear-gradient(-180deg, ${headerColor?.start} 0%, ${headerColor?.end} 100%)`,
            height: "56px",
          }}
        >
          <Link to="/">
            {logoUrl && (
              <img
                src={logoUrl || "/placeholder.svg"}
                alt={siteName}
                className="h-14"
              />
            )}
          </Link>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 bg-red-500 rounded w-[80px] h-[36px] text-[13px] font-bold justify-center"
              onClick={handleLoginClick}
            >
              Login <TbLogin2 />
            </button>

            {SignUpButton && (
              <button
                className="flex items-center gap-1 rounded w-[80px] h-[36px] text-[13px] font-bold justify-center"
                onClick={handleSignUpClick}
                style={{
                  background: `linear-gradient(-180deg, ${siteLoginButtonColor?.start || "#00A"
                    } 0%, ${siteLoginButtonColor?.end || "#005"} 100%)`,
                }}
              >
                SignUp
              </button>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {(showModal || reduxShowModal === "login") && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60 px-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.3 }}
              className="text-white p-6  max-w-md w-full text-center relative"
              style={{
                background: `linear-gradient(-180deg, ${loginBgColor.start} 0%, ${loginBgColor.end} 100%)`,
              }}
            >
              <button
                className="h-7 w-7 absolute top-0.5 right-0.5 text-black text-lg font-bold bg-[#FD8F3B]"
                style={{ borderRadius: "50%" }}
                onClick={handleExit}
              >
                ×
              </button>
              <h2 className="text-xl font-bold">Non-Gambling Territories.</h2>
              <hr className="my-3" />
              <p className="text-sm mb-3">
                Connecting to our site from non-gambling countries, it will be
                User's responsibility to ensure that their use of the service is
                lawful.
              </p>
              <p className="font-bold">Underage gambling is prohibited.</p>
              <hr className="my-3" />
              <p className="mb-4">
                Please confirm if you are 18 years old and above as of today.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirm}
                  className="bg-white text-black px-4 rounded font-bold h-[30px] w-[35vw]"
                >
                  Confirm
                </button>
                <button
                  onClick={handleExit}
                  className="border border-[white] bg-[black] text-white px-4 rounded font-bold h-[30px] w-[35vw]"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OpenBets openSide={openBetsSide} closeBets={() => setOpenBetsSide("")} />

      {isCasinoOpen && <CasinoRules onClose={handleRulesClose} />}
      <AnimatePresence>
        {isPopupOpen && (
          <ExposureDetailPopup onClose={handleClosePopup} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CasinoHeader;
