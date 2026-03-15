import React, { useMemo } from "react";
import { IoLockClosed } from "react-icons/io5";

const cardImg = {
  A: "/cards/A.webp",
  "2": "/cards/2.webp",
  "3": "/cards/3.webp",
  "4": "/cards/4.webp",
  "5": "/cards/5.webp",
  "6": "/cards/6.webp",
  "7": "/cards/7.webp",
  "8": "/cards/8.webp",
  "9": "/cards/9.webp",
  "10": "/cards/10.webp",
  J: "/cards/J.webp",
  Q: "/cards/Q.webp",
  K: "/cards/K.webp",
};

const LOCK = () => (
  <IoLockClosed className="text-white text-xl drop-shadow-md" />
);

export default function FullMarketCard3037({ data = [], isSuspended }) {
    
  // --------------------------------------------------------
  // NORMALIZE DATA
  // --------------------------------------------------------
  const map = useMemo(() => {
    const m = {};
    (data || []).forEach((d) => {
      m[d.nation] = d;
    });
    return m;
  }, [data]);

  // --------------------------------------------------------
  // MAPPING from confirmed logic
  // --------------------------------------------------------
  const A_SIDE = {
    side: map["Andar A"],
    first: map["Andar 2"],
    second: map["Andar 3"],
  };

  const B_SIDE = {
    side: map["Bahar A"],
    first: map["Bahar 2"],
    second: map["Bahar 3"],
  };

  const Odd = map["Andar 4"]; // (Example only — replace once you send odd/even keys)
  const Even = map["Andar 5"];

  // --------------------------------------------------------
  // MAIN BOX COMPONENT
  // --------------------------------------------------------
  const Box = ({ label, rec }) => {
    const locked = isSuspended || rec?.gstatus !== "ACTIVE";
    return (
      <div className="flex flex-col items-center justify-center border border-yellow-400 rounded-md p-1 min-w-[90px] bg-white">
        <div className="text-[12px] font-bold">{label}</div>

        <div
          className={`w-full h-[55px] rounded-md mt-1 flex items-center justify-center ${
            locked ? "bg-[#3d4c5a]" : "bg-[#1d65a1]"
          }`}
        >
          {locked ? <LOCK /> : <span className="text-white font-bold">0</span>}
        </div>

        <div className="text-[12px] font-semibold mt-1">0</div>
      </div>
    );
  };

  // --------------------------------------------------------
  // SUIT TILE (♠ ♥ ♦ ♣)
  // --------------------------------------------------------
  const SuitBox = ({ suit, rec }) => {
    const locked = isSuspended || rec?.gstatus !== "ACTIVE";

    return (
      <div className="flex flex-col items-center w-[80px]">
        <div
          className={`w-full h-[55px] flex items-center justify-center rounded-md ${
            locked ? "bg-[#24323f]" : "bg-[#1d65a1]"
          }`}
        >
          {locked ? (
            <LOCK />
          ) : (
            <span className={`text-2xl ${suit === "♥" || suit === "♦" ? "text-red-500" : "text-black"}`}>
              {suit}
            </span>
          )}
        </div>

        <div className="text-[12px] mt-1">0</div>
      </div>
    );
  };

  // --------------------------------------------------------
  // CARDS (A–K)
  // --------------------------------------------------------
  const cardList = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  return (
    <div className="w-full bg-[#efefef] p-2 select-none">
      {/* -------------------------------------------------- */}
      {/* TOP ROW — SIDE BET A & SIDE BET B */}
      {/* -------------------------------------------------- */}

      <div className="grid grid-cols-3 gap-2 mb-2">
        <Box label="SIDE BET A" rec={A_SIDE.side} />
        <Box label="1st BET A" rec={A_SIDE.first} />
        <Box label="2nd BET A" rec={A_SIDE.second} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Box label="SIDE BET B" rec={B_SIDE.side} />
        <Box label="1st BET B" rec={B_SIDE.first} />
        <Box label="2nd BET B" rec={B_SIDE.second} />
      </div>

      {/* -------------------------------------------------- */}
      {/* ODD / EVEN */}
      {/* -------------------------------------------------- */}
      <div className="flex justify-center gap-4 mb-3">
        <div className="text-center">
          <div className="font-bold text-[14px]">ODD</div>
          <div className="bg-[#72bbef] px-4 py-2 font-bold rounded">{Odd?.bs1 ?? "0"}</div>
        </div>

        <div className="text-center">
          <div className="font-bold text-[14px]">EVEN</div>
          <div className="bg-[#72bbef] px-4 py-2 font-bold rounded">{Even?.bs1 ?? "0"}</div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* SUITS ROW */}
      {/* -------------------------------------------------- */}
      <div className="flex justify-center gap-4 mb-2">
        <SuitBox suit="♠" rec={map["Andar 6"]} />
        <SuitBox suit="♥" rec={map["Andar 7"]} />
        <SuitBox suit="♦" rec={map["Andar 8"]} />
        <SuitBox suit="♣" rec={map["Andar 9"]} />
      </div>

      {/* -------------------------------------------------- */}
      {/* LABEL "12" */}
      {/* -------------------------------------------------- */}
      <div className="text-center font-bold text-[20px] my-3">12</div>

      {/* -------------------------------------------------- */}
      {/* CARDS ROW */}
      {/* -------------------------------------------------- */}
      <div className="flex flex-wrap justify-center gap-2">
        {cardList.map((c, i) => (
          <div key={i} className="flex flex-col items-center">
            <img
              src={cardImg[c]}
              className={`w-[35px] h-[50px] rounded shadow ${
                isSuspended ? "opacity-40" : ""
              }`}
            />
            {isSuspended && (
              <div className="absolute flex items-center justify-center w-[35px] h-[50px]">
                <LOCK />
              </div>
            )}
            <div className="text-[12px] mt-1">0</div>
          </div>
        ))}
      </div>
    </div>
  );
}
