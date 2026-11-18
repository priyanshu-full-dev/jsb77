import { useEffect, useRef, useState, useCallback } from "react";
import useHexToRgb from "../../../../utils/useHexToRgb";
import { useSelector } from "react-redux";
import ProviderTabs from "./ProviderTabs";
import CategoryTabs from "./CategoryTabs";
import GameGrid from "./GameGrid";
import { useSearchParams } from "react-router-dom";
import { usePrimaryColor } from "../../hooks/useThemeColors";
import { Search } from "lucide-react";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ProviderTabs2 from "./ProviderTabs2";
import GameGridLiveCasino from "./GameGridLiveCasino";

// Name mapping object
const nameMapping = {
  "TeenPatti Joker": "Joker Teen Patti",
  "One-Dat Teen Patti": "1Day Teen Patti",
  "Baccarat C": "Baccarat - C",
  "Baccarat A": "Baccarat - A",
  Keno: "Lottery",
  "Lightning Dragon Tiger": "Fast Dragon Tiger",
  "M Teen Patti 20-20": " 20-20 Teen Patti",
  "D Dragon Tiger": "1 Day Dragon Tiger",
  "Teen Patti": "1Day Teen Patti",
  "Video Poker": "20-20 Poker - A",
  "Triple Card Poker": "20-20 Poker - B",
  "Ultimate Andar Bahar": "Andar Bahar - C",
  "Teen Patti 3 Card": "DLT Teen Patti",
};

// Image mapping object (maps gameId to local logo-square image)
const imageMapping = {
  "JIL-teenpattijoker": {
    "logo-square": "/aura/AuraCasinoImages/Joker-20Teen-20Patti-min.png",
  },
  "EZU-onedayteenpatti": {
    "logo-square": "/aura/AuraCasinoImages/I-20Day-20TeenPatti-min.png",
  },
  "EZU-dragontiger": {
    "logo-square": "/aura/AuraCasinoImages/Dragontiger.jpg",
  },
  "EZU-baccarat": { "logo-square": "/aura/AuraCasinoImages/Baccarat.jpg" },
  "EZU-baccarata": { "logo-square": "/aura/AuraCasinoImages/BACCARAT-2.png" },
  "EZU-baccaratc": {
    "logo-square": "/aura/AuraCasinoImages/Baccarat2-min.png",
  },
  "SPB-keno": { "logo-square": "/aura/AuraCasinoImages/Lottery.png" },
  "EZU-32cards": { "logo-square": "/aura/AuraCasinoImages/32cards.png" },

  "EZU-lucky7": { "logo-square": "/aura/AuraCasinoImages/Lucky-7.jpg" },
  "EVO-teenpatti": {
    "logo-square": "/aura/AuraCasinoImages/1Dayteenpatti.jpg",
  },
  "EVO-lightningdragontiger": {
    "logo-square": "/aura/AuraCasinoImages/FastDragon-Tiger-min-min.png",
  },
  "SAG-ddragontiger": {
    "logo-square": "/aura/AuraCasinoImages/1DayDragon-Tiger-min.png",
  },
  "EVO-trp": { "logo-square": "/aura/AuraCasinoImages/20-20Poker-min.png" },
  "EVO-videopoker": { "logo-square": "/aura/AuraCasinoImages/poker-min.png" },
  "EZU-andarbahar": { "logo-square": "/aura/AuraCasinoImages/AndarBahar.jpg" },
  "EZU-ultimateandarbahar": {
    "logo-square": "/aura/AuraCasinoImages/AndarBahar3-min.png",
  },
  "EZU-teenpatti": { "logo-square": "/aura/AuraCasinoImages/DltTennPatti.png" },
  "DMD-poker-3044": { "logo-square": "/aura/AuraCasinoImages/Poker.jpg" },

  "DMD-dt6-3052": {
    "logo-square": "/aura/AuraCasinoImages/1DayDragontiger.jpg",
  },
  "EVO-balloonrace": { "logo-square": "/aura/AuraCasinoImages/Balloon.jpg" },
  "DMD-baccarat2-3055": {
    "logo-square": "/aura/AuraCasinoImages/Baccarat.jpg",
  },
  "DMD-teen-3031": {
    "logo-square": "/aura/AuraCasinoImages/1Dayteenpatti.jpg",
  },
  "DMD-lucky7-3058": { "logo-square": "/aura/AuraCasinoImages/Lucky-7.jpg" },
  "DMD-card32-3038": { "logo-square": "/aura/AuraCasinoImages/32cards.jpg" },
  "DMD-t20-3030": {
    "logo-square": "/aura/AuraCasinoImages/20-20teenpatti.jpg",
  },
};


const priorityOrder = [
  "Joker Teen Patti",
  "1Day Teen Patti",
  "DLT Teen Patti",
  "20-20 Teen Patti",
  "Baccarat - A",
  "Baccarat",
  "Baccarat - C",
  "Dragon Tiger",
];


const lastItems = ["Keno", "Evolution", "EZUGI", "VIMAAN"];
const INITIAL_PROVIDER_LIST = [{ provider: { name: "Popular" } }];


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

function CasinoHomeNavForLiveCasino({
  providerList = [],
  headerColor = { start: "#315195", end: "#14213D" },
}) {
  const [searchParams] = useSearchParams();
  const qLiveCasino = searchParams.get("live-casino");

  const q1 = searchParams.get("q1");
  const q2 = searchParams.get("q2");
  const currentPathName = window?.location?.pathname;

  const topBarColor = useSelector(
    (state) => state?.site?.siteDetails?.topBarColor,
  );
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeCategoryTabIndex, setActiveCategoryTabIndex] = useState(0);
  const PrimaryColor = usePrimaryColor();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gameNames] = useState([]);

  const finalProviderList = [...INITIAL_PROVIDER_LIST, ...providerList];
  const activeProvider = finalProviderList[activeTabIndex]?.provider;

  const categories = useFilteredCategories(
    activeTabIndex === 0 ? providerList : activeProvider,
  );

  const {
    scrollRef: providerScrollRef,
    itemRefs: providerItemRefs,
    scrollToCenter: scrollToProvider,
  } = useScrollToCenter();
  const {
    scrollRef: categoryScrollRef,
    itemRefs: categoryItemRefs,
    scrollToCenter: scrollToCategory,
  } = useScrollToCenter();

  const rgbColorStart = useHexToRgb(topBarColor?.start);
  const rgbColorEnd = useHexToRgb(topBarColor?.end);

  const rgbBorderColorStart = useHexToRgb(headerColor?.start);
  const rgbBorderColorEnd = useHexToRgb(headerColor?.end);

  const handleProviderClick = (index, e) => {
    e.preventDefault();
    setActiveTabIndex(index);
    setActiveCategoryTabIndex(0);
    scrollToProvider(index);
  };

  const handleCategoryClick = (index, e) => {
    e.preventDefault();
    setActiveCategoryTabIndex(index);
    scrollToCategory(index);
  };

  useEffect(() => {
    if (qLiveCasino === "true" && q1 && q2) {
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
  const hardCodeData = [
    {
      name: "Evolution",
      category: "CASINO/Evolution",
      gameId: "Evolution",
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
          // url: AbevolutionGaming,
          url: "/aura/AuraCasinoImages/abevolution+gaming-min.png",
          _id: "68a455cb958bb6666eade39e9",
        },
      ],
      _id: "68a455cb958bb886eade6565e6",
      href: `/live-casino?live-casino=true&q1=evolution&q2=casino`,
    },
    {
      name: "EZUGI",
      category: "CASINO/EZUGI",
      gameId: "EZUGI",

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
          url: "/aura/AuraCasinoImages/Ezugi-min.png",
          _id: "68a455cb958bb6666eade39e9",
        },
      ],
      _id: "68a455cb958bb886eade6565e6",
      href: `/live-casino?live-casino=true&q1=ezugi&q2=casino`,
    },
    {
      name: "VIMAAN",
      category: "CASINO/VIMAAN",
      gameId: "VIMAAN",
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
          url: "/aura/AuraCasinoImages/Vimaan.png",
          _id: "68a455cb958bb6666eade39e9",
        },
      ],
      _id: "68a455cb958bb886eade6565e6",
      href: `/live-casino?live-casino=true&q1=spribe&q2=casino`,
    },
  ];

  let filteredGameList =
    activeTabIndex === 0
      ? providerList.flatMap((p) => p.provider?.gameList || [])
      : activeProvider?.gameList || [];

  if (
    activeTabIndex === 0 &&
    categories[activeCategoryTabIndex]?.toLowerCase() === "casino"
  ) {
    filteredGameList = filteredGameList.filter((g) =>
      gameNames.includes(g?.name),
    );

    // Apply name and image mapping
    filteredGameList = filteredGameList.map((item) => {
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
        name: nameMapping[item.name] || item.name,
        images: mappedImages,
      };
    });

    // Combine games with hardcoded data
    filteredGameList = [...filteredGameList, ...hardCodeData];
    const unique = new Map();
    filteredGameList.forEach((g) => {
      if (!unique.has(g?.name)) {
        unique.set(g?.name, g);
      }
    });
    filteredGameList = Array.from(unique.values());

    filteredGameList = [
      ...filteredGameList
        .filter((game) => priorityOrder.includes(game.name))
        .sort(
          (a, b) =>
            priorityOrder.indexOf(a.name) - priorityOrder.indexOf(b.name),
        ),
      ...filteredGameList
        .filter(
          (game) =>
            !priorityOrder.includes(game.name) &&
            !lastItems.includes(game.name),
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
      ...filteredGameList
        .filter((game) => lastItems.includes(game.name))
        .sort((a, b) => lastItems.indexOf(a.name) - lastItems.indexOf(b.name)),
    ];
  }

  return (
    <div
      className={`w-full flex flex-col sticky top-14 justify-start items-start z-1`}
      style={{
        top: window.location.pathname.includes("/live-casino")
          ? "112px"
          : "500px", // zIndex: 999, // ensure it sticks above other elements
      }}
    >
      {" "}
      {/* <ProviderTabs
        providers={finalProviderList}
        activeIndex={activeTabIndex}
        onClick={handleProviderClick}
        scrollRef={providerScrollRef}
        itemRefs={providerItemRefs}
        headerColor={headerColor}
        topBarColor={topBarColor}
      /> */}
      <ProviderTabs2
        providers={finalProviderList}
        activeIndex={activeTabIndex}
        onClick={handleProviderClick}
        scrollRef={providerScrollRef}
        itemRefs={providerItemRefs}
        headerColor={headerColor}
        topBarColor={topBarColor}
      />{" "}
      {categories.length > 0 && activeTabIndex !== 0 && (
        <>
          <CategoryTabs
            categories={categories}
            activeIndex={activeCategoryTabIndex}
            onClick={handleCategoryClick}
            scrollRef={categoryScrollRef}
            itemRefs={categoryItemRefs}
            topBarColor={topBarColor}
          />

          <div className="absolute right-2 top-[42px] flex items-center z-50">
            <div
              className={`
      transition-all duration-500 ease-in-out overflow-hidden
      ${
        isSearchOpen
          ? "w-52 opacity-100 translate-x-0"
          : "w-0 opacity-0 translate-x-4"
      }
    `}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full py-[4.5px] px-3 rounded-full text-sm bg-white outline-none border border-gray-300"
                autoFocus={isSearchOpen}
              />
            </div>
          </div>
          <div className="absolute right-1 top-[42px] flex items-center z-50">
            <div
              className="p-[7px] rounded-full text-[17px] cursor-pointer flex justify-center items-center"
              style={{ background: PrimaryColor }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <IoClose /> : <FaSearch />}
            </div>
          </div>
        </>
      )}{" "}
      <GameGridLiveCasino
        gameList={filteredGameList}
        categoryFilter={categories[activeCategoryTabIndex]}
        rgbColorStart={rgbColorStart}
        rgbColorEnd={rgbColorEnd}
        borderColorStart={rgbBorderColorStart}
        borderColorEnd={headerColor?.end}
        searchQuery={searchQuery}
      />{" "}
    </div>
  );
}

export default CasinoHomeNavForLiveCasino;
