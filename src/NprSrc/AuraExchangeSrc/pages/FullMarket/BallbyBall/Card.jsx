import React, { useCallback, useEffect, useState, useMemo } from "react";
import { FaLock } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { BetBox } from "../../../components/PlaceBet";
import {
  handleOpenPlaceBet,
  handleCancelPlaceBet,
} from "../../../../../redux/slices/placeBetSlice";
import { DEFAULT_BALLBYBALL_RUNNERS } from "./BallByBall";

const Card = ({
  runners = [],
  gameId = "4.3544687543453",
  marketId,
  currentRoundId,
  currentRoundKey,
  min = 100,
  max = 100000,
  roundStatus,
  selfSuspend = false,
}) => {
  const dispatch = useDispatch();

  const [activeSid, setActiveSid] = useState(null);
  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);

  useEffect(() => {
    setActiveSid(null);
    setSelfSelectedOdds(0);
  }, [marketId]);

  /* ================= ORDER ================= */
  const leftLabels = ["0 RUNS", "2 RUNS", "4 RUNS", "WICKET"];
  const rightLabels = ["1 RUNS", "3 RUNS", "6 RUNS", "EXTRA RUNS"];

  const effectiveRunners = useMemo(() => {
    if (Array.isArray(runners) && runners.length > 0) return runners;
    return DEFAULT_BALLBYBALL_RUNNERS;
  }, [runners]);

  const sortByOrder = (list, order) =>
    order
      .map((name) =>
        list.find(
          (item) =>
            (item?.label || item?.selectionName || "")
              .toUpperCase()
              .trim() === name.toUpperCase().trim()
        )
      )
      .filter(Boolean);

  const leftSide = sortByOrder(effectiveRunners, leftLabels);
  const rightSide = sortByOrder(effectiveRunners, rightLabels);

  let rows = [];
  if (leftSide.length > 0 || rightSide.length > 0) {
    const maxRows = Math.max(leftSide.length, rightSide.length);
    rows = Array.from({ length: maxRows }, (_, i) => ({
      left: leftSide[i] || null,
      right: rightSide[i] || null,
    }));
  } else {
    const fallbackLeft = sortByOrder(DEFAULT_BALLBYBALL_RUNNERS, leftLabels);
    const fallbackRight = sortByOrder(DEFAULT_BALLBYBALL_RUNNERS, rightLabels);
    const maxRows = Math.max(fallbackLeft.length, fallbackRight.length);
    rows = Array.from({ length: maxRows }, (_, i) => ({
      left: fallbackLeft[i] || null,
      right: fallbackRight[i] || null,
    }));
  }

  /* ================= COLORS ================= */
  const getGradient = (label) => {
    const n = (label || "").toLowerCase();
    if (n.includes("wicket"))
      return "linear-gradient(to bottom, #d95353 0%, #ff8585 45%, #d14747 100%)";
    if (n.includes("4"))
      return "linear-gradient(to bottom, #49c57d 0%, #83ebb2 45%, #3eb672 100%)";
    if (n.includes("6"))
      return "linear-gradient(to bottom, #7d8ef0 0%, #abb8ff 45%, #697be6 100%)";
    return "linear-gradient(to bottom, #d4be34 0%, #f6ea56 45%, #d1ba2f 100%)";
  };

  /* ================= STATUS HELPER ================= */
  const isItemOpen = (item) => {
    if (selfSuspend) return false;
    if (String(roundStatus || "").toUpperCase() === "MARKET_SUSPENDED") return false;
    if (!item) return false;
    const s = String(item?.status || "").toUpperCase();
    return (
      s === "ONLINE" ||
      s === "OPEN" ||
      s === "ACTIVE" ||
      item?.status === true
    );
  };

  /* ================= AUTO-CLOSE BETBOX ON SUSPEND ================= */
  useEffect(() => {
    if (!activeSid) return;

    const isSuspended =
      selfSuspend ||
      String(roundStatus || "").toUpperCase() === "MARKET_SUSPENDED";

    const activeItem = runners.find(
      (r) => String(r?.selectionId) === String(activeSid)
    );

    if (isSuspended || !activeItem || !isItemOpen(activeItem)) {
      setActiveSid(null);
      setSelfSelectedOdds(0);
      dispatch(handleCancelPlaceBet());
    }
  }, [selfSuspend, roundStatus, activeSid, runners, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(handleCancelPlaceBet());
    };
  }, [dispatch]);

  /* ================= CLICK ================= */
  const handleClick = useCallback(
    (e, item) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();

      console.count("[CARD CLICK]");

      if (!item) return;
      if (!isItemOpen(item)) return;

      const price = item.backPrice ?? item.price ?? 0;
      if (!price) return;

      // Toggle off
      if (String(activeSid) === String(item.selectionId)) {
        console.count("[CANCEL PLACE BET]");
        setActiveSid(null);
        setSelfSelectedOdds(0);
        dispatch(handleCancelPlaceBet());
        return;
      }

      console.count("[OPEN PLACE BET]");
      setActiveSid(String(item.selectionId));
      setSelfSelectedOdds(price);

      dispatch(
        handleOpenPlaceBet({
          sportName: "Casino",
          sportId: 1000,
          competitionId: "casino",
          marketId: marketId,
          market: "runs",
          markettype: "Casino",
          selectionId: item.selectionId,
          betType: "Back",
          betBoxBgColor: "#d3edd0",
          eventId: gameId,
          event: "ballbyball",
        })
      );
    },
    [activeSid, isItemOpen, marketId, gameId, dispatch]
  );

  /* ================= PLACED BETS & PNL CALCULATION ================= */
  const placedBets = useSelector((state) => state.account.bets) || [];

  const relevantPlacedBets = useMemo(() => {
    if (!placedBets || !Array.isArray(placedBets)) return [];

    const normMarketId = String(marketId || "").trim();
    const normRoundId = String(currentRoundId || "").trim();
    const normRoundKey = String(currentRoundKey || "").trim();

    return placedBets.filter((bet) => {
      // Must be an unsettled bet
      if (bet.status && bet.status !== "unsettled") return false;

      // 1. Check if the bet is for this event/game
      const bGameId = String(bet.matchId ?? bet.eventId ?? "").trim();
      const bEvent = String(bet.event || "").toLowerCase();
      const gameMatch =
        !gameId ||
        !bGameId ||
        bGameId === String(gameId).trim() ||
        bEvent.includes("ballbyball") ||
        bEvent.includes("ball by ball");

      if (!gameMatch) return false;

      // 2. Strict roundId / marketId match for current round ONLY
      const bRoundId = String(bet.roundId ?? bet.marketId ?? bet.mid ?? "").trim();
      if (!bRoundId) return false;

      const matchesCurrentRound =
        (normMarketId && bRoundId === normMarketId) ||
        (normRoundId && bRoundId === normRoundId) ||
        (normRoundKey && bRoundId === normRoundKey);

      return matchesCurrentRound;
    });
  }, [placedBets, marketId, currentRoundId, currentRoundKey, gameId]);

  const isRunnerMatch = (item, bet) => {
    if (!item || !bet) return false;

    const itemSid = String(item.selectionId ?? item.sid ?? "");
    const betSid = String(bet.selectionId ?? bet.sid ?? "");
    if (itemSid && betSid && itemSid === betSid) return true;

    const itemLabel = String(
      item.label ?? item.selectionName ?? item.name ?? ""
    )
      .trim()
      .toUpperCase();
    const betLabel = String(
      bet.selection ?? bet.selectionName ?? bet.runnerName ?? ""
    )
      .trim()
      .toUpperCase();
    if (itemLabel && betLabel && itemLabel === betLabel) return true;

    return false;
  };

  const getRunnerPnl = useCallback(
    (item) => {
      if (!item) return 0;

      // Sirf aur sirf placed bets se calculation hogi (jab bet place ho jaye)
      let placedPnl = 0;
      for (const bet of relevantPlacedBets) {
        const isCurrent = isRunnerMatch(item, bet);
        const isBack = String(bet?.type || "BACK").toUpperCase() === "BACK";

        const stake =
          Number(bet?.stake) ||
          Math.abs(Number(bet?.againstMargin)) ||
          0;
        const odds = Number(bet?.price || bet?.oddsReq || 0);

        const profit =
          bet?.favourMargin !== undefined &&
          bet?.favourMargin !== null &&
          !isNaN(Number(bet.favourMargin))
            ? Math.abs(Number(bet.favourMargin))
            : odds > 1 && stake > 0
            ? (odds - 1) * stake
            : 0;

        const loss =
          stake > 0
            ? stake
            : Math.abs(Number(bet?.againstMargin || 0));

        if (isCurrent) {
          placedPnl += isBack ? profit : -loss;
        } else {
          placedPnl += isBack ? -loss : profit;
        }
      }

      return placedPnl;
    },
    [relevantPlacedBets]
  );

  const formatPnl = (val) => {
    const rounded = Math.round(Number(val) * 100) / 100;
    if (Math.abs(rounded) % 1 === 0) {
      return Math.abs(rounded).toString();
    }
    return Math.abs(rounded).toFixed(2);
  };

  /* ================= SINGLE CARD ================= */
  const renderSingleCard = (item) => {
    if (!item) return <div className="w-full" style={{ minHeight: "65px" }} />;

    const label = item.label || item.selectionName || "";
    const backVal = item.backPrice ?? item.price ?? 0;
    const sizeVal = item.backSize ?? item.size ?? 0;
    const isSuspend = !isItemOpen(item);
    const pnl = getRunnerPnl(item);
    const isSelected = String(activeSid) === String(item.selectionId);

    return (
      <div
        onClick={(e) => handleClick(e, item)}
        className={`flex shadow-md overflow-hidden px-2 relative w-full ${isSuspend
            ? "cursor-not-allowed"
            : "cursor-pointer hover:scale-[1.02]"
          } ${isSelected ? "" : ""}`}
        style={{
          background: getGradient(label),
          borderRadius: "10px",
          minHeight: "65px",
          transition: "transform 0.15s ease",
        }}
      >
        {isSuspend && (
          <div className="absolute inset-0 bg-[#00000099] flex items-center justify-center z-10">
            <FaLock size={18} color="white" />
          </div>
        )}

        {/* Rate & Size */}
        <div className="flex flex-col justify-center py-1 min-w-[55px]">
          <span className="font-bold text-center text-[13px] md:text-[14px] text-black">
            {backVal}
          </span>
          <span className="text-[11px] md:text-[12px] text-center text-black">
            {sizeVal}
          </span>
        </div>

        {/* Dashed Vertical Divider */}
        <div className="self-stretch border-l-[2.5px] border-dashed border-black mx-1" />

        {/* Runner Title & PnL Preview */}
        <div className="flex-1 flex flex-col items-center justify-center px-1 py-1">
          <span className={`font-bold text-[13px] md:text-[15px] whitespace-nowrap tracking-wide ${isSelected ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" : "text-black"}`}>
            {label.toUpperCase()}
          </span>

          {pnl !== 0 && (
            <span
              className="text-[12px] md:text-[13px] font-bold tracking-tight mt-[1px]"
              style={{ color: pnl > 0 ? "#118a11" : "#cc0000" }}
            >
              {pnl > 0 ? formatPnl(pnl) : `(${formatPnl(pnl)})`}
            </span>
          )}
        </div>
      </div>
    );
  };

  /* ================= ROW ================= */
  const renderRow = ({ left, right }, idx) => {
    const isLeftActive =
      left && String(left.selectionId) === String(activeSid);
    const isRightActive =
      right && String(right.selectionId) === String(activeSid);
    const activeItem = isLeftActive ? left : isRightActive ? right : null;
    const isActiveOpen = activeItem && isItemOpen(activeItem);

    return (
      <div key={idx} className="w-full flex flex-col gap-3">
        <div className="flex w-full">
          <div className="w-[50%] pr-4 border-[#c7c8ca]">
            {renderSingleCard(left)}
          </div>
          <div className="w-[50%] pl-4">{renderSingleCard(right)}</div>
        </div>

        {activeItem && isActiveOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#d3edd0]"
            style={{
              position: "relative",
              zIndex: 2,
              marginLeft: "-16px",
              marginRight: "-16px",
            }}
          >
            <BetBox
              isCasino={true}
              betBoxBgColor="#d3edd0"
              sportName="Casino"
              sportId={1000}
              competitionId="casino"
              marketId={marketId}
              mid={marketId}
              market="runs"
              markettype="Casino"
              selectionId={activeItem.selectionId}
              selection={activeItem.label || activeItem.selectionName || ""}
              selectedOdds={selfSelectedOdds}
              setActiveBet={(bet) => {
                if (!bet) {
                  setActiveSid(null);
                  setSelfSelectedOdds(0);
                }
              }}
              eventNames="ballbyball"
              eventId={gameId}
              suspendNow={selfSelectedOdds === 0 ? "aura-suspended" : ""}
              runners={runners}
              min={min}
              max={max}
            />
          </div>
        )}
      </div>
    );
  };

  /* ================= RENDER ================= */
  return (
    <div
      className="w-full relative"
      style={{
        backgroundImage:
          "linear-gradient(90deg, #82dda6cc, #82ddb059 49%, #82dda6cc)",
      }}
    >
      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-[#c7c8ca] z-0" />

      <div className="flex text-center bg-[#ededed] border-b border-[#c7c8ca]">
        <div className="h-[28px] text-[14px] w-[50%] font-bold">Back</div>
        <div className="h-[28px] text-[14px] w-[50%] font-bold">Back</div>
      </div>

      <div className="flex flex-col w-full px-4 py-3 gap-3">
        {rows.map((row, idx) => renderRow(row, idx))}
      </div>
    </div>
  );
};

export default Card;