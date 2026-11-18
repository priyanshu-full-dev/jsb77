import { X } from "lucide-react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { memo, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  setMarketName,
  setRunningData,
  setMarketOddsData,
} from "../../../../redux/slices/fullmarketSlice";
import { prefetchAuraOddsData } from "../../../../socketClient";
import { toast } from "react-toastify";

// Import the external CSS
import "./ExposureDetailPopup.css";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { y: "-120%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 26,
      stiffness: 300,
      mass: 0.8,
    },
  },
  exit: {
    y: "-120%",
    opacity: 0,
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const ExposureDetailPopup = ({ onClose }) => {
  const { bets } = useSelector((state) => state.bets);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const allSports = useSelector((state) => {
    const safeArr = (val) => (Array.isArray(val) ? val : []);
    const aura = state?.auraMatches || {};
    const asian = state?.matches || {};

    const cricket =
      safeArr(aura.cricket?.matches?.data).length > 0
        ? aura.cricket.matches.data
        : safeArr(aura.cricket?.matches).length > 0
        ? aura.cricket.matches
        : safeArr(asian.cricket?.matches?.data);

    const tennis =
      safeArr(aura.tennis?.matches?.data).length > 0
        ? aura.tennis.matches.data
        : safeArr(aura.tennis?.matches).length > 0
        ? aura.tennis.matches
        : safeArr(asian.tennis?.matches?.data);

    const soccer =
      safeArr(aura.soccer?.matches?.data).length > 0
        ? aura.soccer.matches.data
        : safeArr(aura.soccer?.matches).length > 0
        ? aura.soccer.matches
        : safeArr(asian.soccer?.matches?.data);

    const horse =
      safeArr(aura.horse?.matches?.data).length > 0
        ? aura.horse.matches.data
        : safeArr(aura.horse?.matches);

    const greyhound =
      safeArr(aura.greyhound?.matches?.data).length > 0
        ? aura.greyhound.matches.data
        : safeArr(aura.greyhound?.matches);

    return [
      ...safeArr(cricket),
      ...safeArr(tennis),
      ...safeArr(soccer),
      ...safeArr(horse),
      ...safeArr(greyhound),
    ];
  }, shallowEqual);

  const groupedBets = useMemo(() => {
    const safeBets = Array.isArray(bets) ? bets : [];
    return safeBets.reduce((acc, bet) => {
      const { marketId } = bet;
      acc[marketId] = acc[marketId] || { bets: [] };
      acc[marketId].bets.push(bet);
      return acc;
    }, {});
  }, [bets]);

  const handleNavigateToEvent = (bet) => {
    if (!bet) return;

    const targetEventId = String(bet?.eventId || bet?.matchId || "");

    // 1. Check if already on this match's page
    const searchParams = new URLSearchParams(location.search);
    const currentEventId = String(
      searchParams.get("eventId") || searchParams.get("exEventId") || "",
    );

    const isMatchPage =
      location.pathname === "/full-market" ||
      location.pathname === "/horse-market" ||
      location.pathname === "/greyhound-market";

    if (
      isMatchPage &&
      currentEventId &&
      targetEventId &&
      currentEventId === targetEventId
    ) {
      // Already on the match page: scroll to top and close modal
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.documentElement?.scrollTo?.({ top: 0, behavior: "smooth" });
      if (onClose) onClose();
      return;
    }

    // 2. Find matching event from store
    const filterEvent = allSports.find((match) => {
      const mEventId = String(
        match?.eventId || match?.exEventId || match?._id || "",
      );
      if (targetEventId && mEventId && mEventId === targetEventId) return true;
      if (
        bet?.event &&
        match?.eventName &&
        match.eventName.trim().toLowerCase() === bet.event.trim().toLowerCase()
      ) {
        return true;
      }
      return false;
    });

    if (!filterEvent && !targetEventId) {
      return toast.warn("Event Not Found");
    }

    if (filterEvent?.matchRunners) {
      dispatch(setRunningData(filterEvent.matchRunners));
    }
    if (filterEvent?.markets) {
      dispatch(setMarketName(filterEvent.markets));
    }
    if (filterEvent?.matchOdds) {
      dispatch(
        setMarketOddsData({
          data: { data: filterEvent.matchOdds },
          sport: filterEvent?.sportName || bet?.sportsName,
        }),
      );
    }

    const sportNameToId = {
      cricket: 4,
      soccer: 1,
      football: 1,
      tennis: 2,
      horse: 7,
      "horse racing": 7,
      greyhound: 4339,
      "greyhound racing": 4339,
      kabaddi: 8,
    };

    const effectiveSportId = Number(
      filterEvent?.sportId ||
        bet?.eventType ||
        bet?.sportId ||
        sportNameToId[String(bet?.sportsName || "").toLowerCase()] ||
        4,
    );

    const effectiveEventId =
      filterEvent?.eventId ||
      filterEvent?.exEventId ||
      targetEventId;

    const effectiveMarketId =
      filterEvent?.marketId ||
      bet?.marketId ||
      "";

    const effectiveJoinedMarketIds =
      filterEvent?.joinedMarketIds ||
      bet?.joinedMarketIds ||
      effectiveEventId ||
      effectiveMarketId;

    const effectiveCompetitionId =
      filterEvent?.competitionId ||
      bet?.legueId ||
      bet?.competitionId ||
      "";

    const effectiveEventName =
      filterEvent?.eventName ||
      bet?.event ||
      bet?.eventName ||
      "";

    const effectiveOpenDate =
      filterEvent?.eventTime ||
      filterEvent?.openDate ||
      bet?.openDate ||
      "";

    const bm = filterEvent?.bm ?? filterEvent?.isBookmakers ?? "";
    const fancy = filterEvent?.fancy ?? filterEvent?.isFancy ?? "";
    const pc = filterEvent?.pc ?? filterEvent?.isSportsbook ?? "";
    const tv = filterEvent?.tv || "";

    if (effectiveSportId && effectiveEventId) {
      prefetchAuraOddsData?.({
        sportId: effectiveSportId,
        exEventId: effectiveEventId,
      });
    }

    if (
      effectiveSportId === 7 ||
      String(bet?.sportsName || "").toLowerCase().includes("horse")
    ) {
      navigate(
        `/horse-market?marketId=${effectiveMarketId}&exEventId=${effectiveEventId}&sportsName=horse&raceName=${encodeURIComponent(
          effectiveEventName,
        )}&sportId=7&eventTime=${encodeURIComponent(effectiveOpenDate)}`,
      );
    } else if (
      effectiveSportId === 4339 ||
      String(bet?.sportsName || "").toLowerCase().includes("greyhound")
    ) {
      navigate(
        `/greyhound-market?marketId=${effectiveMarketId}&exEventId=${effectiveEventId}&gmid=${effectiveMarketId}&sportsName=greyhound&raceName=${encodeURIComponent(
          effectiveEventName,
        )}&sportId=4339&eventTime=${encodeURIComponent(effectiveOpenDate)}`,
      );
    } else {
      navigate(
        `/full-market?eventType=${effectiveSportId}&eventId=${effectiveEventId}&marketId=${effectiveMarketId}&joinedMarketIds=${effectiveJoinedMarketIds}&competitionId=${effectiveCompetitionId}&bm=${bm}&fancy=${fancy}&pc=${pc}&eventName=${encodeURIComponent(
          effectiveEventName,
        )}&openDate=${encodeURIComponent(effectiveOpenDate)}&tv=${tv}`,
      );
    }

    if (onClose) onClose();
  };

  const hasData = Object.keys(groupedBets).length > 0;

  return (
    <motion.div
      className="exposure-modal-overlay"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="exposure-popup-container"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
      {/* Header */}
      <header className="exposure-header">
        <h2 className="exposure-title">
          Exposure Detail
        </h2>
        <button
          className="exposure-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X style={{ width: "18px", height: "18px" }} />
        </button>
      </header>

      {/* Table */}
      <div className="exposure-table-container">
        <table className="exposure-table">
          {/* THEAD */}
          <thead>
            <tr>
              <th className="exposure-th col-sport">
                Sport<br />Name
              </th>
              <th className="exposure-th col-event">
                Event Name
              </th>
              <th className="exposure-th col-market">
                Market<br />Name
              </th>
              <th className="exposure-th col-trade">
                Trade
              </th>
            </tr>
          </thead>

          {/* TBODY */}
          <tbody>
            {hasData
              ? Object.entries(groupedBets).map(
                  ([marketId, { bets }], index) => (
                    <tr key={`${marketId}-${index}`} className="exposure-tr">
                      <td className="exposure-td col-sport">
                        {bets[0]?.sportsName || "N/A"}
                      </td>
                      <td className="exposure-td col-event">
                        <button
                          className="exposure-event-link"
                          onClick={() => handleNavigateToEvent(bets[0])}
                          disabled={!bets[0]}
                        >
                          {bets[0]?.event || "N/A"}
                        </button>
                      </td>
                      <td className="exposure-td col-market">
                        {bets[0]?.market || "N/A"}
                      </td>
                      <td className="exposure-td col-trade">{bets.length}</td>
                    </tr>
                  ),
                )
              : null}
          </tbody>

          {/* TFOOT */}
          {!hasData && (
            <tfoot>
              <tr>
                <td colSpan={4} className="exposure-tfoot-td no-data">
                  No real-time records found
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      </motion.div>
    </motion.div>
  );
};

export default memo(ExposureDetailPopup);
