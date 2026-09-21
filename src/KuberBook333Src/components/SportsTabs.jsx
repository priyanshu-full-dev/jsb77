import React from 'react';
import { Play } from 'lucide-react';

export default function SportsTabs({ activeSport, onSelectSport }) {
  const tabs = [
    {
      id: 'inplay',
      label: 'Inplay',
      icon: <img src="/games/play.png" alt="Inplay" className="h-[20px] object-contain" />,
    },
    {
      id: 'cricket',
      label: 'Cricket',
      icon: <div className="text-[17px] leading-none">🏏</div>,
    },
    {
      id: 'soccer',
      label: 'Soccer',
      icon: <div className="text-[17px] leading-none">⚽</div>,
    },
    {
      id: 'tennis',
      label: 'Tennis',
      icon: <div className="text-[17px] leading-none">🎾</div>,
    },
    {
      id: 'horse',
      label: 'Horse Racing',
      icon: <div className="text-[17px] leading-none">🐎</div>,
    },
    {
      id: 'greyhound',
      label: 'Greyhound Racing',
      icon: <img src="/SportsIcon/greyhound.png" alt="Greyhound Racing" className="h-[20px] object-contain" />,
    },
    {
      id: 'mac88',
      label: 'MAC88',
      icon: <div className="text-[17px] leading-none">🎲</div>,
    },
    {
      id: 'sportsbook',
      label: 'Sports Book',
      icon: <div className="text-[18px] leading-none">🏆</div>,
    },
    {
      id: 'basketball',
      label: 'Basketball',
      icon: <div className="text-[17px] leading-none">🏀</div>,
    },
    {
      id: 'volleyball',
      label: 'Volleyball',
      icon: <div className="text-[17px] leading-none">🏐</div>,
    },
    {
      id: 'tabletennis',
      label: 'Table Tennis',
      icon: <div className="text-[17px] leading-none">🏓</div>,
    },
    {
      id: 'mma',
      label: 'Mixed Martial Arts',
      icon: <div className="text-[17px] leading-none">🥋</div>,
    },
  ];

  return (
    <nav className="bg-[#e4e7eb] select-none border-b border-gray-300 w-full">
      <div className="flex items-center gap-[9px] overflow-x-auto custom-scrollbar px-0.5 py-0.5 w-full">
        {tabs.map((tab) => {
          const isActive = activeSport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectSport(tab.id)}
              style={{
                border: '1px solid #b88831',
                boxShadow: '0 1px 5px #000',
                background: isActive
                  ? 'transparent linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)'
                  : 'linear-gradient(180deg, #f0f0f0 0%, #dbdbdb 100%)',
              }}
              className="shrink-0 h-[48.5px] px-[15px] py-[4px] flex flex-col items-center justify-center rounded-[10px] transition-all cursor-pointer hover:brightness-105 active:scale-97 text-black"
            >
              <div className="flex items-center justify-center h-[20px]">
                {tab.icon}
              </div>
              <div className="flex items-center justify-center h-[20px]">
                <span className="text-[11px] font-normal leading-none whitespace-nowrap text-center text-black">
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
