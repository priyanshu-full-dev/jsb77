// =============================================
// CTSfullMarket.jsx  (main page component)
// =============================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import MatchDetailsBanner from "./MatchDetailsBanner";
import MatchCategory from "./MatchCategory"; // ← assuming you have this (not shown)
import MarketOdds from "./MarketOdds";
import BookMakerOdds from "./BookmakerOdds";
import FancyOdds from "./FancyOdds";

import {
  subscribeToFancyOddsData,
  subscribeToMarketOddsData,
  subscribeToBookmakerData,
} from "../../../../socketClient";

import "../../FullMarket/aura-suspended.css";
import { handleCancelPlaceBet } from "../../../../redux/slices/placeBetSlice";
import MarketDataSubscriber from "../../../../MarketDataSubscriber";
import AnnouncementBar from "../../../components/Sports/AnnouncementBar";

const sportsMapping = {
  4: "Cricket",
  1: "Soccer",
  2: "Tennis",
};

function CTSfullMarket() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Query params
  const eventName = searchParams.get("eventName");
  const sportId = searchParams.get("eventType");
  const eventId = searchParams.get("eventId");
  const competitionId = searchParams.get("competitionId");
  const joinedMarketIds = searchParams.get("joinedMarketIds");
  const openDate = searchParams.get("openDate");
  const bm = searchParams.get("bm");
  const f = searchParams.get("fancy");
  const s = searchParams.get("pc"); // probably "specials" or "player construct"

  const markets = useSelector((state) => state?.marketOdds?.marketName || []);
  const [activeMarketCategory, setActiveMarketCategory] = useState("All");

  const lowerActiveCategory = useMemo(
    () => activeMarketCategory?.toLowerCase(),
    [activeMarketCategory],
  );

  const sport = useMemo(() => sportsMapping[sportId] || "", [sportId]);
  const timeoutRefs = useRef(new Map());

  // FANCY subscription
  useEffect(() => {
    if (f === "true" && sportId && eventId && competitionId) {
      const unsubscribe = subscribeToFancyOddsData({
        eventId,
        eventType: sportId,
        competitionId,
        sport,
      });
      return unsubscribe;
    }
  }, [sportId, competitionId, eventId, f, sport]);

  // BOOKMAKER subscription
  useEffect(() => {
    if (bm === "true" && sportId && eventId && competitionId) {
      const unsubscribe = subscribeToBookmakerData({
        eventId,
        eventType: sportId,
        competitionId,
        sport,
      });
      return unsubscribe;
    }
  }, [sportId, competitionId, eventId, bm, sport]);

  // MARKET ODDS subscription
  useEffect(() => {
    if (!eventId || !sport) return;

    const subscriptionData = {
      eventId: eventId,
      eventType: sportId,
      competitionId,
      matchId: eventId,
      marketId: joinedMarketIds,
      sport,
    };

    const unsubscribe = subscribeToMarketOddsData(subscriptionData);

    return () => {
      unsubscribe();
      dispatch(handleCancelPlaceBet());
      timeoutRefs.current?.forEach(clearTimeout);
      timeoutRefs.current.clear();
    };
  }, [eventId, sportId, competitionId, joinedMarketIds, sport, dispatch]);

  return (
    <div className="w-full bg-[#D9D9D9] flex flex-col pb-[100px]">
      <AnnouncementBar/>
      <MatchDetailsBanner
        sportId={sportId}
        eventId={eventId}
        eventName={eventName}
        openDate={openDate}
      />

      <MarketDataSubscriber
        eventType={sportId}
        eventId={eventId}
        marketId={joinedMarketIds}
        competitionId={competitionId}
        sport={sport}
      />

      <div className="w-full flex flex-col">
        {(lowerActiveCategory === "match odds" ||
          lowerActiveCategory === "all" ||
          lowerActiveCategory === "popular" ||
          lowerActiveCategory === "to win the toss" ||
          lowerActiveCategory === "tied match") && (
          <MarketOdds activeMarketCategory={lowerActiveCategory} />
        )}

        {bm === "true" &&
          (lowerActiveCategory === "bookmaker" ||
            lowerActiveCategory === "all" ||
            lowerActiveCategory === "popular") && <BookMakerOdds />}

        {(f === "true" || s === "true") && <FancyOdds f={f} s={s} />}
      </div>
    </div>
  );
}

export default CTSfullMarket;
