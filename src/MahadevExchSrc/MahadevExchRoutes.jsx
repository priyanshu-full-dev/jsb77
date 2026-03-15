import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import AppLayout from "./components/AppLayout.jsx/AppLayout";

const loadable = (importFn, { fallback = <>Loading...</> } = {}) => {
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

const CTSfullMarket = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/FullMarket/CTSfullMarket"),
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
    ],
  },

  // WITHOUT LAYOUT
  {
    path: "/game-lobby",
    element: <GameLobby.Element />,
  },
]);
