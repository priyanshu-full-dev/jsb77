import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CasinoGamesSection({ onGameClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isLiveCasinoPath =
    location.pathname.toLowerCase().includes('livecasino') ||
    location.pathname.toLowerCase().includes('live-casino') ||
    location.pathname.toLowerCase().includes('crash');
  const [activeMainCategory, setActiveMainCategory] = useState(
    isLiveCasinoPath ? 'live_casino' : 'aura'
  );
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [activeThirdTab, setActiveThirdTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('aviator') || path.includes('avater') || path.includes('avtar')) {
      setActiveMainCategory('live_casino');
      setActiveSubCategory('aviator');
    } else if (path.includes('mines')) {
      setActiveMainCategory('live_casino');
      setActiveSubCategory('mines');
    } else if (path.includes('color-prediction') || path.includes('chicken')) {
      setActiveMainCategory('live_casino');
      setActiveSubCategory('color_prediction');
    } else if (path.includes('livecasino') || path.includes('live-casino') || path.includes('crash')) {
      setActiveMainCategory('live_casino');
      setActiveSubCategory('all');
    } else if (path.includes('aura')) {
      setActiveMainCategory('aura');
      setActiveSubCategory('all');
    } else {
      setActiveMainCategory('aura');
      setActiveSubCategory('all');
    }
  }, [location.pathname]);

  const mainCategories = [
    { id: 'aura', label: 'Aura' },
    { id: 'live_casino', label: 'Live Casino' },
  ];

  // Sub-categories differ based on main category
  const auraSubCategories = [
    { id: 'all', label: 'All', isAll: true },
    { id: 'roulette', label: 'Roulette' },
    { id: 'teenpatti', label: 'Teenpatti' },
    { id: 'poker', label: 'Poker' },
    { id: 'baccarat', label: 'Baccarat' },
    { id: 'dragontiger', label: 'Dragon Tiger' },
    { id: '32cards', label: '32 Cards' },
    { id: 'andarbahar', label: 'Andar Bahar' },
    { id: 'lucky7', label: 'Lucky 7' },
    { id: 'casinowar', label: 'Casino War' },
    { id: 'worli', label: 'Worli' },
    { id: 'bollywood', label: 'Bollywood' },
    { id: 'queen', label: 'Queen' },
    { id: 'race', label: 'Race' },
    { id: 'others', label: 'Others' },
  ];

  const liveCasinoSubCategories = [
    { id: 'all', label: 'All', isAll: true },
    { id: 'aviator', label: 'Aviator' },
    { id: 'color_prediction', label: 'Color Pridiction' },
    { id: 'mines', label: 'Mines' },
    { id: 'fun_games', label: 'Fun Games' },
    { id: 'mac88', label: 'MAC88' },
    { id: 'rg', label: 'RG' },
    { id: 'ezugi', label: 'EZUGI' },
    { id: 'jacktop', label: 'JACKTOP' },
    { id: 'dc', label: 'DC' },
    { id: 'betcore', label: 'BETCORE' },
    { id: 'creed', label: 'CREED' },
    { id: 'awc', label: 'AWC' },
    { id: 'kingmidas', label: 'KINGMIDAS' },
    { id: 'betgames', label: 'BETGAMES' },
    { id: 'sun0', label: 'SUN0' },
    { id: 'crash88', label: 'CRASH88' },
    { id: 'sap', label: 'SAP' },
    { id: 'turb0', label: 'TURB0' },
    { id: 'jili', label: 'JiLi' },
    { id: 'drgs', label: 'DRGS' },
    { id: 'macaw', label: 'MACAW' },
    { id: 'marbles', label: 'MARBLES' },
    { id: 'spribe', label: 'SPRIBE' },
    { id: 'rich88', label: 'RICH88' },
  ];

  const subCategories =
    activeMainCategory === 'aura'
      ? auraSubCategories
      : liveCasinoSubCategories;

  // Games dataset for Aura Gaming (Matching Aura Screenshots using /games/casino/aura/ images)
  const auraGames = [
    // --- Live Dealer Games ---
    {
      id: 'aura_tp_t20',
      title: 'TEEN PATTI T20',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/teenpatti_t20.jpg',
    },
    {
      id: 'aura_tp_oneday',
      title: 'TEEN PATTI ONE DAY',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/teenpatti_1_day.jpg',
    },
    {
      id: 'aura_dt',
      title: 'DRAGON TIGER',
      category: ['all', 'dragontiger'],
      image: '/games/casino/aura/dragon_tiger.jpg',
    },
    {
      id: 'aura_7updown',
      title: '7 UP DOWN',
      category: ['all', 'lucky7', 'others'],
      image: '/games/casino/aura/7_up_down.jpg',
    },
    {
      id: 'aura_highlow',
      title: 'HIGH LOW',
      category: ['all', 'others'],
      image: '/games/casino/aura/hi_low.jpg',
    },
    {
      id: 'aura_aaa',
      title: 'AMAR AKBAR ANTHONY',
      category: ['all', 'teenpatti', 'roulette', 'others'],
      image: '/games/casino/aura/amar_akbar_anthony.jpg',
    },
    {
      id: 'aura_ab',
      title: 'ANDAR BAHAR',
      category: ['all', 'andarbahar'],
      image: '/games/casino/aura/andar_bahar.jpg',
    },
    {
      id: 'aura_2card_tp',
      title: '2 CARD TEENPATTI',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/2_card_teenpatti.jpg',
    },
    {
      id: 'aura_muflis_tp',
      title: 'MUFLIS TEENPATTI',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/muflis_teenpatti.jpg',
    },
    {
      id: 'aura_tp_test',
      title: 'TEENPATTI TEST',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/teenpatti_open.jpg',
    },
    {
      id: 'aura_3card_judgement',
      title: '3 CARD JUDGEMENT',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/3_cards_judgement.jpg',
    },
    {
      id: 'aura_roulette',
      title: 'ROULETTE',
      category: ['all', 'roulette'],
      image: '/games/casino/aura/roulette.jpg',
    },
    {
      id: 'aura_29card_baccarat',
      title: '29 CARD BACCARAT',
      category: ['all', 'baccarat'],
      image: '/games/casino/aura/29_card_baccarat.jpg',
    },
    {
      id: 'aura_baccarat',
      title: 'BACCARAT',
      category: ['all', 'baccarat'],
      image: '/games/casino/aura/baccarat.jpg',
    },
    {
      id: 'aura_poker_2020',
      title: 'POKER 20-20',
      category: ['all', 'poker'],
      image: '/games/casino/aura/poker_2020.jpg',
    },
    {
      id: 'aura_queen_race',
      title: 'QUEEN RACE',
      category: ['all', 'queen', 'race'],
      image: '/games/casino/aura/queen_race.jpg',
    },
    {
      id: 'aura_bollywood_casino',
      title: 'BOLLYWOOD CASINO',
      category: ['all', 'bollywood'],
      image: '/games/casino/aura/bollywood_casino.jpg',
    },
    {
      id: 'aura_race_to_17',
      title: 'RACE TO 17',
      category: ['all', 'race', 'queen'],
      image: '/games/casino/aura/race_to_17.jpg',
    },
    {
      id: 'aura_sicbo',
      title: 'SICBO',
      category: ['all', 'others'],
      image: '/games/casino/aura/sicbo.jpg',
    },
    {
      id: 'aura_matka',
      title: 'MATKA',
      category: ['all', 'worli'],
      image: '/games/casino/aura/matka.jpg',
    },
    {
      id: 'aura_32card_casino',
      title: '32 CARD CASINO',
      category: ['all', '32cards'],
      image: '/games/casino/aura/32_cards_casino.jpg',
    },
    {
      id: 'aura_super_over',
      title: 'SUPER OVER',
      category: ['all', 'others'],
      image: '/games/casino/aura/super_over.jpg',
    },
    {
      id: 'aura_poker',
      title: 'POKER',
      category: ['all', 'poker'],
      image: '/games/casino/aura/poker.jpg',
    },

    // --- Virtual Games (VR) ---
    {
      id: 'aura_tp_vr',
      title: 'TEEN PATTI VR',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/teenpatti_t20_vr.jpg',
    },
    {
      id: 'aura_tp_oneday_vr',
      title: 'TEEN PATTI ONE DAY VR',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/teenpatti_1_day_vr.jpg',
    },
    {
      id: 'aura_7updown_vr',
      title: '7 UP DOWN VR',
      category: ['all', 'lucky7', 'others'],
      image: '/games/casino/aura/7_up_down_vr.jpg',
    },
    {
      id: 'aura_dt_vr',
      title: 'DRAGON TIGER VR',
      category: ['all', 'dragontiger'],
      image: '/games/casino/aura/dragon_tiger_vr.jpg',
    },
    {
      id: 'aura_hi_low_vr',
      title: 'HI LOW VR',
      category: ['all', 'others'],
      image: '/games/casino/aura/hi_low_vr.jpg',
    },
    {
      id: 'aura_muflis_tp_vr',
      title: 'MUFLIS TEEN PATTI VR',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/muflis_teenpatti_vr.jpg',
    },
    {
      id: 'aura_aaa_vr',
      title: 'AMAR AKBAR ANTHONY VR',
      category: ['all', 'teenpatti', 'roulette', 'others'],
      image: '/games/casino/aura/amar_akbar_anthony_vr.jpg',
    },
    {
      id: 'aura_ab_vr',
      title: 'ANDAR BAHAR VR',
      category: ['all', 'andarbahar'],
      image: '/games/casino/aura/andar_bahar_vr.jpg',
    },
    {
      id: 'aura_poker_vr',
      title: 'POKER VR',
      category: ['all', 'poker'],
      image: '/games/casino/aura/poker_vr.jpg',
    },
    {
      id: 'aura_matka_vr',
      title: 'MATKA VR',
      category: ['all', 'worli'],
      image: '/games/casino/aura/matka_vr.jpg',
    },
    {
      id: 'aura_32card_casino_vr',
      title: '32 CARD CASINO VR',
      category: ['all', '32cards'],
      image: '/games/casino/aura/32_card_casino_vr.jpg',
    },
    {
      id: 'aura_bollywood_casino_vr',
      title: 'BOLLYWOOD CASINO VR',
      category: ['all', 'bollywood'],
      image: '/games/casino/aura/bollywood_casino_vr.jpg',
    },
    {
      id: 'aura_race_2020_vr',
      title: 'RACE 20-20 VR',
      category: ['all', 'casinowar', 'race', 'queen'],
      image: '/games/casino/aura/race_2020_vr.jpg',
    },
    {
      id: 'aura_baccarat_vr',
      title: 'BACCARAT VR',
      category: ['all', 'baccarat'],
      image: '/games/casino/aura/baccarat_vr.jpg',
    },
    {
      id: 'aura_queen_race_vr',
      title: 'QUEEN RACE VR',
      category: ['all', 'queen', 'race'],
      image: '/games/casino/aura/queen_race_vr.jpg',
    },
    {
      id: 'aura_tp_open_vr',
      title: 'TEEN PATTI OPEN VR',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/teenpatti_open_vr.jpg',
    },
    {
      id: 'aura_poker_2020_vr',
      title: 'POKER 20-20 VR',
      category: ['all', 'poker'],
      image: '/games/casino/aura/poker_2020_vr.jpg',
    },

    // --- Aura Originals / Instant Games ---
    {
      id: 'aura_blastoff',
      title: 'BLASTOFF',
      category: ['all', 'others'],
      image: '/games/casino/aura/blastoff.jpg',
    },
    {
      id: 'aura_aviator',
      title: 'AVIATOR',
      category: ['all', 'others'],
      image: '/games/casino/aura/aviator.jpg',
    },
    {
      id: 'aura_spin_wheel',
      title: 'SPIN WHEEL',
      category: ['all', 'others'],
      image: '/games/casino/aura/spin_wheel.jpg',
    },
    {
      id: 'aura_coin_toss',
      title: 'COIN TOSS',
      category: ['all', 'others'],
      image: '/games/casino/aura/coin_toss.jpg',
    },
    {
      id: 'aura_limbo',
      title: 'LIMBO',
      category: ['all', 'others'],
      image: '/games/casino/aura/limbo.jpg',
    },
    {
      id: 'aura_slot_game',
      title: 'SLOT GAME',
      category: ['all', 'others'],
      image: '/games/casino/aura/slot_game.jpg',
    },
    {
      id: 'aura_rock_paper_scissor',
      title: 'ROCK PAPER SCISSOR',
      category: ['all', 'others'],
      image: '/games/casino/aura/rock_paper_scissors.jpg',
    },
    {
      id: 'aura_double',
      title: 'DOUBLE',
      category: ['all', 'others'],
      image: '/games/casino/aura/double.jpg',
    },
    {
      id: 'aura_cricket',
      title: 'CRICKET',
      category: ['all', 'others'],
      image: '/games/casino/aura/cricket.jpg',
    },
    {
      id: 'aura_classic_dice',
      title: 'CLASSIC DICE',
      category: ['all', 'others'],
      image: '/games/casino/aura/classic_dice.jpg',
    },
    {
      id: 'aura_crash',
      title: 'CRASH',
      category: ['all', 'others'],
      image: '/games/casino/aura/crash.jpg',
    },
    {
      id: 'aura_mines',
      title: 'MINES',
      category: ['all', 'others'],
      image: '/games/casino/aura/mines.jpg',
    },
    {
      id: 'aura_sugar_ride',
      title: 'SUGAR RIDE',
      category: ['all', 'others'],
      image: '/games/casino/aura/sugar_ride.jpg',
    },
    {
      id: 'aura_button_burst',
      title: 'BUTTON BURST',
      category: ['all', 'others'],
      image: '/games/casino/aura/button_burst.jpg',
    },

    // --- Fast Series & Other ---
    {
      id: 'aura_tp_t20_fast',
      title: 'TEENPATTI T20 Fast',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/teenpatti_t20_fast.jpg',
    },
    {
      id: 'aura_7updown_fast',
      title: '7 UP DOWN Fast',
      category: ['all', 'lucky7', 'others'],
      image: '/games/casino/aura/7_up_down_fast.jpg',
    },
    {
      id: 'aura_2card_tp_fast',
      title: '2 CARD TEENPATTI Fast',
      category: ['all', 'teenpatti'],
      image: '/games/casino/aura/2_card_teenpatti_fast.jpg',
    },
    {
      id: 'aura_dt_fast',
      title: 'DRAGON TIGER Fast',
      category: ['all', 'dragontiger'],
      image: '/games/casino/aura/dragon_tiger_fast.jpg',
    },
    {
      id: 'aura_ball_by_ball',
      title: 'BALL BY BALL',
      category: ['all', 'others'],
      image: '/games/casino/aura/ball_by_ball.jpg',
    },
    {
      id: 'aura_aviator_alt',
      title: 'Aviator',
      category: ['all', 'others'],
      image: '/games/casino/aura/aviator (1).jpg',
    },
  ];

  // Games dataset for Live Casino / Crash games (Matching /casino/aviator Screenshot)
  const liveCasinoGames = [
    {
      id: 'aviator_original',
      title: 'Aviator',
      category: ['all', 'aviator'],
      image: '/games/casino/download (12).png',
    },
    {
      id: 'featured_aviastar',
      title: 'AviaStar',
      category: ['all', 'aviator'],
      image: '/games/featured_aviastar.jpg',
    },
    {
      id: 'jetx',
      title: 'JetX',
      category: ['all', 'aviator'],
      image: '/games/casino/download (5).png',
    },
    {
      id: 'pilot',
      title: 'PILOT',
      category: ['all', 'aviator'],
      image: '/games/casino/download (6).png',
    },
    {
      id: 'astronaut',
      title: 'ASTRONAUT',
      category: ['all', 'aviator'],
      image: '/games/casino/download (7).png',
    },
    {
      id: 'aero_pink',
      title: 'Aero',
      category: ['all', 'aviator'],
      image: '/games/casino/download (8).png',
    },
    {
      id: 'aero_upg',
      title: 'Aero',
      category: ['all', 'aviator'],
      image: '/games/casino/download (9).png',
    },
    {
      id: 'lightspeed_1000x',
      title: 'Light Speed 1000X',
      category: ['all', 'aviator'],
      image: '/games/casino/download (10).png',
    },
    {
      id: 'avia_rush',
      title: 'Avia Rush',
      category: ['all', 'aviator'],
      image: '/games/casino/download (11).png',
    },
    {
      id: 'balloon_game',
      title: 'Balloon',
      category: ['all', 'aviator'],
      image: '/games/balloon.png',
    },
    {
      id: 'mines_game',
      title: 'Mines',
      category: ['all', 'mines'],
      image: '/games/mines.png',
    },
    {
      id: 'color_wiz',
      title: 'Color Prediction',
      category: ['all', 'color_prediction'],
      image: '/games/color_prediction.png',
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
    if (cat.id === 'live_casino') {
      navigate('/casino/aviator');
    } else {
      navigate('/casino');
    }
  };

  const handleSubCategorySelect = (subId) => {
    setActiveSubCategory(subId);
    if (activeMainCategory === 'live_casino') {
      if (subId === 'aviator') {
        navigate('/casino/aviator');
      } else if (subId === 'color_prediction') {
        navigate('/casino/color-prediction');
      } else if (subId === 'mines') {
        navigate('/casino/mines');
      } else {
        navigate('/casino');
      }
    }
  };

  return (
    <div className="w-full bg-[#f2f4f7] select-none flex flex-col pt-2 pb-6">
      {/* 1. Search Casino Bar */}
      <div className="px-3 mb-1.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Casino..."
          className="px-2 py-2 text-black outline-none w-full text-sm text-start border border-[#ced4da] rounded-md placeholder-gray-800 bg-white"
        />
      </div>

      {/* 2. Main Category Filter Pills (Aura, Live Casino) */}
      <div className="px-1 flex items-center bg-[#d3d3d3] mb-[1px] gap-2 py-1">
        {mainCategories.map((cat) => {
          const isActive = activeMainCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleMainCategorySelect(cat)}
              style={{
                background: isActive
                  ? 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)'
                  : '#d3d3d3',
              }}
              className="px-4 py-1 whitespace-nowrap shadow-sm shadow-[#b7862f] border-2 border-[#b7862f] rounded-lg font-bold text-[13px] text-black transition-colors duration-150 hover:bg-[#e1e1e1] active:scale-95 cursor-pointer"
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 3. Sub Category Filter Pills (All, Roulette, Teenpatti, Poker, etc.) */}
      <div className="flex overflow-x-auto gap-1 py-1 md:h-[55px] bg-[#d3d3d3] custom-scrollbar">
        {subCategories.map((sub) => {
          const isActive = activeSubCategory === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => handleSubCategorySelect(sub.id)}
              style={{
                background: isActive
                  ? 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)'
                  : '#d3d3d3',
              }}
              className={`shrink-0 ${
                activeMainCategory === 'aura'
                  ? 'px-10 ml-1'
                  : sub.isAll
                  ? 'px-10 ml-1'
                  : 'px-4'
              } ${
                activeMainCategory === 'aura' ? '' : 'py-1'
              } whitespace-nowrap shadow-sm shadow-[#b7862f] border-2 border-[#b7862f] rounded-lg font-semibold text-[13px] text-black transition-colors duration-150 hover:bg-[#e1e1e1] active:scale-95 cursor-pointer`}
            >
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* 4. Third Row Tab Bar for Aura (Left Gold "All" Tab + Gray Header Strip) */}
      {activeMainCategory === 'aura' && (
        <div className="flex flex-nowrap overflow-x-auto overflow-y-hidden whitespace-nowrap bg-[#dedddd] border border-[#b88831] pl-0 mb-0 list-none">
          <button
            type="button"
            onClick={() => setActiveThirdTab('all')}
            className="bg-gradient-gold font-semibold grid place-items-center w-[85px] h-[60px] break-words whitespace-normal leading-[12px] rounded-none text-center text-[12px] font-bold p-[5px] text-black border-r border-[#b88831] capitalize cursor-pointer shadow-xs"
          >
            All
          </button>
          <div className="flex-1 bg-[#dedddd]" />
        </div>
      )}

      {/* 5. 3-Column Games Grid */}
      <div className="grid grid-cols-3 gap-[2px] pt-0.5 w-full">
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

              {/* Badges if present */}
              {game.badge && (
                <div className="absolute top-1 right-1 z-10">
                  <span className="bg-[#6b21a8] text-white text-[7.5px] sm:text-[8px] font-extrabold px-1.5 py-0.5 rounded-[2px] shadow-xs tracking-tight uppercase leading-none">
                    {game.badge}
                  </span>
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
