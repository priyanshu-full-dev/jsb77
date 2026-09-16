import React from 'react';

export default function FeaturedGames({ onGameClick }) {
  // 7 paired columns (Top card + Bottom card) that scroll in parallel together
  const gameColumns = [
    // Column 1: Aviator & Chicken Road Cross
    {
      top: {
        id: 'aviator',
        name: 'Aviator',
        image: '/games/featured_aviator.gif',
        bg: 'bg-[#18072d]',
        border: 'border-purple-400/40',
      },
      bottom: {
        id: 'chicken_road',
        name: 'Chicken Road Cross / Color Prediction',
        image: '/games/featured_chicken_road.gif',
        bg: 'bg-[#061e3d]',
        border: 'border-cyan-400/40',
      },
    },

    // Column 2: Mines & Fun Games
    {
      top: {
        id: 'mines',
        name: 'Mines',
        image: '/games/featured_mines.gif',
        bg: 'bg-[#420a4a]',
        border: 'border-pink-400/40',
      },
      bottom: {
        id: 'fun_games',
        name: 'Fun Games',
        image: '/games/featured_fun_games.gif',
        bg: 'bg-[#051745]',
        border: 'border-blue-400/40',
      },
    },

    // Column 3: Baccaratt & Black Jack
    {
      top: {
        id: 'baccarat',
        name: 'Baccarat',
        image: '/games/featured_baccarat.jpg',
        bg: 'bg-[#0d0d0f]',
        border: 'border-neutral-700/50',
      },
      bottom: {
        id: 'blackjack',
        name: 'Black Jack',
        image: '/games/featured_blackjack.jpg',
        bg: 'bg-[#0a0a0c]',
        border: 'border-neutral-700/50',
      },
    },

    // Column 4: Teenpatti & Roulette
    {
      top: {
        id: 'teenpatti',
        name: 'Teenpatti',
        image: '/games/featured_teenpatti.jpg',
        bg: 'bg-[#1c1c24]',
        border: 'border-amber-500/40',
      },
      bottom: {
        id: 'roulette',
        name: 'Roulette',
        image: '/games/featured_roulette.jpg',
        bg: 'bg-[#1a1410]',
        border: 'border-amber-600/40',
      },
    },

    // Column 5: Vortex & Golden Empire
    {
      top: {
        id: 'vortex',
        name: 'Vortex',
        image: '/games/featured_vortex.jpg',
        bg: 'bg-[#081b33]',
        border: 'border-cyan-500/40',
      },
      bottom: {
        id: 'golden_empire',
        name: 'Golden Empire',
        image: '/games/featured_golden_empire.jpg',
        bg: 'bg-[#2b1d04]',
        border: 'border-yellow-500/40',
      },
    },

    // Column 6: Aero & Chicken Route
    {
      top: {
        id: 'aero',
        name: 'Aero',
        image: '/games/featured_aero.jpg',
        bg: 'bg-[#2c3e50]',
        border: 'border-amber-500/40',
      },
      bottom: {
        id: 'chicken_route',
        name: 'Chicken Route',
        image: '/games/featured_chicken_route.jpg',
        bg: 'bg-[#2c1405]',
        border: 'border-orange-500/40',
      },
    },

    // Column 7: Balloon & Aviastar
    {
      top: {
        id: 'balloon',
        name: 'Balloon',
        image: '/games/featured_balloon.jpg',
        bg: 'bg-[#03045e]',
        border: 'border-blue-400/40',
      },
      bottom: {
        id: 'aviastar',
        name: 'Aviastar',
        image: '/games/featured_aviastar.jpg',
        bg: 'bg-[#050811]',
        border: 'border-slate-500/40',
      },
    },

    // Column 8: Aviatrix & Avia Rush
    {
      top: {
        id: 'aviatrix',
        name: 'Aviatrix',
        image: '/games/featured_aviatrix.jpg',
        bg: 'bg-[#180a2a]',
        border: 'border-purple-500/40',
      },
      bottom: {
        id: 'avia_rush',
        name: 'Avia Rush',
        image: '/games/featured_avia_rush.jpg',
        bg: 'bg-[#100520]',
        border: 'border-pink-500/40',
      },
    },

    // Column 9: Christmas Crash & Balloon Odyssey
    {
      top: {
        id: 'christmas_crash',
        name: 'Christmas Crash',
        image: '/games/featured_christmas_crash.jpg',
        bg: 'bg-[#081e3a]',
        border: 'border-blue-400/40',
      },
      bottom: {
        id: 'balloon_odyssey',
        name: 'Balloon Odyssey Crash',
        image: '/games/featured_balloon_odyssey.jpg',
        bg: 'bg-[#1e2a3a]',
        border: 'border-sky-400/40',
      },
    },

    // Column 10: Millionaire Tapcards & Blazing Cash
    {
      top: {
        id: 'millionaire_tapcards',
        name: 'Millionaire Tapcards',
        image: '/games/featured_millionaire_tapcards.jpg',
        bg: 'bg-[#120826]',
        border: 'border-indigo-500/40',
      },
      bottom: {
        id: 'blazing_cash',
        name: 'Blazing Cash',
        image: '/games/featured_blazing_cash.jpg',
        bg: 'bg-[#2a0505]',
        border: 'border-red-500/40',
      },
    },

    // Column 11: CaShow & CosmoX
    {
      top: {
        id: 'cashow',
        name: 'CaShow',
        image: '/games/featured_cashow.jpg',
        bg: 'bg-[#1a1810]',
        border: 'border-amber-400/40',
      },
      bottom: {
        id: 'cosmox',
        name: 'CosmoX',
        image: '/games/featured_cosmox.jpg',
        bg: 'bg-[#100820]',
        border: 'border-rose-500/40',
      },
    },

    // Column 12: Crash & Crash Cricket
    {
      top: {
        id: 'crash',
        name: 'Crash',
        image: '/games/featured_crash.jpg',
        bg: 'bg-[#081828]',
        border: 'border-amber-400/40',
      },
      bottom: {
        id: 'crash_cricket',
        name: 'Crash Cricket',
        image: '/games/featured_crash_cricket.jpg',
        bg: 'bg-[#0a2818]',
        border: 'border-emerald-500/40',
      },
    },

    // Column 13: Crash Goal & Crash Touchdown
    {
      top: {
        id: 'crash_goal',
        name: 'Crash Goal',
        image: '/games/featured_crash_goal.jpg',
        bg: 'bg-[#082018]',
        border: 'border-teal-400/40',
      },
      bottom: {
        id: 'crash_touchdown',
        name: 'Crash Touchdown',
        image: '/games/featured_crash_touchdown.jpg',
        bg: 'bg-[#280808]',
        border: 'border-orange-500/40',
      },
    },

    // Column 14: CricketX & DoubleX
    {
      top: {
        id: 'cricketx',
        name: 'CricketX',
        image: '/games/featured_cricketx.jpg',
        bg: 'bg-[#081a28]',
        border: 'border-sky-400/40',
      },
      bottom: {
        id: 'doublex',
        name: 'DoubleX',
        image: '/games/featured_doublex.jpg',
        bg: 'bg-[#12141c]',
        border: 'border-slate-500/40',
      },
    },

    // Column 15: FootballX & PlinkoX
    {
      top: {
        id: 'footballx',
        name: 'FootballX',
        image: '/games/featured_footballx.jpg',
        bg: 'bg-[#082414]',
        border: 'border-emerald-400/40',
      },
      bottom: {
        id: 'plinko_x',
        name: 'PlinkoX',
        image: '/games/featured_plinkox.jpg',
        bg: 'bg-[#100824]',
        border: 'border-purple-400/40',
      },
    },
  ];

  return (
    <section className="bg-[#f0f2f5] select-none pb-0.5">
      {/* Unified Parallel Horizontal Scrolling Container */}
      <div className="flex gap-1.5 overflow-x-auto bg-[#fff] custom-scrollbar snap-x cursor-grab active:cursor-grabbing px-0.5 py-0.5 scroll-px-1.5">
        {gameColumns.map((col, idx) => (
          <div key={idx} className="flex flex-col gap-1 shrink-0 snap-start">
            {/* Top Card (Row 1) */}
            <div
              onClick={() => onGameClick(col.top.id)}
              className={`w-[158px] sm:w-[152px] h-[80px] sm:h-[96px] rounded-md overflow-hidden  ${col.top.border} shadow-md cursor-pointer relative hover:brightness-105 active:scale-95 transition-all ${col.top.bg}`}
            >
              {col.top.image ? (
                <img
                  src={col.top.image}
                  alt={col.top.name}
                  className="w-full h-full "
                  loading="eager"
                />
              ) : col.top.renderCustom ? (
                col.top.renderCustom()
              ) : null}
            </div>

            {/* Bottom Card (Row 2) */}
            <div
              onClick={() => onGameClick(col.bottom.id)}
              className={`w-[158px] sm:w-[152px] h-[80px] sm:h-[96px] rounded-md overflow-hidden  ${col.bottom.border} shadow-md cursor-pointer relative hover:brightness-105 active:scale-95 transition-all ${col.bottom.bg}`}
            >
              {col.bottom.image ? (
                <img
                  src={col.bottom.image}
                  alt={col.bottom.name}
                  className="w-full h-full "
                  loading="eager"
                />
              ) : col.bottom.renderCustom ? (
                col.bottom.renderCustom()
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
