import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ExposureToast from "../../../components/ExposureToast";

import MatchDetailsBanner from "./MatchDetailsBanner";
import MatchCategory from "./MatchCategory";
import MarketOdds from "./MarketOdds";
import BookMakerOdds from "./BookmakerOdds";
import FancyOdds, { sortFancyOdds } from "./FancyOdds";
import TossMarket from "./TossMarket";
import Loader from "../../../../../utils/Loader";

import {
  socket,
  subscribeToAuraOddsData,
  getFreshAuraOddsCache,
} from "../../../../../socketClient";

import { handleCancelPlaceBet } from "../../../../../redux/slices/placeBetSlice";
import "../../FullMarket/aura-suspended.css";

const sportsMapping = {
  4: "Cricket",
  1: "Soccer",
  2: "Tennis",
  7522: "Basketball",
  1002: "Basketball",
};

const EMPTY_MATCHES_ARRAY = [];

function CTSfullMarket() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =========================================================
  // QUERY PARAMS
  // =========================================================
  const eventName = searchParams.get("eventName");
  const sportId = searchParams.get("eventType");
  const eventId = searchParams.get("eventId");
  const competitionId = searchParams.get("competitionId");
  const marketId = searchParams.get("marketId");
  const joinedMarketIds = searchParams.get("joinedMarketIds") || marketId;
  const openDate = searchParams.get("openDate");

  const bm = searchParams.get("bm");
  const f = searchParams.get("fancy");
  const s = searchParams.get("pc");

  // =========================================================
  // STATE & INSTANT WARM CACHE
  // =========================================================
  const reduxCachedOdds = useSelector(
    (state) => state?.auraMatches?.oddsCache?.[String(eventId)],
  );

  const initialCachedData = useMemo(() => {
    return getFreshAuraOddsCache(String(eventId || ""), reduxCachedOdds);
  }, [eventId, reduxCachedOdds]);

  const [oddsData, setOddsData] = useState(() => initialCachedData);
  const [liveScoreData, setLiveScoreData] = useState(null);

  useEffect(() => {
    setLiveScoreData(null);
  }, [eventId]);

  const lastHydratedEventIdRef = useRef(String(eventId || ""));

  useEffect(() => {
    const idStr = String(eventId || "");
    const cached = getFreshAuraOddsCache(idStr, reduxCachedOdds);
    if (lastHydratedEventIdRef.current !== idStr) {
      lastHydratedEventIdRef.current = idStr;
      setOddsData(cached);
    } else if (cached) {
      setOddsData((prev) => prev || cached);
    }
  }, [eventId, reduxCachedOdds]);

  const [activeMarketCategory, setActiveMarketCategory] = useState("All");

  // =========================================================
  // MEMOS
  // =========================================================
  const sport = useMemo(() => sportsMapping[String(sportId)] || "", [sportId]);

  const lowerActiveCategory = useMemo(
    () => String(activeMarketCategory || "all").toLowerCase(),
    [activeMarketCategory],
  );

  const sportMap = useMemo(
    () => ({
      4: "cricket",
      1: "soccer",
      2: "tennis",
      7: "horse",
      4339: "greyhound",
      8: "kabaddi",
      7522: "basketball",
      1002: "basketball",
    }),
    [],
  );
  const sportKey = sportMap[String(sportId)] || "cricket";
  const auraMatchesList = useSelector((state) => {
    const dedicated = state?.auraMatches?.[sportKey]?.matches?.data;
    if (Array.isArray(dedicated) && dedicated.length > 0) return dedicated;
    const pool = state?.auraMatches?.cricket?.matches?.data;
    if (Array.isArray(pool) && pool.length > 0) return pool;
    return EMPTY_MATCHES_ARRAY;
  });

  const currentMatch = useMemo(() => {
    return (
      auraMatchesList.find(
        (m) =>
          String(m?.eventId) === String(eventId) ||
          String(m?.exEventId) === String(eventId) ||
          String(m?._id) === String(eventId) ||
          (marketId && String(m?.marketId) === String(marketId)) ||
          (eventName &&
            m?.eventName &&
            m.eventName.trim().toLowerCase() ===
              eventName.trim().toLowerCase()),
      ) || null
    );
  }, [auraMatchesList, eventId, marketId, eventName]);

  const hasFancy =
    f === "true" ||
    currentMatch?.isFancy ||
    (Array.isArray(oddsData?.fancy) && oddsData.fancy.length > 0);
  const hasBookmaker =
    bm === "true" ||
    currentMatch?.isBookmakers ||
    (Array.isArray(oddsData?.bookmakers) && oddsData.bookmakers.length > 0);
  const hasPremiumSportsbook =
    s === "true" ||
    currentMatch?.isSportsbook ||
    (Array.isArray(oddsData?.sportsbook) && oddsData.sportsbook.length > 0);

  // =========================================================
  // AURA UNIVERSE ODDS (SINGLE COMPREHENSIVE STREAM)
  //
  // AuraOdds delivers matchOdds, bookmakers, fancy, and
  // sportsbook in one single payload. No extra streams needed.
  // =========================================================
  useEffect(() => {
    if (!eventId || !sportId) {
      return undefined;
    }

    const handler = (data) => {
      if (
        String(data?.sportId) !== String(sportId) ||
        String(data?.exEventId) !== String(eventId)
      ) {
        return;
      }

      const incoming = data?.oddsData;
      if (!incoming) return;

      setOddsData(incoming);
    };

    // Register listener first
    socket.on("auraOddsUpdate", handler);

    // Then subscribe
    const unsubscribe = subscribeToAuraOddsData({
      sportId,
      exEventId: eventId,
    });

    return () => {
      socket.off("auraOddsUpdate", handler);
      unsubscribe?.();
      dispatch(handleCancelPlaceBet());
    };
  }, [sportId, eventId, dispatch]);

  // =========================================================
  // TOSS MARKETS
  // =========================================================
  const tossMarkets = useMemo(() => {
    const sportsbook = Array.isArray(oddsData?.sportsbook)
      ? oddsData.sportsbook
      : [];

    return sportsbook.filter((item) =>
      ["To Win The Match", "Which Team Will Win The Toss"].includes(
        item?.marketName,
      ),
    );
  }, [oddsData?.sportsbook]);

  // =========================================================
  // MARKET ODDS (REAL DATA ONLY)
  // =========================================================
  const allMatchOdds = useMemo(() => {
    const list = [];
    if (Array.isArray(oddsData?.matchOdds) && oddsData.matchOdds.length > 0) {
      list.push(...oddsData.matchOdds);
    }
    if (Array.isArray(oddsData?.betfair) && oddsData.betfair.length > 0) {
      oddsData.betfair.forEach((bm) => {
        if (
          !list.some(
            (existing) =>
              String(existing?.marketId || existing?.id) ===
              String(bm?.marketId || bm?.id),
          )
        ) {
          list.push(bm);
        }
      });
    }
    if (
      list.length === 0 &&
      Array.isArray(currentMatch?.matchOdds) &&
      currentMatch.matchOdds.length > 0
    ) {
      list.push(...currentMatch.matchOdds);
    }
    return list;
  }, [oddsData?.matchOdds, oddsData?.betfair, currentMatch?.matchOdds]);

  // =========================================================
  // BOOKMAKER ODDS (REAL DATA ONLY)
  // =========================================================
  const filteredBookmakerOdds = useMemo(() => {
    const bookmakers = Array.isArray(oddsData?.bookmakers)
      ? oddsData.bookmakers
      : [];

    return bookmakers.filter(
      (item) => item?.isClosed !== 1 && item?.oddsData?.status !== "CLOSED",
    );
  }, [oddsData?.bookmakers]);

  // =========================================================
  // MARKET CATEGORIES
  // =========================================================
  const uniqueMarkets = useMemo(() => {
    const matchOddsMarkets =
      Array.isArray(allMatchOdds) && allMatchOdds.length > 0
        ? allMatchOdds.map((item) => item?.marketName || "Match Odds")
        : [];

    const bookmakerMarkets =
      Array.isArray(filteredBookmakerOdds) && filteredBookmakerOdds.length > 0
        ? filteredBookmakerOdds.map((item) => item?.marketName || "Bookmaker")
        : [];

    return [
      ...new Set([...matchOddsMarkets, ...bookmakerMarkets].filter(Boolean)),
    ];
  }, [allMatchOdds, filteredBookmakerOdds]);

  // =========================================================
  // SPORTSBOOK / PREMIUM FANCY ODDS
  // =========================================================
  const sportsbookOdds = useMemo(() => {
    const sportsbook = Array.isArray(oddsData?.sportsbook)
      ? oddsData.sportsbook
      : [];

    return sportsbook.filter(
      (item) =>
        item?.marketName !== "To Win The Match" &&
        item?.marketName !== "Which Team Will Win The Toss",
    );
  }, [oddsData?.sportsbook]);

  // =========================================================
  // FANCY ODDS
  // =========================================================
  const fancyOdds = useMemo(() => {
    const raw = Array.isArray(oddsData?.fancy) ? oddsData.fancy : [];
    return sortFancyOdds(raw);
  }, [oddsData?.fancy]);

  // =========================================================
  // PAGE & LOADING STATE
  // =========================================================
  const hasAnyMarket =
    (allMatchOdds && allMatchOdds.length > 0) ||
    (filteredBookmakerOdds && filteredBookmakerOdds.length > 0) ||
    (fancyOdds && fancyOdds.length > 0) ||
    (sportsbookOdds && sportsbookOdds.length > 0) ||
    (tossMarkets && tossMarkets.length > 0);

  const isSectionEmpty = !hasAnyMarket;

  const isInPlay = useMemo(() => {
    if (
      currentMatch?.inPlay === true ||
      currentMatch?.inplay === true ||
      currentMatch?.iplay === true
    ) {
      return true;
    }
    if (
      searchParams.get("inplay") === "true" ||
      searchParams.get("inPlay") === "true"
    ) {
      return true;
    }
    if (oddsData?.inPlay === true || oddsData?.inplay === true) {
      return true;
    }
    if (
      Array.isArray(oddsData?.matchOdds) &&
      oddsData.matchOdds.some((m) => m?.inPlay === true || m?.inplay === true)
    ) {
      return true;
    }
    if (
      Array.isArray(oddsData?.betfair) &&
      oddsData.betfair.some((m) => m?.inPlay === true || m?.inplay === true)
    ) {
      return true;
    }
    return false;
  }, [currentMatch, searchParams, oddsData]);

  const isPreBet = useMemo(() => {
    const preBetQuery =
      searchParams.get("preBet") || searchParams.get("prebet");
    if (preBetQuery === "true" || preBetQuery === "1") return true;
    if (
      currentMatch?.preBet === true ||
      currentMatch?.preBet === 1 ||
      currentMatch?.preBet === "true" ||
      currentMatch?.isPreBet === true ||
      currentMatch?.isPreBet === 1 ||
      currentMatch?.isPreBet === "true"
    ) {
      return true;
    }
    if (oddsData?.preBet === true || oddsData?.preBet === "true") {
      return true;
    }
    return false;
  }, [searchParams, currentMatch, oddsData]);

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    setTimedOut(false);
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, [eventId]);

  const isAllMarketsClosed = useMemo(() => {
    // 1. Explicit closed properties on oddsData or currentMatch
    if (
      oddsData?.isClosed === true ||
      oddsData?.isClosed === 1 ||
      oddsData?.isClosed === "true" ||
      oddsData?.status?.toUpperCase() === "CLOSED" ||
      oddsData?.status?.toUpperCase() === "SETTLED" ||
      oddsData?.status?.toUpperCase() === "FINISHED" ||
      currentMatch?.isClosed === true ||
      currentMatch?.isClosed === 1 ||
      currentMatch?.isClosed === "true" ||
      currentMatch?.status?.toUpperCase() === "CLOSED" ||
      currentMatch?.status?.toUpperCase() === "SETTLED" ||
      currentMatch?.status?.toUpperCase() === "FINISHED"
    ) {
      return true;
    }

    // 2. Server explicitly returned unavailable or failure
    if (
      oddsData &&
      (oddsData.available === false || oddsData.success === false)
    ) {
      return true;
    }

    // 3. If matchOdds array exists and EVERY market in it is closed, and no other markets exist
    if (Array.isArray(oddsData?.matchOdds) && oddsData.matchOdds.length > 0) {
      const allClosed = oddsData.matchOdds.every((m) => {
        const s = String(m?.oddsData?.status || m?.status || "").toUpperCase();
        return (
          s === "CLOSED" ||
          s === "SETTLED" ||
          s === "FINISHED" ||
          m?.isClosed === true ||
          m?.isClosed === 1 ||
          m?.oddsData?.isClosed === true ||
          m?.oddsData?.isClosed === 1
        );
      });
      if (allClosed && !hasAnyMarket) return true;
    }

    // 4. If server returned payload with explicit empty arrays after response
    if (
      oddsData &&
      typeof oddsData === "object" &&
      !hasAnyMarket &&
      Array.isArray(oddsData?.matchOdds) &&
      Array.isArray(oddsData?.bookmakers)
    ) {
      return true;
    }

    // 5. If timeout reached and still no markets
    if (timedOut && !hasAnyMarket) {
      return true;
    }

    return false;
  }, [oddsData, currentMatch, timedOut, hasAnyMarket]);

  const hasTriggeredClosedRef = useRef(false);
  useEffect(() => {
    if (isAllMarketsClosed) {
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
  }, [isAllMarketsClosed, navigate]);

  const matchOddsStatus = useMemo(() => {
    const primaryMarket =
      allMatchOdds.find((m) =>
        m?.marketName?.toLowerCase()?.includes("match odds"),
      ) ||
      allMatchOdds[0] ||
      filteredBookmakerOdds[0];

    if (!primaryMarket) return "OPEN";

    const rawStatus =
      primaryMarket?.oddsData?.status ||
      primaryMarket?.status ||
      oddsData?.status;

    const marketStatus = String(rawStatus || "").trim();

    const isMarketSuspended =
      marketStatus.toLowerCase() !== "active" &&
      marketStatus.toLowerCase() !== "open" &&
      marketStatus.toLowerCase() !== "online";

    if (isMarketSuspended) {
      return marketStatus.toUpperCase() || "SUSPENDED";
    }

    // Check if all runners are suspended even if market status is active/open
    const runners = primaryMarket?.oddsData?.runners;
    if (Array.isArray(runners) && runners.length > 0) {
      const allRunnersSuspended = runners.every((r) => {
        const rStatus = String(r?.status || "").toLowerCase();
        return (
          rStatus !== "active" && rStatus !== "open" && rStatus !== "online"
        );
      });
      if (allRunnersSuspended) {
        return "SUSPENDED";
      }
    }

    return "OPEN";
  }, [allMatchOdds, filteredBookmakerOdds, oddsData?.status]);

  return (
    <div className="w-full flex flex-col">
      <MatchDetailsBanner
        sportId={sportId}
        eventId={eventId}
        eventName={eventName}
        openDate={openDate}
        inPlay={isInPlay}
        preBet={isPreBet}
        statusText={matchOddsStatus}
        onScoreDataChange={setLiveScoreData}
      />

      <MatchCategory
        markets={uniqueMarkets}
        activeMarketCategory={activeMarketCategory}
        setactiveMarket={setActiveMarketCategory}
      />

      <div className="w-full flex flex-col min-h-[200px]">
        {isSectionEmpty ? (
          <div className="w-full py-12 flex flex-col items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            {/* =====================================================
                NORMAL MARKET ODDS
                ===================================================== */}
            <MarketOdds
              activeMarketCategory={lowerActiveCategory}
              odds={allMatchOdds}
            />

            {/* =====================================================
                BOOKMAKER
                ===================================================== */}
            <BookMakerOdds
              activeMarketCategory={lowerActiveCategory}
              odds={filteredBookmakerOdds}
            />

            {/* =====================================================
                TOSS
                ===================================================== */}
            <TossMarket odds={tossMarkets} />

            {/* =====================================================
                FANCY / PREMIUM SPORTSBOOK
                ===================================================== */}
            {(hasFancy || hasPremiumSportsbook) && (
              <FancyOdds
                f={hasFancy ? "true" : "false"}
                s={hasPremiumSportsbook ? "true" : "false"}
                sportsbookOdds={sportsbookOdds}
                fancyOdds={fancyOdds}
                scoreData={liveScoreData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CTSfullMarket;
