import React, { useEffect, useState } from "react";
import FullMarketCards from "../FullMarketCards/FullMarketCards";
import CT3030CasinoIframe from "../CasinoIframe/CT3030";
import Teen20 from "../Result/Teen20";

function CT3030({ gameId, data, socketDis }) {
  // console.error({ gameId, data, socketDis });

  const [selectedResult, setSelectedResult] = useState(null);
  const [showTeen20, setShowTeen20] = useState(false);
  const [roundId, setRoundId] = useState(null);
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

  const isSuspended =
    gameData?.[0]?.gstatus === "0" ||
    gameData?.[0]?.gstatus === undefined ||
    data?.data?.t1?.[0]?.desc !== "1,1,1,1,1,1" ||
    selfSuspend ||
    socketDis;

  useEffect(() => {
    const newRoundId = gameData?.[0]?.mid;

    if (newRoundId !== undefined) {
      setRoundId(newRoundId);
    }
  }, [gameData]);


  const multiplier = {
    pair: 1,
    flush: 4,
    straight: 6,
    trio: 30,
    "straight flush": 40,
  };


  const groupedOptions = [
    {
      title: "WINNER",
      options: [
        {
          label: "Player A",
          odds: 1.98,
          value: "1875476",
          selectionId: "winner-a",
          marketId: `${gameId}-1`,
          market: "WINNER",
          mid: roundId,
          game_id: gameId
        },
        {
          label: "Player B",
          odds: 1.98,
          value: "1787235",
          selectionId: "winner-b",
          marketId: `${gameId}-1`,
          market: "WINNER",
          mid: roundId,
          game_id: gameId,
        },
      ],
      min: 50,
      max: 25000,
    },

    {
      title: "3 BACCARAT",
      options: [
        {
          label: "Baccarat A",
          odds: 1.98,
          value: "500000",
          selectionId: "baccarat-a",
          marketId: `${gameId}-11`,
          market: "BACCARAT",
          mid: roundId,
          game_id: gameId,

        },
        {
          label: "Baccarat B",
          odds: 1.98,
          value: "500000",
          selectionId: "baccarat-b",
          marketId: `${gameId}-11`,
          market: "BACCARAT",
          mid: roundId,
          game_id: gameId,

        },
      ],
      min: 50,
      max: 25000,
    },

    {
      title: "TOTAL",
      options: [
        {
          label: "Total A",
          odds: 2,
          value: "500000",
          selectionId: "total-a",
          marketId: `${gameId}-10`,
          market: "TOTAL",
          mid: roundId,
          game_id: gameId,

        },
        {
          label: "Total B",
          odds: 2,
          value: "500000",
          selectionId: "total-b",
          marketId: `${gameId}-10`,
          market: "TOTAL",
          mid: roundId,
          game_id: gameId,

        },
      ],
      min: 50,
      max: 25000,
    },



    // {
    //   title: "COLOR",
    //   options: [
    //     {
    //       label: "Black A",
    //       odds: 1.98,
    //       value: "500000",
    //       selectionId: "black-a",
    //       marketId: `${gameId}-12`,
    //       market: "COLOR",
    //       mid: roundId,
    //       color: "black", icons: ["♠", "♣"]
    //     },
    //     {
    //       label: "Red A",
    //       odds: 1.98,
    //       value: "500000",
    //       selectionId: "red-a",
    //       marketId: `${gameId}-12`,
    //       market: "COLOR",
    //       mid: roundId,
    //       color: "red", icons: ["♦", "♥"]
    //     },
    //   ],
    //   min: 100,
    //   max: 100000,
    // },
    //
    // {
    //   title: "",
    //   options: [
    //     {
    //       label: "Black B",
    //       odds: 1.98,
    //       value: "500000",
    //       selectionId: "black-b",
    //       marketId: `${gameId}-13`,
    //       market: "COLOR",
    //       mid: roundId,
    //       color: "black", icons: ["♠", "♣"]

    //     },
    //     {
    //       label: "Red B",
    //       odds: 1.98,
    //       value: "500000",
    //       selectionId: "red-b",
    //       marketId: `${gameId}-13`,
    //       market: "COLOR",
    //       mid: roundId,
    //       color: "red", icons: ["♦", "♥"]
    //     },
    //   ],
    //   min: 100,
    //   max: 100000,
    // },

    // {
    //   title: "PAIR PLUS",
    //   options: [
    //     {
    //       label: "Flush A",
    //       odds: multiplier.flush,
    //       value: "500000",
    //       selectionId: "flush-a",
    //       marketId: `${gameId}-14`,
    //       market: "FLUSH",
    //       mid: roundId,
    //       game_id: gameId,

    //     },
    //     {
    //       label: "Flush B",
    //       odds: multiplier.flush,
    //       value: "500000",
    //       selectionId: "flush-b",
    //      marketId: `${gameId}-14`,
    //       market: "FLUSH",
    //       mid: roundId,
    //       game_id: gameId,

    //     },
    //   ],
    //   min: 100,
    //   max: 100000,
    // },


    // {
    //   title: "",
    //   options: [
    //     {
    //       label: "Straight A",
    //       odds: multiplier.straight,
    //       value: "500000",
    //       selectionId: "straight-a",
    //      marketId: `${gameId}-14`,
    //       market: "STRAIGHT",
    //       mid: roundId,
    //       game_id: gameId,

    //     },
    //     {
    //       label: "Straight B",
    //       odds: multiplier.straight,
    //       value: "500000",
    //       selectionId: "straight-b",
    //          marketId: `${gameId}-14`,
    //       market: "STRAIGHT",
    //       mid: roundId,
    //       game_id: gameId,

    //     },
    //   ],
    //   min: 100,
    //   max: 100000,
    // },
    // {
    //   title: "",
    //   options: [
    //     {
    //       label: "Trio A",
    //       odds: multiplier.trio,
    //       value: "500000",
    //       selectionId: "trio-a",
    //           marketId: `${gameId}-14`,
    //       market: "TRIO",
    //       mid: roundId,
    //       game_id: gameId,

    //     },
    //     {
    //       label: "Trio B",
    //       odds: multiplier.trio,
    //       value: "500000",
    //       selectionId: "trio-b",
    //           marketId: `${gameId}-14`,
    //       market: "TRIO",
    //       mid: roundId,
    //       game_id: gameId,

    //     },
    //   ],
    //   min: 100,
    //   max: 100000,
    // },
    // {
    //   title: "",
    //   options: [
    //     {
    //       label: "Straight Flush A",
    //       odds: multiplier["straight flush"],
    //       value: "500000",
    //       selectionId: "sflush-a",
    //      marketId: `${gameId}-14`,
    //       market: "STRAIGHT FLUSH",
    //       mid: roundId,
    //       game_id: gameId,

    //     },
    //     {
    //       label: "Straight Flush B",
    //       odds: multiplier["straight flush"],
    //       value: "500000",
    //       selectionId: "sflush-b",
    //        marketId: `${gameId}-14`,
    //       market: "STRAIGHT FLUSH",
    //       mid: roundId,
    //       game_id: gameId,

    //     },
    //   ],
    //   min: 100,
    //   max: 100000,
    // },

  ];

  return (
    <div className="w-full">
      {/* Iframe */}
      <CT3030CasinoIframe gameId={gameId} data={data}
        setSelfSuspend={(bool) => setSelfSuspend(bool)}
      />

      {/* Market Groups */}
      {groupedOptions.map(
        (group, idx) =>
          group.options?.length > 0 && (
            <FullMarketCards
              key={idx}
              title={group.title}
              options={group.options}
              min={group.min}
              max={group.max}
              {...defaultCardProps}
              eventId={gameId}
              eventNames={"teen20"}
              isSuspended={isSuspended}
            />
          )
      )}

      {/* Recent Results */}
      {Array.isArray(data?.result) && data?.result?.length > 0 && (
        <div className="bg-black px-2 flex justify-start items-center overflow-x-scroll max-w-[100vw] mt-2 py-4 overflow-y-hidden">
          <p className="text-white font-bold text-[0.9rem]" style={{ textWrap: "nowrap" }}>
            Recent Result
          </p>
          <div className="flex gap-2 pl-2 grow">
            {data?.result?.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedResult(item);
                  setShowTeen20(true);
                }}
                className={`${item?.result == "1"
                  ? "bg-[#72bbef]"
                  : item?.result == "2"
                    ? "bg-[#f9a9ba]"
                    : "bg-yellow-300"
                  } w-8 h-6 rounded-full text-black font-bold grid place-items-center`}
              >
                {item?.result == "1" ? "A" : "B"}
              </button>
            ))}
          </div>
        </div>
      )}

      <Teen20
        isOpen={showTeen20}
        onClose={() => setShowTeen20(false)}
        result={selectedResult}
        gameId={gameId}
      />
    </div>
  );
}

export default CT3030;
