import React, { useState } from "react";
import { isMobile } from "react-device-detect";
import { FaArrowRight } from "react-icons/fa";
import { ImArrowRight } from "react-icons/im";
import PlaceBet from "../../../../components/PlaceBet";
import MarketCell from "../../../FullMarket/CTSfullMarket/MarketCell";

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

const HorseRunnerRow = ({
  runner,
  idx,
  gmid,
  exEventId,
  raceName,
  isSuspended,
  activeBet,
  setActiveBet,
  betData,
  selfSelectedOdds,
  placedBetCalculation = 0,
  newCalc = 0,
  allRunners = [],
  onOddsClick,
  sportName = "Horse Race",
  sportId = "7",
  showClothNumber = true,
  showRemovedBanner = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const isGreyhound =
    sportName === "Greyhound Race" ||
    sportName === "greyhound" ||
    sportId === "4339" ||
    sportId === "65";

  const isRemoved =
    showRemovedBanner &&
    !isGreyhound &&
    (runner?.status === "REMOVED" || runner?.gstatus === "REMOVED");

  const isRunnerSuspended =
    isSuspended ||
    runner?.status === "SUSPENDED" ||
    runner?.status === "CLOSED" ||
    runner?.gstatus === "SUSPENDED";

  // Silk priority: Base64 data (most reliable, no CORS/403) -> URL -> fallback
  const silkSrc = !imgError
    ? runner?.himgBase64 || runner?.himgUrl || runner?.himg
    : runner?.himgBase64 || null;

  const clothNumber = runner?.cno ?? idx + 1;
  const stallDraw = runner?.sdraw;

  // Agar runner name ke aage pehle se number ho (jaise "1. Runner Name") ya sport Greyhound ho,
  // toh duplicate cloth number box hide kar diya jaata hai (User requirement: numbering vala UI remove karna)
  const hasNumberPrefix = /^\d+\./.test(String(runner?.nat || "").trim());
  const shouldShowClothNumber =
    showClothNumber &&
    !isGreyhound &&
    !hasNumberPrefix &&
    Boolean(runner?.nat) &&
    runner?.cno != null;

  // Best back & lay from odds array
  const backOdds = runner?.odds?.[0] || {};
  const layOdds = runner?.odds?.[3] || {};

  const backPrice = backOdds?.odds || 0;
  const backSize = backOdds?.size || 0;
  const layPrice = layOdds?.odds || 0;
  const laySize = layOdds?.size || 0;

  const isCurrentBetOpen = activeBet?.selectionId === runner?.sid;

  return (
    <div className="w-full flex flex-col border-b border-[#c8ced3] bg-white transition-colors">
      {/* Top Main Row: Runner Identity (Left) + Back / Lay Cells (Right) */}
      <div
        className={`relative w-full flex flex-row items-center justify-between min-h-[44px] ${
          isRemoved ? "border-2 border-[#ca1010] bg-white my-0.5" : ""
        }`}
      >
        {/* If REMOVED, show prominent red centered overlay banner across the entire row */}
        {isRemoved && (
          <div className="absolute inset-0 z-20 bg-white/70 flex items-center justify-center pointer-events-none px-2 select-none">
            <span className="text-[#ca1010] font-black text-[13px] md:text-[14px] uppercase tracking-wider text-center">
              REMOVED {runner?.adfa ? `${runner.adfa} ` : ""}
              {runner?.rdt || ""}
            </span>
          </div>
        )}

        {/* Left Side: Number, Silk, Runner Name */}
        <div
          className={`flex flex-row items-center flex-1 min-w-0 pl-2.5 pr-1 py-1 gap-2 ${
            isRemoved ? "opacity-25" : ""
          }`}
        >
          {/* Cloth Number & Stall Draw stacked (only when needed) */}
          {shouldShowClothNumber && (
            <div className="flex flex-col items-center justify-center min-w-[20px] text-center select-none">
              <span className="text-[13px] font-bold text-black leading-tight">
                {clothNumber}
              </span>
              {stallDraw != null && stallDraw !== "" && (
                <span className="text-[10.5px] font-normal text-gray-700 leading-tight">
                  ({stallDraw})
                </span>
              )}
            </div>
          )}

          {/* Jersey / Silk Image (only show if real silk is available, completely removed colored number square) */}
          {silkSrc && (
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 select-none">
              <img
                src={silkSrc}
                alt={`Runner ${clothNumber}`}
                className="w-8 h-8 object-contain"
                onError={() => setImgError(true)}
              />
            </div>
          )}

          {/* Runner Name & Exposure profit/loss */}
          <div className="flex flex-col min-w-0 justify-center">
            <span className="font-bold text-[13px] md:text-[14px] text-black truncate leading-tight">
              {runner?.nat}
            </span>

            {/* Placed Bet & Potential Calculation Exposure */}
            {!isRemoved &&
              (placedBetCalculation !== 0 ||
                (activeBet &&
                  betData?.marketId === gmid &&
                  (betData.calculateValue || betData.addedValue))) && (
                <div className="flex flex-row items-center gap-1.5 mt-0.5">
                  {placedBetCalculation !== 0 && (
                    <span
                      className={`flex items-center text-[10px] font-bold ${
                        placedBetCalculation < 0
                          ? "text-[#D0021B]"
                          : "text-[#228B22]"
                      }`}
                    >
                      <FaArrowRight
                        className="mr-0.5 inline-block"
                        size={9.5}
                        style={{ stroke: "currentColor", strokeWidth: 24 }}
                      />
                      {placedBetCalculation < 0 ? "-" : ""}
                      {Math.abs(placedBetCalculation)}
                    </span>
                  )}
                  {activeBet &&
                    betData?.marketId === gmid &&
                    (betData.calculateValue || betData.addedValue) && (
                      <span
                        className={`flex items-center text-[10px] font-bold ${
                          newCalc > 0 ? "text-[#228B22]" : "text-[#D0021B]"
                        }`}
                      >
                        ({Math.abs(newCalc)})
                      </span>
                    )}
                </div>
              )}
          </div>
        </div>

        {/* Right Side: Back & Lay Cells */}
        <div
          className={`relative flex flex-row items-center h-[44px] ${
            !isRemoved && isRunnerSuspended ? "aura-suspended" : ""
          } ${isRemoved ? "opacity-25 pointer-events-none" : ""}`}
          data-label={!isRemoved && isRunnerSuspended ? "Suspended" : ""}
          style={{ width: isMobile ? "140px" : "240px" }}
        >
          <div className="flex-1 h-full border-r border-white">
            <MarketCell
              handleMarketCellClick={(bgColor, price, betType) => {
                if (isRunnerSuspended || isRemoved) return;
                onOddsClick?.(bgColor, price, betType, runner, idx);
              }}
              price={isRemoved ? 0 : backPrice}
              size={isRemoved ? 0 : backSize}
              bgColor="#72BBEF"
              betType="Back"
              isActive={false}
            />
          </div>

          <div className="flex-1 h-full">
            <MarketCell
              handleMarketCellClick={(bgColor, price, betType) => {
                if (isRunnerSuspended || isRemoved) return;
                onOddsClick?.(bgColor, price, betType, runner, idx);
              }}
              price={isRemoved ? 0 : layPrice}
              size={isRemoved ? 0 : laySize}
              bgColor="#FAA9BA"
              betType="Lay"
              isActive={false}
            />
          </div>
        </div>
      </div>

      {/* Bottom Sub-Row: Badges for Jockey, Trainer, Age, Weight - Never wrap (tutega nahi), hidden scrollbar */}
      {(runner?.jname || runner?.tname || runner?.hage || runner?.hweight) && (
        <div
          className="w-full flex flex-row items-center flex-nowrap overflow-x-auto whitespace-nowrap gap-1.5 px-2 pb-1.5 pt-0.5 scrollbar-hide [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {runner?.jname && (
            <span className="flex-shrink-0 bg-[#bed5d8] text-[#243A48] text-[9.5px] md:text-[10px] font-normal px-2 py-0.5 rounded-[3px] whitespace-nowrap select-none">
              Jockey :{" "}
              <span className="font-bold text-black">{runner.jname}</span>
            </span>
          )}

          {runner?.tname && (
            <span className="flex-shrink-0 bg-[#bed5d8] text-[#243A48] text-[9.5px] md:text-[10px] font-normal px-2 py-0.5 rounded-[3px] whitespace-nowrap select-none">
              Trainer :{" "}
              <span className="font-bold text-black">{runner.tname}</span>
            </span>
          )}

          {runner?.hage != null && runner?.hage !== "" && (
            <span className="flex-shrink-0 bg-[#bed5d8] text-[#243A48] text-[9.5px] md:text-[10px] font-normal px-2 py-0.5 rounded-[3px] whitespace-nowrap select-none">
              Age : <span className="font-bold text-black">{runner.hage}</span>
            </span>
          )}

          {runner?.hweight != null && runner?.hweight !== "" && (
            <span className="flex-shrink-0 bg-[#bed5d8] text-[#243A48] text-[9.5px] md:text-[10px] font-normal px-2 py-0.5 rounded-[3px] whitespace-nowrap select-none">
              Weight :{" "}
              <span className="font-bold text-black">{runner.hweight}</span>
            </span>
          )}
        </div>
      )}

      {/* Inline PlaceBet slip when this runner is active */}
      {isCurrentBetOpen && (
        <div className="w-full">
          <PlaceBet
            sportName={sportName}
            sportId={sportId}
            competitionId={gmid}
            eventId={exEventId || gmid}
            marketId={gmid}
            market={sportName}
            eventNames={raceName}
            markettype="Match Odds"
            selectionId={runner?.sid}
            selection={runner?.nat}
            selectedOdds={selfSelectedOdds || activeBet?.oddsReq}
            setActiveBet={setActiveBet}
            suspendNow={isSuspended ? "aura-suspended" : ""}
            runners={allRunners}
            gmid={gmid}
            joinedMarketId={gmid}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(HorseRunnerRow);
