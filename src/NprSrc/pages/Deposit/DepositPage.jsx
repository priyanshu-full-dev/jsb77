import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaInfoCircle, FaCheck, FaCopy, FaTimes } from "react-icons/fa";

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

  const [selectedMethod, setSelectedMethod] = useState("fonepay");
  const [selectedAmount, setSelectedAmount] = useState(3000);
  const [customAmount, setCustomAmount] = useState("3,000");
  const [promoApplied, setPromoApplied] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  // Find bonus corresponding to currently selected or custom amount
  const matchedPreset = PRESET_AMOUNTS.find(
    (p) => p.amount === Number(String(customAmount).replace(/,/g, ""))
  );
  const currentAmountNum = Number(String(customAmount).replace(/,/g, "")) || 3000;
  const currentBonusNum = matchedPreset
    ? matchedPreset.bonus
    : Math.floor(currentAmountNum * 0.15);

  const handleSelectAmount = (preset) => {
    setSelectedAmount(preset.amount);
    setCustomAmount(preset.amount.toLocaleString());
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
    if (!currentAmountNum || currentAmountNum < 1000) {
      showToast("Minimum deposit amount is Rs. 1,000");
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
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-black/85 text-white text-[12.5px] font-medium px-4 py-2 rounded-full shadow-lg pointer-events-none animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* 1. Dedicated Gradient Royal Blue Header */}
      <header
        className="h-12 px-3 flex items-center justify-between sticky top-0 z-40 shadow-xs"
        style={{
          background: "linear-gradient(180deg, #005cf3 0%, #0045b8 50%, #042562 100%)",
        }}
      >
        {/* Exact Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 text-white hover:opacity-80 active:scale-95 transition cursor-pointer flex items-center justify-center"
          aria-label="Back"
        >
          <img
            src="/npr/deposit/deposit_back_exact.png"
            alt="Back"
            className="h-[20px] w-auto block pointer-events-none"
            draggable={false}
          />
        </button>

        {/* Title */}
        <h1 className="text-white text-[17px] font-normal tracking-wide">
          Deposit
        </h1>

        {/* Exact Deposit Record Icon (Clipboard with circular upward arrow) */}
        <button
          type="button"
          onClick={() => showToast("Viewing Deposit History...")}
          className="p-1.5 text-white hover:opacity-80 active:scale-95 transition cursor-pointer flex items-center justify-center"
          title="Deposit Records"
          aria-label="Deposit Records"
        >
          <img
            src="/npr/deposit/deposit_record_exact.png"
            alt="Deposit Records"
            className="h-[26px] w-auto block pointer-events-none"
            draggable={false}
          />
        </button>
      </header>

      {/* Main Form Body */}
      <div className="px-4 pt-3.5">
        {/* Section 1: Deposit Method */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block" />
          <h2 className="text-[#1f2937] font-bold text-[14.5px]">
            Deposit Method
          </h2>
        </div>

        {/* Payment Methods 3-Card Row */}
        <div className="grid grid-cols-3 gap-2.5">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`h-[110px] sm:h-[115px] rounded-[10px] flex flex-col items-center justify-between py-3 px-1.5 relative transition bg-white cursor-pointer ${
                  isSelected
                    ? "border-[1.5px] border-[#eb2828]"
                    : "border border-[#e2e4e8] hover:border-gray-300"
                }`}
              >
                {/* Method Logo & Content */}
                {method.id === "fonepay" ? (
                  <div className="flex-1 flex flex-col items-center justify-between w-full py-1">
                    <img
                      src={method.logo}
                      alt="FonePay"
                      className="h-[21px] w-auto object-contain pointer-events-none mt-1"
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
                      className="w-[38px] h-[38px] object-contain pointer-events-none mb-1.5"
                      draggable={false}
                    />
                    <span className="text-[#1f2937] font-bold text-[13.5px] leading-tight">
                      {method.name}
                    </span>
                    <span className="text-[#eb2828] font-bold text-[12px] leading-tight mt-0.5">
                      {method.badgeText}
                    </span>
                  </div>
                )}

                {/* Selected Red Corner Triangle with Checkmark */}
                {isSelected && (
                  <img
                    src="/npr/deposit/card_corner_selected_clean.png"
                    alt=""
                    className="absolute bottom-0 right-0 w-[22px] h-[24px] pointer-events-none"
                    draggable={false}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Method Title */}
        <div className="text-[#1f2937] font-bold text-[15.5px] mt-4 mb-2">
          {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name}
        </div>

        {/* Section 2: Deposit Amounts */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#b56f86] inline-block" />
          <h2 className="text-[#1f2937] font-bold text-[15px]">
            Deposit Amounts
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
                className={`h-[41px] rounded-[10px] relative flex items-center justify-center transition cursor-pointer bg-white ${
                  isSelected
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
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-2.5">
          {PRESET_AMOUNTS.slice(5).map((item) => {
            const isSelected = selectedAmount === item.amount;
            return (
              <button
                key={item.amount}
                type="button"
                onClick={() => handleSelectAmount(item)}
                className={`h-[41px] rounded-[10px] relative flex items-center justify-center transition cursor-pointer bg-white ${
                  isSelected
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
        <div className="border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2.5 mt-3.5 bg-white">
          <span className="text-gray-900 font-bold text-[15px] select-none">
            Rs
          </span>
          <input
            type="text"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="1,000 - 200,000"
            className="flex-1 text-[15px] font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Warning / Deposit Info */}
        <p className="text-[#eb2828] text-[12.5px] leading-snug mt-2.5">
          <span className="font-semibold">Deposit Info:</span> कृपया हाम्रो नम्बर
          निक्षेपको रूपमा बचत नगर्नुहोस्। जम्मा गर्नु अघि सधैं वेबसाइट जाँच
          गर्नुहोस्
        </p>
      </div>

      {/* Light Grey Section Divider Band */}
      <div className="h-2 bg-[#f4f4f4] my-3.5 w-full" />

      {/* Section 3: Promotions */}
      <div className="px-4">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="w-2 h-2 rounded-full bg-[#ec4899] inline-block" />
          <h2 className="text-[#1f2937] font-bold text-[14.5px]">
            Promotions
          </h2>
        </div>

        {/* Promo Ticket Row */}
        <div className="flex items-center gap-2.5">
          {/* Custom Radio Button */}
          <button
            type="button"
            onClick={() => setPromoApplied(!promoApplied)}
            className="p-1 focus:outline-none cursor-pointer shrink-0"
            aria-label="Toggle Promotion"
          >
            <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#eb2828] flex items-center justify-center p-[2px]">
              {promoApplied && (
                <div className="w-[9px] h-[9px] rounded-full bg-[#eb2828]" />
              )}
            </div>
          </button>

          {/* Ticket Container */}
          <div
            className={`flex-1 h-[78px] rounded-xl flex items-center overflow-hidden relative shadow-xs transition ${
              promoApplied ? "opacity-100" : "opacity-50 grayscale"
            }`}
            style={{
              background:
                "linear-gradient(90deg, #ff7e3f 0%, #ff5277 55%, #ff3863 100%)",
            }}
          >
            {/* Top-Left Diagonal "PROMOTION" Ribbon */}
            <div
              className="absolute top-0 left-0 bg-[#ffa726] text-white text-[8px] font-extrabold px-2 py-[1px] rounded-br-md uppercase tracking-wider shadow-2xs pointer-events-none"
            >
              PROMOTION
            </div>

            {/* Left Part: Deposit + Amount */}
            <div className="w-[40%] pl-3 pt-2 flex flex-col justify-center">
              <span className="text-white/90 text-[11px] leading-tight font-medium">
                Deposit
              </span>
              <span className="text-white font-extrabold text-[13.5px] sm:text-[14.5px] leading-tight tracking-tight mt-0.5">
                Rs {currentAmountNum.toLocaleString()}.00
              </span>
            </div>

            {/* Vertical White Dashed/Line Divider */}
            <div className="w-[1px] h-11 bg-white/30 my-auto" />

            {/* Middle Part: Money Bag + Bonus + Turnover */}
            <div className="flex-1 pl-2.5 flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                {/* 3D Money Bag */}
                <img
                  src="/npr/deposit/money_bag.png"
                  alt="Bonus"
                  className="w-5 h-5 object-contain shrink-0"
                />
                <span className="text-white font-black text-[17px] leading-none tracking-tight">
                  {currentBonusNum.toFixed(2)}
                </span>
                <FaInfoCircle size={11} className="text-white/80 shrink-0 ml-0.5" />
              </div>
              <div className="flex items-center gap-1 text-white/90 text-[10px] font-medium mt-1 leading-none">
                <span>Turnover</span>
                <span>5times</span>
              </div>
            </div>

            {/* Right Ticket Stub with Circular Notches & GO Button */}
            <div className="h-full w-[70px] bg-white flex items-center justify-center relative shrink-0">
              {/* Top Notch */}
              <div className="absolute -top-2 left-0 w-3.5 h-3.5 rounded-full bg-[#f4f4f4] -translate-x-1/2 pointer-events-none" />
              {/* Bottom Notch */}
              <div className="absolute -bottom-2 left-0 w-3.5 h-3.5 rounded-full bg-[#f4f4f4] -translate-x-1/2 pointer-events-none" />

              {/* Circular GO Button */}
              <button
                type="button"
                onClick={() => showToast("Promotion applied to current deposit!")}
                className="w-10 h-10 rounded-full text-white font-black text-[12.5px] flex items-center justify-center shadow-sm active:scale-95 transition cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #ff7e3f 0%, #ff5277 100%)",
                }}
              >
                GO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white">
        <button
          type="button"
          onClick={handleNext}
          className="w-full h-[50px] bg-[#e62121] hover:bg-[#d41818] active:bg-[#c01010] text-white font-bold text-[16px] tracking-wide flex items-center justify-center transition cursor-pointer select-none"
        >
          Next
        </button>
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
                <p className="text-[12px] text-gray-500">Deposit Amount</p>
                <p className="text-[18px] font-extrabold text-[#eb2828]">
                  Rs {currentAmountNum.toLocaleString()}
                </p>
              </div>
              {promoApplied && (
                <div className="text-right">
                  <p className="text-[12px] text-gray-500">Instant Bonus</p>
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
                <p className="text-[11px] text-gray-500">Merchant Account Name</p>
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
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Reference ID Input */}
            <div className="mb-4">
              <label className="block text-[12.5px] font-semibold text-gray-700 mb-1">
                Transaction / Reference ID (आवश्यक)
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
              {isSubmitting ? "Processing Deposit..." : "Submit Deposit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositPage;

