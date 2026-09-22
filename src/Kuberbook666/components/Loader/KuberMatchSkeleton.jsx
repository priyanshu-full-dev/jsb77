import React from "react";
import "../../styles/kuber.css";

export default function KuberMatchSkeleton({ rows = 3, headerTitle = "Upcoming Events" }) {
  return (
    <div className="py-1 px-[6px] w-full animate-fadeIn">
      <div className="w-full font-helvetica-neue">
        {/* Header Bar */}
        <div
          className="w-full flex items-center justify-between rounded-t-[3px] py-1.5 px-[7px] bg-UpcomingBg"
          style={{
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
          }}
        >
          <div className="flex items-center text-text_Quaternary-new font-semibold text-[15px] md:text-[18px] tracking-wide justify-start w-full gap-[6px]">
            <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            <span>{headerTitle}</span>
          </div>
        </div>

        {/* Shimmer Body */}
        <div className="bg-bg_Quaternary-new rounded-b border border-ternary4 border-t-0 border-b-0 shadow-lg p-2 space-y-2">
          {/* Sub Header (Sport + 1 X 2 Columns) */}
          <div className="grid grid-cols-12 gap-1 items-center pb-1 border-b border-white/5">
            <div className="col-span-6 lg:col-span-5 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full kb-skeleton" />
              <div className="h-4 w-20 rounded kb-skeleton" />
            </div>
            <div className="col-span-6 lg:col-span-7 grid grid-cols-3 gap-1">
              <div className="h-3 rounded kb-skeleton opacity-60" />
              <div className="h-3 rounded kb-skeleton opacity-60" />
              <div className="h-3 rounded kb-skeleton opacity-60" />
            </div>
          </div>

          {/* Skeleton Match Rows */}
          {Array.from({ length: rows }).map((_, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-1 items-center py-2 border-b border-white/5 last:border-b-0"
            >
              {/* Timing & Team Names */}
              <div className="col-span-6 lg:col-span-5 flex items-center gap-2">
                <div className="w-12 h-6 rounded kb-skeleton shrink-0 opacity-75" />
                <div className="flex flex-col gap-1 w-full">
                  <div className="h-3.5 w-3/4 rounded kb-skeleton" />
                  <div className="h-3.5 w-1/2 rounded kb-skeleton" />
                </div>
              </div>

              {/* Back & Lay Odds Boxes */}
              <div className="col-span-6 lg:col-span-7 grid grid-cols-6 gap-1">
                {/* Back 1, X, 2 */}
                <div className="h-10 rounded bg-[#72bbef]/30 kb-skeleton border border-[#72bbef]/40" />
                <div className="h-10 rounded bg-[#72bbef]/30 kb-skeleton border border-[#72bbef]/40" />
                <div className="h-10 rounded bg-[#72bbef]/30 kb-skeleton border border-[#72bbef]/40" />
                {/* Lay 1, X, 2 */}
                <div className="h-10 rounded bg-[#faa9ba]/30 kb-skeleton border border-[#faa9ba]/40" />
                <div className="h-10 rounded bg-[#faa9ba]/30 kb-skeleton border border-[#faa9ba]/40" />
                <div className="h-10 rounded bg-[#faa9ba]/30 kb-skeleton border border-[#faa9ba]/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
