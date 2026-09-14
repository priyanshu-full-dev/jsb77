import React, { useState } from "react";
import { MdSportsCricket, MdSportsSoccer, MdSportsTennis } from "react-icons/md";
import { useSelector } from "react-redux";
import InPlaySportsWidget from "../../components/InPlaySportsWidget";

const SportsPage = () => {
  const [activeSport, setActiveSport] = useState("cricket");

  const SPORTS_TABS = [
    { id: "cricket", label: "Cricket", icon: <MdSportsCricket className="text-base" /> },
    { id: "soccer", label: "Football", icon: <MdSportsSoccer className="text-base" /> },
    { id: "tennis", label: "Tennis", icon: <MdSportsTennis className="text-base" /> },
  ];

  return (
    <div className="w-full px-2 py-3 space-y-4">
      {/* Sports Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {SPORTS_TABS.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setActiveSport(sport.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
              activeSport === sport.id
                ? "bg-red-600 text-white border-red-500 shadow-md"
                : "bg-gray-100 dark:bg-[#1a1b26] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-750 hover:border-gray-400"
            }`}
          >
            {sport.icon}
            <span>{sport.label}</span>
          </button>
        ))}
      </div>

      {/* Live In-play Widget */}
      <InPlaySportsWidget />

      {/* Upcoming Matches Preview */}
      <div className="rounded-xl bg-white dark:bg-[#151620] p-4 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
        <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white mb-1">
          Upcoming {activeSport.toUpperCase()} Fixtures
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Match odds will be updated 15 minutes before the match start time.
        </p>
      </div>
    </div>
  );
};

export default SportsPage;
