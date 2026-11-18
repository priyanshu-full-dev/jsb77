import React from 'react'

export default function CashoutToast({ cashoutToast, onClose }) {
  if (!cashoutToast) return null

  return (
    <div
      className={`cashout-toast-container ${cashoutToast.type === 'loss' ? 'loss-toast' : ''}`}
      id="cashout-toast"
    >
      <div className="cashout-toast-left">
        <span className="cashout-toast-label">
          {cashoutToast.type === 'loss' ? (
            <>
              You have
              <br />
              lost!
            </>
          ) : (
            <>
              You have cashed
              <br />
              out!
            </>
          )}
        </span>
        <span className="cashout-toast-mult">{cashoutToast.mult}x</span>
      </div>

      <div
        className={`cashout-toast-right-pill ${cashoutToast.type === 'loss' ? 'loss-pill' : ''}`}
      >
        <svg
          className="cashout-toast-star left"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span className="cashout-toast-win-text">
          {cashoutToast.type === 'loss' ? 'Lost INR' : 'Win INR'}
        </span>
        <span className="cashout-toast-payout-text">
          {cashoutToast.type === 'loss' ? `-${cashoutToast.amount}` : cashoutToast.payout}
        </span>
        <svg
          className="cashout-toast-star right"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>

      <button
        type="button"
        className="cashout-toast-close"
        id="toast-close-btn"
        onClick={onClose}
        aria-label="Close"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

