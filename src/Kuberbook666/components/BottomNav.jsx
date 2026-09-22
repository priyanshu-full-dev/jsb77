import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";

const BottomNav = ({ onOpenMenu, onOpenProfile }) => {
  const location = useLocation();
  const path = location.pathname;

  const isHomeActive = path === "/" || path === "";
  const isInPlayActive = path.startsWith("/inplay");
  const isSportsActive =
    path.startsWith("/sports") ||
    path.startsWith("/cricket") ||
    path.startsWith("/soccer") ||
    path.startsWith("/tennis");
  const isCasinoActive =
    path.startsWith("/casino") ||
    path.startsWith("/live-casino") ||
    path.startsWith("/aura") ||
    path.startsWith("/mac88") ||
    path.startsWith("/slot") ||
    path.startsWith("/aviator");
  const isAccountActive =
    path.startsWith("/account") || path.startsWith("/profile");

  const navItems = [
    {
      id: "home",
      label: "Home",
      to: "/",
      icon: "/Icon/home.svg",
      isActive: isHomeActive,
      isButton: false,
    },
    {
      id: "inplay",
      label: "In-Play",
      to: "/inplay",
      icon: "/Icon/timer.svg",
      isActive: isInPlayActive,
      isButton: false,
      hasLiveBadge: true,
    },
    {
      id: "sports",
      label: "Sports",
      to: "/sports",
      icon: "/Icon/trophy.svg",
      isActive: isSportsActive,
      isButton: false,
    },
    {
      id: "casino",
      label: "Casino",
      to: "/casino",
      icon: "/Icon/mini_games_optimized.gif",
      isActive: isCasinoActive,
      isButton: false,
      isGif: true,
    },
    {
      id: "account",
      label: "Account",
      onClick: onOpenProfile,
      icon: "/Icon/user.svg",
      isActive: isAccountActive,
      isButton: true,
    },
  ];

  // Active Tab Index
  const activeIndex = navItems.findIndex((item) => item.isActive);
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  // Refs for Liquid Physics
  const liquidCapsuleRef = useRef(null);
  const iconsRef = useRef([]);
  const labelsRef = useRef([]);
  const prevIndexRef = useRef(safeActiveIndex);

  // GSAP Liquid Fluid Stretch & Snap Physics
  useEffect(() => {
    const fromIndex = prevIndexRef.current;
    const toIndex = safeActiveIndex;
    const isMoving = fromIndex !== toIndex;
    prevIndexRef.current = safeActiveIndex;

    if (liquidCapsuleRef.current) {
      if (isMoving) {
        const tl = gsap.timeline();

        // 1. Fluid Stretch along motion axis
        tl.to(liquidCapsuleRef.current, {
          xPercent: toIndex * 100,
          scaleX: 1.35,
          scaleY: 0.86,
          duration: 0.2,
          ease: "power2.inOut",
        })
          // 2. Liquid Squash on impact
          .to(liquidCapsuleRef.current, {
            scaleX: 0.92,
            scaleY: 1.1,
            duration: 0.14,
            ease: "power1.out",
          })
          // 3. Natural Elastic Settle
          .to(liquidCapsuleRef.current, {
            scaleX: 1,
            scaleY: 1,
            duration: 0.36,
            ease: "elastic.out(1.15, 0.5)",
          });
      } else {
        gsap.set(liquidCapsuleRef.current, { xPercent: toIndex * 100 });
      }
    }

    // Active Icon Elevation & Micro-Spring
    iconsRef.current.forEach((iconEl, i) => {
      if (!iconEl) return;
      if (i === toIndex) {
        gsap.to(iconEl, {
          y: -2,
          scale: 1.12,
          duration: 0.35,
          ease: "back.out(2.2)",
        });
      } else {
        gsap.to(iconEl, {
          y: 0,
          scale: 0.95,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    });

    // Label Animation
    labelsRef.current.forEach((labelEl, i) => {
      if (!labelEl) return;
      if (i === toIndex) {
        gsap.to(labelEl, {
          scale: 1.05,
          y: -1,
          duration: 0.25,
          ease: "power2.out",
        });
      } else {
        gsap.to(labelEl, {
          scale: 1,
          y: 0,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    });
  }, [safeActiveIndex]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 w-full md:hidden select-none pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Navigation"
    >
      {/* Full-Width Edge-to-Edge Surface */}
      <div
        className="relative w-full h-[58px] flex items-center justify-between border-t border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.65)] backdrop-blur-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(16, 19, 29, 0.98) 0%, rgba(9, 11, 17, 0.99) 100%)",
        }}
      >
        {/* Subtle Ambient Top Rim Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

        {/* ============================================================== */}
        {/* GSAP BORDERLESS FADED LIQUID CAPSULE (HEADER GRADIENT)         */}
        {/* ============================================================== */}
        <div className="absolute inset-0 pointer-events-none w-full h-full flex items-center">
          <div
            ref={liquidCapsuleRef}
            className="w-1/5 h-full flex items-center justify-center will-change-transform"
            style={{ transform: `translateX(${safeActiveIndex * 100}%)` }}
          >
            {/* Organic Fluid Faded Liquid Droplet matching Header Gradient */}
            <div
              className="relative w-[72%] h-[42px] rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_4px_16px_rgba(193,9,49,0.35)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(110, 8, 29, 0.75) 0%, rgba(193, 9, 49, 0.8) 100%)",
              }}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5-GRID NAVIGATION ITEMS                                       */}
        {/* ============================================================== */}
        <div className="relative z-10 grid grid-cols-5 w-full h-full">
          {navItems.map((item, index) => {
            const isTabActive = item.isActive;

            const content = (
              <div className="relative flex flex-col items-center justify-center w-full h-full">
                {/* Icon Container */}
                <div
                  ref={(el) => (iconsRef.current[index] = el)}
                  className="relative flex items-center justify-center w-6 h-6 mb-0.5 will-change-transform"
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={`object-contain transition-opacity duration-200 ${
                      item.isGif ? "w-[23px] h-[23px]" : "w-[21px] h-[21px]"
                    } ${
                      isTabActive
                        ? "brightness-125 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] opacity-100"
                        : "opacity-75 hover:opacity-100"
                    }`}
                    loading="lazy"
                  />

                  {/* Live Radar Ping for In-Play */}
                  {item.hasLiveBadge && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-80" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981] shadow-[0_0_6px_#10b981]" />
                    </span>
                  )}
                </div>

                {/* Tab Label */}
                <span
                  ref={(el) => (labelsRef.current[index] = el)}
                  className={`text-[10.5px] leading-tight tracking-tight transition-colors duration-200 will-change-transform ${
                    isTabActive
                      ? "font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                      : "font-medium text-[#8c9cb0]"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );

            if (item.isButton) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="w-full h-full p-0 m-0 border-none outline-none cursor-pointer active:scale-95 transition-transform"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.to}
                className="w-full h-full flex active:scale-95 transition-transform"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;

