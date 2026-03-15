import { useEffect } from "react";
import { subscribeToMarketOddsData, unsubscribeFromMarketOdds } from "./socketClient";


const MarketDataSubscriber = ({ eventType, eventId, marketId, competitionId, sport }) => {
  useEffect(() => {
    subscribeToMarketOddsData({
      eventId: eventType,
      competitionId,
      matchId: eventId,
      marketId,
      sport,
    });
    return () => unsubscribeFromMarketOdds(eventType, marketId);
  }, [eventType, eventId, marketId, competitionId, sport]);

  return null;
};

export default MarketDataSubscriber;
