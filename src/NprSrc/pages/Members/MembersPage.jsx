import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaChevronLeft, FaCopy, FaCheck } from "react-icons/fa";
import { MdRefresh, MdEdit } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext";

const MemberSvgIcons = {
  myRewards: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5.5H4.5a1.5 1.5 0 0 0-1.5 1.5v1a2.5 2.5 0 0 0 2.5 2.5H7" />
      <path d="M17 5.5h2.5A1.5 1.5 0 0 1 21 7v1a2.5 2.5 0 0 1-2.5 2.5H17" />
      <path d="M12 15v3" />
      <path d="M8.5 18h7l1 2.5h-9l1-2.5Z" />
      <path d="M12 7l.7 1.4 1.5.2-1.1 1.1.3 1.5L12 10.5l-1.4.7.3-1.5-1.1-1.1 1.5-.2L12 7Z" strokeWidth="1.2" />
    </svg>
  ),
  betHistory: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="12" y1="4" x2="10" y2="10.5" />
      <line x1="19.6" y1="9.5" x2="13.2" y2="10.2" />
      <line x1="16.7" y1="18.5" x2="13.5" y2="12.7" />
      <line x1="7.3" y1="18.5" x2="11.8" y2="13.8" />
      <line x1="4.4" y1="9.5" x2="10.3" y2="12.2" />
    </svg>
  ),
  depositRecord: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6" />
      <path d="M15 4h2a2 2 0 0 1 2 2v5" />
      <rect x="9" y="2.5" width="6" height="3" rx="1" />
      <path d="M7.5 10h6M7.5 13.5h4M7.5 17h3" />
      <circle cx="17" cy="17" r="4.2" fill="#fdf2de" />
      <path d="M17 19v-4M15.3 16.7L17 15l1.7 1.7" />
    </svg>
  ),
  profitAndLoss: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 17V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2v-2h11" />
      <path d="M9 7.5h2.5M9 10.5h2.5" />
      <path d="M15 6.5v7" />
      <path d="M16.8 8a1.7 1.7 0 0 0-1.8-1c-1 0-1.7.5-1.7 1.3s.7 1.1 1.7 1.3c1 .2 1.8.6 1.8 1.4s-.8 1.4-1.8 1.4a1.8 1.8 0 0 1-1.8-1" />
    </svg>
  ),
  withdrawalRecord: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6" />
      <path d="M15 4h2a2 2 0 0 1 2 2v5" />
      <rect x="9" y="2.5" width="6" height="3" rx="1" />
      <path d="M7.5 10h6M7.5 13.5h4M7.5 17h3" />
      <circle cx="17" cy="17" r="4.2" fill="#fdf2de" />
      <path d="M17 15v4M15.3 17.3L17 19l1.7-1.7" />
    </svg>
  ),
  transactionHistory: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="14" rx="2" />
      <path d="M6.5 13l3-3 2.5 2 3.5-3.5" />
      <circle cx="14" cy="12" r="3.2" fill="#fdf2de" />
      <path d="M16.5 14.5l3 3" />
      <circle cx="7" cy="17.5" r="3.2" fill="#fdf2de" />
      <path d="M7 16v1.5l1 .8" strokeWidth="1.3" />
    </svg>
  ),
  myAccount: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="9.5" r="3" />
      <path d="M6.6 18.6a6.5 6.5 0 0 1 10.8 0" />
    </svg>
  ),
  securityCenter: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.5s7.5-3.5 7.5-9.5V5.5L12 3 4.5 5.5V12c0 6 7.5 9.5 7.5 9.5Z" />
      <rect x="8.5" y="7.5" width="7" height="7" rx="1.2" strokeWidth="1.3" />
      <circle cx="12" cy="10.2" r="1.3" strokeWidth="1.3" />
      <path d="M10 13.5a2.3 2.3 0 0 1 4 0" strokeWidth="1.3" />
    </svg>
  ),
  points: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9l1.8-4.5h12.4L20 9" />
      <path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
      <path d="M5.5 11.5v7a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-7" />
      <circle cx="7.5" cy="17.5" r="3.5" fill="#fdf2de" />
      <path d="M7.5 16v3M6 17.5h3" strokeWidth="1.4" />
    </svg>
  ),
  inviteFriends: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="8" r="3.4" />
      <path d="M4.5 18.5a6 6 0 0 1 11-2.5" />
      <path d="M4.5 18.5h8" />
      <circle cx="16.5" cy="16.5" r="3.5" fill="#fdf2de" />
      <path d="M16.5 15v3M15 16.5h3" strokeWidth="1.4" />
    </svg>
  ),
  rebate: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.5 9.5a6.5 6.5 0 1 0-1.5 6.5" />
      <path d="M10 4.5l2.5-1.5v3" />
      <text x="12" y="12.5" textAnchor="middle" fontSize="7.5" fill="currentColor" stroke="none" fontWeight="bold">$</text>
      <ellipse cx="15.5" cy="15.5" rx="3.5" ry="1.3" fill="#fdf2de" />
      <path d="M12 15.5v3.2c0 .7 1.6 1.3 3.5 1.3s3.5-.6 3.5-1.3v-3.2" />
    </svg>
  ),
  internalMessage: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M14.6 9.4v3.8a1.6 1.6 0 0 0 3.2 0V12a5.8 5.8 0 1 0-3.3 5.2" />
    </svg>
  ),
  suggestion: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 5H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2l3 3 3-3h4a2 2 0 0 0 2-2v-3" />
      <path d="M8 9.5h5M8 13h7" />
      <path d="M18.5 3l.8 1.6 1.7.3-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.3.8-1.6Z" fill="#fdf2de" />
    </svg>
  ),
  downloadApp: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
      <path d="M10.5 5h3" strokeWidth="1.3" />
      <path d="M12 8.5v5.5M9.8 11.8L12 14l2.2-2.2" />
      <path d="M9 15.5h6" />
      <circle cx="12" cy="18.8" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  ),
  customerService: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 13v-1.5a7.5 7.5 0 0 1 15 0V13" />
      <rect x="3" y="11.5" width="2.2" height="4.5" rx="1" />
      <rect x="18.8" y="11.5" width="2.2" height="4.5" rx="1" />
      <path d="M19.5 16v1.5a3 3 0 0 1-3 3H13" />
      <text x="12" y="13.8" textAnchor="middle" fontSize="5.4" fill="currentColor" stroke="none" fontWeight="bold">24/7</text>
    </svg>
  ),
  logout: () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] text-[#c49a45]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 6.5A7.5 7.5 0 1 0 15.5 17.5" />
      <path d="M10 12h9.5M16.5 9l3 3-3 3" />
    </svg>
  ),
};

const MEMBER_GRID_ITEMS = [
  { id: "myRewards", label: "My Rewards", badge: 8, Icon: MemberSvgIcons.myRewards },
  { id: "betHistory", label: "Bet History", Icon: MemberSvgIcons.betHistory },
  { id: "depositRecord", label: "Deposit Record", Icon: MemberSvgIcons.depositRecord },
  { id: "profitAndLoss", label: "Profit And Loss", Icon: MemberSvgIcons.profitAndLoss },
  { id: "withdrawalRecord", label: "Withdrawal Record", Icon: MemberSvgIcons.withdrawalRecord },
  { id: "transactionHistory", label: "Transaction History", Icon: MemberSvgIcons.transactionHistory },
  { id: "myAccount", label: "My Account", Icon: MemberSvgIcons.myAccount },
  { id: "securityCenter", label: "Security Center", badge: 1, Icon: MemberSvgIcons.securityCenter },
  { id: "points", label: "Points", Icon: MemberSvgIcons.points },
  { id: "inviteFriends", label: "Invite Friends", Icon: MemberSvgIcons.inviteFriends },
  { id: "rebate", label: "Rebate", Icon: MemberSvgIcons.rebate },
  { id: "internalMessage", label: "Internal Message", Icon: MemberSvgIcons.internalMessage },
  { id: "suggestion", label: "Suggestion", Icon: MemberSvgIcons.suggestion },
  { id: "downloadApp", label: "Download APP", Icon: MemberSvgIcons.downloadApp },
  { id: "customerService", label: "Customer Service", Icon: MemberSvgIcons.customerService },
  { id: "logout", label: "Logout", Icon: MemberSvgIcons.logout },
];

const MembersPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const context = useOutletContext() || {};
  const { user, onOpenDeposit, onOpenWithdrawal, onOpenInvite, onLogout, onRefreshBalance } = context;

  const username = user?.username || "prish07";
  const balance = user?.balance || "0.00";

  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nickname, setNickname] = useState(username);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(username);
    setCopied(true);
    showToast("Username copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefreshBalance) {
        await onRefreshBalance();
      }
      showToast("Balance refreshed");
    } catch {
      showToast("Balance refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditNickname = () => {
    const updated = window.prompt("Enter new nickname:", nickname);
    if (updated && updated.trim()) {
      setNickname(updated.trim());
      showToast("Nickname updated");
    }
  };

  const handleGridClick = (item) => {
    if (item.id === "betHistory") {
      navigate("/bet-history");
      return;
    }
    if (item.id === "depositRecord") {
      navigate("/deposit");
      return;
    }
    if (item.id === "withdrawalRecord") {
      navigate("/withdrawal");
      return;
    }
    if (item.id === "inviteFriends") {
      onOpenInvite?.();
      return;
    }
    if (item.id === "logout") {
      onLogout?.();
      navigate("/");
      return;
    }
    if (item.id === "customerService") {
      showToast("Connecting to 24/7 Customer Service...");
      return;
    }
    showToast(`${item.label} opened`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-8 select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white text-[12px] font-medium px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* 1. Top Dark Curved Backdrop & Header */}
      <div
        className="relative h-[160px] w-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #211c18 0%, #3d332a 55%, #1d1916 100%)",
        }}
      >
        {/* Subtle warm ambient bokeh circles matching screenshot */}
        <div className="absolute -top-6 -left-6 w-36 h-36 rounded-full bg-[#5a4636]/25 pointer-events-none" />
        <div className="absolute top-6 right-4 w-28 h-28 rounded-full bg-[#6d543e]/20 pointer-events-none" />

        {/* Diagonal white cut on bottom-left matching screenshot */}
        <div
          className="absolute bottom-0 left-0 right-0 h-14 bg-white pointer-events-none"
          style={{
            clipPath: "polygon(0 0, 14% 100%, 100% 100%, 100% 100%, 0 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-10 bg-white pointer-events-none"
          style={{
            clipPath: "polygon(0 15%, 100% 100%, 0 100%)",
          }}
        />

        {/* Top Navigation Bar */}
        <div className="relative z-10 h-12 px-3 flex items-center justify-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute left-3 p-1.5 text-white hover:opacity-80 active:scale-95 transition cursor-pointer"
            aria-label="Back"
          >
            <FaChevronLeft size={18} />
          </button>
          <h1 className="text-white text-[17px] font-normal tracking-wide">
            {t("My Account")}
          </h1>
        </div>
      </div>

      {/* 2. Floating Silver Member Profile Card (Left gap only, flush to right edge) */}
      <div className="pl-[30px] pr-0 -mt-[104px] relative z-20">
        <div
          className="rounded-l-[16px] rounded-r-none pl-4 pr-4 pt-3 pb-4 relative overflow-hidden shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
          style={{
            background: "linear-gradient(125deg, #c1cad4 0%, #c8d1db 30%, #dce3eb 55%, #c5ced8 75%, #e1e8ee 100%)",
          }}
        >
          {/* Exact 3D Silver Medal Watermark on the right */}
          <img
            src="/npr/members/card_medal_watermark.png"
            alt=""
            className="absolute right-0 top-[24px] w-[136px] h-auto pointer-events-none select-none z-0 opacity-90"
            draggable={false}
          />

          {/* Top-Left: Verify Now > Pill */}
          <div className="flex items-center justify-between relative z-10">
            <button
              type="button"
              onClick={() => showToast("Account verification coming soon")}
              className="inline-flex items-center gap-1 px-2.5 py-[2.5px] rounded-full text-white text-[11.5px] font-normal tracking-tight shadow-xs active:scale-95 transition cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #ff7c55 0%, #fe5723 50%, #ff3c00 100%)",
              }}
            >
              <span>Verify Now</span>
              <svg viewBox="0 0 10 16" className="w-[6px] h-[10px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 2l6 6-6 6" />
              </svg>
            </button>
          </div>

          {/* Top-Right: Crisp Vector Red Sign In S-Curve Ribbon */}
          <button
            type="button"
            onClick={() => showToast("Daily Sign-In checked!")}
            className="absolute top-0 right-0 z-20 w-[154px] h-[30px] flex items-center justify-end pr-2.5 gap-2.5 active:opacity-90 transition cursor-pointer focus:outline-none"
            title="Sign In"
          >
            {/* S-Curve Red Ribbon Background SVG */}
            <svg
              viewBox="0 0 154 30"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <defs>
                <linearGradient id="signInRibbonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ee434b" />
                  <stop offset="50%" stopColor="#df2830" />
                  <stop offset="100%" stopColor="#cf131b" />
                </linearGradient>
              </defs>
              <path
                d="M0 0 H154 V30 H28 C16 30 12 8 0 0 Z"
                fill="url(#signInRibbonGrad)"
              />
            </svg>

            {/* White Square Check Icon */}
            <svg
              viewBox="0 0 18 18"
              className="relative z-10 w-[16px] h-[16px] shrink-0"
              fill="none"
            >
              <rect x="1" y="1" width="16" height="16" rx="2" fill="#f2f2f2" />
              <path d="M1 1H9V17H3C1.89543 17 1 16.1046 1 15V1Z" fill="#e5e5e5" />
              <rect x="3.5" y="3.5" width="11" height="11" rx="1" stroke="#d9242c" strokeWidth="1.1" />
              <path
                d="M6 9.2L8.3 11.5L13.5 5.5"
                stroke="#d9242c"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Crisp Sign In Label */}
            <span className="relative z-10 text-white text-[13px] font-normal tracking-tight leading-none">
              Sign In
            </span>

            {/* Thick Rounded Pinkish-White Chevron */}
            <svg
              viewBox="0 0 10 16"
              className="relative z-10 w-[8px] h-[13px] shrink-0 ml-0.5"
              fill="none"
            >
              <path
                d="M2 2.5L7.5 8L2 13.5"
                stroke="rgba(255, 225, 225, 0.72)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Avatar + User Info Row */}
          <div className="flex items-center gap-3.5 mt-2.5 relative z-10">
            {/* Circular Avatar */}
            <div className="w-[82px] h-[82px] rounded-full border-[3px] border-white shadow-md overflow-hidden shrink-0 bg-gray-200">
              <img
                src="/npr/member_avatar.jpg"
                alt={username}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tier, Username, Nickname, Joined */}
            <div className="flex flex-col min-w-0">
              {/* Default Member 1 Badge with exact extracted medal */}
              <div className="inline-flex items-center gap-1 bg-[#66696e]/90 text-white text-[11.5px] font-semibold pl-1.5 pr-2.5 py-[2px] rounded-full w-fit shadow-xs">
                <img
                  src="/npr/members/member_medal.png"
                  alt="Medal"
                  className="w-4 h-4 object-contain shrink-0"
                />
                <span>Default Member 1</span>
              </div>

              {/* Username + Copy */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[17px] font-bold text-[#1a1a1a] leading-tight">
                  {username}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[#1a1a1a] hover:opacity-75 transition cursor-pointer"
                  title="Copy username"
                >
                  {copied ? <FaCheck size={13} className="text-green-600" /> : <FaCopy size={14} />}
                </button>
              </div>

              {/* Nickname */}
              <div className="flex items-center gap-1.5 mt-0.5 text-[12.5px] text-[#666]">
                <span>Nickname: {nickname}</span>
                <button
                  type="button"
                  onClick={handleEditNickname}
                  className="text-[#666] hover:text-[#222] transition cursor-pointer"
                  title="Edit nickname"
                >
                  <MdEdit size={14} />
                </button>
              </div>

              {/* Joined */}
              <div className="text-[12.5px] text-[#666] mt-0.5">
                Joined: 2026-11-10
              </div>
            </div>
          </div>

          {/* Balance & Refresh Row */}
          <div className="flex items-center justify-between mt-3 mb-3 px-0.5 relative z-10">
            <div className="flex items-baseline">
              <span className="text-[15px] font-semibold text-[#333] mr-1.5">Rs</span>
              <span className="text-[22px] font-bold text-[#333] tracking-tight leading-none">
                {balance}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-[#777] hover:text-[#333] transition p-1 cursor-pointer"
              title="Refresh balance"
            >
              <MdRefresh size={22} className={refreshing ? "animate-spin text-[#0045b8]" : ""} />
            </button>
          </div>

          {/* 3 Embossed Pill Action Buttons */}
          <div className="grid grid-cols-3 gap-2.5 relative z-10 pr-1">
            <button
              type="button"
              onClick={() => onOpenDeposit?.()}
              className="h-[34px] rounded-full border border-[#b4bec8] shadow-[0_2px_4px_rgba(0,0,0,0.24),inset_0_1px_0_#ffffff] text-[#222] font-semibold text-[13px] flex items-center justify-center active:scale-95 transition cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #f8fafc 0%, #dadfe6 48%, #c4ccd5 100%)",
              }}
            >
              {t("Deposit")}
            </button>
            <button
              type="button"
              onClick={() => onOpenWithdrawal?.()}
              className="h-[34px] rounded-full border border-[#b4bec8] shadow-[0_2px_4px_rgba(0,0,0,0.24),inset_0_1px_0_#ffffff] text-[#222] font-semibold text-[13px] flex items-center justify-center active:scale-95 transition cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #f8fafc 0%, #dadfe6 48%, #c4ccd5 100%)",
              }}
            >
              {t("Withdrawal")}
            </button>
            <button
              type="button"
              onClick={() => showToast("Bank Account management")}
              className="h-[34px] rounded-full border border-[#b4bec8] shadow-[0_2px_4px_rgba(0,0,0,0.24),inset_0_1px_0_#ffffff] text-[#222] font-semibold text-[12px] leading-[1.1] flex items-center justify-center text-center active:scale-95 transition cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #f8fafc 0%, #dadfe6 48%, #c4ccd5 100%)",
              }}
            >
              <span>
                {t("Bank", "बैंक")}
                <br />
                {t("Account", "खाता")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Member Center Tag + Horizontal Divider Line */}
      <div className="pl-[30px] pr-0 mt-4 mb-3.5 flex items-center">
        <span className="inline-block bg-[#dfdfdf] text-[#111111] text-[12px] font-normal px-3 py-[3px] rounded-full shrink-0">
          {t("Member Center", "सदस्य केन्द्र")}
        </span>
        <div className="h-[1px] flex-1 bg-[#f0f0f0]" />
      </div>

      {/* 4. 4x4 Member Center Grid (Crisp Vector SVG Icons) */}
      <div className="px-2 grid grid-cols-4 gap-y-5 gap-x-1">
        {MEMBER_GRID_ITEMS.map((item) => {
          const IconComponent = item.Icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleGridClick(item)}
              className="flex flex-col items-center justify-start group focus:outline-none cursor-pointer"
            >
              <div className="w-[50px] h-[50px] rounded-full bg-[#fdf2de] flex items-center justify-center relative mx-auto group-active:scale-95 transition">
                <IconComponent />
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#e62121] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[12px] text-[#333] text-center leading-[1.2] mt-1.5 px-1">
                {t(item.label)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MembersPage;
