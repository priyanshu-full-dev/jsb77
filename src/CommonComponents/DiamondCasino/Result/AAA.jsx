import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { IoCloseSharp } from "react-icons/io5";
import { FaTrophy } from "react-icons/fa";
import { selectSiteHeaderColor } from "../../../utils/helper/commonSelectors";
import { getDresult } from "../../../api";

/* small helpers */
const suitSymbol = (s) => {
  const x = String(s || "").toLowerCase();
  if (x.includes("spade")) return "♠";
  if (x.includes("heart")) return "♥";
  if (x.includes("diamond")) return "♦";
  if (x.includes("club")) return "♣";
  return "";
};

const isRed = (s) => {
  const x = String(s || "").toLowerCase();
  return x === "red" || x === "heart" || x === "diamond";
};

const rankOrder = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

/* Card image mapping: adapt to your asset naming */
const cardSrc = (value, fallback = "A") => {
  // If value already matches file code like "AHH.webp", use directly
  if (value) return `/cards/${value}.webp`;
  return `/cards/${fallback}.webp`;
};

const Row = ({ title, items }) => {
  return (
    <div className="py-2 border-b border-[#ddd]">
      <style jsx>{`
        @keyframes pulseShadow {
          0%   { box-shadow: 0 0 0 0 rgba(29,127,30,0.55); }
          70%  { box-shadow: 0 0 0 10px rgba(29,127,30,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,127,30,0); }
        }
        .pulse-shadow { animation: pulseShadow 1.4s infinite; border-radius: 50%; }
      `}</style>
      {title && (
        <div className="text-center text-[11px] font-bold text-[#2b2b2b] tracking-wide">{title}</div>
      )}
      <div className="grid grid-cols-2 gap-1">
        {items.map((it, idx) => (
          <motion.div
            key={`${title}-${idx}`}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25, delay: idx * 0.03 }}
            className="flex items-center justify-center py-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-[12px]">{it.label}</span>
              <FaTrophy
                className={`text-[16px] pulse-shadow ${
                  it.win ? "text-[green]" : "text-[red] rotate-180"
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AAAMatchResult = ({ isOpen, onClose, gameId, mid, dataOverride }) => {
  const [payload, setPayload] = useState(null);
  const headerColor = useSelector(selectSiteHeaderColor());

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (dataOverride) { setPayload(dataOverride); return; }
        
        const res = await getDresult(gameId, "aaa", mid);
        if (active) setPayload(res?.data || null);
      } catch (e) { console.error("AAA result fetch error:", e); }
    };
    if (isOpen) load();
    return () => { active = false; };
  }, [isOpen, gameId, mid, dataOverride]);

  const w = payload?.winner;
  const card = w?.card;
  const res = w?.result;
  const sym = suitSymbol(card?.suit);

  // Build rows based on provided winner.result
  const rows = useMemo(() => {
    // Winner groups by rank list
    const r = card?.rank;
    const inSet = (arr) => r && arr.includes(r);

    const winnerItems = [
      { label: "AMAR ( A,2,3,4,5,6 )", win: inSet(["A","2","3","4","5","6"]) || res?.mainWinner === "Amar" },
      { label: "AKBAR ( 7,8,9,10 )",   win: inSet(["7","8","9","10"]) || res?.mainWinner === "Akbar" },
      { label: "ANTHONY ( J,Q,K )",    win: inSet(["J","Q","K"]) || res?.mainWinner === "Anthony" },
    ];

    const oddEven = String(res?.sideMarkets?.oddEven || "").toLowerCase();
    const color = String(res?.sideMarkets?.color || "").toLowerCase();
    const underOver = String(res?.sideMarkets?.underOver7 || "").toLowerCase();
    const cardWin = String(res?.sideMarkets?.card || "");

    const oddEvenItems = [
      { label: "EVEN", win: oddEven === "even" },
      { label: "ODD",  win: oddEven === "odd" },
    ];

    const colorItems = [
      { label: "RED",   win: color === "red" },
      { label: "BLACK", win: color === "black" },
    ];

    const uoItems = [
      { label: "UNDER 7", win: underOver === "under 7" },
      { label: "OVER 7",  win: underOver === "over 7" },
    ];

    const cardItems = rankOrder.map((x) => ({ label: x, win: cardWin === x }));

    return [
      { title: "WINNER", items: winnerItems },
      { title: "ODD/EVEN", items: oddEvenItems },
      { title: "COLOR", items: colorItems },
      { title: "UNDER/OVER", items: uoItems },
      { title: "CARD", items: cardItems },
    ];
  }, [card?.rank, res?.mainWinner, res?.sideMarkets]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[999999] font-[Tahoma,Helvetica,sans-serif] flex items-start justify-center bg-black/50 px-2"
        >
          <motion.div
            initial={{ scale: 0.94, y: -40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: -40 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-md border border-white shadow-lg w-full sm:w-[380px] overflow-hidden relative max-h-[88vh] top-[10px] flex flex-col"
          >
            {/* Header */}
            <div
              className="relative flex items-center justify-center px-4 py-2 text-white font-bold text-sm"
              style={{
                background: `linear-gradient(180deg, ${headerColor?.start || "#153d68"}, ${headerColor?.end || "#1a4f82"})`,
              }}
            >
              <span className="w-full truncate">AMAR AKBAR ANTHONY</span>
              <button
                onClick={onClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                aria-label="Close"
              >
                <IoCloseSharp size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto">
              {/* Round Id */}
              <div className="text-end text-[12px] text-black py-2 px-3">
                <span className="font-semibold">Round Id: {w?.mid || mid}</span>
              </div>

              {/* Winner name + card + badge */}
              <div className="flex flex-col items-center gap-2 pb-2">
                {!!card?.rank && (
                  <div className="text-[13px] font-semibold">
                    {res?.mainWinner || ""}
                  </div>
                )}
                <div className="flex items-center justify-center py-2">
                  <img
                    src={cardSrc(card?.value, card?.rank)}
                    alt="card"
                    className="w-[50px] border border-black rounded-[12px] shadow"
                  />
                </div>
                <span className="px-3 py-1 rounded-md bg-[#2fb45f] text-white text-[12px] font-bold">
                  Winner
                </span>
              </div>

              {/* Rows */}
              <div className="text-[12px]">
                {rows.map((r, i) => (
                  <Row key={i} title={r.title} items={r.items} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AAAMatchResult;
