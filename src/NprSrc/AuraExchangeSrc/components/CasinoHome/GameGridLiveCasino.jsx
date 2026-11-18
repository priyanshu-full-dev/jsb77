/* eslint-disable react/prop-types */
import { useState } from "react";
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
import {
  usePrimaryColor,
  usePrimaryTextColor,
} from "../../hooks/useThemeColors";

function GameGridLiveCasino({
  gameList = [],
  categoryFilter,
  searchQuery = "",
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { permissionList } = useSelector((state) => state.casinoPermission);

  const lockedGameIds = permissionList
    ?.filter((p) => p.type === "game")
    ?.map((p) => p.gameId);

  const lockedProviders = permissionList
    ?.filter((p) => p.type === "provider")
    ?.map((p) => p.provider?.toLowerCase());

  const [activeCard, setActiveCard] = useState(null);
  const [loading, setLoading] = useState(false);

  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;

  const userData = useSelector((state) => state?.user?.userData);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const siteCasinoData = useSelector((state) => state.siteCasino);

  const PrimaryColor = usePrimaryColor();
  const PrimaryTextColor = usePrimaryTextColor();

  // ✅ FILTER GAMES
  // const filteredGames = gameList.filter((game) => {
  //   const isCategoryMatch =
  //     !categoryFilter || categoryFilter === "CASINO"
  //       ? true
  //       : game.category?.split("/")?.includes(categoryFilter);

  //   const isSearchMatch = searchQuery
  //     ? game.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       game.category?.toLowerCase().includes(searchQuery.toLowerCase())
  //     : true;

  //   return isCategoryMatch && isSearchMatch;
  // });

  const filteredGames = gameList.filter((game) => {
    const isCategoryMatch =
      !categoryFilter || categoryFilter === "CASINO"
        ? true
        : game.category?.split("/")?.includes(categoryFilter);

    const isSearchMatch = searchQuery
      ? game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const isGameLocked = lockedGameIds?.includes(game.gameId);

    const isProviderLocked = lockedProviders?.some((provider) =>
      game.name.toLowerCase().includes(provider),
    );

    return (
      isCategoryMatch && isSearchMatch && !isGameLocked && !isProviderLocked
    );
  });

  // ✅ PLAY REAL GAME
  // const playReal = async (gameId) => {
  //   if (!isLoggedIn) {
  //     dispatch(displayAuthModal("login"));
  //     return;
  //   }

  //   // Safe balance calculation
  //   const available = userData?.availableBalance || 0;
  //   const exposure = userData?.exposure || 0;
  //   const amount = available - exposure;

  //   const siteCasinoBalance = siteCasinoData?.casinoBalance || 0;
  //   const finalAmountToDeduct = Math.min(amount, siteCasinoBalance);

  //   if (
  //     finalAmountToDeduct <= 0 &&
  //     (!userData?.casinoBalance || userData?.casinoBalance <= 0)
  //   ) {
  //     toast.warning("Insufficient balance");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     // 🔹 Update balance first
  //     const response = await updateCasinoBalance({
  //       CasinoBalance: finalAmountToDeduct,
  //     });

  //     dispatch(updateAvailableBalance(response.data.user.availableBalance));
  //     dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));

  //   } catch (error) {
  //     const errorMessage =
  //       error?.response?.data?.message ||
  //       error?.message ||
  //       "Balance update failed";

  //     console.error("Casino Balance Error:", errorMessage);
  //     toast.error(errorMessage);
  //     setLoading(false);
  //     return; // 🚨 STOP if balance fails
  //   }

  //   // 🔹 After successful balance update, launch game
  //   try {
  //     localStorage.setItem("returnURL", window.location.href);

  //     const data = {
  //       gameId: gameId,
  //       playerId: userData?._id || "",
  //       displayName:
  //         userData?.casinoDisplayName || `User${Math.floor(Math.random() * 10000)}`,
  //       currency: "INR",
  //       country: "IN",
  //       gender: "M",
  //       birthDate: "1996-10-12",
  //       mode: "real",
  //       device: isMobile ? "mobile" : "desktop",
  //       returnUrl: window.location.href,
  //       walletSessionId: userData?.sessionToken || "",
  //     };

  //     const res = await launcherUrl(data);

  //     if (res?.success) {
  //       navigate(
  //         `/game-lobby?gameId=${encodeURIComponent(res?.data?.url)}`
  //       );
  //     } else {
  //       toast.error("Failed to launch game");
  //     }
  //   } catch (error) {
  //     const errorMessage =
  //       error?.response?.data?.message ||
  //       error?.message ||
  //       "Launcher failed";

  //     console.error("Launcher Error:", errorMessage);
  //     toast.error(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const playReal = async (gameId) => {
    if (!isLoggedIn) {
      alert("Please login to play the game.");
      return;
    }

    if (gameId.includes("DMD")) {
      const gid = gameId.split("-").pop();
      navigate(`/casino/${gid}`);
      return;
    }

    const available = userData?.availableBalance || 0;
    const exposure = userData?.exposure || 0;
    const amount = available - exposure;

    const siteCasinoBalance = siteCasinoData?.casinoBalance || 0;
    const finalAmountToDeduct = Math.min(amount, siteCasinoBalance);

    if (
      finalAmountToDeduct <= 0 &&
      (!userData?.casinoBalance || userData?.casinoBalance <= 0)
    ) {
      toast.warning("Insufficient balance");
      return;
    }

    try {
      setLoading(true);

      // 🔹 First update balance
      const response = await updateCasinoBalance({
        CasinoBalance: finalAmountToDeduct,
      });

      console.log({ response });

      dispatch(
        updateAvailableBalance(response.data.updatedUser.availableBalance),
      );
      dispatch(
        updateUserCasinoBalance(response.data.updatedUser.casinoBalance),
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Balance update failed";

      toast.error(message);
      setLoading(false);
      return; // 🚨 STOP here
    }

    try {
      localStorage.setItem("returnURL", window.location.href);

      const res = await launcherUrl({
        gameId,
        playerId: userData?._id || "",
        displayName:
          userData?.casinoDisplayName ||
          `User${Math.floor(Math.random() * 10000)}`,
        currency: "INR",
        country: "IN",
        gender: "M",
        birthDate: "1996-10-12",
        mode: "real",
        device: isMobile ? "mobile" : "desktop",
        returnUrl: window.location.href,
        walletSessionId: userData?.sessionToken || "",
      });

      if (res?.success) {
        navigate(`/game-lobby?gameId=${encodeURIComponent(res?.data?.url)}`);
      } else {
        toast.error("Failed to launch game");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Launcher failed";

      toast.error(message);
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
          const bgImage = game?.images?.[2]?.url || "";

          return (
            <div
              key={idx}
              className="relative rounded-[8px] min-[1030px]:rounded-[12px] flex flex-col justify-end overflow-hidden w-full cursor-pointer bg-black h-[120px] min-[360px]:h-[140px] min-[400px]:h-[155px] min-[431px]:h-[175px] min-[511px]:h-[190px] sm:h-[175px] md:h-[240px] lg:h-[175px] xl:h-[190px] 2xl:h-[210px]"
              style={{
                boxShadow: "0 5px 9px -3px",
              }}
              onClick={() => {
                playReal(game.gameId);
              }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-[12px] bg-black"
                style={{ backgroundImage: `url(${bgImage})` }}
                onClick={(e) => {
                  e.stopPropagation();
                  playReal(game.gameId);
                }}
              />

              {/* Bottom Name Bar */}
              <div className="relative z-10 w-full text-center mt-auto flex items-center justify-center">
                <div
                  className="text-xs w-full py-1 px-2 font-bold leading-none min-h-[30px] flex items-center justify-center"
                  style={{
                    backgroundImage: PrimaryColor,
                    color: PrimaryTextColor,
                  }}
                >
                  {game.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GameGridLiveCasino;
