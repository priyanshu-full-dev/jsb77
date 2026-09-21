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
    <div className="w-full bg-[#f2f4f7] min-h-[calc(100vh-230px)] pb-20 text-neutral-900 select-none p-2 pt-0 flex flex-col">
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
              className="w-full px-4 xs:px-8 py-2 rounded-[8px] border-[1.5px] text-black font-bold font-lato leading-4 text-[13px] md:text-sm lg:text-base text-center shadow-2xs hover:brightness-105 active:scale-95 transition-all cursor-pointer block z-10"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CENTER EMPTY STATE WITH SVG ILLUSTRATION */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 my-auto">
        <img
          src="/games/NoData-DcIjz2kn.svg"
          alt="No Bonuses Found"
          className="w-[300px] h-[300px] object-contain select-none pointer-events-none drop-shadow-xs"
        />
      </div>
    </div>
  );
}
