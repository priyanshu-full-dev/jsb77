// CT3042.jsx
import React, { useEffect, useMemo, useState } from "react";
import Teen20 from "../Result/Teen20";
import CT3042CasinoIframe from "../CasinoIframe/CT3042";
import FullMarketCards3042 from "../FullMarketCards/FullMarketCards3042";
import DTL2020 from "../Result/DTL2020";

function CT3042({ gameId, data, socketDis }) {
    const [selectedResult, setSelectedResult] = useState(null);
    const [showTeen20, setShowTeen20] = useState(false);
    const [roundId, setRoundId] = useState(null);
    const [selfSuspend, setSelfSuspend] = useState(false);
    
    let isSuspended = false;

    const gameData = Array.isArray(data) ? data : data?.data?.t2 || [];

    isSuspended =
        gameData?.[0]?.gstatus === "0" ||
        gameData?.[0]?.gstatus === undefined ||
        data?.data?.t1?.[0]?.desc !== "1,1,1" ||
        selfSuspend ||
        socketDis;

    useEffect(() => {
        const newRoundId = gameData?.[0]?.mid;
        if (newRoundId !== undefined) setRoundId(newRoundId);
    }, [gameData]);

    // Prepare event names for PlaceBet
    const eventNames = useMemo(() => {
        return ["Worli Matka", gameId, `Round ${roundId || ""}`];
    }, [gameId, roundId]);


    return (
        <div className="w-full min-h-screen ">
            {/* Casino Video Stream */}
            <CT3042CasinoIframe 
                gameId={gameId} 
                data={data} 
                setSelfSuspend={setSelfSuspend} 
            />

            {/* Worli Betting Markets */}
            <div className="p-2">
                <FullMarketCards3042
                    eventId={gameId}
                    eventNames={eventNames}
                    isSuspended={isSuspended}
                    data={gameData}
                />
            </div>

            {/* Recent Results */}
            {Array.isArray(data?.data?.results) && data?.data.results.length > 0 && (
                <div className="bg-black px-2 flex items-center max-w-[100vw] mt-2 py-4">
                    <p className="text-white font-bold text-[0.9rem] text-nowrap">
                        Recent Result
                    </p>
                    <div className="flex gap-2 pl-2 grow overflow-x-auto overflow-y-visible text-nowrap scrollbar-thin">
                        {(data?.data?.results || []).map((item, index) => {
                            // For Worli, result should be 0-9
                            const result = String(item?.result);
                            
                            // Colorful backgrounds for different numbers
                            const colorMap = {
                                "0": "bg-red-500",
                                "1": "bg-blue-500",
                                "2": "bg-green-500",
                                "3": "bg-yellow-500",
                                "4": "bg-purple-500",
                                "5": "bg-pink-500",
                                "6": "bg-indigo-500",
                                "7": "bg-orange-500",
                                "8": "bg-teal-500",
                                "9": "bg-cyan-500",
                            };

                            const bg = colorMap[result] || "bg-gray-400";

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedResult(item);
                                        setShowTeen20(true);
                                    }}
                                    className={`${bg} min-w-[32px] h-8 rounded-md text-white font-bold grid place-items-center shrink-0 px-2 shadow-md hover:shadow-lg transition-all`}
                                    title={`Result: ${result}`}
                                >
                                    {result}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Result Modal */}
            <DTL2020
                isOpen={showTeen20}
                onClose={() => setShowTeen20(false)}
                result={selectedResult}
                gameId={gameId}
            />
        </div>
    );
}

export default CT3042;
