import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// ==========================================
// EXACT ICONS MATCHING USER DESIGN
// ==========================================

// 1. Home Icon (Dome roof with dot chimney & arched doorway)
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="2.5" r="1.5" fill="currentColor" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4.5C8.8 4.5 5.5 7.2 5.5 11.2V20C5.5 20.5523 5.94772 21 6.5 21H10V15.5C10 14.6716 10.6716 14 11.5 14H12.5C13.3284 14 14 14.6716 14 15.5V21H17.5C18.0523 21 18.5 20.5523 18.5 20V11.2C18.5 7.2 15.2 4.5 12 4.5Z"
      fill="currentColor"
    />
  </svg>
);

// 2. Sports Trophy Icon
const SportsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19 4H18V3C18 2.44772 17.5523 2 17 2H7C6.44772 2 6 2.44772 6 3V4H5C3.34315 4 2 5.34315 2 7C2 8.44186 3.0181 9.64539 4.38556 9.93282C5.07474 12.2798 7.08579 14.0734 9.5539 14.444C9.84589 15.6599 10.8228 16.6022 12.0526 16.896V19H9C8.44772 19 8 19.4477 8 20C8 20.5523 8.44772 21 9 21H15C15.5523 21 16 20.5523 16 20C16 19.4477 15.5523 19 15 19H12.0526V16.896C13.2824 16.6022 14.2593 15.6599 14.5513 14.444C17.0194 14.0734 19.0305 12.2798 19.7196 9.93282C21.0871 9.64539 22.1052 8.44186 22.1052 7C22.1052 5.34315 20.762 4 19 4ZM4 7C4 6.44772 4.44772 6 5 6H6V8.75545C4.85876 8.42398 4 7.82207 4 7ZM18 8.75545V6H19C19.5523 6 20 6.44772 20 7C20 7.82207 19.1412 8.42398 18 8.75545Z"
      fill="currentColor"
    />
  </svg>
);

// 3. InPlay Live Center Circle Icon
const InPlayIcon = () => (
  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#1e2230] border border-[#343a4e] shadow-inner">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-0.5">
      <path d="M6 4L19 12L6 20V4Z" fill="#e2e8f0" />
    </svg>
  </div>
);

// 4. Casino Card Diamond Icon
const CasinoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 7.5L14.5 12L12 16.5L9.5 12L12 7.5Z" fill="currentColor" />
    <circle cx="7" cy="7" r="0.9" fill="currentColor" />
    <circle cx="17" cy="7" r="0.9" fill="currentColor" />
    <circle cx="7" cy="17" r="0.9" fill="currentColor" />
    <circle cx="17" cy="17" r="0.9" fill="currentColor" />
  </svg>
);

// 5. Account Icon
const AccountIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="3.5" fill="currentColor" />
    <path
      d="M4.5 19.2C4.5 16.2 7.8 14.5 12 14.5C16.2 14.5 19.5 16.2 19.5 19.2V19.8C19.5 20.4627 18.9627 21 18.3 21H5.7C5.03726 21 4.5 20.4627 4.5 19.8V19.2Z"
      fill="currentColor"
    />
  </svg>
);

const BottomNav = ({ onOpenProfile }) => {
  const location = useLocation();
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const userData = useSelector((state) => state?.user?.userData);

  const rawBalance =
    typeof userData?.availableBalance === "number"
      ? userData.availableBalance
      : typeof userData?.balance === "number"
      ? userData.balance
      : 0.0;
  const balanceStr = Number(rawBalance || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  const NAV_ITEMS = useMemo(
    () => [
      {
        id: "home",
        label: "HOME",
        path: "/",
        icon: <HomeIcon />,
      },
      {
        id: "sports",
        label: "SPORTS",
        path: "/sports",
        icon: <SportsIcon />,
      },
      {
        id: "inplay",
        label: "LIVE",
        path: "/inplay",
        isLive: true,
        icon: <InPlayIcon />,
      },
      {
        id: "live",
        label: "CASINO",
        path: "/live-casino",
        icon: <CasinoIcon />,
      },
      {
        id: "account",
        label: isLoggedIn ? `₹${balanceStr}` : "ACCOUNT",
        path: "/account",
        isAction: true,
        icon: <AccountIcon />,
      },
    ],
    [isLoggedIn, balanceStr]
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden select-none"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Dark sleek footer bar */}
      <div className="relative bg-[#12141a] border-t border-white/[0.06] shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 h-[56px] items-center px-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            if (item.isAction && onOpenProfile) {
              return (
                <button
                  key={item.id}
                  onClick={onOpenProfile}
                  type="button"
                  className="group relative flex flex-col items-center justify-center h-full w-full active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  <div
                    className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#e50914]/20 shadow-[0_0_12px_rgba(229,9,20,0.35)] text-[#ff2a55]"
                        : "text-[#9ca3af] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span
                      className={`mt-0.5 text-[10px] font-bold uppercase tracking-wider leading-tight ${
                        isActive ? "text-[#ff2a55] font-black" : "text-[#9ca3af]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            }

            // Center LIVE Button with circle + Red Pill
            if (item.isLive) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center h-full w-full active:scale-95 transition-all duration-150"
                >
                  <div className="flex flex-col items-center justify-center">
                    {/* Circle Play icon */}
                    <div className="transition-transform duration-200 hover:scale-105">
                      {item.icon}
                    </div>

                    {/* Red LIVE Badge Pill */}
                    <div className="mt-[-4px] z-10 flex items-center justify-center px-2 py-[1px] rounded-full bg-[#e50914] shadow-[0_2px_8px_rgba(229,9,20,0.5)]">
                      <span className="text-[9px] font-black text-white uppercase tracking-wider leading-tight">
                        LIVE
                      </span>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className="group relative flex flex-col items-center justify-center h-full w-full active:scale-95 transition-all duration-150"
              >
                <div
                  className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#e50914]/20 shadow-[0_0_12px_rgba(229,9,20,0.35)] text-[#ff2a55]"
                      : "text-[#9ca3af] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span
                    className={`mt-0.5 text-[10px] font-bold uppercase tracking-wider leading-tight ${
                      isActive ? "text-[#ff2a55] font-black" : "text-[#9ca3af]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

BottomNav.propTypes = {
  onOpenProfile: PropTypes.func,
};

export default BottomNav;
