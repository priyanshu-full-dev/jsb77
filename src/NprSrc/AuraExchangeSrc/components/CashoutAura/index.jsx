import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaCheck } from "react-icons/fa";
import { placeBet as handleBetSave } from "../../../../socketClient";

import {
  updateAvailableBalance,
  updateExposureBalance,
} from "../../../../redux/slices/userSlice";

import ExposureToast from "../ExposureToast";
import Loader from "../../../../utils/Loader";

export const eventsData = [
  { eventTypeId: "4", name: "Cricket" },
  { eventTypeId: "1", name: "Soccer" },
  { eventTypeId: "2", name: "Tennis" },
];

function generateSingleCashoutBet(
  filteredBets,
  runners,
  odds,
  runnerData = [],
  markettype = "Match Odds",
) {
  const bets = Array.isArray(filteredBets) ? filteredBets : [];

  const liveRunners = Array.isArray(runners)
    ? runners
    : Array.isArray(runners?.runners)
      ? runners.runners
      : [];

  const liveOdds = Array.isArray(odds)
    ? odds
    : Array.isArray(odds?.runners)
      ? odds.runners
      : liveRunners;

  const staticRunners = Array.isArray(runnerData)
    ? runnerData
    : Array.isArray(runnerData?.runners)
      ? runnerData.runners
      : [];

  const typeName = String(markettype || "Match Odds").toLowerCase();
  const isBookmaker = typeName === "bookmaker";
  const isMatchOdds = typeName === "match odds";

  if (!isBookmaker && !isMatchOdds) return null;
  if (!bets.length || liveRunners.length < 2 || liveOdds.length < 2)
    return null;

  // 1. Build current P/L for all runners.
  const runnerPnL = new Map();

  liveRunners.forEach((runner) => {
    const selectionId = Number(runner?.selectionId);
    if (Number.isFinite(selectionId)) runnerPnL.set(selectionId, 0);
  });

  if (runnerPnL.size < 2) return null;

  bets.forEach((bet) => {
    const selectionId = Number(bet?.selectionId);
    if (!Number.isFinite(selectionId)) return;

    const betType = String(bet?.type || bet?.betType || "").toLowerCase();
    const favourMargin = Math.abs(Number(bet?.favourMargin ?? 0));
    const againstMargin = Math.abs(Number(bet?.againstMargin ?? 0));

    if (!Number.isFinite(favourMargin) || !Number.isFinite(againstMargin))
      return;

    liveRunners.forEach((runner) => {
      const runnerId = Number(runner?.selectionId);
      if (!Number.isFinite(runnerId)) return;

      const current = Number(runnerPnL.get(runnerId) || 0);

      if (runnerId === selectionId) {
        if (betType === "back") {
          runnerPnL.set(runnerId, current + favourMargin);
        } else if (betType === "lay") {
          runnerPnL.set(runnerId, current - againstMargin);
        }
      } else if (betType === "back") {
        runnerPnL.set(runnerId, current - againstMargin);
      } else if (betType === "lay") {
        runnerPnL.set(runnerId, current + favourMargin);
      }
    });
  });

  const pnlEntries = Array.from(runnerPnL.entries());
  if (pnlEntries.length < 2) return null;

  // 2. Generate cashout candidates.
  const candidates = [];

  liveRunners.forEach((runner) => {
    const selectionId = Number(runner?.selectionId);
    if (!Number.isFinite(selectionId)) return;

    const targetPnl = Number(runnerPnL.get(selectionId) || 0);
    const otherEntries = pnlEntries.filter(([id]) => id !== selectionId);
    if (!otherEntries.length) return;

    const minOtherPnl = Math.min(
      ...otherEntries.map(([, pnl]) => Number(pnl || 0)),
    );

    const liveRunner =
      liveOdds.find((item) => Number(item?.selectionId) === selectionId) ||
      runner;

    const staticRunner = staticRunners.find(
      (item) => Number(item?.selectionId) === selectionId,
    );

    const placedBet =
      bets.find((bet) => Number(bet?.selectionId) === selectionId) || null;

    const selectionName =
      staticRunner?.runnerName ||
      staticRunner?.selectionName ||
      staticRunner?.name ||
      placedBet?.selection ||
      placedBet?.selectionName ||
      liveRunner?.runnerName ||
      liveRunner?.selectionName ||
      liveRunner?.name ||
      runner?.runnerName ||
      runner?.selectionName ||
      runner?.name ||
      "";

    const backOdds = Number(
      liveRunner?.ex?.availableToBack?.[0]?.price ??
        liveRunner?.price?.back?.[0]?.price ??
        liveRunner?.back?.[0]?.price ??
        0,
    );

    const layOdds = Number(
      liveRunner?.ex?.availableToLay?.[0]?.price ??
        liveRunner?.price?.lay?.[0]?.price ??
        liveRunner?.lay?.[0]?.price ??
        0,
    );

    // Bookmaker odds are percentages.
    if (isBookmaker) {
      if (targetPnl < minOtherPnl && backOdds > 0) {
        const rate = backOdds / 100;
        const stake = (minOtherPnl - targetPnl) / (1 + rate);

        if (Number.isFinite(stake) && stake > 0) {
          candidates.push({
            selectionId,
            selectionName,
            type: "Back",
            betType: "Back",
            strategy: "bookmakerBackLower",
            odds: backOdds,
            stake: Number(stake.toFixed(2)),
            favourMargin: Number(((backOdds * stake) / 100).toFixed(2)),
            againstMargin: Number(stake.toFixed(2)),
            cashoutValue: Number((minOtherPnl - stake).toFixed(2)),
            reason: "Bookmaker cashout",
            runner: liveRunner,
          });
        }
      }

      if (targetPnl > minOtherPnl && layOdds > 0) {
        const rate = layOdds / 100;
        const stake = (targetPnl - minOtherPnl) / (1 + rate);

        if (Number.isFinite(stake) && stake > 0) {
          candidates.push({
            selectionId,
            selectionName,
            type: "Lay",
            betType: "Lay",
            strategy: "bookmakerLayHigher",
            odds: layOdds,
            stake: Number(stake.toFixed(2)),
            favourMargin: Number(stake.toFixed(2)),
            againstMargin: Number(((layOdds * stake) / 100).toFixed(2)),
            cashoutValue: Number((minOtherPnl + stake).toFixed(2)),
            reason: "Bookmaker cashout",
            runner: liveRunner,
          });
        }
      }

      return;
    }

    // Match Odds use decimal odds.
    if (isMatchOdds) {
      if (targetPnl < minOtherPnl && backOdds >= 1.01) {
        const stake = (minOtherPnl - targetPnl) / backOdds;

        if (Number.isFinite(stake) && stake > 0) {
          candidates.push({
            selectionId,
            selectionName,
            type: "Back",
            betType: "Back",
            strategy: "matchOddsBackLower",
            odds: backOdds,
            stake: Number(stake.toFixed(2)),
            favourMargin: Number(((backOdds - 1) * stake).toFixed(2)),
            againstMargin: Number(stake.toFixed(2)),
            cashoutValue: Number((minOtherPnl - stake).toFixed(2)),
            reason: "Match Odds cashout",
            runner: liveRunner,
          });
        }
      }

      if (targetPnl > minOtherPnl && layOdds >= 1.01) {
        const stake = (targetPnl - minOtherPnl) / layOdds;

        if (Number.isFinite(stake) && stake > 0) {
          candidates.push({
            selectionId,
            selectionName,
            type: "Lay",
            betType: "Lay",
            strategy: "matchOddsLayHigher",
            odds: layOdds,
            stake: Number(stake.toFixed(2)),
            favourMargin: Number(stake.toFixed(2)),
            againstMargin: Number(((layOdds - 1) * stake).toFixed(2)),
            cashoutValue: Number((minOtherPnl + stake).toFixed(2)),
            reason: "Match Odds cashout",
            runner: liveRunner,
          });
        }
      }
    }
  });

  if (!candidates.length) return null;
  candidates.sort((a, b) => Number(b.cashoutValue) - Number(a.cashoutValue));
  return candidates[0];
}

function findMaxLoss(filteredBets, cashoutOffer, runners) {
  function computeMaxLoss(bets, currentRunners) {
    const runnersPnl = {};

    currentRunners.forEach(({ selectionId: runnerId }) => {
      bets.forEach(({ selectionId, type, favourMargin, againstMargin }) => {
        const fav = Math.abs(Number(favourMargin || 0));
        const ag = Math.abs(Number(againstMargin || 0));

        if (runnerId == selectionId) {
          if (type === "Back") {
            runnersPnl[selectionId] = (runnersPnl?.[selectionId] || 0) + fav;
          }
          if (type === "Lay") {
            runnersPnl[selectionId] = (runnersPnl?.[selectionId] || 0) - ag;
          }
        } else {
          if (type === "Back") {
            runnersPnl[runnerId] = (runnersPnl?.[runnerId] || 0) - ag;
          }
          if (type === "Lay") {
            runnersPnl[runnerId] = (runnersPnl?.[runnerId] || 0) + fav;
          }
        }
      });
    });

    const pnlValues = Object.values(runnersPnl);
    return Math.min(...pnlValues);
  }

  const maxLossWithoutCashout = computeMaxLoss(filteredBets, runners);
  const maxLossWithCashout = computeMaxLoss(
    [...filteredBets, cashoutOffer],
    runners,
  );

  return { maxLossWithoutCashout, maxLossWithCashout };
}

export const getSportNameById = (sportId) => {
  const currentEvent = eventsData.find((e) => e.eventTypeId === sportId);
  return currentEvent ? currentEvent.name : "";
};

const CashOutAura = ({
  marketId,
  filteredBets,
  runningData,
  odds,
  runnerData = [],
  eventId,
  legueId,
  matchId,
  event,
  markettype,
  market,
  sportName,
  DisMarketName,
  min = 100,
  max = 500000,
}) => {
  const dispatch = useDispatch();
  const [cashoutOffer, setCashoutOffer] = useState(null);
  const [placeBet, setPlaceBet] = useState(false);
  const [cashoutValue, setCashoutValue] = useState(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const resolvedMin = Number.isFinite(Number(min))
    ? Number(min)
    : Number.isFinite(Number(market?.min))
      ? Number(market?.min)
      : Number.isFinite(Number(odds?.min))
        ? Number(odds?.min)
        : 100;

  const resolvedMax = Number.isFinite(Number(max))
    ? Number(max)
    : Number.isFinite(Number(market?.max))
      ? Number(market?.max)
      : Number.isFinite(Number(odds?.max))
        ? Number(odds?.max)
        : 500000;

  const handleCashout = async () => {
    if (filteredBets?.length === 0) {
      setPlaceBet(false);
      return;
    }
    

    if (placeBet && cashoutOffer) {
      const requestedStake = Number(cashoutOffer?.stake ?? 0);
      const minLimit = resolvedMin;
      const maxLimit = resolvedMax;

      if (requestedStake === 0) {
        setPlaceBet(false);
        const toastId = "cashout-info-1";
        if (!toast.isActive(toastId)) {
          toast.info("Cashout not possible right now.", { toastId });
        }
        return;
      }

      // Enforce market-specific stake limits before calling the bet API.
      if (requestedStake < minLimit || requestedStake > maxLimit) {
        toast.error(
          <ExposureToast
            type="error"
            subtitle={
              requestedStake < minLimit
                ? `Minimum bet limit is ${minLimit}`
                : `Maximum bet limit is ${maxLimit}`
            }
          />,
        );
        setPlaceBet(false);
        setCashoutOffer(null);
        setCashoutValue(null);
        return;
      }

      setIsPlacingBet(true);

      const selection =
        cashoutOffer?.selectionName ||
        cashoutOffer?.runner?.runnerName ||
        cashoutOffer?.runner?.selectionName ||
        cashoutOffer?.runner?.name ||
        "";

      if (!selection) {
        toast.error("Selection name not available");
        setIsPlacingBet(false);
        return;
      }

      const betData = {
        ...cashoutOffer,
        sportsName: sportName,
        eventId,
        legueId,
        matchId,
        selection,
        event,
        markettype,
        market,
        oddsReq: cashoutOffer.odds,
        marketId,
        runners: runningData,
        placeTime: new Date().toISOString(),
        isCashout: true,
        betRate: true,
        min: minLimit,
        max: maxLimit,
      };

      try {
        const createResponse = await handleBetSave(betData);

        if (!createResponse?.success) {
          toast.warning(createResponse?.message || "Cashout bet could not be placed.");
          return;
        }

        setPlaceBet(false);
        toast.success(
          <ExposureToast
            type="success"
            subtitle={"Matched Placebet Successfully."}
          />,
        );

        const nextAvailableBalance =
          createResponse?.userData?.availableBalance ??
          createResponse?.bet?.balanceAfterBet;
        const nextExposure =
          createResponse?.exposure ?? createResponse?.bet?.exposureAfterBet;

        if (nextAvailableBalance !== undefined && nextAvailableBalance !== null) {
          dispatch(updateAvailableBalance(nextAvailableBalance));
        }
        if (nextExposure !== undefined && nextExposure !== null) {
          dispatch(updateExposureBalance(nextExposure));
        }
      } catch (error) {
        console.error("Error placing bet:", error?.message || error);
      } finally {
        setIsPlacingBet(false);
        setCashoutOffer(null);
        setPlaceBet(false);
      }
    } else {
      setPlaceBet(true);
    }
  };

  useEffect(() => {
    if (!filteredBets?.length || !placeBet) return;

    const offer = generateSingleCashoutBet(
      filteredBets,
      runningData,
      odds,
      runnerData,
      markettype,
    );

    if (!offer) {
      setCashoutOffer(null);
      setCashoutValue(null);
      setPlaceBet(false);
      return;
    }

    const calculatedStake = Number(offer.stake || 0);

    // Cashout must use the full hedge stake; do not cap by available balance.
    if (!Number.isFinite(calculatedStake) || calculatedStake <= 0) {
      setCashoutOffer(null);
      setCashoutValue(null);
      setPlaceBet(false);
      return;
    }

    offer.stake = Number(calculatedStake.toFixed(2));
    const isBookmaker = String(markettype || "").toLowerCase() === "bookmaker";

    if (isBookmaker) {
      if (offer.betType === "Back") {
        offer.favourMargin = Number(
          ((Number(offer.odds || 0) * offer.stake) / 100).toFixed(2),
        );
        offer.againstMargin = Number(offer.stake.toFixed(2));
      } else {
        offer.favourMargin = Number(offer.stake.toFixed(2));
        offer.againstMargin = Number(
          ((Number(offer.odds || 0) * offer.stake) / 100).toFixed(2),
        );
      }
    } else if (offer.betType === "Back") {
      offer.favourMargin = Number(
        (Math.max(Number(offer.odds || 0) - 1, 0) * offer.stake).toFixed(2),
      );
      offer.againstMargin = Number(offer.stake.toFixed(2));
    } else {
      offer.favourMargin = Number(offer.stake.toFixed(2));
      offer.againstMargin = Number(
        (Math.max(Number(offer.odds || 0) - 1, 0) * offer.stake).toFixed(2),
      );
    }

    offer.type = offer.betType;

    const auraRunners = Array.isArray(runningData)
      ? runningData
      : Array.isArray(runningData?.runners)
        ? runningData.runners
        : [];

    const { maxLossWithCashout, maxLossWithoutCashout } = findMaxLoss(
      filteredBets,
      offer,
      auraRunners,
    );

    if (
      Number.isFinite(maxLossWithCashout) &&
      Number.isFinite(maxLossWithoutCashout) &&
      maxLossWithCashout > maxLossWithoutCashout + 0.01
    ) {
      offer.cashoutValue = Number(maxLossWithCashout.toFixed(2));
      setCashoutOffer(offer);
      setCashoutValue(Number(maxLossWithCashout.toFixed(2)));
    } else {
      setCashoutOffer(null);
      setCashoutValue(null);
      setPlaceBet(false);
    }
  }, [filteredBets, runningData, odds, runnerData, placeBet, markettype]);

  const hasBets = Array.isArray(filteredBets) && filteredBets.length > 0;
  const hasCashoutValue =
    placeBet && cashoutValue !== null && Number.isFinite(Number(cashoutValue));
  const numericCashoutValue = Number(cashoutValue || 0);
  const cashoutIsNegative = numericCashoutValue < 0;
  const cashoutIsPositive = numericCashoutValue > 0;

  return (
    <>
      <button
        type="button"
        onClick={handleCashout}
        className={`flex items-center pl-1.5 ml-0.5 gap-2 px-2 py-1 rounded-[5px] text-[12px] font-bold transition-all duration-150
          border border-transparent h-[26px]
          ${
            !hasBets
              ? " -ml-2 text-black bg-transparent"
              : "bg-[#D1D1D1] text-[#222222] hover:bg-[#C8C8C8] active:scale-[0.98]"
          }
        `}
      >
        <div
          className={`h-[18px] w-[18px] flex items-center justify-center rounded-[2px] bg-[#FFB900] shrink-0
            ${hasCashoutValue ? "shadow-sm" : ""}`}
        >
          {hasCashoutValue ? (
            <span className="text-black text-[11px] leading-none font-extrabold">
              <FaCheck />
            </span>
          ) : (
            <div className="h-[10px] w-[10px] bg-black rounded-full" />
          )}
        </div>

        <span
          className={`leading-none text-[11px] font-bold text-left
            ${
              !hasCashoutValue
                ? "text-black"
                : cashoutIsNegative
                  ? "text-[#D90000]"
                  : cashoutIsPositive
                    ? "text-[#159447]"
                    : "text-black"
            }
          `}
          style={{
            fontFamily: "Tahoma, Helvetica, sans-serif",
            fontWeight: 700,
            color: !hasCashoutValue ? "#000000" : undefined,
          }}
        >
          {hasCashoutValue ? numericCashoutValue.toFixed(2) : "Cash Out"}
        </span>
      </button>

      {isPlacingBet && <Loader />}
    </>
  );
};

export default CashOutAura;
