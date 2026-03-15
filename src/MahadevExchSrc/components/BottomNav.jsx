import { NavLink } from "react-router-dom";

import HomeInplayIcon from "./icons/HomeInplayIcon";
import HomeIcon from "./icons/HomeIcon";
import CasinoIcon from "./icons/CasinoIcon";
import OpenBetsIcon from "./icons/OpenBetsIcon";
import ProfileIcon from "./icons/ProfileIcon";

const BottomNav = () => {
  const navItems = [
    {
      path: "/",
      label: "HOME",
      icon: HomeIcon,
    },
    {
      path: "/casino-games",
      label: "CASINO",
      icon: CasinoIcon,
    },
    {
      path: "/sports/cricket/inplay",
      label: "IN-PLAY",
      icon: HomeInplayIcon,
    },
    {
      path: "/open-bets",
      label: "OPEN BETS",
      icon: OpenBetsIcon,
    },
    {
      path: "/sport/profile",
      label: "ACCOUNT",
      icon: ProfileIcon,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-[999] min-h-[64px] bg-[#1a1a1a] shadow-[0_-3px_5px_rgba(0,0,0,0.5)] flex justify-between items-center">
      {navItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 text-gray-400 $`
            }
          >
            {/* {
                isActive ? "text-white" : "text-gray-400"
              } */}
            <Icon />

            <span className="text-[9.5px] font-bold mt-1">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNav;
