import { useMemo } from "react";

// Global cache: key = marketId, value = market object
const marketCache = new Map();

function useGetMarketNameByMarketId(marketId, markets) {
    // Merge new markets into the global cache
    if (Array.isArray(markets)) {
        for (const market of markets) {
            if (market && market.marketId && !marketCache.has(market.marketId)) {
                marketCache.set(market.marketId, market);
            }
        }
    }

    const marketName = useMemo(() => {
        const match = marketCache.get(marketId);
        return { marketName: match?.marketName || null };
    }, [marketId, markets]);

    return marketName;
}

export default useGetMarketNameByMarketId;
