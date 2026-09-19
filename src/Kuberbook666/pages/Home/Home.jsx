import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { isMobile } from "react-device-detect";

import CategoryBanners from "../../components/CategoryBanners";
import GameSectionCarousel from "../../components/GameSectionCarousel";
import InPlaySportsWidget from "../../components/InPlaySportsWidget";
import IndianCardGamesSection from "../../components/IndianCardGamesSection";
import Trendinggame from "../../components/Trendinggame";
import UpcomingEvent from "../../components/UpcomingEvent";
import CasinoPointNoticeModal from "../../components/CasinoPointNoticeModal";
import KuberScreenLoader from "../../components/Loader/KuberScreenLoader";
import { getCache, setCache } from "../../utils/cache";

import { updateCasinoSlice } from "../../../redux/slices/casinoSlice";
import { launcherUrl, updateCasinoBalance } from "../../../api";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../../redux/slices/userSlice";
import { openLoginModal, isUserLoggedIn } from "../../utils/authModalEvents";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Granular Narrow Selectors
  const casinoApiData = useSelector((state) => state.casino?.casinoApiData);

  const isLoggedIn = useSelector((state) => state.user?.isLoggedIn);
  const loginType = useSelector((state) => state.user?.loggedInType);
  const userData = useSelector((state) => state?.user?.userData);
  const siteCasinoData = useSelector((state) => state?.siteCasino);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGameForNotice, setSelectedGameForNotice] = useState(null);

  /* ---------------- FETCH CASINO API DATA (SMART CACHING) ---------------- */
  useEffect(() => {
    const cacheKey = "casino_data_all";
    const cached = getCache(cacheKey, 24 * 60 * 60 * 1000);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      if (!casinoApiData || casinoApiData.length === 0) {
        dispatch(updateCasinoSlice({ casinoApiData: cached }));
      }
    }

    const fetchCasinoData = async () => {
      try {
        const res = await axios.get(
          "https://api.professor.monster/api/int/getIntCasinos",
          { timeout: 15000 }
        );
        const data = res?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setCache(cacheKey, data);
          dispatch(updateCasinoSlice({ casinoApiData: data }));
        }
      } catch (error) {
        console.error("Error fetching casino list for Kuber Home:", error);
      }
    };

    fetchCasinoData();
  }, [dispatch]);

  /* ---------------- EXTRACT ALL UNIQUE GAMES ---------------- */
  const allUniqueGames = useMemo(() => {
    if (!Array.isArray(casinoApiData) || casinoApiData.length === 0) return [];

    const games = [];
    const uniqueMap = new Map();

    casinoApiData.forEach((providerObj) => {
      providerObj?.provider?.gameList?.forEach((g) => {
        if (g.name && !uniqueMap.has(g.name)) {
          const bannerImg =
            g.images?.find((i) => i.type === "banner" || i.type === "portrait")
              ?.url ||
            g.images?.[1]?.url ||
            g.images?.[0]?.url ||
            "";

          const item = {
            id: g.gameId,
            gameId: g.gameId,
            name: g.name,
            image: bannerImg,
            img: bannerImg,
            category: g.category || "",
            provider: providerObj?.provider?.name || "",
            rawGame: g,
          };
          uniqueMap.set(g.name, item);
          games.push(item);
        }
      });
    });

    return games;
  }, [casinoApiData]);

  /* ---------------- CATEGORIZATION FOR KUBER UI SECTIONS ---------------- */
  const {
    trendingSectionGames,
    gameShowSectionGames,
    indianCardGames,
    trendingGamesList,
  } = useMemo(() => {
    if (!allUniqueGames || allUniqueGames.length === 0) {
      return {
        trendingSectionGames: {},
        gameShowSectionGames: {},
        indianCardGames: [],
        trendingGamesList: [],
      };
    }

    const findGame = (name) =>
      allUniqueGames.find(
        (g) =>
          g.name.toLowerCase() === name.toLowerCase() ||
          g.name.toLowerCase().includes(name.toLowerCase()),
      );

    // --- Section 1: Trending Games Tabs ---
    // Tab 1: Originals (Exact order as in screenshot: Ball By Ball, Aviator, Mines, Crash X, etc.)
    const prioritizedOriginals = [
      "Ball & Ball",
      "Aviator",
      "Mines",
      "Crash X",
      "Aero",
      "Double Roll",
      "Dice Twice",
      "Chicken Route",
      "Bubbles",
      "Balloon",
      "Plinko",
      "Goal",
      "Hi Lo",
      "Hotline",
      "Dice",
      "Limbo",
      "Uncrossable Rush",
      "Bayraktar",
      "Turbo Plinko",
      "Minesweeper",
    ];
    const originals = [];
    prioritizedOriginals.forEach((n) => {
      const g = findGame(n);
      if (g && !originals.some((x) => x.id === g.id)) originals.push(g);
    });
    allUniqueGames.forEach((g) => {
      if (
        (g.category.includes("INSTANTWIN") ||
          g.category.includes("CRASH") ||
          g.provider === "spribe" ||
          g.provider === "turbogames") &&
        !originals.some((x) => x.id === g.id)
      ) {
        originals.push(g);
      }
    });

    // Tab 2: Crash Games
    const prioritizedCrash = [
      "Aviator",
      "Crash X",
      "Balloon",
      "Aero",
      "JetX",
      "Cricket Crash",
      "Space XY",
      "Limbo Rider",
      "Spaceman",
      "Pilot",
      "Double Roll",
      "Magnify Man",
      "F777 Fighter",
      "Red Baron",
      "Balloon Race",
    ];
    const crashGames = [];
    prioritizedCrash.forEach((n) => {
      const g = findGame(n);
      if (g && !crashGames.some((x) => x.id === g.id)) crashGames.push(g);
    });
    allUniqueGames.forEach((g) => {
      if (
        (g.category.includes("CRASH") ||
          [
            "aviator",
            "crash",
            "balloon",
            "aero",
            "jetx",
            "mines",
            "double roll",
            "limbo",
          ].some((k) => g.name.toLowerCase().includes(k))) &&
        !crashGames.some((x) => x.id === g.id)
      ) {
        crashGames.push(g);
      }
    });

    // Tab 3: Live Roulette
    const liveRoulette = allUniqueGames.filter(
      (g) =>
        g.category.includes("ROULETTE") ||
        g.name.toLowerCase().includes("roulette"),
    );

    // Tab 4: Money Wheel
    const prioritizedMoneyWheel = [
      "Crazy Time",
      "Dream Catcher",
      "MONOPOLY Live",
      "Mega Wheel",
      "Sweet Bonanza Candyland",
      "Funky Time",
      "3X Wow Wheels",
      "Monopoly Big Baller",
      "First Person Dream Catcher",
      "Crazy Time A",
    ];
    const moneyWheel = [];
    prioritizedMoneyWheel.forEach((n) => {
      const g = findGame(n);
      if (g && !moneyWheel.some((x) => x.id === g.id)) moneyWheel.push(g);
    });
    allUniqueGames.forEach((g) => {
      if (
        ["wheel", "dream catcher", "crazy time", "monopoly", "mega wheel"].some(
          (k) => g.name.toLowerCase().includes(k),
        ) &&
        !moneyWheel.some((x) => x.id === g.id)
      ) {
        moneyWheel.push(g);
      }
    });

    // --- Section 2: Game Show / Lottery / Scratch Card ---
    // Tab 1: Game Show (Strictly Live Shows)
    const prioritizedGameShow = [
      "Crazy Time",
      "MONOPOLY Live",
      "Mega Ball",
      "Deal or No Deal",
      "Dream Catcher",
      "Lightning Dice",
      "Funky Time",
      "Boom City",
      "Football Studio",
      "Cash or Crash",
      "Dead or Alive: Saloon",
      "Crazy Pachinko",
      "Crazy Coin Flip",
      "Crazy Balls",
      "Balloon Race",
      "Carnival Treasure",
    ];
    const gameShow = [];
    prioritizedGameShow.forEach((n) => {
      const g = findGame(n);
      if (g && !gameShow.some((x) => x.id === g.id)) gameShow.push(g);
    });
    allUniqueGames.forEach((g) => {
      if (
        [
          "crazy time",
          "monopoly",
          "deal or no deal",
          "dream catcher",
          "mega ball",
          "lightning dice",
          "funky time",
          "boom city",
          "football studio",
          "cash or crash",
          "saloon",
          "pachinko",
          "coin flip",
          "crazy balls",
          "balloon race",
        ].some((k) => g.name.toLowerCase().includes(k)) &&
        !gameShow.some((x) => x.id === g.id)
      ) {
        gameShow.push(g);
      }
    });

    // Tab 2: Lottery
    const prioritizedLottery = [
      "Keno",
      "Keno 80",
      "16 Coins Burning Board",
      "3 Numbers",
      "30-ball Bingo",
      "Bingo",
      "Lotto",
      "Lucky 5",
      "Lucky 6",
      "Lucky 7",
      "Color Game",
      "Mega 6",
      "Bet on Numbers",
    ];
    const lottery = [];
    prioritizedLottery.forEach((n) => {
      const g = findGame(n);
      if (g && !lottery.some((x) => x.id === g.id)) lottery.push(g);
    });
    allUniqueGames.forEach((g) => {
      if (
        (g.category.includes("LOTTERY") ||
          [
            "keno",
            "bingo",
            "lotto",
            "lucky 5",
            "lucky 6",
            "lucky 7",
            "color game",
            "numbers",
            "mega 6",
          ].some((k) => g.name.toLowerCase().includes(k))) &&
        !lottery.some((x) => x.id === g.id)
      ) {
        lottery.push(g);
      }
    });

    // Tab 3: Scratch Card
    const scratchCard = allUniqueGames.filter(
      (g) =>
        g.category.includes("SCRATCH") ||
        g.name.toLowerCase().includes("scratch") ||
        g.name.toLowerCase().includes("burning board"),
    );

    // --- Section 4: Indian Card Games ---
    const indianCards = allUniqueGames.filter(
      (g) =>
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
          "baccarat",
          "poker",
          "matka",
          "worli",
          "bollywood",
          "joker",
        ].some((k) => g.name.toLowerCase().includes(k)) ||
        g.category.includes("TEEN_PATTI") ||
        g.category.includes("BACCARAT_DRAGON_TIGER"),
    );

    // --- Section 5: Top Trending Games ---
    const trendingGames = [
      ...originals.slice(0, 8),
      ...liveRoulette.slice(0, 8),
      ...indianCards.slice(0, 8),
    ];

    return {
      trendingSectionGames: {
        Originals:
          originals.length > 0 ? originals : allUniqueGames.slice(0, 15),
        "Crash Games":
          crashGames.length > 0 ? crashGames : allUniqueGames.slice(0, 15),
        "Live Roulette":
          liveRoulette.length > 0 ? liveRoulette : allUniqueGames.slice(0, 15),
        "Money Wheel":
          moneyWheel.length > 0 ? moneyWheel : allUniqueGames.slice(0, 15),
      },
      gameShowSectionGames: {
        "Game Show":
          gameShow.length > 0 ? gameShow : allUniqueGames.slice(0, 15),
        Lottery: lottery.length > 0 ? lottery : allUniqueGames.slice(0, 15),
        "Scratch Card":
          scratchCard.length > 0 ? scratchCard : allUniqueGames.slice(0, 15),
      },
      indianCardGames:
        indianCards.length > 0 ? indianCards : allUniqueGames.slice(0, 24),
      trendingGamesList:
        trendingGames.length > 0 ? trendingGames : allUniqueGames.slice(0, 20),
    };
  }, [allUniqueGames]);

  /* ---------------- OPEN NOTICE MODAL ON GAME CLICK ---------------- */
  const handleGameSelect = (game) => {
    const loggedIn = isLoggedIn || isUserLoggedIn();

    if (!loggedIn) {
      openLoginModal();
      return;
    }

    // Open "PLEASE NOTE" (1 Point = ₹10) modal first as requested
    setSelectedGameForNotice(game);
  };

  /* ---------------- PLAY GAME LAUNCHER (AFTER USER AGREES) ---------------- */
  const launchGame = async (game) => {
    if (!game || isProcessing) return;

    setIsProcessing(true);

    const gameId = game?.id || game?.gameId;

    if (loginType === "" || loginType === "demo") {
      toast.error("login with real id");
      setIsProcessing(false);
      setSelectedGameForNotice(null);
      return;
    }

    let amount = (userData?.availableBalance || 0) - (userData?.exposure || 0);
    let siteCasinoBalance = siteCasinoData?.casinoBalance || 0;

    let finalAmountToDeduct = Math.min(amount, siteCasinoBalance);

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
      setSelectedGameForNotice(null);
      setIsProcessing(false);
    }
  };

  const cricketStatus = useSelector((state) => state.matches?.cricket?.status);
  const isPageInitialLoading =
    (!casinoApiData || casinoApiData.length === 0) &&
    cricketStatus === "loading";

  if (isPageInitialLoading) {
    return <KuberScreenLoader />;
  }

  return (
    <div className="w-full space-y-2 animate-in fade-in duration-200">
      {/* 2x2 Hero Category Banners (Slot Games, Card Games, Fishing Games, Live Casinos) */}
      <CategoryBanners />

      {/* Section 1: Originals / Crash Games / Live Roulette / Money Wheel */}
      <GameSectionCarousel
        title="Trending Games"
        tabs={["Originals", "Crash Games", "Live Roulette", "Money Wheel"]}
        games={trendingSectionGames}
        onGameClick={handleGameSelect}
        defaultTab="Originals"
      />

      {/* Section 2: Game Show / Lottery / Scratch Card */}
      <GameSectionCarousel
        tabs={["Game Show", "Lottery", "Scratch Card"]}
        games={gameShowSectionGames}
        onGameClick={handleGameSelect}
        defaultTab="Game Show"
      />

      {/* Section 3: In Play Live Widget (Tennis & Sports odds) */}
      <InPlaySportsWidget />

      {/* Section 4: Indian Card Games with Live Dealers */}
      <IndianCardGamesSection
        games={indianCardGames}
        onGameClick={handleGameSelect}
      />

      {/* Section 5: Trending Game */}
      <Trendinggame games={trendingGamesList} onGameClick={handleGameSelect} />

      {/* Section 6: Upcoming Events */}
      <UpcomingEvent />

      {/* PLEASE NOTE (1 Point = ₹10) Modal */}
      <CasinoPointNoticeModal
        isOpen={Boolean(selectedGameForNotice)}
        onClose={() => setSelectedGameForNotice(null)}
        onAgree={() => launchGame(selectedGameForNotice)}
        loading={isProcessing}
        chipValue="1 Point = ₹10"
      />
    </div>
  );
};

export default Home;
