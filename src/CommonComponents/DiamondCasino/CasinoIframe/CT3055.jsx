import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const CountdownCircle = ({ timeLeft, initialTime }) => {
  const percentage = (timeLeft / initialTime) * 100;
  const angle = 360 * (percentage / 100);

  const color = timeLeft > 10 ? "#22c55e" : "#ef4444";



  return (
    <div className="relative w-12 h-12 m-2">
      <div className="absolute inset-0 rounded-full border-[6px] border-gray-700" />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${angle}deg, transparent 0deg)`,
          WebkitMask:
            "radial-gradient(circle 70% at center, transparent 71%, black 72%)",
          mask: "radial-gradient(circle 70% at center, transparent 71%, black 72%)",
        }}
      />
      <div className="absolute inset-[6px] rounded-full bg-black flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {Math.max(0, Math.round(timeLeft))}
        </span>
      </div>
    </div>
  );
};

/** Card display */
const CasinoCard = ({ value }) => {
  if (!value) return null;
  const imgSrc = value === "1" ? "/cards/0.webp" : `/cards/${value}.webp`;
  return <img src={imgSrc} alt={`Card ${value}`} className="w-[23px]" />;
};


const CT3055CasinoIframe = ({ gameId, data, setSelfSuspend }) => {
  const domainDetails = useSelector((state) => state.domainConfig);

  const [round, setRound] = useState(null);

  const initialTime = useRef(Number(round?.autotime) || 0);
  const [timeLeft, setTimeLeft] = useState(initialTime.current);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const newRound = data?.data?.t1?.[0];
    if (newRound?.mid) {
      setRound(newRound);
      const newTime = Number(newRound?.autotime);
      initialTime.current = newTime;
      setTimeLeft(newTime);
    }

  }, [data]);

  // ✅ Countdown timer
  useEffect(() => {
    let start = Date.now();
    let rafId;

    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = initialTime.current - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        return;
      }

      setTimeLeft(remaining);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [round?.mid]);

  useEffect(() => {
    setSelfSuspend(timeLeft <= 2);
  }, [timeLeft, setSelfSuspend]);

  return (
    <div className="bg-black aspect-video relative w-full h-full overflow-hidden">
      {/* Game iframe */}
      <div className="relative w-full aspect-video bg-black">
        {/* {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <img src="/casino/universe.gif" alt="universe" className="h-[220px] w-[220px] object-contain"/>
          </div>
        )} */}
        <iframe
          src={`https://casino.diamondcricketid.com/swiftdizire/?id=baccarat&muted`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="autoplay; fullscreen"
          onLoad={() => setLoaded(true)}
          // sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-autoplay"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-[10] flex flex-col justify-start p-2">
        {/* Top row with timer */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white text-sm font-bold">RID: {round?.mid}</p>
          </div>
          <CountdownCircle
            timeLeft={timeLeft}
            initialTime={initialTime.current}
            color={domainDetails?.primaryColor}
          />
        </div>

        {/* Player cards */}
        <div>
          {/* Player A */}
          <div className="flex flex-col -mt-[40px]">
            <p className="text-white font-bold text-[13px]">PLAYER</p>
            <div className="flex gap-1">
              <CasinoCard value={round?.C1} />
              <CasinoCard value={round?.C2} />
              <CasinoCard value={round?.C3} />
            </div>
          </div>

          {/* Player B */}
          <div className="flex flex-col">
            <p className="text-white font-bold text-[13px]">BANKER</p>
            <div className="flex gap-1">
              <CasinoCard value={round?.C4} />
              <CasinoCard value={round?.C5} />
              <CasinoCard value={round?.C6} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CT3055CasinoIframe;
