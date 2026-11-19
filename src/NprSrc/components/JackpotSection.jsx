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
    <div className="relative w-full px-0 pt-0.5 pb-0.5 select-none overflow-hidden">
      <div className="relative w-full aspect-[840/248]">
        {/* 1. Official Live Dealer & 3D Extruded "JACKPOT" Background Asset - Clean Edge to Edge (No black lines) */}
        <img
          src="/npr/jackpot/jackpot_banner_transparent.png"
          alt="NPR77 Live Jackpot"
          className="w-full h-full object-cover pointer-events-none select-none block"
          draggable={false}
        />

        {/* 2. Dynamic Live-Ticking Digit Boxes - Pixel-Aligned to Banner Slot */}
        <div className="absolute left-[30.2%] right-[1.2%] top-[60.5%] bottom-[14.5%] flex items-center justify-between gap-[1.5px] min-[360px]:gap-[2px] min-[400px]:gap-[2.5px] sm:gap-[3.5px]">
          {formattedString.split("").map((char, index) => {
            if (char === "," || char === ".") {
              return (
                <span
                  key={index}
                  className="text-[#00f0ff] font-black text-[13px] min-[350px]:text-[15px] min-[380px]:text-[17px] min-[410px]:text-[19px] sm:text-[22px] leading-none self-end pb-[1.5px] min-[380px]:pb-[2.5px] px-[0.5px] select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                >
                  {char}
                </span>
              );
            }

            return (
              <div
                key={index}
                className="flex-1 aspect-[1/1.22] rounded-[3px] min-[380px]:rounded-[4px] sm:rounded-[5px] bg-gradient-to-b from-[#1875f0] via-[#0957dc] to-[#043eb5] border-[1.2px] min-[380px]:border-[1.5px] border-white shadow-[0_2px_4px_rgba(0,0,0,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.45)] flex items-center justify-center select-none overflow-hidden"
              >
                <span className="text-white font-black text-[14px] min-[350px]:text-[16px] min-[380px]:text-[18px] min-[410px]:text-[20px] sm:text-[23px] leading-none select-none tracking-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
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

