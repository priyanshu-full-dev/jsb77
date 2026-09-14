import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import TopNavChips from "./TopNavChips";
import BottomNav from "./BottomNav";
import FloatingSupport from "./FloatingSupport";
import SidebarDrawer from "./SidebarDrawer";
import LoginModal from "./AuthModals/LoginModal";
import SignupModal from "./AuthModals/SignupModal";
import "../styles/kuber.css";

const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
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

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 selection:bg-red-600 selection:text-white ${
        theme === "dark" ? "bg-[#0d0e14] text-gray-100" : "bg-[#f0f2f5] text-gray-900"
      }`}
    >
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenSignup={() => setSignupOpen(true)}
      />

      {/* Top Navigation Chips */}
      <TopNavChips theme={theme} />

      {/* Main Routed Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-16 md:pb-8">
        <Outlet />
      </main>

      {/* Floating Support (WhatsApp & Telegram) */}
      <FloatingSupport />

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenMenu={() => setDrawerOpen(true)} />

      {/* Slide-out Sidebar Drawer */}
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
