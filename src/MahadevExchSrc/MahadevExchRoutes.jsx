import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import AppLayout from "./components/AppLayout.jsx/AppLayout";
import Loader from "./components/Loader/Loader";
import ProtectedRoute from "../CommonComponents/ProtectedRoute";

const loadable = (importFn, { fallback = Loader } = {}) => {
  const Lazy = lazy(importFn);
  Lazy.preload = importFn;

  const Element = (props) => (
    <Suspense fallback={fallback}>
      <Lazy {...props} />
    </Suspense>
  );

  return { Lazy, Element };
};

// PAGES
const Home = loadable(() => import("./pages/Home/Home"));
const AccountPage = loadable(() => import("./pages/Accounts/AccountPage"));
const CasinoGames = loadable(() => import("./pages/CasinoGames/CasinoGames"));
const GameLobby = loadable(() => import("./pages/GameLobby"));
const SportsPage = loadable(() => import("./pages/sports/SportsPage"));

const AccountStatement = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Account/Accout-Statement"),
);
const ProfitLossReport = loadable(
  () =>
    import(/* webpackPrefetch: true */ "./pages/Account/Profit-Loss-Report"),
);
const BetHistory = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Account/Bet-History"),
);
const UnsettledBet = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Account/Unsettled-Bet"),
);
const ChangePassword = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Account/Change-Password"),
);
const Rules = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Account/Rules"),
);
const TransactionReport = loadable(
  () =>
    import(/* webpackPrefetch: true */ "./pages/Account/Transaction-Report"),
);

const CTSfullMarket = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/FullMarket/CTSfullMarket"),
);

const BankTransfer = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/BankTransfer"),
);

const BalanceOverview = loadable(
  () =>
    import(
      /* webpackPrefetch: true */ "./pages/BalanceOverview/BalanceOverview"
    ),
);

const Withdrawal = loadable(
  () =>
    import(/* webpackPrefetch: true */ "./pages/BalanceOverview/WithdrawNew"),
);
const ActivityLog = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/ActivityLog"),
);

const Horse = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Horse"),
);
const HorseMarket = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Horse/HorseMarket"),
);
const GreyhoundMarket = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Greyhound/GreyhoundMarket"),
);
const Greyhound = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Greyhound"),
);

export const MahadevExchRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home.Element />,
      },
      {
        path: "/sport/profile",
        element: <AccountPage.Element />,
      },
      {
        path: "/casino-games",
        element: <CasinoGames.Element />,
      },
      {
        path: "/sports/:sport/:type",
        element: <SportsPage.Element />,
      },
      { path: "horseRacing", element: <Horse.Element /> },
      { path: "horse-market", element: <HorseMarket.Element /> },
      { path: "greyhoundRacing", element: <Greyhound.Element /> },
      { path: "greyhound-market", element: <GreyhoundMarket.Element /> },
      { path: "full-market", element: <CTSfullMarket.Element /> },

      {
        path: "/account-statement",
        element: (
          <ProtectedRoute>
            <AccountStatement.Element />
          </ProtectedRoute>
        ),
      },
      {
        path: "/transactions-report",
        element: (
          <ProtectedRoute>
            <TransactionReport.Element />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profit-loss-report",
        element: (
          <ProtectedRoute>
            <ProfitLossReport.Element />
          </ProtectedRoute>
        ),
      },
      {
        path: "/bet-history",
        element: (
          <ProtectedRoute>
            <BetHistory.Element />
          </ProtectedRoute>
        ),
      },
      {
        path: "/unsettled-bet",
        element: (
          <ProtectedRoute>
            <UnsettledBet.Element />
          </ProtectedRoute>
        ),
      },
      {
        path: "/change-password",
        element: (
          <ProtectedRoute>
            <ChangePassword.Element />
          </ProtectedRoute>
        ),
      },
      {
        path: "/myAccount/bank-transfer",
        element: (
          <ProtectedRoute>
            <BankTransfer.Element />
          </ProtectedRoute>
        ),
      },
      {
        path: "/balance-overview",
        element: (
          <ProtectedRoute>
            <BalanceOverview.Element />
          </ProtectedRoute>
        ),
      },
      {
        path: "/withdraw",
        element: (
          <ProtectedRoute>
            <Withdrawal.Element />
          </ProtectedRoute>
        ),
      },
      {
        path: "/activityLog",
        element: (
          <ProtectedRoute>
            <ActivityLog.Element />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // WITHOUT LAYOUT
  {
    path: "/game-lobby",
    element: <GameLobby.Element />,
  },
]);
