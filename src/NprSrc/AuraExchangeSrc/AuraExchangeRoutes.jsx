import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../../CommonComponents/ProtectedRoute";

// Static imports for critical routes
import Home from "./pages/Home";
import CricketMatchesList from "./pages/Sports/Cricket";
import TennisMatchesList from "./pages/Sports/Tennis";
import SoccerMatchesList from "./pages/Sports/Soccer";

// Lazy imports for secondary pages
import { lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import store from "../../redux/store";
import UserSingleBet from "./pages/Account/UserSingleBet";
import AuraLoader from "../../CommonComponents/Loader/AuraLoader";
import CasinoTV from "./pages/CasinoTv";

const RefreshRedirect = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname === "/") {
      navigate("/cricket", { replace: true });
    }
  }, [navigate]);

  return children;
};

/**
 * =========================================================
 * Utility: loadable factory
 * =========================================================
 *
 * - wraps React.lazy + Suspense + Loader fallback
 * - attaches a .preload() method
 */
const UniverseCasinoLoader = () => (
  <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black w-screen h-screen pointer-events-none select-none">
    <img
      src="/casino/universe.gif"
      alt="universe"
      className="h-[200px] w-[200px] object-contain pointer-events-none"
      loading="eager"
      style={{ willChange: "transform" }}
    />
  </div>
);

const loadable = (importFn, { fallback = null } = {}) => {
  const Lazy = lazy(importFn);

  // attach preload for programmatic prefetching
  Lazy.preload = importFn;

  const Element = (props) => (
    <Suspense fallback={props?.fallback ?? fallback}>
      <Lazy {...props} />
    </Suspense>
  );

  return { Lazy, Element };
};

/**
 * =========================================================
 * Lazy Components
 * =========================================================
 */

const Login = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Login"),
);

const LiveCasino = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/RaftLiveCasino"),
);

const RafCasino = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/RafCasino"),
);

const ResetPassword = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/ResetPassword/ResetPassword"
    ),
);

const SignUp = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/SignUp/SignUp"),
);

const Vimaan = loadable(
  () => import("./pages/Vimaan.jsx"),
);

const Balloon = loadable(
  () => import("./pages/Balloon.jsx"),
);

const Inplay = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Inplay"),
);

const QuickLinks = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/QuickLinks"),
);

const CTSfullMarket = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/FullMarket/CTSfullMarket"
    ),
);

const raftaarFullMarket = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/FullMarket/CTSfullMarket"
    ),
);

const LayoutFullPage = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./components/LayoutFullPage"
    ),
);

const Account = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Account"),
);

const MultiMarkets = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Account/MultiMarkets"
    ),
);

const Profile = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Account/Profile"
    ),
);

const SportsTv = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "../../CommonComponents/SportsTv"
    ),
);

const Horse = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Sports/Horse"
    ),
);

const HorseMarket = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Sports/Horse/HorseMarket"
    ),
);

const Greyhound = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Sports/Greyhound"
    ),
);

const GreyhoundMarket = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Sports/Greyhound/GreyhoundMarket"
    ),
);

const BasketballMatchesList = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Sports/Basketball"
    ),
);

const Lottery = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Lottery"),
);

const LotteryMarket = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Lottery/LotteryMarket"),
);

const GameLobby = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Sports/InternationalCasino/GameLobby"
    ),
);

const RollingCommission = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Account/rolling-commission"
    ),
);

const AccountStatement = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Account/account-statement"
    ),
);

const BetHistory = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Account/BetHistory"
    ),
);

const ProfitLoss = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Account/ProfitLoss"
    ),
);

const PasswordChangeHistory = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Account/PasswordChangeHistory"
    ),
);

const ActiveLogs = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Account/ActiveLogs"
    ),
);

const SettingsPage = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Settings/Settings"
    ),
);

const Deposit = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Deposit"),
);

const Withdraw = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Withdraw/Withdraw"
    ),
);

const DiamondCasino = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "../../CommonComponents/DiamondCasino"
    ),
  { fallback: <UniverseCasinoLoader /> },
);

const BallbyBall = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/FullMarket/BallbyBall/BallByBall"
    ),
);

const KabaddiMarket = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Sports/Kabaddi"
    ),
);

const KabaddiMatchesList = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Sports/Kabaddi"
    ),
);

const Tips = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Tips/Tips"),
);

const TipsDetails = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./components/NewsDetail"
    ),
);

const SportsGame = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Raftaar/SportsGame"
    ),
);

const Referral = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/Raftaar/Referral"
    ),
);

const RefCasinoSection = loadable(
  () =>
    import(
      /* webpackPrefetch: true */
      "./pages/RafCasinoSection"
    ),
);

/**
 * =========================================================
 * Authentication
 * =========================================================
 */

const GuestRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const token = useSelector((state) => state?.user?.token);

  if (isLoggedIn && token) {
    return <Navigate to="/cricket" replace />;
  }

  return children;
};

/**
 * =========================================================
 * Router
 * =========================================================
 */

export const AuraExchangeRouter = createBrowserRouter([
  /**
   * =======================================================
   * LOGIN
   * =======================================================
   */

  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login.Element />
      </GuestRoute>
    ),
  },

  /**
   * =======================================================
   * RESET PASSWORD
   * =======================================================
   */

  {
    path: "/reset-password",
    element: <ResetPassword.Element />,
  },

  /**
   * =======================================================
   * SIGN UP
   * =======================================================
   */

  {
    path: "/signup",
    element: (
      <GuestRoute>
        <SignUp.Element />
      </GuestRoute>
    ),
  },

  {
    path: "/",
    element: (
      <RefreshRedirect>
        <Home />
      </RefreshRedirect>
    ),

    children: [
      {
        index: true,
        element: <Navigate to="/cricket" replace />,
      },
      {
        path: "cricket",
        element: <CricketMatchesList />,
      },

      {
        path: "tennis",
        element: <TennisMatchesList />,
      },

      {
        path: "soccer",
        element: <SoccerMatchesList />,
      },

      {
        path: "horseRacing",
        element: <Horse.Element />,
      },

      {
        path: "greyhoundRacing",
        element: <Greyhound.Element />,
      },

      {
        path: "basketball",
        element: <BasketballMatchesList.Element />,
      },

      {
        path: "lottery",
        element: <Lottery.Element />,
      },

      {
        path: "lottery/:gameId/:marketId",
        element: <LotteryMarket.Element />,
      },

      {
        path: "lottery/:marketId",
        element: <LotteryMarket.Element />,
      },

      {
        path: "/my-sports",
        element: <QuickLinks.Element />,
      },

      {
        path: "inplay",
        element: <Inplay.Element />,
      },

      {
        path: "in-play",
        element: <Inplay.Element />,
      },

      {
        path: "live-casino",
        element: <></>,
      },

      {
        path: "casino",
        element: <></>,
      },

      {
        path: "kabaddi",
        element: <KabaddiMatchesList.Element />,
      },

      {
        path: "tips",
        element: <Tips.Element />,
      },

      {
        path: "news",
        element: <TipsDetails.Element />,
      },
    ],
  },

  /**
   * =======================================================
   * FULL MARKET / ACCOUNT LAYOUT
   * =======================================================
   */

  {
    path: "/",
    element: <LayoutFullPage.Element />,

    children: [
      {
        path: "full-market",
        element: <CTSfullMarket.Element />,
      },

      {
        path: "full-market-2",
        element: <raftaarFullMarket.Element />,
      },

      {
        path: "horse-market",
        element: <HorseMarket.Element />,
      },

      {
        path: "greyhound-market",
        element: <GreyhoundMarket.Element />,
      },

      {
        path: "/kabaddi-market",
        element: <KabaddiMarket.Element />,
      },

      {
        path: "/sports-game",
        element: <SportsGame.Element />,
      },

      /**
       * Referral
       */

      {
        path: "/referral",
        element: <Referral.Element />,
      },

      /**
       * International Casino
       */

      {
        path: "/int-casino",
        element: <LiveCasino.Element />,
      },

      {
        path: "/casino-section/:sectionTitle",
        element: <RefCasinoSection.Element />,
      },

      {
        path: "/raf-casino/:provider",
        element: <RafCasino.Element />,
      },

      /**
       * Account
       */

      {
        path: "account",
        element: (
          <ProtectedRoute navigateTo="/">
            <Account.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Profile
       */

      {
        path: "myprofile",
        element: (
          <ProtectedRoute>
            <Profile.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Multi Market
       */

      {
        path: "multi-market",
        element: (
          <ProtectedRoute>
            <MultiMarkets.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Rolling Commission
       */

      {
        path: "rolling-commission",
        element: (
          <ProtectedRoute>
            <RollingCommission.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Account Statement
       */

      {
        path: "account-statement",
        element: (
          <ProtectedRoute>
            <AccountStatement.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Bet History
       */

      {
        path: "bets-history",
        element: (
          <ProtectedRoute>
            <BetHistory.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Profit Loss
       */

      {
        path: "profit-loss",
        element: (
          <ProtectedRoute>
            <ProfitLoss.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Password History
       */

      {
        path: "password-history",
        element: (
          <ProtectedRoute>
            <PasswordChangeHistory.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Activity Log
       */

      {
        path: "activity-log",
        element: (
          <ProtectedRoute>
            <ActiveLogs.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Settings
       */

      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Deposit
       */

      {
        path: "deposit",
        element: (
          <ProtectedRoute>
            <Deposit.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * Withdraw
       */

      {
        path: "withdraw",
        element: (
          <ProtectedRoute>
            <Withdraw.Element />
          </ProtectedRoute>
        ),
      },

      /**
       * User Bet History
       */

      {
        path: "/userBetHistory",
        element: (
          <Suspense fallback={null}>
            <UserSingleBet />
          </Suspense>
        ),
      },
    ],
  },

  /**
   * =======================================================
   * CASINO / BALL BY BALL
   * =======================================================
   */

  {
    path: "/",
    element: <LayoutFullPage.Element />,

    children: [
      {
        path: "/casino/:gameId",
        element: (
          <DiamondCasino.Element
            fallback={<UniverseCasinoLoader />}
            externalLoader={true}
          />
        ),
      },

      {
        path: "/ballByBall/:gameId?",
        element: <BallbyBall.Element />,
      },
    ],
  },

  /**
   * =======================================================
   * GAME LOBBY
   * =======================================================
   */

  {
    path: "game-lobby",
    element: <GameLobby.Element />,
  },

  {
    path: "/vimaan",
    element: <Vimaan.Element />,
  },
  {
    path: "/balloon",
    element: <Balloon.Element />,
  },



  /**
   * =======================================================
   * SPORTS TV
   * =======================================================
   */

  {
    path: "tv/:sportId/:eventId",
    element: <SportsTv.Element />,
  },

  /**
   * =======================================================
   * CASINO TV
   * =======================================================
   */

  {
    path: "casino-tv/:eventId",
    element: <CasinoTV />,
  },

  /**
   * =======================================================
   * 404
   * =======================================================
   */

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

// SSR-like background preloading for instant zero-loader navigation
if (typeof window !== "undefined") {
  setTimeout(() => {
    try {
      Login?.Lazy?.preload?.();
      LiveCasino?.Lazy?.preload?.();
      Inplay?.Lazy?.preload?.();
      CTSfullMarket?.Lazy?.preload?.();
      Account?.Lazy?.preload?.();
    } catch (e) {}
  }, 100);
}
