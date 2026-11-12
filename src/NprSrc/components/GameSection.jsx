import { useState } from "react";
import PropTypes from "prop-types";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { nprCategories, nprGames } from "../data/nprMockData";

const categoryIconMap = {
  hot: {
    active: "/npr/category/cat_hot_active.png",
    inactive: "/npr/category/cat_hot_inactive.png",
  },
  live: {
    active: "/npr/category/cat_live_active.png",
    inactive: "/npr/category/cat_live_inactive.png",
  },
  slots: {
    active: "/npr/category/cat_slots_active.png",
    inactive: "/npr/category/cat_slots_inactive.png",
  },
  fish: {
    active: "/npr/category/cat_fish_active.png",
    inactive: "/npr/category/cat_fish_inactive.png",
  },
  sports: {
    active: "/npr/category/cat_sports_active.png",
    inactive: "/npr/category/cat_sports_inactive.png",
  },
  poker: {
    active: "/npr/category/cat_poker_active.png",
    inactive: "/npr/category/cat_poker_inactive.png",
  },
};

const GameSection = ({ onSelectGame }) => {
  const [activeCategory, setActiveCategory] = useState("hot");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter games by category
  const filteredGames = nprGames.filter((game) => {
    if (activeCategory === "hot") return true;
    return game.category.includes(activeCategory);
  });

  return (
    <div className="pl-5 sm:pl-8 pr-4 sm:pr-5 mb-3 flex gap-4 sm:gap-[21px] relative items-start">
      {/* Left Sidebar: Categories - Fixed/Sticky while cards scroll */}
      <div
        className={`flex-shrink-0 transition-all duration-300 sticky top-[56px] self-start z-20 max-h-[calc(100vh-70px)] overflow-y-auto npr-no-scrollbar ${
          sidebarCollapsed ? "w-0 overflow-visible opacity-0" : "w-[66px] sm:w-[68px]"
        }`}
      >
        <div className="flex flex-col items-center gap-3.5 py-1 relative">
          {nprCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const icons = categoryIconMap[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex flex-col items-center group w-full focus:outline-none select-none"
              >
                {/* Circular Icon Container - Exact 64-66px diameter */}
                <div
                  className={`w-[64px] h-[64px] sm:w-[66px] sm:h-[66px] rounded-full flex items-center justify-center transition-all duration-200 transform group-active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-b from-[#0062ff] to-[#012465] shadow-md border-0"
                      : "bg-[#dce8ff] border-[1.5px] border-[#2968de] hover:bg-[#d0e0ff]"
                  }`}
                >
                  <img
                    src={isActive ? icons.active : icons.inactive}
                    alt={cat.name}
                    className="w-[42px] h-[42px] sm:w-[44px] sm:h-[44px] object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                </div>

                {/* Exact Label */}
                <span
                  className={`text-[11px] sm:text-[11.5px] mt-1 text-center leading-[1.1] select-none ${
                    isActive ? "font-black text-[#0047ba]" : "font-extrabold text-[#002d74]"
                  }`}
                >
                  {cat.id === "live" ? (
                    <>
                      Live
                      <br />
                      Casino
                    </>
                  ) : (
                    cat.name
                  )}
                </span>
              </button>
            );
          })}

          {/* Sidebar Collapse Toggle Arrow (Fixed alongside sticky sidebar) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -left-5 sm:-left-7 bottom-3 z-30 w-5 h-9 bg-[#0047ba] hover:bg-[#003da5] text-white rounded-r-xl flex items-center justify-center shadow-lg transition active:scale-95"
            title={sidebarCollapsed ? "Expand Categories" : "Collapse Categories"}
          >
            {sidebarCollapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
          </button>
        </div>
      </div>

      {/* Right Area: Game Cards Grid (3 Columns) - Scrolls smoothly */}
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-3 gap-[9px] sm:gap-[10px]">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => onSelectGame(game)}
              className="npr-game-card flex flex-col cursor-pointer group"
            >
              {/* Game Thumbnail Card - Fills cell width with exact 9-10px gap */}
              <div className="relative w-full aspect-square rounded-[10px] overflow-hidden bg-gray-900 shadow-xs border border-gray-100 group-hover:shadow-md transition">
                <img
                  src={game.image}
                  alt={game.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Optional Badges on image */}
                {game.badge && (
                  <span className="absolute top-1 left-1 bg-red-600 text-white font-black text-[8px] px-1.5 py-0.2 rounded-sm shadow uppercase">
                    {game.badge}
                  </span>
                )}

                {/* Favorite Star */}
                <div className="absolute top-1 right-1 text-white/50 hover:text-yellow-400 transition">
                  <FaStar size={11} />
                </div>
              </div>

              {/* Provider Name (Cyan / Light Blue) */}
              <span className="text-[#0066f5] text-[10px] font-extrabold mt-1 text-center truncate w-full">
                {game.provider}
              </span>

              {/* Game Title */}
              <p className="text-[#0f172a] text-[10.5px] sm:text-[11px] font-bold text-center leading-tight line-clamp-2 group-hover:text-[#0047ba] transition">
                {game.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

GameSection.propTypes = {
  onSelectGame: PropTypes.func.isRequired,
};

export default GameSection;

