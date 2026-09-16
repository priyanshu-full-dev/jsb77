import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CasinoGamesSection({ onGameClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuraPath = location.pathname.toLowerCase().includes('aura');
  const [activeMainCategory, setActiveMainCategory] = useState(
    isAuraPath ? 'aura' : 'live_casino'
  );
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [activeThirdTab, setActiveThirdTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('aura')) {
      setActiveMainCategory('aura');
      setActiveSubCategory('all');
    } else {
      setActiveMainCategory('live_casino');
      if (path.includes('aviator')) {
        setActiveSubCategory('aviator');
      } else if (path.includes('mines')) {
        setActiveSubCategory('mines');
      } else if (path.includes('color-prediction') || path.includes('chicken')) {
        setActiveSubCategory('color_prediction');
      } else {
        setActiveSubCategory('all');
      }
    }
  }, [location.pathname]);

  const mainCategories = [
    { id: 'aura', label: 'Aura', route: '/aura' },
    { id: 'live_casino', label: 'Live Casino', route: '/casino' },
  ];

  // Sub-categories differ based on main category
  const auraSubCategories = [
    { id: 'all', label: 'All' },
    { id: 'roulette', label: 'Roulette' },
    { id: 'teenpatti', label: 'Teenpatti' },
    { id: 'dragontiger', label: 'Dragon Tiger' },
    { id: '7updown', label: '7 Up Down' },
    { id: 'highlow', label: 'High Low' },
    { id: 'andarbahar', label: 'Andar Bahar' },
    { id: 'baccarat', label: 'Baccarat' },
    { id: '32cards', label: '32 Cards' },
  ];

  const liveCasinoSubCategories = [
    { id: 'all', label: 'All' },
    { id: 'aviator', label: 'Aviator' },
    { id: 'color_prediction', label: 'Color Pridiction' },
    { id: 'mines', label: 'Mines' },
    { id: 'roulette', label: 'Roulette' },
    { id: 'teenpatti', label: 'Teenpatti' },
    { id: 'slots', label: 'Slots' },
    { id: 'baccarat', label: 'Baccarat' },
  ];

  const subCategories =
    activeMainCategory === 'aura'
      ? auraSubCategories
      : liveCasinoSubCategories;

  // Games dataset for Aura Gaming (Matching Aura Screenshot)
  const auraGames = [
    {
      id: 'aura_tp_t20',
      title: 'TEEN PATTI T20',
      subtitle: 'AURA GAMING',
      category: ['all', 'teenpatti'],
      image: '/games/aura_teenpatti_t20.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_tp_oneday',
      title: 'TEEN PATTI ONE DAY',
      subtitle: 'AURA GAMING',
      category: ['all', 'teenpatti'],
      image: '/games/aura_teenpatti_oneday.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_dt',
      title: 'DRAGON TIGER',
      subtitle: 'AURA GAMING',
      category: ['all', 'dragontiger'],
      image: '/games/aura_dragontiger.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_7updown',
      title: '7 UP DOWN',
      subtitle: 'AURA GAMING',
      category: ['all', '7updown'],
      image: '/games/aura_7updown.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_highlow',
      title: 'HIGH LOW',
      subtitle: 'AURA GAMING',
      category: ['all', 'highlow'],
      image: '/games/provider_sexy.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_aaa',
      title: 'AMAR AKBAR ANTHONY',
      subtitle: 'AURA GAMING',
      category: ['all', 'teenpatti', 'roulette'],
      image: '/games/teenpatti.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_lucky7',
      title: 'LUCKY 7',
      subtitle: 'AURA GAMING',
      category: ['all', '7updown'],
      image: '/games/provider_ezugi.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_ab',
      title: 'ANDAR BAHAR',
      subtitle: 'AURA GAMING',
      category: ['all', 'andarbahar'],
      image: '/games/provider_vivo.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_32cards',
      title: '32 CARDS',
      subtitle: 'AURA GAMING',
      category: ['all', '32cards'],
      image: '/games/provider_mac88.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_roulette',
      title: 'ROULETTE',
      subtitle: 'AURA GAMING',
      category: ['all', 'roulette'],
      image: '/games/provider_roulette.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_baccarat',
      title: 'BACCARAT',
      subtitle: 'AURA GAMING',
      category: ['all', 'baccarat'],
      image: '/games/baccarat.jpg',
      badge: 'Betslip UI',
    },
    {
      id: 'aura_tapcards',
      title: 'MILLIONAIRE TAPCARDSTM',
      subtitle: 'AURA GAMING',
      category: ['all', 'roulette'],
      image: '/games/millionaire_tapcards.jpg',
      badge: 'Betslip UI',
    },
  ];

  // Games dataset for Live Casino / Crash games (Matching Live Casino Screenshot)
  const liveCasinoGames = [
    {
      id: 'golden_empire',
      title: 'Golden Empire',
      category: ['all', 'slots'],
      image: '/games/golden_empire.jpg',
    },
    {
      id: 'aero_pink',
      title: 'Aero',
      category: ['all', 'aviator'],
      image: '/games/aero_pink.jpg',
    },
    {
      id: 'chicken_route',
      title: 'Chicken Route',
      category: ['all', 'color_prediction', 'mines'],
      image: '/games/chicken_route.jpg',
    },
    {
      id: 'balloon_game',
      title: 'Balloon',
      category: ['all', 'aviator'],
      image: '/games/balloon_game.jpg',
    },
    {
      id: 'aviastar2',
      title: 'AviaStar 2',
      category: ['all', 'aviator'],
      image: '/games/aviastar2.jpg',
    },
    {
      id: 'aero_classic',
      title: 'Aero',
      category: ['all', 'aviator'],
      image: '/games/aero_classic.jpg',
    },
    {
      id: 'avia_rush',
      title: 'Avia Rush',
      category: ['all', 'aviator'],
      image: '/games/avia_rush.jpg',
    },
    {
      id: 'hot_air_balloon',
      title: 'Balloon Journey',
      category: ['all', 'aviator'],
      image: '/games/hot_air_balloon.jpg',
    },
    {
      id: 'millionaire_tapcards',
      title: 'Millionaire Tapcards',
      category: ['all', 'slots', 'baccarat'],
      image: '/games/millionaire_tapcards.jpg',
    },
    {
      id: 'aviator_original',
      title: 'Aviator',
      category: ['all', 'aviator'],
      image: '/games/aviator.jpg',
    },
    {
      id: 'mines_original',
      title: 'Mines',
      category: ['all', 'mines'],
      image: '/games/mines.jpg',
    },
    {
      id: 'chicken_road_original',
      title: 'Chicken Road Cross',
      category: ['all', 'color_prediction'],
      image: '/games/chicken_road.jpg',
    },
  ];

  const currentDataset =
    activeMainCategory === 'aura' ? auraGames : liveCasinoGames;

  const filteredGames = currentDataset.filter((g) => {
    const matchesCategory =
      activeSubCategory === 'all' || g.category.includes(activeSubCategory);
    const matchesSearch = searchQuery
      ? g.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const handleMainCategorySelect = (cat) => {
    setActiveMainCategory(cat.id);
    setActiveSubCategory('all');
    navigate(cat.route);
  };

  return (
    <div className="w-full bg-[#f2f4f7] select-none flex flex-col pt-1.5 pb-6">
      {/* 1. Search Casino Bar */}
      <div className="px-2 mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Casino..."
          className="w-full bg-white border border-[#c4cbd4] rounded-md px-3.5 py-2 text-[14px] text-black placeholder:text-gray-600 focus:outline-none focus:border-[#caa049] transition-colors shadow-2xs"
        />
      </div>

      {/* 2. Main Category Filter Pills (Aura, Live Casino) */}
      <div className="px-2 flex items-center gap-2 mb-2">
        {mainCategories.map((cat) => {
          const isActive = activeMainCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleMainCategorySelect(cat)}
              style={{
                border: '1px solid #b88831',
                background: isActive
                  ? 'transparent linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)'
                  : '#dde2e8',
              }}
              className="px-5 py-1.5 rounded-[8px] font-bold text-[13px] text-black shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 3. Sub Category Filter Pills (All, Roulette, Teenpatti, etc.) */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar px-2 pt-0.5 pb-3">
        {subCategories.map((sub) => {
          const isActive = activeSubCategory === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubCategory(sub.id)}
              style={{
                border: '1px solid #b88831',
                background: isActive
                  ? 'transparent linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)'
                  : '#dde2e8',
              }}
              className="shrink-0 px-4 py-1.5 rounded-[8px] font-bold text-[12.5px] text-black whitespace-nowrap shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* 4. Third Row Tab Bar for Aura (Left Gold "All" Tab + Gray Header Strip) */}
      {activeMainCategory === 'aura' && (
        <div className="w-full flex items-stretch h-[54px] mb-1 bg-[#dde2e8] border-t border-b border-[#c8cbd0]">
          <button
            type="button"
            onClick={() => setActiveThirdTab('all')}
            style={{
              background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
              borderRight: '1px solid #a67c2e',
            }}
            className="w-[92px] h-full flex items-center justify-center font-black text-[14px] text-black cursor-pointer shadow-xs"
          >
            All
          </button>
          <div className="flex-1 bg-[#dde2e8]" />
        </div>
      )}

      {/* 5. 3-Column Games Grid */}
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

              {/* Purple "Betslip UI" Badge for Aura Live Games */}
              {game.badge && (
                <div className="absolute top-1 right-1 z-10">
                  <span className="bg-[#6b21a8] text-white text-[7.5px] sm:text-[8px] font-extrabold px-1.5 py-0.5 rounded-[2px] shadow-xs tracking-tight uppercase leading-none">
                    {game.badge}
                  </span>
                </div>
              )}

              {/* Dark Gradient Overlay & Text Labels for Aura Live Games */}
              {activeMainCategory === 'aura' && (
                <div className="absolute inset-x-0 bottom-0 pt-6 pb-1 px-1 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center justify-end pointer-events-none">
                  <span className="text-white font-black text-[11px] sm:text-[12px] leading-tight text-center tracking-wide uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {game.title}
                  </span>
                  {game.subtitle && (
                    <span className="text-[#e2e8f0] text-[8px] sm:text-[8.5px] font-bold leading-tight uppercase tracking-wider mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {game.subtitle}
                    </span>
                  )}
                </div>
              )}
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
