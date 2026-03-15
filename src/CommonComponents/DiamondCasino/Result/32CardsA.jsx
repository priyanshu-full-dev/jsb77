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

const Cards32A = ({ isOpen, onClose, gameId: gmid, result }) => {
  const mid = result?.mid;
  const [resData, setResData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getDresult(gmid, "card32", mid);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999999]  justify-center bg-black bg-opacity-50 px-2"
        >
          <motion.div
            initial={{ scale: 0.95, y: -30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded shadow-lg w-full sm:w-[340px] overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-2 text-white font-bold text-sm"
              style={{
                background: `linear-gradient(180deg, ${
                  headerColor?.start || "#0d47a1"
                }, ${headerColor?.end || "#1976d2"})`,
              }}
            >
              <span>32 CARDS - A</span>
              <button
                onClick={onClose}
                className="text-xl font-bold hover:opacity-70"
              >
                <IoCloseSharp />
              </button>
            </div>
            {/* Round Id */}
            <div className="px-4 py-2 text-[12px] text-black border-b border-gray-200">
              <span className="font-semibold">Round Id: {result?.mid}</span>
            </div>
            {/* Players List */}
            <div className="p-4">
              {players.map((player, idx) => {
                const isWinner = winnerIndex === idx; // Determine if current player is winner
                return (
                  <div
                    key={player.label}
                    className="flex items-center gap-3 mb-3 last:mb-0"
                  >
                    <div className="font-semibold text-[12px] text-black whitespace-nowrap">
                      {player.label} <span>-</span>
                    </div>

                    {/* Render cards as images from public/cards/ folder */}
                    <div className="flex gap-1 ">
                      {player.hand && player.hand.cards ? (
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

                    {/* Trophy icon color changes if winner */}
                    <FaTrophy
                      className={`ml-2 text-[15.75px] ${
                        isWinner ? "text-green-600" : "text-red-500 rotate-180"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Cards32A;
