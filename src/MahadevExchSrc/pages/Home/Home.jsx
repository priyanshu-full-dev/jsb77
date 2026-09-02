import { useDispatch, useSelector } from "react-redux";
import BannerSlider from "../../components/BannerSlider";
import CategoryGrid from "../../components/CategoryGrid";
import MatchLive from "../../components/MatchLive";
import Navbar from "../../components/Navbar";
import TrendingSection from "../../components/TrendingSection";
import {
  selectDomainID,
  selectSiteBanners,
} from "../../../utils/helper/commonSelectors";
import { useEffect, useState } from "react";
import { updateCasinoSlice } from "../../../redux/slices/casinoSlice";
import { generatePresignedUrl } from "../../../utils/helper/generatePresignedUrl";
import axios from "axios";
import WhatsAppFloat from "../../components/WhatsAppFloat";
import { t } from "../../utils/language";



const CACHE_KEY = "site_banners_cache";
const CACHE_DURATION = 1000 * 60 * 10;

const Home = () => {
  const dispatch = useDispatch();
  const domainId = useSelector(selectDomainID());
  const casinoApiData = useSelector((state) => state.casino.casinoApiData);

  const siteBanners = useSelector(selectSiteBanners());
  const [banners, setBanners] = useState([]);


  

  const fetchBanners = async () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setBanners(data);
          return;
        }
      }

      if (Array.isArray(siteBanners) && siteBanners.length > 0) {
        const bannersWithPresignedUrls = await Promise.all(
          siteBanners.map(async (banner) => {
            const signedUrl = await generatePresignedUrl(banner?.url || banner);
            return {
              url: signedUrl,
              path: banner?.path || "",
            };
          }),
        );

        setBanners(bannersWithPresignedUrls);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: bannersWithPresignedUrls,
            timestamp: Date.now(),
          }),
        );
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    if (siteBanners) {
      fetchBanners();
    }
  }, [siteBanners]);

  const [gamesByCategory, setGamesByCategory] = useState({});

  /* ---------------- GAME CATEGORY MAPPING ---------------- */

  const gameCategories = {
    trending: [
      "Crash X",
      "Aero",
      "Aviator",
      "Chicken Route",
      "Bubbles",
      "Mines",
      "Ball & Ball",
      "Double Roll",
      "Dice Twice",
      "Uncrossable Rush",
    ],

    roulette: [
      "Roulette",
      "Hindi Lightning Roulette",
      "Diamond Roulette",
      "XXXtreme Lightning Roulette",
      "Auto-Roulette",
      "Speed Roulette",
      "Immersive Roulette",
      "Live Roulette",
      "Roulette",
      "Auto Lightning Roulette",
      "Gravity Roulette",
      "Super Speed Roulette",
      "Skyline Roulette",
      "Auto Roulette VIP",
      "Diwali Auto Roulette",
      "VIP Roulette",
      "American Roulette",
    ],

    teenpatti: [
      "Teen Patti 3 Card",
      "One Day Teen Patti",
      "Bet on Teen Patti",
      "Teen Patti",
      "Bet on Teen Patti",
      "M Teen Patti 20-20",
      "M Teen Patti 20-20",
    ],

    dragontiger: [
      "Dragon Tiger",
      "Lightning Dragon Tiger",
      "M Dragon Tiger",
      "D Dragon Tiger",
      "Top Card",
      "Dragon Tiger Jade",
      "Super Speed Dragon Tiger",
      "Dragon Tiger da Sorte",
      "Dragon Tiger Lotus",
    ],

    baccarat: [
      "Baccarat A",
      "Baccarat B",
      "Baccarat",
      "Speed Baccarat A",
      "Baccarat C01",
      "Baccarat C02",
      "Baccarat C03",
      "Baccarat D01",
      "Bac Bo",
      "Speed Baccarat B",
    ],

    poker: [
      "Poker",
      "Video Poker",
      "Triple Card Poker",
      "Joker Poker",
      "Hold'em Poker",
      "AK47",
      "Poker King",
      "Three Card Poker",
    ],
  };

  /* ---------------- FETCH CASINO LIST ---------------- */

  const fetchEzugiGameList = async () => {
    try {
      const res = await axios.get(
        `https://api.professor.monster/api/int/getIntCasinos?domainId=${domainId}`,
      );

      const data = res?.data || [];

      dispatch(updateCasinoSlice({ casinoApiData: data }));
    } catch (error) {
      console.error("Error fetching casino list:", error);
    }
  };

  useEffect(() => {
    if (domainId) fetchEzugiGameList();
  }, [domainId]);

  /* ---------------- UNIQUE GAME EXTRACT ---------------- */

  const getUniqueGames = (casinoApiData) => {
    if (!Array.isArray(casinoApiData)) return [];

    const allGames = casinoApiData.flatMap(
      (providerObj) =>
        providerObj?.provider?.gameList?.map((g) => ({
          id: g.gameId,
          name: g.name,
          img: g.images?.[1]?.url || g.images?.[0]?.url || "",
        })) || [],
    );

    const uniqueMap = new Map();

    allGames.forEach((game) => {
      if (game.name && !uniqueMap.has(game.name)) {
        uniqueMap.set(game.name, game);
      }
    });

    return Array.from(uniqueMap.values());
  };

  /* ---------------- FILTER BY CATEGORY ---------------- */

  useEffect(() => {
    if (!casinoApiData?.length) return;

    const allUniqueGames = getUniqueGames(casinoApiData);

    const categoryData = {};

    Object.keys(gameCategories).forEach((category) => {
      categoryData[category] = allUniqueGames.filter((game) =>
        gameCategories[category].includes(game.name),
      );
    });

    setGamesByCategory(categoryData);
  }, [casinoApiData]);

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-[#1a1a1a] min-h-screen pb-20">
      <Navbar />

      <BannerSlider images={banners} />

      <CategoryGrid />
      <WhatsAppFloat />

      <TrendingSection
        title={t("Trending", "ট্রেন্ডিং")}
        id="1"
        games={gamesByCategory.trending}
      />

      <TrendingSection
        title={t("Roulette", "রুলেট")}
        id="2"
        games={gamesByCategory.roulette}
      />

      <MatchLive />

      <TrendingSection
        title={t("Teen Patti", "তিন পত্তি")}
        id="3"
        games={gamesByCategory.teenpatti}
      />

      <TrendingSection
        title={t("Dragon Tiger", "ড্রাগন টাইগার")}
        id="4"
        games={gamesByCategory.dragontiger}
      />

      <TrendingSection
        title={t("Baccarat", "ব্যাকারাট")}
        id="5"
        games={gamesByCategory.baccarat}
      />

      <TrendingSection title={t("Poker", "পোকার")} id="6" games={gamesByCategory.poker} />
    </div>
  );
};

export default Home;
