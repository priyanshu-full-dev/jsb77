import { useState, useEffect } from "react";

const JackpotSection = () => {
  // Initial jackpot matches exact user reference: 23,902,961.60
  const [jackpot, setJackpot] = useState(23902961.60);

  // Live ticking jackpot counter (increments every 1.6s)
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + Math.random() * 0.95 + 0.15);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const parts = jackpot.toFixed(2).split(".");
  const intPart = Number(parts[0]).toLocaleString("en-US");
  const formattedString = `${intPart}.${parts[1]}`;

  return (
    <div className="relative w-full px-0 pt-0.5 pb-1 select-none overflow-hidden">
      <div className="relative w-full aspect-[840/248]">
        {/* 1. Official Live Dealer & 3D Extruded "JACKPOT" Background Asset - Clean Edge to Edge (No black lines) */}
        <img
          src="/npr/jackpot/jackpot_banner_transparent.png"
          alt="NPR77 Live Jackpot"
          className="w-full h-full object-cover pointer-events-none select-none block"
          draggable={false}
        />

        {/* 2. Dynamic Live-Ticking Digit Boxes - Pixel-Aligned to Banner Slot */}
        <div className="absolute left-[30.2%] right-[1.2%] top-[59%] bottom-[13.5%] flex items-center justify-between gap-[1.5px] min-[380px]:gap-[2.5px] sm:gap-[3px]">
          {formattedString.split("").map((char, index) => {
            if (char === "," || char === ".") {
              return (
                <span
                  key={index}
                  className="text-[#38bdf8] font-black text-[11px] min-[370px]:text-[13px] min-[410px]:text-[15px] sm:text-[17px] leading-none self-end pb-0.5 min-[400px]:pb-1 px-[0.5px] select-none"
                >
                  {char}
                </span>
              );
            }

            return (
              <div
                key={index}
                className="flex-1 aspect-[44/64] rounded-[3.5px] min-[390px]:rounded-[4.5px] sm:rounded-[5.5px] bg-gradient-to-b from-[#0058ec] via-[#0047cc] to-[#002f9e] border-[1.2px] min-[400px]:border-[1.5px] border-white shadow-[0_2px_4px_rgba(0,0,0,0.35)] flex items-center justify-center select-none"
              >
                <span className="text-white font-black text-[11.5px] min-[370px]:text-[13.5px] min-[410px]:text-[15px] sm:text-[17px] leading-none select-none tracking-tight">
                  {char}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JackpotSection;

