import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  handleCancelPlaceBet,
  handleOpenPlaceBet,
} from "../../../../../redux/slices/placeBetSlice";
import { displayAuthModal } from "../../../../../redux/slices/authModalSlice";
import PlaceBet from "../../../components/PlaceBet";
import { sportsMapping } from "./MatchDetailsBanner";
import { useSearchParams } from "react-router-dom";
import RulesModal from "./RulesModal";
import { IoInformationCircleOutline } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";

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

// ─── Main Export ─────────────────────────────────────────────────────────────
function TossMarket({ odds }) {


  const filteredMarketoddsData = useMemo(() => {
    const dataArray = Array.isArray(odds) ? odds : [];
    return dataArray.filter((market) =>
      [
        "bookmaker",
        "to win the match",
        "which team will win the toss",
      ].includes(market?.marketName?.toLowerCase()),
    );
  }, [odds]);

  return (
    <div>
      {filteredMarketoddsData.map((market, i) => (
        <MarketContainer key={market?.marketId || i} market={market} />
      ))}
    </div>
  );
}

// ─── TossOddsButton ───────────────────────────────────────────────────────────
const TossOddsButton = React.memo(({
  runner,
  marketStatus,
  marketId,
  placedBetsInThisMarket,
  isRunnerSuspended,
  price,
  size,
  onButtonClick,
  isActive,
  activeBet,
}) => {
  const isMarketSuspended =
    marketStatus.toLowerCase() !== "active" &&
    marketStatus.toLowerCase() !== "open" &&
    marketStatus.toLowerCase() !== "online";

  const [searchParams] = useSearchParams();
  const sportId = Number(searchParams.get("eventType"));
  const eventId = searchParams.get("eventId");
  const competitionId = Number(searchParams.get("competitionId"));

  const isSuspended = isRunnerSuspended || isMarketSuspended;

  const suspendedLabel = isSuspended
    ? (runner?.status?.toLowerCase() !== "active" &&
      runner?.status?.toLowerCase() !== "online"
      ? runner?.status
      : marketStatus?.toLowerCase() !== "active" &&
        marketStatus.toLowerCase() !== "open" &&
        marketStatus.toLowerCase() !== "online"
        ? marketStatus
        : "") || "Suspended"
    : "";

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

  const getPreviewPL = (runner) => {
    const baseBets = placedBetsInThisMarket || [];

    // 👉 stake nahi hai
    if (!activeBet || Number(activeBet?.stake) <= 0) {
      return Number(placedBetCalculation);
    }

    // 👉 temp bet (IMPORTANT: clean structure)
    const tempBet = {
      selectionId: String(activeBet.selectionId),
      eventId: String(eventId),
      marketId: marketId,
      type: activeBet.type,
      favourMargin: Number(activeBet.favourMargin),
      againstMargin: Number(activeBet.againstMargin),
    };

    const allBets = [...baseBets, tempBet];

    let total = 0;

    allBets.forEach((bet) => {
      const isSameRunner =
        String(bet.selectionId) === String(runner.selectionId);

      if (bet.type === "Back") {
        total += isSameRunner
          ? Number(bet.favourMargin)
          : -Math.abs(Number(bet.againstMargin));
      } else {
        total += isSameRunner
          ? -Number(bet.againstMargin)
          : Number(bet.favourMargin);
      }
    });

    return total;
  };

  const previewValue = getPreviewPL(runner);

  return (
    <div className="flex-1 flex flex-col items-center">
      <div
        onClick={() => {
          if (isSuspended || !price || price === 0) return;
          onButtonClick(runner.selectionId, price);
        }}
        className={`w-[119px] border border-white rounded-[3px] h-[42px] flex flex-col items-center justify-center relative overflow-hidden
    ${!isSuspended
            ? isActive
              ? "bg-[#16a660] text-white"
              : "bg-[#72e3a0]"
            : "bg-[#72e3a0]"
          }`}
      >
        {isRunnerSuspended && !isMarketSuspended && (
          <div
            className="absolute inset-0 z-20 aura-suspended-full"
            data-label={runner.status}
          />
        )}

        <span
          className="text-[12px] font-bold"
          style={{ color: isActive ? "#ffffff" : "#212529", fontFamily: "Tahoma, Helvetica, sans-serif" }}
        >
          {price ?? "-"}
        </span>
        <span
          className="text-[11px]"
          style={{ color: isActive ? "#ffffff" : "#212529", fontFamily: "Tahoma, Helvetica, sans-serif" }}
        >
          {size ? formatToKOrM(size) : "-"}
        </span>
      </div>

      <div className="flex flex-row items-center">
        {/* Existing P/L */}
        {placedBetsInThisMarket?.length > 0 && Number(placedBetCalculation) !== 0 && (
          <p
            className={`flex flex-row items-center text-[10px] font-bold ${
              Number(placedBetCalculation) > 0 ? "text-[#228B22]" : "text-[#D0021B]"
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

        {/* Preview P/L */}
        {activeBet && Number(activeBet?.stake) > 0 ? (
          <p
            className={`flex flex-row items-center text-[10px] font-bold ${
              placedBetsInThisMarket?.length > 0 ? "ml-1" : ""
            } ${
              previewValue > 0 ? "text-[#228B22]" : "text-[#D0021B]"
            }`}
          >
            ({previewValue < 0 ? " -" : " "}
            {Math.abs(Number(previewValue)).toFixed(2)})
          </p>
        ) : null}
      </div>
    </div>
  );
});

const MarketContainer = React.memo(function MarketContainer({ market }) {
  const { marketId, marketName, min, max, runnersData, oddsData } = market;

  // runners + status + totalMatched now live under oddsData

  const marketRunners = useMemo(() => (oddsData?.runners || []).map((runner) => {
    const selectionId = String(runner.selectionId);

    return {
      selectionId: runner.selectionId,
      runnerName: runnersData[selectionId] || null,
      handicap: runner.handicap ?? 0,
      status: runner.status,
      price: runner.price,
    };
  }), [oddsData?.runners, runnersData]);
  const marketStatus = oddsData?.status || "";
  const totalMatched = oddsData?.totalMatched ?? 0;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBet, setActiveBet] = useState(null);
  const [activeSelectionId, setActiveSelectionId] = useState(null);
  const [activeOdds, setActiveOdds] = useState(0);
  const [activeRunnerData, setActiveRunnerData] = useState(null);

  const [sId, setSid] = useState("");
  const [searchParams] = useSearchParams();
  const sportId = Number(searchParams.get("eventType"));
  const competitionId = Number(searchParams.get("competitionId"));
  const eventName = searchParams.get("eventName");

  const dispatch = useDispatch();

  const placedBets = useSelector((state) => state.account.bets);
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const placedBetsInThisMarket = useMemo(() => placedBets.filter(
    (pb) =>
      pb?.marketId == marketId &&
      pb.market == marketName &&
      pb.event == eventName,
  ), [placedBets, marketId, marketName, eventName]);

  const getRunnerSuspended = (runner) => {
    if (marketName === "Tied Match") {
      return (
        (runner?.price?.back?.length > 0 &&
          runner?.price?.back?.every((ab) => ab.price <= 1.05)) ||
        (runner?.status !== "ACTIVE" &&
          runner?.status !== "OPEN" &&
          runner?.status !== "ONLINE")
      );
    }
    return (
      runner?.status !== "ACTIVE" &&
      runner?.status !== "OPEN" &&
      runner?.status !== "ONLINE"
    );
  };

  const isMarketSuspended =
    marketStatus.toLowerCase() !== "active" &&
    marketStatus.toLowerCase() !== "open" &&
    marketStatus.toLowerCase() !== "online";

  const handleButtonClick = (selectionId, price, runnerData) => {
    setActiveSelectionId(selectionId);
    setSid(String(selectionId));
    setActiveOdds(price);
    setActiveRunnerData(runnerData);

    dispatch(
      handleOpenPlaceBet({
        sportName: sportsMapping[sportId],
        sportId,
        competitionId,
        marketId,
        market: marketName,
        markettype: "Match Odds",
        selectionId,
        betBoxBgColor: "#d3edd0",
        betType: "Back",
      }),
    );
  };

  const activeRunner = marketRunners?.find(
    (r) => r.selectionId === activeSelectionId,
  );
  const isActiveRunnerSuspended = activeRunner
    ? getRunnerSuspended(activeRunner)
    : false;
  const suspendNow =
    activeSelectionId && (isActiveRunnerSuspended || isMarketSuspended)
      ? "aura-suspended"
      : "";

  const overlayLabel = !["ACTIVE", "ONLINE", "OPEN"].includes(
    (marketStatus || "").toUpperCase(),
  )
    ? marketStatus
    : "";

  useEffect(() => {
    if (suspendNow) {
      dispatch(handleCancelPlaceBet());
    }
  }, [suspendNow]);

  return (
    <div
      key={marketId}

      className="bg-white dark:bg-dark-bg"
    >
      {/* ── Header Row ── */}
      <div className="w-full flex flex-row items-center justify-between min-h-7 mt-2 border-b-[1px] border-t-[0.3px] border-[#7e97a7] pr-2">
        <div className="w-full flex gap-1 flex-row flex-grow items-center">
          <span className="whitespace-nowrap min-h-7 flex flex-row gap-2 items-center justify-between text-center pl-2 pr-2 py-1.5 rounded-tr-xl bg-aura-blue-gradient text-white text-[12px] font-bold">
            {marketName}
            <IoInformationCircleOutline
              size={20}
              className="cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            />
          </span>
        </div>

        <div
          className="flex flex-row items-center pr-2 whitespace-nowrap"
          style={{ color: "#000000", fontFamily: "Tahoma, Helvetica, sans-serif" }}
        >
          <span className="text-[11px] mr-1" style={{ color: "#000000" }}>Matched</span>
          <span className="text-[11px] font-bold" style={{ color: "#000000" }}>
            &#8364;{formatToKOrM(totalMatched)}
          </span>
        </div>
      </div>

      {/* ── Animated Content ── */}
      <>
        <div
          
          className="relative overflow-hidden bg-[linear-gradient(90deg,#82dda6cc,#82ddb059_49%,#82dda6cc)]"
        >
          {overlayLabel && (
            <div
              className="absolute  inset-0 z-10 aura-suspended-full"
              data-label={overlayLabel}
            />
          )}

          {/* ── Team Name Headers + PL ── */}
          <div className="w-full flex flex-row pt-1.5">
            {marketRunners?.map((runner, i) => {
              const runnerName =
                runnersData?.[runner.selectionId] ??
                runnersData?.[String(runner.selectionId)] ??
                "Unknown";

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-center"
                >
                  {/* TEAM NAME */}
                  <div className="text-[12px] font-bold text-[#212529]">
                    {runnerName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Odds Buttons ── */}
          <div className="w-full flex  flex-row  pb-1">
            {marketRunners?.map((runner) => {
              const runnerName =
                runnersData?.[runner.selectionId] ??
                runnersData?.[String(runner.selectionId)] ??
                "Unknown";
              const price = runner?.price?.back?.[0]?.price;
              const size = runner?.price?.back?.[0]?.size;
              const isRunnerSuspended = getRunnerSuspended(runner);

              return (
                <TossOddsButton
                  activeBet={activeBet}
                  placedBetsInThisMarket={placedBetsInThisMarket}
                  key={runner.selectionId}
                  runner={runner}
                  marketId={marketId}
                  marketStatus={marketStatus}
                  isRunnerSuspended={isRunnerSuspended}
                  price={price}
                  size={size}
                  isActive={
                    activeBet &&
                    String(activeBet.selectionId) === String(runner.selectionId)
                  }
                  onButtonClick={(selectionId, price) =>
                    handleButtonClick(selectionId, price, {
                      runnerName,
                      selectionId,
                    })
                  }
                />
              );
            })}
          </div>

          {(() => {
            const firstRunner = marketRunners?.[0];
            if (!firstRunner) return null;

            const mappedRunners = marketRunners.map((r) => ({
              runnerName:
                runnersData?.[r.selectionId] ??
                runnersData?.[String(r.selectionId)],
              selectionId: r.selectionId,
            }));

            return (
              <PlaceBet
                sportName={sportsMapping[sportId]}
                sportId={sportId}
                competitionId={competitionId}
                marketId={marketId}
                market={marketName}
                markettype="Match Odds"
                selectionId={sId || ""}
                selection={activeRunnerData?.runnerName ?? ""}
                selectedOdds={sId !== null ? activeOdds : 0}
                setActiveBet={setActiveBet}
                suspendNow={suspendNow}
                runners={mappedRunners}
                min={min}
                max={max}
              />
            );
          })()}

          {isModalOpen && (
            <RulesModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      </>
    </div>
  );
});

export default React.memo(TossMarket);
