import React, { useState, useCallback, useEffect } from "react";
import { IoInformationCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import PlaceBet from "../../../NprSrc/AuraExchangeSrc/components/PlaceBet";
import { handleOpenPlaceBet } from "../../../redux/slices/placeBetSlice";

const FullMarketCards3059 = ({
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

  const [activeIndex, setActiveIndex] = useState(null);
  const [activeBet, setActiveBet] = useState(null);
  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);
  const [tooltipIndex, setTooltipIndex] = useState(null);

  const toggleTooltip = (index) => {
    if (tooltipIndex === index) {
      setTooltipIndex(null);
    } else {
      setTooltipIndex(index);
    }
  };

  const runners = options.map((opt, index) => ({
    sid: opt.selectionId,
    selectionId: opt.selectionId,
    sectionId: opt.selectionId,
    name: opt.label,
    odds: opt.odds || 0,
    value: opt.value || 0,
    index,
  }));

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

  // Handle click on a cell
  const handleMarketCellClick = (opt, index) => {
    if (isSuspended) return;
    const newBet = {
      selectionId: opt.selectionId,
      type: "Back",
      favourMargin: opt?.back?.odds,
      againstMargin: "0",
    };

    const uniqueKey = `${opt.marketId}-${opt.label}`;
    setActiveIndex(uniqueKey);
    setSelfSelectedOdds(opt.odds || 0);

    setActiveBet(
      newBet
    );

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
        runners,
      })
    );
  };

  const activeOption = options.find(
    (opt) => activeIndex === `${opt.marketId}-${opt.label}`
  );

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
    <div className="w-full relative bg-white border border-gray-300 rounded-md overflow-hidden">
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

      <div className="relative">
        {/* Table Layout */}
        <div className="divide-y divide-gray-200">
          {options.map((opt, index) => {
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
              <React.Fragment key={uniqueKey}>
                {/* Table Row */}
                <div className="flex items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  {/* Left Side - Label / Image / Icons */}
                  <div className="flex-1 px-2 text-gray-600 text-[11px] font-medium flex items-center">
                    {/* If image exists → show only image */}
                    {opt.image ? (
                      <img
                        src={opt.image}
                        alt=""
                        className="w-[30px] h-[40px] mr-2"
                      />
                    ) : (
                      // Otherwise → label first, then icons
                      <>
                        <span className="mr-1  font-bold">{opt.label}</span>
                        {opt.icons && (
                          <div className="flex items-center gap-1">
                            {opt.icons.map((icon, i) => (
                              <span
                                key={i}
                                className={`text-[${
                                  opt.color || "black"
                                }] text-[16px]`}
                              >
                                {icon}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {/* 🟢 Placed Bets Display */}
                    {Math.abs(Number(placedBetCalculation)) !== 0 && (
                      <div className="text-center mt-1">
                        <div
                          className={`text-[10px] font-semibold ${
                            placedBetCalculation > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {placedBetCalculation > 0 ? "P " : "L "}
                          {Math.abs(Number(placedBetCalculation))}
                        </div>
                      </div>
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
                        {newCalc > 0 ? "P " : "L "}
                      </span>
                      {Math.abs(Number(newCalc) + Number(placedBetCalculation))}
                    </p>
                  )}
                  </div>

                  {/* Right Side - Betting Box */}
                  <div>
                    <div
                      className={`cursor-pointer px-6 py-1 text-center min-w-[120px] transition-all ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isSuspended
                          ? "bg-gray-300 text-gray-500 suspended opacity-50 pointer-events-none cursor-not-allowed"
                          : "bg-[#72bbef] hover:bg-blue-200 text-blue-800"
                      }`}
                      onClick={() => handleMarketCellClick(opt, index)}
                    >
                      <div className="text-[13px] font-bold text-black">
                        {opt.odds || "-"}
                      </div>
                      <div className="text-[11px] text-black">
                        {opt.value || "0"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Place Bet Component */}
                {activeOption &&
                  activeOption.selectionId === opt.selectionId && (
                    <div className="col-span-full">
                      <PlaceBet
                        sportName="Casino"
                        sportId={1000}
                        competitionId={activeOption.marketId}
                        marketId={activeOption.marketId}
                        market={activeOption.market}
                        markettype="Casino"
                        selectionId={activeOption.selectionId}
                        selection={activeOption.label}
                        selectedOdds={activeOption.odds}
                        betBoxBgColor="red"
                        betType="Back"
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
              </React.Fragment>
            );
          })}
        </div>

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

export default FullMarketCards3059;
