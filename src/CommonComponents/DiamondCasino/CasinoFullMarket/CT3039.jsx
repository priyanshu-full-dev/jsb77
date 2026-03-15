import React, { useState } from "react";
import CT3039CasinoIframe from "../CasinoIframe/CT3039";
import FullMarketCards3039 from "../FullMarketCards/FullMarketCard3039";
import Cards32B from "../Result/32CardsB";
import FullMarketCards3039_2 from "../FullMarketCards/FullMarketCard3039-2";
import FullMarketCards3039_3 from "../FullMarketCards/FullMarketCard3039-3";
import FullMarketCards3039_4 from "../FullMarketCards/FullMarketCard3039-4";
import FullMarketCards3039_5 from "../FullMarketCards/FullMarketCard3039-5";

function CT3039({ gameId, data, socketDis }) {
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

  const gameData = Array.isArray(data)
  ? data
  : data?.data?.data?.t2 || data?.data?.t2 || [];

  const t2 = gameData;

  const isSuspended = gameData?.[0]?.gstatus === "CLOSED" || socketDis;
  const roundId = gameData?.[0]?.mid;


  // 🧠 Convert to customOdds format dynamically
  const customOdds = {};
  const t1Desc = data?.data?.t1?.[0]?.desc;
  const isCustomOddsActive = t1Desc === "1,1,1,1,1,1";

  t2.forEach((item) => {
    const key = item.nation?.trim()?.toUpperCase() || "";
    if (isCustomOddsActive && item.gstatus == "ACTIVE") {
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
    "ODD EVEN": {
      PLAYER_8_ODD: { label: "PLAYER 8 ODD" },
      PLAYER_8_EVEN: { label: "PLAYER 8 EVEN" },
      PLAYER_9_ODD: { label: "PLAYER 9 ODD" },
      PLAYER_9_EVEN: { label: "PLAYER 9 EVEN" },
      PLAYER_10_ODD: { label: "PLAYER 10 ODD" },
      PLAYER_10_EVEN: { label: "PLAYER 10 EVEN" },
      PLAYER_11_ODD: { label: "PLAYER 11 ODD" },
      PLAYER_11_EVEN: { label: "PLAYER 11 EVEN" },
    },
    "CARD COLOR": {
      "ANY THREE CARD BLACK": { label: "ANY THREE CARD BLACK" },
      "ANY THREE CARD RED": { label: "ANY THREE CARD RED" },
      "TWO BLACK TWO RED": { label: "TWO BLACK TWO RED" },
    },
    SPECIAL:{
      "8 & 9 TOTAL": { label: "8 & 9 TOTAL" },
      "10 & 11 TOTAL": { label: "10 & 11 TOTAL" }
    },
    "Lucky Number": {
      "Single 0": { label: "0" },
      "Single 1": { label: "1" },
      "Single 2": { label: "2" },
      "Single 3": { label: "3" },
      "Single 4": { label: "4" },
      "Single 5": { label: "5" },
      "Single 6": { label: "6" },
      "Single 7": { label: "7" },
      "Single 8": { label: "8" },
      "Single 9": { label: "9" },
    }
  };
  // 🧩 Helper to normalize odds item lookup
const findItem = (t2, nation) => {
  return (
    t2.find(
      (g) => g.nation?.trim().toLowerCase() === nation?.trim().toLowerCase()
    ) || {}
  );
};

const normalizeNation = (str) =>
  str
    ?.replace(/_/g, " ") // convert underscores to spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
    .toLowerCase();
    
const findItem_odd_even = (t2, nation) => {
  const normalized = normalizeNation(nation);
  return (
    t2.find(
      (g) =>
        normalizeNation(g.nation) === normalized ||
        normalizeNation(g.nat) === normalized
    ) || {}
  );
};

// 🧠 Common option builder
const buildOption = ({ nation, config, item, custom, marketType, groupIndex, gameId, roundId }) => {
  
  const includeLay = marketType !== "ODD EVEN";

  const option = {
    label: config.label,
    back: {
      odds: custom.back?.odds ?? item.b1 ?? "-",
      value: custom.back?.value ?? item.bs1 ?? "-",
    },
    selectionId: `${item.sid || ""}`,
    marketId: `${gameId}${groupIndex + 1}`,
    market: marketType,
    mid: roundId,
    gstatus: item.gstatus ?? "CLOSED",
    game_id: gameId
  };

  if (includeLay) {
    option.lay = {
      odds: custom.lay?.odds ?? item.l1 ?? "-",
      value: custom.lay?.value ?? item.ls1 ?? "-",
    };
  }

  return option;
};

// 🃏 WINNER market builder
const buildWinnerMarket = ({ nations, t2, customOdds, gameId, groupIndex, roundId }) => {
  const marketType = "WINNER";
  const options = Object.keys(nations).map((nation) => {
    const item = findItem(t2, nation);
    const config = nations[nation];
    const custom = customOdds[nation.toUpperCase()] || {};
    return buildOption({ nation, config, item, custom, marketType, groupIndex, gameId, roundId });
  });
  return { title: marketType, options };
};

// ⚖️ ODD EVEN market builder (back only)
const buildOddEvenMarket = ({ nations, t2, customOdds, gameId, groupIndex, roundId }) => {
  
  const marketType = "ODD EVEN";

  const options = Object.keys(nations).map((nation) => {
    const item = findItem_odd_even(t2, nation);
    const config = nations[nation];
    const custom = customOdds[nation.toUpperCase()] || {};

    // --- Extract Player Number (8, 9, 10, 11) ---
    const playerMatch = nation.match(/PLAYER_(\d+)_/);
    const playerNum = playerMatch ? playerMatch[1] : "0";

    // --- Make Player-Based Market ID ---
    const playerMarketId = `${gameId}${groupIndex + 1}${playerNum}`;

    return {
      label: config.label,
      back: {
        odds: custom.back?.odds ?? item.b1 ?? "-",
        value: custom.back?.value ?? item.bs1 ?? "-",
      },
      selectionId: `${item.sid || ""}`,
      marketId: playerMarketId,
      market: marketType,
      mid: roundId,
      gstatus: item.gstatus ?? "CLOSED",
      game_id: gameId
    };
  });

  return { title: marketType, options };
};


// 🎨 CARD COLOR market builder (back + lay both)
const buildCardColorMarket = ({ nations, t2, customOdds, gameId, groupIndex, roundId }) => {
  const marketType = "CARD COLOR";

  const options = Object.keys(nations).map((nation) => {
    const item = findItem(t2, nation); // normal space match
    const config = nations[nation];
    const custom = customOdds[nation.toUpperCase()] || {};

    return {
      label: config.label,
      back: {
        odds: custom.back?.odds ?? item.b1 ?? "-",
        value: custom.back?.value ?? item.bs1 ?? "-",
      },
      lay: {
        odds: custom.lay?.odds ?? item.l1 ?? "-",
        value: custom.lay?.value ?? item.ls1 ?? "-",
      },
      selectionId: `${item.sid || ""}`,
      marketId: `${gameId}${groupIndex + 1}`,
      market: marketType,
      mid: roundId,
      gstatus: item.gstatus ?? "CLOSED",
      game_id: gameId
    };
  });

  return { title: marketType, options };
};

// 💎 SPECIAL market builder (back + lay both)
const buildSpecialMarket = ({ nations, t2, customOdds, gameId, groupIndex, roundId }) => {
  const marketType = "SPECIAL";

  const options = Object.keys(nations).map((nation) => {
    const item = findItem(t2, nation); // match nation text
    const config = nations[nation];
    const custom = customOdds[nation.toUpperCase()] || {};

    return {
      label: config.label,
      back: {
        odds: custom.back?.odds ?? item.b1 ?? "-",
        value: custom.back?.value ?? item.bs1 ?? "-",
      },
      lay: {
        odds: custom.lay?.odds ?? item.l1 ?? "-",
        value: custom.lay?.value ?? item.ls1 ?? "-",
      },
      selectionId: `${item.sid || ""}`,
      marketId: `${gameId}${groupIndex + 1}`,
      market: marketType,
      mid: roundId,
      gstatus: item.gstatus ?? "CLOSED",
      game_id: gameId
    };
  });

  return { title: marketType, options };
};

// 🍀 LUCKY NUMBER market builder (BACK only)
const buildLuckyNumberMarket = ({ nations, t2, customOdds, gameId, groupIndex, roundId }) => {
  const marketType = "Lucky Number";

  const options = Object.keys(nations).map((nation) => {
    const item = findItem(t2, nation); // match nation by number
    const config = nations[nation];
    const custom = customOdds[nation.toUpperCase()] || {};

    return {
      label: config.label,
      back: {
        odds: custom.back?.odds ?? item.b1 ?? "-",
        value: custom.back?.value ?? item.bs1 ?? "-",
      },
      selectionId: `${item.sid || ""}`,
      marketId: `${gameId}${groupIndex + 1}`,
      market: marketType,
      mid: roundId,
      gstatus: item.gstatus ?? "CLOSED",
      game_id: gameId
    };
  });

  return { title: marketType, options };
};

  // 🔹 Map market to card component
  const marketComponents = {
    WINNER: FullMarketCards3039,
    "ODD EVEN": FullMarketCards3039_2,
    "CARD COLOR": FullMarketCards3039_3,
    SPECIAL: FullMarketCards3039_4,
    "Lucky Number": FullMarketCards3039_5
  };

  const groupedOptions = Object.entries(groups).map(([marketType, nations], groupIndex) => {
    if (marketType === "WINNER") {
      return buildWinnerMarket({ nations, t2, customOdds, gameId, groupIndex, roundId });
    } else if (marketType === "ODD EVEN") {
      return buildOddEvenMarket({ nations, t2, customOdds, gameId, groupIndex, roundId });  
    }
    else if(
      marketType === "CARD COLOR" ){
      return buildCardColorMarket({ nations, t2, customOdds, gameId, groupIndex, roundId });
    }
    else if(marketType === "SPECIAL"){
      return buildSpecialMarket({ nations, t2, customOdds, gameId, groupIndex, roundId });
    }
    else if (marketType === "Lucky Number") {
      return buildLuckyNumberMarket({ nations, t2, customOdds, gameId, groupIndex, roundId });
    }
     else {
      // fallback to default handler (for SPECIAL or others)
      const options = Object.keys(nations).map((nation) => {
        const item = findItem(t2, nation);
        const config = nations[nation];
        const custom = customOdds[nation.toUpperCase()] || {};
        return buildOption({ nation, config, item, custom, marketType, groupIndex, gameId, roundId });
      });
      return { title: marketType, options };
    }
  });
  
  return (
    <div className="relative w-full">
      <div className="relative w-full h-full overflow-hidden">
        <CT3039CasinoIframe
          gameId={gameId}
          data={data}
          setSelfSuspend={(bool) => setSelfSuspend(bool)}
        />
      </div>

      {groupedOptions.map(
        (group, idx) =>
          group.options?.length > 0 &&
          React.createElement(marketComponents[group.title] || FullMarketCards3039, {
            key: idx,
            title: group.title,
            options: group.options,
            min: 50,
            max: 25000,
            ...defaultCardProps,
            eventId: gameId,
            eventNames: "card32eu",
            isSuspended: isSuspended || selfSuspend || gameData.length === 0,
          })
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
                className={
                  "bg-[#FFF333] w-8 h-6 rounded-l-[20px] my-[4px] rounded-r-[20px] text-black font-bold grid place-items-center max-[550px]:text-[0.8rem]"
                }
              >
                {item?.result === "Player 8"
                  ? "8"
                  : item?.result === "Player 9"
                  ? "9"
                  : item?.result === "Player 10"
                  ? "10"
                  : item?.result === "Player 11"
                  ? "11"
                  : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      <Cards32B
        isOpen={showTeen}
        onClose={() => setShowTeen(false)}
        result={selectedResult}
        gameId={gameId}
      />
    </div>
  );
}

export default CT3039;
