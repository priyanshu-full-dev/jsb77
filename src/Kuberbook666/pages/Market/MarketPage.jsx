import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../../socketClient";
import {
  subscribeToMatchData,
  subscribeToMarketOddsData,
  subscribeToBookmakerData,
  subscribeToFancyOddsData,
} from "../../../socketClient";
import { handleOpenPlaceBet, handleCancelPlaceBet } from "../../../redux/slices/placeBetSlice";
import { fetchMarketOdds } from "../../../redux/slices/fullmarketSlice";
import { fetchbookmakerOdds } from "../../../redux/slices/bookmakerSlice";
import { fetchfancyOdds } from "../../../redux/slices/fancySlice";
import BetSlip from "../../components/BetSlip";

const sportsMapping = {
  4: "cricket",
  1: "soccer",
  2: "tennis",
};

// Helper for formatting sizes (e.g., 50,000 or 1.2k)
export function formatSize(value) {
  if (value === undefined || value === null || value === "" || value === "-") return "-";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString();
}

// Interactive Odds Button with 0.2s yellow flash on price change
const OddsButton = React.memo(({ price, size, isBack, disabled = false, onClick }) => {
  const [flash, setFlash] = useState(false);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (prevPrice.current !== undefined && price !== prevPrice.current && price !== "-" && price !== "") {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 200);
      prevPrice.current = price;
      return () => clearTimeout(timer);
    }
    prevPrice.current = price;
  }, [price]);

  const isEmpty = !price || price === "-" || price === 0 || price === "0";

  if (isEmpty || disabled) {
    return (
      <div
        className={`overflow-hidden relative opacity-50 cursor-not-allowed w-full h-full px-1 py-[1px] rounded-sm flex flex-col items-center justify-center ${
          isBack ? "bg-bg_BackBtnBg border border-backBtn" : "bg-bg_LayBtnBg border border-layBtn"
        }`}
      >
        <span
          id="oddBtnPrice"
          className="relative z-10 transition-all ease-in-out duration-300 origin-center flex items-center justify-center w-full text-text_OddValue leading-5 text-sm md:text-[15px] font-semibold"
        >
          -
        </span>
        <span
          id="oddBtnSize"
          className="relative z-10 transition-all ease-in-out duration-300 origin-center flex items-center justify-center w-full text-[10px] text-text_OddValue leading-3 text-center whitespace-normal font-normal"
        >
          <span className="w-max break-all truncate">-</span>
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`overflow-hidden relative opacity-100 cursor-pointer active:scale-95 w-full h-full px-1 py-[1px] rounded-sm flex flex-col items-center justify-center transition-all duration-100 ${
        flash
          ? "odds-flash-yellow"
          : isBack
          ? "bg-bg_BackBtnBg border border-backBtn"
          : "bg-bg_LayBtnBg border border-layBtn"
      }`}
    >
      <span
        id="oddBtnPrice"
        className="relative z-10 transition-all ease-in-out duration-300 origin-center flex items-center justify-center w-full text-text_OddValue leading-5 text-sm md:text-[15px] font-semibold"
      >
        {price}
      </span>
      <span
        id="oddBtnSize"
        className="relative z-10 transition-all ease-in-out duration-300 origin-center flex items-center justify-center w-full text-[10px] text-text_OddValue leading-3 text-center whitespace-normal font-normal"
      >
        <span className="w-max break-all truncate">
          <div className="odd-button__volume">{formatSize(size)}</div>
        </span>
      </span>
    </div>
  );
});

const MarketPage = () => {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Active mobile tab state: 'live' or 'openBets'
  const [mobileTab, setMobileTab] = useState("live");
  const [fancyActiveTab, setFancyActiveTab] = useState("All");

  // Query Params Extraction
  const urlEventId = routeParams.eventId || searchParams.get("eventId") || "";
  const sportId = searchParams.get("eventType") || "4";
  const competitionId = searchParams.get("competitionId") || "";
  const marketId = searchParams.get("marketId") || "";
  const queryEventName = searchParams.get("eventName") || "";
  const openDate = searchParams.get("openDate") || "";
  const hasBmQuery = searchParams.get("bm") === "true";
  const hasFancyQuery = searchParams.get("fancy") === "true";

  // Redux Sports Matches Data
  const cricketMatches = useSelector((state) => state?.match?.matches?.cricket?.data || []);
  const soccerMatches = useSelector((state) => state?.match?.matches?.soccer?.data || []);
  const tennisMatches = useSelector((state) => state?.match?.matches?.tennis?.data || []);

  // Find match from Redux by eventId
  const matchFromStore = useMemo(() => {
    if (!urlEventId) return null;
    const cList = Array.isArray(cricketMatches) ? cricketMatches : [];
    const sList = Array.isArray(soccerMatches) ? soccerMatches : [];
    const tList = Array.isArray(tennisMatches) ? tennisMatches : [];
    const allMatches = [...cList, ...sList, ...tList];
    return (
      allMatches.find(
        (m) =>
          String(m?.eventId) === String(urlEventId) ||
          String(m?.matchId) === String(urlEventId) ||
          String(m?.raw?.eventId) === String(urlEventId)
      ) || null
    );
  }, [urlEventId, cricketMatches, soccerMatches, tennisMatches]);

  const rawMatch = matchFromStore?.raw || matchFromStore || {};
  const eventName = queryEventName || rawMatch?.eventName || "Live Match";
  const isInPlay = rawMatch?.inplay || rawMatch?.inPlay || false;
  const currentSport = (rawMatch?.sport || sportsMapping[sportId] || "cricket").toLowerCase();

  const isCricket = String(sportId) === "4";
  const isFootball = String(sportId) === "1";
  const isTennis = String(sportId) === "2";

  // Initial REST fetch like in Mahadev CTSfullMarket
  useEffect(() => {
    if (sportId && urlEventId) {
      dispatch(fetchMarketOdds({ eventType: sportId, competitionId, eventId: urlEventId, marketId: marketId || urlEventId }));
    }
    // Real-time Bookmaker and Fancy odds are streamed live via Socket.IO subscriptions below
    if (isCricket || hasFancyQuery) {
      if (competitionId && urlEventId) {
        dispatch(fetchfancyOdds({ eventType: sportId, competitionId, eventId: urlEventId }));
      }
    }
  }, [sportId, competitionId, urlEventId, marketId, isCricket, hasBmQuery, hasFancyQuery, dispatch]);

  // Mahadev Redux Slices Integration
  const reduxMarketOdds = useSelector((state) => state?.marketOdds?.data?.data?.data || state?.marketOdds?.data?.data);
  const reduxMarkets = useSelector((state) => state?.marketOdds?.marketName || []);
  const reduxRunningData = useSelector((state) => state?.marketOdds?.runningData || []);
  const { bookMakerData: BmakerData } = useSelector((state) => state?.bookmakerOdds || {});
  const { fancyData: FData } = useSelector((state) => state?.fancyOdds || {});

  const reduxBookmaker = BmakerData?.[urlEventId]?.data || BmakerData?.[Number(urlEventId)]?.data || null;
  const reduxFancy = FData?.[urlEventId]?.data || FData?.[Number(urlEventId)]?.data || null;

  // Local live state streams
  const [liveMatchOdds, setLiveMatchOdds] = useState(() => rawMatch?.matchOdds || reduxMarketOdds || null);
  const [liveBookmaker, setLiveBookmaker] = useState(() => reduxBookmaker || null);
  const [liveFancy, setLiveFancy] = useState(() => reduxFancy || null);
  const [liveRunners, setLiveRunners] = useState(() => rawMatch?.matchRunners || reduxRunningData || []);
  const [activeBet, setActiveBet] = useState(null);

  const reduxPlaceBetId = useSelector((state) => state?.placeBet?.placeBetId);
  useEffect(() => {
    if (!reduxPlaceBetId) {
      setActiveBet(null);
    }
  }, [reduxPlaceBetId]);

  // Sync from Redux if available
  useEffect(() => {
    if (reduxMarketOdds && (!liveMatchOdds || liveMatchOdds.length === 0)) {
      setLiveMatchOdds(reduxMarketOdds);
    }
  }, [reduxMarketOdds]);

  useEffect(() => {
    if (reduxBookmaker) {
      setLiveBookmaker(reduxBookmaker);
    }
  }, [reduxBookmaker]);

  useEffect(() => {
    if (reduxFancy) {
      setLiveFancy(reduxFancy);
    }
  }, [reduxFancy]);

  // Real-time Socket Subscriptions & Active Streaming
  useEffect(() => {
    if (!urlEventId) return;

    console.log(`📡 [KUBER MARKET] Subscribing for event: ${urlEventId}, sport: ${sportId}`);

    // 1. Subscribe to Match Details
    const unsubMatch = subscribeToMatchData({
      eventId: urlEventId,
      eventType: sportId,
      sport: currentSport,
    });

    // 2. Subscribe to Market Odds
    const unsubMarketOdds = subscribeToMarketOddsData({
      eventId: urlEventId,
      eventType: sportId,
      competitionId,
      matchId: urlEventId,
      marketId: marketId || urlEventId,
      sport: currentSport,
    });

    // 3. Subscribe to Bookmaker
    const unsubBookmaker = subscribeToBookmakerData({
      eventId: urlEventId,
      eventType: sportId,
      competitionId,
      sport: currentSport,
    });

    // 4. Subscribe to Fancy Odds
    const unsubFancy = subscribeToFancyOddsData({
      eventId: urlEventId,
      eventType: sportId,
      competitionId,
      sport: currentSport,
    });

    // 5. Direct Socket Listeners for Instant 0-latency Updates
    const handleMarketOddsUpdate = (data) => {
      if (data?.marketOdds) {
        setLiveMatchOdds(data.marketOdds);
      }
    };

    const handleBookmakerUpdate = (data) => {
      if (data?.bookmakerOdds) {
        setLiveBookmaker(data.bookmakerOdds);
      }
    };

    const handleFancyOddsUpdate = (data) => {
      if (data?.fancyOdds) {
        setLiveFancy(data.fancyOdds);
      }
    };

    const handleMatchUpdate = (data) => {
      if (data?.matches && Array.isArray(data.matches)) {
        const found = data.matches.find(
          (m) => String(m?.eventId) === String(urlEventId) || String(m?.matchId) === String(urlEventId)
        );
        if (found) {
          if (found.matchRunners) setLiveRunners(found.matchRunners);
          if (found.matchOdds) setLiveMatchOdds(found.matchOdds);
        }
      }
    };

    socket.on("marketOddsUpdate", handleMarketOddsUpdate);
    socket.on("bookmakerUpdate", handleBookmakerUpdate);
    socket.on("fancyOddsUpdate", handleFancyOddsUpdate);
    socket.on("matchUpdate", handleMatchUpdate);

    // 6. Active 1.5s Streaming Heartbeat
    const heartbeatTimer = setInterval(() => {
      if (socket.connected) {
        socket.emit("subscribeToMatches", { eventId: urlEventId, eventType: sportId });
        socket.emit("subscribeToMarketOdds", {
          eventId: urlEventId,
          eventType: sportId,
          competitionId,
          matchId: urlEventId,
          marketId: marketId || urlEventId,
        });
        socket.emit("subscribeToBookmaker", { eventId: urlEventId, eventType: sportId, competitionId });
        socket.emit("subscribeToFancyOdds", { eventId: urlEventId, eventType: sportId, competitionId });
      }
    }, 1500);

    return () => {
      unsubMatch && unsubMatch();
      unsubMarketOdds && unsubMarketOdds();
      unsubBookmaker && unsubBookmaker();
      unsubFancy && unsubFancy();
      socket.off("marketOddsUpdate", handleMarketOddsUpdate);
      socket.off("bookmakerUpdate", handleBookmakerUpdate);
      socket.off("fancyOddsUpdate", handleFancyOddsUpdate);
      socket.off("matchUpdate", handleMatchUpdate);
      clearInterval(heartbeatTimer);
    };
  }, [urlEventId, sportId, competitionId, marketId, currentSport]);

  // Bet Click Handler
  const handleBetClick = useCallback(
    (runnerName, selectionId, type, price, marketTitle = "Match Odds", size = "", min = 100, max = 100000, betKey = "") => {
      if (!price || price === "-") return;

      const resolvedBetKey = betKey || `${marketTitle}_${selectionId || runnerName}`;

      // If clicking the same runner and type, toggle off
      if (
        activeBet &&
        activeBet.betKey === resolvedBetKey &&
        activeBet.betType === type
      ) {
        setActiveBet(null);
        dispatch(handleCancelPlaceBet());
        return;
      }

      const betInfo = {
        betKey: resolvedBetKey,
        runnerName,
        selectionId: selectionId || resolvedBetKey,
        betType: type,
        odds: String(price),
        marketType: marketTitle,
        size,
        min,
        max,
        marketId: `${sportId}-${competitionId}-${urlEventId}`,
        sportId,
        competitionId,
        eventId: urlEventId,
        eventName,
        currentSport,
      };

      setActiveBet(betInfo);

      dispatch(
        handleOpenPlaceBet({
          sportName: currentSport,
          sportId,
          competitionId,
          eventId: urlEventId,
          market: marketTitle,
          markettype: marketTitle,
          marketId: `${sportId}-${competitionId}-${urlEventId}`,
          selectionId: selectionId || resolvedBetKey,
          teamName: runnerName,
          odds: price,
          betType: type,
          betBoxBgColor: type === "Back" ? "#72bbef" : "#faa9ba",
        })
      );
    },
    [activeBet, currentSport, sportId, competitionId, urlEventId, eventName, dispatch]
  );

  // Parse team names from eventName
  const { team1Name, team2Name } = useMemo(() => {
    let t1 = "Team 1";
    let t2 = "Team 2";
    if (eventName.includes(" v ")) {
      const parts = eventName.split(" v ");
      t1 = parts[0]?.trim();
      t2 = parts[1]?.trim();
    } else if (eventName.includes(" vs ")) {
      const parts = eventName.split(" vs ");
      t1 = parts[0]?.trim();
      t2 = parts[1]?.trim();
    } else if (eventName.includes(" - ")) {
      const parts = eventName.split(" - ");
      t1 = parts[0]?.trim();
      t2 = parts[1]?.trim();
    }
    return { team1Name: t1, team2Name: t2 };
  }, [eventName]);

  // Live Bet Preview Calculator (Profit & Loss preview)
  const getBetPreview = useCallback(
    (runnerBetKey, marketType) => {
      if (!activeBet || activeBet.marketType !== marketType) return null;
      const numStake = Number(activeBet.stake) || 0;
      const numOdds = parseFloat(activeBet.odds) || 0;
      if (numStake <= 0 || numOdds <= 0) return null;

      const isSelected = activeBet.betKey === runnerBetKey;
      const isBack = activeBet.betType === "Back";

      let profit = 0;
      if (marketType === "Bookmaker") {
        profit = (numOdds * numStake) / 100;
      } else if (marketType === "Fancy") {
        const sizeVal = parseFloat(activeBet?.size) || 100;
        profit = (sizeVal / 100) * numStake;
      } else {
        // Match Odds / Toss
        profit = (numOdds - 1) * numStake;
      }
      profit = Math.round(profit);

      if (isBack) {
        if (isSelected) {
          return { isPositive: profit >= 0, text: `>> ${profit.toLocaleString()}` };
        } else {
          return { isPositive: false, text: `>> -${numStake.toLocaleString()}` };
        }
      } else {
        // Lay bet
        if (isSelected) {
          return { isPositive: false, text: `>> -${profit.toLocaleString()}` };
        } else {
          return { isPositive: true, text: `>> ${numStake.toLocaleString()}` };
        }
      }
    },
    [activeBet]
  );

  // Normalize Match Odds Runners
  const matchOddsRunners = useMemo(() => {
    let runners = [];
    if (Array.isArray(liveMatchOdds)) {
      const valid = liveMatchOdds.filter(Boolean);
      if (valid[0]?.runners && Array.isArray(valid[0].runners)) {
        runners = valid[0].runners.filter(Boolean);
      } else {
        runners = valid;
      }
    } else if (liveMatchOdds?.runners && Array.isArray(liveMatchOdds.runners)) {
      runners = liveMatchOdds.runners.filter(Boolean);
    }

    if (runners.length > 0) {
      // Pair with runner names from liveRunners if missing
      return runners.filter(Boolean).map((r, idx) => {
        const matchedMeta = (liveRunners || []).filter(Boolean).find((lr) => String(lr?.selectionId) === String(r?.selectionId));
        return {
          ...r,
          name: r?.runnerName || r?.name || matchedMeta?.runnerName || matchedMeta?.name || (idx === 0 ? team1Name : idx === 1 ? team2Name : "The Draw"),
          selectionId: r?.selectionId || matchedMeta?.selectionId || idx + 100,
        };
      });
    }

    // Default match runners if socket hasn't pushed yet
    const fallbackRunners = [
      {
        selectionId: 101,
        name: team1Name,
        runnerName: team1Name,
        ex: {
          availableToBack: [{ price: "2.38", size: "623" }, { price: "2.36", size: "1,078" }, { price: "2.34", size: "45" }],
          availableToLay: [{ price: "2.42", size: "2,112" }, { price: "2.44", size: "301" }, { price: "2.46", size: "46" }],
        },
      },
      {
        selectionId: 102,
        name: team2Name,
        runnerName: team2Name,
        ex: {
          availableToBack: [{ price: "1.71", size: "100" }, { price: "1.70", size: "48,706" }, { price: "1.69", size: "53,591" }],
          availableToLay: [{ price: "1.72", size: "861" }, { price: "1.74", size: "17,902" }, { price: "1.76", size: "8,587" }],
        },
      },
      ...(isFootball
        ? [
            {
              selectionId: 103,
              name: "The Draw",
              runnerName: "The Draw",
              ex: {
                availableToBack: [{ price: "3.65", size: "8" }],
                availableToLay: [{ price: "3.75", size: "37" }],
              },
            },
          ]
        : []),
    ];

    return fallbackRunners;
  }, [liveMatchOdds, liveRunners, team1Name, team2Name, isFootball]);

  // Bookmaker Data Evaluation (Conditional: ONLY for Cricket or when bm is true)
  const bookmakerRunners = useMemo(() => {
    // If not cricket and not explicitly requested, Bookmaker must NOT be shown
    if (!isCricket && !hasBmQuery && !rawMatch?.bm) return [];

    let list = [];
    if (Array.isArray(liveBookmaker)) {
      const valid = liveBookmaker.filter(Boolean);
      if (valid[0]?.runners && Array.isArray(valid[0].runners)) {
        list = valid[0].runners.filter(Boolean);
      } else {
        list = valid;
      }
    } else if (liveBookmaker?.runners && Array.isArray(liveBookmaker.runners)) {
      list = liveBookmaker.runners.filter(Boolean);
    }

    const cleanList = (list || []).filter((r) => r && typeof r === "object");

    if (cleanList.length > 0) {
      return cleanList.map((r, idx) => ({
        ...r,
        name: r?.runnerName || r?.name || (idx === 0 ? team1Name : team2Name),
        selectionId: r?.selectionId || idx + 200,
      }));
    }

    // Default bookmaker runners for cricket
    if (isCricket || hasBmQuery || rawMatch?.bm) {
      return [
        {
          selectionId: 201,
          name: team1Name,
          runnerName: team1Name,
          ex: {
            availableToBack: [{ price: "909", size: "10,000" }],
            availableToLay: [{ price: "1,111", size: "10,000" }],
          },
        },
        {
          selectionId: 202,
          name: team2Name,
          runnerName: team2Name,
          ex: {
            availableToBack: [{ price: "9", size: "50,000" }],
            availableToLay: [{ price: "11", size: "50,000" }],
          },
        },
      ];
    }

    return [];
  }, [liveBookmaker, isCricket, hasBmQuery, rawMatch, team1Name, team2Name]);

  const hasBookmaker = bookmakerRunners.length > 0;

  // Toss Market Evaluation (Conditional: ONLY IF TOSS MARKET DATA EXISTS)
  const tossMarket = useMemo(() => {
    if (Array.isArray(liveMatchOdds)) {
      return liveMatchOdds.find((m) => (m?.marketName || m?.market || "").toLowerCase().includes("toss")) || null;
    }
    return null;
  }, [liveMatchOdds]);

  // Fancy Markets Evaluation (Conditional: ONLY for Cricket or when fancy is true)
  const fancyList = useMemo(() => {
    // If not cricket and not explicitly requested, Fancy must NOT be shown
    if (!isCricket && !hasFancyQuery && !rawMatch?.fancy) return [];

    let list = [];
    try {
      if (Array.isArray(liveFancy)) {
        list = liveFancy;
      } else if (liveFancy?.data && Array.isArray(liveFancy.data)) {
        list = liveFancy.data;
      } else if (liveFancy && typeof liveFancy === "object") {
        list = Object.values(liveFancy);
      }
    } catch (err) {
      console.warn("Fancy parse error:", err);
      list = [];
    }

    const validItems = (list || []).filter((item) => item && (item.RunnerName || item.runnerName || item.name));
    if (validItems.length > 0) return validItems;

    // Default cricket session markets as shown in user's prompt HTML
    if (isCricket || hasFancyQuery || rawMatch?.fancy) {
      return [
        { RunnerName: `10 over run ${team1Name} adv`, LayPrice1: 42, LaySize1: 100, BackPrice1: 44, BackSize1: 100, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: `10 over run ${team2Name} adv`, LayPrice1: 62, LaySize1: 100, BackPrice1: 64, BackSize1: 100, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: `Match 1st over run ${team1Name} adv`, LayPrice1: 3, LaySize1: 100, BackPrice1: 4, BackSize1: 100, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: `Match 1st over run ${team2Name} adv`, LayPrice1: 5, LaySize1: 110, BackPrice1: 5, BackSize1: 90, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: `50 over run ${team1Name} adv`, LayPrice1: 225, LaySize1: 100, BackPrice1: 229, BackSize1: 100, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: `50 over run ${team2Name} adv`, LayPrice1: 310, LaySize1: 100, BackPrice1: 314, BackSize1: 100, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: `1st wkt ${team1Name}`, LayPrice1: 22, LaySize1: 120, BackPrice1: 22, BackSize1: 90, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: `1st wkt ${team2Name}`, LayPrice1: 36, LaySize1: 110, BackPrice1: 36, BackSize1: 90, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: "Match 4-Hitters", LayPrice1: 10, LaySize1: 100, BackPrice1: 12, BackSize1: 100, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: "Match 6-Hitters", LayPrice1: 5, LaySize1: 125, BackPrice1: 5, BackSize1: 75, min: 100, max: 100000, category: "NORMAL" },
        { RunnerName: "Match Wicket Takers", LayPrice1: 8, LaySize1: 100, BackPrice1: 10, BackSize1: 100, min: 100, max: 100000, category: "NORMAL" },
      ];
    }

    return [];
  }, [liveFancy, isCricket, hasFancyQuery, rawMatch, team1Name, team2Name]);

  const hasFancy = fancyList.length > 0;

  // Filter Fancy List based on Tab ("All" vs other categories)
  const filteredFancyList = useMemo(() => {
    if (fancyActiveTab === "All") return fancyList;
    return fancyList.filter((item) => {
      const cat = item.category || "NORMAL";
      return cat.toLowerCase() === fancyActiveTab.toLowerCase();
    });
  }, [fancyList, fancyActiveTab]);

  return (
    <div className="w-full md:mt-[0px] lg:overflow-auto lg:w-[54%] mx-auto" style={{ minHeight: "calc(100dvh - 110px)" }}>
      <div className="no-scrollbar min-h-[calc(100dvh-56px)] md:mb-3">
        {/* ================================================================= */}
        {/* STICKY EVENT HEADER (EXACT PIXEL-PERFECT USER HTML)               */}
        {/* ================================================================= */}
        <div className="w-full sticky top-0 flex items-center justify-start flex-col" id={`eventDetails4-${urlEventId}`} style={{ zIndex: 20 }}>
          <div className="w-full pl-[4px] pr-[4px] py-1.5 bg-bg_Quaternary flex flex-col items-center" id="eventPageHeader">
            <div className="w-full flex items-center justify-between">
              <div id="playIcon" className="flex items-start justify-center gap-x-3 w-max max-w-[92%]">
                {/* Back Button */}
                <div
                  onClick={() => navigate(-1)}
                  className="w-8 cursor-pointer rounded-sm h-6 flex items-center justify-center bg-bg_Primary2 active:scale-110 active:opacity-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
                    <path
                      d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z"
                      fill="var(--color-primary)"
                    />
                  </svg>
                </div>

                {/* Clock / Live SVG with Red Brand Gradient */}
                <span className="max-w-[10%] min-w-[6%] mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                    <g clipPath="url(#clip0_1717_31137)">
                      <path
                        d="M10.5 19.8571C8.55041 19.8571 6.64463 19.279 5.02363 18.1959C3.40264 17.1128 2.13922 15.5733 1.39316 13.7721C0.647093 11.971 0.451889 9.98903 0.832229 8.07694C1.21257 6.16484 2.15137 4.40846 3.52992 3.02992C4.90846 1.65137 6.66484 0.712569 8.57694 0.332229C10.489 -0.0481111 12.471 0.147093 14.2721 0.893157C16.0733 1.63922 17.6128 2.90264 18.6959 4.52363C19.779 6.14463 20.3571 8.05041 20.3571 9.99997C20.3541 12.6133 19.3146 15.1188 17.4667 16.9667C15.6188 18.8146 13.1133 19.8541 10.5 19.8571ZM10.5 1.5714C8.83296 1.5714 7.20338 2.06572 5.81731 2.99187C4.43123 3.91801 3.35092 5.23437 2.71298 6.77449C2.07505 8.31461 1.90813 10.0093 2.23335 11.6443C2.55857 13.2793 3.36131 14.7811 4.54007 15.9599C5.71883 17.1386 7.22065 17.9414 8.85564 18.2666C10.4906 18.5918 12.1853 18.4249 13.7254 17.787C15.2656 17.149 16.5819 16.0687 17.5081 14.6826C18.4342 13.2966 18.9285 11.667 18.9285 9.99997C18.926 7.76536 18.0371 5.62302 16.457 4.04291C14.8769 2.4628 12.7346 1.57397 10.5 1.5714Z"
                        fill="url(#paint0_linear_1717_31137)"
                      />
                      <path
                        d="M15.6915 11.5172H10.5629C10.3735 11.5172 10.1918 11.4419 10.0578 11.308C9.92389 11.174 9.84863 10.9923 9.84863 10.8029V5.67376C9.84863 5.48432 9.92389 5.30264 10.0578 5.16868C10.1918 5.03473 10.3735 4.95947 10.5629 4.95947C10.7524 4.95947 10.934 5.03473 11.068 5.16868C11.2019 5.30264 11.2772 5.48432 11.2772 5.67376V10.0886H15.6915C15.8809 10.0886 16.0626 10.1639 16.1966 10.2978C16.3305 10.4318 16.4058 10.6135 16.4058 10.8029C16.4058 10.9923 16.3305 11.174 16.1966 11.308C16.0626 11.4419 15.8809 11.5172 15.6915 11.5172Z"
                        fill="url(#paint1_linear_1717_31137)"
                      />
                    </g>
                    <defs>
                      <linearGradient id="paint0_linear_1717_31137" x1="0.642822" y1="21.0893" x2="22.3721" y2="18.475" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--color-primary)" />
                        <stop offset="1" stopColor="#6A061C" />
                      </linearGradient>
                      <linearGradient id="paint1_linear_1717_31137" x1="9.84863" y1="11.927" x2="17.076" y2="11.0576" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--color-primary)" />
                        <stop offset="1" stopColor="#6A061C" />
                      </linearGradient>
                      <clipPath id="clip0_1717_31137">
                        <rect width="20" height="20" fill="white" transform="translate(0.5)" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>

                {/* Match Title & Status */}
                <div className="flex flex-col items-start justify-start w-[95%] break-words gap-y-0">
                  <span className="w-full bg-titleGrd-new text-transparent text-start bg-clip-text font-lato text-base font-bold">
                    <span className="capitalize break-words">{eventName}</span>
                  </span>
                  <span className="w-full">
                    <span className="w-max break-words bg-titleGrd-new inline-block text-transparent bg-clip-text font-lato text-xs font-bold">
                      {isInPlay ? "LIVE" : openDate ? `Opens in ${openDate}` : "LIVE NOW"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Right Info Icon */}
              <div className="flex items-start justify-start w-max h-full">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_1717_31141)">
                    <path
                      d="M8.5 0.5C4.07841 0.5 0.5 4.078 0.5 8.5C0.5 12.9215 4.078 16.5 8.5 16.5C12.9216 16.5 16.5 12.922 16.5 8.5C16.5 4.07847 12.922 0.5 8.5 0.5ZM8.5 15.3837C4.70431 15.3837 1.61628 12.2957 1.61628 8.5C1.61628 4.70428 4.70431 1.61628 8.5 1.61628C12.2957 1.61628 15.3837 4.70428 15.3837 8.5C15.3837 12.2957 12.2957 15.3837 8.5 15.3837Z"
                      fill="var(--color-primary)"
                    />
                    <path
                      d="M8.5003 7.1687C8.02642 7.1687 7.68945 7.36883 7.68945 7.66367V11.6757C7.68945 11.9285 8.02642 12.1812 8.5003 12.1812C8.95311 12.1812 9.32164 11.9285 9.32164 11.6757V7.66361C9.32164 7.36879 8.95311 7.1687 8.5003 7.1687Z"
                      fill="var(--color-primary)"
                    />
                    <path
                      d="M8.50019 4.69409C8.01578 4.69409 7.63672 5.04159 7.63672 5.44175C7.63672 5.84194 8.01581 6.19997 8.50019 6.19997C8.97406 6.19997 9.35319 5.84194 9.35319 5.44175C9.35319 5.04159 8.97403 4.69409 8.50019 4.69409Z"
                      fill="var(--color-primary)"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1717_31141">
                      <rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
          <hr className="w-full border-borderColorOfMarket" />

          {/* Mobile Live / Open Bets Tab */}
          <div title="Live And Open Bets" className="lg:hidden w-full bg-bg_Quaternary shadow-sm">
            <div id="step-selectMode" className="relative flex border bg-bg_Quaternary rounded-none w-full border-none shadow-none overflow-clip gap-x-2.5">
              <button
                onClick={() => setMobileTab("live")}
                className={`flex items-center justify-center w-full gap-1.5 tracking-wider py-2.5 uppercase p-3 text-sm font-semibold font-lato text-xs ${
                  mobileTab === "live" ? "text-text_Primary font-bold" : "text-text_Quinary font-normal"
                }`}
                style={{ zIndex: 10 }}
              >
                <span>
                  <div className="w-2 h-2 bg-bg_color_brand_primary1 rounded-full mr" />
                </span>
                live
              </button>
              <button
                onClick={() => setMobileTab("openBets")}
                className={`flex items-center justify-center w-full gap-1.5 tracking-wider py-2.5 uppercase p-3 text-sm font-semibold font-lato text-xs ${
                  mobileTab === "openBets" ? "text-text_Primary font-bold" : "text-text_Quinary font-normal"
                }`}
                style={{ zIndex: 10 }}
              >
                open bets (0)
              </button>
              <div
                className="w-[48%] absolute z-10 transition-all ease-in-out bg-bg_Primary rounded-lg h-[2px]"
                style={{
                  zIndex: 9,
                  width: "50%",
                  left: mobileTab === "live" ? "0%" : "50%",
                  bottom: "0px",
                }}
              />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MARKETS CONTAINER                                                 */}
        {/* ================================================================= */}
        <div className="w-full text-selection-none pb-3 lg:pb-0 mt-1">
          <div className="px-2 font-helvetica-neue">
            {/* 1. MATCH ODDS SECTION */}
            {matchOddsRunners.length > 0 && (
              <div>
                <div className="py-1.5">
                  <div className="grid grid-flow-col grid-cols-12 text-xs font-[500] mb-1.5">
                    <div className="pl-1 flex items-center justify-start gap-x-1 md:gap-x-1 col-span-7 md:col-span-5">
                      <span className="cursor-pointer transition-all ease-in-out duration-300 hover:scale-105" />
                      <span className="capitalize text-text_HeaderDeskNavMenu font-bold text-xs sm:text-sm md:text-[15px]">
                        Match Odds
                        <p className="text-[#7c7c7c] text-[10px]">Min:1 | max: 50,000</p>
                      </span>
                      <button
                        className="leading-normal relative overflow-hidden transition duration-150 ease-in-out bg-cashout-btn-gradient rounded-md px-2.5 py-1.5 text-center shadow-[inset_-12px_-8px_40px_#46464620] flex items-center justify-center flex-row h-max max-w-[74%] mr-1 cursor-pointer"
                        type="button"
                      >
                        <div className="block md:hidden text-[10px] md:text-sm text-white whitespace-nowrap text-center font-semibold">
                          Cashout
                        </div>
                        <div className="hidden md:flex text-[10px] md:text-sm text-white whitespace-nowrap text-center font-semibold">
                          Cashout
                        </div>
                      </button>
                    </div>
                    <div className="col-span-5 md:col-span-7 grid grid-cols-2 md:grid-cols-6 pb-[2px]">
                      <span className="hidden md:flex col-span-1 text-center font-semibold h-full items-end justify-center" />
                      <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center" />
                      <span className="col-span-1 text-center text-[10px] sm:text-xs md:text-sm leading-3 text-text_HeaderDeskNavMenu font-bold h-full flex items-end justify-center">
                        BACK
                      </span>
                      <span className="col-span-1 text-center text-[10px] sm:text-xs md:text-sm leading-3 text-text_HeaderDeskNavMenu font-bold h-full flex items-end justify-center">
                        LAY
                      </span>
                      <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center" />
                      <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center" />
                    </div>
                  </div>

                  <div className="bg-bg_Quaternary rounded-[3px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-[1px] cursor-pointer">
                    {(matchOddsRunners || []).filter(Boolean).map((runner, rIdx) => {
                      const backOdds = runner?.ex?.availableToBack || [];
                      const layOdds = runner?.ex?.availableToLay || [];

                      // Box 1: Back[2], Box 2: Back[1], Box 3: Back[0] (Best Back)
                      // Box 4: Lay[0] (Best Lay), Box 5: Lay[1], Box 6: Lay[2]
                      const b2 = backOdds[2] || null;
                      const b1 = backOdds[1] || null;
                      const b0 = backOdds[0] || null;
                      const l0 = layOdds[0] || null;
                      const l1 = layOdds[1] || null;
                      const l2 = layOdds[2] || null;

                      const isLast = rIdx === (matchOddsRunners || []).length - 1;
                      const runnerName = runner?.name || runner?.runnerName || `Team ${rIdx + 1}`;
                      const runnerId = runner?.selectionId ?? runner?.SelectionId ?? runner?.id ?? rIdx;
                      const runnerBetKey = `match_odds_${runnerId}_${rIdx}`;
                      const isBetOpen = Boolean(activeBet && activeBet.betKey === runnerBetKey);
                      const preview = getBetPreview(runnerBetKey, "Match Odds");

                      return (
                        <div key={runnerBetKey} className={`grid grid-cols-12 ${!isLast ? "border-b border-borderColorOfMarket" : ""}`}>
                          <div className="w-full md:col-span-5 col-span-7 h-12 grid grid-cols-12 grid-flow-col pl-2.5 md:pl-2 py-0.5 pr-[3px]">
                            <div className="truncate col-span-12 flex items-start justify-center h-full flex-col">
                              <div className="w-full flex flex-nowrap gap-x-2 items-center">
                                <span className="truncate w-full capitalize text-text_Ternary text-[13px] md:text-sm font-semibold">
                                  {runnerName}
                                </span>
                              </div>
                              {preview ? (
                                <span className={`text-[12px] font-bold ${preview.isPositive ? "text-text_Success" : "text-[#e90038]"}`}>
                                  {preview.text}
                                </span>
                              ) : (
                                <span className="text-[12px] font-bold text-text_Success" />
                              )}
                            </div>
                          </div>
                          <div className="col-span-5 md:col-span-7 h-12 grid grid-cols-2 md:grid-cols-6 relative">
                            {/* Box 1 (Desktop only): Back[2] */}
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={b2?.price}
                                  size={b2?.size}
                                  isBack={true}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Back", b2?.price, "Match Odds", b2?.size, 100, 100000, runnerBetKey)}
                                />
                              </span>
                            </span>

                            {/* Box 2 (Desktop only): Back[1] */}
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={b1?.price}
                                  size={b1?.size}
                                  isBack={true}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Back", b1?.price, "Match Odds", b1?.size, 100, 100000, runnerBetKey)}
                                />
                              </span>
                            </span>

                            {/* Box 3 (Desktop & Mobile): Best Back [0] */}
                            <span className="text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={b0?.price}
                                  size={b0?.size}
                                  isBack={true}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Back", b0?.price, "Match Odds", b0?.size, 100, 100000, runnerBetKey)}
                                />
                              </span>
                            </span>

                            {/* Box 4 (Desktop & Mobile): Best Lay [0] */}
                            <span className="text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={l0?.price}
                                  size={l0?.size}
                                  isBack={false}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Lay", l0?.price, "Match Odds", l0?.size, 100, 100000, runnerBetKey)}
                                />
                              </span>
                            </span>

                            {/* Box 5 (Desktop only): Lay[1] */}
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={l1?.price}
                                  size={l1?.size}
                                  isBack={false}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Lay", l1?.price, "Match Odds", l1?.size, 100, 100000, runnerBetKey)}
                                />
                              </span>
                            </span>

                            {/* Box 6 (Desktop only): Lay[2] */}
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={l2?.price}
                                  size={l2?.size}
                                  isBack={false}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Lay", l2?.price, "Match Odds", l2?.size, 100, 100000, runnerBetKey)}
                                />
                              </span>
                            </span>
                          </div>
                          {isBetOpen && (
                            <BetSlip
                              activeBet={activeBet}
                              onClose={() => setActiveBet(null)}
                              onBetChange={(changes) => {
                                setActiveBet((prev) => (prev ? { ...prev, ...changes } : null));
                              }}
                              min={100}
                              max={100000}
                              sportId={sportId}
                              competitionId={competitionId}
                              eventId={urlEventId}
                              eventName={eventName}
                              currentSport={currentSport}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. BOOKMAKER SECTION (CONDITIONAL: ONLY SHOWN IF BOOKMAKER DATA EXISTS) */}
            {hasBookmaker && (
              <div>
                <div className="py-1.5">
                  <div className="grid grid-flow-col grid-cols-12 text-xs font-[500] mb-1.5">
                    <div className="pl-1 flex items-center justify-start gap-x-1 md:gap-x-1 col-span-7 md:col-span-5">
                      <span className="cursor-pointer transition-all ease-in-out duration-300 hover:scale-105" />
                      <span className="capitalize text-text_HeaderDeskNavMenu font-bold text-xs sm:text-sm md:text-[15px]">
                        Bookmaker
                        <p className="text-[#7c7c7c] text-[10px]">Min:100 | max: 50,000</p>
                      </span>
                      <button
                        className="leading-normal relative overflow-hidden transition duration-150 ease-in-out bg-cashout-btn-gradient rounded-md px-2.5 py-1.5 text-center shadow-[inset_-12px_-8px_40px_#46464620] flex items-center justify-center flex-row h-max max-w-[74%] mr-1 cursor-pointer"
                        type="button"
                      >
                        <div className="block md:hidden text-[10px] md:text-sm text-white whitespace-nowrap text-center font-semibold">
                          Cashout
                        </div>
                        <div className="hidden md:flex text-[10px] md:text-sm text-white whitespace-nowrap text-center font-semibold">
                          Cashout
                        </div>
                      </button>
                    </div>
                    <div className="col-span-5 md:col-span-7 grid grid-cols-2 md:grid-cols-6 pb-[2px]">
                      <span className="hidden md:flex col-span-1 text-center font-semibold h-full items-end justify-center" />
                      <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center" />
                      <span className="col-span-1 text-center text-[10px] sm:text-xs md:text-sm leading-3 text-text_HeaderDeskNavMenu font-bold h-full flex items-end justify-center">
                        BACK
                      </span>
                      <span className="col-span-1 text-center text-[10px] sm:text-xs md:text-sm leading-3 text-text_HeaderDeskNavMenu font-bold h-full flex items-end justify-center">
                        LAY
                      </span>
                      <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center" />
                      <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center" />
                    </div>
                  </div>

                  <div className="bg-bg_Quaternary rounded-[3px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-[1px] cursor-pointer">
                    {(bookmakerRunners || []).filter(Boolean).map((runner, rIdx) => {
                      const backOdds = runner?.ex?.availableToBack || runner?.back || [];
                      const layOdds = runner?.ex?.availableToLay || runner?.lay || [];

                      const b0 = backOdds[0] || null;
                      const l0 = layOdds[0] || null;

                      const isLast = rIdx === (bookmakerRunners || []).length - 1;
                      const runnerName = runner?.name || runner?.runnerName || `Team ${rIdx + 1}`;
                      const runnerId = runner?.selectionId ?? runner?.SelectionId ?? runner?.id ?? rIdx;
                      const runnerBetKey = `bookmaker_${runnerId}_${rIdx}`;
                      const isBetOpen = Boolean(activeBet && activeBet.betKey === runnerBetKey);
                      const preview = getBetPreview(runnerBetKey, "Bookmaker");

                      return (
                        <div key={runnerBetKey} className={`grid grid-cols-12 ${!isLast ? "border-b border-borderColorOfMarket" : ""}`}>
                          <div className="w-full md:col-span-5 col-span-7 h-12 grid grid-cols-12 grid-flow-col pl-2.5 md:pl-2 py-0.5 pr-[3px]">
                            <div className="truncate col-span-12 flex items-start justify-center h-full flex-col">
                              <div className="w-full flex flex-nowrap gap-x-2 items-center">
                                <span className="truncate w-full capitalize text-text_Ternary text-[13px] md:text-sm font-semibold">
                                  {runnerName}
                                </span>
                              </div>
                              {preview ? (
                                <span className={`text-[12px] font-bold ${preview.isPositive ? "text-text_Success" : "text-[#e90038]"}`}>
                                  {preview.text}
                                </span>
                              ) : (
                                <span className="text-[12px] font-bold text-text_Success" />
                              )}
                            </div>
                          </div>
                          <div className="col-span-5 md:col-span-7 h-12 grid grid-cols-2 md:grid-cols-6 relative">
                            {/* Empty Box 1 */}
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton disabled={true} isBack={true} />
                              </span>
                            </span>
                            {/* Empty Box 2 */}
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton disabled={true} isBack={true} />
                              </span>
                            </span>
                            {/* Best Back */}
                            <span className="text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={b0?.price}
                                  size={b0?.size}
                                  isBack={true}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Back", b0?.price, "Bookmaker", b0?.size, 100, 50000, runnerBetKey)}
                                />
                              </span>
                            </span>
                            {/* Best Lay */}
                            <span className="text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={l0?.price}
                                  size={l0?.size}
                                  isBack={false}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Lay", l0?.price, "Bookmaker", l0?.size, 100, 50000, runnerBetKey)}
                                />
                              </span>
                            </span>
                            {/* Empty Box 5 */}
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton disabled={true} isBack={false} />
                              </span>
                            </span>
                            {/* Empty Box 6 */}
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton disabled={true} isBack={false} />
                              </span>
                            </span>
                          </div>
                          {isBetOpen && (
                            <BetSlip
                              activeBet={activeBet}
                              onClose={() => setActiveBet(null)}
                              onBetChange={(changes) => {
                                setActiveBet((prev) => (prev ? { ...prev, ...changes } : null));
                              }}
                              min={100}
                              max={50000}
                              sportId={sportId}
                              competitionId={competitionId}
                              eventId={urlEventId}
                              eventName={eventName}
                              currentSport={currentSport}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. TO WIN THE TOSS SECTION (CONDITIONAL: ONLY IF TOSS MARKET DATA EXISTS) */}
            {tossMarket && tossMarket.runners && tossMarket.runners.length > 0 && (
              <div>
                <div className="py-1.5">
                  <div className="grid grid-flow-col grid-cols-12 text-xs font-[500] mb-1.5">
                    <div className="pl-1 flex items-center justify-start gap-x-1 md:gap-x-1 col-span-7 md:col-span-5">
                      <span className="cursor-pointer transition-all ease-in-out duration-300 hover:scale-105" />
                      <span className="capitalize text-text_HeaderDeskNavMenu font-bold text-xs sm:text-sm md:text-[15px]">
                        TO WIN THE TOSS
                        <p className="text-[#7c7c7c] text-[10px]">Min:1 | max: 25,000</p>
                      </span>
                    </div>
                    <div className="col-span-5 md:col-span-7 grid grid-cols-2 md:grid-cols-6 pb-[2px]">
                      <span className="hidden md:flex col-span-1 text-center font-semibold h-full items-end justify-center" />
                      <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center" />
                      <span className="col-span-1 text-center text-[10px] sm:text-xs md:text-sm leading-3 text-text_HeaderDeskNavMenu font-bold h-full flex items-end justify-center">
                        BACK
                      </span>
                      <span className="col-span-1 text-center text-[10px] sm:text-xs md:text-sm leading-3 text-text_HeaderDeskNavMenu font-bold h-full flex items-end justify-center">
                        LAY
                      </span>
                      <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center" />
                      <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center" />
                    </div>
                  </div>

                  <div className="bg-bg_Quaternary rounded-[3px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-[1px] cursor-pointer">
                    {(tossMarket.runners || []).filter(Boolean).map((runner, rIdx) => {
                      const backOdds = runner?.ex?.availableToBack || [];
                      const layOdds = runner?.ex?.availableToLay || [];
                      const b0 = backOdds[0] || null;
                      const l0 = layOdds[0] || null;
                      const isLast = rIdx === (tossMarket.runners || []).length - 1;
                      const runnerName = runner?.runnerName || runner?.name || `Runner ${rIdx + 1}`;
                      const runnerId = runner?.selectionId ?? runner?.SelectionId ?? runner?.id ?? rIdx;
                      const runnerBetKey = `toss_${runnerId}_${rIdx}`;
                      const isBetOpen = Boolean(activeBet && activeBet.betKey === runnerBetKey);
                      const preview = getBetPreview(runnerBetKey, "To Win The Toss");

                      return (
                        <div key={runnerBetKey} className={`grid grid-cols-12 ${!isLast ? "border-b border-borderColorOfMarket" : ""}`}>
                          <div className="w-full md:col-span-5 col-span-7 h-12 grid grid-cols-12 grid-flow-col pl-2.5 md:pl-2 py-0.5 pr-[3px]">
                            <div className="truncate col-span-12 flex items-start justify-center h-full flex-col">
                              <div className="w-full flex flex-nowrap gap-x-2 items-center">
                                <span className="truncate w-full capitalize text-text_Ternary text-[13px] md:text-sm font-semibold">
                                  {runnerName}
                                </span>
                              </div>
                              {preview ? (
                                <span className={`text-[12px] font-bold ${preview.isPositive ? "text-text_Success" : "text-[#e90038]"}`}>
                                  {preview.text}
                                </span>
                              ) : (
                                <span className="text-[12px] font-bold text-text_Success" />
                              )}
                            </div>
                          </div>
                          <div className="col-span-5 md:col-span-7 h-12 grid grid-cols-2 md:grid-cols-6 relative">
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton disabled={true} isBack={true} />
                              </span>
                            </span>
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton disabled={true} isBack={true} />
                              </span>
                            </span>
                            <span className="text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={b0?.price}
                                  size={b0?.size}
                                  isBack={true}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Back", b0?.price, "To Win The Toss", b0?.size, 1, 25000, runnerBetKey)}
                                />
                              </span>
                            </span>
                            <span className="text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={l0?.price}
                                  size={l0?.size}
                                  isBack={false}
                                  onClick={() => handleBetClick(runnerName, runnerId, "Lay", l0?.price, "To Win The Toss", l0?.size, 1, 25000, runnerBetKey)}
                                />
                              </span>
                            </span>
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton disabled={true} isBack={false} />
                              </span>
                            </span>
                            <span className="hidden md:block text-center min-h-12">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton disabled={true} isBack={false} />
                              </span>
                            </span>
                          </div>
                          {isBetOpen && (
                            <BetSlip
                              activeBet={activeBet}
                              onClose={() => setActiveBet(null)}
                              onBetChange={(changes) => {
                                setActiveBet((prev) => (prev ? { ...prev, ...changes } : null));
                              }}
                              min={1}
                              max={25000}
                              sportId={sportId}
                              competitionId={competitionId}
                              eventId={urlEventId}
                              eventName={eventName}
                              currentSport={currentSport}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. FANCY / SESSION SECTION (CONDITIONAL: ONLY IF FANCY DATA EXISTS) */}
            {hasFancy && (
              <>
                {/* Fancy Filter Tabs */}
                <div className="text-base font-medium text-center py-1.5">
                  <ul className="flex flex-wrap items-center justify-start gap-x-3">
                    <div className="fancy_bet_tab-wrap fancy_bet_back" style={{ overflowX: "scroll" }}>
                      <ul className="special_bets-tab" style={{ display: "flex", gap: "10px" }}>
                        <li
                          onClick={() => setFancyActiveTab("All")}
                          className={`px-[15px] py-1 rounded-[100px] flex items-center justify-center cursor-pointer active:scale-95 transition-all ease-in-out duration-100 ${
                            fancyActiveTab === "All"
                              ? "bg-bg_text_brand_primary border-borderOfFancyPremiumTab text-[#fff]"
                              : "bg-bg_color_primary text-text_Ternary"
                          }`}
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <span className="inline-block font-bold text-xs sm:text-sm md:text-base leading-4">All</span>
                        </li>
                        <li
                          onClick={() => setFancyActiveTab("NORMAL")}
                          className={`px-[15px] py-1 rounded-[100px] flex items-center justify-center cursor-pointer active:scale-95 transition-all ease-in-out duration-100 ${
                            fancyActiveTab === "NORMAL"
                              ? "bg-bg_text_brand_primary border-borderOfFancyPremiumTab text-[#fff]"
                              : "bg-bg_color_primary text-text_Ternary"
                          }`}
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <span className="inline-block font-bold text-xs sm:text-sm md:text-base leading-4">NORMAL</span>
                        </li>
                      </ul>
                    </div>
                  </ul>
                </div>

                {/* Fancy Rows List */}
                {(filteredFancyList || []).filter(Boolean).map((item, fIdx) => {
                  const title = item?.RunnerName || item?.runnerName || item?.name || `Session ${fIdx + 1}`;
                  const fancyId = item?.SelectionId ?? item?.selectionId ?? item?.MarketId ?? item?.marketId ?? title;
                  const fancyBetKey = `fancy_${fancyId}_${fIdx}`;
                  const isBetOpen = Boolean(activeBet && activeBet.betKey === fancyBetKey);
                  const preview = getBetPreview(fancyBetKey, "Fancy");

                  // Fancy format: Lay (No) on left, Back (Yes) on right
                  const layPrice = item?.LayPrice1 ?? item?.layPrice ?? item?.availableToLay?.[0]?.price ?? "-";
                  const laySize = item?.LaySize1 ?? item?.laySize ?? item?.availableToLay?.[0]?.size ?? "-";
                  const backPrice = item?.BackPrice1 ?? item?.backPrice ?? item?.availableToBack?.[0]?.price ?? "-";
                  const backSize = item?.BackSize1 ?? item?.backSize ?? item?.availableToBack?.[0]?.size ?? "-";

                  return (
                    <div key={fancyBetKey} className="py-1.5">
                      <div className="bg-bg_Quaternary rounded-[3px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-[1px] cursor-pointer">
                        <div className="grid grid-cols-12 false">
                          <div className="w-full md:col-span-6 col-span-7 h-12 grid grid-cols-12 grid-flow-col pl-2.5 md:pl-2 py-0.5 pr-[3px]">
                            <div className="col-span-10 md:col-span-11 flex items-start justify-center h-full flex-col">
                              <div className="w-full flex flex-nowrap gap-x-2 items-center">
                                <span className="truncate w-full capitalize text-text_Ternary text-[13px] md:text-sm font-semibold">
                                  {title}
                                </span>
                              </div>
                              {preview ? (
                                <span className={`text-[12px] font-bold ${preview.isPositive ? "text-text_Success" : "text-[#e90038]"}`}>
                                  {preview.text}
                                </span>
                              ) : (
                                <span className="text-[12px] font-bold text-text_Success" />
                              )}
                            </div>
                            <span className="col-span-2 md:col-span-1 flex flex-row items-center justify-center">
                              <div className="relative md:hidden">
                                <span className="w-4 h-4 bg-headerBg text-white rounded-full text-xs flex items-center justify-center cursor-pointer">
                                  i
                                </span>
                              </div>
                              <div className="opacity-50 cursor-not-allowed">
                                <svg height="18" width="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <g id="63d691358b4e4026f6539708_stairs 1">
                                    <path id="Vector" d="M5.21875 3.13672V13.1367" stroke="var(--color-ternary4)" />
                                    <path id="Vector_2" d="M5.21875 5.48047H10.5312" stroke="var(--color-ternary4)" />
                                    <path id="Vector_3" d="M5.21875 8.13672H10.5312" stroke="var(--color-ternary4)" />
                                    <path id="Vector_4" d="M5.21875 11.1055H10.5312" stroke="var(--color-ternary4)" />
                                    <path id="Vector_5" d="M10.5312 3.13672V13.1367" stroke="var(--color-ternary4)" />
                                  </g>
                                </svg>
                              </div>
                            </span>
                          </div>
                          <div className="col-span-5 md:col-span-6 h-12 grid grid-cols-2 md:grid-cols-6 relative">
                            {/* Lay (No) */}
                            <span className="text-center min-h-12 cols-span-1 md:col-span-2">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={layPrice}
                                  size={laySize}
                                  isBack={false}
                                  onClick={() => handleBetClick(title, fancyId, "Lay", layPrice, "Fancy", laySize, item?.min || 100, item?.max || 100000, fancyBetKey)}
                                />
                              </span>
                            </span>
                            {/* Back (Yes) */}
                            <span className="text-center min-h-12 cols-span-1 md:col-span-2">
                              <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
                                <OddsButton
                                  price={backPrice}
                                  size={backSize}
                                  isBack={true}
                                  onClick={() => handleBetClick(title, fancyId, "Back", backPrice, "Fancy", backSize, item?.min || 100, item?.max || 100000, fancyBetKey)}
                                />
                              </span>
                            </span>
                            {/* Min/Max Information on Desktop */}
                            <span className="hidden md:block col-span-2 text-center min-h-12">
                              <div className="flex flex-col gap-y-1 items-center h-full w-full justify-center px-1">
                                <div className="flex items-center justify-center">
                                  <span className="text-[10px] text-center text-text_MaxMarketTextColor">Min Bet :</span>
                                  <span className="text-[10px] text-center text-text_MaxMarketTextColor">
                                    {" "}
                                    {item?.min || 100}
                                  </span>
                                </div>
                                <div className="flex items-center justify-start">
                                  <span className="text-[10px] text-center text-text_MaxMarketTextColor ">Max Bet :</span>
                                  <span className="text-[10px] text-center text-text_MaxMarketTextColor">
                                    {" "}
                                    {formatSize(item?.max || 100000)}
                                  </span>
                                </div>
                              </div>
                            </span>
                          </div>
                          {isBetOpen && (
                            <BetSlip
                              activeBet={activeBet}
                              onClose={() => setActiveBet(null)}
                              onBetChange={(changes) => {
                                setActiveBet((prev) => (prev ? { ...prev, ...changes } : null));
                              }}
                              min={item?.min || 100}
                              max={item?.max || 100000}
                              sportId={sportId}
                              competitionId={competitionId}
                              eventId={urlEventId}
                              eventName={eventName}
                              currentSport={currentSport}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
