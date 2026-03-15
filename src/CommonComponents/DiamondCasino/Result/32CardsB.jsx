import { IoCloseSharp } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { getDresult } from "../../../AsianExchangeSrc/api";
import { selectSiteHeaderColor } from "../../../AsianExchangeSrc/utils/helper/commonSelectors";

// Helper: Find winner's player number by result string ("Player 8" → 8)
const winnerNum = (winnerStr) => {
  const num = /([0-9]+)/.exec(winnerStr);
  return num ? num[1] : null;
};

const Cards32B = ({ isOpen, onClose, gameId: gmid, result }) => {

  const mid = result?.mid;
  const [resData, setResData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getDresult(gmid, "card32eu", mid);
      setResData(res.data.winner);
    } catch (error) {
      console.error("Error fetching sportsbook data:", error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const headerColor = useSelector(selectSiteHeaderColor());
  // Structure: player hands in correct order: 8,9,10,11
  const players = [
    {
      label: "Player 8",
      hand: resData?.details?.["Player 8"] || { cards: [] },
    },
    {
      label: "Player 9",
      hand: resData?.details?.["Player 9"] || { cards: [] },
    },
    {
      label: "Player 10",
      hand: resData?.details?.["Player 10"] || { cards: [] },
    },
    {
      label: "Player 11",
      hand: resData?.details?.["Player 11"] || { cards: [] },
    },
  ];

  const winner = resData?.winner || "";
  const winnerIndex = players.findIndex(
    (p) => winner.replace(/\s+/g, "") === p.label.replace(/\s+/g, "")
  );
  let winn=[];
  winn[winnerIndex]=true;

  // Define card color classes
  const cardColorClasses = ["ANY THREE CARD BLACK", "ANY THREE CARD RED", "TWO BLACK TWO RED"];

  // Determine the card color based on resData
  let cardColor = "TWO BLACK TWO RED"; // Default value
  if (resData?.extras?.cardColor === "ALL RED" || resData?.extras?.cardColor === "ANY THREE CARD RED") {
    cardColor = "ANY THREE CARD RED";
  } else if (resData?.extras?.cardColor === "ALL BLACK" || resData?.extras?.cardColor === "ANY THREE CARD BLACK") {
    cardColor = "ANY THREE CARD BLACK";
  }

  // Get the index for the card color from cardColorClasses
  const cardColorIndex = cardColorClasses.findIndex(
    (color) => color.replace(/\s+/g, "").toLowerCase() === cardColor.replace(/\s+/g, "").toLowerCase()
  );
  let cardColorWins = [];
  cardColorWins[cardColorIndex] = true;

    const oddEvenWins = [
    resData?.extras?.oddEvenByPlayer["Player 8"] === "ODD",
    resData?.extras?.oddEvenByPlayer["Player 8"] === "EVEN",
    resData?.extras?.oddEvenByPlayer["Player 9"] === "ODD",
    resData?.extras?.oddEvenByPlayer["Player 9"] === "EVEN",
    resData?.extras?.oddEvenByPlayer["Player 10"] === "ODD",
    resData?.extras?.oddEvenByPlayer["Player 10"] === "EVEN",
    resData?.extras?.oddEvenByPlayer["Player 11"] === "ODD",
    resData?.extras?.oddEvenByPlayer["Player 11"] === "EVEN",
  ];

  const specialWin = ["8 & 9 TOTAL", "10 & 11 TOTAL"];

// Get the index of the special winner based on resData.extras.specialWinner
const specialWinnerIndex = specialWin.findIndex(
  (win) => win === resData?.extras?.specialWinner
);
let specialWinWins = [];
specialWinWins[specialWinnerIndex] = true;

let luckyNumberWins = [];
luckyNumberWins[resData?.extras?.luckyNumber - 1] = true;

  // 🧩 Add Lucky-style result breakdown (like Lucky7)
  const resultConfig = [
    {
      title: "WINNER",
      columns: ["PLAYER 8", "PLAYER 9", "PLAYER 10", "PLAYER 11"],
      wins: winn
    },
    {
      title: "ODD/EVEN",
      columns: ["PLAYER 8 ODD", "PLAYER 8 EVEN", "PLAYER 9 ODD", "PLAYER 9 EVEN", "PLAYER 10 ODD", "PLAYER 10 EVEN", "PLAYER 11 ODD", "PLAYER 11 EVEN"],
      wins: oddEvenWins,
    },
    {
      title: "CARD COLOR",
      columns: ["ANY THREE CARD BLACK", "ANY THREE CARD RED", "TWO BLACK TWO RED"],
      wins: cardColorWins,
    },
    {
      title: "CARD TOTAL",
      columns: ["8 & 9 TOTAL", "10 & 11 TOTAL"],
      wins: specialWinWins,
    },
    {
      title: "LUCKY NUMBER",
      columns: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      wins: luckyNumberWins
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999999] flex justify-center bg-black bg-opacity-50 px-2"
        >
          <motion.div
            initial={{ scale: 0.95, y: -30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-md shadow-lg w-full sm:w-[360px] overflow-hidden max-h-[88vh] flex flex-col top-[8px]"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-2 text-white font-bold text-sm"
              style={{
                background: `linear-gradient(180deg, ${headerColor?.start || "#0d47a1"
                  }, ${headerColor?.end || "#1976d2"})`,
              }}
            >
              <span>32 CARDS - B</span>
              <button
                onClick={onClose}
                className="text-xl font-bold hover:opacity-70"
              >
                <IoCloseSharp />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto">
              {/* Round Id */}
              <div className="px-4 py-2 text-[12px] text-black border-b border-gray-200 text-end">
                <span className="font-semibold">Round Id: {result?.mid}</span>
              </div>

              {/* Players */}
              <div className="p-4 border-b border-gray-200">
                {players.map((player, idx) => {
                  const isWinner = winnerIndex === idx;
                  return (
                    <div
                      key={player.label}
                      className="flex items-center gap-3 mb-3 last:mb-0"
                    >
                      <div className="font-semibold text-[12px] text-black whitespace-nowrap">
                        {player.label} <span>-</span>
                      </div>
                      <div className="flex gap-1">
                        {player.hand?.cards?.length > 0 ? (
                          player.hand.cards.map((cardStr, i) => (
                            <img
                              key={i}
                              src={`/cards/${cardStr}.webp`}
                              alt={cardStr}
                              className="w-[30px] rounded-md border border-black shadow"
                            />
                          ))
                        ) : (
                          <span className="text-gray-400">–</span>
                        )}
                      </div>
                      <FaTrophy
                        className={`ml-2 text-[15.75px] ${isWinner ? "text-green-600 pulse-green-shadow" : "text-red-500 rotate-180 pulse-red-shadow"
                          }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Lucky Breakdown */}
              <div className="text-[12px] sm:text-sm">
                {resultConfig.map((row, idx) => (
                  <ResultRow
                    key={idx}
                    title={row.title}
                    columns={row.columns}
                    wins={row.wins}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 🎨 Reusable Result Row (from Lucky7)

// 🎨 Reusable Result Row (updated)
const ResultRow = ({ title, columns, wins }) => {
  const gridClass =
    title === "WINNER"
      ? "grid-cols-2"
      : title === "ODD/EVEN"
        ? "grid-cols-2"
        : title === "LUCKY NUMBER"
          ? "grid-cols-2" // 2x2 layout for WINNER
          : title === "CARD COLOR"
            ? "grid-cols-2 justify-items-center" // special handled separately
            : columns.length > 2
              ? "grid-cols-4"
              : "grid-cols-2";

  return (
    <div className="py-2 border-b border-[#ccc]">
      <style jsx>{`
        @keyframes pulseGreenShadow {
          0% {
            box-shadow: 0 0 0 0 rgba(29, 127, 30, 0.6);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(29, 127, 30, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(29, 127, 30, 0);
          }
        }

        @keyframes pulseRedShadow {
          0% {
            box-shadow: 0 0 0 0 rgba(127, 45, 29, 0.6);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(29, 127, 30, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(29, 127, 30, 0);
          }
        }
        .pulse-green-shadow {
          animation: pulseGreenShadow 1.5s infinite;
          border-radius: 50%;
        }
        .pulse-red-shadow {
          animation: pulseRedShadow 1.5s infinite;
          border-radius: 50%;
        }
      `}</style>

      {title && (
        <div className="font-semibold text-[black] text-[12px] text-center mb-1">
          {title}
        </div>
      )}

      {/* ✅ Special custom layout for CARD COLOR */}
      {title === "CARD COLOR" ? (
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-2 gap-2">
            {columns.slice(0, 2).map((col, idx) => {
              const win = wins && wins[idx];
              return (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center justify-center p-1 rounded"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[12px]">{col}</span> -
                    <FaTrophy
                      className={`text-[16px]  ${win ? "text-[green] pulse-green-shadow" : "text-[red] rotate-180 pulse-red-shadow"
                        }`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Centered third item */}
          {columns[2] && (
            <motion.div
              className="flex flex-col items-center justify-center p-1 rounded mt-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px]">{columns[2]}</span> -
                <FaTrophy
                  className={`text-[16px]  ${wins && wins[2] ? "text-[green] pulse-green-shadow" : "text-[red] rotate-180 pulse-red-shadow"
                    }`}
                />
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        // 🔹 Default layout for all other rows
        <div className={`grid ${gridClass} gap-2`}>
          {columns.map((col, idx) => {
            const win = wins && wins[idx];
            return (
              <motion.div
                key={idx}
                className="flex flex-col items-center justify-center p-1 rounded"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12px]">{col}</span> -
                  <FaTrophy
                    className={`text-[16px]  ${win ? "text-[green] pulse-green-shadow" : "text-[red] rotate-180 pulse-red-shadow"
                      }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default Cards32B;
