import { useEffect, useState } from "react";
import { MdPushPin } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setMarketName,
  setMarketOddsData,
  setRunningData,
} from "../../../../redux/slices/fullmarketSlice";
import MatchDateAndInplay from "./MatchDateAndInplay";
import { Premiumcricket } from "../../../../utils/helper/commonSelectors";
import CurrencyIcon from "./pinSvg";
import TimeIcon from "./TimeIcon";
import { prefetchAuraOddsData, auraOddsMemoryCache } from "../../../../socketClient";
import { toast } from "react-toastify";
import ExposureToast from "../ExposureToast";

const isMatchClosed = (item, exEventId) => {
  if (!item) return false;

  // 1. Explicit closed properties
  if (
    item?.isClosed === true ||
    item?.isClosed === 1 ||
    item?.isClosed === "true" ||
    item?.is_closed === true ||
    item?.matchOdds?.isClosed === 1 ||
    item?.matchOdds?.isClosed === true
  ) {
    return true;
  }

  // 2. Check item status
  const itemStatus = String(
    item?.status ||
    item?.oddsData?.status ||
    item?.matchOdds?.status ||
    item?.marketStatus ||
    "",
  ).trim().toUpperCase();

  if (
    itemStatus === "CLOSED" ||
    itemStatus === "SETTLED" ||
    itemStatus === "COMPLETED" ||
    itemStatus === "FINISHED"
  ) {
    return true;
  }

  // 3. Socket cached odds check
  const eventKey = String(exEventId || item?.exEventId || item?.eventId || item?.marketId || "");
  const cachedOdds = eventKey ? auraOddsMemoryCache?.get(eventKey) : null;
  if (cachedOdds) {
    if (
      cachedOdds?.isClosed === 1 ||
      cachedOdds?.isClosed === true ||
      cachedOdds?.isClosed === "true" ||
      cachedOdds?.matchOdds?.[0]?.isClosed === 1 ||
      cachedOdds?.matchOdds?.[0]?.isClosed === true ||
      cachedOdds?.matchOdds?.[0]?.oddsData?.isClosed === 1 ||
      cachedOdds?.matchOdds?.[0]?.oddsData?.isClosed === true
    ) {
      return true;
    }

    const cachedStatus = String(
      cachedOdds?.status ||
      cachedOdds?.matchOdds?.[0]?.oddsData?.status ||
      cachedOdds?.matchOdds?.[0]?.status ||
      "",
    ).trim().toUpperCase();

    if (
      cachedStatus === "CLOSED" ||
      cachedStatus === "SETTLED" ||
      cachedStatus === "COMPLETED" ||
      cachedStatus === "FINISHED"
    ) {
      return true;
    }

    if (Array.isArray(cachedOdds?.matchOdds) && cachedOdds.matchOdds.length > 0) {
      const allClosed = cachedOdds.matchOdds.every((m) => {
        const s = String(m?.oddsData?.status || m?.status || "").trim().toUpperCase();
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
  }

  // 4. If matchItem.markets is present and every market is closed
  if (Array.isArray(item?.markets) && item.markets.length > 0) {
    const allMarketsClosed = item.markets.every((m) => {
      const s = String(m?.status || m?.marketStatus || "").trim().toUpperCase();
      return (
        s === "CLOSED" ||
        s === "SETTLED" ||
        s === "COMPLETED" ||
        s === "FINISHED" ||
        m?.isClosed === true ||
        m?.isClosed === 1
      );
    });
    if (allMarketsClosed) return true;
  }

  return false;
};

function SportsMatchesList({
  sportId,
  sportName = "Cricket",
  matchesList = [],
  compactDesign = false,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.token);

  const [pinnedEvents, setPinnedEvents] = useState([]);
  const cunnentPathName = window.location.pathname;

  const BALL_BY_BALL_ID = "ball-by-ball";

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pinnedEvents") || "[]");
    setPinnedEvents(stored);
  }, []);

  const handlePinClick = (id) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    let updatedPins = [...pinnedEvents];

    if (updatedPins.includes(id)) {
      updatedPins = updatedPins.filter((x) => x !== id);
    } else {
      updatedPins.push(id);
    }

    setPinnedEvents(updatedPins);
    localStorage.setItem("pinnedEvents", JSON.stringify(updatedPins));

    window.dispatchEvent(new Event("pinnedEventsUpdated"));
  };

  const premiumCricket = useSelector(Premiumcricket());

  const isBallByBallPinned = pinnedEvents.includes(BALL_BY_BALL_ID);

  // Pre-warm only top 2 active matches gently to keep upstream & socket light
  useEffect(() => {
    if (!Array.isArray(matchesList) || matchesList.length === 0) return;

    const topMatches = matchesList.slice(0, 2);
    const timers = [];

    topMatches.forEach((m, idx) => {
      const timer = setTimeout(() => {
        const effectiveSportId = Number(sportId || m?.sportId || m?.sportID);
        const targetExEventId =
          m?.exEventId || m?.eventId || m?.id || m?.marketId;

        if (effectiveSportId && targetExEventId) {
          prefetchAuraOddsData({
            sportId: effectiveSportId,
            exEventId: targetExEventId,
          });
        }
      }, idx * 300);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [matchesList, sportId]);

  const ballbyballHandler = () => {
    // toast.error(
    //   <ExposureToast type="error" title="Sorry" subtitle="No Markets are active" />
    // );
    navigate(`/ballByBall/4.3544687543453`);
  };

  const handlePrefetch = (matchItem) => {
    const effectiveSportId = Number(
      sportId || matchItem?.sportId || matchItem?.sportID,
    );
    const targetMarketId =
      matchItem?.marketId || matchItem?.gmid || matchItem?.id || "";
    const targetExEventId =
      matchItem?.exEventId ||
      matchItem?.eventId ||
      matchItem?.id ||
      targetMarketId;

    if (effectiveSportId && targetExEventId) {
      prefetchAuraOddsData({
        sportId: effectiveSportId,
        exEventId: targetExEventId,
      });
    }

    // Preload route chunk for instant 0ms route change
    if (effectiveSportId === 7 || matchItem?.sportName === "Horse Racing") {
      import("../../pages/Sports/Horse/HorseMarket");
    } else if (
      effectiveSportId === 4339 ||
      matchItem?.sportName === "Greyhound Racing"
    ) {
      import("../../pages/Sports/Greyhound/GreyhoundMarket");
    } else {
      import("../../pages/FullMarket/CTSfullMarket");
    }
  };

  const [activeFilter, setActiveFilter] = useState("time");

  return (
    <div className={`w-full flex flex-col bg-white ${compactDesign ? "" : "min-h-[calc(100vh-140px)]"}`}>
      {/* 1. Highlights Header Bar (Dark Navy #1F3B58) - Only on main sports pages, not in Inplay */}
      {!compactDesign && (
        <div className="w-full bg-[#1F3B58] text-white py-2 px-3 text-center font-extrabold text-[15px] tracking-wide select-none shadow-xs">
          Highlights
        </div>
      )}

      {/* 2. by Time / by Competition Filter Bar - Only on main sports pages, not in Inplay */}
      {!compactDesign && (
        <div className="w-full bg-[#EAEAEA] py-1.5 px-3 flex items-center justify-center border-b border-[#D5D5D5]">
          <div className="w-full flex items-center bg-[#D6D6D6] p-[3px] rounded-[6px] gap-1">
            <button
              type="button"
              onClick={() => setActiveFilter("time")}
              className={`flex-1 h-[28px] flex items-center justify-center font-bold text-[13px] transition select-none ${
                activeFilter === "time"
                  ? "bg-white text-[#1976D2] rounded-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                  : "bg-transparent text-[#262626] hover:text-black"
              }`}
            >
              by Time
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("competition")}
              className={`flex-1 h-[28px] flex items-center justify-center font-bold text-[13px] transition select-none ${
                activeFilter === "competition"
                  ? "bg-white text-[#1976D2] rounded-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                  : "bg-transparent text-[#262626] hover:text-black"
              }`}
            >
              by Competition
            </button>
          </div>
        </div>
      )}

      {/* Ball by Ball (Cricket Only on main sports pages, not in Inplay) */}
      {!compactDesign && sportId == 4 && (
        <div
          key={BALL_BY_BALL_ID}
          onClick={ballbyballHandler}
          className="w-full px-3 py-2 bg-white flex flex-row justify-between items-center border-b border-[#E9ECEF] cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#1565C0] text-white flex items-center justify-center text-[8px] font-bold">
                ▶
              </span>
              <span className="w-4 h-4 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[9px]">
                ⏰
              </span>
              <span className="bg-[#E65100] text-white text-[10px] font-extrabold px-1 py-[0.5px] rounded-[3px] leading-tight">
                P
              </span>
              <span className="text-[11px] font-semibold text-[#6c757d]">
                In-Play
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#52b72a] flex-shrink-0" />
              <span className="font-extrabold text-[#0B71CD] text-[14.5px]">
                Ball by Ball
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-[#E65100] text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-[3px]">
              S
            </span>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handlePinClick(BALL_BY_BALL_ID);
              }}
              className="w-7 h-7 flex items-center justify-center cursor-pointer text-[#94a8b7] hover:text-[#52b72a]"
            >
              <CurrencyIcon
                width={25}
                height={25}
                className={isBallByBallPinned ? "text-[#52b72a]" : "text-[#94a8b7]"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Matches List */}
      {Array.isArray(matchesList) &&
        matchesList.map((matchItem, i) => {
          const {
            eventName,
            sportId: sportID,
            legueId: competitionId,
            exEventId: eventId,
            marketId,
            exEventId: joinedMarketIds,
            matchRunners,
            markets,
            eventTime,
            matchOdds,
            isBookmakers: bm,
            isFancy: fancy,
            isSportsbook: sb,
            sportName: matchSportName,
            tv,
            inPlay,
            preBet,
            openDate,
          } = matchItem || {};

          const effectiveSportId = Number(
            sportId || sportID || matchItem?.sportId,
          );
          const currentSportName =
            matchSportName || sportName || matchItem?.sportName;

          const targetMarketId =
            matchItem?.marketId ||
            matchItem?.gmid ||
            matchItem?.id ||
            marketId ||
            "";

          const targetExEventId =
            matchItem?.exEventId ||
            matchItem?.eventId ||
            matchItem?.id ||
            eventId ||
            targetMarketId;

          const isPinned = pinnedEvents.includes(targetExEventId);

          return (
            <div
              key={`${i + 1}-${targetExEventId || targetMarketId || i}`}
              onMouseEnter={() => handlePrefetch(matchItem)}
              onPointerEnter={() => handlePrefetch(matchItem)}
              onTouchStart={() => handlePrefetch(matchItem)}
              className="w-full px-3 py-2 bg-white flex flex-row justify-between items-center border-b border-[#E9ECEF] hover:bg-gray-50 transition cursor-pointer"
            >
              <div
                role="button"
                onClick={() => {
                  if (isMatchClosed(matchItem, targetExEventId)) {
                    toast.dismiss();
                    toast.error(
                      <ExposureToast
                        type="error"
                        title="Sorry"
                        subtitle="No Markets are active"
                      />,
                    );
                    navigate("/", { replace: true });
                    return;
                  }

                  if (
                    effectiveSportId === 7 ||
                    currentSportName === "Horse Racing"
                  ) {
                    const eventTimeParam =
                      matchItem?.eventTime ||
                      matchItem?.openDate ||
                      matchItem?.stime ||
                      eventTime ||
                      openDate ||
                      "";

                    const raceDate = eventTimeParam
                      ? new Date(eventTimeParam)
                      : null;
                    let formattedDateTime = "";
                    if (raceDate && !isNaN(raceDate.getTime())) {
                      const day = String(raceDate.getDate()).padStart(2, "0");
                      const month = String(raceDate.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const year = raceDate.getFullYear();
                      const hours = String(raceDate.getHours()).padStart(
                        2,
                        "0",
                      );
                      const mins = String(raceDate.getMinutes()).padStart(
                        2,
                        "0",
                      );
                      formattedDateTime = `${day}-${month}-${year} ${hours}:${mins}`;
                    }

                    const trackName =
                      matchItem?.eventName ||
                      matchItem?.name ||
                      eventName ||
                      "Horse Racing";

                    const raceName = `${trackName} ${formattedDateTime || eventTimeParam}`;

                    navigate(
                      `/horse-market?marketId=${targetMarketId}&exEventId=${targetExEventId}&sportsName=horse&raceName=${encodeURIComponent(
                        raceName,
                      )}&sportId=7&eventTime=${encodeURIComponent(
                        eventTimeParam,
                      )}`,
                    );
                    return;
                  }

                  if (
                    effectiveSportId === 4339 ||
                    currentSportName === "Greyhound Racing"
                  ) {
                    const eventTimeParam =
                      matchItem?.eventTime ||
                      matchItem?.openDate ||
                      matchItem?.stime ||
                      eventTime ||
                      openDate ||
                      "";

                    const raceDate = eventTimeParam
                      ? new Date(eventTimeParam)
                      : null;
                    let formattedDateTime = "";
                    if (raceDate && !isNaN(raceDate.getTime())) {
                      const day = String(raceDate.getDate()).padStart(2, "0");
                      const month = String(raceDate.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const year = raceDate.getFullYear();
                      const hours = String(raceDate.getHours()).padStart(
                        2,
                        "0",
                      );
                      const mins = String(raceDate.getMinutes()).padStart(
                        2,
                        "0",
                      );
                      formattedDateTime = `${day}-${month}-${year} ${hours}:${mins}`;
                    }

                    const trackName =
                      matchItem?.eventName ||
                      matchItem?.name ||
                      eventName ||
                      "Greyhound Racing";

                    const raceName = `${trackName} ${formattedDateTime || eventTimeParam}`;

                    navigate(
                      `/greyhound-market?marketId=${targetMarketId}&exEventId=${targetExEventId}&gmid=${targetMarketId}&sportsName=greyhound&raceName=${encodeURIComponent(
                        raceName,
                      )}&sportId=4339&eventTime=${encodeURIComponent(
                        eventTimeParam,
                      )}`,
                    );
                    return;
                  }

                  dispatch(setRunningData(matchRunners));
                  dispatch(setMarketName(markets));
                  dispatch(
                    setMarketOddsData({
                      data: { data: matchOdds },
                      sport: currentSportName,
                    }),
                  );
                  navigate(
                    `/full-market?eventType=${sportId || sportID}&eventId=${targetExEventId}&marketId=${targetMarketId}&joinedMarketIds=${targetExEventId}&competitionId=${competitionId || ""}&bm=${bm || ""}&fancy=${fancy || ""}&pc=${sb || ""}&eventName=${encodeURIComponent(eventName || "")}&openDate=${eventTime || openDate || ""}&tv=${tv || ""}&preBet=${Boolean(preBet)}&inPlay=${Boolean(inPlay)}`,
                  );
                }}
                className="flex-1 pr-2 text-left cursor-pointer flex flex-col justify-center gap-1"
              >
                {/* Row 1: Badges & Live Status */}
                <div className="flex flex-row items-center gap-1.5 flex-wrap">
                  {/* Play Video Icon */}
                  <span className="w-4 h-4 rounded-full bg-[#1565C0] text-white flex items-center justify-center text-[8px] font-bold">
                    ▶
                  </span>

                  {/* Green Clock Icon */}
                  <span className="w-4 h-4 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[9px]">
                    ⏰
                  </span>

                  {/* BM (Bookmaker) Badge */}
                  {bm && (
                    <span className="bg-[#0050A4] text-white text-[10px] font-extrabold px-1 py-[0.5px] rounded-[3px] leading-tight">
                      BM
                    </span>
                  )}

                  {/* F (Fancy) Badge */}
                  {fancy && (
                    <span className="bg-[#00965E] text-white text-[10px] font-extrabold px-1 py-[0.5px] rounded-[3px] leading-tight">
                      F
                    </span>
                  )}

                  {/* P (Premium) Badge */}
                  <span className="bg-[#E65100] text-white text-[10px] font-extrabold px-1 py-[0.5px] rounded-[3px] leading-tight">
                    P
                  </span>

                  {/* In-play or DateTime */}
                  {inPlay ? (
                    <span className="text-[11px] font-semibold text-[#6c757d]">
                      In-Play
                    </span>
                  ) : (
                    (eventTime || openDate) && (
                      <span className="text-[11px] font-semibold text-[#6c757d]">
                        {new Date(eventTime || openDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )
                  )}
                </div>

                {/* Row 2: Green Dot + Match Title in Blue */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#52b72a] flex-shrink-0" />
                  <span className="font-extrabold text-[#0B71CD] text-[14.5px] hover:underline leading-tight">
                    {eventName}
                  </span>
                </div>
              </div>

              {/* Pin Icon on Right */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinClick(targetExEventId);
                }}
                className="w-7 h-7 flex items-center justify-center cursor-pointer transition flex-shrink-0 text-[#94a8b7] hover:text-[#52b72a]"
              >
                <CurrencyIcon
                  width={25}
                  height={25}
                  className={isPinned ? "text-[#52b72a]" : "text-[#94a8b7]"}
                />
              </div>
            </div>
          );
        })}

      {matchesList && matchesList.length === 0 && sportId !== 4 && (
        <div className="w-full h-full flex flex-row justify-center items-center text-sm font-bold text-gray2">
          No match scheduled.
        </div>
      )}
    </div>
  );
}

export default SportsMatchesList;
