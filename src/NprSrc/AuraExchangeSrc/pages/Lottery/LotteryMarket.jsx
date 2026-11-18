import React from "react";
import { useNavigate } from "react-router-dom";

export default function LotteryMarket() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-[#ececec] px-4 py-8 relative">
      {/* Optional subtle back button at top-left */}
      <button
        onClick={() => navigate("/lottery")}
        className="absolute top-3 left-3 flex items-center gap-1.5 text-xs text-gray-600 hover:text-black bg-white/70 hover:bg-white px-2.5 py-1 rounded-md shadow-sm transition-all"
        title="Back to Lottery"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="font-medium">Back</span>
      </button>

      {/* Main centered status message */}
      <div className="text-center select-none">
        <h2 className="text-[#1f2937] text-base sm:text-lg font-medium tracking-normal">
          No Markets are Currently Active
        </h2>
      </div>
    </div>
  );
}
