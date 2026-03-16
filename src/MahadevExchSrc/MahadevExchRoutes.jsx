import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import AppLayout from "./components/AppLayout.jsx/AppLayout";
import Loader from "./components/Loader/Loader";

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

      { path: "full-market", element: <CTSfullMarket.Element /> },

      {
        path: "/account-statement",
        element: <AccountStatement.Element />,
      },
      {
        path: "/transactions-report",
        element: <TransactionReport.Element />,
      },
      {
        path: "/profit-loss-report",
        element: <ProfitLossReport.Element />,
      },
      {
        path: "/bet-history",
        element: <BetHistory.Element />,
      },
      {
        path: "/unsettled-bet",
        element: <UnsettledBet.Element />,
      },
      {
        path: "/change-password",
        element: <ChangePassword.Element />,
      },

      {
        path: "myAccount/bank-transfer",
        element: <BankTransfer.Element />,
      },
      {
        path: "/balance-overview",
        element: <BalanceOverview.Element />,
      },
      { path: "/withdraw", element: <Withdrawal.Element /> },
      { path: "/activityLog", element: <ActivityLog.Element /> },
    ],
  },

  // WITHOUT LAYOUT
  {
    path: "/game-lobby",
    element: <GameLobby.Element />,
  },
]);
