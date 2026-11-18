import React from 'react'

export default function ControlsPanel({
  auto1,
  setAuto1,
  auto2,
  setAuto2,
  auto1Mult,
  auto2Mult,
  editingAuto,
  tempAutoInput,
  setTempAutoInput,
  handleStartEditAuto,
  handleSaveAutoMult,
  setEditingAuto,
  presetChips,
  setPresetChips,
  isEditingPresets,
  handleToggleEdits,
  selectedBet,
  handleSelectBet,
  handleClear,
  handleMin,
  handleMax,
  gameState,
  bet1,
  bet2,
  nextBet1,
  nextBet2,
  multiplier,
  bet1PayoutDisplayRef,
  bet2PayoutDisplayRef,
  handleCancelBet,
  handleCashout,
  handleHeat,
}) {
  const minVal = presetChips[0] || 10
  const maxVal = presetChips[presetChips.length - 1] || 10000
  const isMinSelected = selectedBet === minVal
  const isMaxSelected = selectedBet === maxVal

  return (
    <div className="floating-controls-section absolute bottom-[28px] left-0 right-0 z-20 w-full p-0 m-0 flex flex-col items-center box-border pointer-events-auto">
      <div className="betting-panel-card w-full box-border">
        <div className="controls-grid grid grid-cols-[minmax(0,1.3fr)_minmax(78px,0.72fr)_minmax(0,1.54fr)] gap-2 w-full">
          {/* Column 1: Presets & Auto 1 */}
          <div className="panel-column min-w-0 flex flex-col gap-1">
            <div className="auto-toggle-row flex items-center gap-[3px] h-[22px]">
              <span className="auto-label text-[13px] font-bold text-white tracking-tight shrink-0">
                Auto
              </span>
              <div
                className={`toggle-switch w-[34px] h-[18px] rounded-full p-[2px] relative cursor-pointer flex-shrink-0 transition-colors duration-200 border ${
                  auto1
                    ? 'active bg-[#02cf58] border-[#02cf58]'
                    : 'bg-white/30 border-white/70'
                }`}
                id="auto-1-toggle"
                onClick={() => setAuto1(!auto1)}
              >
                <div
                  className={`toggle-knob w-[12px] h-[12px] bg-white rounded-full absolute top-[1.5px] left-[2px] transition-transform duration-200 shadow-sm ${
                    auto1 ? 'translate-x-[16px]' : ''
                  }`}
                />
              </div>
              {auto1 &&
                (editingAuto === 1 ? (
                  <div
                    className="auto-multiplier-pill editing bg-darkPill h-[20px] rounded-full border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)] inline-flex items-center px-1 flex-shrink-0 animate-popInPill"
                    id="auto-1-pill"
                  >
                    <input
                      type="number"
                      step="0.05"
                      min="1.01"
                      max="1000"
                      autoFocus
                      className="auto-multiplier-input w-[28px] bg-transparent border-0 outline-none text-white text-[11px] font-extrabold text-center p-0 m-0"
                      value={tempAutoInput}
                      onChange={(e) => setTempAutoInput(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveAutoMult(1)
                        if (e.key === 'Escape') setEditingAuto(null)
                      }}
                      onBlur={() => handleSaveAutoMult(1)}
                    />
                    <span className="auto-mult-suffix text-white text-[10.5px] font-extrabold ml-px">
                      x
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="auto-multiplier-btn bg-darkPill hover:bg-darkPillHover text-white text-[11px] font-extrabold tracking-[0.2px] px-1.5 h-[20px] rounded-full border border-white/15 inline-flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0 select-none whitespace-nowrap animate-popInPill"
                    id="auto-1-mult-btn"
                    onClick={() => handleStartEditAuto(1)}
                    title="Click to enter multiplier"
                  >
                    {auto1Mult.toFixed(2)} x
                  </button>
                ))}
            </div>

            <div className="presets-grid grid grid-cols-2 gap-1 min-w-0 w-full">
              {presetChips.map((chipVal, idx) =>
                isEditingPresets ? (
                  <input
                    key={idx}
                    type="number"
                    className="btn-preset editing min-w-0 w-full h-[24px] border-2 border-white rounded-full text-white text-[14px] font-bold flex items-center justify-center text-center shadow-[0_2px_4px_rgba(0,0,0,0.35)] bg-[#fc4b52] outline-none px-2 box-border"
                    value={chipVal}
                    onChange={(e) => {
                      const val = e.target.value
                      const updated = [...presetChips]
                      updated[idx] =
                        val === '' ? '' : parseInt(val, 10) || 0
                      setPresetChips(updated)
                    }}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleToggleEdits()
                    }}
                  />
                ) : (
                  <button
                    key={idx}
                    type="button"
                    className={`btn-preset min-w-0 w-full h-[24px] border-2 rounded-full text-white ${
                      chipVal >= 10000 ? 'text-[12px]' : 'text-[14px]'
                    } font-bold flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.35)] active:scale-95 transition-all ${
                      selectedBet === chipVal
                        ? 'selected border-[#e60000] bg-[#123e85]'
                        : 'border-white bg-[#0c2b5d] hover:bg-[#0f3675]'
                    }`}
                    id={`chip-${chipVal}`}
                    onClick={() => handleSelectBet(chipVal)}
                  >
                    {chipVal}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Column 2: Modifiers & Auto 2 */}
          <div className="panel-column min-w-0 flex flex-col gap-1">
            <div className="auto-toggle-row relative flex items-center gap-[3px] h-[22px]">
              <span className="auto-label text-[13px] font-bold text-white tracking-tight shrink-0">
                Auto
              </span>
              <div
                className={`toggle-switch w-[34px] h-[18px] rounded-full p-[2px] relative cursor-pointer flex-shrink-0 transition-colors duration-200 border ${
                  auto2
                    ? 'active bg-[#02cf58] border-[#02cf58]'
                    : 'bg-white/30 border-white/70'
                }`}
                id="auto-2-toggle"
                onClick={() => setAuto2(!auto2)}
              >
                <div
                  className={`toggle-knob w-[12px] h-[12px] bg-white rounded-full absolute top-[1.5px] left-[2px] transition-transform duration-200 shadow-sm ${
                    auto2 ? 'translate-x-[16px]' : ''
                  }`}
                />
              </div>
              {auto2 &&
                (editingAuto === 2 ? (
                  <div
                    className="auto-multiplier-pill editing absolute left-[calc(100%+4px)] top-[1px] z-10 bg-darkPill h-[20px] rounded-full border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)] inline-flex items-center px-1 flex-shrink-0 animate-popInPill"
                    id="auto-2-pill"
                  >
                    <input
                      type="number"
                      step="0.05"
                      min="1.01"
                      max="1000"
                      autoFocus
                      className="auto-multiplier-input w-[28px] bg-transparent border-0 outline-none text-white text-[11px] font-extrabold text-center p-0 m-0"
                      value={tempAutoInput}
                      onChange={(e) => setTempAutoInput(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveAutoMult(2)
                        if (e.key === 'Escape') setEditingAuto(null)
                      }}
                      onBlur={() => handleSaveAutoMult(2)}
                    />
                    <span className="auto-mult-suffix text-white text-[10.5px] font-extrabold ml-px">
                      x
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="auto-multiplier-btn absolute left-[calc(100%+4px)] top-[1px] z-10 bg-darkPill hover:bg-darkPillHover text-white text-[11px] font-extrabold tracking-[0.2px] px-1.5 h-[20px] rounded-full border border-white/15 inline-flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0 select-none whitespace-nowrap animate-popInPill"
                    id="auto-2-mult-btn"
                    onClick={() => handleStartEditAuto(2)}
                    title="Click to enter multiplier"
                  >
                    {auto2Mult.toFixed(2)} x
                  </button>
                ))}
            </div>

            <div className="modifiers-stack flex flex-col gap-1">
              <button
                type="button"
                className="btn-modifier edits h-[24px] rounded-[8px] text-[16px] font-bold flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.35)] border-2 border-white active:scale-95 transition-all bg-[#e67800] hover:bg-[#ff8800] text-white"
                id="edits-btn"
                onClick={handleToggleEdits}
              >
                {isEditingPresets ? 'Save' : 'Edits'}
              </button>
              <button
                type="button"
                className="btn-modifier clear h-[24px] rounded-[8px] text-[16px] font-bold flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.35)] border-2 border-white active:scale-95 transition-all bg-[#cc0c0c] hover:bg-[#e61212] text-white"
                id="clear-btn"
                onClick={handleClear}
              >
                Clear
              </button>
              <button
                type="button"
                className={`btn-modifier min h-[24px] rounded-[8px] text-[16px] font-bold flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.35)] border-2 active:scale-95 transition-all bg-[#200c2c] hover:text-white ${
                  isMinSelected
                    ? 'selected border-[#e60000] text-white'
                    : 'border-white text-[#5d466f]'
                }`}
                id="min-btn"
                onClick={handleMin}
              >
                Min
              </button>
              <button
                type="button"
                className={`btn-modifier max h-[24px] rounded-[8px] text-[16px] font-bold flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.35)] border-2 active:scale-95 transition-all bg-[#200c2c] hover:text-white ${
                  isMaxSelected
                    ? 'selected border-[#e60000] text-white'
                    : 'border-white text-[#5d466f]'
                }`}
                id="max-btn"
                onClick={handleMax}
              >
                Max
              </button>
            </div>
          </div>

          {/* Column 3: Action Buttons (Bet 1 & Bet 2: Cancel / Take / HEAT) */}
          <div className="heat-column min-w-0 flex flex-col gap-1 pt-[26px]">
            {/* Button 1: Slot 1 (Cancel / Take / HEAT) */}
            {(gameState === 'WAITING' && bet1) || nextBet1 ? (
              <button
                type="button"
                className="btn-cancel w-full h-[52px] rounded-[12px] border-[2px] border-black flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(0,0,0,0.45),0_3px_6px_rgba(0,0,0,0.45)] relative overflow-hidden active:scale-[0.97] transition-all bg-[radial-gradient(circle_at_50%_30%,#ff1f1f_0%,#db0000_50%,#940000_100%)] hover:brightness-110"
                id="cancel-btn-1"
                onClick={() => handleCancelBet(1)}
              >
                <span className="cancel-text font-black text-[26px] text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  Cancel
                </span>
              </button>
            ) : gameState === 'FLYING' && bet1 && bet1.win === null ? (
              <button
                type="button"
                className="btn-take w-full h-[52px]"
                id="cashout-btn-1"
                onClick={() => handleCashout(1)}
              >
                <span className="take-title">Take</span>
                <span className="take-amount" ref={bet1PayoutDisplayRef}>
                  {(parseFloat(bet1.amount) * multiplier).toFixed(2)}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-heat h-[52px] rounded-[12px] border-[2px] border-black flex items-center justify-center gap-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.45)] relative overflow-hidden active:scale-[0.97] transition-all bg-gradient-to-b from-[#02cf58] to-[#009624] hover:from-[#05e360] hover:to-[#00a82b]"
                id="heat-btn-1"
                onClick={() => handleHeat(1)}
              >
                <img
                  src="/images/heat-icon.webp"
                  alt="Heat Flame"
                  className="heat-icon-img h-[46px] w-auto max-w-[44px] object-contain self-end mb-[-1px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                />
                <span className="heat-text font-black text-[23.5px] text-white tracking-[-0.5px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  HEAT
                </span>
              </button>
            )}

            {/* Button 2: Slot 2 (Cancel / Take / HEAT) */}
            {(gameState === 'WAITING' && bet2) || nextBet2 ? (
              <button
                type="button"
                className="btn-cancel w-full h-[52px] rounded-[12px] border-[2px] border-black flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(0,0,0,0.45),0_3px_6px_rgba(0,0,0,0.45)] relative overflow-hidden active:scale-[0.97] transition-all bg-[radial-gradient(circle_at_50%_30%,#ff1f1f_0%,#db0000_50%,#940000_100%)] hover:brightness-110"
                id="cancel-btn-2"
                onClick={() => handleCancelBet(2)}
              >
                <span className="cancel-text font-black text-[26px] text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  Cancel
                </span>
              </button>
            ) : gameState === 'FLYING' && bet2 && bet2.win === null ? (
              <button
                type="button"
                className="btn-take w-full h-[52px]"
                id="cashout-btn-2"
                onClick={() => handleCashout(2)}
              >
                <span className="take-title">Take</span>
                <span className="take-amount" ref={bet2PayoutDisplayRef}>
                  {(parseFloat(bet2.amount) * multiplier).toFixed(2)}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-heat h-[52px] rounded-[12px] border-[2px] border-black flex items-center justify-center gap-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.45)] relative overflow-hidden active:scale-[0.97] transition-all bg-gradient-to-b from-[#02cf58] to-[#009624] hover:from-[#05e360] hover:to-[#00a82b]"
                id="heat-btn-2"
                onClick={() => handleHeat(2)}
              >
                <img
                  src="/images/heat-icon.webp"
                  alt="Heat Flame"
                  className="heat-icon-img h-[46px] w-auto max-w-[44px] object-contain self-end mb-[-1px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                />
                <span className="heat-text font-black text-[23.5px] text-white tracking-[-0.5px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  HEAT
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

