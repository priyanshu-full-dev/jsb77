import { lazy, Suspense, useEffect, useRef } from "react";
import Header from "../Header";
import { Outlet, useLocation, useParams } from "react-router-dom";
import MobileBottomNavbar from "../Header/MobileBottomNavbar";
import {
  setUserOffline,
  setUserOnline,
  subscribeToGreyhoundMatchesData,
  subscribeToHorseMatchesData,
  subscribeToJoinMyBets,
  subscribeToJoinProfileRoom,
  subscribeToKabaddiMatchesData,
  subscribeToMatchData,
} from "../../../../socketClient";
import {
  getUserId,
  selectSiteHeaderColor,
} from "../../../../utils/helper/commonSelectors";
import { useSelector } from "react-redux";

const CasinoHeader = lazy(() => import("../Header/CasinoHeader"));

function LayoutFullPage() {
  const { gameId } = useParams();
  const currentUserId = useSelector(getUserId());
  const headerColor = useSelector(selectSiteHeaderColor());
  useEffect(() => {
    // Subscribe to all matches for each sport
    subscribeToMatchData({
      eventId: 4, // Cricket
      competitionId: null,
      matchId: null,
      marketId: null,
      sport: "cricket",
    });
    subscribeToMatchData({
      eventId: 1, // Soccer
      competitionId: null,
      matchId: null,
      marketId: null,
      sport: "soccer",
    });
    subscribeToMatchData({
      eventId: 2, // Tennis
      competitionId: null,
      matchId: null,
      marketId: null,
      sport: "tennis",
    });
    subscribeToKabaddiMatchesData();
    subscribeToGreyhoundMatchesData();
    subscribeToHorseMatchesData();
  }, []);
  
  useEffect(() => {
    if (currentUserId) {
      setUserOnline(currentUserId);
      const unsubProfile = subscribeToJoinProfileRoom(currentUserId);
      const unsubBets = subscribeToJoinMyBets(currentUserId);

      return () => {
        setUserOffline(currentUserId);
        if (typeof unsubProfile === "function") unsubProfile();
        if (typeof unsubBets === "function") unsubBets();
      };
    }
  }, [currentUserId]);

  const location = useLocation();
  const hideTopNavforcasino = location.pathname.startsWith("/casino");
  const mainScrollRef = useRef(null);

  // Always reset scroll to top on page/route transition so casino cards never open hidden
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="" style={{ display: "flex", flexDirection: "column" }}>
      {hideTopNavforcasino ? (
        <Suspense fallback={null}>
          <CasinoHeader headerColor={headerColor} />
        </Suspense>
      ) : (
        <Header />
      )}

      <div className="h-[60px] w-full shrink-0" />

      <div
        ref={mainScrollRef}
        style={{ height: "100%", overflowY: "auto", paddingBottom: "100px" }}
      >
        <Outlet />
      </div>

      <div className="w-full mt-4" style={{ position: "fixed", bottom: 0, zIndex:"9999" }}>
        <MobileBottomNavbar />
      </div>
    </div>
  );
}

export default LayoutFullPage;
