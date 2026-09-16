import React from 'react';

export default function SecondaryNavBar({ activeSport, onSelectSport }) {
  const items = [
    { id: 'inplay', label: 'Inplay', highlight: true },
    { id: 'cricket', label: 'Cricket' },
    { id: 'soccer', label: 'Soccer' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'horse', label: 'Horse Racing' },
    { id: 'greyhound', label: 'Greyhound Racing' },
    { id: 'mac88', label: 'MAC88' },
    { id: 'casino', label: 'Casino' },
    { id: 'sportbook', label: 'Sport Book', highlight: true },
    { id: 'basketball', label: 'Basketball', highlight: true },
    { id: 'baseball', label: 'Baseball', highlight: true },
    { id: 'table_tennis', label: 'Table Tennis', highlight: true },
    { id: 'volleyball', label: 'VOLLEYBALL', highlight: true, uppercase: true },
  ];

  return (
    <nav className="bg-[#0d0d0d] text-gray-200 text-xs pt-2 pb-3 px-3 md:px-6 overflow-x-auto whitespace-nowrap border-b border-gray-800 custom-scrollbar-dark select-none">
      <div className="max-w-[1440px] mx-auto flex items-center gap-3 font-semibold text-[11.5px]">
        {items.map((item, idx) => (
          <React.Fragment key={item.id}>
            <button
              onClick={() => onSelectSport(item.id)}
              className={`cursor-pointer transition-colors ${
                activeSport === item.id
                  ? 'text-[#f5c542] font-black underline'
                  : item.highlight
                  ? 'text-[#f5c542] hover:underline'
                  : 'hover:text-amber-400'
              } ${item.uppercase ? 'uppercase font-extrabold' : ''}`}
            >
              {item.label}
            </button>
            {idx < items.length - 1 && <span className="text-amber-500">•</span>}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}
