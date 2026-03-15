import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import WinPopup from "../../Popup/WinPopup";
import { set } from "lodash-es";


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


/** Worli Result Circle - Top Right */
// const WorliResultCircle = ({ result }) => {
//   if (result === null || result === undefined) return null;
  
//   return (
//     <div className="relative w-16 h-16">
//       <div className="absolute inset-0 rounded-full bg-red-600 border-4 border-red-400 flex items-center justify-center shadow-lg">
//         <span className="text-white font-bold text-3xl">{result}</span>
//       </div>
//     </div>
//   );
// };


/** Card display for Worli */
const WorliCard = ({ value }) => {
  // Show card back when value is "1" or not present
  if (!value || value === "1") {
    return (
      <div className="w-[23px] ">
        <img 
          src="/cards/0.webp" 
          alt="Card back" 
          className="w-full h-full object-cover" 
        />
      </div>
    );
  }
  
  const imgSrc = `/cards/${value}.webp`;
  return (
    <div className="w-[23px]">
      <img 
        src={imgSrc} 
        alt={`Card ${value}`} 
        className="w-full h-full object-cover" 
      />
    </div>
  );
};


const CT3043CasinoIframe = ({ gameId, data, setSelfSuspend }) => {
  const domainDetails = useSelector((state) => state.domainConfig);

  const [round, setRound] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [winFlag, setWinFlag] = useState(false);
  const [winData, setWinData] = useState(null);
  const [initialTime, setInitialTime] = useState(0);

  // Refs for animation frame and timing
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const initialTimeRef = useRef(initialTime);

  // Add a ref to track timer mode
  const timerModeRef = useRef('initial'); // 'initial', '3sec', or '20sec'


  // Update round and restart timer
  useEffect(() => {
    const newRound = data?.data?.t1?.[0];
    if (newRound?.mid) {
      setRound(newRound);
      // Only set initial time if cards aren't revealed yet
      if (!newRound.C1 || newRound.C1 === "1") {
        const newTime = Number(newRound?.autotime);
        initialTimeRef.current = newTime;
        setTimeLeft(newTime);
        startTimeRef.current = null;
      }
    }
  }, [data]);


  // Countdown timer using requestAnimationFrame
  useEffect(() => {
    const tick = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const secondsElapsed = elapsed / 1000;
      const newTimeLeft = initialTimeRef.current - secondsElapsed;

      if (newTimeLeft <= 0) {
        setTimeLeft(0);
        cancelAnimationFrame(rafRef.current);
        return;
      }

      setTimeLeft(newTimeLeft);
      rafRef.current = requestAnimationFrame(tick);
    };


    // Start RAF if we have time left
    if (timeLeft > 0) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [round?.mid, timeLeft]); // Add timeLeft to dependencies


  // Update self-suspend state
  useEffect(() => {
    // Only apply self-suspend if in 20sec mode and time is low
    const shouldSuspend = timerModeRef.current === '20sec' && timeLeft <= 2;
    setSelfSuspend(shouldSuspend);
  }, [timeLeft, setSelfSuspend]);


  // Calculate Worli result
  const calculateWorliResult = (c1, c2, c3) => {
    if (!c1 || !c2 || !c3 || c1 === "1" || c2 === "1" || c3 === "1") {
      return null;
    }
    
    // Get card values (A=1, J=11, Q=12, K=13, number cards = face value)
    const getCardValue = (card) => {
      const numCard = parseInt(card);
      if (!isNaN(numCard)) return numCard;
      
      // Handle face cards
      if (card === "A" || card === "1") return 1;
      if (card === "J") return 11;
      if (card === "Q") return 12;
      if (card === "K") return 13;
      
      return 0;
    };
    
    const val1 = getCardValue(c1);
    const val2 = getCardValue(c2);
    const val3 = getCardValue(c3);
    
    const sum = val1 + val2 + val3;
    const lastDigit = sum % 10; // Last digit of sum
    
    return lastDigit;
  };


  // Handle win detection
  useEffect(() => {
    const card1 = round?.C1;
    const card2 = round?.C2;
    const card3 = round?.C3;
    const mid = round?.mid;


    // Check if all three cards are revealed
    const ready =
      card1 && card1 !== "1" &&
      card2 && card2 !== "1" &&
      card3 && card3 !== "1" &&
      !!mid;


    if (!ready) {
      setWinFlag(false);
      setWinData(null);
      return;
    }


    // Calculate Worli result
    const worliResult = calculateWorliResult(card1, card2, card3);


    // Build winner data
    let winn = {
      card1,
      card2,
      card3,
      mid,
      worliResult,
    };


    // Match result with API data if available
    const apiResult = data?.data?.results?.[0];
    if (apiResult && apiResult.mid === mid) {
      winn.apiResult = apiResult.result;
    }


    setWinData(winn);
    setWinFlag(true);
  }, [round?.C1, round?.C2, round?.C3, round?.mid, data]);


  // Get current result for display
  const currentResult = calculateWorliResult(round?.C1, round?.C2, round?.C3);


  // Modify card timer effect
  useEffect(() => {
    // When C1 card is revealed (not "1" or undefined)
    if (round?.C1 && round.C1 !== "1") {
      initialTimeRef.current = 3;
      setTimeLeft(3);
      startTimeRef.current = null;
      timerModeRef.current = '3sec';
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    // When C2 card is revealed (not "1" or undefined)
    if (round?.C2 && round.C2 !== "1") {
      initialTimeRef.current = 20;
      setTimeLeft(20);
      startTimeRef.current = null;
      timerModeRef.current = '20sec';
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  }, [round?.C1, round?.C2]); // Only run when C1 or C2 changes


  return (
    <div className="bg-black aspect-video relative w-full h-full overflow-hidden">
      {/* Game iframe */}
      <div className="relative w-full aspect-video bg-black">
        {winFlag && winData && (
          <WinPopup 
            result={winData} 
            label={`${winData.worliResult}`}
          />
        )}


        {/* {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <img src="/casino/universe.gif" alt="universe" className="h-[220px] w-[220px] object-contain" />
          </div>
        )} */}
        <iframe
          src={`https://casino.diamondcricketid.com/swiftdizire/?id=${"worli2"}&muted`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="autoplay; fullscreen"
          onLoad={() => setLoaded(true)}
          // sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-autoplay"
        />
      </div>


      {/* Overlay */}
      <div className="absolute inset-0 z-[10] flex flex-col justify-between p-2">
        {/* Top section - RID and Cards on left, Result circle on right */}
        <div className="flex justify-between items-start">
          {/* Left side - RID and Cards */}
          <div className="flex flex-col gap-1">
            <p className="text-white text-[11px] font-bold bg-black/30  py-0.5 rounded w-fit">
              RID: {round?.mid}
            </p>
            
            {/* Three Worli cards in horizontal row */}
            <div className="flex gap-1.5">
              <WorliCard value={round?.C1} />
              <WorliCard value={round?.C2} />
              <WorliCard value={round?.C3} />
            </div>
          </div>


          {/* Right side - Result circle and Timer */}
          <div className="flex flex-col items-end gap-1">
            <CountdownCircle
              timeLeft={timeLeft}
              initialTime={initialTimeRef.current}
              color={domainDetails?.primaryColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


export default CT3043CasinoIframe;
