import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaInfoCircle, FaCheck, FaCopy, FaTimes } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";

// Deposit methods configuration
const PAYMENT_METHODS = [
  {
    id: "fonepay",
    name: "FonePay",
    badgeText: "स्वचालित भुक्तानी",
    isNepaliBadge: true,
    bonusRate: null,
    logo: "/npr/deposit/fonepay_logo_hd.png",
    textImg: "/npr/deposit/fonepay_text_hd.png",
  },
  {
    id: "usdt",
    name: "USDT",
    badgeText: "+2%",
    isNepaliBadge: false,
    bonusRate: "+2%",
    logo: "/npr/deposit/usdt_logo_hd.png",
  },
  {
    id: "usdc",
    name: "USDC",
    badgeText: "+2%",
    isNepaliBadge: false,
    bonusRate: "+2%",
    logo: "/npr/deposit/usdc_logo_hd.png",
  },
];

// Crypto channels configuration
const CRYPTO_CHANNELS = {
  usdt: [
    { id: "trc20", name: "USDT-TRC20", bonus: "+2%" },
    { id: "bep20", name: "USDT-BEP20", bonus: "+2%" },
  ],
  usdc: [
    { id: "trc20", name: "USDC-TRC20", bonus: "+2%" },
    { id: "bep20", name: "USDC-BEP20", bonus: "+2%" },
  ],
};

// Preset deposit amounts with bonus and turnover requirement
const PRESET_AMOUNTS = [
  { amount: 3000, bonus: 450, turnover: "5times" },
  { amount: 5000, bonus: 500, turnover: "5times" },
  { amount: 15000, bonus: 1350, turnover: "5times" },
  { amount: 30000, bonus: 2700, turnover: "5times" },
  { amount: 60000, bonus: 5400, turnover: "5times" },
  { amount: 80000, bonus: 7200, turnover: "5times" },
  { amount: 100000, bonus: 9000, turnover: "5times" },
];

const DepositPage = () => {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const { user } = context;
  const { t } = useLanguage();

  const [selectedMethod, setSelectedMethod] = useState("fonepay");
  const [selectedChannel, setSelectedChannel] = useState("trc20");
  const [selectedAmount, setSelectedAmount] = useState(3000);
  const [customAmount, setCustomAmount] = useState("");
  const [promoApplied, setPromoApplied] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      // Hide if user is within 45px of the bottom
      setShowScrollArrow(scrollBottom < totalHeight - 45);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollDown = () => {
    window.scrollBy({ top: 280, behavior: "smooth" });
  };

  const isCrypto = selectedMethod === "usdt" || selectedMethod === "usdc";

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  // Find bonus corresponding to currently selected or custom amount
  const currentAmountNum = customAmount
    ? Number(String(customAmount).replace(/,/g, "")) || 0
    : selectedAmount || 3000;
  const matchedPreset = PRESET_AMOUNTS.find(
    (p) => p.amount === currentAmountNum
  );
  const currentBonusNum = matchedPreset
    ? matchedPreset.bonus
    : Math.floor(currentAmountNum * 0.15);

  const handleSelectAmount = (preset) => {
    setSelectedAmount(preset.amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (!rawVal) {
      setCustomAmount("");
      setSelectedAmount(null);
      return;
    }
    const num = Number(rawVal);
    setCustomAmount(num.toLocaleString());
    const match = PRESET_AMOUNTS.find((p) => p.amount === num);
    setSelectedAmount(match ? match.amount : null);
  };

  const handleNext = () => {
    const minLimit = isCrypto ? 8250 : 1000;
    if (!currentAmountNum || currentAmountNum < minLimit) {
      showToast(`Minimum deposit amount is Rs. ${minLimit.toLocaleString()}`);
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (!referenceId.trim()) {
      showToast("Please enter the FonePay Reference / Transaction ID");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowPaymentModal(false);
      showToast("Deposit submitted! Balance will update shortly.");
      // update local user balance
      try {
        const stored = localStorage.getItem("npr_user");
        if (stored) {
          const u = JSON.parse(stored);
          const currentBal = parseFloat(u.balance || "0.00");
          const newBal = (currentBal + currentAmountNum + (promoApplied ? currentBonusNum : 0)).toFixed(2);
          u.balance = newBal;
          localStorage.setItem("npr_user", JSON.stringify(u));
        }
      } catch {
        // ignore
      }
      setTimeout(() => navigate("/"), 1200);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-20 select-none">
      <style>{`
        @keyframes depositArrowBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-black/85 text-white text-[12.5px] font-medium px-4 py-2 rounded-full shadow-lg pointer-events-none animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* 1. Dedicated Gradient Royal Blue Header */}
      <header
        className="h-[55px] px-7 pl-10 flex items-center justify-between sticky top-0 z-40 shadow-xs"
        style={{
          background: "linear-gradient(180deg, #005cf3 0%, #0045b8 50%, #042562 100%)",
        }}
      >
        {/* Exact Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 text-white hover:opacity-80 active:scale-95 transition cursor-pointer flex items-center justify-center -ml-1"
          aria-label="Back"
        >
          <svg
            viewBox="0 0 15 25"
            className="w-[13px] h-[22px] text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="12.5,2 3,12.5 12.5,23" />
          </svg>
        </button>

        {/* Title */}
        <h1 className="text-white text-[17px] font-normal tracking-normal">
          {t("Deposit")}
        </h1>

        {/* Exact Deposit Record Icon (Clipboard with circular upward arrow) */}
        <button
          type="button"
          onClick={() => showToast("Viewing Deposit History...")}
          className="p-1.5 text-white hover:opacity-80 active:scale-95 transition cursor-pointer flex items-center justify-center -mr-1"
          title="Deposit Records"
          aria-label="Deposit Records"
        >
          <img
            src="/npr/deposit/deposit_record_exact.png"
            alt="Deposit Records"
            className="h-[27px] w-auto block pointer-events-none"
            draggable={false}
          />
        </button>
      </header>

      {/* Main Form Body */}
      <div className="px-3 pt-2">
        {/* Section 1: Deposit Method */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block" />
          <h2 className="text-[#1f2937] font-bold text-[13.5px]">
            {t("Deposit Method")}
          </h2>
        </div>

        {/* Payment Methods Row */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  setSelectedMethod(method.id);
                  setSelectedChannel("trc20");
                }}
                className={`w-[89px] h-[95px] rounded-[5px] shrink-0 flex flex-col items-center justify-between py-1.5 px-1 relative transition bg-white cursor-pointer ${isSelected
                  ? "border-[1.5px] border-[#eb2828]"
                  : "border border-[#e2e4e8] hover:border-gray-300"
                  }`}
              >
                {/* Method Logo & Content */}
                {method.id === "fonepay" ? (
                  <div className="flex-1 flex flex-col items-center justify-evenly w-full py-0.5">
                    <img
                      src={method.logo}
                      alt="FonePay"
                      className="h-[18px] w-auto object-contain pointer-events-none mt-1"
                      draggable={false}
                    />
                    <img
                      src={method.textImg}
                      alt="स्वचालित भुक्तानी"
                      className="h-[18px] w-auto object-contain pointer-events-none mb-0.5"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center w-full">
                    <img
                      src={method.logo}
                      alt={method.name}
                      className="w-[30px] h-[30px] object-contain pointer-events-none mb-0.5"
                      draggable={false}
                    />
                    <span className="text-[#1f2937] font-bold text-[12px] leading-tight">
                      {method.name}
                    </span>
                    <span className="text-[#eb2828] font-bold text-[11px] leading-tight">
                      {method.badgeText}
                    </span>
                  </div>
                )}

                {/* Selected Red Corner Triangle with Checkmark */}
                {isSelected && (
                  <img
                    src="/npr/deposit/card_corner_selected_clean.png"
                    alt=""
                    className="absolute bottom-0 right-0 w-[17px] h-[18px] pointer-events-none rounded-br-[9px]"
                    draggable={false}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Payment Channel Section (USDT / USDC) */}
        {isCrypto && (
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#6bbcb3] inline-block" />
              <h2 className="text-[#1f2937] font-bold text-[14.5px]">
                {t("Payment Channel")}
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              {(CRYPTO_CHANNELS[selectedMethod] || []).map((ch) => {
                const isChSelected = selectedChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`w-[120px] sm:w-[142px] h-[55px] shrink-0 rounded-[5px] bg-white relative flex items-center justify-center transition cursor-pointer select-none overflow-hidden ${isChSelected
                      ? "border-[1.5px] border-[#eb2828]"
                      : "border border-[#e2e4ea] hover:border-gray-300"
                      }`}
                  >
                    {/* Top-Left Thumbs-up Ribbon Badge */}
                    <div className="absolute top-[-2px] left-0 pointer-events-none">
                      <img
                        src="/npr/deposit/channel_thumb_badge.png"
                        alt=""
                        className="w-[16px] h-[20px] object-contain rounded-tl-[7px]"
                        draggable={false}
                      />
                    </div>

                    {/* Top-Right Red +2% Badge */}
                    <div className="absolute top-0 right-0 bg-[#eb2828] text-white font-bold text-[9px] px-1.5 py-[1px] rounded-bl-[6px] pointer-events-none">
                      {ch.bonus}
                    </div>

                    {/* Channel Name */}
                    <span
                      className={`text-[13px] font-bold ${isChSelected ? "text-[#eb2828]" : "text-[#1f2937]"
                        }`}
                    >
                      {ch.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}


        {/* Selected Method Title */}
        <div className="text-[#1f2937]  text-[15px] mt-4 mb-2">
          {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name}
        </div>

        {/* Section 2: Deposit Amounts */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b56f86] inline-block" />
          <h2 className="text-[#1f2937] font-bold text-[13px]">
            {t("Deposit Amounts")}
          </h2>
        </div>

        {/* Amounts Grid */}
        {/* Row 1: 5 Buttons */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {PRESET_AMOUNTS.slice(0, 5).map((item) => {
            const isSelected = selectedAmount === item.amount;
            return (
              <button
                key={item.amount}
                type="button"
                onClick={() => handleSelectAmount(item)}
                className={`h-[41px] rounded-[10px] relative flex items-center justify-center transition cursor-pointer bg-white ${isSelected
                  ? "border-[1.5px] border-[#eb2828] text-[#eb2828]"
                  : "border border-[#fdd7d6] text-[#555555]"
                  }`}
              >
                {/* Top-Right Integrated Ribbon */}
                <div className="absolute -top-[4.5px] -right-[0.5px] z-10 flex items-center pointer-events-none select-none">
                  {/* Glowing Yellow Lightning Bolt */}
                  <svg
                    viewBox="0 0 13 24"
                    className="w-[8px] h-[14.5px] -mr-[3px] z-20 flex-shrink-0"
                    style={{ filter: "drop-shadow(0 0.5px 1px rgba(0,0,0,0.2))" }}
                  >
                    <defs>
                      <linearGradient id={`boltGrad-${item.amount}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fee277" />
                        <stop offset="100%" stopColor="#fdc456" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M4 1L12 1L11 3L9 5L8 7L7 10L11 11L11 12L10 13L8 16L6 19L5 21L4 23L4 16L0 15L0 10L1 9L2 5Z"
                      fill={`url(#boltGrad-${item.amount})`}
                    />
                  </svg>

                  {/* Red Ribbon Pill with Flush Right and Rounded Top-Right/Bottom-Left */}
                  <div
                    className="h-[13.5px] pl-[5px] pr-[5px] flex items-center justify-center text-white text-[9px] font-bold leading-none tracking-tight rounded-tr-[9px] rounded-bl-[7px]"
                    style={{
                      background: "linear-gradient(90deg, #ff5768 0%, #eb2828 100%)",
                    }}
                  >
                    + {item.bonus.toLocaleString()}
                  </div>
                </div>

                {/* Amount Number */}
                <span className="text-[14.5px] sm:text-[15.5px] font-bold tracking-tight">
                  {item.amount.toLocaleString()}
                </span>

                {/* Exact Selected Red Corner Triangle with Checkmark */}
                {isSelected && (
                  <img
                    src="/npr/deposit/card_corner_selected_clean.png"
                    alt=""
                    className="absolute bottom-0 right-0 w-[17px] h-[18px] pointer-events-none"
                    draggable={false}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2: 2 Buttons */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-1.5">
          {PRESET_AMOUNTS.slice(5).map((item) => {
            const isSelected = selectedAmount === item.amount;
            return (
              <button
                key={item.amount}
                type="button"
                onClick={() => handleSelectAmount(item)}
                className={`h-[41px] rounded-[10px] relative flex items-center justify-center transition cursor-pointer bg-white ${isSelected
                  ? "border-[1.5px] border-[#eb2828] text-[#eb2828]"
                  : "border border-[#fdd7d6] text-[#555555]"
                  }`}
              >
                {/* Top-Right Integrated Ribbon */}
                <div className="absolute -top-[4.5px] -right-[0.5px] z-10 flex items-center pointer-events-none select-none">
                  {/* Glowing Yellow Lightning Bolt */}
                  <svg
                    viewBox="0 0 13 24"
                    className="w-[8px] h-[14.5px] -mr-[3px] z-20 flex-shrink-0"
                    style={{ filter: "drop-shadow(0 0.5px 1px rgba(0,0,0,0.2))" }}
                  >
                    <defs>
                      <linearGradient id={`boltGrad-${item.amount}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fee277" />
                        <stop offset="100%" stopColor="#fdc456" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M4 1L12 1L11 3L9 5L8 7L7 10L11 11L11 12L10 13L8 16L6 19L5 21L4 23L4 16L0 15L0 10L1 9L2 5Z"
                      fill={`url(#boltGrad-${item.amount})`}
                    />
                  </svg>

                  {/* Red Ribbon Pill with Flush Right and Rounded Top-Right/Bottom-Left */}
                  <div
                    className="h-[13.5px] pl-[5px] pr-[5px] flex items-center justify-center text-white text-[9px] font-bold leading-none tracking-tight rounded-tr-[9px] rounded-bl-[7px]"
                    style={{
                      background: "linear-gradient(90deg, #ff5768 0%, #eb2828 100%)",
                    }}
                  >
                    + {item.bonus.toLocaleString()}
                  </div>
                </div>

                {/* Amount Number */}
                <span className="text-[14.5px] sm:text-[15.5px] font-bold tracking-tight">
                  {item.amount.toLocaleString()}
                </span>

                {/* Exact Selected Red Corner Triangle with Checkmark */}
                {isSelected && (
                  <img
                    src="/npr/deposit/card_corner_selected_clean.png"
                    alt=""
                    className="absolute bottom-0 right-0 w-[17px] h-[18px] pointer-events-none"
                    draggable={false}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Amount Input Field */}
        <div className="border border-[#e2e4e8] rounded-[8px] px-3.5 h-[44px] flex items-center gap-2.5 mt-3 bg-white">
          <span className="text-[#1f2937] font-bold text-[15px] select-none">
            Rs
          </span>
          <input
            type="text"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder={isCrypto ? "8,250 - 1,000,000" : "1,000 - 200,000"}
            className="flex-1 text-[15px] font-normal text-[#1f2937] placeholder:text-[#a0a5ad] focus:outline-none"
          />
        </div>

        {/* Crypto Exchange Rate Display (USDT / USDC) */}
        {isCrypto && (
          <div className="flex flex-col items-center justify-center mt-4 mb-2 select-none">
            <div className="text-[#eb2828] text-[15.5px] font-normal leading-tight">
              {customAmount
                ? `${(Number(String(customAmount).replace(/,/g, "")) / 165).toFixed(2)} ${selectedMethod.toUpperCase()}`
                : `- ${selectedMethod.toUpperCase()}`}
            </div>
            <div className="text-[#eb2828] text-[16px] sm:text-[17px] font-normal mt-1 leading-tight">
              Rate: 1 {selectedMethod.toUpperCase()} = Rs 165.00
            </div>
          </div>
        )}

        {/* Warning / Deposit Info */}
        <p className="text-[#ff0000] text-[15px] sm:text-[13.5px] font-normal leading-[1.3] mt-3.5 mb-5 tracking-normal">
          {t(
            "Deposit Info: Please do not save our number for deposits. Always check the website before making a deposit.",
            "निक्षेप जानकारी: कृपया हाम्रो नम्बर निक्षेपको रूपमा बचत नगर्नुहोस्। जम्मा गर्नु अघि सधैं वेबसाइट जाँच गर्नुहोस्"
          )}
        </p>
      </div>

      {/* Light Grey Section Divider Band */}
      <div className="h-[9px] bg-[#f2f2f2] w-full" />

      {/* Section 3: Promotions */}
      <div className="px-4 mb-16 mt-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899] inline-block" />
          <h2 className="text-[#1f2937] font-bold text-[15px]">
            {t("Promotions")}
          </h2>
        </div>

        {/* Promo Ticket Row */}
        <div className="flex items-center gap-2 mt-1">
          {/* Custom Radio Button */}
          <button
            type="button"
            onClick={() => setPromoApplied(!promoApplied)}
            className="p-1 focus:outline-none cursor-pointer shrink-0"
            aria-label="Toggle Promotion"
          >
            <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#eb2828] flex items-center justify-center p-[2px]">
              {promoApplied && (
                <div className="w-[8px] h-[8px] rounded-full bg-[#eb2828]" />
              )}
            </div>
          </button>

          {/* Pure CSS Ticket Sleeve Component with Exact Clip-Path */}
          <div
            className={`flex-1 h-[76px] relative flex select-none cursor-pointer transition ${promoApplied ? "opacity-100" : "opacity-45 grayscale"
              }`}
            onClick={() => setPromoApplied(!promoApplied)}
          >
            {/* Layer 1: Orange/Coral Back Sleeve with Rounded Right End */}
            <div
              className="absolute left-0 top-0 bottom-0 right-4 rounded-l-[14px] rounded-r-[24px] overflow-hidden"
              style={{
                background:
                  "linear-gradient(90deg, #ff8a3d 0%, #ff5e3a 50%, #ff3d60 100%)",
              }}
            />

            {/* Layer 2: White Ticket Stub (Extending Out to the Right) */}
            <div className="absolute right-0 top-2 bottom-2 w-[80px] sm:w-[86px] rounded-[8px] bg-[#f8f9fe] border border-[#e2e4ea] flex items-center justify-center z-10 shadow-2xs">
              {/* Circular Orange "GO" Button */}
              <div
                className="w-10 h-10 rounded-full ml-4 text-white font-black text-[13px] flex items-center justify-center shadow-xs active:scale-95 transition cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #ff9436 0%, #ff5e3a 100%)",
                }}
              >
                GO
              </div>

              {/* Semicircular Cutout Notch on Right Edge */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-[12px] h-[8px] rounded-full bg-white border-l-[1px] border-[#e2e4ea]" />
            </div>

            {/* Layer 3: Front Gradient Sleeve with Inward `<` Chevron Notch */}
            <div
              className="relative z-20 h-full flex items-center pl-3.5 pr-5 w-[calc(100%-48px)] rounded-l-[14px] overflow-hidden"
              style={{
                background:
                  "linear-gradient(90deg, #ff8533 0%, #ff5277 50%, #ff2b66 100%)",
                clipPath:
                  "polygon(0 0, 100% 0, calc(100% - 12px) 50%, 100% 100%, 0 100%)",
              }}
            >
              {/* Top-Left 45° Folded Corner Ribbon */}
              <div className="absolute top-0 left-0 w-20 h-30 overflow-hidden pointer-events-none z-30">
                <div className="absolute top-[14px] -left-[28px] w-[110px] py-[1.5px] bg-gradient-to-r from-[#ffa726] to-[#ff9800] text-white text-[8px] font-black tracking-widest text-center -rotate-45 shadow-xs uppercase">
                  PROMOTION
                </div>
              </div>

              {/* Left Column: Deposit Amount */}
              <div className="flex flex-col justify-center shrink-0 pr-2 pl-2">
                <span className="text-white/90 text-[11px] leading-tight font-medium">
                  Deposit
                </span>
                <span className="text-white font-extrabold text-[14px] sm:text-[15.5px] leading-tight tracking-tight mt-0.5 whitespace-nowrap">
                  Rs {currentAmountNum.toLocaleString()}.00
                </span>
              </div>

              {/* Vertical White Divider */}
              <div className="w-[1px] h-9 bg-white/40 my-auto shrink-0 mr-2.5" />

              {/* Middle Column: Bonus & Turnover */}
              <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                <div className="flex items-center gap-1">
                  <img
                    src="/npr/deposit/money_bag.png"
                    alt="Bonus"
                    className="w-5 h-5 object-contain shrink-0"
                    draggable={false}
                  />
                  <span className="text-white font-black text-[17px] sm:text-[18px] leading-none tracking-tight">
                    {currentBonusNum.toFixed(2)}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5 text-white/80 shrink-0 ml-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-1 text-white/90 text-[10px] sm:text-[10.5px] font-medium mt-1 leading-none">
                  <span>Turnover</span>
                  <span>5times</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Light Grey Section Divider Band */}
      <div className="h-[9px] bg-[#f2f2f2] w-full mt-4" />

      {/* Section 4: Payment Details */}
      <div className="px-4 mt-3 pb-24">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] inline-block" />
          <h2 className="text-[#1f2937] font-bold text-[15px]">
            {t("Payment Details")}
          </h2>
        </div>

        {/* Payment Details 2-Row Card */}
        <div className="border border-[#e5e7eb] rounded-[14px] overflow-hidden shadow-2xs">
          {/* Row 1: Deposit Amounts */}
          <div className="bg-white px-4 py-3.5 flex items-center justify-between border-b border-[#f0f0f0]">
            <span className="text-[#6b7280] font-semibold text-[13.5px]">
              {t("Deposit Amounts")}
            </span>
            <span className="text-[#4b5563] font-bold text-[14px]">
              Rs {currentAmountNum.toLocaleString()}.00
            </span>
          </div>

          {/* Row 2: Actual Payment Amount */}
          <div className="bg-[#fff7f7] px-4 py-3.5 flex items-center justify-between">
            <span className="text-[#6b7280] font-semibold text-[13.5px]">
              {t("Actual Payment Amount")}
            </span>
            <span className="text-[#ff1a3c] font-bold text-[14px]">
              Rs {currentAmountNum.toLocaleString()}.00
            </span>
          </div>
        </div>
      </div>

      {/* 4. Fixed Bottom Action Bar with Floating Blinking Scroll Arrow */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 pointer-events-none">
        {/* Floating Blinking Scroll Down Arrow */}
        <div className="flex justify-center pb-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              window.scrollBy({ top: 320, behavior: "smooth" });
            }}
            className="w-[24px] h-[24px] rounded-full bg-[#2a9ef9] flex items-center justify-center cursor-pointer transition active:scale-90"
            style={{
              animation: "depositArrowBlink 1.2s infinite ease-in-out",
            }}
            aria-label="Scroll Down"
          >
            <svg
              viewBox="0 0 10 6"
              className="w-[10px] h-[6px] text-white stroke-white stroke-[2.2] fill-none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1.5,1.5 5,5 8.5,1.5" />
            </svg>
          </button>
        </div>

        {/* Next Button */}
        <div className="bg-white pointer-events-auto">
          <button
            type="button"
            onClick={handleNext}
            className="w-full h-[50px] bg-[#e62121] hover:bg-[#d41818] active:bg-[#c01010] text-white font-bold text-[16px] tracking-wide flex items-center justify-center transition cursor-pointer select-none"
          >
            {t("Next")}
          </button>
        </div>
      </div>

      {/* 5. Payment Gateway Simulation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-t-[20px] p-5 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-slideUp">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <FaTimes size={18} />
            </button>

            <h3 className="text-center font-bold text-gray-900 text-[17px] mb-3">
              FonePay Instant QR Deposit
            </h3>

            {/* Summary Banner */}
            <div className="bg-[#fff5f5] border border-red-100 rounded-xl p-3 mb-4 flex items-center justify-between">
              <div>
                <p className="text-[12px] text-gray-500">{t("Deposit Amount")}</p>
                <p className="text-[18px] font-extrabold text-[#eb2828]">
                  Rs {currentAmountNum.toLocaleString()}
                </p>
              </div>
              {promoApplied && (
                <div className="text-right">
                  <p className="text-[12px] text-gray-500">{t("Instant Bonus")}</p>
                  <p className="text-[15px] font-bold text-emerald-600">
                    + Rs {currentBonusNum.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* QR Code Demo */}
            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
              <div className="w-44 h-44 bg-white p-2 rounded-lg shadow-xs flex items-center justify-center border border-gray-200">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=FonePay:JSB77:9800000000"
                  alt="FonePay QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[12px] text-gray-600 mt-2 text-center">
                Scan with eSewa / Khalti / Mobile Banking App
              </p>
            </div>

            {/* FonePay Merchant ID */}
            <div className="bg-gray-100 rounded-lg p-2.5 flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] text-gray-500">{t("Merchant Account Name")}</p>
                <p className="text-[13px] font-bold text-gray-800">
                  JSB77 Official Agent
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText("9800000000");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-[#0045b8] font-bold text-[12px] flex items-center gap-1 hover:underline cursor-pointer"
              >
                {copied ? <FaCheck size={12} className="text-green-600" /> : <FaCopy size={12} />}
                <span>{copied ? t("Copied") : t("Copy")}</span>
              </button>
            </div>

            {/* Reference ID Input */}
            <div className="mb-4">
              <label className="block text-[12.5px] font-semibold text-gray-700 mb-1">
                {t("Transaction / Reference ID (आवश्यक)")}
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="Enter 10-12 digit FonePay Txn ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[14px] font-medium text-gray-800 focus:outline-none focus:border-[#0045b8]"
              />
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmPayment}
              className="w-full h-[46px] rounded-lg bg-[#e62121] hover:bg-[#d41818] text-white font-bold text-[15px] flex items-center justify-center transition cursor-pointer shadow-md"
            >
              {isSubmitting ? t("Processing Deposit...") : t("Submit Deposit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositPage;

