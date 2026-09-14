import React from "react";
import CategoryBanners from "../../components/CategoryBanners";
import GameSectionCarousel from "../../components/GameSectionCarousel";
import InPlaySportsWidget from "../../components/InPlaySportsWidget";
import IndianCardGamesSection from "../../components/IndianCardGamesSection";
import Trendinggame from "../../components/Trendinggame";
import UpcomingEvent from "../../components/UpcomingEvent";
import { ORIGINALS_GAMES, GAME_SHOW_GAMES } from "../../data/kuberMockData";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleGameSelect = (game) => {
    navigate(`/casino-play/${game.id}`);
  };

  return (
    <div className="w-full space-y-2 animate-in fade-in duration-200">
      {/* 2x2 Hero Category Banners (Slot Games, Card Games, Fishing Games, Live Casinos) */}
      <CategoryBanners />

      {/* Section 1: Originals / Crash Games / Live Roulette / Money Wheel */}
      <GameSectionCarousel
        title="Trending Games"
        tabs={["Originals", "Crash Games", "Live Roulette", "Money Wheel"]}
        games={ORIGINALS_GAMES}
        onGameClick={handleGameSelect}
        defaultTab="Originals"
      />

      {/* Section 2: Game Show / Lottery / Scratch Card */}
      <GameSectionCarousel
        tabs={["Game Show", "Lottery", "Scratch Card"]}
        games={GAME_SHOW_GAMES}
        onGameClick={handleGameSelect}
        defaultTab="Game Show"
      />

      {/* Section 3: In Play Live Widget (Tennis & Sports odds) */}
      <InPlaySportsWidget />

      {/* Section 4: Indian Card Games with Live Dealers */}
      <IndianCardGamesSection />

      {/* Section 5: Trending Game */}
      <Trendinggame />

      {/* Section 6: Upcoming Events */}
      <UpcomingEvent />
    </div>
  );
};

export default Home;
