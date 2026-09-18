import { lazy, Suspense, Component } from "react";
import PropTypes from "prop-types";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import PageSkeleton from "./components/Loader/PageSkeleton";

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
    console.error("Kuberbook666 Route Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-700 flex items-center justify-center text-2xl text-red-500 mb-3">
            ⚠️
          </div>
          <h2 className="text-lg font-black tracking-tight text-white mb-1">
            Section Temporarily Unavailable
          </h2>
          <p className="text-xs text-gray-400 max-w-sm mb-4">
            {this.state.error?.message || "An unexpected error occurred while loading this page."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white shadow transition"
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
  children: PropTypes.node,
};

/**
 * Higher-order loadable component with Lazy Loading, Suspense Fallback & Preload capability
 */
export const loadable = (importFn, Fallback = PageSkeleton) => {
  const LazyComponent = lazy(importFn);

  // Expose preload method so routes can be pre-fetched on hover
  LazyComponent.preload = importFn;

  const Element = (props) => (
    <RouteErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </RouteErrorBoundary>
  );

  return { Lazy: LazyComponent, Element };
};

// ==========================================================================
// CODE-SPLIT PAGES (PREFETCHABLE CHUNKS)
// ==========================================================================
const Home = loadable(() => import("./pages/Home/Home"));
const SportsPage = loadable(() => import("./pages/Sports/SportsPage"));
const CasinoPage = loadable(() => import("./pages/Casino/CasinoPage"));
const LiveCasinoPage = loadable(() => import("./pages/LiveCasino/LiveCasinoPage"));
const InPlayPage = loadable(() => import("./pages/InPlay/InPlayPage"));
const ProfilePage = loadable(() => import("./pages/Account/ProfilePage"));
const MarketPage = loadable(() => import("./pages/Market/MarketPage"));
const GameLobby = loadable(() => import("./pages/GameLobby/GameLobby"));

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
        element: <SportsPage.Element />,
      },
      {
        path: "horseRacing",
        element: <SportsPage.Element />,
      },
      {
        path: "greyhound-racing",
        element: <SportsPage.Element />,
      },
      {
        path: "greyhoundRacing",
        element: <SportsPage.Element />,
      },
      {
        path: "election",
        element: <SportsPage.Element />,
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
        path: "responsible-gambling",
        element: <Home.Element />,
      },
      {
        path: "privacy-policy",
        element: <Home.Element />,
      },
      {
        path: "exclusion-policy",
        element: <Home.Element />,
      },
      {
        path: "rules-regulations",
        element: <Home.Element />,
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
