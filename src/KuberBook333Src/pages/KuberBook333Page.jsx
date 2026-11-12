import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import '../KuberBook.css';

import {
  subscribeToMatchData,
  subscribeToMarketOddsData,
  subscribeToAuraMarketOddsData,
  subscribeToBookmakerData,
  subscribeToAuraBookmakerData,
  subscribeToFancyOddsData,
  subscribeToHorseMatchesData,
  subscribeToHourseOddsData,
  subscribeToGreyhoundMatchesData,
  subscribeToGreyHoundOddsData,
  subscribeToKabaddiMatchesData,
  subscribeToKabaddiMatchesDataOdds,
  subscribeToDiamondCasinoOddsData,
  subscribeToJoinProfileRoom,
  subscribeToJoinMyBets,
  subscribeToLeaveMyBets,
  unsubscribeFromHourseOdds,
  unsubscribeFromGreyHoundOdds,
} from '../../socketClient';
import { getUserId } from '../../utils/helper/commonSelectors';
import {
  setMarketName,
  setMarketOddsData,
  setRunningData,
} from '../../redux/slices/fullmarketSlice';
import {
  updateAvailableBalance,
  updateExposureBalance,
  updateUserCasinoBalance,
} from '../../redux/slices/userSlice';
import { launcherUrl, updateCasinoBalance } from '../../api';

import Header from '../components/Header';
import TickerMarquee from '../components/TickerMarquee';
import SportsTabs from '../components/SportsTabs';
import FeaturedGames from '../components/FeaturedGames';
import NewLaunchSection from '../components/NewLaunchSection';
import InplayOddsTable from '../components/InplayOddsTable';
import CasinoProviders from '../components/CasinoProviders';
import ExchangeMatches from '../components/ExchangeMatches';
import CasinoGamesSection from '../components/CasinoGamesSection';
import MatchDetailSection from '../components/MatchDetailSection';
import SportSection from '../components/SportSection';
import RacingSection from '../components/RacingSection';
import Mac88Section from '../components/Mac88Section';
import AffiliateSection from '../components/AffiliateSection';
import AccountStatementSection from '../components/AccountStatementSection';
import StakeSettingsSection from '../components/StakeSettingsSection';
import BonusesSection from '../components/BonusesSection';
import BettingProfitLossSection from '../components/BettingProfitLossSection';
import MyBetsSection from '../components/MyBetsSection';
import OpenBetsSection from '../components/OpenBetsSection';
import ChangePasswordSection from '../components/ChangePasswordSection';
import DepositSection from '../components/DepositSection';
import WalletSection from '../components/WalletSection';
import ChangeLanguageModal from '../components/ChangeLanguageModal';
import BonusRulesModal from '../components/BonusRulesModal';
import AuthModal from '../components/AuthModal';
import BetSlipDrawer from '../components/BetSlipDrawer';
import SideDrawer from '../components/SideDrawer';
import SearchModal from '../components/SearchModal';
import BottomNav from '../components/BottomNav';
import UserProfileMenu from '../components/UserProfileMenu';
import ToastNotification from '../components/ToastNotification';
import DesktopLayout from '../components/DesktopLayout';

const getSportFromPath = (pathname) => {
  const clean = pathname.replace(/^\//, '').toLowerCase();
  if (clean.startsWith('deposit')) {
    return 'deposit';
  }
  if (clean.startsWith('withdraw')) {
    return 'withdraw';
  }
  if (
    clean.startsWith('change-password') ||
    clean.startsWith('change_password') ||
    clean.startsWith('changepassword')
  ) {
    return 'change_password';
  }
  if (
    clean.startsWith('open-bets') ||
    clean.startsWith('open_bets') ||
    clean.startsWith('openbets')
  ) {
    return 'open_bets';
  }
  if (
    clean.startsWith('my-bets') ||
    clean.startsWith('my_bets') ||
    clean.startsWith('mybets')
  ) {
    return 'my_bets';
  }
  if (
    clean.startsWith('profit-loss') ||
    clean.startsWith('profit_loss') ||
    clean.startsWith('betting-profit-loss') ||
    clean.startsWith('betting_profit_loss') ||
    clean.startsWith('profitloss')
  ) {
    return 'profit_loss';
  }
  if (clean.startsWith('bonuses') || clean.startsWith('bonus')) {
    return 'bonuses';
  }
  if (
    clean.startsWith('settings') ||
    clean.startsWith('stake-settings') ||
    clean.startsWith('stake_settings') ||
    clean.startsWith('stakesettings')
  ) {
    return 'settings';
  }
  if (
    clean.startsWith('account-statement') ||
    clean.startsWith('account_statement') ||
    clean.startsWith('statement') ||
    clean.startsWith('accountstatement')
  ) {
    return 'account_statement';
  }
  if (clean.startsWith('wallet')) return 'wallet';
  if (clean.startsWith('affiliate') || clean.startsWith('affiliates')) return 'affiliate';
  if (!clean || clean === 'inplay' || clean === 'kuberbook333' || clean === 'b2c') return 'inplay';
  if (clean.startsWith('match') || clean.startsWith('event') || clean.startsWith('full-market')) return 'match_detail';
  if (
    clean === 'aviator' ||
    clean.startsWith('casino') ||
    clean.startsWith('livecasino') ||
    clean.startsWith('live-casino') ||
    clean === 'games' ||
    clean === 'aura' ||
    clean === 'mines' ||
    clean === 'color-prediction' ||
    clean === 'color_prediction' ||
    clean === 'chicken-road' ||
    clean === 'chicken_road' ||
    clean === 'fun-games' ||
    clean === 'fun_games'
  ) return 'casino';
  if (
    clean === 'favourites' ||
    clean === 'favorites' ||
    clean === 'multi_market' ||
    clean === 'multi-market' ||
    clean === 'multimarket'
  ) return 'favourites';
  if (clean === 'cricket') return 'cricket';
  if (clean === 'soccer' || clean === 'football') return 'soccer';
  if (clean === 'tennis') return 'tennis';
  if (clean === 'horse' || clean === 'horseracing' || clean === 'horse_racing' || clean === 'horse-racing' || clean === 'horse-market') return 'horse';
  if (clean === 'greyhound' || clean === 'greyhound_racing' || clean === 'greyhound-racing' || clean === 'greyhound-market') return 'greyhound';
  if (clean === 'mac88') return 'mac88';
  if (clean === 'sportsbook' || clean === 'sports_book' || clean === 'sports-book') return 'sportsbook';
  if (clean === 'basketball') return 'basketball';
  if (clean === 'volleyball') return 'volleyball';
  if (clean === 'tabletennis' || clean === 'table_tennis' || clean === 'table-tennis') return 'tabletennis';
  if (clean === 'mma') return 'mma';
  return clean;
};

// Helper: Safely parse matches from Redux socket updates
const parseReduxSportMatches = (reduxMatchesData, sportName) => {
  if (!reduxMatchesData || !Array.isArray(reduxMatchesData)) return [];
  return reduxMatchesData.map((m, idx) => {
    const eventName = m?.eventName || m?.title || `${sportName} Match ${idx + 1}`;
    const matchOdds0 = m?.matchOdds?.[0];
    const runners = matchOdds0?.runners || m?.matchRunners || [];

    let r1 = null;
    let r2 = null;
    let rDraw = null;

    if (runners.length === 2) {
      r1 = runners[0];
      r2 = runners[1];
    } else if (runners.length >= 3) {
      rDraw = runners.find((r) => r?.runnerName?.toLowerCase()?.includes('draw'));
      const nonDraws = runners.filter((r) => !r?.runnerName?.toLowerCase()?.includes('draw'));
      r1 = nonDraws[0] || runners[0];
      r2 = nonDraws[1] || runners[1];
      if (!rDraw) rDraw = runners[2];
    } else if (runners.length === 1) {
      r1 = runners[0];
    }

    const formatPrice = (p, fallback = '0') => {
      if (p === undefined || p === null || p === '' || p === '--') return fallback;
      const num = Number(p);
      if (isNaN(num) || num === 0) return fallback;
      return String(p);
    };

    const back1 = formatPrice(r1?.ex?.availableToBack?.[0]?.price, '0');
    const lay1 = formatPrice(r1?.ex?.availableToLay?.[0]?.price, '0');
    const backX = rDraw ? formatPrice(rDraw?.ex?.availableToBack?.[0]?.price, '0') : '0';
    const layX = rDraw ? formatPrice(rDraw?.ex?.availableToLay?.[0]?.price, '0') : '0';
    const back2 = formatPrice(r2?.ex?.availableToBack?.[0]?.price, '0');
    const lay2 = formatPrice(r2?.ex?.availableToLay?.[0]?.price, '0');

    const resolvedSportId = m?.sportId || m?.eventType || (sportName === 'Cricket' ? 4 : sportName === 'Soccer' ? 1 : 2);

    const isInPlay = Boolean(
      matchOdds0?.inplay === true ||
      matchOdds0?.inplay === 'true' ||
      matchOdds0?.inPlay === true ||
      matchOdds0?.inPlay === 'true' ||
      m?.inplay === true ||
      m?.inplay === 'true' ||
      m?.inPlay === true ||
      m?.inPlay === 'true' ||
      m?.live === true ||
      m?.live === 'true'
    );

    return {
      id: m?.eventId ? `match_${m.eventId}` : `socket_${sportName}_${idx}`,
      eventId: m?.eventId,
      eventType: resolvedSportId,
      sportId: resolvedSportId,
      competitionId: m?.competitionId,
      marketId: m?.marketId,
      joinedMarketIds: m?.joinedMarketIds,
      sport: sportName.toLowerCase(),
      sportName: sportName,
      date: 'today',
      title: eventName,
      time: m?.openDate || m?.time || (isInPlay ? 'INPLAY' : 'Upcoming'),
      inplay: isInPlay,
      live: isInPlay,
      odds: [back1, lay1, backX, layX, back2, lay2],
      hasTv: Boolean(m?.tv || m?.hasTv),
      hasF: Boolean(m?.fancy || m?.f || m?.hasF),
      hasBm: Boolean(m?.bm || m?.hasBm),
      hasToss: Boolean(m?.markets?.some((mkt) => (mkt?.marketName || '').toLowerCase().includes('toss'))),
      markets: m?.markets,
      minBet: '1',
      maxBet: '25000',
      matchOdds: m?.matchOdds,
      runners: runners.map((r, rIdx) => ({
        id: r?.selectionId ? `runner_${r.selectionId}` : `runner_${rIdx + 1}`,
        selectionId: r?.selectionId,
        name: r?.runnerName || `Runner ${rIdx + 1}`,
        back: {
          odd: formatPrice(r?.ex?.availableToBack?.[0]?.price, '--'),
          size: r?.ex?.availableToBack?.[0]?.size ? String(r?.ex?.availableToBack?.[0]?.size) : '--',
        },
        lay: {
          odd: formatPrice(r?.ex?.availableToLay?.[0]?.price, '--'),
          size: r?.ex?.availableToLay?.[0]?.size ? String(r?.ex?.availableToLay?.[0]?.size) : '--',
        },
      })),
    };
  });
};

export default function KuberBook333Page() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Redux Selectors
  const currentUserId = useSelector(getUserId());
  const reduxMatches = useSelector((state) => state.matches);
  const reduxHorse = useSelector((state) => state.horse);
  const reduxGreyhound = useSelector((state) => state.greyhound);

  // Active sport dynamically synced with current React Router DOM path
  const activeSport = getSportFromPath(location.pathname);
  const VALID_SPORTS_TABS = [
    'inplay',
    'cricket',
    'soccer',
    'football',
    'tennis',
    'horse',
    'greyhound',
    'mac88',
    'sportsbook',
    'basketball',
    'volleyball',
    'tabletennis',
    'mma',
  ];

  const [selectedSportTab, setSelectedSportTab] = useState(() => {
    const clean = location.pathname.replace(/^\//, '').toLowerCase();
    if (VALID_SPORTS_TABS.includes(clean)) {
      return clean === 'football' ? 'soccer' : clean;
    }
    return 'inplay';
  });

  // 1. Global Socket Subscriptions for All Sports Channels (Cricket, Soccer, Tennis, Horse, Greyhound, Kabaddi)
  useEffect(() => {
    console.log('⚡ [KUBER333 SOCKET] Subscribing to Global Live Channels: Cricket(4), Soccer(1), Tennis(2), Kabaddi, Horse, Greyhound');
    const unsubCricket = subscribeToMatchData({
      eventId: 4,
      competitionId: null,
      matchId: null,
      marketId: null,
      sport: 'cricket',
    });
    const unsubSoccer = subscribeToMatchData({
      eventId: 1,
      competitionId: null,
      matchId: null,
      marketId: null,
      sport: 'soccer',
    });
    const unsubTennis = subscribeToMatchData({
      eventId: 2,
      competitionId: null,
      matchId: null,
      marketId: null,
      sport: 'tennis',
    });
    const unsubKabaddi = subscribeToKabaddiMatchesData();
    const unsubHorse = subscribeToHorseMatchesData();
    const unsubGreyhound = subscribeToGreyhoundMatchesData();

    return () => {
      typeof unsubCricket === 'function' && unsubCricket();
      typeof unsubSoccer === 'function' && unsubSoccer();
      typeof unsubTennis === 'function' && unsubTennis();
      typeof unsubKabaddi === 'function' && unsubKabaddi();
      typeof unsubHorse === 'function' && unsubHorse();
      typeof unsubGreyhound === 'function' && unsubGreyhound();
    };
  }, []);

  // 2. User Profile and My Bets Socket Room Subscriptions
  useEffect(() => {
    if (currentUserId) {
      console.log(`👤 [KUBER333 SOCKET] Joining User Profile & MyBets Room for User: ${currentUserId}`);
      subscribeToJoinProfileRoom(currentUserId);
      subscribeToJoinMyBets(currentUserId);
    }
  }, [currentUserId]);

  // 3. Route-Specific Dynamic Subscriptions (Inspection & Realtime sync across every route)
  useEffect(() => {
    window.scrollTo(0, 0);
    const clean = location.pathname.replace(/^\//, '').toLowerCase();
    if (clean === 'inplay') {
      setSelectedSportTab('inplay');
    } else if (VALID_SPORTS_TABS.includes(clean)) {
      setSelectedSportTab(clean === 'football' ? 'soccer' : clean);
    }

    console.log(`🌐 [KUBER333 ROUTE INSPECT] Active Route: "${location.pathname}" | Query: "${location.search}"`);

    // A. Handle Horse / Greyhound market subscriptions
    const gmid = searchParams.get('gmid');
    const isHorseRoute = clean.includes('horse');
    const isGreyhoundRoute = clean.includes('greyhound');

    if (gmid) {
      if (isHorseRoute) {
        console.log(`🏇 [KUBER333 SOCKET] Subscribed to Horse Market Odds: gmid=${gmid}`);
        subscribeToHourseOddsData({ gmid });
        return () => unsubscribeFromHourseOdds(gmid);
      } else if (isGreyhoundRoute) {
        console.log(`🐕 [KUBER333 SOCKET] Subscribed to Greyhound Market Odds: gmid=${gmid}`);
        subscribeToGreyHoundOddsData({ gmid });
        return () => unsubscribeFromGreyHoundOdds(gmid);
      }
    }

    // B. Handle Sport Match Details / Full Market subscriptions
    const eventId = searchParams.get('eventId');
    const eventType = searchParams.get('eventType');
    const competitionId = searchParams.get('competitionId');
    const marketId = searchParams.get('marketId');
    const joinedMarketIds = searchParams.get('joinedMarketIds') || marketId;
    const sportParam = searchParams.get('sport') || searchParams.get('sportName') || 'Cricket';
    const bm = searchParams.get('bm');
    const fancy = searchParams.get('fancy') || searchParams.get('f');

    const isMatchDetailRoute =
      clean.startsWith('match') || clean.startsWith('event') || clean.startsWith('full-market');

    const cleanups = [];

    if (isMatchDetailRoute) {
      if (eventId) {
        console.log(`📊 [KUBER333 SOCKET] Subscribed to Match Market Odds: eventId=${eventId}, marketId=${joinedMarketIds}, sport=${sportParam}`);
        const unsubMarket = subscribeToMarketOddsData({
          eventId,
          eventType: eventType || eventId,
          competitionId,
          matchId: eventId,
          marketId: joinedMarketIds,
          sport: sportParam,
        });
        cleanups.push(unsubMarket);

        if (bm === 'true' || bm === '1') {
          console.log(`📖 [KUBER333 SOCKET] Subscribed to Bookmaker Odds: eventId=${eventId}`);
          const unsubBm = subscribeToBookmakerData({
            eventId,
            eventType: eventType || eventId,
            competitionId,
            sport: sportParam,
          });
          cleanups.push(unsubBm);
        }

        if (fancy === 'true' || fancy === '1') {
          console.log(`🎯 [KUBER333 SOCKET] Subscribed to Fancy Odds: eventId=${eventId}`);
          const unsubFancy = subscribeToFancyOddsData({
            eventId,
            eventType: eventType || eventId,
            competitionId,
            sport: sportParam,
          });
          cleanups.push(unsubFancy);
        }
      } else {
        // Auto-subscribe fallback for Surrey W v Somerset W live demo match
        console.log(`🏏 [KUBER333 SOCKET] Subscribing Live Market Odds for Surrey W v Somerset W (eventId: 4, marketId: 1.234567)`);
        const unsubMarket = subscribeToMarketOddsData({
          eventId: '4',
          eventType: '4',
          competitionId: '1',
          matchId: '4',
          marketId: '1.234567',
          sport: 'Cricket',
        });
        cleanups.push(unsubMarket);
      }
    }

    return () => {
      cleanups.forEach((fn) => typeof fn === 'function' && fn());
    };
  }, [location.pathname, location.search, searchParams]);

  const [activeBottomNav, setActiveBottomNav] = useState('home');
  const [exchangeTab, setExchangeTab] = useState('today');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  const [bonusRulesModalOpen, setBonusRulesModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kuber_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isDemoUser = Boolean(
    user?.isDemo ||
    user?.username?.toLowerCase().startsWith('demo') ||
    user?.userName?.toLowerCase().startsWith('demo') ||
    user?.username === 'DEMO'
  );
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('kuber_user', JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
    setAuthModal(null);
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('kuber_user');
    } catch (e) {
      console.error(e);
    }
    setProfileMenuOpen(false);
  };
  const [selectedBet, setSelectedBet] = useState(null);
  const [betStake, setBetStake] = useState('100');
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('kuberbook_favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return new Set();
  });
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast notification after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Restrict Demo User from accessing wallet, deposit, or withdraw
  useEffect(() => {
    if (isDemoUser && (activeSport === 'wallet' || activeSport === 'deposit' || activeSport === 'withdraw')) {
      setToast({
        id: Date.now(),
        type: 'error',
        message: 'Demo user not allowed to access wallet or place bet in casino',
      });
      navigate('/', { replace: true });
    }
  }, [isDemoUser, activeSport, navigate]);

  const handleToggleFavorite = (match) => {
    if (!match || !match.id) return;
    setFavorites((prev) => {
      const next = new Set(prev);
      const isFav = next.has(match.id);

      let savedMatchesList = [];
      try {
        const stored = localStorage.getItem('kuberbook_saved_matches');
        if (stored) savedMatchesList = JSON.parse(stored);
        if (!Array.isArray(savedMatchesList)) savedMatchesList = [];
      } catch (e) {
        console.error(e);
      }

      if (isFav) {
        next.delete(match.id);
        savedMatchesList = savedMatchesList.filter((m) => m.id !== match.id);
        setToast({
          id: Date.now(),
          type: 'remove',
          message: 'Event Removed Successfully',
        });
      } else {
        next.add(match.id);
        savedMatchesList = [
          match,
          ...savedMatchesList.filter((m) => m.id !== match.id),
        ];
        setToast({
          id: Date.now(),
          type: 'add',
          message: 'Event Added Successfully',
        });
      }

      try {
        localStorage.setItem('kuberbook_favorites', JSON.stringify(Array.from(next)));
        localStorage.setItem('kuberbook_saved_matches', JSON.stringify(savedMatchesList));
      } catch (e) {
        console.error('Failed to save favorites to localStorage', e);
      }

      return next;
    });
  };

  // Live Redux socket matches only (No dummy data)
  const allMatches = useMemo(() => {
    const liveCricket = parseReduxSportMatches(reduxMatches?.cricket?.matches?.data, 'Cricket');
    const liveSoccer = parseReduxSportMatches(reduxMatches?.soccer?.matches?.data, 'Soccer');
    const liveTennis = parseReduxSportMatches(reduxMatches?.tennis?.matches?.data, 'Tennis');

    return [...liveCricket, ...liveSoccer, ...liveTennis];
  }, [reduxMatches]);

  const handleOddsClick = (match, oddValue, oddType) => {
    handleMatchClick(match);
  };

  const handleMatchClick = (match) => {
    if (!match) return;
    if (match?.matchRunners) {
      dispatch(setRunningData(match.matchRunners));
    }
    if (match?.markets) {
      dispatch(setMarketName(match.markets));
    }
    if (match?.matchOdds) {
      dispatch(
        setMarketOddsData({
          data: { data: match.matchOdds },
          sport: match.sport || 'Cricket',
        })
      );
    }

    const eventId = match.eventId || (match.id ? String(match.id).replace(/^match_/, '') : '36075212');
    const sportName = (match.sport || 'cricket').toLowerCase();
    const sportId = match.eventType || match.sportId || (sportName === 'soccer' ? 1 : sportName === 'tennis' ? 2 : 4);
    const competitionId = match.competitionId || '12830953';
    const marketId = match.marketId || match.joinedMarketIds || '1.262481009';

    navigate(
      `/match/${match.id}?eventId=${eventId}&eventType=${sportId}&competitionId=${competitionId}&marketId=${marketId}&joinedMarketIds=${match.joinedMarketIds || marketId}&bm=${match.hasBm ? 'true' : 'false'}&fancy=${match.hasF ? 'true' : 'false'}&sport=${sportName}&eventName=${encodeURIComponent(match.title || '')}`
    );
  };

  const handlePlaceBet = () => {
    if (selectedBet) {
      alert(`Bet placed successfully on ${selectedBet.match} (${selectedBet.type}) @ ${selectedBet.odd} for ₹${betStake}!`);
      setSelectedBet(null);
    }
  };

  const handleBottomNavSelect = (tab) => {
    setActiveBottomNav(tab);
    setLanguageModalOpen(false);
    setBonusRulesModalOpen(false);
    setProfileMenuOpen(false);
    setMenuOpen(false);
    if (tab === 'home') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'sports') {
      navigate('/cricket');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'inplay') {
      navigate('/inplay');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'favourites') {
      navigate('/favourites');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'casino') {
      navigate('/casino');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSport = (sport) => {
    if (sport === 'sportsbook' || sport === 'basketball' || sport === 'volleyball' || sport === 'tabletennis' || sport === 'mma') {
      setToast({
        id: Date.now(),
        type: 'info',
        message: 'Coming soon...',
      });
      return;
    }

    setSelectedSportTab(sport);
    if (sport === 'inplay') {
      navigate('/inplay');
    } else if (sport === 'favourites' || sport === 'multi_market') {
      navigate('/favourites');
    } else {
      navigate(`/${sport}`);
    }
  };

  const handleBannerClick = (game) => {
    if (isDemoUser) {
      setToast({
        id: Date.now(),
        type: 'error',
        message: 'Demo user not allowed to place bet in casino',
      });
      return;
    }
    const gId = typeof game === 'string' ? game : game?.id || game?.gameId || '';
    if (gId.includes('aviator') || gId.includes('chicken') || gId.includes('mines') || gId.includes('fun')) {
      navigate('/casino/aviator');
    } else {
      navigate('/casino');
    }
  };

  const handleLaunchGame = async (game) => {
    if (!game) return;

    if (!user) {
      setAuthModal('login');
      return;
    }

    if (isDemoUser) {
      setToast({
        id: Date.now(),
        type: 'error',
        message: 'Demo user not allowed to place bet in casino',
      });
      return;
    }

    const gameId = typeof game === 'string' ? game : game.gameId || game.id || 'aviator';
    const gameName = typeof game === 'string' ? game : game.name || game.title || 'Casino Game';

    const mainBal = user?.availableBalance !== undefined ? user.availableBalance : (user?.balance || 0);
    const exp = user?.exposure || 0;
    const available = mainBal - exp;

    if (available > 0) {
      try {
        const response = await updateCasinoBalance({
          CasinoBalance: available,
        });
        if (response?.data?.user) {
          dispatch(updateAvailableBalance(response.data.user.availableBalance));
          dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
        }
      } catch (err) {
        console.warn('Casino balance update notice:', err);
      }
    }

    try {
      const data = {
        gameId: gameId,
        playerId: user?._id || user?.id || '',
        displayName: user?.name || user?.username || user?.casinoDisplayName || 'Player',
        currency: 'INR',
        country: 'IN',
        gender: 'M',
        birthDate: '1996-10-12',
        mode: 'real',
        device: 'mobile',
        returnUrl: window.location.href,
        walletSessionId: user?.sessionToken || '',
      };

      const res = await launcherUrl(data);
      if (res?.success && res?.data?.url) {
        const encodedUrl = encodeURIComponent(res.data.url);
        navigate(`/game-lobby?gameId=${encodedUrl}&url=${encodedUrl}&name=${encodeURIComponent(gameName)}`);
        return;
      }
    } catch (e) {
      console.warn('Live launcher URL unavailable:', e);
    }

    const encodedGameId = encodeURIComponent(gameId);
    navigate(`/game-lobby?gameId=${encodedGameId}&url=${encodedGameId}&name=${encodeURIComponent(gameName)}`);
  };

  // 1. Filter Inplay Section Matches
  const filteredInplay = allMatches.filter((m) => {
    const matchesSport = m.live;
    const matchesQuery = searchQuery
      ? m.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesSport && matchesQuery;
  });

  // 2. Filter Exchange Matches for Home Page (by date)
  const filteredExchange = allMatches.filter((m) => {
    const matchesDate = m.date === exchangeTab;
    const matchesQuery = searchQuery
      ? m.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesDate && matchesQuery;
  });

  // 3. Filter Matches for the Dedicated Sport Section (Cricket, Football, Tennis, etc.)
  const filteredSportMatches = allMatches.filter((m) => {
    const targetSport = activeSport === 'football' ? 'soccer' : activeSport;
    const matchesSport = m.sport === targetSport;
    const matchesQuery = searchQuery
      ? m.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesSport && matchesQuery;
  });

  // 4. Filter Saved Favorites Matches from Local Storage & Socket Matches
  const filteredFavorites = useMemo(() => {
    const savedMap = new Map();
    try {
      const stored = localStorage.getItem('kuberbook_saved_matches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((m) => {
            if (m && m.id && favorites.has(m.id)) {
              savedMap.set(m.id, m);
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Sync live odds from socket if currently active
    allMatches.forEach((m) => {
      if (favorites.has(m.id)) {
        savedMap.set(m.id, { ...savedMap.get(m.id), ...m });
      }
    });

    const favList = Array.from(savedMap.values());
    if (!searchQuery) return favList;
    return favList.filter((m) =>
      m?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMatches, favorites, searchQuery]);

  // Extract match ID if on match detail view
  const matchIdMatch = location.pathname.match(/^\/(?:match|event|full-market|horse-market|greyhound-market)\/([^/]+)/i);
  const currentMatchId = matchIdMatch ? matchIdMatch[1] : 'surrey_w_v_somerset_w';
  const urlParams = new URLSearchParams(location.search);
  const urlSport = (urlParams.get('sport') || (location.pathname.includes('horse') ? 'horse' : location.pathname.includes('greyhound') ? 'greyhound' : ''))?.toLowerCase();
  const urlEventName = urlParams.get('eventName') || urlParams.get('raceName');
  const isRacingUrl =
    urlSport === 'horse' ||
    urlSport === 'greyhound' ||
    currentMatchId?.startsWith('race_') ||
    currentMatchId?.startsWith('hr_') ||
    currentMatchId?.startsWith('gh_') ||
    location.pathname.includes('horse') ||
    location.pathname.includes('greyhound');

  const currentMatch =
    allMatches.find((m) =>
      String(m.id).toLowerCase() === String(currentMatchId).toLowerCase() ||
      m.title?.toLowerCase().replace(/\s+/g, '_') === String(currentMatchId).toLowerCase() ||
      m.title?.toLowerCase() === String(currentMatchId).replace(/_/g, ' ').toLowerCase()
    ) || (isRacingUrl ? {
      id: currentMatchId,
      title: urlEventName ? decodeURIComponent(urlEventName) : (urlSport === 'greyhound' ? 'Romford 18:09' : 'Charles Town 06:32'),
      venue: urlEventName ? decodeURIComponent(urlEventName).split('-')[0].trim() : 'Charles Town',
      sport: urlSport || 'horse',
      isRacing: true,
      eventId: urlParams.get('eventId') || currentMatchId,
      marketId: urlParams.get('marketId') || currentMatchId,
      gmid: urlParams.get('gmid') || currentMatchId,
      time: urlEventName && urlEventName.includes('-') ? urlEventName.split('-')[1].trim() : '06:32',
      dateTimeStr: '11/09/2026 06:32:00',
    } : allMatches[0]);

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-900 font-sans select-none antialiased">
      {/* 1. MOBILE APP VIEW (Rendered on mobile screens < lg, 100% UNTOUCHED) */}
      <div className="lg:hidden flex justify-center w-full min-h-screen">
        <div className="w-full max-w-[480px] bg-[#f2f4f7] min-h-screen shadow-2xl relative flex flex-col pb-20">
          {/* 1. TOP BLACK HEADER */}
          <Header
            user={user}
            onLogoClick={() => navigate('/')}
            onLogout={handleLogout}
            onProfileClick={() => setProfileMenuOpen(!profileMenuOpen)}
            onMenuClick={() => setMenuOpen(!menuOpen)}
            onSearchClick={() => setSearchOpen(true)}
            onAuthClick={(type) => setAuthModal(type)}
            isSearchOpen={searchOpen}
            onSearchClose={() => {
              setSearchOpen(false);
              setSearchQuery('');
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* 2. TICKER MARQUEE BAR */}
          <TickerMarquee />

          {/* 3. SPORTS CATEGORY TABS (5 DISTINCT CARDS) */}
          {activeSport !== 'deposit' && activeSport !== 'withdraw' && (
            <SportsTabs
              activeSport={selectedSportTab}
              onSelectSport={handleSelectSport}
            />
          )}

          {/* Logged in User Deposit & Withdraw Action Bar (Hidden for Demo Users) */}
          {user && !isDemoUser && (
            <div className="w-full px-1 bg-white pt-0.5 pb-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate('/deposit')}
                className="w-full flex items-center justify-center gap-2.5 bg-[linear-gradient(180deg,#007b15,#138e00)] hover:bg-[#086600] text-white font-semibold px-4 py-1.5 text-[14px] rounded-sm cursor-pointer active:scale-98 transition-all"
              >
                <img
                  src="/games/download (3).webp"
                  alt="Deposit"
                  className="w-[20px] h-[20px] object-contain shrink-0 brightness-0 invert"
                />
                Deposit
              </button>
              <button
                type="button"
                onClick={() => navigate('/withdraw')}
                className="w-full flex items-center justify-center gap-2.5 bg-[linear-gradient(180deg,#7b0000,#d10000)] hover:bg-[#cc0000] text-white font-semibold px-4 py-1.5 text-[14px] rounded-sm cursor-pointer active:scale-98 transition-all"
              >
                <img
                  src="/games/download (4).webp"
                  alt="Withdraw"
                  className="w-[20px] h-[20px] object-contain shrink-0 brightness-0 invert"
                />
                Withdraw
              </button>
            </div>
          )}

          {/* 4. CONTENT AREA BASED ON ACTIVE SPORT */}
          {activeSport === 'wallet' ? (
            /* DEDICATED WALLET VIEW */
            <WalletSection user={user} />
          ) : activeSport === 'deposit' || activeSport === 'withdraw' ? (
            /* DEDICATED DEPOSIT & WITHDRAW VIEW */
            <DepositSection user={user} onToast={setToast} activeTab={activeSport} />
          ) : activeSport === 'change_password' ? (
            /* DEDICATED CHANGE PASSWORD VIEW */
            <ChangePasswordSection user={user} onToast={setToast} />
          ) : activeSport === 'open_bets' ? (
            /* DEDICATED OPEN BETS VIEW */
            <OpenBetsSection user={user} onToast={setToast} />
          ) : activeSport === 'my_bets' ? (
            /* DEDICATED MY BETS VIEW */
            <MyBetsSection user={user} onToast={setToast} />
          ) : activeSport === 'profit_loss' ? (
            /* DEDICATED BETTING PROFIT & LOSS VIEW */
            <BettingProfitLossSection user={user} onToast={setToast} />
          ) : activeSport === 'bonuses' ? (
            /* DEDICATED BONUSES VIEW */
            <BonusesSection user={user} />
          ) : activeSport === 'settings' ? (
            /* DEDICATED STAKE SETTINGS VIEW */
            <StakeSettingsSection onToast={setToast} />
          ) : activeSport === 'account_statement' ? (
            /* DEDICATED ACCOUNT STATEMENT VIEW */
            <AccountStatementSection user={user} onToast={setToast} />
          ) : activeSport === 'affiliate' ? (
            /* DEDICATED AFFILIATE PORTAL & SUB-VIEWS */
            <AffiliateSection user={user} />
          ) : activeSport === 'match_detail' ? (
            /* IN-MATCH BETTING VIEW (MATCH ODDS + RUNNERS + INLINE BET SLIP) */
            <MatchDetailSection
              match={currentMatch}
              user={user}
              onPlaceBetSuccess={(betInfo) => {
                const stake = parseFloat(betInfo.stake) || 0;
                setUser((prev) => {
                  if (!prev) {
                    const fallbackUser = {
                      username: 'Demo',
                      balance: Math.max(0, 1500 - stake),
                      exposure: stake,
                    };
                    try {
                      localStorage.setItem('kuber_user', JSON.stringify(fallbackUser));
                    } catch (e) {
                      console.error(e);
                    }
                    return fallbackUser;
                  }
                  const prevBal = prev.balance !== undefined ? prev.balance : 1500;
                  const newBal = Math.max(0, prevBal - stake);
                  const newExp = (prev.exposure || 0) + stake;
                  const updated = {
                    ...prev,
                    balance: newBal,
                    availableBalance: newBal,
                    exposure: newExp,
                  };
                  try {
                    localStorage.setItem('kuber_user', JSON.stringify(updated));
                  } catch (e) {
                    console.error(e);
                  }
                  return updated;
                });

                const currentBal = user?.balance !== undefined ? user.balance : 1500;
                const currentExp = user?.exposure || 0;
                dispatch(updateAvailableBalance(Math.max(0, currentBal - stake)));
                dispatch(updateExposureBalance(currentExp + stake));

                setToast({
                  id: Date.now(),
                  type: 'add',
                  message: `Bet Placed! ${betInfo.runner} @ ${betInfo.odds} (₹${betInfo.stake})`,
                });
              }}
              onBackToList={() => navigate(-1)}
            />
          ) : activeSport === 'inplay' ? (
            <>
              {/* FEATURED GAMES (2 HORIZONTAL SCROLLING ROWS OF 16:9 CARDS) */}
              <FeaturedGames
                onGameClick={handleBannerClick}
              />

              {/* "NEW LAUNCH" SECTION (GOLD BANNER + 3 PORTRAIT CARDS) */}
              <NewLaunchSection
                onGameClick={handleLaunchGame}
              />

              {/* "INPLAY" LIVE ODDS GRID */}
              <InplayOddsTable
                matches={filteredInplay}
                onOddsClick={handleOddsClick}
                onMatchClick={handleMatchClick}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                user={user}
                isLoggedIn={Boolean(user)}
              />

              {/* CASINO PROVIDERS */}
              <CasinoProviders
                onProviderClick={() => {
                  navigate('/casino');
                }}
              />

              {/* EXCHANGE GAMES */}
              <ExchangeMatches
                matches={filteredExchange}
                exchangeTab={exchangeTab}
                onTabChange={(tab) => setExchangeTab(tab)}
                onOddsClick={handleOddsClick}
                onMatchClick={handleMatchClick}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                user={user}
                isLoggedIn={Boolean(user)}
              />
            </>
          ) : activeSport === 'casino' ? (
            /* CASINO & CRASH GAMES SECTION (AURA, LIVE CASINO, AVIATOR, ETC.) */
            <CasinoGamesSection
              onGameClick={handleLaunchGame}
            />
          ) : activeSport === 'mac88' ? (
            /* MAC88 CASINO GAMES SECTION */
            <Mac88Section
              onGameClick={handleLaunchGame}
            />
          ) : (activeSport === 'horse' || activeSport === 'greyhound') ? (
            /* HORSE RACING & GREYHOUND RACING SECTION */
            <RacingSection sport={activeSport} />
          ) : (activeSport === 'favourites' || activeSport === 'multi_market') ? (
            /* FAVOURITES & SAVED MATCHES SECTION */
            <SportSection
              sport="favourites"
              matches={filteredFavorites}
              onOddsClick={handleOddsClick}
              onMatchClick={handleMatchClick}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              user={user}
              isLoggedIn={Boolean(user)}
            />
          ) : (
            /* DEDICATED SPORT FIXTURES SECTION (FOOTBALL, CRICKET, TENNIS, ETC.) */
            <SportSection
              sport={activeSport}
              matches={filteredSportMatches}
              onOddsClick={handleOddsClick}
              onMatchClick={handleMatchClick}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              user={user}
              isLoggedIn={Boolean(user)}
            />
          )}

          {/* 5. TOAST NOTIFICATION */}
          <ToastNotification
            toast={toast}
            onClose={() => setToast(null)}
          />

          {activeSport !== 'affiliate' && (
            <>
              {/* 6a. FLOATING WHATSAPP 24x7 CUSTOMER SUPPORT BUTTON */}
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '70px', height: '70px' }}
                className="fixed bottom-[74px] left-0 z-40 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] cursor-pointer"
                aria-label="24x7 WhatsApp Customer Support"
              >
                <img
                  src="/games/wp_support.png"
                  alt="24x7 Customer Support"
                  style={{ width: '70px', height: '70px' }}
                  className="w-[70px] h-[70px] object-contain animate-wp-support"
                />
              </a>

              {/* 6b. FLOATING TELEGRAM BUTTON + 4-WAY ARROW AVIATOR BUTTON */}
              <div className="fixed bottom-[74px] right-2 z-40 flex items-center justify-center">
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: '70px', height: '70px' }}
                  className="flex items-center justify-center cursor-pointer group relative"
                  aria-label="Telegram Channel"
                >
                  <span className="absolute w-[68px] h-[68px] rounded-full bg-[#82c98d]/50 pointer-events-none animate-bg-blow-base" />
                  <span className="absolute w-[68px] h-[68px] rounded-full bg-[#82c98d]/65 pointer-events-none animate-bg-blow-wave1" />
                  <span className="absolute w-[68px] h-[68px] rounded-full bg-[#82c98d]/65 pointer-events-none animate-bg-blow-wave2" />
                  <img
                    src="/games/talegram.png"
                    alt="Telegram Support"
                    style={{ width: '65px', height: '65px' }}
                    className="w-[30px] h-[30px] object-contain relative z-10"
                  />
                </a>

                {/* Golden 4-Way Arrow Button that redirects to Aviator inner page (ONLY inside matches) */}
                {activeSport === 'match_detail' && (
                  <button
                    type="button"
                    onClick={() => navigate('/casino/aviator')}
                    style={{
                      background: 'linear-gradient(135deg, #caa049 0%, #b8862f 100%)',
                      border: '2px solid #ebda8d',
                    }}
                    className="absolute -top-1 -left-1 w-[36px] h-[36px] rounded-full shadow-lg flex items-center justify-center z-30 cursor-pointer hover:scale-110 active:scale-95 transition-all"
                    title="Play Aviator"
                    aria-label="Play Aviator"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 fill-white drop-shadow-xs"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2L8 6h3v4H7V7L3 11l4 4v-3h4v4H8l4 4 4-4h-3v-4h4v3l4-4-4-4v3h-4V6h3L12 2z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 7. BOTTOM NAVIGATION BAR */}
              <BottomNav
                activeTab={
                  activeSport === 'favourites' || activeSport === 'multi_market'
                    ? 'favourites'
                    : activeSport === 'casino'
                    ? 'casino'
                    : activeSport === 'inplay' || !activeSport
                    ? 'home'
                    : activeSport === 'cricket' || activeSport === 'soccer' || activeSport === 'tennis'
                    ? 'sports'
                    : activeBottomNav
                }
                onSelectTab={handleBottomNavSelect}
              />
            </>
          )}
        </div>
      </div>

      {/* 2. DESKTOP VIEW (Rendered on lg: and larger screens, matching reference screenshot) */}
      <div className="hidden lg:flex flex-col w-full min-h-screen">
        <DesktopLayout
          user={user}
          setUser={setUser}
          activeSport={activeSport}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenRules={() => setBonusRulesModalOpen(true)}
          onProfileClick={() => setProfileMenuOpen(!profileMenuOpen)}
          onAuthClick={(type) => setAuthModal(type)}
          onLogout={handleLogout}
          onSelectSport={handleSelectSport}
          navigate={navigate}
          allMatches={allMatches}
          filteredInplay={filteredInplay}
          filteredExchange={filteredExchange}
          filteredSportMatches={filteredSportMatches}
          filteredFavorites={filteredFavorites}
          exchangeTab={exchangeTab}
          setExchangeTab={setExchangeTab}
          handleOddsClick={handleOddsClick}
          handleMatchClick={handleMatchClick}
          favorites={favorites}
          handleToggleFavorite={handleToggleFavorite}
          currentMatch={currentMatch}
          setToast={setToast}
          onGameClick={handleLaunchGame}
        />
      </div>

      {/* MODALS AND DRAWERS (Accessible from both Mobile and Desktop) */}
      <SideDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelectSport={(sport) => {
          handleSelectSport(sport);
          setMenuOpen(false);
        }}
        onAuthClick={(type) => {
          setAuthModal(type);
          setMenuOpen(false);
        }}
        onOpenRules={() => setBonusRulesModalOpen(true)}
      />

      <AuthModal
        isOpen={!!authModal}
        type={authModal}
        onClose={() => setAuthModal(null)}
        onLoginSuccess={handleLoginSuccess}
      />

      <BetSlipDrawer
        selectedBet={selectedBet}
        betStake={betStake}
        setBetStake={setBetStake}
        onClose={() => setSelectedBet(null)}
        onPlaceBet={handlePlaceBet}
      />

      <UserProfileMenu
        isOpen={profileMenuOpen}
        user={user}
        onClose={() => setProfileMenuOpen(false)}
        onLogout={handleLogout}
        onOpenBonusRules={() => setBonusRulesModalOpen(true)}
        onOpenLanguageModal={() => setLanguageModalOpen(true)}
      />

      <BonusRulesModal
        isOpen={bonusRulesModalOpen}
        onClose={() => setBonusRulesModalOpen(false)}
      />

      <ChangeLanguageModal
        isOpen={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={(lang) => {
          setCurrentLanguage(lang);
          setToast({
            id: Date.now(),
            type: 'add',
            message: `Language changed to ${lang}`,
          });
        }}
      />
    </div>
  );
}
