import React, { useState } from "react";
import FullMarketCards3034 from "../FullMarketCards/FullMarketCard3034";
import CT3034CasinoIframe from "../CasinoIframe/CT3034";
import DT202 from "../Result/DT202";

function CT3034({ gameId, data,socketDis }) {
  const [selectedResult, setSelectedResult] = useState(null);
  const [showLucky7b, setShowLucky7b] = useState(false);
  const [selfSuspend, setSelfSuspend] = useState(false);

  const defaultCardProps = {
    layout: "col",
    bgColor: "#72bbef",
    cardWidth: "110px",
    cardPadding: "4px 0",
    shadow: "0 2px 7px 1px #67828be6",
    labelColor: "black",
    oddsColor: "black",
    valueColor: "black",
  };

  const gameData = Array.isArray(data) ? data : data?.data?.t2 || [];

  const isSuspended = gameData?.[0]?.gstatus === "0"||socketDis
  const roundId = gameData?.[0]?.mid;

  // Custom Odds
  const customOdds = {
    WINNER: {
      "DRAGON": { odds: 2, value: 100000 },
      "TIE": { odds: 2, value: 100000 },
      "TIGER": { odds: 2, value: 100000 },
    },
    "DRAGON ODD/EVEN": {
      Odd: { odds: 2.10, value: 300000 },
      Even: { odds: 1.79, value: 300000 },
    },
    "TIGER ODD/EVEN": {
        Odd: { odds: 2.10, value: 300000 },
        Even: { odds: 1.79, value: 300000 },
      },
    "DRAGON CARD COLOR": {
      Red: { odds: 1.95, value: 300000 },
      Black: { odds: 1.95, value: 300000 },
    },
    "TIGER CARD COLOR": {
        Red: { odds: 1.95, value: 300000 },
        Black: { odds: 1.95, value: 300000 },
      },
    "DRAGON CARDS": {
      "Card 1": { odds: 12, value: 50000 },
      "Card 2": { odds: 12, value: 50000 },
      "Card 3": { odds: 12, value: 50000 },
      "Card 4": { odds: 12, value: 50000 },
      "Card 5": { odds: 12, value: 50000 },
      "Card 6": { odds: 12, value: 50000 },
      "Card 7": { odds: 12, value: 50000 },
      "Card 8": { odds: 12, value: 50000 },
      "Card 9": { odds: 12, value: 50000 },
      "Card 10": { odds: 12, value: 50000 },
      "Card J": { odds: 12, value: 50000 },
      "Card Q": { odds: 12, value: 50000 },
      "Card K": { odds: 12, value: 50000 },
    },
    "TIGER CARDS": {
        "Card 1": { odds: 12, value: 50000 },
        "Card 2": { odds: 12, value: 50000 },
        "Card 3": { odds: 12, value: 50000 },
        "Card 4": { odds: 12, value: 50000 },
        "Card 5": { odds: 12, value: 50000 },
        "Card 6": { odds: 12, value: 50000 },
        "Card 7": { odds: 12, value: 50000 },
        "Card 8": { odds: 12, value: 50000 },
        "Card 9": { odds: 12, value: 50000 },
        "Card 10": { odds: 12, value: 50000 },
        "Card J": { odds: 12, value: 50000 },
        "Card Q": { odds: 12, value: 50000 },
        "Card K": { odds: 12, value: 50000 },
      },
  };

  const groups = {
    WINNER: {
      DRAGON: { label: "DRAGON" },
      TIE: { label: "TIE" },
      TIGER: { label: "TIGER" },
    },
  
    "DRAGON ODD/EVEN": {
      Odd: { label: "ODD" },
      Even: { label: "EVEN" },
    },
  
    "TIGER ODD/EVEN": {
      Odd: { label: "ODD" },
      Even: { label: "EVEN" },
    },
  
    "DRAGON CARD COLOR": {
      Red: { label: "RED", color: "red", icons: ["♦", "♥"] },
      Black: { label: "BLACK", color: "black", icons: ["♠", "♣"] },
    },
  
    "TIGER CARD COLOR": {
      Red: { label: "RED", color: "red", icons: ["♦", "♥"] },
      Black: { label: "BLACK", color: "black", icons: ["♠", "♣"] },
    },
  
    "DRAGON CARDS": {
      "Card 1": { label: "A", image: "/cards/A.webp" },
      "Card 2": { label: "2", image: "/cards/2.webp" },
      "Card 3": { label: "3", image: "/cards/3.webp" },
      "Card 4": { label: "4", image: "/cards/4.webp" },
      "Card 5": { label: "5", image: "/cards/5.webp" },
      "Card 6": { label: "6", image: "/cards/6.webp" },
      "Card 7": { label: "7", image: "/cards/7.webp" },
      "Card 8": { label: "8", image: "/cards/8.webp" },
      "Card 9": { label: "9", image: "/cards/9.webp" },
      "Card 10": { label: "10", image: "/cards/10.webp" },
      "Card J": { label: "J", image: "/cards/J.webp" },
      "Card Q": { label: "Q", image: "/cards/Q.webp" },
      "Card K": { label: "K", image: "/cards/K.webp" },
    },
  
    "TIGER CARDS": {
      "Card 1": { label: "A", image: "/cards/A.webp" },
      "Card 2": { label: "2", image: "/cards/2.webp" },
      "Card 3": { label: "3", image: "/cards/3.webp" },
      "Card 4": { label: "4", image: "/cards/4.webp" },
      "Card 5": { label: "5", image: "/cards/5.webp" },
      "Card 6": { label: "6", image: "/cards/6.webp" },
      "Card 7": { label: "7", image: "/cards/7.webp" },
      "Card 8": { label: "8", image: "/cards/8.webp" },
      "Card 9": { label: "9", image: "/cards/9.webp" },
      "Card 10": { label: "10", image: "/cards/10.webp" },
      "Card J": { label: "J", image: "/cards/J.webp" },
      "Card Q": { label: "Q", image: "/cards/Q.webp" },
      "Card K": { label: "K", image: "/cards/K.webp" },
    },
  };
  

  let groupedOptions = Object.entries(groups).map(
    ([title, nations], groupIndex) => {
      const options = Object.keys(nations).map((nation) => {
        const item = gameData.find((g) => g.nation === nation) || {};
        const config = nations[nation];
        const custom = customOdds[title]?.[nation] || {};

        return {
          label: config.label,
          image: config.image || null,
          icons: config.icons || null,
          color: config.color || null,
          odds: custom.odds ?? item.rate ?? "-",
          value: custom.value ?? item.bs1 ?? "-",
          selectionId: item.sid || `${nation}-${groupIndex}`,
          marketId: `${gameId}${groupIndex + 1}`,
          market: title,
          mid: roundId || null,
        };
      });

      let min, max;

      if (title === "LUCKY CARD SUIT") {
        min = 50;
        max = 25000;
      } else {
        const itemForLimits = gameData.find((g) => g.nation in nations) || {};
        min = itemForLimits.min;
        max = itemForLimits.max;
      }

      return { title, options, min, max };
    }
  );

  return (
    <div className="relative w-full">
      <div className="relative w-full h-full overflow-hidden">
        {/* Video Overlay */}
        {/* <div className="absolute top-0 left-0 w-full h-full z-[10] pointer-events-none">
          <video
            src={"/winner.mp4"}
            loop
            muted
            autoPlay
            playsInline
            className="w-full h-full object-cover mix-blend-lighten"
          />
        </div> */}

        {/* Casino Game */}
        <CT3034CasinoIframe
          gameId={gameId}
          data={data}
          setSelfSuspend={(bool)=> setSelfSuspend(bool)}
        />
      </div>

      {groupedOptions.map(
        (group, idx) =>
          group.options?.length > 0 && (
            <FullMarketCards3034
              key={idx}
              title={group.title}
              options={group.options}
              min={50}
              max={25000}
              {...defaultCardProps}
              eventId={gameId}
              eventNames={"dt202"}
              isSuspended={isSuspended || gameData.length === 0 || selfSuspend }
            />
          )
      )}

      {/* Recent Results */}
      {Array.isArray(data?.data?.results) && data?.data.results.length > 0 && (
        <div className="bg-black px-2 flex justify-start items-center overflow-x-scroll max-w-[100vw] mt-2 py-4 max-[575px]:py-0 overflow-y-hidden">
          <p className="text-white font-bold text-[0.9rem] max-[500px]:text-[0.8rem] max-[575px]:min-w-24">
            Recent Result
          </p>
          <div className="flex gap-2 pl-2 grow">
            {data?.data.results.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedResult(item);
                  setShowLucky7b(true);
                }}
                className={`${
                  item?.result == "D"
                    ? "bg-[#72bbef]"
                    : item?.result == "T"
                    ? "bg-[#f9a9ba]"
                    : "bg-yellow-300"
                } w-8 h-6 rounded-l-[20px] my-[4px] rounded-r-[20px] text-black font-bold grid place-items-center max-[550px]:text-[0.8rem]`}
              >
                {item?.result }
              </button>
            ))}
          </div>
        </div>
      )}

      <DT202
        isOpen={showLucky7b}
        onClose={() => setShowLucky7b(false)}
        result={selectedResult}
        gameId={gameId}
      />
    </div>
  );
}

export default CT3034;
