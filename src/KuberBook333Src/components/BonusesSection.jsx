import React, { useState } from 'react';

const BONUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'InActive' },
  { id: 'claimed', label: 'Claimed' },
];

export default function BonusesSection({ user }) {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="w-full bg-[#f2f4f7] min-h-screen pb-24 text-neutral-900 select-none p-2 pt-2 flex flex-col gap-4">
      {/* 4 FILTER TABS ROW */}
      <div className="grid grid-cols-4 gap-2 w-full pt-1">
        {BONUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={
                isActive
                  ? {
                      background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
                      borderColor: '#9c6e20',
                    }
                  : {
                      background: '#ffffff',
                      borderColor: '#9c6e20',
                    }
              }
              className="w-full py-1.5 rounded-[6px] border-[1.5px] text-black font-extrabold text-[14px] text-center shadow-2xs hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CENTER EMPTY STATE WITH SVG ILLUSTRATION */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[55vh] py-10">
        <img
          src="/games/NoData-DcIjz2kn.svg"
          alt="No Bonuses Found"
          className="w-[220px] sm:w-[260px] h-auto object-contain select-none pointer-events-none drop-shadow-xs"
        />
      </div>
    </div>
  );
}
