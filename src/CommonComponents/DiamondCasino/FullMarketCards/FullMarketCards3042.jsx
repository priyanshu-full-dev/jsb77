import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleOpenPlaceBet } from "../../../AsianExchangeSrc/redux/slices/placeBetSlice";
import PlaceBet from "../../../AuraExchangeSrc/components/PlaceBet";

/* Fonts */
const FS_LINE_NUMBERS = "text-base";
// One label style for all tiles (same font everywhere)
const FS_TILE_LABEL = "font-casino text-[40px] leading-tight tracking-tight";
const FS_TILE_LABEL_SM = "font-casino text-[34px] leading-tight tracking-tight";

/* Nation map (for lookup only) */
const NATION_MAP = {
  "0": "0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9",
  "Line 1":"LINE1","Line 2":"LINE2","Odd":"ODD","Even":"EVEN",
  "Single 0":"SINGLE_0","Single 1":"SINGLE_1","Single 2":"SINGLE_2","Single 3":"SINGLE_3","Single 4":"SINGLE_4",
  "Single 5":"SINGLE_5","Single 6":"SINGLE_6","Single 7":"SINGLE_7","Single 8":"SINGLE_8","Single 9":"SINGLE_9",
  "Pana 000":"PANA_000",
  "DP 00":"DP_00",
  "SP 0":"SP_0",
  "Trio 000":"TRIO_000",
  "Cycle A":"CYCLE_A",
  "MotorSP A":"MOTORSP_A",
  "56 Charts A":"CHART56_A",
  "64 Charts A":"CHART64_A",
  "ABR A":"ABR_A",
  "Common SP A":"CSP_A",
  "Common DP A":"CDP_A",
  "Color DP Red":"CDP_RED",
  "Color DP Black":"CDP_BLACK",
};

/* UI pieces */
const SectionHeader = ({ title }) => (
  <div className="text-white flex justify-between items-center h-[34px] px-3"
       style={{ background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)" }}>
    <span className="text-sm font-bold uppercase">{title}</span>
  </div>
);

const MinMaxBar = ({ min, max }) => (
  <div className="bg-[#d1d5db] px-3 py-1.5 flex justify-end">
    <span className="text-xs font-semibold text-gray-700">Min/Max {min} - {max}</span>
  </div>
);

const SectionWithOverlay = ({ children, suspended }) => (
  <div className="relative mb-3">
    {children}
    {suspended && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none z-10">
        <span className="text-red-600 font-bold text-2xl tracking-wide">SUSPENDED</span>
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
      disabled ? "bg-gray-300 cursor-not-allowed opacity-60" :
        active ? "bg-[#60c0e8]" : "bg-[#7dd3fc] hover:bg-[#60c0e8]",
      active ? "ring-2 ring-green-500 ring-inset" : "",
      className
    ].join(" ")}
    style={active ? { boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)" } : undefined}
  >
    {children}
  </button>
);

/* Helpers */
const nz = (v, d=0) => Number.isFinite(Number(v)) ? Number(v) : d;

// Compact badges row like the other components: baseline P/L + combined preview
const TileBadges = ({ baselineNet }) => {
  const profit = baselineNet > 0 ? baselineNet : 0;
  const loss = baselineNet < 0 ? Math.abs(baselineNet) : 0;
  if (!profit && !loss) return null;
  return (
    <div className="absolute bottom-1 right-1 flex items-center gap-2">
      {profit > 0 && <span className="text-[10px] font-semibold text-green-600">P {profit}</span>}
      {loss > 0 && <span className="text-[10px] font-semibold text-red-600">L {loss}</span>}
    </div>
  );
};

// Render label, splitting two-word last tile into two lines
const renderMaybeTwoWord = (label, isLast) => {
  const text = String(label || "").trim();
  if (!isLast) return <span className={FS_TILE_LABEL}>{text}</span>;
  const parts = text.split(/\s+/);
  if (parts.length !== 2) return <span className={FS_TILE_LABEL}>{text}</span>;
  return (
    <div className="flex flex-col items-center justify-center">
      <span className={FS_TILE_LABEL_SM}>{parts[0]}</span>
      <span className={FS_TILE_LABEL_SM}>{parts[1]}</span>
    </div>
  );
};

/* Tab pill */
const TabPill = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "h-10 px-4 rounded-sm font-semibold",
      active ? "bg-[#223344] text-white" : "bg-[#d3d3d3] text-black",
      "border border-white shadow-sm whitespace-nowrap",
      "focus:outline-none focus:ring-2 focus:ring-blue-500",
    ].join(" ")}
  >
    {label}
  </button>
);

/* Component */
const FullMarketCards3042 = ({ eventId, eventNames, isSuspended, data = [] }) => {
  const dispatch = useDispatch();
  const placedBets = useSelector((s) => s.account?.bets || []);

  // inline drawer
  const [activeSection, setActiveSection] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [drawerProps, setDrawerProps] = useState(null);

  // active bet preview margins
  const [activeBet, setActiveBet] = useState(null); // {selectionId, type, favourMargin, againstMargin}

  // selected tab
  const [tabKey, setTabKey] = useState("SINGLE");

  // normalize data for odds/min/max/suspend/ids
  const dataMap = useMemo(() => {
    const map = {};
    (data || []).forEach((item) => {
      const raw = item.nation || "";
      const key = NATION_MAP[raw] || raw.toUpperCase();
      map[key] = {
        ...item,
        back: { odds: nz(item.b1), value: nz(item.bs1) },
        lay:  { odds: nz(item.l1), value: nz(item.ls1) },
        suspended: item.gstatus !== "ACTIVE",
        min: 50,
        max: 25000,
        mid: item.mid,
        sid: item.sid,
        gstatus: item.gstatus,
        marketId: `${eventId}-${key}`, // fallback if needed
      };
    });
    return map;
  }, [data, eventId]);

  // Static visible definitions per tab
  const STATIC_LABELS = useMemo(() => ({
    SINGLE: ["1","2","3","4","5","6","7","8","9","0"],
    PANA:   ["1","2","3","4","5","6","7","8","9","0"],
    SP:     ["1","2","3","4","5","6","7","8","9","0","SP ALL"],
    DP:     ["1","2","3","4","5","6","7","8","9","0","DP ALL"],
    TRIO:   ["ALL TRIO"],
    CYCLE:  ["1","2","3","4","5","6","7","8","9","0"],
    MOTORSP:["1","2","3","4","5","6","7","8","9","0"],
    CHART56:["1","2","3","4","5","6","7","8","9","0","56 ALL"],
    CHART64:["1","2","3","4","5","6","7","8","9","0","64 ALL"],
    ABR:    ["A","AB","B","BR","R","AR","ABR","ABR CUT"],
    COMMON_SP:["1","2","3","4","5","6","7","8","9","0"],
    COMMON_DP:["1","2","3","4","5","6","7","8","9","0"],
    COLOR_DP:["1","2","3","4","5","6","7","8","9","0","COLLOR DP ALL"],
  }), []);

  // Map a visible label to a dataMap key for odds/ids
  const labelToDataKey = useCallback((section, label) => {
    if (section === "SINGLE" && /^\d$/.test(label)) return `SINGLE_${label}`;
    if (section === "SP" && /^\d$/.test(label)) return `SP_${label}`;
    if (section === "DP" && /^\d$/.test(label)) return `DP_00`;
    if (section === "PANA" && /^\d$/.test(label)) return `PANA_000`;
    if (section === "TRIO" && label === "ALL TRIO") return `TRIO_000`;
    if (section === "COLOR_DP" && label === "RED") return "CDP_RED";
    if (section === "COLOR_DP" && label === "BLACK") return "CDP_BLACK";
    return label.toUpperCase();
  }, []);

  // Section builders (static labels + data enrichment)
  const builders = useMemo(() => {
    const buildFromLabels = (key, title) => {
      const labels = STATIC_LABELS[key] || [];
      const options = labels.map((lbl) => {
        const dk = labelToDataKey(key, lbl);
        const rec = dataMap[dk] || {};
        return {
          key: dk,
          label: lbl,
          sub: lbl.includes("ALL") ? "" : undefined,
          mid: rec.mid,
          sid: rec.sid,
          odds: { back: rec.back || { odds: 0, value: 0 } },
          min: 50,
          max: 25000,
          suspended: !!rec.suspended,
          gstatus: rec.gstatus,
          marketId: `${eventId}-${key}`, // logical market per section
          market: key, // section as market
        };
      });
      const any = options.find(Boolean) || {};
      const suspended = options.some(o => o.suspended);
      return {
        title,
        layout: "grid-5", // Force 5-grid for all categories
        min: 50,
        max: 25000,
        suspended,
        options,
        runners: options.map((o, idx) => ({ selectionId: o.sid, sid: o.sid, name: o.label, index: idx })),
      };
    };

    return {
      SINGLE:   () => buildFromLabels("SINGLE", "Single"),
      PANA:     () => buildFromLabels("PANA", "Pana"),
      SP:       () => buildFromLabels("SP", "SP"),
      DP:       () => buildFromLabels("DP", "DP"),
      TRIO:     () => buildFromLabels("TRIO", "Trio"),
      CYCLE:    () => buildFromLabels("CYCLE", "Cycle"),
      MOTORSP:  () => buildFromLabels("MOTORSP", "Motor SP"),
      CHART56:  () => buildFromLabels("CHART56", "56 Charts"),
      CHART64:  () => buildFromLabels("CHART64", "64 Charts"),
      ABR:      () => buildFromLabels("ABR", "ABR"),
      COMMON_SP:() => buildFromLabels("COMMON_SP", "Common SP"),
      COMMON_DP:() => buildFromLabels("COMMON_DP", "Common DP"),
      COLOR_DP: () => buildFromLabels("COLOR_DP", "Color DP"),
    };
  }, [STATIC_LABELS, dataMap, labelToDataKey, eventId]);

  // Drawer open
  const openDrawer = useCallback((label, market, oddsObj, item, runners, section) => {
    const props = {
      sportName: "Casino",
      sportId: 1000,
      competitionId: eventId,
      marketId: `${eventId}-${market}`,
      market,
      markettype: "Casino",
      selectionId: item?.sid || label,
      selection: label,
      selectedOdds: Number(oddsObj?.odds) || 0,
      betBoxBgColor: "#72bbef",
      betType: "Back",
      eventId,
      eventNames,
      runners: runners || [],
      runnersCount: runners?.length || 0,
      mid: item?.mid || "0",
      min: 50,
      max: 25000,
      disableOdds: true,
      setActiveBet, // allow PlaceBet to update preview margins
    };
    setDrawerProps(props);
    setActiveSection(market);
    setActiveKey(label);
    try { dispatch(handleOpenPlaceBet(props)); } catch {}
  }, [dispatch, eventId, eventNames, setActiveBet]);

  // Close on suspend
  useEffect(() => {
    if (isSuspended) {
      setActiveSection(null);
      setActiveKey(null);
      setDrawerProps(null);
      setActiveBet(null);
    }
  }, [isSuspended]);

  const isMultiWord = (s) => String(s || "").trim().split(/\s+/).length >= 2;

  // Baseline P/L calculator (signed net) for a given option tile
  const calculateBaselineNet = useCallback((opt) => {
    if (!opt?.marketId || !opt?.mid || !opt?.sid) return 0;
    const filtered = placedBets.filter(
      (pb) =>
        String(pb.marketId) === String(opt.marketId) &&
        String(pb.matchId ?? "") === String(opt.marketId) &&
        String(pb.roundId ?? "") === String(opt.mid)
    );
    const same = filtered.filter((fb) => String(fb.selectionId) === String(opt.sid));
    const other = filtered.filter((fb) => String(fb.selectionId) !== String(opt.sid));
    const negativeMarkets = ["FLUSH", "STRAIGHT", "TRIO", "STRAIGHT FLUSH"];
    const isNeg = negativeMarkets.includes(String(opt.market).toUpperCase());

    const total =
      same.reduce((acc, fbr) => {
        return acc + (fbr.type === "Back" ? (isNeg ? Number(fbr.againstMargin) : Number(fbr.favourMargin))
                          : (isNeg ? -Number(fbr.favourMargin) : -Number(fbr.againstMargin)));
      }, 0) +
      other.reduce((acc, fbo) => {
        return acc + (fbo.type === "Back" ? (isNeg ? -Number(fbo.favourMargin) : -Number(fbo.againstMargin))
                          : (isNeg ? Number(fbo.againstMargin) : Number(fbo.favourMargin)));
      }, 0);

    const net = isNeg ? -Number(total) : Number(total);
    return Number(net.toFixed(0));
  }, [placedBets]);

  // Active bet preview delta using same rules used in other components
  const computeActiveDelta = useCallback((runnerSelId) => {
    if (!activeBet) return null;
    const sameRunner = String(runnerSelId) === String(activeBet.selectionId);
    if (sameRunner && activeBet.type === "Back") return Number(activeBet.favourMargin || 0);
    if (sameRunner && activeBet.type === "Lay") return Number(activeBet.againstMargin || 0);
    if (!sameRunner && activeBet.type === "Back") return Number(activeBet.againstMargin || 0);
    if (!sameRunner && activeBet.type === "Lay") return Number(activeBet.favourMargin || 0);
    return null;
  }, [activeBet]);

  // Unified 5-column renderer with P/L badges and combined preview
  const renderGrid5 = (sectionKey, sec) => {
    // Determine if last label has 2+ words
    const lastIdx = sec.options.length - 1;
    const lastLabel = sec.options[lastIdx]?.label;
    const hasMultiWordLast = isMultiWord(lastLabel);

    // Items shown in the 5-col grid (exclude last if multi-word)
    const gridItems = hasMultiWordLast ? sec.options.slice(0, lastIdx) : sec.options;

    const rowIdxOf = (label) => {
      const idx = gridItems.findIndex(o => o.label === label);
      return idx >= 0 ? Math.floor(idx / 5) : -1;
    };

    return (
      <SectionWithOverlay suspended={isSuspended || sec.suspended}>
        <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
          <SectionHeader title={sec.title} />
          <MinMaxBar min={50} max={25000} />

          {/* Standard 5-column grid */}
          <div className="grid grid-cols-5 gap-0">
            {gridItems.map((opt, idx) => {
              const isActive = activeSection === sectionKey && activeKey === opt.label;
              const rowIdx = Math.floor(idx / 5);
              const activeRow = activeSection === sectionKey && activeKey ? rowIdxOf(activeKey) : -1;
              const showDrawerAfterRow =
                (idx + 1) % 5 === 0 && rowIdx === activeRow && drawerProps;

              const tileOpt = {
                marketId: `${eventId}-${sectionKey}`,
                market: sectionKey,
                sid: opt.sid,
                mid: opt.mid,
              };
              const baselineNet = calculateBaselineNet(tileOpt);
              const delta = opt.sid ? computeActiveDelta(opt.sid) : null;
              const combined = delta !== null ? Number(baselineNet || 0) + Number(delta) : null;

              return (
                <React.Fragment key={`${sectionKey}-${opt.key}-${idx}`}>
                  <div className="relative">
                    <TileButton
                      disabled={isSuspended || sec.suspended || String(opt.gstatus ?? "1") !== "1"}
                      active={isActive}
                      className="h-20 w-full"
                      onClick={() =>
                        openDrawer(
                          opt.label,
                          sectionKey,
                          opt.odds.back,
                          { mid: opt.mid, sid: opt.sid, min: sec.min, max: sec.max },
                          sec.runners,
                          sec
                        )
                      }
                    >
                      <span className="leading-tight tracking-tight" style={{fontFamily:"casinoNumFont", fontSize:"40px"}}>
                        {opt.label}
                      </span>
                    </TileButton>

                    {/* Baseline P/L badges */}
                    <TileBadges baselineNet={baselineNet} />

                    {/* Combined preview badge */}
                    {combined !== null && (
                      <span className={`absolute top-1 right-1 text-[10px] font-semibold ${combined > 0 ? "text-green-600" : "text-red-600"}`}>
                        {Math.abs(Number(combined))}
                      </span>
                    )}
                  </div>

                  {showDrawerAfterRow && (
                    <div className="col-span-5 border-t-2 border-gray-300 bg-white p-2">
                      <PlaceBet
                        {...drawerProps}
                        onMarginsChange={({ favourMargin, againstMargin }) => {
                          setActiveBet((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  favourMargin: Number(favourMargin || 0),
                                  againstMargin: Number(againstMargin || 0),
                                }
                              : {
                                  selectionId: drawerProps?.selectionId,
                                  type: drawerProps?.betType || "Back",
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

          {/* Full-width last row when last tile has 2+ words */}
          {hasMultiWordLast && (
            <div className="grid grid-cols-5 gap-0">
              <div className="col-span-5">
                {(() => {
                  const opt = sec.options[lastIdx];
                  const isActive = activeSection === sectionKey && activeKey === opt.label;

                  const tileOpt = {
                    marketId: `${eventId}-${sectionKey}`,
                    market: sectionKey,
                    sid: opt.sid,
                    mid: opt.mid,
                  };
                  const baselineNet = calculateBaselineNet(tileOpt);
                  const delta = opt.sid ? computeActiveDelta(opt.sid) : null;
                  const combined = delta !== null ? Number(baselineNet || 0) + Number(delta) : null;

                  return (
                    <div className="relative">
                      <TileButton
                        disabled={isSuspended || sec.suspended || String(opt.gstatus ?? "1") !== "1"}
                        active={isActive}
                        className="h-20 w-full"
                        onClick={() =>
                          openDrawer(
                            opt.label,
                            sectionKey,
                            opt.odds.back,
                            { mid: opt.mid, sid: opt.sid, min: sec.min, max: sec.max },
                            sec.runners,
                            sec
                          )
                        }
                      >
                        <span className="leading-tight tracking-tight" style={{fontFamily:"casinoNumFont", fontSize:"40px"}}>
                          {opt.label}
                        </span>
                      </TileButton>

                      {/* Baseline P/L badges */}
                      <TileBadges baselineNet={baselineNet} />

                      {/* Combined preview badge */}
                      {combined !== null && (
                        <span className={`absolute top-1 right-1 text-[10px] font-semibold ${combined > 0 ? "text-green-600" : "text-red-600"}`}>
                          {Math.abs(Number(combined))}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {activeSection === sectionKey &&
                activeKey === sec.options[lastIdx]?.label &&
                drawerProps && (
                  <div className="col-span-5 border-t-2 border-gray-300 bg-white p-2">
                    <PlaceBet
                      {...drawerProps}
                      onMarginsChange={({ favourMargin, againstMargin }) => {
                        setActiveBet((prev) =>
                          prev
                            ? {
                                ...prev,
                                favourMargin: Number(favourMargin || 0),
                                againstMargin: Number(againstMargin || 0),
                              }
                            : {
                                selectionId: drawerProps?.selectionId,
                                type: drawerProps?.betType || "Back",
                                favourMargin: Number(favourMargin || 0),
                                againstMargin: Number(againstMargin || 0),
                              }
                        );
                      }}
                    />
                  </div>
                )}
            </div>
          )}
        </div>
      </SectionWithOverlay>
    );
  };

  // Build sections (all now render via 5-grid renderer)
  const sections = useMemo(() => {
    const list = [];
    const push = (k, fn) => list.push({ key: k, data: fn() });
    push("SINGLE", builders.SINGLE);
    push("PANA", builders.PANA);
    push("SP", builders.SP);
    push("DP", builders.DP);
    push("TRIO", builders.TRIO);
    push("CYCLE", builders.CYCLE);
    push("MOTORSP", builders.MOTORSP);
    push("CHART56", builders.CHART56);
    push("CHART64", builders.CHART64);
    push("ABR", builders.ABR);
    push("COMMON_SP", builders.COMMON_SP);
    push("COMMON_DP", builders.COMMON_DP);
    push("COLOR_DP", builders.COLOR_DP);
    return list;
  }, [builders]);

  // reset drawer when switching tab
  useEffect(() => {
    setActiveSection(null);
    setActiveKey(null);
    setDrawerProps(null);
    setActiveBet(null);
  }, [tabKey]);

  // Tab bar (single row; expand as needed)
  const TabBar = () => {
    const row1 = ["SINGLE","PANA","SP","DP","TRIO","CYCLE","MOTORSP","CHART56","CHART64","ABR","COMMON_SP","COMMON_DP","COLOR_DP"];
    const labelOf = (k) => ({
      SINGLE:"Single", PANA:"Pana", SP:"SP", DP:"DP", TRIO:"Trio", CYCLE:"Cycle",
      MOTORSP:"Motor SP", CHART56:"56 Charts", CHART64:"64 Charts", ABR:"ABR",
      COMMON_SP:"Common SP", COMMON_DP:"Common DP", COLOR_DP:"Color DP",
    }[k] || k);

    return (
      <div className="w-full bg-[#e5e7eb] p-1 rounded-sm border border-gray-300">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 mb-1">
          {row1.map((k) => (
            <TabPill key={k} label={labelOf(k)} active={tabKey === k} onClick={() => setTabKey(k)} />
          ))}
        </div>
      </div>
    );
  };

  const ActivePanel = () => {
    const sec = sections.find(s => s.key === tabKey)?.data;
    if (!sec) return null;
    return renderGrid5(tabKey, sec);
  };

  return (
    <div className="w-full space-y-3">
      <TabBar />
      <ActivePanel />
    </div>
  );
};

export default FullMarketCards3042;
