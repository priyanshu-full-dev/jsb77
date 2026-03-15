import React, { useEffect, useState } from "react";
import CT3032CasinoIframe from "../CasinoIframe/CT3032";
import Teen20 from "../Result/Teen20";
import FullMarketCards3 from "../FullMarketCards/FullMarketCard3";
import { DevtoolsOverlay } from "../../developerToolBlocker/DevtoolsOverlay";
import { useDevtoolsDetect } from "../../developerToolBlocker/DeveloperToolBlocker";
import DragonTiger from "../Result/DragonTiger";

function CT3032({ gameId, data, socketDis }) {

    const [selectedResult, setSelectedResult] = useState(null);
    const [showDt20, setShowDt20] = useState(false);
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
        data?.data?.t1?.[0]?.desc !== "1,1" ||
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
                    label: "Dragon",
                    odds: 2,
                    value: "50000",
                    selectionId: "dragon",
                    marketId: `${gameId}-1`,
                    market: "WINNER",
                    mid: roundId,
                    game_id: gameId
                },
                {
                    label: "Tiger",
                    odds: 2,
                    value: "50000",
                    selectionId: "tiger",
                    marketId: `${gameId}-1`,
                    market: "WINNER",
                    mid: roundId,
                    game_id: gameId
                },
                {
                    label: "Tie",
                    odds: 11,
                    value: "50000",
                    selectionId: "tie",
                    marketId: `${gameId}-1`,
                    market: "WINNER",
                    mid: roundId,
                    game_id: gameId
                }
            ],
      min: 50,
      max: 25000,
        },

    ];

    // useDevtoolsDetect({ widthThreshold: 160, heightThreshold: 160 });



    return (
        <div className="w-full">
            {/* Iframe */}
            <CT3032CasinoIframe gameId={gameId} data={data}
                setSelfSuspend={(bool) => setSelfSuspend(bool)}
            />

            {/* Market Groups */}
            {groupedOptions.map(
                (group, idx) =>
                    group.options?.length > 0 && (
                        <FullMarketCards3
                            key={idx}
                            title={group.title}
                            options={group.options}
                            min={group.min}
                            max={group.max}
                            {...defaultCardProps}
                            eventId={gameId}
                            eventNames={"dt20"}
                            isSuspended={isSuspended}
                        />
                    )
            )}

            {/* Recent Results */}
            {Array.isArray(data?.data?.results) && data?.data.results.length > 0 && (
                <div className="bg-black px-2 flex justify-start items-center overflow-x-scroll max-w-[100vw] mt-2 py-4 overflow-y-hidden">
                    <p className="text-white font-bold text-[0.9rem]" style={{ textWrap: "nowrap" }}>
                        Recent Result
                    </p>
                    <div className="flex gap-2 pl-2 grow">
                        {data?.data.results.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setSelectedResult(item);
                                    setShowDt20(true);
                                }}
                                className={`${item?.result == "1"
                                    ? "bg-[#72bbef]"
                                    : item?.result == "2"
                                        ? "bg-[#f9a9ba]"
                                        : "bg-yellow-300"
                                    } w-8 h-6 rounded-full text-black font-bold grid place-items-center`}
                            >
                                {item?.result == "1" ? "D" : "T"}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <DragonTiger
                isOpen={showDt20}
                onClose={() => setShowDt20(false)}
                result={selectedResult}
                gameId={gameId}
            />
            
        </div>
    );
}

export default CT3032;
