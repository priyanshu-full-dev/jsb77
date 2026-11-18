import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import SearchPopup from "./SearchPopup";

// Cricket ball icon with angled seam stripes matching reference
const CricketBallSvg = ({ color = "#1D1D1D", stripe = "#F5A623", size = 19 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" fill={color} />
    <line x1="14.2" y1="4.5" x2="4.5" y2="14.2" stroke={stripe} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16.5" y1="6.8" x2="6.8" y2="16.5" stroke={stripe} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Classic soccer ball icon with pentagons
const SoccerBallSvg = ({ size = 19 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" />
    <polygon points="10,6.5 12.8,8.5 11.7,11.8 8.3,11.8 7.2,8.5" fill="#000000" />
    <line x1="10" y1="6.5" x2="10" y2="1" stroke="#000000" strokeWidth="0.9" />
    <line x1="12.8" y1="8.5" x2="18.8" y2="6.5" stroke="#000000" strokeWidth="0.9" />
    <line x1="11.7" y1="11.8" x2="15.8" y2="18.5" stroke="#000000" strokeWidth="0.9" />
    <line x1="8.3" y1="11.8" x2="4.2" y2="18.5" stroke="#000000" strokeWidth="0.9" />
    <line x1="7.2" y1="8.5" x2="1.2" y2="6.5" stroke="#000000" strokeWidth="0.9" />
  </svg>
);

// Classic tennis ball icon with curved seams
const TennisBallSvg = ({ size = 19 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" />
    <path d="M4.2 4.5C7.2 7 7.2 13 4.2 15.5" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M15.8 4.5C12.8 7 12.8 13 15.8 15.5" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// Dual-color pill badge: White ((•)) on left | Red count on right
const DualLiveBadge = ({ count = 0 }) => (
  <div className="inline-flex items-stretch rounded-[3px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.4)] leading-none select-none h-[14px] border border-black/20">
    <span className="bg-white text-[#E50000] px-1 flex items-center justify-center font-black text-[8px] tracking-tighter">
      ((•))
    </span>
    <span className="bg-[#E50000] text-white font-black px-1.5 flex items-center justify-center text-[10px]">
      {count}
    </span>
  </div>
);

export const sportsList = [
  { sportsName: "Cricket", eid: "4", href: "/cricket" },
  { sportsName: "Soccer", eid: "1", href: "/soccer" },
  { sportsName: "Tennis", eid: "2", href: "/tennis" },
];

function SiteNavigation({ location }) {
  const scrollContainerRef = useRef(null);
  const navItemRefs = useRef([]);

  const cricketMatches = useSelector(
    (state) => state.auraMatches?.cricket?.matches?.data || [],
  );
  const soccerMatches = useSelector(
    (state) => state.auraMatches?.soccer?.matches?.data || [],
  );
  const tennisMatches = useSelector(
    (state) => state.auraMatches?.tennis?.matches?.data || [],
  );

  const getMatchCount = (name) => {
    const n = name?.toLowerCase();
    if (n === "cricket") return cricketMatches.length || 20;
    if (n === "soccer") return soccerMatches.length || 0;
    if (n === "tennis") return tennisMatches.length || 0;
    return 0;
  };

  const scrollToCenter = (index) => {
    const container = scrollContainerRef.current;
    const item = navItemRefs.current[index];
    if (container && item) {
      if (index <= 0) {
        container.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      const scrollLeft =
        item.offsetLeft - container.offsetWidth / 2 + item.offsetWidth / 2;
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const index = sportsList.findIndex(
      (sportRef) => sportRef?.href?.includes(location?.pathname) || false,
    );

    if (index <= 0) {
      container.scrollLeft = 0;
      return;
    }

    scrollToCenter(index);
  }, [location?.pathname]);

  return (
    <div
      className={`w-full flex items-end justify-between bg-black border-t-[2.5px] border-b-[2.5px] border-[#FDBB14] h-[46px] select-none shadow-xs ${
        "/full-market, /account".includes(location?.pathname) ? "mt-[60px]" : ""
      }`}
    >
      {/* Scrollable Sports Tabs Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-end h-full overflow-x-auto scrollbar-none flex-1 pl-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* CRICKET TAB */}
        <NavLink
          to="/cricket"
          ref={(el) => (navItemRefs.current[0] = el)}
          onClick={() => scrollToCenter(0)}
          className={({ isActive }) =>
            `relative flex items-center gap-2 h-[36px] px-3.5 transition-all select-none flex-shrink-0 ${
              isActive
                ? "bg-[#FDBB14] text-black rounded-t-[8px]"
                : "bg-transparent text-white hover:bg-white/5"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Badge positioned above tab so it never overlaps Cricket text */}
              <div className="absolute -top-[10px] right-[4px]">
                <DualLiveBadge count={getMatchCount("Cricket")} />
              </div>
              <CricketBallSvg
                color={isActive ? "#000000" : "#FFFFFF"}
                stripe={isActive ? "#FDBB14" : "#1D1D1D"}
                size={20}
              />
              <span
                className={`text-[14px] font-black tracking-tight ${
                  isActive ? "text-black" : "text-white"
                }`}
              >
                Cricket
              </span>
            </>
          )}
        </NavLink>

        {/* SOCCER TAB */}
        <NavLink
          to="/soccer"
          ref={(el) => (navItemRefs.current[1] = el)}
          onClick={() => scrollToCenter(1)}
          className={({ isActive }) =>
            `relative flex items-center gap-2 h-[36px] px-3.5 transition-all select-none flex-shrink-0 ${
              isActive
                ? "bg-[#FDBB14] text-black rounded-t-[8px]"
                : "bg-transparent text-white hover:bg-white/5"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Badge centered above tab */}
              <div className="absolute -top-[10px] left-1/2 -translate-x-1/2">
                <DualLiveBadge count={getMatchCount("Soccer")} />
              </div>
              <SoccerBallSvg size={20} />
              <span
                className={`text-[14px] tracking-tight ${
                  isActive ? "text-black font-black" : "text-white font-bold"
                }`}
              >
                Soccer
              </span>
            </>
          )}
        </NavLink>

        {/* TENNIS TAB */}
        <NavLink
          to="/tennis"
          ref={(el) => (navItemRefs.current[2] = el)}
          onClick={() => scrollToCenter(2)}
          className={({ isActive }) =>
            `relative flex items-center gap-2 h-[36px] px-3.5 transition-all select-none flex-shrink-0 ${
              isActive
                ? "bg-[#FDBB14] text-black rounded-t-[8px]"
                : "bg-transparent text-white hover:bg-white/5"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Badge centered above tab */}
              <div className="absolute -top-[10px] left-1/2 -translate-x-1/2">
                <DualLiveBadge count={getMatchCount("Tennis")} />
              </div>
              <TennisBallSvg size={20} />
              <span
                className={`text-[14px] tracking-tight ${
                  isActive ? "text-black font-black" : "text-white font-bold"
                }`}
              >
                Tennis
              </span>
            </>
          )}
        </NavLink>
      </div>

      {/* SEARCH BOX ON RIGHT - Dark gradient block matching reference */}
      <div className="h-full w-[44px] flex items-center justify-center bg-gradient-to-b from-[#353535] to-[#222222] border-l border-[#3a3a3a] flex-shrink-0 cursor-pointer">
        <SearchPopup />
      </div>
    </div>
  );
}

export default SiteNavigation;
