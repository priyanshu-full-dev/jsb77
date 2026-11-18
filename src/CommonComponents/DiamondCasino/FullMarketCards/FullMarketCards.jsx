import React, { useState, useCallback, useEffect } from "react";
import { IoInformationCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import PlaceBet from "../../../NprSrc/AuraExchangeSrc/components/PlaceBet";
import { handleOpenPlaceBet } from "../../../redux/slices/placeBetSlice";

const FullMarketCards = ({
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
          pb.matchId?.toString() === (opt?.event_id || opt?.game_id)?.toString()
      );

      const fbOfThisRunner = filteredBets.filter(
        (fb) => fb.selectionId.toString() === opt.selectionId.toString()
      );

      const fbOfOtherRunners = filteredBets.filter(
        (fb) => fb.selectionId.toString() !== opt.selectionId.toString()
      );

      const pairPlusMarkets = ["FLUSH", "STRAIGHT", "TRIO", "STRAIGHT FLUSH"];
      const isPairPlus = pairPlusMarkets.includes(opt.market);

      const total =
        fbOfThisRunner.reduce((acc, fbr) => {
          if (isPairPlus) {
            return acc + (fbr.type === "Back" ? Number(fbr.againstMargin) : -Number(fbr.favourMargin));
          } else {
            return acc + (fbr.type === "Back" ? Number(fbr.favourMargin) : -Number(fbr.againstMargin));
          }
        }, 0) +
        fbOfOtherRunners.reduce((acc, fbor) => {
          if (isPairPlus) {
            return acc + (fbor.type === "Back" ? -Number(fbor.favourMargin) : Number(fbor.againstMargin));
          } else {
            return acc + (fbor.type === "Back" ? -Number(fbor.againstMargin) : Number(fbor.favourMargin));
          }
        }, 0);

      return isPairPlus ? -Number(total).toFixed(0) : Number(total).toFixed(0);
    },
    [placedBets, eventId]
  );



  // Handle click on a card
  const handleMarketCellClick = (opt, index) => {
    const uniqueKey = `${opt.marketId}-${opt.label}`;
    setActiveIndex(uniqueKey);
    setSelfSelectedOdds(opt.odds || 0);

    setActiveBet({
      selectionId: opt.selectionId,
      type: "Back",
      favourMargin: opt.favourMargin || 0,
      againstMargin: opt.againstMargin || 0,
      index,
    });

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
    <div
      className="w-full  relative "
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


      <div className="relative">
        {/* Options Grid */}
        <div className="grid grid-cols-2 p-1 gap-1">
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
                {/* Card */}
                <div
                  className="flex flex-col items-center mb-1 cursor-pointer"
                  onClick={() => handleMarketCellClick(opt, index)}
                >
                  <div className="text-[12px] font-bold">{opt.label}</div>
                  <div
                    className="flex items-center justify-center text-center mt-1"
                    style={{
                      backgroundColor: isActive ? "#1a8ee1" : "#72bbef",
                      width: "110px",
                      borderRadius: "5px",
                      padding: "3px 0",
                      boxShadow: "0 2px 7px 1px #67828be6",
                    }}
                  >
                    {opt.image && (
                      <img
                        src={opt.image}
                        alt=""
                        className="w-[20px] -ml-[22px] mr-2"
                      />
                    )}
                    {opt.icons && (
                      <div className="flex flex-col items-center gap-1 -ml-[22px] mr-2">
                        {opt.icons.map((icon, i) => (
                          <span
                            key={i}
                            className={`text-[${opt.color || "black"
                              }] text-[10px] font-bold`}
                          >
                            {icon}
                          </span>
                        ))}
                      </div>
                    )}
                    <div>
                      {opt.odds && (
                        <p
                          className={`text-[12px] font-semibold ${isActive ? "text-white" : "text-black"
                            }`}
                        >
                          {opt.odds}
                        </p>
                      )}
                      <p
                        className={`text-[12px] ${isActive ? "text-white" : "text-black"
                          }`}
                      >
                        {opt.value}
                      </p>
                    </div>
                  </div>

                  {/* Placed Bets Display */}
                  <div className="flex mt-0.5 flex-row items-center">


                    {Math.abs(Number(placedBetCalculation)) !== 0 && (
                      <p
                        className={`flex items-center text-[11px] font-semibold ${placedBetCalculation > 0
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
                        className={`flex items-center text-[11px] font-semibold ml-2 ${Number(newCalc || 0) + Number(placedBetCalculation) >
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
                {((index + 1) % 2 === 0 || index === options.length - 1) && (
                  <div className="col-span-2 flex justify-center items-start">
                    {activeOption &&
                      (activeOption.selectionId === opt.selectionId ||
                        activeOption.selectionId ===
                        options[index - 1]?.selectionId) && (
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
                      )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Suspended overlay */}
        {isSuspended && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 border border-red-500">
            <span className="text-red-600/70 font-bold text-xl">SUSPENDED</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullMarketCards;
