import { IoCloseSharp } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import { selectSiteHeaderColor } from "../../../AsianExchangeSrc/utils/helper/commonSelectors";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { getDresult } from "../../../AsianExchangeSrc/api";

const Lucky7b = ({ isOpen, onClose, gameId: gmid, result }) => {
    
  const mid = result?.mid;
  const [resData, setResData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getDresult(gmid, "lucky7eu", mid);
      
      setResData(res.data.winner);
    } catch (error) {
      console.error("Error fetching sportsbook data:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const headerColor = useSelector(selectSiteHeaderColor());


  const resultConfig = [
    {
      title: "WINNER",
      columns: ["LOW CARD (A to 6)", "HIGH CARD (8 to K)"],
      wins: [
        resData?.rank && ["A", "2", "3", "4", "5", "6"].includes(resData.rank),
        resData?.rank && ["8", "9", "10", "J", "Q", "K"].includes(resData.rank),
      ],
    },
    {
      title: "LUCKY ODD/EVEN",
      columns: ["EVEN", "ODD"],
      wins: [
        parseInt(resData?.rank) % 2 === 0,
        parseInt(resData?.rank) % 2 === 1,
      ],
    },
    {
      title: "LUCKY COLOR",
      columns: ["RED", "BLACK"],
      wins: [
        resData?.color?.toLowerCase() === "red",
        resData?.color?.toLowerCase() === "black",
      ],
    },
    {
      title: "LUCKY CARD SUIT",
      columns: ["SPADES", "HEARTS", "DIAMONDS", "CLUBS"],
      wins: [
        resData?.suit?.toLowerCase() === "spade",
        resData?.suit?.toLowerCase() === "heart",
        resData?.suit?.toLowerCase() === "diamond",
        resData?.suit?.toLowerCase() === "club",
      ],
    },
    {
      title: "LUCKY CARD",
      columns: ["A","2","3","4","5","6","7","8","9","10","J","Q","K"],
      wins: ["A","2","3","4","5","6","7","8","9","10","J","Q","K"].map(
        (c) => resData?.rank === c
      ),
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
            className="bg-white rounded-md border border-white shadow-lg w-full sm:w-[400px] overflow-hidden relative max-h-[87vh] top-[8px] flex flex-col"
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
              <span className="text-start w-full">LUCKY 7 - B</span>
              <button
                onClick={onClose}
                className="absolute text-[18px] font-bold right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
              >
                ×
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto">
              {/* Round Id */}
              <div className="text-end text-[12px] text-[black] py-2 px-3">
                <span className="font-semibold">Round Id: {result?.mid}</span>
              </div>

              {/* Card Display */}
              <div className="flex justify-center py-3 border-b border-[#ccc]">
                <img
                  src={`/cards/${resData?.card}.webp`}
                  alt="card"
                  className="w-[50px] border border-black rounded-[20px] shadow"
                />
              </div>

              {/* Results - Loop through config */}
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

const ResultRow = ({ title, columns, wins }) => {
  return (
    <div className="py-2 border-b border-[#ccc]">
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

export default Lucky7b;
