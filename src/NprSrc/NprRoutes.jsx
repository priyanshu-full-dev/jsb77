import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home/Home";
import SportsPage from "./pages/Sports/SportsPage";
import CasinoPage from "./pages/Casino/CasinoPage";
import PromotionPage from "./pages/Promotion/PromotionPage";
import MembersPage from "./pages/Members/MembersPage";
import LoginPage from "./pages/Auth/LoginPage";

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
        path: "inplay",
        element: <SportsPage />,
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
        element: <Home />,
      },
      {
        path: "*",
        element: <Home />,
      },
    ],
  },
]);
