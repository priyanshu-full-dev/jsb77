import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleOpenPlaceBet } from "../../../AsianExchangeSrc/redux/slices/placeBetSlice";
import PlaceBet from "../../../AuraExchangeSrc/components/PlaceBet";

/* Styles */
const FS_LINE_NUMBERS = "text-base";

/* Nation map */
const NATION_MAP = {
  "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
  "6": "6", "7": "7", "8": "8", "9": "9",
  "Line 1": "LINE1", "Line 2": "LINE2", "Odd": "ODD", "Even": "EVEN",
};

const SectionHeader = ({ title }) => (
  <div
    className="text-white flex justify-between items-center h-[34px] px-3"
    style={{ background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)" }}
  >
    <span className="text-sm font-bold uppercase">{title}</span>
  </div>
);

const MinMaxBar = ({ min, max }) => (
  <div className="bg-[#d1d5db] px-3 py-1.5 flex justify-end">
    <span className="text-xs font-semibold text-gray-700">
      Min/Max {min} - {max}
    </span>
  </div>
);

const SectionWithOverlay = ({ children, suspended }) => (
  <div className="relative">
    {children}
    {suspended && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none z-10 border border-red-400">
        <span className="text-red-600 font-bold text-2xl tracking-wide">
          SUSPENDED
        </span>
      </div>
    )}
  </div>
);

const TileButton = ({ disabled, active, children, className, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={[
      "relative border border-white flex flex-col items-center justify-center transition-all duration-150",
      disabled ? "bg-gray-300 cursor-not-allowed opacity-60" : active ? "bg-[#60c0e8]" : "bg-[#7dd3fc] hover:bg-[#60c0e8]", active ? "ring-2 ring-green-500 ring-inset" : "",
      className,
    ].join(" ")}
    style={active ? { boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)" } : undefined}
  >
    {children}
  </button>
);

const FullMarketCards3043 = ({
  eventId,
  eventNames,
  isSuspended,
  roundId,
  data = [],
  customOptions, // parent-provided markets
}) => {
  const dispatch = useDispatch();
  const placedBets = useSelector((s) => s.account?.bets) || [];

  const [activeSection, setActiveSection] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [drawerProps, setDrawerProps] = useState(null);
  const [activeBet, setActiveBet] = useState(null); // live preview for PlaceBet margins
  const containerRef = useRef();

  /* Fallback normalization (if customOptions not provided) */
  const dataMap = useMemo(() => {
    const map = {};
    (data || []).forEach((item) => {
      const key = NATION_MAP[item.nation] || (item.nation || "").toUpperCase();
      map[key] = {
        ...item,
        back: { odds: Number(item.b1) || 0, value: Number(item.bs1) || 0 },
        suspended: item.gstatus !== "1",
        min: Number(item.min) || 100,
        max: Number(item.max) || 100000,
      };
    });
    return map;
  }, [data]); 

  /* Winner (prefer parent options) */
  const winnerData = useMemo(() => {
    if (customOptions?.winner) {
      const sec = customOptions.winner;
      const runners = sec.options.map((o, idx) => ({
        selectionId: o.selectionId || o.sid,
        sid: idx === 0 ? "1" : idx === 1 ? "2" : idx === 2 ? "3" : idx === 3 ? "4" : idx === 4 ? "5" : idx === 5 ? "6" : idx === 6 ? "7" : idx === 7 ? "8" : idx === 8 ? "9" : "0",
        sectionId: idx === 0 ? "1" : idx === 1 ? "2" : idx === 2 ? "3" : idx === 3 ? "4" : idx === 4 ? "5" : idx === 5 ? "6" : idx === 6 ? "7" : idx === 7 ? "8" : idx === 8 ? "9" : "0",
        name: o.label || o.number,
        odds: Number(o?.odds?.back?.odds) || 0,
        value: Number(o?.odds?.back?.value) || 0,
        index: idx,
      }));
      // ensure identity fields on options
      const options = sec.options.map((o) => ({
        ...o,
        market: "WINNER",
        marketId: `${eventId}-WINNER`,
        selectionId: o.selectionId || o.sid,
        mid: o.mid || o.sid || "0",
        gstatus: String(o.gstatus ?? "1"),
      }));
      return {
        title: sec.title || "WINNER",
        min: Number(sec.min) || 100,
        max: Number(sec.max) || 500000,
        suspended: !!sec.suspended,
        options,
        runners,
      };
    }
    // fallback derive from data
    const order = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    const options = order.map((num) => {
      const rec = dataMap[num] || {};
      return {
        number: num,
        mid: rec.mid,
        sid: rec.sid,
        odds: { back: rec.back || {} },
        min: rec.min,
        max: rec.max,
        selectionId: rec.sid,
        marketId: `${eventId}-WINNER`,
        market: "WINNER",
        gstatus: rec.suspended ? "0" : "1",
      };
    });
    const first = dataMap["1"] || {};
    const suspended = order.some((n) => (dataMap[n] || {}).suspended);
    return {
      title: "WINNER",
      min: first.min || 100,
      max: first.max || 500000,
      suspended,
      options,
      runners: options.map((o, idx) => ({
        selectionId: o.sid,
        sid: o.sid,
        sectionId: o.sid,
        name: o.number,
        odds: o?.odds?.back?.odds || 0,
        value: o?.odds?.back?.value || 0,
        index: idx,
      })),
    };
  }, [customOptions, dataMap, eventId]); 

  /* Line (prefer parent options) */
  const lineData = useMemo(() => {
    if (customOptions?.line) {
      const sec = customOptions.line;
      const runners = sec.options.map((o, idx) => ({
        selectionId: `LINE ${idx + 1}`,
        sid: `LINE ${idx + 1}`,
        sectionId: `LINE ${idx + 1}`,
        name: o.label,
        odds: o?.odds?.back?.odds || 0,
        value: o?.odds?.back?.value || 0,
        index: idx,
      }));
      const options = sec.options.map((o,idx) => ({
        ...o,
        market: "LINE",
        marketId: `${eventId}-LINE`,
        selectionId: `LINE ${idx + 1}`,
        mid: o.mid || o.sid || "0",
        gstatus: String(o.gstatus ?? "1"),
      }));
      return {
        title: sec.title || "LINE",
        min: Number(sec.min) || 100,
        max: Number(sec.max) || 100000,
        suspended: !!sec.suspended,
        options,
        runners,
      };
    }
    // fallback
    const l1 = dataMap["LINE1"] || {};
    const l2 = dataMap["LINE2"] || {};
    const options = [
      {
        label: "LINE 1",
        numbers: "1|2|3|4|5",
        mid: l1.mid,
        sid: l1.sid,
        odds: { back: l1.back || {} },
        min: l1.min,
        max: l1.max,
        selectionId: l1.sid,
        marketId: `${eventId}-LINE`,
        market: "LINE",
        gstatus: l1.suspended ? "0" : "1",
      },
      {
        label: "LINE 2",
        numbers: "6|7|8|9|0",
        mid: l2.mid,
        sid: l2.sid,
        odds: { back: l2.back || {} },
        min: l2.min,
        max: l2.max,
        selectionId: l2.sid,
        marketId: `${eventId}-LINE`,
        market: "LINE",
        gstatus: l2.suspended ? "0" : "1",
      },
    ];
    return {
      title: "LINE",
      min: l1.min || 100,
      max: l1.max || 100000,
      suspended: l1.suspended || l2.suspended,
      options,
      runners: options.map((o, idx) => ({
        selectionId: o.sid,
        sid: o.sid,
        sectionId: o.sid,
        name: o.label,
        odds: o?.odds?.back?.odds || 0,
        value: o?.odds?.back?.value || 0,
        index: idx,
      })),
    };
  }, [customOptions, dataMap, eventId]); 

  /* Odd/Even (prefer parent options) */
  const oddEvenData = useMemo(() => {
    if (customOptions?.oddEven) {
      const sec = customOptions.oddEven;
      const runners = sec.options.map((o, idx) => ({
        selectionId: `${idx === 0 ? "ODD" : "EVEN"}`,
        sid: `${idx === 0 ? "ODD" : "EVEN"}`,
        sectionId: `${idx === 0 ? "ODD" : "EVEN"}`,
        name: o.label,
        odds: o?.odds?.back?.odds || 0,
        value: o?.odds?.back?.value || 0,
        index: idx,
      }));
      const options = sec.options.map((o,idx) => ({
        ...o,
        market: "ODD_EVEN",
        marketId: `${eventId}-ODD_EVEN`,
        selectionId: `${idx === 0 ? "ODD" : "EVEN"}`,
        mid: o.mid || o.sid || "0",
        gstatus: String(o.gstatus ?? "1"),
      }));
      return {
        title: sec.title || "ODD/EVEN",
        min: Number(sec.min) || 100,
        max: Number(sec.max) || 100000,
        suspended: !!sec.suspended,
        options,
        runners,
      };
    }
    // fallback
    const o = dataMap["ODD"] || {};
    const e = dataMap["EVEN"] || {};
    const options = [
      {
        label: "ODD",
        numbers: "1|3|5|7|9",
        mid: o.mid,
        sid: o.sid,
        odds: { back: o.back || {} },
        min: o.min,
        max: o.max,
        selectionId: o.sid,
        marketId: `${eventId}-ODD_EVEN`,
        market: "ODD_EVEN",
        gstatus: o.suspended ? "0" : "1",
      },
      {
        label: "EVEN",
        numbers: "0|2|4|6|8",
        mid: e.mid,
        sid: e.sid,
        odds: { back: e.back || {} },
        min: e.min,
        max: e.max,
        selectionId: e.sid,
        marketId: `${eventId}-ODD_EVEN`,
        market: "ODD_EVEN",
        gstatus: e.suspended ? "0" : "1",
      },
    ];
    return {
      title: "ODD/EVEN",
      min: o.min || 100,
      max: o.max || 100000,
      suspended: o.suspended || e.suspended,
      options,
      runners: options.map((o, idx) => ({
        selectionId: o?.sid,
        sid: o.sid,
        sectionId: o.sid,
        name: o.label,
        odds: o?.odds?.back?.odds || 0,
        value: o?.odds?.back?.value || 0,
        index: idx,
      })),
    };
  }, [customOptions, dataMap, eventId]); 

  /* P/L helpers (ported) */
  const calculatePLDetail = useCallback(
    (opt) => {
      
      const filteredBets = placedBets.filter(
        (pb) =>
          pb.marketId === opt.marketId &&
          pb.matchId?.toString() === opt.marketId?.toString() &&
          pb.roundId?.toString() === (opt.mid ?? "").toString()
      );

      const fbOfThisRunner = filteredBets.filter(
        (fb) => fb.selectionId?.toString() === opt.selectionId?.toString()
      );

      const fbOfOtherRunners = filteredBets.filter(
        (fb) => fb.selectionId?.toString() !== opt.selectionId?.toString()
      );

      const negativeMarkets = ["FLUSH", "STRAIGHT", "TRIO", "STRAIGHT FLUSH"];
      const isNegativeMarket = negativeMarkets.includes(String(opt.market || "").toUpperCase());

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
      return Number(Number(netSigned).toFixed(0));
    },
    [placedBets]
  ); 

  const getShownPLDetail = (opt) => {
    const baseNet = Number(calculatePLDetail(opt) || 0);
    const profitSum = baseNet > 0 ? baseNet : 0;
    const lossSum = baseNet < 0 ? Math.abs(baseNet) : 0;
    return { net: baseNet, profitSum, lossSum };
  }; 

const computeActiveDelta = useCallback(
  (runnerSelId, marketId) => {
    if (!activeBet) return null;
    // Only affect same market
    if (String(activeBet.marketId) !== String(marketId)) return null;

    const sameRunner = String(runnerSelId) === String(activeBet.selectionId);

    if (sameRunner && activeBet.type === "Back") return Number(activeBet.favourMargin || 0);
    if (sameRunner && activeBet.type === "Lay") return Number(activeBet.againstMargin || 0);
    if (!sameRunner && activeBet.type === "Back") return Number(activeBet.againstMargin || 0);
    if (!sameRunner && activeBet.type === "Lay") return Number(activeBet.favourMargin || 0);
    return null;
  },
  [activeBet]
);


  /* Bet drawer logic aligned with FullMarketCards4 (market-scoped ids + live preview) */
  const openDrawer = useCallback(
    (label, market, oddsObj, item, runners, section) => {
      const isSame = activeSection === market && activeKey === label && drawerProps;
      if (isSame) {
        setActiveSection(null);
        setActiveKey(null);
        setDrawerProps(null);
        setActiveBet(null);
        return;
      }

      const marketId = `${eventId}-${market}`;
      const selectionId = item?.sid || item?.selectionId || label;
      const selectedOdds = oddsObj?.odds || "0";

      const props = {
        sportName: "Casino",
        sportId: 1000,
        competitionId: marketId,
        marketId,
        market,
        markettype: "Casino",
        selectionId,
        selection: label,
        selectedOdds,
        betType: "Back",
        eventId,
        eventNames,
        runners: runners || [],
        runnersCount: runners?.length || 0,
        mid: item?.mid || "0",
        min: Number(section?.min) || 100,
        max: Number(section?.max) || 100000,
        disableOdds: true,
        setActiveBet, // for PlaceBet onMarginsChange live preview
      };

      setActiveBet({
        selectionId,
        type: "Back",
        favourMargin: 0,
        againstMargin: 0,
      });

      setDrawerProps(props);
      setActiveSection(market);
      setActiveKey(label);
      try {
        dispatch(handleOpenPlaceBet({ ...props, betBoxBgColor: "red" }));
      } catch {}
    },
    [dispatch, eventId, eventNames, activeSection, activeKey, drawerProps]
  ); 

  /* Close drawer when suspended */
  useEffect(() => {
    if (isSuspended) {
      setActiveSection(null);
      setActiveKey(null);
      setDrawerProps(null);
      setActiveBet(null);
    }
  }, [isSuspended]); 

  /* Detect outside click to close drawer */
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveSection(null);
        setActiveKey(null);
        setDrawerProps(null);
        setActiveBet(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []); 

  /* Winner row mapping for inline drawer */
  const winnerRowOf = (n) => {
    const order = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    const i = order.indexOf(n);
    return i >= 0 && i < 5 ? 0 : 1;
  }; 

  return (
    <div ref={containerRef} className="w-full space-y-3">
      {/* WINNER */}
      
        <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
          <SectionHeader title={winnerData.title} />
          <MinMaxBar min={winnerData.min} max={winnerData.max} />
          <SectionWithOverlay suspended={isSuspended || winnerData.suspended}>
          <div className="grid grid-cols-5">
            {winnerData.options.map((opt, idx) => {
              const keyLabel = opt.number ?? opt.label;
              const isActive = activeSection === "WINNER" && activeKey === keyLabel;
              const rowIdx = Math.floor(idx / 5);
              const activeRow = activeKey ? winnerRowOf(activeKey) : -1;
              const showDrawer =
                (idx + 1) % 5 === 0 &&
                activeSection === "WINNER" &&
                rowIdx === activeRow &&
                drawerProps;

              // enrich for PL
              const enriched = {
                ...opt,
                market: "WINNER",
                marketId: `${eventId}-WINNER`,
                mid: opt.mid || opt.sid || "0",
                selectionId: opt.sid || opt.selectionId || keyLabel,
              };
              const { profitSum, lossSum, net } = getShownPLDetail(enriched);
              const delta = computeActiveDelta(enriched.selectionId, enriched.marketId);
              const combined = delta !== null ? Number(net || 0) + Number(delta) : null;

              return (
                <React.Fragment key={keyLabel}>
                  <TileButton
                    disabled={isSuspended || winnerData.suspended}
                    active={isActive}
                    className="h-20"
                    onClick={() =>
                      openDrawer(
                        keyLabel,
                        "WINNER",
                        opt?.odds?.back || opt.back || { odds: "0" },
                        opt,
                        winnerData.runners,
                        winnerData
                      )
                    }
                  >
                    <span style={{ fontFamily: "casinoNumFont", fontSize: 38 }}>
                      {keyLabel}
                    </span>
                    <span className="text-xs font-semibold flex gap-2 items-center">
                      {profitSum > 0 && <span className="text-green-600">P {profitSum}</span>}
                      {lossSum > 0 && <span className="text-red-600">L {lossSum}</span>}
                      {combined !== null && (
                        <span className={Number(combined) > 0 ? "text-green-600" : "text-red-600"}>
                          {Math.abs(Number(combined))}
                        </span>
                      )}
                    </span>
                  </TileButton>

                  {showDrawer && (
                    <div className="col-span-5 bg-white p-2 border-t border-gray-300">
                      <PlaceBet
                        {...drawerProps}
                        onMarginsChange={({ favourMargin, againstMargin }) => {
                          drawerProps?.setActiveBet &&
                            drawerProps.setActiveBet((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    favourMargin: Number(favourMargin || 0),
                                    againstMargin: Number(againstMargin || 0),
                                  }
                                : {
                                    selectionId: drawerProps.selectionId,
                                    type: drawerProps.betType || "Back",
                                    favourMargin: Number(favourMargin || 0),
                                    againstMargin: Number(againstMargin || 0),
                                  }
                            );
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          </SectionWithOverlay>
        </div>

      {/* LINE */}
      
        <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
          <SectionHeader title={lineData.title} />
          <MinMaxBar min={lineData.min} max={lineData.max} />
          <SectionWithOverlay suspended={isSuspended || lineData.suspended}>
          <div className="grid grid-cols-2">
            {lineData.options.map((opt, idx) => {
              const isActive = activeSection === "LINE" && activeKey === opt.label;

              const enriched = {
                ...opt,
                market: "LINE",
                marketId: `${eventId}-LINE`,
                mid: opt.mid || opt.sid || "0",
                selectionId: opt.sid || opt.selectionId,
              };
              const { profitSum, lossSum, net } = getShownPLDetail(enriched);
              const delta = computeActiveDelta(enriched.selectionId, enriched.marketId);
              const combined = delta !== null ? Number(net || 0) + Number(delta) : null;

              return (
                <React.Fragment key={opt.label}>
                  <TileButton
                    disabled={isSuspended || lineData.suspended}
                    active={isActive}
                    className="h-28"
                    onClick={() =>
                      openDrawer(
                        opt.label,
                        "LINE",
                        opt?.odds?.back || opt.back || { odds: "0" },
                        opt,
                        lineData.runners,
                        lineData
                      )
                    }
                  >
                    <span style={{ fontFamily: "casinoNumFont", fontSize: 40 }}>
                      {opt.label}
                    </span>
                    <span className={`${FS_LINE_NUMBERS} font-semibold text-[#1e3a5f]`}>
                      {opt.numbers}
                    </span>
                    <span className="text-xs font-semibold mt-1 flex gap-2 items-center">
                      {profitSum > 0 && <span className="text-green-600">P {profitSum}</span>}
                      {lossSum > 0 && <span className="text-red-600">L {lossSum}</span>}
                      {combined !== null && (
                        <span className={Number(combined) > 0 ? "text-green-600" : "text-red-600"}>
                          {Math.abs(Number(combined))}
                        </span>
                      )}
                    </span>
                  </TileButton>

                  {idx === 1 && activeSection === "LINE" && drawerProps && (
                    <div className="col-span-2 bg-white p-2 border-t border-gray-300">
                      <PlaceBet
                        {...drawerProps}
                        onMarginsChange={({ favourMargin, againstMargin }) => {
                          drawerProps?.setActiveBet &&
                            drawerProps.setActiveBet((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    favourMargin: Number(favourMargin || 0),
                                    againstMargin: Number(againstMargin || 0),
                                  }
                                : {
                                    selectionId: drawerProps.selectionId,
                                    type: drawerProps.betType || "Back",
                                    favourMargin: Number(favourMargin || 0),
                                    againstMargin: Number(againstMargin || 0),
                                  }
                            );
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          </SectionWithOverlay>
        </div>

      {/* ODD/EVEN */}
      
        <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
          <SectionHeader title={oddEvenData.title} />
          <MinMaxBar min={oddEvenData.min} max={oddEvenData.max} />
          <SectionWithOverlay suspended={isSuspended || oddEvenData.suspended}>
          <div className="grid grid-cols-2">
            {oddEvenData.options.map((opt, idx) => {
              const isActive = activeSection === "ODD_EVEN" && activeKey === opt.label;

              const enriched = {
                ...opt,
                market: "ODD_EVEN",
                marketId: `${eventId}-ODD_EVEN`,
                mid: opt.mid || opt.sid || "0",
                selectionId: opt.sid || opt.selectionId,
              };
              const { profitSum, lossSum, net } = getShownPLDetail(enriched);
              const delta = computeActiveDelta(enriched.selectionId, enriched.marketId);
              const combined = delta !== null ? Number(net || 0) + Number(delta) : null;

              return (
                <React.Fragment key={opt.label}>
                  <TileButton
                    disabled={isSuspended || oddEvenData.suspended}
                    active={isActive}
                    className="h-28"
                    onClick={() =>
                      openDrawer(
                        opt.label,
                        "ODD_EVEN",
                        opt?.odds?.back || opt.back || { odds: "0" },
                        opt,
                        oddEvenData.runners,
                        oddEvenData
                      )
                    }
                  >
                    <span style={{ fontFamily: "casinoNumFont", fontSize: 40 }}>
                      {opt.label}
                    </span>
                    <span className={`${FS_LINE_NUMBERS} font-semibold text-[#1e3a5f]`}>
                      {opt.numbers}
                    </span>
                    <span className="text-xs font-semibold mt-1 flex gap-2 items-center">
                      {profitSum > 0 && <span className="text-green-600">P {profitSum}</span>}
                      {lossSum > 0 && <span className="text-red-600">L {lossSum}</span>}
                      {combined !== null && (
                        <span className={Number(combined) > 0 ? "text-green-600" : "text-red-600"}>
                          {Math.abs(Number(combined))}
                        </span>
                      )}
                    </span>
                  </TileButton>

                  {idx === 1 && activeSection === "ODD_EVEN" && drawerProps && (
                    <div className="col-span-2 bg-white p-2 border-t border-gray-300">
                      <PlaceBet
                        {...drawerProps}
                        onMarginsChange={({ favourMargin, againstMargin }) => {
                          drawerProps?.setActiveBet &&
                            drawerProps.setActiveBet((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    favourMargin: Number(favourMargin || 0),
                                    againstMargin: Number(againstMargin || 0),
                                  }
                                : {
                                    selectionId: drawerProps.selectionId,
                                    type: drawerProps.betType || "Back",
                                    favourMargin: Number(favourMargin || 0),
                                    againstMargin: Number(againstMargin || 0),
                                  }
                            );
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          </SectionWithOverlay>
        </div>
    </div>
  );
};

export default FullMarketCards3043;
