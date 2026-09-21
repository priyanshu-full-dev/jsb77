import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../KuberBook.css';

import Header from '../components/Header';
import TickerMarquee from '../components/TickerMarquee';
import SportsTabs from '../components/SportsTabs';
import CricketSection from '../components/CricketSection';
import AuthModal from '../components/AuthModal';
import BetSlipDrawer from '../components/BetSlipDrawer';
import SideDrawer from '../components/SideDrawer';
import SearchModal from '../components/SearchModal';
import BottomNav from '../components/BottomNav';
import UserProfileMenu from '../components/UserProfileMenu';
import ToastNotification from '../components/ToastNotification';

export default function CricketPage() {
  const navigate = useNavigate();
  const [activeBottomNav, setActiveBottomNav] = useState('sports');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModal, setAuthModal] = useState(null);
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

  const handleMatchClick = (match) => {
    if (!match) return;
    const eventId = match.eventId || (match.id ? String(match.id).replace(/^match_/, '') : 'surrey_w_v_somerset_w');
    navigate(`/match/${match.id}?eventId=${eventId}&eventType=4&sport=cricket&marketId=${match.marketId || eventId}&eventName=${encodeURIComponent(match.title || '')}`);
  };

  const handleOddsClick = (match) => {
    handleMatchClick(match);
  };

  const handlePlaceBet = () => {
    if (selectedBet) {
      alert(`Bet placed successfully on ${selectedBet.match} (${selectedBet.type}) @ ${selectedBet.odd} for ₹${betStake}!`);
      setSelectedBet(null);
    }
  };

  const handleSelectSport = (sport) => {
    if (sport === 'cricket') {
      navigate('/cricket');
    } else if (sport === 'inplay') {
      navigate('/');
    } else if (sport === 'soccer') {
      navigate('/soccer');
    } else if (sport === 'tennis') {
      navigate('/tennis');
    } else {
      navigate(`/${sport}`);
    }
  };

  const handleBottomNavSelect = (tab) => {
    setActiveBottomNav(tab);
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'sports') {
      navigate('/cricket');
    } else if (tab === 'inplay') {
      navigate('/');
    } else if (tab === 'casino' || tab === 'favourites') {
      setAuthModal('login');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-900 flex justify-center font-sans select-none antialiased">
      {/* Exact Mobile App Container */}
      <div className="w-full max-w-[480px] bg-[#f2f4f7] min-h-screen shadow-2xl relative flex flex-col pb-20">
        {/* 1. TOP BLACK HEADER */}
        <Header
          user={user}
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

        {/* 2. TICKER MARQUEE BAR (Exact same component as home page) */}
        <TickerMarquee />

        {/* 3. SPORTS CATEGORY TABS (Active: Cricket) */}
        <SportsTabs
          activeSport="cricket"
          onSelectSport={handleSelectSport}
        />

        {/* 4. DEDICATED CRICKET SECTION */}
        <CricketSection
          onOddsClick={handleOddsClick}
          onMatchClick={handleMatchClick}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          searchQuery={searchQuery}
        />

        {/* 5. TOAST NOTIFICATION */}
        <ToastNotification
          toast={toast}
          onClose={() => setToast(null)}
        />

        {/* 6a. FLOATING WHATSAPP 24x7 CUSTOMER SUPPORT BUTTON */}
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: '70px', height: '70px' }}
          className="fixed bottom-[68px] left-0 z-40 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] cursor-pointer"
          aria-label="24x7 WhatsApp Customer Support"
        >
          <img
            src="/games/wp_support.png"
            alt="24x7 Customer Support"
            style={{ width: '70px', height: '70px' }}
            className="w-[70px] h-[70px] object-contain animate-wp-support"
          />
        </a>

        {/* 6b. FLOATING TELEGRAM BUTTON */}
        <a
          href="https://t.me/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: '70px', height: '70px' }}
          className="fixed bottom-[68px] right-2 z-40 flex items-center justify-center cursor-pointer group"
          aria-label="Telegram Channel"
        >
          <span className="absolute w-[68px] h-[68px] rounded-full bg-[#82c98d]/50 pointer-events-none animate-bg-blow-base" />
          <span className="absolute w-[68px] h-[68px] rounded-full bg-[#82c98d]/65 pointer-events-none animate-bg-blow-wave1" />
          <span className="absolute w-[68px] h-[68px] rounded-full bg-[#82c98d]/65 pointer-events-none animate-bg-blow-wave2" />
          <img
            src="/games/talegram.png"
            alt="Telegram Support"
            style={{ width: '70px', height: '70px' }}
            className="w-[50px] h-[50px] object-contain relative z-10"
          />
        </a>

        {/* 7. BOTTOM NAVIGATION BAR */}
        <BottomNav
          activeTab={activeBottomNav}
          onSelectTab={handleBottomNavSelect}
        />

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
        />
      </div>
    </div>
  );
}
