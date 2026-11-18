import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  FaChevronLeft,
  FaCopy,
  FaQuestionCircle,
  FaFacebookF,
  FaTwitter,
  FaTelegramPlane,
  FaWhatsapp,
  FaCommentDots,
  FaShareAlt,
} from "react-icons/fa";

const InvitePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [sliderUsers, setSliderUsers] = useState(50);
  const [toastMessage, setToastMessage] = useState("");

  const referralLink = "http://www.npr77.live/?r=99281";

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(referralLink);
    }
    setCopied(true);
    showToast("Invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveQrCode = () => {
    showToast("QR code saved to device!");
  };

  const handleShare = (platform) => {
    showToast(`Sharing to ${platform}...`);
  };

  // Calculate expected revenue based on slider (50 users = 900,000.00 -> 18,000 per user)
  const expectedRevenue = (sliderUsers * 18000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-[#f3f5f9] text-[#1e293b] pb-10 select-none">
      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-[#0047ba] text-white flex items-center justify-between px-4 h-12 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center -ml-1 text-white hover:opacity-80 active:scale-95 transition"
          aria-label="Back"
        >
          <FaChevronLeft size={18} />
        </button>
        <h1 className="font-bold text-[17px] tracking-tight">{t("Invite Friends")}</h1>
        <div className="w-8" />
      </header>

      {/* 2. Top Stats Grid (2x2 cards) */}
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:p-3.5">
        {/* Card 1: Today's Income */}
        <div className="bg-gradient-to-r from-[#62b7ff] to-[#3f8efc] rounded-[10px] py-3.5 px-2 text-center text-white shadow-2xs flex flex-col items-center justify-center">
          <span className="text-[13px] font-medium leading-none">{t("Today's Income")}</span>
          <span className="text-[20px] font-bold mt-1.5 leading-none">--</span>
        </div>

        {/* Card 2: Yesterday's Income */}
        <div className="bg-gradient-to-r from-[#b589ff] to-[#8c65f8] rounded-[10px] py-3.5 px-2 text-center text-white shadow-2xs flex flex-col items-center justify-center">
          <span className="text-[13px] font-medium leading-none">{t("Yesterday's Income")}</span>
          <span className="text-[20px] font-bold mt-1.5 leading-none">--</span>
        </div>

        {/* Card 3: Registers */}
        <div className="bg-gradient-to-r from-[#b589ff] to-[#8c65f8] rounded-[10px] py-3.5 px-2 text-center text-white shadow-2xs flex flex-col items-center justify-center">
          <span className="text-[13px] font-medium leading-none">{t("Registers")}</span>
          <span className="text-[20px] font-bold mt-1.5 leading-none">--</span>
        </div>

        {/* Card 4: Valid Referral */}
        <div className="bg-gradient-to-r from-[#62b7ff] to-[#3f8efc] rounded-[10px] py-3.5 px-2 text-center text-white shadow-2xs flex flex-col items-center justify-center">
          <span className="text-[13px] font-medium leading-none">{t("Valid Referral")}</span>
          <span className="text-[20px] font-bold mt-1.5 leading-none">--</span>
        </div>
      </div>

      {/* 3. Revenue Goals Card */}
      <div className="mx-3 sm:mx-3.5 mb-4 bg-gradient-to-r from-[#4d75eb] via-[#3a62db] to-[#254fc7] rounded-[16px] p-4 text-white shadow-sm relative overflow-hidden">
        {/* Top: Trophy + Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-[68px] h-[68px] shrink-0 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="/npr/invite/trophy_revenue.png"
              alt="Revenue Goals Trophy"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
          <h2 className="text-2xl sm:text-[28px] font-black tracking-tight leading-none text-white drop-shadow-xs">
            {t("Revenue goals")}
          </h2>
        </div>

        {/* Middle: Amount + Question Mark */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[#f6b74e] font-black text-[26px] sm:text-[30px] tracking-tight leading-none">
            Rs 900,000.00
          </span>
          <button
            type="button"
            onClick={() => showToast("Invite 50 users to complete revenue goal target.")}
            className="text-white/80 hover:text-white transition"
          >
            <FaQuestionCircle size={16} />
          </button>
        </div>

        {/* Bottom Subtitle */}
        <p className="text-center text-blue-100 text-[12px] font-medium mt-2">
          {t("Invite 50 user to meet the target")}
        </p>
      </div>

      {/* 4. Section: Rewards Released to Date */}
      <div className="mb-4">
        <h3 className="text-[#152349] font-black text-[19px] sm:text-[20px] text-center my-3.5">
          {t("Rewards Released to Date")}
        </h3>

        <div className="flex flex-col gap-2.5 px-3 sm:px-3.5">
          {/* Card 1: Invitation Rewards */}
          <div className="bg-white rounded-[12px] p-3 flex items-center gap-3.5 border border-slate-100 shadow-2xs hover:shadow-xs transition">
            <div className="w-[52px] h-[52px] shrink-0 flex items-center justify-center">
              <img
                src="/npr/invite/reward_invitation.png"
                alt="Invitation Rewards"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[#475569] font-bold text-[13px] block">{t("Invitation Rewards")}</span>
              <span className="text-[#0f1f4f] font-black text-[18px] sm:text-[20px] leading-tight block">
                Rs 41,500.00
              </span>
              <span className="text-[#94a3b8] text-[11px] font-medium block">179 {t("claimed")}</span>
            </div>
          </div>

          {/* Card 2: Achievement Rewards */}
          <div className="bg-white rounded-[12px] p-3 flex items-center gap-3.5 border border-slate-100 shadow-2xs hover:shadow-xs transition">
            <div className="w-[52px] h-[52px] shrink-0 flex items-center justify-center">
              <img
                src="/npr/invite/reward_achievement.png"
                alt="Achievement Rewards"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[#475569] font-bold text-[13px] block">{t("Achievement Rewards")}</span>
              <span className="text-[#0f1f4f] font-black text-[18px] sm:text-[20px] leading-tight block">
                Rs 3,600.00
              </span>
              <span className="text-[#94a3b8] text-[11px] font-medium block">102 {t("claimed")}</span>
            </div>
          </div>

          {/* Card 3: Deposit Rebate */}
          <div className="bg-white rounded-[12px] p-3 flex items-center gap-3.5 border border-slate-100 shadow-2xs hover:shadow-xs transition">
            <div className="w-[52px] h-[52px] shrink-0 flex items-center justify-center">
              <img
                src="/npr/invite/reward_deposit.png"
                alt="Deposit Rebate"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[#475569] font-bold text-[13px] block">{t("Deposit Rebate")}</span>
              <span className="text-[#0f1f4f] font-black text-[18px] sm:text-[20px] leading-tight block">
                Rs 107,553.48
              </span>
              <span className="text-[#94a3b8] text-[11px] font-medium block">296 {t("claimed")}</span>
            </div>
          </div>

          {/* Card 4: Betting Rebate */}
          <div className="bg-white rounded-[12px] p-3 flex items-center gap-3.5 border border-slate-100 shadow-2xs hover:shadow-xs transition">
            <div className="w-[52px] h-[52px] shrink-0 flex items-center justify-center">
              <img
                src="/npr/invite/reward_betting.png"
                alt="Betting Rebate"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[#475569] font-bold text-[13px] block">{t("Betting Rebate")}</span>
              <span className="text-[#0f1f4f] font-black text-[18px] sm:text-[20px] leading-tight block">
                Rs 126,546.37
              </span>
              <span className="text-[#94a3b8] text-[11px] font-medium block">344 {t("claimed")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Empty Status */}
      <div className="text-gray-400 font-semibold text-sm text-center py-2">
        {t("Empty")}
      </div>

      {/* 6. Share with your friends Card */}
      <div className="bg-white rounded-[14px] p-3.5 mx-3 sm:mx-3.5 mb-5 border border-slate-100 shadow-xs">
        <h4 className="text-[#3b28cc] font-black text-[13px] sm:text-[14px] mb-3">
          {t("Share with your friends")}
        </h4>

        <div className="flex items-center gap-3">
          {/* Left: QR Code + Save Button */}
          <div className="w-[96px] shrink-0 flex flex-col items-center">
            <div
              onClick={handleSaveQrCode}
              className="w-full aspect-square bg-white border border-gray-200 rounded-md p-1 shadow-2xs cursor-pointer active:scale-95 transition"
            >
              <img
                src="/npr/invite/qr_code.png"
                alt="Referral QR Code"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          </div>

          {/* Right: Referral Link Bar + Social Icons */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {/* Link Input Bar */}
            <div className="bg-[#f8faff] border border-blue-200/90 rounded-full flex items-center justify-between px-3 py-1 mb-2.5">
              <span className="text-[#334155] text-[11px] sm:text-[12px] font-semibold truncate pr-1">
                {referralLink}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-6 h-6 rounded-full bg-[#3b28cc] text-white flex items-center justify-center shrink-0 hover:bg-[#2b19b8] active:scale-90 transition"
                title="Copy link"
              >
                <FaCopy size={11} />
              </button>
            </div>

            {/* Social Share Buttons (7 icons matching exact colors) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleShare("Facebook")}
                className="w-7 h-7 rounded-[7px] bg-[#1877f2] text-white flex items-center justify-center active:scale-90 transition cursor-pointer"
                title="Facebook"
              >
                <FaFacebookF size={12} />
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={() => handleShare("X")}
                className="w-7 h-7 rounded-[7px] bg-black text-white flex items-center justify-center active:scale-90 transition cursor-pointer font-bold text-xs"
                title="X"
              >
                𝕏
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => handleShare("Telegram")}
                className="w-7 h-7 rounded-[7px] bg-[#0088cc] text-white flex items-center justify-center active:scale-90 transition cursor-pointer"
                title="Telegram"
              >
                <FaTelegramPlane size={13} />
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => handleShare("WhatsApp")}
                className="w-7 h-7 rounded-[7px] bg-[#25d366] text-white flex items-center justify-center active:scale-90 transition cursor-pointer"
                title="WhatsApp"
              >
                <FaWhatsapp size={14} />
              </button>

              {/* Chat / SMS */}
              <button
                type="button"
                onClick={() => handleShare("SMS")}
                className="w-7 h-7 rounded-[7px] bg-[#07c160] text-white flex items-center justify-center active:scale-90 transition cursor-pointer"
                title="Message"
              >
                <FaCommentDots size={12} />
              </button>

              {/* LINE */}
              <button
                type="button"
                onClick={() => handleShare("LINE")}
                className="w-7 h-7 rounded-[7px] bg-[#06c755] text-white flex items-center justify-center active:scale-90 transition cursor-pointer font-bold text-[9px]"
                title="LINE"
              >
                LINE
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={() => handleShare("Share")}
                className="w-7 h-7 rounded-[7px] bg-[#1a73e8] text-white flex items-center justify-center active:scale-90 transition cursor-pointer"
                title="Share"
              >
                <FaShareAlt size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Leaderboard Section */}
      <div className="mb-4">
        <h3 className="text-[#152349] font-black text-[19px] sm:text-[20px] text-center my-3.5">
          {t("Leaderboard")}
        </h3>

        <div className="bg-gradient-to-b from-[#2196f3] via-[#4f5bd5] to-[#833ab4] rounded-[16px] p-4 text-white mx-3 sm:mx-3.5 shadow-md">
          <h4 className="text-white font-bold text-base sm:text-[17px] text-center mb-3.5">
            {t("Who received the rewards")}
          </h4>

          <div className="space-y-2">
            {/* Winner 1 */}
            <div className="bg-white/95 rounded-full px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-2xs">
              <span className="text-[#475569] font-bold">an*******a</span>
              <span className="text-[#94a3b8] text-[11px] font-medium">{t("Received")}</span>
              <span className="text-[#0f1f4f] font-black">1000 Points</span>
            </div>

            {/* Winner 2 */}
            <div className="bg-white/95 rounded-full px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-2xs">
              <span className="text-[#475569] font-bold">wl*****e</span>
              <span className="text-[#94a3b8] text-[11px] font-medium">{t("Received")}</span>
              <span className="text-[#0f1f4f] font-black">Rs 300.00</span>
            </div>

            {/* Winner 3 */}
            <div className="bg-white/95 rounded-full px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-2xs">
              <span className="text-[#475569] font-bold">wl*****e</span>
              <span className="text-[#94a3b8] text-[11px] font-medium">{t("Received")}</span>
              <span className="text-[#0f1f4f] font-black">1000 Points</span>
            </div>

            {/* Winner 4 */}
            <div className="bg-white/95 rounded-full px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-2xs">
              <span className="text-[#475569] font-bold">sh******9</span>
              <span className="text-[#94a3b8] text-[11px] font-medium">{t("Received")}</span>
              <span className="text-[#0f1f4f] font-black">Rs 300.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Income Calculator Section */}
      <div className="bg-gradient-to-r from-[#eb4d7a] via-[#8c43d8] to-[#254fc7] rounded-[16px] p-4 sm:p-5 text-white mx-3 sm:mx-3.5 my-3 shadow-md relative overflow-hidden">
        {/* Top: Envelope + Title */}
        <div className="flex items-center gap-3">
          <div className="w-[64px] h-[64px] shrink-0 flex items-center justify-center">
            <img
              src="/npr/invite/calc_envelope.png"
              alt="Income calculator"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
          <h3 className="text-2xl sm:text-[28px] font-black tracking-tight leading-none text-white drop-shadow-xs">
            {t("Income calculator")}
          </h3>
        </div>

        {/* Center: Dynamic Amount */}
        <div className="text-center my-3">
          <span className="text-[#f6b74e] font-black text-3xl sm:text-4xl tracking-tight leading-none">
            Rs {expectedRevenue}
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-center text-blue-100 text-[12px] font-medium mb-3">
          Invite <span className="text-[#f6b74e] font-bold">{sliderUsers}</span> {t("active users, expected revenue")}
        </p>

        {/* Interactive Slider */}
        <div className="px-2 pt-1">
          <input
            type="range"
            min="1"
            max="100"
            value={sliderUsers}
            onChange={(e) => setSliderUsers(Number(e.target.value))}
            className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-[#38ef7d] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Floating Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default InvitePage;

