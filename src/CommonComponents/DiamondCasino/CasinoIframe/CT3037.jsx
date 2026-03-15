import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import WinPopup from "../../Popup/WinPopup";

const BASE_SECONDS = 20;

// TIMER CIRCLE ----------------------------------------------------
const CountdownCircle = ({ value, timeLeft, base = BASE_SECONDS }) => {
  if ((value !== "1" && value !== 1) || timeLeft <= 1) return null;

  const color = timeLeft > 10 ? "#22c55e" : "#ef4444";
  const percentage = Math.max(0, Math.min(100, (timeLeft / base) * 100));
  const angle = 360 * (percentage / 100);

  return (
    <div className="relative w-12 h-12 m-2">
      <div className="absolute inset-0 rounded-full border-[6px] border-gray-700" />
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
      <div className="absolute inset-[6px] rounded-full bg-black flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {Math.max(0, Math.round(timeLeft))}
        </span>
      </div>
    </div>
  );
};

// CARD FOR RID -------------------------------------------------------
const CasinoCard = ({ value }) => {
  if (!value) return null;
  const imgSrc = value === "1" ? "/cards/0.webp" : `/cards/${value}.webp`;
  return <img src={imgSrc} className="w-[23px] mt-2" />;
};

// CARD PARSER FOR T3 -------------------------------------------------
const parseCardCode = (str) => {
  if (!str) return null;

  const rank = str ? (str.length === 4 ? str.slice(0, 2) : str[0]) : null;
  const suitLetter = str[str.length - 1];

  let suit = "♠";
  let color = "text-black";

  if (suitLetter === "H") {
    suit = "♥";
    color = "text-red-500";
  } else if (suitLetter === "D") {
    suit = "♦";
    color = "text-red-500";
  } else if (suitLetter === "C") {
    suit = "♣";
  } else if (suitLetter === "S") {
    suit = "♠";
  }

  return { rank, suit, color };
};

// MAIN COMPONENT -----------------------------------------------------
const CT3037CasinoIframe = ({ gameId, data }) => {
  const round = data?.data?.t1?.[0];

  const [timeLeft, setTimeLeft] = useState(BASE_SECONDS);
  const [loaded, setLoaded] = useState(false);
  const [winFlag, setWinFlag] = useState(false);
  const [winData, setWinData] = useState(null);

  const targetRem = useRef(BASE_SECONDS);
  const lastSync = useRef(Date.now());
  const rafRef = useRef(null);
  const exhaustedRef = useRef(false);
  const prevMid = useRef(null);

  const SPEED = 1000 / 800;

  const tick = () => {
    const elapsed = ((Date.now() - lastSync.current) / 1000) * SPEED;
    const idealRemaining = targetRem.current - elapsed;
    const idealClamped = idealRemaining > 0 ? idealRemaining : 0;

    setTimeLeft((prev) => {
      const diff = idealClamped - prev;

      if (idealClamped === 0 && Math.abs(diff) < 0.05) {
        exhaustedRef.current = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        return 0;
      }

      if (Math.abs(diff) < 0.03) {
        return parseFloat(idealClamped.toFixed(3));
      }

      return Math.max(0, parseFloat((prev + diff * 0.08).toFixed(3)));
    });

    if (!exhaustedRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  // TIMER SYNC ----------------------------------------------------
  useEffect(() => {
    const mid = round?.mid;

    if (!mid) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      exhaustedRef.current = false;
      prevMid.current = null;
      targetRem.current = BASE_SECONDS;
      lastSync.current = Date.now();
      setTimeLeft(BASE_SECONDS);
      return;
    }

    const auto = Number(round?.autotime);
    const normalized = !isNaN(auto) && auto > 0 ? auto : BASE_SECONDS;

    if (prevMid.current !== mid) {
      prevMid.current = mid;
      exhaustedRef.current = false;
      targetRem.current = normalized;
      lastSync.current = Date.now();
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (!exhaustedRef.current) {
      targetRem.current = normalized;
      lastSync.current = Date.now();
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    }
  }, [round?.autotime, round?.mid]);

  useEffect(() => {
    if (!round?.mid) return;
    if (!rafRef.current && !exhaustedRef.current)
      rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [round?.mid]);

  // WIN POPUP --------------------------------------------------------
  useEffect(() => {
    const apiResult = data?.data?.results?.[0];
    let winn = { win: "", card: round?.C1, mid: round?.mid };

    if (round?.C1 === "1" || !round?.mid) {
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

  // T3 CARD MAPPING --------------------------------------------------
  const t3 = data?.data?.t3?.[0];
  const andarCards = (t3?.aall || "")
    .split(",")
    .map(parseCardCode)
    .filter(Boolean);

  const baharCards = (t3?.ball || "")
    .split(",")
    .map(parseCardCode)
    .filter(Boolean);

  return (
    <div className="bg-black aspect-video relative w-full h-full overflow-hidden">

      {/* IFRAME */}
      <div className="relative w-full aspect-video bg-black">
        {winFlag && <WinPopup result={winData} />}
        {!loaded && <div className="absolute inset-0 flex items-center justify-center text-white" />}
        <iframe
          src={`https://casino.diamondcricketid.com/swiftdizire/?id=andarBahar&muted`}
          className="absolute top-0 left-0 w-full h-full"
          onLoad={() => setLoaded(true)}
          allow="autoplay; fullscreen"
        />
      </div>

      {/* TOP OVERLAY (RID + TIMER) */}
      <div className="absolute inset-0 z-[10] flex flex-col justify-start">
        <div className="flex justify-between items-start p-1">
          <div>
            <p className="text-white text-[10px] font-bold">RID: {round?.mid}</p>
            <CasinoCard value={round?.C1} />
          </div>
          <CountdownCircle value={round?.C1} timeLeft={timeLeft} />
        </div>
      </div>

      {/* CARD DISPLAY (BOTTOM CENTER) */}
      <div className="absolute bottom-2 left-0 right-0 z-[20] flex flex-col items-center">

        {/* ANDAR ROW */}
        <div className="flex gap-1 mb-1">
          {andarCards.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <img
                src={`/cards/${c.rank}.webp`}
                className="w-[32px] h-[45px] rounded shadow"
              />
              <span className={`text-[14px] font-bold ${c.color}`}>{c.suit}</span>
            </div>
          ))}
        </div>

        {/* BAHAR ROW */}
        <div className="flex gap-1">
          {baharCards.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <img
                src={`/cards/${c.rank}.webp`}
                className="w-[32px] h-[45px] rounded shadow"
              />
              <span className={`text-[14px] font-bold ${c.color}`}>{c.suit}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CT3037CasinoIframe;
