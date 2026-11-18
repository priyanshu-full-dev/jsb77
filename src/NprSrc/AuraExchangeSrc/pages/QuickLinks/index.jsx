import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaChevronRight, FaArrowRight } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { getLegues } from "../../../../api";
import { subscribeToAuraEventsData, auraOddsMemoryCache } from "../../../../socketClient";
import { toast } from "react-toastify";
import ExposureToast from "../../components/ExposureToast";
import SearchPopup from "../../components/Header/SearchPopup";
import {
  setMarketName,
  setMarketOddsData,
  setRunningData,
} from "../../../../redux/slices/fullmarketSlice";

// Exact Vector SVGs matching reference UI
const InPlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 129 129"
    className="w-[24px] h-[24px] mx-auto mb-1 text-white fill-current block"
  >
    <path
      d="m12.3,70.2c0,28.8 23.4,52.2 52.2,52.2s52.2-23.4 52.2-52.2c0-14.3-5.8-27.4-15.2-36.8l4.1-4.1 1.9,1.9c0.8,0.8 1.8,1.2 2.9,1.2s2.1-0.4 2.9-1.2c1.6-1.6 1.6-4.2 0-5.8l-9.5-9.5c-1.6-1.6-4.2-1.6-5.8,0-1.6,1.6-1.6,4.2 0,5.8l1.9,1.9-4.5,4.5c-7.6-5.6-16.7-9.1-26.7-9.9v-3.5h9.1c2.3,0 4.1-1.8 4.1-4.1s-1.8-4.1-4.1-4.1h-27c-2.3,0-4.1,1.8-4.1,4.1s1.8,4.1 4.1,4.1h9.7v3.5c-27,2.1-48.2,24.6-48.2,52zm52.2-44c24.3-3.55271e-15 44.1,19.8 44.1,44.1 0,24.3-19.8,44.1-44.1,44.1-24.3,0-44.1-19.8-44.1-44.1 0-24.4 19.8-44.1 44.1-44.1z"
      fill="currentColor"
    />
    <path
      d="m64.5,73.6h17.5c2.3,0 4.1-1.8 4.1-4.1 0-2.3-1.8-4.1-4.1-4.1h-13.4v-21.1c0-2.3-1.8-4.1-4.1-4.1-2.3,0-4.1,1.8-4.1,4.1v25.3c0,2.2 1.8,4 4.1,4z"
      fill="currentColor"
    />
  </svg>
);

const MultiMarketsIcon = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mb-1 block"
  >
    <circle cx="12" cy="12" r="10.5" fill="#FFFFFF" />
    <path
      d="M15 7H9C8.45 7 8 7.45 8 8C8 8.55 8.45 9 9 9H9.75V12.2L8.25 14.2C8 14.53 8.24 15 8.65 15H11.25V18.5C11.25 18.91 11.59 19.25 12 19.25C12.41 19.25 12.75 18.91 12.75 18.5V15H15.35C15.76 15 16 14.53 15.75 14.2L14.25 12.2V9H15C15.55 9 16 8.55 16 8C16 7.45 15.55 7 15 7Z"
      fill="#1E1E1E"
    />
  </svg>
);

const CricketIcon = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mb-1 block"
  >
    <circle cx="10" cy="10" r="9" fill="#FFFFFF" />
    <line x1="14.2" y1="4.5" x2="4.5" y2="14.2" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="16.5" y1="6.8" x2="6.8" y2="16.5" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const SoccerIcon = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mb-1 block"
  >
    <circle cx="10" cy="10" r="9" fill="#FFFFFF" stroke="#1E1E1E" strokeWidth="0.8" />
    <polygon points="10,6.5 12.8,8.5 11.7,11.8 8.3,11.8 7.2,8.5" fill="#1E1E1E" />
    <line x1="10" y1="6.5" x2="10" y2="1" stroke="#1E1E1E" strokeWidth="1" />
    <line x1="12.8" y1="8.5" x2="18.8" y2="6.5" stroke="#1E1E1E" strokeWidth="1" />
    <line x1="11.7" y1="11.8" x2="15.8" y2="18.5" stroke="#1E1E1E" strokeWidth="1" />
    <line x1="8.3" y1="11.8" x2="4.2" y2="18.5" stroke="#1E1E1E" strokeWidth="1" />
    <line x1="7.2" y1="8.5" x2="1.2" y2="6.5" stroke="#1E1E1E" strokeWidth="1" />
  </svg>
);

const TennisIcon = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mb-1 block"
  >
    <circle cx="10" cy="10" r="9" fill="#FFFFFF" stroke="#1E1E1E" strokeWidth="0.8" />
    <path d="M4.2 4.5C7.2 7 7.2 13 4.2 15.5" stroke="#1E1E1E" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M15.8 4.5C12.8 7 12.8 13 15.8 15.5" stroke="#1E1E1E" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// Exactly 4 sports matching reference UI (Cricket, Soccer, Tennis, FancyBet)
const sportsList = [
  {
    sportName: "Cricket",
    sportId: 4,
    hasCompetitions: true,
  },
  {
    sportName: "Soccer",
    sportId: 1,
    hasCompetitions: true,
  },
  {
    sportName: "Tennis",
    sportId: 2,
    hasCompetitions: true,
  },
  {
    sportName: "FancyBet",
    sportId: 4,
    style: "navigate",
    href: "/cricket",
  },
];

function QuickLinks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeSport, setActiveSport] = useState(null);
  const [openCompetitions, setOpenCompetitions] = useState({});
  const [apiLeagues, setApiLeagues] = useState({});

  // Redux pools for active matches
  const cricketPool = useSelector(
    (state) => state?.auraMatches?.cricket?.matches?.data,
  );
  const dedicatedSoccer = useSelector(
    (state) => state?.auraMatches?.soccer?.matches?.data,
  );
  const dedicatedTennis = useSelector(
    (state) => state?.auraMatches?.tennis?.matches?.data,
  );
  const dedicatedHorse = useSelector(
    (state) => state?.auraMatches?.horse?.matches?.data,
  );
  const dedicatedGreyhound = useSelector(
    (state) => state?.auraMatches?.greyhound?.matches?.data,
  );
  const legacyMatches = useSelector((state) => state?.matches) || {};

  // Active sport object & ID
  const currentSportItem = useMemo(
    () => sportsList.find((s) => s.sportName === activeSport),
    [activeSport],
  );
  const effectiveSportId = currentSportItem?.sportId;

  // Pre-fetch leagues for Cricket (4), Soccer (1), Tennis (2) and keep sockets subscribed
  useEffect(() => {
    const unsubs = [1, 2, 4, 7, 4339, 7522].map((id) =>
      subscribeToAuraEventsData({ sportId: id }),
    );

    [1, 2, 4].forEach(async (id) => {
      try {
        const res = await getLegues(id);
        const arr = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        if (arr.length > 0) {
          setApiLeagues((prev) => ({
            ...prev,
            [id]: arr,
          }));
        }
      } catch (err) {
        console.error(`Failed to fetch leagues for sport ${id}:`, err);
      }
    });

    return () => {
      unsubs.forEach((unsub) => unsub?.());
    };
  }, []);

  // Fetch leagues again when effectiveSportId changes if not yet loaded
  useEffect(() => {
    if (
      effectiveSportId &&
      effectiveSportId > 0 &&
      effectiveSportId < 5 &&
      (!apiLeagues[effectiveSportId] ||
        apiLeagues[effectiveSportId].length === 0)
    ) {
      const fetchApiLeagues = async () => {
        try {
          const res = await getLegues(effectiveSportId);
          const arr = Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data)
              ? res.data
              : [];
          if (arr.length > 0) {
            setApiLeagues((prev) => ({
              ...prev,
              [effectiveSportId]: arr,
            }));
          }
        } catch (err) {
          console.error("Failed to fetch leagues:", err);
        }
      };
      fetchApiLeagues();
    }
  }, [effectiveSportId, apiLeagues]);

  // STRICT Filter: extract matches ONLY for the active sport, 100% no cross-sport leakage!
  const currentSportMatches = useMemo(() => {
    if (!activeSport || !effectiveSportId) return [];

    const targetIdStr = String(effectiveSportId);

    // All available pools
    const pool = Array.isArray(cricketPool) ? cricketPool : [];
    const dedicatedSlice =
      effectiveSportId === 1
        ? dedicatedSoccer
        : effectiveSportId === 2
          ? dedicatedTennis
          : effectiveSportId === 7
            ? dedicatedHorse
            : effectiveSportId === 4339
              ? dedicatedGreyhound
              : [];
    const dedicated = Array.isArray(dedicatedSlice) ? dedicatedSlice : [];

    const legacyKey =
      effectiveSportId === 1
        ? "soccer"
        : effectiveSportId === 2
          ? "tennis"
          : effectiveSportId === 4
            ? "cricket"
            : "";
    const legacy = Array.isArray(legacyMatches?.[legacyKey]?.matches?.data)
      ? legacyMatches[legacyKey].matches.data
      : [];

    const combined = [...pool, ...dedicated, ...legacy];

    const result = [];
    const seenIds = new Set();

    combined.forEach((m) => {
      if (!m) return;
      const mSportId = String(m?.sportId || m?.sportID || "");
      const mSportName = String(m?.sportName || "")
        .trim()
        .toLowerCase();

      // If match has an explicit sportId that does not match target, REJECT!
      if (mSportId && mSportId !== targetIdStr) {
        return;
      }

      // Check if matches the target sport
      let isMatch = false;
      if (mSportId === targetIdStr) {
        isMatch = true;
      } else if (
        effectiveSportId === 4 &&
        (mSportName === "cricket" || (!mSportId && !mSportName))
      ) {
        isMatch = true;
      } else if (effectiveSportId === 1 && mSportName === "soccer") {
        isMatch = true;
      } else if (effectiveSportId === 2 && mSportName === "tennis") {
        isMatch = true;
      } else if (
        effectiveSportId === 7 &&
        (mSportName === "horse racing" || mSportName === "horse")
      ) {
        isMatch = true;
      } else if (
        effectiveSportId === 4339 &&
        (mSportName === "greyhound racing" || mSportName === "greyhound")
      ) {
        isMatch = true;
      }

      // If Cricket, filter out BallByBall from normal match list (rendered separately at top)
      if (
        effectiveSportId === 4 &&
        String(m?.tournamentName).toLowerCase() === "ballbyball"
      ) {
        isMatch = false;
      }

      if (isMatch) {
        const uniqueKey = String(
          m?.exEventId || m?.eventId || m?.marketId || m?.id || "",
        );
        if (uniqueKey && !seenIds.has(uniqueKey)) {
          seenIds.add(uniqueKey);
          result.push(m);
        } else if (!uniqueKey) {
          result.push(m);
        }
      }
    });

    return result;
  }, [
    activeSport,
    effectiveSportId,
    cricketPool,
    dedicatedSoccer,
    dedicatedTennis,
    dedicatedHorse,
    dedicatedGreyhound,
    legacyMatches,
  ]);

  // Build competition list strictly for the active sport
  const competitionsList = useMemo(() => {
    if (!activeSport || !effectiveSportId) return [];

    // For Horse Racing and Greyhound: Group by tournamentName / country
    if (activeSport === "Horse Racing" || activeSport === "Greyhound Racing") {
      const groups = [];
      const seen = new Set();

      currentSportMatches.forEach((m) => {
        const country =
          m?.tournamentName?.trim() ||
          m?.country?.trim() ||
          m?.legueName?.trim() ||
          "USA";
        if (country && !seen.has(country.toLowerCase())) {
          seen.add(country.toLowerCase());
          groups.push({
            competitionId: country,
            competitionName: country,
          });
        }
      });

      if (groups.length === 0) {
        return activeSport === "Horse Racing"
          ? [
            { competitionId: "USA", competitionName: "USA" },
            { competitionId: "GB", competitionName: "GB" },
            { competitionId: "AUS", competitionName: "AUS" },
            { competitionId: "IRE", competitionName: "IRE" },
          ]
          : [
            { competitionId: "UK", competitionName: "UK" },
            { competitionId: "USA", competitionName: "USA" },
            { competitionId: "AUS", competitionName: "AUS" },
          ];
      }
      return groups;
    }

    // For Cricket, Soccer, Tennis: ONLY get leagues for THIS sport!
    const fetched = apiLeagues[effectiveSportId] || [];
    const list = [];
    const seenIds = new Set();
    const seenNames = new Set();

    // 1. Add API leagues for this sport
    fetched.forEach((c) => {
      const name = String(c?.competitionName || c?.name || "").trim();
      const id = String(c?.competitionId || c?.id || name);
      // Skip BallByBall from normal list in Cricket (it is pinned at top)
      if (
        effectiveSportId === 4 &&
        (name.toLowerCase() === "ballbyball" ||
          name.toLowerCase() === "ball by ball")
      ) {
        return;
      }
      if (name && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        seenIds.add(id);
        list.push({
          competitionId: id,
          competitionName: name,
        });
      }
    });

    // 2. Add any active live competitions from currentSportMatches (already strictly sport-filtered)
    currentSportMatches.forEach((m) => {
      const name =
        m?.competitionName?.trim() ||
        m?.tournamentName?.trim() ||
        m?.legueName?.trim();
      const id = String(m?.legueId || m?.competitionId || name);

      if (
        name &&
        !seenNames.has(name.toLowerCase()) &&
        (effectiveSportId !== 4 ||
          (name.toLowerCase() !== "ballbyball" &&
            name.toLowerCase() !== "ball by ball"))
      ) {
        seenNames.add(name.toLowerCase());
        seenIds.add(id);
        list.push({
          competitionId: id,
          competitionName: name,
        });
      }
    });

    return list;
  }, [activeSport, effectiveSportId, apiLeagues, currentSportMatches]);

  // Toggle competition accordion open/closed
  const handleToggleCompetition = (compKey) => {
    setOpenCompetitions((prev) => ({
      ...prev,
      [compKey]: !prev[compKey],
    }));
  };

  // Match item click: redirect to market page
  const handleMatchClick = (matchItem) => {
    const sId = Number(
      matchItem?.sportId || matchItem?.sportID || effectiveSportId,
    );
    const sName = matchItem?.sportName || activeSport || "";
    const targetMarketId =
      matchItem?.marketId || matchItem?.gmid || matchItem?.id || "";
    const targetExEventId =
      matchItem?.exEventId ||
      matchItem?.eventId ||
      matchItem?.id ||
      targetMarketId;

    const cachedOdds = targetExEventId ? auraOddsMemoryCache?.get(String(targetExEventId)) : null;

    if (
      matchItem?.isClosed === true ||
      matchItem?.isClosed === 1 ||
      matchItem?.isClosed === "true" ||
      cachedOdds?.isClosed === true ||
      cachedOdds?.isClosed === 1 ||
      matchItem?.status?.toUpperCase() === "CLOSED" ||
      matchItem?.status?.toUpperCase() === "SETTLED" ||
      matchItem?.status?.toUpperCase() === "FINISHED" ||
      cachedOdds?.status?.toUpperCase() === "CLOSED" ||
      cachedOdds?.status?.toUpperCase() === "SETTLED" ||
      cachedOdds?.status?.toUpperCase() === "FINISHED"
    ) {
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

    const eventTimeParam =
      matchItem?.eventTime || matchItem?.openDate || matchItem?.stime || "";

    // Horse Racing
    if (sId === 7 || sName === "Horse Racing") {
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
      const trackName =
        matchItem?.eventName || matchItem?.name || "Horse Racing";
      const raceName = `${trackName} ${formattedDateTime || eventTimeParam}`;

      navigate(
        `/horse-market?marketId=${targetMarketId}&exEventId=${targetExEventId}&sportsName=horse&raceName=${encodeURIComponent(
          raceName,
        )}&sportId=7&eventTime=${encodeURIComponent(eventTimeParam)}`,
      );
      return;
    }

    // Greyhound Racing
    if (sId === 4339 || sName === "Greyhound Racing") {
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
      const trackName =
        matchItem?.eventName || matchItem?.name || "Greyhound Racing";
      const raceName = `${trackName} ${formattedDateTime || eventTimeParam}`;

      navigate(
        `/greyhound-market?marketId=${targetMarketId}&exEventId=${targetExEventId}&gmid=${targetMarketId}&sportsName=greyhound&raceName=${encodeURIComponent(
          raceName,
        )}&sportId=4339&eventTime=${encodeURIComponent(eventTimeParam)}`,
      );
      return;
    }

    // Cricket, Soccer, Tennis, etc.
    dispatch(setRunningData(matchItem?.matchRunners));
    dispatch(setMarketName(matchItem?.markets));
    dispatch(
      setMarketOddsData({
        data: { data: matchItem?.matchOdds },
        sport: sName,
      }),
    );
    navigate(
      `/full-market?eventType=${sId}&eventId=${targetExEventId}&marketId=${targetMarketId}&joinedMarketIds=${targetExEventId}&competitionId=${matchItem?.legueId || matchItem?.competitionId || ""
      }&bm=${matchItem?.isBookmakers || ""}&fancy=${matchItem?.isFancy || ""
      }&pc=${matchItem?.isSportsbook || ""}&eventName=${encodeURIComponent(
        matchItem?.eventName || "",
      )}&openDate=${encodeURIComponent(eventTimeParam)}&tv=${matchItem?.tv || ""
      }&preBet=${Boolean(matchItem?.preBet)}&inPlay=${Boolean(matchItem?.inPlay || matchItem?.inplay)}`,
    );
  };

  // Top 5 Quick Links tabs
  const quickLinksBoard = [
    {
      name: "In-Play",
      icon: <InPlayIcon />,
      action: () => navigate("/inplay"),
    },
    {
      name: "Multi Markets",
      icon: <MultiMarketsIcon />,
      action: () => navigate("/multi-market"),
    },
    {
      name: "Cricket",
      icon: <CricketIcon />,
      action: () => {
        setActiveSport((prev) => (prev === "Cricket" ? null : "Cricket"));
        setOpenCompetitions({});
      },
    },
    {
      name: "Soccer",
      icon: <SoccerIcon />,
      action: () => {
        setActiveSport((prev) => (prev === "Soccer" ? null : "Soccer"));
        setOpenCompetitions({});
      },
    },
    {
      name: "Tennis",
      icon: <TennisIcon />,
      action: () => {
        setActiveSport((prev) => (prev === "Tennis" ? null : "Tennis"));
        setOpenCompetitions({});
      },
    },
  ];

  return (
    <div
      className="w-full flex flex-col pb-8 bg-[#ECEEEF] dark:bg-dark-bg min-h-screen"
      style={{ maxHeight: "calc(100vh - 60px - 56px)", overflowY: "auto" }}
    >
      {/* Quick Links Header */}
      <div
        className="w-full text-center text-white font-bold text-[13px] h-[30px] flex items-center justify-center select-none"
        style={{
          background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
        }}
      >
        Quick Links
      </div>

      {/* Quick Board (5 columns: In-Play, Multi Markets, Cricket, Soccer, Tennis) */}
      <ul
        id="quickBoard"
        className="w-full flex flex-row flex-wrap m-0 p-0 list-none bg-[#1E1E1E]"
      >
        {quickLinksBoard.map(({ name, icon, action }, index) => {
          const isLast = index === quickLinksBoard.length - 1;
          return (
            <li
              key={name}
              className={`w-1/5 flex-[0_0_20%] border-b border-[#2D2D2D] ${
                isLast ? "" : "border-r"
              } border-[#2D2D2D] box-border list-none m-0 p-0`}
            >
              <a
                onClick={action}
                className="w-full h-[64px] flex flex-col items-center justify-center text-center cursor-pointer select-none text-white no-underline outline-none hover:bg-white/5 active:bg-white/10 transition-colors py-1.5 px-0.5"
              >
                {icon}
                <span className="text-[11px] font-bold leading-tight text-white text-center break-words mt-0.5">
                  {name}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* All Sports Header (Exact height 62px, centered text, square search box) */}
      <div
        className="w-full flex items-center justify-between text-white font-bold h-[62px] select-none shadow-xs"
        style={{
          background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
        }}
      >
        <div className="w-[62px] h-full"></div>
        <div
          className="flex-1 text-center cursor-pointer h-full flex items-center justify-center"
          onClick={() => {
            setActiveSport(null);
            setOpenCompetitions({});
          }}
        >
          <span className="text-[18px] font-bold tracking-wide text-white">All Sports</span>
        </div>
        <div className="w-[62px] h-full flex items-center justify-center border-l border-white/20">
          <SearchPopup size={22} />
        </div>
      </div>

      {/* Dynamic Content Area: Main Sports List OR Selected Sport Competitions */}
      <div className=" w-full flex flex-col">
        <nav className="sidebar-nav w-full">
          <ul className="account-nav m-0 p-0 list-none w-full">
            <div className="sideW w-full flex flex-col bg-white dark:bg-dark-card">
              {/* CASE 1: Main All Sports View (Image 1) */}
              {!activeSport &&
                sportsList.map(
                  ({ sportName, style, href, hasCompetitions }) => (
                    <li
                      key={sportName}
                      className="nav-item border-b border-[#E5E5E5] dark:border-gray-700 list-none m-0 p-0"
                    >
                      <a
                        className="nav-link w-full flex flex-row justify-between items-center px-4 h-[44px] cursor-pointer select-none bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-decoration-none"
                        onClick={() => {
                          if (style === "navigate") {
                            navigate(href);
                          } else if (hasCompetitions) {
                            setActiveSport(sportName);
                            setOpenCompetitions({});
                          }
                        }}
                      >
                        <span className="font-bold text-[#1877F2] text-[15px] leading-[1.6]">
                          {sportName}
                        </span>
                        <div className="w-[26px] h-[26px] border border-[#d8d8d8] rounded-[4px] flex items-center justify-center bg-white shadow-xs">
                          <FaChevronRight className="text-[12px] text-[#444]" />
                        </div>
                      </a>
                    </li>
                  ),
                )}

              {/* CASE 2: Sport Competitions View */}
              {activeSport && (
                <>
                  {/* For Cricket ONLY: BallByBall item at top */}
                  {activeSport === "Cricket" && (
                    <li className="nav-item border-b border-[#E5E5E5] dark:border-gray-700 list-none m-0 p-0">
                      <a
                        onClick={() => navigate("/ballByBall/4.3544687543453")}
                        className="nav-link w-full flex flex-row justify-between items-center px-4 h-[44px] cursor-pointer select-none bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-decoration-none"
                      >
                        <span className="font-bold text-[#1877F2] text-[15px] leading-none">
                          BallByBall
                        </span>
                        <div className="w-[26px] h-[26px] border border-[#d8d8d8] rounded-[4px] flex items-center justify-center bg-white shadow-xs">
                          <FaChevronRight className="text-[12px] text-[#444]" />
                        </div>
                      </a>
                    </li>
                  )}

                  {/* Competitions / Tournaments list */}
                  {competitionsList.map(
                    ({ competitionId, competitionName }) => {
                      const compKey = String(competitionId || competitionName);
                      const isOpen = Boolean(openCompetitions[compKey]);

                      // Strictly filter matches belonging ONLY to this competition
                      const compMatches = currentSportMatches.filter((m) => {
                        if (
                          activeSport === "Horse Racing" ||
                          activeSport === "Greyhound Racing"
                        ) {
                          const country =
                            m?.tournamentName?.trim() ||
                            m?.country?.trim() ||
                            m?.legueName?.trim() ||
                            "USA";
                          return (
                            country.toLowerCase() ===
                            String(competitionName).toLowerCase()
                          );
                        }

                        const compIdStr = String(competitionId || "").trim();
                        const compNameStr = String(competitionName || "")
                          .trim()
                          .toLowerCase();

                        const matchLegueId = String(m?.legueId || "").trim();
                        const matchCompId = String(
                          m?.competitionId || "",
                        ).trim();
                        const matchCompName = String(m?.competitionName || "")
                          .trim()
                          .toLowerCase();
                        const matchTournName = String(m?.tournamentName || "")
                          .trim()
                          .toLowerCase();

                        const idMatch =
                          (compIdStr &&
                            matchLegueId &&
                            matchLegueId === compIdStr) ||
                          (compIdStr &&
                            matchCompId &&
                            matchCompId === compIdStr);

                        const nameMatch =
                          (compNameStr &&
                            matchCompName &&
                            matchCompName === compNameStr) ||
                          (compNameStr &&
                            matchTournName &&
                            matchTournName === compNameStr);

                        return Boolean(idMatch || nameMatch);
                      });

                      return (
                        <li
                          key={compKey}
                          className="nav-item border-b border-[#E5E5E5] dark:border-gray-700 list-none m-0 p-0"
                        >
                          {/* Competition Header Row */}
                          <div
                            onClick={() => handleToggleCompetition(compKey)}
                            className="nav-link w-full flex flex-row justify-between items-center px-4 h-[44px] cursor-pointer select-none bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <span className="font-bold text-[#1877F2] text-[15px] leading-none">
                              {competitionName}
                            </span>
                            <div className="w-[26px] h-[26px] border border-[#d8d8d8] rounded-[4px] flex items-center justify-center bg-white shadow-xs">
                              <FaChevronRight className="text-[12px] text-[#444]" />
                            </div>
                          </div>

                          {/* Accordion: Matches of this competition (Image 2, 4, 5) */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                key={`matches-${compKey}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden bg-white dark:bg-dark-card"
                              >
                                {compMatches.length > 0 ? (
                                  compMatches.map((matchItem, idx) => {
                                    const matchId =
                                      matchItem?.exEventId ||
                                      matchItem?.eventId ||
                                      matchItem?.marketId ||
                                      idx;
                                    const matchTitle =
                                      matchItem?.eventName ||
                                      matchItem?.name ||
                                      "Match";

                                    return (
                                      <div
                                        key={matchId}
                                        onClick={() =>
                                          handleMatchClick(matchItem)
                                        }
                                        className="w-full flex flex-row items-center px-[3.5vw] py-[2.2vw] md:px-4 md:py-2.5 border-t border-[#c8ced3] dark:border-gray-700 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer select-none transition-colors"
                                      >
                                        <FaArrowRight className="text-[#2789CE] text-[11px] mr-2 flex-shrink-0" />
                                        <span className="font-bold text-[#2789CE] text-[3.8vw] md:text-[14px] leading-tight break-words">
                                          {matchTitle}
                                        </span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="w-full px-[3.5vw] py-[2vw] md:px-4 md:py-2 border-t border-[#c8ced3] text-xs text-gray-500 italic bg-gray-50 dark:bg-gray-800">
                                    No active matches
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    },
                  )}
                </>
              )}
            </div>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default QuickLinks;
