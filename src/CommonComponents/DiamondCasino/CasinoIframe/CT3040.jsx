import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import WinPopup from "../../Popup/WinPopup";
import { getDresult } from "../../../AsianExchangeSrc/api";
import { resolveAAA } from "../WinLogic/CT3040";

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
  return <img src={imgSrc} alt={`Card ${value}`} className="w-[23px] mt-2" />;
};

const CT3040CasinoIframe = ({ gameId, data, setSelfSuspend }) => {
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
  }, [round?.mid]);


 

useEffect(() => {
    const apiResult = data?.data?.results?.[0];
    let winn = {
      win: "",
      card:round?.C1,
      mid : round?.mid,
    };
    if ( round?.C1 === '1' || !round?.mid) {
      setWinFlag(false);
      setWinData(null);
      return;
    }

    if (apiResult && apiResult.mid === round?.mid) {
      winn.win = apiResult.result;
      setWinData(winn);
      setWinFlag(true);
    }

}, [round?.C1, round?.mid]);



  let label = null

  if (winData?.win === "Amar") {
    label = "AMAR (A, 2, 3, 4, 5, 6)"
  } else if (winData?.win === "Akbar") {
    label = "AKBAR (7, 8, 9, 10)"
  } else  if (winData?.win === "Anthony") {
    label = "ANTHONY (J, Q, K)"
  }

  return (
    <div className="bg-black aspect-video relative w-full h-full overflow-hidden">
      {/* Game iframe */}
      <div className="relative w-full aspect-video bg-black">
        {/* Overlay popup on win */}
        {winFlag &&
          <WinPopup result={winData} label={label}  />
        }
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white"></div>
        )}
        <iframe
          src={`https://casino.diamondcricketid.com/swiftdizire/?id=aaa&muted`}
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
            <CasinoCard value={round?.C1} />
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

export default CT3040CasinoIframe;
