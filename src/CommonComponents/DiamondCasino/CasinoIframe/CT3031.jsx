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

export const buildDataFor3031Optimized = (round) => {
  const parse = (card) => {
    if (!card) return null;
    const rankMatch = card.match(/^(A|K|Q|J|\d{1,2})/);
    const rank = rankMatch ? rankMatch[0] : null;
    const suitChar = card.slice(-1);
    // NOTE: preserved mapping as you requested (but mapping seems intentionally swapped)
    let suit, color;
    if (suitChar === "H") {
      suit = "spade";
      color = "black";
    } else if (suitChar === "D") {
      suit = "heart";
      color = "red";
    } else if (suitChar === "C") {
      suit = "club";
      color = "black";
    } else if (suitChar === "S") {
      suit = "diamond";
      color = "red";
    }
    return { card, rank, suit, color, rawSuitChar: suitChar };
  };

  const ranksOrder = {
    A: 14,
    K: 13,
    Q: 12,
    J: 11,
    10: 10,
    9: 9,
    8: 8,
    7: 7,
    6: 6,
    5: 5,
    4: 4,
    3: 3,
    2: 2,
  };

  const evaluateHand = (cards) => {
    const parsed = cards.map(parse);
    // defensive: if any parse null, return low values
    if (parsed.some((p) => !p || !p.rank)) {
      return { parsed, ranks: [0, 0, 0], suits: [], category: 0, rankValue: 0 };
    }

    const ranks = parsed.map((c) => ranksOrder[c.rank] || Number(c.rank));
    const suits = parsed.map((c) => c.suit);

    // sort descending for high card comparison
    ranks.sort((a, b) => b - a);

    const isTrio = ranks[0] === ranks[1] && ranks[1] === ranks[2];
    const isFlush = suits.every((s) => s === suits[0]);
    const isStraight =
      (ranks[0] - ranks[1] === 1 && ranks[1] - ranks[2] === 1) || // normal straight
      (ranks.includes(14) && ranks.includes(3) && ranks.includes(2)); // A-2-3 straight
    const isStraightFlush = isStraight && isFlush;
    const isPair =
      ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2];

    let category, rankValue;
    if (isStraightFlush) {
      category = 6;
      rankValue = ranks[0];
    } else if (isTrio) {
      category = 5;
      rankValue = ranks[0];
    } // Trio
    else if (isStraight) {
      category = 4;
      rankValue =
        ranks.includes(14) && ranks.includes(2) && ranks.includes(3)
          ? 3
          : ranks[0];
    } else if (isFlush) {
      category = 3;
      rankValue = ranks[0];
    } else if (isPair) {
      category = 2;
      const pairRank =
        ranks[0] === ranks[1]
          ? ranks[0]
          : ranks[1] === ranks[2]
          ? ranks[1]
          : ranks[0];
      rankValue = pairRank;
    } else {
      category = 1;
      rankValue = ranks[0];
    } // High card

    return { parsed, ranks, suits, category, rankValue };
  };

  const compareHands = (handA, handB) => {
    if (handA.category > handB.category) return "A";
    if (handB.category > handA.category) return "B";
    // same category → tie-break
    if (handA.rankValue > handB.rankValue) return "A";
    if (handB.rankValue > handA.rankValue) return "B";
    // if still equal, compare kickers (sorted ranks)
    for (let i = 0; i < 3; i++) {
      if ((handA.ranks[i] || 0) > (handB.ranks[i] || 0)) return "A";
      if ((handB.ranks[i] || 0) > (handA.ranks[i] || 0)) return "B";
    }
    return "Tie";
  };

  const calcDerived = (cards) => {
    const parsed = cards.map(parse);
    let faceCount = 0,
      highFace = null,
      highPoint = null;
    let colorCountObj = { red: 0, black: 0 };

    for (const c of parsed) {
      if (!c) continue;
      if (faceCards.includes(c.rank)) faceCount++;
      if (c.color === "red") colorCountObj.red++;
      else colorCountObj.black++;
      if (
        faceCards.includes(c.rank) &&
        (!highFace ||
          faceCards.indexOf(c.rank) > faceCards.indexOf(highFace.rank) ||
          (faceCards.indexOf(c.rank) === faceCards.indexOf(highFace.rank) &&
            suitsOrder[c.suit] > suitsOrder[highFace.suit]))
      ) {
        highFace = c;
      }
      if (
        !faceCards.includes(c.rank) &&
        (!highPoint || totalPoints[c.rank] > totalPoints[highPoint.rank])
      ) {
        highPoint = c;
      }
    }
    const colorWinner =
      colorCountObj.red > colorCountObj.black
        ? "red"
        : colorCountObj.black > colorCountObj.red
        ? "black"
        : "Tie";

    return {
      parsed,
      faceCount,
      highFace,
      highPoint,
      color: { ...colorCountObj, winner: colorWinner },
    };
  };

  // Evaluate both players (A: C1,C3,C5) (B: C2,C4,C6)
  const handA = evaluateHand([round.C1, round.C3, round.C5]);
  const handB = evaluateHand([round.C2, round.C4, round.C6]);
  const playerA = calcDerived([round.C1, round.C3, round.C5]);
  const playerB = calcDerived([round.C2, round.C4, round.C6]);

  const mainWinner = compareHands(handA, handB);

  return {
    mid: round.mid,
    cards: { A: playerA.parsed, B: playerB.parsed },
    result: {
      mainWinner,
      sideMarkets: {
        pairPlus: {
          A:
            handA.category >= 2
              ? handA.category === 6
                ? "StraightFlush"
                : handA.category === 5
                ? "Trio"
                : handA.category === 4
                ? "Straight"
                : handA.category === 3
                ? "Flush"
                : "Pair"
              : "None",
          B:
            handB.category >= 2
              ? handB.category === 6
                ? "StraightFlush"
                : handB.category === 5
                ? "Trio"
                : handB.category === 4
                ? "Straight"
                : handB.category === 3
                ? "Flush"
                : "Pair"
              : "None",
        },
      },
    },
  };
};

const CT3031CasinoIframe = ({ gameId, data, setSelfSuspend }) => {
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
    ];

    const ready = allCards.every((c) => c && c !== "1");

    if (!ready || !round.mid) {
      setWinFlag(false);
      setWinData(null);
      return;
    }

    try {
      const payload = buildDataFor3031Optimized(round);

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
              <CasinoCard value={round?.C3} />
              <CasinoCard value={round?.C5} />
            </div>
            <p className="text-white text-[12.5px] font-bold uppercase">
              PLAYER B
            </p>
            <div className="flex space-x-1">
              <CasinoCard value={round?.C2} />
              <CasinoCard value={round?.C4} />
              <CasinoCard value={round?.C6} />
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

export default CT3031CasinoIframe;
