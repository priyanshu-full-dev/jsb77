import React from 'react';

import { audioService } from '../../services/audioService';
import { useGame } from '../../context/GameContext';

function formatMaskedUser(user, index = 0) {
  if (!user) return `v**${(index % 9) + 1}`;
  if (user.includes('*')) return user;
  const clean = user.replace(/[^a-zA-Z0-9]/g, '');
  const first = clean.charAt(0).toLowerCase() || 'v';
  const last = clean.charAt(clean.length - 1) || '5';
  const starCount = 2 + (Math.abs(clean.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 6);
  return `${first}${'*'.repeat(starCount)}${last}`;
}

function getAvatarSrc(item, index) {
  if (item && item.avatar) {
    if (typeof item.avatar === 'number') {
      const avNum = ((Math.abs(item.avatar - 1) % 37) + 1);
      return `/assets/avatar-images/av-${avNum}.png`;
    }
    if (typeof item.avatar === 'string' && item.avatar.includes('/')) {
      return item.avatar;
    }
  }
  const avNum = ((index % 37) + 1);
  return `/assets/avatar-images/av-${avNum}.png`;
}

function getMultiplierClass(mult) {
  if (!mult) return '';
  const num = Number(mult);
  if (num >= 10.0) return 'text-[#c017b4]'; // pink in user CSS
  if (num >= 2.0) return 'text-[#913ef8]';  // purple in user CSS
  return 'text-[#34b4ff]';                  // blue in user CSS
}

export default function LiveBetsList() {
  const { liveBets, activeTab, setActiveTab, myBetsHistory } = useGame();

  const handleTabChange = (tab) => {
    audioService?.playClick?.();
    setActiveTab(tab);
  };

  const allBetsCount = activeTab === 'all' ? liveBets.length : myBetsHistory.length;

  return (
    <div className="w-full bg-[#1b1c1d] rounded-[20px] border border-[#2a2b2e] overflow-hidden select-none shadow-2xl h-[470px] s412:h-[500px] md:h-[540px] lg:h-[calc(100vh-140px)]">
      <div className="flex flex-col justify-between h-full">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Switcher Tab: All Bets / My Bets */}
          <div className="mb-[5px] mt-[5px]">
            <div className="bg-[#141516] w-[200px] mx-auto h-[24px] flex items-center rounded-[10px] relative">
              <div className="flex items-center">
                {/* Sliding Pill Indicator */}
                <div
                  className="w-[100px] h-[22px] rounded-[10px] absolute all-bet bg-[#2c2d30] transition-transform duration-300"
                  style={{
                    transform: activeTab === 'all' ? 'translateX(0px)' : 'translateX(100px)',
                  }}
                />
                <div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('all')}
                    className={`w-[100px] h-[18px] text-[12px] relative font-extralight tracking-[0.011em] -translate-y-0.5 lg:hover:text-[#d0021b] cursor-pointer transition-colors ${
                      activeTab === 'all' ? 'text-[#ffffff]' : 'text-[#9ea0a3]'
                    }`}
                  >
                    All Bets
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('my')}
                    className={`w-[100px] h-[18px] font-light -translate-y-0.5 text-[12px] tracking-[0.011em] relative lg:hover:text-[#d0021b] cursor-pointer transition-colors ${
                      activeTab === 'my' ? 'text-[#ffffff]' : 'text-[#9ea0a3]'
                    }`}
                  >
                    My Bets
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar: ALL BETS count / Users count */}
          <div className="flex items-center justify-between pb-[4px] px-2.5 -translate-y-[1.5px]">
            <div>
              <div className="leading-[16.8px] translate-y-[0.5px]">
                <span className="text-[#ffffff] text-[14px] tracking-[0.02em] font-light leading-[16.8px]">
                  ALL BETS
                </span>
              </div>
              <div className="leading-[16.8px]">
                <span className="text-[#ffffff] font-extralight text-[14px]">
                  {allBetsCount}
                </span>
              </div>
            </div>
            <div>
              <div className="leading-[16.8px] translate-y-[0.5px]">
                <span className="text-[#ffffff] text-[14px] tracking-[0.02em] font-light leading-[16.8px]">
                  Users
                </span>
              </div>
              <div className="leading-[16.8px] text-end">
                <span className="text-[#ffffff] font-extralight text-[14px]">
                  0
                </span>
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <div className="h-[2px] bg-[#141516]" />

          {/* Column Headers: User | Bet X | Cash out */}
          <div className="flex mx-[10px] h-[20px] items-center font-light">
            <div className="w-[19%] -translate-y-[2px]">
              <span className="text-[11px] text-[#7B7B7B]">User</span>
            </div>
            <div className="flex gap-[10px] lg:w-[36.8%] w-[36%] justify-end translate-x-[0.5px] max-xxm:translate-x-1 xm:translate-x-[3.5px] s390:translate-x-[3.5px] xl:translate-x-0">
              <span className="text-[11px] text-[#7B7B7B]"> Bet</span>
              <span className="text-[11px] text-[#7B7B7B]">X</span>
            </div>
            <div className="flex-1 text-end -translate-y-0.5">
              <span className="text-[11px] text-[#7B7B7B]"> Cash out </span>
            </div>
          </div>

          {/* Scrollable Bets List */}
          <ul
            className="flex px-1 lg:px-0 lg:pl-1 overflow-auto flex-col w-full flex-1 max-h-[360px] s412:max-h-[400px] lg:max-h-[79svh]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeTab === 'all' ? (
              liveBets.map((item, idx) => {
                const isCelebrated = item.cashedOut;
                const multNum = Number(item.multiplier);
                const userName = formatMaskedUser(item.user, idx);
                const avatarSrc = getAvatarSrc(item, idx);
                const cashoutPayout = item.payout || (item.cashedOut && !isNaN(multNum) && multNum > 0
                  ? (Number(item.bet) * multNum).toFixed(2)
                  : null);

                return (
                  <li
                    key={item.id || `bet-${idx}`}
                    className={`grid grid-cols-5 w-full min-h-[34px] justify-center items-center mt-0.5 border border-solid rounded-lg pl-[2.5px] transition-colors ${
                      isCelebrated
                        ? 'border-[#427f00] bg-[#123405] text-white'
                        : 'border-[#101112] bg-[#101112] text-[#bbbfc5]'
                    }`}
                  >
                    {/* User column (col-span-2) */}
                    <div className="col-span-2 flex gap-2 items-center">
                      <div className="w-[30px] h-[30px] rounded-[50%] overflow-hidden shrink-0">
                        <img
                          src={avatarSrc}
                          alt={userName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[13px] text-[#9ea0a3] font-light truncate block">
                          {userName}
                        </span>
                      </div>
                    </div>

                    {/* Bet and Multiplier X column (col-span-2) */}
                    <div className="text-[14px] text-[#bbbfc5] col-span-2 -translate-x-1.5 lg:translate-x-0 flex items-center justify-center gap-1.5">
                      <span>{item.bet}</span>
                      {isCelebrated && !isNaN(multNum) && multNum > 0 && (
                        <span
                          className={`text-[11px] font-bold py-0.5 px-1.5 rounded-[9px] bg-[#00000080] border border-white/10 ${getMultiplierClass(
                            multNum
                          )}`}
                        >
                          {multNum.toFixed(2)}x
                        </span>
                      )}
                    </div>

                    {/* Cash out column (col-span-1) */}
                    <div className="col-span-1 text-end pr-2 text-[13px] font-bold text-white truncate">
                      {isCelebrated && cashoutPayout ? (
                        <span>{cashoutPayout}</span>
                      ) : null}
                    </div>
                  </li>
                );
              })
            ) : (
              myBetsHistory.length === 0 ? (
                <div className="text-center py-12 text-[#666] text-[13px] font-light">
                  No bets placed yet this session
                </div>
              ) : (
                myBetsHistory.map((item, idx) => (
                  <li
                    key={item.id || `my-bet-${idx}`}
                    className={`grid grid-cols-5 w-full min-h-[34px] justify-center items-center mt-0.5 border border-solid rounded-lg pl-[2.5px] transition-colors ${
                      item.status === 'WON'
                        ? 'border-[#427f00] bg-[#123405] text-white'
                        : 'border-[#101112] bg-[#101112] text-[#bbbfc5]'
                    }`}
                  >
                    <div className="col-span-2 flex gap-2 items-center pl-1">
                      <span className="text-[12px] text-[#9ea0a3] font-light">
                        {item.time || 'Round'}
                      </span>
                    </div>
                    <div className="text-[14px] col-span-2 flex items-center justify-center gap-1.5">
                      <span>{item.bet}</span>
                      {item.multiplier && (
                        <span
                          className={`text-[11px] font-bold py-0.5 px-1.5 rounded-[9px] bg-[#00000080] border border-white/10 ${getMultiplierClass(
                            item.multiplier
                          )}`}
                        >
                          {Number(item.multiplier).toFixed(2)}x
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 text-end pr-2 text-[13px] font-bold">
                      {item.status === 'WON' ? (
                        <span className="text-emerald-400">+{item.cashout}</span>
                      ) : (
                        <span className="text-red-400">-{item.bet}</span>
                      )}
                    </div>
                  </li>
                ))
              )
            )}
          </ul>
        </div>

        {/* Footer: Provably Fair & Powered by VIMAAN */}
        <div className="bg-[#000] border border-[#2a2b2e] flex justify-between items-center px-[10px] h-[25px] shrink-0">
          <div className="flex items-center">
            <div className="-translate-y-0.5">
              <span className="text-[#5e6269] font-light text-[11px]">This game is </span>
            </div>
            <div className="ms-[6px] me-[4px]">
              <img
                src="/assets/icon-provabyfair.652dcfd9d89241e2.svg"
                alt="Provably Fair"
                className="w-[14px] h-[16px]"
              />
            </div>
            <div className="lg:mb-[2px] mb-[0px] -translate-y-0.5 lg:-translate-y-[0.5px]">
              <span className="text-[#bbbfc5] tracking-[0.015em] font-light text-[12px]">
                Provably Fair
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mt-[4px] -translate-y-[3px]">
              <span className="text-[#5e6269] tracking-[0.005em] text-[11px]">Powered by</span>
            </div>
            <div className="ms-[4px]">
              <span className="w-[34px] h-[14px] text-[#858788] font-bold underline text-[14px]">
                VIMAAN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
