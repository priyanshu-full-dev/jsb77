// /* eslint-disable react/prop-types */
// import { useState, useEffect } from "react";
// import {
//   launcherUrl,
//   updateCasinoBalance,
//   launchUniverseCasinoGame,
// } from "../../../../api";
// import { useDispatch, useSelector } from "react-redux";
// import { isMobile } from "react-device-detect";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import Loader from "../../../../utils/Loader";
// import {
//   updateAvailableBalance,
//   updateUserCasinoBalance,
// } from "../../../../redux/slices/userSlice";
// import { displayAuthModal } from "../../../../redux/slices/authModalSlice";
// import axios from "axios";

// // Canonical Universe game keys. The backend accepts either game IDs or slugs.
// // Only these games use the new Universe iframe endpoint; all other game flows remain unchanged.
// const UNIVERSE_GAME_KEY_MAP = {
//   88.0022: "vimaan",
//   99.0062: "ball-by-ball",
//   88.0023: "balloon",
//   "99.0010": "teen-patti",
//   "99.0030": "lucky7",
//   99.0013: "1day-teen-patti",
//   99.0016: "joker-teen-patti",
//   99.0019: "dragon-tiger",
//   99.0001: "baccarat",
//   99.0025: "andar-bahar",
//   99.0022: "32-cards",
//   99.0007: "poker",
//   99.0041: "dtl",
//   99.0021: "1day-dragon-tiger",
//   99.0014: "muflis-teen-patti",
//   99.0046: "card-race",
//   99.0005: "amar-akbar-anthony",
//   99.0018: "dragon-tiger-classic",
//   88.0019: "lucky-0-to-9",
//   "88.0020": "dream-catcher",
//   88.0021: "heads-tails",

//   // Also support a game list that already supplies the canonical slug as gameId.
//   vimaan: "vimaan",
//   "ball-by-ball": "ball-by-ball",
//   balloon: "balloon",
//   "teen-patti": "teen-patti",
//   lucky7: "lucky7",
//   "1day-teen-patti": "1day-teen-patti",
//   "joker-teen-patti": "joker-teen-patti",
//   "dragon-tiger": "dragon-tiger",
//   baccarat: "baccarat",
//   "andar-bahar": "andar-bahar",
//   "32-cards": "32-cards",
//   poker: "poker",
//   dtl: "dtl",
//   "1day-dragon-tiger": "1day-dragon-tiger",
//   "muflis-teen-patti": "muflis-teen-patti",
//   "card-race": "card-race",
//   "amar-akbar-anthony": "amar-akbar-anthony",
//   "dragon-tiger-classic": "dragon-tiger-classic",
//   "lucky-0-to-9": "lucky-0-to-9",
//   "dream-catcher": "dream-catcher",
//   "heads-tails": "heads-tails",
// };

// // Kept for the pre-existing legacy launcher fallback.
// const launcherGameIdMap = {
//   88.0023: "SPB-balloon",
// };

// function getLaunchData(response) {
//   // Supports either an Axios response or a helper that already returns response.data.
//   const candidate = response?.data?.data ?? response?.data ?? response;
//   return candidate?.embed_url ? candidate : candidate?.data;
// }

// function GameGrid({ gameList = [], categoryFilter, searchQuery = "" }) {

//     const isAuthenticated = useSelector((state) => state.user.token);

//   const { permissionList } = useSelector((state) => state.casinoPermission);
//   const lockedGameIds = permissionList
//     ?.filter((p) => p.type === "game")
//     ?.map((p) => p.gameId);
//   const lockedProviders = permissionList
//     ?.filter((p) => p.type === "provider")
//     ?.map((p) => p.provider?.toLowerCase());

//   const filteredGames = gameList.filter((game) => {
//     const isCategoryMatch =
//       !categoryFilter || categoryFilter === "CASINO"
//         ? true
//         : game.category?.split("/")?.includes(categoryFilter);

//     const gameName = String(game?.name || "");
//     const gameCategory = String(game?.category || "");
//     const query = String(searchQuery || "").toLowerCase();
//     const isSearchMatch = query
//       ? gameName.toLowerCase().includes(query) ||
//         gameCategory.toLowerCase().includes(query)
//       : true;

//     const isGameLocked = lockedGameIds?.includes(game.gameId);
//     const isProviderLocked = lockedProviders?.some((provider) =>
//       provider ? gameName.toLowerCase().includes(provider) : false,
//     );

//     return (
//       isCategoryMatch && isSearchMatch && !isGameLocked && !isProviderLocked
//     );
//   });

//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [activeCard, setActiveCard] = useState(null);
//   const isTouchDevice =
//     typeof window !== "undefined" && "ontouchstart" in window;
//   const userData = useSelector((state) => state?.user?.userData);
//   const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
//   const siteCasinoData = useSelector((state) => state.siteCasino);
//   const [loading, setLoading] = useState(false);

//   const playReal = async (rawGameId) => {
//     if (!isLoggedIn) {
//       dispatch(displayAuthModal("login"));
//       return;
//     }

//     const gameId = String(rawGameId || "");
//     const universeGameKey = UNIVERSE_GAME_KEY_MAP[gameId];

//      const authToken = isAuthenticated

// if (universeGameKey) {
//   try {
//     setLoading(true);

//     if (!authToken) {
//       dispatch(displayAuthModal("login"));
//       return;
//     }

//   const response = await axios.post(
//   `https://api.professor.monster/api/v4/universe-casino-iframe/launch/${encodeURIComponent(
//     universeGameKey,
//   )}`,
//   {},
//   {
//     params: { footer: 0 }, // footer hide
//     headers: {
//       Authorization: `Bearer ${authToken}`,
//       "Content-Type": "application/json",
//     },
//     timeout: 15000,
//   },
// );

//     const launchData = response.data?.data;

//     if (!launchData?.embed_url) {
//       throw new Error(
//         response.data?.message ||
//           "Universe API did not return an iframe URL",
//       );
//     }

//     const wallet = launchData.wallet || {
//       player_id: launchData.player_id,
//       balance: launchData.balance ?? 0,
//       currency: launchData.currency ?? "INR",
//       exposure: launchData.exposure ?? 0,
//       open_bets: launchData.open_bets ?? 0,
//     };

//     console.log("Universe wallet:", wallet);

//     localStorage.setItem(
//       "returnURL",
//       window.location.href,
//     );

//  navigate(
//   `/game-lobby?gameId=${encodeURIComponent(launchData.embed_url)}`,
//   {
//     state: {
//       universeCasinoGame: launchData.game,
//       universePlayerId: launchData.player_id,
//       universeWallet: launchData.wallet,
//     },
//   },
// );
//   } catch (error) {
//     const message =
//       error?.response?.data?.message ||
//       error?.response?.data?.error ||
//       error?.message ||
//       "Universe casino game could not be launched";

//     console.error("Universe launcher error:", {
//       status: error?.response?.status,
//       message,
//       data: error?.response?.data,
//     });

//     toast.error(message);
//   } finally {
//     setLoading(false);
//   }

//   return;
// }

//     // Preserve the existing route behavior for 88./99. games not supported by
//     // the new Universe catalog.
//     if (gameId.startsWith("99.") || gameId.startsWith("88.")) {
//       const parts = gameId.split("-");
//       const gid = parts[parts.length - 1];
//       navigate(`/casino/${gid}`);
//       return;
//     }

//     // Existing legacy launcher flow for every other game remains unchanged.
//     const finalGameId = launcherGameIdMap[gameId] || gameId;

//     const amount = userData?.availableBalance - userData?.exposure || 0;
//     const siteCasinoBalance = siteCasinoData?.casinoBalance || 0;
//     const finalAmountToDeduct = Math.min(amount, siteCasinoBalance);

//     if (
//       finalAmountToDeduct === 0 &&
//       (!userData?.casinoBalance || userData?.casinoBalance <= 0)
//     ) {
//       toast.warning("Insufficient balance");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await updateCasinoBalance({
//         CasinoBalance: finalAmountToDeduct,
//       });
//       dispatch(updateAvailableBalance(response.data.user.availableBalance));
//       dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
//     } catch (error) {
//       console.error("error", error.response?.data?.message);
//       toast.error(
//         error.response?.data?.message || "Casino balance update failed",
//       );
//       return;
//     } finally {
//       setLoading(false);
//     }

//     localStorage.setItem("returnURL", window.location.href);

//     const data = {
//       gameId: finalGameId,
//       playerId: userData?._id || "",
//       displayName:
//         userData?.casinoDisplayName || `Demo${Math.random() * 10000}`,
//       currency: "INR",
//       country: "IN",
//       gender: "M",
//       birthDate: "1996-10-12",
//       mode: "real",
//       device: isMobile ? "mobile" : "desktop",
//       returnUrl: window.location.href,
//       walletSessionId: userData?.sessionToken || "",
//     };

//     try {
//       const res = await launcherUrl(data);
//       if (res.success) {
//         navigate(`/game-lobby?gameId=${encodeURIComponent(res?.data?.url)}`);
//       }
//     } catch (error) {
//       console.error(
//         "Launcher error:",
//         error?.response?.data?.message || error?.message || error,
//       );
//       toast.error(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Casino game could not be launched",
//       );
//     }
//   };

//   return (
//     <div
//       className="main-con w-full h-full overflow-y-auto pb-4 dark:bg-none bg-contain bg-fixed px-2 py-3 min-h-[50vh]"
//       style={{
//         backgroundImage: "url('/aura/casinobg.png')",
//         backgroundSize: "contain",
//         backgroundAttachment: "fixed",
//         padding: "12px 8px",
//         minHeight: "50vh",
//       }}
//     >
//       {loading && <Loader />}
//       <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2.5 gap-y-3.5">
//         {filteredGames.map((game, idx) => {
//           const bgImage =
//             game?.images?.[2]?.url || game?.images?.[0]?.url || "";
//           return (
//             <div
//               key={game.gameId || idx}
//               className="casinoicons relative w-full rounded-[8px] min-[1030px]:rounded-[12px] overflow-hidden cursor-pointer bg-black"
//               style={{ boxShadow: "0 5px 9px -3px" }}
//               onClick={() => {
//                 if (game?.href) {
//                   navigate(game.href);
//                   return;
//                 }
//                 playReal(game.gameId);
//               }}
//             >
//               <img
//                 src={bgImage}
//                 alt={game.name || "casino game"}
//                 loading="lazy"
//                 className="w-full h-[120px] min-[360px]:h-[140px] min-[400px]:h-[155px] min-[431px]:h-[175px] min-[511px]:h-[190px] sm:h-[175px] md:h-[240px] lg:h-[175px] xl:h-[190px] 2xl:h-[210px] object-cover block rounded-[8px] min-[1030px]:rounded-[12px]"
//               />
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default GameGrid;

/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  launcherUrl,
  updateCasinoBalance,
} from "../../../../api";
import { useDispatch, useSelector } from "react-redux";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../../utils/Loader";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../../../redux/slices/userSlice";
import { displayAuthModal } from "../../../../redux/slices/authModalSlice";
import axios from "axios";

const launcherGameIdMap = {
  88.0023: "SPB-balloon", // Balloon
  // "88.0020": "SPB-dreamcatcher",
  // "88.0019": "SPB-lucky09",
};

import { prefetchDiamondCasinoOdds } from "../../../../socketClient";

function GameGrid({ gameList = [], categoryFilter, searchQuery = "" }) {
  const { permissionList } = useSelector((state) => state.casinoPermission);
  const lockedGameIds = permissionList
    ?.filter((p) => p.type === "game")
    ?.map((p) => p.gameId);
  const lockedProviders = permissionList
    ?.filter((p) => p.type === "provider")
    ?.map((p) => p.provider?.toLowerCase());

  const filteredGames = gameList.filter((game) => {
    const isCategoryMatch =
      !categoryFilter || categoryFilter === "CASINO"
        ? true
        : game.category?.split("/")?.includes(categoryFilter);

    const isSearchMatch = searchQuery
      ? game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const isGameLocked = lockedGameIds?.includes(game.gameId);
    const isProviderLocked = lockedProviders?.some((provider) =>
      game.name.toLowerCase().includes(provider),
    );

    return (
      isCategoryMatch && isSearchMatch && !isGameLocked && !isProviderLocked
    );
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Pre-warm the DiamondCasino chunk so opening tables is instantaneous
    import("../../../../CommonComponents/DiamondCasino");
  }, []);

  const handlePrefetchCasino = (rawGameId) => {
    if (!rawGameId) return;
    const gameId = String(rawGameId);
    import("../../../../CommonComponents/DiamondCasino");
    if (gameId.startsWith("99.") || gameId.startsWith("88.")) {
      const parts = gameId.split("-");
      const gid = parts[parts.length - 1];
      prefetchDiamondCasinoOdds(gid);
    }
  };
  const [activeCard, setActiveCard] = useState(null);
  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;
  const userData = useSelector((state) => state?.user?.userData);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const siteCasinoData = useSelector((state) => state.siteCasino);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useSelector((state) => state.user.token);

  const UNIVERSE_GAME_KEY_MAP = {
    88.0022: "vimaan", // Aviator
    "88.0022": "vimaan",
    88.0023: "balloon", // Balloon
    "88.0023": "balloon",
    balloon: "balloon",
  };

  const launcherGameIdMap = {
    88.0023: "SPB-balloon",
  };

  const playReal = async (rawGameId) => {
    if (!isLoggedIn) {
      dispatch(displayAuthModal("login"));
      return;
    }

    const gameId = String(rawGameId || "");
    const authToken = isAuthenticated;
    const universeGameKey = UNIVERSE_GAME_KEY_MAP[gameId];

    // ==========================================
    // 1. Aviator + Balloon: Universe API / Direct Route
    // ==========================================
    if (universeGameKey) {
      if (universeGameKey === "vimaan") {
        navigate("/vimaan");
        return;
      }
      if (universeGameKey === "balloon") {
        navigate("/balloon");
        return;
      }

      try {
        if (!authToken) {
          dispatch(displayAuthModal("login"));
          return;
        }

        setLoading(true);

        const response = await axios.post(
          `https://api.professor.monster/api/v4/universe-casino-iframe/launch/${encodeURIComponent(
            universeGameKey,
          )}`,
          {},
          {
            params: { footer: 0 },
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            timeout: 15000,
          },
        );

        const launchData = response.data?.data;

        if (!launchData?.embed_url) {
          throw new Error(
            response.data?.message ||
              "Universe API did not return an iframe URL",
          );
        }

        localStorage.setItem("returnURL", window.location.href);

        navigate(
          `/game-lobby?gameId=${encodeURIComponent(launchData.embed_url)}`,
          {
            state: {
              universeCasinoGame: launchData.game,
              universePlayerId: launchData.player_id,
              universeWallet: launchData.wallet,
            },
          },
        );
      } catch (error) {
        console.error("Universe launcher error:", {
          status: error?.response?.status,
          message: error?.response?.data?.message || error?.message,
          data: error?.response?.data,
        });

        toast.error(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Casino game could not be launched",
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // ==========================================
    // 2. Other 88./99. games: existing route
    // ==========================================
    if (gameId.startsWith("99.") || gameId.startsWith("88.")) {
      const parts = gameId.split("-");
      const gid = parts[parts.length - 1];

      navigate(`/casino/${gid}`);
      return;
    }

    // ==========================================
    // 3. Other games: existing legacy launcher
    // ==========================================
    // const finalGameId = launcherGameIdMap[gameId] || gameId;

    // const amount =
    //   (userData?.availableBalance || 0) - (userData?.exposure || 0);

    // const siteCasinoBalance = siteCasinoData?.casinoBalance || 0;
    // const finalAmountToDeduct = Math.max(
    //   0,
    //   Math.min(amount, siteCasinoBalance),
    // );

    // if (
    //   finalAmountToDeduct === 0 &&
    //   (!userData?.casinoBalance || userData.casinoBalance <= 0)
    // ) {
    //   toast.warning("Insufficient balance");
    //   return;
    // }

    try {
      setLoading(true);

      // const response = await updateCasinoBalance({
      //   CasinoBalance: finalAmountToDeduct,
      // });

      // dispatch(updateAvailableBalance(response.data.user.availableBalance));

      // dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
    } catch (error) {
      console.error("Casino balance update error:", error);

      toast.error(
        error?.response?.data?.message || "Casino balance update failed",
      );

      return;
    } finally {
      setLoading(false);
    }

    localStorage.setItem("returnURL", window.location.href);

    const data = {
      gameId: finalGameId,
      playerId: userData?._id || "",
      displayName:
        userData?.casinoDisplayName ||
        `Demo${Math.floor(Math.random() * 10000)}`,
      currency: "INR",
      country: "IN",
      gender: "M",
      birthDate: "1996-10-12",
      mode: "real",
      device: isMobile ? "mobile" : "desktop",
      returnUrl: window.location.href,
      walletSessionId: userData?.sessionToken || "",
    };

    try {
      setLoading(true);

      const res = await launcherUrl(data);

      if (res?.success && res?.data?.url) {
        navigate(`/game-lobby?gameId=${encodeURIComponent(res.data.url)}`);
      } else {
        throw new Error(res?.message || "Launcher URL was not returned");
      }
    } catch (error) {
      console.error("Legacy launcher error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Casino game could not be launched",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="main-con w-full h-full overflow-y-auto pb-4 dark:bg-none bg-contain bg-fixed px-2 py-3 min-h-[50vh]"
      style={{
        backgroundImage: "url('/aura/casinobg.png')",
        backgroundSize: "contain",
        backgroundAttachment: "fixed",
        padding: "12px 8px",
        minHeight: "50vh",
      }}
    >
      {loading && (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black w-screen h-screen pointer-events-none select-none">
          <img
            src="/casino/universe.gif"
            alt="universe"
            className="h-[200px] w-[200px] object-contain pointer-events-none"
            loading="eager"
            style={{ willChange: "transform" }}
          />
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2.5 gap-y-3.5">
        {filteredGames.map((game, idx) => {
          const bgImage =
            game?.images?.[2]?.url || game?.images?.[0]?.url || "";
          return (
            <div
              key={game.gameId || idx}
              onMouseEnter={() => handlePrefetchCasino(game.gameId)}
              onPointerEnter={() => handlePrefetchCasino(game.gameId)}
              onTouchStart={() => handlePrefetchCasino(game.gameId)}
              className="casinoicons relative w-full rounded-[8px] min-[1030px]:rounded-[12px] overflow-hidden cursor-pointer bg-black"
              style={{
                boxShadow: "0 5px 9px -3px",
              }}
              onClick={() => {
                if (game?.href) {
                  navigate(game.href);
                  return;
                }
                playReal(game.gameId);
              }}
            >
              <img
                src={bgImage}
                alt={game.name || "casino game"}
                loading={idx < 6 ? "eager" : "lazy"}
                fetchpriority={idx < 3 ? "high" : "auto"}
                className="w-full h-[120px] min-[360px]:h-[140px] min-[400px]:h-[155px] min-[431px]:h-[175px] min-[511px]:h-[190px] sm:h-[175px] md:h-[240px] lg:h-[175px] xl:h-[190px] 2xl:h-[210px] object-cover block rounded-[8px] min-[1030px]:rounded-[12px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GameGrid;
