import React, { useState, useCallback, useEffect } from "react";
import { IoInformationCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import PlaceBet from "../../../AuraExchangeSrc/components/PlaceBet";
import { handleOpenPlaceBet } from "../../../AsianExchangeSrc/redux/slices/placeBetSlice";

const FullMarketCards3039_4 = ({
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
    name: opt.label,
    odds: opt?.back?.odds,
    value: opt?.back?.value,
    index,
  }));

  // ✅ Calculate Bet Values
  const calculateBetValues = useCallback(
    (opt) => {
      const filteredBets = placedBets.filter(
        (pb) =>
        pb.roundId === opt.mid &&
        pb.marketId === opt.marketId &&
        pb.matchId?.toString() === opt?.game_id?.toString()
      );

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

  // ✅ Handle Back Click only
  const handleMarketCellClick = (opt) => {
    const newBet = {
      selectionId: opt.selectionId,
      type: "Back",
      favourMargin: opt?.back?.odds,
      againstMargin: "0",
    };

    setActiveOption({ ...opt, betType: "Back" });
    setActiveBet(newBet);

    dispatch(
      handleOpenPlaceBet({
        sportName: "Casino",
        sportId: 1000,
        competitionId: opt.mid,
        marketId: opt.marketId,
        market: opt.market,
        markettype: "Casino",
        selectionId: opt.selectionId,
        betBoxBgColor: "#72bbef",
        betType: "Back",
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
    <div className="w-full border-x border-[#ccc] relative">
      {/* Header */}
      <div
        className="text-white flex rounded-t-md justify-between items-center px-1 py-1 text-[12px] font-semibold"
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
          <div className="w-full bg-[#72bbef] flex justify-center items-center font-bold text-[12px]">
            Back
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
          const isActive =
            activeOption?.selectionId === opt?.selectionId &&
            activeOption?.betType === "Back";

          return (
            <div key={opt.selectionId}>
              <div className="flex h-[41px] border-b border-[#7e97a7]">
                {/* Player Label */}
                <div className="w-[60%] flex flex-row justify-start gap-[5px] items-center p-1 font-semibold text-[11px] ">
                  <p>{opt.label}</p>

                  {Math.abs(Number(placedBetCalculation)) !== 0 && (
                    <p
                      className={`text-[11px] font-semibold ${
                        placedBetCalculation > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {placedBetCalculation > 0 ? "P" : "L"}{" "}
                      {Math.abs(Number(placedBetCalculation))}
                    </p>
                  )}
                  {activeBet && newCalc != 0 && (
                    <p
                      className={`flex items-center text-[11px] font-semibold ml-1 ${
                        Number(newCalc || 0) + Number(placedBetCalculation) > 0
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span className="pr-1 text-[black]">
                        {newCalc > 0 ? "P" : "L"}
                      </span>
                      {Math.abs(Number(newCalc) + Number(placedBetCalculation))}
                    </p>
                  )}
                </div>

                {/* Back Only */}
                <div
                  className={`w-[40%] flex ${
                    opt.gstatus === "CLOSED"
                      ? "suspended opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  <div
                    className="w-full flex flex-col justify-center items-center cursor-pointer"
                    style={{
                      backgroundColor: isActive ? "#1a8ee1" : "#72bbef",
                      color: isActive ? "#ffffff" : "black",
                      boxShadow: isActive
                        ? "inset 0 1px 3px #00000080"
                        : "none",
                    }}
                    onClick={() =>
                      opt.gstatus === "ACTIVE" && handleMarketCellClick(opt)
                    }
                  >
                    <p className="font-bold text-[12px]">{opt?.back?.odds}</p>
                    <span className="text-[10px]">{opt?.back?.value}</span>
                  </div>
                </div>
              </div>

              {/* PlaceBet Box */}
              {isActive && (
                <div className="col-span-2 flex justify-center items-start">
                  <PlaceBet
                    sportName="Casino"
                    sportId={1000}
                    competitionId={opt.mid}
                    marketId={opt.marketId}
                    market={opt.market}
                    markettype="Casino"
                    selectionId={opt.selectionId}
                    selection={opt.label}
                    selectedOdds={opt?.back?.odds}
                    betBoxBgColor="#72bbef"
                    betType="Back"
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
      </div>
    </div>
  );
};

export default FullMarketCards3039_4;
