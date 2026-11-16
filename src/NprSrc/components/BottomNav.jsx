import PropTypes from "prop-types";
import { NavLink, useLocation } from "react-router-dom";

const BottomNav = ({ onOpenInvite, onOpenDeposit, onOpenMembers }) => {
  const location = useLocation();
  const isHome =
    location.pathname === "/" ||
    location.pathname === "/home" ||
    location.pathname === "/m/home";
  const isPromotion = location.pathname.includes("promotion");

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-[#0045b8] text-[#cce0ff] shadow-[0_-2px_10px_rgba(0,0,0,0.15)] flex items-end justify-between px-1 h-[65px] sm:h-[64px] pb-1.5 select-none border-t border-[#0e58dc]/30">
      {/* 1. Home */}
      <NavLink
        to="/"
        className="flex flex-col items-center justify-end flex-1 h-full pb-1 text-[#cce0ff] hover:text-white transition relative group focus:outline-none"
      >
        <img
          src="/npr/nav/nav_home.png"
          alt="Home"
          className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] object-contain block mb-1 drop-shadow-xs group-active:scale-95 transition pointer-events-none"
          draggable={false}
        />
        <span className="text-[11.5px] sm:text-[12px] font-bold leading-none tracking-tight">
          Home
        </span>
        {/* Active Pill Indicator under Home (absolute so it never shifts the icon or text) */}
        {isHome && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#015af0] rounded-full pointer-events-none" />
        )}
      </NavLink>

      {/* 2. Promotion */}
      <NavLink
        to="/promotion"
        className="flex flex-col items-center justify-end flex-1 h-full pb-1 text-[#cce0ff] hover:text-white transition relative group focus:outline-none"
      >
        <img
          src="/npr/nav/nav_promotion.png"
          alt="Promotion"
          className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] object-contain block mb-1 drop-shadow-xs group-active:scale-95 transition pointer-events-none"
          draggable={false}
        />
        <span className="text-[11.5px] sm:text-[12px] font-bold leading-none tracking-tight">
          Promotion
        </span>
        {/* Active Pill Indicator under Promotion (absolute so it never shifts the icon or text) */}
        {isPromotion && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#015af0] rounded-full pointer-events-none" />
        )}
      </NavLink>

      {/* 3. Center Elevated Floating Button: Invite */}
      <div className="flex-1 flex flex-col items-center justify-end relative -top-2 sm:-top-4">
        <button
          onClick={onOpenInvite}
          className="w-[56px] h-[56px] sm:w-[58px] sm:h-[58px] rounded-full flex items-center justify-center transform active:scale-95 transition focus:outline-none"
          title="Invite"
        >
          <img
            src="/npr/nav/nav_invite_circle.png"
            alt="Invite"
            className="w-full h-full object-contain pointer-events-none select-none rounded-full"
            draggable={false}
          />
        </button>
        <span className="text-[11.5px] sm:text-[12px] font-bold text-[#cce0ff] mt-0.5 leading-none tracking-tight">
          Invite
        </span>
      </div>

      {/* 4. Deposit (With 2x Scale Pulse Animation) */}
      <button
        onClick={onOpenDeposit}
        className="flex flex-col items-center justify-end flex-1 h-full pb-1 text-[#cce0ff] hover:text-white transition group focus:outline-none"
      >
        <div className="animate-deposit-pulse flex items-center justify-center">
          <img
            src="/npr/nav/nav_deposit.png"
            alt="Deposit"
            className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] object-contain block mb-1 drop-shadow-xs group-active:scale-95 transition pointer-events-none"
            draggable={false}
          />
        </div>
        <span className="text-[11.5px] sm:text-[12px] font-bold leading-none tracking-tight">
          Deposit
        </span>
      </button>

      {/* 5. Members */}
      <button
        onClick={onOpenMembers}
        className="flex flex-col items-center justify-end flex-1 h-full pb-1 text-[#cce0ff] hover:text-white transition group focus:outline-none"
      >
        <img
          src="/npr/nav/nav_members.png"
          alt="Members"
          className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] object-contain block mb-1 drop-shadow-xs group-active:scale-95 transition pointer-events-none"
          draggable={false}
        />
        <span className="text-[11.5px] sm:text-[12px] font-bold leading-none tracking-tight">
          Members
        </span>
      </button>
    </nav>
  );
};

BottomNav.propTypes = {
  onOpenInvite: PropTypes.func,
  onOpenDeposit: PropTypes.func,
  onOpenMembers: PropTypes.func,
};

export default BottomNav;
