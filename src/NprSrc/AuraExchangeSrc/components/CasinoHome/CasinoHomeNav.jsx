import { useEffect, useRef, useState, useCallback } from "react";
import useHexToRgb from "../../../../utils/useHexToRgb";
import { useSelector } from "react-redux";
import GameGrid from "./GameGrid";
import { useSearchParams } from "react-router-dom";
import ProviderTabs2 from "./ProviderTabs2";
import InternationalGames from "./InternationalGames";
import SlotGames from "./SlotGames";

// Image mapping (uses API gameId)
const imageMapping = {
  99.0021: {
    "logo-square": "/aura/AuraCasinoImages/1DayDragontiger.jpg",
  },
  99.0025: {
    "logo-square": "/aura/AuraCasinoImages/AndarBahar.jpg",
  },
  99.0001: {
    "logo-square": "/aura/AuraCasinoImages/Baccarat.jpg",
  },
  99.0013: {
    "logo-square": "/aura/AuraCasinoImages/1Dayteenpatti.jpg",
  },
  "99.0030": {
    "logo-square": "/aura/AuraCasinoImages/Lucky-7.jpg",
  },
  99.0014: {
    "logo-square": "/aura/AuraCasinoImages/mufli.jpeg",
  },
  99.0022: {
    "logo-square": "/aura/AuraCasinoImages/32cards.jpg",
  },
  "99.0010": {
    "logo-square": "/aura/AuraCasinoImages/20-20teenpatti.jpg",
  },
  99.0019: {
    "logo-square": "/aura/AuraCasinoImages/Dragontiger.jpg",
  },
  99.0005: {
    "logo-square": "/aura/AuraCasinoImages/AmarAkbarAnthony-01.jpg",
  },
  99.0007: {
    "logo-square": "/aura/AuraCasinoImages/Poker.jpg",
  },
  99.0041: {
    "logo-square": "/aura/AuraCasinoImages/DTL.jpeg",
  },
  99.0046: {
    "logo-square": "/aura/AuraCasinoImages/CardRace.jpeg",
  },
  99.0018: {
    "logo-square": "/aura/AuraCasinoImages/dragontiger-01.jpeg",
  },
  99.0016: {
    "logo-square": "/aura/AuraCasinoImages/joker.jpeg",
  },
  "88.0023": {
    "logo-square": "/Balloon.webp",
  },
};

const FIXED_TABS = [
  { provider: { name: "Popular" } },
  { provider: { name: "Universe Live" } },
  { provider: { name: "Universe Original" } },
  { provider: { name: "International" } },
  { provider: { name: "Slot" } },
];

// 🔹 Hook to scroll a tab item into center
const useScrollToCenter = () => {
  const scrollRef = useRef(null);
  const itemRefs = useRef([]);
  const scrollToCenter = useCallback((index) => {
    const container = scrollRef.current;
    const item = itemRefs.current[index];
    if (container && item) {
      const scrollLeft =
        item.offsetLeft - container.offsetWidth / 2 + item.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, []);
  return { scrollRef, itemRefs, scrollToCenter };
};

const useFilteredCategories = (
  providerOrList,
  filterSet = new Set(["CASINO"]),
) => {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const categorySet = new Set(filterSet);
    const providers = Array.isArray(providerOrList)
      ? providerOrList.map((p) => p?.provider).filter(Boolean)
      : [providerOrList];
    providers.forEach((provider) => {
      const gameList = provider?.gameList || [];
      gameList.forEach(({ category }) => {
        category?.split("/")?.forEach((cat) => {
          if (cat && cat !== "CASINO") categorySet.add(cat);
        });
      });
    });
    setCategories([...categorySet]);
  }, [providerOrList]);
  return categories;
};

function CasinoHomeNav({
  providerList = [],
  headerColor = { start: "#315195", end: "#14213D" },
}) {
  const [searchParams] = useSearchParams();
  const qLiveCasino = searchParams.get("live-casino");
  const q1 = searchParams.get("q1");
  const q2 = searchParams.get("q2");
  const topBarColor = useSelector(
    (state) => state?.site?.siteDetails?.topBarColor,
  );
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeCategoryTabIndex, setActiveCategoryTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const finalProviderList = [...FIXED_TABS];
  const activeProvider = finalProviderList[activeTabIndex]?.provider;

  const categories = useFilteredCategories(
    activeTabIndex === 0 ? providerList : activeProvider,
  );

  const {
    scrollRef: providerScrollRef,
    itemRefs: providerItemRefs,
    scrollToCenter: scrollToProvider,
  } = useScrollToCenter();

  const rgbColorStart = useHexToRgb(topBarColor?.start);
  const rgbColorEnd = useHexToRgb(topBarColor?.end);
  const rgbBorderColorStart = useHexToRgb(headerColor?.start);

  const handleProviderClick = (index, e) => {
    e.preventDefault();
    setActiveTabIndex(index);
    setActiveCategoryTabIndex(0);
    scrollToProvider(index);
  };

  useEffect(() => {
    if (qLiveCasino === "true" && q1 && q2 && categories.length > 0) {
      const categoryIndex = categories.findIndex((c) =>
        c.replaceAll("_", " ").toLowerCase().includes(q2),
      );
      const tabIndex = finalProviderList.findIndex((c) =>
        c?.provider?.name.toLowerCase()?.includes(q1),
      );
      if (categoryIndex !== -1) {
        setActiveCategoryTabIndex(categoryIndex);
      }
      if (tabIndex !== -1) {
        setActiveTabIndex(tabIndex);
      }
    } else {
      setActiveTabIndex(0);
      setActiveCategoryTabIndex(0);
    }
  }, [q1, q2]);

  // ========== HARDCODED GAMES ==========
  const hardCodeData = [
    {
      name: "HEADTAILS",
      category: "CASINO/HEADTAILS",
      gameId: "88.0021",
      images: [
        {
          type: "logo-round",
          url: "",
          _id: "68a455cb95b886eade39e7",
        },
        {
          type: "banner",
          url: "",
          _id: "68a455c8bb886eade39e8",
        },
        {
          type: "logo-square",
          url: "/aura/AuraCasinoImages/HeadnTails.jpeg",
          _id: "68a455cb958bb6666eade39e9",
        },
      ],
      _id: "68a455cb958bb886eade6565e6",
      href: `/casino/88.0021`,
    },
    {
      name: "VIMAAN",
      category: "CASINO/VIMAAN",
      gameId: "88.0022",
      images: [
        {
          type: "logo-round",
          url: "",
          _id: "68a455cb95b886eade39e7",
        },
        {
          type: "banner",
          url: "",
          _id: "68a455c8bb886eade39e8",
        },
        {
          type: "logo-square",
          url: "/aura/AuraCasinoImages/Vimaan1.jpg",
          _id: "68a455cb958bb6666eade39e9",
        },
      ],
      _id: "68a455cb958bb886eade6565e6",
    },
    {
      name: "BALLOON",
      category: "CASINO/BALLOON",
      gameId: "88.0023",
      images: [
        {
          type: "logo-round",
          url: "",
          _id: "68a455cb95b886eade39e7b",
        },
        {
          type: "banner",
          url: "",
          _id: "68a455c8bb886eade39e8b",
        },
        {
          type: "logo-square",
          url: "/Balloon.webp",
          _id: "68a455cb958bb6666eade39e9b",
        },
      ],
      _id: "68a455cb958bb886eade6565e6b",
    },
  ];

  // ========== MAIN FILTERING LOGIC ==========
  const filteredCasinoApiDataDMD = Array.isArray(providerList)
    ? providerList.filter((item) => item?.provider?.name === "diamond")
    : [];

  let apiGameList = filteredCasinoApiDataDMD.flatMap(
    (p) => p.provider?.gameList || [],
  );

  // Apply image mapping for 99.xxx games
  apiGameList = apiGameList.map((item) => {
    const mappedImages =
      item.images?.map((image) => {
        if (
          image.type === "logo-square" &&
          imageMapping[item.gameId]?.["logo-square"]
        ) {
          return {
            ...image,
            url: imageMapping[item.gameId]["logo-square"],
          };
        }
        return image;
      }) || [];
    return {
      ...item,
      images: mappedImages,
    };
  });

  const headTails = hardCodeData.find((g) => g.gameId === "HEADTAILS");
  const aviator = hardCodeData.find((g) => g.gameId === "88.0022");
  const balloonCard = hardCodeData.find((g) => g.gameId === "88.0023");


  const hideOnLiveIds = [
    "88.0022", // Aviator
    "88.0023", // Balloon
    "88.0020", // dreamcatcher
    "88.0019", // lucky09
  ];

  let filteredGameList = [];

  if (activeTabIndex === 0) {
    filteredGameList = [...apiGameList];

    if (aviator) {
      filteredGameList = filteredGameList.filter(
        (g) => g.gameId !== "88.0022",
      );
      filteredGameList.unshift(aviator); // first position
    }

    if (balloonCard) {
      filteredGameList = filteredGameList.filter(
        (g) => g.gameId !== "88.0023" && g.name?.toUpperCase() !== "BALLOON",
      );
    }

    if (headTails) {
      filteredGameList = filteredGameList.filter(
        (g) => g.gameId !== "HEADTAILS" && g.name?.toUpperCase() !== "HEADTAILS",
      );
    }

    // Indexing balloon and headtails exactly as in Image 2:
    // [Dragon Tiger Classic (99.0018), BALLOON, HEADTAILS]
    const dtClassicIndex = filteredGameList.findIndex(
      (g) => g.gameId === "99.0018",
    );

    if (dtClassicIndex !== -1) {
      if (balloonCard) {
        filteredGameList.splice(dtClassicIndex + 1, 0, balloonCard);
      }
      if (headTails) {
        filteredGameList.splice(dtClassicIndex + 2, 0, headTails);
      }
    } else {
      const insertIndex = Math.max(filteredGameList.length - 2, 0);
      if (balloonCard) filteredGameList.splice(insertIndex, 0, balloonCard);
      if (headTails) filteredGameList.splice(insertIndex + 1, 0, headTails);
    }
  } else if (activeTabIndex === 1) {
    // ===== UNIVERSE LIVE =====

    filteredGameList = apiGameList.filter(
      (g) => !hideOnLiveIds.includes(g.gameId),
    );

    if (headTails) {
      filteredGameList = filteredGameList.filter(
        (g) => g.gameId !== "HEADTAILS",
      );
      filteredGameList.push(headTails);
    }
  } else if (activeTabIndex === 2) {
    // ===== UNIVERSE ORIGINAL =====
    // Fixed order:
    // 1. Aviator
    // 2. Balloon
    // 3. HEADTAILS
    // 4. dreamcatcher
    // 5. lucky09

    const balloon = balloonCard || apiGameList.find((g) => g.gameId === "88.0023");
    const dreamcatcher = apiGameList.find((g) => g.gameId === "88.0020");
    const lucky09 = apiGameList.find((g) => g.gameId === "88.0019");

    filteredGameList = [];

    if (aviator) filteredGameList.push(aviator); // 1st
    if (balloon) filteredGameList.push(balloon); // 2nd
    if (headTails) filteredGameList.push(headTails); // 3rd
    if (dreamcatcher) filteredGameList.push(dreamcatcher); // 4th
    if (lucky09) filteredGameList.push(lucky09); // 5th
  }

  // Remove duplicates by name
  const unique = new Map();
  filteredGameList.forEach((g) => {
    if (g?.name && !unique.has(g.name)) {
      unique.set(g.name, g);
    }
  });
  filteredGameList = Array.from(unique.values());

  const isCasinoLobby =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/casino") ||
      window.location.pathname.includes("/live-casino"));

  // ========== RENDER ==========
  return (
    <div
      className={`w-full flex flex-col ${isCasinoLobby ? "" : "sticky top-14"} justify-start items-start z-1`}
      style={
        isCasinoLobby
          ? {}
          : {
              top: window.location.pathname.includes("/live-casino")
                ? "112px"
                : "500px",
            }
      }
    >
      <div className={isCasinoLobby ? "sticky top-0 z-10 w-full" : "w-full"}>
        <ProviderTabs2
          providers={finalProviderList}
          activeIndex={activeTabIndex}
          onClick={handleProviderClick}
          scrollRef={providerScrollRef}
          itemRefs={providerItemRefs}
          headerColor={headerColor}
          topBarColor={topBarColor}
        />
      </div>

      {/* International Tab */}
      {activeTabIndex === 3 && <InternationalGames searchQuery={searchQuery} />}

      {/* Slot Tab */}
      {activeTabIndex === 4 && <SlotGames searchQuery={searchQuery} />}

      {/* Popular / Universe Live / Universe Original */}
      {activeTabIndex <= 2 && (
        <GameGrid
          gameList={filteredGameList}
          categoryFilter={categories[activeCategoryTabIndex]}
          rgbColorStart={rgbColorStart}
          rgbColorEnd={rgbColorEnd}
          borderColorStart={rgbBorderColorStart}
          borderColorEnd={headerColor?.end}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
}

export default CasinoHomeNav;