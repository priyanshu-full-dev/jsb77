import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Heart,
  Search,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  getGameSections,
  launcherUrl,
  updateCasinoBalance,
} from "../../../api";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../../redux/slices/userSlice";
import {
  generatePresignedUrl,
  formatS3PathStyle,
} from "../../../utils/helper/generatePresignedUrl";

// ============================================================
// CACHE
// ============================================================
const GAME_SECTIONS_CACHE_KEY = "raftaar_game_sections_cache_v1";
const GAME_SECTIONS_CACHE_TTL = 5 * 60 * 1000;
const S3_HOST = "storag-igambli.com.s3.ap-southeast-1.amazonaws.com";

// ============================================================
// HELPERS
// ============================================================
const isS3Image = (url) => {
  return (
    typeof url === "string" &&
    (url.includes(S3_HOST) ||
      url.includes("storag-igambli") ||
      url.includes("amazonaws.com"))
  );
};

const formatTitle = (gameId = "") => {
  return String(gameId)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeName = (value = "") => {
  try {
    return decodeURIComponent(String(value)).trim().toLowerCase();
  } catch {
    return String(value).trim().toLowerCase();
  }
};

// ============================================================
// MEMORY CACHE
// ============================================================
let gameSectionsMemoryCache = null;
let gameSectionsPromise = null;

// ============================================================
// LOCAL STORAGE CACHE
// ============================================================
const readGameSectionsCache = () => {
  try {
    const raw = localStorage.getItem(GAME_SECTIONS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed?.data || !Array.isArray(parsed.data)) {
      localStorage.removeItem(GAME_SECTIONS_CACHE_KEY);
      return null;
    }

    parsed.data = parsed.data.map((section) => ({
      ...section,
      icon: formatS3PathStyle(section?.icon),
      games: Array.isArray(section?.games)
        ? section.games.map((g) => ({
            ...g,
            image: formatS3PathStyle(g?.image),
          }))
        : section?.games,
    }));

    return parsed;
  } catch (error) {
    console.error("Failed to read game sections cache:", error);
    return null;
  }
};

const writeGameSectionsCache = (data) => {
  try {
    localStorage.setItem(
      GAME_SECTIONS_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch (error) {
    console.error("Failed to write game sections cache:", error);
  }
};

// ============================================================
// RESOLVE IMAGES
// ============================================================
const resolveGameSections = async (rawSections = []) => {
  return Promise.all(
    rawSections.map(async (section) => {
      let resolvedIcon = section?.icon || null;

      if (resolvedIcon && isS3Image(resolvedIcon)) {
        try {
          resolvedIcon = await generatePresignedUrl(resolvedIcon);
        } catch (error) {
          console.error("Section icon presign error:", section?.title, error);
          resolvedIcon = section?.icon || null;
        }
      }

      const games = await Promise.all(
        (Array.isArray(section?.games) ? section.games : []).map(
          async (game) => {
            let resolvedImage = game?.image || null;

            if (resolvedImage && isS3Image(resolvedImage)) {
              try {
                resolvedImage = await generatePresignedUrl(resolvedImage);
              } catch (error) {
                console.error(
                  "Game image presign error:",
                  game?.gameId,
                  error
                );
                resolvedImage = game?.image || null;
              }
            }

            return {
              ...game,
              _id: game?._id || game?.gameId,
              gameId: game?.gameId || "",
              gameName:
                game?.gameName ||
                game?.title ||
                game?.name ||
                formatTitle(game?.gameId),
              title:
                game?.gameName ||
                game?.title ||
                game?.name ||
                formatTitle(game?.gameId),
              image: resolvedImage,
            };
          }
        )
      );

      return {
        _id: section?._id,
        title: section?.title || "",
        icon: resolvedIcon,
        games,
      };
    })
  );
};

// ============================================================
// FETCH GAME SECTIONS
// ============================================================
const fetchGameSectionsCached = async () => {
  if (gameSectionsPromise) {
    return gameSectionsPromise;
  }

  gameSectionsPromise = (async () => {
    const response = await getGameSections();
    const rawSections = response?.data?.data || [];

    if (!Array.isArray(rawSections)) {
      return [];
    }

    const resolvedSections = await resolveGameSections(rawSections);

    gameSectionsMemoryCache = {
      timestamp: Date.now(),
      data: resolvedSections,
    };

    writeGameSectionsCache(resolvedSections);

    return resolvedSections;
  })();

  try {
    return await gameSectionsPromise;
  } finally {
    gameSectionsPromise = null;
  }
};

// ============================================================
// GAME CARD
// ============================================================
const GameCard = ({
  game,
  onClick,
  isFavorite,
  onFavorite,
  isRecentlyPlayed = false,
}) => {
  const gameId = game?.gameId;

  const title =
    game?.gameName ||
    game?.title ||
    game?.name ||
    formatTitle(gameId);

  return (
    <div className="flex flex-col items-center flex-shrink-0  snap-start">
      <div
        onClick={() => onClick && onClick(game)}
        className="
          group relative  overflow-hidden rounded-[14px]
          bg-[#0b192d] border border-white/[0.08]
          shadow-[0_6px_18px_rgba(0,0,0,0.45)]
          cursor-pointer select-none
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.55)]
          active:scale-[0.94] active:translate-y-0
        "
      >
        <div
          className={`relative w-full overflow-hidden ${
            isRecentlyPlayed ? "h-[120px]" : "h-[150px]"
          }`}
        >
          {game?.image ? (
            <img
              src={formatS3PathStyle(game.image)}
              loading="lazy"
              decoding="async"
              draggable="false"
              alt={title}
              className="
                w-full h-full object-cover
                transition-all duration-500 ease-out
                group-hover:scale-[1.08] group-active:scale-[1.03]
              "
            />
          ) : (
            <div className="w-full h-full bg-[#0f2544] animate-pulse" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute inset-y-0 -left-[80%] w-[45%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/[0.18] to-transparent pointer-events-none group-hover:left-[130%] transition-all duration-700 ease-out" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="
              flex items-center justify-center w-[43px] h-[43px] rounded-full
              bg-black/45 backdrop-blur-md border border-white/[0.18]
              shadow-[0_5px_18px_rgba(0,0,0,0.45)]
              opacity-0 scale-75
              group-hover:opacity-100 group-hover:scale-100 group-active:scale-90
              transition-all duration-300 ease-out
            ">
              <span className="ml-[3px] w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[11px] border-l-white" />
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onFavorite) onFavorite(gameId);
            }}
            className="
              absolute top-2 right-2 z-20 flex items-center justify-center
              w-[28px] h-[28px] rounded-full
              bg-black/45 backdrop-blur-md border border-white/[0.12]
              shadow-[0_3px_10px_rgba(0,0,0,0.35)]
              active:scale-75 hover:bg-black/65 transition-all duration-200
            "
          >
            <Heart
              size={14}
              strokeWidth={2}
              className={
                isFavorite
                  ? "text-red-500 fill-red-500"
                  : "text-white/90"
              }
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>

          <div className="
            absolute bottom-2 left-0 right-0 flex justify-center
            pointer-events-none opacity-0 translate-y-2
            group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-300
          ">
            <span className="
              px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md
              border border-white/[0.10] text-white text-[9px]
              font-bold font-sans tracking-wide
            ">
              PLAY NOW
            </span>
          </div>
        </div>
      </div>

      <p
        className="
          mt-1.5 w-[115px] px-1 text-center text-[#d7dce4]
          text-[10px] font-bold font-sans leading-tight truncate
        "
        title={title}
      >
        {title}
      </p>
    </div>
  );
};

// ============================================================
// MAIN
// ============================================================
const RafCasinoSection = () => {
  const navigate = useNavigate();
  const { sectionTitle } = useParams();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const loginType = useSelector((state) => state?.user?.loggedInType);
  const userData = useSelector((state) => state?.user?.userData);
  const siteCasinoData = useSelector((state) => state?.siteCasino);

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const categoryRefs = useRef({});

  // ==========================================================
  // FAVORITES
  // ==========================================================
  const favoriteStorageKey = useMemo(() => {
    return userData?._id
      ? `raftaar_fav_${userData._id}`
      : "raftaar_favorite_games";
  }, [userData?._id]);

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(favoriteStorageKey);
      if (!saved) {
        setFavorites([]);
        return;
      }
      const parsed = JSON.parse(saved);
      setFavorites(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error("Favorite load error:", error);
      setFavorites([]);
    }
  }, [favoriteStorageKey]);

  const toggleFavorite = useCallback(
    (gameId) => {
      if (!gameId) return;

      setFavorites((previous) => {
        const updated = previous.includes(gameId)
          ? previous.filter((id) => id !== gameId)
          : [...previous, gameId];

        try {
          localStorage.setItem(
            favoriteStorageKey,
            JSON.stringify(updated)
          );
        } catch (error) {
          console.error("Favorite save error:", error);
        }

        return updated;
      });
    },
    [favoriteStorageKey]
  );

  // ==========================================================
  // LOAD SECTIONS
  // ==========================================================
  const loadSections = useCallback(async () => {
    // MEMORY CACHE
    if (
      gameSectionsMemoryCache?.data &&
      Array.isArray(gameSectionsMemoryCache.data)
    ) {
      setSections(gameSectionsMemoryCache.data);

      const age =
        Date.now() - Number(gameSectionsMemoryCache.timestamp || 0);

      if (age < GAME_SECTIONS_CACHE_TTL) {
        setLoading(false);
        return;
      }

      try {
        setRefreshing(true);
        const fresh = await fetchGameSectionsCached();
        if (Array.isArray(fresh)) setSections(fresh);
      } catch (error) {
        console.error("Memory background refresh error:", error);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
      return;
    }

    // LOCAL STORAGE CACHE
    const cached = readGameSectionsCache();

    if (cached?.data && Array.isArray(cached.data)) {
      gameSectionsMemoryCache = cached;
      setSections(cached.data);

      const age = Date.now() - Number(cached.timestamp || 0);

      if (age < GAME_SECTIONS_CACHE_TTL) {
        setLoading(false);
        return;
      }

      try {
        setRefreshing(true);
        const fresh = await fetchGameSectionsCached();
        if (Array.isArray(fresh)) setSections(fresh);
      } catch (error) {
        console.error("Cache background refresh error:", error);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
      return;
    }

    // API
    try {
      setLoading(true);
      const fresh = await fetchGameSectionsCached();
      if (Array.isArray(fresh)) setSections(fresh);
    } catch (error) {
      console.error("getGameSections error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load games"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  // ==========================================================
  // CATEGORIES
  // ==========================================================
  const categories = useMemo(() => {
    const result = [
      {
        title: "All",
        image:
          sections?.[0]?.icon ||
          sections?.[0]?.games?.[0]?.image ||
          null,
      },
    ];

    const seen = new Set(["all"]);

    sections.forEach((section) => {
      const title = String(section?.title || "").trim();
      if (!title) return;

      const key = normalizeName(title);
      if (seen.has(key)) return;

      seen.add(key);

      result.push({
        title,
        image: section?.icon || section?.games?.[0]?.image || null,
      });
    });

    return result;
  }, [sections]);

  // ==========================================================
  // CURRENT PARAM
  // ==========================================================
  const currentParam = useMemo(() => {
    if (!sectionTitle) return "All";

    try {
      return decodeURIComponent(sectionTitle);
    } catch {
      return sectionTitle;
    }
  }, [sectionTitle]);

  // ==========================================================
  // CURRENT SECTION
  // ==========================================================
  const currentSection = useMemo(() => {
    if (!currentParam || normalizeName(currentParam) === "all") {
      return null;
    }

    const target = normalizeName(currentParam);

    return (
      sections.find(
        (section) => normalizeName(section?.title) === target
      ) || null
    );
  }, [sections, currentParam]);

  // ==========================================================
  // GAMES
  // ==========================================================
  const games = useMemo(() => {
    if (normalizeName(currentParam) === "all") {
      const allGames = [];

      sections.forEach((section) => {
        if (!Array.isArray(section?.games)) return;

        section.games.forEach((game) => {
          if (!game?.gameId) return;

          const alreadyExists = allGames.some(
            (item) => item?.gameId === game?.gameId
          );

          if (!alreadyExists) {
            allGames.push(game);
          }
        });
      });

      return allGames;
    }

    if (!currentSection || !Array.isArray(currentSection?.games)) {
      return [];
    }

    return currentSection.games;
  }, [sections, currentParam, currentSection]);

  // ==========================================================
  // SEARCH FILTER
  // ==========================================================
  const filteredGames = useMemo(() => {
    let result = [...games];
    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((game) => {
        const name =
          game?.gameName || game?.title || game?.name || "";
        const gameId = game?.gameId || "";

        return (
          String(name).toLowerCase().includes(searchValue) ||
          String(gameId).toLowerCase().includes(searchValue)
        );
      });
    }

    return result;
  }, [games, search]);

  // ==========================================================
  // CATEGORY CLICK
  // ==========================================================
  const handleCategoryClick = useCallback(
    (category) => {
      const categoryName =
        typeof category === "string" ? category : category?.title;

      if (!categoryName) return;

      const key = normalizeName(categoryName);
      const element = categoryRefs.current[key];

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }

      if (key === "all") {
        navigate("/casino-section/All");
        return;
      }

      navigate(
        `/casino-section/${encodeURIComponent(categoryName)}`
      );
    },
    [navigate]
  );

  // Auto scroll active category into view
  useEffect(() => {
    if (loading || !categories.length) return;

    const key = normalizeName(currentParam);
    const element = categoryRefs.current[key];

    if (!element) return;

    const timer = setTimeout(() => {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [currentParam, categories, loading]);

  // ==========================================================
  // PLAY GAME
  // ==========================================================
  const handlePlayClick = useCallback(
    async (game) => {
      if (isProcessing) return;

      const gameId = game?.gameId;

      if (!gameId || gameId === "#") {
        toast.error("Game is not available");
        return;
      }

      if (loginType === "") {
        navigate("/login");
        return;
      }

      if (loginType === "demo") {
        toast.error("Login with real ID");
        return;
      }

      try {
        setIsProcessing(true);

        const availableBalance = Number(
          userData?.availableBalance || 0
        );
        const exposure = Number(userData?.exposure || 0);
        const available = Math.max(0, availableBalance - exposure);

        const casinoBalance = Number(
          siteCasinoData?.CasinoBalance ??
            siteCasinoData?.casinoBalance ??
            0
        );

        const finalAmountToDeduct = Math.min(available, casinoBalance);

        if (finalAmountToDeduct <= 0 && casinoBalance <= 0) {
          toast.error("Insufficient balance");
          return;
        }

        if (finalAmountToDeduct > 0) {
          try {
            await updateCasinoBalance({
              CasinoBalance: finalAmountToDeduct,
            });
          } catch (balanceError) {
            console.error("Casino balance update error:", balanceError);
          }
        }

        // Recent Played
        const recentKey = userData?._id
          ? `raftaar_recent_${userData._id}`
          : "raftaar_recent_played";

        try {
          const saved = localStorage.getItem(recentKey);
          const recent = saved ? JSON.parse(saved) : [];

          const recentGame = {
            gameId,
            title:
              game?.gameName ||
              game?.title ||
              game?.name ||
              formatTitle(gameId),
            image: game?.image || null,
          };

          const updated = [
            recentGame,
            ...recent.filter((item) => item?.gameId !== gameId),
          ].slice(0, 20);

          localStorage.setItem(recentKey, JSON.stringify(updated));
        } catch (recentError) {
          console.error("Recent game error:", recentError);
        }

        // Redux balance update
        if (finalAmountToDeduct > 0) {
          dispatch(
            updateAvailableBalance({
              availableBalance: Math.max(
                0,
                available - finalAmountToDeduct
              ),
            })
          );

          dispatch(
            updateUserCasinoBalance({
              CasinoBalance: Math.max(
                0,
                casinoBalance - finalAmountToDeduct
              ),
            })
          );
        }

        const isMobile = window.innerWidth <= 768;

        const payload = {
          gameId,
          playerId: userData?._id || "",
          displayName: userData?.casinoDisplayName || "",
          currency: "INR",
          country: "IN",
          gender: "M",
          birthDate: "1996-10-12",
          mode: isLoggedIn ? "real" : "demo",
          device: isMobile ? "mobile" : "desktop",
          returnUrl: window.location.href,
          walletSessionId: userData?.sessionToken || "",
        };

        const response = await launcherUrl(payload);

        if (response?.data?.url) {
          navigate(
            `/game-lobby?gameId=${encodeURIComponent(response.data.url)}`
          );
          return;
        }

        toast.error("Unable to launch game");
      } catch (error) {
        console.error("Game launch error:", error);
        toast.error(
          error?.response?.data?.message || "Unable to launch game"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      loginType,
      navigate,
      userData,
      siteCasinoData,
      dispatch,
      isLoggedIn,
    ]
  );

  // ==========================================================
  // PAGE TITLE
  // ==========================================================
  const pageTitle =
    normalizeName(currentParam) === "all"
      ? "All Games"
      : currentSection?.title || currentParam || "Casino";

  const handleBack = () => {
    navigate(-1);
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="min-h-screen bg-[#000a1e] text-white font-sans pb-24">
      <main className="px-2.5 pt-2.5 sm:px-4 sm:pt-4">
        {/* PAGE TITLE */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={handleBack}
            className="
              w-9 h-9 shrink-0 rounded-full bg-[#07162d]
              border border-[#1c3655] flex items-center justify-center
              active:scale-95
            "
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-[18px] sm:text-[20px] font-extrabold leading-tight truncate">
              {pageTitle}
            </h1>
            <p className="mt-0.5 text-[10px] text-[#7187a6]">
              {games.length} Games
              {refreshing && " • Updating..."}
            </p>
          </div>
        </div>

        {/* CATEGORY TABS */}
        {!loading && categories.length > 0 && (
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 mb-3"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {categories.map((category) => {
              const key = normalizeName(category.title);
              const active =
                key === normalizeName(currentParam);

              return (
                <button
                  key={category.title}
                  type="button"
                  ref={(el) => {
                    if (el) {
                      categoryRefs.current[key] = el;
                    }
                  }}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    shrink-0 h-9 px-4 rounded-full border text-[11px] font-bold
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[#3ee06a] text-[#06101f] border-[#3ee06a]"
                        : "bg-[#07162d] text-[#8ca3c1] border-[#1b3554]"
                    }
                  `}
                >
                  {category.title}
                </button>
              );
            })}
          </div>
        )}

        {/* SEARCH */}
        <div className="relative mb-3">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6f86a5]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search games..."
            className="
              w-full h-11 rounded-[11px] bg-[#07162d]
              border border-[#1b3554] pl-10 pr-10
              text-[13px] text-white outline-none
              placeholder:text-[#637998] focus:border-[#3ee06a]
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                w-7 h-7 rounded-full flex items-center justify-center
                text-[#7890ae]
              "
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* RESULT COUNT */}
        {!loading && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold">{pageTitle}</span>
            <span className="text-[10px] text-[#6f86a5]">
              {filteredGames.length} Games
            </span>
          </div>
        )}

        {/* LOADING / GAMES */}
        {loading ? (
          <div className="flex items-start gap-3 overflow-hidden pb-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="w-[122px] shrink-0 animate-pulse">
                <div className="w-[115px] h-[115px] rounded-[12px] bg-[#07162d] border border-[#122943]" />
                <div className="h-3 w-[90px] mx-auto mt-2 rounded bg-[#07162d]" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredGames.length > 0 ? (
              <div
                className="
                  grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5
                  lg:grid-cols-6 xl:grid-cols-7
                  gap-x-2 gap-y-5 justify-items-start
                "
              >
                {filteredGames.map((game, index) => (
                  <GameCard
                    key={game?._id || game?.gameId || index}
                    game={game}
                    onClick={handlePlayClick}
                    isFavorite={favorites.includes(game?.gameId)}
                    onFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#07162d] border border-[#1b3554] flex items-center justify-center mb-3">
                  <Search size={23} className="text-[#58718f]" />
                </div>
                <div className="text-[14px] font-bold">No games found</div>
                <div className="mt-1 text-[11px] text-[#6f86a5]">
                  Try another search
                </div>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="
                      mt-4 h-9 px-5 rounded-full bg-[#3ee06a]
                      text-[#06101f] text-[11px] font-bold
                    "
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* LAUNCHING OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-[14px] bg-[#07162d] border border-[#254463] px-5 py-4">
            <div className="w-5 h-5 rounded-full border-2 border-[#3ee06a] border-t-transparent animate-spin" />
            <span className="text-[12px] font-bold">
              Launching game...
            </span>
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RafCasinoSection;