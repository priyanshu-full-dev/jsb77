import { useEffect, useRef, useState } from "react";

/** Countdown circle – same as CT3030 */
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

const Iframe = ({ gameId, data }) => {
  const [round, setRound] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const initialTime = useRef(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // data se round set – tumhara sample: [ { mid, autotime, ... } ]
  useEffect(() => {

    const newRound = data?.data?.t1?.[0];
    if (newRound?.mid) {
      setRound(newRound);

      const newTime = Number(newRound?.autotime) || 0;
      initialTime.current = newTime;
      setTimeLeft(newTime);
    }

  }, [data]);

  // countdown – same pattern as CT3030
  useEffect(() => {
    if (!round?.mid) return;

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

  return (
    <>
      <div
        className="w-full flex items-center justify-between px-3 py-1"
        style={{
          background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
          color: "#FFFFFF",
        }}
      >
        <p className="text-[16px] font-[600]">BALL BY BALL</p>
        <p className="text-[12px] font-[600]">{round?.mid}</p>
      </div>
      <div className="bg-black aspect-video relative w-full h-full overflow-hidden">

        {/* Game iframe */}
        <div className="relative w-full aspect-video bg-black">


          <iframe
          src={`https://live.oldd247.com/swiftdizire/?id=${gameId}&muted`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="autoplay; fullscreen"
          onLoad={() => setLoaded(true)}
          // sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-autoplay"
        />
        </div>


        <div className="absolute inset-0 z-[10] flex flex-col justify-start p-2">
          {/* Top row with timer */}
          <div className="flex justify-between items-start">
            <div>


            </div>
            <CountdownCircle
              timeLeft={timeLeft}
              initialTime={initialTime.current || 1}
            />
          </div>



        </div>
      </div>
    </>
  );
};

export default Iframe;
