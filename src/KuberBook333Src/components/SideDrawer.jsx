import React from 'react';
import { X } from 'lucide-react';

export default function SideDrawer({
  isOpen,
  menuOpen,
  onClose,
  onSelectSport,
  onAuthClick,
  onOpenRules,
}) {
  const visible = isOpen ?? menuOpen;
  if (!visible) return null;

  const menuItems = [
    {
      id: 'multi_market',
      label: 'Multi Market',
      icon: '⭐',
      action: () => {
        if (onSelectSport) onSelectSport('multi_market');
        onClose();
      },
    },
    {
      id: 'cricket',
      label: 'Cricket',
      icon: '🏏',
      action: () => {
        if (onSelectSport) onSelectSport('cricket');
        onClose();
      },
    },
    {
      id: 'soccer',
      label: 'Soccer',
      icon: '⚽',
      action: () => {
        if (onSelectSport) onSelectSport('soccer');
        onClose();
      },
    },
    {
      id: 'tennis',
      label: 'Tennis',
      icon: '🎾',
      action: () => {
        if (onSelectSport) onSelectSport('tennis');
        onClose();
      },
    },
    {
      id: 'horse_racing',
      label: 'Horse Racing',
      icon: '🏇',
      action: () => {
        if (onSelectSport) onSelectSport('horse');
        onClose();
      },
    },
    {
      id: 'greyhound_racing',
      label: 'Greyhound Racing',
      icon: '🐕',
      action: () => {
        if (onSelectSport) onSelectSport('greyhound');
        onClose();
      },
    },
    {
      id: 'mac88',
      label: 'MAC88',
      icon: '🎲',
      action: () => {
        if (onSelectSport) onSelectSport('mac88');
        onClose();
      },
    },
    {
      id: 'sports_book',
      label: 'Sports book',
      icon: '🏆',
      action: () => {
        if (onSelectSport) onSelectSport('sportsbook');
        onClose();
      },
    },
    {
      id: 'basketball',
      label: 'Basketball',
      icon: '🏀',
      action: () => {
        if (onSelectSport) onSelectSport('basketball');
        onClose();
      },
    },
    {
      id: 'volleyball',
      label: 'Volleyball',
      icon: '🏐',
      action: () => {
        if (onSelectSport) onSelectSport('volleyball');
        onClose();
      },
    },
    {
      id: 'table_tennis',
      label: 'Table Tennis',
      icon: '🏓',
      action: () => {
        if (onSelectSport) onSelectSport('tabletennis');
        onClose();
      },
    },
    {
      id: 'mma',
      label: 'Mixed Martial Arts',
      icon: '🥋',
      action: () => {
        if (onSelectSport) onSelectSport('mma');
        onClose();
      },
    },
    {
      id: 'rule',
      label: 'Rule',
      icon: '📜',
      action: () => {
        if (onOpenRules) {
          onOpenRules();
        } else {
          alert('Rules & Regulations');
        }
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-start pointer-events-none select-none">
      {/* Container aligned with the mobile width */}
      <div className="w-full max-w-[480px] h-full relative pointer-events-auto flex">
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-black/60 cursor-pointer z-10 transition-opacity"
          onClick={onClose}
        />

        {/* Drawer Panel */}
        <div className="relative w-[225px] sm:w-[230px] max-w-[62%] bg-[#000000] text-white h-full shadow-2xl z-20 flex flex-col animate-in slide-in-from-left duration-200 border-r border-[#1a1a1a]">
          {/* Header */}
          <div className="h-[57px] px-2.5 pl-4 py-4 flex items-center  border-b border-[#dddddd54] bg-[#000000] shrink-0">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/games/public.png"
                alt="logo"
                className="h-[55px] object-contain"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 ml-0.5  cursor-pointer transition-colors flex items-center justify-center shrink-0"
              aria-label="Close Menu"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Menu Items List */}
          <div className="flex-1 overflow-y-auto no-scrollbar bg-[#000000] text-white">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="w-full h-[38px] px-3.5 flex items-center  gap-1.5 border-b border-[#dddddd54] hover:bg-[#141414] active:bg-[#1f1f1f] text-left transition-colors cursor-pointer text-white"
              >
                <span className="text-[17px] shrink-0 leading-none flex items-center justify-center w-[18px]">
                  {item.icon}
                </span>
                <span className="text-[13.5px] font-semibold text-white tracking-normal leading-none">
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
