import React, { useState, useCallback, useEffect } from "react";
import { IoInformationCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import PlaceBet from "../../../NprSrc/AuraExchangeSrc/components/PlaceBet";
import { handleOpenPlaceBet } from "../../../redux/slices/placeBetSlice";

const FullMarketCards3031 = ({
  title,
  options,
  eventId,
  eventNames,
  isSuspended,
  min,
  max,
}) => {

  const dispatch = useDispatch();
  const placedBets = useSelector((state) => state.account.bets) || [];

  const [activeOption, setActiveOption] = useState(null);
  const [activeBet, setActiveBet] = useState(null);
  const [tooltipIndex, setTooltipIndex] = useState(null);

  const toggleTooltip = (index) => {
    setTooltipIndex(tooltipIndex === index ? null : index);
  };

  const runners = options.map((opt, index) => ({
    sid: opt.selectionId,
    selectionId: opt.selectionId,
    sectionId: opt.selectionId,
    name: opt.label,
    odds: opt.back.odds,
    value: opt.back.value,
    index,
  }));

  // ✅ Calculate Bet Values
  const calculateBetValues = useCallback(
    (opt) => {

      const filteredBets = placedBets.filter((pb) => {
        const cond1 = String(pb.roundId) === String(opt.mid);
        const cond2 = String(pb.marketId) === String(opt.marketId);
        const cond3 = String(pb.matchId) === String(opt.gameId); // 🔥 FIXED
      
        console.log({ cond1, cond2, cond3 });
      
        return cond1 && cond2 && cond3;
      });
      
      
      console.log("👉 filteredBets =", filteredBets);

      const fbOfThisRunner = filteredBets.filter(
        (fb) => fb.selectionId.toString() === opt.selectionId.toString()
      );

      const fbOfOtherRunners = filteredBets.filter(
        (fb) => fb.selectionId.toString() !== opt.selectionId.toString()
      );

      const total =
        fbOfThisRunner.reduce(
          (acc, fbr) =>
            acc +
            (fbr.type === "Back"
              ? Number(fbr.favourMargin)
              : -Number(fbr.againstMargin)),
          0
        ) +
        fbOfOtherRunners.reduce(
          (acc, fbor) =>
            acc +
            (fbor.type === "Back"
              ? -Number(fbor.againstMargin)
              : Number(fbor.favourMargin)),
          0
        );

      return Number(total).toFixed(0);
    },
    [placedBets, eventId]
  );

  // ✅ Handle Back/Lay Click
  const handleMarketCellClick = (opt, type) => {
    const newBet = {
      selectionId: opt.selectionId,
      type,
      favourMargin: opt.back.value,
      againstMargin: opt.lay.value,
    };

    setActiveOption({ ...opt, betType: type });
    setActiveBet(newBet);

    dispatch(
      handleOpenPlaceBet({
        sportName: "Casino",
        sportId: 1000,
        competitionId: opt.marketId,
        marketId: opt.marketId,
        market: opt.market,
        markettype: "Casino",
        selectionId: opt.selectionId,
        betBoxBgColor: type === "Back" ? "#72bbef" : "#f9c9d4",
        betType: type,
        eventId,
        runners,
      })
    );
  };

  useEffect(() => {
    if (isSuspended) {
      setActiveOption(null);
    }
  }, [isSuspended]);
  return (
    <div className="w-full border-x border-[#ccc] relative ">
      {/* Header */}
      <div
        className="text-white flex rounded-t-md justify-between items-center px-1 py-1 text-[12px] font-semibold "
        style={{
          background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
        }}
      >
        <span>{title}</span>
        <IoInformationCircle
          size={16}
          className="cursor-pointer"
          onClick={() => toggleTooltip(title)}
        />
        {tooltipIndex === title && (
          <div
            onClick={() => setTooltipIndex(null)}
            className="absolute right-0 px-4 bg-[#000] text-white text-[10px] py-[4.5px] rounded shadow-lg z-20"
          >
            <p>
              Min/Max: {min}-{max}
            </p>
          </div>
        )}
      </div>

      {/* Min/Max Header Row */}
      <div className="w-full h-[34px] flex border-b border-[#7e97a7]">
        <div className="w-[60%] flex justify-center items-center ">
          <div className="bg-[#bed5d8] px-3 py-1 rounded text-[10px] font-semibold">
            Min/Max {min}-{max}
          </div>
        </div>
        <div className="w-[40%] flex">
          <div className="w-1/2 bg-[#72bbef] flex justify-center items-center font-bold text-[12px]">
            Back
          </div>
          <div className="w-1/2 bg-[#f9c9d4] flex justify-center items-center font-bold text-[12px]">
            Lay
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="relative">
        {options.map((opt) => {
          const placedBetCalculation = calculateBetValues(opt);

          let newCalc;
          if (activeBet) {
            if (
              opt.selectionId === activeBet.selectionId &&
              activeBet.type === "Back"
            ) {
              newCalc = Number(activeBet.favourMargin).toFixed(0);
            } else if (
              opt.selectionId === activeBet.selectionId &&
              activeBet.type === "Lay"
            ) {
              newCalc = Number(activeBet.againstMargin).toFixed(0);
            } else if (
              opt.selectionId !== activeBet.selectionId &&
              activeBet.type === "Back"
            ) {
              newCalc = Number(activeBet.againstMargin).toFixed(0);
            } else if (
              opt.selectionId !== activeBet.selectionId &&
              activeBet.type === "Lay"
            ) {
              newCalc = Number(activeBet.favourMargin).toFixed(0);
            }
          }

          return (
            <div key={opt.selectionId}>
              <div className="flex h-[41px] border-b border-[#7e97a7]">
                {/* Player Label */}
                <div className="w-[60%] flex flex-col justify-center p-1 font-semibold text-[11px] ">
                  <p>{opt.label}</p>

                  <div className="flex flex-row items-center">
                    {Math.abs(Number(placedBetCalculation)) !== 0 && (
                      <p
                        className={`flex items-center text-[11px] font-semibold ml-1 ${
                          placedBetCalculation > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <span className="pr-1 text-[black]">
                          {placedBetCalculation > 0 ? "P" : "L"}
                        </span>
                        {Math.abs(Number(placedBetCalculation))}
                      </p>
                    )}

                    {activeBet && newCalc ? (
                      <p
                        className={`flex items-center text-[11px] font-semibold ml-1 ${
                          Number(newCalc || 0) + Number(placedBetCalculation) >
                          0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <span className="pr-1 text-[black]">
                          {newCalc > 0 ? "P" : "L"}
                        </span>
                        {Math.abs(
                          Number(newCalc) + Number(placedBetCalculation)
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div
                  className={`w-[40%] flex ${
                    opt.gstatus === "0"
                      ? "suspended opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  {/* Back */}
                  <div
                    className="w-1/2 flex flex-col justify-center items-center cursor-pointer"
                    style={{
                      backgroundColor:
                        activeOption?.selectionId === opt.selectionId &&
                        activeOption?.betType === "Back"
                          ? "#1a8ee1"
                          : "#72bbef",
                      color:
                        activeOption?.selectionId === opt.selectionId &&
                        activeOption?.betType === "Back"
                          ? "#ffffff"
                          : "black",
                      boxShadow:
                        activeOption?.selectionId === opt.selectionId &&
                        activeOption?.betType === "Back"
                          ? "inset 0 1px 3px #00000080"
                          : "none",
                    }}
                    onClick={() =>
                      opt.gstatus === "1" && handleMarketCellClick(opt, "Back")
                    } // prevent click if suspended
                  >
                    <p className="font-bold text-[12px]">{opt.back.odds}</p>
                    <span className="text-[10px]">{opt.back.value}</span>
                  </div>

                  {/* Lay */}
                  <div
                    className="w-1/2 flex flex-col justify-center items-center cursor-pointer"
                    style={{
                      backgroundColor:
                        activeOption?.selectionId === opt.selectionId &&
                        activeOption?.betType === "Lay"
                          ? "#f4496d"
                          : "#f9c9d4",
                      color:
                        activeOption?.selectionId === opt.selectionId &&
                        activeOption?.betType === "Lay"
                          ? "#ffffff"
                          : "black",
                      boxShadow:
                        activeOption?.selectionId === opt.selectionId &&
                        activeOption?.betType === "Lay"
                          ? "inset 0 1px 3px #00000080"
                          : "none",
                    }}
                    onClick={() =>
                      opt.gstatus === "1" && handleMarketCellClick(opt, "Lay")
                    } // prevent click if suspended
                  >
                    <p className="font-bold text-[12px]">{opt.lay.odds}</p>
                    <span className="text-[10px]">{opt.lay.value}</span>
                  </div>
                </div>
              </div>

              {/* PlaceBet Box */}
              {activeOption?.selectionId === opt.selectionId && (
                <div className="col-span-2 flex justify-center items-start">
                  <PlaceBet
                    sportName="Casino"
                    sportId={1000}
                    competitionId={opt.marketId}
                    marketId={opt.marketId}
                    market={opt.market}
                    markettype="Casino"
                    selectionId={opt.selectionId}
                    selection={opt.label}
                    selectedOdds={
                      activeOption.betType === "Back"
                        ? opt.back.odds
                        : opt.lay.odds
                    }
                    betBoxBgColor={
                      activeOption.betType === "Back" ? "#72bbef" : "#f9c9d4"
                    }
                    betType={activeOption.betType}
                    setActiveBet={setActiveBet}
                    setActiveOption={setActiveOption}
                    eventNames={eventNames}
                    eventId={eventId}
                    runners={runners}
                    mid={opt.mid}
                    min={min}
                    max={max}
                    disableOdds={true}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Suspended Overlay */}
        {/* {isSuspended && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 border border-red-500">
                        <span className="text-red-600/70 font-bold text-xl">SUSPENDED</span>
                    </div>
                )} */}
      </div>
    </div>
  );
};

export default FullMarketCards3031;
