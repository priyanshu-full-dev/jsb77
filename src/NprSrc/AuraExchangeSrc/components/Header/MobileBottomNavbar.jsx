import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaTrophy, FaUserCircle } from "react-icons/fa";
import "./mobilenav.css";
import RaftaarBottom from "../Raftaar/Bottomnav";

// In-Play Alarm Clock SVG matching reference UI
const InPlayAlarmIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-1 block text-white"
  >
    {/* Left bell */}
    <path d="M4.6 2.5a1 1 0 0 0-1.4 1.4l2.2 2.2a1 1 0 0 0 1.4-1.4L4.6 2.5z" />
    {/* Right bell */}
    <path d="M19.4 2.5a1 1 0 0 1 1.4 1.4l-2.2 2.2a1 1 0 0 1-1.4-1.4l2.2-2.2z" />
    {/* Center top button */}
    <rect x="10.5" y="1.5" width="3" height="1.8" rx="0.9" />
    {/* Outer clock ring */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.03 4 3 8.03 3 13s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"
    />
    {/* Clock hands: 12 and ~4 o'clock */}
    <path d="M13 8h-2v5.3l3.5 2.1 1-1.7-2.5-1.5V8z" />
  </svg>
);

// Multi Markets circle pin SVG matching reference UI
const MultiMarketsCirclePin = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-1 block"
  >
    <circle cx="12" cy="12" r="10.5" fill="#FFFFFF" />
    <path
      d="M15 6.5H9C8.45 6.5 8 6.95 8 7.5C8 8.05 8.45 8.5 9 8.5H9.75V11.7L8.25 13.7C8 14.03 8.24 14.5 8.65 14.5H11.25V18C11.25 18.41 11.59 18.75 12 18.75C12.41 18.75 12.75 18.41 12.75 18V14.5H15.35C15.76 14.5 16 14.03 15.75 13.7L14.25 11.7V8.5H15C15.55 8.5 16 8.05 16 7.5C16 6.95 15.55 6.5 15 6.5Z"
      fill="#1A2D3D"
    />
  </svg>
);

function MobileBottomNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  if (window.location.host === "raftaarclub.com") {
    return (
      <div className="-mb-1">
        <RaftaarBottom />
      </div>
    );
  }

  const currentPath = location.pathname;
  const isHome = currentPath === "/" || currentPath === "/home";
  const isInPlay = currentPath === "/inplay" || currentPath === "/in-play";
  const isSports = currentPath === "/my-sports";
  const isMultiMarkets = currentPath === "/multi-market";
  const isAccount = currentPath === "/members" || currentPath === "/account";

  const activeGradient = {
    background: "linear-gradient(-180deg, #32617f 20%, #1f4258 91%)",
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 w-full h-[56px] flex justify-center items-center z-[9998] shadow-lg select-none border-t border-white/10"
      style={{
        background: "linear-gradient(-180deg, #243a48 20%, #172732 91%)",
      }}
    >
      <nav
        className="w-full h-full flex justify-between items-center z-[2]"
        style={{
          background: "linear-gradient(-180deg, #243a48 20%, #172732 91%)",
        }}
      >
        {/* 1. Home */}
        <NavLink
          to="/"
          className="text-white flex flex-col justify-center items-center h-[56px] flex-1 transition hover:bg-white/5"
          style={isHome ? activeGradient : undefined}
        >
          <FaHome size={22} className="text-white mb-1" />
          <span className="text-[11px] font-bold leading-none">Home</span>
        </NavLink>

        {/* 2. In-Play */}
        <NavLink
          to="/inplay"
          className="text-white flex flex-col justify-center items-center h-[56px] flex-1 transition hover:bg-white/5"
          style={isInPlay ? activeGradient : undefined}
        >
          <InPlayAlarmIcon size={22} />
          <span className="text-[11px] font-bold leading-none">In-Play</span>
        </NavLink>

        {/* 3. Sports */}
        <NavLink
          to="/my-sports"
          className="text-white flex flex-col justify-center items-center h-[56px] flex-1 transition hover:bg-white/5"
          style={isSports ? activeGradient : undefined}
        >
          <FaTrophy size={21} className="text-white mb-1" />
          <span className="text-[11px] font-bold leading-none">Sports</span>
        </NavLink>

        {/* 4. Multi Markets */}
        <NavLink
          to="/multi-market"
          className="text-white flex flex-col justify-center items-center h-[56px] flex-1 transition hover:bg-white/5"
          style={isMultiMarkets ? activeGradient : undefined}
        >
          <MultiMarketsCirclePin size={22} />
          <span className="text-[10.5px] font-bold leading-none whitespace-nowrap tracking-tight">
            Multi Markets
          </span>
        </NavLink>

        {/* 5. Account */}
        <div
          onClick={() => navigate("/members")}
          className="text-white flex flex-col justify-center items-center h-[56px] flex-1 cursor-pointer transition hover:bg-white/5"
          style={isAccount ? activeGradient : undefined}
        >
          <FaUserCircle size={22} className="text-white mb-1" />
          <span className="text-[11px] font-bold leading-none">Account</span>
        </div>
      </nav>
    </div>
  );
}

export default MobileBottomNavbar;
