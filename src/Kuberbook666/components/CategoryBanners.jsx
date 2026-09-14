import React from "react";
import { useNavigate } from "react-router-dom";
import { HERO_CATEGORY_BANNERS } from "../data/kuberMockData";
import { FaPlay } from "react-icons/fa";

const CategoryBanners = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full px-2 pt-2.5">
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-2 sm:gap-3">
        {HERO_CATEGORY_BANNERS.map((banner) => (
          <div
            key={banner.id}
            onClick={() => navigate(banner.path)}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${banner.gradient} p-2.5 sm:p-3 text-white shadow-md cursor-pointer kb-card-hover select-none border border-white/10 flex items-center justify-between min-h-[58px] sm:min-h-[66px]`}
          >
            {/* Left Content */}
            <div className="z-10 flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-wide uppercase drop-shadow">
                  {banner.title}
                </span>
              </div>
              <span className="text-[10px] text-white/80 font-medium hidden sm:inline-block">
                {banner.subtitle}
              </span>
            </div>

            {/* Right Graphic / Decorative Badge */}
            <div className="z-10 flex items-center justify-center">
              {banner.iconType === "aviator" && (
                <div className="flex items-center gap-1 bg-black/40 text-yellow-300 px-1.5 py-0.5 rounded font-black text-[10px] tracking-wider border border-yellow-400/30">
                  ✈️ 100X
                </div>
              )}
              {banner.iconType === "mac88" && (
                <div className="flex items-center gap-1 bg-[#d4af37]/20 text-yellow-300 px-1.5 py-0.5 rounded font-black text-[10px] tracking-wider border border-yellow-500/40">
                  ♠ MAC88
                </div>
              )}
              {banner.iconType === "evolution" && (
                <div className="flex items-center gap-1 bg-black/40 text-pink-300 px-1.5 py-0.5 rounded font-black text-[10px] tracking-wider border border-pink-400/30">
                  🃏 Evolution
                </div>
              )}
              {banner.iconType === "colorgame" && (
                <div className="flex items-center gap-1 bg-yellow-400/90 text-red-950 px-1.5 py-0.5 rounded font-black text-[10px] tracking-wider shadow">
                  👑 3-Color
                </div>
              )}
              {!["aviator", "mac88", "evolution", "colorgame"].includes(banner.iconType) && (
                <div className="flex items-center gap-0.5 bg-black/40 text-yellow-300 px-1.5 py-0.5 rounded font-black text-[10px] tracking-wider border border-yellow-400/20">
                  {banner.badge}
                </div>
              )}
            </div>

            {/* Ambient background glow effect */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/10 blur-md pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBanners;
