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

export const buildDataFor3038Optimized = (round) => {
  if (!round?.desc || typeof round.desc !== "string") {
    return { error: "Invalid round description" };
  }

  // const rounds = { descs: "KSS,QCC,10DD,6SS,QDD,QSS,1,1,8HH,6HH,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" };
  const descCards = round?.desc
    ?.split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  const cardValueMap = { 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13 };
  const getCardValue = (card) => {
    const match = card.match(/^(10|[6-9JQK])/);
    return match ? cardValueMap[match[0]] || 0 : 0;
  };

  const players = {
    8: { name: "Player 8", cards: [], sum: 0 },
    9: { name: "Player 9", cards: [], sum: 0 },
    10: { name: "Player 10", cards: [], sum: 0 },
    11: { name: "Player 11", cards: [], sum: 0 },
  };

  const playerCycle = [8, 9, 10, 11];

  for (let i = 0; i < descCards.length; i++) {
    const card = descCards[i];

    if (card === "1") continue;
    const playerKey = playerCycle[i % 4];
    const value = getCardValue(card);
    if (!value) continue;

    players[playerKey].cards.push(card);
    players[playerKey].sum += value;
  }

  const totals = Object.entries(players).map(([k, p]) => ({
    key: Number(k),
    sum: p.sum,
  }));
  const max = Math.max(...totals.map((t) => t.sum));
  const winners = totals.filter((t) => t.sum === max);

  const mainWinner = winners.length === 1 ? winners[0].key : "Tie";

  return {
    mid: round.mid,
    result: mainWinner === "Tie" ? "Tie" : `Player ${mainWinner}`,
    details: Object.fromEntries(
      Object.entries(players).map(([key, p]) => [
        `Player ${key}`,
        {
          cards: p.cards,
          totalPoints: p.sum,
          active: mainWinner !== "Tie" && Number(key) === mainWinner,
        },
      ])
    ),
  };
};

const CT3039CasinoIframe = ({ gameId, data, setSelfSuspend }) => {
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

    // Check if desc exists and is valid (exclude only "1"s)
    const descExists =
      round.desc &&
      round.desc.split(",").some((c) => c.trim() !== "1" && c.trim() !== "");
    if (!descExists || !round.mid) {
      setWinFlag(false);
      setWinData(null);
      return;
    }


    const payload = data?.data?.results?.[0]?.result;
    if (round?.mid === data?.data?.results?.[0]?.mid) {
      setWinData(payload);
      setWinFlag(true);
    }
  }, [round?.desc, round?.mid, data?.data?.results?.[0]?.mid]);

  let label = null;

  if (!winData) {
    label = "";
  } else {
    label = `${winData} WINS`;
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

  // Parse desc string into card list
  // Parse desc string into card list
  // const descCards = round?.desc
  // const rounds = "6DD,6CC,9HH,8DD,1,1,8SS,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
  const descCards = round?.desc
    ? round?.desc.split(",").map((c) => c.trim())
    : [];

  const playerNames = [
    `PLAYER 8:${round?.C1?round?.C1:"8"}`,
    `PLAYER 9:${round?.C2?round?.C2:"9"}`,
    `PLAYER 10:${round?.C3?round?.C3:"10"}`,
    `PLAYER 11:${round?.C4?round?.C4:"11"}`,
  ];
  const cValues = [
    Number(round?.C1) || 0,
    Number(round?.C2) || 0,
    Number(round?.C3) || 0,
    Number(round?.C4) || 0,
  ];

  // Find highest C value
  const maxCValue = Math.max(...cValues);
  // Distribute cards cyclically — like round-robin
  const groupedPlayers = playerNames.map((name) => ({
    name,
    cards: [],
  }));

  let currentIndex = 0;
  descCards.forEach((card) => {
    if (card !== "1" && card !== 1) {
      groupedPlayers[currentIndex].cards.push(card);
    }
    // Move to next player in round-robin style
    currentIndex = (currentIndex + 1) % playerNames.length;
  });
  const totalCards = descCards.length;
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (revealedCount < totalCards) {
      const timer = setTimeout(() => setRevealedCount(revealedCount + 1), 500);
      return () => clearTimeout(timer);
    }
  }, [revealedCount, totalCards]);

  return (
    <div className="bg-black aspect-video relative w-full h-full overflow-hidden">
      {/* Game iframe */}
      <div className="relative w-full aspect-video bg-black">
        {/* Overlay popup on win */}
        {winFlag && (
          <WinPopup
            result={{
              win:
                winData === "Player 8" ||
                winData === "Player 9" ||
                winData === "Player 10" ||
                winData === "Player 11"
                  ? 1
                  : 0,
            }}
            label={`${winData || ""}`}
          />
        )}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white"></div>
        )}
        <iframe
          src={`https://casino.diamondcricketid.com/swiftdizire/?id=card32eu&muted`}
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
            <p className="text-white text-[9px] font-bold drop-shadow-md">
              RID: {round?.mid}
            </p>
            {/* Show all cards coming from desc */}
            {/* Desc card display section */}
            {groupedPlayers.map((player, pi) => (
              <div key={pi}>
                <p
                  className={`text-[11px] font-bold uppercase ${
                    Number(round?.[`C${pi + 1}`]) === maxCValue && maxCValue !== 0
                      ? "text-green-400"
                      : "text-[#FFC107]"
                  }`}
                >
                  {player.name}
                </p>
                <div className="flex flex-row ">
                  {player.cards.map((card, ci) => {
                    const cardIndex = pi * 1 + ci;
                    const isRevealed = cardIndex < revealedCount;
                    
                    return (
                      <div key={ci} className="w-[17px] ">
                        {" "}
                        <CasinoCard value={isRevealed ==true ? card : "1"} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right side: Countdown circle */}

          <CountdownCircle
            timeLeft={timeLeft}
            initialTime={BASE_SECONDS} // arc uses base 20 seconds
            value={round?.desc?.split(",")[0] === "1" ? "1" : "0"}
            base={BASE_SECONDS}
          />
        </div>
      </div>
    </div>
  );
};

export default CT3039CasinoIframe;
