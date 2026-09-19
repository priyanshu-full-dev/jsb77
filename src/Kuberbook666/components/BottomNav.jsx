import { useMemo } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// ==========================================
// LUXURY VECTOR ICONS WITH METALLIC/NEON GLOW
// ==========================================
const HomeIcon = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-all duration-300 ${
      active
        ? "drop-shadow-[0_0_8px_rgba(225,29,72,0.8)] scale-110"
        : "opacity-75 group-hover:opacity-100"
    }`}
  >
    <path
      d="M3 10.182V20C3 20.5523 3.44772 21 4 21H9V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21H20C20.5523 21 21 20.5523 21 20V10.182C21 9.61058 20.7303 9.07127 20.2644 8.71868L13.2644 3.42144C12.5192 2.85741 11.4808 2.85741 10.7356 3.42144L3.73556 8.71868C3.26966 9.07127 3 9.61058 3 10.182Z"
      fill={active ? "url(#rubyGradient)" : "currentColor"}
    />
    <defs>
      <linearGradient id="rubyGradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff4b6e" />
        <stop offset="1" stopColor="#c10931" />
      </linearGradient>
    </defs>
  </svg>
);

const TrophyIcon = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-all duration-300 ${
      active
        ? "drop-shadow-[0_0_8px_rgba(225,29,72,0.8)] scale-110"
        : "opacity-75 group-hover:opacity-100"
    }`}
  >
    <path
      d="M19 4H18V3C18 2.44772 17.5523 2 17 2H7C6.44772 2 6 2.44772 6 3V4H5C3.34315 4 2 5.34315 2 7C2 8.44186 3.0181 9.64539 4.38556 9.93282C5.07474 12.2798 7.08579 14.0734 9.5539 14.444C9.84589 15.6599 10.8228 16.6022 12.0526 16.896V19H9C8.44772 19 8 19.4477 8 20C8 20.5523 8.44772 21 9 21H15C15.5523 21 16 20.5523 16 20C16 19.4477 15.5523 19 15 19H12.0526V16.896C13.2824 16.6022 14.2593 15.6599 14.5513 14.444C17.0194 14.0734 19.0305 12.2798 19.7196 9.93282C21.0871 9.64539 22.1052 8.44186 22.1052 7C22.1052 5.34315 20.762 4 19 4ZM4 7C4 6.44772 4.44772 6 5 6H6V8.75545C4.85876 8.42398 4 7.82207 4 7ZM18 8.75545V6H19C19.5523 6 20 6.44772 20 7C20 7.82207 19.1412 8.42398 18 8.75545Z"
      fill={active ? "url(#rubyGradientSports)" : "currentColor"}
    />
    <defs>
      <linearGradient id="rubyGradientSports" x1="2" y1="2" x2="22" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff4b6e" />
        <stop offset="1" stopColor="#c10931" />
      </linearGradient>
    </defs>
  </svg>
);

const InPlayIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-all duration-300 ${
      active
        ? "drop-shadow-[0_0_10px_rgba(255,42,85,1)] scale-110"
        : "opacity-90 group-hover:opacity-100"
    }`}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      fill={active ? "url(#liveBgGradient)" : "#222533"}
      stroke={active ? "#ff2a55" : "#3b4055"}
      strokeWidth="1.5"
    />
    <path
      d="M10 8.5L16 12L10 15.5V8.5Z"
      fill={active ? "#ffffff" : "#cbd5e1"}
    />
    <defs>
      <linearGradient id="liveBgGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff1e4d" />
        <stop offset="1" stopColor="#8b001e" />
      </linearGradient>
    </defs>
  </svg>
);

const CasinoIcon = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-all duration-300 ${
      active
        ? "drop-shadow-[0_0_8px_rgba(225,29,72,0.8)] scale-110"
        : "opacity-75 group-hover:opacity-100"
    }`}
  >
    <path
      d="M19.5 3H4.5C3.67157 3 3 3.67157 3 4.5V19.5C3 20.3284 3.67157 21 4.5 21H19.5C20.3284 21 21 20.3284 21 19.5V4.5C21 3.67157 20.3284 3 19.5 3Z"
      fill={active ? "url(#rubyGradientCasino)" : "currentColor"}
    />
    <path
      d="M12 7L9.5 12L12 17L14.5 12L12 7Z"
      fill={active ? "#ffffff" : "#0d0f18"}
    />
    <circle cx="7" cy="7" r="1.2" fill={active ? "#ffffff" : "#0d0f18"} />
    <circle cx="17" cy="17" r="1.2" fill={active ? "#ffffff" : "#0d0f18"} />
    <defs>
      <linearGradient id="rubyGradientCasino" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff4b6e" />
        <stop offset="1" stopColor="#c10931" />
      </linearGradient>
    </defs>
  </svg>
);

const AccountIcon = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-all duration-300 ${
      active
        ? "drop-shadow-[0_0_8px_rgba(225,29,72,0.8)] scale-110"
        : "opacity-75 group-hover:opacity-100"
    }`}
  >
    <path
      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
      fill={active ? "url(#rubyGradientAccount)" : "currentColor"}
    />
    <path
      d="M12.0002 14.5C6.99016 14.5 2.76016 18.01 2.05016 22.84C2.01016 23.11 2.15016 23.38 2.39016 23.5C2.63016 23.62 2.92016 23.57 3.10016 23.38C4.69016 21.67 7.00016 20.5 9.50016 20.5H14.5002C17.0002 20.5 19.3102 21.67 20.9002 23.38C21.0802 23.57 21.3702 23.62 21.6102 23.5C21.8502 23.38 21.9902 23.11 21.9502 22.84C21.2402 18.01 17.0102 14.5 12.0002 14.5Z"
      fill={active ? "url(#rubyGradientAccount)" : "currentColor"}
    />
    <defs>
      <linearGradient id="rubyGradientAccount" x1="2" y1="2" x2="22" y2="23.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff4b6e" />
        <stop offset="1" stopColor="#c10931" />
      </linearGradient>
    </defs>
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
        label: "Home",
        path: "/",
        renderIcon: (act) => <HomeIcon active={act} />,
      },
      {
        id: "sports",
        label: "Sports",
        path: "/sports",
        renderIcon: (act) => <TrophyIcon active={act} />,
      },
      {
        id: "inplay",
        label: "In-Play",
        path: "/inplay",
        isLive: true,
        renderIcon: (act) => <InPlayIcon active={act} />,
      },
      {
        id: "live",
        label: "Casino",
        path: "/live-casino",
        renderIcon: (act) => <CasinoIcon active={act} />,
      },
      {
        id: "account",
        label: isLoggedIn ? `₹${balanceStr}` : "Account",
        path: "/account",
        isAction: true,
        renderIcon: (act) => <AccountIcon active={act} />,
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
      {/* Upper Glowing Rim Line */}
      <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#c10931] to-transparent opacity-80" />

      {/* Luxury Frosted Glass Background Bar */}
      <div className="relative bg-[#0d0e15]/95 dark:bg-[#090a10]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.55)]">
        <div className="grid grid-cols-5 h-[58px] items-center px-1">
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
                  className="group relative flex flex-col items-center justify-center h-full w-full active:scale-90 transition-transform duration-150 cursor-pointer"
                >
                  {/* Subtle active background glow */}
                  {isActive && (
                    <div className="absolute inset-x-2 inset-y-1 rounded-xl bg-gradient-to-b from-[#c10931]/15 to-transparent pointer-events-none" />
                  )}

                  {/* Icon with Dynamic Glow */}
                  <div className="relative flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    {item.renderIcon(isActive)}
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-1 text-[10px] font-black tracking-wider uppercase transition-all duration-200 ${
                      isActive
                        ? "text-[#ff3b65] font-extrabold drop-shadow-[0_0_6px_rgba(255,59,101,0.5)] scale-105"
                        : "text-gray-400 group-hover:text-gray-200"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active Top Mini Indicator Dot */}
                  {isActive && (
                    <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-[#ff2a55] shadow-[0_0_8px_#ff2a55]" />
                  )}
                </button>
              );
            }

            // Center Highlight for In-Play Live Button
            if (item.isLive) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="group relative flex flex-col items-center justify-center h-full w-full active:scale-90 transition-transform duration-150"
                >
                  {/* Floating Elevated Circle with Pulsing Red Ring */}
                  <div className="relative -top-2 flex flex-col items-center justify-center">
                    <div
                      className={`relative p-1 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-tr from-[#6e081d] to-[#c10931] ring-2 ring-[#ff2a55]/60 shadow-[0_0_20px_rgba(193,9,49,0.7)]"
                          : "bg-[#151724] ring-1 ring-white/10 hover:ring-[#c10931]/40"
                      }`}
                    >
                      {item.renderIcon(isActive)}
                    </div>

                    {/* LIVE Pulsing Pill Tag */}
                    <div className="absolute -bottom-3 flex items-center gap-0.5 px-1.5 py-[1px] rounded-full bg-red-600 text-white shadow-md border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span className="text-[8px] font-black tracking-tighter uppercase leading-none">
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
                className="group relative flex flex-col items-center justify-center h-full w-full active:scale-90 transition-transform duration-150"
              >
                {/* Subtle active background glow */}
                {isActive && (
                  <div className="absolute inset-x-2 inset-y-1 rounded-xl bg-gradient-to-b from-[#c10931]/15 to-transparent pointer-events-none" />
                )}

                {/* Icon */}
                <div className="relative flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                  {item.renderIcon(isActive)}
                </div>

                {/* Label */}
                <span
                  className={`mt-1 text-[10px] font-black tracking-wider uppercase transition-all duration-200 ${
                    isActive
                      ? "text-[#ff3b65] font-extrabold drop-shadow-[0_0_6px_rgba(255,59,101,0.5)] scale-105"
                      : "text-gray-400 group-hover:text-gray-200"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Top Indicator */}
                {isActive && (
                  <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-[#ff2a55] shadow-[0_0_8px_#ff2a55]" />
                )}
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

HomeIcon.propTypes = {
  active: PropTypes.bool,
};

TrophyIcon.propTypes = {
  active: PropTypes.bool,
};

InPlayIcon.propTypes = {
  active: PropTypes.bool,
};

CasinoIcon.propTypes = {
  active: PropTypes.bool,
};

AccountIcon.propTypes = {
  active: PropTypes.bool,
};

export default BottomNav;
