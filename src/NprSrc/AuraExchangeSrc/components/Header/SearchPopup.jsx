import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setMarketName,
  setMarketOddsData,
  setRunningData,
} from "../../../../redux/slices/fullmarketSlice";
import { sportsList } from "./SiteNavigation";
import { sportsMapping } from "../../pages/FullMarket/CTSfullMarket/MatchDetailsBanner";
import {
  prefetchAuraOddsData,
  subscribeToAuraEventsData,
} from "../../../../socketClient";

export default function SearchPopup({ size = 18 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Subscribe to live Aura events for all sports
  useEffect(() => {
    const unsubSoccer = subscribeToAuraEventsData({ sportId: 1 });
    const unsubTennis = subscribeToAuraEventsData({ sportId: 2 });
    const unsubCricket = subscribeToAuraEventsData({ sportId: 4 });
    const unsubHorse = subscribeToAuraEventsData({ sportId: 7 });
    const unsubGreyhound = subscribeToAuraEventsData({ sportId: 4339 });
    const unsubBasketball = subscribeToAuraEventsData({ sportId: 7522 });

    return () => {
      unsubSoccer?.();
      unsubTennis?.();
      unsubCricket?.();
      unsubHorse?.();
      unsubGreyhound?.();
      unsubBasketball?.();
    };
  }, []);

  const auraMatches = useSelector((state) => state?.auraMatches);

  const allSports = useMemo(() => {
    const pool = Array.isArray(auraMatches?.cricket?.matches?.data)
      ? auraMatches.cricket.matches.data
      : Array.isArray(auraMatches?.cricket?.matches)
      ? auraMatches.cricket.matches
      : [];

    const getSportMatches = (sportIdNum, key, defaultSportName, defaultMarketName) => {
      const dedicated =
        auraMatches?.[key]?.matches?.data ||
        auraMatches?.[key]?.matches;

      const fromPool = pool.filter((m) => {
        if (String(m?.sportId) !== String(sportIdNum)) return false;
        if (sportIdNum === 4 && m?.tournamentName === "BallByBall") return false;
        return true;
      });

      const combined = [
        ...(Array.isArray(dedicated) ? dedicated : []),
        ...fromPool,
      ];

      const seen = new Set();
      const unique = [];

      for (const m of combined) {
        const id = String(
          m?.exEventId || m?.eventId || m?.id || m?.marketId || "",
        );
        if (id && !seen.has(id)) {
          seen.add(id);
          unique.push({
            ...m,
            sportId: m?.sportId || sportIdNum,
            sportName: m?.sportName || defaultSportName,
            marketName: m?.marketName || m?.market || defaultMarketName,
          });
        }
      }

      return unique;
    };

    // 1) Soccer
    const soccer = getSportMatches(1, "soccer", "Soccer", "MATCH_ODDS");

    // 2) Tennis
    const tennis = getSportMatches(2, "tennis", "Tennis", "MATCH_ODDS");

    // 3) Cricket
    const cricket = getSportMatches(4, "cricket", "Cricket", "Match Odds");

    // 4) Horse Racing
    const horse = getSportMatches(7, "horse", "Horse Racing", "WIN");

    // 5) Greyhound Racing
    const greyhound = getSportMatches(4339, "greyhound", "Greyhound Racing", "WIN");

    return [
      ...soccer,
      ...tennis,
      ...cricket,
      ...horse,
      ...greyhound,
    ];
  }, [auraMatches]);

  const filteredResults = useMemo(() => {
    if (!allSports || allSports.length === 0) return [];
    if (!searchQuery) return allSports;
    const query = searchQuery.toLowerCase().trim();
    return allSports.filter((result) => {
      const eventMatch = (result?.eventName || result?.name || "")
        .toLowerCase()
        .includes(query);
      const marketMatch = (result?.marketName || result?.market || "")
        .toLowerCase()
        .includes(query);
      const sportMatch = (result?.sportName || "")
        .toLowerCase()
        .includes(query);
      return eventMatch || marketMatch || sportMatch;
    });
  }, [allSports, searchQuery]);

  const displayResults = useMemo(() => {
    return filteredResults.slice(0, 80);
  }, [filteredResults]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleNavigateToEvent = (event) => {
    if (!event) return;

    const targetMarketId =
      event?.marketId || event?.gmid || event?.id || "";

    const targetExEventId =
      event?.exEventId ||
      event?.eventId ||
      event?.id ||
      targetMarketId;

    const effectiveSportId = Number(event?.sportId || 4);
    const currentSportName =
      event?.sportName || sportsMapping[effectiveSportId] || "Cricket";
    const eventTimeParam =
      event?.eventTime || event?.openDate || event?.stime || "";

    // HORSE RACING
    if (
      effectiveSportId === 7 ||
      String(currentSportName).toLowerCase().includes("horse")
    ) {
      const raceDate = eventTimeParam ? new Date(eventTimeParam) : null;
      let formattedDateTime = "";
      if (raceDate && !isNaN(raceDate.getTime())) {
        const day = String(raceDate.getDate()).padStart(2, "0");
        const month = String(raceDate.getMonth() + 1).padStart(2, "0");
        const year = raceDate.getFullYear();
        const hours = String(raceDate.getHours()).padStart(2, "0");
        const mins = String(raceDate.getMinutes()).padStart(2, "0");
        formattedDateTime = `${day}-${month}-${year} ${hours}:${mins}`;
      }
      const trackName = event?.eventName || event?.name || "Horse Racing";
      const raceName = `${trackName} ${formattedDateTime || eventTimeParam}`;

      setIsOpen(false);
      navigate(
        `/horse-market?marketId=${targetMarketId}&exEventId=${targetExEventId}&sportsName=horse&raceName=${encodeURIComponent(
          raceName,
        )}&sportId=7&eventTime=${encodeURIComponent(eventTimeParam)}`,
      );
      return;
    }

    // GREYHOUND RACING
    if (
      effectiveSportId === 4339 ||
      String(currentSportName).toLowerCase().includes("greyhound")
    ) {
      const raceDate = eventTimeParam ? new Date(eventTimeParam) : null;
      let formattedDateTime = "";
      if (raceDate && !isNaN(raceDate.getTime())) {
        const day = String(raceDate.getDate()).padStart(2, "0");
        const month = String(raceDate.getMonth() + 1).padStart(2, "0");
        const year = raceDate.getFullYear();
        const hours = String(raceDate.getHours()).padStart(2, "0");
        const mins = String(raceDate.getMinutes()).padStart(2, "0");
        formattedDateTime = `${day}-${month}-${year} ${hours}:${mins}`;
      }
      const trackName = event?.eventName || event?.name || "Greyhound Racing";
      const raceName = `${trackName} ${formattedDateTime || eventTimeParam}`;

      setIsOpen(false);
      navigate(
        `/greyhound-market?marketId=${targetMarketId}&exEventId=${targetExEventId}&gmid=${targetMarketId}&sportsName=greyhound&raceName=${encodeURIComponent(
          raceName,
        )}&sportId=4339&eventTime=${encodeURIComponent(eventTimeParam)}`,
      );
      return;
    }

    // CRICKET / SOCCER / TENNIS (FULL MARKET)
    if (effectiveSportId && targetExEventId) {
      prefetchAuraOddsData({
        sportId: effectiveSportId,
        exEventId: targetExEventId,
      });
    }

    if (event?.matchRunners) dispatch(setRunningData(event.matchRunners));
    if (event?.markets) dispatch(setMarketName(event.markets));
    if (event?.matchOdds) {
      dispatch(
        setMarketOddsData({
          data: { data: event.matchOdds },
          sport: currentSportName,
        }),
      );
    }

    setIsOpen(false);
    navigate(
      `/full-market?eventType=${effectiveSportId}&eventId=${targetExEventId}&marketId=${targetMarketId}&joinedMarketIds=${
        event?.joinedMarketIds || targetExEventId || targetMarketId
      }&competitionId=${event?.competitionId || event?.legueId || ""}&bm=${
        event?.bm ?? event?.isBookmakers ?? ""
      }&fancy=${event?.fancy ?? event?.isFancy ?? ""}&pc=${
        event?.pc ?? event?.isSportsbook ?? ""
      }&eventName=${encodeURIComponent(
        event?.eventName || event?.name || "",
      )}&openDate=${encodeURIComponent(eventTimeParam)}&tv=${event?.tv || ""}`,
    );
  };

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className="cursor-pointer inline-flex items-center justify-center p-1 active:scale-95 transition-transform"
      >
        <FaSearch color="white" size={size} />
      </span>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/80 top-0 flex justify-center items-start z-[99999]"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="w-full max-w-4xl dark:bg-dark-bg bg-light-bg h-80 shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Input Header */}
                <div className="flex items-center px-3 py-2 border-b border-[#ccc] dark:border-neutral-700 sticky top-0 dark:bg-dark-bg bg-light-bg z-10">
                  <FaSearch
                    size={14}
                    className="text-gray-400 mr-2 flex-shrink-0"
                  />

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search matches, events, tournaments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none border-none text-sm dark:!text-white !text-black py-1 bg-transparent focus:bg-transparent focus:ring-0 focus:shadow-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="ml-3 text-black dark:text-white hover:text-gray-600 p-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Search Results */}
                <div className="flex-1 max-h-80 overflow-y-auto">
                  {displayResults.map((result, index) => {
                    const rawDate =
                      result?.openDate || result?.eventTime || result?.stime;
                    const date = rawDate ? new Date(rawDate) : null;
                    const formatted =
                      date && !isNaN(date.getTime())
                        ? `${date.getDate().toString().padStart(2, "0")}/${(
                            date.getMonth() + 1
                          )
                            .toString()
                            .padStart(2, "0")}/${date.getFullYear()} ${
                            date.getHours() % 12 || 12
                          }:${date.getMinutes().toString().padStart(2, "0")} ${
                            date.getHours() >= 12 ? "PM" : "AM"
                          }`
                        : "";

                    const targetPrefetchId =
                      result?.exEventId ||
                      result?.eventId ||
                      result?.id ||
                      result?.marketId;

                    return (
                      <div
                        key={
                          targetPrefetchId || `${result?.eventName}-${index}`
                        }
                        className="px-2 py-1.5 cursor-pointer border-b border-black dark:border-gray-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onMouseEnter={() => {
                          if (result?.sportId && targetPrefetchId) {
                            prefetchAuraOddsData({
                              sportId: result?.sportId,
                              exEventId: targetPrefetchId,
                            });
                          }
                        }}
                        onTouchStart={() => {
                          if (result?.sportId && targetPrefetchId) {
                            prefetchAuraOddsData({
                              sportId: result?.sportId,
                              exEventId: targetPrefetchId,
                            });
                          }
                        }}
                        onClick={() => handleNavigateToEvent(result)}
                      >
                        <div className="flex justify-between items-start text-start">
                          <div className="flex-1">
                            <div className="text-[12px] font-bold text-black dark:text-white">
                              {result.sportName} | {result.marketName}
                            </div>
                            <div className="text-[12px] text-black dark:text-white font-medium">
                              {result.eventName}
                            </div>
                          </div>
                          <div className="text-[12px] text-black dark:text-white ml-4 whitespace-nowrap">
                            {formatted}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredResults.length === 0 && searchQuery && (
                    <div className="px-4 py-8 text-center text-black dark:text-white text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
