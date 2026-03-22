import { useDispatch, useSelector } from "react-redux";
import BannerSlider from "../../components/BannerSlider";
import CategoryGrid from "../../components/CategoryGrid";
import MatchLive from "../../components/MatchLive";
import Navbar from "../../components/Navbar";
import TrendingSection from "../../components/TrendingSection";
import { selectDomainID } from "../../../utils/helper/commonSelectors";
import { useEffect, useState } from "react";
import { updateCasinoSlice } from "../../../redux/slices/casinoSlice";
import axios from "axios";
import WhatsAppFloat from "../../components/WhatsAppFloat";

const images = ["/1.png", "/2.png", "/3.png", "/4.png", "/5.png", "/6.png"];

const Home = () => {
  const dispatch = useDispatch();
  const domainId = useSelector(selectDomainID());
  const casinoApiData = useSelector((state) => state.casino.casinoApiData);

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

      <BannerSlider images={images}/>

      <CategoryGrid />
      <WhatsAppFloat />

      <TrendingSection
        title="Trending"
        id="1"
        games={gamesByCategory.trending}
      />

      <TrendingSection
        title="Roulette"
        id="2"
        games={gamesByCategory.roulette}
      />

      <MatchLive />

      <TrendingSection
        title="Teen Patti"
        id="3"
        games={gamesByCategory.teenpatti}
      />

      <TrendingSection
        title="Dragon Tiger"
        id="4"
        games={gamesByCategory.dragontiger}
      />

      <TrendingSection
        title="Baccarat"
        id="5"
        games={gamesByCategory.baccarat}
      />

      <TrendingSection title="Poker" id="6" games={gamesByCategory.poker} />
    </div>
  );
};

export default Home;
