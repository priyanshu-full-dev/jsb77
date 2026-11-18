import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { isMobile } from "react-device-detect";

import MarketCell from "./MarketCell";
import CashOutAura from "../../../components/CashoutAura";
import { handleOpenPlaceBet, handleCancelPlaceBet } from "../../../../../redux/slices/placeBetSlice";
import { displayAuthModal } from "../../../../../redux/slices/authModalSlice";
import PlaceBet from "../../../components/PlaceBet";
import { sportsMapping } from "./MatchDetailsBanner";
import { useSearchParams } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { ImArrowRight } from "react-icons/im";
import RulesModal from "./RulesModal";
import { IoInformationCircleOutline } from "react-icons/io5";

export function formatToKOrM(value) {
  if (isNaN(value)) return value;
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + "K";
  } else {
    return value?.toFixed?.(1) ?? value;
  }
}

const SuspendedOverlay = ({ label = "SUSPENDED" }) => (
  <div className="absolute inset-0 z-20 flex items-center justify-center border-2 border-[#ca1010] bg-[#ffffffaf] pointer-events-none">
    <span className="text-[#ca1010] text-[30px] font-extrabold uppercase tracking-wider [text-shadow:_0_1px_1px_rgb(0_0_0_/_15%)]">
      {label}
    </span>
  </div>
);

function MarketOdds({ activeMarketCategory, odds }) {
  const marketoddsData = odds;

  const category = activeMarketCategory?.toLowerCase() || "all";

  const filteredMarketoddsData = useMemo(() => {
    const dataArray = Array.isArray(marketoddsData) ? marketoddsData : [];

    const removeToss = (market) =>
      !market?.marketName?.toLowerCase().includes("toss");

    if (category === "all") {
      return dataArray.filter(removeToss);
    }

    if (category === "popular") {
      const hasMatchOdds = dataArray.some(
        (market) => market?.marketName?.toLowerCase() === "match odds",
      );
      if (hasMatchOdds) {
        return dataArray.filter(
          (market) =>
            market?.marketName?.toLowerCase() === "match odds" &&
            removeToss(market),
        );
      }
      return dataArray.slice(0, 1).filter(removeToss);
    }

    return dataArray.filter(
      (market) =>
        market?.marketName?.toLowerCase() === category && removeToss(market),
    );
  }, [category, marketoddsData]);

  return (
    <div>
      {filteredMarketoddsData.map((market, i) => (
        <MarketContainer key={market?.marketId || i} market={market} />
      ))}
    </div>
  );
}

const MarketContainer = React.memo(function MarketContainer({ market }) {
  const {
    marketId,
    marketName,
    totalMatched,
    runnersData,
    min,
    max,
    oddsData,
  } = market;

  const effectiveMin =
    min ??
    market?.minBet ??
    market?.minL ??
    oddsData?.min ??
    oddsData?.minBet;
  const effectiveMax =
    max ??
    market?.maxBet ??
    market?.maxL ??
    oddsData?.max ??
    oddsData?.maxBet;

  const marketRunners = useMemo(
    () =>
      (oddsData?.runners || []).map((runner) => {
        const selectionId = String(runner.selectionId);

        return {
          selectionId: runner.selectionId,
          runnerName: runnersData[selectionId] || null,
          handicap: runner.handicap ?? 0,
          status: runner.status,
          price: runner.price,
        };
      }),
    [oddsData?.runners, runnersData],
  );

  // const marketRunners = oddsData?.runners || [];
  const marketStatus = oddsData?.status || "";
  const totalMatchedValue = oddsData?.totalMatched ?? totalMatched ?? 0;

  const isMarketSuspended =
    marketStatus.toLowerCase() !== "active" &&
    marketStatus.toLowerCase() !== "open" &&
    marketStatus.toLowerCase() !== "online";

  const [showMarket, setShowMarket] = useState(true);
  const [activeBet, setActiveBet] = useState(null);
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const sportId = Number(searchParams.get("eventType"));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeSelectionId, setActiveSelectionId] = useState(null);
  const [activeBetType, setActiveBetType] = useState(null);

  const handleSetActiveBet = useCallback((bet) => {
    setActiveBet(bet);
    if (!bet) {
      setActiveSelectionId(null);
      setActiveBetType(null);
    }
  }, []);

  const eventName = searchParams.get("eventName");
  const competitionId = Number(searchParams.get("competitionId"));

  const placedBets = useSelector((state) => state.account.bets);

  const placedBetsInThisMarket = useMemo(
    () =>
      placedBets.filter(
        (pb) =>
          pb?.marketId == marketId &&
          pb.market == marketName &&
          pb.event == eventName,
      ),
    [placedBets, marketId, marketName, eventName],
  );

  return (
    <div key={marketId} className="bg-[white]">
      {/* Row 1 */}
      <div className="w-full h-full flex flex-row items-center justify-between min-h-7 mt-1.5 border-b-[1px] border-[#7e97a7] border-t-[0.3px] pr-2">
        <div className="w-full flex gap-1 flex-row flex-grow items-center">
          <span className="whitespace-nowrap min-h-7 flex flex-row gap-2 items-center justify-between text-center  pl-2 pr-2 py-1.5 rounded-tr-xl bg-aura-blue-gradient text-white dark:text-white text-[12px] font-bold">
            {marketName}
            <IoInformationCircleOutline
              size={20}
              onClick={() => setIsModalOpen(true)}
            />
          </span>
          <span>
            <CashOutAura
              marketId={marketId}
              filteredBets={placedBetsInThisMarket}
              runningData={marketRunners}
              odds={marketRunners}
              eventId={eventId}
              legueId={competitionId}
              matchId={eventId}
              event={eventName}
              markettype="Match Odds"
              market={marketName}
              sportName={sportsMapping[sportId]}
              DisMarketName={marketName}
              setActiveBet={handleSetActiveBet}
              min={effectiveMin}
              max={effectiveMax}
            />
          </span>
        </div>
        <div
          className="flex flex-row items-center pr-2 whitespace-nowrap"
          style={{ color: "#000000", fontFamily: "Tahoma, Helvetica, sans-serif" }}
        >
          <span className="text-[11px] mr-1" style={{ color: "#000000" }}>Matched</span>
          <span className="text-[11px] font-bold" style={{ color: "#000000" }}>
            &#8364;{formatToKOrM(totalMatchedValue)}
          </span>
        </div>
        <div
          role="button"
          onClick={() => setShowMarket((prev) => !prev)}
          className="rounded-full bg-aura-blue-gradient text-white"
        >
          {/* {showMarket ? (
            <CiCircleMinus size={18} />
          ) : (
            <CiCirclePlus size={18} />
          )} */}
        </div>
      </div>

      {/* Dropdown Section with Framer Motion */}
      <>
        {showMarket && (
          <div className="overflow-hidden">
            {/* Row 2 + Row 3 — whole-market suspended banner spans the
                Min/Max header, Back/Lay header AND all runner rows */}
            <div className="relative">
              {isMarketSuspended && (
                <SuspendedOverlay label={marketStatus || "Suspended"} />
              )}
              <div
                className={
                  isMarketSuspended ? "opacity-40 pointer-events-none" : ""
                }
              >
                {/* Row 2 */}
                <div className="w-full h-full flex flex-row items-center justify-between min-h-7 ">
                  <div
                    className={`flex flex-grow w-[${isMobile ? "65%" : "30%"
                      }] min-h-7 py-1 pl-2 pr-1`}
                  >
                    <div className="w-full text-[12px] font-bold bg-[#bed5d8] rounded-[4px] flex justify-center">
                      <div>
                        <span className="text-[#315195] text-[10px] font-bold">
                          Min/Max &nbsp;
                        </span>
                        <span className="text-[10px] font-bold text-black">
                          {effectiveMin != null && effectiveMax != null
                            ? `${effectiveMin} - ${effectiveMax}`
                            : effectiveMax != null
                              ? `${effectiveMax}`
                              : effectiveMin != null
                                ? `${effectiveMin}`
                                : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex flex-row flex-grow w-[${isMobile ? "35%" : "70%"
                      }]  min-h-7`}
                  >
                    <div
                      style={{ color: "#000000", fontFamily: "Tahoma, Helvetica, sans-serif" }}
                      className={`w-full flex flex-grow basis-[${isMobile ? 1 / 2 : 1 / 6
                        }%] min-h-[1.79rem] ${isMobile
                          ? "bg-[#72BBEF]"
                          : "bg-gradient-to-r from-[#D7E8F4] to-[#72BBEF]"
                        }  text-xs font-bold  items-center justify-center`}
                    >
                      Back
                    </div>
                    <div
                      style={{ color: "#000000", fontFamily: "Tahoma, Helvetica, sans-serif" }}
                      className={`w-full flex flex-grow basis-[${isMobile ? 1 / 2 : 1 / 6
                        }%] min-h-[1.79rem] ${isMobile
                          ? "bg-[#FAA9BA]"
                          : "bg-gradient-to-r from-[#FAA9BA] to-[#F6E6EA]"
                        }  text-xs font-bold  items-center justify-center`}
                    >
                      Lay
                    </div>
                  </div>
                </div>

                {/* Row 3 */}
                {marketRunners?.map((runner) => {

                  const runnerName =
                    runnersData?.[runner.selectionId] ??
                    runnersData?.[String(runner.selectionId)] ??
                    "unknown";

                  let isRunnerSuspended = false;
                  const isRunnerStatusOpen =
                    runner?.status?.toLowerCase() === "active" ||
                    runner?.status?.toLowerCase() === "open" ||
                    runner?.status?.toLowerCase() === "online";

                  // if (marketName === "Tied Match") {
                  //   isRunnerSuspended =
                  //     (runner?.price?.back?.length > 0 &&
                  //       runner?.price?.back?.every((ab) => ab.price <= 1.05)) ||
                  //     !isRunnerStatusOpen;
                  // } else {
                  //   isRunnerSuspended = !isRunnerStatusOpen;
                  // }

                  return (
                    <MarketRunnerContainer
                      key={runner.selectionId}
                      placedBetsInThisMarket={placedBetsInThisMarket}
                      marketName={marketName}
                      marketId={marketId}
                      runner={runner}
                      runnerName={runnerName}
                      marketRunners={marketRunners}
                      setActiveBet={handleSetActiveBet}
                      activeBet={activeBet}
                      marketStatus={marketStatus}
                      isMarketSuspended={isMarketSuspended}
                      isRunnerSuspended={isRunnerSuspended}
                      min={effectiveMin}
                      max={effectiveMax}
                      activeSelectionId={activeSelectionId}
                      activeBetType={activeBetType}
                      setActiveSelectionId={setActiveSelectionId}
                      setActiveBetType={setActiveBetType}
                    />
                  );
                })}
              </div>
            </div>
            {isModalOpen && (
              <RulesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </div>
        )}
      </>
    </div>
  );
});

export const MarketRunnerContainer = React.memo(
  ({
    placedBetsInThisMarket,
    marketName,
    marketId,
    runner,
    runnerName,
    marketRunners,
    setActiveBet,
    activeBet,
    marketStatus,
    isMarketSuspended,
    isRunnerSuspended,
    min,
    max,
    activeSelectionId,
    activeBetType,
    setActiveSelectionId,
    setActiveBetType,
  }) => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
    const [searchParams] = useSearchParams();
    const sportId = Number(searchParams.get("eventType"));
    const eventId = searchParams.get("eventId");
    const competitionId = Number(searchParams.get("competitionId"));



    const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);
    // Remember exactly which ladder price cell was clicked (back/lay, level 0/1/2).
    // On submit we compare the entered odds against this same live ladder level.
    const [activePriceIndex, setActivePriceIndex] = useState(null);

    const isRunnerStatusActive =
      runner?.status?.toLowerCase() === "active" ||
      runner?.status?.toLowerCase() === "open" ||
      runner?.status?.toLowerCase() === "online";

    const showRowSuspendedBanner = isRunnerSuspended && !isMarketSuspended;
    const rowSuspendedLabel =
      (!isRunnerStatusActive ? runner?.status : "") || "Suspended";

    useEffect(() => {
      if (
        (isRunnerSuspended || isMarketSuspended) &&
        activeSelectionId === runner.selectionId
      ) {
        setActiveSelectionId(null);
        setActiveBetType(null);
        if (setActiveBet) setActiveBet(null);
        dispatch(handleCancelPlaceBet());
      }
    }, [
      isRunnerSuspended,
      isMarketSuspended,
      activeSelectionId,
      runner.selectionId,
      dispatch,
      setActiveBet,
      setActiveSelectionId,
      setActiveBetType,
    ]);

    const handleMarketCellClick = (betBoxBgColor, price, betType) => {
      setSelfSelectedOdds(price);

      const sideKey = String(betType ?? "").toLowerCase();
      const sideLadder = runner?.price?.[sideKey];
      const clickedPriceIndex = Array.isArray(sideLadder)
        ? sideLadder.findIndex(
          (entry) => Number(entry?.price) === Number(price),
        )
        : -1;

      setActivePriceIndex(clickedPriceIndex >= 0 ? clickedPriceIndex : null);
      setActiveSelectionId(runner.selectionId);
      setActiveBetType(betType);
      if (Number(price) === 0) return;
      dispatch(
        handleOpenPlaceBet({
          sportName: sportsMapping[sportId],
          sportId: sportId,
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
      (runner, marketId) => {
        const filteredBets = placedBetsInThisMarket || [];

        const fbOfThisRunner =
          filteredBets?.filter(
            (fb) =>
              fb.selectionId.toString() === runner.selectionId.toString() &&
              eventId.toString() === fb.eventId.toString() &&
              fb.marketId === marketId,
          ) || [];

        const fbOfOtherRunners =
          filteredBets?.filter(
            (fb) =>
              fb.selectionId.toString() !== runner.selectionId.toString() &&
              eventId.toString() === fb.eventId.toString() &&
              fb.marketId === marketId,
          ) || [];

        let placedBetCalculation =
          fbOfThisRunner.reduce(
            (acc, fbr) =>
              acc +
              (fbr.type === "Back"
                ? Number(fbr.favourMargin)
                : -Number(fbr.againstMargin)),
            0,
          ) +
          fbOfOtherRunners.reduce(
            (acc, fbor) =>
              acc +
              (fbor.type === "Back"
                ? -Number(fbor.againstMargin)
                : Number(fbor.favourMargin)),
            0,
          );

        return Number(placedBetCalculation).toFixed(0);
      },
      [placedBetsInThisMarket, eventId],
    );

    const placedBetCalculation = calculateBetValues(runner, marketId);

    let newCalc;

    if (activeBet) {
      if (
        runner?.selectionId === activeBet?.selectionId &&
        activeBet.type === "Back"
      ) {
        newCalc = Number(activeBet.favourMargin).toFixed(0);
      } else if (
        runner?.selectionId === activeBet?.selectionId &&
        activeBet.type === "Lay"
      ) {
        newCalc = Number(activeBet.againstMargin).toFixed(0);
      } else if (
        runner?.selectionId !== activeBet?.selectionId &&
        activeBet.type === "Back"
      ) {
        newCalc = Number(activeBet.againstMargin).toFixed(0);
      } else if (
        runner?.selectionId !== activeBet?.selectionId &&
        activeBet.type === "Lay"
      ) {
        newCalc = Number(activeBet.favourMargin).toFixed(0);
      }
    }
    if (newCalc == 0 || !activeBet?.stake || Number(activeBet?.stake) === 0) newCalc = null;



    return (
      <div key={runner.selectionId} className="relative w-full">
        <div className="relative w-full flex items-stretch justify-between min-h-11 border-b-[1px] border-[#7e97a7]  border-t-[0.3px]">
          {showRowSuspendedBanner && (
            <SuspendedOverlay label={rowSuspendedLabel} />
          )}
          {/* Runner Column */}
          <div
            className={`flex flex-col justify-center w-[${isMobile ? "65%" : "30%"
              }] pl-2 pr-1 py-1 ${showRowSuspendedBanner ? "opacity-40 pointer-events-none" : ""
              }`}
          >
            <p className="text-[13px] font-bold text-black dark:text-white">
              {runnerName || "unknown"}
            </p>
            <div className="flex flex-row items-center">
              {placedBetsInThisMarket && placedBetsInThisMarket?.length > 0 && Number(placedBetCalculation) !== 0 && (
                <p
                  className={`flex flex-row items-center text-[11px] font-bold ${Number(placedBetCalculation) > 0 ? "text-[#228B22]" : "text-[#D0021B]"
                    }`}
                >
                  <span>
                    <FaArrowRight
                      className="mr-1 inline-block"
                      size={10.5}
                      style={{ stroke: "currentColor", strokeWidth: 24 }}
                    />
                  </span>
                  {Number(placedBetCalculation) < 0 ? "-" : ""}
                  {Math.abs(Number(placedBetCalculation)).toFixed(2)}
                </p>
              )}
              {activeBet && newCalc && Number(newCalc) !== 0 ? (
                <p
                  className={`flex flex-row items-center text-[11px] font-bold ${placedBetsInThisMarket?.length > 0 ? "ml-0.5" : ""
                    } ${Number(newCalc || 0) + (Number(placedBetCalculation) || 0) >
                      0
                      ? "text-[#228B22]"
                      : "text-[#D0021B]"
                    }`}
                >
                  (
                  {Number(newCalc || 0) + (Number(placedBetCalculation) || 0) <
                    0
                    ? ` -${Math.abs(
                      Number(newCalc || 0) +
                      (Number(placedBetCalculation) || 0),
                    ).toFixed(2)} `
                    : ` ${Math.abs(
                      Number(newCalc || 0) +
                      (Number(placedBetCalculation) || 0),
                    ).toFixed(2)} `}
                  )
                </p>
              ) : null}
            </div>
          </div>

          {/* MarketCell Column */}

          <div
            className={`flex flex-wrap flex-grow w-[${isMobile ? "35%" : "70%"
              }] ${showRowSuspendedBanner ? "opacity-40 pointer-events-none" : ""}`}
          >
            {!isMobile && (
              <MarketCell
                handleMarketCellClick={handleMarketCellClick}
                price={runner?.price?.back?.[2]?.price}
                size={runner?.price?.back?.[2]?.size}
                bgColor="#D7E8F4"
                hideOnMobile
                betType="Back"
              />
            )}
            {!isMobile && (
              <MarketCell
                handleMarketCellClick={handleMarketCellClick}
                price={runner?.price?.back?.[1]?.price}
                size={runner?.price?.back?.[1]?.size}
                bgColor="#B7D5EB"
                hideOnMobile
                betType="Back"
              />
            )}
            <MarketCell
              handleMarketCellClick={handleMarketCellClick}
              price={runner?.price?.back?.[0]?.price}
              size={runner?.price?.back?.[0]?.size}
              bgColor="#72BBEF"
              betType="Back"
              isActive={
                activeSelectionId === runner.selectionId &&
                activeBetType === "Back"
              }
            />
            <MarketCell
              handleMarketCellClick={handleMarketCellClick}
              price={runner?.price?.lay?.[0]?.price}
              size={runner?.price?.lay?.[0]?.size}
              bgColor="#FAA9BA"
              betType="Lay"
              isActive={
                activeSelectionId === runner.selectionId &&
                activeBetType === "Lay"
              }
            />
            {!isMobile && (
              <MarketCell
                handleMarketCellClick={handleMarketCellClick}
                price={runner?.price?.lay?.[1]?.price}
                size={runner?.price?.lay?.[1]?.size}
                bgColor="#EFD3D9"
                hideOnMobile
                betType="Lay"
              />
            )}
            {!isMobile && (
              <MarketCell
                handleMarketCellClick={handleMarketCellClick}
                price={runner?.price?.lay?.[2]?.price}
                size={runner?.price?.lay?.[2]?.size}
                bgColor="#F6E6EA"
                hideOnMobile
                betType="Lay"
              />
            )}
          </div>
        </div>

        {activeSelectionId === runner.selectionId && (
          <PlaceBet
            sportName={sportsMapping[sportId]}
            sportId={sportId}
            competitionId={competitionId}
            marketId={marketId}
            market={marketName}
            markettype="Match Odds"
            selectionId={runner.selectionId}
            selection={runnerName}
            selectedOdds={selfSelectedOdds}
            setActiveBet={setActiveBet}
            suspendNow={`${!isRunnerStatusActive || selfSelectedOdds == 0 ? "aura-suspended" : ""}`}
            runners={marketRunners}
            // Pass the exact market-level values displayed in Min/Max.
            // MarketRunnerContainer receives these from MarketContainer.
            min={min}
            max={max}
            odds={runner}
            selectedPriceIndex={activePriceIndex}
          />
        )}
      </div>
    );
  },
);

export default React.memo(MarketOdds);
