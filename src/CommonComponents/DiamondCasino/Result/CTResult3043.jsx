import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { selectSiteHeaderColor } from "../../../AsianExchangeSrc/utils/helper/commonSelectors";
import { getDresult } from "../../../AsianExchangeSrc/api";

// ---------- helpers ----------
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

// Winner 0..9 grid builder (UI expects a two-column list of numbers)
const buildWinnerGrid = (winDigit) => {
  const rows = [
    ["0", "1"],
    ["2", "3"],
    ["4", "5"],
    ["6", "7"],
    ["8", "9"],
  ];
  return {
    title: "WINNER",
    rows,
    isLeftWin: (rowIdx) => rows[rowIdx][0] === winDigit,
    isRightWin: (rowIdx) => rows[rowIdx][1] === winDigit,
  };
};

const WinnerPill = ({ label }) => {
  if (!label) return null;
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="mt-3 inline-flex items-center justify-center px-5 py-2 rounded-md bg-green-600 text-white font-bold shadow"
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
const CTResult3043 = ({ isOpen, onClose, gameId: gmid, result }) => {
  const headerColor = useSelector(selectSiteHeaderColor());
  const mid = result?.mid;
  const [resData, setResData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getDresult(gmid, "worli2", mid);
      setResData(res.data.winner);
    } catch (error) {
      console.error("Error fetching sportsbook data:", error);
    }
  };

  useEffect(() => {
    if (isOpen && gmid && mid) fetchData();
  }, [isOpen, gmid, mid]);

  // Map Worli2 data to existing UI without changing layout
  const vm = useMemo(() => {
    if (!resData) return null;

    // cards is an array of 3 items [{rank,suit,color,code}, ...]
    const arr = Array.isArray(resData.cards) ? resData.cards : [];
    const c1 = arr[0] || {};
    const c2 = arr[1] || {};
    const c3 = arr[2] || {};

    const r1 = toRankValue(c1.rank);
    const r2 = toRankValue(c2.rank);
    const r3 = toRankValue(c3.rank);

    // derive parity from ranks to drive ODD/EVEN row
    const p1 = parityOfRank(r1 ?? 0); // used for ODD/EVEN
    // line: compare with API’s line field
    const lineText = String(resData?.result?.line || "").toUpperCase(); // "LINE 1"|"LINE 2"
    const isLine1 = lineText.includes("1");

    // last digit of pana for WINNER matrix
    const pana = String(resData?.result?.pana ?? "");
    const winDigit = pana ? pana.slice(-1) : "";

    // Build rows for existing ResultRow component (expects title/columns/isWin)
    const rows = [
      // WINNER numbers 0..9 flattened as 10 columns for the existing 2-col grid
      {
  title: "WINNER",
  columns: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  isWin: (i) => {
    const winIndex = winDigit === "0" ? 9 : Number(winDigit) - 1;
    return i === winIndex;
  },
},
      {
        title: "LINE",
        columns: ["LINE 1", "LINE 2"],
        isWin: (i) => (i === 0 ? isLine1 : !isLine1),
      },
      {
        title: "ODD/EVEN",
        columns: ["ODD", "EVEN"],
        // use parity from the first card (any consistent rule; API also provides oddEven)
        isWin: (i) => {
          const oe = String(resData?.result?.oddEven || p1).toUpperCase();
          return i === 0 ? oe === "ODD" : oe === "EVEN";
        },
      },
    ];

    return {
      roundId: resData.mid || mid,
      card1Img: c1.code ? `/cards/${c1.code}.webp` : null,
      card2Img: c2.code ? `/cards/${c2.code}.webp` : null,
      card3Img: c3.code ? `/cards/${c3.code}.webp` : null,
      pana: resData?.result?.pana,
      ocada: resData?.result?.ocada,
      rows,
    };
  }, [resData, mid]);

  const panaLabel = vm?.pana ? `Pana: ${vm.pana}` : "";
  const ocadaLabel = vm?.ocada !== undefined ? `Ocada: ${vm.ocada}` : "";

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
              <span className="text-start w-full">INSTANT WORLI </span>
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

              {/* Three cards row (no labels) */}
              <div className="px-4 py-4 flex justify-center items-center gap-2">
                <div className="flex flex-col items-center">
                  {vm?.card1Img && (
                    <img
                      src={vm.card1Img}
                      alt="card-1"
                      className="w-[50px] border border-black rounded-[20px] shadow"
                    />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  {vm?.card3Img && (
                    <img
                      src={vm.card3Img}
                      alt="card-3"
                      className="w-[50px] border border-black rounded-[20px] shadow"
                    />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  {vm?.card2Img && (
                    <img
                      src={vm.card2Img}
                      alt="card-2"
                      className="w-[50px] border border-black rounded-[20px] shadow"
                    />
                  )}
                </div>
              </div>

              {/* Pana / Ocada pills */}
              <div className="flex justify-center">
                {vm?.pana !== undefined && <WinnerPill label={panaLabel} />}
              </div>
              <div className="flex justify-center mb-4">
                {vm?.ocada !== undefined && <WinnerPill label={ocadaLabel} />}
              </div>

              {/* Results grid (WINNER / LINE / ODD-EVEN) */}
              <div className="text-[12px] sm:text-sm">
                {vm?.rows.map((row, idx) => (
                  <ResultRow
                    key={idx}
                    title={row.title}
                    columns={row.columns}
                    isWin={row.isWin}
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

export default CTResult3043;
