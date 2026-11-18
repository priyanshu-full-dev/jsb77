import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { isMobile } from "react-device-detect";

import { useDispatch, useSelector } from "react-redux";

import PlaceBet from "../../../components/PlaceBet";

import { sportsMapping } from "./MatchDetailsBanner";

import { useSearchParams } from "react-router-dom";

import {
  handleOpenPlaceBet,
  handleCancelPlaceBet,
} from "../../../../../redux/slices/placeBetSlice";

import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";

import MarketCell from "./MarketCell";

import { FaArrowRight } from "react-icons/fa";

import FancyBook from "../../../../../NprSrc/AuraExchangeSrc/components/Popup/FancyBook";

import { Premiumcricket } from "../../../../../utils/helper/commonSelectors";

import { IoInformationCircleOutline } from "react-icons/io5";

const tabs11 = [
  "ALL",

  "Fancy",

  "Line Market",

  "Ball by Ball",

  "Meter",

  "Khado",
];

// let tabs22 = [];

function isDecimal(num) {
  return typeof num === "number" && !Number.isInteger(num);
}

function categorizeQuery(query) {
  const categories = {
    runs: [
      "over runs",

      "run",

      "pship Runs",

      "Total Runs",

      "Highest Scoring over Runs",

      "Death Over Runs",
    ],

    boundaries: [
      "Boundaries",

      "Four Hitters",

      "Six Hitters",

      "Most 4s",

      "Most 6s",

      "No Boundaries overs",
    ],

    wickets: [
      "Wkt",

      "Wickets",

      "Wicket Takers",

      "Caught Outs",

      "Bowled",

      "LBW",

      "Runout",
    ],

    balls_faced: ["balls face", "Balls Faced", "How Many Balls"],

    extras: ["Extras", "Wides", "Legbyes", "Maidens"],

    dot_balls: ["Dot balls", "Dotballs"],

    partnerships: ["Pship", "Highest Pship"],

    impact: ["Impact overs"],

    scorers: ["Single Digit Scorers", "Double Digit Scorers", "Fifties", "30s"],

    bowlers: [
      "Most Dotballs By a Bowler",

      "Most Wickets By a Bowler",

      "Most Runs Given by a Bowler",

      "Most Boundaries Given by a Bowler",

      "Bowlers Giving 40 Plus Runs",
    ],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => query.includes(keyword))) {
      return category;
    }
  }

  return "Run";
}

// Helper to extract numeric over from market name (e.g. "LIO 12 Over Runs" -> 12, "LIO Only 13th Over Runs" -> 13)

const extractOverNumber = (name = "") => {
  const match =
    name.match(/(\d+(?:\.\d+)?)(?:st|nd|rd|th)?\s+over/i) ||
    name.match(/over\s+(\d+(?:\.\d+)?)/i);

  return match ? parseFloat(match[1]) : 999;
};

// Helper to extract wicket number (e.g. "Fall Of 2nd Wicket LIO" -> 2, "LIO 2nd Wicket Partnership" -> 2)

const extractWicketNumber = (name = "") => {
  const match =
    name.match(/(\d+(?:\.\d+)?)(?:st|nd|rd|th)?\s+wicket/i) ||
    name.match(/wkt\s+(\d+(?:\.\d+)?)/i) ||
    name.match(/(\d+(?:\.\d+)?)(?:st|nd|rd|th)?\s+wkt/i);

  return match ? parseFloat(match[1]) : 999;
};

export const extractBatsmenList = (scoreData) => {
  if (!scoreData) return [];
  const list = [];

  const addName = (raw) => {
    if (!raw || typeof raw !== "string") return;
    const parts = raw.split(/,|\band\b|&|\//i);
    for (const p of parts) {
      let cleaned = p
        .replace(/\b\d+\s*\(\s*\d+\s*\)/g, "")
        .replace(/\b\d+\s*(?:runs?|r)?\b/gi, "")
        .replace(/[*#†]/g, "")
        .trim();
      cleaned = cleaned.replace(/^\d+\s*/, "").replace(/\s*\d+$/, "").trim();
      if (
        cleaned.length >= 3 &&
        !list.some((existing) => existing.toLowerCase() === cleaned.toLowerCase())
      ) {
        list.push(cleaned.toLowerCase());
      }
    }
  };

  const rawBatsmen =
    scoreData?.batsmen ||
    scoreData?.score?.batsmen ||
    scoreData?.sliderScore?.batsmen ||
    [];
  if (Array.isArray(rawBatsmen) && rawBatsmen.length > 0) {
    rawBatsmen.forEach((b) => {
      const bName = b?.name || b?.batsmanName || b?.playerName;
      if (bName) addName(bName);
    });
  }

  const creaseStr =
    scoreData?.atCrease ||
    scoreData?.score?.atCrease ||
    scoreData?.liveDoc?.slider?.[0]?.score?.atCrease ||
    scoreData?.currentInnings?.atCrease ||
    scoreData?.teamInfo?.team1SubText ||
    scoreData?.teamInfo?.team2SubText ||
    "";
  if (creaseStr) {
    addName(creaseStr);
  }

  const scoreItems =
    scoreData?.scoreItems ||
    scoreData?.liveDoc?.slider?.[0]?.score?.scoreItems ||
    [];
  if (Array.isArray(scoreItems)) {
    scoreItems.forEach((si) => {
      if (si?.currentBatsman) addName(si.currentBatsman);
      if (si?.subText) addName(si.subText);
    });
  }

  return list;
};

const getPlayerOrder = (marketName = "", batsmenList = []) => {
  if (!marketName || !Array.isArray(batsmenList) || batsmenList.length === 0) {
    return 999;
  }
  const lowerName = String(marketName).toLowerCase();
  for (let i = 0; i < batsmenList.length; i++) {
    const bName = batsmenList[i];
    if (
      bName &&
      (lowerName.includes(bName) ||
        bName.includes(
          lowerName.replace(/runs?|boundar(?:y|ies)|4s|6s/gi, "").trim(),
        ))
    ) {
      return i;
    }
  }
  return 999;
};

const getFancyMarketCategoryScore = (marketName = "", batsmenList = []) => {
  const name = String(marketName || "")
    .trim()
    .toLowerCase();

  // 1. Over Runs / Over Line / Session / Over-based markets (comes first, sorted by over number)
  // e.g. "PA 2 Over Runs", "PA Only 3rd Over Runs", "PA 6 Over Runs", "2nd Innings 6 Over Line", "1st Over Runs"
  if (
    ((name.includes("over") || name.includes("ov ")) &&
      (name.includes("run") || name.includes("line"))) ||
    name.includes("over runs") ||
    (name.includes("only ") && name.includes("over")) ||
    name.includes("over line") ||
    name.includes("session")
  ) {
    return {
      group: 1,
      num: extractOverNumber(name),
      isOnlyOver: name.includes("only ") ? 1 : 0,
      isLine: name.includes("line") ? 1 : 0,
      sub: 0,
    };
  }

  // 2. Fall of Wicket
  // e.g. "Fall Of 2nd Wicket PA", "Fall of 1st Wicket"
  if (
    name.includes("fall of") ||
    (name.includes("wicket") && name.includes("fall"))
  ) {
    return {
      group: 2,
      num: extractWicketNumber(name),
      sub: 0,
    };
  }

  // 3. Partnership (Runs / Boundaries)
  // e.g. "PA 2nd Wicket Partnership Boundaries", "Partnership Runs", "Pship"
  if (name.includes("partnership") || name.includes("pship")) {
    const isBoundaries =
      name.includes("boundar") || name.includes("4s") || name.includes("6s");
    return {
      group: 3,
      num: extractWicketNumber(name),
      sub: isBoundaries ? 1 : 0,
    };
  }

  // 4. Player Runs (e.g. "Yuvraj Samra Runs", "Arjun Kumal Runs")
  // Player runs come before player boundaries
  if (name.includes("run")) {
    return {
      group: 4,
      num: 0,
      playerOrder: getPlayerOrder(name, batsmenList),
      sub: 0,
    };
  }

  // 5. Player Boundaries (e.g. "Yuvraj Samra Boundaries", "Arjun Kumal Boundaries")
  if (
    name.includes("boundar") ||
    name.includes("four hitter") ||
    name.includes("six hitter") ||
    name.includes("most 4s") ||
    name.includes("most 6s")
  ) {
    return {
      group: 5,
      num: 0,
      playerOrder: getPlayerOrder(name, batsmenList),
      sub: 0,
    };
  }

  // 6. Other Wicket markets
  if (name.includes("wicket") || name.includes("wkt")) {
    return {
      group: 6,
      num: extractWicketNumber(name),
      sub: 0,
    };
  }

  // 7. Balls faced / Dismissals / Bowler markets
  if (
    name.includes("ball face") ||
    name.includes("caught") ||
    name.includes("bowler") ||
    name.includes("dot")
  ) {
    return {
      group: 7,
      num: 0,
      sub: 0,
    };
  }

  // 8. Other / Miscellaneous
  return {
    group: 8,
    num: 0,
    sub: 0,
  };
};

export const sortFancyOdds = (items = []) => {
  // Keep the exact order received from the API. Do not apply client-side sorting.
  return Array.isArray(items) ? items : [];
};

const getDataWithSelectionId = (selectionId, currentOddsBetData) => {
  const data = currentOddsBetData?.filter((data) => {
    if (!data || typeof data.selectionId === "undefined") {
      return false;
    }

    const condition =
      data.selectionId?.toString().trim() === selectionId?.toString().trim();

    return condition;
  });

  return data;
};

const getSumOfAgainstForSingleSelection = (againstData, backSize, laySize) => {
  if (!againstData || !Array.isArray(againstData)) {
    return null;
  }

  // Separate back and lay bets with their prices and sizes

  const backBets = againstData?.filter((bet) => bet.type === "Back");

  const layBets = againstData?.filter((bet) => bet.type === "Lay");

  const filteredBetsOnPrice = againstData?.filter((bet) => {
    if (bet.type === "Lay") {
      return backBets.some(
        (bps) =>
          (bet.price <= bps.price && bet.size !== bps.size) ||
          (bet.size === bps.size && bet.price > bps.price),
      );
    }

    if (bet.type === "Back") {
      return layBets.some(
        (lps) =>
          (bet.size === lps.size && bet.price < lps.price) ||
          (bet.price <= lps.price && lps.size !== bet.size),
      );
    }

    return false;
  });

  // Remaining bets

  const remainingAgainstData = againstData?.filter(
    (item) => !filteredBetsOnPrice.includes(item),
  );

  // Calculate againstValue

  const againstValue = remainingAgainstData?.reduce((sum, bet) => {
    const margin = parseFloat(bet.againstMargin);

    if (backSize >= laySize) {
      return sum + margin;
    }

    return sum + (bet.type === "Lay" ? margin : -margin);
  }, 0);

  // Calculate reagainstValue

  const reagainstValue = filteredBetsOnPrice?.reduce((sum, bet) => {
    const margin = parseFloat(bet.againstMargin);

    return sum + (bet.type === "Back" ? parseFloat(bet.favourMargin) : -margin);
  }, 0);

  return Math.abs(reagainstValue - againstValue);
};

function FancyOdds({ f, s, sportsbookOdds, fancyOdds, scoreData }) {
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId");

  const userInteractedRef = useRef(false);

  const premiumCricket = useSelector(Premiumcricket());

  const hasFancyData = useMemo(() => {
    return Array.isArray(fancyOdds) && fancyOdds.length > 0;
  }, [fancyOdds]);

  const hasSportsbookData = useMemo(() => {
    return Array.isArray(sportsbookOdds) && sportsbookOdds.length > 0;
  }, [sportsbookOdds]);

  const canShowSportsbook =
    (s === "true" && Boolean(premiumCricket)) || hasSportsbookData;

  const [selectedMarketTab, setSelectedMarketTab] = useState(() => {
    if (Array.isArray(fancyOdds) && fancyOdds.length > 0) {
      return "f";
    }

    if (Array.isArray(sportsbookOdds) && sportsbookOdds.length > 0) {
      return "s";
    }

    if (f === "false" && s === "true") {
      return "s";
    }

    return "f";
  });

  const [selectedFancyFilterTab, setSelectedFancyFilterTab] = useState("ALL");

  const [selectedSbFilterTab, setSelectedSbFilterTab] = useState("ALL");

  const [tabs22, setTabs22] = useState(["ALL"]);

  // Reset manual interaction when navigating between matches

  useEffect(() => {
    userInteractedRef.current = false;
  }, [eventId]);

  // Default tab logic:

  // 1) When fancy data is absent/empty -> Sportsbook opens by default

  // 2) When fancy data is present -> Fancy Bet opens by default

  useEffect(() => {
    if (userInteractedRef.current) return;

    if (hasFancyData) {
      setSelectedMarketTab("f");
    } else if (hasSportsbookData || canShowSportsbook) {
      setSelectedMarketTab("s");
    } else if (f === "true") {
      setSelectedMarketTab("f");
    }
  }, [hasFancyData, hasSportsbookData, canShowSportsbook, f]);

  useEffect(() => {
    const categoryMap = {};

    (Array.isArray(sportsbookOdds) ? sportsbookOdds : []).forEach((m) => {
      const cat = m.marketType || "Other";

      if (!categoryMap[cat]) categoryMap[cat] = 0;

      categoryMap[cat]++;
    });

    const dynamicTabs = Object.keys(categoryMap);

    setTabs22(["ALL", ...dynamicTabs].sort((a, b) => a.localeCompare(b)));
  }, [sportsbookOdds]);

  if (fancyOdds?.length == 0 && sportsbookOdds?.length == 0) {
    return null;
  }

  return (
    <div className="flex flex-col bg-[white]">
      <div className="flex flex-row items-center mt-3">
        {f === "true" && (
          <ClippedMarketTab
            title="Fancy Bet"
            bgLeft="bg-cyan-700"
            bgRight="bg-cyan-500"
            isTopLeftRounded={false}
            handleClickLeft={() => {
              userInteractedRef.current = true;

              setSelectedMarketTab("f");
            }}
            handleClickRight={() => { }}
          />
        )}

        {canShowSportsbook && (
          <ClippedMarketTab
            title="Sportsbook"
            bgLeft="bg-[#f26d1c]"
            bgRight="bg-[#f58b30]"
            isTopLeftRounded={true}
            handleClickLeft={() => {
              userInteractedRef.current = true;

              setSelectedMarketTab("s");
            }}
            handleClickRight={() => { }}
          />
        )}
      </div>

      {f === "true" && selectedMarketTab === "f" && (
        <MarketFilterTabBar
          tabs={tabs11}
          bgFrom="from-cyan-500"
          bgTo="to-cyan-700"
          bg="bg-[#ffffff80]"
          setSelectedFilterTab={setSelectedFancyFilterTab}
        />
      )}

      {canShowSportsbook && selectedMarketTab === "s" && (
        <MarketFilterTabBar
          tabs={tabs22}
          bgFrom="from-[#d14100]"
          bgTo="to-[#f26d1c]"
          bg="bg-[#ffffff80]"
          setSelectedFilterTab={setSelectedSbFilterTab}
        />
      )}

      {f === "true" && selectedMarketTab === "f" && (
        <FancyTabPane
          selectedFancyFilterTab={selectedFancyFilterTab}
          fancyOdds={fancyOdds}
          scoreData={scoreData}
        />
      )}

      {canShowSportsbook && selectedMarketTab === "s" && (
        <SportsbookTabPane
          sportsbookOdds={sportsbookOdds}
          activeTab={selectedSbFilterTab}
        />
      )}
    </div>
  );
}

const FancyTabPane = ({ selectedFancyFilterTab, fancyOdds, scoreData }) => {
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);

  const [searchParams] = useSearchParams();

  const sportId = Number(searchParams.get("eventType"));

  const competitionId = searchParams.get("competitionId");

  const matchId = searchParams.get("eventId");

  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);

  const [selfSelectedSize, setSelfSelectedSize] = useState(0);

  const [selectedSelectionId, setSelectedSelectionId] = useState(null);

  const [selectedBetType, setSelectedBetType] = useState(null);

  const { bets } = useSelector((state) => state?.account);

  const filteredBets = bets?.filter(
    (bet) =>
      bet.matchId.toString() === matchId.toString() &&
      bet.markettype === "Fancy",
  );

  const handleSetActiveBet = (bet) => {
    if (!bet) {
      setSelectedSelectionId(null);

      setSelectedBetType(null);

      setSelfSelectedOdds(0);
    }
  };

  const handleMarketCellClick = (
    betBoxBgColor,

    price,

    size,

    selectionId,

    betType,
  ) => {
    setSelfSelectedOdds(price);

    setSelfSelectedSize(size);

    setSelectedSelectionId(selectionId);

    setSelectedBetType(betType);

    dispatch(
      handleOpenPlaceBet({
        sportName: sportsMapping[sportId],

        sportId: sportId,

        competitionId,

        market: "Fancy",

        markettype: "Fancy",

        marketId: selectionId,

        selectionId,

        betBoxBgColor,

        betType,
      }),
    );
  };

  const fancyOddsData = useMemo(() => {
    const raw = Array.isArray(fancyOdds) ? fancyOdds : [];

    return sortFancyOdds(raw);
  }, [fancyOdds]);

  // Retain all backend markets without dropping past overs or causing fluctuating visibility
  const liveFancyOddsData = fancyOddsData;

  useEffect(() => {
    if (selectedSelectionId && Array.isArray(fancyOdds)) {
      const activeItem = fancyOdds.find(
        (item) =>
          String(item?.oddsData?.runners?.[0]?.selectionId) ===
          String(selectedSelectionId),
      );

      if (activeItem) {
        const rawStatus = activeItem?.oddsData?.status || "";

        const gameStatus = rawStatus.toLowerCase();

        const isSusp =
          gameStatus !== "" &&
          gameStatus !== "active" &&
          gameStatus !== "online";

        if (isSusp) {
          setSelectedSelectionId(null);

          setSelectedBetType(null);

          setSelfSelectedOdds(0);

          dispatch(handleCancelPlaceBet());
        }
      }
    }
  }, [
    fancyOdds,
    liveFancyOddsData,
    selectedSelectionId,
    dispatch,
  ]);

  const filteredData =
    selectedFancyFilterTab === "ALL" || selectedFancyFilterTab === "Fancy"
      ? liveFancyOddsData
      : liveFancyOddsData?.filter((item) => {
        const find =
          selectedFancyFilterTab === "Ball by Ball"
            ? "ball"
            : selectedFancyFilterTab.toLowerCase();

        return item?.marketName?.toLowerCase()?.includes(find);
      });

  const [activeInfoId, setActiveInfoId] = useState(null);

  return (
    <div className="w-full flex flex-col h-full bg-[white]">
      {/* Header Row */}

      <div className="w-full flex flex-row justify-between border-b border-[#7e97a7] mt-[0.5px]">
        <div
          className={`w-full flex flex-grow ${isMobile ? "w-[50%]" : "w-[30%]"
            } px-2 py-1`}
        />

        <div
          className={`flex justify-end ${isMobile ? "w-[50%]" : "w-[70%]"
            } text-xs font-bold`}
        >
          <div
            style={{
              color: "#000000",

              fontFamily: "Tahoma, Helvetica, sans-serif",
            }}
            className="w-1/2 bg-[#FAA9BA] flex justify-center items-center py-1 font-bold"
          >
            No
          </div>

          <div
            style={{
              color: "#000000",

              fontFamily: "Tahoma, Helvetica, sans-serif",
            }}
            className="w-1/2 bg-[#72BBEF] flex justify-center items-center py-1 font-bold"
          >
            Yes
          </div>
        </div>
      </div>

      {/* Odds Rows */}

      {Array.isArray(filteredData) &&
        filteredData?.map((market, index) => {
          const {
            marketId,

            marketName,

            min,

            max,

            runnersData,

            oddsData,

            news,
          } = market;

          const runner = oddsData?.runners?.[0] || {};

          const selectionId = runner.selectionId;

          const layPrice = runner?.price?.lay?.[0]?.price;

          const laySize = runner?.price?.lay?.[0]?.size;

          const backPrice = runner?.price?.back?.[0]?.price;

          const backSize = runner?.price?.back?.[0]?.size;

          const rawStatus = oddsData?.status || "";

          // const news = oddsData?.news || "";

          const gameStatus = rawStatus.toLowerCase();

          const isSuspended =
            gameStatus !== "" &&
            gameStatus !== "active" &&
            gameStatus !== "online";

          // Allow decimal odds & runs (0.1, 0.2, 1.5, etc.) coming from API
          // if (
          //   isDecimal(layPrice) ||
          //   isDecimal(backPrice) ||
          //   laySize > 500 ||
          //   backSize > 500
          // ) {
          //   return null;
          // }

          const runnerName =
            runnersData?.[selectionId] ??
            runnersData?.[String(selectionId)] ??
            marketName;

          let subject;

          subject = categorizeQuery(marketName);

          const LocalDataWithSelectionId = getDataWithSelectionId(
            selectionId,

            filteredBets,
          );

          const currentOddsBetData = filteredBets?.find(
            (item) => item?.selectionId === selectionId,
          );

          const betBackSize = currentOddsBetData?.backSize;

          const betLaySize = currentOddsBetData?.laySize;

          return (
            <Fragment key={marketId || index}>
              <div className="w-full flex flex-row justify-between border-b border-[#7e97a7]">
                <div
                  className={`w-full flex flex-col flex-grow ${isMobile ? "w-[50%]" : "w-[30%]"
                    } pl-2 pr-1 py-1 text-[11px] font-bold items-start justify-center text-black dark:text-white`}
                >
                  <FancyBook
                    fancyBook={{
                      currentOddsBetDataOfThisMarket:
                        LocalDataWithSelectionId || [],

                      marketRunnerName: runnerName,

                      subject,

                      min,

                      max,

                      id: index,
                    }}
                    activeInfoId={activeInfoId}
                    setActiveInfoId={setActiveInfoId}
                  />

                  {LocalDataWithSelectionId?.length > 0 &&
                    (() => {
                      const againstVal = getSumOfAgainstForSingleSelection(
                        LocalDataWithSelectionId,

                        betBackSize,

                        betLaySize,
                      );

                      const numVal = Number(againstVal || 0);

                      return (
                        <span className="flex items-center text-[#D0021B] cursor-pointer text-[10px] font-bold mt-0.5">
                          <FaArrowRight
                            className="mr-0.5 inline-block"
                            size={10.5}
                            style={{ stroke: "currentColor", strokeWidth: 24 }}
                          />
                          -{Math.abs(numVal).toFixed(2)}
                        </span>
                      );
                    })()}
                </div>

                {/* Odds Cells */}

                {(() => {
                  const isLayActive =
                    selectedSelectionId === selectionId &&
                    Number(selfSelectedOdds) > 0 &&
                    selectedBetType === "Lay";

                  const isBackActive =
                    selectedSelectionId === selectionId &&
                    Number(selfSelectedOdds) > 0 &&
                    selectedBetType === "Back";

                  return (
                    <div
                      className={`flex justify-end ${isMobile ? "w-[50%]" : "w-[70%]"
                        } ${isSuspended ? "aura-suspended" : ""}`}
                      data-label={
                        isSuspended
                          ? gameStatus === "ball running" ||
                            gameStatus === "ballrun" ||
                            gameStatus.includes("ball")
                            ? "Ballrun"
                            : rawStatus
                              ? rawStatus.charAt(0).toUpperCase() +
                              rawStatus.slice(1).toLowerCase()
                              : "Suspended"
                          : ""
                      }
                    >
                      <div
                        onClick={() => {
                          handleMarketCellClick(
                            "#FAA9BA",

                            layPrice,

                            laySize,

                            selectionId,

                            "Lay",
                          );
                        }}
                        className={`w-1/2 flex flex-col justify-center items-center px-1 py-1 text-nowrap transition-colors ${isLayActive
                          ? "market-cell-active-lay"
                          : "bg-[#FAA9BA]"
                          }`}
                      >
                        <p
                          className="text-[12px] font-bold"
                          style={{
                            color: isLayActive ? "#ffffff" : "#000000",

                            fontFamily: "Tahoma, Helvetica, sans-serif",
                          }}
                        >
                          {layPrice ?? "0"}
                        </p>

                        <p
                          className="text-[11px]"
                          style={{
                            color: isLayActive ? "#ffffff" : "#000000",

                            fontFamily: "Tahoma, Helvetica, sans-serif",
                          }}
                        >
                          {laySize ?? "0"}
                        </p>
                      </div>

                      <div
                        onClick={() => {
                          handleMarketCellClick(
                            "#72BBEF",

                            backPrice,

                            backSize,

                            selectionId,

                            "Back",
                          );
                        }}
                        className={`w-1/2 flex flex-col justify-center items-center px-1 py-1 text-nowrap transition-colors ${isBackActive
                          ? "market-cell-active-back"
                          : "bg-[#72BBEF]"
                          }`}
                      >
                        <p
                          className="text-[12px] font-bold"
                          style={{
                            color: isBackActive ? "#ffffff" : "#000000",

                            fontFamily: "Tahoma, Helvetica, sans-serif",
                          }}
                        >
                          {backPrice ?? "0"}
                        </p>

                        <p
                          className="text-[11px]"
                          style={{
                            color: isBackActive ? "#ffffff" : "#000000",

                            fontFamily: "Tahoma, Helvetica, sans-serif",
                          }}
                        >
                          {backSize ?? "0"}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {selectedSelectionId === selectionId && Number(selfSelectedOdds) > 0 && (
                <PlaceBet
                  sportName={sportsMapping[sportId]}
                  sportId={sportId}
                  competitionId={competitionId}
                  marketId={selectionId}
                  market="Fancy"
                  markettype="Fancy"
                  selectionId={selectionId}
                  selection={runnerName}
                  selectedOdds={selfSelectedOdds}
                  selectedSize={selfSelectedSize}
                  isFancyBet={true}
                  setActiveBet={handleSetActiveBet}
                  runners={[
                    {
                      runnerName,

                      selectionId,
                    },
                  ]}
                  backSize={backSize}
                  laySize={laySize}
                  suspendNow={isSuspended ? "aura-suspended" : ""}
                  min={
                    min ??
                    market?.minBet ??
                    market?.minL ??
                    oddsData?.min ??
                    oddsData?.minBet
                  }
                  max={
                    max ??
                    market?.maxBet ??
                    market?.maxL ??
                    oddsData?.max ??
                    oddsData?.maxBet
                  }
                />
              )}

              {news && (
                <div
                  className="w-full  m-0 p-0 rounded-none shadow-[inset_0_2px\_#0000001a]"
                  style={{
                    background: "#c2d5e4",

                    transition: "width .4s ease",
                  }}
                >
                  <marquee
                    className="block h-[25px] leading-[25px] m-0 p-0 text-[13px] text-[#3b5160] font-bold uppercase"
                    scrollamount="4"
                  >
                    {news || ""}
                  </marquee>
                </div>
              )}
            </Fragment>
          );
        })}
    </div>
  );
};

const SportsbookTabPane = ({ sportsbookOdds, activeTab }) => {
  const sbOdds = Array.isArray(sportsbookOdds) ? sportsbookOdds : [];

  const filteredOdds =
    activeTab === "ALL"
      ? sbOdds
      : sbOdds.filter((m) => (m.marketType || "Other") === activeTab);

  return (
    <div className="flex flex-col">
      {Array.isArray(filteredOdds) &&
        filteredOdds.map((market) => (
          <SportsbookMarketContainer key={market.marketId} market={market} />
        ))}
    </div>
  );
};

const SportsbookMarketContainer = React.memo(
  function SportsbookMarketContainer({ market }) {
    const { marketId, marketName, runnersData, oddsData, min, max } = market;

    const runners = oddsData?.runners || [];

    const marketStatus = oddsData?.status || "";

    const [showMarket, setShowMarket] = useState(true);

    const [activeBet, setActiveBet] = useState(null);

    const [searchParams] = useSearchParams();

    const eventId = searchParams.get("eventId");

    const sportId = Number(searchParams.get("eventType"));

    const eventName = searchParams.get("eventName");

    const competitionId = searchParams.get("competitionId");

    const placedBets = useSelector((state) => state.account.bets);

    const placedBetsInThisMarket = useMemo(
      () =>
        placedBets.filter(
          (pb) =>
            pb?.marketId == marketId &&
            pb.market == "Premium Cricket" &&
            pb.event == eventName,
        ),

      [placedBets, marketId, eventName],
    );

    // runners in the shape MarketRunnerContainer/PlaceBet expect

    const mappedRunners = useMemo(
      () =>
        runners.map((r) => ({
          runnerName:
            runnersData?.[r.selectionId] ??
            runnersData?.[String(r.selectionId)],

          selectionId: r.selectionId,
        })),

      [runners, runnersData],
    );

    return (
      <div className="flex flex-col mt-1">
        <div className="w-full min-h-7 flex flex-row items-center justify-between px-2 py-1 bg-gradient-to-t from-[#d14100] to-[#f26d1c] text-white text-xs font-bold">
          {marketName}

          <span className="flex flex-row items-center">
            {/* <IoInformationCircleOutline size={14} color='white' /> */}

            <div
              role="button"
              onClick={() => setShowMarket((prev) => !prev)}
              className="rounded-full bg-aura-blue-gradient text-white ml-[6px]"
            >
              {showMarket ? (
                <CiCircleMinus size={18} />
              ) : (
                <CiCirclePlus size={18} />
              )}
            </div>
          </span>
        </div>

        {showMarket && (
          <div>
            {runners.map((runner) => {
              const runnerId = runner.selectionId;

              const runnerName =
                runnersData?.[runnerId] ?? runnersData?.[String(runnerId)];

              const backPrice = runner?.price?.back?.[0]?.price;

              const backSize = runner?.price?.back?.[0]?.size || "100000";

              return (
                <MarketRunnerContainer
                  placedBetsInThisMarket={placedBetsInThisMarket}
                  key={runnerId}
                  marketId={marketId}
                  marketName={marketName}
                  runnerName={runnerName}
                  backPrice={backPrice}
                  backSize={backSize}
                  runnerId={runnerId}
                  runners={mappedRunners}
                  activeBet={activeBet}
                  setActiveBet={setActiveBet}
                  runnerStatus={runner.status}
                  marketStatus={marketStatus}
                  min={
                    min ??
                    market?.minBet ??
                    market?.minL ??
                    oddsData?.min ??
                    oddsData?.minBet
                  }
                  max={
                    max ??
                    market?.maxBet ??
                    market?.maxL ??
                    oddsData?.max ??
                    oddsData?.maxBet
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

export const MarketRunnerContainer = React.memo(
  ({
    placedBetsInThisMarket = [],

    marketName,

    marketId,

    runner,

    runnerData,

    marketRunners,

    setActiveBet,

    activeBet,

    runnerName,

    runners,

    backPrice,

    backSize,

    runnerId,

    runnerStatus,

    marketStatus,

    min,

    max,
  }) => {
    const dispatch = useDispatch();

    const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);

    const [searchParams] = useSearchParams();

    const sportId = Number(searchParams.get("eventType"));

    const eventId = searchParams.get("eventId");

    const competitionId = searchParams.get("competitionId");

    const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);

    const handleMarketCellClick = (betBoxBgColor, price, betType) => {
      setSelfSelectedOdds(price);

      dispatch(
        handleOpenPlaceBet({
          sportName: sportsMapping[sportId],

          sportId: sportId,

          competitionId,

          marketId,

          market: "Premium Cricket",

          markettype: "Match Odds",

          selectionId: runnerId,

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
              fb.selectionId.toString() === runnerId.toString() &&
              eventId.toString() === fb.matchId.toString() &&
              fb.marketId === marketId,
          ) || [];

        const fbOfOtherRunners =
          filteredBets?.filter(
            (fb) =>
              fb.selectionId.toString() !== runnerId.toString() &&
              eventId.toString() === fb.matchId.toString() &&
              fb.marketId === marketId,
          ) || [];

        let placedBetCalculation =
          fbOfThisRunner.reduce(
            (acc, fbr) =>
              acc +
              (fbr.type === "Back" ? fbr.favourMargin : -fbr.againstMargin),

            0,
          ) +
          fbOfOtherRunners.reduce(
            (acc, fbor) =>
              acc +
              (fbor.type === "Back" ? -fbor.againstMargin : fbor.favourMargin),

            0,
          );

        return placedBetCalculation;
      },

      [placedBetsInThisMarket, eventId],
    );

    const placedBetCalculation = calculateBetValues(runner, marketId);

    const newCalc =
      activeBet && Number(activeBet?.stake) > 0
        ? runnerId === activeBet?.selectionId
          ? activeBet?.favourMargin.toFixed(1)
          : activeBet?.againstMargin.toFixed(1)
        : null;

    const normalizedRunnerStatus = runnerStatus?.toLowerCase();

    const normalizedMarketStatus = marketStatus?.toLowerCase();

    const isActiveStatus = (s) => s === "active" || s === "online";

    return (
      <div key={runnerId} className="relative w-full">
        <div className="w-full flex items-stretch justify-between min-h-11 border-b-[1px] border-[#7e97a7] bg-[white] border-t-[0.3px]">
          {/* Runner Column */}

          <div
            className={`flex flex-col justify-center w-[${isMobile ? "65%" : "30%"
              }] pl-2 pr-1 py-1`}
          >
            <p className="text-[13px] font-bold text-black dark:text-white">
              {runnerName || "unknown"}
            </p>

            {/* {activeBet && newCalc && <p className={`flex flex-row items-center text-[10px] font-bold ${newCalc > 0 ? "text-green-600" : "text-red-500"}`}> <span> <ImArrowRight className='mr-1' /> </span> {Math.abs(newCalc)} </p>} */}

            <div className="flex flex-row items-center">
              {placedBetCalculation !== 0 && (
                <p
                  className={`flex flex-row items-center text-[10px] font-bold ${placedBetCalculation > 0
                    ? "text-[#228B22]"
                    : "text-[#D0021B]"
                    }`}
                >
                  <span>
                    <FaArrowRight
                      className="mr-1 inline-block"
                      size={10.5}
                      style={{ stroke: "currentColor", strokeWidth: 24 }}
                    />
                  </span>

                  {placedBetCalculation < 0 ? "-" : ""}

                  {Math.abs(placedBetCalculation).toFixed(2)}
                </p>
              )}

              {activeBet && newCalc && Number(newCalc) !== 0 && (
                <p
                  className={`flex flex-row items-center text-[10px] font-bold ${placedBetCalculation === 0 ? "" : "ml-0.5"
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
              )}
            </div>
          </div>

          {/* MarketCell Column */}

          <div
            className={`

                ${!isActiveStatus(normalizedRunnerStatus) ||
                !isActiveStatus(normalizedMarketStatus) ||
                !backPrice
                ? "aura-suspended"
                : ""
              }

                flex flex-wrap flex-grow w-[${isMobile ? "35%" : "70%"}]`}
            data-label={
              !isActiveStatus(normalizedRunnerStatus) ||
                !isActiveStatus(normalizedMarketStatus) ||
                !backPrice
                ? "SUSPENDED"
                : ""
            }
          >
            <MarketCell
              handleMarketCellClick={handleMarketCellClick}
              price={backPrice}
              size={backSize}
              bgColor="#72e29f"
              betType="Back"
            />
          </div>
        </div>

        {selfSelectedOdds > 0 && (
          <PlaceBet
            sportName={sportsMapping[sportId]}
            sportId={sportId}
            competitionId={competitionId}
            marketId={marketId}
            market="Premium Cricket"
            markettype="Match Odds"
            selectionId={runnerId}
            selection={runnerName}
            selectedOdds={selfSelectedOdds}
            setActiveBet={setActiveBet}
            suspendNow={`${!isActiveStatus(normalizedRunnerStatus) ||
              !isActiveStatus(normalizedMarketStatus) ||
              !backPrice
              ? "aura-suspended"
              : ""
              }`}
            runners={runners}
            question={marketName}
            min={min}
            max={max}
          />
        )}
      </div>
    );
  },
);

const MarketFilterTabBar = ({
  tabs,

  bgFrom,

  bgTo,

  bg,

  setSelectedFilterTab,
}) => {
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    setSelectedFilterTab(activeTab);

    return () => { };
  }, [activeTab]);

  return (
    <div
      className={`flex flex-row w-full max-[350px]:overflow-x-auto min-[361px]:overflow-x-hidden scrollbar-hide items-center justify-center max-[350px]:justify-start bg-gradient-to-t ${bgFrom} ${bgTo} px-1 py-1`}
    >
      <div className={`${bg} rounded-md w-max flex items-center space-x-1`}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-[5px] py-[2px] rounded-sm text-[12px] font-[700] whitespace-nowrap transition-colors duration-200 ${activeTab === tab
              ? "bg-light-bg dark:bg-dark-bg text-black dark:text-white shadow"
              : "text-black/80 hover:text-black"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

const ClippedMarketTab = ({
  title,

  bgLeft,

  bgRight,

  isTopLeftRounded = false,

  handleClickLeft,

  handleClickRight,
}) => {
  return (
    <div
      className={`flex flex-row justify-center items-center h-[30px] w-fit overflow-hidden text-white font-bold text-sm ${isTopLeftRounded ? "rounded-tl-md" : ""
        }`}
    >
      <div
        onClick={() => handleClickLeft()}
        className={`${bgLeft} pl-2 pr-3 flex flex-row justify-center items-center h-[30px] text-xs font-bold`}
      >
        {title}
      </div>

      <div
        className={`${bgRight} px-3 py-1 flex items-center justify-center h-[30px] w-[40px]`}
        style={{
          clipPath:
            "polygon(58% 0, 65% 1%, 71% 4%, 76% 9%, 80% 15%, 83% 22%, 100% 100%, 0 100%, 0 0, 21% 0)",
        }}
        onClick={() => handleClickRight()}
      >
        <IoInformationCircleOutline className="ml-[-2px]" size={16} />
      </div>
    </div>
  );
};

export default FancyOdds;
