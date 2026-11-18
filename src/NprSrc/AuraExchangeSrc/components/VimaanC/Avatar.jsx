import React from 'react';

const AVATAR_PALETTES = [
  ['#FF416C', '#FF4B2B'],
  ['#8A2387', '#E94057'],
  ['#00c6ff', '#0072ff'],
  ['#f857a6', '#ff5858'],
  ['#43cea2', '#185a9d'],
  ['#4e54c8', '#8f94fb'],
  ['#30cfd0', '#330867'],
  ['#f12711', '#f5af19'],
  ['#b224ef', '#7579ff'],
  ['#11998e', '#38ef7d'],
  ['#fc4a1a', '#f7b733'],
  ['#12c2e9', '#c471ed'],
  ['#3a7bd5', '#3a6073'],
  ['#ff9966', '#ff5e62'],
  ['#00F260', '#0575E6'],
  ['#e1eec3', '#f05053'],
  ['#00c9ff', '#92fe9d'],
  ['#a8ff78', '#78ffd6'],
  ['#fa709a', '#fee140'],
  ['#667eea', '#764ba2'],
];

export default function Avatar({ id = 1, name = 'user', size = 30 }) {
  const index = Math.abs(typeof id === 'number' ? id : (name.charCodeAt(0) || 1)) % AVATAR_PALETTES.length;
  const [c1, c2] = AVATAR_PALETTES[index];
  const char = name.charAt(0).toUpperCase();

  return (
    <div 
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/10 shadow-inner"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
      }}
    >
      <span className="text-white text-[12px] font-bold select-none drop-shadow">
        {char}
      </span>
    </div>
  );
}
