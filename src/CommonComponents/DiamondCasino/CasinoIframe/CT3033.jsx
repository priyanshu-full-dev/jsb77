import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import WinPopup from "../../Popup/WinPopup";
import { resolveDTL } from "../WinLogic/CT3033";

const CountdownCircle = ({ timeLeft, initialTime }) => {
  const percentage = Math.max(0, Math.min(100, (initialTime / 20) * 100));
  const angle = 360 * (percentage / 100);
  const color = initialTime > 10 ? "#22c55e" : "#ef4444";

  return (
    <div className="relative w-12 h-12 m-2">
      <div className="absolute inset-0 rounded-full border-[6px] border-gray-700" />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${angle}deg, transparent 0deg)`,
          WebkitMask:
            "radial-gradient(circle 70% at center, transparent 71%, black 72%)",
          mask:
            "radial-gradient(circle 70% at center, transparent 71%, black 72%)",
        }}
      />
      <div className="absolute inset-[6px] rounded-full bg-black flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {Math.ceil(initialTime)}
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

const CT3033CasinoIframe = ({ gameId, data, setSelfSuspend }) => {
  const domainDetails = useSelector((state) => state.domainConfig);

  const [round, setRound] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [winFlag, setWinFlag] = useState(false);
  const [winData, setWinData] = useState(null);

  // Refs for animation frame and timing
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const initialTimeRef = useRef(0);

  // Update round and restart timer
// When new round arrives, reset timer
useEffect(() => {
  const newRound = data?.data?.t1?.[0];
  if (newRound?.mid) {
    const newTime = Number(newRound?.autotime || 0);

    // Set base and round info
    initialTimeRef.current = newTime;
    setRound(newRound);
    setTimeLeft(newTime);

    // Reset timer start so next animation restarts cleanly
    startTimeRef.current = null;
  }
}, [data]);

// Run animation
useEffect(() => {
  if (!round?.mid || !initialTimeRef.current) return;

  let animationFrame;

  const tick = (timestamp) => {
    // Set the start reference on first frame
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = (timestamp - startTimeRef.current) / 1000; // ms → s
    const remaining = Math.max(0, initialTimeRef.current - elapsed);

    setTimeLeft(remaining);

    if (remaining > 0) {
      animationFrame = requestAnimationFrame(tick);
    }
  };

  // Start animation immediately
  animationFrame = requestAnimationFrame(tick);

  // Cleanup
  return () => cancelAnimationFrame(animationFrame);
}, [round?.mid]);


  // Update self-suspend state
  useEffect(() => {
    setSelfSuspend(timeLeft <= 2);
  }, [timeLeft, setSelfSuspend]);

  // Handle win detection
  useEffect(() => {
    const dragonCard = round?.C1;
    const tigerCard = round?.C2;
    const lionCard = round?.C3;
    const mid = round?.mid;

    // Show only when all three cards are revealed (not "1" or undefined)
    const ready =
      dragonCard && dragonCard !== "1" &&
      tigerCard && tigerCard !== "1" &&
      lionCard && lionCard !== "1" &&
      !!mid;

    if (!ready) {
      setWinFlag(false);
      setWinData(null);
      return;
    }

    // Build winner data
    let winn = {
      win: "",
      dragonCard,
      tigerCard,
      lionCard,
      mid,
    };

    // Match result only if mid matches the latest API data
    const apiResult = data?.data?.results?.[0];
    if (apiResult && apiResult.mid === mid) {
      winn.win = apiResult.result;
      setWinData(winn);
    setWinFlag(true);
    }

    
  }, [round?.C1, round?.C2, round?.C3, round?.mid, data]);

  // Derive label for WinPopup
  let label = null;
  if (winData?.win === "D" || winData?.win === "DRAGON") {
    label = "DRAGON";
  } else if (winData?.win === "T" || winData?.win === "TIGER") {
    label = "TIGER";
  } else if (winData?.win === "L" || winData?.win === "LION") {
    label = "LION";
  }

  return (
    <div className="bg-black aspect-video relative w-full h-full overflow-hidden">
      {/* Game iframe */}
      <div className="relative w-full aspect-video bg-black">
        {winFlag && <WinPopup result={winData} label={label} />}

        {/* {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <img src="/casino/universe.gif" alt="universe" className="h-[220px] w-[220px] object-contain" />
          </div>
        )} */}
        <iframe
          src={`https://casino.diamondcricketid.com/swiftdizire/?id=${"dtl20"}&muted`}
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
            initialTime={initialTimeRef.current}
            color={domainDetails?.primaryColor}
          />
        </div>

        {/* Player cards */}
        <div>
          {/* Dragon */}
          <div className="flex flex-col -mt-[40px]">
            <p className="text-white font-bold text-[13px]">Dragon</p>
            <div className="flex gap-1">
              <CasinoCard value={round?.C1} />
            </div>
          </div>

          {/* Tiger */}
          <div className="flex flex-col">
            <p className="text-white font-bold text-[13px]">Tiger</p>
            <div className="flex gap-1">
              <CasinoCard value={round?.C2} />
            </div>
          </div>

          {/* Lion */}
          <div className="flex flex-col">
            <p className="text-white font-bold text-[13px]">Lion</p>
            <div className="flex gap-1">
              <CasinoCard value={round?.C3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CT3033CasinoIframe;
