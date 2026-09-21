import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaTrophy, FaPlay, FaUserAlt } from "react-icons/fa";
import { GiCardPlay } from "react-icons/gi";

const BottomNav = ({ onOpenMenu, onOpenProfile }) => {
  const location = useLocation();

  const NAV_ITEMS = [
    {
      id: "home",
      label: "Home",
      icon: <FaHome />,
      path: "/",
    },
    {
      id: "sports",
      label: "Sports",
      icon: <FaTrophy />,
      path: "/sports",
    },
    {
      id: "inplay",
      label: "In-Play",
      icon: <FaPlay />,
      path: "/inplay",
      featured: true,
    },
    {
      id: "live",
      label: "Live Casino",
      icon: <GiCardPlay />,
      path: "/live-casino",
    },
    {
      id: "account",
      label: "Account",
      icon: <FaUserAlt />,
      path: "/account",
      isAction: true,
    },
  ];

  const isItemActive = (item) => {
    if (item.path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  };

  return (
    <nav
      className="
        fixed
        inset-x-0
        bottom-0
        z-40
        w-full
        md:hidden
        select-none
        pb-[env(safe-area-inset-bottom)]
      "
      aria-label="Mobile navigation"
    >
      {/* Main Navigation Bar */}
      <div
        className="
          relative
          w-full
          overflow-visible
          border-t
          border-[#e4e4e4]
          bg-white
          shadow-[0_-10px_32px_rgba(0,0,0,0.10)]
        "
      >
        {/* -----------------------------------------
            CENTER CIRCLE BACK PLATE
            Creates premium cutout effect
        ------------------------------------------ */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[-29px]
            z-0
            h-[64px]
            w-[64px]
            -translate-x-1/2
            rounded-full
            bg-white
            shadow-[0_-3px_14px_rgba(0,0,0,0.08)]
          "
        />

        {/* -----------------------------------------
            NAVIGATION GRID
        ------------------------------------------ */}
        <div
          className="
            relative
            z-10
            grid
            h-[67px]
            w-full
            grid-cols-5
            items-stretch
          "
        >
          {NAV_ITEMS.map((item) => {
            const isActive = isItemActive(item);

            /* ========================================
               ACCOUNT
            ======================================== */
            if (item.isAction && onOpenProfile) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={onOpenProfile}
                  aria-label={item.label}
                  className="
                    relative
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    outline-none
                  "
                >
                  <span
                    className="
                      flex
                      h-full
                      w-full
                      flex-col
                      items-center
                      justify-center
                    "
                  >
                    {/* Icon */}
                    <span
                      className={`
                        relative
                        flex
                        h-[34px]
                        w-[48px]
                        items-center
                        justify-center
                        rounded-xl
                        transition-all
                        duration-200
                        active:scale-90
                        ${
                          isActive
                            ? "bg-[#b20d3d]/10 text-[#b20d3d]"
                            : "text-[#737373]"
                        }
                      `}
                    >
                      <span className="text-[16px]">{item.icon}</span>

                      {isActive && (
                        <span
                          className="
                            absolute
                            bottom-[-5px]
                            left-1/2
                            h-[3px]
                            w-[18px]
                            -translate-x-1/2
                            rounded-full
                            bg-[#b20d3d]
                          "
                        />
                      )}
                    </span>

                    {/* Label */}
                    <span
                      className={`
                        mt-[5px]
                        text-[9px]
                        leading-none
                        ${
                          isActive
                            ? "font-bold text-[#a20b37]"
                            : "font-medium text-[#6f6f6f]"
                        }
                      `}
                    >
                      {item.label}
                    </span>
                  </span>
                </button>
              );
            }

            /* ========================================
               IN-PLAY
            ======================================== */
            if (item.featured) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-label={item.label}
                  className="
                    relative
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                  "
                >
                  <span
                    className="
                      absolute
                      top-[-25px]
                      flex
                      flex-col
                      items-center
                    "
                  >
                    {/* Soft Glow */}
                    <span
                      className="
                        pointer-events-none
                        absolute
                        -inset-[9px]
                        rounded-full
                        bg-[#b20d3d]/10
                        blur-xl
                      "
                    />

                    {/* Outer Ring */}
                    <span
                      className="
                        relative
                        flex
                        h-[58px]
                        w-[58px]
                        items-center
                        justify-center
                        rounded-full
                        border-[4px]
                        border-white
                        bg-[#202020]
                        shadow-[0_7px_22px_rgba(0,0,0,0.28)]
                        transition-all
                        duration-200
                        active:scale-[0.91]
                      "
                    >
                      {/* Active Inner Gradient */}
                      <span
                        className={`
                          absolute
                          inset-[3px]
                          rounded-full
                          transition-all
                          duration-200
                          ${
                            isActive
                              ? "bg-gradient-to-br from-[#85082a] via-[#b10d3d] to-[#d51a4c]"
                              : "bg-gradient-to-br from-[#191919] to-[#3a3a3a]"
                          }
                        `}
                      />

                      {/* Inner Ring */}
                      <span
                        className="
                          pointer-events-none
                          absolute
                          inset-[7px]
                          rounded-full
                          border
                          border-white/10
                        "
                      />

                      {/* Play Icon */}
                      <span
                        className="
                          relative
                          z-10
                          translate-x-[1px]
                          text-[17px]
                          text-white
                        "
                      >
                        {item.icon}
                      </span>

                      {/* Live Dot */}
                      <span
                        className="
                          absolute
                          right-[-1px]
                          top-[-1px]
                          z-20
                          flex
                          h-[14px]
                          w-[14px]
                          items-center
                          justify-center
                          rounded-full
                          border-[2px]
                          border-white
                          bg-[#25b64b]
                          shadow-[0_2px_6px_rgba(37,182,75,0.35)]
                        "
                      >
                        <span
                          className="
                            h-[4px]
                            w-[4px]
                            rounded-full
                            bg-white
                          "
                        />
                      </span>
                    </span>

                    {/* Label */}
                    <span
                      className={`
                        mt-[6px]
                        whitespace-nowrap
                        text-[9px]
                        leading-none
                        ${
                          isActive
                            ? "font-bold text-[#a20b37]"
                            : "font-semibold text-[#666666]"
                        }
                      `}
                    >
                      {item.label}
                    </span>
                  </span>
                </Link>
              );
            }

            /* ========================================
               NORMAL ITEMS
            ======================================== */
            return (
              <Link
                key={item.id}
                to={item.path}
                aria-label={item.label}
                className="
                  relative
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  outline-none
                "
              >
                <span
                  className="
                    flex
                    h-full
                    w-full
                    flex-col
                    items-center
                    justify-center
                  "
                >
                  {/* Icon Container */}
                  <span
                    className={`
                      relative
                      flex
                      h-[34px]
                      w-[48px]
                      items-center
                      justify-center
                      rounded-xl
                      transition-all
                      duration-200
                      active:scale-90
                      ${
                        isActive
                          ? "bg-[#b20d3d]/10 text-[#b20d3d]"
                          : "bg-transparent text-[#737373]"
                      }
                    `}
                  >
                    <span className="text-[16px]">{item.icon}</span>

                    {/* Active Line */}
                    {isActive && (
                      <span
                        className="
                          absolute
                          bottom-[-5px]
                          left-1/2
                          h-[3px]
                          w-[18px]
                          -translate-x-1/2
                          rounded-full
                          bg-[#b20d3d]
                          shadow-[0_2px_7px_rgba(178,13,61,0.25)]
                        "
                      />
                    )}
                  </span>

                  {/* Label */}
                  <span
                    className={`
                      mt-[5px]
                      whitespace-nowrap
                      text-[9px]
                      leading-none
                      ${
                        isActive
                          ? "font-bold text-[#a20b37]"
                          : "font-medium text-[#707070]"
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Very Subtle Bottom Edge */}
        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            right-0
            h-[1px]
            bg-[#f1f1f1]
          "
        />
      </div>
    </nav>
  );
};

export default BottomNav;
