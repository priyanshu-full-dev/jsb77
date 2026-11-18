import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Heart, Play, Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { getIntCasinoList } from "../../../api";
import { updateIntCasinoSlice } from "../../../redux/slices/intCasinoSlice";

// ======================================================
// PROVIDER LOGOS
// ======================================================

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

// ======================================================
// PROVIDER NAMES
// ======================================================

const providerNames = {
  spribe: "SPRIBE",
  ezugi: "EZUGI",
  sagaming: "SAGAMING",
  vivo: "VIVO",
  evolution: "EVOLUTION",
  evoplay: "EVOPLAY",
  jilli: "JILLI",
  turbogames: "TURBO GAMES",
  oddin: "ODDIN",
};

// ======================================================
// WHITE LOGOS
// ======================================================

const WHITE_LOGO_PROVIDERS = ["oddin", "turbogames", "jilli"];

// ======================================================
// HELPERS
// ======================================================

const normalizeProvider = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

// ======================================================
// GAME IMAGE
// ======================================================

const getGameImage = (game) => {
  if (!game) return "/placeholder.png";

  // Different possible API structures
  if (game.image) {
    return game.image;
  }

  if (game.imageUrl) {
    return game.imageUrl;
  }

  if (game.logo) {
    return game.logo;
  }

  if (Array.isArray(game.images)) {
    const squareImage = game.images.find(
      (img) => img?.type === "logo-square" || img?.type === "square",
    );

    if (squareImage?.url) {
      return squareImage.url;
    }

    if (game.images[0]?.url) {
      return game.images[0].url;
    }
  }

  return "/placeholder.png";
};

// ======================================================
// GAME CARD
// ======================================================

const GameCard = ({ game, isFavourite, onFavourite, onPlay }) => {
  const image = getGameImage(game);

  const gameName =
    game?.name ||
    game?.gameName ||
    game?.title ||
    game?.game_name ||
    "Casino Game";

  return (
    <div
      className="
        group
        relative
        shrink-0

        h-[140px]
        sm:w-[115px]
        sm:h-[150px]
        rounded-xl
        overflow-hidden
        bg-[#071331]
        border
        border-white/10
        hover:border-[#00bc5e]/60
        transition-all
        duration-200
      "
    >
      {/* GAME IMAGE */}

      <img
        src={image}
        alt={gameName}
        draggable="false"
        loading="lazy"
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          transition-transform
          duration-300
          group-hover:scale-105
        "
        onError={(e) => {
          e.currentTarget.src = "/placeholder.png";
        }}
      />

      {/* DARK GRADIENT */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/90
          via-black/10
          to-transparent
          pointer-events-none
        "
      />

      {/* FAVOURITE */}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onFavourite(game);
        }}
        className="
          absolute
          top-1.5
          right-1.5
          z-20
          w-7
          h-7
          rounded-full
          bg-black/55
          backdrop-blur-sm
          flex
          items-center
          justify-center
          active:scale-90
        "
      >
        <Heart
          className={`
            w-4
            h-4
            ${isFavourite ? "fill-red-500 text-red-500" : "text-white"}
          `}
          strokeWidth={2}
        />
      </button>

      {/* PLAY BUTTON */}

      <button
        type="button"
        onClick={() => onPlay(game)}
        className="
          absolute
          inset-0
          z-10
          flex
          items-center
          justify-center
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
      >
        <span
          className="
            w-10
            h-10
            rounded-full
            bg-[#00bc5e]
            text-black
            flex
            items-center
            justify-center
            shadow-lg
          "
        >
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        </span>
      </button>

      {/* GAME NAME */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          z-20
          px-2
          py-2
        "
      >
        <p
          className="
            text-white
            text-[10px]
            sm:text-[11px]
            font-bold
            truncate
          "
        >
          {gameName}
        </p>
      </div>
    </div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const RafCasino = () => {
  const { provider } = useParams();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [games, setGames] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [favourites, setFavourites] = useState([]);

  // ====================================================
  // NORMAL PROVIDER
  // ====================================================

  const currentProvider = useMemo(
    () =>
      String(provider || "")
        .trim()
        .toLowerCase(),
    [provider],
  );

  const providerDisplayName =
    providerNames[currentProvider] ||
    String(provider || "Casino").toUpperCase();

  const providerLogo = providerLogos[currentProvider];

  // ====================================================
  // FETCH PROVIDER GAMES
  // ====================================================

  const fetchGameList = useCallback(async () => {
    if (!currentProvider) return;

    try {
      setLoading(true);
      setError("");

      const response = await getIntCasinoList(currentProvider);

      const gameList = response?.data?.data?.items || [];

      setGames(Array.isArray(gameList) ? gameList : []);

      // Redux mein bhi save
      dispatch(
        updateIntCasinoSlice({
          [currentProvider]: Array.isArray(gameList) ? gameList : [],
        }),
      );
    } catch (err) {
      console.error("Provider game fetch error:", err);

      setGames([]);

      setError("Unable to load games");
    } finally {
      setLoading(false);
    }
  }, [currentProvider, dispatch]);

  // ====================================================
  // FETCH ON PROVIDER CHANGE
  // ====================================================

  useEffect(() => {
    fetchGameList();
  }, [fetchGameList]);

  // ====================================================
  // FAVOURITES
  // ====================================================

  useEffect(() => {
    try {
      const saved = localStorage.getItem("raftaar_favorite_games");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setFavourites(parsed);
        }
      }
    } catch (err) {
      console.error("Favourite load error:", err);
    }
  }, []);

  const getGameId = (game) =>
    String(
      game?.gameId ||
        game?.id ||
        game?._id ||
        game?.game_id ||
        game?.code ||
        "",
    );

  const isFavourite = (game) => {
    const id = getGameId(game);

    return favourites.some(
      (item) =>
        String(
          item?.gameId ||
            item?.id ||
            item?._id ||
            item?.game_id ||
            item?.code ||
            "",
        ) === id,
    );
  };

  const toggleFavourite = (game) => {
    const id = getGameId(game);

    if (!id) return;

    let updated;

    if (isFavourite(game)) {
      updated = favourites.filter((item) => getGameId(item) !== id);
    } else {
      updated = [...favourites, game];
    }

    setFavourites(updated);

    localStorage.setItem("raftaar_favorite_games", JSON.stringify(updated));
  };

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return games;
    }

    return games.filter((game) => {
      const name = String(
        game?.name || game?.gameName || game?.title || game?.game_name || "",
      ).toLowerCase();

      return name.includes(query);
    });
  }, [games, searchQuery]);

  // ====================================================
  // PLAY GAME
  // ====================================================

  const handlePlayGame = (game) => {
    console.log("Launching game:", game);

    // Yahan tumhara existing launch
    // function / launcherUrl logic laga sakte ho.

    const gameId =
      game?.gameId || game?.id || game?._id || game?.game_id || game?.code;

    if (!gameId) {
      return;
    }

    navigate(`/game-lobby?gameId=${encodeURIComponent(gameId)}`);
  };

  // ====================================================
  // BACK
  // ====================================================

  const handleBack = () => {
    navigate(-1);
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#010512]
        text-white
        px-2
        sm:px-4
        py-3
      "
    >
      {/* ==========================================
          HEADER
      ========================================== */}

      <div
        className="
          flex
          items-center
          gap-2
          mb-4
        "
      >
        {/* BACK */}

        <button
          type="button"
          onClick={handleBack}
          className="
            shrink-0
            w-9
            h-9
            rounded-full
            bg-[#071331]
            border
            border-white/10
            flex
            items-center
            justify-center
            active:scale-90
          "
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* PROVIDER LOGO */}

        <div
          className="
            shrink-0
            w-[65px]
            h-[40px]
            rounded-lg
            bg-[#071331]
            border
            border-white/10
            flex
            items-center
            justify-center
          "
        >
          {providerLogo ? (
            <img
              src={providerLogo}
              alt={providerDisplayName}
              className={`
                w-[52px]
                h-[32px]
                object-contain
                ${
                  WHITE_LOGO_PROVIDERS.includes(currentProvider)
                    ? "brightness-0 invert"
                    : ""
                }
              `}
            />
          ) : (
            <span className="text-[9px] font-bold">{providerDisplayName}</span>
          )}
        </div>

        {/* SEARCH */}

        <div
          className="
            ml-auto
            shrink-0
            relative
            hidden
            sm:block
          "
        >
          <Search
            className="
              absolute
              left-2.5
              top-1/2
              -translate-y-1/2
              w-4
              h-4
              text-white/40
            "
          />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="
              w-[190px]
              h-9
              rounded-lg
              bg-[#071331]
              border
              border-white/10
              pl-8
              pr-3
              text-[11px]
              text-white
              outline-none
              focus:border-[#00bc5e]/50
            "
          />
        </div>
      </div>

      {/* ==========================================
          MOBILE SEARCH
      ========================================== */}

      <div className="sm:hidden mb-4">
        <div className="relative">
          <Search
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              w-4
              h-4
              text-white/40
            "
          />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="
              w-full
              h-9
              rounded-lg
              bg-[#071331]
              border
              border-white/10
              pl-9
              pr-3
              text-[11px]
              text-white
              outline-none
              focus:border-[#00bc5e]/50
            "
          />
        </div>
      </div>

      {/* ==========================================
          GAME COUNT
      ========================================== */}

      {!loading && !error && (
        <div className="mb-2">
          <span
            className="
              text-white/50
              text-[11px]
              font-bold
            "
          >
            {filteredGames.length} Games
          </span>
        </div>
      )}

      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (
        <div
          className="
            min-h-[300px]
            flex
            items-center
            justify-center
          "
        >
          <div className="text-center">
            <div
              className="
                w-9
                h-9
                rounded-full
                border-2
                border-white/10
                border-t-[#00bc5e]
                animate-spin
                mx-auto
                mb-3
              "
            />

            <p
              className="
                text-white/50
                text-xs
              "
            >
              Loading games...
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
          ERROR
      ========================================== */}

      {!loading && error && (
        <div
          className="
            min-h-[250px]
            flex
            items-center
            justify-center
          "
        >
          <div className="text-center">
            <p
              className="
                text-red-400
                text-sm
                font-bold
                mb-3
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={fetchGameList}
              className="
                px-4
                py-2
                rounded-lg
                bg-[#00bc5e]
                text-black
                text-xs
                font-bold
              "
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          NO GAMES
      ========================================== */}

      {!loading && !error && filteredGames.length === 0 && (
        <div
          className="
              min-h-[250px]
              flex
              items-center
              justify-center
            "
        >
          <div className="text-center">
            <div
              className="
                  w-12
                  h-12
                  rounded-full
                  bg-[#071331]
                  border
                  border-white/10
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-3
                "
            >
              <Search
                className="
                    w-5
                    h-5
                    text-white/30
                  "
              />
            </div>

            <p
              className="
                  text-white/60
                  text-sm
                  font-bold
                "
            >
              No games found
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
          GAMES GRID
      ========================================== */}

      {!loading && !error && filteredGames.length > 0 && (
        <div
          className="
              grid
              grid-cols-3
              sm:grid-cols-5
              md:grid-cols-6
              lg:grid-cols-8
              xl:grid-cols-10
              gap-2
              sm:gap-3
            "
        >
          {filteredGames.map((game, index) => (
            <GameCard
              key={getGameId(game) || index}
              game={game}
              isFavourite={isFavourite(game)}
              onFavourite={toggleFavourite}
              onPlay={handlePlayGame}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RafCasino;
