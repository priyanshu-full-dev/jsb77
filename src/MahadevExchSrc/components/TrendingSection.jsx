import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useState } from "react";

import { FaCaretRight, FaCaretLeft } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isMobile } from "react-device-detect";

import { launcherUrl, updateCasinoBalance } from "../../api";

import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../redux/slices/userSlice";

/* =========================
   CARD SKELETON
========================= */

const CardSkeleton = () => {
  return (
    <div className="flex flex-col w-[126px] animate-pulse">
      <div className="rounded-[10px] overflow-hidden w-[126px] h-[168px] bg-[#2a2a2a]" />
      <div className="h-[10px] bg-[#2a2a2a] mt-2 rounded w-[70%] mx-auto" />
    </div>
  );
};

/* =========================
   MAIN COMPONENT
========================= */

const TrendingSection = ({ title, id, games = [] }) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const { permissionList } = useSelector((state) => state.casinoPermission);

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const loginType = useSelector((state) => state.user.loggedInType);

  const userData = useSelector((state) => state?.user?.userData);
  const siteCasinoData = useSelector((state) => state.siteCasino);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  /* =========================
     PLAY GAME
  ========================= */

  const handlePlayClick = async (game) => {
    if (isProcessing) return;

    setIsProcessing(true);

    const gameId = game?.id;

    if (loginType === "" || loginType === "demo") {
      toast.error("login with real id");
      setIsProcessing(false);
      return;
    }

    let amount = userData?.availableBalance - userData?.exposure || 0;
    let siteCasinoBalance = siteCasinoData?.casinoBalance || 0;

    let finalAmountToDeduct = Math.min(amount, siteCasinoBalance);

    if (
      finalAmountToDeduct === 0 &&
      (!userData?.casinoBalance || userData?.casinoBalance <= 0)
    ) {
      toast.warning("Insufficient balance");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await updateCasinoBalance({
        CasinoBalance: finalAmountToDeduct,
      });

      dispatch(updateAvailableBalance(response.data.user.availableBalance));
      dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
    } catch (error) {
      console.error("error", error.response?.data?.message);
    }

    const data = {
      gameId: gameId,
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

    try {
      const res = await launcherUrl(data);

      if (res?.success && res?.data?.url) {
        const gameUrl = encodeURIComponent(res.data.url);
        navigate(`/game-lobby?gameId=${gameUrl}`);
      }
    } catch (error) {
      console.error("Game launch error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="px-3 mt-4 pb-3">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-[14px] font-semibold uppercase">
          {title}
        </h2>

        <div className="flex gap-2">
          {/* PREV */}

          <button
            className={`trending-prev-${id} w-[25.5px] h-[25.5px] rounded-[5px] flex items-center justify-center
            ${
              isBeginning
                ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
                : "bg-[#3a3a3a] text-white"
            }`}
            disabled={isBeginning}
          >
            <FaCaretLeft size={18} />
          </button>

          {/* NEXT */}

          <button
            className={`trending-next-${id} w-[25.5px] h-[25.5px] rounded-[5px] flex items-center justify-center
            ${
              isEnd
                ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
                : "bg-[#3a3a3a] text-white"
            }`}
            disabled={isEnd}
          >
            <FaCaretRight size={18} />
          </button>
        </div>
      </div>

      {/* SLIDER */}

      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: `.trending-next-${id}`,
          prevEl: `.trending-prev-${id}`,
        }}
        spaceBetween={8}
        slidesPerView="auto"
        onSlideChange={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        onInit={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
      >
        {games.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <SwiperSlide key={i} className="!w-[126px]">
                <CardSkeleton />
              </SwiperSlide>
            ))
          : games.map((game, i) => {
              /* GAME LOCK CHECK */

              const isGameLocked = permissionList?.some(
                (item) =>
                  item.type === "game" &&
                  item.gameId?.toLowerCase() === game?.id?.toLowerCase()
              );

              if (isGameLocked) return null;

              return (
                <SwiperSlide key={game.eventId || i} className="!w-[126px]">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayClick(game);
                    }}
                    className="flex flex-col w-[126px] cursor-pointer"
                  >
                    <div className="relative rounded-[10px] overflow-hidden w-[126px] h-[168px]">
                      <img
                        src={game.img}
                        alt={game.eventName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <p className="text-center text-[10px] text-gray-300 font-semibold mt-2 truncate">
                      {game.name}
                    </p>
                  </div>
                </SwiperSlide>
              );
            })}
      </Swiper>
    </div>
  );
};

export default TrendingSection;