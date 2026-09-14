import React, { useState } from "react";
import { ORIGINALS_GAMES, GAME_SHOW_GAMES } from "../../data/kuberMockData";
import { IoSearch } from "react-icons/io5";
import { FaPlay } from "react-icons/fa";

const CasinoPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const allGames = [...ORIGINALS_GAMES, ...GAME_SHOW_GAMES];

  const filteredGames = allGames.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-2 py-3 space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 bg-[#181924] rounded-xl px-3 py-2 border border-gray-800">
        <IoSearch className="text-gray-400 text-base" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search games, crash, slots, roulette..."
          className="bg-transparent text-sm w-full outline-hidden text-white placeholder-gray-500"
        />
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className={`group relative h-44 rounded-2xl overflow-hidden shadow-md cursor-pointer select-none kb-card-hover bg-gradient-to-b ${game.bgColor} border border-gray-800 p-3 flex flex-col justify-between`}
          >
            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] font-black uppercase text-yellow-300 bg-black/40 px-1.5 py-0.5 rounded">
                {game.badge || "HOT"}
              </span>
            </div>

            <div className="text-center z-10">
              <span className="text-base font-black text-white block drop-shadow-md">
                {game.name}
              </span>
              <span className="text-[10px] text-gray-300 font-semibold block">
                {game.subtitle || game.category}
              </span>
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                <FaPlay className="ml-0.5 text-xs" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CasinoPage;
