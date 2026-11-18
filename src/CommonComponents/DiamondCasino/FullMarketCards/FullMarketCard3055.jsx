import React, { useState } from "react";
import { IoIosLock } from "react-icons/io";
import { useDispatch } from "react-redux";
import { handleOpenPlaceBet } from "../../../redux/slices/placeBetSlice";
import { placeBet } from "../../../socketClient";
import { updateAvailableBalance, updateExposureBalance } from "../../../redux/slices/userSlice";

/* -------------------- CHIP IMAGES -------------------- */
const CHIP_IMAGES = [
  { label: "1k", src: "/chips1k.svg", value: 1000 },
  { label: "5k", src: "/chips5.svg", value: 5000 },
  { label: "10k", src: "/chips10.svg", value: 10000 },
  { label: "25k", src: "/chips20.svg", value: 25000 },
  { label: "50k", src: "/chips1k.svg", value: 50000 },
  { label: "100k", src: "/chips1k.svg", value: 100000 },
  { label: "200k", src: "/chips1k.svg", value: 200000 },
  { label: "500k", src: "/chips1k.svg", value: 500000 },
];

export default function FullMarketCard3055({
  options = [],
  eventId,
  min,
  max,
  eventNames,
  isSuspended,
}) {
  const dispatch = useDispatch();

  const [selectedChip, setSelectedChip] = useState(null);

  /* ======================================================
        CHIP TOGGLE
  ======================================================= */
  const toggleChip = (value) => {
    setSelectedChip((prev) => (prev === value ? null : value));
  };

  /* ======================================================
        ✔ DIRECT BET PLACING — NO UI POPUP
  ======================================================= */
  const handleSelection = async (opt) => {
    if (isSuspended) return;

    if (!selectedChip) {
      alert("Please select a chip first");
      return;
    }

    /* ---------------- Runner List for Backend ---------------- */
    const runners = options.map((o, idx) => ({
      sid: o.sid,
      selectionId: o.sid,
      sectionId: o.sid,
      name: o.label || o.nat,
      odds: o.b1,
      value: selectedChip,
      index: idx,
    }));

    /* ---------------- Payload ---------------- */
    const payload = {
      sportName: "Casino",
      sportsName: "Casino",
      sportId: 1000,

      competitionId: eventId,
      marketId: opt.mid,

      market: opt.nat,
      markettype: "Casino",
      selectionId: opt.sid,
      selection: opt.label || opt.nat,
      odds: opt.b1,

      stake: selectedChip,

      betType: "Back",
      favourMargin: opt.b1 === "1" ? selectedChip : Math.abs(selectedChip - opt.b1 * selectedChip),
      againstMargin: selectedChip,

      eventId,
      eventNames,
      runners,

      min,
      max,
    };

    console.log("🔥 FINAL BET PAYLOAD:", payload);

    const res = dispatch(handleOpenPlaceBet(payload));
    console.log("Dispatch result:", res);

    const placeBetResponse = await placeBet(payload);
    console.log("Place bet response:", placeBetResponse);

    dispatch(
      updateAvailableBalance(placeBetResponse?.userData?.availableBalance)
    );
    dispatch(updateExposureBalance(placeBetResponse?.exposure));
    // reset selection highlight
    // setSelectedChip(null);  // uncomment if you want chip to reset after bet
  };

  /* COLORS */
  const TOP_COLORS = ["#2262B5", "#0a7437", "#B52339"];
  const PAIR_COLORS = ["#B52339", "#2262B5"];

  const main = options.slice(0, 3); // Player / Tie / Banker
  const pairs = options.slice(3, 5);

  return (
    <div className="w-full bg-[#e9e9e9] border border-gray-300 rounded-md p-3 select-none relative">

      {/* ======================================================
        TOP CONNECTED BUTTONS (PLAYER / TIE / BANKER)
      ======================================================= */}
      <div className="relative w-full flex justify-between items-end mb-6 mt-2">

        {/* PLAYER */}
        <div
          className="relative flex-1 h-[80px] rounded-l-2xl text-white font-bold 
                     flex flex-col justify-center pl-4 cursor-pointer"
          style={{
            background: "linear-gradient(180deg, #1F59AF 0%, #2A74CF 100%)",
          }}
          onClick={() => handleSelection(main[0])}
        >
          <span className="text-sm">PLAYER</span>
          <span className="text-[13px]">{main[0]?.b1}</span>

          {isSuspended && (
            <div className="absolute inset-0 bg-black/50 rounded-l-2xl flex items-center justify-center">
              <IoIosLock className="text-white text-3xl opacity-95" />
            </div>
          )}
        </div>

        {/* TIE CENTER CIRCLE */}
        <div
          className="absolute left-1/2 -translate-x-1/2 
                     w-[79px] h-[79px] rounded-full border-[3px] border-black
                     flex flex-col justify-center items-center 
                     text-white font-bold cursor-pointer z-10"
          style={{
            background: "linear-gradient(180deg, #0A7A35 0%, #159B47 100%)",
          }}
          onClick={() => handleSelection(main[2])}
        >
          <span className="text-sm">TIE</span>
          <span className="text-[15px]">{main[2]?.b1}</span>

          {isSuspended && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <IoIosLock className="text-white text-4xl opacity-95" />
            </div>
          )}
        </div>

        {/* BANKER */}
        <div
          className="relative flex-1 h-[80px] rounded-r-2xl text-white font-bold 
                     flex flex-col justify-center items-end pr-4 cursor-pointer"
          style={{
            background: "linear-gradient(180deg, #9C1D2F 0%, #B92C40 100%)",
          }}
          onClick={() => handleSelection(main[1])}
        >
          <span className="text-sm">BANKER</span>
          <span className="text-[13px]">{main[1]?.b1}</span>

          {isSuspended && (
            <div className="absolute inset-0 bg-black/50 rounded-r-2xl flex items-center justify-center">
              <IoIosLock className="text-white text-3xl opacity-95" />
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
        PAIR ROW
      ======================================================= */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {pairs.map((opt, i) => (
          <div
            key={opt.sid}
            onClick={() => handleSelection(opt)}
            className={`relative rounded-md text-white font-bold cursor-pointer
                        flex flex-col justify-center items-center h-[70px]
                        transition-all duration-200
                        ${isSuspended ? "pointer-events-none" : "active:scale-95"}`}
            style={{ background: PAIR_COLORS[i] }}
          >
            {isSuspended && (
              <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                <IoIosLock className="text-white text-3xl opacity-90" />
              </div>
            )}

            <span>{opt.nat.toUpperCase()}</span>
            <span className="text-[13px]">{opt.b1}</span>
          </div>
        ))}
      </div>

      {/* ======================================================
        CHIP ROW
      ======================================================= */}
      <div className="flex justify-right gap-1 pt-6 w-full overflow-x-auto scrollbar-hide ">
        {CHIP_IMAGES.map((chip, i) => {
          const active = selectedChip === chip.value;

          return (
            <div key={i} className="relative flex flex-col items-center">

              {/* Glow */}
              {active && (
                <div className="absolute w-12 h-12 rounded-full border-4 border-orange-400 shadow-lg animate-pulse" />
              )}

              <div
                className={`relative w-[52px] h-[52px] flex items-center justify-center cursor-pointer transition-all duration-200
                            ${active ? "translate-y-[-20px] scale-110" : "translate-y-[0px]"}`}
                onClick={() => toggleChip(chip.value)}
              >
                <img
                  src={chip.src}
                  alt={chip.label}
                  className="absolute inset-0 w-full h-full rounded-full shadow-[0_0_8px_2px_rgba(255,215,0,0.45)]"
                />

                <span className="relative z-10 text-[11px] text-black">
                  {chip.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
