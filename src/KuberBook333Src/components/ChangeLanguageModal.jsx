import React, { useState } from 'react';

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'hi', name: 'Hindi' },
  { id: 'kn', name: 'Kannada' },
  { id: 'ta', name: 'Tamil' },
  { id: 'te', name: 'Telugu' },
  { id: 'gu', name: 'Gujrati' },
  { id: 'mr', name: 'Marathi' },
  { id: 'ur', name: 'Urdu' },
  { id: 'ru', name: 'Russian' },
];

export default function ChangeLanguageModal({
  isOpen,
  onClose,
  currentLanguage = 'English',
  onSelectLanguage,
}) {
  const [selected, setSelected] = useState(currentLanguage);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (onSelectLanguage) {
      onSelectLanguage(selected);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pb-20 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      {/* MODAL CARD */}
      <div
        className="w-full max-w-[360px] bg-white rounded-[10px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* GOLD HEADER */}
        <div
          style={{
            background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
          }}
          className="w-full px-4 py-2 flex items-center justify-between shadow-xs"
        >
          <h3 className="text-black font-bold text-[16.5px] tracking-wide">
            Change Language
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-black hover:opacity-75 transition-opacity text-[18px] font-bold cursor-pointer p-1 -mr-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 flex flex-col gap-3">
          {/* Search Events / Languages Input */}
          <div className="w-full border border-gray-300 rounded-[6px] px-3 py-2 flex items-center justify-between bg-white focus-within:border-amber-600 transition-colors">
            <input
              type="text"
              placeholder="Search Events"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-[13.5px] text-gray-800 placeholder-gray-400 outline-none pr-2"
            />
            <svg
              className="w-4 h-4 text-gray-700 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Languages List */}
          <div className="grid gap-y-4 h-[35vh] overflow-y-auto pr-0.5 custom-scrollbar">
            {filtered.map((lang) => {
              const isSelected = selected === lang.name;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelected(lang.name)}
                  className={`w-full p-2 py-3 font-semibold text-base rounded-md text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#caa049] bg-amber-50/70 text-gray-900 font-bold shadow-xs'
                      : 'bg-[#f2f2f2] text-gray-600 hover:bg-gray-200/80'
                  }`}
                >
                  {lang.name}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center text-[13px] text-gray-500 py-3">
                No language found
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-full border-t border-gray-200 mt-1 mb-1" />

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-[6px] border border-[#caa049] text-[#9c782b] font-semibold text-[13.5px] bg-white hover:bg-amber-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
              }}
              className="px-6 py-1.5 rounded-[6px] text-white font-bold text-[13.5px] hover:brightness-105 active:scale-95 transition-all shadow-xs cursor-pointer drop-shadow-xs"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
