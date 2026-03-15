import React, { useState, useCallback, useEffect } from "react";
import { IoInformationCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import PlaceBet from "../../../AuraExchangeSrc/components/PlaceBet";
import { handleOpenPlaceBet } from "../../../AsianExchangeSrc/redux/slices/placeBetSlice";

const FullMarketCards3 = ({
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

  const runners = options.map((opt, index) => ({
    sid: opt.selectionId,
    selectionId: opt.selectionId,
    sectionId: opt.selectionId,
    name: opt.label,
    odds: opt.odds || 0,
    value: opt.value || 0,
    index,
  }));

  const [activeIndex, setActiveIndex] = useState(null);
  const [activeBet, setActiveBet] = useState(null);
  const [tooltipIndex, setTooltipIndex] = useState(null);
  const [activeOption, setActiveOption] = useState(null);

  const toggleTooltip = (index) => {
    setTooltipIndex(tooltipIndex === index ? null : index);
  };

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

      const negativeMarkets = ["FLUSH", "STRAIGHT", "TRIO", "STRAIGHT FLUSH"];
      const isNegativeMarket = negativeMarkets.includes(opt.market);

      const total =
        fbOfThisRunner.reduce((acc, fbr) => {
          if (isNegativeMarket) {
            return (
              acc +
              (fbr.type === "Back"
                ? Number(fbr.againstMargin)
                : -Number(fbr.favourMargin))
            );
          } else {
            return (
              acc +
              (fbr.type === "Back"
                ? Number(fbr.favourMargin)
                : -Number(fbr.againstMargin))
            );
          }
        }, 0) +
        fbOfOtherRunners.reduce((acc, fbor) => {
          if (isNegativeMarket) {
            return (
              acc +
              (fbor.type === "Back"
                ? -Number(fbor.favourMargin)
                : Number(fbor.againstMargin))
            );
          } else {
            return (
              acc +
              (fbor.type === "Back"
                ? -Number(fbor.againstMargin)
                : Number(fbor.favourMargin))
            );
          }
        }, 0);

      return isNegativeMarket
        ? -Number(total).toFixed(0)
        : Number(total).toFixed(0);
    },
    [placedBets, eventId]
  );

  const handleMarketCellClick = (opt, index) => {

    const uniqueKey = `${opt.marketId}-${opt.label}`;
    setActiveIndex(uniqueKey);
    setActiveBet(index);
    setActiveOption({ ...opt, betType: "Back", uniqueKey });

    dispatch(
      handleOpenPlaceBet({
        sportName: "Casino",
        sportId: 1000,
        competitionId: opt.marketId,
        marketId: opt.marketId,
        market: opt.market,
        markettype: "Casino",
        selectionId: opt.selectionId,
        betBoxBgColor: "red",
        betType: "Back",
        eventId,
        runners: runners,
      })
    );
  };

  useEffect(() => {
    if (isSuspended) {
      dispatch(
        handleOpenPlaceBet({
          sportName: "",
          sportId: "",
          competitionId: "",
          marketId: "",
          market: "",
          markettype: "",
          selectionId: "",
          betBoxBgColor: "",
          betType: "",
          eventId: "",
          runners: [],
        })
      );
    }
  }, [isSuspended, dispatch]);

  return (
    <div
      className="w-full relative rounded-md overflow-hidden shadow-md"
      style={{
        background:
          "linear-gradient(90deg, rgb(153 199 241) 0%, rgb(138 189 216 / 50%) 49%, rgb(146 198 246) 100%)",
      }}
    >
      {/* Header */}
      {title && (
        <div
          className="text-white flex rounded-t-md justify-between items-center px-1 py-0.5 text-[12px] font-semibold"
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
      )}

      {/* Winner style layout */}
      <div className="flex flex-col items-center justify-center py-2 px-[10px] relative">
        {/* Top row: Dragon & Tiger */}
        <div className="flex justify-center gap-20 mb-3 w-full max-w-md">
          {options
            .filter(
              (opt) =>
                opt.label.toLowerCase() === "dragon" ||
                opt.label.toLowerCase() === "tiger"
            )
            .map((opt, index) => {
              const uniqueKey = `${opt.marketId}-${opt.label}`;
              const isActive = activeIndex === uniqueKey;
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
                <div key={uniqueKey} className="flex flex-col items-center">
                  <div
                    className="cursor-pointer"
                    onClick={() => handleMarketCellClick(opt, index)}
                  >
                    <p className="text-[13px] font-semibold mb-1 w-100 text-center justify-center text-black uppercase tracking-wide">
                      {opt.label}
                    </p>
                    <div
                      className={`h-[38px] py-2 flex flex-col items-center justify-center transition-all ${
                        isActive ? "bg-[#1a8ee1]" : "bg-[#72bbef]"
                      }`}
                      style={{
                        backgroundColor: isActive ? "#1a8ee1" : "#72bbef",
                        width: "110px",
                        borderRadius: "5px",
                        padding: "3px 0",
                        boxShadow: "0 2px 7px 1px #67828be6",
                      }}
                    >
                      <p
                        className={`text-[11px] font-semibold ${
                          isActive ? "text-white" : "text-black"
                        }`}
                      >
                        {opt.odds}
                      </p>
                      <p
                        className={`text-[11px] font-semibold ${
                          isActive ? "text-white" : "text-black"
                        }`}
                      >
                        {opt.value}
                      </p>
                    </div>
                  </div>

                  <div className="flex mt-0.5 flex-row items-center">
                    
                    {Math.abs(Number(placedBetCalculation)) !== 0 && (
                      <p
                        className={`flex items-center text-[11px] font-semibold ${
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
                        className={`flex items-center text-[11px] font-semibold ml-2 ${
                          Number(newCalc || 0) + Number(placedBetCalculation) >
                          0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {Math.abs(
                          Number(newCalc) + Number(placedBetCalculation)
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
        </div>

        {/* ✅ PlaceBet for Dragon/Tiger appears here (between Dragon/Tiger and Tie) */}
        {activeOption &&
          (activeOption.label.toLowerCase() === "dragon" ||
            activeOption.label.toLowerCase() === "tiger") && (
            <div className="mb-4 w-full">
              <PlaceBet
                sportName="Casino"
                sportId={1000}
                competitionId={activeOption.marketId}
                marketId={activeOption.marketId}
                market={activeOption.market}
                markettype="Casino"
                selectionId={activeOption.selectionId}
                selection={activeOption.label}
                betType="Back"
                selectedOdds={activeOption.odds}
                setActiveBet={setActiveBet}
                setActiveIndex={setActiveIndex}
                eventNames={eventNames}
                eventId={eventId}
                runners={runners}
                mid={activeOption.mid}
                min={min}
                max={max}
                disableOdds={true}
              />
            </div>
          )}

        {/* Bottom row: Tie */}
        <div className="flex flex-col items-center">
          {options
            .filter((opt) => opt.label.toLowerCase() === "tie")
            .map((opt, index) => {
              const uniqueKey = `${opt.marketId}-${opt.label}`;
              const isActive = activeIndex === uniqueKey;
              const placedBetCalculation = calculateBetValues(opt);

              return (
                <div key={uniqueKey} className="flex flex-col items-center">
                  <div
                    className="cursor-pointer"
                    onClick={() => handleMarketCellClick(opt, index)}
                  >
                    <p className="text-[13px] font-semibold mb-1 text-center text-black uppercase tracking-wide">
                      {opt.label}
                    </p>
                    <div
                      className={`h-[38px] py-2 flex flex-col items-center justify-center transition-all ${
                        isActive ? "bg-[#1a8ee1]" : "bg-[#72bbef]"
                      }`}
                      style={{
                        backgroundColor: isActive ? "#1a8ee1" : "#72bbef",
                        width: "110px",
                        borderRadius: "5px",
                        padding: "3px 0",
                        boxShadow: "0 2px 7px 1px #67828be6",
                      }}
                    >
                      <p
                        className={`text-[10px] font-extrabold ${
                          isActive ? "text-white" : "text-black"
                        }`}
                      >
                        {opt.odds}
                      </p>
                      <p
                        className={`text-[12px] font-semibold ${
                          isActive ? "text-white" : "text-black"
                        }`}
                      >
                        {opt.value}
                      </p>
                    </div>
                  </div>

                  {Math.abs(Number(placedBetCalculation)) !== 0 && (
                    <p
                      className={`text-[11px] font-semibold mt-1 ${
                        placedBetCalculation > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {placedBetCalculation > 0 ? "P" : "L"}{" "}
                      {Math.abs(Number(placedBetCalculation))}
                    </p>
                  )}

                  {/* ✅ PlaceBet for Tie appears here (below Tie button) */}
                  {activeOption?.uniqueKey === uniqueKey && (
                    <div className="mt-2">
                      <PlaceBet
                        sportName="Casino"
                        sportId={1000}
                        competitionId={opt.marketId}
                        marketId={opt.marketId}
                        market={opt.market}
                        markettype="Casino"
                        selectionId={opt.selectionId}
                        selection={opt.label}
                        betType="Back"
                        selectedOdds={opt.odds}
                        setActiveBet={setActiveBet}
                        setActiveIndex={setActiveIndex}
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

        {/* Suspended overlay */}
        {isSuspended && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 border border-red-500">
            <span className="text-red-600/80 font-bold text-2xl">
              SUSPENDED
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullMarketCards3;
