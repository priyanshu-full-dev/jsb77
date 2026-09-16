import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { isMobile } from "react-device-detect";
import { selectDomainID } from "../../../utils/helper/commonSelectors";
import { launcherUrl, updateCasinoBalance } from "../../../api";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../../redux/slices/userSlice";
import CasinoPointNoticeModal from "../../components/CasinoPointNoticeModal";
import { openLoginModal, isUserLoggedIn } from "../../utils/authModalEvents";

const normalizeGameId = (id) => {
  if (!id) return null;
  if (id.startsWith("DMD")) return id.split("-").pop();
  return id;
};

const providerLogos = {
  mac88: "https://luckmedia.link/providers/mc8/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format",
  slot: "/assets/slot-CzSBovEw.png",
  aura: "/assets/aura-Dv5kU8Ie.png",
  betgames: "https://luckmedia.link/providers/bgm/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format",
  "betgames.tv": "https://luckmedia.link/providers/bgm/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format",
  royalgaming: "/assets/rg-ecI0QzAQ.png",
  royaltygaming: "/assets/rg-ecI0QzAQ.png",
  evolution: "https://luckmedia.link/providers/evo/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format",
  evolutiongaming: "https://luckmedia.link/providers/evo/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format",
  bigtimegaming: "https://luckmedia.link/providers/btg/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format",
  btg: "https://luckmedia.link/providers/btg/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format",
  evoplay: "/assets/evo-play-B4a-CkvN.svg",
  ezugi: "https://luckmedia.link/providers/ezg/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format",
  sagaming: "/assets/SA-Gaming-BUOAf51M.svg",
  vivo: "/assets/vivo-gaming-DgqeW9vk.svg",
  vivogaming: "/assets/vivo-gaming-DgqeW9vk.svg",
  turbogames: "/assets/turbo-games-BaS9dDhA.svg",
  spribe: "/providerLogo/Spribe.webp",
  jili: "/providerLogo/jili.webp",
  jilli: "/providerLogo/jili.webp",
  oddin: "/providerLogo/Oddin.webp",
};

const getProviderLogo = (name) => {
  if (!name) return null;
  const key = name.toLowerCase().replace(/[\s._-]/g, "");
  return providerLogos[key] || null;
};

// 12 Top Providers from user structure
const TOP_PROVIDERS = [
  { name: "MAC88", logo: "https://luckmedia.link/providers/mc8/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format", fallback: "/assets/mac88-BAzKFZNt.png", invert: true },
  { name: "SLOT", logo: "/assets/slot-CzSBovEw.png", fallback: "/assets/slot-CzSBovEw.png", invert: false },
  { name: "Aura", logo: "/assets/aura-Dv5kU8Ie.png", fallback: "/assets/aura-Dv5kU8Ie.png", invert: false },
  { name: "BetGames.TV", logo: "/assets/Bet_Games-DQk1EkcT.svg", fallback: "https://luckmedia.link/providers/bgm/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format", invert: false },
  { name: "Royal Gaming", logo: "/assets/rg-ecI0QzAQ.png", fallback: "/assets/rg-ecI0QzAQ.png", invert: false },
  { name: "Evolution Gaming", logo: "https://luckmedia.link/providers/evo/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format", fallback: "/providerLogo/EvolutionGaming.webp", invert: false },
  { name: "Big Time Gaming", logo: "https://luckmedia.link/providers/btg/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format", fallback: "https://luckmedia.link/providers/btg/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format", invert: false },
  { name: "Evoplay", logo: "/assets/evo-play-B4a-CkvN.svg", fallback: "/providerLogo/evoplay.webp", invert: false },
  { name: "Ezugi", logo: "https://luckmedia.link/providers/ezg/logo_3_2_cl_dark.svg?q=65&w=600&px=auto&auto=format", fallback: "/providerLogo/EzugiGaming.webp", invert: false },
  { name: "SA Gaming", logo: "/assets/SA-Gaming-BUOAf51M.svg", fallback: "/providerLogo/AESexy.webp", invert: false },
  { name: "Vivo Gaming", logo: "/assets/vivo-gaming-DgqeW9vk.svg", fallback: "/providerLogo/Vivo.webp", invert: false },
  { name: "Turbo Games", logo: "/assets/turbo-games-BaS9dDhA.svg", fallback: "/providerLogo/turbogames.webp", invert: false },
];

export default function CasinoPage({ tab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const domainId = useSelector(selectDomainID());
  const { permissionList } = useSelector((state) => state.casinoPermission || {});
  const isLoggedIn = useSelector((state) => state.user?.isLoggedIn);
  const loginType = useSelector((state) => state.user?.loggedInType);
  const userData = useSelector((state) => state?.user?.userData);
  const siteCasinoData = useSelector((state) => state?.siteCasino);

  // Initial provider based on route
  const getInitialProvider = useCallback(() => {
    const currentPath = location.pathname.toLowerCase();
    if (currentPath.includes("mac88")) return "MAC88";
    if (currentPath.includes("slot")) return "SLOT";
    if (currentPath.includes("aura")) return "Aura";
    if (currentPath.includes("live-casino") || currentPath.includes("table") || currentPath.includes("cards"))
      return "ALL";
    if (currentPath.includes("crash") || currentPath.includes("aviator")) return "Turbo Games";
    return "Aura";
  }, [location.pathname]);

  const [activeProvider, setActiveProvider] = useState(getInitialProvider);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [gameData, setGameData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(40);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [selectedGameForNotice, setSelectedGameForNotice] = useState(null);

  const gridRef = useRef(null);

  useEffect(() => {
    setActiveProvider(getInitialProvider());
  }, [getInitialProvider]);

  // Locked providers & games
  const lockedProviders = useMemo(() => {
    return new Set(
      permissionList
        ?.filter((p) => p.type === "provider")
        ?.map((p) => p.provider?.toLowerCase()) || []
    );
  }, [permissionList]);

  const lockedGameIds = useMemo(() => {
    return new Set(
      permissionList
        ?.filter((p) => p.type === "game")
        ?.map((p) => normalizeGameId(p.gameId)) || []
    );
  }, [permissionList]);

  // Fetch 100% dynamic Casino data from internal API
  useEffect(() => {
    let isMounted = true;
    const fetchCasino = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `https://api.professor.monster/api/int/getIntCasinos?domainId=${domainId || ""}`
        );

        if (!isMounted) return;

        const data = (res.data || [])
          .filter((item) => item?.provider?.isAllowed !== false)
          .filter(
            (item) => !lockedProviders.has(item?.provider?.name?.toLowerCase())
          )
          .map((item) => ({
            ...item,
            provider: {
              ...item.provider,
              gameList: item.provider?.gameList?.filter((game) => {
                if (game.gameId?.startsWith("DMD")) return false;
                const gid = normalizeGameId(game.gameId);
                return !lockedGameIds.has(gid);
              }),
            },
          }))
          .filter((item) => item.provider?.gameList?.length > 0);

        setGameData(data);
      } catch (error) {
        console.error("Casino API failed:", error);
        toast.error("Casino API failed to load");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCasino();
    return () => {
      isMounted = false;
    };
  }, [domainId, lockedProviders, lockedGameIds]);

  // Filter games from real API response
  const filteredGames = useMemo(() => {
    const activeProv = activeProvider.toLowerCase();

    return gameData
      .flatMap((p) =>
        (p.provider?.gameList || []).map((g) => ({
          ...g,
          providerName: p.provider?.name || "Unknown",
        }))
      )
      .filter((game) => {
        const provName = game.providerName.toLowerCase();
        const category = (game.category || "").toLowerCase();
        const gameName = (game.name || "").toLowerCase();

        // 1. Provider Matching
        if (activeProv !== "all") {
          if (activeProv === "aura") {
            const isAuraGame =
              provName.includes("diamond") ||
              provName.includes("aura") ||
              category.includes("teen_patti") ||
              category.includes("baccarat_dragon_tiger") ||
              category.includes("tablegame") ||
              [
                "teen patti",
                "teenpatti",
                "dragon tiger",
                "andar bahar",
                "32 cards",
                "7 up",
                "lucky 7",
                "amar akbar",
                "muflis",
                "roulette",
                "baccarat",
                "poker",
                "matka",
                "worli",
              ].some((k) => gameName.includes(k));
            if (!isAuraGame) return false;
          } else if (activeProv === "slot") {
            if (!category.includes("slot")) return false;
          } else if (activeProv === "mac88") {
            if (!provName.includes("mac88") && !category.includes("mac88")) return false;
          } else if (activeProv.includes("turbo")) {
            if (!provName.includes("turbo") && !provName.includes("spribe") && !provName.includes("smartsoft"))
              return false;
          } else if (activeProv.includes("evolution")) {
            if (!provName.includes("evolution")) return false;
          } else if (activeProv.includes("big time") || activeProv === "btg") {
            if (!provName.includes("btg") && !provName.includes("bigtime") && !provName.includes("kingmidas"))
              return false;
          } else if (activeProv.includes("betgames")) {
            if (!provName.includes("betgames") && !provName.includes("kingmidas")) return false;
          } else if (activeProv.includes("royal")) {
            if (!provName.includes("royal") && !provName.includes("kingmidas")) return false;
          } else if (activeProv.includes("sa gaming") || activeProv === "sagaming") {
            if (!provName.includes("sagaming") && !provName.includes("sa gaming")) return false;
          } else if (activeProv.includes("vivo")) {
            if (!provName.includes("vivo")) return false;
          } else if (activeProv.includes("evoplay")) {
            if (!provName.includes("evoplay")) return false;
          } else if (activeProv.includes("ezugi")) {
            if (!provName.includes("ezugi")) return false;
          } else {
            if (!provName.includes(activeProv) && !activeProv.includes(provName)) return false;
          }
        }

        // 2. Tab Matching
        if (tab === "slots" && !category.includes("slot")) return false;
        if (tab === "live" && !category.includes("live")) return false;
        if (tab === "crash") {
          const isCrash =
            category.includes("crash") ||
            category.includes("instantwin") ||
            ["aviator", "crash", "mines", "balloon", "double roll", "limbo"].some((k) => gameName.includes(k));
          if (!isCrash) return false;
        }
        if (tab === "table" || tab === "cards" || tab === "ace") {
          const isCardOrTable =
            category.includes("table") ||
            category.includes("blackjack") ||
            category.includes("roulette") ||
            category.includes("poker") ||
            category.includes("teen_patti") ||
            category.includes("baccarat");
          if (!isCardOrTable) return false;
        }
        if (tab === "fishing" && !category.includes("fish") && !gameName.includes("fish")) return false;

        // 3. Category Filter
        if (activeCategory !== "All") {
          if (!category.includes(activeCategory.toLowerCase())) return false;
        }

        // 4. Search Filter
        if (
          search &&
          !gameName.includes(search.toLowerCase()) &&
          !provName.includes(search.toLowerCase())
        ) {
          return false;
        }

        return true;
      });
  }, [gameData, activeProvider, activeCategory, tab, search]);

  // Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 250
      ) {
        setVisibleCount((prev) => prev + 24);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleGames = filteredGames.slice(0, visibleCount);

  // Get image from API game
  const getGameImage = (game) => {
    return (
      game.images?.find((img) => img.type === "banner" || img.type === "portrait")?.url ||
      game.images?.[0]?.url ||
      game.imageUrl ||
      "/placeholder.svg"
    );
  };

  // Open Notice Modal On Game Click
  const handlePlayClick = (game) => {
    const loggedIn = isLoggedIn || isUserLoggedIn();

    if (!loggedIn) {
      openLoginModal();
      return;
    }

    setSelectedGameForNotice(game);
  };

  // Launch Game After Agreement
  const launchCasinoGame = async (game) => {
    if (!game || isProcessing) return;

    setIsProcessing(true);
    const gameId = game.gameId || game._id || game.id;
    const isRealUser = isLoggedIn && loginType === "real";

    // Demo user check
    if (loginType === "" || loginType === "demo") {
      toast.error("Please login with real ID to play casino games");
      setIsProcessing(false);
      setSelectedGameForNotice(null);
      return;
    }

    if (isRealUser) {
      let amount = (userData?.availableBalance || 0) - (userData?.exposure || 0);
      let siteCasinoBalance = siteCasinoData?.casinoBalance || 0;
      let finalAmountToDeduct = Math.min(Math.max(amount, 0), siteCasinoBalance);

      if (
        finalAmountToDeduct === 0 &&
        (!userData?.casinoBalance || userData?.casinoBalance <= 0)
      ) {
        toast.warning("Insufficient balance");
        setIsProcessing(false);
        setSelectedGameForNotice(null);
        return;
      }

      try {
        const response = await updateCasinoBalance({
          CasinoBalance: finalAmountToDeduct,
        });

        if (response?.data?.user) {
          dispatch(updateAvailableBalance(response.data.user.availableBalance));
          dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
        }
      } catch (error) {
        console.error("Balance update note:", error.response?.data?.message || error.message);
      }
    }

    const data = {
      gameId: gameId,
      playerId: userData?._id || "",
      displayName: userData?.casinoDisplayName || userData?.userName || "",
      currency: "INR",
      country: "IN",
      gender: "M",
      birthDate: "1996-10-12",
      mode: isLoggedIn ? "real" : "demo",
      device: isMobile ? "mobile" : "desktop",
      returnUrl: window.location.href,
      walletSessionId: userData?.sessionToken || localStorage.getItem("token") || "",
    };

    try {
      const res = await launcherUrl(data);
      if (res?.success && res?.data?.url) {
        const gameUrl = encodeURIComponent(res.data.url);
        setSelectedGameForNotice(null);
        navigate(`/game-lobby?gameId=${gameUrl}`);
      } else {
        toast.error(res?.message || "Failed to launch game.");
      }
    } catch (err) {
      console.error("Launcher error:", err);
      const errMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.code === "ACCOUNT_LOCKED"
          ? "Please login with real ID to play casino games"
          : "Game launch failed. Please try again.");
      toast.error(errMsg);
    } finally {
      setSelectedGameForNotice(null);
      setIsProcessing(false);
    }
  };

  const scrollGames = (direction) => {
    if (gridRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      gridRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const activeTitle = (activeProvider === "ALL" ? "CASINO" : activeProvider).toUpperCase();

  return (
    <div className="flex items-start justify-start w-full">
      <div
        className="w-full md:mt-[0px] lg:overflow-auto mb-5"
        style={{ minHeight: "calc(100dvh - 110px)" }}
      >
        <div className="w-full h-full px-2">
          {/* Top Provider Bar (Exact HTML Structure from Prompt) */}
          <div className="w-full pb-1 bg-headerBg_casino mb-2 mt-1">
            <div className="flex items-center p-2 md:p-3 justify-between w-full overflow-x-auto gap-[3px] mt-2 text-center">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 w-full">
                {TOP_PROVIDERS.map((provider) => {
                  const isSelected = activeProvider.toLowerCase() === provider.name.toLowerCase();
                  const logoUrl = getProviderLogo(provider.name) || provider.logo;

                  return (
                    <button
                      key={provider.name}
                      className={`relative overflow-hidden w-full aspect-[2.27] rounded-md inline-block active:scale-95 transition-all duration-100 ease-in-out bg-[#f3f4f6] shadow-md md:min-w-[200px] cursor-pointer ${
                        isSelected ? "ring-2 ring-[#c10831]" : ""
                      }`}
                      type="button"
                      title={provider.name}
                      onClick={() => {
                        setActiveProvider(isSelected ? "ALL" : provider.name);
                        setActiveCategory("All");
                      }}
                    >
                      <img
                        src={logoUrl}
                        onError={(e) => {
                          if (provider.fallback && e.target.src !== provider.fallback) {
                            e.target.src = provider.fallback;
                          }
                        }}
                        className="w-[75%] max-h-[75%] [@supports(-webkit-touch-callout:none)]:h-full m-auto object-contain"
                        alt={provider.name}
                        loading="lazy"
                        title={provider.name}
                        style={provider.invert ? { filter: "invert(1)" } : undefined}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-0 pl-2 h-full flex items-center justify-center pointer-events-none">
              <svg
                fill="#999"
                className="absolute top-1/2 left-3 -translate-y-1/2"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21.71,20.29,18,16.61A9,9,0,1,0,16.61,18l3.68,3.68a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,20.29ZM11,18a7,7,0,1,1,7-7A7,7,0,0,1,11,18Z"></path>
              </svg>
            </div>
            <div className="px-[0.1rem] p-0.5 h-fit">
              <input
                id="default-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                placeholder="Search Games (At least 3 chars...)"
                className="block w-full focus:outline-none rounded-2 p-2 pl-8 text-sm bg-bg_Quaternary text-text_Ternary"
              />
            </div>
          </div>
        </div>

        {/* Category Header & Games Grid */}
        <div className="bg-transparent w-full h-full px-[6px] mt-4">
          <div className="flex flex-wrap items-center mt-2 mb-2 justify-between gap-[5px] self-stretch text-text_Quaternary">
            <div className="flex items-center gap-2 px-1">
              <span className="font-lato text-text_Ternary font-extrabold tracking-[0.3px] text-sm md:text-base lg:text-lg capitalize leading-[18px]">
                {activeTitle}
              </span>
              {filteredGames.length > 0 && (
                <span className="text-xs text-text_Quaternary font-semibold">
                  ({filteredGames.length})
                </span>
              )}
            </div>
            <div className="flex w-[108.75px] items-center justify-end gap-[5px]">
              <button
                className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out font-lato bg-bg_text_brand_secondary text-transparent bg-clip-text font-semibold text-[12px] leading-[18px] transition-all ease-in-out duration-200 cursor-pointer"
                type="button"
                onClick={() => {
                  setActiveProvider("ALL");
                  setActiveCategory("All");
                  setSearch("");
                }}
              >
                See All
              </button>
              <button
                onClick={() => scrollGames("left")}
                className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[22px] h-[22px] p-1 justify-center items-center gap-[10px] text-text_Primary border bg-bg_Foundation rounded cursor-pointer"
                type="button"
                title="Previous"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="var(--color-primary)"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M15 6l-6 6l6 6"></path>
                </svg>
              </button>
              <button
                onClick={() => scrollGames("right")}
                className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[22px] h-[22px] p-1 justify-center items-center gap-[10px] text-text_Primary border bg-bg_Foundation rounded cursor-pointer"
                type="button"
                title="Next"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="var(--color-primary)"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M9 6l6 6l-6 6"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Real API Games Grid */}
          {isLoading ? (
            <div className="w-full mt-2 grid gap-x-2 gap-y-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 2xl:grid-cols-10">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="rounded-[8px] w-full aspect-[3/4] bg-[#2a2a2a]" />
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={gridRef}
              className="w-full mt-2 grid gap-x-2 gap-y-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 2xl:grid-cols-10"
            >
              {visibleGames.length > 0 ? (
                visibleGames.map((game, idx) => (
                  <div
                    key={game.gameId || game._id || idx}
                    className="relative"
                    onClick={() => handlePlayClick(game)}
                  >
                    <div className="w-full flex flex-col bg-bg_Quaternary1 items-start justify-center shadow-GameShadow rounded-[6px]">
                      <div className="relative rounded-[8px] w-full aspect-[3/4] overflow-hidden cursor-pointer shadow-sm md:hover:shadow-md group">
                        <img
                          src={getGameImage(game)}
                          alt={game.name}
                          loading="lazy"
                          className="w-full h-full object-cover transform transition-transform duration-500 ease-in-out hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 rounded-full bg-[#c10831] text-white flex items-center justify-center shadow-lg">
                            <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-text_Ternary text-sm">
                  No games found {activeProvider !== "ALL" ? `for "${activeProvider}"` : ""}.
                </div>
              )}
            </div>
          )}
        </div>

        {/* SEO Guide Accordion (Exact Text from Prompt) */}
        <article className="mt-6">
          <div className="px-[6px]">
            <article>
              <div className="w-full bg-bg_Quaternary rounded-md flex items-center justify-center">
                <h1
                  onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                  className="text-md p-[12px] font-normal w-full bg-bg_Quaternary flex items-center justify-between rounded-sm cursor-pointer select-none"
                >
                  <span className="font-lato text-[14px] text-text_Ternary">
                    KUBERBOOK666.ONLINE: Online Real Money Casino Game In India
                  </span>
                  <span
                    className={`flex items-center ml-[8px] transition-transform duration-300 ${
                      isAccordionOpen ? "rotate-0" : "-rotate-180"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      transform="rotate(180)"
                      viewBox="0 0 512 512"
                      height="12"
                      width="12"
                      fill="var(--color-ternary)"
                    >
                      <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
                    </svg>
                  </span>
                </h1>
              </div>

              <div
                className={`transition-all duration-300 w-full bg-bg_Quaternary rounded-sm flex flex-col overflow-hidden ${
                  isAccordionOpen ? "max-h-[5000px] opacity-100 py-3" : "max-h-0 opacity-0"
                }`}
                style={{ visibility: isAccordionOpen ? "visible" : "hidden" }}
              >
                <div>
                  <div className="mb-[8px] p-[12px]">
                    <h2 className="bg-bg_Quaternary font-bold font-lato text-[14px] text-text_Ternary">
                      Guide to Live Casino Games in India
                    </h2>
                    <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                      Welcome to the glamourous world of casino games online! If you are in India and looking to experience that thrilling wave a casino unfolds from within the comfort of your home, then you have come to the right place. In KUBERBOOK666.ONLINE, we take pride in being one of the best online casino sites with the most versatile character of casino games online available in India. Now, let us look into this exciting virtual world of fun and see just why KUBERBOOK666.ONLINE has long been the place for online gambling.
                    </p>
                  </div>

                  <div className="mb-[8px] p-[12px]">
                    <h2 className="bg-bg_Quaternary font-bold font-lato text-[14px] text-text_Ternary">
                      Why Choose KUBERBOOK666.ONLINE for Online Casino Games India?
                    </h2>
                    <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                      KUBERBOOK666.ONLINE is a very remarkable online casino and, in many ways, quite different from anything out there. For instance, there are a huge number of online casinos. That is why a growing number of Indian gamers make a choice in favor of our company:
                    </p>
                    <div className="mb-[8px]">
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                        1. A Wide Variety of Games Are Available for Your Selection: We provide every conceivable kind of game, from the most classic table games to the most preferred slot machines, and everything that&apos;s in between.
                      </p>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                        2. Interface User-Friendly: Our platform is user-friendly and easy to use with all the users, but more so for beginners.
                      </p>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                        3. Next-generation Security: Our system secures all your data with the latest encryption technology available on the market, as it uses the most advanced encryption technology available.
                      </p>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                        4. Increased in Size: Receiving welcome offers and ongoing incentives that are tailored specifically for players from India is one of the bonuses that are available.
                      </p>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                        5. As a Result of the Support for Several Languages: The game can be played in Hindi, English, or any other regional language.
                      </p>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                        6. 24/7 Customer Support: Our experts will be there to assist you at any moment of the day or night, regardless of the time of day or night.
                      </p>
                    </div>
                  </div>

                  <div className="mb-[8px] p-[12px]">
                    <h2 className="bg-bg_Quaternary font-bold font-lato text-[14px] text-text_Ternary">
                      Getting Started with KUBERBOOK666.ONLINE
                    </h2>
                    <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                      Are you looking forward to taking up online casino games in India? Here are a few steps to getting started with KUBERBOOK666.ONLINE:
                    </p>
                    <div className="mb-[8px]">
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">1. Go to our website, then click the &quot;Sign Up&quot; button.</p>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">2. Fill in the personal details and verify your profile.</p>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">3. Make your first deposit using one of our secure cashier methods.</p>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">4. Claim your welcome bonus.</p>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">5. Start exploring our vast selection of games!</p>
                    </div>
                  </div>

                  <div className="mb-[8px] p-[12px]">
                    <h2 className="bg-bg_Quaternary font-bold font-lato text-[14px] text-text_Ternary">
                      Popular Casino Games at KUBERBOOK666.ONLINE
                    </h2>
                    <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                      From India&apos;s makeup of online casino games India, KUBERBOOK666.ONLINE offers a variety. Let us now see some of the most popular and how they are played:
                    </p>
                    <div className="mb-[8px]">
                      <h3 className="bg-bg_Quaternary font-bold font-lato text-[14px] text-text_Ternary">
                        Slots: The Crown Jewel of Online Casinos
                      </h3>
                      <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                        The slot machines are called the heartbeat of any casinos; thus, KUBERBOOK666.ONLINE has placed a huge bundle of online slots. From classic 3-reel slots to modern-day 5-reel video slots with hundreds of paylines, we have all of those.
                      </p>
                    </div>
                  </div>

                  <div className="mb-[8px] p-[12px]">
                    <h2 className="bg-bg_Quaternary font-bold font-lato text-[14px] text-text_Ternary">
                      Live Casino: The Best from Online Gaming
                    </h2>
                    <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                      If one is looking for an even higher level of interaction, KUBERBOOK666.ONLINE provides a platform to play live casino online. We offer live casino games with live dealers who are videotaped in high definition. This therefore ensures that you can play against the real dealer and with the other players in real-time.
                    </p>
                  </div>

                  <div className="mb-[8px] p-[12px]">
                    <h2 className="bg-bg_Quaternary font-bold font-lato text-[14px] text-text_Ternary">
                      Responsible Gaming at KUBERBOOK666.ONLINE
                    </h2>
                    <p className="bg-bg_Quaternary font-normal font-lato text-[12px] text-text_Ternary">
                      While online casino games provide lots of real fun, it is important to practice responsible gaming. KUBERBOOK666.ONLINE is committed to promoting safe and responsible gaming.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </article>
      </div>

      {/* PLEASE NOTE (1 Point = ₹10) Modal */}
      <CasinoPointNoticeModal
        isOpen={Boolean(selectedGameForNotice)}
        onClose={() => setSelectedGameForNotice(null)}
        onAgree={() => launchCasinoGame(selectedGameForNotice)}
        loading={isProcessing}
        chipValue="1 Point = ₹10"
      />
    </div>
  );
}

CasinoPage.propTypes = {
  tab: PropTypes.string,
};
