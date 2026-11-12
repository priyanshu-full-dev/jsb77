import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaChevronLeft, FaCopy, FaCheck } from "react-icons/fa";
import { MdRefresh, MdEdit } from "react-icons/md";

const MEMBER_GRID_ITEMS = [
  { id: "myRewards", label: "My Rewards", badge: 8, icon: "/npr/members/my_rewards.png" },
  { id: "betHistory", label: "Bet History", icon: "/npr/members/bet_history.png" },
  { id: "depositRecord", label: "Deposit Record", icon: "/npr/members/deposit_record.png" },
  { id: "profitAndLoss", label: "Profit And Loss", icon: "/npr/members/profit_and_loss.png" },
  { id: "withdrawalRecord", label: "Withdrawal Record", icon: "/npr/members/withdrawal_record.png" },
  { id: "transactionHistory", label: "Transaction History", icon: "/npr/members/transaction_history.png" },
  { id: "myAccount", label: "My Account", icon: "/npr/members/my_account.png" },
  { id: "securityCenter", label: "Security Center", badge: 1, icon: "/npr/members/security_center.png" },
  { id: "points", label: "Points", icon: "/npr/members/points.png" },
  { id: "inviteFriends", label: "Invite Friends", icon: "/npr/members/invite_friends.png" },
  { id: "rebate", label: "Rebate", icon: "/npr/members/rebate.png" },
  { id: "internalMessage", label: "Internal Message", icon: "/npr/members/internal_message.png" },
  { id: "suggestion", label: "Suggestion", icon: "/npr/members/suggestion.png" },
  { id: "downloadApp", label: "Download APP", icon: "/npr/members/download_app.png" },
  { id: "customerService", label: "Customer Service", icon: "/npr/members/customer_service.png" },
  { id: "logout", label: "Logout", icon: "/npr/members/logout.png" },
];

const MembersPage = () => {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const { user, onOpenDeposit, onOpenWithdrawal, onOpenInvite, onLogout } = context;

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

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast("Balance refreshed");
    }, 650);
  };

  const handleEditNickname = () => {
    const updated = window.prompt("Enter new nickname:", nickname);
    if (updated && updated.trim()) {
      setNickname(updated.trim());
      showToast("Nickname updated");
    }
  };

  const handleGridClick = (item) => {
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
            My Account
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
              Deposit
            </button>
            <button
              type="button"
              onClick={() => onOpenWithdrawal?.()}
              className="h-[34px] rounded-full border border-[#b4bec8] shadow-[0_2px_4px_rgba(0,0,0,0.24),inset_0_1px_0_#ffffff] text-[#222] font-semibold text-[13px] flex items-center justify-center active:scale-95 transition cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #f8fafc 0%, #dadfe6 48%, #c4ccd5 100%)",
              }}
            >
              Withdrawal
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
                Bank
                <br />
                Account
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Member Center Tag + Horizontal Divider Line */}
      <div className="pl-[30px] pr-0 mt-4 mb-3.5 flex items-center">
        <span className="inline-block bg-[#dfdfdf] text-[#111111] text-[12px] font-normal px-3 py-[3px] rounded-full shrink-0">
          Member Center
        </span>
        <div className="h-[1px] flex-1 bg-[#f0f0f0]" />
      </div>

      {/* 4. 4x4 Member Center Grid (Exact extracted icons) */}
      <div className="px-2 grid grid-cols-4 gap-y-5 gap-x-1">
        {MEMBER_GRID_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleGridClick(item)}
            className="flex flex-col items-center justify-start group focus:outline-none cursor-pointer"
          >
            <div className="w-[50px] h-[50px] rounded-full relative mx-auto group-active:scale-95 transition">
              <img
                src={item.icon}
                alt={item.label}
                className="w-full h-full object-contain rounded-full pointer-events-none"
                draggable={false}
              />
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#e62121] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[12px] text-[#333] text-center leading-[1.2] mt-1.5 px-1">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MembersPage;
