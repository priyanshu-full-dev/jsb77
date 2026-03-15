// FullMarketCards5.jsx (no-gap drawer + reliable H re-select + active bet P/L overlay)

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleOpenPlaceBet } from "../../../AsianExchangeSrc/redux/slices/placeBetSlice";
import PlaceBet from "../../../AuraExchangeSrc/components/PlaceBet";

// Typography
const FS_LABEL = "text-[12px]";
const FS_ODDS = "text-[12px]";
const FS_VALUE = "text-[11px]";
const FS_HEAD = "text-[12px]";
const FS_BADGE = "text-[10px]";
const FS_ROW_LABEL = "text-[11px]";

// Nation map
const NATION_MAP = {
  Amar: "AMAR",
  Akbar: "AKBAR",
  Anthony: "ANTHONY",
  Odd: "ODD",
  Even: "EVEN",
  Red: "RED",
  Black: "BLACK",
  "Under 7": "UNDER 7",
  "Over 7": "OVER 7",
  "Card A": "A",
  "Card 2": "2",
  "Card 3": "3",
  "Card 4": "4",
  "Card 5": "5",
  "Card 6": "6",
  "Card 7": "7",
  "Card 8": "8",
  "Card 9": "9",
  "Card 10": "10",
  "Card J": "J",
  "Card Q": "Q",
  "Card K": "K",
};

const SectionHeader = ({ title }) => (
  <div className="px-0.5 border border-gray-200">
    <div
      className="text-white flex justify-between items-center h-[26px] px-2 rounded-t-sm"
      style={{ background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)" }}
    >
      <span className={`${FS_HEAD} font-semibold uppercase`}>{title}</span>
    </div>
  </div>
);

const PriceHeader = ({ min, max, isCardRow = false }) => (
  <div
    className={`grid border-b border-[#7e97a7] font-bold bg-[#e6e6e6] ${isCardRow ? "grid-cols-[60%_40%]" : "grid-cols-[60%_20%_20%]"}`}
  >
    <div className="px-1 py-1">
      <div className={`${FS_BADGE} bg-[#bed5d8] px-2 py-1 rounded`}>
        Min/Max: {min}-{max}
      </div>
    </div>
    <div className="bg-[#72bbef] text-[12px] p-1 text-center border-l border-[#7e97a7]">Back</div>
    {!isCardRow && (
      <div className="bg-[#f9c9d4] text-[12px] p-1 text-center border-l border-[#7e97a7]">Lay</div>
    )}
  </div>
);

const MiniTitle = ({ title }) => (
  <div className="px-0.5 border border-gray-200">
    <div
      className="text-white flex justify-between items-center h-[26px] px-2 rounded-t-sm"
      style={{ background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)" }}
    >
      <span className={`${FS_HEAD} font-semibold uppercase`}>{title}</span>
    </div>
  </div>
);

const SectionWithOverlay = ({ children, suspended }) => (
  <div className="relative mb-2">
    {children}
    {suspended && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none z-10 border border-red-600">
        <span className="text-red-600 font-bold text-xl tracking-wide">SUSPENDED</span>
      </div>
    )}
  </div>
);

// Small P/L badges block
const PLBadges = ({ profit, loss }) => {
  const p = Number(profit || 0);
  const l = Number(loss || 0);
  const showP = Number.isFinite(p) && p > 0;
  const showL = Number.isFinite(l) && l > 0;
  if (!showP && !showL) return null;
  return (
    <div className="flex items-center gap-2">
      {showP ? <span className={`${FS_BADGE} font-semibold text-green-600`}>P {p}</span> : null}
      {showL ? <span className={`${FS_BADGE} font-semibold text-red-600`}>L {l}</span> : null}
    </div>
  );
};

// Drawer: no gap on close
const Drawer = ({ open, children }) => (
  <div
    className={[
      "overflow-hidden transition-[max-height] duration-200 ease-out",
      open ? "max-h-[1200px] py-2 px-2 bg-[#1e2428]" : "max-h-0 py-0 px-0"
    ].join(" ")}
  >
    {children}
  </div>
);

// OptionRow with extraPL support (combined P/L preview)
const OptionRow = ({
  label,
  odds,
  icons,
  image,
  lockedBack,
  lockedLay,
  onBack,
  onLay,
  showDrawer,
  placeBetPayload,
  isCardRow = false,
  plProfit = 0,
  plLoss = 0,
  extraPL = null,
}) => {
  const cellStyle = (active, isBack) => ({
    backgroundColor: isBack ? (active ? "#1a8ee1" : "#72bbef") : (active ? "#f4496d" : "#f9c9d4"),
    color: active ? "#ffffff" : "black",
    boxShadow: active ? "inset 0 1px 3px #00000066" : "none",
    cursor: "pointer",
  });

  return (
    <div className="border-b border-[#7e97a7]">
      <div className={`grid ${isCardRow ? "grid-cols-[60%_40%]" : "grid-cols-[60%_20%_20%]"}`}>
        <div className="p-2 font-semibold col-span-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {icons && icons.map((icon, i) => <span key={i} className={FS_ROW_LABEL}>{icon}</span>)}
              {image && <img src={image} alt={label} className="w-6 h-8 object-contain" />}
              {!image && <span className={FS_ROW_LABEL}>{label}</span>}
            </div>
            <div className="flex items-center gap-2">
              <PLBadges profit={plProfit} loss={plLoss} />
              {extraPL !== null && (
                <span
                  className={`${FS_BADGE} font-semibold ${Number(extraPL) > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {Math.abs(Number(extraPL))}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={lockedBack}
          className={`flex flex-col justify-center items-center border-l border-[#7e97a7] py-1.5 ${lockedBack ? "opacity-60 cursor-not-allowed" : ""}`}
          style={cellStyle(false, true)}
          onClick={lockedBack ? undefined : onBack}
        >
          <span className="font-bold leading-none">{odds?.back?.odds ?? "-"}</span>
          <span className={`${FS_BADGE} leading-none mt-0.5`}>{odds?.back?.value ?? "-"}</span>
        </button>

        {!isCardRow && (
          <button
            type="button"
            disabled={lockedLay}
            className={`flex flex-col justify-center items-center border-l border-[#7e97a7] py-1.5 ${lockedLay ? "opacity-60 cursor-not-allowed" : ""}`}
            style={cellStyle(false, false)}
            onClick={lockedLay ? undefined : onLay}
          >
            <span className="font-bold leading-none">{odds?.lay?.odds ?? "-"}</span>
            <span className={`${FS_BADGE} leading-none mt-0.5`}>{odds?.lay?.value ?? "-"}</span>
          </button>
        )}
      </div>

      {!!(showDrawer && placeBetPayload) && (
        <Drawer open={!!(showDrawer && placeBetPayload)}>
          {placeBetPayload && <PlaceBet {...placeBetPayload} onMarginsChange={({ favourMargin, againstMargin }) => {
            // keep live margins for active bet preview
            // PlaceBet should call this when stake changes to compute margins
            // ensure payload keeps fresh reference
            placeBetPayload._tsLive = Date.now();
          }} />}
        </Drawer>
      )}
    </div>
  );
};

// Color/ODD/OVER tiles (2 per column)
const Tile = ({ bg, children, onClick, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`w-full h-[70px] md:h-[110px] flex flex-col items-center justify-center text-white font-bold ${disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
    style={{ background: bg, boxShadow: "inset 0 1px 3px #00000033" }}
  >
    {children}
  </button>
);

const TileColumn = ({ title, min, max, items, onTile, locked, plForTile, isSuspended, horizontalData, activeBet, computeNewCalc }) => (
  <div className="gap-1 rounded-sm border-r border-gray-400">
    <MiniTitle title={title} />
    <SectionWithOverlay suspended={isSuspended || horizontalData.suspended}>
      <div className="bg-[#e6e6e6] border-b border-[#7e97a7] p-1">
        <div className={`${FS_BADGE} bg-[#bed5d8] font-bold px-2 py-1 rounded`}>Min/Max: {min}-{max}</div>
      </div>

      <div className="grid grid-rows-2 p-0">
        {[0, 1].map((ix) => {
          const it = items[ix];
          const bg = ix === 0 ? "linear-gradient(180deg,#9c2b2f 0%, #7f1d21 60%)" : "linear-gradient(180deg,#2b7ec1 0%, #0f5fa7 70%)";
          const pl = plForTile?.(it) || { profitSum: 0, lossSum: 0 };
          const baselineNet = pl.profitSum > 0 ? pl.profitSum : (pl.lossSum > 0 ? -pl.lossSum : 0);
          const selId = it?.rec?.sid || it?.label;
          const delta = computeNewCalc(selId, activeBet, baselineNet);

          return (
            <Tile key={ix} disabled={locked} bg={bg} onClick={() => !locked && onTile(it, { title, min, max })}>
              {title !== "COLOR" && <div className={FS_LABEL}>{it.label}</div>}
              {title === "COLOR" && it.icons && (
                <div className=" leading-none">
                  {it.icons.map((i, k) => (
                    <span key={k} className={`${FS_LABEL} ${i === "♥" || i === "♦" ? (ix === 0 ? "text-red-500" : "text-red-300") : "text-black"}`}>{i} </span>
                  ))}
                </div>
              )}
              <div className={`${FS_ODDS}`}>{it.oddsObj?.back?.odds ?? "-"}</div>
              <div className={`${FS_VALUE} font-semibold opacity-95`}>{it.oddsObj?.back?.value ?? "-"}</div>
              <div className="flex items-center gap-2">
                <PLBadges profit={pl.profitSum} loss={pl.lossSum} />
                {delta !== null && (
                  <span className={`${FS_BADGE} font-semibold ${baselineNet + Number(delta) > 0 ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(baselineNet + Number(delta))}
                  </span>
                )}
              </div>
            </Tile>
          );
        })}
      </div>
    </SectionWithOverlay>
  </div>
);

const HorizontalPlaceBet = ({ columns, activeItem, payload, onReSelect }) => {
  if (!activeItem || !payload) return null;
  return (
    <div className="border-t border-[#7e97a7] bg-[#1e2428]">
      <div className="grid grid-cols-3">
        {columns.map((col) => (
          <div key={col.title} className="border-r last:border-r-0 border-[#7e97a7]">
            <MiniTitle title={col.title} />
            <div className="bg-[#e6e6e6] border-b border-[#7e97a7] p-1">
              <div className={`${FS_BADGE} bg-[#bed5d8] font-bold px-2 py-1 rounded text-center`}>
                Min/Max {col.min}-{col.max}
              </div>
            </div>
            <div className="grid grid-rows-2">
              {col.items.map((item, idx) => (
                <Tile
                  key={idx}
                  disabled={false}
                  onClick={() => onReSelect?.(item, col)}
                  bg={idx === 0 ? "linear-gradient(180deg,#9c2b2f 0%, #7f1d21 60%)" : "linear-gradient(180deg,#2b7ec1 0%, #0f5fa7 70%)"}
                >
                  {col.title !== "COLOR" && <div className={FS_LABEL}>{item.label}</div>}
                  {col.title === "COLOR" && item.icons && (
                    <div className="mt-1 leading-none">
                      {item.icons.map((i, ix) => (
                        <span key={ix} className={`${FS_LABEL} ${i === "♥" || i === "♦" ? (idx === 0 ? "text-red-500" : "text-red-300") : "text-black"}`}>{i} </span>
                      ))}
                    </div>
                  )}
                  <div className={`${FS_ODDS} mt-1`}>{item.oddsObj?.back?.odds ?? "-"}</div>
                  <div className={`${FS_VALUE} font-semibold opacity-95`}>{item.oddsObj?.back?.value ?? "-"}</div>
                </Tile>
              ))}
            </div>
          </div>
        ))}
      </div>
      <PlaceBet {...payload} onMarginsChange={({ favourMargin, againstMargin }) => {
        // If your PlaceBet can call this, wire it to update external state upstream as needed
      }} />
    </div>
  );
};

// Build unified 'opt'
const toOpt = ({ marketId, market, mid, selectionId, odds, value, min, max,eventId }) => ({
  marketId: String(marketId ?? ""),
  market: String(market ?? "").toUpperCase(),
  mid: String(mid ?? ""),
  selectionId: String(selectionId ?? ""),
  odds: Number(odds ?? 0),
  value: Number(value ?? 0),
  min: Number(50),
  max: Number(25000),
  eventId: String(eventId ?? ""),
});

// Poker negative markets
const NEGATIVE_POKER = ["FLUSH", "STRAIGHT", "TRIO", "STRAIGHT FLUSH"];

const FullMarketCards5 = ({ eventId, eventNames, isSuspended, data = [] }) => {
  const dispatch = useDispatch();
  const placedBets = useSelector((s) => s.account?.bets || []);

  const [inlinePayload, setInlinePayload] = useState(null);
  const [activeRowKey, setActiveRowKey] = useState(null);

  // Normalize data
  const dataMap = useMemo(() => {
    const map = {};
    (data || []).forEach((item) => {
      const key = NATION_MAP[item.nation] || item.nation?.toUpperCase?.() || item.nation;
      map[key] = {
        ...item,
        back: { odds: Number(item.b1) || 0, value: Number(item.bs1) || 0 },
        lay: { odds: Number(item.l1) || 0, value: Number(item.ls1) || 0 },
        suspended: item.gstatus !== "ACTIVE",
        gstatus: item.gstatus,
        min: Number(50) || 50,
        max: Number(25000) || 25000,
        mid: item.mid ?? "",
        sid: item.sid ?? (NATION_MAP[item.nation] || item.nation?.toUpperCase?.() || item.nation),
      };
    });
    return map;
  }, [data]);

  // Winner section
  const winnerData = useMemo(() => {
    const amar = dataMap["AMAR"] || {};
    const akbar = dataMap["AKBAR"] || {};
    const anthony = dataMap["ANTHONY"] || {};
    const options = [
      { label: "AMAR ( A,2,3,4,5,6 )", odds: { back: amar.back || {}, lay: amar.lay || {} }, rec: amar, selKey: "AMAR" },
      { label: "AKBAR ( 7,8,9,10 )", odds: { back: akbar.back || {}, lay: akbar.lay || {} }, rec: akbar, selKey: "AKBAR" },
      { label: "ANTHONY ( J,Q,K )", odds: { back: anthony.back || {}, lay: anthony.lay || {} }, rec: anthony, selKey: "ANTHONY" },
    ];
    return {
      title: "WINNER",
      marketId: `${eventId}-WINNER`,
      market: "WINNER",
      min: amar.min || akbar.min || anthony.min || 100,
      max: amar.max || akbar.max || anthony.max || 100000,
      suspended: !!(amar.suspended || akbar.suspended || anthony.suspended),
      options,
      runners: options.map((o, idx) => ({
        sid: o.rec.sid || o.selKey,
        selectionId: o.rec.sid || o.selKey,
        sectionId: o.rec.sid || o.selKey,
        name: o.label,
        index: idx,
      })),
    };
  }, [dataMap, eventId]);

  // Horizontal tiles
  const horizontalData = useMemo(() => {
    const odd = dataMap["ODD"] || {};
    const even = dataMap["EVEN"] || {};
    const red = dataMap["RED"] || {};
    const black = dataMap["BLACK"] || {};
    const under7 = dataMap["UNDER 7"] || {};
    const over7 = dataMap["OVER 7"] || {};
    const minMax = odd.min || even.min || red.min || black.min || under7.min || over7.min || 100;
    const maxMax = odd.max || even.max || red.max || black.max || under7.max || over7.max || 100000;

    const items = [
      { label: "ODD", icons: null, oddsObj: { back: odd.back }, rec: odd, market: "ODD/EVEN", mid: odd.mid },
      { label: "EVEN", icons: null, oddsObj: { back: even.back }, rec: even, market: "ODD/EVEN", mid: even.mid },
      { label: "RED", icons: ["♥", "♦"], oddsObj: { back: red.back }, rec: red, market: "COLOR", mid: red.mid },
      { label: "BLACK", icons: ["♠", "♣"], oddsObj: { back: black.back }, rec: black, market: "COLOR", mid: black.mid },
      { label: "UNDER 7", icons: null, oddsObj: { back: under7.back }, rec: under7, market: "UNDER/OVER", mid: under7.mid },
      { label: "OVER 7", icons: null, oddsObj: { back: over7.back }, rec: over7, market: "UNDER/OVER", mid: over7.mid },
    ];

    return {
      suspended: items.some(i => i.rec?.suspended),
      columns: [
        { title: "ODD/EVEN", min: minMax, max: maxMax, items: [items[0], items[1]], marketId: `${eventId}-ODD/EVEN` },
        { title: "COLOR", min: minMax, max: maxMax, items: [items[2], items[3]], marketId: `${eventId}-COLOR` },
        { title: "UNDER/OVER", min: minMax, max: maxMax, items: [items[4], items[5]], marketId: `${eventId}-UNDER/OVER` },
      ],
      runners: items.map((i, idx) => ({
        sid: i.rec.sid || i.label,
        selectionId: i.rec.sid || i.label,
        sectionId: i.rec.sid || i.label,
        name: i.label,
        index: idx,
      })),
      flat: items,
    };
  }, [dataMap, eventId]);

  // Cards
  const cardsData = useMemo(() => {
    const keys = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const options = keys.map((k) => {
      const rec = dataMap[k] || {};
      return {
        label: k,
        odds: { back: rec.back || {} },
        rec,
        image: `/cards/${k}.webp`,
      };
    });
    return {
      title: "CARDS",
      marketId: `${eventId}-CARDS`,
      market: "CARDS",
      min: (dataMap["A"]?.min) || 100,
      max: (dataMap["A"]?.max) || 5000,
      suspended: options.some(o => o.rec?.suspended),
      options,
      runners: options.map((o, idx) => ({
        sid: o.rec.sid || o.label,
        selectionId: o.rec.sid || o.label,
        sectionId: o.rec.sid || o.label,
        name: o.label,
        index: idx,
      })),
    };
  }, [dataMap, eventId]);

  // All runners
  const runnersAll = useMemo(() => {
    return [
      ...(winnerData.runners || []),
      ...(horizontalData.runners || []),
      ...(cardsData.runners || []),
    ];
  }, [winnerData.runners, horizontalData.runners, cardsData.runners]);

  // P/L calculation
  const calculatePLDetail = useCallback((opt) => {
    const filteredBets = (placedBets || []).filter((pb) => {
      return (
        pb.marketId === opt.marketId &&
          pb.matchId?.toString() === opt.eventId?.toString() &&
          pb.roundId?.toString() === opt.mid?.toString()
      );
    });

    const fbOfThisRunner = filteredBets.filter(
      (fb) => String(fb.selectionId) === String(opt.selectionId)
    );
    const fbOfOtherRunners = filteredBets.filter(
      (fb) => String(fb.selectionId) !== String(opt.selectionId)
    );

    const isNegativeMarket = NEGATIVE_POKER.includes(String(opt.market).toUpperCase());

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

    const netNum = isNegativeMarket ? -Number(total) : Number(total);
    const net = Number(netNum.toFixed(0));
    return {
      net,
      profitSum: net > 0 ? net : 0,
      lossSum: net < 0 ? Math.abs(net) : 0,
    };
  }, [placedBets]);

  // Helpers building 'opt' before P/L
  const getRowPL = (wd, rec, sel) => {
    const opt = toOpt({
      marketId: wd.marketId,
      market: wd.market,
      mid: rec?.mid,
      selectionId: rec?.sid || sel,
      odds: wd?.odds?.back?.odds,
      value: wd?.odds?.back?.value,
      min: wd.min,
      max: wd.max,
      eventId: eventId,
    });
    return calculatePLDetail(opt);
  };

  const getTilePL = (col, item) => {
    const rec = item?.rec || {};
    const opt = toOpt({
      marketId: col.marketId,
      market: col.title,
      mid: rec.mid,
      selectionId: rec.sid || item.label,
      odds: item?.oddsObj?.back?.odds,
      value: item?.oddsObj?.back?.value,
      min: col.min,
      max: col.max,
      eventId: eventId,
    });
    return calculatePLDetail(opt);
  };

  const getCardPL = (cd, label) => {
    const optRec = cd.options.find(o => o.label === label)?.rec || {};
    const opt = toOpt({
      marketId: cd.marketId,
      market: cd.market,
      mid: optRec.mid,
      selectionId: optRec.sid || label,
      odds: optRec?.back?.odds,
      value: optRec?.back?.value,
      min: cd.min,
      max: cd.max,
      eventId: eventId,
    });
    return calculatePLDetail(opt);
  };

  // Active bet helpers (like FullMarketCards)
  const getActiveBet = useCallback(() => {
    if (!inlinePayload) return null;
    return {
      selectionId: String(inlinePayload.selectionId ?? ""),
      type: inlinePayload.betType || "Back",
      favourMargin: Number(inlinePayload.favourMargin || 0),
      againstMargin: Number(inlinePayload.againstMargin || 0),
    };
  }, [inlinePayload]);

  const computeNewCalcForActive = useCallback((runnerSelId, activeBet) => {
    if (!activeBet) return null;
    const sameRunner = String(runnerSelId) === String(activeBet.selectionId);
    if (sameRunner && activeBet.type === "Back") return Number(activeBet.favourMargin || 0);
    if (sameRunner && activeBet.type === "Lay") return Number(activeBet.againstMargin || 0);
    if (!sameRunner && activeBet.type === "Back") return Number(activeBet.againstMargin || 0);
    if (!sameRunner && activeBet.type === "Lay") return Number(activeBet.favourMargin || 0);
    return null;
  }, []);

  // Open Back/Lay on row
  const openRowBet = (market, rec, label, odds, type = "Back", min, max, runners, marketIdOverride) => {
    if (!rec) return;
    const marketId = marketIdOverride || `${eventId}-${market}`;
    const payload = {
      sportName: "Casino",
      sportId: 1000,
      competitionId: eventId,
      marketId,
      market,
      markettype: "Casino",
      selectionId: rec.sid || label,
      selection: label,
      selectedOdds: Number(type === "Back" ? odds?.back?.odds : odds?.lay?.odds) || 0,
      betType: type,
      eventNames,
      eventId,
      runners: runners || runnersAll,
      mid: rec.mid,
      roundId: rec.mid,
      min: min || rec.min || 100,
      max: max || rec.max || 100000,
      disableOdds: true,
      _ts: Date.now(),
    };
    setInlinePayload(payload);
    setActiveRowKey(`WINNER:${market}:${label}`);
    dispatch(handleOpenPlaceBet({ ...payload, betBoxBgColor: type === "Back" ? "#72bbef" : "#f9c9d4" }));
  };

  // Open tile bet (Back only)
  const openTileBet = (item, col) => {
    const rec = item.rec || {};
    const market = col.title;
    const nextKey = `H:${market}:${item.label}`;
    const payload = {
      sportName: "Casino",
      sportId: 1000,
      competitionId: eventId,
      marketId: col.marketId,
      market,
      markettype: "Casino",
      selectionId: rec.sid || item.label,
      selection: item.label,
      selectedOdds: Number(item.oddsObj?.back?.odds) || 0,
      betType: "Back",
      eventNames,
      eventId,
      runners: horizontalData.runners,
      mid: rec.mid,
      roundId: rec.mid,
      min: col.min || rec.min || 100,
      max: col.max || rec.max || 100000,
      disableOdds: true,
      _ts: Date.now(),
    };
    setInlinePayload(payload);
    setActiveRowKey(nextKey);
    dispatch(handleOpenPlaceBet({ ...payload, betBoxBgColor: "#72bbef" }));
  };

  // Open card bet (Back only)
  const openCardBet = (opt) => {
    const rec = opt.rec || {};
    const payload = {
      sportName: "Casino",
      sportId: 1000,
      competitionId: eventId,
      marketId: `${eventId}-CARDS`,
      market: "CARDS",
      markettype: "Casino",
      selectionId: rec.sid || opt.label,
      selection: opt.label,
      selectedOdds: Number(opt.odds?.back?.odds) || 0,
      betType: "Back",
      eventNames,
      eventId,
      runners: cardsData.runners,
      mid: rec.mid,
      roundId: rec.mid,
      min: cardsData.min || rec.min || 100,
      max: cardsData.max || rec.max || 100000,
      disableOdds: true,
      _ts: Date.now(),
    };
    setInlinePayload(payload);
    setActiveRowKey(`CARD:${opt.label}`);
    dispatch(handleOpenPlaceBet({ ...payload, betBoxBgColor: "#72bbef" }));
  };

  // Clear inline when suspended
  useEffect(() => {
    if (isSuspended) {
      setInlinePayload(null);
      setActiveRowKey(null);
    }
  }, [isSuspended]);

  // Auto-close when active selection locks
  useEffect(() => {
    if (!activeRowKey) return;
    const [group, marketOrLabel, maybeLabel] = activeRowKey.split(":");
    let label = maybeLabel ? maybeLabel : marketOrLabel;
    let rec;
    if (group === "WINNER") {
      const opt = winnerData.options.find(o => o.label === label);
      rec = opt?.rec;
    } else if (group === "H") {
      const it = horizontalData.flat.find(i => i.label === label);
      rec = it?.rec;
    } else if (group === "CARD") {
      const opt = cardsData.options.find(o => o.label === label);
      rec = opt?.rec;
    }
    if (!rec) return;
    if (rec.suspended || String(rec.gstatus || "ACTIVE") !== "ACTIVE") {
      setInlinePayload(null);
      setActiveRowKey(null);
    }
  }, [activeRowKey, winnerData, horizontalData, cardsData]);

  const activeBet = getActiveBet();

  return (
    <div className="w-full overflow-hidden relative text-black text-[13px] select-none">
      {/* ---------- WINNER SECTION ---------- */}
      <SectionHeader title={winnerData.title} />
      <SectionWithOverlay suspended={isSuspended || winnerData.suspended}>
        <PriceHeader min={winnerData.min} max={winnerData.max} />
        <div className="grid gap-y-[1px] py-[2px]">
          {winnerData.options.map((opt, idx) => {
            const rec = opt.rec || {};
            const lockedBack =
              isSuspended ||
              winnerData.suspended ||
              !opt.odds?.back?.odds ||
              String(rec.gstatus || "ACTIVE") !== "ACTIVE";
            const lockedLay =
              isSuspended ||
              winnerData.suspended ||
              !opt.odds?.lay?.odds ||
              String(rec.gstatus || "ACTIVE") !== "ACTIVE";

            const isActive = activeRowKey === `WINNER:${winnerData.title}:${opt.label}`;

            const { profitSum, lossSum, net } = getRowPL(
              winnerData,
              rec,
              rec.sid || opt.selKey || opt.label
            );
            const selId = rec.sid || opt.selKey || opt.label;
            const delta = computeNewCalcForActive(selId, activeBet);
            const combined = delta !== null ? Number(net || 0) + Number(delta) : null;

            return (
              <OptionRow
                key={`winner-${idx}-${opt.label}`}
                label={opt.label}
                odds={opt.odds}
                lockedBack={lockedBack}
                lockedLay={lockedLay}
                onBack={() =>
                  openRowBet(
                    "WINNER",
                    rec,
                    opt.label,
                    opt.odds,
                    "Back",
                    winnerData.min,
                    winnerData.max,
                    winnerData.runners,
                    winnerData.marketId
                  )
                }
                onLay={() =>
                  openRowBet(
                    "WINNER",
                    rec,
                    opt.label,
                    opt.odds,
                    "Lay",
                    winnerData.min,
                    winnerData.max,
                    winnerData.runners,
                    winnerData.marketId
                  )
                }
                showDrawer={isActive}
                placeBetPayload={isActive ? inlinePayload : null}
                plProfit={profitSum}
                plLoss={lossSum}
                extraPL={combined}
              />
            );
          })}
        </div>
      </SectionWithOverlay>

      {/* ---------- HORIZONTAL TILE SECTION ---------- */}
      <div className="mt-2">
        {!activeRowKey?.startsWith("H:") && (
          <div className="grid grid-cols-3 border-t border-gray-300">
            {horizontalData.columns.map((col, colIdx) => (
              <TileColumn
                key={`col-${colIdx}-${col.title}`}
                title={col.title}
                min={col.min}
                max={col.max}
                items={col.items}
                locked={isSuspended || horizontalData.suspended}
                onTile={(item) => openTileBet(item, col)}
                plForTile={(item) => getTilePL(col, item)}
                isSuspended={isSuspended}
                horizontalData={horizontalData}
                activeBet={activeBet}
                computeNewCalc={computeNewCalcForActive}
              />
            ))}
          </div>
        )}

        {activeRowKey?.startsWith("H:") && inlinePayload && (
          <HorizontalPlaceBet
            key={activeRowKey}
            columns={horizontalData.columns}
            activeItem={horizontalData.flat.find(
              (i) => `H:${inlinePayload.market}:${inlinePayload.selection}` === activeRowKey
            )}
            payload={{
              ...inlinePayload,
              onMarginsChange: ({ favourMargin, againstMargin }) => {
                setInlinePayload((prev) => prev ? { ...prev, favourMargin, againstMargin, _tsLive: Date.now() } : prev);
              }
            }}
            onReSelect={(item, col) => openTileBet(item, col)}
          />
        )}
      </div>

      {/* ---------- CARDS SECTION ---------- */}
      <div className="mt-2">
        <SectionHeader title={cardsData.title} />
        <SectionWithOverlay suspended={isSuspended || cardsData.suspended}>
          <PriceHeader min={cardsData.min} max={cardsData.max} isCardRow />
          <div className="grid gap-y-[1px] py-[2px]">
            {cardsData.options.map((opt, idx) => {
              const rec = opt.rec || {};
              const lockedBack =
                isSuspended ||
                cardsData.suspended ||
                !opt.odds?.back?.odds ||
                String(rec.gstatus || "ACTIVE") !== "ACTIVE";

              const isActive = activeRowKey === `CARD:${opt.label}`;
              const { profitSum, lossSum, net } = getCardPL(cardsData, opt.label);
              const selId = rec.sid || opt.label;
              const delta = computeNewCalcForActive(selId, activeBet);
              const combined = delta !== null ? Number(net || 0) + Number(delta) : null;

              return (
                <OptionRow
                  key={`card-${idx}-${opt.label}`}
                  label={opt.label}
                  odds={opt.odds}
                  image={opt.image}
                  lockedBack={lockedBack}
                  lockedLay
                  onBack={() => openCardBet(opt)}
                  isCardRow
                  showDrawer={isActive}
                  placeBetPayload={isActive ? inlinePayload : null}
                  plProfit={profitSum}
                  plLoss={lossSum}
                  extraPL={combined}
                />
              );
            })}
          </div>
        </SectionWithOverlay>
      </div>
    </div>
  );
};

export default FullMarketCards5;
