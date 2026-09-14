import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaTrophy, FaPlay, FaUserAlt } from "react-icons/fa";
import { GiCardPlay } from "react-icons/gi";

const BottomNav = ({ onOpenMenu }) => {
  const location = useLocation();

  const NAV_ITEMS = [
    { id: "home", label: "Home", icon: <FaHome />, path: "/" },
    { id: "sports", label: "Sports", icon: <FaTrophy />, path: "/sports" },
    { id: "inplay", label: "In-Play", icon: <FaPlay className="text-[11px]" />, path: "/inplay" },
    { id: "live", label: "Live Casino", icon: <GiCardPlay />, path: "/live-casino" },
    { id: "account", label: "Account", icon: <FaUserAlt />, path: "/account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#11121a] border-t border-gray-200 dark:border-gray-850 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] md:hidden select-none">
      <div className="grid grid-cols-5 h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition-all ${
                isActive
                  ? "text-red-600 dark:text-red-500 scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] leading-tight font-extrabold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
