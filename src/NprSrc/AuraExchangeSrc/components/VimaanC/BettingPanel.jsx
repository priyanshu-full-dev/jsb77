import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audioService';

export default function BettingPanel() {
  const { gameState, multiplier, panel1, setPanel1, panel2, setPanel2, placeBet, cancelBet, cashOut, setStakeError, isDemoUser } = useGame();

  // Presets state for both panels (editable when Edit is active)
  const [presets1, setPresets1] = useState([10, 50, 100, 500, 1000, 2500, 5000, 10000]);
  const [presets2, setPresets2] = useState([10, 50, 100, 500, 1000, 2500, 5000, 10000]);

  // Selected bet tracking - null by default (only selected when clicked)
  const [selectedBet1, setSelectedBet1] = useState(null);
  const [selectedBet2, setSelectedBet2] = useState(null);

  // Edit mode active state
  const [isEditing, setIsEditing] = useState(false);

  // Strict Rule: Once bet is placed or round is running, the amount cannot be changed
  const isBetLocked1 = panel1.hasBet || panel1.isNextRoundBet;
  const isBetLocked2 = panel2.hasBet || panel2.isNextRoundBet;

  // 1. EDIT: Click to make bet boxes editable for manual amounts
  const handleToggleEdit = () => {
    if (isBetLocked1 && isBetLocked2) return;
    audioService?.playClick?.();
    setIsEditing(prev => !prev);
  };

  const handlePresetChange = (panelNum, index, newVal) => {
    const val = Number(newVal) || 0;
    if (panelNum === 1) {
      if (isBetLocked1) return;
      const updated = [...presets1];
      updated[index] = val;
      setPresets1(updated);
      if (selectedBet1 === presets1[index]) {
        setSelectedBet1(val);
        setPanel1(prev => ({ ...prev, amount: val }));
      }
    } else {
      if (isBetLocked2) return;
      const updated = [...presets2];
      updated[index] = val;
      setPresets2(updated);
      if (selectedBet2 === presets2[index]) {
        setSelectedBet2(val);
        setPanel2(prev => ({ ...prev, amount: val }));
      }
    }
  };

  // 2. CLEAR: Clears whatever bet is currently selected (only if not locked)
  const handleClear = () => {
    audioService?.playClick?.();
    if (!isBetLocked1) {
      setSelectedBet1(null);
      setPanel1(prev => ({ ...prev, amount: 0 }));
    }
    if (!isBetLocked2) {
      setSelectedBet2(null);
      setPanel2(prev => ({ ...prev, amount: 0 }));
    }
  };

  // 3. MIN: Sets to minimum bet (10) (only if not locked)
  const handleMin = () => {
    audioService?.playClick?.();
    const minVal1 = presets1[0] || 10;
    const minVal2 = presets2[0] || 10;
    if (!isBetLocked1) {
      setSelectedBet1(minVal1);
      setPanel1(prev => ({ ...prev, amount: minVal1 }));
    }
    if (!isBetLocked2) {
      setSelectedBet2(minVal2);
      setPanel2(prev => ({ ...prev, amount: minVal2 }));
    }
  };

  // 4. MAX: Sets to maximum bet (10000) (only if not locked)
  const handleMax = () => {
    audioService?.playClick?.();
    const maxVal1 = presets1[presets1.length - 1] || 10000;
    const maxVal2 = presets2[presets2.length - 1] || 10000;
    if (!isBetLocked1) {
      setSelectedBet1(maxVal1);
      setPanel1(prev => ({ ...prev, amount: maxVal1 }));
    }
    if (!isBetLocked2) {
      setSelectedBet2(maxVal2);
      setPanel2(prev => ({ ...prev, amount: maxVal2 }));
    }
  };

  // Selection toggle - allows switching amount freely (running round active bet remains unaffected)
  const handleSelectBet = (panelNum, val) => {
    if (isEditing) return;

    audioService?.playClick?.();
    setStakeError(null);
    if (panelNum === 1) {
      if (selectedBet1 === val) {
        setSelectedBet1(null);
        setPanel1(prev => ({ ...prev, amount: 0 }));
      } else {
        setSelectedBet1(val);
        setPanel1(prev => ({ ...prev, amount: val }));
      }
    } else {
      if (selectedBet2 === val) {
        setSelectedBet2(null);
        setPanel2(prev => ({ ...prev, amount: 0 }));
      } else {
        setSelectedBet2(val);
        setPanel2(prev => ({ ...prev, amount: val }));
      }
    }
  };

  // Auto switch toggle
  const handleToggleAuto = (panelNum) => {
    audioService?.playClick?.();
    if (panelNum === 1) {
      setPanel1(prev => ({ ...prev, isAuto: !prev.isAuto }));
    } else {
      setPanel2(prev => ({ ...prev, isAuto: !prev.isAuto }));
    }
  };

  // Cash In / Cash Out / Cancel action
  const handleCashInClick = (panelNum) => {
    const panel = panelNum === 1 ? panel1 : panel2;
    const isWaiting = gameState === 'WAITING';
    const isFlying = gameState === 'FLYING';

    // 1. If currently flying with active bet in this round -> Cash Out!
    if (panel.hasBet && isFlying && !panel.cashedOut && !panel.isNextRoundBet) {
      cashOut(panelNum);
      return;
    }

    audioService?.playClick?.();

    // 2. If bet is queued for NEXT round (mid-flight click) -> Cancel queued bet
    if (panel.isNextRoundBet) {
      cancelBet(panelNum);
      return;
    }

    // 3. If bet was placed during waiting phase -> Cancel bet
    if (panel.hasBet && isWaiting) {
      cancelBet(panelNum);
      return;
    }

    // 4. Require stake to be selected first
    const selectedStake = panelNum === 1 ? selectedBet1 : selectedBet2;
    if (!selectedStake || !panel.amount || panel.amount <= 0) {
      setStakeError("Please select the stake First.");
      return;
    }

    if (isDemoUser) {
      setStakeError("You have insufficient balance.");
      return;
    }

    // 5. Place or Queue Bet:
    // If waiting -> places bet immediately for current round
    // If mid-round (flying/crashed) -> queues bet for next round with red Cancel button!
    placeBet(panelNum);
  };

  const getCashInBtnText = (panelNum) => {
    const panel = panelNum === 1 ? panel1 : panel2;
    const isWaiting = gameState === 'WAITING';
    const isFlying = gameState === 'FLYING';

    // Queued bet for next round (mid-flight): always shows "Cancel"
    if (panel.isNextRoundBet) {
      return 'Cancel';
    }

    if (panel.hasBet) {
      if (isWaiting) return 'Cancel';
      if (isFlying) {
        if (panel.cashedOut) return 'Cash In';
        // Active placed bet amount is used so changing selection during round doesn't alter running bet
        const activeBetAmt = panel.placedBetAmount || panel.amount;
        return (activeBetAmt * multiplier).toFixed(2);
      }
      if (panel.cashedOut) return 'Cash In';
      return 'Cancel';
    }
    return 'Cash In';
  };

  const getCashInBtnStyle = (panelNum) => {
    const panel = panelNum === 1 ? panel1 : panel2;
    const isWaiting = gameState === 'WAITING';
    const isFlying = gameState === 'FLYING';

    // Queued bet for next round: exact red Cancel button matching user screenshot
    if (panel.isNextRoundBet) {
      return 'bg-[#e50539] hover:bg-[#ff1f50] border border-[#ff7171] text-white !font-[\'Inter\',sans-serif] font-[500] text-[18px]';
    }

    if (panel.hasBet) {
      if (isWaiting) return 'bg-[#e50539] hover:bg-[#ff1f50] border border-[#ff7171] text-white !font-[\'Inter\',sans-serif] font-[500] text-[18px]';
      if (isFlying) {
        if (panel.cashedOut) return 'bg-[#28a909] hover:bg-[#2fc20b] text-white !font-[\'Inter\',sans-serif] font-[500] text-[18px]';
        // Exact Image 1: Rich orange background with white amount text
        return 'bg-[#d07206] hover:bg-[#e67e07] border border-[#ffbd71] text-white !font-[\'Inter\',sans-serif] font-[500] text-[20px] shadow-md';
      }
      if (panel.cashedOut) return 'bg-[#28a909] hover:bg-[#2fc20b] text-white !font-[\'Inter\',sans-serif] font-[500] text-[18px]';
      return 'bg-[#e50539] hover:bg-[#ff1f50] border border-[#ff7171] text-white !font-[\'Inter\',sans-serif] font-[500] text-[18px]';
    }
    // Solid green with NO border (Exact Screenshot 1)
    return 'bg-[#28a909] hover:bg-[#2fc20b] text-white !font-[\'Inter\',sans-serif] font-[500] text-[18px]';
  };

  return (
    <div className="w-full mt-2.5">
      {/* Container matching user double-bet-mob grid */}
      <div className="w-full min-w-[310px] grid grid-cols-5 h-fit rounded-[20px] bg-[#1b1c1d] py-2 px-1.5 md:px-3 font-['Inter',sans-serif] border border-[#2a2b2e]">

        {/* LEFT PANEL: controls-mob col-span-2 */}
        <div className="flex flex-col relative w-full justify-center items-start rounded-[10px] h-full mx-auto border border-transparent col-span-2">
          {/* Auto Toggle Row */}
          <div className="w-full">
            <div className="flex justify-center items-center gap-6 w-full">
              <div className="flex items-center gap-[8px]">
                <div className="mb-[1px] text-[14px] text-[#ffffff] leading-[16.94px] font-[700]">Auto </div>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer translate-y-[3px]">
                  <input
                    type="checkbox"
                    checked={panel1.isAuto}
                    onChange={() => handleToggleAuto(1)}
                    className="sr-only peer"
                  />
                  <div className="w-[44px] h-[19px] bg-[#1b1c1d] rounded-full border border-white border-opacity-50 peer-checked:border-[#008826] peer-checked:after:translate-x-[23px] rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[3px] after:bg-[#FFFFFF] after:border-[#FFFFFF] after:border-[2px] after:rounded-full after:h-[15px] after:w-[15px] after:transition-all peer-checked:bg-[#008826]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Bet Options Grid + Cash In */}
          <div className="w-full flex justify-center mx-auto mb-auto mt-2">
            <div className="flex flex-col justify-center items-center text-center w-full">
              <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">
                {presets1.map((val, idx) => {
                  const isSelected = selectedBet1 === val;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectBet(1, val)}
                      className={`h-[24px] col-span-1 rounded-[100px] bg-[#141516] flex items-center justify-center transition-all select-none ${isEditing
                          ? 'border border-[#44464b]'
                          : isSelected
                            ? 'border border-[#ff0000] text-white font-[700] text-[14px] cursor-pointer'
                            : 'border border-[#d9d9d9] text-[#ffffff80] font-[300] text-[14px] hover:text-white cursor-pointer'
                        }`}
                    >
                      {isEditing ? (
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => handlePresetChange(1, idx, e.target.value)}
                          className="w-full h-full bg-transparent text-center text-[#737579] outline-none font-[400] text-[13px] px-1"
                        />
                      ) : (
                        <span>{val}</span>
                      )}
                    </div>
                  );
                })}

                {/* Cash In Button (Spanning full width under the pills) */}
                <button
                  type="button"
                  onClick={() => handleCashInClick(1)}
                  className={`col-span-2 w-full h-[50px] text-white text-center rounded-[10px] !font-['Inter',sans-serif] font-[500] text-[18px] mt-1.5 transition-all active:scale-95 flex items-center justify-center ${getCashInBtnStyle(1)}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif" }}>{getCashInBtnText(1)}</span>
                </button>

                {/* Auto Cashout Controls (Visible only when top Auto is ON - Exact Image 2 & 3) */}
                {panel1.isAuto && (
                  <div className="col-span-2 flex items-center justify-center gap-3.5 mt-2">
                    {/* Bottom Toggle Switch (Default OFF) */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={panel1.isAutoCashout || false}
                        onChange={() => {
                          audioService?.playClick?.();
                          setPanel1(prev => ({ ...prev, isAutoCashout: !prev.isAutoCashout }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-[42px] h-[20px] bg-[#141516] rounded-full border border-white/50 peer-checked:border-[#008826] peer-checked:after:translate-x-[22px] rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:start-[3px] after:bg-[#FFFFFF] after:border-[#FFFFFF] after:border-[2px] after:rounded-full after:h-[15px] after:w-[15px] after:transition-all peer-checked:bg-[#008826]"></div>
                    </label>

                    {/* Capsule Badge (1.10 ✕) */}
                    <div className="bg-[#000000] border border-white/10 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-inner">
                      <input
                        type="text"
                        value={panel1.autoCashout ?? '1.10'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPanel1(prev => ({ ...prev, autoCashout: val }));
                        }}
                        className="w-10 bg-transparent text-white font-bold text-[14px] text-center outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          audioService?.playClick?.();
                          setPanel1(prev => ({ ...prev, autoCashout: '1.10' }));
                        }}
                        className="text-[#878787] hover:text-white transition-colors cursor-pointer font-bold text-[13px] leading-none px-0.5"
                        title="Reset to 1.10"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Edit, Clear, Min, Max (col-span-1) */}
        <div className="flex flex-col justify-center items-center gap-2.5 col-span-1 mt-8 px-1">
          {/* Edit Button (Orange Gradient) - Shows "Save" when editing, "Edit" when saved */}
          <button
            type="button"
            onClick={handleToggleEdit}
            disabled={isBetLocked1 && isBetLocked2}
            className={`bg-gradient-to-t from-[#cf7204] to-[#f48808] text-white text-[14px] font-[700] leading-[16.94px] border border-white w-[56px] xm:w-[64px] h-[28px] rounded-[10px] flex items-center justify-center transition-all ${isBetLocked1 && isBetLocked2 ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110 active:scale-95 cursor-pointer'
              }`}
            title="Edit / Save Preset Amounts"
          >
            <span>{isEditing ? 'Save' : 'Edit'}</span>
          </button>

          {/* Clear Button (Red Gradient) */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isBetLocked1 && isBetLocked2}
            className={`bg-gradient-to-b from-[#ff0000] to-[#a10000] text-white text-[14px] font-[700] leading-[16.94px] border border-white w-[56px] xm:w-[64px] h-[28px] rounded-[10px] flex items-center justify-center transition-all ${isBetLocked1 && isBetLocked2 ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110 active:scale-95 cursor-pointer'
              }`}
            title="Clear Selected Bet"
          >
            Clear
          </button>

          {/* Min Button */}
          <button
            type="button"
            onClick={handleMin}
            disabled={isBetLocked1 && isBetLocked2}
            className={`w-[56px] xm:w-[64px] h-[28px] text-[14px] font-[700] border border-[#d9d9d9] rounded-[10px] bg-[#141516] flex items-center justify-center transition-all ${isBetLocked1 && isBetLocked2 ? 'text-[#555] opacity-40 cursor-not-allowed' : 'text-[#878787] hover:text-white active:scale-95 cursor-pointer'
              }`}
            title="Set to Minimum Bet (10)"
          >
            Min
          </button>

          {/* Max Button */}
          <button
            type="button"
            onClick={handleMax}
            disabled={isBetLocked1 && isBetLocked2}
            className={`w-[56px] xm:w-[64px] md:w-[75px] h-[31px] text-[14px] font-[700] border border-[#d9d9d9] rounded-[10px] bg-[#141516] flex items-center justify-center transition-all ${isBetLocked1 && isBetLocked2 ? 'text-[#555] opacity-40 cursor-not-allowed' : 'text-[#878787] hover:text-white active:scale-95 cursor-pointer'
              }`}
            title="Set to Maximum Bet (10000)"
          >
            Max
          </button>
        </div>

        {/* RIGHT PANEL: controls col-span-2 */}
        <div className="flex flex-col relative w-full justify-center items-center rounded-[10px] h-full mx-auto border border-transparent col-span-2">
          {/* Auto Toggle Row - Both Panel 1 & 2 use matching green #008826 when active */}
          <div className="w-full">
            <div className="flex justify-center items-center gap-6 w-full">
              <div className="flex items-center gap-[8px]">
                <div className="mb-[1px] text-[14px] text-[#ffffff] leading-[16.94px] font-[700]">Auto </div>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer translate-y-[3px]">
                  <input
                    type="checkbox"
                    checked={panel2.isAuto}
                    onChange={() => handleToggleAuto(2)}
                    className="sr-only peer"
                  />
                  <div className="w-[44px] h-[19px] bg-[#1b1c1d] rounded-full border border-white border-opacity-50 peer-checked:border-[#008826] peer-checked:after:translate-x-[23px] rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[3px] after:bg-[#FFFFFF] after:border-[#FFFFFF] after:border-[2px] after:rounded-full after:h-[15px] after:w-[15px] after:transition-all peer-checked:bg-[#008826]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Bet Options Grid + Cash In */}
          <div className="w-full flex justify-center mx-auto mb-auto mt-2">
            <div className="flex flex-col justify-center items-center text-center w-full">
              <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">
                {presets2.map((val, idx) => {
                  const isSelected = selectedBet2 === val;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectBet(2, val)}
                      className={`h-[24px] col-span-1 rounded-[100px] bg-[#141516] flex items-center justify-center transition-all select-none ${isEditing
                          ? 'border border-[#44464b]'
                          : isSelected
                            ? 'border border-[#ff0000] text-white font-[700] text-[14px] cursor-pointer'
                            : 'border border-[#d9d9d9] text-[#ffffff80] font-[300] text-[14px] hover:text-white cursor-pointer'
                        }`}
                    >
                      {isEditing ? (
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => handlePresetChange(2, idx, e.target.value)}
                          className="w-full h-full bg-transparent text-center text-[#737579] outline-none font-[400] text-[13px] px-1"
                        />
                      ) : (
                        <span>{val}</span>
                      )}
                    </div>
                  );
                })}

                {/* Cash In Button (Spanning full width under the pills) */}
                <button
                  type="button"
                  onClick={() => handleCashInClick(2)}
                  className={`col-span-2 w-full h-[50px] text-white text-center rounded-[10px] !font-['Inter',sans-serif] font-[500] text-[18px] mt-1.5 transition-all active:scale-95 flex items-center justify-center ${getCashInBtnStyle(2)}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif" }}>{getCashInBtnText(2)}</span>
                </button>

                {/* Auto Cashout Controls (Visible only when top Auto is ON - Exact Image 2 & 3) */}
                {panel2.isAuto && (
                  <div className="col-span-2 flex items-center justify-center gap-3.5 mt-2">
                    {/* Bottom Toggle Switch (Default OFF) */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={panel2.isAutoCashout || false}
                        onChange={() => {
                          audioService?.playClick?.();
                          setPanel2(prev => ({ ...prev, isAutoCashout: !prev.isAutoCashout }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-[42px] h-[20px] bg-[#141516] rounded-full border border-white/50 peer-checked:border-[#008826] peer-checked:after:translate-x-[22px] rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:start-[3px] after:bg-[#FFFFFF] after:border-[#FFFFFF] after:border-[2px] after:rounded-full after:h-[15px] after:w-[15px] after:transition-all peer-checked:bg-[#008826]"></div>
                    </label>

                    {/* Capsule Badge (1.10 ✕) */}
                    <div className="bg-[#000000] border border-white/10 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-inner">
                      <input
                        type="text"
                        value={panel2.autoCashout ?? '1.10'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPanel2(prev => ({ ...prev, autoCashout: val }));
                        }}
                        className="w-10 bg-transparent text-white font-bold text-[14px] text-center outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          audioService?.playClick?.();
                          setPanel2(prev => ({ ...prev, autoCashout: '1.10' }));
                        }}
                        className="text-[#878787] hover:text-white transition-colors cursor-pointer font-bold text-[13px] leading-none px-0.5"
                        title="Reset to 1.10"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
