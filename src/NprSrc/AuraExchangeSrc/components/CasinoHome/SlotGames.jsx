import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import slotGamesData from "./slotGames.json";

function SlotGames({ searchQuery = "" }) {
  const [activeCard, setActiveCard] = useState(null);

  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;

  const filteredGames = useMemo(() => {
    if (!searchQuery?.trim()) return slotGamesData;
    const query = searchQuery.toLowerCase().trim();
    return slotGamesData.filter((game) =>
      game.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleCardClick = (e) => {
    e.stopPropagation();
    toast.error("Lock by upline");
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
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2.5 gap-y-3.5">
        {filteredGames.map((game, idx) => (
          <div
            key={game.id || idx}
            className={`relative aspect-square rounded-[12px] flex flex-col w-full h-[143px] justify-end transition-transform transform ${
              !isTouchDevice
                ? "hover:scale-125 hover:border-black hover:border-[4px] hover:shadow-md hover:z-50 group"
                : ""
            } ${
              activeCard === idx
                ? "z-50 border-black border-[4px] scale-125 shadow-md"
                : ""
            }`}
            style={{
              boxShadow: "0 5px 9px -3px #000000",
            }}
            onClick={() => {
              if (isTouchDevice) {
                setActiveCard(activeCard === idx ? null : idx);
              }
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-[12px] bg-black cursor-pointer"
              style={{
                backgroundImage: `url(${game.image})`,
                minHeight: "143px",
                height: "143px",
              }}
              onClick={handleCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SlotGames;