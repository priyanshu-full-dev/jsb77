import { IoCloseSharp } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import { selectSiteHeaderColor } from "../../../utils/helper/commonSelectors";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { getDresult } from "../../../api";

const DragonTiger = ({ isOpen, onClose, gameId: gmid, result }) => {
  const mid = result?.mid;
  const [resData, setResData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getDresult(gmid, "dt20", mid);

      setResData(res.data.winner);
    } catch (error) {
      console.error("Error fetching sportsbook data:", error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const headerColor = useSelector(selectSiteHeaderColor());

  const playerA =
    resData?.cards?.A?.map(
      (c) => `${c.rank}${c.rawSuitChar}${c.rawSuitChar}`
    ) || [];
  resData?.dragonCard;
  const playerB =
    resData?.cards?.B?.map(
      (c) => `${c.rank}${c.rawSuitChar}${c.rawSuitChar}`
    ) || [];

  const resultConfig = [
    {
      title: "WINNER",
      columns: ["DRAGON", "TIGER", "TIE"],
      wins: [resData?.win == "1", resData?.win == "2", resData?.win == "0"],
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
          className="fixed inset-0 z-[999999] font-[Tahoma,Helvetica,sans-serif] flex items-start justify-center bg-black bg-opacity-50 px-2"
        >
          <motion.div
            initial={{ scale: 0.9, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-md shadow-lg w-full sm:w-[400px] overflow-hidden relative max-h-[87vh] top-[8px] flex flex-col"
          >
            {/* Header */}
            <div
              className="relative flex items-center justify-center px-4 py-2 text-white font-bold text-sm sm:text-base"
              style={{
                background: `linear-gradient(180deg, ${
                  headerColor?.start || "#0d47a1"
                }, ${headerColor?.end || "#1976d2"})`,
              }}
            >
              <span className="text-start w-full">20-20 DRAGON TIGER</span>
              <button
                onClick={onClose}
                className="absolute text-[18px] font-bold right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto">
              {/* Round Id */}
              <div className="text-end text-[12px] text-black py-2 px-3">
                <span className="font-semibold">Round Id: {result?.mid}</span>
              </div>

              <div className="px-4 py-6">
                {/* Dragon vs Tiger */}
                <div className="flex justify-between items-start mb-6 w-[80%] mx-auto">
                  {/* Dragon */}
                  <div className="flex flex-col items-center">
                    <div className="text-black font-bold text-base mb-3">
                      Dragon
                    </div>
                    {resData?.dragonCard && (
                      <img
                        src={`/cards/${resData.dragonCard}.webp`}
                        alt="Dragon card"
                        className="w-[50px] border border-black rounded-[20px] shadow mb-2"
                      />
                    )}
                    {/* Dragon Result - Only show if Dragon wins or it's a tie */}
                    {(resData?.win === "1" || resData?.win === "0") && (
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className={`font-bold px-3 py-1 rounded text-xs shadow-lg ${
                          resData?.win === "0"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {resData?.win === "0" ? "TIE" : "WINNER"}
                      </motion.button>
                    )}
                  </div>

                  <div className="h-[120px] w-[1px] bg-[#ccc] mt-8"></div>

                  {/* Tiger */}
                  <div className="flex flex-col items-center">
                    <div className="text-black font-bold text-base mb-3">
                      Tiger
                    </div>
                    {resData?.tigerCard && (
                      <img
                        src={`/cards/${resData.tigerCard}.webp`}
                        alt="Tiger card"
                        className="w-[50px] border border-black rounded-[20px] shadow mb-2"
                      />
                    )}
                    {/* Tiger Result - Only show if Tiger wins or it's a tie */}
                    {(resData?.win === "2" || resData?.win === "0") && (
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className={`font-bold px-3 py-1 rounded text-xs shadow-lg ${
                          resData?.win === "0"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {resData?.win === "0" ? "TIE" : "WINNER"}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Results */}
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

const PlayerCards = ({ title, cards }) => (
  <div className="flex flex-col items-center">
    <b>{title}</b>
    <div className="flex gap-2 mt-1">
      {cards.map((value, i) => (
        <img
          key={i}
          src={`/cards/${value}.webp`}
          alt="card"
          className="w-[50px] border border-black rounded-[18px] shadow"
        />
      ))}
    </div>
  </div>
);

const ResultRow = ({ title, columns, wins }) => {
  return (
    <div className="py-2 border-b border-[#ccc]">
        <div className="py-2 border-b border-[#ccc]"></div>
      <style jsx>{`
        @keyframes pulseShadow {
          0% {
            -webkit-box-shadow: 0 0 0 0 rgba(29, 127, 30, 0.6);
            box-shadow: 0 0 0 0 rgba(29, 127, 30, 0.6);
          }
          70% {
            -webkit-box-shadow: 0 0 0 10px rgba(29, 127, 30, 0);
            box-shadow: 0 0 0 10px rgba(29, 127, 30, 0);
          }
          100% {
            -webkit-box-shadow: 0 0 0 0 rgba(29, 127, 30, 0);
            box-shadow: 0 0 0 0 rgba(29, 127, 30, 0);
          }
        }
        .pulse-shadow {
          animation: pulseShadow 1.5s infinite;
          border-radius: 50%;
        }
      `}</style>
      {title && (
        
          <div className="font-semibold text-[black] text-[12px] text-center">
            {title}
          </div>

      )}
      <div className={`grid grid-cols-2 gap-2`}>
        {columns.map((col, idx) => {
          const win = wins && wins[idx];
          return (
            <motion.div
              key={idx}
              className={`flex flex-col items-center justify-center p-1 rounded`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <div className="flex items-center gap-2">
                <span className={`text-[12px]`}>{col}</span> -
                <FaTrophy
                  className={`text-[16px] pulse-shadow ${
                    win ? "text-[green]" : "text-[red] rotate-180"
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DragonTiger;
