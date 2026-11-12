import { useOutletContext } from "react-router-dom";
import HeroCarousel from "../../components/HeroCarousel";
import NewsTicker from "../../components/NewsTicker";
import FloatingWidgets from "../../components/FloatingWidgets";
import JackpotSection from "../../components/JackpotSection";
import GameSection from "../../components/GameSection";

const Home = () => {
  const { onOpenLogin, onOpenRegister } = useOutletContext() || {};

  const handleSelectGame = (game) => {
    alert(`Launching ${game.title} (${game.provider})...\nPlease Login or Register to play with real NPR.`);
    if (onOpenLogin) onOpenLogin();
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Carousel Banner */}
      <HeroCarousel onActionClick={onOpenRegister} />

      {/* 2. News Ticker / Marquee */}
      <NewsTicker />

      {/* 3. Floating Video Teaser */}
      <FloatingWidgets onOpenFeatured={() => alert("Opening Featured Games Lobby...")} />

      {/* 4. 3D JACKPOT Counter */}
      <JackpotSection />

      {/* 5. Vertical Categories Sidebar & 3-Column Games Grid */}
      <GameSection onSelectGame={handleSelectGame} />
    </div>
  );
};

export default Home;
