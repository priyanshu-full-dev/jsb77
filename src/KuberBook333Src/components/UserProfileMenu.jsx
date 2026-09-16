import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserProfileMenu({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenAuth,
  onOpenBonusRules,
  onOpenLanguageModal,
}) {
  const navigate = useNavigate();
  const [oneClickBet, setOneClickBet] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        // Don't close if clicking on the profile button or balance pill in header
        const profileBtn = document.querySelector('[aria-label="User Profile"]');
        const balancePill = document.querySelector('[data-profile-trigger="true"]');
        if (
          (profileBtn && profileBtn.contains(e.target)) ||
          (balancePill && balancePill.contains(e.target))
        ) {
          return;
        }
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onClose]);

  // Handle scroll chaining when wheel finishes scrolling inside menu
  const handleWheel = (e) => {
    const el = menuRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const isScrollingDown = e.deltaY > 0;
    const isScrollingUp = e.deltaY < 0;

    const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
    const atTop = scrollTop <= 0;

    if ((isScrollingDown && atBottom) || (isScrollingUp && atTop)) {
      window.scrollBy({ top: e.deltaY, behavior: 'auto' });
    }
  };

  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'affiliate',
      label: 'Affiliate',
      icon: (
        <img
          src="/games/download (1).webp"
          alt="Affiliate"
          className="w-[12px] h-[12px] object-contain shrink-0"
        />
      ),
      textColor: 'animate-affiliate',
      action: () => {
        onClose();
        navigate('/affiliate');
      },
    },
    {
      id: 'statement',
      label: 'Account Statement',
      icon: (
        <svg
          viewBox="0 0 512 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M496 128v16a8 8 0 0 1-8 8h-24v12c0 6.627-5.373 12-12 12H60c-6.627 0-12-5.373-12-12v-12H24a8 8 0 0 1-8-8v-16a8 8 0 0 1 4.941-7.392l232-88a7.996 7.996 0 0 1 6.118 0l232 88A8 8 0 0 1 496 128zm-24 304H40c-13.255 0-24 10.745-24 24v16a8 8 0 0 0 8 8h464a8 8 0 0 0 8-8v-16c0-13.255-10.745-24-24-24zM96 192v192H60c-6.627 0-12 5.373-12 12v20h416v-20c0-6.627-5.373-12-12-12h-36V192h-64v192h-64V192h-64v192h-64V192H96z" />
        </svg>
      ),
      action: () => {
        onClose();
        navigate('/account-statement');
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg
          viewBox="0 0 512 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
        </svg>
      ),
      action: () => {
        onClose();
        navigate('/settings');
      },
    },
    {
      id: 'bonuses',
      label: 'Bonuses',
      icon: (
        <svg
          viewBox="0 0 512 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
        </svg>
      ),
      action: () => {
        onClose();
        navigate('/bonuses');
      },
    },
    {
      id: 'bonus_rules',
      label: 'Bonus Rules',
      icon: (
        <svg
          viewBox="0 0 512 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
        </svg>
      ),
      action: () => {
        onClose();
        if (onOpenBonusRules) onOpenBonusRules();
      },
    },
    {
      id: 'profit_loss',
      label: 'Betting Profit & Loss',
      icon: (
        <svg
          viewBox="0 0 512 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z" />
        </svg>
      ),
      action: () => {
        onClose();
        navigate('/profit-loss');
      },
    },
    {
      id: 'my_bets',
      label: 'My Bets',
      icon: (
        <svg
          viewBox="0 0 512 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
        </svg>
      ),
      action: () => {
        onClose();
        navigate('/my-bets');
      },
    },
    {
      id: 'open_bets',
      label: 'Open Bets',
      icon: (
        <img
          src="/games/download.png"
          alt="Open Bets"
          className="w-[12px] h-[12px] object-contain shrink-0"
        />
      ),
      action: () => {
        onClose();
        navigate('/open-bets');
      },
    },
    {
      id: 'change_password',
      label: 'Change Password',
      icon: (
        <svg
          viewBox="0 0 448 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z" />
        </svg>
      ),
      action: () => {
        onClose();
        navigate('/change-password');
      },
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg
          viewBox="0 0 448 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z" />
        </svg>
      ),
      action: () => alert('No new notifications'),
    },
    {
      id: 'language',
      label: 'Language',
      icon: (
        <svg
          viewBox="0 0 496 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z" />
        </svg>
      ),
      action: () => {
        onClose();
        if (onOpenLanguageModal) onOpenLanguageModal();
      },
    },
    {
      id: 'sign_out',
      label: 'Sign Out',
      icon: (
        <svg
          viewBox="0 0 512 512"
          className="w-[10px] h-[10px] fill-gray-800 shrink-0"
          aria-hidden="true"
        >
          <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" />
        </svg>
      ),
      action: () => {
        onClose();
        if (onLogout) onLogout();
      },
    },
  ];

  return (
    <div
      ref={menuRef}
      onWheel={handleWheel}
      style={{
        overscrollBehaviorY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      className="absolute top-[62px] right-2 sm:right-2 w-[270px] sm:w-[285px] max-h-[calc(100vh-115px)] sm:max-h-[530px] overflow-y-auto custom-scrollbar bg-white rounded-t-[4px] rounded-b-[4px] shadow-[0_10px_35px_rgba(0,0,0,0.35)]  z-40 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150 text-gray-900 select-none pb-1"
    >
      {/* Top Gold Header */}
      <div

        className="px-[10px] py-[9.5px] bg-[#b88831] text-white font-extrabold text-[13px] uppercase tracking-tight rounded-t-[3px]"
      >
        {user?.username || 'DEMO'}
      </div>

      {/* One Click Bet Toggle */}
      <div className="px-[10px] py-[5px] border-b bg-[#dedddd] flex items-center justify-between pr-[68px]">
        <span className="text-[14px] font-medium text-[#212529]">One Click Bet</span>
        <button
          type="button"
          onClick={() => setOneClickBet(!oneClickBet)}
          className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${oneClickBet ? 'bg-[#b88831]' : 'bg-[#8c9ba5]'
            }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${oneClickBet ? 'translate-x-4' : 'translate-x-0'
              }`}
          />
        </button>
      </div>

      {/* Wallet Amount */}
      <div className="px-[10px] py-[5px] flex items-center justify-between text-[14px]">
        <span className="text-black leading-4 font-medium">Wallet Amount</span>
        <span className="text-black font-bold text-[13px]">
          {user?.balance ?? 1500}
        </span>
      </div>

      {/* Net Exposure */}
      <div className="px-[10px] py-[5px] flex items-center mt-[-5px] justify-between text-[14px]">
        <span className="text-black font-medium">Net Exposure</span>
        <span className="text-[#e53935] font-bold text-[13px]">
          {(user?.exposure ?? 0).toFixed(2)}
        </span>
      </div>

      {/* Bonus Information Box */}
      <div className="border border-[#c79a29] rounded-[6px] mx-[5px] mt-[-1px] bg-white shadow-2xs">
        {/* Row 1: Header with Info and Countdown */}
        <div className="flex items-center justify-between px-[10px] py-[4.5px] border-b border-gray-200">
          <span className="font-medium mt-[-1px] text-[14px] text-[#212529] leading-tight shrink-0">
            Bonus <br /> Information
          </span>
          <div className="flex items-center gap-4">
            <img
              src="/games/info-icon.svg"
              alt="Info"
              className="w-4 h-4 shrink-0"
            />
            <div
              className="bg-[#b88831] font-medium text-white text-[11px] px-[5px] py-[4px] rounded-[5px]  shrink-0 "
            >
              00H : 00M : 00S
            </div>
          </div>
        </div>

        {/* Row 2: Earn Bonus */}
        <div className="flex items-center mt-[-1px] justify-between px-[10px] py-[4.5px] border-b-2 border-gray-300 text-[14px]">
          <span className="text-[#212529] font-medium">Earn Bonus</span>
          <span className="text-black font-bold text-[14px]">0</span>
        </div>

        {/* Row 3: LOCKED BONUS Button */}
        <div className="px-2.5 pt-2 pb-1.5 border-b border-gray-200">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/bonuses');
            }}
            style={{
              background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)',
            }}
            className="w-full py-1 rounded-full text-black font-medium text-[12px] flex items-center justify-center gap-1.5 shadow-2xs hover:brightness-105 active:scale-98 transition-all cursor-pointer"
          >
            <svg
              viewBox="0 0 512 512"
              className="w-[10px] h-[10px] fill-black shrink-0"
              aria-hidden="true"
            >
              <path d="M190.5 68.8L225.3 128l-1.3 0-72 0c-22.1 0-40-17.9-40-40s17.9-40 40-40l2.2 0c14.9 0 28.8 7.9 36.3 20.8zM64 88c0 14.4 3.5 28 9.6 40L32 128c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32l448 0c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32l-41.6 0c6.1-12 9.6-25.6 9.6-40c0-48.6-39.4-88-88-88l-2.2 0c-31.9 0-61.5 16.9-77.7 44.4L256 85.5l-24.1-41C215.7 16.9 186.1 0 154.2 0L152 0C103.4 0 64 39.4 64 88zm336 0c0 22.1-17.9 40-40 40l-72 0-1.3 0 34.8-59.2C329.1 55.9 342.9 48 357.8 48l2.2 0c22.1 0 40 17.9 40 40zM32 288l0 176c0 26.5 21.5 48 48 48l144 0 0-224L32 288zM288 512l144 0c26.5 0 48-21.5 48-48l0-176-192 0 0 224z" />
            </svg>
            <span>LOCKED BONUS: 0</span>
          </button>
        </div>

        {/* Row 4: Refer and Earn Button */}
        <div className="px-2.5 py-1.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/affiliate');
            }}
            style={{
              background: 'linear-gradient(94deg, #b6842d, #ebda8d 55%, #b7862f)',
            }}
            className="w-full py-1 mt-[1px] rounded-full text-black font-medium text-[12px] flex items-center justify-center shadow-2xs hover:brightness-105 active:scale-98 transition-all cursor-pointer"
          >
            Refer and Earn
          </button>
        </div>
      </div>

      {/* Menu Navigation List */}
      <div className="divide-y divide-gray-100 text-[12.5px] font-bold text-gray-800">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.action}
            className={`w-full px-[15px] py-[4.3px] flex items-center gap-1.5 hover:bg-gray-50 transition-colors text-left cursor-pointer ${item.textColor || 'text-gray-900'
              }`}
          >
            <div className="shrink-0 flex items-center justify-center w-3">{item.icon}</div>
            <span className={`font-semibold text-[12px] ${item.id === 'affiliate' ? 'animate-affiliate ml-[1px]' : ''} ${item.id === 'open_bets' ? 'ml-[3.5px]' : ''}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
