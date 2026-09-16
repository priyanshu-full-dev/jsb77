import React from 'react';
import { Star } from 'lucide-react';

// Exact TV Monitor Icon matching reference image
const TvMonitorIcon = () => (
  <svg
    viewBox="0 0 640 512"
    className="w-[14px] h-[14px] mr-1 mt-[1px] text-[#1a1a1a] shrink-0"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M592 0H48A48 48 0 0 0 0 48v320a48 48 0 0 0 48 48h240v32H112a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H352v-32h240a48 48 0 0 0 48-48V48a48 48 0 0 0-48-48zm-16 352H64V64h512z" />
  </svg>
);

// Red Cricket Ball Icon matching reference image
const CricketBallIcon = () => (
  <img
    src="/games/cricket_ball.png"
    alt="Cricket"
    className="w-[16px] h-[16px] object-contain shrink-0"
  />
);

export default function CricketSection({
  matches,
  onOddsClick,
  onMatchClick,
  favorites = new Set(),
  onToggleFavorite,
  searchQuery = '',
}) {
  // Top horizontal scrolling match highlight banners matching reference
  const topMatchHighlights = [
    {
      id: 'h1',
      title: 'Hong Kong W v Pakistan W',
      bgColor: 'bg-[#800000]',
    },
    {
      id: 'h2',
      title: 'United Arab Emirates W v Bangladesh W',
      bgColor: 'bg-[#065f46]',
    },
    {
      id: 'h3',
      title: 'England v Pakistan',
      bgColor: 'bg-[#1e3a8a]',
    },
    {
      id: 'h4',
      title: 'Dublin Guardians v Belfast Wolves',
      bgColor: 'bg-[#78350f]',
    },
  ];

  // Cricket fixtures dataset matching exact screenshot
  const defaultCricketMatches = [
    {
      id: 'surrey_w_v_somerset_w',
      sport: 'cricket',
      title: 'Surrey W v Somerset W',
      time: '12/09/2026, 15:30',
      live: true,
      odds: ['3.5', '5.7', '0', '0', '1.21', '1.4'],
      hasTv: true,
      hasF: true,
      hasBm: true,
    },
    {
      id: 'crick_namibia_v_sa',
      sport: 'cricket',
      title: 'Namibia v South Africa',
      time: '11/09/2026, 13:00',
      live: true,
      odds: ['7.6', '7.8', '0', '0', '1.15', '1.16'],
      hasTv: true,
      hasF: true,
      hasBm: true,
    },
    {
      id: 'crick_1',
      sport: 'cricket',
      title: 'Hong Kong W v Pakistan W',
      time: '07/09/2026, 21:00',
      live: false,
      odds: ['--', '--', '0', '0', '--', '--'],
      hasTv: true,
      hasF: true,
      hasBm: true,
    },
    {
      id: 'crick_2',
      sport: 'cricket',
      title: 'United Arab Emirates W v Bangladesh W',
      time: '08/09/2026, 20:00',
      live: false,
      odds: ['--', '--', '0', '0', '--', '--'],
      hasTv: false,
      hasF: false,
      hasBm: true,
    },
    {
      id: 'crick_3',
      sport: 'cricket',
      title: 'England v Pakistan',
      time: '09/09/2026, 15:30',
      live: false,
      odds: ['--', '--', '--', '--', '--', '--'],
      hasTv: false,
      hasF: true,
      hasBm: true,
    },
    {
      id: 'crick_4',
      sport: 'cricket',
      title: 'Dublin Guardians v Belfast Wolves',
      time: '09/09/2026, 18:45',
      live: false,
      odds: ['--', '--', '0', '0', '--', '--'],
      hasTv: false,
      hasF: false,
      hasBm: true,
    },
    {
      id: 'crick_5',
      sport: 'cricket',
      title: 'Rotterdam Dockers v Glasgow Cosmic',
      time: '10/09/2026, 15:00',
      live: false,
      odds: ['--', '--', '0', '0', '--', '--'],
      hasTv: false,
      hasF: false,
      hasBm: false,
    },
    {
      id: 'crick_6',
      sport: 'cricket',
      title: 'Trivandrum Royals v Thrissur Titans',
      time: '07/09/2026, 14:30',
      live: false,
      odds: ['1.8', '1.81', '0', '0', '2.22', '2.26'],
      hasTv: true,
      hasF: true,
      hasBm: true,
    },
    {
      id: 'crick_7',
      sport: 'cricket',
      title: 'Meerut Mavericks v Noida Super Kings',
      time: '08/09/2026, 19:30',
      live: false,
      odds: ['1.42', '2.08', '0', '0', '1.93', '3.4'],
      hasTv: true,
      hasF: false,
      hasBm: true,
    },
  ];

  const rawMatches = matches && matches.length > 0 ? matches : defaultCricketMatches;
  const cricketMatches = searchQuery
    ? rawMatches.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : rawMatches;

  return (
    <section className="bg-white select-none shadow-sm flex flex-col">
      {/* 1. Slanted Golden Header Bar ("▶ CRICKET") */}
      <div className="w-full bg-white relative">
        <div
          style={{
            background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
          }}
          className="h-[30px] px-2.5 flex items-center justify-between pr-10"
        >
          {/* Left: Play Icon & CRICKET text */}
          <div className="flex items-center gap-0.5 text-white font-sans font-black text-[13px] uppercase tracking-wide leading-none">
            <svg viewBox="0 0 512 512" className="w-[16px] h-[16px] fill-white shrink-0" aria-hidden="true">
              <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9l0-176c0-8.7 4.7-16.7 12.3-20.9z" />
            </svg>
            <span className="tracking-tight leading-none">CRICKET</span>
          </div>

          {/* Right: + LIVE and + VIRTUAL Pill Buttons */}
          <div className="flex items-center mr-[25px] gap-0.5">
            <button
              type="button"
              className="border border-[#9c7128] bg-transparent hover:bg-black/5 active:bg-black/10 text-black text-[12px] px-2.5 h-[26px] rounded-full cursor-pointer transition-colors leading-none flex items-center justify-center"
            >
              + LIVE
            </button>
            <button
              type="button"
              className="border border-[#9c7128] bg-transparent hover:bg-black/5 active:bg-black/10 text-black text-[12px] px-2.5 h-[26px] rounded-full cursor-pointer transition-colors leading-none flex items-center justify-center"
            >
              + VIRTUAL
            </button>
          </div>
        </div>
      </div>

      {/* 2. Cricket Fixtures List */}
      <div className="p-[5px] flex flex-col gap-0.5">
        {cricketMatches.map((match) => {
          const isFav = favorites?.has ? favorites.has(match.id) : false;
          return (
            <div key={match.id} className="bg-white pb-0 border-b border-[#e2e8f0]">
              {/* Top Row: Red Cricket Ball + Slanted Gray Badge with Match Name & Date */}
              <div className="flex gap-2 items-center">
                {/* Red Cricket Ball Icon */}
                <div className="w-[16px] flex items-center justify-center shrink-0">
                  <CricketBallIcon />
                </div>

                {/* Slanted Gray Header with polygon(0 0, 100% 0, 100% 100%, 5% 100%) */}
                <div
                  onClick={() => onMatchClick && onMatchClick(match)}
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 5% 100%)',
                  }}
                  className="flex-1 bg-[#dedddd] pl-5 pr-2 pb-2 pt-1.5 flex flex-col justify-center cursor-pointer hover:brightness-95 transition-all"
                >
                  {/* Row 1: Match Title & Live Dot */}
                  <div className="flex items-center gap-1 font-bold text-[11px] text-black leading-tight truncate">
                    <span className="truncate">{match.title}</span>
                    {match.live && (
                      <span className="w-2 h-2 rounded-full animate-live-dot bg-[#008000] shrink-0 inline-block" />
                    )}
                  </div>

                  {/* Row 2: Date/Time on left & TV / F / BM badges on right (exact DOM structure) */}
                  <div className="flex items-center justify-between">
                    <div className="text-[9.6px] text-[#0e6438] font-extrabold ml-2 leading-tight">
                      {match.time}
                    </div>

                    {/* Exact TV Monitor Icon & Badges */}
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {match.hasTv && <TvMonitorIcon />}
                      {match.hasF && (
                        <span className="w-[18px] h-[18px] rounded-full bg-[#b88622] text-white text-[10px] font-bold flex items-center justify-center shadow-2xs leading-none shrink-0">
                          F
                        </span>
                      )}
                      {match.hasBm && (
                        <span className="w-[18px] h-[18px] rounded-full bg-[#b88622] text-white text-[8.5px] font-black flex items-center justify-center shadow-2xs leading-none tracking-tighter shrink-0">
                          BM
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Favorite Star + 6 Colored Odds Boxes with equal 4px gap */}
              <div className="flex items-center pt-[5px] gap-2 pb-0.5">
                {/* Left: Star Favorite Toggle Button */}
                <button
                  type="button"
                  onClick={() => onToggleFavorite && onToggleFavorite(match)}
                  className="w-[16.5px] flex items-center justify-center shrink-0 cursor-pointer p-0 hover:scale-110 active:scale-95 transition-transform"
                  title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                  aria-label={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                >
                  <img
                    src={isFav ? '/games/download (1) copy.svg' : '/games/download copy.svg'}
                    alt="Favorite"
                    className="w-[17px] h-[17px] object-contain"
                  />
                </button>

                {/* Right: 6 Colored Odds Boxes with exact gap and styling */}
                <div className="flex-1 grid grid-cols-6 gap-[4px]">
                  {/* 1. Back 1 */}
                  <button
                    type="button"
                    onClick={() => onOddsClick && onOddsClick(match, match.odds[0], 'Back 1')}
                    className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#a5d9fe] font-black flex items-center justify-center hover:brightness-95 transition-all"
                  >
                    {match.odds[0] || '--'}
                  </button>

                  {/* 2. Lay 1 */}
                  <button
                    type="button"
                    onClick={() => onOddsClick && onOddsClick(match, match.odds[1], 'Lay 1')}
                    className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#f8d0cb] font-black flex items-center justify-center hover:brightness-95 transition-all"
                  >
                    {match.odds[1] || '--'}
                  </button>

                  {/* 3. Back X */}
                  <button
                    type="button"
                    onClick={() => onOddsClick && onOddsClick(match, match.odds[2], 'Back X')}
                    className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#a5d9fe] font-black flex items-center justify-center hover:brightness-95 transition-all"
                  >
                    {match.odds[2] || '--'}
                  </button>

                  {/* 4. Lay X */}
                  <button
                    type="button"
                    onClick={() => onOddsClick && onOddsClick(match, match.odds[3], 'Lay X')}
                    className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#f8d0cb] font-black flex items-center justify-center hover:brightness-95 transition-all"
                  >
                    {match.odds[3] || '--'}
                  </button>

                  {/* 5. Back 2 */}
                  <button
                    type="button"
                    onClick={() => onOddsClick && onOddsClick(match, match.odds[4], 'Back 2')}
                    className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#a5d9fe] font-black flex items-center justify-center hover:brightness-95 transition-all"
                  >
                    {match.odds[4] || '--'}
                  </button>

                  {/* 6. Lay 2 */}
                  <button
                    type="button"
                    onClick={() => onOddsClick && onOddsClick(match, match.odds[5], 'Lay 2')}
                    className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#f8d0cb] font-black flex items-center justify-center hover:brightness-95 transition-all"
                  >
                    {match.odds[5] || '--'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
