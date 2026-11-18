import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { GiCardAceSpades, GiPokerHand } from "react-icons/gi";
import { IoHome, IoBasketball, IoSearch } from "react-icons/io5";
import SearchOverlay from "./Searchoverlay";


const navItems = [
  {
    key: "bet",
    label: "Bet",
    path: "/bets-history",
    icon: GiCardAceSpades,
  },
  {
    key: "casino",
    label: "Casino",
    path: "/int-casino",
    icon: GiPokerHand,
  },
  {
    key: "home",
    label: "Home",
    path: "/cricket",
    icon: IoHome,
    end: true,
  },
  {
    key: "sports",
    label: "Sports",
    path: "/sports-game",
    icon: IoBasketball,
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const searchActive = searchOpen || location.pathname === "/search";

  const handleSelectMatch = (item) => {
    setSearchOpen(false);
    // wire this to your real navigation, e.g.:
    // navigate(`/full-market?eventName=${encodeURIComponent(item.event)}`);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto bg-[#151828] border-t border-white/5 shadow-[0_-8px_25px_rgba(0,0,0,.55)]">
          <div className="grid grid-cols-5 h-[60px]">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={item.end}
                  className="flex items-center justify-center"
                >
                  {({ isActive }) => (
                    <div className="relative flex flex-col items-center">
                      {isActive && (
                        <span className="absolute -top-[2px] w-6 h-[3px] rounded-full bg-[#39f16b]" />
                      )}

                      <div
                        className={`rounded-xl px-3 py-2 transition-all duration-300 ${
                          isActive
                            ? "bg-[#1c3828] shadow-[0_0_18px_rgba(57,241,107,.15)]"
                            : ""
                        }`}
                      >
                        <Icon
                          size={21}
                          className={`transition-all duration-300 ${
                            isActive
                              ? "text-[#39f16b] scale-110"
                              : "text-[#98A2B8]"
                          }`}
                        />
                      </div>

                      <span
                        className={`mt-1 text-[10px] font-bold transition ${
                          isActive ? "text-[#39f16b]" : "text-[#98A2B8]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  )}
                </NavLink>
              );
            })}

            {/* SEARCH — opens the bottom-sheet popup instead of navigating */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center"
            >
              <div className="relative flex flex-col items-center">
                {searchActive && (
                  <span className="absolute -top-[2px] w-6 h-[3px] rounded-full bg-[#39f16b]" />
                )}

                <div
                  className={`rounded-xl px-3 py-2 transition-all duration-300 ${
                    searchActive
                      ? "bg-[#1c3828] shadow-[0_0_18px_rgba(57,241,107,.15)]"
                      : ""
                  }`}
                >
                  <IoSearch
                    size={21}
                    className={`transition-all duration-300 ${
                      searchActive
                        ? "text-[#39f16b] scale-110"
                        : "text-[#98A2B8]"
                    }`}
                  />
                </div>

                <span
                  className={`mt-1 text-[10px] font-bold transition ${
                    searchActive ? "text-[#39f16b]" : "text-[#98A2B8]"
                  }`}
                >
                  Search
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectMatch={handleSelectMatch}
      />
    </>
  );
}