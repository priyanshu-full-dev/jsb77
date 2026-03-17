import { NavLink } from "react-router-dom";
import { useState } from "react";

import HomeInplayIcon from "./icons/HomeInplayIcon";
import HomeIcon from "./icons/HomeIcon";
import CasinoIcon from "./icons/CasinoIcon";
import OpenBetsIcon from "./icons/OpenBetsIcon";
import ProfileIcon from "./icons/ProfileIcon";
import OpenBets from "./OpenBets";

const BottomNav = () => {
  const [showPopup, setShowPopup] = useState(false);

  const navItems = [
    { path: "/", label: "HOME", icon: HomeIcon },
    { path: "/casino-games", label: "CASINO", icon: CasinoIcon },
    { path: "/sports/cricket/inplay", label: "IN-PLAY", icon: HomeInplayIcon },
    { path: "/open-bets", label: "OPEN BETS", icon: OpenBetsIcon, isPopup: true },
    { path: "/sport/profile", label: "ACCOUNT", icon: ProfileIcon },
  ];

  return (
    <>
      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full z-[999] min-h-[64px] bg-[#1a1a1a] shadow-[0_-3px_5px_rgba(0,0,0,0.5)] flex">
        {navItems.map((item, index) => {
          const Icon = item.icon;

          // ✅ OPEN BETS (Popup + Active)
          if (item.isPopup) {
            const isActive = showPopup;

            return (
              <div
                key={index}
                onClick={() => setShowPopup(true)}
                className="flex-1 cursor-pointer"
              >
                <div
                  className={`flex flex-col items-center justify-center pt-2 pb-1 transition-all border-b-[3px]
                  ${
                    isActive
                      ? "text-white border-white"
                      : "text-gray-400 border-transparent"
                  }`}
                >
                  <Icon color={isActive ? "#ffffff" : "#9ca3af"} />

                  <span className="text-[9.5px] font-bold mt-1">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          }

          // ✅ Normal NavLink (with FIX)
          return (
            <NavLink key={index} to={item.path} className="flex-1">
              {({ isActive }) => {
                const finalActive = !showPopup && isActive; // 🔥 main fix

                return (
                  <div
                    className={`flex flex-col items-center justify-center pt-2 pb-1 transition-all border-b-[3px]
                    ${
                      finalActive
                        ? "text-white border-white"
                        : "text-gray-400 border-transparent"
                    }`}
                  >
                    <Icon color={finalActive ? "#ffffff" : "#9ca3af"} />

                    <span className="text-[9.5px] font-bold mt-1">
                      {item.label}
                    </span>
                  </div>
                );
              }}
            </NavLink>
          );
        })}
      </div>

     {showPopup && <OpenBets onClose={() => setShowPopup(false)} />}
    </>
  );
};

export default BottomNav;