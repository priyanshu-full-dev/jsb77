import React from "react";
import "../../styles/kuber.css";

export default function KuberLoader({
  text = "Loading Live Odds...",
  subtext = "Syncing with Real-Time Exchange",
  size = "default", // 'small' | 'default' | 'large' | 'fullscreen'
}) {
  if (size === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0e14]/90 backdrop-blur-md">
        <div className="relative flex items-center justify-center">
          {/* Outer Crimson Glow Ring */}
          <div className="w-24 h-24 rounded-full border-2 border-[#c10931]/30 border-t-[#c10931] border-r-[#f5b300] kb-spin-slow kb-glow-loader" />
          
          {/* Inner Counter-Rotating Ring */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-dashed border-[#f5b300]/40 border-b-[#c10931] kb-spin-reverse" />
          
          {/* Center Brand Icon / Logo Indicator */}
          <div className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#6e081d] to-[#c10931] shadow-lg">
            <span className="text-white font-black text-xs tracking-tighter">666</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <span className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] kb-live-pulse" />
            {text}
          </span>
          {subtext && (
            <span className="text-[11px] text-gray-400 mt-1 font-medium tracking-wide">
              {subtext}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (size === "small") {
    return (
      <div className="flex items-center justify-center py-4 px-2 w-full gap-2 text-gray-300">
        <div className="w-5 h-5 rounded-full border-2 border-[#c10931]/30 border-t-[#c10931] border-r-[#f5b300] animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-gray-300">{text}</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-8 px-4">
      <div className="relative flex items-center justify-center">
        {/* Outer Crimson / Gold Rotating Ring */}
        <div className="w-14 h-14 rounded-full border-2 border-[#c10931]/20 border-t-[#c10931] border-r-[#f5b300] kb-spin-slow kb-glow-loader" />
        
        {/* Inner Counter-Rotating Ring */}
        <div className="absolute w-9 h-9 rounded-full border border-dashed border-[#f5b300]/40 border-b-[#c10931] kb-spin-reverse" />
        
        {/* Center Live Dot */}
        <div className="absolute w-3 h-3 rounded-full bg-[#c10931] kb-live-pulse" />
      </div>

      <div className="mt-3.5 flex flex-col items-center">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] kb-live-pulse" />
          <span className="text-xs font-bold tracking-wider text-white uppercase">
            {text}
          </span>
        </div>
        {subtext && (
          <span className="text-[10px] text-gray-400 mt-0.5 font-medium tracking-wide">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
