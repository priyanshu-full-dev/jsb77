import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { subscribeToAuraEventsData } from "../../../../../socketClient";
import HorseFilteredMatches from "./HorseFilteredMatches";
import { useGradientColor } from "../../../hooks/useThemeColors";

export default function Horse() {
  const dedicatedHorse = useSelector(
    (state) => state?.auraMatches?.horse?.matches?.data
  );
  const cricketPool = useSelector(
    (state) => state?.auraMatches?.cricket?.matches?.data
  );

  const localHorse = useMemo(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("auraSportsEvents");
        if (raw) {
          const parsed = JSON.parse(raw);
          const evs = parsed?.eventsBySport?.["7"];
          if (Array.isArray(evs) && evs.length > 0) return evs;
        }
      }
    } catch {}
    return [];
  }, []);

  const data = useMemo(() => {
    if (Array.isArray(dedicatedHorse) && dedicatedHorse.length > 0) {
      return dedicatedHorse;
    }
    // if (Array.isArray(cricketPool)) {
    //   const filtered = cricketPool.filter((match) => String(match?.sportId) === "7");
    //   if (filtered.length > 0) return filtered;
    // }
    return localHorse;
  }, [dedicatedHorse,  localHorse]);

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

  const countryOrder = [
    "IN",
    "AUS",
    "AU",
    "FRA",
    "FR",
    "GB",
    "IRE",
    "IE",
    "RSA",
    "ZA",
    "USA",
    "US",
    "NZ",
    "HK",
  ];

  useEffect(() => {
    const unsub = subscribeToAuraEventsData({ sportId: 7 });
    return () => {
      unsub?.();
    };
  }, []);

  const availableTabs = data
    ? [
        "ALL",
        ...Array.from(
          new Set(data.map((e) => e?.tournamentName?.trim()).filter(Boolean)),
        ).sort((a, b) => {
          const idxA = countryOrder.indexOf(a);
          const idxB = countryOrder.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        }),
      ]
    : ["ALL"];

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
          <h4 className="text-[13px]">Horse Racing Schedule</h4>

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
                  className={`font-bold text-[12px] flex flex-col items-center justify-center h-[45px] w-[70px] ${activeTab === label
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

        {!data ? (
          <div className="text-center text-xs p-4 text-gray-500">
            Loading horse racing schedule...
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-xs p-4 text-gray-500">
            No horse races available right now.
          </div>
        ) : (
          <HorseFilteredMatches data={data} activeTab={activeTab} />
        )}
      </div>
    </div>
  );
}
