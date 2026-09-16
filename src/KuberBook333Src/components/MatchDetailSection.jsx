import React, { useState, useMemo, useEffect } from 'react';

// User uploaded Filter Funnel Icon (/games/download (2).webp)
const FilterFunnelIcon = ({ className = ' h-[13px]' }) => (
  <img
    src="/games/download (2).webp"
    alt="Filter"
    className={`${className} object-contain shrink-0`}
  />
);

// User uploaded Trend/Chart Icon (/games/download (2).png)
const TrendChartIcon = ({ className = ' h-[13px]' }) => (
  <img
    src="/games/download (2).png"
    alt="Stats"
    className={`${className} object-contain shrink-0 brightness-0`}
  />
);

// User uploaded TV Icon (/games/tv-icon copy.svg)
const TvMonitorIcon = ({ className = ' h-[13px]' }) => (
  <img
    src="/games/tv-icon copy.svg"
    alt="Live TV"
    className={`${className} object-contain shrink-0 brightness-0`}
  />
);

// User uploaded Fav Star Icons (/games/download copy.svg & /games/download (1) copy.svg)
const CustomStar = ({ filled, onClick, className = 'w-[17px] h-[17px]' }) => (
  <img
    src={filled ? '/games/download (1) copy.svg' : '/games/download copy.svg'}
    alt={filled ? 'Favorite' : 'Add to Favorites'}
    onClick={onClick}
    className={`${className} shrink-0 cursor-pointer object-contain select-none transition-transform active:scale-90`}
  />
);

// Green Checkmark Icon for Fancy Markets
const GreenCheckmark = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-[14px] h-[14px] text-emerald-600 stroke-current stroke-[2.5] fill-none shrink-0"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Suspended Overlay Box spanning Back and Lay / No and Yes columns matching exact reference UI
const SuspendedBox = ({ text = 'SUSPENDED', height = 'h-[45px]', width = 'w-[154.26px]' }) => (
  <div className={`${width} ${height} rounded-[3px] border border-[#bcc5cb] relative flex items-center justify-center overflow-hidden shadow-xs cursor-not-allowed select-none shrink-0`}>
    {/* Split background tint (Muted Slate-gray on left, Lighter Slate-gray on right) */}
    <div className="absolute inset-0 grid grid-cols-2 gap-[2px] pointer-events-none">
      <div className="bg-[#b4c3ce] h-full" />
      <div className="bg-[#cfd8dd] h-full" />
    </div>
    {/* Faint '0' numbers behind matching exact odds/size position */}
    <div className="absolute inset-0 grid grid-cols-2 gap-[2px] pointer-events-none py-0.5">
      <div className="flex flex-col items-center justify-between text-[12px] font-bold text-gray-600/35 leading-none">
        <span>0</span>
        <span className="text-[9.5px]">0</span>
      </div>
      <div className="flex flex-col items-center justify-between text-[12px] font-bold text-gray-600/35 leading-none">
        <span>0</span>
        <span className="text-[9.5px]">0</span>
      </div>
    </div>
    {/* Bold Red Text */}
    <span className="font-bold text-[12px] tracking-wider text-[#ff0000] uppercase relative z-10 select-none whitespace-nowrap">
      {text}
    </span>
  </div>
);

// Helper to determine if a runner or market is suspended
const isRunnerSuspended = (runner, matchObj) => {
  if (!runner) return false;
  if (runner.isSuspended === true || runner.suspended === true || runner.status === 'SUSPENDED' || runner.status === 'suspended') {
    return true;
  }
  if (matchObj?.isSuspended === true || matchObj?.status === 'SUSPENDED' || matchObj?.status === 'suspended') {
    return true;
  }
  if (runner.back?.odd === '--' || runner.back?.odd === '-' || runner.back?.odd === 'SUSPENDED') {
    return true;
  }
  return false;
};

export default function MatchDetailSection({
  match,
  user,
  onPlaceBetSuccess,
  onBackToList,
}) {
  // Always scroll to top when opening match details
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [match]);

  // 1. Dynamic Match Resolution with Fallback matching Surrey W v Somerset W reference image
  const currentMatch = match || {
    id: 'surrey_w_v_somerset_w',
    title: 'Surrey W v Somerset W',
    sport: 'cricket',
    time: '12/09/2026, 15:30',
    live: true,
    minBet: '1',
    maxBet: '1000',
    runners: [
      {
        id: 'runner_1',
        name: 'Surrey W',
        back: { odd: '3.5', size: '756.33' },
        lay: { odd: '5.7', size: '1.15' },
      },
      {
        id: 'runner_2',
        name: 'Somerset W',
        back: { odd: '1.21', size: '153.23' },
        lay: { odd: '1.4', size: '1.9k' },
      },
    ],
  };

  // Extract runners dynamically if not given
  const runners = useMemo(() => {
    if (currentMatch.runners && currentMatch.runners.length > 0) {
      return currentMatch.runners.map((r) => ({
        ...r,
        isSuspended: isRunnerSuspended(r, currentMatch),
      }));
    }
    if (currentMatch.title) {
      const parts = currentMatch.title.split(/\s+(?:v|vs)\s+/i);
      if (parts.length >= 2) {
        const isSusp =
          Boolean(currentMatch.isSuspended) ||
          currentMatch.status === 'SUSPENDED' ||
          Boolean(currentMatch.odds && (currentMatch.odds[0] === '--' || currentMatch.odds[0] === '-'));

        const odds0 = currentMatch.odds?.[0] && currentMatch.odds[0] !== '--' && currentMatch.odds[0] !== '0' ? currentMatch.odds[0] : '3.5';
        const odds1 = currentMatch.odds?.[1] && currentMatch.odds[1] !== '--' && currentMatch.odds[1] !== '0' ? currentMatch.odds[1] : '5.7';
        const odds4 = currentMatch.odds?.[4] && currentMatch.odds[4] !== '--' && currentMatch.odds[4] !== '0' ? currentMatch.odds[4] : '1.21';
        const odds5 = currentMatch.odds?.[5] && currentMatch.odds[5] !== '--' && currentMatch.odds[5] !== '0' ? currentMatch.odds[5] : '1.4';

        const list = [
          {
            id: 'runner_1',
            name: parts[0].trim(),
            back: { odd: odds0, size: '756.33' },
            lay: { odd: odds1, size: '1.15' },
            isSuspended: isSusp,
          },
          {
            id: 'runner_2',
            name: parts[1].trim(),
            back: { odd: odds4, size: '153.23' },
            lay: { odd: odds5, size: '1.9k' },
            isSuspended: isSusp,
          },
        ];
        return list;
      }
    }
    return [
      {
        id: 'runner_1',
        name: 'Surrey W',
        back: { odd: '3.5', size: '756.33' },
        lay: { odd: '5.7', size: '1.15' },
        isSuspended: false,
      },
      {
        id: 'runner_2',
        name: 'Somerset W',
        back: { odd: '1.21', size: '153.23' },
        lay: { odd: '1.4', size: '1.9k' },
        isSuspended: false,
      },
    ];
  }, [currentMatch]);

  // Bookmaker runners matching reference image 2
  const bookmakerRunners = useMemo(() => {
    const name1 = runners[0]?.name || 'Surrey W';
    const name2 = runners[1]?.name || 'Somerset W';
    const isSusp = Boolean(
      currentMatch.isSuspended ||
      currentMatch.status === 'SUSPENDED' ||
      runners[0]?.isSuspended
    );
    return [
      {
        id: 'bm_1',
        name: name1,
        back: { odd: '294', size: '75k' },
        lay: { odd: '333', size: '75k' },
        isSuspended: isSusp,
      },
      {
        id: 'bm_2',
        name: name2,
        back: { odd: '30', size: '300k' },
        lay: { odd: '34', size: '300k' },
        isSuspended: isSusp,
      },
    ];
  }, [runners, currentMatch]);

  // Fancy session markets dynamically adapted to currentMatch sport
  const [fancyMarkets, setFancyMarkets] = useState(() => {
    if (currentMatch.sport === 'soccer' || currentMatch.sport === 'football') {
      const parts = currentMatch.title ? currentMatch.title.split(/\s+(?:v|vs)\s+/i) : ['Team 1', 'Team 2'];
      const t1 = parts[0] || 'Home';
      const t2 = parts[1] || 'Away';
      return [
        {
          id: 'fancy_fb_1',
          title: 'Total Goals Over/Under 2.5',
          no: { rate: '1.92', size: '100' },
          yes: { rate: '1.96', size: '100' },
          isBallRunning: false,
          isFav: false,
        },
        {
          id: 'fancy_fb_2',
          title: 'Both Teams To Score',
          no: { rate: '0', size: '0' },
          yes: { rate: '0', size: '0' },
          isBallRunning: true,
          isFav: false,
        },
        {
          id: 'fancy_fb_3',
          title: `1st Half Over 0.5 Goals`,
          no: { rate: '1.45', size: '110' },
          yes: { rate: '2.80', size: '90' },
          isBallRunning: false,
          isFav: false,
        },
        {
          id: 'fancy_fb_4',
          title: `${t1} to score in 1st Half`,
          no: { rate: '0', size: '0' },
          yes: { rate: '0', size: '0' },
          isBallRunning: true,
          isFav: false,
        },
        {
          id: 'fancy_fb_5',
          title: `${t2} Total Goals Over 1.5`,
          no: { rate: '1.85', size: '110' },
          yes: { rate: '1.95', size: '80' },
          isBallRunning: false,
          isFav: false,
        },
      ];
    } else if (currentMatch.sport === 'tennis') {
      const parts = currentMatch.title ? currentMatch.title.split(/\s+(?:v|vs)\s+/i) : ['Player 1', 'Player 2'];
      const p1 = parts[0] || 'Player 1';
      return [
        {
          id: 'fancy_tn_1',
          title: 'Total Games Over 21.5',
          no: { rate: '1.88', size: '100' },
          yes: { rate: '1.92', size: '100' },
          isBallRunning: false,
          isFav: false,
        },
        {
          id: 'fancy_tn_2',
          title: '1st Set Winner',
          no: { rate: '0', size: '0' },
          yes: { rate: '0', size: '0' },
          isBallRunning: true,
          isFav: false,
        },
        {
          id: 'fancy_tn_3',
          title: `${p1} to win 1st Set`,
          no: { rate: '1.90', size: '110' },
          yes: { rate: '1.90', size: '90' },
          isBallRunning: false,
          isFav: false,
        },
      ];
    }
    const title = currentMatch.title || '';
    const parts = title.split(/\s+(?:v|vs)\s+/i);
    const teamCode = parts[0] ? parts[0].trim().split(/\s+/)[0].toUpperCase() : 'AUS';

    return [
      // BALL BY BALL section
      {
        id: 'fancy_bbb_1',
        title: `47.1 ball run ${teamCode}`,
        category: 'BALL BY BALL',
        no: { rate: '0', size: '0' },
        yes: { rate: '0', size: '0' },
        isBallRunning: false,
        isSuspended: true,
        isFav: false,
      },
      {
        id: 'fancy_bbb_2',
        title: `47.2 ball run ${teamCode}`,
        category: 'BALL BY BALL',
        no: { rate: '0', size: '0' },
        yes: { rate: '0', size: '0' },
        isBallRunning: true,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_bbb_3',
        title: `47.3 ball run ${teamCode}`,
        category: 'BALL BY BALL',
        no: { rate: '0', size: '0' },
        yes: { rate: '0', size: '0' },
        isBallRunning: false,
        isSuspended: true,
        isFav: false,
      },
      {
        id: 'fancy_bbb_4',
        title: `49.6 ball run ${teamCode}`,
        category: 'BALL BY BALL',
        no: { rate: '0', size: '0' },
        yes: { rate: '0', size: '0' },
        isBallRunning: false,
        isSuspended: true,
        isFav: false,
      },
      // NORMAL section
      {
        id: 'fancy_norm_1',
        title: `50 over run ${teamCode} adv`,
        category: 'NORMAL',
        no: { rate: '300', size: '100' },
        yes: { rate: '302', size: '100' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_norm_2',
        title: `50 over run bhav ${teamCode} 2 adv`,
        category: 'NORMAL',
        no: { rate: '0', size: '0' },
        yes: { rate: '0', size: '0' },
        isBallRunning: true,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_norm_3',
        title: `50 over run ${teamCode} 2 adv`,
        category: 'NORMAL',
        no: { rate: '301', size: '110' },
        yes: { rate: '301', size: '90' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_norm_4',
        title: `50 over run bhav ${teamCode} 3 adv`,
        category: 'NORMAL',
        no: { rate: '300', size: '100' },
        yes: { rate: '300', size: '80' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_norm_5',
        title: `50 over run bhav ${teamCode} adv`,
        category: 'NORMAL',
        no: { rate: '300', size: '95' },
        yes: { rate: '300', size: '75' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_norm_6',
        title: `46 over run ${teamCode}`,
        category: 'NORMAL',
        no: { rate: '271', size: '700' },
        yes: { rate: '271', size: '550' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_norm_7',
        title: `46.3 over run ${teamCode}`,
        category: 'NORMAL',
        no: { rate: '273', size: '100' },
        yes: { rate: '274', size: '100' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
    ];
  });

  // Tab State: 'fancy' | 'normal'
  const [activeFancyTab, setActiveFancyTab] = useState('fancy');

  // Interactive Bet Slip State: { marketType: 'match_odds'|'bookmaker'|'fancy', runnerId, runnerName, type: 'back'|'lay'|'no'|'yes', odd, size } | null
  const [activeBet, setActiveBet] = useState(null);
  const [oddsValue, setOddsValue] = useState('1.94');
  const [stakeValue, setStakeValue] = useState('0');
  const [matchOddsFav, setMatchOddsFav] = useState(false);
  const [bookmakerFav, setBookmakerFav] = useState(false);
  const [myBetsOpen, setMyBetsOpen] = useState(false);
  const [placedBets, setPlacedBets] = useState([]);
  const [tvStreamOpen, setTvStreamOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const toggleFancyFav = (id) => {
    setFancyMarkets((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFav: !item.isFav } : item
      )
    );
  };

  const handleSelectBet = (marketType, runnerId, runnerName, type, oddVal) => {
    if (
      activeBet &&
      activeBet.marketType === marketType &&
      activeBet.runnerId === runnerId &&
      activeBet.type === type
    ) {
      // Toggle off if clicking the same box
      setActiveBet(null);
    } else {
      setActiveBet({
        marketType,
        runnerId,
        runnerName,
        type,
      });
      setOddsValue(oddVal || '1.94');
      setStakeValue('0');
    }
  };

  const handleAdjustOdds = (delta) => {
    const current = parseFloat(oddsValue) || 1.0;
    const next = Math.max(1.01, current + delta).toFixed(2);
    setOddsValue(next);
  };

  const handleQuickStake = (amount) => {
    setStakeValue(amount.toString());
  };

  // Calculate projected profit/loss to display on runner (e.g. ">> 14,000")
  const getProjectedPL = (marketType, runnerId) => {
    if (!activeBet || activeBet.marketType !== marketType) return null;
    const stakeNum = parseFloat(stakeValue) || 0;
    if (stakeNum <= 0) return null;
    const oddsNum = parseFloat(oddsValue) || 0;

    const isActiveRunner = activeBet.runnerId === runnerId;

    if (marketType === 'match_odds' || marketType === 'bookmaker') {
      const isDecimal = oddsNum > 1;
      const calcProfit = isDecimal
        ? Math.round(stakeNum * (oddsNum - 1))
        : Math.round(stakeNum * oddsNum);

      if (activeBet.type === 'back') {
        if (isActiveRunner) {
          return { isPositive: true, text: calcProfit.toLocaleString() };
        } else {
          return { isPositive: false, text: `-${stakeNum.toLocaleString()}` };
        }
      } else if (activeBet.type === 'lay') {
        if (isActiveRunner) {
          return { isPositive: false, text: `-${calcProfit.toLocaleString()}` };
        } else {
          return { isPositive: true, text: stakeNum.toLocaleString() };
        }
      }
    } else if (marketType === 'fancy') {
      if (isActiveRunner) {
        const calcProfit =
          oddsNum > 10
            ? Math.round(stakeNum * (oddsNum / 100))
            : oddsNum > 1
            ? Math.round(stakeNum * (oddsNum - 1))
            : Math.round(stakeNum * oddsNum);
        return { isPositive: true, text: calcProfit.toLocaleString() };
      }
    }
    return null;
  };

  const handleSpecialAction = (action) => {
    if (action === 'CLEAR') {
      setStakeValue('0');
    } else if (action === 'MIN') {
      setStakeValue('1');
    } else if (action === 'MAX') {
      setStakeValue('50000');
    } else if (action === 'ALL_IN') {
      setStakeValue((user?.balance || 1500).toString());
    }
  };

  const handlePlaceBet = () => {
    const stakeNum = parseFloat(stakeValue) || 0;
    if (stakeNum <= 0) {
      alert('Please enter a valid stake amount.');
      return;
    }

    const newBet = {
      id: Date.now(),
      match: currentMatch.title,
      runner: activeBet?.runnerName,
      type: activeBet?.type,
      odds: oddsValue,
      stake: stakeValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setPlacedBets((prev) => [newBet, ...prev]);

    if (onPlaceBetSuccess) {
      onPlaceBetSuccess({
        match: currentMatch.title,
        runner: activeBet?.runnerName,
        type: activeBet?.type,
        odds: oddsValue,
        stake: stakeValue,
      });
    } else {
      alert(
        `Bet Placed Successfully!\nMatch: ${currentMatch.title}\nSelection: ${activeBet?.runnerName} (${activeBet?.type?.toUpperCase()})\nOdds: ${oddsValue}\nStake: ₹${stakeValue}`
      );
    }
    setActiveBet(null);
  };

  const isInplay = Boolean(
    currentMatch?.live ||
    currentMatch?.inplay ||
    currentMatch?.isLive ||
    currentMatch?.date === 'inplay' ||
    (typeof currentMatch?.time === 'string' && currentMatch.time.trim().toUpperCase() === 'INPLAY')
  );

  return (
    <div className="w-full bg-[#f2f4f7] select-none flex flex-col  pb-20 min-h-[500px]">
      {/* 1. Sub-Header Bar: Golden Curved Date/Time Banner (Left) + 4 Action Buttons (Right) */}
      <div className="w-full flex items-center border-b border-gray-300 pb-[1px] justify-between bg-[#f2f4f7] pl-0 pr-1.5 ">
        {/* Left: Golden Banner with custom Top-Right Smooth Curve */}
        <div
          style={{
            background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
            borderTopRightRadius: '20px',
            borderBottomRightRadius: '0px',
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
          }}
          className="h-[32px] w-[50%] pl-2.5 pr-9 flex items-center justify-start font-bold text-[12px] text-[#212529] tracking-tight whitespace-nowrap shadow-xs cursor-default shrink-0 uppercase"
        >
          {isInplay ? 'INPLAY' : (currentMatch.time || '13/09/2026 22:00:00')}
        </div>

        {/* Right: 4 Golden Action Buttons matching reference image */}
        <div className="flex items-center gap-[3px]">
          {/* Filter button */}
          <button
            type="button"
            style={{
              background: 'transparent linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f) 0% 0% no-repeat padding-box',
            }}
            className="py-[6px] px-[9px] rounded-[4px] flex items-center justify-center text-black cursor-pointer hover:brightness-105 active:scale-95 shadow-2xs"
            title="Filter Markets"
            aria-label="Filter"
          >
            <FilterFunnelIcon />
          </button>

          {/* Stats / Graph button */}
          <button
            type="button"
            onClick={() => setStatsOpen(!statsOpen)}
            style={{
              background: 'transparent linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f) 0% 0% no-repeat padding-box',
            }}
            className={`py-[6px] px-[9.5px] rounded-[4px] flex items-center justify-center text-black cursor-pointer hover:brightness-105 active:scale-95 shadow-2xs ${statsOpen ? 'ring-2 ring-amber-600' : ''
              }`}
            title="Statistics & Score"
            aria-label="Statistics"
          >
            <TrendChartIcon />
          </button>

          {/* TV / Live Stream button */}
          <button
            type="button"
            onClick={() => setTvStreamOpen(!tvStreamOpen)}
            style={{
              background: 'transparent linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f) 0% 0% no-repeat padding-box',
            }}
            className={`py-[6px] px-[8.5px] rounded-[4px] flex items-center justify-center text-black cursor-pointer hover:brightness-105 active:scale-95 shadow-2xs ${tvStreamOpen ? 'ring-2 ring-amber-600' : ''
              }`}
            title="Live Stream"
            aria-label="Live Stream"
          >
            <TvMonitorIcon />
          </button>

          {/* BETS button */}
          <button
            type="button"
            onClick={() => setMyBetsOpen(!myBetsOpen)}
            style={{
              background: 'transparent linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f) 0% 0% no-repeat padding-box',
            }}
            className={`py-[3.5px] px-[5px] rounded-[4px]  flex items-center justify-center font-bold text-[12px] text-black cursor-pointer hover:brightness-105 active:scale-95 shadow-2xs ${myBetsOpen ? 'ring-2 ring-amber-600' : ''
              }`}
            title="My Bets"
            aria-label="My Bets"
          >
            BETS
          </button>
        </div>
      </div>

      {/* Optional TV Stream Area */}
      {tvStreamOpen && (
        <div className="mx-2 mb-2 p-3 bg-black text-white rounded-[6px] text-center">
          <p className="font-bold text-xs text-amber-400 uppercase tracking-wider mb-1">Live Broadcast</p>
          <p className="text-xs text-gray-300">Live feed connected for {currentMatch.title}</p>
        </div>
      )}

      {/* Optional My Bets Drawer Panel */}
      {myBetsOpen && (
        <div className="mx-2 mb-2 p-2.5 bg-white border border-[#caa049] rounded-[6px] shadow-sm">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
            <span className="font-black text-xs text-black uppercase">My Bets ({placedBets.length})</span>
            <button
              onClick={() => setMyBetsOpen(false)}
              className="text-xs font-bold text-gray-500 hover:text-black"
            >
              Close ✕
            </button>
          </div>
          {placedBets.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">No open bets placed yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 mt-1 max-h-[140px] overflow-y-auto">
              {placedBets.map((b) => (
                <div key={b.id} className="py-1.5 flex items-center justify-between text-[11.5px]">
                  <div>
                    <span className="font-bold text-black">{b.runner}</span>
                    <span className={`ml-1.5 px-1 rounded text-[10px] font-black uppercase ${b.type === 'back' || b.type === 'yes' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {b.type}
                    </span>
                  </div>
                  <div className="text-right font-bold text-black">
                    <span>@{b.odds}</span> | <span>₹{b.stake}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MARKET SECTION 1: MATCH ODDS                           */}
      {/* ========================================================= */}
      <div className="w-full bg-[#f3f8fb] mt-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.12)] relative z-10">
        {/* Header Ribbon */}
        <div className="w-full bg-[#f3f8fb] flex items-center justify-between relative border-b border-gray-100">
          <div
            style={{
              background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
              clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)',
            }}
            className="h-[32px] pl-3 pr-4 flex items-center justify-between w-[64.4%]"
          >
            {/* Left: Star Icon + Title */}
            <div className="flex items-center gap-1">
              {/* Yellow Star */}
              <CustomStar
                filled={matchOddsFav}
                onClick={() => setMatchOddsFav(!matchOddsFav)}
              />
              {/* Title */}
              <span className="font-sans font-bold text-[10px] text-black uppercase  leading-none">
                MATCH ODDS
              </span>
            </div>

            {/* Right: CASHOUT Badge */}
            <div className="flex items-center">
              <span className="bg-[#67562d] ml-[-0.5px] text-[#e2cda6] text-[9.5px] font-black px-[3px] py-[5px] rounded-[4px] border border-[#e9d9b2] tracking-tighter leading-none">
                CASHOUT
              </span>
            </div>
          </div>

          {/* Right: Min / Max */}
          <div className="pr-2.5 mb-1 text-[11px] font-medium  text-black  leading-none">
            Min: {currentMatch.minBet || 1}| Max: {currentMatch.maxBet || 1000}
          </div>
        </div>

        {/* Column Header: BACK & LAY */}
        <div className="w-full bg-[#f3f8fb] flex items-center justify-end">
          <div className="flex items-center gap-[2px] ml-[2px] text-center shrink-0">
            <span className="w-[76.13px] h-[20px] flex items-center justify-center text-[12px] mt-[-1px] font-bold text-black uppercase">
              BACK
            </span>
            <span className="w-[76.13px] h-[20px] flex items-center justify-center text-[12px] mt-[-1px] font-bold text-black uppercase">
              LAY
            </span>
          </div>
        </div>

        {/* Runners List for MATCH ODDS */}
        <div className="w-full bg-[#f3f8fb] pt-[2px] flex flex-col gap-[1.5px]">
          {runners.map((runner) => {
            const isBackSelected =
              activeBet &&
              activeBet.marketType === 'match_odds' &&
              activeBet.runnerId === runner.id &&
              activeBet.type === 'back';
            const isLaySelected =
              activeBet &&
              activeBet.marketType === 'match_odds' &&
              activeBet.runnerId === runner.id &&
              activeBet.type === 'lay';
            const isSlipOpen =
              activeBet &&
              activeBet.marketType === 'match_odds' &&
              activeBet.runnerId === runner.id;

            return (
              <div key={runner.id} className="flex flex-col">
                <div className="w-full flex items-stretch h-[47px]">
                  {/* Runner Name */}
                  <div className="flex-1 bg-[#f2f2f2] flex flex-col justify-center px-2 min-w-0">
                    <span className="font-bold text-[13px] text-[#212529] truncate leading-tight">
                      {runner.name}
                    </span>
                    {(() => {
                      const pl = getProjectedPL('match_odds', runner.id);
                      if (!pl) return null;
                      return (
                        <span
                          className={`text-[12.5px] font-bold leading-tight ${
                            pl.isPositive ? 'text-[#008a00]' : 'text-[#d32f2f]'
                          }`}
                        >
                          &gt;&gt; {pl.text}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Back & Lay Odds Boxes */}
                  <div className="flex items-center gap-[2px] shrink-0 ml-[2px]">
                    {runner.isSuspended ? (
                      <SuspendedBox height="h-[45px]" width="w-[154.26px]" />
                    ) : (
                      <div className="flex items-center gap-[2px]">
                        {/* Blue Back Box */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectBet(
                              'match_odds',
                              runner.id,
                              runner.name,
                              'back',
                              runner.back?.odd || '1.94'
                            )
                          }
                          className="w-[76.13px] h-[45px] bg-[#aee1fc] shadow-xs hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                            {runner.back?.odd || '0'}
                          </span>
                          <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                            {runner.back?.size || '0'}
                          </span>
                        </button>

                        {/* Pink Lay Box */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectBet(
                              'match_odds',
                              runner.id,
                              runner.name,
                              'lay',
                              runner.lay?.odd || '1.99'
                            )
                          }
                          className="w-[76.13px] h-[45px] bg-[#fed5da] shadow-xs hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                            {runner.lay?.odd || '0'}
                          </span>
                          <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                            {runner.lay?.size || '0'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Bet Slip for MATCH ODDS */}
                {isSlipOpen && renderBetSlip(activeBet)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MARKET SECTION 2: BOOKMAKER                            */}
      {/* ========================================================= */}
      <div className="w-full bg-[#f3f8fb] mt-3 shadow-[0_2px_4px_rgba(0,0,0,0.12)] relative z-10">
        {/* Header Ribbon */}
        <div className="w-full bg-[#f3f8fb] flex items-center justify-between relative border-b border-gray-100">
          <div
            style={{
              background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
              clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)',
            }}
            className="h-[32px] pl-3 pr-4 flex items-center justify-between w-[64.4%]"
          >
            {/* Left: Star Icon + Title */}
            <div className="flex items-center gap-1">
              {/* Yellow Star */}
              <CustomStar
                filled={bookmakerFav}
                onClick={() => setBookmakerFav(!bookmakerFav)}
              />
              {/* Title */}
              <span className="font-sans font-bold text-[10px] text-black uppercase leading-none">
                BOOKMAKER
              </span>
            </div>

            {/* Right: CASHOUT Badge */}
            <div className="flex items-center">
              <span className="bg-[#67562d] ml-[-0.5px] text-[#e2cda6] text-[9.5px] font-black px-[3px] py-[5px] rounded-[4px] border border-[#e9d9b2] tracking-tighter leading-none">
                CASHOUT
              </span>
            </div>
          </div>

          {/* Right: Min / Max */}
          <div className="pr-2.5 mb-1 text-[11px] font-medium text-black leading-none">
            Min: 100| Max: 50000
          </div>
        </div>

        {/* Column Header: BACK & LAY */}
        <div className="w-full bg-[#f3f8fb] flex items-center justify-end">
          <div className="flex items-center gap-[2px] ml-[2px] text-center shrink-0">
            <span className="w-[76.13px] h-[20px] flex items-center justify-center text-[12px] mt-[-1px] font-bold text-black uppercase">
              BACK
            </span>
            <span className="w-[76.13px] h-[20px] flex items-center justify-center text-[12px] mt-[-1px] font-bold text-black uppercase">
              LAY
            </span>
          </div>
        </div>

        {/* Runners List for BOOKMAKER */}
        <div className="w-full bg-[#f3f8fb] pt-[2px] flex flex-col gap-[1.5px]">
          {bookmakerRunners.map((runner) => {
            const isBackSelected =
              activeBet &&
              activeBet.marketType === 'bookmaker' &&
              activeBet.runnerId === runner.id &&
              activeBet.type === 'back';
            const isLaySelected =
              activeBet &&
              activeBet.marketType === 'bookmaker' &&
              activeBet.runnerId === runner.id &&
              activeBet.type === 'lay';
            const isSlipOpen =
              activeBet &&
              activeBet.marketType === 'bookmaker' &&
              activeBet.runnerId === runner.id;

            return (
              <div key={runner.id} className="flex flex-col">
                <div className="w-full flex items-stretch h-[47px]">
                  {/* Runner Name */}
                  <div className="flex-1 bg-[#f2f2f2] flex flex-col justify-center px-2 min-w-0">
                    <span className="font-bold text-[13px] text-[#212529] truncate leading-tight">
                      {runner.name}
                    </span>
                    {(() => {
                      const pl = getProjectedPL('bookmaker', runner.id);
                      if (!pl) return null;
                      return (
                        <span
                          className={`text-[12.5px] font-bold leading-tight ${
                            pl.isPositive ? 'text-[#008a00]' : 'text-[#d32f2f]'
                          }`}
                        >
                          &gt;&gt; {pl.text}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Back & Lay Odds Boxes */}
                  <div className="flex items-center gap-[2px] shrink-0 ml-[2px]">
                    {runner.isSuspended ? (
                      <SuspendedBox height="h-[45px]" width="w-[154.26px]" />
                    ) : (
                      <div className="flex items-center gap-[2px]">
                        {/* Blue Back Box */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectBet(
                              'bookmaker',
                              runner.id,
                              runner.name,
                              'back',
                              runner.back.odd
                            )
                          }
                          className="w-[76.13px] h-[45px] bg-[#aee1fc] shadow-xs hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                            {runner.back.odd}
                          </span>
                          <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                            {runner.back.size}
                          </span>
                        </button>

                        {/* Pink Lay Box */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectBet(
                              'bookmaker',
                              runner.id,
                              runner.name,
                              'lay',
                              runner.lay.odd
                            )
                          }
                          className="w-[76.13px] h-[45px] bg-[#fed5da] shadow-xs hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                            {runner.lay.odd}
                          </span>
                          <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                            {runner.lay.size}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Bet Slip for BOOKMAKER */}
                {isSlipOpen && renderBetSlip(activeBet)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. TABS: FANCY / NORMAL                                   */}
      {/* ========================================================= */}
      <div className="flex items-center  justify-start gap-2.5 pt-3 pb-2 bg-white ">
        <button
          type="button"
          onClick={() => setActiveFancyTab('fancy')}
          className={`px-6 whitespace-nowrap py-2 rounded-md font-bold text-[13px] w-[120px] h-[29px] flex justify-center items-center cursor-pointer transition-all active:scale-95 border border-[#e6ab0a] ${activeFancyTab === 'fancy'
            ? 'bg-gradient-to-b from-[#ffdd4d] to-[#ffbd14] text-black shadow-xs'
            : 'bg-white text-black hover:bg-yellow-50/50'
            }`}
        >
          FANCY
        </button>
        <button
          type="button"
          onClick={() => setActiveFancyTab('normal')}
          className={`px-6 whitespace-nowrap py-2 rounded-md font-bold text-[13px] w-[120px] h-[29px] flex justify-center items-center cursor-pointer transition-all active:scale-95 border border-[#e6ab0a] ${activeFancyTab === 'normal'
            ? 'bg-gradient-to-b from-[#ffdd4d] to-[#ffbd14] text-black shadow-xs'
            : 'bg-white text-black hover:bg-yellow-50/50'
            }`}
        >
          NORMAL
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. MARKET SECTION 3: NORMAL / FANCY SESSION MARKETS       */}
      {/* ========================================================= */}
      <div className="w-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.12)] relative z-10 flex flex-col gap-2">
        {(() => {
          const renderFancySectionHeader = (title) => (
            <div className="w-full bg-[#f3f8fb] flex items-center justify-between relative border-b border-gray-100">
              <div
                style={{
                  background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                  clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)',
                }}
                className="h-[32px] pl-2 pr-6 flex items-center w-[56.5%]"
              >
                <span className="font-sans font-bold text-[13px] text-black uppercase tracking-wide leading-none">
                  {title}
                </span>
              </div>

              {/* Column Header: NO & YES */}
              <div className="flex items-center gap-[2px] ml-[2px] text-center shrink-0">
                <span className="w-[76.13px] h-[20px] flex items-center justify-center text-[12px] font-bold text-black uppercase">
                  NO
                </span>
                <span className="w-[76.13px] h-[20px] flex items-center justify-center text-[12px] font-bold text-black uppercase">
                  YES
                </span>
              </div>
            </div>
          );

          const renderMarketRow = (market) => {
            const isNoSelected =
              activeBet &&
              activeBet.marketType === 'fancy' &&
              activeBet.runnerId === market.id &&
              activeBet.type === 'no';
            const isYesSelected =
              activeBet &&
              activeBet.marketType === 'fancy' &&
              activeBet.runnerId === market.id &&
              activeBet.type === 'yes';
            const isSlipOpen =
              activeBet &&
              activeBet.marketType === 'fancy' &&
              activeBet.runnerId === market.id;

            return (
              <div key={market.id} className="flex flex-col">
                <div className="w-full flex items-stretch h-[40px]">
                  {/* Left: Star + Title + Green Checkmark */}
                  <div className="flex-1 bg-[#f2f2f2] flex items-center px-1.5 min-w-0 gap-1.5 h-[40px]">
                    <CustomStar
                      filled={market.isFav}
                      onClick={() => toggleFancyFav(market.id)}
                    />
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <span className="text-[13px] font-medium text-black truncate leading-tight">
                        {market.title}
                      </span>
                      {(() => {
                        const pl = getProjectedPL('fancy', market.id);
                        if (!pl) return null;
                        return (
                          <span
                            className={`text-[11.5px] font-bold leading-tight ${
                              pl.isPositive ? 'text-[#008a00]' : 'text-[#d32f2f]'
                            }`}
                          >
                            &gt;&gt; {pl.text}
                          </span>
                        );
                      })()}
                    </div>
                    <GreenCheckmark />
                  </div>

                  {/* Right: Odds / Ball Running / Suspended (Boxes height 40px, width 76.13px each) */}
                  <div className="flex items-center gap-[2px] shrink-0 ml-[2px] h-[40px]">
                    {market.isSuspended ? (
                      <SuspendedBox height="h-[40px]" width="w-[154.26px]" text="SUSPENDED" />
                    ) : market.isBallRunning ? (
                      <SuspendedBox height="h-[40px]" width="w-[154.26px]" text="BALL RUNNING" />
                    ) : (
                      <div className="flex items-center gap-[2px] h-[40px]">
                        {/* Pink NO Box */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectBet(
                              'fancy',
                              market.id,
                              `${market.title} (NO)`,
                              'no',
                              market.no.rate
                            )
                          }
                          className="w-[76.13px] h-[40px] bg-[#fed5da] shadow-sm hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                            {market.no.rate}
                          </span>
                          <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                            {market.no.size}
                          </span>
                        </button>

                        {/* Blue YES Box */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectBet(
                              'fancy',
                              market.id,
                              `${market.title} (YES)`,
                              'yes',
                              market.yes.rate
                            )
                          }
                          className="w-[76.13px] h-[40px] bg-[#aee1fc] shadow-sm hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                            {market.yes.rate}
                          </span>
                          <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                            {market.yes.size}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Bet Slip for FANCY */}
                {isSlipOpen && renderBetSlip(activeBet)}
              </div>
            );
          };

          const hasCategories = fancyMarkets.some((m) => m.category);

          if (!hasCategories || currentMatch.sport === 'soccer' || currentMatch.sport === 'tennis') {
            return (
              <div className="w-full">
                {renderFancySectionHeader(activeFancyTab === 'normal' ? 'NORMAL' : 'FANCY')}
                <div className="w-full bg-[#f3f8fb] pt-[2px] flex flex-col gap-[1.5px]">
                  {fancyMarkets.map(renderMarketRow)}
                </div>
              </div>
            );
          }

          if (activeFancyTab === 'normal') {
            return (
              <div className="w-full">
                {renderFancySectionHeader('NORMAL')}
                <div className="w-full bg-[#f3f8fb] pt-[2px] flex flex-col gap-[1.5px]">
                  {fancyMarkets
                    .filter((m) => m.category === 'NORMAL' || !m.category)
                    .map(renderMarketRow)}
                </div>
              </div>
            );
          }

          // Fancy tab: Render BALL BY BALL first, then NORMAL
          const bbbMarkets = fancyMarkets.filter((m) => m.category === 'BALL BY BALL');
          const normalMarkets = fancyMarkets.filter((m) => m.category === 'NORMAL' || !m.category);

          return (
            <>
              {/* BALL BY BALL Section */}
              {bbbMarkets.length > 0 && (
                <div className="w-full">
                  {renderFancySectionHeader('BALL BY BALL')}
                  <div className="w-full bg-[#f3f8fb] pt-[2px] flex flex-col gap-[1.5px]">
                    {bbbMarkets.map(renderMarketRow)}
                  </div>
                </div>
              )}

              {/* NORMAL Section */}
              {normalMarkets.length > 0 && (
                <div className="w-full">
                  {renderFancySectionHeader('NORMAL')}
                  <div className="w-full bg-[#f3f8fb] pt-[2px] flex flex-col gap-[1.5px]">
                    {normalMarkets.map(renderMarketRow)}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );

  // Helper renderer for interactive inline Bet Slip matching exact reference design
  function renderBetSlip(bet) {
    const isBlue = bet.type === 'back' || bet.type === 'yes';
    return (
      <div
        className={`w-full px-1 py-2 flex flex-col gap-1 transition-all animate-in slide-in-from-top-2 duration-150 ${isBlue
          ? 'bg-[#aee1fc] border-t border-b border-[#7ec4f4]'
          : 'bg-[#fed5da] border-t border-b border-[#f5adb7]'
          }`}
      >
        {/* Top: Limits & Available Balance */}
        <div className="flex items-center justify-between text-[13px] font-bold text-[#212529] px-0.5">
          <span className="uppercase tracking-tight">MIN: 1 MAX: 50K</span>
          <div className="flex items-center">
            <span>Aval Bal :</span>
            <span className="text-[#00a826] font-bold text-[14px] ml-1.5">
              {user?.balance ?? 1500}
            </span>
          </div>
        </div>

        {/* Controls Row: Odds Adjuster + Stake Input */}
        <div className="grid grid-cols-2 gap-1">
          {/* Odds Adjuster */}
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-[#212529] leading-tight">
              Odds
            </span>
            <div className="flex items-center h-[36px] bg-white rounded-[3px] border border-[#bcc8d3] overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => handleAdjustOdds(-0.5)}
                style={{
                  background: 'linear-gradient(180deg, #d3a13b 0%, #f7dc7b 50%, #c59028 100%)',
                }}
                className="w-[28px] h-full flex items-center justify-center font-bold text-[16px] text-black cursor-pointer hover:brightness-105 active:scale-95 border-r border-[#bcc8d3] shrink-0 select-none"
              >
                -
              </button>
              <input
                type="text"
                value={oddsValue}
                onChange={(e) => setOddsValue(e.target.value)}
                className="flex-1 h-full text-center font-bold text-[15px] text-[#212529] bg-white focus:outline-none min-w-0"
              />
              <button
                type="button"
                onClick={() => handleAdjustOdds(0.5)}
                style={{
                  background: 'linear-gradient(180deg, #d3a13b 0%, #f7dc7b 50%, #c59028 100%)',
                }}
                className="w-[28px] h-full flex items-center justify-center font-bold text-[16px] text-black cursor-pointer hover:brightness-105 active:scale-95 border-l border-[#bcc8d3] shrink-0 select-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Stake Input */}
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-[#212529] leading-tight">
              Stake
            </span>
            <input
              type="number"
              value={stakeValue}
              onChange={(e) => setStakeValue(e.target.value)}
              placeholder="0"
              className="w-full h-[36px] bg-white rounded-[3px] border border-[#bcc8d3] text-center font-bold text-[15px] text-[#212529] focus:outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Stake Quick Chips - Row 1 */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: '1k', val: 1000 },
            { label: '2k', val: 2000 },
            { label: '5k', val: 5000 },
            { label: '10k', val: 10000 },
          ].map((chip) => {
            const isSelected = parseFloat(stakeValue) === chip.val;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleQuickStake(chip.val)}
                className={`h-[30px] bg-white rounded-[3px] font-bold text-[13px] text-[#212529] shadow-2xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? 'border-[1.5px] border-[#0070e0]'
                    : 'border border-[#cfdbe5]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Stake Quick Chips - Row 2 */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: '20k', val: 20000 },
            { label: '25k', val: 25000 },
            { label: '50k', val: 50000 },
            { label: '75k', val: 75000 },
          ].map((chip) => {
            const isSelected = parseFloat(stakeValue) === chip.val;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleQuickStake(chip.val)}
                className={`h-[30px] bg-white rounded-[3px] font-bold text-[13px] text-[#212529] shadow-2xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? 'border-[1.5px] border-[#0070e0]'
                    : 'border border-[#cfdbe5]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Special Controls - Row 3 */}
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => handleSpecialAction('MIN')}
            className="h-[30px] bg-[#fec200] hover:brightness-95 rounded-[3px] font-bold text-[12.5px] text-[#212529] shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            MIN
          </button>
          <button
            type="button"
            onClick={() => handleSpecialAction('MAX')}
            className="h-[30px] bg-[#6db1ff] hover:brightness-95 rounded-[3px] font-bold text-[12.5px] text-[#212529] shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            MAX
          </button>
          <button
            type="button"
            onClick={() => handleSpecialAction('ALL_IN')}
            className="h-[30px] bg-[#9ef68d] hover:brightness-95 rounded-[3px] font-bold text-[12.5px] text-[#212529] shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            ALL IN
          </button>
          <button
            type="button"
            onClick={() => handleSpecialAction('CLEAR')}
            className="h-[30px] bg-[#fef48b] hover:brightness-95 rounded-[3px] font-bold text-[12.5px] text-[#212529] shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            CLEAR
          </button>
        </div>

        {/* Action Buttons: CANCEL & PLACE BET */}
        <div className="grid grid-cols-2 gap-1 mt-0.5">
          <button
            type="button"
            onClick={() => setActiveBet(null)}
            className="h-[38px] bg-white border border-gray-400 rounded-[3px] font-bold text-[13.5px] text-[#212529] shadow-2xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center tracking-wide uppercase"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handlePlaceBet}
            className="h-[38px] bg-[#009900] hover:bg-[#008000] rounded-[3px] font-bold text-[13.5px] text-white shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center tracking-wide uppercase"
          >
            PLACE BET
          </button>
        </div>
      </div>
    );
  }
}
