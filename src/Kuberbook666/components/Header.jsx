import React, { useState } from "react";
import { IoGlobeOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = ({
  theme = "dark",
  onToggleTheme,
  onOpenDrawer,
  onOpenLogin,
  onOpenSignup,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const userData = useSelector((state) => state?.user?.userData);

  const languages = [
    { code: "EN", label: "English" },
    { code: "HI", label: "हिन्दी" },
    { code: "BN", label: "বাংলা" },
    { code: "TE", label: "తెలుగు" },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      navigate(`/sports?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div
      id="header_body"
      style={{ background: "linear-gradient(90deg, #6e081d, #c10931)" }}
      className="w-full h-[54px] lg:h-[72px] pr-[4px] md:px-4 flex items-center justify-between gap-1 relative z-40 shadow-md border-b border-red-950/40 select-none"
    >
      {/* Left: Logo & Mobile Hamburger */}
      <div
        id="logoContainer"
        className="logo flex w-full h-full md:w-fit items-center"
      >
        {/* Mobile Hamburger Button */}
        <div className="flex items-center w-[40px] md:w-fit justify-center lg:hidden">
          <button
            onClick={onOpenDrawer}
            className="leading-normal relative overflow-hidden transition duration-150 ease-in-out bg-none border-none h-full flex items-center justify-center active:scale-125 w-[100%] shadow-none px-1 cursor-pointer"
            type="button"
            aria-label="Menu"
          >
            <span>
              <svg
                height="19"
                width="16"
                fill="#fff"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Brand Logo */}
        <div className="flex items-center">
          <Link to="/" className="cursor-pointer flex items-center">
            <img
              src="https://imagedelivery.net/_oGMRGIDYQYkAb8XFE2QBQ/logos-248cabe4-07dc-44d3-b487-7898a1cb62c2.png/public"
              width="200px"
              alt="KUBERBOOK666"
              className="hidden sm:block max-w-[150px] max-h-[44px] object-contain"
            />
            <img
              src="https://imagedelivery.net/_oGMRGIDYQYkAb8XFE2QBQ/logos-248cabe4-07dc-44d3-b487-7898a1cb62c2.png/public"
              width="200px"
              className="sm:hidden mobileLogoHeight max-w-[115px] object-contain"
              alt="KUBERBOOK666"
            />
          </Link>
        </div>

        {/* Theme Toggle Icon (Shows sun when in dark mode, moon when in light mode) */}
        <img
          onClick={onToggleTheme}
          className="ms-2 cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none"
          src={theme === "dark" ? "/light-theme.svg" : "/dark-theme.svg"}
          width="30"
          height="30"
          alt={
            theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"
          }
          title={
            theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"
          }
        />
      </div>

      {/* Center Search Box (Desktop / lg screen) */}
      <div
        id="searchBox"
        className="text-gray-300 relative hidden max-w-96 font-sans lg:block flex-grow mx-4"
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full max-w-[450px]"
        >
          <input
            className="peer w-full appearance-none text-xs pl-9 py-2.5 rounded-full md:text-[14px] bg-[#1a1c24] text-white border border-red-900/40 focus:outline-none focus:border-red-500 placeholder-gray-400"
            placeholder="Search Events(At least 3 letters)..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            fill="#999"
            className="absolute top-1/2 left-3 -translate-y-1/2"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </form>
      </div>

      {/* Right Side: Language & Auth Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-1.5 rounded-full hover:bg-black/20 text-white transition-colors flex items-center justify-center"
            title="Language"
          >
            <IoGlobeOutline className="text-xl" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-[#1f1619] border border-red-900/50 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-red-900/40 ${
                    currentLang === lang.code
                      ? "text-yellow-400 font-bold"
                      : "text-gray-200"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Login & Sign Up Buttons */}
        {isLoggedIn ? (
          <button
            onClick={() => navigate("/account")}
            className="flex items-center gap-1.5 bg-[#6e081d] px-3 py-1.5 rounded-full border border-red-800/60 text-xs font-bold text-white shadow"
          >
            <span>{userData?.username || "Account"}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Login Button */}
            <button
              id="loginButton"
              onClick={onOpenLogin}
              className="flex rounded-full border border-quaternary hover:opacity-100  w-max font-extrabold items-center justify-center py-[8px] sm:py-2 bg-[#6e091d] lg:relative lg:gap-1 lg:pr-4 lg:pl-3 px-3 sm:px-4 active:scale-95 transition cursor-pointer"
            >
              <span className="w-max text-white hidden lg:block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#fff"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                  <path d="M21 12h-13l3 -3" />
                  <path d="M11 15l-3 -3" />
                </svg>
              </span>
              <span className="text-xs sm:text-sm text-white font-semibold font-sans">
                Log In
              </span>
            </button>

            {/* Sign Up Button */}
            <button
              onClick={onOpenSignup}
              className="flex rounded-full lg:border border-white/60 gap-1 hover:opacity-90 w-max font-extrabold items-center justify-center lg:pr-4 lg:pl-3 py-2 sm:py-2 px-3 sm:px-4 bg-white shadow-sm active:scale-95 transition cursor-pointer"
            >
              <span className="w-max hidden lg:block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#c10931"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                  <path d="M16 19h6" />
                  <path d="M19 16v6" />
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                </svg>
              </span>
              <span className="text-xs sm:text-sm text-[#c10931] font-extrabold font-sans">
                Sign Up
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
