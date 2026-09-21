import React from 'react';
import { Search, Megaphone, ChevronDown, ChevronRight, Send, Volume2 } from 'lucide-react';
import SportSection from './SportSection';
import InplayOddsTable from './InplayOddsTable';
import ExchangeMatches from './ExchangeMatches';
import CasinoProviders from './CasinoProviders';
import RacingSection from './RacingSection';
import DepositSection from './DepositSection';
import ChangePasswordSection from './ChangePasswordSection';
import OpenBetsSection from './OpenBetsSection';
import MyBetsSection from './MyBetsSection';
import BettingProfitLossSection from './BettingProfitLossSection';
import BonusesSection from './BonusesSection';
import StakeSettingsSection from './StakeSettingsSection';
import AccountStatementSection from './AccountStatementSection';
import AffiliateSection from './AffiliateSection';
import MatchDetailSection from './MatchDetailSection';
import CasinoGamesSection from './CasinoGamesSection';
import Mac88Section from './Mac88Section';

export default function DesktopLayout({
  user,
  activeSport,
  searchQuery,
  setSearchQuery,
  onOpenRules,
  onProfileClick,
  onAuthClick,
  onLogout,
  onSelectSport,
  navigate,
  allMatches,
  filteredInplay,
  filteredExchange,
  filteredSportMatches,
  filteredFavorites,
  exchangeTab,
  setExchangeTab,
  handleOddsClick,
  handleMatchClick,
  favorites,
  handleToggleFavorite,
  currentMatch,
  setToast,
}) {
  // 14 Featured Casino Cards matching desktop screenshot (2 rows x 7)
  const featuredGames = [
    // Row 1
    { id: 'aviator', title: 'AVIATOR', image: '/games/featured_aviator.gif', badge: '' },
    { id: 'mines', title: 'MINES', image: '/games/featured_mines.gif', badge: '' },
    { id: 'baccarat', title: 'BACCARAT', image: '/games/featured_baccarat.jpg', badge: 'LIVE' },
    { id: 'teenpatti', title: 'TEENPATTI', image: '/games/featured_teenpatti.jpg', badge: 'LIVE' },
    { id: 'vortex', title: 'VORTEX', image: '/games/featured_vortex.jpg', badge: '' },
    { id: 'aero', title: 'AERO', image: '/games/featured_aero.jpg', badge: '' },
    { id: 'balloon', title: 'BALLOON', image: '/games/featured_balloon.jpg', badge: '' },
    // Row 2
    { id: 'chicken_road', title: 'CHICKEN ROAD / COLOR', image: '/games/featured_chicken_road.gif', badge: '' },
    { id: 'fun_games', title: 'FUN GAMES', image: '/games/featured_fun_games.gif', badge: '' },
    { id: 'blackjack', title: 'BLACK JACK', image: '/games/featured_blackjack.jpg', badge: 'LIVE' },
    { id: 'roulette', title: 'ROULETTE', image: '/games/featured_roulette.jpg', badge: 'LIVE' },
    { id: 'golden_empire', title: 'GOLDEN EMPIRE', image: '/games/featured_golden_empire.jpg', badge: '' },
    { id: 'chicken_route', title: 'CHICKEN ROUTE', image: '/games/featured_chicken_route.jpg', badge: '' },
    { id: 'aviastar', title: 'AVIASTAR', image: '/games/featured_aviastar.jpg', badge: '' },
  ];

  // 3 Showcase Posters
  const showcasePosters = [
    {
      id: 'marble_plinko',
      title: 'MARBLES',
      image: '/games/marbles_marble_plinko_classic.jpg',
      route: '/casino',
    },
    {
      id: 'rolling_dunes',
      title: 'MARBLES',
      image: '/games/marbles_rolling_dunes_classic.jpg',
      route: '/casino',
    },
    {
      id: 'snake_classic',
      title: 'MARBLES',
      image: '/games/marbles_snake_classic.jpg',
      route: '/casino',
    },
  ];

  // Left Sidebar Categories
  const sidebarCategories = [
    { id: 'favourites', label: 'Favourites', icon: '⭐' },
    { id: 'cricket', label: 'Cricket', icon: '🏏' },
    { id: 'soccer', label: 'Soccer', icon: '⚽' },
    { id: 'tennis', label: 'Tennis', icon: '🎾' },
    { id: 'horse', label: 'Horse Racing', icon: '🏇' },
    { id: 'greyhound', label: 'Greyhound Racing', icon: '🐕' },
    { id: 'mac88', label: 'MAC88', icon: '🎲' },
    { id: 'casino', label: 'Casino', icon: '🎰' },
    { id: 'aura', label: 'Aura', icon: '✨' },
    { id: 'sportsbook', label: 'Sports book', icon: '🏆' },
    { id: 'basketball', label: 'Basketball', icon: '🏀' },
  ];

  // Top Nav Items with Separator Dots
  const navItems = [
    { id: 'inplay', label: 'Inplay' },
    { id: 'cricket', label: 'Cricket' },
    { id: 'soccer', label: 'Soccer' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'horse', label: 'Horse Racing' },
    { id: 'greyhound', label: 'Greyhound Racing' },
    { id: 'mac88', label: 'MAC88' },
    { id: 'casino', label: 'Casino' },
    { id: 'sportsbook', label: 'Sport Book', highlight: true },
    { id: 'basketball', label: 'Basketball', highlight: true },
    { id: 'baseball', label: 'Baseball', highlight: true },
    { id: 'tabletennis', label: 'Table Tennis', highlight: true },
    { id: 'volleyball', label: 'VOLLEYBALL', highlight: true },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#000000] text-neutral-900 select-none antialiased">
      {/* 1. TOP GOLDEN HEADER BAR */}
      <header
        style={{
          background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
        }}
        className="h-[56px] px-4 flex items-center justify-between shadow-md z-30 shrink-0"
      >
        {/* Left: Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer hover:opacity-95 transition-opacity"
        >
          <img
            src="/games/public.png"
            alt="KuberBook333"
            className="h-[44px] object-contain"
          />
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Rules Button */}
          <button
            type="button"
            onClick={onOpenRules}
            className="h-[30px] px-3.5 bg-white/90 hover:bg-white text-black font-bold text-[12px] rounded-[4px] border border-[#9c7128] shadow-xs cursor-pointer transition-colors"
          >
            Rules
          </button>

          {/* Search Input Box */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Events"
              className="h-[30px] w-[220px] bg-white/80 hover:bg-white focus:bg-white border border-[#9c7128] rounded-[4px] px-2.5 pr-7 text-[12px] text-black placeholder-neutral-700 outline-none transition-all shadow-inner"
            />
            <Search className="w-3.5 h-3.5 absolute right-2 text-neutral-700 pointer-events-none" />
          </div>

          {/* Affiliate Button */}
          <button
            type="button"
            onClick={() => navigate('/affiliate')}
            className="h-[30px] px-3 bg-[#a00000] hover:bg-[#850000] active:scale-95 text-white font-bold text-[12px] rounded-[4px] shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Megaphone size={14} className="text-white shrink-0" />
            <span>Affiliate</span>
          </button>

          {/* Balance & Exposure Badge */}
          <div className="text-right leading-tight font-extrabold text-[11px] text-black">
            <div>Bal: {user?.balance !== undefined ? user.balance : 1500}</div>
            <div className="text-[#a00000]">Exp: {user?.exposure !== undefined ? user.exposure : 0}</div>
          </div>

          {/* Demo User Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={onProfileClick}
              className="h-[30px] px-3 bg-white/80 hover:bg-white border border-[#9c7128] rounded-[4px] text-black text-[12px] font-bold cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>{user?.name || user?.username || 'Demo'}</span>
              <ChevronDown size={14} className="text-neutral-700" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MATCH HIGHLIGHTS BAR (4 COLORED PILLS) */}
      <div className="grid grid-cols-4 text-white text-[12px] font-bold text-center select-none shadow-xs shrink-0">
        <div
          onClick={() => navigate('/cricket')}
          className="bg-[#800000] hover:bg-[#950000] py-1.5 px-2 truncate cursor-pointer transition-colors border-r border-black/20"
        >
          Zimbabwe v Australia
        </div>
        <div
          onClick={() => navigate('/cricket')}
          className="bg-[#007b15] hover:bg-[#008f18] py-1.5 px-2 truncate cursor-pointer transition-colors border-r border-black/20"
        >
          Queensland Bulls v Victoria
        </div>
        <div
          onClick={() => navigate('/cricket')}
          className="bg-[#800000] hover:bg-[#950000] py-1.5 px-2 truncate cursor-pointer transition-colors border-r border-black/20"
        >
          Zimbabwe W v South Africa W
        </div>
        <div
          onClick={() => navigate('/cricket')}
          className="bg-[#007b15] hover:bg-[#008f18] py-1.5 px-2 truncate cursor-pointer transition-colors"
        >
          England v Sri Lanka
        </div>
      </div>

      {/* 3. DESKTOP NAVIGATION BAR */}
      <nav className="bg-[#000000] text-white text-[12px] font-bold px-4 py-1.5 flex items-center gap-2 overflow-x-auto border-b border-[#222] select-none shrink-0">
        {navItems.map((item, idx) => {
          const isActive =
            (item.id === 'inplay' && (!activeSport || activeSport === 'inplay')) ||
            activeSport === item.id;

          return (
            <React.Fragment key={item.id}>
              {item.id === 'inplay' ? (
                <button
                  type="button"
                  onClick={() => onSelectSport(item.id)}
                  className={`px-3 py-0.5 rounded-[12px] text-xs font-black cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#024486] text-white'
                      : 'bg-transparent text-white hover:text-amber-400'
                  }`}
                >
                  {item.label}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectSport(item.id)}
                  className={`text-xs font-bold cursor-pointer transition-colors ${
                    item.highlight ? 'text-[#ffd700] hover:underline' : 'text-white hover:text-amber-400'
                  } ${isActive ? 'text-amber-400 underline font-black' : ''}`}
                >
                  {item.label}
                </button>
              )}
              {idx < navItems.length - 1 && (
                <span className="text-gray-500 font-normal select-none">•</span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* 4. MAIN DESKTOP BODY: SIDEBAR + CONTENT AREA */}
      <div className="flex flex-1 w-full bg-[#111111] overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[190px] shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between select-none py-1 text-xs">
          {/* Categories List */}
          <div className="flex flex-col divide-y divide-gray-100">
            {sidebarCategories.map((item) => {
              const isActive = activeSport === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSport(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-50 text-[#b6842d] font-bold'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-[14px] leading-none shrink-0">{item.icon}</span>
                    <span className="text-gray-900 font-semibold text-[12px]">{item.label}</span>
                  </div>
                  <ChevronRight size={13} className="text-gray-400 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Social Links at Bottom of Sidebar */}
          <div className="p-3 border-t border-gray-200 space-y-2 mt-auto">
            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[#0088cc] hover:underline font-semibold text-[11px]"
            >
              <div className="w-4 h-4 rounded-full bg-[#0088cc] text-white flex items-center justify-center shrink-0">
                <Send size={9} className="-ml-0.5 mt-0.5" />
              </div>
              <span>Follow On Telegram</span>
            </a>

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[#00c950] hover:underline font-semibold text-[11px]"
            >
              <div className="w-4 h-4 rounded-full bg-[#00c950] text-white flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.538 1.838.82 2.791.82 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.708 0-3.32-.434-4.739-1.196l-5.261 1.378 1.405-5.132c-.87-1.485-1.373-3.21-1.373-5.05 0-5.514 4.486-10 10-10s10 4.486 10 10z"/>
                </svg>
              </div>
              <span>connect on whatsapp</span>
            </a>
          </div>
        </aside>

        {/* Center / Right Content Area */}
        <main className="flex-1 bg-[#1a1a1a] p-2 flex flex-col space-y-2 overflow-y-auto max-h-[calc(100vh-125px)] custom-scrollbar">
          {/* Speaker / Marquee Announcement Bar */}
          <div className="bg-[#000000] text-white h-[26px] px-2 flex items-center gap-2 rounded-xs overflow-hidden shrink-0 border border-neutral-800">
            <Volume2 className="w-4 h-4 text-[#0088cc] shrink-0" />
            <div className="flex-1 overflow-hidden whitespace-nowrap">
              <div
                style={{
                  display: 'flex',
                  width: 'max-content',
                  whiteSpace: 'nowrap',
                  animation: 'tickerLoop 25s linear infinite',
                }}
                className="animate-ticker-loop flex items-center"
              >
                <span className="font-extrabold text-[11px] text-white uppercase tracking-wider pr-10">
                  WELCOME TO OUR EXCHANGE. TRADE BETS AND WRONG BETS WILL BE DELETED. CHEATING BETS WILL RESULT IN ACCOUNT SUSPENSION. PLAY RESPONSIBLY.
                </span>
                <span className="font-extrabold text-[11px] text-white uppercase tracking-wider pr-10">
                  WELCOME TO OUR EXCHANGE. TRADE BETS AND WRONG BETS WILL BE DELETED. CHEATING BETS WILL RESULT IN ACCOUNT SUSPENSION. PLAY RESPONSIBLY.
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC CONTENT ROUTING */}
          {activeSport === 'deposit' || activeSport === 'withdraw' ? (
            <div className="bg-white rounded p-4 shadow-sm">
              <DepositSection user={user} onToast={setToast} activeTab={activeSport} />
            </div>
          ) : activeSport === 'change_password' ? (
            <div className="bg-white rounded p-4 shadow-sm">
              <ChangePasswordSection user={user} onToast={setToast} />
            </div>
          ) : activeSport === 'open_bets' ? (
            <div className="bg-white rounded p-4 shadow-sm">
              <OpenBetsSection user={user} onToast={setToast} />
            </div>
          ) : activeSport === 'my_bets' ? (
            <div className="bg-white rounded p-4 shadow-sm">
              <MyBetsSection user={user} onToast={setToast} />
            </div>
          ) : activeSport === 'profit_loss' ? (
            <div className="bg-white rounded p-4 shadow-sm">
              <BettingProfitLossSection user={user} onToast={setToast} />
            </div>
          ) : activeSport === 'bonuses' ? (
            <div className="bg-white rounded p-4 shadow-sm">
              <BonusesSection user={user} />
            </div>
          ) : activeSport === 'settings' ? (
            <div className="bg-white rounded p-4 shadow-sm">
              <StakeSettingsSection onToast={setToast} />
            </div>
          ) : activeSport === 'account_statement' ? (
            <div className="bg-white rounded p-4 shadow-sm">
              <AccountStatementSection user={user} onToast={setToast} />
            </div>
          ) : activeSport === 'affiliate' ? (
            <div className="bg-white rounded p-4 shadow-sm">
              <AffiliateSection user={user} />
            </div>
          ) : activeSport === 'match_detail' ? (
            <div className="bg-white rounded p-2 shadow-sm">
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
            </div>
          ) : (!activeSport || activeSport === 'inplay') ? (
            /* INPLAY / HOME VIEW MATCHING DESKTOP SCREENSHOT */
            <div className="flex flex-col space-y-2">
              {/* 14 Featured Casino Cards Grid (2 rows x 7 columns) */}
              <div className="grid grid-cols-7 gap-1.5">
                {featuredGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      if (game.id === 'mines') navigate('/mines');
                      else if (game.id === 'chicken_road' || game.id === 'color_prediction') navigate('/color-prediction');
                      else if (game.id === 'fun_games') navigate('/fun-games');
                      else navigate('/casino/aviator');
                    }}
                    className="relative rounded-xs overflow-hidden border border-neutral-700 bg-neutral-900 cursor-pointer group shadow-sm hover:scale-[1.02] hover:border-amber-400 transition-all aspect-[16/9]"
                  >
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {game.badge && (
                      <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1 py-0.5 rounded-[2px] leading-none shadow-xs">
                        {game.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* "New Launch" Golden Strip Banner */}
              <div
                style={{
                  background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                }}
                className="h-[28px] flex items-center justify-center font-black text-white text-[13px] uppercase tracking-wider rounded-xs shadow-xs"
              >
                New Launch
              </div>

              {/* 3 Large Showcase Posters (3 Columns) */}
              <div className="grid grid-cols-3 gap-2">
                {showcasePosters.map((poster) => (
                  <div
                    key={poster.id}
                    onClick={() => navigate(poster.route)}
                    className="relative rounded-xs overflow-hidden border border-neutral-700 bg-neutral-900 cursor-pointer group shadow-md hover:border-amber-400 transition-all aspect-[4/3]"
                  >
                    <img
                      src={poster.image}
                      alt={poster.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>

              {/* Inplay Matches Table */}
              <div className="bg-white rounded-xs shadow-xs overflow-hidden">
                <InplayOddsTable
                  matches={filteredInplay}
                  onOddsClick={handleOddsClick}
                  onMatchClick={handleMatchClick}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>

              {/* Casino Providers */}
              <div className="bg-white rounded-xs shadow-xs p-2">
                <CasinoProviders onProviderClick={() => navigate('/casino')} />
              </div>

              {/* Exchange Games Table */}
              <div className="bg-white rounded-xs shadow-xs overflow-hidden">
                <ExchangeMatches
                  matches={filteredExchange}
                  exchangeTab={exchangeTab}
                  onTabChange={(tab) => setExchangeTab(tab)}
                  onOddsClick={handleOddsClick}
                  onMatchClick={handleMatchClick}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            </div>
          ) : activeSport === 'casino' ? (
            <div className="bg-white rounded p-2 shadow-sm">
              <CasinoGamesSection onGameClick={() => onAuthClick('login')} />
            </div>
          ) : activeSport === 'mac88' ? (
            <div className="bg-white rounded p-2 shadow-sm">
              <Mac88Section onGameClick={() => onAuthClick('login')} />
            </div>
          ) : (activeSport === 'horse' || activeSport === 'greyhound') ? (
            <div className="bg-white rounded p-2 shadow-sm">
              <RacingSection sport={activeSport} />
            </div>
          ) : (activeSport === 'favourites' || activeSport === 'multi_market') ? (
            <div className="bg-white rounded-xs shadow-xs overflow-hidden">
              <SportSection
                sport="favourites"
                matches={filteredFavorites}
                onOddsClick={handleOddsClick}
                onMatchClick={handleMatchClick}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xs shadow-xs overflow-hidden">
              <SportSection
                sport={activeSport}
                matches={filteredSportMatches}
                onOddsClick={handleOddsClick}
                onMatchClick={handleMatchClick}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          )}
        </main>
      </div>

      {/* 5. DESKTOP FOOTER */}
      <footer className="bg-black text-white text-center py-2 text-[11px] font-medium border-t border-neutral-800 shrink-0">
        Rules & Regulations © 2023
      </footer>

      {/* Floating Customer Support Buttons on Desktop */}
      <a
        href="https://wa.me/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ width: '60px', height: '60px' }}
        className="fixed bottom-4 left-4 z-40 flex items-center justify-center drop-shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        aria-label="24x7 WhatsApp Customer Support"
      >
        <img
          src="/games/wp_support.png"
          alt="24x7 Support"
          className="w-[60px] h-[60px] object-contain"
        />
      </a>

      <a
        href="https://t.me/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ width: '56px', height: '56px' }}
        className="fixed bottom-4 right-4 z-40 flex items-center justify-center drop-shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        aria-label="Telegram Support"
      >
        <img
          src="/games/talegram.png"
          alt="Telegram"
          className="w-[56px] h-[56px] object-contain"
        />
      </a>
    </div>
  );
}
