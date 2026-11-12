import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaHeadset, FaBars, FaUser } from "react-icons/fa";

const languages = [
  { id: "en", name: "English", flag: "/npr/lan/US.svg" },
  { id: "np", name: "नेपाली", flag: "/npr/lan/NP.svg" },
];

const Header = ({ onOpenMenu, user }) => {
  const [currentLang, setCurrentLang] = useState("en");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const langRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLanguage = languages.find((l) => l.id === currentLang) || languages[0];

  const handleSelectLang = (langId) => {
    setCurrentLang(langId);
    setLangDropdownOpen(false);
  };

  return (
    <>
      {/* Dark Dimmed / Blended Backdrop Overlay when Language dropdown is open */}
      {langDropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[0.5px] transition-opacity duration-300"
          onClick={() => setLangDropdownOpen(false)}
        />
      )}

      <header className="bg-white border-b border-gray-100 px-3 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-xs relative">
        {/* Left Side: Brand Logo + Logged-in User Profile Block */}
        <div className="flex items-center gap-2 select-none">
          <Link to="/" className="flex items-center group">
            <img
              src="/npr/jsb77_logo_header.png"
              alt="JSB77 Logo"
              className="h-[31px] sm:h-[32px] w-auto object-contain transition duration-200"
            />
          </Link>

          {/* User Profile Block (Visible when logged in) */}
          {user && (
            <div className="flex items-center gap-2.5 ml-3.5 sm:ml-5 select-none">
              {/* Solid Blue Circle Avatar */}
              <div className="w-[35px] h-[35px] rounded-full bg-[#0045b8] flex items-center justify-center text-white shrink-0 shadow-xs">
                <FaUser size={18} className="text-white" />
              </div>

              {/* Username & Balance */}
              <div className="flex flex-col justify-center text-left leading-none">
                <span className="text-[#0045b8] font-bold text-[14px] leading-tight tracking-tight">
                  {user.username || "prish07"}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[#0045b8] font-bold text-[13.5px] leading-none">
                    Rs{hideBalance ? "••••" : (user.balance || "0.00")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHideBalance(!hideBalance)}
                    className="text-[#0045b8] hover:opacity-80 transition focus:outline-none cursor-pointer flex items-center justify-center"
                    title={hideBalance ? "Show balance" : "Hide balance"}
                    aria-label={hideBalance ? "Show balance" : "Hide balance"}
                  >
                    {hideBalance ? (
                      <svg
                        viewBox="0 0 24 16"
                        className="w-[22px] h-[15px] text-[#0045b8]"
                        fill="none"
                      >
                        <path
                          d="M12 1.5C5.6 1.5 1 8 1 8s4.6 6.5 11 6.5S23 8 23 8s-4.6-6.5-11-6.5z"
                          fill="currentColor"
                        />
                        <circle cx="12" cy="8" r="4.5" fill="#ffffff" />
                        <circle cx="12" cy="8" r="2.4" fill="currentColor" />
                        <line
                          x1="3"
                          y1="2"
                          x2="21"
                          y2="14"
                          stroke="#ffffff"
                          strokeWidth="3.4"
                          strokeLinecap="round"
                        />
                        <line
                          x1="3"
                          y1="2"
                          x2="21"
                          y2="14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 16"
                        className="w-[22px] h-[15px] text-[#0045b8]"
                        fill="none"
                      >
                        <path
                          d="M12 1.5C5.6 1.5 1 8 1 8s4.6 6.5 11 6.5S23 8 23 8s-4.6-6.5-11-6.5z"
                          fill="currentColor"
                        />
                        <circle cx="12" cy="8" r="4.5" fill="#ffffff" />
                        <circle cx="12" cy="8" r="2.4" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Icons (Exact Match to Reference Screenshot) */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          {/* WhatsApp Icon */}
          <a
            href="https://wa.me/9779800000000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center hover:opacity-85 transition active:scale-95 select-none"
            title="WhatsApp Support"
          >
            <img
              src="/npr/icon_whatsapp.png"
              alt="WhatsApp"
              className="w-[26px] h-[26px] object-contain block"
            />
          </a>

          {/* Live Support / Headset Icon */}
          <button
            onClick={() => alert("Connecting to 24/7 JSB77 Live Support...")}
            className="w-7 h-7 flex items-center justify-center hover:opacity-85 transition active:scale-95 select-none focus:outline-hidden"
            title="Live Customer Service"
          >
            <img
              src="/npr/icon_headset.png"
              alt="Live Support"
              className="w-[25px] h-[25px] object-contain block"
            />
          </button>

          {/* Language Flag Button & Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen((prev) => !prev)}
              className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 shadow-xs hover:scale-105 transition flex items-center justify-center focus:outline-hidden"
              title="Select Language"
            >
              <img
                src={activeLanguage.flag}
                alt={activeLanguage.name}
                className="w-full h-full object-cover rounded-full"
              />
            </button>

            {/* Language Dropdown Menu (Compact width, directly under flag) */}
            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-[97px] bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                {/* Upward triangle pointer centered directly under the flag icon */}
                <div className="absolute -top-1 right-[9px] w-2.5 h-2.5 bg-white rotate-45 border-t border-l border-gray-200/80 shadow-xs" />

                <div className="relative z-10 flex flex-col py-0.5">
                  {languages.map((lang) => {
                    const isSelected = lang.id === currentLang;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => handleSelectLang(lang.id)}
                        className={`w-full px-2.5 py-1.5 flex items-center gap-2 text-left transition select-none ${isSelected
                          ? "bg-blue-50/60 text-[#0047ba]"
                          : "text-gray-800 hover:bg-gray-50"
                          }`}
                      >
                        <img
                          src={lang.flag}
                          alt={lang.name}
                          className="w-6 h-6 rounded-full object-cover shadow-xs border border-gray-100 shrink-0"
                        />
                        <span
                          className={`text-[14px] leading-tight ${isSelected ? " text-[#0047ba]" : "font-medium text-gray-500"
                            }`}
                        >
                          {lang.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Menu Icon */}
          <button
            onClick={onOpenMenu}
            className="w-6 h-6 flex items-center justify-center hover:opacity-85 transition active:scale-95 select-none focus:outline-hidden"
            title="Open Menu"
          >
            <img
              src="/npr/icon_menu.png"
              alt="Menu"
              className="w-[17px] h-auto object-contain block"
            />
          </button>
        </div>
      </header>
    </>
  );
};

Header.propTypes = {
  onOpenMenu: PropTypes.func,
  user: PropTypes.object,
};

export default Header;

