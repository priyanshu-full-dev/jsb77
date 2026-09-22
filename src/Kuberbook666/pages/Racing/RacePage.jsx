import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  subscribeToHorseMatchesData,
  subscribeToHourseOddsData,
  subscribeToGreyhoundMatchesData,
  subscribeToGreyHoundOddsData,
} from "../../../socketClient";
import BetSlip from "../../components/BetSlip";
import KuberLoader from "../../components/Loader/KuberLoader";

// Country Flags
const countryFlags = {
  US: "/Flags/USA.svg",
  USA: "/Flags/USA.svg",
  AU: "/Flags/AUS.svg",
  AUS: "/Flags/AUS.svg",
  GB: "/Flags/GB.svg",
  UK: "/Flags/GB.svg",
  FR: "/Flags/FRA.svg",
  FRA: "/Flags/FRA.svg",
  IE: "/Flags/IRE.svg",
  IRE: "/Flags/IRE.svg",
  NZ: "/Flags/NZ.svg",
  ZA: "/Flags/RSA.svg",
  RSA: "/Flags/RSA.svg",
  IN: "/Flags/IN.svg",
  HK: "/Flags/HK.svg",
};

// Greyhound Trap Colors
const GREYHOUND_TRAPS = [
  { num: 1, bg: "#dc2626", text: "#ffffff", border: "#b91c1c" },
  { num: 2, bg: "#111827", text: "#ffffff", border: "#374151" },
  { num: 3, bg: "#ffffff", text: "#111827", border: "#d1d5db" },
  { num: 4, bg: "#2563eb", text: "#ffffff", border: "#1d4ed8" },
  { num: 5, bg: "#eab308", text: "#111827", border: "#ca8a04" },
  { num: 6, bg: "#16a34a", text: "#ffffff", border: "#15803d" },
  { num: 7, bg: "#18181b", text: "#facc15", border: "#27272a" },
  { num: 8, bg: "#db2777", text: "#ffffff", border: "#be185d" },
];

export default function RacePage({ raceType = "horse" }) {
  const location = useLocation();

  const isHorse =
    raceType === "horse" || location.pathname.toLowerCase().includes("horse");

  const [activeTab, setActiveTab] = useState("upcoming"); // "inplay" or "upcoming"
  const [expandedTracks, setExpandedTracks] = useState({});
  const [isSeoOpen, setIsSeoOpen] = useState(true);
  const [activeBet, setActiveBet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingOdds, setLoadingOdds] = useState({});

  // 100% Live Redux Socket Data
  const horseRaceList = useSelector((state) => state.horse?.horseRaceList);
  const horseMarkets = useSelector((state) => state.horse?.horseMarkets || []);
  const greyhoundRaceList = useSelector(
    (state) => state.greyhound?.greyhoundRaceList,
  );
  const greyhoundMarkets = useSelector(
    (state) => state.greyhound?.greyhoundMarkets || [],
  );

  // 1. Socket subscription on mount
  useEffect(() => {
    setIsLoading(true);

    // Subscribe to real-time socket events
    const unsub = isHorse
      ? subscribeToHorseMatchesData()
      : subscribeToGreyhoundMatchesData();

    // Short timer to dismiss loader once initial socket handshake is established
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [isHorse]);

  const rawList = isHorse ? horseRaceList : greyhoundRaceList;

  // Turn off loading immediately once socket populates rawList
  useEffect(() => {
    if (rawList !== undefined && rawList !== null) {
      setIsLoading(false);
    }
  }, [rawList]);

  // 2. Parse 100% Live Socket / API Hierarchy (Countries -> Tracks -> Races)
  const tracks = useMemo(() => {
    if (!Array.isArray(rawList) || rawList.length === 0) {
      return [];
    }

    const parsed = [];

    rawList.forEach((countryGroup) => {
      const countryCode = (
        countryGroup?.cname ||
        countryGroup?.countryCode ||
        "AU"
      ).toUpperCase();
      const trackChildren =
        countryGroup?.children || countryGroup?.childs || [countryGroup];

      trackChildren.forEach((trackObj, tIdx) => {
        const trackName =
          trackObj?.ename || trackObj?.venue || trackObj?.name || "Track";
        const raceList = trackObj?.children || trackObj?.childs || [];

        // Check if all races in track are closed
        const allClosed =
          raceList.length > 0 &&
          raceList.every((r) => r?.gOdds?.status === "CLOSED");
        if (allClosed) return;

        const firstRace = raceList[0] || trackObj;
        const stime = firstRace?.stime || firstRace?.startTime || firstRace?.openDate;

        let timeText = "Upcoming";
        let isInPlay = false;

        if (stime) {
          try {
            const matchDate = new Date(stime);
            const diffMs = matchDate.getTime() - Date.now();

            if (diffMs < 0) {
              const hours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
              const mins = Math.floor(
                (Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60),
              );
              timeText = `Started on ${hours} hours ${mins} minutes`;
              isInPlay = true;
            } else {
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const mins = Math.floor(
                (diffMs % (1000 * 60 * 60)) / (1000 * 60),
              );
              timeText = `Opens in ${hours} hours ${mins} minutes`;
              isInPlay = diffMs <= 10 * 60 * 1000; // within 10 minutes
            }
          } catch {
            timeText = "Upcoming";
          }
        }

        const gmid = String(
          firstRace?.gmid || firstRace?.eventId || `${countryCode}-${trackName}-${tIdx}`,
        );

        parsed.push({
          id: gmid,
          gmid,
          eventId: firstRace?.eventId || (isHorse ? "7" : "43"),
          name: trackName,
          country: countryCode,
          time: timeText,
          inplay: isInPlay || Boolean(firstRace?.inplay || firstRace?.inPlay),
          raceList,
          firstRace,
          raceInfo:
            firstRace?.rname ||
            firstRace?.marketName ||
            firstRace?.ename ||
            `R1 Race`,
          min: firstRace?.min || 100,
          max: firstRace?.max || 50000,
        });
      });
    });

    return parsed;
  }, [rawList, isHorse]);

  // 3. Filter by Active Tab (In Play / Upcoming)
  const filteredTracks = useMemo(() => {
    if (activeTab === "inplay") {
      return tracks.filter((t) => t.inplay);
    }
    return tracks;
  }, [tracks, activeTab]);

  // Auto-expand first track when tracks are loaded
  useEffect(() => {
    if (tracks.length > 0 && Object.keys(expandedTracks).length === 0) {
      setExpandedTracks({ [tracks[0].id]: true });
      fetchTrackOdds(tracks[0]);
    }
  }, [tracks]);

  // 4. Fetch Live Odds on Track Expand via WebSocket
  const fetchTrackOdds = useCallback(
    (track) => {
      if (!track?.gmid) return;

      const gmid = track.gmid;
      setLoadingOdds((prev) => ({ ...prev, [gmid]: true }));

      try {
        if (isHorse) {
          subscribeToHourseOddsData({
            eventId: track.eventId || "7",
            eventType: "horse",
            gmid,
          });
        } else {
          subscribeToGreyHoundOddsData({
            eventId: track.eventId || "43",
            eventType: "greyhound",
            gmid,
          });
        }
      } catch (err) {
        console.error("Error subscribing to live odds:", gmid, err);
      } finally {
        setTimeout(() => {
          setLoadingOdds((prev) => ({ ...prev, [gmid]: false }));
        }, 600);
      }
    },
    [isHorse],
  );

  const toggleTrack = (track) => {
    const trackId = track.id || track.gmid;
    const isNowOpen = !expandedTracks[trackId];

    setExpandedTracks((prev) => ({
      ...prev,
      [trackId]: isNowOpen,
    }));

    if (isNowOpen) {
      fetchTrackOdds(track);
    }
  };

  // Helper to extract live runners for an expanded track
  const getLiveRunnersForTrack = (track) => {
    const marketList = isHorse ? horseMarkets : greyhoundMarkets;
    const market = marketList.find((m) => String(m.gmid) === String(track.gmid));

    if (market?.odds && Array.isArray(market.odds) && market.odds.length > 0) {
      return market.odds.map((odd, idx) => ({
        num: odd.number || odd.runnerNumber || idx + 1,
        name: odd.runnerName || odd.name || `Runner ${idx + 1}`,
        trainer: odd.jockey || odd.trainer || "",
        silk: odd.silk || "",
        odds: odd.status === "SUSPENDED" ? "SUSPENDED" : odd.status || "SUSPENDED",
        backPrice: odd.back?.[0]?.price || odd.ex?.availableToBack?.[0]?.price || "-",
        layPrice: odd.lay?.[0]?.price || odd.ex?.availableToLay?.[0]?.price || "-",
      }));
    }

    // Check if firstRace has runners embedded
    const rawRunners =
      track.firstRace?.gOdds?.runners ||
      track.firstRace?.runners ||
      track.firstRace?.matchRunners ||
      [];

    if (rawRunners.length > 0) {
      return rawRunners.map((r, idx) => ({
        num: r.number || r.runnerNumber || idx + 1,
        name: r.runnerName || r.name || `Runner ${idx + 1}`,
        trainer: r.jockey || r.trainer || "",
        silk: r.silk || "",
        odds: r.status === "SUSPENDED" ? "SUSPENDED" : r.status || "SUSPENDED",
        backPrice: r.back?.[0]?.price || "-",
        layPrice: r.lay?.[0]?.price || "-",
      }));
    }

    return [];
  };

  return (
    <div className="w-full flex flex-col items-center justify-start min-h-screen bg-[#f1f2f6] dark:bg-[#0e1017] text-gray-900 dark:text-gray-100 pb-16 font-lato">
      <div
        className="race-page w-full md:mt-[0px] lg:overflow-auto lg:w-[54%]"
        style={{ position: "relative" }}
      >
        <span style={{ position: "absolute", top: "-135px" }}></span>

        {/* In-Play & Upcoming Tab Switcher */}
        <div className="px-2 w-full lg:hidden pt-2">
          <div className="flex flex-row font-manrope-regular items-center justify-start gap-2.5 relative">
            <div
              className="cursor-pointer flex flex-row items-center justify-center"
              onClick={() => setActiveTab("inplay")}
            >
              <span
                className={`px-[25px] py-1 text-[13px] text-sm rounded-full md:text-sm lg:text-base font-bold leading-6 active:scale-95 block z-10 transition-colors ${
                  activeTab === "inplay"
                    ? "text-white bg-[#c10b32] shadow-md"
                    : "text-gray-800 dark:text-gray-200 bg-white dark:bg-[#1a1c26] border border-gray-200 dark:border-gray-700"
                }`}
              >
                In Play
              </span>
            </div>
            <div
              className="cursor-pointer flex flex-row items-center justify-center"
              onClick={() => setActiveTab("upcoming")}
            >
              <span
                className={`px-[25px] py-1 text-[13px] text-sm rounded-full md:text-sm lg:text-base font-bold leading-6 active:scale-95 block z-10 transition-colors ${
                  activeTab === "upcoming"
                    ? "text-white bg-[#c10b32] shadow-md"
                    : "text-gray-800 dark:text-gray-200 bg-white dark:bg-[#1a1c26] border border-gray-200 dark:border-gray-700"
                }`}
              >
                Upcoming
              </span>
            </div>
          </div>
        </div>

        {/* Live Races Content List */}
        <div className="race-page__content mt-[15px] space-y-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <KuberLoader
                text={`Connecting Live Socket for ${isHorse ? "Horse Racing" : "Greyhound"}...`}
                subtext="Streaming real-time tracks, runners & odds"
              />
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="bg-white dark:bg-[#161922] rounded-[4px] p-8 text-center shadow-sm border border-gray-200/60 dark:border-gray-800">
              <div className="text-3xl mb-2">{isHorse ? "🏇" : "🐕"}</div>
              <h3 className="font-bold text-sm md:text-base text-gray-800 dark:text-gray-200">
                No {activeTab === "inplay" ? "In-Play" : "Upcoming"} {isHorse ? "Horse" : "Greyhound"} Races Active
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Listening to live server socket updates for scheduled race cards.
              </p>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isExpanded = Boolean(expandedTracks[track.id || track.gmid]);
              const flagSrc = countryFlags[track.country] || "/Flags/AUS.svg";
              const liveRunners = getLiveRunnersForTrack(track);
              const isTrackOddsLoading = Boolean(loadingOdds[track.gmid]);

              return (
                <div
                  key={track.id}
                  className="race-page__content-upcoming-races-table-row rounded-[4px] shadow-sm border border-gray-200/60 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#161922]"
                >
                  {/* Track Row Header */}
                  <div
                    onClick={() => toggleTrack(track)}
                    className="flex items-center justify-between w-full px-2.5 py-2 cursor-pointer bg-white dark:bg-[#1a1d28] hover:bg-gray-50 dark:hover:bg-[#202433] transition-colors"
                  >
                    <div className="flex items-center gap-x-2 text-text_color_primary1">
                      <img
                        src={flagSrc}
                        alt={track.country}
                        className="w-[22px] h-[15px] object-cover rounded-xs shadow-xs"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="flex items-start flex-col">
                        <span className="text-base font-[700] text-gray-900 dark:text-gray-100">
                          {track.name}&nbsp; ({track.country})
                        </span>
                        <span className="text-xs font-[400] text-gray-500 dark:text-gray-400">
                          {track.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-x-3">
                      {/* Red Gradient Clock Icon */}
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_2152_26700)">
                            <path
                              d="M10.8506 9.41291L8.61975 7.73979V4.3316C8.61975 3.98891 8.34275 3.71191 8.00006 3.71191C7.65737 3.71191 7.38037 3.98891 7.38037 4.3316V8.04966C7.38037 8.24485 7.47209 8.42891 7.62825 8.54541L10.1069 10.4044C10.2185 10.4881 10.3486 10.5284 10.4781 10.5284C10.6671 10.5284 10.853 10.4435 10.9745 10.2799C11.1803 10.0066 11.1245 9.61804 10.8506 9.41291Z"
                              fill="url(#paint0_linear_2152_26700)"
                            ></path>
                            <path
                              d="M8 0C3.58853 0 0 3.58853 0 8C0 12.4115 3.58853 16 8 16C12.4115 16 16 12.4115 16 8C16 3.58853 12.4115 0 8 0ZM8 14.7607C4.27266 14.7607 1.23934 11.7273 1.23934 8C1.23934 4.27266 4.27266 1.23934 8 1.23934C11.728 1.23934 14.7607 4.27266 14.7607 8C14.7607 11.7273 11.7273 14.7607 8 14.7607Z"
                              fill="url(#paint1_linear_2152_26700)"
                            ></path>
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_2152_26700"
                              x1="7.38037"
                              y1="10.9544"
                              x2="11.5202"
                              y2="10.6827"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#C10B32"></stop>
                              <stop offset="1" stopColor="#6A061C"></stop>
                            </linearGradient>
                            <linearGradient
                              id="paint1_linear_2152_26700"
                              x1="-1.1269e-07"
                              y1="17"
                              x2="17.6354"
                              y2="14.8782"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#C10B32"></stop>
                              <stop offset="1" stopColor="#6A061C"></stop>
                            </linearGradient>
                            <clipPath id="clip0_2152_26700">
                              <rect width="16" height="16" fill="white"></rect>
                            </clipPath>
                          </defs>
                        </svg>
                      </span>

                      {/* Dropdown chevron button */}
                      <button
                        className={`transition-all ease-in-out duration-300 transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        type="button"
                      >
                        <svg
                          fill="#bd3726"
                          width="16"
                          height="16"
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 330 330"
                        >
                          <path
                            id="XMLID_225_"
                            d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Inner Table with Live Runners & Real Odds */}
                  <div
                    className={`race-page__content-upcoming-races-table-row-inner ${
                      isExpanded ? "open block" : "hidden"
                    }`}
                  >
                    <div
                      className="race-page__content-upcoming-races-table-row-items-wrapper all-suspended"
                      style={{ marginTop: "-6px" }}
                    >
                      <div className="py-1.5">
                        {/* Sub-Header: Race Name, Min/Max and BACK / LAY */}
                        <div className="grid grid-flow-col grid-cols-12 text-xs font-[500] mb-1.5 px-1 bg-white dark:bg-[#161922]">
                          <div className="pl-1 flex items-center justify-start gap-x-1 md:gap-x-1 col-span-7 md:col-span-5">
                            <span className="cursor-pointer transition-all ease-in-out duration-300 hover:scale-105"></span>
                            <span className="capitalize text-text_HeaderDeskNavMenu font-bold text-xs sm:text-sm md:text-[15px] text-gray-900 dark:text-gray-100">
                              {track.raceInfo}
                              <p className="text-[#7c7c7c] text-[10px]">
                                Min:{track.min} | max: {track.max.toLocaleString()}
                              </p>
                            </span>
                          </div>
                          <div className="col-span-5 md:col-span-7 grid grid-cols-2 md:grid-cols-6 pb-[2px]">
                            <span className="hidden md:flex col-span-1 text-center font-semibold h-full items-end justify-center"></span>
                            <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center"></span>
                            <span className="col-span-1 text-center text-[10px] sm:text-xs md:text-sm leading-3 text-text_HeaderDeskNavMenu font-bold h-full flex items-end justify-center text-[#2563eb]">
                              BACK
                            </span>
                            <span className="col-span-1 text-center text-[10px] sm:text-xs md:text-sm leading-3 text-text_HeaderDeskNavMenu font-bold h-full flex items-end justify-center text-[#e11d48]">
                              LAY
                            </span>
                            <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center"></span>
                            <span className="col-span-1 text-center font-semibold h-full hidden md:flex items-end justify-center"></span>
                          </div>
                        </div>

                        {/* Runner Rows Table */}
                        <div className="bg-bg_Quaternary bg-white dark:bg-[#12151d] rounded-[3px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-[1px] cursor-pointer divide-y divide-gray-100 dark:divide-gray-800">
                          {isTrackOddsLoading ? (
                            <div className="py-8 flex flex-col items-center justify-center">
                              <KuberLoader
                                text={`Loading live runners for ${track.name}...`}
                              />
                            </div>
                          ) : liveRunners.length > 0 ? (
                            liveRunners.map((runner, rIdx) => {
                              const trap =
                                GREYHOUND_TRAPS[rIdx % GREYHOUND_TRAPS.length];

                              return (
                                <div
                                  key={runner.num || rIdx}
                                  className="grid grid-cols-12 border-b border-borderColorOfMarket dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                >
                                  {/* Left details (Number, Silk image/Trap, Name, Trainer) */}
                                  <div className="w-full md:col-span-5 col-span-7 h-12 grid grid-cols-12 grid-flow-col pl-2.5 md:pl-2 py-0.5 pr-[3px]">
                                    <div className="truncate col-span-12 flex items-start justify-center h-full flex-col">
                                      <div className="w-full flex flex-nowrap gap-x-2 items-center">
                                        <div className="topFilters-item-check"></div>
                                        <div className="flex items-center justify-center flex-col text-text_color_primary1">
                                          <span className="text-xs font-[400] text-gray-700 dark:text-gray-300">
                                            ({runner.num})
                                          </span>
                                        </div>

                                        {/* Silk / Trap box */}
                                        <div className="relative overflow-hidden w-[20px] h-[20px] mr-[6px] col-span-3 flex-shrink-0 flex items-center justify-center">
                                          {isHorse ? (
                                            runner.silk ? (
                                              <img
                                                src={runner.silk}
                                                alt={runner.name}
                                                className="bg-bg_color_skeletonBgLoaderColor1 w-[20px] h-[20px] object-contain"
                                                title={runner.name}
                                                onError={(e) => {
                                                  e.target.style.display = "none";
                                                }}
                                              />
                                            ) : (
                                              <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center text-[9px] text-white font-bold">
                                                {runner.num}
                                              </div>
                                            )
                                          ) : (
                                            <div
                                              className="w-[18px] h-[18px] rounded-xs flex items-center justify-center font-bold text-[10px] shadow-xs"
                                              style={{
                                                backgroundColor: trap.bg,
                                                color: trap.text,
                                                border: `1px solid ${trap.border}`,
                                              }}
                                            >
                                              {runner.num}
                                            </div>
                                          )}
                                        </div>

                                        {/* Name & Trainer */}
                                        <div className="col-span-7 w-full flex flex-col text-text_color_primary1 truncate">
                                          <div className="w-full text-xs md:text-sm font-[400] text-gray-900 dark:text-gray-100 truncate">
                                            {runner.name}
                                          </div>
                                          {runner.trainer && (
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                              {runner.trainer}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-[12px] font-bold text-text_Success"></span>
                                    </div>
                                  </div>

                                  {/* Right Side Odds / SUSPENDED Button */}
                                  <div className="col-span-5 md:col-span-7 h-12 grid grid-cols-2 md:grid-cols-6 relative items-center">
                                    {runner.odds === "SUSPENDED" || (runner.backPrice === "-" && runner.layPrice === "-") ? (
                                      <span className="col-span-6 text-center min-h-12 py-[1px] px-[1px] flex items-center">
                                        <span className="text-center bg-bg_ballRunning dark:bg-[#252a38] text-[#c10b32] cursor-not-allowed w-full h-[36px] rounded-sm flex text-[12px] flex-col items-center justify-center tracking-wider shadow-inner font-bold">
                                          SUSPENDED
                                        </span>
                                      </span>
                                    ) : (
                                      <div className="col-span-6 grid grid-cols-2 gap-1 px-1 h-[36px]">
                                        <button
                                          onClick={() =>
                                            setActiveBet({
                                              matchName: track.name,
                                              marketName: track.raceInfo,
                                              selectionName: runner.name,
                                              odds: runner.backPrice,
                                              type: "back",
                                            })
                                          }
                                          className="bg-[#72bbef] hover:bg-[#5dafe8] text-gray-900 font-bold rounded-sm flex flex-col items-center justify-center text-xs transition active:scale-95"
                                        >
                                          <span>{runner.backPrice}</span>
                                        </button>
                                        <button
                                          onClick={() =>
                                            setActiveBet({
                                              matchName: track.name,
                                              marketName: track.raceInfo,
                                              selectionName: runner.name,
                                              odds: runner.layPrice,
                                              type: "lay",
                                            })
                                          }
                                          className="bg-[#faa9ba] hover:bg-[#f692a7] text-gray-900 font-bold rounded-sm flex flex-col items-center justify-center text-xs transition active:scale-95"
                                        >
                                          <span>{runner.layPrice}</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="col-span-12 h-max"></div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-6 text-center text-xs text-gray-500">
                              No active runners received for this race card.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Collapsible SEO Guide Accordion */}
        <div className="w-full mt-4 bg-white dark:bg-[#161922] rounded-md shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div
            onClick={() => setIsSeoOpen(!isSeoOpen)}
            className="w-full px-4 py-3 flex items-center justify-between cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1c202c] transition-colors"
          >
            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100">
              {isHorse
                ? "Horse Racing Betting | KUBERBOOK666"
                : "Greyhound Racing Betting | KUBERBOOK666"}
            </h3>
            <button
              className={`transform transition-transform duration-300 ${
                isSeoOpen ? "rotate-180" : ""
              }`}
              type="button"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {isSeoOpen && (
            <div className="p-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                {isHorse
                  ? "Learn How to Bet on Horse Racing Online"
                  : "Learn How to Bet on Greyhound Racing Online"}
              </h4>
              <p>
                People have been drawn to {isHorse ? "horse" : "greyhound"}{" "}
                racing for decades because it is such an exciting sport. Fans of
                these quick {isHorse ? "horses" : "dogs"} have been to the
                tracks and, more recently, internet platforms to watch them race
                to the finish line. These steps will help you understand how to
                start betting on {isHorse ? "horse" : "greyhound"} races online
                on sites like KUBERBOOK666 if you&apos;re new to the world of
                online betting on these exciting events.
              </p>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                What is {isHorse ? "Horse" : "Greyhound"} Racing Betting?
              </h4>
              <p>
                {isHorse ? "Horse" : "Greyhound"} racing betting online involves
                betting on the {isHorse ? "horses" : "dogs"} that are running in
                races and guessing which {isHorse ? "horse" : "dog"} will win or
                finish in the top three. Like other racing, there are different
                ways to bet on {isHorse ? "horse" : "greyhound"} races, and each
                one usually comes with a different level of risk and profit.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bet Slip Modal for user placed bets */}
      {activeBet && (
        <BetSlip bet={activeBet} onClose={() => setActiveBet(null)} />
      )}
    </div>
  );
}

RacePage.propTypes = {
  raceType: PropTypes.string,
};
