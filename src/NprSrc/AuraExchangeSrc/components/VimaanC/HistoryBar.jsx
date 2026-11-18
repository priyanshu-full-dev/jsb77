import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audioService';

// Multiplier color palette matching Aviator HTML/CSS:
// blue: #34b4ff (< 2.00x)
// purple: #913ef8 (2.00x - 9.99x)
// pink: #c017b4 (>= 10.00x)
const getMultiplierStyle = (val) => {
  if (val >= 10.0) return 'text-[#c017b4]';
  if (val >= 2.0) return 'text-[#913ef8]';
  return 'text-[#34b4ff]';
};

// Circular counter-clockwise history clock icon
function HistoryClockIcon({ className = "w-[14px] h-[13px]" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

// Solid down caret (closed state)
function CaretDownIcon({ className = "w-2.5 h-2.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17L4 7h16z" />
    </svg>
  );
}

// Solid up caret (open state)
function CaretUpIcon({ className = "w-2.5 h-2.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7l8 10H4z" />
    </svg>
  );
}

// Toggle button component matching exact user HTML/Tailwind classes
function HistoryToggleButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="items-center relative z-[1100] bg-[#1B1C1D] border border-solid border-[#414148] w-[46px] h-[22px] rounded-[13px] cursor-pointer select-none active:scale-95 transition-transform"
      title={isOpen ? "Close Round History" : "Round History"}
    >
      <div className="flex justify-center items-center h-[22px] gap-[5px] -translate-y-[0.5px] text-[#e50539]">
        <HistoryClockIcon className="w-[14px] h-[13px]" />
        {isOpen ? (
          <CaretUpIcon className="w-2.5 h-2.5 duration-300" />
        ) : (
          <CaretDownIcon className="w-2.5 h-2.5 duration-300" />
        )}
      </div>
    </button>
  );
}

export default function HistoryBar() {
  const { history, isHistoryOpen, setIsHistoryOpen } = useGame();
  const modalRef = useRef(null);

  const toNum = (val) => {
    const n = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(n) ? 1.00 : n;
  };

  // Exactly max 25 results
  const displayHistory = (Array.isArray(history) ? history : []).map(toNum).slice(0, 25);
  // Last 6 results for the top bar (no scroller, exact 6 aligned)
  const topBarHistory = displayHistory.slice(0, 6);

  const handleToggleHistory = () => {
    audioService?.playClick?.();
    setIsHistoryOpen(!isHistoryOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsHistoryOpen(false);
      }
    };
    if (isHistoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHistoryOpen, setIsHistoryOpen]);

  // Split 25 items for 7 + 7 + 7 + 4 grid (Image 3)
  const row1 = displayHistory.slice(0, 7);
  const row2 = displayHistory.slice(7, 14);
  const row3 = displayHistory.slice(14, 21);
  const row4 = displayHistory.slice(21, 25);

  return (
    <div className="relative w-full z-30 font-['Inter',sans-serif] mb-1">
      {/* Top Single Row Bar (Image 5) - Exactly aligned, button at fixed right position */}
      <div className="h-[38px] relative w-full flex justify-between items-center px-3 sm:px-3.5 select-none">
        {/* Exactly 6 pills aligned on the left */}
        <div className="flex items-center gap-[7px] overflow-hidden max-h-[22px]">
          {topBarHistory.map((val, idx) => (
            <div
              key={idx}
              className={`cursor-pointer font-bold text-[12px] py-0.5 px-2 bg-[#00000080] border-0 rounded-[11px] box-border transition-transform hover:scale-105 select-none ${getMultiplierStyle(val)} ${val >= 100 ? 'text-[11px] tracking-tight' : ''}`}
            >
              {val.toFixed(2)}x
            </div>
          ))}
        </div>

        {/* Button sits at the exact right position */}
        <div className="shrink-0 text-end">
          <HistoryToggleButton isOpen={false} onClick={handleToggleHistory} />
        </div>
      </div>

      {/* Expanded Round History Modal (Image 3) - Button in exact same top-right coordinate */}
      {isHistoryOpen && (
        <div
          ref={modalRef}
          className="absolute top-0 left-0 right-0 rounded-[14px] sm:rounded-[16px] overflow-hidden shadow-2xl z-[1200] border border-[#28292d]/60 animate-in fade-in duration-150"
        >
          {/* Header row: "ROUND HISTORY" on left, Toggle Button on exact right */}
          <div className="h-[38px] px-3 sm:px-3.5 bg-[#1b1c1d] flex justify-between items-center select-none">
            <span className="text-[#eeeeee] text-[12px] font-medium tracking-wide uppercase select-none">
              ROUND HISTORY
            </span>
            <div className="shrink-0 text-end">
              <HistoryToggleButton isOpen={true} onClick={handleToggleHistory} />
            </div>
          </div>

          {/* Inner dark container holding the 25 pills (Image 3) */}
          <div className="bg-[#252830] px-3 py-2.5 sm:px-4 sm:py-3 flex flex-col gap-1.5 sm:gap-2">
            {row1.length > 0 && (
              <div className="grid grid-cols-7 gap-1.5">
                {row1.map((val, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center font-bold text-[11px] h-[22px] px-1 bg-[#0e1115] hover:bg-[#161a20] rounded-full select-none cursor-pointer transition-colors ${getMultiplierStyle(val)} ${val >= 100 ? 'text-[9.5px] sm:text-[10px] tracking-tighter' : 'tracking-tight'}`}
                  >
                    {val.toFixed(2)}x
                  </div>
                ))}
              </div>
            )}

            {row2.length > 0 && (
              <div className="grid grid-cols-7 gap-1.5">
                {row2.map((val, idx) => (
                  <div
                    key={idx + 7}
                    className={`flex items-center justify-center font-bold text-[11px] h-[22px] px-1 bg-[#0e1115] hover:bg-[#161a20] rounded-full select-none cursor-pointer transition-colors ${getMultiplierStyle(val)} ${val >= 100 ? 'text-[9.5px] sm:text-[10px] tracking-tighter' : 'tracking-tight'}`}
                  >
                    {val.toFixed(2)}x
                  </div>
                ))}
              </div>
            )}

            {row3.length > 0 && (
              <div className="grid grid-cols-7 gap-1.5">
                {row3.map((val, idx) => (
                  <div
                    key={idx + 14}
                    className={`flex items-center justify-center font-bold text-[11px] h-[22px] px-1 bg-[#0e1115] hover:bg-[#161a20] rounded-full select-none cursor-pointer transition-colors ${getMultiplierStyle(val)} ${val >= 100 ? 'text-[9.5px] sm:text-[10px] tracking-tighter' : 'tracking-tight'}`}
                  >
                    {val.toFixed(2)}x
                  </div>
                ))}
              </div>
            )}

            {row4.length > 0 && (
              <div className="flex justify-center gap-1.5">
                {row4.map((val, idx) => (
                  <div
                    key={idx + 21}
                    className="w-[calc((100%-36px)/7)]"
                  >
                    <div
                      className={`flex items-center justify-center font-bold text-[11px] h-[22px] px-1 bg-[#0e1115] hover:bg-[#161a20] rounded-full select-none cursor-pointer transition-colors ${getMultiplierStyle(val)} ${val >= 100 ? 'text-[9.5px] sm:text-[10px] tracking-tighter' : 'tracking-tight'}`}
                    >
                      {val.toFixed(2)}x
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
