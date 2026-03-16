import { Outlet, useLocation } from "react-router-dom";
import Header from "../Header";
import Footer from "../footer/Footer";
import BottomNav from "../BottomNav";
import { useEffect } from "react";
import {
  subscribeToGreyhoundMatchesData,
  subscribeToHorseMatchesData,
  subscribeToKabaddiMatchesData,
  subscribeToMatchData,
} from "../../../socketClient";

const AppLayout = () => {
  const location = useLocation();

  const hideLayoutRoutes = ["/sport/profile"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

const hideFooterRoutes = [
  "/casino-games",
  "/sports",
  "/full-market",
  "/balance-overview",
  "/bet-history",
  "/myAccount/bank-transfer",
  "/profit-loss-report",
  "/account-statement",
  "/change-password",
  "/activityLog",
];

const hideFooter = hideFooterRoutes.some((route) =>
  location.pathname.startsWith(route)
);

  useEffect(() => {
    subscribeToMatchData({
      eventId: 4,
      competitionId: null,
      matchId: null,
      marketId: null,
      sport: "cricket",
    });
    subscribeToMatchData({
      eventId: 1,
      competitionId: null,
      matchId: null,
      marketId: null,
      sport: "soccer",
    });
    subscribeToMatchData({
      eventId: 2,
      competitionId: null,
      matchId: null,
      marketId: null,
      sport: "tennis",
    });
    subscribeToKabaddiMatchesData();
    subscribeToGreyhoundMatchesData();
    subscribeToHorseMatchesData();
  }, []);

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <div className="pt-[42px]" />}

      <main style={{ minHeight: "80vh" }}>
        <Outlet />
      </main>

      {!hideLayout && !hideFooter && <Footer />}
      <BottomNav />
    </>
  );
};

export default AppLayout;