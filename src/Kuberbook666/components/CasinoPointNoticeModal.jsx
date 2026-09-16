import React from "react";
import PropTypes from "prop-types";

export default function CasinoPointNoticeModal({
  isOpen,
  onClose,
  onAgree,
  loading = false,
  chipValue = "1 Point = ₹10",
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[330px] sm:max-w-[360px] bg-white rounded-[22px] shadow-2xl p-6 pt-5 pb-6 text-center animate-in zoom-in-95 duration-200 border-t-[5px] border-[#f59e0b]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-[#1b222d] text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer shadow-sm"
        >
          <svg
            className="w-3.5 h-3.5 fill-current"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Title */}
        <h3 className="text-[#111827] text-lg sm:text-xl font-extrabold tracking-wide uppercase mt-1 mb-4">
          PLEASE NOTE
        </h3>

        {/* 1 Point = ₹10 Badge */}
        <div className="inline-flex items-center justify-center px-7 py-2 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] shadow-md shadow-orange-500/25 mb-4">
          <span className="text-white font-extrabold text-base tracking-wide">
            {chipValue}
          </span>
        </div>

        {/* Subtext */}
        <p className="text-[#1f2937] font-semibold text-sm sm:text-[15px] mb-6">
          Welcome to your new casino lobby
        </p>

        {/* OK, I AGREE! Button */}
        <button
          onClick={onAgree}
          disabled={loading}
          type="button"
          className="w-full py-3.5 px-4 rounded-xl bg-[#141b25] hover:bg-[#0f141c] active:scale-[0.98] text-white font-black text-sm sm:text-base tracking-wider transition-all duration-150 shadow-lg cursor-pointer flex items-center justify-center disabled:opacity-75"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Launching...
            </span>
          ) : (
            "OK, I AGREE!"
          )}
        </button>
      </div>
    </div>
  );
}

CasinoPointNoticeModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onAgree: PropTypes.func,
  loading: PropTypes.bool,
  chipValue: PropTypes.string,
};
