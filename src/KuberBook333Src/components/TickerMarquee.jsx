import React from 'react';

export default function TickerMarquee() {
  const tickerItems = [
    {
      id: 1,
      title: 'Namibia v South Africa',
      bg: 'bg-[#8b0000]',
    },
    {
      id: 2,
      title: 'Afghanistan v India',
      bg: 'bg-[#007000]',
    },
    {
      id: 3,
      title: 'Sri Lanka v Australia',
      bg: 'bg-[#8b0000]',
    },
    {
      id: 4,
      title: 'England v Pakistan',
      bg: 'bg-[#007000]',
    },
    {
      id: 5,
      title: 'Lucknow Falcons v Meerut Mavericks',
      bg: 'bg-[#8b0000]',
    },
    {
      id: 6,
      title: 'Dublin Guardians v Belfast Wolves',
      bg: 'bg-[#007000]',
    },
  ];

  return (
    <div className="bg-[#ffff] w-full pt-[1px] select-none border-b border-neutral-300">
      {/* Scrollable Left-Right Row with 1s Blinking Text */}
      <div className="flex items-center gap-[6px] overflow-x-auto custom-scrollbar-ticker snap-x w-full px-1 pb-[2px]">
        {tickerItems.map((item) => (
          <div
            key={item.id}
            className={`shrink-0 h-[28px] px-[12px] ${item.bg} rounded-[6px] flex items-center justify-center snap-start shadow-xs pointer-events-none`}
          >
            <span className="text-white text-[12px] font-bold tracking-tight whitespace-nowrap animate-blink-1s leading-none">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

