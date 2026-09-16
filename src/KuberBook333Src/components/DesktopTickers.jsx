import React from 'react';

export default function DesktopTickers() {
  const tickers = [
    { text: 'Barbados Tridents v Trinbago Knight Riders', bg: 'bg-[#8b0b14]' },
    { text: 'Dublin Guardians v Amsterdam Flames', bg: 'bg-[#0f6e24]' },
    { text: 'Rotterdam Dockers v Edinburgh Castle Rockers', bg: 'bg-[#781820]' },
    { text: 'Guyana Amazon Warriors v Jamaica Kingsmen', bg: 'bg-[#0f6e24]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 text-white text-[11px] font-semibold text-center divide-x divide-black/20 select-none">
      {tickers.map((t, idx) => (
        <div key={idx} className={`${t.bg} py-1 px-2 truncate hover:brightness-110 transition-colors cursor-pointer`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
