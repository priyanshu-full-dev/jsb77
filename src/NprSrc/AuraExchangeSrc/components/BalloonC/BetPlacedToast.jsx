import React from 'react'

export default function BetPlacedToast({ toast, onClose }) {
  if (!toast) return null

  const isError = toast.type === 'error'

  return (
    <div
      className={`bet-placed-toast ${isError ? 'toast-error' : ''}`}
      id="bet-placed-toast"
      onClick={onClose}
    >
      <div className="bet-placed-icon">
        {isError ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[19px] h-[19px]"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[19px] h-[19px]"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="bet-placed-msg">
        {toast.message || 'Casino BetPlace Successful.'}
      </span>
    </div>
  )
}

