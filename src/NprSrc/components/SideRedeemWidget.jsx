import { useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaCoins, FaGift, FaExchangeAlt } from "react-icons/fa";

const SideRedeemWidget = ({ onOpenRedeem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleBoxClick = () => {
    if (onOpenRedeem) {
      onOpenRedeem();
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      {/* Floating Left Side Widget */}
      <div className="fixed left-0 sm:left-[calc(50%-224px)] bottom-[76px] sm:bottom-[80px] z-40 select-none pointer-events-auto">
        {!isOpen ? (
          /* 1. Collapsed State: Blue curved pill tab with '>' chevron */
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-start focus:outline-none transition-transform duration-200 active:scale-95"
            title="Open Point Redeem"
            aria-label="Open Point Redeem"
          >
            <img
              src="/npr/side_redeem_tab.png"
              alt="Point Redeem Tab"
              className="w-[25px] h-[112px] sm:w-[28px] sm:h-[124px] object-contain block drop-shadow-[2px_4px_10px_rgba(0,0,0,0.35)] group-hover:brightness-110 transition pointer-events-none"
              draggable={false}
            />
          </button>
        ) : (
          /* 2. Expanded State: Full Point Redeem gift box panel with '<' collapse button */
          <div className="relative animate-side-redeem-in origin-left">
            <div className="relative w-[138px] h-[166px] sm:w-[150px] sm:h-[181px] drop-shadow-[4px_6px_16px_rgba(0,0,0,0.4)]">
              {/* Authentic Panel Graphic */}
              <img
                src="/npr/side_redeem_open.png"
                alt="NPR77 Point Redeem"
                className="w-full h-full object-contain block pointer-events-none"
                draggable={false}
              />

              {/* Clickable Area: Upper 3D Gift Box & 'POINT REDEEM' Banner */}
              <button
                onClick={handleBoxClick}
                className="absolute top-0 left-0 right-0 h-[72%] cursor-pointer focus:outline-none active:scale-[0.98] transition"
                title="Redeem Points"
                aria-label="Redeem Points"
              />

              {/* Clickable Hotspot for '<' Left Chevron Collapse Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="absolute bottom-[16%] left-[18%] w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition focus:outline-none cursor-pointer"
                title="Collapse Point Redeem"
                aria-label="Collapse Point Redeem"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Point Redeem Interactive Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#0a183d] to-[#040c20] border border-blue-500/30 rounded-2xl p-5 shadow-2xl text-white">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <FaTimes size={13} />
            </button>

            {/* Header */}
            <div className="text-center pt-2 pb-4 border-b border-blue-900/40">
              <div className="inline-flex p-3 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-900 shadow-lg mb-2">
                <FaGift size={24} />
              </div>
              <h3 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                POINT REDEEM MALL
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Exchange VIP Crown Points for Real Cash & Rewards
              </p>
            </div>

            {/* Points Balance Card */}
            <div className="my-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/80 to-blue-900/60 border border-blue-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FaCoins className="text-amber-400" size={20} />
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold">
                    Available Points
                  </div>
                  <div className="text-base font-black text-amber-300 leading-tight">
                    1,250 Points
                  </div>
                </div>
              </div>
              <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                VIP Tier 2
              </span>
            </div>

            {/* Rewards Tiers */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-950/50 border border-blue-800/30 text-xs">
                <div>
                  <div className="font-bold text-white">₹500 Cash Bonus</div>
                  <div className="text-[10.5px] text-slate-400">Costs 500 Points</div>
                </div>
                <button
                  onClick={() => {
                    alert("Redemption Request Submitted! Bonus credited within 5 minutes.");
                    setModalOpen(false);
                  }}
                  className="px-3 py-1 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 font-bold text-white shadow-sm text-[11px] transition active:scale-95"
                >
                  Redeem
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-950/50 border border-blue-800/30 text-xs">
                <div>
                  <div className="font-bold text-white">50 Free Spins (Gates of Olympus)</div>
                  <div className="text-[10.5px] text-slate-400">Costs 800 Points</div>
                </div>
                <button
                  onClick={() => {
                    alert("50 Free Spins Claimed on Gates of Olympus!");
                    setModalOpen(false);
                  }}
                  className="px-3 py-1 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 font-bold text-white shadow-sm text-[11px] transition active:scale-95"
                >
                  Redeem
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

SideRedeemWidget.propTypes = {
  onOpenRedeem: PropTypes.func,
};

export default SideRedeemWidget;
