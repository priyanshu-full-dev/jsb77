import React from 'react';
import { Star } from 'lucide-react';

// Exact TV Monitor Icon matching reference image
const TvMonitorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-[14px] h-[14px] mr-1 mt-[1px] text-[#1a1a1a] shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Monitor Screen */}
    <rect x="2" y="3" width="20" height="13" rx="1.5" />
    {/* Stand Neck */}
    <line x1="12" y1="16" x2="12" y2="19.5" />
    {/* Stand Base */}
    <line x1="7.5" y1="19.5" x2="16.5" y2="19.5" />
  </svg>
);

export default function InplayOddsTable({
  matches,
  onOddsClick,
  onMatchClick,
  favorites = new Set(),
  onToggleFavorite,
}) {
  const displayMatches = matches || [];

  return (
    <section className="bg-white mt-1.5 select-none shadow-sm ">
      {/* 1. Header Bar with Exact Polygon Clip Path, Height, Border & Typography */}
      <div className="w-full bg-white relative">
        <div
          style={{
            background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
          }}
          className="h-[30px] px-2.5 flex items-center justify-between pr-10"
        >
          {/* Left: Play Icon & INPLAY text */}
          <div className="flex items-center gap-0.5 text-white font-sans font-black text-[13px] uppercase tracking-wide leading-none">
            <svg viewBox="0 0 512 512" className="w-[16px]  h-[16px] fill-white shrink-0" aria-hidden="true">
              <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9l0-176c0-8.7 4.7-16.7 12.3-20.9z" />
            </svg>
            <span className=" tracking-tight leading-none">INPLAY</span>
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
              className="border border-[#9c7128] bg-transparent hover:bg-black/5 active:bg-black/10 text-black  text-[12px] px-2.5 h-[26px] rounded-full cursor-pointer transition-colors leading-none flex items-center justify-center"
            >
              + VIRTUAL
            </button>
          </div>
        </div>
      </div>

      {/* 2. Match Odds List */}
      <div className="p-[5px] flex flex-col gap-0.5">
        {displayMatches && displayMatches.length > 0 ? (
          displayMatches.map((match) => {
            const isFav = favorites?.has ? favorites.has(match.id) : false;
            return (
              <div key={match.id} className="bg-white  pb-0  border-b border-[#e2e8f0]">
                {/* Top Row: Sport Icon + Slanted Gray Badge with Match Name & Date */}
                <div className="flex gap-2 items-center">
                  {/* Sport Icon (e.g. 🎾 Tennis / ⚽ Soccer / 🏏 Cricket) */}
                  <div
                    onClick={() => onMatchClick && onMatchClick(match)}
                    className="w-[16px] flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {match.sport === 'football' || match.sport === 'soccer' || match.icon === '⚽' ? (
                      <span className="text-[17px] leading-none">⚽</span>
                    ) : match.sport === 'cricket' || match.icon === '🏏' ? (
                      <img src="/games/cricket_ball.png" alt="Cricket" className="w-[16px] h-[16px] object-contain shrink-0" />
                    ) : match.sport === 'horse' || match.icon === '🏇' ? (
                      <span className="text-[17px] leading-none">🏇</span>
                    ) : match.sport === 'greyhound' || match.icon === '🐕' ? (
                      <span className="text-[17px] leading-none">🐕</span>
                    ) : match.sport === 'tennis' || match.icon === '🎾' ? (
                      <span className="text-[17px] leading-none">🎾</span>
                    ) : (
                      <span className="text-[17px] leading-none">{match.icon || '🏆'}</span>
                    )}
                  </div>

                  {/* Slanted Gray Header with polygon(0 0, 100% 0, 100% 100%, 5% 100%) */}
                  <div
                    onClick={() => onMatchClick && onMatchClick(match)}
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 5% 100%)',
                    }}
                    className="flex-1 bg-[#dedddd] pl-5 pr-2 pb-2 pt-1.5 flex flex-col justify-center cursor-pointer hover:bg-[#d2d9e0] transition-colors"
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

                {/* Bottom Row: Favorite Star + 6 Colored Odds Boxes (Equal gap between all boxes) */}
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

                  {/* Right: 6 Colored Odds Boxes with completely equal gap */}
                  {(() => {
                    const odds = Array.isArray(match.odds) ? match.odds : ['--', '--', '--', '--', '--', '--'];
                    return (
                      <div className="flex-1 grid grid-cols-6 gap-[4px]">
                        {/* 1. Back 1 */}
                        <button
                          type="button"
                          onClick={() => onOddsClick && onOddsClick(match, odds[0], 'Back 1')}
                          className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#a5d9fe] font-black flex items-center justify-center hover:brightness-95 transition-all"
                        >
                          {odds[0] || '0'}
                        </button>

                        {/* 2. Lay 1 */}
                        <button
                          type="button"
                          onClick={() => onOddsClick && onOddsClick(match, odds[1], 'Lay 1')}
                          className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#f8d0cb] font-black flex items-center justify-center hover:brightness-95 transition-all"
                        >
                          {odds[1] || '0'}
                        </button>

                        {/* 3. Back X */}
                        <button
                          type="button"
                          onClick={() => onOddsClick && onOddsClick(match, odds[2], 'Back X')}
                          className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#a5d9fe] font-black flex items-center justify-center hover:brightness-95 transition-all"
                        >
                          {odds[2] || '0'}
                        </button>

                        {/* 4. Lay X */}
                        <button
                          type="button"
                          onClick={() => onOddsClick && onOddsClick(match, odds[3], 'Lay X')}
                          className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#f8d0cb] font-black flex items-center justify-center hover:brightness-95 transition-all"
                        >
                          {odds[3] || '0'}
                        </button>

                        {/* 5. Back 2 */}
                        <button
                          type="button"
                          onClick={() => onOddsClick && onOddsClick(match, odds[4], 'Back 2')}
                          className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#a5d9fe] font-black flex items-center justify-center hover:brightness-95 transition-all"
                        >
                          {odds[4] || '0'}
                        </button>

                        {/* 6. Lay 2 */}
                        <button
                          type="button"
                          onClick={() => onOddsClick && onOddsClick(match, odds[5], 'Lay 2')}
                          className="w-full text-[14px] text-[#273a47] cursor-pointer h-[25px] rounded-[2px] bg-[#f8d0cb] font-black flex items-center justify-center hover:brightness-95 transition-all"
                        >
                          {odds[5] || '0'}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 px-3 flex items-center justify-center">
            <div className="w-full bg-[#fffbeb] border border-[#fef08a] rounded p-3 flex items-center justify-center gap-2 text-[#854d0e] text-[13px] font-medium shadow-2xs">
              <svg className="w-4 h-4 text-[#eab308] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>No Live In-Play Events Available</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
