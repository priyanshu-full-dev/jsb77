
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MobileBottomNavbar from "../../../components/Header/MobileBottomNavbar";
import TopHeader from "../../../components/Header/TopHeader";

const GameLobby = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gameId = searchParams.get("gameId");

  useEffect(() => {
    const handlePopState = () => {
      navigate("/cricket", { replace: true });
    };

    window.history.pushState({ gameLobby: true }, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  if (!gameId) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Game URL missing. Please launch the game again.
      </div>
    );
  }

  return (
    <div className="flex bg-[black] h-dvh w-full flex-col overflow-hidden bg-black">
      {/* Header */}
      <div className="h-[60px]">
        <TopHeader />
      </div>


      <main className="min-h-0 w-full flex-1 overflow-hidden">
        <iframe
          key={gameId}
          src={gameId}
          title="Game Lobby"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="block h-full w-full border-0"
        />
      </main>

      {/* Footer / bottom navbar */}

        <MobileBottomNavbar />

    </div>
  );
};

export default GameLobby;
