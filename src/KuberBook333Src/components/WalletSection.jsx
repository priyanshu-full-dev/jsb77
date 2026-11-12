import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WalletSection({ user }) {
  const navigate = useNavigate();
  const balance = user?.balance !== undefined ? user.balance : 0;

  return (
    <div className="w-full min-h-[70vh] bg-white select-none flex flex-col">


      {/* 1. Dark Bar Section Header */}
      <div className="w-full bg-[#373737] text-white font-bold text-xl px-4 py-2.5 shadow-xs flex items-center">
        Wallet
      </div>

      {/* 2. Top Content Area with Light Grey Background matching site tabs */}
      <div className="w-full bg-[#dedddd] px-4 pt-5 pb-6">
        <div className="max-w-xl mx-auto">
          {/* Total Balance Card */}
          <div className="flex items-center gap-3.5 mb-5">
            {/* Dark Charcoal Icon Box */}
            <div className="w-11 h-11 flex items-center justify-center bg-[#353534] rounded-md shadow shrink-0">
              <img src="/download.svg" alt="Wallet" className="w-7 h-7 " />
            </div>

            {/* Balance Text */}
            <div className="flex flex-col justify-center">
              <span className="text-[#282d34] font-semibold text-[15px] leading-tight">
                Your Total Balance
              </span>
              <span className="text-black font-extrabold text-[26px] leading-tight mt-0.5">
                {balance}
              </span>
            </div>
          </div>

          {/* Deposit & Withdraw Metallic Gold Action Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Wallet Deposit */}
            <button
              type="button"
              onClick={() => navigate('/deposit')}
              style={{
                background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)',

              }}
              className="w-full py-2 px-2 rounded-lg  hover:brightness-105 active:scale-98 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-7 h-7 text-black stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="2" />
                  <path d="M16 13h.01" />
                  <path d="M12 15V9" />
                  <path d="M9 12l3-3 3 3" />
                </svg>
              </div>
              <span className="font-bold text-black text-[14px] sm:text-[15px] tracking-tight">
                Wallet Deposit
              </span>
            </button>

            {/* Wallet Withdraw */}
            <button
              type="button"
              onClick={() => navigate('/withdraw')}
              style={{
                background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)',

              }}
              className="w-full py-2 px-2 rounded-lg  hover:brightness-105 active:scale-98 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-7 h-7 text-black stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="2" />
                  <path d="M16 13h.01" />
                  <path d="M12 9v6" />
                  <path d="M9 12l3 3 3-3" />
                </svg>
              </div>
              <span className="font-bold text-black text-[14px] sm:text-[15px] tracking-tight">
                Wallet Withdraw
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom White Extension Area */}
      <div className="flex-1 w-full bg-white" />
    </div>
  );
}
