import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoLockClosed } from "react-icons/io5";
import { handleOpenPlaceBet } from "../../../redux/slices/placeBetSlice";
import PlaceBet from "../../../NprSrc/AuraExchangeSrc/components/PlaceBet";

// Tabs
const TABS = [
  { key: "dragon", label: "Dragon" },
  { key: "tiger", label: "Tiger" },
  { key: "lion", label: "Lion" },
];

// Styles
const sectionDivider = "h-[4px] bg-[#19232a] w-full";
const boardBg = "bg-[#3c444b85]";
const pageBg = "#2e3438";
const cardBorder = "border border-[#a48f2c]";

// Negative market set (match original component behavior)
const NEG_MARKETS = ["DRAGON-CARDS", "TIGER-CARDS", "LION-CARDS", "DRAGON-COLOR", "TIGER-COLOR", "LION-COLOR","DRAGON-ODD-EVEN", "TIGER-ODD-EVEN", "LION-ODD-EVEN","WINNER"];

// Cards
const CARD_IMG_MAP = {
  A: "../../cards/A.webp",
  "2": "../../cards/2.webp",
  "3": "../../cards/3.webp",
  "4": "../../cards/4.webp",
  "5": "../../cards/5.webp",
  "6": "../../cards/6.webp",
  "7": "../../cards/7.webp",
  "8": "../../cards/8.webp",
  "9": "../../cards/9.webp",
  "10": "../../cards/10.webp",
  J: "../../cards/J.webp",
  Q: "../../cards/Q.webp",
  K: "../../cards/K.webp",
};
const getCardSrc = (rank) =>
  CARD_IMG_MAP[String(rank).toUpperCase()] || CARD_IMG_MAP["A"];

// Dual P/L badges (separate Profit and Loss aggregates)
const PLBadges = ({ profit, loss }) => {
  const p = Number(profit || 0);
  const l = Number(loss || 0);
  const showP = Number.isFinite(p) && p > 0;
  const showL = Number.isFinite(l) && l > 0;

  if (!showP && !showL) return null;

  return (
    <div className="flex items-center gap-1">
      {showP && (
        <div className="text-[10px] font-semibold text-green-600">
          P {p}
        </div>
      )}
      {showL && (
        <div className="text-[10px] font-semibold text-red-600">
          L {l}
        </div>
      )}
    </div>
  );
};

// Reusable row with inline drawer + dual P/L badges + active preview
const BetRow = ({
  labelKey,
  label,
  amount,
  locked,
  onClickRight,
  showDrawer,
  payload,
  plProfit,
  plLoss,
  combinedPL, // signed combined preview (baseline + delta) or null
}) => (
  <div className="w-full">
    <div className="grid grid-cols-[1fr_150px] items-stretch gap-0 px-0">
      <div className="flex justify-between items-center w-full bg-[#3c444b85] px-3 py-2 rounded-l-[3px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2">{label}</div>
        <div className="flex items-center gap-2">
          <PLBadges profit={plProfit} loss={plLoss} />
          {combinedPL !== null && (
            <div className={`text-[10px] font-semibold ${Number(combinedPL) > 0 ? "text-green-600" : "text-red-600"}`}>
              {Math.abs(Number(combinedPL))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={locked ? undefined : onClickRight}
        disabled={locked}
        className={`relative flex items-center justify-center border border-[#66a9e7] rounded-r-[3px] bg-transparent transition
          ${
            locked
              ? "cursor-not-allowed opacity-80"
              : "hover:bg-[#66a9e7]/10 cursor-pointer"
          }`}
        style={{ height: 54 }}
      >
        <span className="text-[16px] font-semibold text-[#dfe7ec]">
          {amount || "—"}
        </span>
        {locked && (
          <div className="absolute inset-0 bg-black/35 grid place-items-center rounded-r-[3px]">
            <IoLockClosed size={22} className="text-white/95" />
          </div>
        )}
      </button>
    </div>

    {showDrawer && payload && (
      <div className="bg-[#1e2428] px-2 py-2">
        <PlaceBet
          {...payload}
          onMarginsChange={({ favourMargin, againstMargin }) => {
            // Live-update preview margins in parent payload
            payload.setActiveBet &&
              payload.setActiveBet((prev) =>
                prev
                  ? { ...prev, favourMargin: Number(favourMargin || 0), againstMargin: Number(againstMargin || 0) }
                  : {
                      selectionId: payload.selectionId,
                      type: payload.betType || "Back",
                      favourMargin: Number(favourMargin || 0),
                      againstMargin: Number(againstMargin || 0),
                    }
              );
          }}
        />
      </div>
    )}

    <div className="h-[4px] bg-[#19232a] w-full" />
  </div>
);

const FullMarketCards4 = ({
  title,
  currentTab,
  onChangeTab,
  optionsByTab = {},
  cardsByTab = {},
  eventId,
  eventNames,
  isSuspended,
  min,
  max,
}) => {
  const dispatch = useDispatch();
  const placedBets = useSelector((state) => state.account?.bets) || [];

  const [activeTab, setActiveTab] = useState(currentTab || "dragon");
  const [inlinePayload, setInlinePayload] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cardPayload, setCardPayload] = useState(null);
  const [activeBet, setActiveBet] = useState(null); // preview delta like in original

  // Sync controlled tab
  useEffect(() => {
    if (currentTab && currentTab !== activeTab) setActiveTab(currentTab);
  }, [currentTab]);

  const displayedOptions = useMemo(
    () => (optionsByTab?.[activeTab] || []).map((o) => ({ ...o })),
    [optionsByTab, activeTab]
  );

  const displayedCards = useMemo(
    () => (cardsByTab?.[activeTab] || []).map((c) => ({ ...c })),
    [cardsByTab, activeTab]
  );

  // Ensure options have identity fields used by calc
  const normalizedOptions = useMemo(() => {
    return (displayedOptions || []).map((opt, index) => ({
      ...opt,
      selectionId: opt.selectionId,
      label: opt.label,
      marketId: opt.marketId,
      mid: opt.mid,
      market: String(opt.market || "").toUpperCase(), // normalize
      odds: opt.odds ?? 0,
      value: opt.value ?? 0,
      gstatus: opt.gstatus,
      min: opt.min,
      max: opt.max,
      eventId: eventId,
      index,
    }));
  }, [displayedOptions]);

  // Normalize cards and use a stable market label per tab
  const normalizedCards = useMemo(() => {
    const baseIndex = normalizedOptions.length;
    const marketName = `${activeTab.toUpperCase()}-CARD`;
    return (displayedCards || []).map((card, i) => ({
      ...card,
      selectionId: card.selectionId ?? card.sid,
      sid: card.selectionId ?? card.sid,
      label: card.label,
      marketId: card.marketId ?? card.mid,
      mid: card.mid ?? card.marketId,
      market: marketName,
      odds: card.odds ?? card.value ?? 0,
      value: card.value ?? card.odds ?? 0,
      gstatus: card.gstatus,
      min: card.min,
      max: card.max,
      eventId: eventId,
      index: baseIndex + i,
    }));
  }, [displayedCards, normalizedOptions.length, activeTab]);

  // quick lookup by lowercased label
  const labelMap = useMemo(() => {
    const m = {};
    (normalizedOptions || []).forEach((o) => {
      if (o && o.label) m[String(o.label).toLowerCase().trim()] = o;
    });
    return m;
  }, [normalizedOptions]);

  // Runners for PlaceBet
  const runners = useMemo(() => {
    const optionRunners = normalizedOptions.map((opt) => ({
      sid: opt.selectionId,
      selectionId: opt.selectionId,
      sectionId: opt.selectionId,
      name: opt.label,
      odds: opt.odds || 0,
      value: opt.value || 0,
      index: opt.index,
      eventId: eventId,
    }));

    const cardRunners = normalizedCards.map((card) => ({
      sid: card.selectionId,
      selectionId: card.selectionId,
      sectionId: card.selectionId,
      name: card.label,
      odds: card.odds || 0,
      value: card.value || 0,
      index: card.index,
      eventId: eventId,
    }));

    return [...optionRunners, ...cardRunners];
  }, [normalizedOptions, normalizedCards]);

  // Core P/L calculator: returns signed net (stringified earlier; convert to number here)
  const calculatePLDetail = useCallback(
    (opt) => {
      const filteredBets = placedBets.filter(
        
        (pb) =>{
          return(pb.marketId === opt.marketId &&
          pb.matchId?.toString() === opt.eventId?.toString() &&
          pb.roundId?.toString() === opt.mid?.toString())}
      );

      const fbOfThisRunner = filteredBets.filter(
        (fb) => fb.selectionId.toString() === opt.selectionId.toString()
      );
      

      const fbOfOtherRunners = filteredBets.filter(
        (fb) => fb.selectionId.toString() !== opt.selectionId.toString()
      );
      // console.log("Filtered bets of this runner:", fbOfThisRunner, fbOfOtherRunners);

      const negativeMarkets = ["FLUSH", "STRAIGHT", "TRIO", "STRAIGHT FLUSH"];
      const isNegativeMarket = negativeMarkets.includes(opt.market);

      const total =
        fbOfThisRunner.reduce((acc, fbr) => {
          if (isNegativeMarket) {
            return acc + (fbr.type === "Back" ? Number(fbr.againstMargin) : -Number(fbr.favourMargin));
          } else {
            return acc + (fbr.type === "Back" ? Number(fbr.favourMargin) : -Number(fbr.againstMargin));
          }
        }, 0) +
        fbOfOtherRunners.reduce((acc, fbor) => {
          if (isNegativeMarket) {
            return acc + (fbor.type === "Back" ? -Number(fbor.favourMargin) : Number(fbor.againstMargin));
          } else {
            return acc + (fbor.type === "Back" ? -Number(fbor.againstMargin) : Number(fbor.favourMargin));
          }
        }, 0);

      const netSigned = isNegativeMarket ? -Number(total) : Number(total);
      return Number(netSigned.toFixed(0));
    },
    [placedBets, eventId]
  );

  // Baseline P/L presented as separate P and L
  const getShownPLDetail = (opt) => {
    const baseNet = Number(calculatePLDetail(opt) || 0);
    const profitSum = baseNet > 0 ? baseNet : 0;
    const lossSum = baseNet < 0 ? Math.abs(baseNet) : 0;
    return { net: baseNet, profitSum, lossSum };
  };

  // Active preview delta (same logic as your other component)
  const computeActiveDelta = useCallback((runnerSelId) => {
    if (!activeBet) return null;
    const sameRunner = String(runnerSelId) === String(activeBet.selectionId);
    if (sameRunner && activeBet.type === "Back") return Number(activeBet.favourMargin || 0);
    if (sameRunner && activeBet.type === "Lay") return Number(activeBet.againstMargin || 0);
    if (!sameRunner && activeBet.type === "Back") return Number(activeBet.againstMargin || 0);
    if (!sameRunner && activeBet.type === "Lay") return Number(activeBet.favourMargin || 0);
    return null;
  }, [activeBet]);

  // Open bet for main options
  const openBetDrawer = (opt) => {
    if (!opt) return;
    setIsDrawerOpen(true);

    let market = opt.market;
    let selection = opt.label;
    if (opt.market === "WINNER") {
      market = "WINNER";
      selection = `${activeTab.toUpperCase()}`;
    }

    const payload = {
      sportName: "Casino",
      sportId: 1000,
      competitionId: opt.marketId,
      marketId: opt.marketId,
      market,
      markettype: "Casino",
      selectionId: opt.selectionId ?? opt.sid,
      selection,
      selectedOdds: opt.odds ?? opt.back?.odds ?? opt.value ?? 0,
      betType: "Back",
      eventNames,
      eventId,
      runners,
      mid: opt.mid,
      min: opt.min ?? min,
      max: opt.max ?? max,
      disableOdds: true,
      setActiveBet,
    };

    setActiveBet({
      selectionId: payload.selectionId,
      type: "Back",
      favourMargin: 0,
      againstMargin: 0,
    });

    setInlinePayload(payload);
    dispatch(handleOpenPlaceBet({ ...payload, betBoxBgColor: "red" }));
  };

  // Open bet for cards
  const openCardBet = (cardOpt) => {
    if (!cardOpt) return;

    const payload = {
      sportName: "Casino",
      sportId: 1000,
      competitionId: cardOpt.marketId,
      marketId: cardOpt.marketId,
      market: `${activeTab.toUpperCase()}-CARD`,
      markettype: "Casino",
      selectionId: cardOpt.selectionId,
      selection: cardOpt.label,
      selectedOdds: cardOpt.odds ?? cardOpt.value ?? 0,
      betType: "Back",
      eventNames,
      eventId,
      runners,
      mid: cardOpt.mid,
      min: cardOpt.min ?? min,
      max: cardOpt.max ?? max,
      disableOdds: true,
      setActiveBet,
    };

    setActiveBet({
      selectionId: payload.selectionId,
      type: "Back",
      favourMargin: 0,
      againstMargin: 0,
    });

    setCardPayload(payload);
    dispatch(handleOpenPlaceBet({ ...payload, betBoxBgColor: "red" }));
  };

  const handleTab = (key) => {
    setActiveTab(key);
    setIsDrawerOpen(false);
    setInlinePayload(null);
    setCardPayload(null);
    setActiveBet(null);
    onChangeTab && onChangeTab(key);
  };

  useEffect(() => {
    if (isSuspended === true) {
      setIsDrawerOpen(false);
      setInlinePayload(null);
      setCardPayload(null);
      setActiveBet(null);
    }
  }, [isSuspended]);

  useEffect(() => {
    const mainOptions = ["winner", "red", "black", "odd", "even"];
    const shouldClose = mainOptions.some((key) => {
      const opt = labelMap[key];
      return opt && String(opt.gstatus ?? "1") !== "1";
    });

    if (shouldClose) {
      setIsDrawerOpen(false);
      setInlinePayload(null);
      setCardPayload(null);
      setActiveBet(null);
    }
  }, [normalizedOptions, labelMap]);

  const isLockedByLabel = (labelKey) => {
    if (isSuspended) return true;
    const opt =
      labelMap[String(labelKey || "").toLowerCase().trim()] || null;
    if (!opt) return true;
    if (String(opt.gstatus ?? "0") !== "1") return true;
    return false;
  };

  return (
    <div className="w-full overflow-hidden" style={{ backgroundColor: pageBg }}>
      {/* Tabs */}
      <div className="relative">
        <div className="flex items-center bg-[#3c444b85] text-[#d7e0e6]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTab(t.key)}
              className={`flex-1 py-3 text-[16px] font-medium ${
                activeTab === t.key ? "text-white" : "text-[#c8d2d8]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="h-[3px] bg-transparent relative">
          <div
            className="absolute h-[3px] bg-[#ffd32a] transition-all duration-200"
            style={{
              width: "33.3333%",
              left:
                activeTab === "dragon"
                  ? "0%"
                  : activeTab === "tiger"
                  ? "33.3333%"
                  : "66.6666%",
            }}
          />
        </div>
        <div className={sectionDivider} />
      </div>

      {/* Main bet rows */}
      <div className={`${boardBg} relative overflow-hidden`}>
        {["winner", "red", "black", "odd", "even"].map((key) => {
          const opt = labelMap[key];

          const { profitSum, lossSum, net } = opt
            ? getShownPLDetail(opt)
            : { profitSum: 0, lossSum: 0, net: 0 };

          // Combined preview (baseline + active delta) if any
          const selId = opt?.selectionId ?? "";
          const delta = selId ? computeActiveDelta(selId) : null;
          const combinedPL = delta !== null ? Number(net || 0) + Number(delta) : null;

          return (
            <BetRow
              key={key}
              labelKey={key}
              label={
                key === "red" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[22px]">❤️</span>
                    <span className="text-[22px]">♦️</span>
                  </div>
                ) : key === "black" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[22px]">♣️</span>
                    <span className="text-[22px]">♠️</span>
                  </div>
                ) : (
                  <span className="text-[14px] font-semibold text-[#b9c3c9]">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                )
              }
              amount={opt?.odds ?? "—"}
              locked={isLockedByLabel(key)}
              onClickRight={() => {
                openBetDrawer(opt);
                setIsDrawerOpen(key);
              }}
              showDrawer={isDrawerOpen === key}
              payload={inlinePayload && isDrawerOpen === key ? inlinePayload : null}
              plProfit={profitSum}
              plLoss={lossSum}
              combinedPL={combinedPL}
            />
          );
        })}
      </div>

      {/* Cards */}
      <div className={sectionDivider} />
      <div className={`${boardBg}`}>
        <div className="w-full flex justify-center py-2">
          <span className="text-[18px] font-semibold text-[#cdd6dc]">Cards</span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center items-center px-3 pb-4">
          {normalizedCards.map((c, i) => {
            const src = getCardSrc(c.label);
            const locked = isSuspended || String(c.gstatus ?? "0") !== "1";

            const { profitSum, lossSum, net } = getShownPLDetail(c);

            const delta = computeActiveDelta(c.selectionId);
            const combined = delta !== null ? Number(net || 0) + Number(delta) : null;

            return (
              <div
                key={`tabcard-${c.selectionId}-${i}`}
                className={`w-[56px] h-[80px] ${cardBorder} bg-[#0f151a] relative overflow-hidden rounded-[2px] ${
                  !locked ? "cursor-pointer" : ""
                }`}
                onClick={() => !locked && openCardBet(c)}
              >
                <img
                  src={src}
                  alt={`card-${c.label}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Dual P & L corner badges; stack vertically if both exist */}
                {(profitSum > 0 || lossSum > 0) && (
                  <div className="absolute bottom-1 right-1 flex flex-col items-end gap-[2px] bg-black/0">
                    {profitSum > 0 && (
                      <div className="px-1 py-[1px] rounded text-[10px] font-semibold text-green-500 bg-black/40">
                        P {profitSum}
                      </div>
                    )}
                    {lossSum > 0 && (
                      <div className="px-1 py-[1px] rounded text-[10px] font-semibold text-red-500 bg-black/40">
                        L {lossSum}
                      </div>
                    )}
                  </div>
                )}

                {/* Combined preview badge */}
                {combined !== null && (
                  <div
                    className={`absolute top-1 right-1 px-1 py-[1px] rounded text-[10px] font-semibold ${
                      Number(combined) > 0 ? "text-green-500" : "text-red-500"
                    } bg-black/40`}
                  >
                    {Math.abs(Number(combined))}
                  </div>
                )}

                {locked && (
                  <div className="absolute inset-0 grid place-items-center bg-black/35">
                    <IoLockClosed className="text-white drop-shadow" size={18} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* PlaceBet shown after card click */}
        {cardPayload && (
          <div className="flex justify-center pb-4">
            <PlaceBet
              {...cardPayload}
              onMarginsChange={({ favourMargin, againstMargin }) => {
                cardPayload.setActiveBet &&
                  cardPayload.setActiveBet((prev) =>
                    prev
                      ? { ...prev, favourMargin: Number(favourMargin || 0), againstMargin: Number(againstMargin || 0) }
                      : {
                          selectionId: cardPayload.selectionId,
                          type: cardPayload.betType || "Back",
                          favourMargin: Number(favourMargin || 0),
                          againstMargin: Number(againstMargin || 0),
                        }
                  );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FullMarketCards4;
