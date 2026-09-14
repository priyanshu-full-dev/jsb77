import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { INDIAN_CARD_GAMES_DATA } from "../data/indianCardGamesData";

export default function IndianCardGamesSection() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div title="Indian Card Games" className="py-1 px-[6px] w-full">
      <div className="flex flex-col w-full bg-bg_Quaternary-new rounded-[4px] shadow-homeCasinoCardGamesShadow divide-y">
        {/* Header Bar */}
        <div className="flex items-center w-full py-2 px-2.5 gap-1 rounded-t-[4px] bg-bg_Quaternary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="16"
            height="16"
            x="0"
            y="0"
            viewBox="0 0 511.643 511.643"
            xmlSpace="preserve"
            className="flex-shrink-0"
          >
            <g>
              <path
                d="M453.209 184.081C373.725 121.725 300.804 41.437 270.565 6.713c-7.795-8.951-21.691-8.951-29.486 0-30.24 34.723-103.16 115.011-182.644 177.368C22.372 212.373 1.267 254.915 1.267 299.99c0 80 66.652 144.853 148.871 144.853 27.807 0 53.101-10.455 71.97-27.539v28.247c0 34.386-24.644 38.65-43.766 54.707-4.599 3.862-1.775 11.384 4.23 11.384h145.994c5.984 0 8.811-7.47 4.262-11.358-18.926-16.176-43.294-19.786-43.294-54.478v-28.503c18.869 17.084 44.163 27.539 71.97 27.539 82.219 0 148.871-64.853 148.871-144.853.001-45.074-21.104-87.616-57.166-115.908z"
                fill="#c10b32"
                opacity="1"
              />
            </g>
          </svg>

          <div className="w-[100%] flex flex-row justify-between items-center">
            <span className="text-[#000000] dark:text-white font-bold text-[14px] sm:text-[15px] capitalize tracking-tight">
              Indian Card Games
            </span>
            <div className="flex w-[108.75px] items-center justify-end gap-[5px]">
              <button
                onClick={() => navigate("/live-casino")}
                className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out font-lato text-[#6e091d] dark:text-[#ff6b8b] hover:opacity-80 font-bold text-[13px] leading-[18px] cursor-pointer"
                type="button"
              >
                See All
              </button>
              <button
                onClick={() => handleScroll("left")}
                aria-label="Previous"
                className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[22px] h-[22px] p-1 justify-center items-center gap-[10px] border border-[#f3d2d9] dark:border-white/10 bg-[#f9e7eb] dark:bg-bg_Foundation rounded cursor-pointer active:scale-95"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#c10b32"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M15 6l-6 6l6 6" />
                </svg>
              </button>
              <button
                onClick={() => handleScroll("right")}
                aria-label="Next"
                className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[22px] h-[22px] p-1 justify-center items-center gap-[10px] border border-[#f3d2d9] dark:border-white/10 bg-[#f9e7eb] dark:bg-bg_Foundation rounded cursor-pointer active:scale-95"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#c10b32"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 6l6 6l-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Row Grid Carousel */}
        <div
          id="scrollShow"
          ref={scrollRef}
          className="py-2.5 px-2.5 transition-all ease-in-out duration-200 w-full h-max overflow-x-auto no-scrollbar scrollSmooth"
        >
          <div className="grid grid-rows-3 grid-flow-col gap-1 w-max md:w-full">
            {INDIAN_CARD_GAMES_DATA.map((game) => (
              <div
                key={game.id}
                onClick={() => navigate("/live-casino")}
                className="min-w-[120px] sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] xl:min-w-[200px] 2xl:min-w-[220px] flex aspect-square flex-col items-center justify-center cursor-pointer transition-all ease-in-out duration-100"
              >
                <div className="min-w-[120px] sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] xl:min-w-[200px] 2xl:min-w-[220px] aspect-square max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[180px] xl:max-w-[200px] 2xl:max-w-[220px] bg-transparent flex flex-col transition-all ease-in-out duration-200 relative overflow-hidden rounded-[4px]">
                  <div className="min-w-[120px] sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] xl:min-w-[200px] 2xl:min-w-[220px] aspect-square">
                    <img
                      src={game.image}
                      alt={game.name}
                      width="500"
                      height="auto"
                      className="w-full h-full object-cover rounded-[6px] hover:scale-[103%] transition-all ease-in-out duration-200"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
