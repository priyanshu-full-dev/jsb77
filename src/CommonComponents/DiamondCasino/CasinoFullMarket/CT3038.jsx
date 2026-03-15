import React, { useState } from "react";
import TeenpattiOneDay from "../Result/TeenpattiOneDay";
import CT3038CasinoIframe from "../CasinoIframe/CT3038";
import FullMarketCards3038 from "../FullMarketCards/FullMarketCard3038";
import Cards32A from "../Result/32CardsA";

function CT3038({ gameId, data, socketDis }) {
  
  const [selectedResult, setSelectedResult] = useState(null);
  const [showTeen, setShowTeen] = useState(false);
  const [selfSuspend, setSelfSuspend] = useState(false);

  const defaultCardProps = {
    layout: "row",
    bgColor: "#72bbef",
    cardWidth: "110px",
    cardPadding: "4px 0",
    shadow: "0 2px 7px 1px #67828be6",
    labelColor: "black",
    oddsColor: "black",
    valueColor: "black",
  };

  const gameData = Array.isArray(data) ? data : data?.data?.t2 || [];
  
  const isSuspended = gameData?.[0]?.gstatus === "CLOSED" || socketDis;
  const roundId = gameData?.[0]?.mid;


  const t2 = gameData;
  
  // 🧠 Convert to customOdds format dynamically
  const customOdds = {};
  
  // t2.forEach(item => {
  //   // Normalize key name (case-insensitive consistent)
  //   const key = item.nation.trim().toUpperCase();
  
  //   // Only include entries where both odds or sizes exist (optional)
  //   if (item.b1 !== "0" || item.l1 !== "0") {
  //     customOdds[key] = {
  //       back: {
  //         odds: parseFloat(item.b1) || 0,
  //         value: parseFloat(item.bs1) || 0,
  //       },
  //       lay: {
  //         odds: parseFloat(item.l1) || 0,
  //         value: parseFloat(item.ls1) || 0,
  //       },
  //     };
  //   }
  // });
  const t1Desc = data?.data?.t1?.[0]?.desc;
  const isCustomOddsActive = t1Desc === "1,1,1,1,1,1";

  t2.forEach(item => {
    const key = item.nation?.trim()?.toUpperCase() || "";
    if (isCustomOddsActive && item.gstatus=="OPEN") {
      customOdds[key] = {
        back: {
          odds: 1.98,
          value: 30000,
        },
        lay: {
          odds: 0,
          value: 30000,
        },
      };
    } else {
      // 🧩 Normal odds assignment
      if (item.b1 !== "0" || item.l1 !== "0") {
        customOdds[key] = {
          back: {
            odds: parseFloat(item.b1) || 0,
            value: parseFloat(item.bs1) || 0,
          },
          lay: {
            odds: parseFloat(item.l1) || 0,
            value: parseFloat(item.ls1) || 0,
          },
        };
      }
    }
  });

  const groups = {
    WINNER: {
      "PLAYER 8": { label: "PLAYER 8" },
      "PLAYER 9": { label: "PLAYER 9" },
      "PLAYER 10": { label: "PLAYER 10" },
      "PLAYER 11": { label: "PLAYER 11" },
    },
  };


  const groupedOptions = Object.entries(groups).map(
    ([title, nations], groupIndex) => {
      
      const options = Object.keys(nations).map((nation) => {
        const item =
        t2.find(
          (g) =>
            g.nation?.trim().toLowerCase() === nation?.trim().toLowerCase()
        ) || {};
        
      const config = nations[nation];
      const custom = customOdds[nation] || {};
        
        return {
          label: config.label,
          back: {
            odds: custom.back?.odds ?? item.rate ?? "-",
            value: custom.back?.value ?? item.bs1 ?? "-",
          },
          lay: {
            odds: custom.lay?.odds ?? item.rate ?? "-",
            value: custom.lay?.value ?? item.bs1 ?? "-",
          },
          selectionId: `${item.sid}`,
          marketId: `${gameId}${groupIndex + 1}`,
          market: title,
          mid: roundId ,
          gstatus: item.gstatus ?? "CLOSED",
          game_id: gameId
        };
      });

      return { title, options };
    }
  );


  return (
    <div className="relative w-full">
      <div className="relative w-full h-full overflow-hidden">
        <CT3038CasinoIframe
          gameId={gameId}
          data={data}
          setSelfSuspend={(bool) => setSelfSuspend(bool)}
        />
      </div>

      {groupedOptions.map(
        (group, idx) =>
          group.options?.length > 0 && (
            <FullMarketCards3038
              key={idx}
              title={group.title}
              options={group.options}
              min={50}
              max={25000}
              {...defaultCardProps}
              eventId={gameId}
              eventNames={"card32"}
              isSuspended={isSuspended || gameData.length === 0 || selfSuspend}
              // suspendRunner={true}
            />
          )
      )}

      {/* 🕹️ Recent Results */}
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
                  setShowTeen(true);
                }}
                className={"bg-[#FFF333] w-8 h-6 rounded-l-[20px] my-[4px] rounded-r-[20px] text-black font-bold grid place-items-center max-[550px]:text-[0.8rem]"}
              >
                {item?.result === "Player 8" ? "8" :
                     item?.result === "Player 9" ? "9" :
                     item?.result === "Player 10" ? "10" :
                     item?.result === "Player 11" ? "11":""
                    }
              </button>
            ))}
          </div>
        </div>
      )}

      <Cards32A
        isOpen={showTeen}
        onClose={() => setShowTeen(false)}
        result={selectedResult}
        gameId={gameId}
      />
    </div>
  );
}

export default CT3038;
