import React from 'react';
import { X } from 'lucide-react';

export default function BetSlipDrawer({
  selectedBet,
  betStake,
  setBetStake,
  onClose,
  onPlaceBet,
}) {
  if (!selectedBet) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-2">
      <div className="w-full max-w-[480px] bg-[#1e293b] text-white rounded-t-xl shadow-2xl p-4 border-t-2 border-amber-500 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-400">
            BET SLIP • {selectedBet.type}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="text-sm font-bold truncate mb-2">{selectedBet.match}</div>

        <div className="flex items-center justify-between bg-black/40 p-2 rounded mb-3">
          <span className="text-xs text-gray-300">Odds:</span>
          <span className="text-base font-black text-amber-300">{selectedBet.odd}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs text-gray-300">Stake (₹):</label>
          <input
            type="number"
            value={betStake}
            onChange={(e) => setBetStake(e.target.value)}
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-right text-sm font-bold text-amber-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-1 mb-3">
          {['100', '500', '1000', '5000'].map((val) => (
            <button
              key={val}
              onClick={() => setBetStake(val)}
              className="bg-neutral-800 hover:bg-neutral-700 text-xs py-1 rounded font-bold cursor-pointer"
            >
              +{val}
            </button>
          ))}
        </div>

        <button
          onClick={onPlaceBet}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black py-2.5 rounded text-sm uppercase tracking-wider cursor-pointer hover:brightness-110 shadow-md"
        >
          Place Bet (₹{betStake})
        </button>
      </div>
    </div>
  );
}
