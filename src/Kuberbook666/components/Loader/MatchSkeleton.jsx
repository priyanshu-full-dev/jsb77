import React from "react";

export default function MatchSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-[#0d1f30]/80 border border-[#1b334d] rounded-xl p-3.5 flex items-center justify-between animate-pulse"
        >
          {/* Left Event Info */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3.5 w-48 bg-[#1f3c5b] rounded-md"></div>
            <div className="h-2.5 w-28 bg-[#152a40] rounded-md"></div>
          </div>
          {/* Right Odds Blocks */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-14 bg-[#1a446c]/60 rounded-lg"></div>
            <div className="h-9 w-14 bg-[#5c2331]/60 rounded-lg"></div>
            <div className="h-9 w-14 bg-[#1a446c]/60 rounded-lg"></div>
            <div className="h-9 w-14 bg-[#5c2331]/60 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
