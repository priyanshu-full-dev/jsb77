import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { selectSiteHeaderColor } from "../../../AsianExchangeSrc/utils/helper/commonSelectors";
import { getDresult } from "../../../AsianExchangeSrc/api";

// ---------- helpers ----------
const HAND_LABEL = { D: "DRAGON", T: "TIGER", L: "LION" };

const colorToken = (suitOrColor) => {
  const s = String(suitOrColor || "").toLowerCase();
  if (s === "heart" || s === "diamond" || s === "red") return "RED";
  if (s === "spade" || s === "club" || s === "black") return "BLACK";
  return null;
};

const toRankValue = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const t = String(v).toUpperCase();
  if (t === "A") return 1;
  if (t === "J") return 11;
  if (t === "Q") return 12;
  if (t === "K") return 13;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
};

const parityOfRank = (rank) => (rank % 2 === 0 ? "EVEN" : "ODD");

// Build exact card row (A..K) for a hand
const buildExactRow = (handName, actualRank) => {
  const seq = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  const labels = [
    `${handName} A`, `${handName} 2`, `${handName} 3`, `${handName} 4`,
    `${handName} 5`, `${handName} 6`, `${handName} 7`, `${handName} 8`,
    `${handName} 9`, `${handName} 10`, `${handName} J`, `${handName} Q`,
    `${handName} K`,
  ];
  return {
    title: `${handName} CARD`,
    columns: labels,
    isWin: (i) => actualRank != null && actualRank === seq[i],
  };
};

const WinnerPill = ({ label }) => {
  if (!label) return null;
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className=" inline-flex items-center justify-center px-2 py-2 rounded-md bg-green-500 text-white font-bold shadow"
    >
      {label}
    </motion.div>
  );
};

const ResultRow = ({ title, columns, isWin }) => {
  return (
    <div className="py-2 border-b border-[#ccc]">
      <style jsx>{`
        @keyframes pulseShadow {
          0% { box-shadow: 0 0 0 0 rgba(29,127,30,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(29,127,30,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,127,30,0); }
        }
        .pulse-shadow { animation: pulseShadow 1.5s infinite; border-radius: 50%; }
      `}</style>
      {title && (
        <div className="font-semibold text-black text-[12px] text-center">
          {title}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {columns.map((label, idx) => {
          const win = isWin(idx);
          return (
            <motion.div
              key={idx}
              className="flex flex-col items-center justify-center p-1 rounded"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px]">{label}</span> -
                <FaTrophy
                  className={`text-[16px] ${win ? "text-[green] pulse-shadow" : "text-[red] rotate-180"}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- main component ----------
const DT202 = ({ isOpen, onClose, gameId: gmid, result }) => {
  const headerColor = useSelector(selectSiteHeaderColor());
  const mid = result?.mid;
  const [resData, setResData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getDresult(gmid, "dt202", mid);
      // Expected res.data.winner to match the JSON you pasted earlier
      setResData(res.data.winner);
    } catch (error) {
      console.error("Error fetching sportsbook data:", error);
    }
  };

  useEffect(() => {
    if (isOpen && gmid && mid) fetchData();
  }, [isOpen, gmid, mid]);

  // View-model derived from API
  const vm = useMemo(() => {
    if (!resData) return null;

    const cards = resData.cards || {};
    const D = cards.D || {};
    const T = cards.T || {};

    const dragon = {
      raw: D.raw,
      rank: toRankValue(D.rankValue ?? D.rank),
      color: colorToken(D.color ?? D.suit),
      parity: parityOfRank(toRankValue(D.rankValue ?? D.rank)),
    };
    const tiger = {
      raw: T.raw,
      rank: toRankValue(T.rankValue ?? T.rank),
      color: colorToken(T.color ?? T.suit),
      parity: parityOfRank(toRankValue(T.rankValue ?? T.rank)),
    };

    const mainWinner = resData?.result?.mainWinner; // 'D' | 'T' | 'L'

    // Winner row, screenshot order: TIGER | LION | DRAGON
    const rows = [
      {
        title: "WINNER",
        columns: ["TIGER", "DRAGON"],
        isWin: (i) => {
          if (i === 0) return mainWinner === "T";
          if (i === 1) return mainWinner === "D";
          return false;
        },
      },
      // Card colors
      {
        title: "DRAGON CARD COLOR",
        columns: ["DRAGON RED", "DRAGON BLACK"],
        isWin: (i) => (i === 0 ? dragon.color === "RED" : dragon.color === "BLACK"),
      },
      {
        title: "TIGER CARD COLOR",
        columns: ["TIGER RED", "TIGER BLACK"],
        isWin: (i) => (i === 0 ? tiger.color === "RED" : tiger.color === "BLACK"),
      },
      // Odd/Even
      {
        title: "DRAGON ODD/EVEN",
        columns: ["DRAGON ODD", "DRAGON EVEN"],
        isWin: (i) => (i === 0 ? dragon.parity === "ODD" : dragon.parity === "EVEN"),
      },
      {
        title: "TIGER ODD/EVEN",
        columns: ["TIGER ODD", "TIGER EVEN"],
        isWin: (i) => (i === 0 ? tiger.parity === "ODD" : tiger.parity === "EVEN"),
      },
      // Exact card rows
      buildExactRow("DRAGON", dragon.rank),
      buildExactRow("TIGER",  tiger.rank),
    ];

    return {
      roundId: resData.mid || mid,
      dragonImg: dragon.raw ? `/cards/${dragon.raw}.webp` : null,
      tigerImg:  tiger.raw ? `/cards/${tiger.raw}.webp`   : null,
      winnerPill:
        mainWinner === "D" ? "Winner"
        : mainWinner === "T" ? "Winner"
        : null,
      rows,
    };
  }, [resData, mid]);

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
                background: `linear-gradient(180deg, ${headerColor?.start || "#0d47a1"}, ${headerColor?.end || "#1976d2"})`,
              }}
            >
              <span className="text-start w-full">20-20 DRAGON TIGER 2</span>
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
                <span className="font-semibold">Round Id: {vm?.roundId || mid}</span>
              </div>

{/* Dragon / Tiger like screenshot */}
<div className="flex justify-center items-start gap-10 py-4">
  {/* Dragon */}
  <div className="flex flex-col items-center space-y-2">
    <div className="font-semibold text-[14px] text-black">Dragon</div>
    {vm?.dragonImg && (
      <div className="w-[60px] h-[80px] flex items-center justify-center border border-gray-600 rounded-2xl shadow-sm">
        <img
          src={vm.dragonImg}
          alt="Dragon card"
          className="object-contain"
        />
      </div>
    )}
    {resData?.result?.mainWinner === "D" && (
      <div className="bg-green-600 text-white text-[12px] font-semibold px-3 py-1 rounded-md shadow">
        Winner
      </div>
    )}
    {resData?.result?.mainWinner === "Tie" && (
      <div className="bg-[#18427f] text-white text-[12px] font-semibold px-3 py-1 rounded-md shadow">
        Tie
      </div>
    )}
  </div>

  {/* Divider line */}
  <div className="h-[160px] w-[1px] bg-gray-300"></div>

  {/* Tiger */}
  <div className="flex flex-col items-center space-y-2">
    <div className="font-semibold text-[14px] text-black">Tiger</div>
    {vm?.tigerImg && (
      <div className="w-[60px] h-[80px] flex items-center justify-center border border-gray-600 rounded-2xl shadow-sm bg-white">
        <img
          src={vm.tigerImg}
          alt="Tiger card"
          className=" object-contain"
        />
      </div>
    )}
    {resData?.result?.mainWinner === "T" && (
      <div className="bg-green-600 text-white text-[12px] font-semibold px-3 py-1 rounded-md shadow">
        Winner
      </div>
    )}
    {resData?.result?.mainWinner === "Tie" && (
      <div className="bg-[#18427f] text-white text-[12px] font-semibold px-3 py-1 rounded-md shadow">
        Tie
      </div>
    )}
  </div>
</div>


              {/* Results grid */}
              <div className="text-[12px] sm:text-sm">
                {vm?.rows.map((row, idx) => (
                  <ResultRow key={idx} title={row.title} columns={row.columns} isWin={row.isWin} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DT202;
