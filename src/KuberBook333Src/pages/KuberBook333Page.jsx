import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../KuberBook.css';

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
import ChangeLanguageModal from '../components/ChangeLanguageModal';
import BonusRulesModal from '../components/BonusRulesModal';
import AuthModal from '../components/AuthModal';
import BetSlipDrawer from '../components/BetSlipDrawer';
import SideDrawer from '../components/SideDrawer';
import SearchModal from '../components/SearchModal';
import BottomNav from '../components/BottomNav';
import UserProfileMenu from '../components/UserProfileMenu';
import ToastNotification from '../components/ToastNotification';

const getSportFromPath = (pathname) => {
  const clean = pathname.replace(/^\//, '').toLowerCase();
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
  if (clean.startsWith('affiliate') || clean.startsWith('affiliates')) return 'affiliate';
  if (!clean || clean === 'inplay' || clean === 'kuberbook333' || clean === 'b2c') return 'inplay';
  if (clean.startsWith('match') || clean.startsWith('event')) return 'match_detail';
  if (
    clean === 'aviator' ||
    clean === 'casino' ||
    clean === 'livecasino' ||
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
  if (clean === 'cricket') return 'cricket';
  if (clean === 'soccer' || clean === 'football') return 'soccer';
  if (clean === 'tennis') return 'tennis';
  if (clean === 'horse' || clean === 'horseracing' || clean === 'horse_racing' || clean === 'horse-racing') return 'horse';
  if (clean === 'greyhound' || clean === 'greyhound_racing' || clean === 'greyhound-racing') return 'greyhound';
  if (clean === 'mac88') return 'mac88';
  if (clean === 'sportsbook' || clean === 'sports_book' || clean === 'sports-book') return 'sportsbook';
  if (clean === 'basketball') return 'basketball';
  if (clean === 'volleyball') return 'volleyball';
  if (clean === 'tabletennis' || clean === 'table_tennis' || clean === 'table-tennis') return 'tabletennis';
  if (clean === 'mma') return 'mma';
  return clean;
};

export default function KuberBook333Page() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active sport dynamically synced with current React Router DOM path
  const activeSport = getSportFromPath(location.pathname);
  const [selectedSportTab, setSelectedSportTab] = useState(() => {
    const clean = location.pathname.replace(/^\//, '').toLowerCase();
    if (!clean || clean === 'inplay' || clean === 'kuberbook333' || clean === 'b2c') return 'inplay';
    if (clean.startsWith('match') || clean.startsWith('event')) return 'inplay';
    return clean;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const clean = location.pathname.replace(/^\//, '').toLowerCase();
    if (!clean || clean === 'inplay' || clean === 'kuberbook333' || clean === 'b2c') {
      setSelectedSportTab('inplay');
    } else if (!clean.startsWith('match') && !clean.startsWith('event')) {
      setSelectedSportTab(clean);
    }
  }, [location.pathname]);

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
  const [favorites, setFavorites] = useState(new Set());
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast notification after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleToggleFavorite = (match) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      const isFav = next.has(match.id);
      if (isFav) {
        next.delete(match.id);
        setToast({
          id: Date.now(),
          type: 'remove',
          message: 'Event Removed Successfully',
        });
      } else {
        next.add(match.id);
        setToast({
          id: Date.now(),
          type: 'add',
          message: 'Event Added Successfully',
        });
      }
      return next;
    });
  };

  // Comprehensive Real Fixtures Dataset across Football, Tennis, Cricket, and Live Inplay
  const allMatches = [
    // --- LIVE INPLAY MATCH: SURREY W V SOMERSET W (Matching User Match Detail Screenshots) ---
    {
      id: 'surrey_w_v_somerset_w',
      sport: 'cricket',
      date: 'today',
      title: 'Surrey W v Somerset W',
      time: '12/09/2026, 15:30',
      live: true,
      odds: ['3.5', '5.7', '0', '0', '1.21', '1.4'],
      hasTv: true,
      hasF: true,
      hasBm: true,
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
    },

    // --- LIVE INPLAY MATCH 1: CRICKET - NAMIBIA V SOUTH AFRICA ---
    {
      id: 'namibia_v_south_africa',
      sport: 'cricket',
      date: 'today',
      title: 'Namibia v South Africa',
      time: '11/09/2026, 13:00',
      live: true,
      odds: ['6', '6.2', '0', '0', '1.19', '1.2'],
      hasTv: true,
      hasF: true,
      hasBm: true,
      minBet: '1',
      maxBet: '25000',
      runners: [
        {
          id: 'runner_1',
          name: 'Namibia',
          back: { odd: '6', size: '2.5' },
          lay: { odd: '6.2', size: '3.1' },
        },
        {
          id: 'runner_2',
          name: 'South Africa',
          back: { odd: '1.19', size: '15.2' },
          lay: { odd: '1.2', size: '25.0' },
        },
      ],
    },

    // --- LIVE INPLAY MATCH 2: TENNIS - IVASHKA V YI ZHOU ---
    {
      id: 'ivashka_v_yi_zhou',
      sport: 'tennis',
      date: 'today',
      title: 'Ivashka v Yi Zhou',
      time: '11/09/2026, 12:30',
      live: true,
      odds: ['1.29', '1.44', '0', '0', '3.25', '4.5'],
      hasTv: true,
      hasF: false,
      hasBm: false,
      minBet: '1',
      maxBet: '25000',
      runners: [
        {
          id: 'runner_1',
          name: 'Ivashka',
          back: { odd: '1.29', size: '4.5' },
          lay: { odd: '1.44', size: '2.8' },
        },
        {
          id: 'runner_2',
          name: 'Yi Zhou',
          back: { odd: '3.25', size: '1.8' },
          lay: { odd: '4.5', size: '3.2' },
        },
      ],
    },

    // --- TENNIS: JAY FRIEND V MICHELE RIBECAI (Matching User Match Detail Screenshots) ---
    {
      id: 'ja_friend_v_ribecai',
      sport: 'tennis',
      date: 'today',
      title: 'Ja Friend v Ribecai',
      time: '08/09/2026, 12:30',
      live: false,
      odds: ['1.96', '1.98', '0', '0', '2.02', '2.04'],
      hasTv: true,
      minBet: '1',
      maxBet: '25000',
      runners: [
        {
          id: 'runner_1',
          name: 'Jay Friend',
          back: { odd: '1.94', size: '1.92' },
          lay: { odd: '1.99', size: '2.94' },
        },
        {
          id: 'runner_2',
          name: 'Michele Ribecai',
          back: { odd: '2.00', size: '2.93' },
          lay: { odd: '2.06', size: '1.81' },
        },
      ],
    },

    // --- FOOTBALL / SOCCER FIXTURES (Matching Football screenshot) ---
    {
      id: 'fb_1',
      sport: 'soccer',
      date: 'today',
      title: 'Bulgaria v Luxembourg',
      time: '26/09/2026, 21:30',
      live: false,
      odds: ['1.01', '12', '1.09', '0', '1.09', '0'],
      hasTv: false,
      minBet: '1',
      maxBet: '25000',
      runners: [
        {
          id: 'fb_r1',
          name: 'Bulgaria',
          back: { odd: '1.01', size: '12.5' },
          lay: { odd: '12', size: '4.2' },
        },
        {
          id: 'fb_r2',
          name: 'Luxembourg',
          back: { odd: '1.09', size: '1.9' },
          lay: { odd: '15', size: '2.1' },
        },
      ],
    },
    {
      id: 'fb_2',
      sport: 'soccer',
      date: 'today',
      title: 'San Marino v Finland',
      time: '26/09/2026, 21:30',
      live: false,
      odds: ['1.04', '950', '1.01', '540', '1.07', '1.12'],
      hasTv: false,
    },
    {
      id: 'fb_3',
      sport: 'soccer',
      date: 'today',
      title: 'Iceland v Estonia',
      time: '26/09/2026, 21:30',
      live: false,
      odds: ['1.04', '8.8', '1.12', '500', '1.14', '0'],
      hasTv: false,
    },
    {
      id: 'fb_4',
      sport: 'soccer',
      date: 'today',
      title: 'Slovenia v Scotland',
      time: '26/09/2026, 18:30',
      live: false,
      odds: ['1.06', '17', '1.13', '3.8', '1.06', '17'],
      hasTv: false,
    },
    {
      id: 'fb_5',
      sport: 'soccer',
      date: 'today',
      title: 'Hungary v Ukraine',
      time: '26/09/2026, 00:15',
      live: false,
      odds: ['1.24', '15', '1.09', '6.8', '1.27', '0'],
      hasTv: false,
    },
    {
      id: 'fb_6',
      sport: 'soccer',
      date: 'today',
      title: 'Montenegro v Cyprus',
      time: '26/09/2026, 00:15',
      live: false,
      odds: ['1.15', '18', '1.12', '4.2', '1.18', '22'],
      hasTv: false,
    },
    {
      id: 'fb_7',
      sport: 'soccer',
      date: 'today',
      title: 'Caykur Rizespor U19 v Alanyaspor U19',
      time: '07/09/2026, 18:30',
      live: false,
      odds: ['2.22', '2.46', '3.55', '3.95', '3.1', '3.5'],
      hasTv: false,
    },
    {
      id: 'fb_8',
      sport: 'soccer',
      date: 'today',
      title: 'Goztepe U19 v Gazisehir Gaziantep U19',
      time: '07/09/2026, 18:30',
      live: false,
      odds: ['1.54', '1.63', '4.5', '5', '5.7', '6.8'],
      hasTv: false,
    },
    {
      id: 'fb_9',
      sport: 'soccer',
      date: 'today',
      title: 'Istanbulspor v 76 Igdir Belediyespor',
      time: '07/09/2026, 19:30',
      live: false,
      odds: ['3.4', '3.55', '3.55', '3.75', '2.28', '2.34'],
      hasTv: true,
    },
    {
      id: 'fb_10',
      sport: 'soccer',
      date: 'today',
      title: 'Erokspor A.S v Kayserispor',
      time: '07/09/2026, 19:30',
      live: false,
      odds: ['2.64', '2.72', '3.45', '3.65', '2.78', '2.9'],
      hasTv: true,
    },
    {
      id: 'fb_11',
      sport: 'soccer',
      date: 'today',
      title: 'Olympic El Qanal v El Geish',
      time: '07/09/2026, 19:30',
      live: false,
      odds: ['2.5', '3.7', '2.8', '2.84', '2.7', '2.78'],
      hasTv: true,
    },
    {
      id: 'fb_12',
      sport: 'soccer',
      date: 'today',
      title: 'CSC 1599 Selimbar v Metalul Buzau',
      live: false,
      time: '07/09/2026, 13:30',
      odds: ['13', '13.5', '4.3', '4.5', '1.43', '1.45'],
      hasTv: true,
      hasF: true,
      hasBm: true,
    },

    // --- TENNIS FIXTURES (Matching Tennis screenshot) ---
    {
      id: 'tn_1',
      sport: 'tennis',
      date: 'today',
      title: 'Bax v Max Jones',
      time: '08/09/2026, 08:30',
      live: false,
      odds: ['1.69', '3.4', '0', '0', '1.43', '2.44'],
      hasTv: true,
    },
    {
      id: 'tn_2',
      sport: 'tennis',
      date: 'today',
      title: 'Lajovic v Ma Landaluce',
      time: '08/09/2026, 23:45',
      live: false,
      odds: ['2.28', '2.38', '0', '0', '1.72', '1.78'],
      hasTv: false,
    },
    {
      id: 'tn_3',
      sport: 'tennis',
      date: 'today',
      title: 'Gaubas v Pa Lagutin',
      time: '08/09/2026, 22:40',
      live: false,
      odds: ['1.44', '1.49', '0', '0', '3.05', '3.25'],
      hasTv: false,
    },
    {
      id: 'tn_4',
      sport: 'tennis',
      date: 'today',
      title: 'Campana Lee v Alcalà Gurri',
      time: '08/09/2026, 22:40',
      live: false,
      odds: ['3.8', '4.2', '0', '0', '1.32', '1.36'],
      hasTv: false,
    },
    {
      id: 'tn_5',
      sport: 'tennis',
      date: 'today',
      title: 'Tiafoe v Al Michelsen',
      time: '08/09/2026, 22:30',
      live: false,
      odds: ['1.7', '1.72', '0', '0', '2.4', '2.48'],
      hasTv: false,
    },
    {
      id: 'tn_6',
      sport: 'tennis',
      date: 'today',
      title: 'Sonego v Passaro',
      time: '08/09/2026, 22:00',
      live: false,
      odds: ['1.52', '1.58', '0', '0', '2.6', '2.7'],
      hasTv: false,
    },
    {
      id: 'tn_7',
      sport: 'tennis',
      date: 'today',
      title: "Benj O'Connell v Ichikawa",
      live: false,
      time: '07/09/2026, 08:30',
      odds: ['1.03', '1.05', '0', '0', '21', '34'],
      hasTv: true,
    },
    {
      id: 'tn_8',
      sport: 'tennis',
      date: 'today',
      title: 'Ol Ovcharenko v G Kravchenko',
      live: false,
      time: '07/09/2026, 14:30',
      odds: ['1.89', '1.97', '0', '0', '2.04', '2.1'],
      hasTv: true,
    },
    {
      id: 'tn_9',
      sport: 'tennis',
      date: 'today',
      title: 'D Obradovic v Th Faurel',
      live: false,
      time: '07/09/2026, 14:30',
      odds: ['1.24', '1.26', '0', '0', '4.6', '4.8'],
      hasTv: true,
    },
    {
      id: 'tn_10',
      sport: 'tennis',
      date: 'today',
      title: 'A Zverev v Halys',
      live: false,
      time: '07/09/2026, 06:12',
      odds: ['1.1', '1.11', '0', '0', '10.5', '11'],
      hasTv: true,
    },

    // --- CRICKET FIXTURES (Matching Cricket screenshot) ---
    {
      id: 'cr_leicestershire_v_somerset',
      sport: 'cricket',
      date: 'today',
      title: 'Leicestershire v Somerset',
      time: '08/09/2026, 15:00',
      live: false,
      odds: ['--', '--', '0', '0', '--', '--'],
      hasTv: true,
      hasF: true,
      hasBm: false,
      noMarket: true,
    },
    {
      id: 'cr_1',
      sport: 'cricket',
      date: 'today',
      title: 'Hong Kong W v Pakistan W',
      time: '07/09/2026, 21:00',
      live: false,
      odds: ['--', '--', '0', '0', '--', '--'],
      hasTv: true,
      hasF: true,
      hasBm: true,
      noMarket: true,
    },
    {
      id: 'cr_2',
      sport: 'cricket',
      date: 'tomorrow',
      title: 'United Arab Emirates W v Bangladesh W',
      time: '08/09/2026, 20:00',
      live: false,
      odds: ['--', '--', '0', '0', '--', '--'],
      hasTv: false,
      hasF: false,
      hasBm: true,
      noMarket: true,
    },
    {
      id: 'cr_3',
      sport: 'cricket',
      date: 'upcoming',
      title: 'England v Pakistan',
      time: '09/09/2026, 15:30',
      live: false,
      odds: ['--', '--', '--', '--', '--', '--'],
      hasTv: false,
      hasF: true,
      hasBm: true,
    },
    {
      id: 'cr_4',
      sport: 'cricket',
      date: 'upcoming',
      title: 'Dublin Guardians v Belfast Wolves',
      time: '09/09/2026, 18:45',
      live: false,
      odds: ['--', '--', '0', '0', '--', '--'],
      hasTv: false,
      hasF: false,
      hasBm: true,
    },
    {
      id: 'cr_5',
      sport: 'cricket',
      date: 'upcoming',
      title: 'Rotterdam Dockers v Glasgow Cosmic',
      time: '10/09/2026, 15:00',
      live: false,
      odds: ['--', '--', '0', '0', '--', '--'],
      hasTv: false,
      hasF: false,
      hasBm: false,
    },
    {
      id: 'cr_6',
      sport: 'cricket',
      date: 'today',
      title: 'Trivandrum Royals v Thrissur Titans',
      time: '07/09/2026, 14:30',
      live: false,
      odds: ['1.8', '1.81', '0', '0', '2.22', '2.26'],
      hasTv: true,
      hasF: true,
      hasBm: true,
    },
    {
      id: 'cr_7',
      sport: 'cricket',
      date: 'tomorrow',
      title: 'Meerut Mavericks v Noida Super Kings',
      time: '08/09/2026, 19:30',
      live: false,
      odds: ['1.42', '2.08', '0', '0', '1.93', '3.4'],
      hasTv: true,
      hasBm: true,
      hasF: false,
    },

    // --- HORSE & GREYHOUND RACING FIXTURES ---
    {
      id: 'hr_1',
      sport: 'horse',
      date: 'today',
      title: 'Sandown - 14:15 Hand Stakes',
      time: '08/09/2026, 14:15',
      live: false,
      odds: ['3.25', '3.4', '0', '0', '5.5', '5.8'],
      hasTv: true,
    },
    {
      id: 'hr_2',
      sport: 'horse',
      date: 'today',
      title: 'Ascot - 15:30 Gold Cup Trophy',
      time: '08/09/2026, 15:30',
      live: false,
      odds: ['2.1', '2.2', '0', '0', '4.2', '4.5'],
      hasTv: true,
    },
    {
      id: 'gh_1',
      sport: 'greyhound',
      date: 'today',
      title: 'Romford - 18:09 Open 400m',
      time: '08/09/2026, 18:09',
      live: false,
      odds: ['2.5', '2.6', '0', '0', '3.8', '4.0'],
      hasTv: true,
    },
  ];

  const handleOddsClick = (match, oddValue, oddType) => {
    if (!oddValue || oddValue === '--' || oddValue === '0') return;
    setSelectedBet({
      match: match.title,
      odd: oddValue,
      type: oddType,
      stake: betStake,
    });
  };

  const handlePlaceBet = () => {
    if (selectedBet) {
      alert(`Bet placed successfully on ${selectedBet.match} (${selectedBet.type}) @ ${selectedBet.odd} for ₹${betStake}!`);
      setSelectedBet(null);
    }
  };

  const handleBottomNavSelect = (tab) => {
    setActiveBottomNav(tab);
    if (tab === 'home') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'sports') {
      navigate('/cricket');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'inplay') {
      navigate('/inplay');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'casino' || tab === 'favourites') {
      setAuthModal('login');
    }
  };

  const handleSelectSport = (sport) => {
    if (sport === 'inplay') {
      navigate('/inplay');
    } else {
      navigate(`/${sport}`);
    }
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

  // Extract match ID if on match detail view
  const matchIdMatch = location.pathname.match(/^\/(?:match|event)\/([^/]+)/i);
  const currentMatchId = matchIdMatch ? matchIdMatch[1] : 'surrey_w_v_somerset_w';
  const currentMatch =
    allMatches.find((m) =>
      String(m.id).toLowerCase() === String(currentMatchId).toLowerCase() ||
      m.title?.toLowerCase().replace(/\s+/g, '_') === String(currentMatchId).toLowerCase() ||
      m.title?.toLowerCase() === String(currentMatchId).replace(/_/g, ' ').toLowerCase()
    ) ||
    allMatches[0];

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-900 flex justify-center font-sans select-none antialiased">
      {/* Exact Mobile App Container */}
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
        <TickerMarquee
          onMatchClick={(item) => {
            const found = allMatches.find(
              (m) => m.title?.toLowerCase() === item.title?.toLowerCase()
            );
            if (found) {
              navigate(`/match/${found.id}`);
            } else {
              navigate(`/match/${item.title?.toLowerCase().replace(/\s+/g, '_')}`);
            }
          }}
        />

        {/* 3. SPORTS CATEGORY TABS (5 DISTINCT CARDS) */}
        <SportsTabs
          activeSport={activeSport === 'match_detail' ? selectedSportTab : activeSport}
          onSelectSport={handleSelectSport}
        />

        {/* 4. CONTENT AREA BASED ON ACTIVE SPORT */}
        {activeSport === 'change_password' ? (
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
              onGameClick={(gameId) => {
                if (gameId === 'mines') {
                  navigate('/mines');
                } else if (gameId === 'chicken_road' || gameId === 'color_prediction') {
                  navigate('/color-prediction');
                } else if (gameId === 'fun_games') {
                  navigate('/fun-games');
                } else {
                  navigate('/aviator');
                }
              }}
            />

            {/* "NEW LAUNCH" SECTION (GOLD BANNER + 3 PORTRAIT CARDS) */}
            <NewLaunchSection
              onGameClick={(gameId) => {
                navigate('/aviator');
              }}
            />

            {/* "INPLAY" LIVE ODDS GRID */}
            <InplayOddsTable
              matches={filteredInplay}
              onOddsClick={handleOddsClick}
              onMatchClick={(match) => navigate(`/match/${match.id}`)}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
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
              onMatchClick={(match) => navigate(`/match/${match.id}`)}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        ) : activeSport === 'casino' ? (
          /* CASINO & CRASH GAMES SECTION (AURA, LIVE CASINO, AVIATOR, ETC.) */
          <CasinoGamesSection
            onGameClick={() => {
              setAuthModal('login');
            }}
          />
        ) : activeSport === 'mac88' ? (
          /* MAC88 CASINO GAMES SECTION */
          <Mac88Section
            onGameClick={() => {
              setAuthModal('login');
            }}
          />
        ) : (activeSport === 'horse' || activeSport === 'greyhound') ? (
          /* HORSE RACING & GREYHOUND RACING SECTION */
          <RacingSection sport={activeSport} />
        ) : (
          /* DEDICATED SPORT FIXTURES SECTION (FOOTBALL, CRICKET, TENNIS, ETC.) */
          <SportSection
            sport={activeSport}
            matches={filteredSportMatches}
            onOddsClick={handleOddsClick}
            onMatchClick={(match) => navigate(`/match/${match.id}`)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
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
                  onClick={() => navigate('/aviator')}
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
              activeTab={activeBottomNav}
              onSelectTab={handleBottomNavSelect}
            />
          </>
        )}

        {/* MODALS AND DRAWERS */}
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
    </div>
  );
}
