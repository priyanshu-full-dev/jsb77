import React from 'react'

export default function RulesModal({ showRules, onClose }) {
  if (!showRules) return null

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="modal-content bg-[#0f2226] border border-[#1a3c42] rounded-2xl p-5 max-w-sm w-full text-white shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex items-center justify-between pb-3 border-b border-[#1a3c42] mb-3">
          <h2 className="modal-title text-lg font-black text-white">
            Hot Air Balloon Rules
          </h2>
          <button
            type="button"
            className="modal-close-btn w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="modal-body text-sm leading-relaxed text-gray-200 space-y-2">
          <p>Welcome to the Hot Air Balloon Crash Game!</p>
          <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-300">
            <li>
              <strong className="text-white">Round Interval</strong>: Every
              round features an 8-second countdown before launch.
            </li>
            <li>
              <strong className="text-white">Three Unique Locations</strong>: Each
              round takes you across stunning destinations (Mountain Alps,
              Egyptian Pyramids, Golden Savanna)!
            </li>
            <li>
              <strong className="text-white">Realistic Flight</strong>: The
              landscape scrolls downwards as the balloon climbs higher into the
              sky!
            </li>
            <li>
              <strong className="text-white">Fly-Away Moment</strong>: At round
              end, the balloon zooms out of the top of the screen leaving the
              final multiplier in place!
            </li>
          </ul>
          <button
            type="button"
            className="btn-modifier edits w-full h-[38px] mt-4 rounded-full text-xs font-black uppercase tracking-wider bg-[#e65600] hover:bg-[#ff6200] text-white shadow-md active:scale-95 transition-all"
            onClick={onClose}
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  )
}

