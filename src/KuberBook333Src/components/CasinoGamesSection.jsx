import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Module-level in-memory cache to persist API data across navigation & back button
let globalIntCasinoCache = null;

export default function CasinoGamesSection({ onGameClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isLiveCasinoPath =
    location.pathname.toLowerCase().includes('livecasino') ||
    location.pathname.toLowerCase().includes('live-casino') ||
    location.pathname.toLowerCase().includes('crash');
  const [activeMainCategory, setActiveMainCategory] = useState(
    isLiveCasinoPath ? 'live_casino' : 'aura'
  );
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [activeThirdTab, setActiveThirdTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [intCasinoData, setIntCasinoData] = useState(() => {
    if (globalIntCasinoCache && globalIntCasinoCache.length > 0) {
      return globalIntCasinoCache;
    }
    try {
      const stored = sessionStorage.getItem('kuber_int_casino_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          globalIntCasinoCache = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isLoadingIntCasinos, setIsLoadingIntCasinos] = useState(
    () => !(globalIntCasinoCache && globalIntCasinoCache.length > 0)
  );

  useEffect(() => {
    let isMounted = true;
    if (globalIntCasinoCache && globalIntCasinoCache.length > 0) {
      setIsLoadingIntCasinos(false);
      return;
    }

    const fetchIntCasinos = async () => {
      try {
        if (!intCasinoData || intCasinoData.length === 0) {
          setIsLoadingIntCasinos(true);
        }
        const res = await fetch('https://api.professor.monster/api/int/getIntCasinos');
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          globalIntCasinoCache = data;
          setIntCasinoData(data);
          try {
            sessionStorage.setItem('kuber_int_casino_cache', JSON.stringify(data));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to fetch international casinos:', err);
      } finally {
        if (isMounted) setIsLoadingIntCasinos(false);
      }
    };

    fetchIntCasinos();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('aviator') || path.includes('avater') || path.includes('avtar')) {
      setActiveMainCategory('live_casino');
      setActiveSubCategory('aviator');
    } else if (path.includes('mines')) {
      setActiveMainCategory('live_casino');
      setActiveSubCategory('mines');
    } else if (path.includes('color-prediction') || path.includes('chicken')) {
      setActiveMainCategory('live_casino');
      setActiveSubCategory('color_prediction');
    } else if (path.includes('livecasino') || path.includes('live-casino') || path.includes('crash')) {
      setActiveMainCategory('live_casino');
      setActiveSubCategory('all');
    } else if (path.includes('aura')) {
      setActiveMainCategory('aura');
      setActiveSubCategory('all');
    } else {
      setActiveMainCategory('aura');
      setActiveSubCategory('all');
    }
  }, [location.pathname]);

  const mainCategories = [
    { id: 'aura', label: 'Aura' },
    { id: 'live_casino', label: 'Live Casino' },
  ];

  // Sub-categories differ based on main category
  const auraSubCategories = [
    { id: 'all', label: 'All', isAll: true },
    { id: 'roulette', label: 'Roulette' },
    { id: 'teenpatti', label: 'Teenpatti' },
    { id: 'poker', label: 'Poker' },
    { id: 'baccarat', label: 'Baccarat' },
    { id: 'dragontiger', label: 'Dragon Tiger' },
    { id: '32cards', label: '32 Cards' },
    { id: 'andarbahar', label: 'Andar Bahar' },
    { id: 'lucky7', label: 'Lucky 7' },
    { id: 'casinowar', label: 'Casino War' },
    { id: 'worli', label: 'Worli' },
    { id: 'bollywood', label: 'Bollywood' },
    { id: 'queen', label: 'Queen' },
    { id: 'race', label: 'Race' },
    { id: 'others', label: 'Others' },
  ];

  const liveCasinoSubCategories = [
    { id: 'all', label: 'All', isAll: true },
    { id: 'aviator', label: 'Aviator' },
    { id: 'color_prediction', label: 'Color Pridiction' },
    { id: 'mines', label: 'Mines' },
    { id: 'fun_games', label: 'Fun Games' },
    { id: 'mac88', label: 'MAC88' },
    { id: 'rg', label: 'RG' },
    { id: 'ezugi', label: 'EZUGI' },
    { id: 'jacktop', label: 'JACKTOP' },
    { id: 'dc', label: 'DC' },
    { id: 'betcore', label: 'BETCORE' },
    { id: 'creed', label: 'CREED' },
    { id: 'awc', label: 'AWC' },
    { id: 'kingmidas', label: 'KINGMIDAS' },
    { id: 'betgames', label: 'BETGAMES' },
    { id: 'sun0', label: 'SUN0' },
    { id: 'crash88', label: 'CRASH88' },
    { id: 'sap', label: 'SAP' },
    { id: 'turb0', label: 'TURB0' },
    { id: 'jili', label: 'JiLi' },
    { id: 'drgs', label: 'DRGS' },
    { id: 'macaw', label: 'MACAW' },
    { id: 'marbles', label: 'MARBLES' },
    { id: 'spribe', label: 'SPRIBE' },
    { id: 'rich88', label: 'RICH88' },
  ];

  const subCategories =
    activeMainCategory === 'aura'
      ? auraSubCategories
      : liveCasinoSubCategories;

  const apiGamesList = React.useMemo(() => {
    if (!intCasinoData || !Array.isArray(intCasinoData) || intCasinoData.length === 0) {
      return [];
    }
    const gamesMap = new Map();
    intCasinoData.forEach((item) => {
      const providerObj = item?.provider;
      if (!providerObj || providerObj.isAllowed === false) return;
      const pName = (providerObj.name || '').toLowerCase();
      const list = providerObj.gameList || [];
      list.forEach((game) => {
        if (!game || !game.gameId || game.gameId.startsWith('DMD')) return;
        if (gamesMap.has(game.gameId)) return;

        const bannerImg =
          game.images?.find((img) => img.type === 'banner')?.url ||
          game.images?.find((img) => img.type === 'logo-square')?.url ||
          game.images?.find((img) => img.type === 'logo-round')?.url;

        gamesMap.set(game.gameId, {
          id: game.gameId,
          gameId: game.gameId,
          title: game.name || 'Casino Game',
          name: game.name || 'Casino Game',
          providerName: pName,
          rawCategory: (game.category || '').toLowerCase(),
          image: bannerImg || '/games/casino/aviator.png',
          category: ['all'],
          rawGame: game,
        });
      });
    });
    return Array.from(gamesMap.values());
  }, [intCasinoData]);

  const currentDataset = React.useMemo(() => {
    return apiGamesList;
  }, [apiGamesList]);

  const filteredGames = React.useMemo(() => {
    return currentDataset.filter((g) => {
      let matchesCategory = false;
      const titleLower = (g.title || g.name || '').toLowerCase();
      const catLower = (g.rawCategory || '').toLowerCase();

      if (activeMainCategory === 'aura') {
        if (activeSubCategory === 'all') {
          matchesCategory =
            catLower.includes('table') ||
            catLower.includes('live') ||
            catLower.includes('teen') ||
            catLower.includes('baccarat') ||
            catLower.includes('roulette') ||
            catLower.includes('poker') ||
            catLower.includes('dragon') ||
            catLower.includes('higher') ||
            titleLower.includes('teen') ||
            titleLower.includes('patti') ||
            titleLower.includes('dragon') ||
            titleLower.includes('andar') ||
            titleLower.includes('baccarat') ||
            titleLower.includes('roulette') ||
            titleLower.includes('poker') ||
            titleLower.includes('lucky') ||
            titleLower.includes('32') ||
            titleLower.includes('matka') ||
            titleLower.includes('worli');
        } else if (activeSubCategory === 'teenpatti') {
          matchesCategory = titleLower.includes('teen') || titleLower.includes('patti') || catLower.includes('teen_patti');
        } else if (activeSubCategory === 'dragontiger') {
          matchesCategory = titleLower.includes('dragon') || titleLower.includes('tiger') || catLower.includes('dragon_tiger');
        } else if (activeSubCategory === 'andarbahar') {
          matchesCategory = titleLower.includes('andar') || titleLower.includes('bahar');
        } else if (activeSubCategory === 'roulette') {
          matchesCategory = titleLower.includes('roulette') || catLower.includes('roulette');
        } else if (activeSubCategory === 'baccarat') {
          matchesCategory = titleLower.includes('baccarat') || catLower.includes('baccarat');
        } else if (activeSubCategory === 'poker') {
          matchesCategory = titleLower.includes('poker') || catLower.includes('poker');
        } else if (activeSubCategory === '32cards') {
          matchesCategory = titleLower.includes('32');
        } else if (activeSubCategory === 'lucky7') {
          matchesCategory = titleLower.includes('7') || titleLower.includes('lucky');
        } else if (activeSubCategory === 'casinowar') {
          matchesCategory = titleLower.includes('war') || catLower.includes('war');
        } else if (activeSubCategory === 'worli') {
          matchesCategory = titleLower.includes('worli') || titleLower.includes('matka');
        } else if (activeSubCategory === 'bollywood') {
          matchesCategory = titleLower.includes('bollywood') || titleLower.includes('amar') || titleLower.includes('anthony');
        } else if (activeSubCategory === 'queen') {
          matchesCategory = titleLower.includes('queen');
        } else if (activeSubCategory === 'race') {
          matchesCategory = titleLower.includes('race');
        } else {
          matchesCategory = true;
        }
      } else {
        if (activeSubCategory === 'all') {
          matchesCategory = true;
        } else if (activeSubCategory === 'aviator') {
          matchesCategory =
            titleLower.includes('aviator') ||
            catLower.includes('crash') ||
            g.id.toLowerCase().includes('aviator');
        } else if (activeSubCategory === 'color_prediction') {
          matchesCategory = titleLower.includes('color') || catLower.includes('color');
        } else if (activeSubCategory === 'mines') {
          matchesCategory = titleLower.includes('mines') || catLower.includes('mines');
        } else if (activeSubCategory === 'fun_games') {
          matchesCategory = true;
        } else {
          const sub = activeSubCategory.toLowerCase();
          matchesCategory =
            g.providerName === sub ||
            (sub === 'jili' && (g.providerName === 'jili' || g.providerName === 'jilli')) ||
            (sub === 'spribe' && g.providerName === 'spribe') ||
            (sub === 'turbogames' && g.providerName === 'turbogames') ||
            catLower.includes(sub);
        }
      }

      const matchesSearch = searchQuery
        ? titleLower.includes(searchQuery.toLowerCase()) ||
          (g.providerName || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [currentDataset, activeMainCategory, activeSubCategory, searchQuery]);

  const handleMainCategorySelect = (cat) => {
    setActiveMainCategory(cat.id);
    setActiveSubCategory('all');
    if (cat.id === 'live_casino') {
      navigate('/casino/aviator');
    } else {
      navigate('/casino');
    }
  };

  const handleSubCategorySelect = (subId) => {
    setActiveSubCategory(subId);
    if (activeMainCategory === 'live_casino') {
      if (subId === 'aviator') {
        navigate('/casino/aviator');
      } else if (subId === 'color_prediction') {
        navigate('/casino/color-prediction');
      } else if (subId === 'mines') {
        navigate('/casino/mines');
      } else {
        navigate('/casino');
      }
    }
  };

  if (isLoadingIntCasinos || apiGamesList.length === 0) {
    return (
      <div className="w-full min-h-[65vh] bg-white flex flex-col items-center justify-center py-24 select-none">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-[#e5e7eb] border-t-[#b6842d] rounded-full animate-spin" />
          <div
            className="w-7 h-7 border-3 border-transparent border-b-[#373737] rounded-full animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}
          />
        </div>
        <p className="mt-4 text-[13px] font-bold text-[#373737] tracking-wider uppercase">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ffff] select-none flex flex-col pt-2 pb-6">
      {/* 1. Search Casino Bar */}
      <div className="px-3 mb-1.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Casino..."
          className="px-2 py-2 text-black outline-none w-full text-sm text-start border border-[#ced4da] rounded-md placeholder-gray-800 bg-white"
        />
      </div>

      {/* 2. Main Category Filter Pills (Aura, Live Casino) */}
      <div className="px-1 flex items-center bg-[#d3d3d3] mb-[1px] gap-2 py-1">
        {mainCategories.map((cat) => {
          const isActive = activeMainCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleMainCategorySelect(cat)}
              style={{
                background: isActive
                  ? 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)'
                  : '#d3d3d3',
              }}
              className="px-4 py-1 whitespace-nowrap shadow-sm shadow-[#b7862f] border-2 border-[#b7862f] rounded-lg font-bold text-[13px] text-black transition-colors duration-150 hover:bg-[#e1e1e1] active:scale-95 cursor-pointer"
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 3. Sub Category Filter Pills (All, Roulette, Teenpatti, Poker, etc.) */}
      <div className="flex overflow-x-auto gap-2 py-1 md:h-[55px] bg-[#d3d3d3] custom-scrollbar">
        {subCategories.map((sub) => {
          const isActive = activeSubCategory === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => handleSubCategorySelect(sub.id)}
              style={{
                background: isActive
                  ? 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)'
                  : '#d3d3d3',
              }}
              className={`shrink-0 ${activeMainCategory === 'aura'
                ? 'px-10 ml-1'
                : sub.isAll
                  ? 'px-10 ml-1'
                  : 'px-4'
                } ${activeMainCategory === 'aura' ? '' : 'py-1'
                } whitespace-nowrap shadow-sm shadow-[#b7862f] border-2 border-[#b7862f] rounded-lg font-semibold text-[13px] text-black transition-colors duration-150 hover:bg-[#e1e1e1] active:scale-95 cursor-pointer`}
            >
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* 4. Third Row Tab Bar for Aura (Left Gold "All" Tab + Gray Header Strip) */}
      {activeMainCategory === 'aura' && (
        <div className="flex flex-nowrap overflow-x-auto overflow-y-hidden whitespace-nowrap bg-[#dedddd] border border-[#b88831] pl-0 mb-0 list-none">
          <button
            type="button"
            onClick={() => setActiveThirdTab('all')}
            className="bg-gradient-gold font-semibold grid place-items-center w-[85px] h-[60px] break-words whitespace-normal leading-[12px] rounded-none text-center text-[12px] font-bold p-[5px] text-black border-r border-[#b88831] capitalize cursor-pointer shadow-xs"
          >
            All
          </button>
          <div className="flex-1 bg-[#dedddd]" />
        </div>
      )}

      {/* 5. Games Grid */}
      <div className="grid grid-cols-3 gap-[2px] pt-0.5 w-full">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => onGameClick && onGameClick(game)}
              className="aspect-square bg-[#10131a] overflow-hidden relative cursor-pointer group shadow-xs hover:opacity-95 active:scale-97 transition-all"
            >
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="eager"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/games/casino/aviator.png';
                }}
              />

              {game.badge && (
                <div className="absolute top-1 right-1 z-10">
                  <span className="bg-[#6b21a8] text-white text-[7.5px] sm:text-[8px] font-extrabold px-1.5 py-0.5 rounded-[2px] shadow-xs tracking-tight uppercase leading-none">
                    {game.badge}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 py-10 text-center text-gray-500 font-medium text-[13px]">
            No games found matching &quot;{searchQuery}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
