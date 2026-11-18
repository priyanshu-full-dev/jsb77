import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserData, getUserId } from '../../../../utils/helper/commonSelectors';
import { updateAvailableBalance, updateExposureBalance } from '../../../../redux/slices/userSlice';
import { fetchuserdata } from '../../../../api';
import { useGame } from '../../context/GameContext';
import { Volume2, VolumeX, HelpCircle, Wallet, RefreshCw } from 'lucide-react';

export default function Header() {
  const { balance, setBalance, isMuted, toggleSound, gameState } = useGame();
  const [showHelp, setShowHelp] = useState(false);
  const dispatch = useDispatch();
  const userId = useSelector(getUserId());
  const userData = useSelector(getUserData());

  const handleRefreshBalance = async () => {
    if (!userId) return;
    try {
      const res = await fetchuserdata(userId);
      if (res?.success) {
        dispatch(updateAvailableBalance(res?.data?.userdata?.availableBalance));
        dispatch(updateExposureBalance(res?.data?.userdata?.exposure));
        const net = Math.max(0, (res?.data?.userdata?.availableBalance ?? 0) - (res?.data?.userdata?.exposure ?? 0));
        setBalance(net);
      }
    } catch (e) {
      console.warn("Error refreshing balance:", e);
    }
  };

  return (
    <>
      <header className="h-[52px] bg-[#141516] border-b border-[#2a2b2e] px-3 md:px-6 flex items-center justify-between z-40 select-none">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Plane Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e50539] to-[#990022] flex items-center justify-center shadow-[0_0_12px_rgba(229,5,57,0.5)]">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <div>
              <span className="text-white font-black text-[18px] tracking-wider uppercase font-['Inter']">
                VIMAAN
              </span>
              <span className="text-[#e50539] font-black text-[18px] ml-1">AVIATOR</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#1b1c1d] border border-white/5 rounded-full text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                gameState === 'FLYING'
                  ? 'bg-emerald-400 animate-ping'
                  : gameState === 'WAITING'
                  ? 'bg-amber-400'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-[#9ea0a3] font-medium uppercase tracking-wider">
              {gameState === 'FLYING' ? 'FLYING' : gameState === 'WAITING' ? 'COUNTDOWN' : 'CRASHED'}
            </span>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="flex items-center gap-3">
          {/* User Balance Chip */}
          <div className="flex items-center gap-2 bg-[#1b1c1d] border border-[#2c2d30] px-3 py-1.5 rounded-full">
            <Wallet className="w-4 h-4 text-[#28a909]" />
            <span className="text-white font-extrabold text-[14px]">
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button
              type="button"
              onClick={handleRefreshBalance}
              title="Refresh Balance"
              className="text-[#7B7B7B] hover:text-white transition-colors ml-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Exposure Chip */}
          <div className="flex items-center gap-1.5 bg-[#1b1c1d] border border-[#2c2d30] px-3 py-1.5 rounded-full">
            <span className="text-[#858788] text-[12px] font-medium">Exp:</span>
            <span className="text-[#e50539] font-extrabold text-[14px]">
              ₹{(Number(userData?.exposure) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-full bg-[#1b1c1d] border border-[#2a2b2e] text-[#858788] hover:text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Rules / Help Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="p-1.5 rounded-full bg-[#1b1c1d] border border-[#2a2b2e] text-[#858788] hover:text-white transition-colors"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c1d] border border-[#2c2d30] max-w-md w-full rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#e50539]">✈</span> How to Play VIMAAN Aviator
            </h3>
            <div className="space-y-3 text-[13px] text-[#bbbfc5] leading-relaxed">
              <p>
                1. <strong className="text-white">Place Your Bet:</strong> Enter bet amount or select quick buttons before round starts during the 5s countdown.
              </p>
              <p>
                2. <strong className="text-white">Watch Flight:</strong> As the Lucky Plane takes off, multiplier starts at 1.00x and accelerates upwards!
              </p>
              <p>
                3. <strong className="text-white">Cash Out in Time:</strong> Hit <span className="text-amber-400 font-bold">Cash Out</span> before the plane flies away to win your bet multiplied by current rate!
              </p>
              <p>
                4. <strong className="text-white">Auto Mode:</strong> Enable Auto toggle and set target multiplier to automatically cash out.
              </p>
              <p className="text-[12px] text-[#858788] pt-2 border-t border-[#2a2b2e]">
                Backend Socket Ready: This architecture supports standard WebSocket / Socket.IO event listeners for live casino backend deployment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#e50539] hover:bg-[#ff2b5b] font-bold text-white transition-colors"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
