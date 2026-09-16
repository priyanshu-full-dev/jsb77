import React from 'react';
import { X } from 'lucide-react';

export default function SearchModal({
  searchOpen,
  onClose,
  searchQuery,
  setSearchQuery,
}) {
  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center p-4 pt-16">
      <div className="bg-white w-full max-w-[440px] rounded-lg shadow-2xl p-4 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-gray-900">Search Matches &amp; Games</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Cricket, Tennis, Aviator..."
            className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-amber-500"
            autoFocus
          />
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Popular:{' '}
          <b
            className="cursor-pointer hover:underline"
            onClick={() => setSearchQuery('Zverev')}
          >
            Zverev
          </b>
          ,{' '}
          <b
            className="cursor-pointer hover:underline"
            onClick={() => setSearchQuery('Noida')}
          >
            Noida Super Kings
          </b>
          ,{' '}
          <b
            className="cursor-pointer hover:underline"
            onClick={() => setSearchQuery('Aviator')}
          >
            Aviator
          </b>
          ,{' '}
          <b
            className="cursor-pointer hover:underline"
            onClick={() => setSearchQuery('Mines')}
          >
            Mines
          </b>
        </div>
      </div>
    </div>
  );
}
