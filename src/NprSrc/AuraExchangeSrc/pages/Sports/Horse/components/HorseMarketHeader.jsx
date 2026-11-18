import React from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { isMobile } from "react-device-detect";

// Matched volume ko K aur M format me display karne ke liye helper (jaise 5K, 2.5M)
export function formatToKOrM(value) {
  if (value === 0 || value === "0") return 0;
  if (!value) return 0;
  const num = Number(value);
  if (isNaN(num)) return value;
  if (num === 0) return 0;
  if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1);
    return formatted.endsWith(".0") ? `${parseInt(formatted, 10)}M` : `${formatted}M`;
  } else if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1);
    return formatted.endsWith(".0") ? `${parseInt(formatted, 10)}K` : `${formatted}K`;
  }
  return num % 1 === 0 ? String(num) : num.toFixed(1);
}

const HorseMarketHeader = ({
  marketName,
  totalMatched = 0,
  minStake = 100,
  maxStake = 10000,
  onInfoClick,
}) => {
  return (
    <div className="w-full flex flex-col bg-white">
      {/* Row 1: Market Name Pill + Matched */}
      <div className="w-full flex flex-row items-center justify-between min-h-7 pr-2">
        <div className="flex flex-row items-center">
          <span className="whitespace-nowrap min-h-7 flex flex-row gap-2 items-center text-center pl-2.5 pr-3 py-1.5 rounded-tr-xl bg-aura-blue-gradient text-white text-[12px] font-bold select-none">
            {marketName}
            <IoInformationCircleOutline
              size={18}
              className="cursor-pointer hover:opacity-80"
              onClick={onInfoClick}
            />
          </span>
        </div>

        <div className="flex flex-row items-center pr-2 whitespace-nowrap text-black">
          <span className="text-[11px] font-normal text-gray-700 mr-1">
            Matched
          </span>
          <span className="text-[11px] font-bold">
            € {formatToKOrM(totalMatched)}
          </span>
        </div>
      </div>

      {/* Row 2: Min/Max Pill (Left with top border) + Back / Lay Column Headers (Right without top border) */}
      <div className="w-full flex flex-row items-stretch justify-between min-h-6 border-b border-[#7e97a7] bg-white">
        {/* Left: Min/Max */}
        <div className="flex items-center flex-1 py-1 px-3">
          <div className="w-full bg-[#bed5d8] text-[#315195] text-[12px] font-bold py-0.5 rounded-[4px] flex items-center justify-center my-[2px]">
            <span>Min/Max &nbsp;</span>
            <span className="font-bold text-black">
              {minStake}-{maxStake}
            </span>
          </div>
        </div>

        {/* Right: Back & Lay Headers (NO top border) */}
        <div
          className="flex flex-row items-stretch self-stretch border-t-0"
          style={{ width: isMobile ? "140px" : "240px" }}
        >
          <div className="flex-1 bg-[#72BBEF] text-black text-center font-bold text-[12px] py-1 border-r border-white border-t-0 flex items-center justify-center">
            Back
          </div>
          <div className="flex-1 bg-[#FAA9BA] text-black text-center font-bold text-[12px] py-1 border-t-0 flex items-center justify-center">
            Lay
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HorseMarketHeader);
