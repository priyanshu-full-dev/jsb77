import React, { useState, useEffect } from 'react';

const DEFAULT_STAKES = [
  { id: 1, name: '1k', value: '1000' },
  { id: 2, name: '2k', value: '2000' },
  { id: 3, name: '5k', value: '5000' },
  { id: 4, name: '10k', value: '10000' },
  { id: 5, name: '20k', value: '20000' },
  { id: 6, name: '25k', value: '25000' },
  { id: 7, name: '50k', value: '50000' },
  { id: 8, name: '75k', value: '75000' },
  { id: 9, name: '90k', value: '90000' },
  { id: 10, name: '95k', value: '95000' },
];

export default function StakeSettingsSection({ onToast }) {
  const [stakes, setStakes] = useState(DEFAULT_STAKES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kuber_stakes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStakes(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleChange = (id, field, val) => {
    setStakes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleUpdate = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('kuber_stakes', JSON.stringify(stakes));
      if (onToast) {
        onToast({
          id: Date.now(),
          type: 'add',
          message: 'Stake Settings Updated Successfully!',
        });
      } else {
        alert('Stake Settings Updated Successfully!');
      }
    } catch (err) {
      console.error('Failed to save stake settings:', err);
    }
  };

  return (
    <div className="w-full bg-[#f2f4f7] min-h-screen pb-24 text-neutral-900 select-none p-2 pt-2 flex flex-col gap-3">
      {/* Stake Settings Container */}
      <form
        onSubmit={handleUpdate}
        className="w-full bg-[#1e1e1e] rounded-[8px] shadow-md  overflow-hidden flex flex-col"
      >
        {/* Header with Gold Gradient */}
        <div
          style={{
            background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
          }}
          className="px-3 py-2 text-white font-bold text-[16px] tracking-wide"
        >
          Stake Settings
        </div>

        {/* Form Body - Grid of Button Name & Button Value */}
        <div className="p-3 px-5 sm:p-4 flex flex-col gap-3 bg-[#1e1e1e]">
          {stakes.map((stake) => (
            <div key={stake.id} className="grid grid-cols-2 gap-5">
              {/* Button Name Input */}
              <div className="flex flex-col ">
                <label className="text-[16px] font-semibold text-[#666666]">
                  Button Name
                </label>
                <input
                  type="text"
                  value={stake.name}
                  onChange={(e) => handleChange(stake.id, 'name', e.target.value)}
                  className="w-full h-[35px] bg-white rounded-[4px] px-[12px] py-[6px] text-black font-semibold text-[14px] outline-none border border-transparent focus:border-amber-500 shadow-xs transition-colors"
                />
              </div>

              {/* Button Value Input */}
              <div className="flex flex-col ">
                <label className="text-[16px] font-semibold text-[#666666]">
                  Button Value
                </label>
                <input
                  type="text"
                  value={stake.value}
                  onChange={(e) => handleChange(stake.id, 'value', e.target.value)}
                  className="w-full h-[35px] bg-white rounded-[4px] px-[12px] py-[6px] text-black font-semibold text-[14px] outline-none border border-transparent focus:border-amber-500 shadow-xs transition-colors"
                />
              </div>
            </div>
          ))}

          {/* UPDATE Button */}
          <button
            type="submit"
            style={{
              background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
            }}
            className="w-full h-[46px] rounded-[6px] text-white font-black text-[16px] tracking-wider uppercase flex items-center justify-center shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer mt-2"
          >
            UPDATE
          </button>
        </div>
      </form>
    </div>
  );
}
