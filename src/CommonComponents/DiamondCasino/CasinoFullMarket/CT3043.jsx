import React, { useEffect, useMemo, useState } from "react";
import CT3043CasinoIframe from "../CasinoIframe/CT3043";
import FullMarketCards3043 from "../FullMarketCards/FullMarketCards3043";
import CTResult3043 from "../Result/CTResult3043";

function CT3043({ gameId, data, socketDis }) {
  const [selectedResult, setSelectedResult] = useState(null);
  const [showTeen20, setShowTeen20] = useState(false);
  const [roundId, setRoundId] = useState(null);
  const [selfSuspend, setSelfSuspend] = useState(false);

  const gameData = Array.isArray(data) ? data : data?.data?.t2 || [];

  const isSuspended =
    gameData?.[0]?.gstatus === "0" ||
    gameData?.[0]?.gstatus === undefined ||
    data?.data?.t1?.[0]?.desc === "1,1,1" ||
    selfSuspend ||
    socketDis;

  useEffect(() => {
    const newRoundId = gameData?.[0]?.mid;
    if (newRoundId !== undefined) setRoundId(newRoundId);
  }, [gameData]);

  const eventNames = useMemo(() => {
    return ["Worli Matka", gameId, `Round ${roundId || ""}`];
  }, [gameId, roundId]);

  // Build custom options once you have gameData
  const customOptions = useMemo(() => {
    // Helper to find first row by a "nation" label
    const byNation = (label) =>
      (gameData || []).find(
        (r) =>
          String(r?.nation || "").toUpperCase().replace(/\s+/g, "") ===
          label.toUpperCase().replace(/\s+/g, "")
      ) || {};

    // Winner numbers 1..9,0 with odds = 9
    const winnerOrder = ["1","2","3","4","5","6","7","8","9","0"];
    const winnerOptions = winnerOrder.map((num) => {
      const rec =
        (gameData || []).find((r) => String(r?.nation) === num) || {};
      return {
        number: num,
        label: num,
        // keep real ids so P/L and PlaceBet track correctly
        sid: rec.sid,
        selectionId: rec.sid,
        mid: roundId,
        marketId: `${gameId}-WINNER`,
        market: "WINNER",
        gstatus: String(rec.gstatus || "1"),
        // force odds 9
        odds: { back: { odds: '9', value: Number(rec.bs1) || 0 } },
        min: 50,
        max: 25000,
      };
    });

    // LINE 1 and LINE 2
    const l1 = byNation("LINE1");
    const l2 = byNation("LINE2");
    const lineOptions = [
      {
        label: "LINE 1",
        numbers: "1|2|3|4|5",
        sid: l1.sid,
        selectionId: l1.sid,
        mid: roundId,
        marketId: `${gameId}-LINE`,
        market: "LINE",
        gstatus: String(l1.gstatus || "1"),
        odds: { back: { odds: '9', value: Number(l1.bs1) || 0 } },
        min: 50,
        max: 25000,
      },
      {
        label: "LINE 2",
        numbers: "6|7|8|9|0",
        sid: l2.sid,
        selectionId: l2.sid,
        mid: roundId,
        marketId: `${gameId}-LINE`,
        market: "LINE",
        gstatus: String(l2.gstatus || "1"),
        odds: { back: { odds: '9', value: Number(l2.bs1) || 0 } },
        min: 50,
        max: 25000,
      },
    ];

    // ODD / EVEN
    const odd = byNation("ODD");
    const even = byNation("EVEN");
    const oddEvenOptions = [
      {
        label: "ODD",
        numbers: "1|3|5|7|9",
        sid: odd.sid,
        selectionId: odd.sid,
        mid: roundId,
        marketId: `${gameId}-ODD_EVEN`,
        market: "ODD_EVEN",
        gstatus: String(odd.gstatus || "1"),
        odds: { back: { odds: '9', value: Number(odd.bs1) || 0 } },
        min: 50,
        max: 25000,
      },
      {
        label: "EVEN",
        numbers: "0|2|4|6|8",
        sid: even.sid,
        selectionId: even.sid,
        mid: roundId,
        marketId: `${gameId}-ODD_EVEN`,
        market: "ODD_EVEN",
        gstatus: String(even.gstatus || "1"),
        odds: { back: { odds: '9', value: Number(even.bs1) || 0 } },
          min: 50,
        max: 25000,
      },
    ];

    return {
      winner: {
        title: "WINNER",
        options: winnerOptions,
        min: 50,
        max: 25000,
        suspended: winnerOptions.some((o) => String(o.gstatus) !== "1"),
      },
      line: {
        title: "LINE",
        options: lineOptions,
        min: 50,
        max: 25000,
        suspended: lineOptions.some((o) => String(o.gstatus) !== "1"),
      },
      oddEven: {
        title: "ODD/EVEN",
        options: oddEvenOptions,
          min: 50,
        max: 25000,
        suspended: oddEvenOptions.some((o) => String(o.gstatus) !== "1"),
      },
    };
  }, [gameData, gameId]);

  return (
    <div className="w-full min-h-screen ">
      <CT3043CasinoIframe
        gameId={gameId}
        data={data}
        setSelfSuspend={setSelfSuspend}
      />

      <div className="p-2">
        <FullMarketCards3043
          eventId={gameId}
          eventNames='worli2'
          isSuspended={isSuspended}
          roundId={roundId}
          data={gameData}
          customOptions={customOptions} // pass custom markets
        />
      </div>

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
                  setShowTeen20(true);
                }}
                className={`bg-[#72bbef] w-8 h-6 rounded-full text-black font-bold grid place-items-center`}
              >
                {"R"}
              </button>
            ))}
          </div>
        </div>
      )}
      <CTResult3043
        isOpen={showTeen20}
        onClose={() => setShowTeen20(false)}
        result={selectedResult}
        gameId={gameId}
      />
    </div>
  );
}

export default CT3043;
