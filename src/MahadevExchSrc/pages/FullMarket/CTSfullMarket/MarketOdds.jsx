// MarketOdds.jsx – All markets shown + Match Odds always at the top
import { useDispatch, useSelector } from "react-redux";
import { isMobile } from "react-device-detect";
import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImArrowRight } from "react-icons/im";
import { useSearchParams } from "react-router-dom";

import MarketCell from "./MarketCell";
import RulesModal from "./RulesModal";
import useGetMarketNameByMarketId from "../../../../CommonComponents/useGetMarketNameByMarketId";
import { handleOpenPlaceBet } from "../../../../redux/slices/placeBetSlice";
import { IoInformationCircleOutline } from "react-icons/io5";


import { sportsMapping } from "./MatchDetailsBanner"; // adjust path if needed

export function formatToKOrM(value) {
  if (isNaN(value)) return value;
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value?.toFixed?.(1) ?? value;
}

function MarketOdds({ activeMarketCategory }) {
  const [searchParams] = useSearchParams();

  const eventId = Number(searchParams.get("eventId")) || 0;
  const sportId = Number(searchParams.get("eventType")) || 0;
  const competitionId = Number(searchParams.get("competitionId")) || 0;
  const eventName = searchParams.get("eventName") || "";

  const marketoddsData = useSelector(
    (state) => state?.marketOdds?.data?.data?.data || [],
  );

  const markets = useSelector((state) => state?.marketOdds?.marketName || []);

  const category = (activeMarketCategory || "all").toLowerCase();

  // Inside useMemo
  const filteredAndSortedMarkets = useMemo(() => {
    let dataArray = markets || [];

    // 1. Apply category filter
    if (category !== "all") {
      if (category === "popular") {
        dataArray = dataArray.filter((m) =>
          (m?.marketName || "").toLowerCase().includes("match"),
        );
      } else {
        dataArray = dataArray.filter((m) =>
          (m?.marketName || "").toLowerCase().includes(category),
        );
      }
    }

    // 2. Create a shallow copy before sorting (this fixes the error)
    dataArray = [...dataArray];

    // 3. Now safe to sort
    dataArray.sort((a, b) => {
      const nameA = (a.marketName || "").toLowerCase();
      const nameB = (b.marketName || "").toLowerCase();

      if (nameA.includes("match odds")) return -1;
      if (nameB.includes("match odds")) return 1;

      if (nameA.includes("over/under 2.5")) return -1;
      if (nameB.includes("over/under 2.5")) return 1;

      if (nameA.includes("over/under 1.5")) return -1;
      if (nameB.includes("over/under 1.5")) return 1;

      return 0;
    });

    return dataArray;
  }, [category, markets]);

  if (filteredAndSortedMarkets.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm p-4">
        No markets available for category "{category}"
      </div>
    );
  }

  return (
    <div>
      {filteredAndSortedMarkets.map((metaMarket) => {
        // Try to find corresponding live data
        const liveMarket = marketoddsData.find(
          (lm) => lm.marketId === metaMarket.marketId,
        );

        // Use live data when available, otherwise fallback to metadata
        const displayMarket = liveMarket || metaMarket;

        return (
          <MarketContainer
            key={metaMarket.marketId}
            market={displayMarket}
            markets={markets}
            eventId={eventId}
            sportId={sportId}
            competitionId={competitionId}
            eventName={eventName}
            isLiveDataAvailable={!!liveMarket}
          />
        );
      })}
    </div>
  );
}

const MarketContainer = ({
  market,
  markets,
  eventId,
  sportId,
  competitionId,
  eventName,
  isLiveDataAvailable,
}) => {
  const {
    marketId,
    runners: marketRunners = [],
    status: marketStatus = "UNKNOWN",
  } = market;

  const { marketName } = useGetMarketNameByMarketId(marketId, markets);

  const [showMarket] = useState(true);
  const [activeBet, setActiveBet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const placedBets = useSelector((state) => state.account.bets || []);

  const placedBetsInThisMarket = placedBets.filter(
    (pb) =>
      pb?.marketId === marketId &&
      pb?.market === marketName &&
      pb?.event === eventName,
  );

  return (
    <motion.div
      key={marketId}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.1, ease: "easeInOut" }}
    >
      <AnimatePresence initial={false}>
        {showMarket && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="overflow-hidden rounded-[10px] w-[98%] mx-auto mt-[45px]"
          >
            {/* Market Header */}
            <div className="w-full flex justify-between items-center  text-white  text-[12px] font-semibold ">
              <div className="bg-[#2d2d2d]  absolute z-0 text-white px-2 h-[55px] rounded-t-[10px] flex gap-2 items-center font-semibold">
                <span className="flex items-center -mt-6 gap-2.5 text-[12px] uppercase">
                  {marketName || "Market"}
                </span>
                <IoInformationCircleOutline className="-mt-6 text-[20px]"/>

              </div>
            </div>

            {/* Market Header */}
            <div className="w-full bg-[white] border-b border-[00000033]  relative z-10 text-white">
      
              <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold">

                <div className="text-[#7c7c7c] text-[11px] w-[65%] ">
                  Min: 100 | Max: 100000
                </div>

                {/* Back Lay Labels */}
                <div
                  className={`flex text-[13px] ${isMobile ? "w-[42%]" : "w-[70%]"} justify-end`}
                >
                  <div className="w-[50%] text-center font-extrabold text-[black]">BACK</div>

                  <div className="w-[50%] text-center font-extrabold text-[black]">LAY</div>
                </div>
              </div>
            </div>

            {/* Runners or placeholder */}
            {marketRunners.length > 0 ? (
              marketRunners.map((runner, index) => {
                const marketRunnerData = markets.find(
                  (m) => m.marketId === marketId,
                );
                const runnerData = marketRunnerData?.runners?.find(
                  (r) => r.selectionId === runner.selectionId,
                );

                return (
                  <MarketRunnerContainer
                    key={runner.selectionId}
                    placedBetsInThisMarket={placedBetsInThisMarket}
                    marketName={marketName}
                    marketId={marketId}
                    runner={runner}
                    runnerData={runnerData}
                    marketRunners={marketRunnerData?.runners}
                    setActiveBet={setActiveBet}
                    activeBet={activeBet}
                    marketStatus={marketStatus}
                    sportId={sportId}
                    eventId={eventId}
                    competitionId={competitionId}
                    index={index}
                  />
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500 bg-gray-50 border-b border-gray-200">
                No active runners / odds available right now
                <br />
                <small>(common in early/low-liquidity matches)</small>
              </div>
            )}

            <RulesModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const MarketRunnerContainer = ({
  placedBetsInThisMarket,
  marketName,
  marketId,
  runner,
  runnerData,
  marketRunners,
  setActiveBet,
  activeBet,
  marketStatus,
  sportId,
  eventId,
  competitionId,
  index,
}) => {
  const dispatch = useDispatch();

  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);

  const handleMarketCellClick = (betBoxBgColor, price, betType) => {
    if (!price) return;
    setSelfSelectedOdds(price);

    dispatch(
      handleOpenPlaceBet({
        sportName: sportsMapping[sportId] || "Soccer",
        sportId,
        competitionId,
        marketId,
        market: marketName,
        markettype: "Match Odds",
        selectionId: runner.selectionId,
        betBoxBgColor,
        betType,
      }),
    );
  };

  const calculateBetValues = useCallback(
    (runner) => {
      const filteredBets = placedBetsInThisMarket || [];

      const fbThis = filteredBets.filter(
        (fb) =>
          String(fb.selectionId) === String(runner.selectionId) &&
          String(fb.eventId) === String(eventId) &&
          fb.marketId === marketId,
      );

      const fbOther = filteredBets.filter(
        (fb) =>
          String(fb.selectionId) !== String(runner.selectionId) &&
          String(fb.eventId) === String(eventId) &&
          fb.marketId === marketId,
      );

      let calc =
        fbThis.reduce(
          (acc, b) =>
            acc +
            (b.type === "Back"
              ? Number(b.favourMargin || 0)
              : -Number(b.againstMargin || 0)),
          0,
        ) +
        fbOther.reduce(
          (acc, b) =>
            acc +
            (b.type === "Back"
              ? -Number(b.againstMargin || 0)
              : Number(b.favourMargin || 0)),
          0,
        );

      return Number(calc).toFixed(0);
    },
    [placedBetsInThisMarket, eventId, marketId],
  );

  const placedBetValue = calculateBetValues(runner);

  return (
    <div className="relative z-10 w-full bg-[white]">
      <div
        className={`w-full flex items-stretch justify-between min-h-[44px] 
    ${index === marketRunners?.length - 1 ? "" : "border-b border-[#00000033]"}`}
      >
        {/* Runner Name + Placed Bet Info */}
        <div
          className={`flex flex-col justify-center ${isMobile ? "w-[65%]" : "w-[30%]"} pl-2`}
        >
          <p className="text-[14px] font-extrabold text-[#212529]">
            {runnerData?.runnerName || runner?.runnerName || "Unknown"}
          </p>

          {placedBetsInThisMarket?.length > 0 && (
            <p
              className={`text-[10px] font-semibold ${
                Number(placedBetValue) > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              <ImArrowRight className="inline mr-1" />
              {Math.abs(Number(placedBetValue))}
            </p>
          )}
        </div>

        {/* Back / Lay cells */}
        <div
          className={`p-1.5 pr-2 ${
            runner?.status?.toLowerCase() !== "active" ||
            (marketStatus?.toLowerCase() !== "active" &&
              marketStatus?.toLowerCase() !== "open")
              ? "aura-suspended"
              : ""
          } flex gap-1 flex-grow ${isMobile ? "w-[45%]" : "w-[70%]"}`}
          data-label={
            runner?.status?.toLowerCase() !== "active" ||
            marketStatus?.toLowerCase() !== "active"
              ? (runner?.status?.toLowerCase() !== "active"
                  ? runner?.status
                  : marketStatus?.toLowerCase() !== "active" &&
                      marketStatus?.toLowerCase() !== "open"
                    ? marketStatus
                    : "") || "Suspended"
              : ""
          }
        >
          <MarketCell
            handleMarketCellClick={handleMarketCellClick}
            price={runner?.ex?.availableToBack?.[0]?.price}
            size={runner?.ex?.availableToBack?.[0]?.size}
            bgColor="#8ec5fe"
            betType="Back"
          />

          <MarketCell
            handleMarketCellClick={handleMarketCellClick}
            price={runner?.ex?.availableToLay?.[0]?.price}
            size={runner?.ex?.availableToLay?.[0]?.size}
            bgColor="#ffa0d0"
            betType="Lay"
          />
        </div>
      </div>
    </div>
  );
};

export default MarketOdds;
