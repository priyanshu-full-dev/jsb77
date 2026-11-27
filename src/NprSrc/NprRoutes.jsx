import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home/Home";
import SportsPage from "./pages/Sports/SportsPage";
import CasinoPage from "./pages/Casino/CasinoPage";
import PromotionPage from "./pages/Promotion/PromotionPage";
import MembersPage from "./pages/Members/MembersPage";
import DepositPage from "./pages/Deposit/DepositPage";
import InvitePage from "./pages/Invite/InvitePage";
import WithdrawalPage from "./pages/Withdrawal/WithdrawalPage";
import BetHistoryPage from "./pages/Records/BetHistoryPage";
import LoginPage from "./pages/Auth/LoginPage";

// AuraExchange Imports (inside NprSrc)
import AuraHome from "./AuraExchangeSrc/pages/Home";
import CricketMatchesList from "./AuraExchangeSrc/pages/Sports/Cricket";
import TennisMatchesList from "./AuraExchangeSrc/pages/Sports/Tennis";
import SoccerMatchesList from "./AuraExchangeSrc/pages/Sports/Soccer";
import Inplay from "./AuraExchangeSrc/pages/Inplay";
import QuickLinks from "./AuraExchangeSrc/pages/QuickLinks";
import MultiMarkets from "./AuraExchangeSrc/pages/Account/MultiMarkets";
import BetHistory from "./AuraExchangeSrc/pages/Account/BetHistory";
import ProfitLoss from "./AuraExchangeSrc/pages/Account/ProfitLoss";
import AccountStatement from "./AuraExchangeSrc/pages/Account/account-statement";
import PasswordChangeHistory from "./AuraExchangeSrc/pages/Account/PasswordChangeHistory";
import ActiveLogs from "./AuraExchangeSrc/pages/Account/ActiveLogs";
import Profile from "./AuraExchangeSrc/pages/Account/Profile";
import RollingCommission from "./AuraExchangeSrc/pages/Account/rolling-commission";
import UserSingleBet from "./AuraExchangeSrc/pages/Account/UserSingleBet";
import Account from "./AuraExchangeSrc/pages/Account";
import LayoutFullPage from "./AuraExchangeSrc/components/LayoutFullPage";
import CTSfullMarket from "./AuraExchangeSrc/pages/FullMarket/CTSfullMarket";
import SportsTv from "../CommonComponents/SportsTv";
import ProtectedRoute from "../CommonComponents/ProtectedRoute";

export const NprRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage initialMode="login" />,
  },
  {
    path: "/m/login",
    element: <LoginPage initialMode="login" />,
  },
  {
    path: "/register",
    element: <LoginPage initialMode="register" />,
  },
  {
    path: "/m/register",
    element: <LoginPage initialMode="register" />,
  },
  {
    path: "/forgot-password",
    element: <LoginPage initialMode="forgot" />,
  },
  {
    path: "/m/forgot-password",
    element: <LoginPage initialMode="forgot" />,
  },

  // 1. Main NPR77 Application Layout
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "m/home",
        element: <Home />,
      },
      {
        path: "sports",
        element: <SportsPage />,
      },
      {
        path: "sports/:sport",
        element: <SportsPage />,
      },
      {
        path: "casino",
        element: <CasinoPage />,
      },
      {
        path: "promotion",
        element: <PromotionPage />,
      },
      {
        path: "members",
        element: <MembersPage />,
      },
      {
        path: "m/members",
        element: <MembersPage />,
      },
      {
        path: "deposit",
        element: <DepositPage />,
      },
      {
        path: "m/deposit",
        element: <DepositPage />,
      },
      {
        path: "invite",
        element: <InvitePage />,
      },
      {
        path: "m/invite",
        element: <InvitePage />,
      },
      {
        path: "withdrawal",
        element: <WithdrawalPage />,
      },
      {
        path: "m/withdrawal",
        element: <WithdrawalPage />,
      },
      {
        path: "bet-history",
        element: <BetHistoryPage />,
      },
      {
        path: "m/bet-history",
        element: <BetHistoryPage />,
      },
    ],
  },

  // 2. AuraExchange Sports Layout (Cricket, Tennis, Soccer)
  {
    element: (
      <ProtectedRoute navigateTo="/login">
        <AuraHome />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/cricket",
        element: <CricketMatchesList />,
      },
      {
        path: "/tennis",
        element: <TennisMatchesList />,
      },
      {
        path: "/soccer",
        element: <SoccerMatchesList />,
      },
      {
        path: "/sports/cricket",
        element: <CricketMatchesList />,
      },
      {
        path: "/sports/soccer",
        element: <SoccerMatchesList />,
      },
      {
        path: "/sports/tennis",
        element: <TennisMatchesList />,
      },
      {
        path: "/inplay",
        element: <Inplay />,
      },
      {
        path: "/in-play",
        element: <Inplay />,
      },
      {
        path: "/my-sports",
        element: <QuickLinks />,
      },
      {
        path: "/multi-market",
        element: <MultiMarkets />,
      },
      {
        path: "/bets-history",
        element: <BetHistory />,
      },
      {
        path: "/bet-history",
        element: <BetHistory />,
      },
      {
        path: "/profit-loss",
        element: <ProfitLoss />,
      },
      {
        path: "/account-statement",
        element: <AccountStatement />,
      },
      {
        path: "/password-history",
        element: <PasswordChangeHistory />,
      },
      {
        path: "/activity-log",
        element: <ActiveLogs />,
      },
      {
        path: "/myprofile",
        element: <Profile />,
      },
      {
        path: "/rolling-commission",
        element: <RollingCommission />,
      },
      {
        path: "/userBetHistory",
        element: <UserSingleBet />,
      },
      {
        path: "/account",
        element: <Account />,
      },
    ],
  },

  // 3. AuraExchange Full Market Layout (Exchange Odds, Bookmaker, Fancy, Betslip)
  {
    element: (
      <ProtectedRoute navigateTo="/login">
        <LayoutFullPage />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/full-market",
        element: <CTSfullMarket />,
      },
      {
        path: "/full-market/:exEventId?/:sportId?",
        element: <CTSfullMarket />,
      },
      {
        path: "/tv/:sportId/:eventId",
        element: <SportsTv />,
      },
    ],
  },
]);
