import React from 'react';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audioService';

export default function BetCard({ panelNum, panel, setPanel, isEditing }) {
  const { gameState, multiplier, placeBet, cashOut } = useGame();

  // Exactly matching the 8 buttons in the video:
  // Row 1: 10, 50
  // Row 2: 100, 500
  // Row 3: 1000, 2500
  // Row 4: 5000, 10000
  const QUICK_BETS = [
    [10, 50],
    [100, 500],
    [1000, 2500],
    [5000, 10000],
  ];

  const handleAmountChange = (val) => {
    audioService.playClick();
    const num = Math.max(10, Math.min(10000, Number(val) || 10));
    setPanel(prev => ({ ...prev, amount: num }));
  };

  const handleToggleAuto = () => {
    audioService.playClick();
    setPanel(prev => ({ ...prev, isAuto: !prev.isAuto }));
  };

  const handleAutoCashoutChange = (val) => {
    setPanel(prev => ({ ...prev, autoCashout: val }));
  };

  const isWaiting = gameState === 'WAITING';
  const isFlying = gameState === 'FLYING';

  // Determine button state and styles
  let btnText = 'Cash In';
  let btnClasses = 'betbtn-mob bg-[#28a909] hover:bg-[#2fc20b] border border-[#b2f2a3] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]';

  if (panel.hasBet) {
    if (isWaiting) {
      btnText = 'Cancel';
      btnClasses = 'cancelBet-mob bg-[#e50539] hover:bg-[#ff2b5b] border border-[#ff7171] text-white';
    } else if (isFlying) {
      if (panel.cashedOut) {
        btnText = `Cashed ₹${panel.winAmount.toFixed(0)}`;
        btnClasses = 'bg-[#184a0d] border border-[#427f00] text-[#a1fca1] cursor-default';
      } else {
        const liveWin = (panel.amount * multiplier).toFixed(2);
        btnText = `Cash Out ₹${liveWin}`;
        btnClasses = 'cashoutbtn-mob bg-[#d07206] hover:bg-[#f38709] border border-[#ffbd71] text-white animate-pulse shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]';
      }
    } else {
      if (panel.cashedOut) {
        btnText = `Won ₹${panel.winAmount.toFixed(0)}`;
        btnClasses = 'bg-[#184a0d] border border-[#427f00] text-white';
      } else {
        btnText = 'Cash In';
      }
    }
  }

  const handleButtonClick = () => {
    if (panel.hasBet && isFlying && !panel.cashedOut) {
      cashOut(panelNum);
    } else {
      placeBet(panelNum);
    }
  };

  return (
    <div className="w-full flex flex-col justify-between p-2.5 bg-[#17181a] rounded-[16px] border border-[#2a2b2e]">
      {/* Top Controls: Auto Toggle & Auto Cashout input */}
      <div className="flex justify-between items-center gap-3 w-full mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#ffffff] font-bold">Auto</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={panel.isAuto}
              onChange={handleToggleAuto}
              className="sr-only peer"
            />
            <div className={`w-[44px] h-[19px] bg-[#141516] rounded-full border border-white/50 transition-colors 
              ${panel.isAuto ? (panelNum === 1 ? 'border-[#008826] bg-[#008826]' : 'border-[#e50539] bg-[#e50539]') : ''} 
              after:content-[''] after:absolute after:top-0.5 after:start-[3px] after:bg-white after:border-white after:border-2 after:rounded-full after:h-[15px] after:w-[15px] after:transition-all 
              ${panel.isAuto ? 'after:translate-x-[23px]' : ''}`}
            />
          </label>
        </div>

        {/* Auto Cashout Multiplier (visible when auto is on) */}
        {panel.isAuto && (
          <div className="flex items-center gap-1.5 bg-[#101112] px-2 py-0.5 rounded-[10px] border border-[#414148]">
            <span className="text-[11px] text-[#858788]">Auto X:</span>
            <input
              type="number"
              step="0.1"
              min="1.01"
              max="100"
              value={panel.autoCashout}
              onChange={(e) => handleAutoCashoutChange(e.target.value)}
              className="w-12 bg-transparent text-right text-[12px] text-white font-bold outline-none"
            />
          </div>
        )}
      </div>

      {/* Main Bet Amount Display / Input */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between bg-[#101112] border border-[#2a2b2e] rounded-[10px] px-3 py-1.5">
          <span className="text-[12px] text-[#858788] font-medium">Bet:</span>
          <div className="flex items-center gap-1">
            <span className="text-white text-[15px] font-bold">₹</span>
            <input
              type="number"
              min="10"
              max="10000"
              value={panel.amount}
              disabled={panel.hasBet && (isWaiting || isFlying)}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-20 bg-transparent text-right text-white font-extrabold text-[15px] outline-none disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Quick Bet Grid Buttons (2 Columns x 4 Rows: 10, 50, 100, 500, 1000, 2500, 5000, 10000) */}
      <div className="grid grid-cols-2 gap-1.5 w-full mb-3">
        {QUICK_BETS.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            {row.map((val, cIdx) => {
              const isSelected = panel.amount === val;
              return (
                <button
                  key={cIdx}
                  type="button"
                  disabled={panel.hasBet && (isWaiting || isFlying)}
                  onClick={() => handleAmountChange(val)}
                  className={`h-[28px] text-[13px] font-medium rounded-full transition-all border 
                    ${isSelected 
                      ? 'bg-[#2a2b2e] border-white/50 text-white font-bold shadow-sm' 
                      : 'bg-[#101112] border-transparent text-[#9ea0a3] hover:text-white hover:bg-[#202123]'
                    } disabled:opacity-50`}
                >
                  {val}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Big Action Button (Cash In / Cash Out / Cancel) */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={panel.hasBet && panel.cashedOut}
        className={`w-full h-[48px] rounded-[10px] font-bold text-[17px] tracking-wide transition-all active:scale-[0.98] flex items-center justify-center ${btnClasses}`}
      >
        <span>{btnText}</span>
      </button>
    </div>
  );
}
