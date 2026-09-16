import React, { useRef, useEffect } from 'react';
import { User } from 'lucide-react';

export default function Header({
  onMenuClick,
  onSearchClick,
  onAuthClick,
  user,
  onLogout,
  onProfileClick,
  onLogoClick,
  isSearchOpen,
  onSearchClose,
  searchQuery,
  setSearchQuery,
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  return (
    <header className={`bg-[#000000] text-white px-2 ${user ? 'py-2.5 pb-4' : 'py-2'} flex items-center justify-between relative z-40 select-none shadow-md w-full transition-all overflow-hidden`}>
      {/* Search Bar Overlay - Smooth slide down from top & slide up */}
      <div
        style={{
          background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)',
          transition: 'transform .3s ease-out, opacity .3s ease-out',
        }}
        className={`absolute top-0 left-0 right-0 h-[62px] z-50 pl-[12px] pr-[7px] flex items-center justify-between shadow-xs transform ${
          isSearchOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Back Arrow */}
        <button
          type="button"
          onClick={onSearchClose || onSearchClick}
          className="text-white p-1 hover:opacity-80 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Close Search"
        >
          <svg
            viewBox="0 0 448 512"
            className="w-[18px] mt-[-3px] h-[18px] fill-white shrink-0"
            aria-hidden="true"
          >
            <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z" />
          </svg>
        </button>

        {/* Center: Search Events Input */}
        <div className="flex-1 mx-2 flex items-center justify-center">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Search Events"
            className="w-full bg-transparent text-[#212529] font-medium text-[14px] text-center placeholder:text-[#909396] placeholder:font-normal outline-none border-none"
          />
        </div>

        {/* Right: Search Icon */}
        <div className="p-1 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 512 512"
            className="w-[16px] h-[16px] mt-[3.5px] fill-white shrink-0"
            aria-hidden="true"
          >
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
          </svg>
        </div>
      </div>
      {/* Left: Hamburger + Brand Logo */}
      <div className="flex gap-1 items-center shrink-0">
        <button
          onClick={onMenuClick}
          className="text-white p-1 hover:bg-neutral-800 rounded mt-2 focus:outline-none cursor-pointer flex flex-col justify-center gap-[3px] w-5 mr-1"
          aria-label="Open Menu"
        >
          <span className="w-4 h-[2px] bg-white rounded-full block"></span>
          <span className="w-4 h-[2px] bg-white rounded-full block"></span>
          <span className="w-4 h-[2px] bg-white rounded-full block"></span>
        </button>

        {/* Brand Logo */}
        <div
          onClick={onLogoClick}
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img
            src="/games/public.avif"
            alt="Logo"
            className="inline-block max-w-[110px] md:w-full max-h-[40px] object-contain"
          />
        </div>
      </div>

      {/* Right: Search & User/Auth Actions */}
      <div className={`flex ${user ? 'items-end' : 'items-center'} gap-2 shrink-0`}>
        {/* Search Icon */}
        <button
          onClick={onSearchClick}
          className={`${user ? 'h-9' : ''} p-1 text-white hover:text-amber-400 cursor-pointer flex items-center justify-center shrink-0`}
          aria-label="Search"
        >
          <svg
            viewBox="0 0 512 512"
            className="w-[18px] h-[18px] fill-white shrink-0"
            aria-hidden="true"
          >
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
          </svg>
        </button>

        {user ? (
          /* Logged In User Section (items-end keeps the balance box and user icon parallel at the bottom) */
          <div className="flex items-end gap-2 xl:gap-4 shrink-0">
            {/* Balance Pill with Username label on top */}
            <div
              data-profile-trigger="true"
              onClick={onProfileClick}
              className="flex flex-col items-center cursor-pointer shrink-0"
            >
              <span className="text-white font-bold text-[12px] leading-tight mb-0.5">
                {user.username || 'Demo'}
              </span>
              <div className="flex flex-col bg-[#b88831] justify-center rounded-full px-3 py-[6px] leading-[1.1]">
                <span className="text-white font-bold text-[11px] leading-[1.1]">
                  Bal: {user.balance ?? 1500}
                </span>
                <span className="text-[#d50000] font-bold text-[11px] leading-[1.1]">
                  Exp: {user.exposure ?? 0}
                </span>
              </div>
            </div>

            {/* User Profile Button with exact provided CSS + lifted 5px */}
            <button
              type="button"
              onClick={onProfileClick}
              title="Profile Menu"
              className="flex items-center justify-center bg-[#b88831] mb-[5px] text-white rounded-md px-2 md:px-3 h-[30px] md:h-[35px] cursor-pointer shrink-0 shadow-xs hover:brightness-105 active:scale-95 transition-transform"
              aria-label="User Profile"
            >
              <User size={18} className="text-white fill-white" />
            </button>
          </div>
        ) : (
          /* Logged Out: LOGIN & REGISTER Buttons */
          <div className="flex items-center gap-[3px] shrink-0">
            {/* LOGIN Button */}
            <button
              onClick={() => onAuthClick('login')}
              style={{ backgroundColor: 'rgb(184 136 49 / var(--tw-bg-opacity, 1))' }}
              className="text-sm tracking-tighter text-white px-1 py-1 rounded-[3px] font-semibold border border-[#80550c] shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              LOGIN
            </button>

            {/* REGISTER Button */}
            <button
              onClick={() => onAuthClick('register')}
              className="loginBtn360 tracking-tighter text-sm px-1 py-1 border border-white text-[#c4932f] rounded-sm hover:text-white font-bold transition-all duration-700 ease-in-out bg-white hover:bg-[#008000] cursor-pointer whitespace-nowrap"
            >
              REGISTER
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
