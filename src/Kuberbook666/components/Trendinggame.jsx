import PropTypes from "prop-types";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TRENDING_GAMES_DATA } from "../data/trendingGamesData";

export default function Trendinggame({ games = [], onGameClick }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const displayGames = Array.isArray(games) && games.length > 0 ? games : TRENDING_GAMES_DATA;

  const handleCardClick = (game) => {
    if (onGameClick) {
      onGameClick(game);
    } else {
      navigate("/crash");
    }
  };

  return (
    <div title="Trending Game" className="py-1 px-[6px] w-full">
      <div className="flex flex-col w-full bg-bg_Quaternary-new rounded-[4px] shadow-homeCasinoCardGamesShadow divide-y">
        {/* Header Bar: Spade Icon + Title (No See All or Arrows) */}
        <div className="flex items-center w-full py-2 px-2.5 gap-1 rounded-t-[4px] bg-bg_Quaternary !pb-0">
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
          <div className="w-[100%] flex flex-row justify-between">
            <span className="text-[#000000] dark:text-white font-bold text-[14px] sm:text-[15px] capitalize">
              Trending Game
            </span>
          </div>
        </div>

        {/* 2-Row Horizontal Scroll Grid */}
        <div
          id="scrollShow"
          ref={scrollRef}
          className="py-2.5 px-2.5 transition-all ease-in-out duration-200 w-full h-max overflow-x-auto no-scrollbar scrollSmooth"
        >
          <div className="grid grid-rows-2 grid-flow-col gap-1 w-max md:w-full">
            {displayGames.map((game, idx) => {
              const gameImg = game.image || game.img || "/placeholder.svg";
              return (
                <div
                  key={game.id || game.gameId || idx}
                  onClick={() => handleCardClick(game)}
                  className="w-[108px] sm:w-[215px] aspect-[0.79] bg-transparent flex flex-col transition-all ease-in-out duration-200 relative overflow-hidden rounded-[4px] cursor-pointer"
                >
                  <div className="aspect-[0.79] h-full">
                    <img
                      src={gameImg}
                      width="500"
                      height="auto"
                      className="w-full h-full object-cover rounded-[6px] hover:scale-[103%] transition-all ease-in-out duration-200"
                      alt={game.name || game.title || "Trending Game"}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/aviator.png";
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Trendinggame.propTypes = {
  games: PropTypes.array,
  onGameClick: PropTypes.func,
};
