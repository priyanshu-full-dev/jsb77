import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";
import TopNavChips from "./TopNavChips";
import BottomNav from "./BottomNav";
import FloatingSupport from "./FloatingSupport";
import SidebarDrawer from "./SidebarDrawer";
import ProfileDrawer from "./ProfileDrawer";
import DepositModal from "./DepositModal";
import LoginModal from "./AuthModals/LoginModal";
import SignupModal from "./AuthModals/SignupModal";
import Footer from "./Footer";
import "../styles/kuber.css";

const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("kuber_theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("kuber_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [theme]);

  useEffect(() => {
    const handleOpenLogin = () => setLoginOpen(true);
    const handleOpenSignup = () => setSignupOpen(true);
    const handleOpenDeposit = () => setDepositModalOpen(true);
    const handleOpenProfile = () => setProfileDrawerOpen(true);

    window.addEventListener("kuber_open_login", handleOpenLogin);
    window.addEventListener("kuber_open_signup", handleOpenSignup);
    window.addEventListener("kuber_open_deposit", handleOpenDeposit);
    window.addEventListener("kuber_open_profile", handleOpenProfile);

    return () => {
      window.removeEventListener("kuber_open_login", handleOpenLogin);
      window.removeEventListener("kuber_open_signup", handleOpenSignup);
      window.removeEventListener("kuber_open_deposit", handleOpenDeposit);
      window.removeEventListener("kuber_open_profile", handleOpenProfile);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 selection:bg-red-600 selection:text-white ${
        theme === "dark" ? "bg-[#0d0e14] text-gray-100" : "bg-[#f0f2f5] text-gray-900"
      }`}
    >
      {/* Fixed Top Section: Header & Top Navigation Chips */}
      <header className="sticky top-0 z-50 w-full shadow-md">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenDrawer={() => setDrawerOpen(true)}
          onOpenProfileDrawer={() => setProfileDrawerOpen(true)}
          onOpenDeposit={() => setDepositModalOpen(true)}
          onOpenLogin={() => setLoginOpen(true)}
          onOpenSignup={() => setSignupOpen(true)}
        />
        <TopNavChips theme={theme} />
      </header>

      {/* Main Routed Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-16 md:pb-8">
        <Outlet />
        <Footer />
      </main>

      {/* Floating Support (WhatsApp & Telegram) */}
      <FloatingSupport />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenMenu={() => setDrawerOpen(true)}
        onOpenProfile={() => {
          if (isLoggedIn) {
            setProfileDrawerOpen(true);
          } else {
            setLoginOpen(true);
          }
        }}
      />

      {/* Left Slide-out Sidebar Drawer (Hamburger) */}
      <SidebarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenLogin={() => {
          setDrawerOpen(false);
          setLoginOpen(true);
        }}
        onOpenSignup={() => {
          setDrawerOpen(false);
          setSignupOpen(true);
        }}
      />

      {/* Right Slide-out Profile Drawer */}
      <ProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        onOpenDeposit={() => setDepositModalOpen(true)}
        onOpenWithdraw={() => alert("Withdraw modal / transfer")}
      />

      {/* Deposit Modal */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />

      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </div>
  );
};

export default AppLayout;

