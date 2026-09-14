import React from "react";
import { FaPlay, FaTv } from "react-icons/fa";
import { IoTennisball } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { INPLAY_TENNIS_MATCHES } from "../data/kuberMockData";
import { useSelector } from "react-redux";

const InPlaySportsWidget = () => {
  const navigate = useNavigate();

  // Also check Redux store for live matches if available
  const openBetsCount = useSelector((state) => state?.openBets?.count || 0);

  return (
    <div className="w-full px-2 pt-4">
      <div className="max-w-7xl mx-auto rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151620]">
        {/* Green Top Header */}
        <div className="bg-[#28a745] px-3 py-2 flex items-center justify-between text-white select-none">
          {/* Left: Play Icon & In Play Title */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white text-[#28a745] flex items-center justify-center text-[10px] shadow-sm">
              <FaPlay className="ml-0.5" />
            </div>
            <span className="font-extrabold text-sm tracking-wide">In Play</span>
          </div>

          {/* Right: Open Bets */}
          <div
            onClick={() => navigate("/sports")}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="text-xs font-bold">Open Bets</span>
            <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
              {openBetsCount}
            </span>
          </div>
        </div>

        {/* Sub Header: Sport & Odds Column Labels */}
        <div className="bg-gray-100 dark:bg-[#1a1c28] px-3 py-1.5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-1.5">
            <IoTennisball className="text-emerald-500 text-sm" />
            <span>Tennis</span>
          </div>

          {/* Columns 1, X, 2 */}
          <div className="flex items-center gap-2 pr-1 text-center font-extrabold text-[11px] text-gray-600 dark:text-gray-400">
            <span className="w-12 text-center">1</span>
            <span className="w-12 text-center">X</span>
            <span className="w-12 text-center">2</span>
          </div>
        </div>

        {/* Match List Rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {INPLAY_TENNIS_MATCHES.map((match) => (
            <div
              key={match.id}
              className="px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-gray-50/60 dark:hover:bg-[#1f2233] transition-colors"
            >
              {/* Match Details */}
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {/* LIVE indicator */}
                <div className="flex items-center gap-1 bg-green-50 dark:bg-green-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-black border border-emerald-500/20 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 kb-live-pulse" />
                  <span>{match.status}</span>
                </div>

                {/* Teams Name */}
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    onClick={() => navigate("/sports")}
                    className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                  >
                    {match.matchName}
                  </span>
                  {match.hasVideo && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs flex-shrink-0" title="Live Video Available">
                      <FaTv />
                    </span>
                  )}
                </div>
              </div>

              {/* Odds Buttons (1, X, 2) */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* 1 - Blue Back Box */}
                <button
                  onClick={() => navigate("/sports")}
                  className="w-12 h-9 rounded bg-[#72bbef] hover:bg-[#5aaae6] text-black font-black flex flex-col items-center justify-center transition active:scale-95 shadow-xs"
                >
                  <span className="text-[11px] leading-none">{match.odds.team1.back}</span>
                  <span className="text-[9px] text-gray-800 font-semibold leading-none mt-0.5">
                    {match.odds.team1.size}
                  </span>
                </button>

                {/* X - Gray Box */}
                <div className="w-12 h-9 rounded bg-gray-200 dark:bg-[#252838] text-gray-400 font-bold flex items-center justify-center text-xs select-none">
                  {match.odds.draw.back}
                </div>

                {/* 2 - Blue Back Box */}
                <button
                  onClick={() => navigate("/sports")}
                  className="w-12 h-9 rounded bg-[#72bbef] hover:bg-[#5aaae6] text-black font-black flex flex-col items-center justify-center transition active:scale-95 shadow-xs"
                >
                  <span className="text-[11px] leading-none">{match.odds.team2.back}</span>
                  <span className="text-[9px] text-gray-800 font-semibold leading-none mt-0.5">
                    {match.odds.team2.size}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InPlaySportsWidget;
