import React, { memo } from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiMail } from "react-icons/fi";
import {
  FaTelegramPlane,
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaPinterestP,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { SiThreads } from "react-icons/si";

// ==========================================
// CONSTANTS & STATIC CONFIGURATION
// ==========================================

const SOCIAL_LINKS = [
  {
    name: "Telegram",
    bg: "bg-[#2AABEE]",
    icon: <FaTelegramPlane size={20} className="text-white" />,
  },
  {
    name: "Facebook",
    bg: "bg-[#1877F2]",
    icon: <FaFacebookF size={19} className="text-white" />,
  },
  {
    name: "Google",
    bg: "bg-white",
    icon: <FcGoogle size={22} />,
  },
  {
    name: "Twitter",
    bg: "bg-[#1DA1F2]",
    icon: <FaTwitter size={19} className="text-white" />,
  },
  {
    name: "YouTube",
    bg: "bg-[#FF0000]",
    icon: <FaYoutube size={20} className="text-white" />,
  },
  {
    name: "Instagram",
    bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
    icon: <FaInstagram size={21} className="text-white" />,
  },
  {
    name: "Threads",
    bg: "bg-[#101010] border border-white/15",
    icon: <SiThreads size={18} className="text-white" />,
  },
  {
    name: "Pinterest",
    bg: "bg-[#BD081C]",
    icon: <FaPinterestP size={19} className="text-white" />,
  },
];

const FEATURE_ITEMS = [
  {
    id: "secure",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#65C52F"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[27px] h-[27px] drop-shadow-[0_0_7px_rgba(101,197,47,0.4)]"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    lines: ["100%", "Secure", "Payments"],
  },
  {
    id: "instant",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-[29px] h-[29px] drop-shadow-[0_0_7px_rgba(101,197,47,0.4)]"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="#65C52F"
          strokeWidth="2"
        />
        <path d="M13 3L7 12h5l-1 9 7-10h-5l1-8z" fill="#ffffff" />
      </svg>
    ),
    lines: ["Instant", "Transactions"],
  },
  {
    id: "support",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#65C52F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[29px] h-[29px] drop-shadow-[0_0_7px_rgba(101,197,47,0.4)]"
      >
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
        <path d="M18 19c0 1.5-1.5 2.5-3 2.5h-2" />
      </svg>
    ),
    lines: ["24X7", "Customer", "Support"],
  },
  {
    id: "rates",
    icon: (
      <div className="w-[29px] h-[29px] rounded-full border-2 border-[#65C52F] flex items-center justify-center drop-shadow-[0_0_7px_rgba(101,197,47,0.4)]">
        <span className="text-[#65C52F] font-bold text-[15px] leading-none">
          ₹
        </span>
      </div>
    ),
    lines: ["Best", "Rates &", "Charges"],
  },
  {
    id: "rng",
    icon: (
      <div className="relative w-[34px] h-[34px] flex items-center justify-center drop-shadow-[0_0_7px_rgba(101,197,47,0.4)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#65C52F"
          strokeWidth="2"
          className="w-[28px] h-[28px]"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[#65C52F] font-black text-[7.5px] tracking-wider">
          RNG
        </span>
      </div>
    ),
    lines: ["Responsible", "Gaming"],
  },
];

const COMPANY_LINKS = [
  { label: "About Us", to: "#" },
  { label: "Terms & Conditions", to: "#", className: "whitespace-nowrap" },
  { label: "Responsible Gaming", to: "#", className: "whitespace-nowrap" },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const Footer = () => {
  const handleDownloadApp = () => {
    const link = document.createElement("a");
    link.href = "/raftaar/raftaar.apk";
    link.download = "raftaar.apk";
    link.click();
  };

  return (
    <footer className="w-full text-white pt-2 pb-6 px-2.5 sm:px-4 font-sans select-none mt-10">
      {/* ========================================================
          1. DIGITAL PAYMENTS HEADER & 5 PAYMENT BOXES
          ======================================================== */}
      <div className="relative rounded-[10px] sm:rounded-[10px] border border-white/10 bg-gradient-to-b from-[#0e1118] to-[#080a10] px-3 py-5 sm:px-4 sm:py-5 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        {/* Title */}
        <div className="text-center tracking-wide">
          <p className="text-white font-extrabold italic text-[12.5px] sm:text-[14px] uppercase tracking-wider">
            ACCEPT, PROCESS & DISBURSE
          </p>
          <p className="font-extrabold italic text-[12.5px] sm:text-[14px] uppercase tracking-wider mt-0.5">
            <span className="bg-gradient-to-r from-[#65C52F] via-[#8FE33A] to-[#C0F52B] bg-clip-text text-transparent">
              DIGITAL PAYMENTS
            </span>{" "}
            <span className="text-white">FOR YOUR BUSINESS.</span>
          </p>
        </div>

        {/* 5 Payment Boxes */}
        <div className="grid grid-cols-[1.72fr_1fr_1.42fr_1fr_1.42fr] gap-[7px] mt-3.5 mx-[10px] sm:gap-2 sm:mx-[10px]">
          {/* Box 1: Net Banking */}
          <div className="h-[42px] sm:h-[46px] rounded-[7px] sm:rounded-[8px] p-[1px] bg-gradient-to-b from-[#39414b] via-[#252c35] to-[#161b22]">
            <div className="w-full h-full rounded-[6px] sm:rounded-[7px] bg-gradient-to-b from-[#171c25] to-[#0b0e14] flex items-center justify-center px-1">
              <div className="flex items-center gap-[4px]">
                <span className="bg-white text-black font-black text-[9px] sm:text-[10.5px] px-[4px] py-[3px] rounded-[2px] leading-none">
                  Net
                </span>
                <span className="text-white font-bold text-[8.5px] sm:text-[10px] tracking-tight leading-none">
                  Banking
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: UPI Rupee Shield */}
          <div className="h-[42px] sm:h-[46px] rounded-[7px] sm:rounded-[8px] p-[1px] bg-gradient-to-b from-[#39414b] via-[#252c35] to-[#161b22]">
            <div className="w-full h-full rounded-[6px] sm:rounded-[7px] bg-gradient-to-b from-[#171c25] to-[#0b0e14] flex items-center justify-center">
              <div className="relative flex items-center justify-center w-[27px] h-[27px] sm:w-[30px] sm:h-[30px]">
                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full drop-shadow-[0_1px_3px_rgba(0,169,157,0.4)]"
                >
                  <defs>
                    <linearGradient id="upiGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#00c9b7" />
                      <stop offset="100%" stopColor="#008376" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="18,2 29,6 34,16 31,27 18,34 5,27 2,16 7,6"
                    fill="url(#upiGradient)"
                  />
                  <circle cx="18" cy="18" r="9" fill="#ffffff" />
                  <text
                    x="18"
                    y="22.5"
                    textAnchor="middle"
                    fill="#008376"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    ₹
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Box 3: G Pay */}
          <div className="h-[42px] sm:h-[46px] rounded-[7px] sm:rounded-[8px] p-[1px] bg-gradient-to-b from-[#39414b] via-[#252c35] to-[#161b22]">
            <div className="w-full h-full rounded-[6px] sm:rounded-[7px] bg-gradient-to-b from-[#171c25] to-[#0b0e14] flex items-center justify-center gap-[4px] px-1">
              <FcGoogle size={18} className="shrink-0" />
              <span className="text-white font-medium text-[12px] sm:text-[13px] tracking-tight font-sans leading-none">
                Pay
              </span>
            </div>
          </div>

          {/* Box 4: PhonePe */}
          <div className="h-[42px] sm:h-[46px] rounded-[7px] sm:rounded-[8px] p-[1px] bg-gradient-to-b from-[#39414b] via-[#252c35] to-[#161b22] flex items-center justify-center">
            <div className="w-full h-full rounded-[6px] sm:rounded-[7px] bg-gradient-to-b from-[#171c25] to-[#0b0e14] flex items-center justify-center">
              <div className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] rounded-full bg-[#5f259f] flex items-center justify-center">
                <span className="text-white font-bold text-[13px] sm:text-[14px] !leading-[28px]">
                  पे
                </span>
              </div>
            </div>
          </div>

          {/* Box 5: Paytm */}
          <div className="h-[42px] sm:h-[46px] rounded-[7px] sm:rounded-[8px] p-[1px] bg-gradient-to-b from-[#39414b] via-[#252c35] to-[#161b22]">
            <div className="w-full h-full rounded-[6px] sm:rounded-[7px] bg-gradient-to-b from-[#171c25] to-[#0b0e14] flex items-center justify-center">
              <div className="flex items-center text-[12.5px] sm:text-[14px] font-black tracking-tighter !leading-[28px]">
                <span className="text-white">pay</span>
                <span className="text-[#00baf2]">tm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left Green Laser - exact reference style */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none overflow-visible">
          {/* Very thin horizontal green laser */}
          <div className="absolute bottom-0 left-[8%] sm:left-[10%] w-[24%] sm:w-[24%] h-[1px] bg-gradient-to-r from-transparent via-[#76E52F] to-transparent opacity-90" />

          {/* Sharp bright center point */}
          <div className="absolute bottom-[-1px] left-[20%] sm:left-[22%] w-[3px] h-[3px] -translate-x-1/2 rounded-full bg-[#E8FFD0] shadow-[0_0_3px_1px_#8FEA35,0_0_8px_2px_rgba(143,234,53,0.75)]" />

          {/* Tight soft glow around the point */}
          <div className="absolute bottom-[-3px] left-[20%] sm:left-[22%] w-[26px] sm:w-[32px] h-[6px] -translate-x-1/2 rounded-full bg-[#8FEA35]/35 blur-[4px]" />
        </div>
      </div>

      {/* ========================================================
          2. BRAND LOGO, POWERED BY & DOWNLOAD APP BUTTON
          ======================================================== */}
      <div className="text-center mt-6 sm:mt-7">
        {/* Raftaar Logo */}
        <img
          src="/raftaar/raf-logo.png"
          alt="Raftaar Club"
          className="h-[48px] sm:h-[52px] w-auto mx-auto object-contain drop-shadow-[0_2px_7px_rgba(0,0,0,0.55)]"
        />

        {/* Powered By */}
        <p className="mt-[1px] text-[11px] sm:text-[12px] leading-[15px] font-normal tracking-[0] text-white/80">
          Powered by{" "}
          <span className="text-[#74D92E] font-medium">Raftaar Club</span>
        </p>

        {/* Download App Button */}
        <button
          type="button"
          onClick={handleDownloadApp}
          className="
    w-[240px]
    h-[40px]
    mx-auto
    mt-3
    rounded-[6px]
    flex
    items-center
    justify-center
    gap-[10px]
    text-white
    font-normal
    text-[14px]
    leading-none
    tracking-normal
    border
    border-[#5AAE24]
    bg-[linear-gradient(180deg,#61B91E_0%,#489A12_38%,#367B0A_72%,#286008_100%)]
    shadow-[0_0_7px_rgba(83,174,28,0.30),inset_0_1px_0_rgba(180,255,110,0.28),inset_0_-1px_2px_rgba(0,0,0,0.35)]
    active:scale-[0.98]
    transition-all
    cursor-pointer
  "
        >
          <FiDownload
            size={17}
            className="text-white stroke-[1.7]"
          />
          <span>Download App</span>
        </button>
      </div>

      {/* ========================================================
          3. SOCIAL MEDIA PLATFORM ICONS (8 SQUIRCLES)
          ======================================================== */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-5 flex-wrap px-1">
        {SOCIAL_LINKS.map((item) => (
          <Link
            key={item.name}
            to="#"
            aria-label={item.name}
            className={`w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-[5px] ${item.bg} flex items-center justify-center shadow-md active:scale-95 transition-transform`}
          >
            {item.icon}
          </Link>
        ))}
      </div>

      {/* ========================================================
          4. CONTACT EMAIL PILL
          ======================================================== */}
      <Link
        to="#"
        className="w-[260px] sm:w-[260px] h-[38px] mx-auto rounded-[7px] border border-[#29333D] bg-gradient-to-b from-[#0b1119] to-[#070c12] flex items-center justify-center gap-[10px] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-[#65C52F]/40 transition-colors"
      >
        <FiMail size={16} className="text-white/90 stroke-[1.8]" />
        <span className="text-white/90 text-[12px] sm:text-[12px] font-normal tracking-normal leading-none">
          raftaarclub.official@gmail.com
        </span>
      </Link>

      {/* ========================================================
          5. FEATURE HIGHLIGHTS (5-COLUMN CARD)
          ======================================================== */}
      <div className="rounded-[10px] border border-[#28323C] bg-gradient-to-b from-[#0b1119] to-[#070c12] py-[10px] px-0 my-[5px] shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-5 divide-x divide-[#27313B]">
          {FEATURE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center justify-start text-center px-[2px]"
            >
              <div className="w-[34px] h-[34px] flex items-center justify-center">
                {item.icon}
              </div>
              <div className="mt-[4px] text-white font-normal text-[10px] sm:text-[10px] leading-[1.32]">
                {item.lines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          6. 18+ & LICENSED REGULATED SECTION
          ======================================================== */}
      <div className="rounded-[10px] border border-[#28323C] bg-gradient-to-b from-[#0b1119] to-[#070c12] px-[10px] py-[7px] my-[5px] shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center min-h-[38px]">
          {/* Left: 18+ */}
          <div className="flex items-center justify-start gap-[9px] min-w-0">
            <div className="w-[38px] h-[38px] rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-[14px] leading-none tracking-tight">
                18+
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-[9px] sm:text-[9.5px] leading-[1.25] font-normal whitespace-nowrap">
                Gambling can be addictive,
              </p>
              <p className="text-white/80 text-[9px] sm:text-[9.5px] leading-[1.25] font-normal whitespace-nowrap">
                please play responsibly.
              </p>
            </div>
          </div>

          {/* Center Divider */}
          <div className="w-px h-[38px] bg-[#29333D] mx-[14px]" />

          {/* Right: Licensed Crest */}
          <div className="flex items-center justify-start gap-[9px] min-w-0">
            <img
              src="/raftaar/licensed-crest.png"
              alt="Licensed & Regulated"
              className="w-[39px] h-[39px] object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white font-medium text-[10px] sm:text-[10px] leading-[1.15] whitespace-nowrap">
                Licensed &amp; Regulated
              </p>
              <p className="text-white/55 text-[8px] sm:text-[8px] leading-[1.18] whitespace-nowrap">
                Fair Play.
              </p>
              <p className="text-white/55 text-[8px] sm:text-[8px] leading-[1.18] whitespace-nowrap">
                Secure Play.
              </p>
              <p className="text-white/55 text-[8px] sm:text-[8px] leading-[1.18] whitespace-nowrap">
                Responsible Play.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          7. COMPANY LINKS & COPYRIGHT
          ======================================================== */}
      <div className="text-center mt-[10px] mb-0">
        {/* COMPANY */}
        <p className="text-[#72CE2C] text-[11px] font-medium leading-none uppercase tracking-normal mb-[6px]">
          COMPANY
        </p>

        {/* Company Links */}
        <div className="flex items-center justify-center text-[10px] sm:text-[10px] font-normal leading-none text-white/85">
          {COMPANY_LINKS.map((link, idx) => (
            <React.Fragment key={link.label}>
              {idx > 0 && (
                <span className="text-[#72CE2C] mx-[12px] font-normal">|</span>
              )}
              <Link
                to={link.to}
                className={`hover:text-white transition-colors ${link.className || ""}`}
              >
                {link.label}
              </Link>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-[8px] border-t border-white/[0.06] pt-[7px] pb-[8px] text-center">
        <p className="text-[9px] sm:text-[9px] font-normal leading-none text-white/45">
          © 2026{" "}
          <span className="text-[#72CE2C] font-normal">Raftaar Club.</span> All
          Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default memo(Footer);
