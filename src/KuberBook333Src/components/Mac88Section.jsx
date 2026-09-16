import React, { useState } from 'react';

export default function Mac88Section({ onGameClick }) {
  const [activeProvider, setActiveProvider] = useState('mac88');
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Tier 1 Provider Pills (MAC88, DC, JACKTOP, etc.)
  const providers = [
    { id: 'mac88', label: 'MAC88' },
    { id: 'dc', label: 'DC' },
    { id: 'jacktop', label: 'JACKTOP' },
    { id: 'aura', label: 'AURA' },
    { id: 'betgames', label: 'BETGAMES' },
  ];

  // Tier 2 Sub-category Filter Tabs (All, Mac88 Gaming, MAC Excite, MAC88 Lite, etc.)
  const subTabs = [
    { id: 'all', label: 'All', hasIcon: false },
    { id: 'mac88_gaming', label: 'Mac88 Gaming', hasIcon: true },
    { id: 'mac_excite', label: 'MAC Excite', hasIcon: true },
    { id: 'mac88_lite', label: 'MAC88 Lite', hasIcon: true },
  ];

  // MAC88 Games Dataset Matching Reference Screenshot
  const mac88Games = [
    {
      id: 'mac88_brand',
      title: 'MAC88',
      category: ['all', 'mac88_gaming'],
      image: '/games/mac88_hero_brand.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_dt',
      title: 'DRAGON TIGER',
      category: ['all', 'mac88_gaming', 'mac_excite'],
      image: '/games/mac88_dragon_tiger.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_baccarat',
      title: 'BACCARAT',
      category: ['all', 'mac88_gaming', 'mac88_lite'],
      image: '/games/mac88_baccarat.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_32cards',
      title: '32 CARDS',
      category: ['all', 'mac88_gaming'],
      image: '/games/mac88_32cards.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_roulette',
      title: 'ROULETTE',
      category: ['all', 'mac88_gaming', 'mac_excite'],
      image: '/games/mac88_roulette.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_2020',
      title: '20-20 TEEN PATTI',
      category: ['all', 'mac88_gaming', 'mac88_lite'],
      image: '/games/mac88_teenpatti_2020.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_7updown',
      title: '7 UP DOWN',
      category: ['all', 'mac88_gaming'],
      image: '/games/aura_7updown.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_lucky7',
      title: 'LUCKY 7',
      category: ['all', 'mac_excite'],
      image: '/games/provider_ezugi.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_aaa',
      title: 'AMAR AKBAR ANTHONY',
      category: ['all', 'mac88_lite'],
      image: '/games/teenpatti.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_oneday',
      title: 'TEEN PATTI ONE DAY',
      category: ['all', 'mac88_gaming'],
      image: '/games/aura_teenpatti_oneday.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_andarbahar',
      title: 'ANDAR BAHAR',
      category: ['all', 'mac_excite'],
      image: '/games/provider_vivo.jpg',
      badge: 'Live',
    },
    {
      id: 'mac88_highlow',
      title: 'HIGH LOW',
      category: ['all', 'mac88_lite'],
      image: '/games/provider_sexy.jpg',
      badge: 'Live',
    },
  ];

  const filteredGames = mac88Games.filter((game) => {
    const matchesCategory =
      activeSubTab === 'all' || game.category.includes(activeSubTab);
    const matchesSearch = searchQuery
      ? game.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-[#f2f4f7] select-none flex flex-col pt-1.5 pb-6">
      {/* 1. Search Casino Input */}
      <div className="px-2.5 mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Casino..."
          className="w-full bg-white border border-[#c4cbd4] rounded-[6px] px-3.5 py-2 text-[14px] text-black placeholder:text-gray-500 focus:outline-none focus:border-[#caa049] transition-colors shadow-2xs"
        />
      </div>

      {/* 2. Provider Pills Row (MAC88, DC, JACKTOP) */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar px-2.5 pt-0.5 pb-3">
        {providers.map((prov) => {
          const isActive = activeProvider === prov.id;
          return (
            <button
              key={prov.id}
              type="button"
              onClick={() => {
                setActiveProvider(prov.id);
                setActiveSubTab('all');
              }}
              style={{
                border: '2px solid #b88831',
                background: isActive
                  ? 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)'
                  : '#dde2e8',
              }}
              className="shrink-0 min-w-[100px] sm:min-w-[110px] h-[42px] px-4 rounded-[6px] font-bold text-[15px] text-black flex items-center justify-center cursor-pointer shadow-xs hover:brightness-105 active:scale-95 transition-all"
            >
              {prov.label}
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Category Tabs (All, Mac88 Gaming, MAC Excite, MAC88 Lite) */}
      <div className="w-full flex items-stretch h-[56px] mb-1 bg-[#dde2e8] border-t border-b border-[#b88831] overflow-x-auto custom-scrollbar pb-1">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)',
                      borderRight: '1px solid #a67c2e',
                    }
                  : {
                      background: '#dde2e8',
                      borderRight: '1px solid #c8cbd0',
                    }
              }
              className={`shrink-0 min-w-[95px] sm:min-w-[105px] h-full flex flex-col items-center justify-center py-1 px-1.5 cursor-pointer transition-all ${
                isActive ? 'shadow-xs' : 'hover:bg-[#d0d6dd]'
              }`}
            >
              {tab.hasIcon ? (
                <div className="w-5 h-5 rounded-[4px] bg-[#111] flex items-center justify-center mb-0.5 shadow-2xs">
                  <div className="w-2.5 h-2.5 rounded-full border border-white/80 flex items-center justify-center">
                    <span className="text-[6px] text-white leading-none">▶</span>
                  </div>
                </div>
              ) : null}
              <span className="font-bold text-[12px] sm:text-[12.5px] text-black leading-tight text-center whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. 3-Column Games Grid */}
      <div className="grid grid-cols-3 gap-[2px] w-full px-0.5">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => onGameClick && onGameClick(game)}
              className="aspect-square bg-[#10131a] overflow-hidden relative cursor-pointer group shadow-xs hover:opacity-95 active:scale-97 transition-all"
            >
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="eager"
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 py-10 text-center text-gray-500 font-medium text-[13px]">
            No games found matching &quot;{searchQuery}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
