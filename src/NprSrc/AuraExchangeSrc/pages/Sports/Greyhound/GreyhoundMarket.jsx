import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ExposureToast from "../../../components/ExposureToast";
import { handleOpenPlaceBet } from "../../../../../redux/slices/placeBetSlice";
import { displayAuthModal } from "../../../../../redux/slices/authModalSlice";
import {
  subscribeToAuraOddsData,
  subscribeToGreyHoundOddsData,
  unsubscribeFromGreyHoundOdds,
  socket,
  getFreshAuraOddsCache,
} from "../../../../../socketClient";
import { setBetData } from "../../../../../redux/slices/fullmarketSlice";
import Loader from "../../../../../utils/Loader";
import RulesModal from "../../FullMarket/CTSfullMarket/RulesModal";
import "../../FullMarket/aura-suspended.css";

// GreyhoundMarket: Greyhound race market odds page
// Horse components (HorseHeader, HorseMarketHeader, HorseRunnerRow) ko reuse karta hai taaki UI 100% consistent rahe
// showClothNumber={false} pass hota hai taaki dog races me unnecessary jersey number boxes na dikhein
import HorseHeader from "../Horse/components/HorseHeader";
import HorseCategoryTabs from "../Horse/components/HorseCategoryTabs";
import HorseMarketHeader from "../Horse/components/HorseMarketHeader";
import HorseRunnerRow from "../Horse/components/HorseRunnerRow";
import MarketHeaderBanner from "../../../components/MarketHeaderBanner";

const EMPTY_GREYHOUND_ARRAY = [];

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

const GreyhoundMarket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const [searchParams] = useSearchParams();
  const hasTriggeredClosedRef = useRef(false);

  // Route Params
  const gmid = searchParams.get("marketId") || searchParams.get("gmid");
  const exEventId = searchParams.get("exEventId") || searchParams.get("eventId");
  const raceName = searchParams.get("raceName") || "Greyhound Race";
  const sportId = "4339";

  // Persistent refs across socket delta updates
  const racingInfoRef = useRef({});
  const runnersDataRef = useRef({});

  // Redux state
  const bets = useSelector((state) => state.account.bets);
  const { betData } = useSelector((state) => state.marketOdds);
  const auraMatchesGreyhound = useSelector((state) => {
    const list = state?.auraMatches?.greyhound?.matches?.data;
    return Array.isArray(list) ? list : EMPTY_GREYHOUND_ARRAY;
  });
  const legacyGreyhoundMarkets = useSelector(
    (state) => state?.greyhound?.greyhoundMarkets || [],
  );

  const initialEvent = useMemo(() => {
    return (
      auraMatchesGreyhound.find(
        (e) =>
          String(e?.exEventId) === String(exEventId) ||
          String(e?.eventId) === String(exEventId) ||
          String(e?.marketId) === String(gmid) ||
          String(e?._id) === String(exEventId),
      ) || null
    );
  }, [auraMatchesGreyhound, exEventId, gmid]);

  // Seed runnersData from event if available
  useEffect(() => {
    if (initialEvent?.runnersData && Object.keys(initialEvent.runnersData).length > 0) {
      runnersDataRef.current["_last"] = {
        ...(runnersDataRef.current["_last"] || {}),
        ...initialEvent.runnersData,
      };
    }
  }, [initialEvent]);

  // State
  const [oddsData, setOddsData] = useState(() => {
    return getFreshAuraOddsCache(String(exEventId || gmid || ""));
  });
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [selectedMarketId, setSelectedMarketId] = useState(gmid);
  const [activeBet, setActiveBet] = useState(null);
  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // ==================== ODDS SUBSCRIPTION (Aura + Legacy Fallback) ====================
  useEffect(() => {
    const handler = (data) => {
      if (
        (String(data?.sportId) !== "4339" && String(data?.sportId) !== "65") ||
        (String(data?.exEventId) !== String(exEventId) &&
          String(data?.eventId) !== String(exEventId))
      ) {
        return;
      }

      const incomingOddsData = data?.oddsData;
      if (!incomingOddsData) return;

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

    // Register listener before subscribing so immediate snapshot is never missed
    socket.on("auraOddsUpdate", handler);

    // 1. Subscribe to Aura odds if exEventId is present
    let unsubscribeAura = null;
    if (exEventId) {
      unsubscribeAura = subscribeToAuraOddsData({
        sportId,
        exEventId: exEventId,
      });
    }

    // 2. Also subscribe to legacy greyhound odds if gmid is present
    if (gmid) {
      subscribeToGreyHoundOddsData({
        eventId: exEventId || null,
        eventType: null,
        gmid,
      });
    }

    return () => {
      socket.off("auraOddsUpdate", handler);
      unsubscribeAura?.();
      if (gmid) {
        unsubscribeFromGreyHoundOdds(gmid);
      }
    };
  }, [sportId, exEventId, gmid]);

  // Reset loading when marketId or eventId changes
  useEffect(() => {
    setLoading(true);
    setSelectedMarketId(gmid);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [gmid, exEventId]);

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

    return (
      isClosedVal ||
      ["CLOSED", "SETTLED", "COMPLETED", "FINISHED", "INACTIVE"].includes(rawStatus)
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

      return isClosed || isStatusClosed || isOddsDataClosed;
    },
    [oddsData?.status],
  );

  // Active match odds (filter out closed markets)
  const activeMatchOdds = useMemo(() => {
    if (isEventClosed) return [];
    if (!Array.isArray(oddsData?.matchOdds)) return [];
    return oddsData.matchOdds.filter((item) => !isMarketClosed(item));
  }, [isEventClosed, oddsData?.matchOdds, isMarketClosed]);

  // Category Tabs
  const categoryTabs = useMemo(() => {
    if (activeMatchOdds.length === 0) return [];
    const tabs = ["All", "Popular"];
    activeMatchOdds.forEach((m) => {
      const name = m?.marketName || m?.marketEventName;
      if (name && !tabs.includes(name)) {
        tabs.push(name);
      }
    });
    return tabs;
  }, [activeMatchOdds]);

  const handleCategorySelect = useCallback(
    (cat) => {
      setActiveCategory(cat);

      if (cat === "All" || cat === "Popular") {
        setSelectedMarketId(gmid);
        return;
      }

      const matched = activeMatchOdds.find(
        (m) => (m.marketName || m.marketEventName) === cat,
      );
      if (matched) {
        setSelectedMarketId(matched.marketId || matched.exMarketId);
      }
    },
    [activeMatchOdds, gmid],
  );

  // Resolve current market data (Aura odds or legacy fallback)
  const marketData = useMemo(() => {
    // 1. Try Aura matchOdds first
    if (!isEventClosed && activeMatchOdds.length > 0) {
      let targetMarket = activeMatchOdds.find(
        (m) =>
          String(m.marketId) === String(selectedMarketId || gmid) ||
          String(m.exMarketId) === String(selectedMarketId || gmid),
      );

      if (!targetMarket) {
        targetMarket = activeMatchOdds[0];
      }

      if (targetMarket) {
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

        const section = (oddsInfo.runners || []).map((r, idx) => {
          const back = r.price?.back || [];
          const lay = r.price?.lay || [];

          const odds = [
            { odds: back[0]?.price || 0, size: back[0]?.size || 0 },
            { odds: back[1]?.price || 0, size: back[1]?.size || 0 },
            { odds: back[2]?.price || 0, size: back[2]?.size || 0 },
            { odds: lay[0]?.price || 0, size: lay[0]?.size || 0 },
            { odds: lay[1]?.price || 0, size: lay[1]?.size || 0 },
            { odds: lay[2]?.price || 0, size: lay[2]?.size || 0 },
          ];

          const runnerName = runnersMap[r.selectionId] || "";

          return {
            sid: r.selectionId,
            nat: runnerName,
            status: r.status || "ACTIVE",
            odds,
            cno: null,
            sdraw: null,
            himgUrl: null,
            himgBase64: null,
            himg: null,
            jname: null,
            tname: null,
            sortPriority: r.sortPriority ?? idx,
          };
        });

        return {
          gmid: targetMarket.marketId || gmid,
          marketName: targetMarket.marketName || raceName,
          totalMatched: oddsInfo.totalMatched ?? oddsData?.totalMatched ?? 0,
          minStake: targetMarket.min ?? 100,
          maxStake: targetMarket.max ?? 10000,
          status: oddsInfo.status || targetMarket.status || "OPEN",
          section,
          _raw: targetMarket,
        };
      }
    }

    // 2. Legacy fallback from legacyGreyhoundMarkets
    const legacyItem = legacyGreyhoundMarkets.find(
      (hm) =>
        (String(hm.gmid) === String(gmid) || String(hm.marketId) === String(gmid)) &&
        hm.odds,
    );

    if (legacyItem) {
      const matchOdds =
        legacyItem.odds.find((e) => e?.mname === "MATCH_ODDS") ||
        legacyItem.odds[0] ||
        {};

      const section = (matchOdds.section || []).map((r, idx) => ({
        sid: r.sid,
        nat: r.nat || `Trap ${idx + 1}`,
        cno: r.cno ?? idx + 1,
        status: r.status || "ACTIVE",
        odds: r.odds || [],
        himgUrl: r.himgUrl || null,
      }));

      return {
        gmid: legacyItem.gmid || gmid,
        marketName: matchOdds.mname || raceName,
        totalMatched: legacyItem.totalMatched || 0,
        minStake: matchOdds.min || 100,
        maxStake: matchOdds.max || 10000,
        status: matchOdds.status || "ACTIVE",
        section,
        _raw: legacyItem,
      };
    }

    return null;
  }, [
    isEventClosed,
    activeMatchOdds,
    selectedMarketId,
    gmid,
    oddsData,
    initialEvent,
    legacyGreyhoundMarkets,
    raceName,
  ]);

  const runnersList = marketData?.section || [];
  const totalMatched = marketData?.totalMatched || 0;
  const marketStatus = marketData?.status || "ACTIVE";
  const matchOver = isPastOneMinute(raceName);
  const isSuspended =
    marketStatus?.toUpperCase() === "SUSPENDED" ||
    marketStatus?.toUpperCase() === "CLOSED" ||
    matchOver;

  const isInPlay = useMemo(() => {
    if (isEventClosed) return false;

    if (
      initialEvent?.inPlay === true ||
      initialEvent?.inPlay === 1 ||
      initialEvent?.inplay === true ||
      initialEvent?.inplay === 1
    ) {
      return true;
    }

    if (
      oddsData?.inPlay === true ||
      oddsData?.inPlay === 1 ||
      oddsData?.inplay === true ||
      oddsData?.matchOdds?.[0]?.inPlay === true ||
      oddsData?.matchOdds?.[0]?.oddsData?.inPlay === true
    ) {
      return true;
    }

    const rawStatus = String(
      oddsData?.status ||
      oddsData?.matchOdds?.[0]?.oddsData?.status ||
      oddsData?.matchOdds?.[0]?.status ||
      initialEvent?.status ||
      initialEvent?.oddsData?.status ||
      ""
    ).toUpperCase();

    if (
      rawStatus === "INPLAY" ||
      rawStatus === "IN_PLAY" ||
      rawStatus === "LIVE"
    ) {
      return true;
    }

    const timeStr =
      searchParams.get("eventTime") ||
      initialEvent?.eventTime ||
      initialEvent?.openDate ||
      oddsData?.eventTime ||
      "";
    if (timeStr) {
      const raceTime = new Date(timeStr);
      if (!isNaN(raceTime.getTime()) && raceTime.getTime() <= Date.now()) {
        return true;
      }
    }

    return false;
  }, [isEventClosed, initialEvent, oddsData, searchParams]);

  const bannerDateTime = useMemo(() => {
    return (
      searchParams.get("eventTime") ||
      initialEvent?.eventTime ||
      initialEvent?.openDate ||
      oddsData?.eventTime ||
      oddsData?.matchOdds?.[0]?.eventTime ||
      ""
    );
  }, [searchParams, initialEvent, oddsData]);

  const bannerStatusText = useMemo(() => {
    if (isSuspended) return "SUSPENDED";
    if (isInPlay) return "IN PLAY";
    return "";
  }, [isSuspended, isInPlay]);

  // Turn off loading once data arrives
  useEffect(() => {
    if (marketData && runnersList.length > 0) {
      setLoading(false);
    }
  }, [marketData, runnersList]);

  // Filtered bets for Greyhound
  const currentMarketId = marketData?.gmid || gmid;
  const filteredBets = useMemo(
    () =>
      bets?.filter(
        (bet) =>
          String(bet.matchId) === String(currentMarketId) &&
          bet.markettype === "Match Odds" &&
          (bet.sportsName === "Greyhound Race" ||
            bet.sportsName === "greyhound" ||
            bet.sportsName === "Greyhound"),
      ) || [],
    [bets, currentMarketId],
  );

  // Odds Cell Click handler
  const handleMarketCellClick = useCallback(
    (betBoxBgColor, price, betType, runner, index) => {
      if (!price || isSuspended) return;

      const stake = Number(activeBet?.stake || 0);
      setSelfSelectedOdds(price);

      dispatch(
        handleOpenPlaceBet({
          sportName: "Greyhound Race",
          sportId: "4339",
          competitionId: currentMarketId,
          eventId: exEventId || currentMarketId,
          marketId: currentMarketId,
          market: "Greyhound Race",
          markettype: "Match Odds",
          selectionId: runner.sid,
          betBoxBgColor,
          betType,
          gmid: currentMarketId,
        }),
      );

      setActiveBet({
        selectionId: runner.sid,
        type: betType,
        stake,
        oddsReq: price,
        index,
      });
    },
    [dispatch, currentMarketId, exEventId, activeBet, isSuspended],
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
        marketId: currentMarketId,
      }),
    );
  }, [activeBet, dispatch, currentMarketId]);

  // Check if all markets in this race are closed
  const isAllMarketsClosed = useMemo(() => {
    if (isEventClosed) return true;
    if (!loading && Array.isArray(oddsData?.matchOdds)) {
      if (oddsData.matchOdds.length === 0) return true;
      return oddsData.matchOdds.every((item) => isMarketClosed(item));
    }
    return false;
  }, [isEventClosed, loading, oddsData?.matchOdds, isMarketClosed]);

  // If match finished, closed, or no active markets remain
  const hasNoActiveMarket = useMemo(() => {
    if (isEventClosed) return true;
    if (loading) return false;
    return (
      isAllMarketsClosed ||
      !marketData ||
      runnersList.length === 0
    );
  }, [
    loading,
    isEventClosed,
    isAllMarketsClosed,
    marketData,
    runnersList.length,
  ]);

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
        }, 120);
        return () => clearTimeout(timer);
      }
    } else {
      hasTriggeredClosedRef.current = false;
    }
  }, [hasNoActiveMarket, navigate]);

  // Loading State
  if (loading && (!marketData || runnersList.length === 0) && !hasNoActiveMarket) {
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
          backgroundImage="/aura/sports-banner-min.jpg"
          startedText="Bet Started"
          isInPlay={isInPlay}
        />
      )}

      {/* 1. Header: Greyhound Racing Title + TV Icon */}
      <HorseHeader
        title="Greyhound Racing"
        sportId={sportId}
        eventId={exEventId}
        isInPlay={isInPlay}
      />

      {/* 2. Category Tabs */}
      {categoryTabs.length > 0 && (
        <HorseCategoryTabs
          categories={categoryTabs}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />
      )}

      {/* 3. Market Header: Market Name Pill + Matched Amount + Min/Max + Back/Lay Headers */}
      {marketData && runnersList.length > 0 && (
        <>
          <HorseMarketHeader
            marketName={marketData.marketName}
            totalMatched={totalMatched}
            minStake={marketData.minStake}
            maxStake={marketData.maxStake}
            onInfoClick={() => setIsRulesModalOpen(true)}
          />

          {/* 4. Runners List */}
          <div className="w-full flex flex-col">
            {runnersList.map((runner, idx) => {
              // Placed Bet Exposure Calculation
              let placedBetCalculation = 0;
              const fbOfthisRunner = filteredBets?.filter(
                (fb) => String(fb.selectionId) === String(runner.sid),
              );
              fbOfthisRunner?.forEach((fbr) => {
                const subject =
                  fbr.type === "Back" ? fbr.favourMargin : -fbr.againstMargin;
                placedBetCalculation += subject;
              });

              const fbOfOtherRunners = filteredBets?.filter(
                (fb) => String(fb.selectionId) !== String(runner.sid),
              );
              fbOfOtherRunners?.forEach((fbor) => {
                const subject =
                  fbor.type === "Back"
                    ? -fbor.againstMargin
                    : fbor.favourMargin;
                placedBetCalculation += subject;
              });

              let newCalc = 0;
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

              return (
                <HorseRunnerRow
                  key={`runner-${runner.sid}-${idx}`}
                  runner={runner}
                  idx={idx}
                  gmid={currentMarketId}
                  exEventId={exEventId}
                  raceName={raceName}
                  isSuspended={isSuspended}
                  activeBet={activeBet}
                  setActiveBet={setActiveBet}
                  betData={betData}
                  selfSelectedOdds={selfSelectedOdds}
                  placedBetCalculation={placedBetCalculation}
                  newCalc={newCalc}
                  allRunners={runnersList}
                  onOddsClick={handleMarketCellClick}
                  sportName="Greyhound Race"
                  sportId="4339"
                  showClothNumber={false}
                  showRemovedBanner={false}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Rules Modal */}
      {isRulesModalOpen && marketData && (
        <RulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
          marketName={marketData.marketName}
        />
      )}
    </motion.div>
  );
};

export default GreyhoundMarket;
