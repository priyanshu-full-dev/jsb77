import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import AuthBar from "./AuthBar";
import BottomNav from "./BottomNav";
import AuthModals from "./AuthModals";
import MenuDrawer from "./MenuDrawer";
import InviteModal from "./InviteModal";
import DepositModal from "./DepositModal";
import WithdrawalModal from "./WithdrawalModal";
import SideRedeemWidget from "./SideRedeemWidget";
import "../Npr.css";

const AppLayout = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  // Authenticated user state (default: "prish07" matching reference screenshot)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("npr_user");
      if (saved) return JSON.parse(saved);
      const defaultUser = { username: "prish07", balance: "0.00" };
      localStorage.setItem("npr_user", JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return { username: "prish07", balance: "0.00" };
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const isPromotionPage = location.pathname.includes("promotion");
  const isMembersPage = location.pathname.includes("members");
  const isDepositPage = location.pathname.includes("deposit");
  const hideTopChrome = isPromotionPage || isMembersPage || isDepositPage;
  const hideBottomNav = isMembersPage || isDepositPage;

  const handleOpenLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    const loggedUser = userData || { username: "prish07", balance: "0.00" };
    setUser(loggedUser);
    try {
      localStorage.setItem("npr_user", JSON.stringify(loggedUser));
    } catch {
      // ignore storage error
    }
    setAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem("npr_user");
    } catch {
      // ignore
    }
  };

  return (
    <div className={`npr-font npr-canvas max-w-md mx-auto relative shadow-2xl ${hideBottomNav ? "pb-0" : "pb-16"} min-h-screen flex flex-col`}>
      {/* 1. Main Header (Hidden on Promotion, Members & Deposit pages) */}
      {!hideTopChrome && (
        <Header onOpenMenu={() => setMenuOpen(true)} user={user} />
      )}

      {/* 3. Auth Bar (Hidden on Promotion, Members & Deposit pages) */}
      {!hideTopChrome && (
        <AuthBar
          user={user}
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          onOpenDeposit={user ? () => navigate("/deposit") : handleOpenLogin}
          onOpenWithdrawal={() => setWithdrawalOpen(true)}
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
            onOpenWithdrawal: () => setWithdrawalOpen(true),
            onOpenInvite: () => setInviteOpen(true),
            onLogout: handleLogout,
          }}
        />
      </main>

      {/* 5. Persistent Bottom Navigation (Hidden on Members & Deposit pages) */}
      {!hideBottomNav && (
        <BottomNav
          onOpenInvite={() => setInviteOpen(true)}
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
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdrawal={() => setWithdrawalOpen(true)}
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
    </div>
  );
};

export default AppLayout;
