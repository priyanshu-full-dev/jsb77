import React from "react";
import "../../styles/kuber.css";

const PageSkeleton = () => {
  return (
    <div className="w-full min-h-screen bg-[#0f1015] text-white p-3 space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between h-12 px-2 bg-[#20151a] rounded-lg kb-skeleton" />

      {/* Chips Skeleton */}
      <div className="flex gap-2 overflow-hidden py-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-9 w-24 rounded-full kb-skeleton flex-shrink-0" />
        ))}
      </div>

      {/* Hero Category 2x2 Grid Skeleton */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl kb-skeleton" />
        ))}
      </div>

      {/* Game Carousel 1 Skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 rounded kb-skeleton" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 w-32 rounded-2xl kb-skeleton flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* In-play widget Skeleton */}
      <div className="h-32 rounded-xl kb-skeleton" />
    </div>
  );
};

export default PageSkeleton;
