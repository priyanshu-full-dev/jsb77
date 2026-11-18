import { useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  FaTimes,
  FaGift,
  FaAward,
  FaUsers,
  FaCalendarAlt,
  FaAndroid,
  FaHeadset,
  FaFacebookF,
  FaTelegramPlane,
  FaWhatsapp,
  FaMobileAlt,
} from "react-icons/fa";

const categories = [
  { id: "hot", name: "Hot", icon: "/npr/category/cat_hot_active.png" },
  { id: "live", name: "Live Casino", icon: "/npr/category/cat_live_active.png" },
  { id: "slots", name: "Slots", icon: "/npr/category/cat_slots_active.png" },
  { id: "fish", name: "Fish", icon: "/npr/category/cat_fish_active.png" },
  { id: "sports", name: "Sports", icon: "/npr/category/cat_sports_active.png" },
  { id: "poker", name: "Poker", icon: "/npr/category/cat_poker_active.png" },
];

const MenuDrawer = ({ isOpen, onClose, onSelectCategory, user, onLogout }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  // Prevent background page from scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalOverflow || "";
        document.body.style.touchAction = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 1. Dark Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-[1px] transition-opacity duration-300"
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* 2. Side Drawer (Opens from Right - Pixel-Perfect Exact Style) */}
      <div
        className="relative w-[285px] sm:w-[315px] max-w-[85vw] bg-[#092765] h-full shadow-2xl flex flex-col z-10 overflow-y-auto npr-no-scrollbar animate-drawer-right select-none text-white overscroll-contain"
        style={{ touchAction: "pan-y" }}
      >
        {/* Top Header: Official JSB77 Logo & Circular Close Button (No border line below) */}
        <div className="pt-5 pb-3 px-4 flex items-center justify-between">
          <img
            src="/npr/jsb77_logo_white.png"
            alt="JSB77 Logo"
            className="h-14 sm:h-16 w-auto object-contain"
          />

          {/* White Circular Close Button with Dark Navy 'X' */}
          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#092765] flex items-center justify-center font-black shadow-md hover:scale-105 active:scale-95 transition"
            aria-label="Close Menu"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* 6 Category Items (Flat List, Large White Icons & Bold Text) */}
        <div className="py-2 px-1 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onClose();
                if (onSelectCategory) onSelectCategory(cat.id);
              }}
              className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/10 rounded-lg transition text-left text-white group"
            >
              <img
                src={cat.icon}
                alt={cat.name}
                className="w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] object-contain pointer-events-none group-hover:scale-110 transition duration-200 shrink-0"
              />
              <span className="font-bold text-[16px] sm:text-[17px] tracking-wide">{t(cat.name)}</span>
            </button>
          ))}
        </div>

        {/* 5 Distinct Gradient Action Cards */}
        <div className="px-3.5 py-2 space-y-2.5">
          {/* 1. Promotion (Gold to Vibrant Orange) */}
          <button
            onClick={() => {
              onClose();
              navigate("/promotion");
            }}
            className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#ffaa00] via-[#f58400] to-[#e65c00] flex items-center gap-3.5 px-4 text-white font-bold text-[15px] shadow-[0_3px_8px_rgba(245,132,0,0.35)] transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
          >
            <FaGift size={22} className="text-white shrink-0 drop-shadow-xs" />
            <span>{t("Promotion")}</span>
          </button>

          {/* 2. Reward Center (Magenta/Rose to Purple) */}
          <button
            onClick={() => {
              onClose();
              navigate("/members");
            }}
            className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#e63966] via-[#ba3694] to-[#6f3bb2] flex items-center gap-3.5 px-4 text-white font-bold text-[15px] shadow-[0_3px_8px_rgba(186,54,148,0.35)] transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
          >
            <FaAward size={22} className="text-white shrink-0 drop-shadow-xs" />
            <span>{t("Reward Center")}</span>
          </button>

          {/* 3. Invite (Blue-Violet to Purple) */}
          <button
            onClick={() => {
              onClose();
              navigate("/invite");
            }}
            className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#3f64f5] via-[#5b4fe8] to-[#8042df] flex items-center gap-3.5 px-4 text-white font-bold text-[15px] shadow-[0_3px_8px_rgba(91,79,232,0.35)] transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
          >
            <FaUsers size={22} className="text-white shrink-0 drop-shadow-xs" />
            <span>{t("Invite")}</span>
          </button>

          {/* 4. Betting Record (Vibrant Red to Crimson) */}
          <button
            onClick={() => {
              onClose();
              navigate("/bet-history");
            }}
            className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#e61924] via-[#bf0f19] to-[#80070a] flex items-center gap-3.5 px-4 text-white font-bold text-[15px] shadow-[0_3px_8px_rgba(230,25,36,0.35)] transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
          >
            <FaCalendarAlt size={20} className="text-white shrink-0 drop-shadow-xs" />
            <span>{t("Betting Record")}</span>
          </button>

          {/* 5. Beginner Guide (Vibrant Cyan to Deep Blue) */}
          <button
            onClick={() => {
              onClose();
              alert("Opening NPR77 Beginner Guide & Tutorials...");
            }}
            className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00b4d8] via-[#0084d1] to-[#0051b8] flex items-center gap-3.5 px-4 text-white font-bold text-[15px] shadow-[0_3px_8px_rgba(0,180,216,0.35)] transition hover:opacity-95 active:scale-[0.98]"
          >
            <FaAndroid size={22} className="text-white shrink-0 drop-shadow-xs" />
            <span>{t("Beginner Guide")}</span>
          </button>
        </div>

        {/* 5 Navy Rounded-Pill Support & Social Buttons */}
        <div className="px-3.5 pt-2 pb-6 space-y-2">
          {/* Customer Service */}
          <a
            href="https://wa.me/9779800000000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 rounded-full bg-[#061d4b] hover:bg-[#0c2b69] border border-[#0f347d] flex items-center gap-3 px-4 text-white font-bold text-[13.5px] shadow-sm transition active:scale-[0.98]"
          >
            <FaHeadset size={16} className="text-white shrink-0" />
            <span>{t("Customer Service")}</span>
          </a>

          {/* FACEBOOK */}
          <a
            href="https://facebook.com/npr77official"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 rounded-full bg-[#061d4b] hover:bg-[#0c2b69] border border-[#0f347d] flex items-center gap-3 px-4 text-white font-bold text-[13.5px] shadow-sm transition active:scale-[0.98]"
          >
            <FaFacebookF size={15} className="text-white shrink-0" />
            <span>FACEBOOK</span>
          </a>

          {/* TELEGRAM */}
          <a
            href="https://t.me/npr77official"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 rounded-full bg-[#061d4b] hover:bg-[#0c2b69] border border-[#0f347d] flex items-center gap-3 px-4 text-white font-bold text-[13.5px] shadow-sm transition active:scale-[0.98]"
          >
            <FaTelegramPlane size={16} className="text-white shrink-0" />
            <span>TELEGRAM</span>
          </a>

          {/* WHATSAPP */}
          <a
            href="https://wa.me/9779800000000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 rounded-full bg-[#061d4b] hover:bg-[#0c2b69] border border-[#0f347d] flex items-center gap-3 px-4 text-white font-bold text-[13.5px] shadow-sm transition active:scale-[0.98]"
          >
            <FaWhatsapp size={16} className="text-white shrink-0" />
            <span>WHATSAPP</span>
          </a>

          {/* App */}
          <button
            onClick={() => {
              onClose();
              alert("Downloading NPR77 Android App APK...");
            }}
            className="w-full h-10 rounded-full bg-[#061d4b] hover:bg-[#0c2b69] border border-[#0f347d] flex items-center gap-3 px-4 text-white font-bold text-[13.5px] shadow-sm transition active:scale-[0.98]"
          >
            <FaMobileAlt size={16} className="text-white shrink-0" />
            <span>{t("App")}</span>
          </button>

          {/* Logout Button if user is logged in */}
          {user && (
            <button
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="w-full h-10 rounded-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-200 font-bold text-[13.5px] shadow-sm transition active:scale-[0.98] mt-2 cursor-pointer"
            >
              {t("Logout")} ({user.username || "prish07"})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

MenuDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectCategory: PropTypes.func,
  user: PropTypes.object,
  onLogout: PropTypes.func,
};

export default MenuDrawer;
