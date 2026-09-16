import React from 'react';

export default function CasinoProviders({ onProviderClick }) {
  // 3-Row flat list of providers organized column-by-column for grid-flow-col (15 providers = 5 cols x 3 rows)
  const providers = [
    // Column 1: Asia Gaming, Aura Gaming, Ezugi
    {
      id: 'ag',
      name: 'ASIA GAMING',
      image: '/games/provider_asiagaming.jpg',
    },
    {
      id: 'aura_gaming',
      name: 'AURA GAMING',
      image: '/games/provider_aura.jpg',
    },
    {
      id: 'ezugi',
      name: 'EZUGI',
      image: '/games/provider_ezugi.jpg',
    },

    // Column 2: Play Now, Jili, Kingmidas Lobby
    {
      id: 'play_now',
      name: 'PLAY NOW',
      image: '/games/provider_playnow.jpg',
    },
    {
      id: 'jili',
      name: 'JILI',
      image: '/games/provider_jili.jpg',
    },
    {
      id: 'kingmidas',
      name: 'KINGMIDAS LOBBY',
      image: '/games/provider_kingmidas.jpg',
    },

    // Column 3: MAC88, Marbles Lobby, More Slots
    {
      id: 'mac88',
      name: 'MAC 88',
      image: '/games/provider_mac88.jpg',
    },
    {
      id: 'marbles_lobby',
      name: 'MARBLES LOBBY',
      image: '/games/provider_marbles.jpg',
    },
    {
      id: 'more_slots',
      name: 'MORE SLOTS',
      image: '/games/provider_moreslots.jpg',
    },

    // Column 4: Playtech, Sexy Lobby, Vivo Gaming
    {
      id: 'playtech',
      name: 'PLAYTECH',
      image: '/games/provider_playtech.jpg',
    },
    {
      id: 'sexy_lobby',
      name: 'SEXY LOBBY',
      image: '/games/provider_sexy.jpg',
    },
    {
      id: 'vivo_gaming',
      name: 'VIVO GAMING',
      image: '/games/provider_vivo.jpg',
    },

    // Column 5: Winfinity, Neo Lobby, E-Gaming
    {
      id: 'winfinity',
      name: 'WINFINITY',
      image: '/games/provider_winfinity.jpg',
    },
    {
      id: 'neo_lobby',
      name: 'NEO LOBBY',
      image: '/games/provider_neo.jpg',
    },
    {
      id: 'egaming',
      name: 'E - GAMING',
      image: '/games/provider_egaming.jpg',
    },
  ];

  return (
    <section className="bg-white my-4 select-none">
      {/* Section Header with Green Spade icon and Gold Banner */}
      <div className="px-3  h-[36px] bg-gradient-to-r from-[#C4932F] to-[#E8D58B] text-white font-sans font-black text-[13px] flex items-center gap-0.5 uppercase tracking-tight shadow-xs leading-none">
        <svg
          viewBox="0 0 16 16"
          className="w-[14px] h-[14px] text-green-600 shrink-0"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.184 11.246A3.5 3.5 0 0 1 1 9c0-1.602 1.14-2.633 2.66-4.008C4.986 3.792 6.602 2.33 8 0c1.398 2.33 3.014 3.792 4.34 4.992C13.86 6.367 15 7.398 15 9a3.5 3.5 0 0 1-6.184 2.246 20 20 0 0 0 1.582 2.907c.231.35-.02.847-.438.847H6.04c-.419 0-.67-.497-.438-.847a20 20 0 0 0 1.582-2.907" />
        </svg>
        <span className=" tracking-wide ">CASINO PROVIDER</span>
      </div>

      {/* 3-Row CSS Grid Container: 5 Columns with 3 items each */}
      <div className="grid md:hidden grid-flow-col auto-cols-[25%] grid-rows-3 gap-[9px] overflow-x-auto custom-scrollbar h-auto pt-1  px-0.5 bg-white">
        {providers.map((prov) => (
          <div
            key={prov.id}
            onClick={() => onProviderClick && onProviderClick(prov.id)}
            className="w-full aspect-[14/10] rounded-[14px] overflow-hidden shadow-xs cursor-pointer relative bg-neutral-900 hover:brightness-105 active:scale-95 transition-all group"
          >
            {/* Provider Background Image */}
            <img
              src={prov.image}
              alt={prov.name}
              className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              loading="eager"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

