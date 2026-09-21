import React from 'react';
import { ChevronRight, Send } from 'lucide-react';

export default function DesktopSidebar({ onSelectCategory, onAuthClick }) {
  const categories = [
    { id: 'favourites', label: 'Favourites', icon: '⭐' },
    { id: 'cricket', label: 'Cricket', icon: '🏏' },
    { id: 'soccer', label: 'Soccer', icon: '⚽' },
    { id: 'tennis', label: 'Tennis', icon: '🎾' },
    { id: 'horse', label: 'Horse Racing', icon: '🏇' },
    { id: 'greyhound', label: 'Greyhound Racing', icon: '🐕' },
    { id: 'mac88', label: 'MAC88', icon: '🎲' },
    { id: 'sportbook', label: 'Sports book', icon: '🏆' },
    { id: 'basketball', label: 'Basketball', icon: '🏀' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[230px] shrink-0 bg-white border-r border-gray-200 text-xs select-none">
      <div className="py-2 divide-y divide-gray-100">
        {categories.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectCategory(item.id)}
            className="w-full flex items-center justify-between px-3 py-2 text-gray-800 hover:bg-amber-50 hover:text-amber-700 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 font-medium">
              <span className="text-sm">{item.icon}</span>
              <span className="text-gray-900 font-semibold">{item.label}</span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </button>
        ))}
      </div>

      <div className="mt-auto p-3 border-t border-gray-200 space-y-2">
        <a
          href="https://t.me/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-[#0088cc] hover:underline font-semibold text-xs"
        >
          <div className="w-5 h-5 rounded-full bg-[#0088cc] text-white flex items-center justify-center">
            <Send size={11} className="-ml-0.5 mt-0.5" />
          </div>
          <span>Follow On Telegram</span>
        </a>

        <a
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-[#00c950] hover:underline font-semibold text-xs"
        >
          <div className="w-5 h-5 rounded-full bg-[#00c950] text-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.538 1.838.82 2.791.82 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.708 0-3.32-.434-4.739-1.196l-5.261 1.378 1.405-5.132c-.87-1.485-1.373-3.21-1.373-5.05 0-5.514 4.486-10 10-10s10 4.486 10 10z"/>
            </svg>
          </div>
          <span>connect on whatsapp</span>
        </a>
      </div>
    </aside>
  );
}
