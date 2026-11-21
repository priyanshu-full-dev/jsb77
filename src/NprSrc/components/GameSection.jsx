import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaFire,
  FaHeart,
  FaSearch,
} from "react-icons/fa";
import {
  nprCategories,
  nprGames,
  nprLiveCasinoProviders,
  nprSlotProviders,
  nprSlotGames,
  nprFishProviders,
  nprFishGames,
  nprSportsProviders,
  nprPokerProviders,
  nprPokerGames,
} from "../data/nprMockData";

const categoryIconMap = {
  hot: {
    active: "/npr/category/cat_hot_active.png",
    inactive: "/npr/category/cat_hot_inactive.png",
  },
  live: {
    active: "/npr/category/cat_live_active.png",
    inactive: "/npr/category/cat_live_inactive.png",
  },
  slots: {
    active: "/npr/category/cat_slots_active.png",
    inactive: "/npr/category/cat_slots_inactive.png",
  },
  fish: {
    active: "/npr/category/cat_fish_active.png",
    inactive: "/npr/category/cat_fish_inactive.png",
  },
  sports: {
    active: "/npr/category/cat_sports_active.png",
    inactive: "/npr/category/cat_sports_inactive.png",
  },
  poker: {
    active: "/npr/category/cat_poker_active.png",
    inactive: "/npr/category/cat_poker_inactive.png",
  },
};

const slotExtraTags = [
  "Arcade",
  "Bingo",
  "Bonus Game",
  "Cascade Slots",
  "Crash Games",
  "Cricket",
  "Feature Buy",
  "Free Spins",
  "Jackpot",
  "Megaways",
  "Respins",
  "Scratches",
  "Slots",
  "Table Games",
  "Video Poker",
];

const GridActionIcon = () => (
  <svg viewBox="0 0 22 22" className="w-[21px] h-[21px] fill-current">
    <rect x="0.5" y="0.5" width="9.5" height="9.5" rx="2.8" />
    <rect x="12" y="0.5" width="9.5" height="9.5" rx="2.8" />
    <rect x="0.5" y="12" width="9.5" height="9.5" rx="2.8" />
    <rect x="12" y="12" width="9.5" height="9.5" rx="2.8" />
  </svg>
);

const FireActionIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current">
    <path
      fillRule="evenodd"
      d="M 3.22 10.92 C 1.88 10.92 0.93 9.3 2.01 8.08 C 3.09 6.87 4.98 5.65 4.98 5.65 C 4.98 5.65 4.98 8.62 4.17 9.84 C 3.77 10.52 3.49 10.92 3.22 10.92 Z M 20.77 8.22 C 19.96 8.22 19.29 6.73 19.96 5.65 C 20.64 4.57 22.53 3.09 22.53 3.09 C 22.53 3.09 22.8 5.92 21.72 7.14 C 21.31 7.68 21.05 8.22 20.77 8.22 Z M 12.27 0.93 C 12.27 0.93 9.57 5.52 7.41 7.01 C 5.25 8.49 4.17 10.65 4.17 13.08 C 4.17 18.07 7.68 22.53 12.0 22.53 C 16.32 22.53 19.83 18.07 19.83 13.08 C 19.83 9.03 17.4 6.06 15.78 4.44 C 14.97 6.2 14.03 7.27 13.08 7.27 C 12.27 7.27 11.59 6.33 11.59 4.98 C 11.59 2.82 12.27 0.93 12.27 0.93 Z M 12.0 19.56 C 10.38 19.56 9.17 17.94 9.17 16.05 C 9.17 14.16 10.65 11.73 12.0 10.92 C 13.35 11.73 14.83 14.16 14.83 16.05 C 14.83 17.94 13.62 19.56 12.0 19.56 Z"
    />
  </svg>
);

const HeartActionIcon = () => (
  <svg viewBox="1 2 22 20" className="w-[21px] h-[20px] fill-current">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const SearchActionIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-[21px] h-[21px] fill-none stroke-current"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="10.8" cy="10.8" r="7" />
    <path d="M16 16L20.8 20.8" />
  </svg>
);

const GameSection = ({ onSelectGame, initialCategory = "hot" }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const outletCtx = useOutletContext?.() || {};
  const reduxIsLoggedIn = useSelector((state) => state.user?.isLoggedIn);
  const reduxToken = useSelector((state) => state.user?.token);
  const isAuth = Boolean(
    reduxIsLoggedIn ||
    reduxToken ||
    outletCtx?.user ||
    (typeof window !== "undefined" &&
      (localStorage.getItem("token") ||
        localStorage.getItem("userId") ||
        localStorage.getItem("npr_user")))
  );

  const requireAuth = (callback) => {
    if (!isAuth) {
      if (outletCtx?.onOpenLogin) {
        outletCtx.onOpenLogin();
      } else {
        navigate("/login");
      }
      return;
    }
    callback();
  };
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [slotProvider, setSlotProvider] = useState("all");
  const [slotReel, setSlotReel] = useState("all");
  const [slotView, setSlotView] = useState("all"); // "all", "hot", "favorite", "search"
  const [slotFilterExpanded, setSlotFilterExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [fishProvider, setFishProvider] = useState("all");
  const [fishType, setFishType] = useState("all");
  const [fishView, setFishView] = useState("all");
  const [fishFilterExpanded, setFishFilterExpanded] = useState(false);
  const [fishSearch, setFishSearch] = useState("");

  const [pokerProvider, setPokerProvider] = useState("all");
  const [pokerType, setPokerType] = useState("all");
  const [pokerView, setPokerView] = useState("all");
  const [pokerSearch, setPokerSearch] = useState("");

  // Filter regular games by category
  const filteredGames = nprGames.filter((game) => {
    if (activeCategory === "hot") return true;
    return game.category.includes(activeCategory);
  });

  // Filter slot games specifically
  const displaySlotGames = nprSlotGames.filter((g) => {
    if (slotProvider !== "all") {
      if (slotProvider === "pp" && g.provider !== "PP") return false;
      if (slotProvider === "fc" && !g.provider.toLowerCase().includes("chai")) return false;
      if (slotProvider === "cq9" && g.provider !== "CQ9") return false;
      if (slotProvider === "jili" && g.provider !== "Jili") return false;
    }
    if (slotReel === "3" && !g.title.includes("3") && !g.id.includes("3")) return false;
    if (slotReel === "5" && !g.title.includes("5") && !g.id.includes("5")) return false;
    if (slotReel !== "all" && !g.title.toLowerCase().includes(slotReel.toLowerCase()) && !g.id.toLowerCase().includes(slotReel.toLowerCase())) return false;
    if (searchQuery) {
      return (
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  // Filter fish games specifically
  const displayFishGames = nprFishGames.filter((g) => {
    if (fishProvider !== "all") {
      if (fishProvider === "fc" && !g.provider.toLowerCase().includes("chai")) return false;
      if (fishProvider === "spadegaming" && !g.provider.toLowerCase().includes("spade")) return false;
      if (fishProvider === "ftg" && !g.provider.toLowerCase().includes("ftg")) return false;
      if (fishProvider === "jili" && g.provider !== "Jili") return false;
      if (fishProvider === "jdb" && g.provider !== "JDB") return false;
      if (fishProvider === "cq9" && g.provider !== "CQ9") return false;
    }
    if (fishType === "machine" && !g.title.toLowerCase().includes("machine") && !g.id.includes("machine")) return false;
    if (fishType === "jackpot" && !g.title.toLowerCase().includes("jackpot") && !g.id.includes("jackpot")) return false;
    if (fishSearch) {
      return (
        g.title.toLowerCase().includes(fishSearch.toLowerCase()) ||
        g.provider.toLowerCase().includes(fishSearch.toLowerCase())
      );
    }
    return true;
  });

  // Filter poker games specifically
  const displayPokerGames = nprPokerGames.filter((g) => {
    if (pokerProvider !== "all") {
      if (pokerProvider === "365" && !g.provider.toLowerCase().includes("365")) return false;
      if (pokerProvider === "gfg" && !g.provider.toLowerCase().includes("gfg")) return false;
      if (pokerProvider === "baison" && !g.provider.toLowerCase().includes("baison")) return false;
      if (pokerProvider === "kingmidas" && !g.provider.toLowerCase().includes("kingmidas")) return false;
      if (pokerProvider === "jili" && g.provider !== "Jili") return false;
      if (pokerProvider === "rich88" && !g.provider.toLowerCase().includes("rich88")) return false;
      if (pokerProvider === "jdb" && g.provider !== "JDB") return false;
    }
    if (pokerType === "multiplayer" && !g.title.toLowerCase().includes("versus") && !g.title.toLowerCase().includes("multiplayer")) return false;
    if (pokerSearch) {
      return (
        g.title.toLowerCase().includes(pokerSearch.toLowerCase()) ||
        g.provider.toLowerCase().includes(pokerSearch.toLowerCase())
      );
    }
    return true;
  });

  const gamesToDisplay =
    activeCategory === "slots"
      ? displaySlotGames
      : activeCategory === "fish"
        ? displayFishGames
        : activeCategory === "poker"
          ? displayPokerGames
          : filteredGames;

  return (
    <div className="pl-4 sm:pl-8 pr-2 sm:pr-3 mb-3 flex gap-3 sm:gap-[21px] relative items-start">
      {/* Left Sidebar: Categories - Fixed/Sticky while cards scroll */}
      <div
        className={`flex-shrink-0 transition-all duration-300 sticky top-[56px] self-start z-20 max-h-[calc(100vh-70px)] overflow-y-auto npr-no-scrollbar ${sidebarCollapsed ? "w-0 overflow-visible opacity-0" : "w-[66px] sm:w-[68px]"
          }`}
      >
        <div className="flex flex-col items-center gap-2  relative">
          {nprCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const icons = categoryIconMap[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex flex-col items-center group w-full focus:outline-none select-none"
              >
                {/* Circular Icon Container - Exact 64-66px diameter */}
                <div
                  className={`w-[58px] h-[58px] sm:w-[66px] sm:h-[66px] rounded-full flex items-center justify-center transition-all duration-200 transform group-active:scale-95 ${isActive
                    ? "bg-gradient-to-b from-[#0062ff] to-[#012465] shadow-md border-0"
                    : "bg-[#dce8ff] border-[1.5px] border-[#2968de] hover:bg-[#d0e0ff]"
                    }`}
                >
                  <img
                    src={isActive ? icons.active : icons.inactive}
                    alt={cat.name}
                    className="w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                </div>

                {/* Exact Label */}
                <span
                  className={`text-[14px] sm:text-[11.5px] mt-1 text-center leading-[1.1] select-none ${isActive ? "font-black text-[#0047ba]" : "font-extrabold text-[#002d74]"
                    }`}
                >
                  {cat.id === "live" ? (
                    t("Live Casino")
                  ) : (
                    t(cat.name)
                  )}
                </span>
              </button>
            );
          })}

          {/* Sidebar Collapse Toggle Arrow (Fixed alongside sticky sidebar) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -left-5 sm:-left-7 bottom-3 z-30 w-5 h-9 bg-[#0047ba] hover:bg-[#003da5] text-white rounded-r-xl flex items-center justify-center shadow-lg transition active:scale-95"
            title={sidebarCollapsed ? "Expand Categories" : "Collapse Categories"}
          >
            {sidebarCollapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
          </button>
        </div>
      </div>

      {/* Right Area: Game Cards or Live Casino / Sports Provider Banners */}
      <div className={`flex-1 min-w-0 pr-1 ${activeCategory === "live" ? "mt-4" : ""}`}>
        {activeCategory === "live" || activeCategory === "sports" ? (
          /* Live Casino & Sports Provider Banners (1 per row, matching NPR77 reference) */
          <div className="flex flex-col gap-2 sm:gap-3.5">
            {(activeCategory === "live" ? nprLiveCasinoProviders : nprSportsProviders).map((prov) => (
              <div
                key={prov.id}
                onClick={() => {
                  requireAuth(() => {
                    if (activeCategory === "sports") {
                      if (prov.id === "cricket") {
                        navigate("/cricket");
                        return;
                      }
                      if (prov.id === "soccer") {
                        navigate("/soccer");
                        return;
                      }
                      if (prov.id === "tennis") {
                        navigate("/tennis");
                        return;
                      }
                    }
                    onSelectGame({
                      title: `${prov.name} Lobby`,
                      provider: prov.provider,
                    });
                  });
                }}
                className="w-full  overflow-hidden shadow-xs hover:shadow-md transition duration-200 cursor-pointer active:scale-[0.985] group"
              >
                <img
                  src={prov.image}
                  alt={prov.name}
                  loading="lazy"
                  className="w-full h-auto object-cover block group-hover:scale-[1.015] transition duration-300 pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Slots Dedicated Top Filter Header */}
            {activeCategory === "slots" && (
              <div className="bg-white border-[1.5px] border-[#0047ba] rounded-[6px] py-3.5 px-3 sm:py-4 sm:px-3.5 mb-3 shadow-2xs">
                {/* Row 1: Title + 4 Action Buttons */}
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-[#1a202c] font-bold text-[19px] sm:text-[20px]">
                    {t("Slots")}
                  </h2>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* 1. All/Grid View */}
                    <button
                      type="button"
                      onClick={() => setSlotView("all")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${slotView === "all"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="All Games"
                    >
                      <GridActionIcon />
                    </button>

                    {/* 2. Hot */}
                    <button
                      type="button"
                      onClick={() => setSlotView("hot")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${slotView === "hot"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="Hot Slots"
                    >
                      <FireActionIcon />
                    </button>

                    {/* 3. Favorites */}
                    <button
                      type="button"
                      onClick={() => setSlotView("favorite")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${slotView === "favorite"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="Favorites"
                    >
                      <HeartActionIcon />
                    </button>

                    {/* 4. Search */}
                    <button
                      type="button"
                      onClick={() => setSlotView(slotView === "search" ? "all" : "search")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${slotView === "search"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="Search"
                    >
                      <SearchActionIcon />
                    </button>
                  </div>
                </div>

                {/* Optional Search Bar input if search active */}
                {slotView === "search" && (
                  <div className="mb-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("Search slot games...")}
                      className="w-full h-9 px-3 rounded-lg border border-blue-200 text-xs focus:outline-none focus:border-[#0047ba]"
                      autoFocus
                    />
                  </div>
                )}

                {/* Row 2: Provider Filter Horizontal Scroll */}
                <div className="flex items-center gap-2 overflow-x-auto npr-no-scrollbar py-0.5 mb-3.5">
                  <button
                    type="button"
                    onClick={() => setSlotProvider("all")}
                    className={`h-[50px] min-w-[80px] px-3.5 rounded-[6px] font-bold text-[14px] flex items-center justify-center shrink-0 transition cursor-pointer border-[1.5px] border-[#0047ba] ${slotProvider === "all"
                      ? "bg-[#0047ba] text-white shadow-xs"
                      : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                      }`}
                  >
                    {t("All")}
                  </button>
                  {nprSlotProviders.slice(1).map((p) => {
                    const isSelected = slotProvider === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSlotProvider(isSelected ? "all" : p.id)}
                        className={`h-[50px] min-w-[80px] px-2.5 rounded-[6px] flex items-center justify-center shrink-0 transition cursor-pointer border-[1.5px] border-[#0047ba] ${isSelected
                          ? "bg-[#0047ba] text-white"
                          : "bg-white hover:bg-blue-50/40 text-[#0047ba]"
                          }`}
                      >
                        {p.logo ? (
                          <img
                            src={p.logo}
                            alt={p.name}
                            className={`max-h-[30px] max-w-[66px] object-contain pointer-events-none select-none ${isSelected ? "brightness-0 invert" : ""
                              }`}
                            draggable={false}
                          />
                        ) : (
                          <span className="font-bold text-[13px]">{p.name}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Row 3: Reel Filter Horizontal Scroll */}
                <div className="flex items-center gap-2 overflow-x-auto npr-no-scrollbar pt-0.5">
                  <button
                    type="button"
                    onClick={() => setSlotReel("all")}
                    className={`h-[30px] px-4 rounded-full font-bold text-[12px] shrink-0 transition cursor-pointer ${slotReel === "all"
                      ? "bg-[#0047ba] text-white border border-[#0047ba]"
                      : "bg-white border-[1.5px] border-[#0047ba] text-[#0047ba]"
                      }`}
                  >
                    {t("All")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlotReel(slotReel === "3" ? "all" : "3")}
                    className={`h-[30px] px-4 rounded-full font-bold text-[12px] shrink-0 transition cursor-pointer ${slotReel === "3"
                      ? "bg-[#0047ba] text-white border border-[#0047ba]"
                      : "bg-white border-[1.5px] border-[#0047ba] text-[#0047ba]"
                      }`}
                  >
                    {t("3 Reels")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlotReel(slotReel === "5" ? "all" : "5")}
                    className={`h-[30px] px-4 rounded-full font-bold text-[12px] shrink-0 transition cursor-pointer ${slotReel === "5"
                      ? "bg-[#0047ba] text-white border border-[#0047ba]"
                      : "bg-white border-[1.5px] border-[#0047ba] text-[#0047ba]"
                      }`}
                  >
                    {t("5 Reels")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlotFilterExpanded(!slotFilterExpanded)}
                    className="text-[#0047ba] shrink-0 ml-auto pr-1 flex items-center justify-center p-1 cursor-pointer transition hover:opacity-80 active:scale-95"
                    title={slotFilterExpanded ? "Collapse Filters" : "Expand Filters"}
                  >
                    <svg
                      className={`w-[28px] h-[28xpx] text-[#0047ba] transition-transform duration-200 ${slotFilterExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Expanded Filter Chips (Arcade, Bingo, Bonus Game, etc.) */}
                {slotFilterExpanded && (
                  <div className="flex flex-wrap gap-2 pt-2.5 mt-2">
                    {slotExtraTags.map((tag) => {
                      const isSelected = slotReel === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSlotReel(isSelected ? "all" : tag)}
                          className={`h-[28px] px-3.5 rounded-full font-bold text-[12px] shrink-0 transition cursor-pointer border-[1.5px] border-[#0047ba] ${isSelected
                            ? "bg-[#0047ba] text-white"
                            : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                            }`}
                        >
                          {t(tag)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Fish Dedicated Top Filter Header */}
            {activeCategory === "fish" && (
              <div className="bg-white border-[1.5px] border-[#0047ba] rounded-[6px] py-3.5 px-3 sm:py-4 sm:px-3.5 mb-3 shadow-2xs">
                {/* Row 1: Title + 4 Action Buttons */}
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-[#1a202c] font-bold text-[19px] sm:text-[20px]">
                    {t("Fish")}
                  </h2>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* 1. All/Grid View */}
                    <button
                      type="button"
                      onClick={() => setFishView("all")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${fishView === "all"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="All Games"
                    >
                      <GridActionIcon />
                    </button>

                    {/* 2. Hot */}
                    <button
                      type="button"
                      onClick={() => setFishView("hot")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${fishView === "hot"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="Hot Games"
                    >
                      <FireActionIcon />
                    </button>

                    {/* 3. Favorites */}
                    <button
                      type="button"
                      onClick={() => setFishView("favorite")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${fishView === "favorite"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="Favorite Games"
                    >
                      <HeartActionIcon />
                    </button>

                    {/* 4. Search */}
                    <button
                      type="button"
                      onClick={() => setFishView(fishView === "search" ? "all" : "search")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${fishView === "search"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="Search Games"
                    >
                      <SearchActionIcon />
                    </button>
                  </div>
                </div>

                {/* Optional Search Input */}
                {fishView === "search" && (
                  <div className="mb-2.5">
                    <input
                      type="text"
                      placeholder={t("Search fish games...")}
                      value={fishSearch}
                      onChange={(e) => setFishSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#0047ba]"
                    />
                  </div>
                )}

                {/* Row 2: Provider Buttons Scroll */}
                <div className="flex items-center gap-2 overflow-x-auto npr-no-scrollbar py-0.5 mb-3.5">
                  {nprFishProviders.map((prov) => {
                    const isSelected = fishProvider === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => setFishProvider(prov.id)}
                        className={`h-[50px] min-w-[80px] px-2.5 rounded-[6px] shrink-0 font-bold text-[14px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${isSelected
                          ? "bg-[#0047ba] text-white shadow-xs"
                          : "bg-white text-[#0047ba] hover:bg-blue-50/40"
                          }`}
                      >
                        {prov.id === "all" ? (
                          <span>{t("All")}</span>
                        ) : prov.logo ? (
                          <img
                            src={prov.logo}
                            alt={prov.name}
                            className={`max-h-[30px] max-w-[66px] object-contain pointer-events-none select-none ${isSelected ? "brightness-0 invert" : ""
                              }`}
                            draggable={false}
                          />
                        ) : (
                          <span className="font-bold text-[12px]">{prov.name}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Row 3: Fishing Machine / Type Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto npr-no-scrollbar pt-0.5">
                  <button
                    type="button"
                    onClick={() => setFishType("all")}
                    className={`h-[30px] px-4 rounded-full font-bold text-[12px] shrink-0 transition cursor-pointer ${fishType === "all"
                      ? "bg-[#0047ba] text-white border border-[#0047ba]"
                      : "bg-white border-[1.5px] border-[#0047ba] text-[#0047ba]"
                      }`}
                  >
                    {t("All")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFishType(fishType === "machine" ? "all" : "machine")}
                    className={`h-[30px] px-4 rounded-full font-bold text-[12px] shrink-0 transition cursor-pointer ${fishType === "machine"
                      ? "bg-[#0047ba] text-white border border-[#0047ba]"
                      : "bg-white border-[1.5px] border-[#0047ba] text-[#0047ba]"
                      }`}
                  >
                    {t("Fishing Machine")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFishFilterExpanded(!fishFilterExpanded)}
                    className="text-[#0047ba] shrink-0 ml-auto pr-1 flex items-center justify-center p-1 cursor-pointer transition hover:opacity-80 active:scale-95"
                    title={fishFilterExpanded ? "Collapse Filters" : "Expand Filters"}
                  >
                    <svg
                      className={`w-[28px] h-[28px] text-[#0047ba] transition-transform duration-200 ${fishFilterExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Row 4: Expanded Tag Chips */}
                {fishFilterExpanded && (
                  <div className="flex flex-wrap gap-2 pt-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setFishType(fishType === "jackpot" ? "all" : "jackpot")}
                      className={`h-[28px] px-3.5 rounded-full font-bold text-[12px] shrink-0 transition cursor-pointer border-[1.5px] border-[#0047ba] ${fishType === "jackpot"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                    >
                      {t("Fishing Machine Jackpot")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Poker Dedicated Top Filter Header */}
            {activeCategory === "poker" && (
              <div className="bg-white border-[1.5px] border-[#0047ba] rounded-[6px] py-3.5 px-3 sm:py-4 sm:px-3.5 mb-3 shadow-2xs">
                {/* Row 1: Title + 4 Action Buttons */}
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-[#1a202c] font-bold text-[19px] sm:text-[20px]">
                    {t("Poker")}
                  </h2>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* 1. All/Grid View */}
                    <button
                      type="button"
                      onClick={() => setPokerView("all")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${pokerView === "all"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="All Games"
                    >
                      <GridActionIcon />
                    </button>

                    {/* 2. Hot */}
                    <button
                      type="button"
                      onClick={() => setPokerView("hot")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${pokerView === "hot"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="Hot Games"
                    >
                      <FireActionIcon />
                    </button>

                    {/* 3. Favorites */}
                    <button
                      type="button"
                      onClick={() => setPokerView("favorite")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${pokerView === "favorite"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="Favorite Games"
                    >
                      <HeartActionIcon />
                    </button>

                    {/* 4. Search */}
                    <button
                      type="button"
                      onClick={() => setPokerView(pokerView === "search" ? "all" : "search")}
                      className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${pokerView === "search"
                        ? "bg-[#0047ba] text-white"
                        : "bg-white text-[#0047ba] hover:bg-blue-50/50"
                        }`}
                      title="Search Games"
                    >
                      <SearchActionIcon />
                    </button>
                  </div>
                </div>

                {/* Optional Search Input */}
                {pokerView === "search" && (
                  <div className="mb-2.5">
                    <input
                      type="text"
                      placeholder={t("Search poker games...")}
                      value={pokerSearch}
                      onChange={(e) => setPokerSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#0047ba]"
                    />
                  </div>
                )}

                {/* Row 2: Provider Buttons Scroll */}
                <div className="flex items-center gap-2 overflow-x-auto npr-no-scrollbar py-0.5 mb-2.5">
                  {nprPokerProviders.map((prov) => {
                    const isSelected = pokerProvider === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => setPokerProvider(prov.id)}
                        className={`h-[44px] min-w-[76px] px-2.5 rounded-[6px] shrink-0 font-bold text-[13px] flex items-center justify-center transition cursor-pointer border-[1.5px] border-[#0047ba] ${isSelected
                          ? "bg-[#0047ba] text-white"
                          : "bg-white text-[#0047ba] hover:bg-blue-50/40"
                          }`}
                      >
                        {prov.id === "all" ? (
                          <span>{t("All")}</span>
                        ) : prov.logo ? (
                          <img
                            src={prov.logo}
                            alt={prov.name}
                            className={`max-h-[26px] max-w-[62px] object-contain pointer-events-none select-none ${isSelected ? "brightness-0 invert" : ""
                              }`}
                            draggable={false}
                          />
                        ) : (
                          <span className="font-bold text-[12px]">{prov.name}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Row 3: Multiplayer Game / Type Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto npr-no-scrollbar pt-0.5">
                  <button
                    type="button"
                    onClick={() => setPokerType("all")}
                    className={`h-[26px] px-3.5 rounded-full font-bold text-[11px] shrink-0 transition cursor-pointer ${pokerType === "all"
                      ? "bg-[#0047ba] text-white border border-[#0047ba]"
                      : "bg-white border-[1.5px] border-[#0047ba] text-[#0047ba]"
                      }`}
                  >
                    {t("All")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPokerType(pokerType === "multiplayer" ? "all" : "multiplayer")}
                    className={`h-[26px] px-3.5 rounded-full font-bold text-[11px] shrink-0 transition cursor-pointer ${pokerType === "multiplayer"
                      ? "bg-[#0047ba] text-white border border-[#0047ba]"
                      : "bg-white border-[1.5px] border-[#0047ba] text-[#0047ba]"
                      }`}
                  >
                    {t("Multiplayer game")}
                  </button>
                  <div className="text-[#0047ba] shrink-0 ml-auto pr-1 flex items-center">
                    <svg className="w-[28px] h-[28px] text-[#0047ba]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* 3 Columns Games Grid */}
            <div className="grid grid-cols-3 gap-[9px] sm:gap-[10px]">
              {gamesToDisplay.map((game) => (
                <div
                  key={game.id}
                  onClick={() => requireAuth(() => onSelectGame(game))}
                  className="npr-game-card flex flex-col cursor-pointer select-none"
                >
                  {/* Game Thumbnail Card - Fills cell width with exact 9-10px gap */}
                  <div className="relative w-full aspect-square rounded-[6px] overflow-hidden bg-gray-900 shadow-xs border border-gray-100">
                    <img
                      src={game.image}
                      alt={game.title}
                      loading="lazy"
                      className="w-full h-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />

                    {/* Optional Badges on image */}
                    {game.badge && (
                      <span className="absolute top-1 left-1 bg-red-600 text-white font-black text-[8px] px-1.5 py-0.2 rounded-sm shadow uppercase">
                        {game.badge}
                      </span>
                    )}

                    {/* Favorite Star */}
                    <div className="absolute top-1 right-1 text-white/50">
                      <FaStar size={11} />
                    </div>
                  </div>

                  {/* Provider Name (Cyan / Light Blue) */}
                  <span className="text-[#0066f5] text-[11px] text-center truncate w-full">
                    {game.provider}
                  </span>

                  {/* Game Title */}
                  <p className="text-[#0f172a] text-[13px] sm:text-[11px] font-bold text-center leading-tight line-clamp-2">
                    {game.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

GameSection.propTypes = {
  onSelectGame: PropTypes.func.isRequired,
  initialCategory: PropTypes.string,
};

export default GameSection;

