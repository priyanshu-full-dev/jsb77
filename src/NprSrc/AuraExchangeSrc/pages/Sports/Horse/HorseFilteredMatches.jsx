import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { toast } from "react-toastify";
import ExposureToast from "../../../components/ExposureToast";

import CurrencyIcon from "../../../components/SportsMatchesList/pinSvg";
import "../../../components/SportsMatchesList/aura-inplay.css";
import { auraOddsMemoryCache } from "../../../../../socketClient";

const HorseFilteredMatches = ({ data, activeTab, DisplayName = true }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.user.token);
  const [pinnedEvents, setPinnedEvents] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pinnedTrackName") || "[]");
    setPinnedEvents(stored);
  }, []);

  const handlePinClick = (trackName) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    let updatedPins = [...pinnedEvents];

    if (updatedPins.includes(trackName)) {
      updatedPins = updatedPins.filter((id) => id !== trackName);
    } else {
      updatedPins.push(trackName);
    }

    setPinnedEvents(updatedPins);
    localStorage.setItem("pinnedTrackName", JSON.stringify(updatedPins));
    window.dispatchEvent(new Event("pinnedTrackNameUpdated"));
  };

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

    // INACTIVE status ko closed nahi maana gaya hai taaki pre-match ya temporarily inactive streams chup na jayen.
    // Sirf final status (CLOSED, SETTLED, COMPLETED, FINISHED) ko hi closed maante hain.
    if (
      status === "CLOSED" ||
      status === "SETTLED" ||
      status === "COMPLETED" ||
      status === "FINISHED" ||
      isClosedVal
    ) {
      return true;
    }

    // Initial load ke dauraan matchOdds empty array ho sakta hai, isliye length > 0 hone par hi every check chalate hain
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

    // 1. Explicit inPlay property check
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

    // 2. Cached odds from socket check
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

    // 3. Status text check
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

    if (
      status === "INPLAY" ||
      status === "IN_PLAY" ||
      status === "LIVE"
    ) {
      return true;
    }

    // 4. Exact live window check: only if started within the last 2 minutes
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

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const activeData = data.filter((race) => !isRaceClosed(race));
      const logTable = activeData.map((race, index) => {
        const inPlay = isRaceInPlay(race);
        const eventTimeVal = race?.eventTime || race?.stime || "";
        const raceDate = eventTimeVal ? new Date(eventTimeVal) : null;
        const timeFormatted =
          raceDate && !isNaN(raceDate.getTime())
            ? raceDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "-";

        return {
          "#": index + 1,
          Track: race?.eventName || race?.name || "Unknown",
          Country: race?.tournamentName || "-",
          Display: inPlay ? "🔴 In-Play" : `⏳ ${timeFormatted}`,
          "Event Time": timeFormatted,
          "Full DateTime": eventTimeVal,
          "race.inPlay": String(race?.inPlay ?? "-"),
        };
      });


    }
  }, [data]);

  const handleRaceClick = (race, raceName) => {
    // Game / race status check: agar running nahi hai (closed/settled/finished), open nahi hoga aur exact same error toast aayega
    if (isRaceClosed(race)) {
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

    setTimeout(() => {
      const eventTimeParam = race.eventTime || race.openDate || "";
      navigate(
        `/horse-market?marketId=${race.marketId}&exEventId=${
          race.exEventId
        }&sportsName=horse&raceName=${encodeURIComponent(raceName)}&sportId=7&eventTime=${encodeURIComponent(eventTimeParam)}`,
      );
    }, 100);
  };

  if (!data || data.length === 0) return null;

  // ==================== Group: tournamentName (country) -> eventName (track) ====================
  const groupedByCountry = data.reduce((acc, race) => {
    const country = race?.tournamentName?.trim() || "OTHER";
    if (!acc[country]) acc[country] = {};

    const trackKey = race?.eventName?.trim() || "Unknown";
    if (!acc[country][trackKey]) acc[country][trackKey] = [];

    acc[country][trackKey].push(race);
    return acc;
  }, {});

  const countries = Object.keys(groupedByCountry).filter(
    (country) => activeTab === "ALL" || country === activeTab,
  );

  const isAllTab = activeTab === "ALL";

  // ==================== ALL TAB: use the exact server socket indexing ====================
  if (isAllTab) {
    const allRaces = data
      .filter((race) => !isRaceClosed(race))
      .map((race) => {
        const trackName = race?.eventName?.trim() || race?.name?.trim() || "Unknown";
        const country = race?.tournamentName?.trim() || "-";

        const eventTimeVal = race?.eventTime || race?.stime;
        const raceDate = eventTimeVal ? new Date(eventTimeVal) : null;

        let formattedDateTime = "";
        let formattedTime = "";

        if (raceDate && !isNaN(raceDate.getTime())) {
          const day = String(raceDate.getDate()).padStart(2, "0");
          const month = String(raceDate.getMonth() + 1).padStart(2, "0");
          const year = raceDate.getFullYear();
          const hours = String(raceDate.getHours()).padStart(2, "0");
          const mins = String(raceDate.getMinutes()).padStart(2, "0");
          formattedDateTime = `${day}-${month}-${year} ${hours}:${mins}`;
          formattedTime = `${hours}:${mins}`;
        }

        const raceName = `${trackName} ${formattedDateTime || formattedTime}`;

        return {
          race,
          trackName,
          country,
          formattedDateTime,
          formattedTime,
          raceName,
        };
      });

    if (allRaces.length === 0) return null;

    return (
      <div className="bg-[white]">
        {allRaces.map(
          ({ race, trackName, formattedDateTime, raceName }, index) => {
            const isPinned = pinnedEvents.includes(trackName);

            return (
              <div
                key={race.marketId || `${trackName}-${index}`}
                onClick={() => handleRaceClick(race, raceName)}
                className="flex items-center justify-between mx-2 border-b border-[#c8ced3] px-1 py-[9px] cursor-pointer"
              >
                <div className="text-[13px] font-[sans-serif]">
                  <span className="text-[#2789ce] font-bold">{trackName}</span>{" "}
                  {/* In-play check jaise pehle use ho raha tha */}
                  {isRaceInPlay(race) ? (
                    <span className="aura-inplay pl-2">In-play</span>
                  ) : (
                    <span className="text-[#777777] ml-2 text-[11.5px]">
                      {formattedDateTime}
                    </span>
                  )}
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(trackName);
                  }}
                  className={`ml-2 rounded-full flex flex-row justify-center items-center p-[2px] cursor-pointer transition-all duration-200`}
                >
                  <CurrencyIcon
                    width={25}
                    height={25}
                    className={`${isPinned ? "text-[#6bbd0f]" : "text-[#7e97a6]"}`}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>
    );
  }

  // ==================== SPECIFIC TAB: grouped track headers + time buttons ====================
  return (
    <>
      {countries.map((country) => {
        const tracks = groupedByCountry[country];
        const trackNames = Object.keys(tracks);

        return (
          <div className=" bg-[white]" key={country}>
            {trackNames.map((trackName, idx) => {
              const races = [...tracks[trackName]].sort(
                (a, b) => new Date(a.eventTime) - new Date(b.eventTime),
              );

              /* Original check commented (code hatana nahi hai):
              const allRacesClosed = races.every(
                (race) => race?.status === "CLOSED",
              );
              */
              const allRacesClosed = races.every((race) => isRaceClosed(race));
              if (allRacesClosed) return null;

              const firstMatch = races[0]?.eventTime;
              const matchDate = firstMatch
                ? new Date(firstMatch).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })
                : "";

              const trackNameAndDate = `${trackName} `;

              return (
                <div
                  className="border-b mx-2 border-[#c8ced3]"
                  key={`${country}-${trackName}-${idx}`}
                >
                  <div
                    className={`font-bold px-2 pt-4 flex items-center justify-between text-[13px] font-[sans-serif]  ${
                      !DisplayName
                        ? "bg-[#294251] text-black"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {!DisplayName && (
                        <span className="text-[white]"> {country}</span>
                      )}

                      {!DisplayName && (
                        <MdKeyboardDoubleArrowRight color="white" />
                      )}

                      <span
                        className={`font-bold ${
                          !DisplayName ? "text-[#ffffff]" : ""
                        }`}
                      >
                        {trackNameAndDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-2">
                    {races.map((race, index) => {
                      /* Original check commented (code hatana nahi hai):
                      if (race?.status === "CLOSED") return null;
                      */
                      if (isRaceClosed(race)) return null;

                      const matchTime = new Date(race.eventTime);
                      matchTime.setMinutes(matchTime.getMinutes() - 20);

                      const currentTime = new Date();
                      currentTime.setMinutes(currentTime.getMinutes() + 10);

                      const currentlyAheadOfMatchTime =
                        matchTime <= currentTime;
                      /* Original check commented:
                      const isActive =
                        currentlyAheadOfMatchTime &&
                        race?.status !== "CLOSED" &&
                        race?.status !== "SUSPENDED";
                      */
                      const isActive =
                        currentlyAheadOfMatchTime &&
                        !isRaceClosed(race) &&
                        race?.status !== "SUSPENDED";

                      const correctMatchTime = new Date(race.eventTime);
                      const formattedTime = correctMatchTime.toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        },
                      );

                      const showFormattedTime =
                        correctMatchTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });

                      const raceName = `${trackNameAndDate} ${formattedTime}`;
                      const now = new Date();
                      const timeDifferenceInMinutes = Math.floor(
                        (correctMatchTime - now) / (1000 * 60),
                      );

                      const raceInPlay = isRaceInPlay(race);

                      return (
                        <button
                          onClick={() => handleRaceClick(race, raceName)}
                          key={race.marketId || index}
                          className={`px-3 flex items-center font-bold py-1 rounded-[2px] text-[11.5px] ${
                            isActive || raceInPlay
                              ? "bg-[#0c667e] text-white dark:text-white"
                              : "bg-[#e2e2e2] text-black"
                          } border border-transparent hover:border-[0.5px] hover:border-[#27a6c3]`}
                        >
                          <span
                            className={
                              raceInPlay || timeDifferenceInMinutes < 5
                                ? "inplay2"
                                : undefined
                            }
                          >
                            {showFormattedTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export default HorseFilteredMatches;
