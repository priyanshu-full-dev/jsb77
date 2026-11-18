import React, { useEffect, useState, useMemo, useCallback, memo } from "react";

import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import {
  ChevronRight,
  ChevronLeft,
  Heart,
  Search,
  Sparkles,
  Play,
} from "lucide-react";

import { isMobile } from "react-device-detect";

import {
  getGameSections,
  launcherUrl,
  updateCasinoBalance,
} from "../../../api";

import {
  generatePresignedUrl,
  formatS3PathStyle,
} from "../../../utils/helper/generatePresignedUrl";

import { selectSiteHeaderColor } from "../../../utils/helper/commonSelectors";

import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../../redux/slices/userSlice";

/* =========================================================
   CONFIG
========================================================= */

const S3_HOST = "storag-igambli.com.s3.ap-southeast-1.amazonaws.com";



const providerLogos = {
  spribe: "/providerLogo/Spribe.webp",
  ezugi: "/providerLogo/EzugiGaming.webp",
  sagaming: "/providerLogo/AESexy.webp",
  vivo: "/providerLogo/Vivo.webp",
  evolution: "/providerLogo/EvolutionGaming.webp",
  evoplay: "/providerLogo/evoplay.webp",
  jilli: "/providerLogo/jili.webp",
  turbogames: "/providerLogo/turbogames.webp",
  oddin: "/providerLogo/Oddin.webp",
};

const WHITE_LOGO_PROVIDERS = ["oddin", "turbogames", "evoplay"];

/* =========================================================
   CACHE
========================================================= */

const GAME_SECTIONS_CACHE_KEY = "raftaar_game_sections_cache_v2";

const GAME_SECTIONS_CACHE_TTL = 5 * 60 * 1000;

/* =========================================================
   HELPERS
========================================================= */

const formatTitle = (gameId = "") => {
  return String(gameId)
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .trim()
    .toUpperCase();
};

const normalizeName = (value = "") => {
  try {
    return decodeURIComponent(String(value)).trim().toLowerCase();
  } catch {
    return String(value).trim().toLowerCase();
  }
};

const isS3Image = (url = "") => {
  return (
    typeof url === "string" &&
    (url.includes(S3_HOST) ||
      url.includes("storag-igambli") ||
      url.includes("amazonaws.com"))
  );
};

/* =========================================================
   IMAGE URL
========================================================= */

/*
 * Handles BOTH image types:
 *
 * 1. S3 image
 *    -> generatePresignedUrl()
 *
 * 2. Normal/CDN/external image
 *    -> direct URL
 */
const resolveImageUrl = async (image) => {
  if (!image || typeof image !== "string") {
    return null;
  }

  if (isS3Image(image)) {
    try {
      const signedUrl = await generatePresignedUrl(image);

      return signedUrl || formatS3PathStyle(image);
    } catch (error) {
      console.error("S3 image presign error:", image, error);

      return formatS3PathStyle(image);
    }
  }

  return image;
};

/* =========================================================
   SECTION ICONS
========================================================= */

const FavouriteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="
      w-7
      h-7
      sm:w-8
      sm:h-8
    "
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const CrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="
      w-7
      h-7
      sm:w-8
      sm:h-8
    "
  >
    <path
      d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.79-1.81.79-1.81l-1.98-1.98s-1.1.08-1.81.79z"
      fill="currentColor"
      fillOpacity="0.15"
    />

    <path d="M15 8s-4 1.5-6 3.5l6 6c2-2 3.5-6 3.5-6s-1.5-1.5-3.5-3.5z" />

    <path d="M12 15l-3-3 6.5-6.5a4.95 4.95 0 0 1 7 7L16 19l-4-4z" />

    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

const LiveCasinoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="
      w-7
      h-7
      sm:w-8
      sm:h-8
    "
  >
    <path d="M6 9a4 4 0 0 1 8 0" />

    <path d="M4 9h12l1.5 2H2.5L4 9z" fill="currentColor" fillOpacity="0.15" />

    <circle cx="10" cy="11.5" r="2.5" />

    <path d="M4 19v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />

    <circle cx="16.5" cy="16.5" r="2.5" />

    <path d="M16.5 15v3M15 16.5h3" />
  </svg>
);

const ExclusiveIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="
      w-7
      h-7
      sm:w-8
      sm:h-8
    "
  >
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
    <path d="M11 3l-4 6 5 12 5-12-4-6" />
    <path d="M2 9h20" />
  </svg>
);

const SlotsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="
      w-7
      h-7
      sm:w-8
      sm:h-8
    "
  >
    <rect x="3" y="5" width="18" height="15" rx="2.5" />

    <path d="M7 5V3h10v2" />

    <rect x="5.5" y="8" width="13" height="6.5" rx="1.5" />

    <text
      x="12"
      y="13"
      textAnchor="middle"
      fill="currentColor"
      fontSize="5.5"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      777
    </text>

    <path d="M7 17.5h.01M12 17.5h.01M17 17.5h.01" strokeWidth="3" />
  </svg>
);

const RouletteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="
      w-7
      h-7
      sm:w-8
      sm:h-8
    "
  >
    <circle cx="12" cy="12" r="9" />

    <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />

    <circle cx="12" cy="12" r="1.5" fill="currentColor" />

    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
  </svg>
);

const DefaultSectionIcon = () => (
  <Sparkles
    className="
      w-7
      h-7
      text-white
    "
  />
);

/* =========================================================
   GET ICON FROM SECTION TITLE
========================================================= */

const getSectionIcon = (title = "") => {
  const name = String(title).toUpperCase();

  if (name.includes("CRASH")) {
    return CrashIcon;
  }

  if (name.includes("LIVE") || name.includes("CASINO")) {
    return LiveCasinoIcon;
  }

  if (name.includes("EXCLUSIVE")) {
    return ExclusiveIcon;
  }

  if (name.includes("SLOT")) {
    return SlotsIcon;
  }

  if (name.includes("ROULETTE")) {
    return RouletteIcon;
  }

  return DefaultSectionIcon;
};

/* =========================================================
   CACHE READ
========================================================= */

const readGameSectionsCache = () => {
  try {
    const raw = localStorage.getItem(GAME_SECTIONS_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed?.data || !Array.isArray(parsed.data)) {
      localStorage.removeItem(GAME_SECTIONS_CACHE_KEY);

      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Game sections cache read error:", error);

    return null;
  }
};

/* =========================================================
   CACHE WRITE
========================================================= */

const writeGameSectionsCache = (data) => {
  try {
    localStorage.setItem(
      GAME_SECTIONS_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    );
  } catch (error) {
    console.error("Game sections cache write error:", error);
  }
};

/* =========================================================
   RESOLVE API SECTIONS
========================================================= */

const resolveGameSections = async (rawSections = []) => {
  return Promise.all(
    rawSections.map(async (section) => {
      /*
       * SECTION ICON
       */

      let sectionIcon = section?.icon || null;

      sectionIcon = await resolveImageUrl(sectionIcon);

      /*
       * GAMES
       */

      const rawGames = Array.isArray(section?.games) ? section.games : [];

      const games = await Promise.all(
        rawGames.map(async (game) => {
          /*
           * Game image
           */

          let image =
            game?.image ||
            game?.imageUrl ||
            game?.thumbnail ||
            game?.logo ||
            game?.images?.[0]?.url ||
            null;

          /*
           * If logo-square exists,
           * prefer it.
           */

          const logoSquare = game?.images?.find(
            (img) => img?.type === "logo-square",
          )?.url;

          if (logoSquare) {
            image = logoSquare;
          }

          /*
           * S3 -> presigned
           * Normal -> direct
           */

          image = await resolveImageUrl(image);

          const gameId = game?.gameId || game?._id || game?.id || "";

          const gameName =
            game?.gameName || game?.title || game?.name || formatTitle(gameId);

          return {
            ...game,

            _id: game?._id || gameId,

            gameId,

            gameName,

            name: gameName,

            title: gameName,

            image,

            sectionTitle: section?.title || "",
          };
        }),
      );

      return {
        ...section,

        _id: section?._id,

        title: section?.title || section?.name || "",

        icon: sectionIcon,

        games,
      };
    }),
  );
};

/* =========================================================
   GAME CARD
   RECTANGULAR STYLE
========================================================= */
const GameCard = memo(({ game, isFavorite, onToggleFavorite, onPlay }) => {
  const gameId = game?.gameId || game?._id;

  const gameName = game?.gameName || game?.title || game?.name || "Game";

  return (
    <div
      className="
          flex-shrink-0
          flex
          flex-col
          items-center
        "
    >
      <div
        onClick={() => onPlay(game)}
        className="
            group
            relative
            h-[150px]
            overflow-hidden
            rounded-[14px]
            bg-[#0b192d]
            border
            border-white/[0.08]
            cursor-pointer
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-[#3ee06a]
            active:scale-[0.95]
          "
      >
        {/* IMAGE */}

        {game?.image ? (
          <img
            src={formatS3PathStyle(game.image)}
            alt={gameName}
            loading="lazy"
            decoding="async"
            draggable="false"
            className="
                w-full
                h-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-[1.07]
              "
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            className="
                absolute
                inset-0
                bg-[#10233d]
              "
          />
        )}

        {/* GRADIENT */}

        <div
          className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/75
              via-transparent
              to-black/10
              pointer-events-none
            "
        />

        {/* FAVOURITE */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();

            onToggleFavorite(gameId, e);
          }}
          className="
              absolute
              top-2
              right-2
              z-20
              w-7
              h-7
              rounded-full
              flex
              items-center
              justify-center
              bg-black/50
              backdrop-blur-md
              border
              border-white/10
            "
        >
          <Heart
            size={14}
            className={isFavorite ? "text-red-500 fill-red-500" : "text-white"}
          />
        </button>

        {/* PLAY */}

        <div
          className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              opacity-0
              group-hover:opacity-100
              transition-all
            "
        >
          <div
            className="
                w-11
                h-11
                rounded-full
                bg-black/55
                backdrop-blur-md
                border
                border-white/20
                flex
                items-center
                justify-center
              "
          >
            <Play size={17} fill="white" className="text-white ml-[2px]" />
          </div>
        </div>
      </div>

      {/* NAME */}

      <p
        className="
            mt-1.5
            w-[115px]
            text-center
            text-white
            text-[10px]
            font-bold
            truncate
          "
      >
        {gameName}
      </p>
    </div>
  );
});

/* =========================================================
   SECTION COMPONENT
========================================================= */

const GameSection = ({
  section,
  favorites,
  onToggleFavorite,
  onPlay,
  onViewAll,
}) => {
  const title = section?.title || "Games";

  const games = Array.isArray(section?.games) ? section.games : [];

  if (!games.length) {
    return null;
  }

  const Icon = getSectionIcon(title);

  return (
    <div className="mb-7">
      {/* =========================================
          SECTION HEADER
      ========================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          mb-3
          px-1
        "
      >
        <button
          type="button"
          onClick={onViewAll}
          className="
            flex
            items-center
            gap-2.5
            min-w-0
          "
        >
          {/* SECTION ICON */}

          <span
            className="
              flex
              items-center
              justify-center
              w-[34px]
              h-[34px]
              shrink-0
              rounded-[11px]
              bg-gradient-to-br
              from-[#18263b]
              to-[#0c1728]
              border
              border-white/[0.08]
            "
          >
            {section?.icon ? (
              <img
                src={section.icon}
                alt=""
                className="
                  w-[23px]
                  h-[23px]
                  object-contain
                "
              />
            ) : (
              <Icon className="w-5 h-5 text-white" />
            )}
          </span>

          <div className="flex flex-col items-start">
            <h2
              className="
                text-white
                text-[16px]
                sm:text-[17px]
                font-bold
                leading-none
                whitespace-nowrap
              "
            >
              {title}
            </h2>

            <span
              className="
                mt-1.5
                h-[2px]
                w-[18px]
                rounded-full
                bg-white/70
              "
            />
          </div>
        </button>

        <button
          type="button"
          onClick={onViewAll}
          className="
                group
                flex
                items-center
                gap-1.5
                shrink-0
                font-sans
                cursor-pointer
                active:scale-[0.94]
                transition-all
                duration-200
              "
        >
          <span
            className="
                  text-[#8f96a1]
                  text-[12px]
                  font-bold
                  font-sans
                  tracking-[-0.1px]
                  transition-colors
                  duration-200
                  group-hover:text-[#d8dbe0]
                "
          >
            {games?.length} Games
          </span>

          <span
            className="
                  flex
                  items-center
                  justify-center
                  w-[24px]
                  h-[24px]
                  rounded-full
                  bg-white/[0.045]
                  border
                  border-white/[0.06]
                  transition-all
                  duration-200
                  group-hover:bg-white/[0.08]
                  group-hover:border-white/[0.10]
                "
          >
            <ChevronRight
              size={14}
              strokeWidth={2}
              className="
                    text-[#8b919b]
                    group-hover:text-[#e5e7eb]
                    group-hover:translate-x-[1px]
                    transition-all
                    duration-200
                  "
            />
          </span>
        </button>
      </div>

      <div
        className="
          game-horizontal-scroll
          grid
          grid-rows-2
          grid-flow-col
          auto-cols-[120px]
          gap-x-2
          gap-y-2
          overflow-x-auto
          overflow-y-hidden
          pb-2
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          .game-horizontal-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {games.map((game, index) => (
          <GameCard
            key={game?.gameId || game?._id || index}
            game={game}
            isFavorite={favorites.includes(game?.gameId || game?._id)}
            onToggleFavorite={onToggleFavorite}
            onPlay={onPlay}
          />
        ))}
      </div>
    </div>
  );
};

const DynamicSectionCards = ({ sections, onFavourite, onSectionClick }) => {
  const cards = useMemo(() => {
    const result = [
      {
        id: "FAVOURITE GAMES",
        title: "FAVOURITE",
        subtitle: "GAMES",
        icon: null,
        favourite: true,
      },
    ];

    sections.forEach((section) => {
      const title = String(section?.title || "").trim();

      if (!title) return;

      // TOP GAMES hide
      if (normalizeName(title) === "top games") return;

      if (!Array.isArray(section?.games) || section.games.length === 0) {
        return;
      }

      if (
        result.some((item) => normalizeName(item.id) === normalizeName(title))
      ) {
        return;
      }

      const words = title.split(/\s+/);
      const splitAt = Math.ceil(words.length / 2);

      result.push({
        id: title,
        title: words.slice(0, splitAt).join(" "),
        subtitle: words.slice(splitAt).join(" "),
        icon: section?.icon || null,
        sectionTitle: title,
        favourite: false,
      });
    });

    return result;
  }, [sections]);

  return (
    <div className="px-2 pt-1.5 pb-2">
      <div
        className="
          category-section-scroll
          flex
          gap-1.5
          overflow-x-auto
          overflow-y-hidden
          pb-1
          whitespace-nowrap
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          .category-section-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() =>
              card.favourite ? onFavourite() : onSectionClick(card.sectionTitle)
            }
            className="
              shrink-0
              w-[68px]
              h-[68px]
              p-[1px]
              rounded-[10px]
              cursor-pointer
              bg-gradient-to-b
              from-[#18356d]
              to-[#020817]
              active:scale-95
              transition-transform
            "
          >
            <div
              className="
                w-full
                h-full
                rounded-[9px]
                bg-[#00051b]
                flex
                flex-col
                items-center
                justify-center
              "
            >
              {card.favourite ? (
                <Heart className="w-5 h-5 text-white mb-1" strokeWidth={1.8} />
              ) : (
                <img
                  src={card.icon}
                  alt={card.id}
                  draggable="false"
                  loading="lazy"
                  className="w-6 h-6 object-contain mb-1"
                />
              )}

              <span
                className="
                  text-[7px]
                  text-white
                  text-center
                  leading-[1.05]
                  uppercase
                  font-bold
                  px-0.5
                  whitespace-normal
                "
              >
                {card.title}
                {card.subtitle && <br />}
                {card.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
/* =========================================================
   MAIN COMPONENT
========================================================= */

const LiveCasino = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  /* =========================================================
     STATE
  ========================================================= */

  const [sections, setSections] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [activeView, setActiveView] = useState("HOME");

  const [activeCategory, setActiveCategory] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  /* =========================================================
     REDUX
  ========================================================= */

  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);

  const loginType = useSelector((state) => state?.user?.loggedInType);

  const userData = useSelector((state) => state?.user?.userData);

  const siteCasinoData = useSelector((state) => state?.siteCasino);

  const HeaderColor = useSelector((state) => {
    try {
      return typeof selectSiteHeaderColor === "function"
        ? selectSiteHeaderColor(state) || {
          end: "#12293d",
        }
        : {
          end: "#12293d",
        };
    } catch {
      return {
        end: "#12293d",
      };
    }
  });

  /* =========================================================
     FAVORITES
  ========================================================= */

  const storageKey = useMemo(() => {
    return userData?._id
      ? `raftaar_fav_${userData._id}`
      : "raftaar_favorite_games";
  }, [userData?._id]);

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);

      setFavorites(saved ? JSON.parse(saved) : []);
    } catch {
      setFavorites([]);
    }
  }, [storageKey]);

  const toggleFavorite = useCallback(
    (gameId, event) => {
      if (event) {
        event.stopPropagation();
      }

      if (!gameId) {
        return;
      }

      setFavorites((prev) => {
        const updated = prev.includes(gameId)
          ? prev.filter((id) => id !== gameId)
          : [...prev, gameId];

        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (error) {
          console.error("Favorite save error:", error);
        }

        return updated;
      });
    },
    [storageKey],
  );

  /* =========================================================
     GET GAME SECTIONS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadSections = async () => {
      try {
        setIsLoading(true);

        /*
         * ===============================================
         * 1. CACHE FIRST
         * ===============================================
         */

        const cached = readGameSectionsCache();

        if (cached?.data?.length) {
          if (!cancelled) {
            setSections(cached.data);

            setIsLoading(false);
          }

          const age = Date.now() - Number(cached.timestamp || 0);

          /*
           * Fresh cache
           */

          if (age < GAME_SECTIONS_CACHE_TTL) {
            return;
          }
        }

        /*
         * ===============================================
         * 2. API
         * ===============================================
         */

        const response = await getGameSections();

        const rawSections = response?.data?.data || response?.data || [];

        if (!Array.isArray(rawSections)) {
          if (!cancelled) {
            setSections([]);
          }

          return;
        }

        /*
         * ===============================================
         * 3. RESOLVE IMAGES
         * ===============================================
         */

        const resolved = await resolveGameSections(rawSections);

        /*
         * ===============================================
         * 4. SAVE CACHE
         * ===============================================
         */

        writeGameSectionsCache(resolved);

        /*
         * ===============================================
         * 5. SET
         * ===============================================
         */

        if (!cancelled) {
          setSections(resolved);
        }
      } catch (error) {
        console.error(
          "getGameSections error:",
          error?.response?.data || error?.message || error,
        );

        /*
         * Cache may already be
         * visible, so don't destroy
         * it unnecessarily.
         */

        if (!cancelled && !sections.length) {
          setSections([]);
        }

        toast.error("Failed to load games");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSections();

    return () => {
      cancelled = true;
    };

    // intentionally only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     ALL GAMES
  ========================================================= */

  const allGames = useMemo(() => {
    const result = sections.flatMap((section) =>
      Array.isArray(section?.games) ? section.games : [],
    );

    /*
     * Unique game IDs
     */

    return Array.from(
      new Map(result.map((game) => [game?.gameId || game?._id, game])).values(),
    );
  }, [sections]);

  /* =========================================================
     FAVOURITE GAMES
  ========================================================= */

  const favouriteGames = useMemo(() => {
    let result = allGames.filter((game) =>
      favorites.includes(game?.gameId || game?._id),
    );

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      result = result.filter((game) => {
        const name = game?.gameName || game?.title || game?.name || "";

        return String(name).toLowerCase().includes(query);
      });
    }

    return result;
  }, [allGames, favorites, searchQuery]);

  /* =========================================================
     SEARCH SECTIONS
  ========================================================= */

  const visibleSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sections
      .filter((section) => {
        const title = String(section?.title || "").trim();

        // TOP GAMES COMPLETELY HIDE
        return normalizeName(title) !== "top games";
      })
      .map((section) => {
        let games = Array.isArray(section?.games) ? [...section.games] : [];

        if (query) {
          games = games.filter((game) => {
            const name = game?.gameName || game?.title || game?.name || "";

            const id = game?.gameId || "";

            return (
              String(name).toLowerCase().includes(query) ||
              String(id).toLowerCase().includes(query)
            );
          });
        }

        return {
          ...section,
          games,
        };
      })
      .filter((section) => section.games.length > 0);
  }, [sections, searchQuery]);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToCasinoSection = useCallback(
    (title) => {
      if (!title) {
        return;
      }

      navigate(`/raf-casino/${encodeURIComponent(title)}`);
    },
    [navigate],
  );

  /* =========================================================
     PLAY GAME
  ========================================================= */

  const handlePlayClick = useCallback(
    async (game) => {
      const gameId = game?.gameId || game?._id;

      if (!gameId) {
        return;
      }

      if (isProcessing) {
        return;
      }

      setIsProcessing(true);

      /*
       * LOGIN
       */

      if (loginType === "") {
        navigate("/login");

        setIsProcessing(false);

        return;
      }

      if (loginType === "demo") {
        toast.error("login with real id");

        setIsProcessing(false);

        return;
      }

      /*
       * BALANCE
       */

      const availableBalance = Number(userData?.availableBalance || 0);

      const exposure = Number(userData?.exposure || 0);

      const amount = availableBalance - exposure;

      const siteCasinoBalance = Number(siteCasinoData?.casinoBalance || 0);

      const finalAmountToDeduct = Math.min(
        Math.max(amount, 0),
        Math.max(siteCasinoBalance, 0),
      );

      if (
        finalAmountToDeduct === 0 &&
        Number(userData?.casinoBalance || 0) <= 0
      ) {
        toast.warning("Insufficient balance");

        setIsProcessing(false);

        return;
      }

      /*
       * UPDATE CASINO BALANCE
       */

      try {
        const response = await updateCasinoBalance({
          CasinoBalance: finalAmountToDeduct,
        });

        if (response?.data?.user?.availableBalance !== undefined) {
          dispatch(updateAvailableBalance(response.data.user.availableBalance));
        }

        if (response?.data?.user?.casinoBalance !== undefined) {
          dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
        }
      } catch (error) {
        console.error(
          "Casino balance error:",
          error?.response?.data?.message || error?.message,
        );
      }

      /*
       * LAUNCH PAYLOAD
       */

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

      /*
       * LAUNCH
       */

      try {
        const response = await launcherUrl(payload);

        if (response?.success && response?.data?.url) {
          const gameUrl = encodeURIComponent(response.data.url);

          navigate(`/game-lobby?gameId=${gameUrl}`);
        } else {
          console.error("Launcher URL failed:", response);
        }
      } catch (error) {
        console.error(
          "Game launch error:",
          error?.response?.data?.message || error?.message,
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
      isLoggedIn,
      dispatch,
    ],
  );

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    setActiveView("HOME");

    setActiveCategory("All");

    setSearchQuery("");
  };

  /* =========================================================
     RAFTAAR
  ========================================================= */

  const isRaftaar =
    typeof window !== "undefined" && window.location.host === "raftaarclub.com";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="
        bg-[#00051e]
        min-h-screen
        pb-4
        -mb-[70px]
        font-sans
        select-none
        overflow-x-hidden
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      {!isRaftaar && (
        <>
          <h1
            className="
              text-[13px]
              md:hidden
              font-bold
              text-white
              p-1.5
            "
            style={{
              backgroundColor: HeaderColor?.end || "#12293d",
            }}
          >
            Casino
          </h1>

          <img
            src="https://images.staticcontent.io/casino/banner/royalcasino-banner.jpg"
            alt="Casino Banner"
            className="
              md:hidden
              w-full
              object-cover
            "
          />
        </>
      )}

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="px-3 pt-4 pb-2">
        <div className="relative w-full">
          <div
            className="
              bg-[#00051e]
              rounded-[7px]
              border
              border-[#1d1d1d]
              h-11
              flex
              items-center
              px-3
              shadow-sm
            "
          >
            <Search
              className="
                text-gray-400
                w-5
                h-4
              "
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Raftarclub.com "
              className="
                flex-1
                font-sans
                text-[15px]
                h-full
                ml-2
                bg-transparent
                text-gray-400
                border-0
                outline-none
                ring-0
                focus:outline-none
                focus:ring-0
              "
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          DYNAMIC SECTION CARDS
          
          FAVOURITE FIRST
          THEN API SECTION TITLES
      ===================================================== */}

      {activeView === "HOME" && (
        <DynamicSectionCards
          sections={sections}
          onFavourite={() => {
            setActiveCategory("FAVOURITE GAMES");

            setActiveView("CATEGORY");
          }}
          onSectionClick={(title) => {
            goToCasinoSection(title);
          }}
        />
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className="
          px-3
          md:px-5
        "
      >
        {/* ===================================================
            CATEGORY / FAVOURITE VIEW
        =================================================== */}

        {activeView === "CATEGORY" && (
          <div
            className="
              animate-in
              fade-in
              duration-300
            "
          >
            {/* BACK */}

            <button
              type="button"
              onClick={handleBack}
              className="
                flex
                items-center
                text-white
                mb-6
                gap-1
                hover:text-[#32d973]
                transition-colors
                bg-[#0f1722]
                py-2
                px-3
                rounded-lg
                border
                border-[#1a2636]
              "
            >
              <ChevronLeft className="w-5 h-5" />

              <span
                className="
                  font-bold
                  text-sm
                "
              >
                Back to Home
              </span>
            </button>

            {/* FAVOURITES */}

            <h1
              className="
                text-[17px]
                font-bold
                text-white
                mb-4
                flex
                items-center
                gap-2
              "
            >
              <Heart
                className="
                  w-5
                  h-5
                  text-red-500
                  fill-red-500
                "
              />
              Favourite Games
              <span className="text-gray-400">({favouriteGames.length})</span>
            </h1>

            {/* GRID */}

            <div
              className="
                grid
                grid-cols-3
                sm:grid-cols-4
                md:grid-cols-5
                lg:grid-cols-6
                gap-3
              "
            >
              {favouriteGames.map((game, index) => (
                <GameCard
                  key={game?.gameId || game?._id || index}
                  game={game}
                  isFavorite={favorites.includes(game?.gameId || game?._id)}
                  onToggleFavorite={toggleFavorite}
                  onPlay={handlePlayClick}
                />
              ))}
            </div>

            {!favouriteGames.length && (
              <div
                className="
                  text-center
                  text-gray-400
                  py-12
                "
              >
                No favourite games found.
              </div>
            )}
          </div>
        )}

        {/* ===================================================
            HOME
        =================================================== */}

        {activeView === "HOME" && (
          <div
            className="
              animate-in
              fade-in
              duration-300
            "
          >
            {/* =================================================
                PROVIDERS
            ================================================= */}

            {!searchQuery && (
              <div className="mb-4">
                {/* PROVIDER TITLE */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-white" />

                  <h2 className="text-white text-[17px] sm:text-[19px] font-extrabold tracking-wide">
                    Providers
                  </h2>
                </div>

                {/* PROVIDER SCROLL */}
                <div
                  className="
                    provider-scroll
                    flex
                    items-center
                    gap-1.5
                    overflow-x-auto
                    overflow-y-hidden
                    pb-1
                    px-[1px]
                  "
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <style>{`
                    .provider-scroll::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>

                  {Object.entries(providerLogos).map(([provider, logo]) => {
                    const makeWhite = WHITE_LOGO_PROVIDERS.includes(provider);

                    return (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => goToCasinoSection(provider)}
                        className="
                            group
                            relative
                            shrink-0
                            w-[76px]
                            h-[50px]
                            rounded-[10px]
                            overflow-hidden
                            border
                            border-white/10
                            bg-gradient-to-br
                            from-[#0b1b3b]
                            via-[#050d22]
                            to-[#010512]
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                            hover:border-[#32d973]/60
                            hover:shadow-[0_0_12px_rgba(50,217,115,0.15)]
                            active:scale-95
                            transition-all
                            duration-200
                            flex
                            items-center
                            justify-center
                          "
                      >
                        {/* TOP SHINE */}
                        <div
                          className="
                              absolute
                              top-0
                              left-0
                              right-0
                              h-[1px]
                              bg-gradient-to-r
                              from-transparent
                              via-white/20
                              to-transparent
                            "
                        />

                        {/* LOGO */}
                        <img
                          src={logo}
                          alt={provider}
                          draggable="false"
                          loading="lazy"
                          className={`
                              relative
                              z-10
                              w-[62px]
                              h-[36px]
                              object-contain
                              transition-transform
                              duration-200
                              group-hover:scale-105
                              ${makeWhite ? "brightness-0 invert" : ""}
                            `}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* =================================================
                LOADING
            ================================================= */}

            {isLoading && sections.length === 0 && (
              <div
                className="
                    space-y-7
                  "
              >
                {[1, 2, 3].map((row) => (
                  <div key={row}>
                    <div
                      className="
                            h-6
                            w-32
                            bg-[#102039]
                            rounded
                            animate-pulse
                            mb-3
                          "
                    />

                    <div
                      className="
                            flex
                            gap-2
                            overflow-hidden
                          "
                    >
                      {Array.from({
                        length: 6,
                      }).map((_, index) => (
                        <div
                          key={index}
                          className="
                                  shrink-0
                                  w-[115px]
                                  h-[150px]
                                  rounded-[14px]
                                  bg-[#102039]
                                  animate-pulse
                                "
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* =================================================
                EVERY API TITLE = SEPARATE SECTION
            ================================================= */}

            {!isLoading &&
              visibleSections.map((section, index) => (
                <GameSection
                  key={section?._id || `${section?.title}-${index}`}
                  section={section}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onPlay={handlePlayClick}
                  onViewAll={() => goToCasinoSection(section?.title)}
                />
              ))}

            {/* =================================================
                SEARCH EMPTY
            ================================================= */}

            {!isLoading && searchQuery && visibleSections.length === 0 && (
              <div
                className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    py-12
                    text-gray-500
                  "
              >
                <Search
                  className="
                      w-10
                      h-10
                      mb-2
                      opacity-50
                    "
                />

                <p>No games found</p>
              </div>
            )}

            {/* =================================================
                NO SECTIONS
            ================================================= */}

            {!isLoading && !searchQuery && sections.length === 0 && (
              <div
                className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    py-12
                    text-gray-500
                  "
              >
                <Search
                  className="
                      w-10
                      h-10
                      mb-2
                      opacity-50
                    "
                />

                <p>No games available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCasino;
