import React, { useState, useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaPlay } from "react-icons/fa";

const GameSectionCarousel = ({
  tabs = [],
  games = [],
  onGameClick,
  defaultTab,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]);
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Filter games if categorized
  const displayedGames = games.filter(
    (g) => !g.category || g.category.toLowerCase() === activeTab?.toLowerCase() || tabs.length <= 1
  );
  const finalGames = displayedGames.length > 0 ? displayedGames : games;

  return (
    <section className="w-full px-2 pt-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Tabs & Arrows */}
        <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-800 pb-1.5 gap-2">
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs sm:text-sm font-black tracking-tight whitespace-nowrap transition-colors relative py-1 ${
                    isSelected
                      ? "text-red-600 dark:text-red-500 font-extrabold"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab}
                  {isSelected && (
                    <span className="absolute bottom-[-7px] left-0 right-0 h-[2.5px] bg-red-600 rounded-full shadow" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Carousel Nav Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 transition-colors"
            >
              <IoChevronBack className="text-xs" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 transition-colors"
            >
              <IoChevronForward className="text-xs" />
            </button>
          </div>
        </div>

        {/* Carousel Items Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-3 scroll-smooth"
        >
          {finalGames.map((game) => (
            <div
              key={game.id}
              onClick={() => onGameClick && onGameClick(game)}
              className="group relative flex-shrink-0 w-[115px] sm:w-[140px] md:w-[155px] h-[160px] sm:h-[195px] rounded-2xl overflow-hidden shadow-md cursor-pointer select-none kb-card-hover border border-gray-200 dark:border-gray-800 bg-[#12141c]"
            >
              {/* Background Image / Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${game.bgColor} flex flex-col justify-between p-2.5`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between z-10">
                  {game.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-yellow-300 border border-yellow-400/20 shadow-sm backdrop-blur-sm">
                      {game.badge}
                    </span>
                  )}
                  {game.provider && (
                    <span className="text-[9px] font-extrabold uppercase text-gray-300 tracking-wider">
                      {game.provider}
                    </span>
                  )}
                </div>

                {/* Center Graphic */}
                <div className="my-auto flex flex-col items-center justify-center text-center z-10">
                  {game.id.includes("ball") && (
                    <div className="flex flex-col items-center font-black tracking-tighter">
                      <span className="text-xl sm:text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        BALL
                      </span>
                      <span className="text-xs text-blue-300 font-bold tracking-widest">
                        BY
                      </span>
                      <span className="text-xl sm:text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        BALL
                      </span>
                    </div>
                  )}

                  {game.id.includes("aviator") && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl sm:text-3xl filter drop-shadow-md animate-pulse">
                        ✈️
                      </div>
                      <span className="mt-1 text-sm sm:text-base font-black text-white italic tracking-wider drop-shadow-lg">
                        AVIATOR
                      </span>
                      <span className="text-[9px] text-red-200 font-bold uppercase tracking-widest">
                        Spribe
                      </span>
                    </div>
                  )}

                  {game.id.includes("mines") && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl sm:text-3xl filter drop-shadow-md">
                        💣 💎
                      </div>
                      <span className="mt-1 text-sm sm:text-base font-black text-yellow-400 tracking-wider drop-shadow-lg">
                        MINES
                      </span>
                    </div>
                  )}

                  {game.id.includes("jili") && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl sm:text-3xl filter drop-shadow-md">
                        👑 🎰
                      </div>
                      <span className="mt-1 text-sm sm:text-base font-black text-amber-300 tracking-wider drop-shadow-lg">
                        JILI
                      </span>
                      <span className="text-[9px] text-orange-200 font-bold">
                        SUPER JACKPOT
                      </span>
                    </div>
                  )}

                  {game.id.includes("fortunes") && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl sm:text-3xl filter drop-shadow-md">
                        🐉 💰
                      </div>
                      <span className="mt-1 text-xs sm:text-sm font-black text-yellow-300 tracking-tight drop-shadow-lg">
                        1 MILLION
                      </span>
                      <span className="text-[9px] text-yellow-100 font-bold tracking-widest">
                        FORTUNES
                      </span>
                    </div>
                  )}

                  {game.id.includes("scratch") && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl sm:text-3xl filter drop-shadow-md">
                        🎫 ⚡
                      </div>
                      <span className="mt-1 text-xs sm:text-sm font-black text-emerald-300 tracking-tight drop-shadow-lg">
                        SCRATCH
                      </span>
                    </div>
                  )}

                  {game.id.includes("plinko") && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl sm:text-3xl filter drop-shadow-md">
                        🎯
                      </div>
                      <span className="mt-1 text-sm sm:text-base font-black text-purple-300 tracking-wider drop-shadow-lg">
                        PLINKO
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Subtitle / Multiplier */}
                <div className="z-10 text-center">
                  <span className="text-[10px] text-white/90 font-bold block truncate drop-shadow">
                    {game.name}
                  </span>
                </div>
              </div>

              {/* Hover Play Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[1px]">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                  <FaPlay className="ml-0.5 text-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GameSectionCarousel;
