import React, { useRef } from "react";
import { GiSpades } from "react-icons/gi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { INDIAN_CARD_GAMES } from "../data/kuberMockData";
import { FaPlay } from "react-icons/fa";

const IndianCardGamesSection = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full px-2 pt-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-800 pb-2">
          <div className="flex items-center gap-1.5">
            <GiSpades className="text-red-600 text-lg" />
            <h3 className="text-xs sm:text-sm font-black tracking-tight text-gray-900 dark:text-white uppercase">
              Indian Card Games
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/live-casino")}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              See All
            </button>
            <div className="flex items-center gap-1">
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
        </div>

        {/* Live Dealer Cards Carousel */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar py-3 scroll-smooth"
        >
          {INDIAN_CARD_GAMES.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate("/live-casino")}
              className="group relative flex-shrink-0 w-[140px] sm:w-[170px] h-[105px] sm:h-[125px] rounded-xl overflow-hidden shadow-md cursor-pointer select-none kb-card-hover border border-gray-300 dark:border-gray-800 bg-black"
            >
              {/* Background Dealer Image */}
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Top Left: 24x7 Certified Expert Badge */}
              <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] text-green-400 font-bold border border-green-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 kb-live-pulse" />
                <span>24x7 Certified</span>
              </div>

              {/* Bottom Title & Dealer */}
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white">
                <div>
                  <span className="text-xs font-black block truncate leading-tight drop-shadow">
                    {card.title}
                  </span>
                  <span className="text-[9px] text-gray-300 block truncate">
                    {card.dealer}
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] shadow group-hover:scale-110 transition-transform">
                  <FaPlay className="ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndianCardGamesSection;
