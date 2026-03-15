// CT3033.jsx
import React, { useEffect, useMemo, useState } from "react";
import Teen20 from "../Result/Teen20";
import CT3033CasinoIframe from "../CasinoIframe/CT3033";
import FullMarketCards4 from "../FullMarketCards/FullMarketCards4";
import DTL2020 from "../Result/DTL2020";

function CT3033({ gameId, data, socketDis }) {
    const [selectedResult, setSelectedResult] = useState(null);
    const [showTeen20, setShowTeen20] = useState(false);
    const [roundId, setRoundId] = useState(null);
    const [selfSuspend, setSelfSuspend] = useState(false);
    const [activeTab, setActiveTab] = useState("dragon");
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

    // pick core market records for a suffix D/T/L
    const pickCore = (suffix) => {
        const by = (name) =>
            gameData.find(
                (x) => String(x?.nation || "").toLowerCase() === `${name} ${suffix}`.toLowerCase()
            );
        return {
            winner: by("winner"),
            black: by("black"),
            red: by("red"),
            odd: by("odd"),
            even: by("even"),
        };
    };

    // transform a record into a PlaceBet option
    const toOpt = (rec, label, marketKey) =>
        rec && {
            label,
            odds: rec.b1 || "0",
            value: "0",
            gstatus: rec.gstatus,
            selectionId: rec.sid,
            marketId: `${gameId}-${marketKey}`,
            market: marketKey,
            mid: rec.mid,
            min: 50,
            max: 25000,
        };

    // build options per tab
    const optionsByTab = useMemo(() => {
        const d = pickCore("D");
        const t = pickCore("T");
        const l = pickCore("L");

        const build = (title, recs) =>
            [
                toOpt(recs.winner, "Winner", `WINNER`),
                toOpt(recs.red, "Red", `${title}-COLOR`),
                toOpt(recs.black, "Black", `${title}-COLOR`),
                toOpt(recs.odd, "Odd", `${title}-ODD-EVEN`),
                toOpt(recs.even, "Even", `${title}-ODD-EVEN`),
            ].filter(Boolean);

        return {
            dragon: build("DRAGON", d),
            tiger: build("TIGER", t),
            lion: build("LION", l),
        };
    }, [gameData, gameId]);

    // cards per tab: Dragon A/2/...; Tiger A/2/...; Lion A/2/...
    const cardsByTab = useMemo(() => {
        const pickCards = (prefix, marketKey) =>
            gameData
                .filter((x) =>
                    String(x?.nation || "").toLowerCase().startsWith(`${prefix} `.toLowerCase())
                )
                .map((x) => ({
                    label: x.nation.replace(new RegExp(`^${prefix} `, "i"), ""), // rank part
                    fullLabel: x.nation,
                    sid: x.sid,
                    mid: x.mid,
                    gstatus: x.gstatus,
                    odds: x.b1 || "0",
                    value: "0",
                    marketId: `${gameId}-${marketKey}`,   // ✅ added
                    marketKey,                            // ✅ added
                    min: x.min,
                    max: x.max,
                }));

        return {
            dragon: pickCards("Dragon", "DRAGON-CARDS"),
            tiger: pickCards("Tiger", "TIGER-CARDS"),
            lion: pickCards("Lion", "LION-CARDS"),
        };
    }, [gameData, gameId]);


    // group-level stake limits for current tab
    const groupMin = useMemo(() => {
        const opts = optionsByTab[activeTab] || [];
        return opts.length ? Math.min(...opts.map((o) => o.min ?? 0)) : 0;
    }, [optionsByTab, activeTab]);

    const groupMax = useMemo(() => {
        const opts = optionsByTab[activeTab] || [];
        return opts.length ? Math.max(...opts.map((o) => o.max ?? 0)) : 0;
    }, [optionsByTab, activeTab]);

    return (
        <div className="w-full min-h-screen bg-[#2e3438]">
            <CT3033CasinoIframe gameId={gameId} data={data} setSelfSuspend={setSelfSuspend} />

            <FullMarketCards4
                title={activeTab.toUpperCase()}
                optionsByTab={optionsByTab}
                cardsByTab={cardsByTab}
                currentTab={activeTab}
                onChangeTab={setActiveTab}
                min={groupMin}
                max={groupMax}
                eventId={gameId}
                eventNames="dtl20"
                isSuspended={isSuspended}
                {...defaultCardProps}
            />

            {Array.isArray(data?.data?.results) && data?.data.results.length > 0 && (
                <div className="bg-black px-2 flex items-center max-w-[100vw] mt-2 py-4">
                    <p className="text-white font-bold text-[0.9rem] text-nowrap">
                        Recent Result
                    </p>
                    <div
                        className="flex gap-2 pl-2 grow overflow-x-auto overflow-y-visible text-nowrap scrollbar-thin"
                    >
                        {(data?.data?.results || []).map((item, index) => {
                            const result = String(item?.result).toUpperCase();

                            // Define background color based on result type
                            const bg =
                                result === "D"
                                    ? "bg-blue-400" // Blue for D
                                    : result === "T"
                                        ? "bg-red-400" // Pink for T
                                        : result === "L"
                                            ? "bg-yellow-300" // Yellow for L
                                            : "bg-gray-400"; // Default for unknown

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedResult(item);
                                        setShowTeen20(true);
                                    }}
                                    className={`${bg} w-8 h-6 rounded-full text-black font-bold grid place-items-center shrink-0`}
                                    title={result}
                                >
                                    {result}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}



            <DTL2020
                isOpen={showTeen20}
                onClose={() => setShowTeen20(false)}
                result={selectedResult}
                gameId={gameId}
            />
        </div>
    );
}

export default CT3033;
