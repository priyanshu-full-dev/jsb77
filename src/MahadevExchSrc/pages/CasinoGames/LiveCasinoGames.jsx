import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { selectDomainID } from "../../../utils/helper/commonSelectors";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid, FreeMode } from "swiper/modules";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";
import { isMobile } from "react-device-detect";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { useNavigate } from "react-router-dom";
import { launcherUrl, updateCasinoBalance } from "../../../api";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../../redux/slices/userSlice";

const normalizeGameId = (id) => {
  if (!id) return null;
  if (id.startsWith("DMD")) return id.split("-").pop();
  return id;
};

const CardSkeleton = () => {
  return (
    <div className="flex flex-col w-[126px] animate-pulse">
      <div className="rounded-[10px] overflow-hidden w-[126px] h-[168px] bg-[#2a2a2a]" />
      <div className="h-[10px] bg-[#2a2a2a] mt-2 rounded w-[70%] mx-auto" />
    </div>
  );
};

const ProviderSkeleton = () => {
  return (
    <div className="w-full h-[32px] rounded-[4px] bg-[#2a2a2a] animate-pulse"></div>
  );
};

const FilterSkeleton = () => {
  return (
    <div className="flex gap-2 px-3 mt-3 animate-pulse">
      <div className="w-1/2 h-[26px] bg-[#2a2a2a] rounded"></div>
      <div className="w-1/2 h-[26px] bg-[#2a2a2a] rounded"></div>
    </div>
  );
};

const providerLogos = {
  spribe: "/providerLogo/Spribe.webp",
  ezugi: "/providerLogo/EzugiGaming.webp",
  sagaming: "/providerLogo/AESexy.webp",
  vivo: "/providerLogo/Vivo.webp",
  evolution: "/providerLogo/EvolutionGaming.webp",
  evoplay: "/providerLogo/evoplay.webp",
  jilli: "/providerLogo/jili.webp",
  turbogames: "/providerLogo/turbogames.webp",
  Oddin: "/providerLogo/Oddin.webp",
};

const getProviderLogo = (name) => {
  if (!name) return null;

  const key = name.toLowerCase().replace(/\s/g, "");

  return providerLogos[key] || null;
};

const LiveCasinoPage = ({ tab }) => {
  const { permissionList } = useSelector((state) => state.casinoPermission);
  const domainId = useSelector(selectDomainID());

  const [activeProvider, setActiveProvider] = useState("ALL");
  const [activeCategory, setActiveCategory] = useState("All");

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [gameData, setGameData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(30);

  const swiperRef = useRef(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const providerSliderId = "providers";

  /* LOCKED PROVIDERS */

  const lockedProviders = new Set(
    permissionList
      ?.filter((p) => p.type === "provider")
      ?.map((p) => p.provider?.toLowerCase()),
  );

  /* LOCKED GAMES */

  const lockedGameIds = new Set(
    permissionList
      ?.filter((p) => p.type === "game")
      ?.map((p) => normalizeGameId(p.gameId)),
  );

  /* FETCH CASINO */

  useEffect(() => {
    if (!domainId) return;

    const fetchCasino = async () => {
      try {
        const res = await axios.get(
          `https://api.professor.monster/api/int/getIntCasinos?domainId=${domainId}`,
        );

        const data = (res.data || [])
          .filter((item) => item?.provider?.isAllowed)
          .filter(
            (item) => !lockedProviders.has(item?.provider?.name?.toLowerCase()),
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
          .filter((item) => item.provider.gameList.length > 0);

        setGameData(data);
      } catch (error) {
        toast.error("Casino API failed");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCasino();
  }, [domainId]);

  /* PROVIDERS */

  const providers = useMemo(() => {
    return [...new Set(gameData.map((p) => p.provider?.name))];
  }, [gameData]);

  /* CATEGORY LIST */

  const uniqueCategories = useMemo(() => {
    const categories = new Set();

    gameData
      .filter((p) =>
        activeProvider === "ALL" ? true : p.provider?.name === activeProvider,
      )
      .forEach((p) => {
        p.provider?.gameList?.forEach((game) => {
          const category = game.category?.toLowerCase() || "";

          if (tab === "slots" && !category.includes("slot")) return;
          if (tab === "live" && !category.includes("live")) return;

          if (tab === "ace") {
            if (
              !(
                category.includes("table") ||
                category.includes("blackjack") ||
                category.includes("roulette") ||
                category.includes("poker")
              )
            )
              return;
          }

          if (game.category) {
            const cat = game.category.split("/").pop();
            if (cat) categories.add(cat);
          }
        });
      });

    return ["All", ...categories];
  }, [gameData, activeProvider, tab]);

  /* FILTER GAMES */

  const filteredGames = useMemo(() => {
    return gameData
      .filter((p) =>
        activeProvider === "ALL" ? true : p.provider?.name === activeProvider,
      )
      .flatMap((p) =>
        (p.provider?.gameList || [])
          .filter((game) => {
            const category = game.category?.toLowerCase() || "";

            if (tab === "slots" && !category.includes("slot")) return false;
            if (tab === "live" && !category.includes("live")) return false;

            if (tab === "ace") {
              if (
                !(
                  category.includes("table") ||
                  category.includes("blackjack") ||
                  category.includes("roulette") ||
                  category.includes("poker")
                )
              )
                return false;
            }

            if (activeCategory !== "All") {
              if (!category.includes(activeCategory.toLowerCase()))
                return false;
            }

            if (
              search &&
              !game.name.toLowerCase().includes(search.toLowerCase())
            )
              return false;

            return true;
          })
          .map((game) => ({
            ...game,
            providerName: p.provider?.name || "Unknown",
          })),
      );
  }, [gameData, activeProvider, activeCategory, tab, search]);

  /* IMAGE */

  const getGameImage = (game) => {
    return (
      game.images?.find((img) => img.type === "banner")?.url ||
      "/placeholder.svg"
    );
  };

  /* INFINITE SCROLL */

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        setVisibleCount((prev) => prev + 20);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleGames = filteredGames.slice(0, visibleCount);

  /* PROVIDER CLICK */

  const handleProviderClick = (name, index) => {
    setActiveProvider(name);

    if (swiperRef.current) {
      const swiper = swiperRef.current;

      const slidesPerView = swiper.params.slidesPerView || 3;

      const targetIndex = Math.max(index - Math.floor(slidesPerView / 2), 0);

      swiper.slideTo(targetIndex);
    }
  };

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

    const gameId = game.gameId;

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
    <div className="w-full">
      {/* PROVIDER SECTION */}

      <div className="px-3 bg-[#151515] mt-4 pt-3 pb-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-[14px] font-semibold uppercase">
            প্রোভাইডার নির্বাচন করুন
          </h2>

          <div className="flex gap-2">
            <button
              className={`provider-prev-${providerSliderId} w-[25.5px] h-[25.5px] rounded-[5px] flex items-center justify-center ${
                isBeginning
                  ? "bg-[#2a2a2a] text-gray-500"
                  : "bg-[#3a3a3a] text-white"
              }`}
            >
              <FaCaretLeft size={18} />
            </button>

            <button
              className={`provider-next-${providerSliderId} w-[25.5px] h-[25.5px] rounded-[5px] flex items-center justify-center ${
                isEnd ? "bg-[#2a2a2a] text-gray-500" : "bg-[#3a3a3a] text-white"
              }`}
            >
              <FaCaretRight size={18} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Grid, FreeMode]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          navigation={{
            nextEl: `.provider-next-${providerSliderId}`,
            prevEl: `.provider-prev-${providerSliderId}`,
          }}
          grid={{
            rows: 2,
            fill: "row",
          }}
          freeMode
          spaceBetween={10}
          slidesPerView={3}
          breakpoints={{
            640: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
        >
          <SwiperSlide>
            <button
              onClick={() => handleProviderClick("ALL", 0)}
              className={`w-full h-[32px] rounded-[4px] text-[11px] font-semibold ${
                activeProvider === "ALL"
                  ? "bg-[#757575] text-white "
                  : "bg-[#2a2a2a] text-white"
              }`}
            >
              সমস্ত প্রোভাইডার
            </button>
          </SwiperSlide>

          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <SwiperSlide key={i}>
                  <ProviderSkeleton />
                </SwiperSlide>
              ))
            : providers.map((name, idx) => {
                if (!name) return null;

                if (lockedProviders.has(name.toLowerCase())) return null;

                const providerData = gameData.find(
                  (p) => p.provider?.name === name,
                );

                const hasGame = providerData?.provider?.gameList?.some(
                  (game) => {
                    const category = game.category?.toLowerCase() || "";

                    if (tab === "slots") return category.includes("slot");

                    if (tab === "live") return category.includes("live");

                    if (tab === "ace") {
                      return (
                        category.includes("table") ||
                        category.includes("blackjack") ||
                        category.includes("roulette") ||
                        category.includes("poker")
                      );
                    }

                    return true;
                  },
                );

                if (!hasGame) return null;

                return (
                  <SwiperSlide key={idx}>
                    <button
                      onClick={() => handleProviderClick(name, idx + 1)}
                      className={`w-full h-[32px] rounded-[4px] font-semibold flex items-center justify-center ${
                        activeProvider === name
                          ? "bg-[#757575] border border-[#ffffff33] text-white"
                          : "bg-[#2a2a2a] text-white"
                      }`}
                    >
                      {getProviderLogo(name) ? (
                        <img
                          src={getProviderLogo(name)}
                          alt={name}
                          className="h-[20px] object-contain"
                        />
                      ) : (
                        <span className="text-[11px] uppercase">{name}</span>
                      )}
                    </button>
                  </SwiperSlide>
                );
              })}
        </Swiper>
      </div>

      {/* SEARCH */}

      {isLoading ? (
        <FilterSkeleton />
      ) : (
        <div className="flex gap-2 px-3 mt-3">
          {/* SEARCH */}

          <div className="relative w-1/2">
            <input
              type="text"
              placeholder="অনুসন্ধান করুন"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#00723B] focus:bg-transparent text-white placeholder:text-white border border-[#ffffff33] h-[26px] pl-2 pr-6 text-[11px] rounded w-full outline-none"
            />

            <FaSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-[10px]" />
          </div>

          {/* CATEGORY DROPDOWN */}

          <div className="relative w-1/2">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-[#00723B] text-white h-[26px] border border-[#ffffff33] text-[11px] w-full rounded flex items-center justify-between px-2"
            >
              <span className="truncate">
                {activeCategory === "All" ? "সব" : activeCategory}
              </span>

              <FaChevronDown
                className={`text-[10px] transition-transform duration-200 ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <div className="absolute top-[26px] px-1 left-0 w-full bg-black border border-gray-700 rounded-md z-50 max-h-[250px] overflow-y-auto">
                {uniqueCategories.map((cat) => (
                  <div
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setShowDropdown(false);
                    }}
                    className="px-2 py-2.5 text-[11px] border-b border-[white] text-white hover:bg-gray-800 cursor-pointer"
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAMES */}

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-3 mt-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
          : visibleGames.map((game, i) => (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayClick(game);
                }}
                key={i}
                className="flex flex-col cursor-pointer"
              >
                <div className="rounded-[8px] overflow-hidden h-[150px]">
                  <img
                    src={getGameImage(game)}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="text-center text-[11px] text-gray-300 font-semibold mt-1 truncate">
                  {game.name}
                </p>
              </div>
            ))}
      </div>
    </div>
  );
};

export default LiveCasinoPage;
