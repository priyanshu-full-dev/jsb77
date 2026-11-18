import React from 'react'

export default function MultiplierHistory({
  historyMultipliers,
  showHistory,
  onToggleHistory,
}) {
  const visibleMultipliers = historyMultipliers.slice(0, 6)

  return (
    <nav
      className="multipliers-bar relative z-20 flex items-center gap-1.5 px-2.5 pt-2 pb-1 bg-transparent border-0"
      aria-label="Multiplier History"
    >
      {visibleMultipliers.map((item, idx) => {
        const rawVal = typeof item === 'object' && item.val ? item.val : item
        const numVal = parseFloat(rawVal)
        const isBlue = !isNaN(numVal) ? numVal < 2.0 : item.type === 'blue'
        return (
          <div key={idx} className={`multiplier-pill ${isBlue ? 'blue' : 'amber'}`}>
            {typeof rawVal === 'string' && rawVal.includes('x')
              ? rawVal
              : `${numVal.toFixed(2)}x`}
          </div>
        )
      })}
      <button
        type="button"
        className="multiplier-dropdown-btn w-[27px] h-[27px] rounded-full bg-gradient-to-br from-[#fca338] to-[#f78c00] flex items-center justify-center flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.25)] text-black cursor-pointer active:scale-90 transition-transform"
        id="history-dropdown-btn"
        aria-label="Toggle history dropdown"
        onClick={onToggleHistory}
      >
        <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] fill-black">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </button>
    </nav>
  )
}

