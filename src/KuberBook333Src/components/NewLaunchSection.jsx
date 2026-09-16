import React from 'react';

export default function NewLaunchSection({ onGameClick }) {
  const launches = [
    {
      id: 'marble_plinko',
      name: 'Marble Plinko Classic',
      image: '/games/marbles_marble_plinko_classic.jpg',
      bg: 'bg-[#021c0e]',
      border: 'border-emerald-500/40',
    },
    {
      id: 'rolling_dunes',
      name: 'Rolling Dunes Classic',
      image: '/games/marbles_rolling_dunes_classic.jpg',
      bg: 'bg-[#1c1815]',
      border: 'border-amber-500/40',
    },
    {
      id: 'snake_classic',
      name: 'Snake Classic',
      image: '/games/marbles_snake_classic.jpg',
      bg: 'bg-[#331c03]',
      border: 'border-yellow-500/40',
    },
    {
      id: 'duck_racing',
      name: 'Duck Racing',
      image: '/games/marbles_duck_racing.jpg',
      bg: 'bg-[#00b4d8]',
      border: 'border-pink-400/40',
    },
    {
      id: 'stair_pong',
      name: 'Stair Pong',
      image: '/games/marbles_stairpong.jpg',
      bg: 'bg-[#0a1e3f]',
      border: 'border-blue-500/40',
    },
  ];

  return (
    <section className="bg-white border-t border-gray-300 mt-2 select-none">
      {/* Section Header: Exact Linear Gradient Gold Bar */}
      <div
        style={{
          background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)',
        }}
        className="py-1.5 text-center text-white font-black text-[13.5px] tracking-wider shadow-xs"
      >
        New Launch
      </div>

      {/* Horizontal Scrollable Portrait Cards */}
      <div className="flex gap-0.5 overflow-x-auto bg-[#f0f2f5] custom-scrollbar snap-x cursor-grab active:cursor-grabbing px-1 pt-1.5  scroll-px-1.5">
        {launches.map((item) => (
          <div
            key={item.id}
            onClick={() => onGameClick(item.id)}
            className={`w-[calc(33.333%-2px)] min-w-[calc(33.333%-2px)] max-w-[calc(33.333%-2px)] sm:w-[calc(25%-2px)] sm:min-w-[calc(25%-2px)] sm:max-w-[calc(25%-2px)] aspect-[5/7] shrink-0 overflow-hidden border ${item.border} shadow-sm cursor-pointer hover:brightness-105 active:scale-95 transition-all snap-start ${item.bg}`}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full block"
                loading="eager"
              />
            ) : item.renderCustom ? (
              item.renderCustom()
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
