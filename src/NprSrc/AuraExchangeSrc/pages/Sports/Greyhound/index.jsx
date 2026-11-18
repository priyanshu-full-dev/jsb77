import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  subscribeToAuraEventsData,
  subscribeToGreyhoundMatchesData,
} from "../../../../../socketClient";
import { grayhoundRace } from "../../../../../api";
import { updateGreyhoundSlice } from "../../../../../redux/slices/greyhoundSlice";
import GreyhoundFilteredMatches from "./GreyhoundFilteredMatches";
import { useGradientColor } from "../../../hooks/useThemeColors";
import "./index.css";

export default function Greyhound() {
  const dispatch = useDispatch();

  const dedicatedGreyhound = useSelector(
    (state) => state?.auraMatches?.greyhound?.matches?.data
  );
  const cricketPool = useSelector(
    (state) => state?.auraMatches?.cricket?.matches?.data
  );

  const localGreyhound = useMemo(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("auraSportsEvents");
        if (raw) {
          const parsed = JSON.parse(raw);
          const evs = parsed?.eventsBySport?.["4339"];
          if (Array.isArray(evs) && evs.length > 0) return evs;
        }
      }
    } catch {}
    return [];
  }, []);

  const auraData = useMemo(() => {
    if (Array.isArray(dedicatedGreyhound) && dedicatedGreyhound.length > 0) {
      return dedicatedGreyhound;
    }
    // if (Array.isArray(cricketPool)) {
    //   const filtered = cricketPool.filter((match) => String(match?.sportId) === "4339");
    //   if (filtered.length > 0) return filtered;
    // }
    return localGreyhound;
  }, [dedicatedGreyhound,  localGreyhound]);

  const legacyData = useSelector(
    (state) => state?.greyhound?.greyhoundRaceList,
  );

  const [activeTab, setActiveTab] = useState("ALL");
  const gradientColor = useGradientColor();

  const countryIcons = {
    GB: "/Flags/GB.svg",
    FRA: "/Flags/FRA.svg",
    FR: "/Flags/FRA.svg",
    USA: "/Flags/USA.svg",
    AU: "/Flags/AUS.svg",
    AUS: "/Flags/AUS.svg",
    IRE: "/Flags/IRE.svg",
    IE: "/Flags/IRE.svg",
    RSA: "/Flags/RSA.svg",
    NZ: "/Flags/NZ.svg",
    IN: "/Flags/IN.svg",
    ZA: "/Flags/ZA.svg",
    HK: "/Flags/HK.svg",
    US: "/Flags/USA.svg",
  };

  useEffect(() => {
    // 1. Subscribe to Aura Greyhound events (sportId 4339)
    const unsubAura = subscribeToAuraEventsData({ sportId: 4339 });
    // 2. Also listen for legacy greyhound matches via socket
    subscribeToGreyhoundMatchesData();

    // 3. Immediately fetch legacy greyhound matches via API to ensure all races (Nottingham, Yarmouth, etc.) are available
    const fetchApiRaces = async () => {
      try {
        const response = await grayhoundRace();
        const raceList =
          response?.data?.data?.t1 ||
          response?.data?.t1 ||
          response?.data?.data ||
          response?.data;
        if (Array.isArray(raceList) && raceList.length > 0) {
          dispatch(
            updateGreyhoundSlice({
              greyhoundRaceList: raceList,
            }),
          );
        }
      } catch (err) {
        console.error("Error fetching greyhound races via API:", err);
      }
    };
    fetchApiRaces();

    return () => {
      unsubAura?.();
    };
  }, [dispatch]);

  // Aura universe stream aur legacy socket/API dono matches ko merge karte hain taaki
  // koi bhi track (jaise Nottingham, Yarmouth, etc.) miss na ho aur user ko poora schedule dikhe
  const mergedData = useMemo(() => {
    const list = [];
    const seenTrackKeys = new Set();

    // 1. Add Aura matches first
    if (Array.isArray(auraData) && auraData.length > 0) {
      auraData.forEach((race) => {
        const trackKey = (race?.eventName || "").trim().toLowerCase();
        if (trackKey) {
          seenTrackKeys.add(trackKey);
        }
        list.push(race);
      });
    }

    // 2. Add legacy matches (normalize if track not already present in Aura)
    if (Array.isArray(legacyData) && legacyData.length > 0) {
      legacyData.forEach((country) => {
        const cname = country?.cname || "OTHER";
        country?.children?.forEach((event) => {
          const ename = event?.ename || "Unknown";
          const trackKey = ename.trim().toLowerCase();

          // If this track is not already supplied by Aura, add its races
          if (!seenTrackKeys.has(trackKey)) {
            event?.children?.forEach((race) => {
              list.push({
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
          }
        });
      });
    }

    return list;
  }, [auraData, legacyData]);

  const availableTabs = useMemo(() => {
    if (!mergedData || mergedData.length === 0) return ["ALL"];
    return [
      "ALL",
      ...new Set(
        mergedData
          .map((e) => (e?.tournamentName || e?.cname || "")?.trim())
          .filter(Boolean),
      ),
    ];
  }, [mergedData]);

  return (
    <div className="flex flex-col bg-light-bg dark:bg-dark-bg text-black dark:text-white">
      <div>
        <div
          className="text-[white] p-2 pl-2.5 font-bold"
          style={{
            background: gradientColor,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 className="text-[13px]">Greyhound Racing Schedule</h4>
        </div>

        {/* Country selection */}
        <div className="flex w-full justify-between bg-[#e2e2e2] items-center">
          <div
            className="w-full overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex w-max">
              {availableTabs.map((label, index) => (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  className={`font-bold text-[12px] flex flex-col items-center justify-center h-[45px] w-[70px] ${
                    activeTab === label
                      ? "bg-[white] text-black dark:text-white border-l border-[#c8ced3] border-r"
                      : "bg-light-bg dark:bg-dark-bg text-gray-600"
                  }`}
                >
                  {countryIcons[label] ? (
                    <img src={countryIcons[label]} width={20} alt={label} />
                  ) : index === 0 ? (
                    "ALL"
                  ) : (
                    label
                  )}
                  <b>{countryIcons[label] && label}</b>
                </button>
              ))}
            </div>
          </div>
        </div>

        {!mergedData ? (
          <div className="text-center text-xs p-4 text-gray-500">
            Loading greyhound racing schedule...
          </div>
        ) : mergedData.length === 0 ? (
          <div className="text-center text-xs p-4 text-gray-500">
            No greyhound races available right now.
          </div>
        ) : (
          <GreyhoundFilteredMatches data={mergedData} activeTab={activeTab} />
        )}
      </div>
    </div>
  );
}
