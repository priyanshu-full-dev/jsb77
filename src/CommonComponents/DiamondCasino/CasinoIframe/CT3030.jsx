import { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import WinPopup from "../../Popup/WinPopup";
import { getTeenPattiWinner } from "../WinLogic/CT3030";

/** Countdown circle */
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

/** Card display that reports when the final image is loaded */
const CasinoCard = ({ value, id, onLoaded }) => {
  if (!value) return null;

  // "1" means placeholder; 0.webp is the placeholder asset
  const isPlaceholder = value === "1";
  const imgSrc = isPlaceholder ? "/cards/0.webp" : `/cards/${value}.webp`;

  // Ensure cached images still mark as loaded by checking complete in layout
  const imgRef = useRef(null);

  useLayoutEffect(() => {
    if (!isPlaceholder && imgRef.current && imgRef.current.complete) {
      onLoaded?.(id);
    }
  }, [isPlaceholder, id, onLoaded, imgSrc]);

  const handleLoad = useCallback(
    (e) => {
      // Count only the real, revealed card (not the placeholder)
      if (!isPlaceholder) {
        onLoaded?.(id);
      }
    },
    [id, isPlaceholder, onLoaded]
  );

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={`Card ${value}`}
      className="w-[23px]"
      onLoad={handleLoad}
      // eager so it loads as soon as rendered; helps consistent onLoad behavior
      loading="eager"
    />
  );
};

const CT3030CasinoIframe = ({ gameId, data, setSelfSuspend }) => {
  const domainDetails = useSelector((state) => state.domainConfig);

  const [round, setRound] = useState(null);
  const initialTime = useRef(Number(round?.autotime) || 0);
  const [timeLeft, setTimeLeft] = useState(initialTime.current);
  const [loaded, setLoaded] = useState(false);

  // Win popup state
  const [winFlag, setWinFlag] = useState(false);
  const [winData, setWinData] = useState(null);

  // Track which card images are fully loaded (non-placeholder)
  const [loadedMap, setLoadedMap] = useState({});
  const markLoaded = useCallback((key) => {
    setLoadedMap((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);
  const allCardsShown = ["C1", "C2", "C3", "C4", "C5", "C6"].every((k) => loadedMap[k] === true);

  // On incoming data, pick the latest round and reset clock
  useEffect(() => {
    const newRound = data?.data?.t1?.[0];
    if (newRound?.mid) {
      setRound(newRound);
      const newTime = Number(newRound?.autotime);
      initialTime.current = newTime;
      setTimeLeft(newTime);
    }
  }, [data]);

  // Reset loaded map and popup state when round changes
  useEffect(() => {
    setLoadedMap({});
    setWinFlag(false);
    setWinData(null);
  }, [round?.mid]);

  // Countdown using rAF for smooth tick
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

  // External self suspend when timer near end
  useEffect(() => {
    setSelfSuspend(timeLeft <= 2);
  }, [timeLeft, setSelfSuspend]);

  // Determine when values are fully revealed (no placeholders)
  const valuesReady =
    round?.C1 &&
    round?.C2 &&
    round?.C3 &&
    round?.C4 &&
    round?.C5 &&
    round?.C6 &&
    round?.C1 !== "1" &&
    round?.C4 !== "1";

  // Show WinPopup only when:
  // 1) All values are revealed (no placeholder)
  // 2) All corresponding images have actually loaded and are on screen
  useEffect(() => {
    if (valuesReady && allCardsShown) {
      const playerA = [round.C1, round.C2, round.C3];
      const playerB = [round.C4, round.C5, round.C6];
      const win = getTeenPattiWinner(playerA, playerB);

      if (!winFlag) {
        setWinData({ win, mid: round.mid });
        setWinFlag(true);
      }
    } else {
      setWinFlag(false);
      setWinData(null);
    }
  }, [
    valuesReady,
    allCardsShown,
    round?.C1,
    round?.C2,
    round?.C3,
    round?.C4,
    round?.C5,
    round?.C6,
    round?.mid,
    winFlag,
  ]);

  let label = null;
  if (winData) {
    if (winData?.win === "A") label = "PLAYER A";
    else if (winData?.win === "B") label = "PLAYER B";
    else if (winData?.win === "C") label = "TIE";
  }

  return (
    <div className="bg-black aspect-video relative w-full h-full overflow-hidden">
      {/* Game iframe */}
      <div className="relative w-full aspect-video bg-black">
        {winFlag && <WinPopup result={winData} label={label} />}

        {/* {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <img
              src="/casino/universe.gif"
              alt="universe"
              className="h-[220px] w-[220px] object-contain"
            />
          </div>
        )} */}

        <iframe
          src={`https://casino.diamondcricketid.com/swiftdizire/?id=${gameId}&muted`}
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
          <CountdownCircle timeLeft={timeLeft} initialTime={initialTime.current} />
        </div>

        {/* Player cards */}
        <div>
          {/* Player A */}
          <div className="flex flex-col -mt-[40px]">
            <p className="text-white font-bold text-[13px]">PLAYER A</p>
            <div className="flex gap-1">
              <CasinoCard value={round?.C1} id="C1" onLoaded={markLoaded} />
              <CasinoCard value={round?.C2} id="C2" onLoaded={markLoaded} />
              <CasinoCard value={round?.C3} id="C3" onLoaded={markLoaded} />
            </div>
          </div>

          {/* Player B */}
          <div className="flex flex-col">
            <p className="text-white font-bold text-[13px]">PLAYER B</p>
            <div className="flex gap-1">
              <CasinoCard value={round?.C4} id="C4" onLoaded={markLoaded} />
              <CasinoCard value={round?.C5} id="C5" onLoaded={markLoaded} />
              <CasinoCard value={round?.C6} id="C6" onLoaded={markLoaded} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CT3030CasinoIframe;
