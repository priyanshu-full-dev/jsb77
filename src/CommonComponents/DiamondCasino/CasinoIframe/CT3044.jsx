import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import WinPopup from "../../Popup/WinPopup";
import { getDresult } from "../../../api";

const BASE_SECONDS = 20; // full circle = 20s

const CountdownCircle = ({ value, timeLeft, base = BASE_SECONDS }) => {
  // Show only when card is closed and timer > 0
  if ((value !== "1" && value !== 1) || timeLeft <= 1) return null;

  const color = timeLeft > 10 ? "#22c55e" : "#ef4444";

  // Arc percentage is relative to BASE_SECONDS (full circle)
  const percentage = Math.max(0, Math.min(100, (timeLeft / base) * 100));
  const angle = 360 * (percentage / 100);

  return (
    <div className="relative w-12 h-12 m-2">
      {/* Background ring */}
      <div className="absolute inset-0 rounded-full border-[6px] border-gray-700" />

      {/* Progress arc (starts from 12 o'clock). Flip horizontally so sweep appears right->left */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-150"
        style={{
          transform: "scaleX(-1)",
          background: `conic-gradient(from -90deg, ${color} ${angle}deg, transparent 0)`,
          mask: "radial-gradient(circle 70% at center, transparent 70%, black 71%)",
          WebkitMask:
            "radial-gradient(circle 70% at center, transparent 70%, black 71%)",
        }}
      />

      {/* Inner black circle */}
      <div className="absolute inset-[6px] rounded-full bg-black flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {Math.max(0, Math.round(timeLeft))}
        </span>
      </div>
    </div>
  );
};

const CasinoCard = ({ value }) => {
  if (!value) return null;
  const imgSrc = value === "1" ? "/cards/0.webp" : `/cards/${value}.webp`;
  return <img src={imgSrc} alt={`Card ${value}`} className="w-[23px] " />;
};

const totalPoints = {
  A: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
};
const faceCards = ["J", "Q", "K"];
const suitsOrder = { spade: 4, heart: 3, club: 2, diamond: 1 }; // used for tie-break in your calc

export const buildDataFor3044Optimized = (round) => {
  // Utility: Parse card string like "AH" → { rank: 'A', suit: 'H' }
  const parse = (card) => {
    if (!card) return null;
    const rankMatch = card.match(/^(A|K|Q|J|\d{1,2})/);
    const rank = rankMatch ? rankMatch[0] : null;
    const suitChar = card.slice(-1);
    return { rank, suit: suitChar, card };
  };

  const rankValue = {
    2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
    7: 7, 8: 8, 9: 9, 10: 10,
    J: 11, Q: 12, K: 13, A: 14,
  };

  // All possible 5-card combinations
  const combinations = (array, size) => {
    if (size === 1) return array.map((el) => [el]);
    const combos = [];
    array.forEach((el, i) => {
      const smaller = combinations(array.slice(i + 1), size - 1);
      smaller.forEach((combo) => combos.push([el, ...combo]));
    });
    return combos;
  };

  // Evaluate a 5-card hand
  const evaluate5 = (cards) => {
    const ranks = cards.map((c) => rankValue[c.rank]).sort((a, b) => b - a);
    const suits = cards.map((c) => c.suit);

    const isFlush = suits.every((s) => s === suits[0]);
    const isStraight = (() => {
      const unique = [...new Set(ranks)];
      if (unique.length < 5) return false;
      // Handle A-2-3-4-5
      if (unique[0] === 14 && unique.slice(-4).join(",") === "5,4,3,2") return true;
      return unique[0] - unique[4] === 4;
    })();

    const counts = {};
    for (const r of ranks) counts[r] = (counts[r] || 0) + 1;

    const sortedByCount = Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || b[0] - a[0])
      .map(([r]) => Number(r));

    // Hand ranking
    let category = 1; // High Card
    if (isStraight && isFlush) category = 9;
    else if (Object.values(counts).includes(4)) category = 8;
    else if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) category = 7;
    else if (isFlush) category = 6;
    else if (isStraight) category = 5;
    else if (Object.values(counts).includes(3)) category = 4;
    else if (Object.values(counts).filter((c) => c === 2).length === 2) category = 3;
    else if (Object.values(counts).includes(2)) category = 2;

    return { category, ranks: sortedByCount, allRanks: ranks };
  };

  // Compare 2 evaluated hands
  const compareHands = (a, b) => {
    if (a.category > b.category) return "A";
    if (b.category > a.category) return "B";
    for (let i = 0; i < a.ranks.length; i++) {
      if ((a.ranks[i] || 0) > (b.ranks[i] || 0)) return "A";
      if ((b.ranks[i] || 0) > (a.ranks[i] || 0)) return "B";
    }
    for (let i = 0; i < a.allRanks.length; i++) {
      if ((a.allRanks[i] || 0) > (b.allRanks[i] || 0)) return "A";
      if ((b.allRanks[i] || 0) > (a.allRanks[i] || 0)) return "B";
    }
    return "Tie";
  };

  // Player hole cards + board
  const playerA = [round.C1, round.C2].map(parse);
  const playerB = [round.C3, round.C4].map(parse);
  const board = [round.C5, round.C6, round.C7, round.C8, round.C9].map(parse);

  // Find best 5-card combo for A
  const combosA = combinations([...playerA, ...board], 5);
  const bestA = combosA
    .map(evaluate5)
    .sort((a, b) => compareHands(b, a) === "A" ? 1 : -1)[0];

  // Best combo for B
  const combosB = combinations([...playerB, ...board], 5);
  const bestB = combosB
    .map(evaluate5)
    .sort((a, b) => compareHands(b, a) === "A" ? 1 : -1)[0];

  const winner = compareHands(bestA, bestB);

  return {
    mid: round.mid,
    cards: { A: playerA, B: playerB, board },
    result: {
      mainWinner: winner,
      playerA: bestA,
      playerB: bestB,
    },
  };
};


const CT3044CasinoIframe = ({ gameId, data, setSelfSuspend }) => {
  const domainDetails = useSelector((state) => state.domainConfig);
  const round = data?.data?.t1?.[0];

  // displayed (interpolated) remaining seconds
  const [timeLeft, setTimeLeft] = useState(BASE_SECONDS);
  const [loaded, setLoaded] = useState(false);
  const [winFlag, setWinFlag] = useState(false);
  const [winData, setWinData] = useState(null);

  // refs for smoothing and control
  const targetRem = useRef(BASE_SECONDS); // the "autotime" target when last synced
  const lastSync = useRef(Date.now()); // timestamp when targetRem was set
  const rafRef = useRef(null);
  const exhaustedRef = useRef(false); // true when timer reached 0 and should not restart for same mid
  const prevMid = useRef(null); // to detect mid changes

  // Speed multiplier (display 1s = 900ms real)
  const SPEED = 1000 / 800; // about 1.111

  // Tick function kept outside effect so we can call/request it dynamically
  const tick = () => {
    // compute ideal remaining based on last sync and speed
    const elapsed = ((Date.now() - lastSync.current) / 1000) * SPEED;
    const idealRemaining = targetRem.current - elapsed;
    const idealClamped = idealRemaining > 0 ? idealRemaining : 0;

    setTimeLeft((prev) => {
      const diff = idealClamped - prev;

      // If ideal is zero or very close, snap to zero and stop (exhaust)
      if (idealClamped === 0 && Math.abs(diff) < 0.05) {
        // mark exhausted and stop RAF
        exhaustedRef.current = true;
        // cancel RAF safely
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return 0;
      }

      // tiny snap if already very close
      if (Math.abs(diff) < 0.03) {
        return parseFloat(idealClamped.toFixed(3));
      }

      // smooth lerp (0.08 chosen for smooth but responsive movement)
      const next = prev + diff * 0.08;
      return Math.max(0, parseFloat(next.toFixed(3)));
    });

    // if we haven't exhausted and RAF still active, request next frame
    if (!exhaustedRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // ensure RAF ref cleared (safety)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  };

  useEffect(() => {

    if (!round) {
      setWinFlag(false);
      setWinData(null);
      return;
    }

    const allCards = [
      round?.C1,
      round?.C2,
      round?.C3,
      round?.C4,
      round?.C5,
      round?.C6,
      round?.C7,
      round?.C8,
      round?.C9,
    ];

    const ready = allCards.every((c) => c && c !== "1");

    if (!ready || !round.mid) {
      setWinFlag(false);
      setWinData(null);
      return;
    }

    try {
      const payload = buildDataFor3044Optimized(round);

      setWinData(payload);
      setWinFlag(true);
    } catch (error) {
      console.error("Error calculating win data:", error);
      setWinFlag(false);
      setWinData(null);
    }
  }, [
    round?.C1,
    round?.C2,
    round?.C3,
    round?.C4,
    round?.C5,
    round?.C6,
    round?.C7,
    round?.C8,
    round?.C9,
    round?.mid,
  ]);

  let label = null;

  if (!winData) {
    label = "";
  } else if (winData?.winner === "TIE") {
    label = "TIE";
  } else {
    label = `${winData?.winner} WINS (${winData?.playerA?.hand} vs ${winData?.playerB?.hand})`;
  }

  // When round.autotime or mid updates:
  // - If mid changed => reset exhausted flag and start timer toward new autotime.
  // - If same mid and not exhausted => update targetRem to new autotime so display interpolates smoothly.
  // - If same mid and exhausted => ignore autotime updates (timer won't restart).
  useEffect(() => {
    const mid = round?.mid;
    if (!mid) {
      // no round -> stop RAF and reset
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      exhaustedRef.current = false;
      prevMid.current = null;
      targetRem.current = BASE_SECONDS;
      lastSync.current = Date.now();
      setTimeLeft(BASE_SECONDS);
      return;
    }

    const auto = Number(round?.autotime);
    const normalized = !isNaN(auto) && auto > 0 ? auto : BASE_SECONDS;

    // new mid (new round) -> always restart
    if (prevMid.current !== mid) {
      prevMid.current = mid;
      exhaustedRef.current = false;
      targetRem.current = normalized;
      lastSync.current = Date.now();

      // ensure RAF running
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
      return;
    }

    // same mid:
    if (!exhaustedRef.current) {
      // update target so displayed value will interpolate (smoothly extend or shrink)
      targetRem.current = normalized;
      lastSync.current = Date.now();
      // ensure RAF running
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    } else {
      // exhausted & same mid -> ignore autotime updates
      // (do nothing)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.autotime, round?.mid]);

  // Start/stop RAF when round appears/disappears (safety)
  useEffect(() => {
    if (!round?.mid) return;
    if (!rafRef.current && !exhaustedRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.mid]);

  // useEffect to detect new result and trigger popup
  // useEffect(() => {
  //   if (!recentResult?.mid) return;

  //   // Ignore duplicate mid
  //   if (recentResult.mid === prevResultMid.current) return;

  //   prevResultMid.current = recentResult.mid;

  //   // Clear any existing timeout
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //     timeoutRef.current = null;
  //   }

  //   // Show popup
  //   setWinData(recentResult);
  //   setWinFlag(true);

  //   // Hide after 2 seconds
  //   timeoutRef.current = setTimeout(() => {
  //     setWinFlag(false);
  //     timeoutRef.current = null;
  //   }, 2000);

  //   // Cleanup when component unmounts or new result arrives
  //   return () => {
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //       timeoutRef.current = null;
  //     }
  //   };
  // }, [recentResult?.mid]);
  // Add this new useEffect BELOW your existing useEffect for recentResult

  return (
    <div className="bg-black aspect-video relative w-full h-full overflow-hidden">
      {/* Game iframe */}
      <div className="relative w-full aspect-video bg-black">
        {/* Overlay popup on win */}
        {winFlag && (
          <WinPopup
            result={{
              win:
                winData?.result?.mainWinner === "A" ||
                winData?.result?.mainWinner === "B"
                  ? 1
                  : 0,
            }}
            label={`PLAYER ${winData?.result?.mainWinner || ""}`}
          />
        )}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white"></div>
        )}
        <iframe
          src={`https://casino.diamondcricketid.com/swiftdizire/?id=${gameId}&muted`}
          className="absolute top-0 left-0 w-full h-full "
          allow="autoplay; fullscreen"
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Overlay content */}
      <div className="absolute inset-0 z-[10] flex flex-col justify-start">
        <div className="flex justify-between items-start p-1">
          {/* Left side: RID + Card */}
          <div>
            <p className="text-white text-[10px] font-bold drop-shadow-md">
              RID: {round?.mid}
            </p>
            <p className="text-white text-[12.5px] font-bold uppercase">
              PLAYER A
            </p>
            <div className="flex space-x-1">
              <CasinoCard value={round?.C1} />
              <CasinoCard value={round?.C2} />
              
            </div>
            <p className="text-white text-[12.5px] font-bold uppercase">
              PLAYER B
            </p>
            <div className="flex space-x-1">
              <CasinoCard value={round?.C3} />
              <CasinoCard value={round?.C4} />  
            </div>
            <p className="text-white text-[12.5px] font-bold uppercase">
              Board
            </p>
            <div className="flex space-x-1">
              <CasinoCard value={round?.C5} />
              <CasinoCard value={round?.C6} />  
              <CasinoCard value={round?.C7} />  
              <CasinoCard value={round?.C8} />  
              <CasinoCard value={round?.C9} />  
            </div>
          </div>

          {/* Right side: Countdown circle */}
          <CountdownCircle
            timeLeft={timeLeft}
            initialTime={BASE_SECONDS} // arc uses base 20 seconds
            value={round?.C1}
            base={BASE_SECONDS}
          />
        </div>
      </div>
    </div>
  );
};

export default CT3044CasinoIframe;
