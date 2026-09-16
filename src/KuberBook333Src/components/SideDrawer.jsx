import React from 'react';
import { X } from 'lucide-react';

export default function SideDrawer({
  menuOpen,
  onClose,
  onSelectSport,
  onAuthClick,
}) {
  if (!menuOpen) return null;

  const menuItems = [
    {
      id: 'multi_market',
      label: 'Multi Market',
      icon: '⭐',
      action: () => {
        onSelectSport('multi_market');
        onClose();
      },
    },
    {
      id: 'cricket',
      label: 'Cricket',
      icon: '🏏',
      action: () => {
        onSelectSport('cricket');
        onClose();
      },
    },
    {
      id: 'soccer',
      label: 'Soccer',
      icon: '⚽',
      action: () => {
        onSelectSport('soccer');
        onClose();
      },
    },
    {
      id: 'tennis',
      label: 'Tennis',
      icon: '🎾',
      action: () => {
        onSelectSport('tennis');
        onClose();
      },
    },
    {
      id: 'horse_racing',
      label: 'Horse Racing',
      icon: '🏇',
      action: () => {
        onSelectSport('horse');
        onClose();
      },
    },
    {
      id: 'greyhound_racing',
      label: 'Greyhound Racing',
      icon: '🐕',
      action: () => {
        onSelectSport('greyhound');
        onClose();
      },
    },
    {
      id: 'mac88',
      label: 'MAC88',
      icon: '🎲',
      action: () => {
        onSelectSport('mac88');
        onClose();
      },
    },
    {
      id: 'sports_book',
      label: 'Sports book',
      icon: '🏆',
      action: () => {
        onSelectSport('sportsbook');
        onClose();
      },
    },
    {
      id: 'basketball',
      label: 'Basketball',
      icon: '🏀',
      action: () => {
        onSelectSport('basketball');
        onClose();
      },
    },
    {
      id: 'volleyball',
      label: 'Volleyball',
      icon: '🏐',
      action: () => {
        onSelectSport('volleyball');
        onClose();
      },
    },
    {
      id: 'table_tennis',
      label: 'Table Tennis',
      icon: '🏓',
      action: () => {
        onSelectSport('tabletennis');
        onClose();
      },
    },
    {
      id: 'mma',
      label: 'Mixed Martial Arts',
      icon: '🥋',
      action: () => {
        onSelectSport('mma');
        onClose();
      },
    },
    {
      id: 'rule',
      label: 'Rule',
      icon: '📜',
      action: () => {
        alert('Rules & Regulations');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-center pointer-events-none select-none">
      {/* Container aligned with the mobile width */}
      <div className="w-full max-w-[480px] h-full relative pointer-events-auto flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-10"
          onClick={onClose}
        />

        {/* Drawer */}
        <div className="relative w-[235px] sm:w-[250px] max-w-[65%] bg-[#000000] text-white h-full shadow-2xl z-20 flex flex-col animate-in slide-in-from-left duration-200 border-r border-[#222222]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#222222] bg-[#000000] shrink-0 min-h-[46px]">
            {/* Logo */}
            <div className="flex items-center">
              <span className="font-extrabold text-[15px] sm:text-[17px] text-white tracking-tight uppercase leading-none">
                KUBER
              </span>
              <div className="bg-[#df0d15] text-[#ffdf00] font-black text-[13px] sm:text-[14.5px] px-1 py-0.5 rounded-[2px] ml-1 leading-none flex items-center shadow-xs">
                <span className="text-white">BOOK</span>
                <span className="text-[#ffdf00] ml-0.5">333</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 p-1 cursor-pointer transition-colors"
              aria-label="Close Menu"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Menu Items List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar-dark text-white">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-neutral-900 active:bg-neutral-800 text-left transition-colors cursor-pointer border-b border-[#1c1c1c]"
              >
                <span className="text-[16px] shrink-0 leading-none flex items-center justify-center w-5">
                  {item.icon}
                </span>
                <span className="text-[13.5px] font-bold text-white tracking-wide">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
