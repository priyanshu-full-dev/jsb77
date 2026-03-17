import { useEffect, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import { useDispatch, useSelector } from "react-redux";

import { IoWallet } from "react-icons/io5";
import { getCasinoBalance } from "../../api";
import { updateSiteCasinoSlice } from "../../redux/slices/siteCasinoSlice";
import {
  selectSite,
  selectSiteFevicon,
  selectSiteLogo,
  selectSiteName,
} from "../../utils/helper/commonSelectors";
import { generatePresignedUrl } from "../../utils/helper/generatePresignedUrl";
import { useNavigate, useLocation } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import GoogleTranslate from "../../CommonComponents/GoogleTranslate";

const languages = [
  { name: "ENGLISH", code: "en" },
  { name: "বাংলা", code: "bn" },
  { name: "हिन्दी", code: "hi" },
  { name: "தமிழ்", code: "ta" },
  { name: "తెలుగు", code: "te" },
  { name: "ಕನ್ನಡ", code: "kn" },
  { name: "मराठी", code: "mr" },
  { name: "ગુજરાતી", code: "gu" },
  { name: "বাংলা", code: "bn" },
  { name: "नेपाली", code: "ne" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const siteDetails = useSelector(selectSite());
  const userData = useSelector((state) => state?.user?.userData) || {};
  const navigate = useNavigate();
  const location = useLocation();

  const accountPaths = [
    "/balance-overview",
    "/bet-history",
    "/myAccount/bank-transfer",
    "/profit-loss-report",
    "/account-statement",
    "/change-password",
    "/full-market",
    "/activityLog",
    "/greyhound-market",
    "/horse-market",
  ];

const changeLanguage = (lang) => {
  document.cookie = `googtrans=/en/${lang}; path=/`;


  setTimeout(() => {
    window.location.reload();
  }, 500); 
};
  const showBack = accountPaths.includes(location.pathname);

  const siteName = useSelector(selectSiteName());
  const siteLogo = useSelector(selectSiteLogo());
  const siteFavIcon = useSelector(selectSiteFevicon());

  const dispatch = useDispatch();

  const exposure = Number(userData?.exposure || 0);

  const availableBalance = Number(userData.availableBalance - exposure || 0);

  const fetchData = async () => {
    try {
      const res = await getCasinoBalance({
        domainId: siteDetails?.domainName?._id || "",
        userDomainId: siteDetails?.domainName?._id || "",
      });
      dispatch(updateSiteCasinoSlice(res?.data?.data));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#00723B]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-3 h-[42px]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white text-[14px] font-semibold"
            >
              <IoChevronBack size={20} />
              BACK
            </button>
          ) : (
            <img src={logoUrl} className="h-[22px]"   onClick={() => navigate("/")}/>
          )}
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-1.5 relative">
          {/* Signup */}
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => setShowSignup(true)}
                className="bg-black text-white text-[10px] font-semibold px-[7px] h-[24px] rounded-[5px]"
              >
                SIGNUP
              </button>
              {/* Login */}
              <button
                onClick={() => setShowLogin(true)}
                className="border border-white text-white text-[10px] font-semibold px-[9px] h-[24px] rounded-[5px]  hover:bg-white hover:text-black transition"
              >
                LOGIN
              </button>
            </>
          ) : (
            <>
              {showBack && (
                <div className="flex items-center gap-1 text-[12px] text-[white]">
                  <p>EXP</p>
                  <span className="font-bold"> {exposure?.toFixed(2)}</span>
                </div>
              )}
              <button className="bg-[#08391e] flex gap-1 items-center text-white text-[12px] font-semibold px-[6px] h-[26px] rounded-[5px]">
                <IoWallet />
                <p className="pr-1">CI</p>{" "}
                <span> {availableBalance?.toFixed(2)}</span>
              </button>
            </>
          )}

          {/* Language */}
          <button
            onClick={() => setOpen(!open)}
            className="bg-white text-[#00723B] text-[10px] font-semibold px-1  rounded-[3px] flex items-center"
          >
            EN
            <IoMdArrowDropdown className="text-[16px] text-[black]" />
          </button>

          <GoogleTranslate />

          {/* Dropdown */}
          {open && (
            <div className="absolute -right-2 top-[32px] w-[110px] rounded-md overflow-hidden shadow-lg border border-green-600">
              {languages.map((lang, i) => (
                <div
                  onClick={() => changeLanguage(lang.code)}
                  key={i}
                  className={`px-4 py-2 text-[10px] cursor-pointer border-b border-green-600
                  ${
                    i === 0
                      ? "bg-gray-200 text-green-900 font-semibold"
                      : "bg-[#0b7a3b] text-white hover:bg-[#096a33]"
                  }`}
                >
                  {lang.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  );
};

export default Header;
