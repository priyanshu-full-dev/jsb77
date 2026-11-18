import React from 'react'

export default function Header({
  onOpenRules,
  onNextLocation,
  onToggleHistory,
  onLobbyClick,
  mainBalance,
  exposure,
}) {
  return (
    <header className="game-header">
      <div className="header-left">
        <button
          type="button"
          className="btn-rules"
          id="rules-btn"
          onClick={onOpenRules}
        >
          Rules
        </button>
        <button
          type="button"
          className="btn-lobby"
          id="lobby-btn"
          onClick={onLobbyClick}
        >
          <span>GAMING</span>
          <span>LOBBY</span>
        </button>
      </div>

      <div className="header-right">
        <div className="balance-info">
          <span className="balance-main">
            Main PTI {mainBalance !== undefined ? mainBalance : '439.24'}
          </span>
          <span className="balance-exp">
            Exp ({exposure !== undefined ? exposure : '0.00'})
          </span>
        </div>

        <button
          type="button"
          className="header-icon-btn"
          id="refresh-btn"
          title="Next round location"
          onClick={onNextLocation}
        >
          {/* Counter-Clockwise Reload / Undo Arrow */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[19px] h-[19px]"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        <button
          type="button"
          className="header-icon-btn"
          id="history-btn"
          title="History"
          onClick={onToggleHistory}
        >
          {/* Counter-Clockwise Clock History Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[19px] h-[19px]"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l3 3" />
          </svg>
        </button>
      </div>
    </header>
  )
}
