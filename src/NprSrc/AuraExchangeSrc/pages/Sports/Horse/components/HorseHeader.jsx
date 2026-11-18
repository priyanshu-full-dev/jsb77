import React, { useState } from "react";
import { IoMdTv } from "react-icons/io";
import "../../../../components/SportsMatchesList/aura-inplay.css";

// HorseHeader: Horse Racing aur Greyhound Racing dono pages par use hota hai
// title prop se "Horse Racing" ya "Greyhound Racing" dynamically display hota hai
const HorseHeader = ({
  sportId = "7",
  eventId,
  isInPlay = false,
  title = "Horse Racing",
}) => {
  const [liveTv, setLiveTv] = useState(false);

  return (
    <div className="w-full flex flex-col select-non mt-1">
      {/* Header bar: title + TV icon */}
      <div
        className="relative flex items-center justify-between text-white px-3 py-2"
        style={{
          background: "linear-gradient(to top, #2E4B5E 0%, #243A48 82%)",
        }}
      >
        <div className="flex-1 text-center font-bold text-[15px] tracking-wide flex items-center justify-center gap-2">
          <span>{title}</span>
        </div>

        <div className="absolute right-3">
          <button
            type="button"
            onClick={() => setLiveTv((prev) => !prev)}
            className={`cursor-pointer flex items-center justify-center p-1 rounded transition-colors ${
              liveTv ? "text-[#FFA000]" : "text-white hover:text-gray-200"
            }`}
            title="Watch Live TV"
          >
            <IoMdTv size={22} />
          </button>
        </div>
      </div>

      {/* Live Stream iframe if toggled */}
      {liveTv && (
        <div className="w-full bg-black relative aspect-video overflow-hidden">
          <iframe
            key={`tv-${sportId}-${eventId}`}
            src={`https://mahabet.club/tv/${sportId}/${eventId}`}
            title="Live TV"
            allow="autoplay; picture-in-picture"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            <span className="tv-floating-watermark text-[11px] text-white/50 p-2 absolute bottom-1 right-2">
              {`www.${window?.location?.host || "exchange"}.com`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HorseHeader);
