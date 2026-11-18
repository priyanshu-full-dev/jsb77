import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ExposureToast from "../../../components/ExposureToast";
import { handleOpenPlaceBet } from "../../../../../redux/slices/placeBetSlice";
import { displayAuthModal } from "../../../../../redux/slices/authModalSlice";
import { subscribeToAuraOddsData, socket, getFreshAuraOddsCache } from "../../../../../socketClient";
import { setBetData } from "../../../../../redux/slices/fullmarketSlice";
import Loader from "../../../../../utils/Loader";
import RulesModal from "../../FullMarket/CTSfullMarket/RulesModal";
import "../../FullMarket/aura-suspended.css";

import HorseHeader from "./components/HorseHeader";
import HorseCategoryTabs from "./components/HorseCategoryTabs";
import HorseMarketHeader from "./components/HorseMarketHeader";
import HorseRunnerRow from "./components/HorseRunnerRow";
import MarketHeaderBanner from "../../../components/MarketHeaderBanner";

const EMPTY_HORSE_ARRAY = [];

// Matched volume ko K aur M format me convert karna (e.g. 1K instead of 1.0K)
export function formatToKOrM(value) {
  if (value === 0 || value === "0") return 0;
  if (!value) return 0;
  const num = Number(value);
  if (isNaN(num)) return value;
  if (num === 0) return 0;
  if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1);
    return formatted.endsWith(".0") ? `${parseInt(formatted, 10)}M` : `${formatted}M`;
  } else if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1);
    return formatted.endsWith(".0") ? `${parseInt(formatted, 10)}K` : `${formatted}K`;
  }
  return num % 1 === 0 ? String(num) : num.toFixed(1);
}

const isPastOneMinute = (raceName) => {
  if (!raceName) return false;
  const dateTimePart = raceName.replace(/^[^\d]+/, "");
  const currentYear = new Date().getFullYear();
  const raceDate = new Date(`${dateTimePart} ${currentYear}`);
  if (isNaN(raceDate.getTime())) return false;
  raceDate.setMinutes(raceDate.getMinutes() + 1);
  const now = new Date();
  return now > raceDate;
};

const formatRemovalDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    if (hours > 12) hours = hours % 12 || 12;
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
};

const HorseMarket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const [searchParams] = useSearchParams();
  const hasTriggeredClosedRef = useRef(false);

  // Route Params
  const rawGmid = searchParams.get("marketId");
  const rawExEventId = searchParams.get("exEventId");
  const gmid =
    rawGmid && rawGmid !== "undefined" && rawGmid !== "null" ? rawGmid : "";
  const exEventId =
    rawExEventId && rawExEventId !== "undefined" && rawExEventId !== "null"
      ? rawExEventId
      : "";
  const raceName = searchParams.get("raceName") || "Grand National 14:30";

  // Persistent refs across all socket ticks so metadata is never lost
  const racingInfoRef = useRef({});
  const runnersDataRef = useRef({});

  // Redux state
  const bets = useSelector((state) => state.account.bets);
  const { betData } = useSelector((state) => state.marketOdds);
  const auraMatchesHorse = useSelector((state) => {
    const list = state?.auraMatches?.horse?.matches?.data;
    return Array.isArray(list) ? list : EMPTY_HORSE_ARRAY;
  });

  const initialEvent = useMemo(() => {
    return (
      auraMatchesHorse.find((e) => {
        if (
          exEventId &&
          (String(e?.exEventId) === String(exEventId) ||
            String(e?.eventId) === String(exEventId) ||
            String(e?._id) === String(exEventId))
        ) {
          return true;
        }
        if (
          gmid &&
          (String(e?.marketId) === String(gmid) ||
            String(e?.exMarketId) === String(gmid) ||
            String(e?.gmid) === String(gmid))
        ) {
          return true;
        }
        if (
          raceName &&
          e?.eventName &&
          raceName
            .toLowerCase()
            .includes(String(e.eventName).trim().toLowerCase())
        ) {
          return true;
        }
        return false;
      }) || null
    );
  }, [auraMatchesHorse, exEventId, gmid, raceName]);

  const targetExEventId =
    exEventId ||
    initialEvent?.exEventId ||
    initialEvent?.eventId ||
    initialEvent?._id ||
    gmid ||
    initialEvent?.marketId;

  const targetMarketId =
    gmid ||
    initialEvent?.marketId ||
    initialEvent?.exMarketId ||
    initialEvent?.gmid ||
    targetExEventId;

  // Seed runnersData from event if available
  useEffect(() => {
    if (initialEvent?.runnersData && Object.keys(initialEvent.runnersData).length > 0) {
      runnersDataRef.current["_last"] = {
        ...(runnersDataRef.current["_last"] || {}),
        ...initialEvent.runnersData,
      };
    }
  }, [initialEvent]);

  const reduxOdds = useSelector(
    (state) =>
      state?.auraMatches?.oddsCache?.[String(targetExEventId)] ||
      state?.auraMatches?.oddsCache?.[String(targetMarketId)] ||
      null,
  );

  // State
  const [oddsData, setOddsData] = useState(() => {
    return (
      (targetExEventId &&
        getFreshAuraOddsCache(String(targetExEventId), reduxOdds)) ||
      (targetMarketId &&
        getFreshAuraOddsCache(String(targetMarketId), reduxOdds)) ||
      null
    );
  });
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [selectedMarketId, setSelectedMarketId] = useState(targetMarketId);
  const [activeBet, setActiveBet] = useState(null);
  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedRulesMarket, setSelectedRulesMarket] = useState(null);

  useEffect(() => {
    const freshCached =
      (targetExEventId &&
        getFreshAuraOddsCache(String(targetExEventId), reduxOdds)) ||
      (targetMarketId &&
        getFreshAuraOddsCache(String(targetMarketId), reduxOdds)) ||
      null;
    if (freshCached) {
      setOddsData((prev) => prev || freshCached);
      setLoading(false);
    }
  }, [targetExEventId, targetMarketId, reduxOdds]);

  // ==================== AURA ODDS SUBSCRIPTION ====================
  const sportId = "7";

  useEffect(() => {
    if (!targetExEventId || !sportId) return;

    const handler = (data) => {
      const sId = data?.sportId ? String(data.sportId) : null;
      if (sId && sId !== "7") return;

      const eventMatches =
        String(data?.exEventId || data?.eventId || "") === String(targetExEventId) ||
        String(data?.oddsData?.exEventId || data?.oddsData?.eventId || "") === String(targetExEventId) ||
        (targetMarketId &&
          String(data?.marketId || data?.oddsData?.marketId || "") ===
            String(targetMarketId));

      if (!eventMatches) return;

      let incomingOddsData = data?.oddsData || data;
      if (!incomingOddsData) return;

      // Collect all market lists: matchOdds, bookmakers, sportsbook, markets, betfair, data (deduplicated)
      const rawMarkets = [
        ...(Array.isArray(incomingOddsData?.matchOdds) ? incomingOddsData.matchOdds : []),
        ...(Array.isArray(incomingOddsData?.bookmakers) ? incomingOddsData.bookmakers : []),
        ...(Array.isArray(incomingOddsData?.sportsbook) ? incomingOddsData.sportsbook : []),
        ...(Array.isArray(incomingOddsData?.markets) ? incomingOddsData.markets : []),
        ...(Array.isArray(incomingOddsData?.betfair) ? incomingOddsData.betfair : []),
        ...(Array.isArray(incomingOddsData?.data) ? incomingOddsData.data : []),
      ];
      const seenMarketIds = new Set();
      const allMarkets = rawMarkets.filter((m) => {
        const id = m?.marketId || m?.exMarketId || m?.id;
        if (!id) return true;
        const key = String(id);
        if (seenMarketIds.has(key)) return false;
        seenMarketIds.add(key);
        return true;
      });

      incomingOddsData = {
        ...incomingOddsData,
        matchOdds: allMarkets,
      };

      // Retain and preserve full racingInfo & runnersData across delta ticks
      if (Array.isArray(incomingOddsData?.matchOdds)) {
        incomingOddsData.matchOdds.forEach((m) => {
          const mId = String(m.marketId || m.exMarketId || "");

          if (m.racingInfo && Object.keys(m.racingInfo).length > 0) {
            racingInfoRef.current[mId] = {
              ...(racingInfoRef.current[mId] || {}),
              ...m.racingInfo,
            };
            racingInfoRef.current["_last"] = {
              ...(racingInfoRef.current["_last"] || {}),
              ...m.racingInfo,
            };
          } else if (racingInfoRef.current[mId] || racingInfoRef.current["_last"]) {
            // Restore persistent racingInfo so badges & silks never vanish!
            m.racingInfo = {
              ...(racingInfoRef.current["_last"] || {}),
              ...(racingInfoRef.current[mId] || {}),
            };
          }

          if (m.runnersData && Object.keys(m.runnersData).length > 0) {
            runnersDataRef.current[mId] = {
              ...(runnersDataRef.current[mId] || {}),
              ...m.runnersData,
            };
            runnersDataRef.current["_last"] = {
              ...(runnersDataRef.current["_last"] || {}),
              ...m.runnersData,
            };
          } else if (runnersDataRef.current[mId] || runnersDataRef.current["_last"]) {
            m.runnersData = {
              ...(runnersDataRef.current["_last"] || {}),
              ...(runnersDataRef.current[mId] || {}),
            };
          }
        });
      }

      setOddsData(incomingOddsData);
      setLoading(false);
    };

    // Register listener before subscribing so the immediate snapshot is never missed
    socket.on("auraOddsUpdate", handler);

    const unsubscribe = subscribeToAuraOddsData({
      sportId,
      exEventId: targetExEventId,
    });

    return () => {
      socket.off("auraOddsUpdate", handler);
      unsubscribe?.();
    };
  }, [sportId, targetExEventId, targetMarketId]);

  // Reset loading when marketId or eventId changes
  useEffect(() => {
    setLoading(true);
    setSelectedMarketId(targetMarketId);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [targetMarketId, targetExEventId]);

  // Check event / match closed status
  const isEventClosed = useMemo(() => {
    const rawStatus = String(
      oddsData?.status ||
      oddsData?.matchOdds?.[0]?.oddsData?.status ||
      oddsData?.matchOdds?.[0]?.status ||
      initialEvent?.status ||
      initialEvent?.oddsData?.status ||
      initialEvent?.marketStatus ||
      ""
    ).toUpperCase();

    const isClosedVal =
      initialEvent?.isClosed === 1 ||
      initialEvent?.isClosed === true ||
      oddsData?.isClosed === 1 ||
      oddsData?.isClosed === true ||
      oddsData?.matchOdds?.[0]?.isClosed === 1 ||
      oddsData?.matchOdds?.[0]?.isClosed === true ||
      oddsData?.matchOdds?.[0]?.oddsData?.isClosed === 1 ||
      oddsData?.matchOdds?.[0]?.oddsData?.isClosed === true;

    // INACTIVE ko closed nahi maante taaki pre-match streams hide na hon
    return (
      isClosedVal ||
      ["CLOSED", "SETTLED", "COMPLETED", "FINISHED"].includes(rawStatus)
    );
  }, [initialEvent, oddsData]);

  // Check if a specific market item is closed
  const isMarketClosed = useCallback(
    (item) => {
      if (!item) return true;
      const status = String(
        item?.oddsData?.status || item?.status || item?.marketStatus || "",
      ).toUpperCase();

      const isClosed =
        item?.isClosed === 1 ||
        item?.isClosed === true ||
        item?.oddsData?.isClosed === 1 ||
        item?.oddsData?.isClosed === true;

      const isStatusClosed =
        status === "CLOSED" ||
        status === "SETTLED" ||
        status === "COMPLETED" ||
        status === "FINISHED";

      const isOddsDataClosed =
        String(oddsData?.status || "").toUpperCase() === "CLOSED" ||
        String(oddsData?.status || "").toUpperCase() === "SETTLED";

      // Suspended / Open / Active running me hota hai, sirf CLOSED/SETTLED/khatam ko filter karna hai
      return isClosed || isStatusClosed || isOddsDataClosed;
    },
    [oddsData?.status],
  );

  // Active match odds (filter out closed markets)
  const activeMatchOdds = useMemo(() => {
    if (isEventClosed) return [];

    const sourceMarkets = [
      ...(Array.isArray(oddsData?.matchOdds) ? oddsData.matchOdds : []),
      ...(Array.isArray(oddsData?.bookmakers) ? oddsData.bookmakers : []),
      ...(Array.isArray(oddsData?.sportsbook) ? oddsData.sportsbook : []),
      ...(Array.isArray(reduxOdds?.matchOdds) ? reduxOdds.matchOdds : []),
      ...(Array.isArray(reduxOdds?.bookmakers) ? reduxOdds.bookmakers : []),
      ...(Array.isArray(reduxOdds?.sportsbook) ? reduxOdds.sportsbook : []),
      ...(Array.isArray(initialEvent?.matchOdds) ? initialEvent.matchOdds : []),
      ...(Array.isArray(initialEvent?.bookmakers) ? initialEvent.bookmakers : []),
      ...(Array.isArray(initialEvent?.markets) ? initialEvent.markets : []),
      // If initialEvent itself is a single market from auraEvents list
      ...(initialEvent && (initialEvent.runners || initialEvent.marketName) ? [initialEvent] : []),
    ];

    const seen = new Set();
    const uniqueMarkets = [];
    sourceMarkets.forEach((m) => {
      const id = String(m?.marketId || m?.exMarketId || m?.marketName || "");
      if (id && !seen.has(id)) {
        seen.add(id);
        uniqueMarkets.push(m);
      } else if (!id) {
        uniqueMarkets.push(m);
      }
    });

    return uniqueMarkets.filter((item) => !isMarketClosed(item));
  }, [isEventClosed, oddsData, initialEvent, reduxOdds, isMarketClosed]);

  // ==================== CATEGORY TABS ====================
  /* Original categoryTabs logic commented (code hatana nahi hai):
  const categoryTabs = useMemo(() => {
    const tabs = ["All", "Popular"];
    if (Array.isArray(oddsData?.matchOdds)) {
      oddsData.matchOdds.forEach((m) => {
        const name = m?.marketName || m?.marketEventName;
        if (name && !tabs.includes(name)) {
          tabs.push(name);
        }
      });
    }
    return tabs;
  }, [oddsData?.matchOdds]);
  */
  // Sort active markets by sequence (so jodi comes first, then main race, then places)
  const sortedActiveMarkets = useMemo(() => {
    return [...activeMatchOdds].sort((a, b) => {
      const seqA = a.sequence != null ? Number(a.sequence) : 999;
      const seqB = b.sequence != null ? Number(b.sequence) : 999;
      return seqA - seqB;
    });
  }, [activeMatchOdds]);

  // Agar market close / khatam ho gaya toh tab me nahi show karega
  const categoryTabs = useMemo(() => {
    if (sortedActiveMarkets.length === 0) return [];
    const tabs = ["All", "Popular"];
    sortedActiveMarkets.forEach((m) => {
      const name = m?.marketName || m?.marketEventName;
      if (name && !tabs.includes(name)) {
        tabs.push(name);
      }
    });
    return tabs;
  }, [sortedActiveMarkets]);

  const handleCategorySelect = useCallback(
    (cat) => {
      setActiveCategory(cat);

      if (cat === "All" || cat === "Popular") {
        setSelectedMarketId(null);
        return;
      }

      // If user selected a specific market tab, find matching active market
      const matched = sortedActiveMarkets.find(
        (m) => (m.marketName || m.marketEventName) === cat,
      );
      if (matched?.marketId) {
        setSelectedMarketId(matched.marketId);
      }
    },
    [sortedActiveMarkets],
  );

  // Formatter for each individual market
  const formatMarketData = useCallback(
    (targetMarket) => {
      if (!targetMarket) return null;

      const mId = String(targetMarket.marketId || targetMarket.exMarketId || "");
      const oddsInfo = targetMarket.oddsData || {};

      const runnersMap =
        targetMarket.runnersData && Object.keys(targetMarket.runnersData).length > 0
          ? targetMarket.runnersData
          : runnersDataRef.current[mId] ||
            runnersDataRef.current["_last"] ||
            initialEvent?.runnersData ||
            {};

      const racingInfo =
        targetMarket.racingInfo && Object.keys(targetMarket.racingInfo).length > 0
          ? targetMarket.racingInfo
          : racingInfoRef.current[mId] ||
            racingInfoRef.current["_last"] ||
            {};

      const rawRunners =
        (Array.isArray(targetMarket.runners) && targetMarket.runners.length > 0
          ? targetMarket.runners
          : null) ||
        (Array.isArray(oddsInfo.runners) && oddsInfo.runners.length > 0
          ? oddsInfo.runners
          : null) ||
        (Array.isArray(targetMarket.section) && targetMarket.section.length > 0
          ? targetMarket.section
          : null) ||
        [];

      const section = rawRunners.map((r, idx) => {
        const runnerId = String(r.selectionId || r.sid || idx + 1);
        const rInfo = racingInfo[runnerId] || {};

        const back =
          (Array.isArray(r.price?.back) && r.price.back.length > 0
            ? r.price.back
            : null) ||
          (Array.isArray(r.ex?.availableToBack) && r.ex.availableToBack.length > 0
            ? r.ex.availableToBack
            : null) ||
          (Array.isArray(r.availableToBack) && r.availableToBack.length > 0
            ? r.availableToBack
            : null) ||
          (r.backPrice != null
            ? [{ price: r.backPrice, size: r.backSize || 0 }]
            : null) ||
          [];

        const lay =
          (Array.isArray(r.price?.lay) && r.price.lay.length > 0
            ? r.price.lay
            : null) ||
          (Array.isArray(r.ex?.availableToLay) && r.ex.availableToLay.length > 0
            ? r.ex.availableToLay
            : null) ||
          (Array.isArray(r.availableToLay) && r.availableToLay.length > 0
            ? r.availableToLay
            : null) ||
          (r.layPrice != null
            ? [{ price: r.layPrice, size: r.laySize || 0 }]
            : null) ||
          [];

        const odds = [
          { odds: back[0]?.price || 0, size: back[0]?.size || 0 },
          { odds: back[1]?.price || 0, size: back[1]?.size || 0 },
          { odds: back[2]?.price || 0, size: back[2]?.size || 0 },
          { odds: lay[0]?.price || 0, size: lay[0]?.size || 0 },
          { odds: lay[1]?.price || 0, size: lay[1]?.size || 0 },
          { odds: lay[2]?.price || 0, size: lay[2]?.size || 0 },
        ];

        const weight = rInfo.WEIGHT_VALUE
          ? `${rInfo.WEIGHT_VALUE} ${rInfo.WEIGHT_UNITS || "pounds"}`
          : null;

        const clothNum =
          rInfo.CLOTH_NUMBER ||
          rInfo.CLOTH_NUMBER_ALPHA ||
          r.clothNumber ||
          r.cno ||
          null;

        const isRemoved =
          r.status === "REMOVED" ||
          r.gstatus === "REMOVED" ||
          Boolean(r.removalDate);

        const adfaVal = r.adjustmentFactor
          ? `${Number(r.adjustmentFactor).toFixed(1)}%`
          : null;

        const runnerName =
          runnersMap[runnerId] ||
          r.runnerName ||
          r.runner ||
          r.name ||
          r.selectionName ||
          r.nat ||
          `Runner ${idx + 1}`;

        return {
          sid: runnerId,
          nat: runnerName,
          status: isRemoved ? "REMOVED" : r.status || "ACTIVE",
          gstatus: isRemoved ? "REMOVED" : undefined,
          odds,
          cno: clothNum,
          sdraw: rInfo.STALL_DRAW || r.sdraw || null,
          himgUrl: rInfo.COLOURS_FILENAME_URL || r.himgUrl || null,
          himgBase64: rInfo.COLOURS_FILENAME || r.himgBase64 || null,
          himg:
            rInfo.COLOURS_FILENAME ||
            rInfo.COLOURS_FILENAME_URL ||
            r.himg ||
            null,
          jname: rInfo.JOCKEY_NAME || r.jname || null,
          tname: rInfo.TRAINER_NAME || r.tname || null,
          hage: rInfo.AGE || r.hage || null,
          hweight: weight,
          adfa: adfaVal,
          rdt: formatRemovalDate(r.removalDate),
          sortPriority: r.sortPriority ?? idx,
        };
      });

      // Active runners on top, REMOVED runners placed at the very bottom
      const activeRunners = section.filter(
        (r) => r.status !== "REMOVED" && r.gstatus !== "REMOVED",
      );
      const removedRunners = section.filter(
        (r) => r.status === "REMOVED" || r.gstatus === "REMOVED",
      );

      activeRunners.sort((a, b) => {
        const numA = Number(a.cno) || a.sortPriority || 0;
        const numB = Number(b.cno) || b.sortPriority || 0;
        return numA - numB;
      });

      removedRunners.sort((a, b) => {
        const numA = Number(a.cno) || a.sortPriority || 0;
        const numB = Number(b.cno) || b.sortPriority || 0;
        return numA - numB;
      });

      const sortedSection = [...activeRunners, ...removedRunners];
      const mStatus = oddsInfo?.status || targetMarket?.status || "ACTIVE";
      const mOver = isPastOneMinute(targetMarket.marketName || raceName);
      const mSuspended =
        String(mStatus).toUpperCase() === "SUSPENDED" ||
        String(mStatus).toUpperCase() === "CLOSED" ||
        mOver;

      return {
        gmid: targetMarket.marketId || gmid,
        marketId: targetMarket.marketId || gmid,
        marketName: targetMarket.marketName || raceName,
        totalMatched:
          oddsInfo?.totalMatched ??
          targetMarket?.totalMatched ??
          oddsData?.totalMatched ??
          0,
        minStake: targetMarket?.min ?? 100,
        maxStake: targetMarket?.max ?? 100000,
        status: mStatus,
        isSuspended: mSuspended,
        section: sortedSection,
        _raw: targetMarket,
      };
    },
    [gmid, raceName, initialEvent, oddsData],
  );

  // All markets to display based on selected tab
  const displayedMarkets = useMemo(() => {
    if (isEventClosed || !sortedActiveMarkets.length) return [];

    let filtered = [];
    if (activeCategory === "All") {
      filtered = sortedActiveMarkets;
    } else if (activeCategory === "Popular") {
      const pop = sortedActiveMarkets.filter((m) => m.popular === true);
      filtered = pop.length > 0 ? pop : sortedActiveMarkets;
    } else {
      filtered = sortedActiveMarkets.filter(
        (m) =>
          (m.marketName || m.marketEventName) === activeCategory ||
          String(m.marketId) === String(selectedMarketId) ||
          String(m.exMarketId) === String(selectedMarketId),
      );
      if (filtered.length === 0) {
        filtered = sortedActiveMarkets;
      }
    }

    return filtered.map((m) => formatMarketData(m)).filter(Boolean);
  }, [isEventClosed, sortedActiveMarkets, activeCategory, selectedMarketId, formatMarketData]);

  // Keep first market for fallback compatibility
  const marketData = displayedMarkets[0] || null;
  const runnersList = marketData?.section || [];
  const marketStatus = marketData?.status || "ACTIVE";

  const isInPlay = useMemo(() => {
    if (isEventClosed) return false;
    const inPlayParam = searchParams.get("inPlay");
    if (inPlayParam === "true" || inPlayParam === "1") return true;

    const status = String(
      marketStatus ||
      initialEvent?.status ||
      oddsData?.status ||
      marketData?._raw?.status ||
      ""
    ).toUpperCase();

    const isLiveTime =
      (initialEvent?.eventTime && new Date(initialEvent.eventTime) <= new Date()) ||
      (oddsData?.eventTime && new Date(oddsData.eventTime) <= new Date()) ||
      (marketData?._raw?.eventTime && new Date(marketData._raw.eventTime) <= new Date());

    return (
      initialEvent?.inPlay === true ||
      initialEvent?.inplay === true ||
      initialEvent?.iplay === true ||
      oddsData?.inPlay === true ||
      oddsData?.inplay === true ||
      marketData?._raw?.oddsData?.inPlay === true ||
      marketData?._raw?.inPlay === true ||
      status === "INPLAY" ||
      status === "IN_PLAY" ||
      status === "LIVE" ||
      Boolean(isLiveTime)
    );
  }, [isEventClosed, marketStatus, initialEvent, oddsData, marketData, searchParams]);

  // Match banner dateTime resolution (Image 2)
  const bannerDateTime = useMemo(() => {
    const fromParam = searchParams.get("eventTime");
    if (fromParam) return fromParam;
    if (initialEvent?.eventTime) return initialEvent.eventTime;
    if (initialEvent?.openDate) return initialEvent.openDate;
    if (marketData?._raw?.eventTime) return marketData._raw.eventTime;
    if (marketData?._raw?.openDate) return marketData._raw.openDate;
    if (oddsData?.eventTime) return oddsData.eventTime;
    if (oddsData?.openDate) return oddsData.openDate;

    // Fallback: parse from raceName (e.g. "Newcastle 27 Oct 21:40")
    if (raceName) {
      const dateTimePart = raceName.replace(/^[^\d]+/, "").trim();
      if (dateTimePart) {
        const currentYear = new Date().getFullYear();
        const parsed = new Date(`${dateTimePart} ${currentYear}`);
        if (!isNaN(parsed.getTime())) return parsed.toISOString();
        const direct = new Date(dateTimePart);
        if (!isNaN(direct.getTime())) return direct.toISOString();
      }
    }
    return "";
  }, [searchParams, initialEvent, marketData, oddsData, raceName]);

  // Match banner status text (Image 2 shows OPEN when active)
  const bannerStatusText = useMemo(() => {
    const st = String(marketStatus || "").toUpperCase();
    if (st === "SUSPENDED" || st === "SUSPEND") return "SUSPENDED";
    if (st === "CLOSED" || st === "SETTLED") return "CLOSED";
    if (st === "ACTIVE" || st === "OPEN") return "OPEN";
    if (isInPlay) return "OPEN";
    return st || "OPEN";
  }, [marketStatus, isInPlay]);

  // Turn off loading once data arrives
  useEffect(() => {
    if (marketData && runnersList.length > 0) {
      setLoading(false);
    }
  }, [marketData, runnersList]);

  const currentMarketId = marketData?.gmid || gmid;

  // Odds Cell Click handler
  const handleMarketCellClick = useCallback(
    (betBoxBgColor, price, betType, runner, index, marketGmid) => {
      const activeGmid = marketGmid || currentMarketId;
      if (!price) return;

      const stake = Number(activeBet?.stake || 0);
      setSelfSelectedOdds(price);

      dispatch(
        handleOpenPlaceBet({
          sportName: "Horse Race",
          sportId: "7",
          competitionId: activeGmid,
          eventId: exEventId || activeGmid,
          marketId: activeGmid,
          market: "Horse Race",
          markettype: "Match Odds",
          selectionId: runner.sid,
          betBoxBgColor,
          betType,
          gmid: activeGmid,
        }),
      );

      setActiveBet({
        selectionId: runner.sid,
        type: betType,
        stake,
        oddsReq: price,
        index,
        marketId: activeGmid,
      });
    },
    [dispatch, currentMarketId, exEventId, activeBet],
  );

  // Update betData in Redux when activeBet changes
  useEffect(() => {
    if (!activeBet) return;
    const stake = Number(activeBet?.stake);
    const oddsReq = Number(activeBet?.oddsReq || 0);
    const calculateValue = oddsReq && stake ? oddsReq * stake - stake : 0;

    dispatch(
      setBetData({
        calculateValue,
        index: activeBet.index,
        addedValue: stake,
        selectionId: activeBet.selectionId,
        type: activeBet.type,
        marketId: activeBet.marketId || currentMarketId,
      }),
    );
  }, [activeBet, dispatch, currentMarketId]);

  // Check if all markets in this race are closed
  const isAllMarketsClosed = useMemo(() => {
    if (isEventClosed) return true;
    if (oddsData && Array.isArray(oddsData?.matchOdds) && oddsData.matchOdds.length > 0) {
      if (activeMatchOdds.length === 0) return true;
      return oddsData.matchOdds.every((item) => isMarketClosed(item));
    }
    return false;
  }, [isEventClosed, oddsData, activeMatchOdds, isMarketClosed]);

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
      setLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [targetExEventId]);

  // If match finished, closed, or no active markets remain
  const hasNoActiveMarket = useMemo(() => {
    if (isEventClosed) return true;
    if (isAllMarketsClosed) return true;
    if (timedOut && activeMatchOdds.length === 0) return true;
    return false;
  }, [isEventClosed, isAllMarketsClosed, timedOut, activeMatchOdds.length]);

  // Trigger error toast and navigate back when match ends / no markets active
  useEffect(() => {
    if (hasNoActiveMarket) {
      if (!hasTriggeredClosedRef.current) {
        hasTriggeredClosedRef.current = true;
        toast.dismiss();
        toast.error(
          <ExposureToast
            type="error"
            title="Sorry"
            subtitle="No Markets are active"
          />,
        );
        const timer = setTimeout(() => {
          navigate("/", { replace: true });
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      hasTriggeredClosedRef.current = false;
    }
  }, [hasNoActiveMarket, navigate]);

  // Loading State: show loader if market data or runners are still loading and event is not closed
  if ((loading || !marketData || runnersList.length === 0) && !hasNoActiveMarket) {
    return (
      <div className="w-full flex flex-col bg-white p-4">
        <Loader />
        <div className="mt-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Jab match khatam ho jaye ya koi active market na ho toh koi bhi section nahi dikhega
  if (hasNoActiveMarket) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full flex flex-col bg-white text-black select-none"
    >
      {/* 0. Top Match Details Banner (In-Play me nahi dikhega) */}
      {!isInPlay && (
        <MarketHeaderBanner
          dateTime={bannerDateTime}
          statusText={bannerStatusText}
          backgroundImage="/aura/horseRacing.jpg"
          startedText="Bet Started"
          isInPlay={isInPlay}
        />
      )}

      {/* 1. Header: Horse Racing Title + TV Icon */}
      <HorseHeader sportId={sportId} eventId={exEventId} isInPlay={isInPlay} />

      {/* 2. Category Tabs: All, Popular, Market Names (closed markets filtered out) */}
      {categoryTabs.length > 0 && (
        <HorseCategoryTabs
          categories={categoryTabs}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />
      )}

      {/* 3. Render all displayed markets (Popular / All / Single Tab) */}
      {displayedMarkets.length > 0 &&
        displayedMarkets.map((mItem, mIdx) => (
          <div key={`market-${mItem.gmid}-${mIdx}`} className="w-full flex flex-col mb-4">
            <HorseMarketHeader
              marketName={mItem.marketName}
              totalMatched={mItem.totalMatched}
              minStake={mItem.minStake}
              maxStake={mItem.maxStake}
              onInfoClick={() => {
                setSelectedRulesMarket(mItem.marketName);
                setIsRulesModalOpen(true);
              }}
            />

            {/* Runners List */}
            <div className="w-full flex flex-col">
              {mItem.section.map((runner, idx) => {
                let placedBetCalculation = 0;
                const fbOfthisRunner = bets?.filter(
                  (fb) =>
                    String(fb.matchId) === String(mItem.gmid) &&
                    String(fb.selectionId) === String(runner.sid) &&
                    fb.sportsName === "Horse Race",
                );
                fbOfthisRunner?.forEach((fbr) => {
                  const subject =
                    fbr.type === "Back" ? fbr.favourMargin : -fbr.againstMargin;
                  placedBetCalculation += subject;
                });

                const fbOfOtherRunners = bets?.filter(
                  (fb) =>
                    String(fb.matchId) === String(mItem.gmid) &&
                    String(fb.selectionId) !== String(runner.sid) &&
                    fb.sportsName === "Horse Race",
                );
                fbOfOtherRunners?.forEach((fbor) => {
                  const subject =
                    fbor.type === "Back"
                      ? -fbor.againstMargin
                      : fbor.favourMargin;
                  placedBetCalculation += subject;
                });

                let newCalc = 0;
                if (String(betData?.marketId) === String(mItem.gmid)) {
                  if (betData?.type === "Back") {
                    newCalc =
                      betData?.selectionId !== runner.sid
                        ? -betData?.addedValue + placedBetCalculation
                        : betData?.calculateValue + placedBetCalculation;
                  } else {
                    newCalc =
                      betData?.selectionId !== runner.sid
                        ? betData?.addedValue + placedBetCalculation
                        : -betData?.calculateValue + placedBetCalculation;
                  }
                } else {
                  newCalc = placedBetCalculation;
                }

                return (
                  <HorseRunnerRow
                    key={`runner-${mItem.gmid}-${runner.sid}-${idx}`}
                    runner={runner}
                    idx={idx}
                    gmid={mItem.gmid}
                    exEventId={exEventId}
                    raceName={raceName}
                    isSuspended={mItem.isSuspended}
                    activeBet={activeBet}
                    setActiveBet={setActiveBet}
                    betData={betData}
                    selfSelectedOdds={selfSelectedOdds}
                    placedBetCalculation={placedBetCalculation}
                    newCalc={newCalc}
                    allRunners={mItem.section}
                    onOddsClick={(bgColor, price, bType, r, i) =>
                      handleMarketCellClick(bgColor, price, bType, r, i, mItem.gmid)
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}

      {/* Rules Modal */}
      {isRulesModalOpen && (
        <RulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
          marketName={selectedRulesMarket || displayedMarkets[0]?.marketName || raceName}
        />
      )}
    </motion.div>
  );
};

export default HorseMarket;