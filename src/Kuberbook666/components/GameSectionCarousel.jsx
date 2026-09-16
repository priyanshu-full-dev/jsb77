import React, { useState, useRef, useEffect } from "react";
import { openLoginModal, isUserLoggedIn } from "../utils/authModalEvents";

const GameSectionCarousel = ({
  title = "Trending Games",
  tabs = ["Originals", "Crash Games", "Live Roulette", "Money Wheel"],
  games = [],
  onGameClick,
  defaultTab = "Originals",
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]);
  const [promptedGameId, setPromptedGameId] = useState(null);

  // Ref for the cards carousel
  const cardsScrollRef = useRef(null);
  const isCardsDown = useRef(false);
  const cardsStartX = useRef(0);
  const cardsScrollLeft = useRef(0);
  const cardsDraggedDist = useRef(0);
  const [isCardsDragging, setIsCardsDragging] = useState(false);

  // Ref for the header tabs row (cursor se bhi slide kr skte hai)
  const tabsScrollRef = useRef(null);
  const isTabsDown = useRef(false);
  const tabsStartX = useRef(0);
  const tabsScrollLeft = useRef(0);
  const tabsDraggedDist = useRef(0);
  const [isTabsDragging, setIsTabsDragging] = useState(false);

  // Close prompted login overlay on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest("#scrollShow")) {
        setPromptedGameId(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Arrow navigation for the cards carousel
  const handleScroll = (direction) => {
    if (cardsScrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      cardsScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // --- Tabs drag handlers ---
  const handleTabsMouseDown = (e) => {
    if (!tabsScrollRef.current) return;
    isTabsDown.current = true;
    setIsTabsDragging(true);
    tabsStartX.current = e.pageX - tabsScrollRef.current.offsetLeft;
    tabsScrollLeft.current = tabsScrollRef.current.scrollLeft;
    tabsDraggedDist.current = 0;
  };

  const handleTabsMouseMove = (e) => {
    if (!isTabsDown.current || !tabsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    const walk = (x - tabsStartX.current) * 1.5;
    tabsDraggedDist.current += Math.abs(e.movementX);
    tabsScrollRef.current.scrollLeft = tabsScrollLeft.current - walk;
  };

  const handleTabsMouseUp = () => {
    isTabsDown.current = false;
    setIsTabsDragging(false);
  };

  const handleTabsMouseLeave = () => {
    isTabsDown.current = false;
    setIsTabsDragging(false);
  };

  // --- Cards drag handlers ---
  const handleCardsMouseDown = (e) => {
    if (!cardsScrollRef.current) return;
    isCardsDown.current = true;
    setIsCardsDragging(true);
    cardsStartX.current = e.pageX - cardsScrollRef.current.offsetLeft;
    cardsScrollLeft.current = cardsScrollRef.current.scrollLeft;
    cardsDraggedDist.current = 0;
  };

  const handleCardsMouseMove = (e) => {
    if (!isCardsDown.current || !cardsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - cardsScrollRef.current.offsetLeft;
    const walk = (x - cardsStartX.current) * 1.5;
    cardsDraggedDist.current += Math.abs(e.movementX);
    cardsScrollRef.current.scrollLeft = cardsScrollLeft.current - walk;
  };

  const handleCardsMouseUp = () => {
    isCardsDown.current = false;
    setIsCardsDragging(false);
  };

  const handleCardsMouseLeave = () => {
    isCardsDown.current = false;
    setIsCardsDragging(false);
  };

  const handleGameCardClick = (e, game) => {
    e.stopPropagation();
    if (cardsDraggedDist.current > 6) return;

    // If not logged in, prompt Login button as per Image 2
    if (!isUserLoggedIn()) {
      setPromptedGameId(game.id);
      return;
    }

    if (onGameClick) {
      onGameClick(game);
    }
  };

  // Filter games based on selected tab
  const filteredGames = games.filter(
    (g) =>
      !g.category ||
      g.category.toLowerCase() === activeTab?.toLowerCase() ||
      tabs.length <= 1,
  );
  const displayGames = filteredGames.length > 0 ? filteredGames : games;

  return (
    <div title={title} className="py-1 px-[6px] w-full select-none">
      <div className="flex flex-col w-full bg-bg_Quaternary-new rounded-[4px] shadow-homeCasinoCardGamesShadow divide-y">
        {/* Header: Draggable Tabs + Arrow Buttons */}
        <div className="flex items-center justify-between w-full pt-0.5 rounded-t-[4px] px-0.5 bg-bg_Quaternary pr-1">
          {/* Tabs row (cursor se bhi slide kr skte hai!) */}
          <div
            ref={tabsScrollRef}
            onMouseDown={handleTabsMouseDown}
            onMouseMove={handleTabsMouseMove}
            onMouseUp={handleTabsMouseUp}
            onMouseLeave={handleTabsMouseLeave}
            className={`max-w-[85%] flex items-center justify-start overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
              isTabsDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {tabs.map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <div
                  key={tab}
                  onClick={() => {
                    if (tabsDraggedDist.current > 5) return;
                    setActiveTab(tab);
                    setPromptedGameId(null);
                  }}
                  className={`cursor-pointer relative flex active:scale-[97%] items-center justify-start mx-0.5 py-1.5 px-1 rounded-t-[6px] gap-x-0.5 h-full bg-bg_Quaternary border-b-2 transition-colors flex-shrink-0 ${
                    isSelected
                      ? "border-primary text-text_Secondary_game"
                      : "border-transparent text-text_Ternary2 hover:text-white"
                  }`}
                >
                  <span className="text-sm capitalize whitespace-nowrap font-medium">
                    {tab}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Navigation Arrow Buttons */}
          <div className="flex items-center justify-end gap-[5px] flex-shrink-0">
            {/* Left Button */}
            <button
              onClick={() => handleScroll("left")}
              aria-label="Previous"
              className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[22px] h-[22px] p-1 justify-center items-center gap-[10px] text-text_Primary bg-[#f9e7eb] rounded cursor-pointer active:scale-95"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="27"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="var(--color-primary-new, #c10931)"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M15 6l-6 6l6 6"></path>
              </svg>
            </button>

            {/* Right Button */}
            <button
              onClick={() => handleScroll("right")}
              aria-label="Next"
              className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[22px] h-[22px] p-1 justify-center items-center gap-[10px] text-text_Primary bg-[#f9e7eb] rounded cursor-pointer active:scale-95"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="27"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="var(--color-primary-new, #c10931)"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M9 6l6 6l-6 6"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Game Cards Container (100% hidden scrollbar, cursor se slide hota hai) */}
        <div
          id="scrollShow"
          ref={cardsScrollRef}
          onMouseDown={handleCardsMouseDown}
          onMouseMove={handleCardsMouseMove}
          onMouseUp={handleCardsMouseUp}
          onMouseLeave={handleCardsMouseLeave}
          className={`py-2.5 px-2.5 transition-all ease-in-out duration-200 w-full h-max overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isCardsDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="grid grid-rows-1 grid-flow-col gap-1 w-max md:w-full min-w-full no-scrollbar">
            {displayGames.map((game, idx) => {
              const isPrompted = promptedGameId === game.id;

              return (
                <div
                  key={game.id || idx}
                  onClick={(e) => handleGameCardClick(e, game)}
                  className="min-w-[117px] w-[117px] sm:min-w-[140px] sm:w-[140px] md:min-w-[160px] md:w-[160px] max-h-[192px] aspect-[0.83] object-cover relative cursor-pointer"
                >
                  <div className="min-w-[117px] w-[117px] sm:min-w-[140px] sm:w-[140px] md:min-w-[160px] md:w-[160px] flex flex-col bg-bg_Quaternary1 items-start justify-center shadow-GameShadow rounded-[6px]">
                    <div className="relative rounded-[8px] w-full max-h-[192px] aspect-[0.75] overflow-hidden cursor-pointer shadow-sm md:hover:shadow-md">
                      <img
                        src={game.image || "/assets/ballByBall.png"}
                        width="auto"
                        height="auto"
                        className={`w-full h-full transform transition-transform duration-500 ease-in-out pointer-events-none ${
                          isPrompted
                            ? "blur-[3px] scale-105"
                            : "hover:scale-105"
                        }`}
                        alt={game.name || "Ball By Ball"}
                        loading="lazy"
                        title={game.image || "/assets/ballByBall.png"}
                        onError={(e) => {
                          e.currentTarget.src = "/assets/ballByBall.png";
                        }}
                      />

                      {/* Image 2 Login Prompt Overlay */}
                      {isPrompted && (
                        <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] flex items-center justify-center z-20 animate-in fade-in duration-150">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openLoginModal();
                            }}
                            className="px-4 py-1.5 bg-white text-[#6e081d] font-bold text-xs sm:text-sm rounded-full shadow-lg border border-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            type="button"
                          >
                            Login
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSectionCarousel;
