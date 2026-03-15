import { FaPlane, FaBaseballBall } from "react-icons/fa";
import { GiBoxingGlove } from "react-icons/gi";
import { MdSportsCricket } from "react-icons/md";

const menus = [
  { title: "Aviator", icon: FaPlane },
  { title: "Grey Gaming", icon: FaBaseballBall },
  { title: "Boxing", icon: GiBoxingGlove },
  { title: "Titans v Kwazulu", icon: MdSportsCricket },
];

const Navbar = () => {
  return (
    <div className="bg-[#1c1c1c]">

      <div className="flex items-center overflow-x-auto hide-scrollbar h-[47px] px-2">

        {menus.map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={i}
              className="flex items-center text-white text-[12px] font-extrabold whitespace-nowrap px-4 relative"
            >
              {/* Animated Icon */}
              <Icon
                size={16}
                className="mr-2 text-[white] iconPulse"
              />

              {item.title}

              {i !== menus.length - 1 && (
                <div className="absolute right-0 h-[22px] w-[1px] bg-[#3a3a3a]" />
              )}
            </div>
          );
        })}

      </div>

    </div>
  );
};

export default Navbar;