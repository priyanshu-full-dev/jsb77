import React from 'react'

export default function BetsSidebar({
  showBetsList,
  onToggleBetsList,
  liveBets,
  gameState,
  isMuted,
  onToggleMute,
}) {
  return (
    <div className="scene-overlay-controls absolute top-[44px] left-[2px] z-30 flex flex-col gap-1.5 items-start pointer-events-auto">
      {/* Sound Mute/Unmute Toggle Button */}
      <button
        type="button"
        className="sound-toggle-btn shrink-0 active:scale-95 transition-transform"
        id="sound-btn"
        aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
        onClick={onToggleMute}
      >
        {isMuted ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-white"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-white"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>

      {/* Players List Pill Toggle */}
      <div
        className="user-status-pill shrink-0 cursor-pointer select-none"
        id="toggle-players-list-btn"
        onClick={onToggleBetsList}
        title={showBetsList ? 'Close list' : 'Open list'}
      >
        <span className="user-avatar-icon">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <circle cx="12" cy="7.2" r="4.2" fill="rgba(35, 75, 130, 0.65)" />
            <rect x="4.5" y="14" width="15" height="7" rx="3.5" fill="#08327d" />
          </svg>
        </span>
        <button
          type="button"
          className="chevron-circle-btn"
          id="chevron-toggle-btn"
          aria-label={showBetsList ? 'Close list' : 'Open list'}
          onClick={(e) => {
            e.stopPropagation()
            onToggleBetsList()
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`chevron-icon ${showBetsList ? 'open' : 'closed'}`}
          >
            <path d="M17 14.5l-5-5-5 5" />
          </svg>
        </button>
      </div>

      {/* Live Player Bets Feed */}
      {showBetsList && (
        <div
          className={`live-bets-ticker ${gameState !== 'WAITING' ? 'match-flying' : ''}`}
          id="live-bets-list"
        >
          {liveBets.map((item, i) => (
            <div key={i} className="live-bet-item">
              <span
                className="live-bet-avatar"
                style={{ backgroundColor: item.avatarBg || '#c97863' }}
              >
                {item.avatar}
              </span>
              <span className="live-bet-user">{item.user}</span>
              <span
                className={`live-bet-amount ${item.win ? 'win-cashout' : ''}`}
              >
                {item.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

