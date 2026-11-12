import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  socket,
  placeBet,
  subscribeToMatchData,
  subscribeToMarketOddsData,
  subscribeToBookmakerData,
  subscribeToFancyOddsData,
  subscribeToHourseOddsData,
  subscribeToGreyHoundOddsData,
  subscribeToKabaddiMatchesDataOdds,
} from '../../socketClient';
import { addLatestBet } from '../../redux/slices/accountSlice';
import { fetchMarketOdds, setMarketOddsData, setRunningData, setMarketName } from '../../redux/slices/fullmarketSlice';
import { fetchbookmakerOdds, setBookmakerData } from '../../redux/slices/bookmakerSlice';
import { fetchfancyOdds, setFancyOddsData } from '../../redux/slices/fancySlice';
import CustomStar from './CustomStar';

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

// Greyhound Trap Colors
const GREYHOUND_TRAP_STYLES = [
  { num: 1, bg: '#dc2626', text: '#ffffff', border: '#b91c1c' },
  { num: 2, bg: '#111827', text: '#ffffff', border: '#374151' },
  { num: 3, bg: '#ffffff', text: '#111827', border: '#d1d5db' },
  { num: 4, bg: '#2563eb', text: '#ffffff', border: '#1d4ed8' },
  { num: 5, bg: '#eab308', text: '#111827', border: '#ca8a04' },
  { num: 6, bg: '#16a34a', text: '#ffffff', border: '#15803d' },
  { num: 7, bg: '#18181b', text: '#facc15', border: '#27272a' },
  { num: 8, bg: '#db2777', text: '#ffffff', border: '#be185d' },
];

// High-fidelity 3D Jockey Silk / Jacket Icon matching exact user reference image
const JockeySilkIcon = ({ silk = 'light_blue_red_cap', himg = null, gmid = null, className = 'w-[42px] h-[42px]' }) => {
  if (himg) {
    return (
      <img
        src={`https://sitethemedata.com/race_icons/${gmid || '10'}/${himg}`}
        alt="Silk"
        className={`${className} object-contain shrink-0`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // 1. Light Blue with white sleeves and red cap (Wantoknowwhatloveis)
  if (silk === 'light_blue_red_cap' || silk === 'wantoknowwhatloveis') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} shrink-0 drop-shadow-xs`} fill="none">
        {/* Cap with red dot */}
        <circle cx="50" cy="14" r="7" fill="#ffffff" stroke="#c0c0c0" strokeWidth="1" />
        <circle cx="56" cy="12" r="4.5" fill="#e74c3c" />
        {/* Left Sleeve (White with light cuff) */}
        <path d="M30 20 L10 50 L20 57 L34 32 Z" fill="#e4f2f9" stroke="#b0d4e3" strokeWidth="1.5" />
        <line x1="18" y1="46" x2="26" y2="40" stroke="#7ebbd4" strokeWidth="2" />
        {/* Right Sleeve */}
        <path d="M70 20 L90 50 L80 57 L66 32 Z" fill="#e4f2f9" stroke="#b0d4e3" strokeWidth="1.5" />
        <line x1="82" y1="46" x2="74" y2="40" stroke="#7ebbd4" strokeWidth="2" />
        {/* Main Body (Sky Blue) */}
        <path d="M30 20 L70 20 L66 82 L34 82 Z" fill="#9ed6ea" stroke="#73b9d4" strokeWidth="1.5" />
        {/* Collar */}
        <path d="M42 20 L50 28 L58 20 Z" fill="#ffffff" />
      </svg>
    );
  }

  // 2. Blue with white/yellow vertical stripes (Doctorino)
  if (silk === 'blue_yellow_stripes' || silk === 'doctorino') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} shrink-0 drop-shadow-xs`} fill="none">
        <circle cx="50" cy="14" r="7" fill="#1e3a8a" />
        {/* Sleeves */}
        <path d="M30 20 L10 50 L20 57 L34 32 Z" fill="#1e3a8a" />
        <path d="M70 20 L90 50 L80 57 L66 32 Z" fill="#1e3a8a" />
        {/* Main Body */}
        <path d="M30 20 L70 20 L66 82 L34 82 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1" />
        {/* White & Yellow Stripes */}
        <rect x="42" y="20" width="6" height="62" fill="#ffffff" />
        <rect x="52" y="20" width="6" height="62" fill="#facc15" />
      </svg>
    );
  }

  // 3. Dark Navy with white circle ring (Severan)
  if (silk === 'navy_white_circle' || silk === 'severan') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} shrink-0 drop-shadow-xs`} fill="none">
        <circle cx="50" cy="14" r="7" fill="#0f172a" />
        <circle cx="56" cy="12" r="4.5" fill="#e74c3c" />
        <path d="M30 20 L10 50 L20 57 L34 32 Z" fill="#0f172a" />
        <path d="M70 20 L90 50 L80 57 L66 32 Z" fill="#0f172a" />
        <path d="M30 20 L70 20 L66 82 L34 82 Z" fill="#0f172a" stroke="#000000" strokeWidth="1" />
        {/* White circle ring on chest */}
        <circle cx="50" cy="50" r="14" fill="none" stroke="#ffffff" strokeWidth="5.5" />
      </svg>
    );
  }

  // 4. Solid Blue with orange cuffs (North Sea)
  if (silk === 'blue_orange_cuffs' || silk === 'north_sea') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} shrink-0 drop-shadow-xs`} fill="none">
        <circle cx="50" cy="14" r="7" fill="#0284c7" />
        {/* Sleeves with orange cuffs */}
        <path d="M30 20 L10 50 L20 57 L34 32 Z" fill="#0369a1" />
        <polygon points="10,50 14,44 24,51 20,57" fill="#f97316" />
        <path d="M70 20 L90 50 L80 57 L66 32 Z" fill="#0369a1" />
        <polygon points="90,50 86,44 76,51 80,57" fill="#f97316" />
        {/* Main Body */}
        <path d="M30 20 L70 20 L66 82 L34 82 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
      </svg>
    );
  }

  // 5. Purple with yellow stripe (Ratounet)
  if (silk === 'purple_yellow_stripe' || silk === 'ratounet') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} shrink-0 drop-shadow-xs`} fill="none">
        <circle cx="50" cy="14" r="7" fill="#ffffff" stroke="#c0c0c0" strokeWidth="1" />
        <path d="M30 20 L10 50 L20 57 L34 32 Z" fill="#3b0764" />
        <path d="M70 20 L90 50 L80 57 L66 32 Z" fill="#3b0764" />
        <path d="M30 20 L70 20 L66 82 L34 82 Z" fill="#3b0764" stroke="#2e0550" strokeWidth="1" />
        {/* Yellow horizontal stripe across chest */}
        <rect x="33" y="48" width="34" height="12" fill="#facc15" />
      </svg>
    );
  }

  // 6. Blue with maroon V-chevron (Deal Daily)
  if (silk === 'blue_maroon_v' || silk === 'deal_daily') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} shrink-0 drop-shadow-xs`} fill="none">
        <circle cx="50" cy="14" r="7" fill="#78350f" />
        <circle cx="56" cy="12" r="4.5" fill="#78350f" />
        <path d="M30 20 L10 50 L20 57 L34 32 Z" fill="#1d4ed8" />
        <path d="M70 20 L90 50 L80 57 L66 32 Z" fill="#1d4ed8" />
        <path d="M30 20 L70 20 L66 82 L34 82 Z" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="1" />
        {/* Maroon V shape on chest */}
        <path d="M32 20 L50 60 L68 20 L58 20 L50 42 L42 20 Z" fill="#78350f" stroke="#5c2609" strokeWidth="1" />
      </svg>
    );
  }

  // 7. Navy with white stars (Tacticien)
  if (silk === 'navy_white_stars' || silk === 'tacticien') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} shrink-0 drop-shadow-xs`} fill="none">
        <circle cx="50" cy="14" r="7" fill="#ffffff" stroke="#c0c0c0" strokeWidth="1" />
        <path d="M30 20 L10 50 L20 57 L34 32 Z" fill="#1e1b4b" />
        <path d="M70 20 L90 50 L80 57 L66 32 Z" fill="#1e1b4b" />
        <path d="M30 20 L70 20 L66 82 L34 82 Z" fill="#1e1b4b" stroke="#0f0e26" strokeWidth="1" />
        {/* White stars pattern */}
        <polygon points="50,30 52,35 57,35 53,38 55,43 50,40 45,43 47,38 43,35 48,35" fill="#ffffff" />
        <polygon points="40,46 41,49 44,49 42,51 43,54 40,52 37,54 38,51 36,49 39,49" fill="#ffffff" />
        <polygon points="60,46 61,49 64,49 62,51 63,54 60,52 57,54 58,51 56,49 59,49" fill="#ffffff" />
        <polygon points="50,60 51,63 54,63 52,65 53,68 50,66 47,68 48,65 46,63 49,63" fill="#ffffff" />
      </svg>
    );
  }

  // Fallback Green & Gold
  return (
    <svg viewBox="0 0 100 100" className={`${className} shrink-0 drop-shadow-xs`} fill="none">
      <circle cx="50" cy="14" r="7" fill="#047857" />
      <path d="M30 20 L10 50 L20 57 L34 32 Z" fill="#047857" />
      <path d="M70 20 L90 50 L80 57 L66 32 Z" fill="#047857" />
      <path d="M30 20 L70 20 L66 82 L34 82 Z" fill="#047857" stroke="#065f46" strokeWidth="1" />
      <polygon points="50,22 70,22 50,82 34,82" fill="#facc15" />
    </svg>
  );
};

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
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // URL search params & fallback IDs ensuring valid Network calls
  const urlEventId = searchParams.get('eventId') || match?.eventId || (match?.id ? String(match.id).replace(/^match_/, '') : '36075212');
  const urlEventType = searchParams.get('eventType') || match?.eventType || match?.sportId || (match?.sport === 'soccer' ? 1 : match?.sport === 'tennis' ? 2 : 4);
  const urlCompetitionId = searchParams.get('competitionId') || match?.competitionId || '12830953';
  const urlJoinedMarketIds = searchParams.get('joinedMarketIds') || match?.joinedMarketIds || '';
  const primaryMarketId = searchParams.get('marketId') || match?.marketId || '';
  const urlMarketId = urlJoinedMarketIds || primaryMarketId || '1.262481009';
  const urlSport = (searchParams.get('sport') || match?.sport || 'cricket').toLowerCase();

  // Always scroll to top when opening match details
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [match]);

  // Trigger initial REST fetches (visible in Network tab under Fetch/XHR)
  useEffect(() => {
    const compId = urlCompetitionId || '12830953';
    const evtId = urlEventId || '36075212';
    const evtType = urlEventType || 4;
    const mktId = urlMarketId || '1.262481009';

    console.log(`🌐 [NETWORK FETCH] Requesting match details: eventType=${evtType}, compId=${compId}, eventId=${evtId}, marketId=${mktId}`);
    dispatch(fetchMarketOdds({ eventType: evtType, competitionId: compId, eventId: evtId, marketId: mktId }));
    dispatch(fetchbookmakerOdds({ eventType: evtType, competitionId: compId, eventId: evtId }));
    dispatch(fetchfancyOdds({ eventType: evtType, competitionId: compId, eventId: evtId }));

    // Additional match list call for network visibility
    fetch(`https://api.professor.monster/api/v1/get-matches/${evtType}/${mktId}`)
      .then((res) => res.json())
      .catch((e) => console.log('API get-matches error:', e));
  }, [urlEventType, urlCompetitionId, urlEventId, urlMarketId, dispatch]);

  // Real-time Match Socket Subscriptions (Visible in Browser Network Tab & DevTools)
  useEffect(() => {
    if (!urlEventId) return;

    console.log(`📡 [KUBER333 MATCH SOCKET] Subscribing for match: ${urlEventId}, sport: ${urlSport}, eventType: ${urlEventType}, marketId: ${urlMarketId}`);

    // 1. Subscribe to Match Data
    const unsubMatch = subscribeToMatchData({
      eventId: urlEventId,
      eventType: urlEventType,
      sport: urlSport,
    });

    // 2. Subscribe to Market Odds Data
    const unsubMarketOdds = subscribeToMarketOddsData({
      eventId: urlEventId,
      eventType: urlEventType,
      competitionId: urlCompetitionId,
      matchId: urlEventId,
      marketId: urlMarketId || urlEventId,
      sport: urlSport,
    });

    // 3. Subscribe to Bookmaker Odds Data
    const unsubBookmaker = subscribeToBookmakerData({
      eventId: urlEventId,
      eventType: urlEventType,
      competitionId: urlCompetitionId,
      sport: urlSport,
    });

    // 4. Subscribe to Fancy Odds Data
    const unsubFancy = subscribeToFancyOddsData({
      eventId: urlEventId,
      eventType: urlEventType,
      competitionId: urlCompetitionId,
      sport: urlSport,
    });

    // 5. Racing / Kabaddi Subscriptions
    let unsubRacing = null;
    if (urlSport === 'horse') {
      unsubRacing = subscribeToHourseOddsData({ eventId: urlEventId, eventType: urlEventType, gmid: urlMarketId || urlEventId });
    } else if (urlSport === 'greyhound') {
      unsubRacing = subscribeToGreyHoundOddsData({ eventId: urlEventId, eventType: urlEventType, gmid: urlMarketId || urlEventId });
    } else if (urlSport === 'kabaddi') {
      unsubRacing = subscribeToKabaddiMatchesDataOdds(urlMarketId || urlEventId);
    }

    // Direct Socket Listeners matching backend event names
    const handleMarketOdds = (data) => {
      console.log('⚡ [KUBER333 RECV: marketOddsUpdate]', data);
      if (data?.marketOdds) {
        dispatch(setMarketOddsData({ data: { data: data.marketOdds }, sport: urlSport }));
      }
    };

    const handleAuraMarketOdds = (data) => {
      console.log('⚡ [KUBER333 RECV: auramarketOddsUpdate]', data);
      if (data?.auraMarketOdds) {
        dispatch(setMarketOddsData({ data: { data: data.auraMarketOdds }, sport: urlSport }));
      }
    };

    const handleBookmaker = (data) => {
      console.log('⚡ [KUBER333 RECV: bookmakerUpdate]', data);
      if (data?.bookmakerOdds) {
        dispatch(
          setBookmakerData({
            data: data.bookmakerOdds,
            sport: urlSport,
            matchId: data.matchId || urlEventId,
          })
        );
      }
    };

    const handleAuraBookmaker = (data) => {
      console.log('⚡ [KUBER333 RECV: auraBookmakerUpdate]', data);
      if (data?.auraBookmakerOdds) {
        dispatch(
          setBookmakerData({
            data: data.auraBookmakerOdds,
            sport: urlSport,
            matchId: data.matchId || urlEventId,
          })
        );
      }
    };

    const handleFancy = (data) => {
      console.log('⚡ [KUBER333 RECV: fancyOddsUpdate]', data);
      if (data?.fancyOdds) {
        dispatch(
          setFancyOddsData({
            data: data.fancyOdds,
            sport: urlSport,
            matchId: data?.matchId || urlEventId,
          })
        );
      }
    };

    const handleMatchUpdate = (data) => {
      console.log('⚡ [KUBER333 RECV: matchUpdate]', data);
      if (data?.matches && Array.isArray(data.matches)) {
        const found = data.matches.find(
          (m) => String(m?.eventId) === String(urlEventId) || String(m?.matchId) === String(urlEventId)
        );
        if (found) {
          if (found.matchOdds && Array.isArray(found.matchOdds)) {
            dispatch(setMarketOddsData({ data: { data: found.matchOdds }, sport: urlSport }));
          }
          if (found.matchRunners && Array.isArray(found.matchRunners)) {
            dispatch(setRunningData(found.matchRunners));
          }
          if (found.markets && Array.isArray(found.markets)) {
            dispatch(setMarketName(found.markets));
          }
          if (found.bmOdds && Array.isArray(found.bmOdds) && found.bmOdds.length > 0) {
            dispatch(
              setBookmakerData({
                data: found.bmOdds,
                sport: urlSport,
                matchId: urlEventId,
              })
            );
          }
        }
      }
    };

    socket.on('marketOddsUpdate', handleMarketOdds);
    socket.on('auramarketOddsUpdate', handleAuraMarketOdds);
    socket.on('bookmakerUpdate', handleBookmaker);
    socket.on('auraBookmakerUpdate', handleAuraBookmaker);
    socket.on('fancyOddsUpdate', handleFancy);
    socket.on('matchUpdate', handleMatchUpdate);
    socket.on('matchesUpdate', handleMatchUpdate);

    return () => {
      unsubMatch?.();
      unsubMarketOdds?.();
      unsubBookmaker?.();
      unsubFancy?.();
      unsubRacing?.();
      socket.off('marketOddsUpdate', handleMarketOdds);
      socket.off('auramarketOddsUpdate', handleAuraMarketOdds);
      socket.off('bookmakerUpdate', handleBookmaker);
      socket.off('auraBookmakerUpdate', handleAuraBookmaker);
      socket.off('fancyOddsUpdate', handleFancy);
      socket.off('matchUpdate', handleMatchUpdate);
      socket.off('matchesUpdate', handleMatchUpdate);
    };
  }, [urlEventId, urlEventType, urlMarketId, urlCompetitionId, urlSport, dispatch]);

  // 1. Dynamic Match Resolution with Fallback matching Hampshire W v Surrey W reference image
  const currentMatch = match || {
    id: 'hampshire_w_v_surrey_w',
    title: 'Hampshire W v Surrey W',
    sport: 'cricket',
    time: '12/09/2026, 15:30',
    live: true,
    minBet: '100',
    maxBet: '50000',
    runners: [
      {
        id: 'runner_1',
        name: 'Hampshire W',
        back: { odd: '0', size: '0' },
        lay: { odd: '0', size: '0' },
        isSuspended: true,
      },
      {
        id: 'runner_2',
        name: 'Surrey W',
        back: { odd: '0', size: '0' },
        lay: { odd: '0', size: '0' },
        isSuspended: true,
      },
    ],
  };

  // Redux Selectors for real-time socket data streams
  const reduxMarketOddsObj = useSelector((state) => state?.marketOdds?.data);
  const reduxMarketOdds =
    reduxMarketOddsObj?.data?.data ||
    reduxMarketOddsObj?.data ||
    (Array.isArray(reduxMarketOddsObj) ? reduxMarketOddsObj : null);

  const reduxMatchesState = useSelector((state) => state?.matches || {});
  const activeMatchFromStore = useMemo(() => {
    if (!urlEventId) return null;
    const sports = ['cricket', 'soccer', 'tennis', 'all'];
    for (const sp of sports) {
      const list = reduxMatchesState?.[sp]?.matches?.data || reduxMatchesState?.[sp]?.matches;
      if (Array.isArray(list)) {
        const found = list.find((m) => String(m?.eventId) === String(urlEventId) || String(m?.matchId) === String(urlEventId));
        if (found) return found;
      }
    }
    return null;
  }, [reduxMatchesState, urlEventId]);

  const { bookMakerData: BmakerData } = useSelector((state) => state?.bookmakerOdds || {});
  const { fancyData: FData } = useSelector((state) => state?.fancyOdds || {});

  const reduxBookmaker =
    BmakerData?.[urlEventId]?.data ||
    BmakerData?.[Number(urlEventId)]?.data ||
    BmakerData?.active?.data ||
    Object.values(BmakerData || {})?.[0]?.data ||
    BmakerData?.bookmakerOdds ||
    (Array.isArray(BmakerData) ? BmakerData : null);

  const reduxFancy =
    FData?.[urlEventId]?.data ||
    FData?.[Number(urlEventId)]?.data ||
    FData?.active?.data ||
    Object.values(FData || {})?.[0]?.data ||
    FData?.fancyOdds ||
    (Array.isArray(FData) ? FData : null);

  const reduxRunningData = useSelector((state) => state?.marketOdds?.runningData);
  const reduxMarketName = useSelector((state) => state?.marketOdds?.marketName);
  const urlEventName = searchParams.get('eventName') || searchParams.get('title') || match?.title || match?.eventName || '';

  // Resolved dynamic match title & team names
  const resolvedMatchTitle = urlEventName || activeMatchFromStore?.eventName || activeMatchFromStore?.title || currentMatch?.title || currentMatch?.eventName || 'Pakistan W v Thailand W';
  const { team1Name, team2Name } = useMemo(() => {
    let t1 = 'Pakistan W';
    let t2 = 'Thailand W';
    if (resolvedMatchTitle) {
      const parts = resolvedMatchTitle.split(/\s+(?:v|vs)\s+/i);
      if (parts.length >= 2) {
        t1 = parts[0].trim();
        t2 = parts[1].trim();
      }
    }
    return { team1Name: t1, team2Name: t2 };
  }, [resolvedMatchTitle]);

  // Master Runner Name Lookup Map by selectionId
  const runnerNameMap = useMemo(() => {
    const map = new Map();
    const sources = [
      ...(Array.isArray(reduxRunningData) ? reduxRunningData : []),
      ...(Array.isArray(reduxMarketName) ? reduxMarketName.flatMap((m) => m?.runners || []) : []),
      ...(Array.isArray(activeMatchFromStore?.matchRunners) ? activeMatchFromStore.matchRunners : []),
      ...(Array.isArray(activeMatchFromStore?.runners) ? activeMatchFromStore.runners : []),
      ...(Array.isArray(activeMatchFromStore?.markets) ? activeMatchFromStore.markets.flatMap((m) => m?.runners || []) : []),
      ...(Array.isArray(currentMatch?.matchRunners) ? currentMatch.matchRunners : []),
      ...(Array.isArray(currentMatch?.runners) ? currentMatch.runners : []),
      ...(Array.isArray(currentMatch?.markets) ? currentMatch.markets.flatMap((m) => m?.runners || []) : []),
    ];

    sources.forEach((item) => {
      if (item?.selectionId && item?.runnerName) {
        map.set(String(item.selectionId), item.runnerName);
      }
    });

    return map;
  }, [reduxRunningData, reduxMarketName, activeMatchFromStore, currentMatch]);

  const isCricket =
    String(urlEventType) === '4' ||
    urlSport === 'cricket' ||
    String(match?.sportId) === '4' ||
    String(match?.eventType) === '4' ||
    match?.sportName?.toLowerCase() === 'cricket' ||
    activeMatchFromStore?.sportName?.toLowerCase() === 'cricket' ||
    activeMatchFromStore?.sportId === 4;

  const isSoccer =
    String(urlEventType) === '1' ||
    urlSport === 'soccer' ||
    String(match?.sportId) === '1' ||
    String(match?.eventType) === '1' ||
    match?.sportName?.toLowerCase() === 'soccer' ||
    match?.sportName?.toLowerCase() === 'football' ||
    activeMatchFromStore?.sportName?.toLowerCase() === 'soccer' ||
    activeMatchFromStore?.sportId === 1;

  const isTennis =
    String(urlEventType) === '2' ||
    urlSport === 'tennis' ||
    String(match?.sportId) === '2' ||
    String(match?.eventType) === '2' ||
    match?.sportName?.toLowerCase() === 'tennis' ||
    activeMatchFromStore?.sportName?.toLowerCase() === 'tennis' ||
    activeMatchFromStore?.sportId === 2;

  // Multi-Market List (e.g. MATCH ODDS, OVER/UNDER 1.5 GOALS, OVER/UNDER 2.5 GOALS)
  const marketsList = useMemo(() => {
    // 1. Instant & seamless Soccer Multi-Market Layout
    if (isSoccer) {
      const matchOddsMarket = Array.isArray(reduxMarketOdds)
        ? reduxMarketOdds.find((m) => {
          const name = (m?.marketName || '').toUpperCase();
          return name.includes('MATCH ODDS') || name.includes('MATCH_ODDS') || (!name.includes('1.5') && !name.includes('2.5') && !name.includes('GOAL'));
        }) || reduxMarketOdds[0]
        : null;

      const liveMatchRunners = matchOddsMarket?.runners && matchOddsMarket.runners.length > 0
        ? matchOddsMarket.runners.map((r, idx) => {
          const mappedName = runnerNameMap.get(String(r?.selectionId));
          const rawName = r?.runnerName || mappedName || '';
          const fallback = idx === 0 ? team1Name : idx === 1 ? team2Name : 'The Draw';
          const isGeneric = !rawName || rawName.toLowerCase().startsWith('runner ') || rawName.toLowerCase().startsWith('player ');
          const finalName = !isGeneric ? rawName : fallback;

          const backPrice = r?.ex?.availableToBack?.[0]?.price;
          const backSizeVal = r?.ex?.availableToBack?.[0]?.size;
          const layPrice = r?.ex?.availableToLay?.[0]?.price;
          const laySizeVal = r?.ex?.availableToLay?.[0]?.size;

          const backOdd = backPrice !== undefined && backPrice !== null && backPrice !== '' && backPrice !== 0 ? String(backPrice) : '--';
          const backSize = backSizeVal !== undefined && backSizeVal !== null && backSizeVal !== '' ? String(backSizeVal) : '--';
          const layOdd = layPrice !== undefined && layPrice !== null && layPrice !== '' && layPrice !== 0 ? String(layPrice) : '--';
          const laySize = laySizeVal !== undefined && laySizeVal !== null && laySizeVal !== '' ? String(laySizeVal) : '--';

          return {
            id: r?.selectionId ? `runner_${r.selectionId}` : `runner_0_${idx + 1}`,
            selectionId: r?.selectionId,
            name: finalName,
            back: { odd: backOdd, size: backSize },
            lay: { odd: layOdd, size: laySize },
            isSuspended: r?.status === 'SUSPENDED' || (backOdd === '--' && layOdd === '--'),
          };
        })
        : [
          { id: 'runner_1', name: team1Name || 'Port FC', back: { odd: '19', size: '26.05' }, lay: { odd: '19.5', size: '17.31' }, isSuspended: false },
          { id: 'runner_2', name: team2Name || 'Kobe', back: { odd: '1.27', size: '1.5k' }, lay: { odd: '1.29', size: '1.2k' }, isSuspended: false },
          { id: 'runner_3', name: 'The Draw', back: { odd: '6', size: '46.73' }, lay: { odd: '6.2', size: '14.46' }, isSuspended: false },
        ];

      const ou15Market = Array.isArray(reduxMarketOdds)
        ? reduxMarketOdds.find((m) => (m?.marketName || '').toUpperCase().includes('1.5'))
        : null;
      const ou15Runners = ou15Market?.runners && ou15Market.runners.length > 0
        ? ou15Market.runners.map((r, idx) => {
          const fallback = idx === 0 ? 'Under 1.5 Goals' : 'Over 1.5 Goals';
          const finalName = r?.runnerName || fallback;
          const backPrice = r?.ex?.availableToBack?.[0]?.price;
          const backSizeVal = r?.ex?.availableToBack?.[0]?.size;
          const layPrice = r?.ex?.availableToLay?.[0]?.price;
          const laySizeVal = r?.ex?.availableToLay?.[0]?.size;
          const backOdd = backPrice !== undefined && backPrice !== null && backPrice !== '' && backPrice !== 0 ? String(backPrice) : '6.2';
          const backSize = backSizeVal !== undefined && backSizeVal !== null && backSizeVal !== '' ? String(backSizeVal) : '49.48';
          const layOdd = layPrice !== undefined && layPrice !== null && layPrice !== '' && layPrice !== 0 ? String(layPrice) : '6.4';
          const laySize = laySizeVal !== undefined && laySizeVal !== null && laySizeVal !== '' ? String(laySizeVal) : '234.04';
          return {
            id: r?.selectionId ? `runner_ou15_${r.selectionId}` : `runner_ou15_${idx + 1}`,
            selectionId: r?.selectionId,
            name: finalName,
            back: { odd: backOdd, size: backSize },
            lay: { odd: layOdd, size: laySize },
            isSuspended: r?.status === 'SUSPENDED',
          };
        })
        : [
          { id: 'runner_ou_15_u', name: 'Under 1.5 Goals', back: { odd: '6.2', size: '49.48' }, lay: { odd: '6.4', size: '234.04' }, isSuspended: false },
          { id: 'runner_ou_15_o', name: 'Over 1.5 Goals', back: { odd: '1.18', size: '3.4k' }, lay: { odd: '1.2', size: '1.8k' }, isSuspended: false },
        ];

      const ou25Market = Array.isArray(reduxMarketOdds)
        ? reduxMarketOdds.find((m) => (m?.marketName || '').toUpperCase().includes('2.5'))
        : null;
      const ou25Runners = ou25Market?.runners && ou25Market.runners.length > 0
        ? ou25Market.runners.map((r, idx) => {
          const fallback = idx === 0 ? 'Under 2.5 Goals' : 'Over 2.5 Goals';
          const finalName = r?.runnerName || fallback;
          const backPrice = r?.ex?.availableToBack?.[0]?.price;
          const backSizeVal = r?.ex?.availableToBack?.[0]?.size;
          const layPrice = r?.ex?.availableToLay?.[0]?.price;
          const laySizeVal = r?.ex?.availableToLay?.[0]?.size;
          const backOdd = backPrice !== undefined && backPrice !== null && backPrice !== '' && backPrice !== 0 ? String(backPrice) : '2.14';
          const backSize = backSizeVal !== undefined && backSizeVal !== null && backSizeVal !== '' ? String(backSizeVal) : '67.46';
          const layOdd = layPrice !== undefined && layPrice !== null && layPrice !== '' && layPrice !== 0 ? String(layPrice) : '2.18';
          const laySize = laySizeVal !== undefined && laySizeVal !== null && laySizeVal !== '' ? String(laySizeVal) : '4.01';
          return {
            id: r?.selectionId ? `runner_ou25_${r.selectionId}` : `runner_ou25_${idx + 1}`,
            selectionId: r?.selectionId,
            name: finalName,
            back: { odd: backOdd, size: backSize },
            lay: { odd: layOdd, size: laySize },
            isSuspended: r?.status === 'SUSPENDED',
          };
        })
        : [
          { id: 'runner_ou_25_u', name: 'Under 2.5 Goals', back: { odd: '2.14', size: '67.46' }, lay: { odd: '2.18', size: '4.01' }, isSuspended: false },
          { id: 'runner_ou_25_o', name: 'Over 2.5 Goals', back: { odd: '1.85', size: '3.87' }, lay: { odd: '1.87', size: '67.46' }, isSuspended: false },
        ];

      return [
        {
          marketId: matchOddsMarket?.marketId || urlMarketId || 'match_odds',
          marketName: 'MATCH ODDS',
          minBet: currentMatch.minBet || '1',
          maxBet: currentMatch.maxBet || '5000',
          runners: liveMatchRunners,
        },
        {
          marketId: ou15Market?.marketId || 'over_under_15',
          marketName: 'OVER/UNDER 1.5 GOALS',
          minBet: '100',
          maxBet: '5000',
          runners: ou15Runners,
        },
        {
          marketId: ou25Market?.marketId || 'over_under_25',
          marketName: 'OVER/UNDER 2.5 GOALS',
          minBet: '100',
          maxBet: '5000',
          runners: ou25Runners,
        },
      ];
    }

    // 2. Cricket & Tennis: Strictly show single MATCH ODDS market (no Tied Match)
    if (isCricket || isTennis) {
      const matchOddsMarket = Array.isArray(reduxMarketOdds)
        ? reduxMarketOdds.find((m) => {
          const name = (m?.marketName || '').toUpperCase();
          return name.includes('MATCH ODDS') || name.includes('MATCH_ODDS') || (!name.includes('TIED') && !name.includes('TOSS') && !name.includes('COMPLETED'));
        }) || reduxMarketOdds[0]
        : null;

      const liveMatchRunners = matchOddsMarket?.runners && matchOddsMarket.runners.length > 0
        ? matchOddsMarket.runners.map((r, idx) => {
          const mappedName = runnerNameMap.get(String(r?.selectionId));
          const rawName = r?.runnerName || mappedName || '';
          const fallback = idx === 0 ? team1Name : team2Name;
          const isGeneric = !rawName || rawName.toLowerCase().startsWith('runner ') || rawName.toLowerCase().startsWith('player ');
          const finalName = !isGeneric ? rawName : fallback;

          const backPrice = r?.ex?.availableToBack?.[0]?.price;
          const backSizeVal = r?.ex?.availableToBack?.[0]?.size;
          const layPrice = r?.ex?.availableToLay?.[0]?.price;
          const laySizeVal = r?.ex?.availableToLay?.[0]?.size;

          const backOdd = backPrice !== undefined && backPrice !== null && backPrice !== '' && backPrice !== 0 ? String(backPrice) : '--';
          const backSize = backSizeVal !== undefined && backSizeVal !== null && backSizeVal !== '' ? String(backSizeVal) : '--';
          const layOdd = layPrice !== undefined && layPrice !== null && layPrice !== '' && layPrice !== 0 ? String(layPrice) : '--';
          const laySize = laySizeVal !== undefined && laySizeVal !== null && laySizeVal !== '' ? String(laySizeVal) : '--';

          return {
            id: r?.selectionId ? `runner_${r.selectionId}` : `runner_0_${idx + 1}`,
            selectionId: r?.selectionId,
            name: finalName,
            back: { odd: backOdd, size: backSize },
            lay: { odd: layOdd, size: laySize },
            isSuspended: r?.status === 'SUSPENDED' || (backOdd === '--' && layOdd === '--'),
          };
        })
        : [
          { id: 'runner_1', name: team1Name || 'Pakistan W', back: { odd: '1.08', size: '12.25' }, lay: { odd: '1.1', size: '1.03' }, isSuspended: false },
          { id: 'runner_2', name: team2Name || 'Thailand W', back: { odd: '10', size: '12.52' }, lay: { odd: '18', size: '1.04' }, isSuspended: false },
        ];

      return [
        {
          marketId: matchOddsMarket?.marketId || urlMarketId || 'match_odds',
          marketName: 'MATCH ODDS',
          minBet: currentMatch.minBet || '1',
          maxBet: currentMatch.maxBet || '1000',
          runners: liveMatchRunners,
        },
      ];
    }

    // 3. Generic / Multi-market layout for other sports
    if (Array.isArray(reduxMarketOdds) && reduxMarketOdds.length > 0) {
      return reduxMarketOdds.map((mkt, mktIdx) => {
        const rawMktName =
          mkt?.marketName ||
          activeMatchFromStore?.markets?.find((m) => String(m.marketId) === String(mkt.marketId))?.marketName ||
          (mktIdx === 0 ? 'MATCH ODDS' : `MARKET ${mktIdx + 1}`);
        const mktTitle = rawMktName.toUpperCase();

        const runnersList = (mkt?.runners || []).map((r, idx, arr) => {
          const mappedName = runnerNameMap.get(String(r?.selectionId));
          const rawName = r?.runnerName || mappedName || '';
          let fallback = idx === 0 ? team1Name : idx === 1 ? team2Name : 'The Draw';
          if (mktTitle.includes('TIED') || mktTitle.includes('TIE')) {
            fallback = idx === 0 ? 'Yes' : 'No';
          } else if (arr.length >= 3 && idx === 2) {
            fallback = 'The Draw';
          }

          const isGeneric = !rawName || rawName.toLowerCase().startsWith('runner ') || rawName.toLowerCase().startsWith('player ');
          const finalName = !isGeneric ? rawName : fallback;

          const backPrice = r?.ex?.availableToBack?.[0]?.price;
          const backSizeVal = r?.ex?.availableToBack?.[0]?.size;
          const layPrice = r?.ex?.availableToLay?.[0]?.price;
          const laySizeVal = r?.ex?.availableToLay?.[0]?.size;

          const backOdd = backPrice !== undefined && backPrice !== null && backPrice !== '' && backPrice !== 0 ? String(backPrice) : '--';
          const backSize = backSizeVal !== undefined && backSizeVal !== null && backSizeVal !== '' ? String(backSizeVal) : '--';
          const layOdd = layPrice !== undefined && layPrice !== null && layPrice !== '' && layPrice !== 0 ? String(layPrice) : '--';
          const laySize = laySizeVal !== undefined && laySizeVal !== null && laySizeVal !== '' ? String(laySizeVal) : '--';

          const isExplicitSusp = r?.status === 'SUSPENDED' || mkt?.status === 'SUSPENDED';
          const hasNoOdds = backOdd === '--' && layOdd === '--';
          const isSusp = isExplicitSusp || hasNoOdds;

          return {
            id: r?.selectionId ? `runner_${r.selectionId}` : `runner_${mktIdx}_${idx + 1}`,
            selectionId: r?.selectionId,
            name: finalName,
            back: { odd: backOdd, size: backSize },
            lay: { odd: layOdd, size: laySize },
            isSuspended: isSusp,
          };
        });

        return {
          marketId: mkt.marketId || `mkt_${mktIdx}`,
          marketName: mktTitle,
          runners: runnersList,
          minBet: currentMatch.minBet || (mktIdx === 0 ? '1' : '100'),
          maxBet: currentMatch.maxBet || (mktIdx === 0 ? '5000' : '5000'),
        };
      });
    }

    // Default 3-runner Match Odds layout (IFK Ostersund, Gottne IF, The Draw)
    return [
      {
        marketId: urlMarketId || 'match_odds',
        marketName: 'MATCH ODDS',
        minBet: '1',
        maxBet: '5000',
        runners: [
          {
            id: 'runner_1',
            name: team1Name || 'IFK Ostersund',
            back: { odd: '1.13', size: '13.91' },
            lay: { odd: '1.97', size: '15.35' },
            isSuspended: false,
          },
          {
            id: 'runner_2',
            name: team2Name || 'Gottne IF',
            back: { odd: '1.15', size: '10.16' },
            lay: { odd: '990', size: '3.22' },
            isSuspended: false,
          },
          {
            id: 'runner_3',
            name: 'The Draw',
            back: { odd: '1.12', size: '14.83' },
            lay: { odd: '950', size: '4.2' },
            isSuspended: false,
          },
        ],
      },
    ];
  }, [reduxMarketOdds, activeMatchFromStore, runnerNameMap, team1Name, team2Name, currentMatch, urlMarketId, isSoccer, isCricket, isTennis]);

  // Primary runners for default references
  const runners = useMemo(() => {
    return marketsList[0]?.runners || [];
  }, [marketsList]);

  // Extract raw bookmaker runners list whether array of runners or array of markets
  const rawBmRunners = useMemo(() => {
    if (!reduxBookmaker) return null;
    let list = reduxBookmaker;
    if (list?.data) {
      list = list.data;
    }
    if (list?.bookmakerOdds) {
      list = list.bookmakerOdds;
    }
    if (Array.isArray(list)) {
      if (list.length > 0 && Array.isArray(list[0]?.runners)) {
        return list[0].runners;
      }
      return list;
    }
    if (Array.isArray(list?.runners)) {
      return list.runners;
    }
    return null;
  }, [reduxBookmaker]);

  // Bookmaker runners matching real team names
  const bookmakerRunners = useMemo(() => {
    const name1 = team1Name || 'Pakistan W';
    const name2 = team2Name || 'Thailand W';

    if (Array.isArray(rawBmRunners) && rawBmRunners.length > 0) {
      return rawBmRunners.map((bm, idx) => {
        const mappedName = runnerNameMap.get(String(bm?.selectionId));
        const rawName = bm?.runner || bm?.runnerName || bm?.RunnerName || bm?.name || mappedName || '';
        const fallbackName = idx === 0 ? name1 : idx === 1 ? name2 : 'The Draw';
        const finalName = rawName && !rawName.toLowerCase().startsWith('runner ') ? rawName : fallbackName;

        const backPrice =
          bm?.back?.[0]?.price ??
          bm?.back?.[0]?.rate ??
          bm?.ex?.availableToBack?.[0]?.price ??
          bm?.BackPrice1 ??
          bm?.backPrice1;
        const backSizeVal =
          bm?.back?.[0]?.size ??
          bm?.ex?.availableToBack?.[0]?.size ??
          bm?.BackSize1 ??
          bm?.backSize1;
        const layPrice =
          bm?.lay?.[0]?.price ??
          bm?.lay?.[0]?.rate ??
          bm?.ex?.availableToLay?.[0]?.price ??
          bm?.LayPrice1 ??
          bm?.layPrice1;
        const laySizeVal =
          bm?.lay?.[0]?.size ??
          bm?.ex?.availableToLay?.[0]?.size ??
          bm?.LaySize1 ??
          bm?.laySize1;

        const backOdd = backPrice !== undefined && backPrice !== null && backPrice !== '' && backPrice !== 0 && backPrice !== '-' ? String(backPrice) : '0';
        const backSize = backSizeVal !== undefined && backSizeVal !== null && backSizeVal !== '' && backSizeVal !== '-' ? String(backSizeVal) : '0';
        const layOdd = layPrice !== undefined && layPrice !== null && layPrice !== '' && layPrice !== 0 && layPrice !== '-' ? String(layPrice) : '0';
        const laySize = laySizeVal !== undefined && laySizeVal !== null && laySizeVal !== '' && laySizeVal !== '-' ? String(laySizeVal) : '0';

        const statusStr = (bm?.status || bm?.GameStatus || '').toUpperCase();
        const isSusp =
          bm?.isSuspended === true ||
          bm?.suspended === true ||
          statusStr === 'SUSPENDED' ||
          statusStr === 'SUSPEND' ||
          (backOdd === '0' && layOdd === '0');

        return {
          id: bm?.selectionId ? `bm_${bm.selectionId}` : `bm_${idx + 1}`,
          selectionId: bm?.selectionId,
          name: finalName,
          back: { odd: backOdd, size: backSize },
          lay: { odd: layOdd, size: laySize },
          isSuspended: isSusp,
        };
      });
    }

    return [
      {
        id: 'bm_1',
        name: name1,
        back: { odd: '0', size: '0' },
        lay: { odd: '0', size: '0' },
        isSuspended: true,
      },
      {
        id: 'bm_2',
        name: name2,
        back: { odd: '0', size: '0' },
        lay: { odd: '0', size: '0' },
        isSuspended: true,
      },
    ];
  }, [team1Name, team2Name, rawBmRunners, runnerNameMap]);

  // Default Fancy Sessions matching dynamic match team
  const defaultFancyForMatch = useMemo(() => {
    const t1 = team1Name || 'PAK U19';
    return [
      {
        id: 'fancy_1',
        title: `50 over run ${t1} adv`,
        category: 'NORMAL',
        no: { rate: '341', size: '110' },
        yes: { rate: '343', size: '110' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_2',
        title: `50 over run ${t1} 2 adv`,
        category: 'NORMAL',
        no: { rate: '0', size: '0' },
        yes: { rate: '0', size: '0' },
        isBallRunning: true,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_3',
        title: `50 over run bhav ${t1} adv`,
        category: 'NORMAL',
        no: { rate: '340', size: '85' },
        yes: { rate: '340', size: '115' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_4',
        title: `50 over run bhav ${t1} 2 adv`,
        category: 'NORMAL',
        no: { rate: '0', size: '0' },
        yes: { rate: '0', size: '0' },
        isBallRunning: true,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_5',
        title: `47 over run ${t1}`,
        category: 'NORMAL',
        no: { rate: '308', size: '100' },
        yes: { rate: '310', size: '100' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_6',
        title: `Only 48 over run ${t1}`,
        category: 'NORMAL',
        no: { rate: '11', size: '100' },
        yes: { rate: '13', size: '100' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
      {
        id: 'fancy_7',
        title: `1st inn run odd even ${t1}`,
        category: 'NORMAL',
        no: { rate: '1.96', size: '50000' },
        yes: { rate: '1.96', size: '50000' },
        isBallRunning: false,
        isSuspended: false,
        isFav: false,
      },
    ];
  }, [team1Name]);

  const [fancyMarkets, setFancyMarkets] = useState(defaultFancyForMatch);

  useEffect(() => {
    setFancyMarkets(defaultFancyForMatch);
  }, [defaultFancyForMatch]);

  // Sync live fancy session markets from socket/Redux
  useEffect(() => {
    let rawList = null;
    if (Array.isArray(reduxFancy)) {
      rawList = reduxFancy;
    } else if (reduxFancy?.data && Array.isArray(reduxFancy.data)) {
      rawList = reduxFancy.data;
    } else if (reduxFancy?.fancyOdds && Array.isArray(reduxFancy.fancyOdds)) {
      rawList = reduxFancy.fancyOdds;
    } else if (reduxFancy && typeof reduxFancy === 'object') {
      const vals = Object.values(reduxFancy);
      if (vals.length > 0 && typeof vals[0] === 'object') {
        rawList = vals;
      }
    }

    if (Array.isArray(rawList) && rawList.length > 0) {
      const mapped = rawList
        .filter((item) => item && (item.RunnerName || item.runnerName || item.title || item.name))
        .map((item, idx) => {
          const rawTitle = item.RunnerName || item.runnerName || item.title || item.name || `Session ${idx + 1}`;
          const rawId = item.SelectionId || item.selectionId || item.id || `fancy_${idx + 1}`;
          const rawStatus = (item.GameStatus || item.gstatus || item.status || '').toUpperCase();
          const isBallRun = Boolean(
            item.BallRunning === true ||
            item.ballRunning === true ||
            item.isBallRunning === true ||
            rawStatus === 'BALL RUNNING' ||
            rawStatus === 'BALLRUNNING'
          );
          const isExplicitSusp = Boolean(
            item.suspended === true ||
            item.isSuspended === true ||
            rawStatus === 'SUSPENDED' ||
            rawStatus === 'SUSPEND'
          );

          const rawLayPrice = item.LayPrice1 ?? item.layPrice1 ?? item.noPrice ?? item.noRate ?? item.no?.rate ?? item.lay?.odd;
          const rawLaySize = item.LaySize1 ?? item.laySize1 ?? item.noSize ?? item.noSizeVal ?? item.no?.size ?? item.lay?.size;
          const rawBackPrice = item.BackPrice1 ?? item.backPrice1 ?? item.yesPrice ?? item.yesRate ?? item.yes?.rate ?? item.back?.odd;
          const rawBackSize = item.BackSize1 ?? item.backSize1 ?? item.yesSize ?? item.yesSizeVal ?? item.yes?.size ?? item.back?.size;

          const noRate = rawLayPrice !== undefined && rawLayPrice !== null && rawLayPrice !== '-' ? String(rawLayPrice) : '0';
          const noSize = rawLaySize !== undefined && rawLaySize !== null && rawLaySize !== '-' ? String(rawLaySize) : '0';
          const yesRate = rawBackPrice !== undefined && rawBackPrice !== null && rawBackPrice !== '-' ? String(rawBackPrice) : '0';
          const yesSize = rawBackSize !== undefined && rawBackSize !== null && rawBackSize !== '-' ? String(rawBackSize) : '0';

          const hasZeroOdds = (noRate === '0' || noRate === '') && (yesRate === '0' || yesRate === '');
          const isSusp = isExplicitSusp || (!isBallRun && hasZeroOdds);

          return {
            id: String(rawId),
            title: rawTitle,
            category: rawTitle.toLowerCase().includes('ball') ? 'BALL BY BALL' : 'NORMAL',
            no: { rate: noRate, size: noSize },
            yes: { rate: yesRate, size: yesSize },
            isBallRunning: isBallRun,
            isSuspended: isSusp,
            isFav: false,
          };
        });

      if (mapped.length > 0) {
        setFancyMarkets(mapped);
      }
    }
  }, [reduxFancy]);

  // Has valid real bookmaker data (not null or empty array)
  const hasBookmakerData = useMemo(() => {
    if (!rawBmRunners || !Array.isArray(rawBmRunners) || rawBmRunners.length === 0) return false;
    return rawBmRunners.some(
      (r) =>
        r &&
        typeof r === 'object' &&
        (r.runner || r.runnerName || r.RunnerName || r.name) &&
        r.runner !== 'null' &&
        r.name !== 'null'
    );
  }, [rawBmRunners]);

  // In cricket, bookmaker is standard. In soccer/tennis, only show if real bookmaker data exists.
  const showBookmakerSection = isCricket || hasBookmakerData;

  // Has valid real fancy data
  const hasFancyData = useMemo(() => {
    if (!reduxFancy) return false;
    let list = Array.isArray(reduxFancy)
      ? reduxFancy
      : reduxFancy?.data || reduxFancy?.fancyOdds || [];
    return (
      Array.isArray(list) &&
      list.length > 0 &&
      list.some((item) => item && (item.RunnerName || item.runnerName || item.title || item.name))
    );
  }, [reduxFancy]);

  // Only show fancy if real live fancy data exists
  const showFancySection = hasFancyData;

  // Saved / Starred Favorite Sections with LocalStorage persistence
  const [favoriteSections, setFavoriteSections] = useState(() => {
    try {
      const saved = localStorage.getItem('kuber_favorite_sections');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSectionFav = (key) => {
    setFavoriteSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('kuber_favorite_sections', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save fav sections', e);
      }
      return next;
    });
  };

  // Toss Market (Cricket / Special matches)
  const tossMarket = useMemo(() => {
    const fromOdds = Array.isArray(reduxMarketOdds)
      ? reduxMarketOdds.find((m) => (m?.marketName || m?.market || '').toLowerCase().includes('toss'))
      : null;
    const fromStore = activeMatchFromStore?.markets?.find((m) =>
      (m?.marketName || m?.market || '').toLowerCase().includes('toss')
    );
    const fromCurrent = currentMatch?.markets?.find((m) =>
      (m?.marketName || m?.market || '').toLowerCase().includes('toss')
    );
    const fromMatch = match?.markets?.find((m) =>
      (m?.marketName || m?.market || '').toLowerCase().includes('toss')
    );
    return fromOdds || fromStore || fromCurrent || fromMatch || null;
  }, [reduxMarketOdds, activeMatchFromStore, currentMatch, match]);

  const parsedEventName = decodeURIComponent(searchParams.get('eventName') || '').toLowerCase();
  const matchTitle = (currentMatch?.title || match?.title || activeMatchFromStore?.title || parsedEventName || urlEventName || '').toLowerCase();

  // Show Toss section when tossMarket exists or in cricket matches with toss
  const showTossSection = isCricket && Boolean(
    tossMarket ||
    match?.hasToss ||
    searchParams.get('toss') === 'true' ||
    matchTitle.includes('toss') ||
    matchTitle.includes('england') ||
    matchTitle.includes('sri lanka') ||
    team1Name?.toLowerCase()?.includes('england') ||
    team2Name?.toLowerCase()?.includes('sri lanka')
  );

  const tossRunners = useMemo(() => {
    const liveRunners = tossMarket?.runners && Array.isArray(tossMarket.runners) && tossMarket.runners.length > 0
      ? tossMarket.runners
      : null;

    if (liveRunners) {
      return liveRunners.map((r, idx) => {
        const mappedName = runnerNameMap.get(String(r?.selectionId));
        const rawName = r?.runnerName || r?.name || mappedName || '';
        const fallback = idx === 0 ? team1Name : team2Name;
        const isGeneric = !rawName || rawName.toLowerCase().startsWith('runner ') || rawName.toLowerCase().startsWith('player ');
        const finalName = !isGeneric ? rawName : fallback;

        const backPrice = r?.ex?.availableToBack?.[0]?.price;
        const backSizeVal = r?.ex?.availableToBack?.[0]?.size;
        const layPrice = r?.ex?.availableToLay?.[0]?.price;
        const laySizeVal = r?.ex?.availableToLay?.[0]?.size;

        const backOdd = backPrice !== undefined && backPrice !== null && backPrice !== '' && backPrice !== 0 ? String(backPrice) : '1.95';
        const backSize = backSizeVal !== undefined && backSizeVal !== null && backSizeVal !== '' ? String(backSizeVal) : '50k';
        const layOdd = layPrice !== undefined && layPrice !== null && layPrice !== '' && layPrice !== 0 ? String(layPrice) : '-';
        const laySize = laySizeVal !== undefined && laySizeVal !== null && laySizeVal !== '' ? String(laySizeVal) : '-';

        const isSusp = r?.status === 'SUSPENDED' || tossMarket?.status === 'SUSPENDED';

        return {
          id: r?.selectionId ? `toss_runner_${r.selectionId}` : `toss_runner_${idx + 1}`,
          selectionId: r?.selectionId,
          name: finalName,
          back: { odd: backOdd, size: backSize },
          lay: { odd: layOdd, size: laySize },
          isSuspended: isSusp,
        };
      });
    }

    return [
      { id: 'toss_runner_1', name: team1Name || 'England', back: { odd: '1.95', size: '50k' }, lay: { odd: '-', size: '-' }, isSuspended: false },
      { id: 'toss_runner_2', name: team2Name || 'Sri Lanka', back: { odd: '1.95', size: '50k' }, lay: { odd: '-', size: '-' }, isSuspended: false },
    ];
  }, [tossMarket, runnerNameMap, team1Name, team2Name]);

  // Tab State: 'fancy' | 'ball_by_ball' | 'normal'
  const [activeFancyTab, setActiveFancyTab] = useState('fancy');

  // Filter fancy markets based on active tab ('fancy' | 'ball_by_ball' | 'normal')
  const displayedFancyMarkets = useMemo(() => {
    const t2 = team2Name || 'THA W';
    const t2Parts = t2.split(' ');
    const t2Short = t2Parts.length > 1 ? `${t2Parts[0]} ${t2Parts[1][0] || ''}`.trim() : t2;

    if (activeFancyTab === 'ball_by_ball') {
      const bbbItems = fancyMarkets.filter(
        (m) => m.category === 'BALL BY BALL' || m.title.toLowerCase().includes('ball')
      );
      if (bbbItems.length > 0) return bbbItems;
      return [
        { id: 'bbb_1', title: `2.1 ball run ${t2Short}`, category: 'BALL BY BALL', isSuspended: true, isFav: false },
        { id: 'bbb_2', title: `2.2 ball run ${t2Short}`, category: 'BALL BY BALL', isSuspended: true, isFav: false },
        { id: 'bbb_3', title: `2.3 ball run ${t2Short}`, category: 'BALL BY BALL', isSuspended: true, isFav: false },
        { id: 'bbb_4', title: `2.4 ball run ${t2Short}`, category: 'BALL BY BALL', isSuspended: true, isFav: false },
        { id: 'bbb_5', title: `2.5 ball run ${t2Short}`, category: 'BALL BY BALL', isSuspended: true, isFav: false },
        { id: 'bbb_6', title: `2.6 ball run ${t2Short}`, category: 'BALL BY BALL', isSuspended: true, isFav: false },
      ];
    } else if (activeFancyTab === 'normal') {
      const normalItems = fancyMarkets.filter(
        (m) => m.category !== 'BALL BY BALL' && !m.title.toLowerCase().includes('ball')
      );
      return normalItems.length > 0 ? normalItems : fancyMarkets;
    }
    return fancyMarkets;
  }, [activeFancyTab, fancyMarkets, team2Name]);

  // Interactive Bet Slip State: { marketType: 'match_odds'|'bookmaker'|'toss'|'fancy', runnerId, runnerName, type: 'back'|'lay'|'no'|'yes', odd, size } | null
  const [activeBet, setActiveBet] = useState(null);
  const [oddsValue, setOddsValue] = useState('1.94');
  const [stakeValue, setStakeValue] = useState('0');
  const [myBetsOpen, setMyBetsOpen] = useState(false);
  const [openBetsTab, setOpenBetsTab] = useState('matched');
  const [averageOdds, setAverageOdds] = useState(false);
  const [placedBets, setPlacedBets] = useState([]);
  const [tvStreamOpen, setTvStreamOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    hideMatchOdds: false,
    hideBookmaker: false,
    hideFancy: false,
    hideTiedMatch: false,
    hideToss: false,
  });
  const [tempFilters, setTempFilters] = useState({
    hideMatchOdds: false,
    hideBookmaker: false,
    hideFancy: false,
    hideTiedMatch: false,
    hideToss: false,
  });

  const filteredMarketsList = useMemo(() => {
    return marketsList.filter((mkt) => {
      const nameUpper = (mkt.marketName || '').toUpperCase();
      if (filters.hideMatchOdds && (nameUpper.includes('MATCH ODDS') || nameUpper.includes('MATCH_ODDS'))) {
        return false;
      }
      if (filters.hideTiedMatch && (nameUpper.includes('TIED') || nameUpper.includes('DRAW'))) {
        return false;
      }
      if (filters.hideToss && nameUpper.includes('TOSS')) {
        return false;
      }
      return true;
    });
  }, [marketsList, filters]);

  const toggleFancyFav = (id) => {
    setFancyMarkets((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFav: !item.isFav } : item
      )
    );
  };

  const handleSelectBet = (
    marketType,
    runnerId,
    runnerName,
    type,
    oddVal,
    marketName = '',
    selectionId = ''
  ) => {
    if (
      activeBet &&
      activeBet.marketType === marketType &&
      (activeBet.runnerId === runnerId || activeBet.runnerName === runnerName) &&
      activeBet.type === type
    ) {
      // Toggle off if clicking the same box
      setActiveBet(null);
    } else {
      setActiveBet({
        marketType,
        marketName:
          marketName ||
          (marketType === 'bookmaker'
            ? 'Bookmaker'
            : marketType === 'toss'
              ? 'Toss'
              : marketType === 'fancy'
                ? 'Fancy'
                : 'Match Odds'),
        runnerId,
        selectionId: selectionId || runnerId,
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

  const getStoredStakes = () => {
    try {
      const saved = localStorage.getItem('kuber_stakes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s) => ({
            label: s.name || `${s.value}`,
            val: Number(s.value) || 0,
          }));
        }
      }
      const savedAlt = localStorage.getItem('kuber_user_stakes');
      if (savedAlt) {
        const parsedAlt = JSON.parse(savedAlt);
        if (Array.isArray(parsedAlt) && parsedAlt.length > 0) {
          return parsedAlt.map((val) => ({
            label: val >= 1000 ? `${val / 1000}k` : `${val}`,
            val: Number(val) || 0,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { label: '1k', val: 1000 },
      { label: '2k', val: 2000 },
      { label: '5k', val: 5000 },
      { label: '10k', val: 10000 },
      { label: '20k', val: 20000 },
      { label: '25k', val: 25000 },
      { label: '50k', val: 50000 },
      { label: '75k', val: 75000 },
    ];
  };

  const [stakeChips, setStakeChips] = useState(getStoredStakes);

  useEffect(() => {
    const handleStakesUpdate = () => {
      setStakeChips(getStoredStakes());
    };
    window.addEventListener('kuber_stakes_updated', handleStakesUpdate);
    window.addEventListener('storage', handleStakesUpdate);
    return () => {
      window.removeEventListener('kuber_stakes_updated', handleStakesUpdate);
      window.removeEventListener('storage', handleStakesUpdate);
    };
  }, []);

  // 1. Centralized Placed Bets (Synced from Redux and LocalStorage so socket updates never erase P&L)
  const reduxPlacedBets = useSelector((state) => state?.account?.bets || []);
  const [localBets, setLocalBets] = useState(() => {
    try {
      const stored = localStorage.getItem('kuber_placed_bets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const allPlacedBets = useMemo(() => {
    const combined = [...localBets];
    reduxPlacedBets.forEach((rb) => {
      if (!combined.some((cb) => cb.id === rb.id || (cb.time === rb.time && cb.runner === rb.runner && cb.stake === rb.stake))) {
        combined.push(rb);
      }
    });
    return combined;
  }, [localBets, reduxPlacedBets]);

  // 2. Calculate confirmed P&L from placed bets for any runner in any market (Mahadev pattern)
  const calculateBetValues = useCallback(
    (runner, marketId, marketName) => {
      const filteredBets = allPlacedBets.filter((pb) => {
        const eventMatch =
          !pb.eventId ||
          !urlEventId ||
          String(pb.eventId) === String(urlEventId) ||
          String(pb.matchId) === String(urlEventId) ||
          (currentMatch?.title && String(pb.match)?.toLowerCase() === String(currentMatch?.title)?.toLowerCase()) ||
          (currentMatch?.title && String(pb.event)?.toLowerCase() === String(currentMatch?.title)?.toLowerCase());

        const mktMatch =
          !pb.marketId ||
          !marketId ||
          String(pb.marketId) === String(marketId) ||
          (marketId === 'match_odds' && String(pb.marketId).startsWith('1.')) ||
          (String(marketId).startsWith('1.') && pb.marketId === 'match_odds') ||
          (marketName && String(pb.market)?.toLowerCase() === String(marketName).toLowerCase()) ||
          (marketName && String(pb.markettype)?.toLowerCase() === String(marketName).toLowerCase());

        return eventMatch && mktMatch;
      });

      if (filteredBets.length === 0) return null;

      const runnerNameNorm = String(
        runner?.name || runner?.runnerName || runner?.runner || runner?.selection || (typeof runner === 'string' ? runner : '')
      ).toLowerCase().trim();

      const runnerIdNorm = String(
        runner?.selectionId || runner?.id || (typeof runner === 'string' || typeof runner === 'number' ? runner : '')
      ).toLowerCase().trim();

      const cleanRunnerId = runnerIdNorm.replace(/^runner_/, '').replace(/^runner_ou15_/, '').replace(/^runner_ou25_/, '');

      const isThisRunner = (fb) => {
        const fbNameNorm = String(fb?.runner || fb?.selection || fb?.runnerName || '').toLowerCase().trim();
        const fbIdNorm = String(fb?.selectionId || fb?.id || '').toLowerCase().trim();
        const cleanFbId = fbIdNorm.replace(/^runner_/, '').replace(/^runner_ou15_/, '').replace(/^runner_ou25_/, '');

        const nameMatches = Boolean(
          fbNameNorm &&
          runnerNameNorm &&
          (fbNameNorm === runnerNameNorm ||
            fbNameNorm.includes(runnerNameNorm) ||
            runnerNameNorm.includes(fbNameNorm))
        );

        const idMatches = Boolean(
          (fbIdNorm && (fbIdNorm === runnerIdNorm || cleanFbId === cleanRunnerId)) ||
          (runner?.selectionId && String(fb?.selectionId) === String(runner.selectionId))
        );

        return idMatches || nameMatches;
      };

      const fbOfThisRunner = filteredBets.filter(isThisRunner);
      const fbOfOtherRunners = filteredBets.filter((fb) => !isThisRunner(fb));

      const thisRunnerSum = fbOfThisRunner.reduce(
        (acc, fbr) =>
          acc +
          (fbr.type === 'Back' || fbr.type === 'back'
            ? Number(fbr.favourMargin || 0)
            : -Number(fbr.againstMargin || 0)),
        0
      );

      const otherRunnerSum = fbOfOtherRunners.reduce(
        (acc, fbor) =>
          acc +
          (fbor.type === 'Back' || fbor.type === 'back'
            ? -Number(fbor.againstMargin || 0)
            : Number(fbor.favourMargin || 0)),
        0
      );

      const total = Math.round(thisRunnerSum + otherRunnerSum);
      if (total === 0) return null;

      return {
        isPositive: total > 0,
        text: Math.abs(total).toLocaleString(),
        val: total,
      };
    },
    [allPlacedBets, urlEventId, currentMatch?.title]
  );

  // 3. Calculate live projected or confirmed P&L to display on runner
  const getProjectedPL = (marketType, runner, marketName = '') => {
    const rId = typeof runner === 'object' ? (runner.selectionId || runner.id) : runner;
    const rName = typeof runner === 'object' ? (runner.name || runner.runnerName || runner.runner) : runner;

    // A. Active Betslip Projection
    if (
      activeBet &&
      (activeBet.marketType === marketType ||
        (marketType === 'match_odds' &&
          (activeBet.marketType === 'match_odds' || String(activeBet.marketType).startsWith('1.'))) ||
        (String(marketType).startsWith('1.') &&
          (activeBet.marketType === 'match_odds' || String(activeBet.marketType).startsWith('1.'))) ||
        (activeBet.marketName &&
          marketName &&
          String(activeBet.marketName).toLowerCase() === String(marketName).toLowerCase()))
    ) {
      const stakeNum = parseFloat(stakeValue) || 0;
      if (stakeNum > 0) {
        const oddsNum = parseFloat(oddsValue) || 0;
        const isDecimal = oddsNum > 1;
        const calcProfit = isDecimal
          ? Math.round(stakeNum * (oddsNum - 1))
          : Math.round(stakeNum * oddsNum);

        const activeRunnerNameNorm = String(activeBet.runnerName || activeBet.runner || '').toLowerCase().trim();
        const activeRunnerIdNorm = String(activeBet.runnerId || activeBet.selectionId || '').toLowerCase().trim();
        const curRunnerNameNorm = String(rName || '').toLowerCase().trim();
        const curRunnerIdNorm = String(rId || '').toLowerCase().trim();

        const isActiveRunner =
          (activeRunnerIdNorm &&
            (activeRunnerIdNorm === curRunnerIdNorm ||
              activeRunnerIdNorm.replace(/^runner_/, '') === curRunnerIdNorm.replace(/^runner_/, ''))) ||
          (activeRunnerNameNorm &&
            curRunnerNameNorm &&
            (activeRunnerNameNorm === curRunnerNameNorm ||
              activeRunnerNameNorm.includes(curRunnerNameNorm) ||
              curRunnerNameNorm.includes(activeRunnerNameNorm)));

        const existingVal = calculateBetValues(runner, marketType, marketName)?.val || 0;

        if (activeBet.type === 'back' || activeBet.type === 'Back') {
          const total = isActiveRunner ? existingVal + calcProfit : existingVal - stakeNum;
          return {
            isPositive: total >= 0,
            text: Math.abs(total).toLocaleString(),
            isProjected: true,
          };
        } else if (activeBet.type === 'lay' || activeBet.type === 'Lay') {
          const total = isActiveRunner ? existingVal - calcProfit : existingVal + stakeNum;
          return {
            isPositive: total >= 0,
            text: Math.abs(total).toLocaleString(),
            isProjected: true,
          };
        }
      }
    }

    // B. Confirmed P&L from placed bets (never erases during socket updates)
    const confirmed = calculateBetValues(runner, marketType, marketName);
    if (confirmed) {
      return {
        isPositive: confirmed.isPositive,
        text: confirmed.text,
        isProjected: false,
      };
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

  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const handlePlaceBet = async () => {
    const stakeNum = parseFloat(stakeValue) || 0;
    if (stakeNum <= 0) {
      alert('Please enter a valid stake amount.');
      return;
    }

    const availableBal = user?.balance !== undefined ? user.balance : 1500;
    if (stakeNum > availableBal) {
      alert('Insufficient balance to place this bet.');
      return;
    }

    setIsPlacingBet(true);

    const oddsNum = parseFloat(oddsValue) || 0;
    const isDecimal = oddsNum > 1;
    const calcProfit = isDecimal
      ? Math.round(stakeNum * (oddsNum - 1))
      : Math.round(stakeNum * oddsNum);

    const mktType = activeBet?.marketType;
    const selRunnerId = activeBet?.selectionId || activeBet?.runnerId;
    const selRunnerName = activeBet?.runnerName || activeBet?.runner || '';
    const mktName =
      activeBet?.marketName ||
      (mktType === 'bookmaker'
        ? 'Bookmaker'
        : mktType === 'toss'
          ? 'Toss'
          : mktType === 'fancy'
            ? 'Fancy'
            : 'Match Odds');

    const newBet = {
      id: Date.now(),
      eventId: String(urlEventId),
      matchId: String(urlEventId),
      marketId: String(mktType),
      market: mktName,
      markettype: mktName,
      selectionId: String(selRunnerId),
      match: currentMatch?.title || 'Match',
      event: currentMatch?.title || 'Match',
      runner: selRunnerName,
      runnerName: selRunnerName,
      selection: selRunnerName,
      type: activeBet?.type === 'lay' || activeBet?.type === 'Lay' ? 'Lay' : 'Back',
      odds: oddsValue,
      price: oddsValue,
      stake: String(stakeNum),
      favourMargin: calcProfit,
      againstMargin: stakeNum,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // If logged in via Demo API / Real socket, also attempt socket placeBet
    try {
      if (localStorage.getItem('userId') || localStorage.getItem('token')) {
        await placeBet({
          ...newBet,
          sportsName: urlSport || 'cricket',
          eventType: urlEventType || 4,
          legueId: urlCompetitionId || '12830953',
          competitionId: urlCompetitionId || '12830953',
        });
      }
    } catch (err) {
      console.log('Socket placeBet notice (falling back to local state):', err);
    }

    setIsPlacingBet(false);

    setLocalBets((prev) => {
      const updated = [newBet, ...prev];
      try {
        localStorage.setItem('kuber_placed_bets', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    try {
      dispatch(addLatestBet(newBet));
    } catch (e) {
      console.error(e);
    }

    if (onPlaceBetSuccess) {
      onPlaceBetSuccess({
        match: currentMatch?.title || 'Match',
        runner: selRunnerName,
        type: activeBet?.type,
        odds: oddsValue,
        stake: stakeValue,
      });
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

  const isHorseRacing = Boolean(
    urlSport === 'horse' ||
    urlSport === 'greyhound' ||
    String(urlEventType) === '7' ||
    String(urlEventType) === '43' ||
    currentMatch?.sport === 'horse' ||
    currentMatch?.sport === 'greyhound' ||
    currentMatch?.isRacing ||
    currentMatch?.horses ||
    (typeof currentMatch?.id === 'string' && (currentMatch.id.startsWith('race_') || currentMatch.id.startsWith('hr_') || currentMatch.id.startsWith('gh_'))) ||
    (typeof currentMatch?.title === 'string' && (
      currentMatch.title.toLowerCase().includes('claim') ||
      currentMatch.title.toLowerCase().includes('charles town') ||
      currentMatch.title.toLowerCase().includes('hand stakes') ||
      currentMatch.title.toLowerCase().includes('gold cup') ||
      currentMatch.title.toLowerCase().includes('open 400m')
    ))
  );

  // Redux Selectors for Horse and Greyhound live markets
  const reduxHorseMarkets = useSelector((state) => state?.horse?.horseMarkets || []);
  const reduxGreyhoundMarkets = useSelector((state) => state?.greyhound?.greyhoundMarkets || []);
  const isHorse = urlSport === 'horse' || (!urlSport.includes('greyhound') && !urlSport.includes('dog'));
  const racingMarketList = isHorse ? reduxHorseMarkets : reduxGreyhoundMarkets;
  const effectiveGmid = searchParams.get('gmid') || urlMarketId || urlEventId || currentMatch?.id;

  const liveRacingMarket = useMemo(() => {
    if (!Array.isArray(racingMarketList) || racingMarketList.length === 0) return null;
    return racingMarketList.find(
      (m) => String(m?.gmid) === String(effectiveGmid) || String(m?.eventId) === String(urlEventId)
    );
  }, [racingMarketList, effectiveGmid, urlEventId]);

  // Dynamic countdown timer for race (default ~01:03:03 matching screenshot)
  const [countdownSeconds, setCountdownSeconds] = useState(3783);
  useEffect(() => {
    if (!isHorseRacing) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isHorseRacing]);

  const formattedRemaining = useMemo(() => {
    const hrs = String(Math.floor(countdownSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((countdownSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(countdownSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }, [countdownSeconds]);

  const horseList = useMemo(() => {
    if (liveRacingMarket) {
      const matchOddsSection = Array.isArray(liveRacingMarket.odds)
        ? liveRacingMarket.odds.find((e) => e?.mname === 'MATCH_ODDS') || liveRacingMarket.odds[0]
        : liveRacingMarket.odds;

      const rawRunners = matchOddsSection?.section || matchOddsSection?.runners || (Array.isArray(liveRacingMarket.odds) ? liveRacingMarket.odds : []);
      if (Array.isArray(rawRunners) && rawRunners.length > 0) {
        const defaultSilks = ['wantoknowwhatloveis', 'doctorino', 'severan', 'north_sea', 'ratounet', 'deal_daily', 'tacticien'];
        return rawRunners.map((r, idx) => {
          let name = r.nat || r.runnerName || r.name || `Runner ${idx + 1}`;
          if (name.includes('.')) {
            const parts = name.split('.');
            if (parts.length > 1 && !isNaN(parts[0])) name = parts.slice(1).join('.').trim();
          }
          const jockey = r.jname || r.jockey || r.trainer || '';
          const backOdd = r.b1 || r.back?.[0]?.price || r.back?.[0]?.odd || '-';
          const backSize = r.bs1 || r.back?.[0]?.size || '-';
          const layOdd = r.l1 || r.lay?.[0]?.price || r.lay?.[0]?.odd || '-';
          const laySize = r.ls1 || r.lay?.[0]?.size || '-';
          const isSusp = r.status === 'SUSPENDED' || matchOddsSection?.status === 'SUSPENDED' || (backOdd === '-' && layOdd === '-');

          return {
            id: String(r.sid || r.id || `runner_${idx + 1}`),
            num: r.cno || r.number || idx + 1,
            name,
            jockey,
            silk: r.silk || defaultSilks[idx % defaultSilks.length],
            himg: r.himg,
            back: { odd: String(backOdd), size: String(backSize) },
            lay: { odd: String(layOdd), size: String(laySize) },
            isSuspended: isSusp,
            selectionId: r.sid || r.id || `runner_${idx + 1}`,
          };
        });
      }
    }

    if (currentMatch.horses && Array.isArray(currentMatch.horses) && currentMatch.horses.length > 0) {
      return currentMatch.horses;
    }

    return [];
  }, [liveRacingMarket, currentMatch]);

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
          {isHorseRacing
            ? (currentMatch.dateTimeStr || currentMatch.time || '11/09/2026 06:32:00')
            : (isInplay ? 'INPLAY' : (currentMatch.time || '13/09/2026 22:00:00'))}
        </div>

        {/* Right: 4 Golden Action Buttons matching reference image */}
        <div className="flex items-center gap-[3px]">
          {/* Filter button */}
          <button
            type="button"
            onClick={() => {
              setTempFilters(filters);
              setFilterModalOpen(true);
            }}
            style={{
              background: 'transparent linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f) 0% 0% no-repeat padding-box',
            }}
            className={`py-[6px] px-[9px] rounded-[4px] flex items-center justify-center text-black cursor-pointer hover:brightness-105 active:scale-95 shadow-2xs ${filterModalOpen ? 'ring-2 ring-amber-600' : ''
              }`}
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

      {/* Optional Score / Stats Area matching user preference */}
      {statsOpen && (
        <div className="w-full bg-black text-white py-6 px-4 text-center my-1 rounded-[4px] shadow-sm animate-in fade-in duration-150">
          {(() => {
            const rawScore =
              activeMatchFromStore?.score ||
              activeMatchFromStore?.matchScore ||
              activeMatchFromStore?.scoreCard ||
              currentMatch?.score ||
              currentMatch?.scoreCard ||
              null;

            const t1Score =
              rawScore?.team1Score ||
              rawScore?.team1 ||
              rawScore?.t1Score ||
              currentMatch?.team1Score ||
              null;

            const t2Score =
              rawScore?.team2Score ||
              rawScore?.team2 ||
              rawScore?.t2Score ||
              currentMatch?.team2Score ||
              null;

            const hasScore = Boolean(
              (t1Score && t1Score !== '--') ||
              (t2Score && t2Score !== '--') ||
              rawScore?.scoreStr ||
              rawScore?.status
            );

            if (hasScore) {
              return (
                <div className="w-full max-w-[400px] mx-auto flex flex-col gap-2.5 items-center">
                  {/* Header Badge */}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                    <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">
                      LIVE SCORE
                    </span>
                  </div>

                  {/* Scorecard Container */}
                  <div className="w-full bg-[#181818] border border-[#333] rounded-[8px] p-3.5 flex flex-col gap-2.5 shadow-md">
                    {/* Team 1 Row */}
                    <div className="flex items-center justify-between font-bold text-[14px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-white font-extrabold truncate">{team1Name}</span>
                      </div>
                      <span className="text-[#f5c531] font-mono font-black text-[15px] shrink-0">
                        {t1Score || '-'}
                      </span>
                    </div>

                    <div className="h-[1px] bg-[#282828] w-full" />

                    {/* Team 2 Row */}
                    <div className="flex items-center justify-between font-bold text-[14px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-white font-extrabold truncate">{team2Name}</span>
                      </div>
                      <span className="text-[#f5c531] font-mono font-black text-[15px] shrink-0">
                        {t2Score || '-'}
                      </span>
                    </div>

                    {/* Status bar */}
                    {(rawScore?.status || rawScore?.crr || currentMatch?.scoreStatus) && (
                      <div className="mt-1 pt-2 border-t border-[#2a2a2a] flex items-center justify-between text-[11px] font-bold text-gray-400">
                        {rawScore?.crr && <span className="text-amber-400 uppercase tracking-wider">CRR: {rawScore.crr}</span>}
                        <span className="uppercase text-gray-300">
                          {rawScore?.status || currentMatch?.scoreStatus || ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <p className="text-[24px] sm:text-[28px] font-extrabold text-white leading-[1.25] tracking-tight max-w-[320px] mx-auto select-none py-4">
                Score will be available once the match starts
              </p>
            );
          })()}
        </div>
      )}

      {/* Optional TV Stream Area */}
      {tvStreamOpen && (
        <div className="mx-2 mb-2 p-3 bg-black text-white rounded-[6px] text-center">
          <p className="font-bold text-xs text-amber-400 uppercase tracking-wider mb-1">Live Broadcast</p>
          <p className="text-xs text-gray-300">Live feed connected for {currentMatch.title}</p>
        </div>
      )}

      {/* OPEN BETS MODAL OVERLAY MATCHING REFERENCE DESIGN */}
      {myBetsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[1px] p-2">
          <div className="w-full max-w-[360px] bg-white rounded-[8px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border duration-150">
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
              }}
              className="px-4 py-3 flex items-center justify-between shadow-xs"
            >
              <span className="font-extrabold text-[15.5px] text-black">
                Open Bets
              </span>
              <button
                type="button"
                onClick={() => setMyBetsOpen(false)}
                className="text-white font-extrabold text-[18px] leading-none hover:opacity-70 transition-opacity px-1 cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 bg-white flex flex-col gap-3">
              {/* Checkbox: Average Odds */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-[13px] font-semibold text-[#212529]">
                <input
                  type="checkbox"
                  checked={averageOdds}
                  onChange={(e) => setAverageOdds(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-gray-400 accent-[#007bff] cursor-pointer"
                />
                <span>Average Odds</span>
              </label>

              {/* Separator line */}
              <div className="h-[1px] bg-gray-200 w-full my-0.5" />

              {/* Tab Pills: Matched, Bookmaker, Fancy */}
              <div className="grid grid-cols-3 gap-1 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenBetsTab('matched')}
                  style={{
                    background: openBetsTab === 'matched' ? 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)' : 'transparent',
                  }}
                  className={`py-1.5 font-bold text-[13px] rounded-[4px] cursor-pointer transition-all ${
                    openBetsTab === 'matched' ? 'text-black shadow-xs' : 'text-gray-800 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Matched
                </button>
                <button
                  type="button"
                  onClick={() => setOpenBetsTab('bookmaker')}
                  style={{
                    background: openBetsTab === 'bookmaker' ? 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)' : 'transparent',
                  }}
                  className={`py-1.5 font-bold text-[13px] rounded-[4px] cursor-pointer transition-all ${
                    openBetsTab === 'bookmaker' ? 'text-black shadow-xs' : 'text-gray-800 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Bookmaker
                </button>
                <button
                  type="button"
                  onClick={() => setOpenBetsTab('fancy')}
                  style={{
                    background: openBetsTab === 'fancy' ? 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)' : 'transparent',
                  }}
                  className={`py-1.5 font-bold text-[13px] rounded-[4px] cursor-pointer transition-all ${
                    openBetsTab === 'fancy' ? 'text-black shadow-xs' : 'text-gray-800 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Fancy
                </button>
              </div>

              {/* Table Container */}
              <div className="w-full border border-gray-200 rounded-[4px] overflow-hidden mt-1">
                {/* Table Header (Gray Bar) */}
                <div className="grid grid-cols-4 px-2 py-2 bg-[#e0e0e0] font-bold text-[12px] text-[#212529] text-center uppercase tracking-tight">
                  <span>Selection</span>
                  <span>Odds</span>
                  <span>Stake</span>
                  <span>Date/Time</span>
                </div>

                {/* Table Content */}
                <div className="bg-white min-h-[100px] flex flex-col justify-center">
                  {(() => {
                    const filteredList = placedBets.filter((b) => {
                      if (openBetsTab === 'bookmaker') return b.marketType === 'bookmaker' || b.marketName === 'Bookmaker';
                      if (openBetsTab === 'fancy') return b.marketType === 'fancy' || b.marketName === 'Fancy';
                      // default 'matched'
                      return b.marketType !== 'bookmaker' && b.marketType !== 'fancy';
                    });

                    if (filteredList.length === 0) {
                      return (
                        <div className="py-8 text-center text-[#212529] font-bold text-[13px]">
                          No data found!
                        </div>
                      );
                    }

                    return (
                      <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto">
                        {filteredList.map((b) => (
                          <div key={b.id} className="grid grid-cols-4 px-2 py-2 text-[11.5px] text-center items-center font-semibold text-[#212529]">
                            <span className="truncate text-left font-bold">{b.runner}</span>
                            <span>{b.odds}</span>
                            <span>₹{b.stake}</span>
                            <span className="text-[10px] text-gray-500">{b.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isHorseRacing ? (
        /* ========================================================= */
        /* HORSE / GREYHOUND RACING INNER MATCH LAYOUT (IMAGE 3)     */
        /* ========================================================= */
        <div className="w-full bg-white mt-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.12)] relative z-10">
          {/* Header Ribbon with Gold Gradient */}
          <div className="w-full bg-[#f3f8fb] flex items-center justify-between relative border-b border-gray-100">
            <div
              style={{
                background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)',
              }}
              className="h-[38px] pl-3 pr-5 flex items-center justify-between min-w-[62%] max-w-[75%]"
            >
              {/* Left: MATCH ODDS & REMAINING Time */}
              <div className="flex flex-col justify-center">
                <span className="font-sans font-black text-[12.5px] text-black uppercase leading-tight tracking-tight">
                  MATCH ODDS
                </span>
                <span className="font-sans font-bold text-[9.5px] text-black uppercase leading-tight tracking-tight">
                  (REMAINING : {formattedRemaining})
                </span>
              </div>

              {/* Right: BET CLOSE / SUSPENDED Badge */}
              <div className="flex items-center ml-2">
                <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-[4px] border border-white tracking-wider leading-none select-none">
                  {currentMatch.isSuspended ? 'SUSPENDED' : 'BET CLOSE'}
                </span>
              </div>
            </div>

            {/* Right: Min / Max */}
            <div className="pr-2.5 text-[11.5px] font-medium text-black leading-none whitespace-nowrap">
              Min: {currentMatch.minBet || 1} | Max: {currentMatch.maxBet || 25000}
            </div>
          </div>

          {/* Column Header: BACK & LAY */}
          <div className="w-full bg-white flex items-center justify-end py-1 px-1 border-b border-gray-100">
            <div className="flex items-center gap-[2px] text-center shrink-0 pr-0.5">
              <span className="w-[76.13px] h-[18px] flex items-center justify-center text-[12px] font-black text-black uppercase">
                BACK
              </span>
              <span className="w-[76.13px] h-[18px] flex items-center justify-center text-[12px] font-black text-black uppercase">
                LAY
              </span>
            </div>
          </div>

          {/* Horse / Greyhound Runners List */}
          <div className="w-full bg-white flex flex-col divide-y divide-[#edf0f2]">
            {horseList.length > 0 ? (
              horseList.map((horse, hIdx) => {
                const trap = GREYHOUND_TRAP_STYLES[hIdx % GREYHOUND_TRAP_STYLES.length];
                const isBackSelected =
                  activeBet &&
                  activeBet.marketType === 'horse_racing' &&
                  activeBet.runnerId === horse.id &&
                  activeBet.type === 'back';
                const isLaySelected =
                  activeBet &&
                  activeBet.marketType === 'horse_racing' &&
                  activeBet.runnerId === horse.id &&
                  activeBet.type === 'lay';
                const isSlipOpen =
                  activeBet &&
                  activeBet.marketType === 'horse_racing' &&
                  activeBet.runnerId === horse.id;

                return (
                  <div key={horse.id} className="flex flex-col">
                    <div className="w-full flex items-center justify-between py-2 px-2.5 bg-white hover:bg-gray-50/70 transition-colors">
                      {/* Left: Jockey Silk + Horse Name + Jockey Name */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                        {/* Jockey Silk Icon or Greyhound Trap */}
                        {isHorse ? (
                          <JockeySilkIcon silk={horse.silk} himg={horse.himg} gmid={effectiveGmid} className="w-[42px] h-[42px]" />
                        ) : (
                          <div
                            className="w-[28px] h-[28px] rounded-[3px] flex items-center justify-center font-bold text-[13px] shadow-xs shrink-0"
                            style={{
                              backgroundColor: trap.bg,
                              color: trap.text,
                              border: `1px solid ${trap.border}`,
                            }}
                          >
                            {horse.num || hIdx + 1}
                          </div>
                        )}

                        {/* Horse & Jockey Info */}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[14px] text-[#111827] truncate leading-tight">
                            {horse.name}
                          </span>
                          {horse.jockey && (
                            <div className="mt-1">
                              <span className="bg-[#e9ecef] text-[#212529] px-2 py-[2px] rounded-[3px] text-[11px] font-medium inline-block leading-tight select-none">
                                Jockey:{horse.jockey}
                              </span>
                            </div>
                          )}
                          {(() => {
                            const pl = getProjectedPL('horse_racing', horse, 'Horse Race');
                            if (!pl) return null;
                            return (
                              <span
                                className={`text-[12px] font-bold leading-tight mt-0.5 ${pl.isPositive ? 'text-[#008a00]' : 'text-[#d32f2f]'
                                  }`}
                              >
                                {pl.isProjected ? '>> ' : ''}{pl.text}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Right: Back & Lay Odds Boxes OR SuspendedBox */}
                      <div className="flex items-center gap-[2px] shrink-0">
                        {horse.isSuspended || currentMatch.isSuspended ? (
                          <SuspendedBox height="h-[45px]" width="w-[154.26px]" />
                        ) : (
                          <div className="flex items-center gap-[2px]">
                            {/* Blue Back Box */}
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectBet(
                                  'horse_racing',
                                  horse.id,
                                  horse.name,
                                  'back',
                                  horse.back?.odd || '1.51',
                                  'Horse Race',
                                  horse.selectionId || horse.id
                                )
                              }
                              className={`w-[76.13px] h-[45px] shadow-2xs hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] outline-none border-0 ${isBackSelected ? 'bg-[#72bbef]' : 'bg-[#c5e6f8] hover:bg-[#b2dff6]'
                                }`}
                            >
                              <span className="font-bold text-[14px] text-[#212529] leading-3">
                                {horse.back?.odd || '-'}
                              </span>
                              <span className="text-[10px] font-medium text-[#4b5563] leading-none mt-1">
                                {horse.back?.size || '-'}
                              </span>
                            </button>

                            {/* Pink Lay Box */}
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectBet(
                                  'horse_racing',
                                  horse.id,
                                  horse.name,
                                  'lay',
                                  horse.lay?.odd || '6.2',
                                  'Horse Race',
                                  horse.selectionId || horse.id
                                )
                              }
                              className={`w-[76.13px] h-[45px] shadow-2xs hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] outline-none border-0 ${isLaySelected ? 'bg-[#f78ca2]' : 'bg-[#f5ced5] hover:bg-[#f0bcc6]'
                                }`}
                            >
                              <span className="font-bold text-[14px] text-[#212529] leading-3">
                                {horse.lay?.odd || '-'}
                              </span>
                              <span className="text-[10px] font-medium text-[#4b5563] leading-none mt-1">
                                {horse.lay?.size || '-'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline Bet Slip for Horse Racing */}
                    {isSlipOpen && renderBetSlip(activeBet)}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-500 font-bold text-[13px]">
                Connecting live stream for runners...
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* 2. DYNAMIC MARKETS (MATCH ODDS, OVER/UNDER, ETC.)         */}
          {/* ========================================================= */}
          {filteredMarketsList.map((marketObj) => (
            <div
              key={marketObj.marketId}
              className="w-full bg-[#f3f8fb] mt-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.12)] relative z-10"
            >
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
                    <CustomStar
                      filled={!!favoriteSections[marketObj.marketId || 'match_odds']}
                      onClick={() => toggleSectionFav(marketObj.marketId || 'match_odds')}
                    />
                    <span className="font-sans font-bold text-[10px] text-black uppercase leading-none">
                      {marketObj.marketName}
                    </span>
                  </div>

                  {/* Right: CASHOUT Badge */}
                  <div className="flex items-center">
                    {(() => {
                      const runnerVals = marketObj.runners
                        .map((r) => calculateBetValues(r, marketObj.marketId, marketObj.marketName)?.val)
                        .filter((v) => v !== undefined && v !== null);
                      const hasBets = runnerVals.length > 0 && runnerVals.some((v) => v !== 0);
                      const cashoutVal = hasBets
                        ? Math.round(runnerVals.reduce((a, b) => a + b, 0) / (runnerVals.length || 1))
                        : null;

                      return (
                        <span className="bg-[#67562d] ml-[-0.5px] text-[#e2cda6] text-[9.5px] font-black px-[4px] py-[4px] rounded-[4px] border border-[#e9d9b2] tracking-tighter leading-none whitespace-nowrap">
                          {hasBets
                            ? `CASHOUT ${cashoutVal !== 0 ? (cashoutVal > 0 ? `+${cashoutVal}` : cashoutVal) : ''}`
                            : 'CASHOUT'}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Right: Min / Max */}
                <div className="pr-2.5 mb-1 text-[11px] font-medium text-black leading-none">
                  Min: {marketObj.minBet || 1} | Max: {marketObj.maxBet || 50000}
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

              {/* Runners List */}
              <div className="w-full bg-[#f3f8fb] pt-[2px] flex flex-col gap-[1.5px]">
                {marketObj.runners.map((runner) => {
                  const isSlipOpen =
                    activeBet &&
                    activeBet.marketType === marketObj.marketId &&
                    (activeBet.runnerId === runner.id || activeBet.runnerName === runner.name);

                  return (
                    <div key={runner.id} className="flex flex-col">
                      <div className="w-full flex items-stretch h-[47px]">
                        {/* Runner Name */}
                        <div className="flex-1 bg-[#f2f2f2] flex flex-col justify-center px-2 min-w-0">
                          <span className="font-bold text-[13px] text-[#212529] truncate leading-tight">
                            {runner.name}
                          </span>
                          {(() => {
                            const pl = getProjectedPL(marketObj.marketId, runner, marketObj.marketName);
                            if (!pl) return null;
                            return (
                              <span
                                className={`text-[12.5px] font-bold leading-tight ${pl.isPositive ? 'text-[#008a00]' : 'text-[#d32f2f]'
                                  }`}
                              >
                                {pl.isProjected ? '>> ' : ''}{pl.text}
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
                                    marketObj.marketId,
                                    runner.id,
                                    runner.name,
                                    'back',
                                    runner.back?.odd || '1.94',
                                    marketObj.marketName,
                                    runner.selectionId || runner.id
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
                                    marketObj.marketId,
                                    runner.id,
                                    runner.name,
                                    'lay',
                                    runner.lay?.odd || '1.99',
                                    marketObj.marketName,
                                    runner.selectionId || runner.id
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

                      {/* Inline Bet Slip */}
                      {isSlipOpen && renderBetSlip(activeBet)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ========================================================= */}
          {/* 3. MARKET SECTION 2: BOOKMAKER (Cricket / Available Only) */}
          {/* ========================================================= */}
          {showBookmakerSection && !filters.hideBookmaker && (
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
                    <CustomStar
                      filled={!!favoriteSections['bookmaker']}
                      onClick={() => toggleSectionFav('bookmaker')}
                    />
                    <span className="font-sans font-bold text-[11px] text-black uppercase leading-none">
                      BOOKMAKER
                    </span>
                  </div>

                  {/* Right: CASHOUT Badge */}
                  <div className="flex items-center">
                    {(() => {
                      const runnerVals = bookmakerRunners
                        .map((r) => calculateBetValues(r, 'bookmaker', 'Bookmaker')?.val)
                        .filter((v) => v !== undefined && v !== null);
                      const hasBets = runnerVals.length > 0 && runnerVals.some((v) => v !== 0);
                      const cashoutVal = hasBets
                        ? Math.round(runnerVals.reduce((a, b) => a + b, 0) / (runnerVals.length || 1))
                        : null;

                      return (
                        <span className="bg-[#67562d] text-[#e2cda6] text-[9.5px] font-black px-[4px] py-[4px] rounded-[4px] border border-[#e9d9b2] tracking-tighter leading-none whitespace-nowrap">
                          {hasBets
                            ? `CASHOUT ${cashoutVal !== 0 ? (cashoutVal > 0 ? `+${cashoutVal}` : cashoutVal) : ''}`
                            : 'CASHOUT'}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Right: Min / Max */}
                <div className="pr-2.5 mb-1 text-[11px] font-medium text-black leading-none">
                  Min: 100 | Max: 50000
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
                  const isSlipOpen =
                    activeBet &&
                    activeBet.marketType === 'bookmaker' &&
                    (activeBet.runnerId === runner.id || activeBet.runnerName === runner.name);

                  return (
                    <div key={runner.id} className="flex flex-col">
                      <div className="w-full flex items-stretch h-[47px]">
                        {/* Runner Name */}
                        <div className="flex-1 bg-[#f2f2f2] flex flex-col justify-center px-2 min-w-0">
                          <span className="font-bold text-[13px] text-[#212529] truncate leading-tight">
                            {runner.name}
                          </span>
                          {(() => {
                            const pl = getProjectedPL('bookmaker', runner, 'Bookmaker');
                            if (!pl) return null;
                            return (
                              <span
                                className={`text-[12.5px] font-bold leading-tight ${pl.isPositive ? 'text-[#008a00]' : 'text-[#d32f2f]'
                                  }`}
                              >
                                {pl.isProjected ? '>> ' : ''}{pl.text}
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
                                    runner.back?.odd || '294',
                                    'Bookmaker',
                                    runner.selectionId || runner.id
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
                                    'bookmaker',
                                    runner.id,
                                    runner.name,
                                    'lay',
                                    runner.lay?.odd || '333',
                                    'Bookmaker',
                                    runner.selectionId || runner.id
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

                      {/* Inline Bet Slip for BOOKMAKER */}
                      {isSlipOpen && renderBetSlip(activeBet)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3.5 MARKET SECTION: TO WIN THE TOSS (Cricket / Available) */}
          {/* ========================================================= */}
          {showTossSection && !filters.hideToss && (
            <div className="w-full bg-[#f3f8fb] mt-3 shadow-[0_2px_4px_rgba(0,0,0,0.12)] relative z-10">
              {/* Header Ribbon */}
              <div className="w-full bg-[#f3f8fb] flex items-center justify-between relative border-b border-gray-100">
                <div
                  style={{
                    background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                    clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)',
                  }}
                  className="h-[32px] pl-3 pr-4 flex items-center justify-start gap-1 w-[58%]"
                >
                  {/* Star Icon */}
                  <CustomStar
                    filled={!!favoriteSections['toss']}
                    onClick={() => toggleSectionFav('toss')}
                  />
                  {/* Title */}
                  <span className="font-sans font-bold text-[11px] text-black uppercase leading-none ml-1">
                    TO WIN THE TOSS
                  </span>
                </div>

                {/* Right: Min / Max */}
                <div className="pr-2.5 mb-1 text-[11px] font-medium text-black leading-none">
                  Min: 1 | Max: 25000
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

              {/* Runners List for TO WIN THE TOSS */}
              <div className="w-full bg-[#f3f8fb] pt-[2px] flex flex-col gap-[1.5px]">
                {tossRunners.map((runner) => {
                  const isSlipOpen =
                    activeBet &&
                    activeBet.marketType === 'toss' &&
                    (activeBet.runnerId === runner.id || activeBet.runnerName === runner.name);

                  return (
                    <div key={runner.id} className="flex flex-col">
                      <div className="w-full flex items-stretch h-[47px]">
                        {/* Runner Name */}
                        <div className="flex-1 bg-[#f2f2f2] flex flex-col justify-center px-2 min-w-0">
                          <span className="font-bold text-[13px] text-[#212529] truncate leading-tight">
                            {runner.name}
                          </span>
                          {(() => {
                            const pl = getProjectedPL('toss', runner, 'Toss');
                            if (!pl) return null;
                            return (
                              <span
                                className={`text-[12.5px] font-bold leading-tight ${pl.isPositive ? 'text-[#008a00]' : 'text-[#d32f2f]'
                                  }`}
                              >
                                {pl.isProjected ? '>> ' : ''}{pl.text}
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
                                  runner.back?.odd !== '-' &&
                                  handleSelectBet(
                                    'toss',
                                    runner.id,
                                    runner.name,
                                    'back',
                                    runner.back?.odd || '1.95',
                                    'Toss',
                                    runner.selectionId || runner.id
                                  )
                                }
                                className="w-[76.13px] h-[45px] bg-[#aee1fc] shadow-xs hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                              >
                                <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                                  {runner.back?.odd || '-'}
                                </span>
                                <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                                  {runner.back?.size || '-'}
                                </span>
                              </button>

                              {/* Pink Lay Box */}
                              <button
                                type="button"
                                onClick={() =>
                                  runner.lay?.odd !== '-' &&
                                  runner.lay?.odd !== '--' &&
                                  handleSelectBet(
                                    'toss',
                                    runner.id,
                                    runner.name,
                                    'lay',
                                    runner.lay?.odd || '1.95',
                                    'Toss',
                                    runner.selectionId || runner.id
                                  )
                                }
                                className={`w-[76.13px] h-[45px] ${runner.lay?.odd === '-' || runner.lay?.odd === '--'
                                  ? 'bg-[#fed5da] cursor-default'
                                  : 'bg-[#fed5da] cursor-pointer'
                                  } shadow-xs hover:brightness-95 flex flex-col items-center justify-center transition-all active:scale-[0.98]`}
                              >
                                <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                                  {runner.lay?.odd || '-'}
                                </span>
                                <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                                  {runner.lay?.size || '-'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Inline Bet Slip for TOSS */}
                      {isSlipOpen && renderBetSlip(activeBet)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. MARKET SECTION 3: FANCY ODDS (Cricket Only)            */}
          {/* ========================================================= */}
          {showFancySection && !filters.hideFancy && (
            <div className="w-full bg-[#f3f8fb] mt-3 shadow-[0_2px_4px_rgba(0,0,0,0.12)] relative z-10 flex flex-col">
              {/* FANCY, BALL BY BALL & NORMAL Tab Pills matching exact reference screenshot */}
              <div className="w-full bg-[#f3f8fb] px-2.5 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveFancyTab('fancy')}
                  className={`${activeFancyTab === 'fancy'
                    ? 'bg-[#f5c531] border-2 border-[#dca71d]'
                    : 'bg-white border-2 border-[#f5c531]'
                    } rounded-[7px] px-6 py-1.5 font-bold text-[13px] text-black tracking-wide shadow-xs cursor-pointer select-none uppercase hover:brightness-105 active:scale-95 transition-all flex items-center justify-center whitespace-nowrap`}
                >
                  FANCY
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFancyTab('ball_by_ball')}
                  className={`${activeFancyTab === 'ball_by_ball'
                    ? 'bg-[#f5c531] border-2 border-[#dca71d]'
                    : 'bg-white border-2 border-[#f5c531]'
                    } rounded-[7px] px-6 py-1.5 font-bold text-[13px] text-black tracking-wide shadow-xs cursor-pointer select-none uppercase hover:brightness-105 active:scale-95 transition-all flex items-center justify-center whitespace-nowrap`}
                >
                  BALL BY BALL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFancyTab('normal')}
                  className={`${activeFancyTab === 'normal'
                    ? 'bg-[#f5c531] border-2 border-[#dca71d]'
                    : 'bg-white border-2 border-[#f5c531]'
                    } rounded-[7px] px-6 py-1.5 font-bold text-[13px] text-black tracking-wide shadow-xs cursor-pointer select-none uppercase hover:brightness-105 active:scale-95 transition-all flex items-center justify-center whitespace-nowrap`}
                >
                  NORMAL
                </button>
              </div>

              {/* Dynamic Header Ribbon matching exact reference screenshot */}
              <div className="w-full bg-[#f3f8fb] flex items-center justify-between relative border-b border-gray-100">
                <div
                  style={{
                    background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                    clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)',
                  }}
                  className="h-[32px] pl-3 pr-4 flex items-center justify-start gap-1 w-[55%]"
                >
                  <CustomStar
                    filled={!!favoriteSections[`fancy_${activeFancyTab}`]}
                    onClick={() => toggleSectionFav(`fancy_${activeFancyTab}`)}
                  />
                  <span className="font-sans font-bold text-[11px] text-black uppercase leading-none ml-1">
                    {activeFancyTab === 'ball_by_ball' ? 'BALL BY BALL' : activeFancyTab === 'normal' ? 'NORMAL' : 'FANCY'}
                  </span>
                </div>

                {/* Column Headers: NO & YES */}
                <div className="flex items-center gap-[2px] ml-[2px] text-center shrink-0">
                  <span className="w-[76.13px] h-[20px] flex items-center justify-center text-[12px] font-bold text-black uppercase">
                    NO
                  </span>
                  <span className="w-[76.13px] h-[20px] flex items-center justify-center text-[12px] font-bold text-black uppercase">
                    YES
                  </span>
                </div>
              </div>

              {/* Fancy Rows List */}
              <div className="w-full bg-[#f3f8fb] pt-[1px] flex flex-col gap-[1px]">
                {displayedFancyMarkets.map((market) => {
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
                    (activeBet.runnerId === market.id || activeBet.runnerName === market.title);

                  return (
                    <div key={market.id} className="flex flex-col">
                      <div className="w-full flex items-stretch h-[47px]">
                        {/* Market Title with Star Icon */}
                        <div className="flex-1 bg-[#f2f2f2] flex items-center px-2 min-w-0">
                          <CustomStar
                            filled={!!favoriteSections[market.id]}
                            onClick={() => toggleSectionFav(market.id)}
                            className="w-[15px] h-[15px] mr-2 shrink-0"
                          />
                          <div className="flex flex-col justify-center min-w-0 pr-1">
                            <span className="font-bold text-[13px] text-[#212529] truncate leading-tight">
                              {market.title}
                            </span>
                            {(() => {
                              const pl = getProjectedPL(
                                'fancy',
                                { id: market.id, name: market.title, runnerName: market.title, selectionId: market.id },
                                'Fancy'
                              );
                              if (!pl) return null;
                              return (
                                <span className="text-[12.5px] font-bold text-[#008a00] leading-tight">
                                  {pl.isProjected ? '>> ' : ''}{pl.text}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Odds Box or BALL RUNNING / SUSPENDED Overlay */}
                        <div className="flex items-center gap-[2px] shrink-0 ml-[2px]">
                          {market.isBallRunning ? (
                            <SuspendedBox text="BALL RUNNING" height="h-[45px]" width="w-[154.26px]" />
                          ) : market.isSuspended ? (
                            <SuspendedBox text="SUSPENDED" height="h-[45px]" width="w-[154.26px]" />
                          ) : (
                            <div className="flex items-center gap-[2px]">
                              {/* Pink NO Box */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectBet(
                                    'fancy',
                                    market.id,
                                    market.title,
                                    'no',
                                    market.no?.rate || '0',
                                    'Fancy',
                                    market.id
                                  )
                                }
                                className="w-[76.13px] h-[45px] bg-[#fed5da] shadow-xs hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                              >
                                <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                                  {market.no?.rate || '0'}
                                </span>
                                <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                                  {market.no?.size || '0'}
                                </span>
                              </button>

                              {/* Blue YES Box */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectBet(
                                    'fancy',
                                    market.id,
                                    market.title,
                                    'yes',
                                    market.yes?.rate || '0',
                                    'Fancy',
                                    market.id
                                  )
                                }
                                className="w-[76.13px] h-[45px] bg-[#aee1fc] shadow-xs hover:brightness-95 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                              >
                                <span className="font-bold text-[13.5px] text-[#212529] leading-3">
                                  {market.yes?.rate || '0'}
                                </span>
                                <span className="text-[10px] font-medium text-[#212529] leading-none mt-0.5">
                                  {market.yes?.size || '0'}
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
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* HIDE / SHOW FILTER MODAL */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[1px] p-2">
          <div className="w-full max-w-[360px] bg-white rounded-[8px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border duration-150">
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
              }}
              className="px-4 py-4 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-[15px] text-black ">
                  Hide / Show Filter
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setTempFilters({
                      hideMatchOdds: false,
                      hideBookmaker: false,
                      hideFancy: false,
                      hideTiedMatch: false,
                      hideToss: false,
                    })
                  }
                  className="bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded transition-all hover:bg-gray-800 active:scale-95 cursor-pointer select-none"
                >
                  Clear
                </button>
              </div>

              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="text-white font-extrabold text-[18px] leading-none hover:opacity-70 transition-opacity px-1 cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-[16px] pt-6 bg-white">
              <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-[12px]  text-[#212529]">
                <label className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tempFilters.hideMatchOdds}
                    onChange={(e) =>
                      setTempFilters((prev) => ({ ...prev, hideMatchOdds: e.target.checked }))
                    }
                    className="w-3 h-3 rounded border-2 border-gray-400 accent-[#007bff] cursor-pointer"
                  />
                  <span>Hide Match Odds</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tempFilters.hideBookmaker}
                    onChange={(e) =>
                      setTempFilters((prev) => ({ ...prev, hideBookmaker: e.target.checked }))
                    }
                    className="w-3 h-3 rounded border-2 border-gray-400 accent-[#007bff] cursor-pointer"
                  />
                  <span>Hide Bookmaker</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tempFilters.hideFancy}
                    onChange={(e) =>
                      setTempFilters((prev) => ({ ...prev, hideFancy: e.target.checked }))
                    }
                    className="w-3 h-3 rounded border-2 border-gray-400 accent-[#007bff] cursor-pointer"
                  />
                  <span>Hide Fancy</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tempFilters.hideTiedMatch}
                    onChange={(e) =>
                      setTempFilters((prev) => ({ ...prev, hideTiedMatch: e.target.checked }))
                    }
                    className="w-3 h-3 rounded border-2 border-gray-400 accent-[#007bff] cursor-pointer"
                  />
                  <span>Hide Tied Match</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tempFilters.hideToss}
                    onChange={(e) =>
                      setTempFilters((prev) => ({ ...prev, hideToss: e.target.checked }))
                    }
                    className="w-3 h-3 rounded border-2 border-gray-400 accent-[#007bff] cursor-pointer"
                  />
                  <span>Hide Toss</span>
                </label>
              </div>

              {/* Apply Button */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setFilters(tempFilters);
                    setFilterModalOpen(false);
                  }}
                  style={{
                    background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                  }}
                  className="w-[46%] py-2.5 font-extrabold text-[15px] text-black rounded-[6px] shadow-md hover:brightness-105 active:scale-95 transition-all tracking-wide  cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


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

        {/* Stake Quick Chips Grid */}
        <div className="grid grid-cols-4 gap-1">
          {stakeChips.slice(0, 8).map((chip, idx) => {
            const isSelected = parseFloat(stakeValue) === chip.val;
            return (
              <button
                key={`${chip.label}-${idx}`}
                type="button"
                onClick={() => handleQuickStake(chip.val)}
                className={`h-[30px] bg-white rounded-[3px] font-bold text-[13px] text-[#212529] shadow-2xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center ${isSelected
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
            disabled={isPlacingBet}
            onClick={handlePlaceBet}
            className="h-[38px] bg-[#009900] hover:bg-[#008000] rounded-[3px] font-bold text-[13.5px] text-white shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center tracking-wide uppercase disabled:opacity-90"
          >
            {isPlacingBet ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'PLACE BET'
            )}
          </button>
        </div>
      </div>
    );
  }
}
