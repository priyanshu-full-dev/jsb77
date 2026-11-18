import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { useGradientColor } from "../../../hooks/useThemeColors";
import { toast } from "react-toastify";
import ExposureToast from "../../../components/ExposureToast";

import CurrencyIcon from "../../../components/SportsMatchesList/pinSvg";
import "../../../components/SportsMatchesList/aura-inplay.css";
import { auraOddsMemoryCache } from "../../../../../socketClient";

// GreyhoundFilteredMatches: Aura aur Legacy dono feeds ko handle karta hai.
// ALL tab par original reference ke anusaar har track ka agla active race 1 row me render hota hai.
// Country tabs par track ke sabhi races ke time buttons dikhte hain.
const GreyhoundFilteredMatches = ({ data, activeTab, DisplayName = true }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.user.token);
  const [pinnedEvents, setPinnedEvents] = useState([]);
  const gradientColor = useGradientColor();

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

  // Normalize data: supports both flat Aura array and legacy hierarchical array
  const normalizedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    // Flat Aura array
    if (
      data.length > 0 &&
      (data[0]?.tournamentName !== undefined || data[0]?.exEventId !== undefined)
    ) {
      return data;
    }

    // Legacy hierarchical data
    if (data.length > 0 && data[0]?.cname !== undefined) {
      const flat = [];
      data.forEach((country) => {
        const cname = country?.cname || "OTHER";
        country?.children?.forEach((event) => {
          const ename = event?.ename || "Unknown";
          event?.children?.forEach((race) => {
            flat.push({
              ...race,
              tournamentName: cname,
              eventName: ename,
              marketId: race.gmid || race.marketId,
              exEventId: race.eventId || race.gmid || race.marketId,
              eventTime: race.stime,
              status: race?.hOdds?.status || race.status,
              inPlay: race?.hOdds?.inPlay ?? false,
            });
          });
        });
      });
      return flat;
    }

    return data;
  }, [data]);

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

    // Only actual finalized/finished statuses indicate closed
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

    // Past race check: if scheduled time is > 5 minutes in the past and not in-play, consider closed
    const timeVal = race?.eventTime || race?.stime;
    if (timeVal) {
      const raceTime = new Date(timeVal).getTime();
      const now = Date.now();
      if (!isNaN(raceTime) && now - raceTime > 5 * 60 * 1000) {
        const inPlay =
          race?.inPlay === true ||
          race?.inplay === true ||
          race?.iplay === true ||
          cachedOdds?.inPlay === true ||
          cachedOdds?.inplay === true;
        if (!inPlay) {
          return true;
        }
      }
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

  const handleRaceClick = (race, raceName) => {
    // If closed, don't open and show error toast
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
      const eventTimeParam = race.eventTime || race.stime || race.openDate || "";
      const targetMarketId = race.marketId || race.gmid || "";
      const targetExEventId = race.exEventId || race.eventId || targetMarketId;

      navigate(
        `/greyhound-market?marketId=${targetMarketId}&exEventId=${targetExEventId}&gmid=${targetMarketId}&sportsName=greyhound&raceName=${encodeURIComponent(
          raceName,
        )}&sportId=4339&eventTime=${encodeURIComponent(eventTimeParam)}`,
      );
    }, 100);
  };

  if (!normalizedData || normalizedData.length === 0) return null;

  // Group by country (tournamentName) -> track (eventName)
  const groupedByCountry = normalizedData.reduce((acc, race) => {
    const country =
      race?.tournamentName?.trim() || race?.cname?.trim() || "OTHER";
    if (!acc[country]) acc[country] = {};

    const trackKey =
      race?.eventName?.trim() || race?.ename?.trim() || "Unknown";
    if (!acc[country][trackKey]) acc[country][trackKey] = [];

    acc[country][trackKey].push(race);
    return acc;
  }, {});

  const countries = Object.keys(groupedByCountry).filter(
    (country) => activeTab === "ALL" || country === activeTab,
  );

  const isAllTab = activeTab === "ALL";

  // ==================== ALL TAB: flattened chronological list ====================
  if (isAllTab) {
    const allRaces = [];

    countries.forEach((country) => {
      const tracks = groupedByCountry[country];

      Object.keys(tracks).forEach((trackName) => {
        const races = [...tracks[trackName]].sort(
          (a, b) =>
            new Date(a.eventTime || a.stime) - new Date(b.eventTime || b.stime),
        );

        // Filter out completed / closed races
        const activeRaces = races.filter((race) => !isRaceClosed(race));
        if (activeRaces.length === 0) return;

        // In original Greyhound Schedule, each track is listed once with its next upcoming race
        const nextRace = activeRaces[0];

        const matchDate = nextRace.eventTime || nextRace.stime
          ? new Date(nextRace.eventTime || nextRace.stime).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              },
            )
          : "";

        const formattedTime = nextRace.eventTime || nextRace.stime
          ? new Date(nextRace.eventTime || nextRace.stime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "";

        const trackNameAndDate = `${trackName} ${matchDate}`;
        const raceName = `${trackNameAndDate} ${formattedTime}`;

        allRaces.push({
          race: nextRace,
          trackName,
          country,
          matchDate,
          formattedTime,
          raceName,
        });
      });
    });

    allRaces.sort(
      (a, b) =>
        new Date(a.race.eventTime || a.race.stime) -
        new Date(b.race.eventTime || b.race.stime),
    );

    if (allRaces.length === 0) {
      return (
        <div className="text-center text-xs p-4 text-gray-500">
          No greyhound races available right now.
        </div>
      );
    }

    return (
      <div className="bg-[white]">
        {allRaces.map(
          ({ race, trackName, matchDate, formattedTime, raceName }, index) => {
            const isPinned = pinnedEvents.includes(trackName);

            return (
              <div
                key={race.marketId || race.gmid || `${trackName}-${index}`}
                onClick={() => handleRaceClick(race, raceName)}
                className="flex items-center justify-between mx-2 border-b border-[#c8ced3] px-1 py-[9px] cursor-pointer"
              >
                <div className="text-[13px] font-[sans-serif]">
                  <span className="text-[#2789ce] font-bold">{trackName}</span>{" "}
                  {isRaceInPlay(race) ? (
                    <span className="aura-inplay pl-2">In-play</span>
                  ) : (
                    <span className="text-[#777777] ml-0.5 text-[11.5px]">
                      {matchDate.replace(/\//g, "-")} {formattedTime}
                    </span>
                  )}
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(trackName);
                  }}
                  className="ml-2 rounded-full flex flex-row justify-center items-center p-[2px] cursor-pointer transition-all duration-200"
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
          <div className="bg-[white]" key={country}>
            {trackNames.map((trackName, idx) => {
              const races = [...tracks[trackName]].sort(
                (a, b) =>
                  new Date(a.eventTime || a.stime) -
                  new Date(b.eventTime || b.stime),
              );

              const allRacesClosed = races.every((race) => isRaceClosed(race));
              if (allRacesClosed) return null;

              const firstMatch = races[0]?.eventTime || races[0]?.stime;
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
                    className={`font-bold px-2 pt-4 flex items-center justify-between text-[13px] font-[sans-serif] ${
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
                      if (isRaceClosed(race)) return null;

                      const matchTime = new Date(race.eventTime || race.stime);
                      matchTime.setMinutes(matchTime.getMinutes() - 20);

                      const currentTime = new Date();
                      currentTime.setMinutes(currentTime.getMinutes() + 10);

                      const currentlyAheadOfMatchTime =
                        matchTime <= currentTime;
                      const isActive =
                        currentlyAheadOfMatchTime &&
                        !isRaceClosed(race) &&
                        race?.status !== "SUSPENDED";

                      const correctMatchTime = new Date(
                        race.eventTime || race.stime,
                      );
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
                          key={race.marketId || race.gmid || index}
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

export default GreyhoundFilteredMatches;