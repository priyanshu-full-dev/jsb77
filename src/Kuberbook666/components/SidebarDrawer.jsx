import React from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaTrophy, FaGamepad, FaQuestionCircle, FaShieldAlt } from "react-icons/fa";
import { MdSportsCricket, MdCasino } from "react-icons/md";
import { GiCardPlay, GiDiceSixFacesFive } from "react-icons/gi";
import { useSelector } from "react-redux";

const SidebarDrawer = ({ isOpen, onClose, onOpenLogin, onOpenSignup }) => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const userData = useSelector((state) => state?.user?.userData);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-72 sm:w-80 max-w-[85vw] h-full bg-[#161722] text-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 border-r border-red-900/30">
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-[#6e0b0b] to-[#450505] flex items-center justify-between border-b border-red-950">
          <Link to="/" onClick={onClose} className="flex items-center">
            <span className="text-xl font-black text-white italic">KUBER</span>
            <span className="ml-1 text-xl font-black text-[#ffcc00] italic">BOOK666</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 rounded-full hover:bg-black/30 text-white transition-colors"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* User Card / Auth CTA */}
        <div className="p-3 bg-[#1e202e] border-b border-gray-800">
          {isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Welcome,</span>
                <span className="text-sm font-bold text-yellow-400">{userData?.username || "Player"}</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate("/account");
                }}
                className="text-xs bg-red-700 px-2.5 py-1 rounded font-bold hover:bg-red-600"
              >
                Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold border border-gray-700"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenSignup();
                }}
                className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-3 space-y-4">
          {/* Main Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider px-2 block">
              Navigation
            </span>
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-900/30 text-gray-200 hover:text-white transition-colors"
            >
              <FaHome className="text-red-500" />
              <span>Home</span>
            </Link>
            <Link
              to="/sports"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-900/30 text-gray-200 hover:text-white transition-colors"
            >
              <FaTrophy className="text-yellow-400" />
              <span>Sports Exchange</span>
            </Link>
            <Link
              to="/inplay"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-900/30 text-gray-200 hover:text-white transition-colors"
            >
              <MdSportsCricket className="text-emerald-400" />
              <span>In-Play Live</span>
            </Link>
          </div>

          {/* Casino Section */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider px-2 block">
              Casino & Games
            </span>
            <Link
              to="/live-casino"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-900/30 text-gray-200 hover:text-white transition-colors"
            >
              <GiCardPlay className="text-purple-400" />
              <span>Live Casino</span>
            </Link>
            <Link
              to="/slots"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-900/30 text-gray-200 hover:text-white transition-colors"
            >
              <MdCasino className="text-pink-400" />
              <span>Slot Games</span>
            </Link>
            <Link
              to="/table"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-900/30 text-gray-200 hover:text-white transition-colors"
            >
              <GiDiceSixFacesFive className="text-blue-400" />
              <span>Indian Card Games</span>
            </Link>
          </div>

          {/* Rules & Help */}
          <div className="space-y-1 border-t border-gray-800 pt-3">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider px-2 block">
              Information
            </span>
            <Link
              to="/rules"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-900/30 text-gray-200 hover:text-white transition-colors"
            >
              <FaShieldAlt className="text-gray-400" />
              <span>Rules & Regulations</span>
            </Link>
            <a
              href="https://t.me/kuberbook666_support"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-900/30 text-gray-200 hover:text-white transition-colors"
            >
              <FaQuestionCircle className="text-blue-400" />
              <span>24x7 Customer Support</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-gray-800 text-center text-[10px] text-gray-500">
          Kuberbook666 © 2026. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default SidebarDrawer;
