import { Suspense, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { Outlet, useLocation } from "react-router-dom";
import MobileBottomNavbar from "../../components/Header/MobileBottomNavbar";
import {
  subscribeToMatchData,
  subscribeToAuraEventsData,
} from "../../../../socketClient";
import { isMobile } from "react-device-detect";
import useTrackPreviousRoute from "../../../../hooks/useTrackPreviousRoute";
import {
  getUserData,
  getUserId,
  isSignupUser,
  selectSite,
  selectSiteHeaderColor,
  selectSiteLoginColor,
  selectSiteTopHeaderColor,
} from "../../../../utils/helper/commonSelectors";

import { useDispatch, useSelector } from "react-redux";
import { fetchuserdata } from "../../../../api";
import { setUserData } from "../../../../redux/slices/userSlice";
import Footer from "../../components/Footer";
import ChangePasswordModal from "../../components/ChangePasswordModal";

import DepositWithdraw from "../../components/Deposit&Withdraw/Deposit&Withdraw";
import RaftaarHome from "../Raftaar/Home";
import { FaWhatsapp } from "react-icons/fa";

function Home() {
  const location = useLocation();

  const headerColor = useSelector(selectSiteHeaderColor());
  const LoginButtonColor = useSelector(selectSiteLoginColor());
  const TopHeaderColor = useSelector(selectSiteTopHeaderColor());

  const userId = useSelector(getUserId());

  const reduxUserData = useSelector(getUserData());
  const userData = useMemo(() => {
    if (reduxUserData) return reduxUserData;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem("userData");
        return raw ? JSON.parse(raw) : null;
      }
    } catch {
      return null;
    }
    return null;
  }, [reduxUserData]);

  const siteData = useSelector(selectSite());

  const [isPassWordModalOpen, setIsPassWordModalOpen] = useState(false);

  const reduxAuth = useSelector((state) => state.user.isLoggedIn);
  const reduxSignupUser = useSelector(isSignupUser());
  const isRehydrated = useSelector((state) => state?._persist?.rehydrated);

  const isAuthenticated = useMemo(() => {
    if (reduxAuth) return true;
    if (isRehydrated) return false;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem("isLoggedIn") === "true";
      }
    } catch {
      return false;
    }
    return false;
  }, [reduxAuth, isRehydrated]);

  const signupUser = useMemo(() => {
    if (!isAuthenticated) return false;
    if (reduxSignupUser !== undefined && reduxSignupUser !== null) {
      return reduxSignupUser;
    }
    if (isRehydrated) return false;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem("userData");
        return raw ? Boolean(JSON.parse(raw)?.isSignupUser) : false;
      }
    } catch {
      return false;
    }
    return false;
  }, [isAuthenticated, reduxSignupUser, isRehydrated]);

  const dispatch = useDispatch();

  // ==================== Password Modal ====================

  useEffect(() => {
    if (
      isAuthenticated &&
      userData?.isFirstLogin === true &&
      userData?.isSignupUser === false
    ) {
      setIsPassWordModalOpen(true);
    }
  }, [isAuthenticated, userData]);

  const handlePasswordChangeSuccess = async () => {
    const res = await fetchuserdata(userId);

    if (res?.success) {
      dispatch(setUserData(res?.data?.userdata));
    }

    setIsPassWordModalOpen(false);
  };

  const hanelclosePasswordModal = () => {
    setIsPassWordModalOpen(false);
  };

  // ==================== Normal Matches Subscription ====================

  // useEffect(() => {
  //   // Step 1: Cricket immediately
  //   subscribeToMatchData({
  //     eventId: 4,
  //     competitionId: null,
  //     matchId: null,
  //     marketId: null,
  //     sport: "cricket",
  //   });

  //   // Step 2: Soccer
  //   const timers = [];

  //   timers.push(
  //     setTimeout(() => {
  //       subscribeToMatchData({
  //         eventId: 1,
  //         competitionId: null,
  //         matchId: null,
  //         marketId: null,
  //         sport: "soccer",
  //       });
  //     }, 300),
  //   );

  //   // Step 3: Tennis
  //   timers.push(
  //     setTimeout(() => {
  //       subscribeToMatchData({
  //         eventId: 2,
  //         competitionId: null,
  //         matchId: null,
  //         marketId: null,
  //         sport: "tennis",
  //       });
  //     }, 600),
  //   );

  //   // Horse
  //   // timers.push(
  //   //   setTimeout(() => {
  //   //     subscribeToMatchData({
  //   //       eventId: 7,
  //   //       competitionId: null,
  //   //       matchId: null,
  //   //       marketId: null,
  //   //       sport: "horse",
  //   //     });
  //   //   }, 900)
  //   // );

  //   // Horse matches
  //   // timers.push(
  //   //   setTimeout(() => {
  //   //     subscribeToHorseMatchesData();
  //   //   }, 1200)
  //   // );

  //   return () => {
  //     timers.forEach(clearTimeout);
  //   };
  // }, []);

  // // ==================== Aura Universe Events ====================

  // useEffect(() => {
  //   const unsubCricket = subscribeToAuraEventsData({ sportId: 4 });
  //   const unsubSoccer = subscribeToAuraEventsData({ sportId: 1 });
  //   const unsubTennis = subscribeToAuraEventsData({ sportId: 2 });
  //   const unsubHorse = subscribeToAuraEventsData({ sportId: 7 });
  //   const unsubGreyhound = subscribeToAuraEventsData({ sportId: 4339 });

  //   return () => {
  //     unsubCricket?.();
  //     unsubSoccer?.();
  //     unsubTennis?.();
  //     unsubHorse?.();
  //     unsubGreyhound?.();
  //   };
  // }, []);

  // Normal Matches — only Cricket
  // useEffect(() => {
  //   subscribeToMatchData({
  //     eventId: 4,
  //     competitionId: null,
  //     matchId: null,
  //     marketId: null,
  //     sport: "cricket",
  //   });
  // }, []);

  // // Aura Universe — only Cricket
  // useEffect(() => {
  //   const unsubCricket = subscribeToAuraEventsData({
  //     sportId: 4,
  //   });

  //   return () => {
  //     unsubCricket?.();
  //   };
  // }, []);

  // ==================== Body Padding ====================

  useEffect(() => {
    const previousPadding = document.body.style.paddingBottom;

    document.body.style.paddingBottom = "0px";

    return () => {
      document.body.style.paddingBottom = previousPadding;
    };
  }, []);

  // ==================== Previous Route ====================

  useTrackPreviousRoute();

  // ==================== Default Theme ====================

  const defaultTheme = useMemo(
    () => ({
      id: "DefaultSiteTheme",
      name: "DefaultSiteTheme",

      Primary: {
        start: TopHeaderColor?.start || "#F6A21E",
        end: TopHeaderColor?.end || "#efae4b",
      },

      PrimaryTextColor: "black",

      SecondaryTextColor: "black",

      Secondary: {
        start: LoginButtonColor?.start || "#000000",
        end: LoginButtonColor?.end || "#000000",
      },

      gradient: {
        start: headerColor?.start || "#000000",
        middle: "#fff",
        end: headerColor?.end || "#ffc011",
      },
    }),
    [TopHeaderColor, LoginButtonColor, headerColor],
  );

  // ==================== Dark Mode ====================

  const [isDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      return true;
    }

    return false;
  });

  // ==================== Selected Theme ====================

  const [selectedTheme, setSelectedTheme] = useState(() => {
    const savedTheme = localStorage.getItem("themeData");

    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  // Keep DefaultSiteTheme in sync when dynamic colors load from server
  useEffect(() => {
    if (TopHeaderColor || headerColor || LoginButtonColor) {
      setSelectedTheme((prev) => {
        if (!prev || prev.id === "DefaultSiteTheme") {
          return defaultTheme;
        }
        return prev;
      });
    }
  }, [TopHeaderColor, headerColor, LoginButtonColor, defaultTheme]);

  // ==================== Sync Theme ====================

  useEffect(() => {
    localStorage.setItem("themeData", JSON.stringify(selectedTheme));

    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    window.dispatchEvent(new Event("themeChanged"));

    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [selectedTheme, isDarkMode]);

  // ==================== Raftaar Domain ====================

  if (window.location.host === "raftaarclub.com") {
    return <RaftaarHome />;
  }

  return (
    <div
      className="bg-light-bg dark:bg-dark-bg"
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div className="raftaarclub.com" />

      {window.location.host !== "raftaarclub.com" && (
        <div className="h-[60px] w-full shrink-0" />
      )}

      {/* ==================== Header ==================== */}

      <Header />

      {/* ==================== Main Content ==================== */}

      <div
        className="sticky top-[60px]"
        style={{
          scrollMargin: "60px",
          scrollSnapMarginTop: "60px",
          scrollMarginBottom: "60px",
          scrollSnapMarginBottom: "60px",
        }}
      >
        {/* ==================== Outlet Section ==================== */}

        {!["/live-casino", "/casino"].includes(location.pathname) && (
          <div
            className="w-full flex-1 min-h-[calc(100vh-140px)]"
            style={{
              height: "auto",
              overflowY: "visible",
            }}
          >
            <Outlet />
          </div>
        )}

        {/* ==================== Footer ==================== */}

        {!["/my-sports", "/inplay"].includes(location.pathname) &&
          !location.pathname.startsWith("/lottery") && <Footer />}

        {/* ==================== Mobile Bottom Space ==================== */}

        <div className="h-[70px] w-full shrink-0" />
      </div>

      {/* =====================================================
          MOBILE BOTTOM NAVBAR
      ===================================================== */}

      <div
        className="w-full"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 9998,
        }}
      >
        <MobileBottomNavbar />
      </div>

      {/* =====================================================
          WHATSAPP FLOATING BUTTON
      ===================================================== */}

      {siteData?.whatsappSupport &&
        !["/my-sports", "/inplay"].includes(location.pathname) && (
          <a
            href={`https://wa.me/${siteData?.whatsappSupport}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="
          fixed
          right-4
          bottom-[85px]
          z-[9999]
          w-[48px]
          h-[48px]
          rounded-full
          bg-[#25D366]
          flex
          items-center
          justify-center
          shadow-[0_4px_18px_rgba(0,0,0,0.35)]
          transition-all
          duration-200
          hover:scale-110
          active:scale-95
        "
        >
          <FaWhatsapp className="text-white text-[28px]" />
        </a>
      )}

      {/* ==================== Change Password ==================== */}

      <ChangePasswordModal
        isOpen={isPassWordModalOpen}
        onClose={hanelclosePasswordModal}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
}

export default Home;
