import React, { useState, useMemo } from "react";
import CT3040CasinoIframe from "../CasinoIframe/CT3040";
import FullMarketCards5 from "../FullMarketCards/FullMarketCards5";
import AAAMatchResult from "../Result/AAA";
import CT3037CasinoIframe from "../CasinoIframe/CT3037";
import FullMarketCard3037 from "../FullMarketCards/FullMarketCard3037";

function CT3037({ gameId, data, socketDis }) {
  const [selectedResult, setSelectedResult] = useState(null);
  const [showLucky7, setShowLucky7] = useState(false);
  const [selfSuspend, setSelfSuspend] = useState(false);

  // Normalize feed
  const gameData = Array.isArray(data) ? data : data?.data?.t2 || [];
  const isSuspended = gameData?.[0]?.gstatus !== "ACTIVE" || socketDis || selfSuspend;

  // Keep a stable memo for results array
  const recentResults = useMemo(() => data?.data?.results || [], [data]);
  console.log("CT3037 gameData:", data);

  return (
    <div className="relative w-full">
      {/* Game video/iframe surface */}
      <div className="relative w-full h-full overflow-hidden">
        <CT3037CasinoIframe
          gameId={gameId}
          data={data}
          setSelfSuspend={(bool) => setSelfSuspend(bool)}
        />
      </div>

      {/* Single market layout instance (Winner + 3 mini markets + Cards) */}
      <div className="mt-2">
        <FullMarketCard3037
          eventId={gameId}
          eventNames="aaa"
          isSuspended={isSuspended}
          data={gameData}
        />
      </div>

      {/* Recent results ribbon */}
      {Array.isArray(recentResults) && recentResults.length > 0 && (
        <div className="bg-black px-2 flex justify-start items-center overflow-x-scroll max-w-[100vw] mt-2 py-4 max-[575px]:py-0 overflow-y-hidden">
          <p className="text-white font-bold text-[0.9rem] max-[500px]:text-[0.8rem] max-[575px]:min-w-24">
            Recent Result
          </p>
          <div className="flex gap-2 pl-2 grow">
            {recentResults.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedResult(item?.mid);
                  setShowLucky7(true);
                }}
                className={`${
                  item?.result == "1"
                    ? "bg-[#72bbef]"
                    : item?.result == "2"
                    ? "bg-[#f9a9ba]"
                    : "bg-yellow-300"
                } w-8 h-6 rounded-l-[20px] my-[4px] rounded-r-[20px] text-black font-bold grid place-items-center max-[550px]:text-[0.8rem]`}
              >
                {item?.result == "Amar" ? "AM" : item?.result == "Akbar" ? "AK" : "AN"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* aaa modal */}
      <AAAMatchResult
        isOpen={showLucky7}
        onClose={() => setShowLucky7(false)}
        mid={selectedResult}
        gameId={gameId}
      />
    </div>
  );
}

export default CT3037;
