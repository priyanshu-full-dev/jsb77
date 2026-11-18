import { useEffect, useState } from "react";
import SportsMatchesList from "../../components/SportsMatchesList";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGradientColor,
  usePrimaryColor,
  usePrimaryTextColor,
} from "../../hooks/useThemeColors";
import { auraOddsMemoryCache } from "../../../../socketClient";

const isRaceClosed = (race) => {
  const cachedOdds = auraOddsMemoryCache?.get(
    String(race?.exEventId || race?.eventId || race?.marketId || ""),
  );

  const status = String(
    cachedOdds?.status ||
    cachedOdds?.matchOdds?.[0]?.oddsData?.status ||
    cachedOdds?.matchOdds?.[0]?.status ||
    race?.status ||
    race?.oddsData?.status ||
    race?.marketStatus ||
    race?.matchOdds?.status ||
    "",
  ).toUpperCase();

  const isClosedVal =
    race?.isClosed === 1 ||
    race?.isClosed === true ||
    race?.matchOdds?.isClosed === 1 ||
    race?.matchOdds?.isClosed === true ||
    cachedOdds?.isClosed === 1 ||
    cachedOdds?.isClosed === true ||
    cachedOdds?.matchOdds?.[0]?.isClosed === 1 ||
    cachedOdds?.matchOdds?.[0]?.isClosed === true ||
    cachedOdds?.matchOdds?.[0]?.oddsData?.isClosed === 1 ||
    cachedOdds?.matchOdds?.[0]?.oddsData?.isClosed === true;

  if (
    status === "CLOSED" ||
    status === "SETTLED" ||
    status === "COMPLETED" ||
    status === "FINISHED" ||
    isClosedVal
  ) {
    return true;
  }

  if (Array.isArray(cachedOdds?.matchOdds) && cachedOdds.matchOdds.length > 0) {
    const allClosed = cachedOdds.matchOdds.every((m) => {
      const s = String(m?.oddsData?.status || m?.status || "").toUpperCase();
      return (
        s === "CLOSED" ||
        s === "SETTLED" ||
        s === "COMPLETED" ||
        s === "FINISHED" ||
        m?.isClosed === 1 ||
        m?.isClosed === true ||
        m?.oddsData?.isClosed === 1 ||
        m?.oddsData?.isClosed === true
      );
    });
    if (allClosed) return true;
  }

  return false;
};

const isRaceInPlay = (race) => {
  if (isRaceClosed(race)) return false;

  if (
    race?.inPlay === true ||
    race?.inPlay === 1 ||
    race?.inPlay === "true" ||
    race?.inplay === true ||
    race?.inplay === 1 ||
    race?.inplay === "true" ||
    race?.iplay === true
  ) {
    return true;
  }

  const cachedOdds = auraOddsMemoryCache?.get(
    String(race?.exEventId || race?.eventId || race?.marketId || ""),
  );
  if (
    cachedOdds?.inPlay === true ||
    cachedOdds?.inPlay === 1 ||
    cachedOdds?.inplay === true ||
    cachedOdds?.matchOdds?.[0]?.inPlay === true ||
    cachedOdds?.matchOdds?.[0]?.oddsData?.inPlay === true
  ) {
    return true;
  }

  const status = String(
    cachedOdds?.status ||
    cachedOdds?.matchOdds?.[0]?.oddsData?.status ||
    cachedOdds?.matchOdds?.[0]?.status ||
    race?.status ||
    race?.oddsData?.status ||
    race?.marketStatus ||
    race?.matchOdds?.status ||
    "",
  ).toUpperCase();

  if (status === "INPLAY" || status === "IN_PLAY" || status === "LIVE") {
    return true;
  }

  const timeVal = race?.eventTime || race?.stime;
  if (timeVal) {
    const raceTime = new Date(timeVal).getTime();
    const now = Date.now();
    if (!isNaN(raceTime) && now >= raceTime && now - raceTime <= 2 * 60 * 1000) {
      return true;
    }
  }

  return false;
};

function SportMatchList({
  sportId = 4,
  filter = "Inplay",
  sportTitle = "Cricket",
  matchesList = [],
}) {
  const [showMatchList, setShowMatchList] = useState(true);
  const [filteredMatchList, setFilteredMatchList] = useState([]);

  const PrimaryColor = usePrimaryColor();
  const PrimaryTextColor = usePrimaryTextColor();
  const gradiantcolor = useGradientColor();

  useEffect(() => {
    if (!Array.isArray(matchesList)) {
      setFilteredMatchList([]);
      return;
    }

    const isRacing = Number(sportId) === 7 || Number(sportId) === 4339;

    if (filter === "Inplay") {
      const filteredMatches = matchesList
        .filter((match) => {
          if (isRacing) {
            return isRaceInPlay(match);
          }
          const cachedOdds = auraOddsMemoryCache?.get(
            String(match?.exEventId || match?.eventId || match?.marketId || "")
          );
          const cachedInPlay =
            cachedOdds?.inPlay === true ||
            cachedOdds?.inPlay === 1 ||
            cachedOdds?.inplay === true ||
            cachedOdds?.inplay === 1 ||
            cachedOdds?.matchOdds?.[0]?.inPlay === true ||
            cachedOdds?.matchOdds?.[0]?.oddsData?.inPlay === true;

          return (
            match?.inPlay === true ||
            match?.inPlay === 1 ||
            match?.inPlay === "true" ||
            match?.inplay === true ||
            match?.inplay === 1 ||
            match?.inplay === "true" ||
            match?.iplay === true ||
            cachedInPlay
          );
        })
        .map((match) => {
          if (isRacing) {
            return {
              ...match,
              inPlay: true,
              eventName: match?.eventName || match?.name || "Unknown",
            };
          }
          return match;
        });

      setFilteredMatchList(filteredMatches);
    } else if (filter === "Today") {
      const today = new Date();

      const filteredMatches = matchesList
        .filter((match) => {
          if (isRacing && isRaceClosed(match)) return false;

          const eventTime = match?.eventTime || match?.openDate || match?.stime;

          if (!eventTime) return false;

          const matchDate = new Date(eventTime);

          return (
            matchDate.getDate() === today.getDate() &&
            matchDate.getMonth() === today.getMonth() &&
            matchDate.getFullYear() === today.getFullYear()
          );
        })
        .map((match) => {
          if (isRacing) {
            return {
              ...match,
              inPlay: isRaceInPlay(match),
              eventName: match?.eventName || match?.name || "Unknown",
            };
          }
          return match;
        });

      setFilteredMatchList(filteredMatches);
    } else if (filter === "Tomorrow") {
      const today = new Date();

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const filteredMatches = matchesList
        .filter((match) => {
          if (isRacing && isRaceClosed(match)) return false;

          const eventTime = match?.eventTime || match?.openDate || match?.stime;

          if (!eventTime) return false;

          const matchDate = new Date(eventTime);

          return (
            matchDate.getDate() === tomorrow.getDate() &&
            matchDate.getMonth() === tomorrow.getMonth() &&
            matchDate.getFullYear() === tomorrow.getFullYear()
          );
        })
        .map((match) => {
          if (isRacing) {
            return {
              ...match,
              inPlay: isRaceInPlay(match),
              eventName: match?.eventName || match?.name || "Unknown",
            };
          }
          return match;
        });

      setFilteredMatchList(filteredMatches);
    } else {
      setFilteredMatchList([]);
    }
  }, [matchesList, filter, sportId]);



  const hasMatches = filteredMatchList.length > 0;


  const shouldShowCricketInplay =
    filter === "Inplay" && sportId === 4;


  if (!hasMatches && !shouldShowCricketInplay) {
    return null;
  }

  return (
    <div className="flex flex-col w-full py-0 px-0 mb-1">
      <div
        className="flex flex-row h-[32px] justify-center items-center py-1.5 px-3 select-none"
        style={{
          background: "#1F3B58",
        }}
      >
        <p className="text-[14px] text-white font-extrabold text-center tracking-wide">
          {sportTitle}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {showMatchList && (
          <motion.div
            key="matchList"
            className="flex-row border-b border-[#E9ECEF] bg-white dark:bg-dark-bg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SportsMatchesList
              sportId={sportId}
              sportName={sportTitle}
              matchesList={filteredMatchList}
              compactDesign={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SportMatchList;