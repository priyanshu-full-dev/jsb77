import React from "react";
import IndianCardGamesSection from "../../components/IndianCardGamesSection";
import { INDIAN_CARD_GAMES } from "../../data/kuberMockData";
import { FaPlay } from "react-icons/fa";

const LiveCasinoPage = () => {
  return (
    <div className="w-full px-2 py-3 space-y-4">
      <div className="bg-gradient-to-r from-emerald-900 to-[#064e3b] p-4 rounded-2xl text-white shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide">Live Casino Tables</h2>
          <p className="text-xs text-emerald-200">Real Human Dealers Streaming in Full HD 24/7</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-black/40 text-emerald-300 text-xs font-black border border-emerald-400/30 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 kb-live-pulse" />
          ONLINE
        </div>
      </div>

      <IndianCardGamesSection />
    </div>
  );
};

export default LiveCasinoPage;
