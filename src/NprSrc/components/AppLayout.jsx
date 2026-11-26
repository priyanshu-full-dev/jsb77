import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  revertUser,
  updateAvailableBalance,
  updateExposureBalance,
} from "../../redux/slices/userSlice";
import { revertAccount } from "../../redux/slices/accountSlice";
import { fetchuserdata } from "../../api";
import Header from "./Header";
import AuthBar from "./AuthBar";
import BottomNav from "./BottomNav";
import AuthModals from "./AuthModals";
import MenuDrawer from "./MenuDrawer";
import InviteModal from "./InviteModal";
import DepositModal from "./DepositModal";
import WithdrawalModal from "./WithdrawalModal";
import SideRedeemWidget from "./SideRedeemWidget";
import StartupPromoModal from "./StartupPromoModal";
import "../Npr.css";

const AppLayout = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [startupPromoOpen, setStartupPromoOpen] = useState(() => {
    // Show automatically at starting load on home page ONLY if user is NOT logged in
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const nprUser = localStorage.getItem("npr_user");
      if (token || userId || nprUser) {
        return false;
      }
      const p = window.location.pathname;
      return p === "/" || p === "" || p === "/m";
    }
    return false;
  });

  const dispatch = useDispatch();

  // Authenticated user state from localStorage/Redux
  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const saved =
        localStorage.getItem("npr_user") || localStorage.getItem("userdata");
      if (savedToken && saved) {
        const parsed = JSON.parse(saved);
        const avail = Number(parsed.availableBalance ?? 0);
        const expo = Number(parsed.exposure ?? 0);
        const net = Math.max(0, avail - expo).toFixed(2);
        return {
          ...parsed,
          username:
            parsed.username || parsed.userName || parsed.name || "Player",
          balance: parsed.balance !== undefined ? String(parsed.balance) : net,
          availableBalance: avail,
          exposure: expo,
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  // Sync with Redux user state
  const reduxUserData = useSelector((state) => state.user?.userData);
  const reduxToken = useSelector((state) => state.user?.token);

  useEffect(() => {
    if (reduxToken && reduxUserData) {
      const avail = Number(reduxUserData.availableBalance ?? 0);
      const expo = Number(reduxUserData.exposure ?? 0);
      const net = Math.max(0, avail - expo).toFixed(2);
      setUser((prev) => ({
        ...prev,
        ...reduxUserData,
        username:
          reduxUserData.userName ||
          reduxUserData.username ||
          reduxUserData.name ||
          prev?.username ||
          "Player",
        balance: net,
        availableBalance: avail,
        exposure: expo,
      }));
    }
  }, [reduxToken, reduxUserData]);

  // Close startup promo pop-up if user is authenticated
  useEffect(() => {
    if (user || reduxToken) {
      setStartupPromoOpen(false);
    }
  }, [user, reduxToken]);

  // Real-time Balance fetch via REST API
  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    const userId =
      localStorage.getItem("userId") ||
      user?._id ||
      reduxUserData?._id;
    if (!token || !userId) return null;

    try {
      const res = await fetchuserdata(userId);
      const resData = res?.data || res;
      if (resData?.success || res?.success) {
        const u = resData?.userdata || resData?.data?.userdata || res?.userdata;
        if (u) {
          const avail = Number(u.availableBalance ?? 0);
          const expo = Number(u.exposure ?? 0);
          const net = Math.max(0, avail - expo).toFixed(2);

          dispatch(updateAvailableBalance(avail));
          dispatch(updateExposureBalance(expo));

          setUser((prev) => {
            const updated = {
              ...prev,
              ...u,
              username:
                u.userName ||
                u.username ||
                u.name ||
                prev?.username ||
                "Player",
              balance: net,
              availableBalance: avail,
              exposure: expo,
            };
            try {
              localStorage.setItem("npr_user", JSON.stringify(updated));
              localStorage.setItem("userdata", JSON.stringify(u));
            } catch {
              // ignore
            }
            return updated;
          });
          return net;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch user balance:", err);
    }
    return null;
  };

  // Fetch balance on initial load when user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      fetchBalance();
    }
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const isPromotionPage = location.pathname.includes("promotion");
  const isMembersPage = location.pathname.includes("members");
  const isDepositPage = location.pathname.includes("deposit");
  const isInvitePage = location.pathname.includes("invite");
  const isWithdrawalPage = location.pathname.includes("withdrawal");
  const isBetHistoryPage = location.pathname.includes("bet-history");
  const hideTopChrome =
    isPromotionPage ||
    isMembersPage ||
    isDepositPage ||
    isInvitePage ||
    isWithdrawalPage ||
    isBetHistoryPage;
  const hideBottomNav =
    isMembersPage ||
    isDepositPage ||
    isInvitePage ||
    isWithdrawalPage ||
    isBetHistoryPage;

  const handleOpenLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    const avail = Number(userData?.availableBalance ?? 0);
    const expo = Number(userData?.exposure ?? 0);
    const net = Math.max(0, avail - expo).toFixed(2);

    const loggedUser = {
      ...userData,
      username:
        userData?.userName ||
        userData?.username ||
        userData?.name ||
        "Player",
      balance: net,
      availableBalance: avail,
      exposure: expo,
    };
    setUser(loggedUser);
    try {
      localStorage.setItem("npr_user", JSON.stringify(loggedUser));
    } catch {
      // ignore storage error
    }
    setAuthOpen(false);
    setStartupPromoOpen(false);

    // Refresh balance from server right after login
    setTimeout(() => {
      fetchBalance();
    }, 150);
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem("npr_user");
      localStorage.removeItem("userdata");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    } catch {
      // ignore
    }
    dispatch(revertUser());
    dispatch(revertAccount());
    navigate("/");
  };

  return (
    <div className={`npr-font npr-canvas max-w-md mx-auto relative shadow-2xl ${hideBottomNav ? "pb-0" : "pb-16"} min-h-screen flex flex-col`}>
      {/* 1. Main Header (Hidden on Promotion, Members & Deposit pages) */}
      {!hideTopChrome && (
        <Header
          onOpenMenu={() => setMenuOpen(true)}
          user={user}
          onRefreshBalance={fetchBalance}
        />
      )}

      {/* 3. Auth Bar (Hidden on Promotion, Members & Deposit pages) */}
      {!hideTopChrome && (
        <AuthBar
          user={user}
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          onOpenDeposit={user ? () => navigate("/deposit") : handleOpenLogin}
          onOpenWithdrawal={user ? () => navigate("/withdrawal") : handleOpenLogin}
        />
      )}

      {/* 4. Main Page View */}
      <main className="flex-1">
        <Outlet
          context={{
            user,
            onOpenLogin: handleOpenLogin,
            onOpenRegister: handleOpenRegister,
            onOpenDeposit: user ? () => navigate("/deposit") : handleOpenLogin,
            onOpenWithdrawal: user ? () => navigate("/withdrawal") : handleOpenLogin,
            onOpenInvite: () => navigate("/invite"),
            onLogout: handleLogout,
            onRefreshBalance: fetchBalance,
          }}
        />
      </main>

      {/* 5. Persistent Bottom Navigation (Hidden on Members & Deposit pages) */}
      {!hideBottomNav && (
        <BottomNav
          onOpenInvite={() => navigate("/invite")}
          onOpenDeposit={user ? () => navigate("/deposit") : handleOpenLogin}
          onOpenMembers={user ? () => navigate("/members") : handleOpenLogin}
        />
      )}

      {/* 6. Floating Left Point Redeem Side Widget (Hidden on Promotion, Members & Deposit pages) */}
      {!hideTopChrome && <SideRedeemWidget />}

      {/* Modals & Drawers */}
      <AuthModals
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={(mode) => setAuthMode(mode)}
        onLoginSuccess={handleLoginSuccess}
      />

      <MenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onOpenDeposit={user ? () => { setMenuOpen(false); navigate("/deposit"); } : handleOpenLogin}
        onOpenWithdrawal={user ? () => { setMenuOpen(false); navigate("/withdrawal"); } : handleOpenLogin}
      />

      <InviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
      />

      <WithdrawalModal
        isOpen={withdrawalOpen}
        onClose={() => setWithdrawalOpen(false)}
        balance={user?.balance || "0.00"}
      />

      {/* 7. Startup Promotional Carousel Pop-up (Only for unauthenticated/guest users) */}
      {!user && !reduxToken && (
        <StartupPromoModal
          isOpen={startupPromoOpen}
          onClose={() => setStartupPromoOpen(false)}
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          user={user}
        />
      )}
    </div>
  );
};

export default AppLayout;
