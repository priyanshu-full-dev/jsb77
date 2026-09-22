import { lazy, Suspense, Component } from "react";
import PropTypes from "prop-types";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import KuberScreenLoader from "./components/Loader/KuberScreenLoader";

// ==========================================================================
// ADVANCED INDUSTRY-GRADE ERROR BOUNDARY & LAZY LOADER (0.1% ZERO JANK)
// ==========================================================================

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error in Route:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
            Section Temporarily Unavailable
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-4">
            {this.state.error?.message || "An unexpected error occurred while loading this section."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

RouteErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Higher-order loadable component with Lazy Loading, Suspense Fallback & Preload capability
 */
export const loadable = (importFn) => {
  const LazyComponent = lazy(importFn);

  // Expose preload method so routes can be pre-fetched on hover
  LazyComponent.preload = importFn;

  const Element = (props) => (
    <RouteErrorBoundary>
      <Suspense fallback={<KuberScreenLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    </RouteErrorBoundary>
  );

  return { Lazy: LazyComponent, Element };
};

// ==========================================================================
// CODE-SPLIT PAGES WITH WEBPACK PREFETCHING (PREFETCHABLE CHUNKS)
// ==========================================================================
const Home = loadable(() => import(/* webpackPrefetch: true */ "./pages/Home/Home"));
const SportsPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Sports/SportsPage"));
const CasinoPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Casino/CasinoPage"));
const LiveCasinoPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/LiveCasino/LiveCasinoPage"));
const InPlayPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/InPlay/InPlayPage"));
const ProfilePage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/ProfilePage"));
const MarketPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Market/MarketPage"));
const GameLobby = loadable(() => import(/* webpackPrefetch: true */ "./pages/GameLobby/GameLobby"));
const RacePage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Racing/RacePage"));
const ElectionPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Election/ElectionPage"));
const MaintenancePage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Maintenance/MaintenancePage"));
const AffiliatePage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/AffiliatePage"));
const AffiliateUserListPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/AffiliateUserListPage"));
const AffiliateProfitLossPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/AffiliateProfitLossPage"));
const AffiliateReportPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/AffiliateReportPage"));
const ReferEarnPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/ReferEarnPage"));
const TransactionsPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/TransactionsPage"));
const BonusPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/BonusPage"));
const OpenBetsPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/OpenBetsPage"));
const BettingProfitLossPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/BettingProfitLossPage"));
const AccountStatementPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/AccountStatementPage"));
const BonusStatementPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/BonusStatementPage"));
const BonusRulesPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/BonusRulesPage"));
const TransferStatementPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/TransferStatementPage"));
const TimeSettingPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/TimeSettingPage"));
const SettingsPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/SettingsPage"));
const WithdrawalPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/WithdrawalPage"));
const DepositPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/DepositPage"));
const ChangePasswordPage = loadable(() => import(/* webpackPrefetch: true */ "./pages/Account/ChangePasswordPage"));

export const preloadRoute = (name) => {
  try {
    switch (name) {
      case "home":
        Home.Lazy.preload?.();
        break;
      case "sports":
        SportsPage.Lazy.preload?.();
        break;
      case "casino":
        CasinoPage.Lazy.preload?.();
        break;
      case "live-casino":
        LiveCasinoPage.Lazy.preload?.();
        break;
      case "inplay":
        InPlayPage.Lazy.preload?.();
        break;
      case "account":
        ProfilePage.Lazy.preload?.();
        break;
      case "market":
        MarketPage.Lazy.preload?.();
        break;
      default:
        break;
    }
  } catch {
    // silent catch for preloading
  }
};

// ==========================================================================
// ROUTE CONFIGURATION
// ==========================================================================
export const Kuberbook666Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: (
      <div className="min-h-screen bg-[#0f1015] flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-2xl font-black text-red-500 mb-2">404 - Page Not Found</h1>
        <p className="text-sm text-gray-400 mb-4">The requested page does not exist on Kuberbook666.</p>
        <a href="/" className="px-4 py-2 rounded-lg bg-red-600 font-bold text-xs">
          Return Home
        </a>
      </div>
    ),
    children: [
      {
        index: true,
        element: <Home.Element />,
      },
      {
        path: "sports",
        element: <SportsPage.Element />,
      },
      {
        path: "sports/:sport",
        element: <SportsPage.Element />,
      },
      {
        path: "sports/:sport/:type",
        element: <SportsPage.Element />,
      },
      {
        path: "sports-page/*",
        element: <SportsPage.Element />,
      },
      {
        path: "horse-racing",
        element: <RacePage.Element raceType="horse" />,
      },
      {
        path: "horseRacing",
        element: <RacePage.Element raceType="horse" />,
      },
      {
        path: "greyhound-racing",
        element: <RacePage.Element raceType="greyhound" />,
      },
      {
        path: "greyhoundRacing",
        element: <RacePage.Element raceType="greyhound" />,
      },
      {
        path: "election",
        element: <ElectionPage.Element />,
      },
      {
        path: "full-market",
        element: <MarketPage.Element />,
      },
      {
        path: "market/:eventId",
        element: <MarketPage.Element />,
      },
      {
        path: "casino",
        element: <CasinoPage.Element />,
      },
      {
        path: "aura",
        element: <CasinoPage.Element />,
      },
      {
        path: "mac88",
        element: <CasinoPage.Element />,
      },
      {
        path: "live-casino",
        element: <LiveCasinoPage.Element />,
      },
      {
        path: "slots",
        element: <CasinoPage.Element />,
      },
      {
        path: "crash",
        element: <CasinoPage.Element />,
      },
      {
        path: "table",
        element: <LiveCasinoPage.Element />,
      },
      {
        path: "cards",
        element: <LiveCasinoPage.Element />,
      },
      {
        path: "fishing",
        element: <CasinoPage.Element />,
      },
      {
        path: "multiplayer",
        element: <CasinoPage.Element />,
      },
      {
        path: "color-game",
        element: <CasinoPage.Element />,
      },
      {
        path: "aviator",
        element: <CasinoPage.Element />,
      },
      {
        path: "inplay",
        element: <InPlayPage.Element />,
      },
      {
        path: "account",
        element: <ProfilePage.Element />,
      },
      {
        path: "affiliate",
        element: <AffiliatePage.Element />,
      },
      {
        path: "affiliate/user-list",
        element: <AffiliateUserListPage.Element />,
      },
      {
        path: "affiliate/user-profit-loss",
        element: <AffiliateProfitLossPage.Element />,
      },
      {
        path: "affiliate/report",
        element: <AffiliateReportPage.Element />,
      },
      {
        path: "refer-earn",
        element: <ReferEarnPage.Element />,
      },
      {
        path: "transactions",
        element: <TransactionsPage.Element />,
      },
      {
        path: "transactions-report",
        element: <TransactionsPage.Element />,
      },
      {
        path: "bonuses",
        element: <BonusPage.Element />,
      },
      {
        path: "bonus",
        element: <BonusPage.Element />,
      },
      {
        path: "open-bets",
        element: <OpenBetsPage.Element />,
      },
      {
        path: "betting-profit-loss",
        element: <BettingProfitLossPage.Element />,
      },
      {
        path: "profit-loss-report",
        element: <BettingProfitLossPage.Element />,
      },
      {
        path: "profit-loss",
        element: <BettingProfitLossPage.Element />,
      },
      {
        path: "account-statement",
        element: <AccountStatementPage.Element />,
      },
      {
        path: "account_statement",
        element: <AccountStatementPage.Element />,
      },
      {
        path: "account-statements",
        element: <AccountStatementPage.Element />,
      },
      {
        path: "bonus-statement",
        element: <BonusStatementPage.Element />,
      },
      {
        path: "bonus_statement",
        element: <BonusStatementPage.Element />,
      },
      {
        path: "bonus-rules",
        element: <BonusRulesPage.Element />,
      },
      {
        path: "bonus_rules",
        element: <BonusRulesPage.Element />,
      },
      {
        path: "bonus-rule",
        element: <BonusRulesPage.Element />,
      },
      {
        path: "transfer-statement",
        element: <TransferStatementPage.Element />,
      },
      {
        path: "transfer_statement",
        element: <TransferStatementPage.Element />,
      },
      {
        path: "transfer-statements",
        element: <TransferStatementPage.Element />,
      },
      {
        path: "time-setting",
        element: <TimeSettingPage.Element />,
      },
      {
        path: "time_setting",
        element: <TimeSettingPage.Element />,
      },
      {
        path: "time-settings",
        element: <TimeSettingPage.Element />,
      },
      {
        path: "time_settings",
        element: <TimeSettingPage.Element />,
      },
      {
        path: "settings",
        element: <SettingsPage.Element />,
      },
      {
        path: "setting",
        element: <SettingsPage.Element />,
      },
      {
        path: "withdraw",
        element: <WithdrawalPage.Element />,
      },
      {
        path: "withdrawal",
        element: <WithdrawalPage.Element />,
      },
      {
        path: "withdraw-funds",
        element: <WithdrawalPage.Element />,
      },
      {
        path: "withdraw_funds",
        element: <WithdrawalPage.Element />,
      },
      {
        path: "deposit",
        element: <DepositPage.Element />,
      },
      {
        path: "deposit-funds",
        element: <DepositPage.Element />,
      },
      {
        path: "deposit_funds",
        element: <DepositPage.Element />,
      },
      {
        path: "change-password",
        element: <ChangePasswordPage.Element />,
      },
      {
        path: "change_password",
        element: <ChangePasswordPage.Element />,
      },
      {
        path: "changePassword",
        element: <ChangePasswordPage.Element />,
      },
      {
        path: "download-apk",
        element: <MaintenancePage.Element title="Download APK" />,
      },
      {
        path: "blogs-news",
        element: <MaintenancePage.Element title="Blogs & News" />,
      },
      {
        path: "blogs",
        element: <MaintenancePage.Element title="Blogs & News" />,
      },
      {
        path: "news",
        element: <MaintenancePage.Element title="Blogs & News" />,
      },
      {
        path: "responsible-gambling",
        element: <MaintenancePage.Element title="Responsible Gambling" />,
      },
      {
        path: "privacy-policy",
        element: <MaintenancePage.Element title="Privacy Policy" />,
      },
      {
        path: "exclusion-policy",
        element: <MaintenancePage.Element title="Exclusion Policy" />,
      },
      {
        path: "rules-regulations",
        element: <MaintenancePage.Element title="Rules & Regulations" />,
      },
      {
        path: "maintenance",
        element: <MaintenancePage.Element />,
      },
      {
        path: "kuber/*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
  {
    path: "/game-lobby",
    element: <GameLobby.Element />,
  },
]);

export default Kuberbook666Router;
