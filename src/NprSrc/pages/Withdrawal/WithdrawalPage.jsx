import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaSyncAlt,
  FaUniversity,
  FaCreditCard,
  FaCheckCircle,
} from "react-icons/fa";

const withdrawalTabs = [
  {
    id: "bank",
    label: "Bank Accounts",
    iconBg: "bg-[#0088ff]",
    type: "bank",
  },
  {
    id: "ewallet",
    label: "E wallet",
    iconBg: "bg-[#e91e63]",
    type: "ewallet",
  },
  {
    id: "crypto",
    label: "Crypto Wallet",
    iconBg: "bg-[#f59e0b]",
    type: "crypto",
  },
];

const popularNepalBanks = [
  "NIC Asia Bank",
  "Nabil Bank",
  "Global IME Bank",
  "Rastriya Banijya Bank",
  "Nepal Investment Mega Bank",
  "Standard Chartered Bank Nepal",
  "Himalayan Bank",
  "Sanima Bank",
  "Prabhu Bank",
  "Everest Bank",
];

const popularEwallets = ["eSewa", "Khalti", "IME Pay", "Prabhu Pay"];

const WithdrawalPage = () => {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const { user, onRefreshBalance } = context;
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("bank");
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Linked accounts state
  const [linkedBanks, setLinkedBanks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New account form
  const [newBankName, setNewBankName] = useState("NIC Asia Bank");
  const [newAccountName, setNewAccountName] = useState(user?.username || "prish07");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newBranch, setNewBranch] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshBalance) {
        await onRefreshBalance();
      }
      showToast(t("Balance refreshed!"));
    } catch {
      showToast(t("Balance refreshed!"));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newAccountNumber.trim()) {
      showToast("Please enter an account number");
      return;
    }
    const newAcc = {
      id: Date.now(),
      type: activeTab,
      bankName: activeTab === "bank" ? newBankName : activeTab === "ewallet" ? newBankName : "USDT TRC20",
      accountName: newAccountName,
      accountNumber: newAccountNumber,
      branch: newBranch || "Kathmandu",
    };
    setLinkedBanks([...linkedBanks, newAcc]);
    setShowAddModal(false);
    setNewAccountNumber("");
    setNewBranch("");
    showToast("Account successfully linked!");
  };

  const handleSubmitWithdrawal = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 5000) {
      showToast("Minimum withdrawal is Rs 5,000");
      return;
    }
    if (numAmount > 1000000) {
      showToast("Maximum withdrawal is Rs 1,000,000");
      return;
    }
    if (!password) {
      showToast("Please enter your transaction password");
      return;
    }
    if (linkedBanks.length === 0) {
      showToast("Please link a bank account or e-wallet first");
      setShowAddModal(true);
      return;
    }

    showToast(`Withdrawal request of Rs ${numAmount.toLocaleString()} submitted!`);
    setAmount("");
    setPassword("");
  };

  const isFormValid = parseFloat(amount) >= 5000 && parseFloat(amount) <= 1000000 && password.length >= 4;

  return (
    <div className="min-h-screen bg-white text-[#1e293b] pb-12 select-none">
      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-[#0047ba] text-white flex items-center justify-between px-4 h-12 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center -ml-1 text-white hover:opacity-80 active:scale-95 transition cursor-pointer"
          aria-label="Back"
        >
          <FaChevronLeft size={18} />
        </button>
        <h1 className="font-bold text-[17px] tracking-tight">{t("Withdrawal")}</h1>
        <button
          onClick={() => showToast("Opening withdrawal records...")}
          className="w-8 h-8 flex items-center justify-center text-white hover:opacity-80 active:scale-95 transition cursor-pointer"
          title="Withdrawal Records"
        >
          {/* Clipboard with down arrow icon */}
          <svg viewBox="0 0 24 24" className="w-[21px] h-[21px] fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M9 11h6" />
            <circle cx="12" cy="16" r="3.2" fill="#0047ba" stroke="white" strokeWidth="1.5" />
            <path d="M12 14.5v3M10.8 16.3l1.2 1.2 1.2-1.2" stroke="white" strokeWidth="1.5" />
          </svg>
        </button>
      </header>

      {/* 2. Withdrawal Method Tabs */}
      <div className="border-b border-gray-100 px-3 flex items-center justify-between overflow-x-auto npr-no-scrollbar">
        <div className="flex items-center gap-6">
          {withdrawalTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 flex items-center gap-2 relative transition cursor-pointer ${isActive ? "text-[#e53935]" : "text-[#475569] hover:text-[#1e293b]"
                  }`}
              >
                {/* Method Icon Circle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs ${tab.iconBg}`}
                >
                  {tab.id === "bank" ? (
                    <FaCreditCard size={13} />
                  ) : tab.id === "ewallet" ? (
                    <span className="font-bold text-[10px] tracking-tighter">ec</span>
                  ) : (
                    <span className="font-bold text-[11px]">₿</span>
                  )}
                </div>

                {/* Tab Label */}
                <span className={`text-[13px] leading-tight text-left ${isActive ? "font-bold" : "font-semibold"}`}>
                  {t(tab.label)}
                </span>

                {/* Active Red Bottom Underline Bar */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e53935] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Double Chevron */}
        <div className="text-[#0088ff] pl-2 font-bold flex items-center text-sm cursor-pointer">
          <FaChevronRight size={11} className="-mr-1.5" />
          <FaChevronRight size={11} />
        </div>
      </div>

      {/* 3. Bank Accounts / Cards Section */}
      <div className="p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#475569] font-bold text-[14px]">
            {activeTab === "bank"
              ? `My bank accounts(${linkedBanks.filter((b) => b.type === "bank").length}/3)`
              : activeTab === "ewallet"
                ? `My e-wallets(${linkedBanks.filter((b) => b.type === "ewallet").length}/3)`
                : `My crypto wallets(${linkedBanks.filter((b) => b.type === "crypto").length}/3)`}
          </span>
        </div>

        {/* Linked Cards Display or Empty State Illustration */}
        {linkedBanks.filter((b) => b.type === activeTab).length > 0 ? (
          <div className="space-y-2.5 my-3">
            {linkedBanks
              .filter((b) => b.type === activeTab)
              .map((acc) => (
                <div
                  key={acc.id}
                  className="bg-gradient-to-r from-[#1e3c72] to-[#2a5298] text-white rounded-[14px] p-4 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-sm">{acc.bankName}</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Verified</span>
                  </div>
                  <div className="text-lg font-mono tracking-widest my-1">
                    •••• •••• •••• {acc.accountNumber.slice(-4) || "0000"}
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/80 mt-2">
                    <span>{acc.accountName}</span>
                    <span>{acc.branch}</span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center my-2">
            <div className="w-[260px] h-[150px] flex items-center justify-center">
              <img
                src="/npr/withdrawal/bank_card_empty.png"
                alt="No bank account linked yet"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
            <p className="text-[#94a3b8] text-[13.5px] font-medium text-center mt-1">
              {t("No bank account linked yet")}
            </p>
          </div>
        )}

        {/* Floating Red Plus Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="absolute -bottom-5 right-4 w-11 h-11 rounded-full bg-[#ff0000] hover:bg-[#e60000] text-white flex items-center justify-center shadow-lg active:scale-90 transition z-10 cursor-pointer"
          title="Add Bank Account"
        >
          <FaPlus size={18} />
        </button>
      </div>

      <div className="border-b border-gray-100 my-2" />

      {/* 4. Withdrawal Information & Balances */}
      <div className="px-4 py-2 space-y-1 text-[12px] text-[#94a3b8]">
        <p>{t("Withdrawal time: 24 hours")}</p>
        <p>{t("Daily withdrawal 2 (Times), Remaining withdrawal 2 (Times)")}</p>
        <p className="text-[#0f172a] font-bold text-[13px] pt-0.5">
          {t("Main Wallet")} :Rs {user?.balance || "0.00"}
        </p>
        <p className="text-[#0f172a] font-bold text-[13px]">
          {t("Available Amount")} : Rs {user?.balance || "0.00"}
        </p>

        {/* Refresh Balance Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleRefreshBalance}
            className="bg-[#dbeafe] hover:bg-[#bfdbfe] text-[#1d4ed8] px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center ${isRefreshing ? "animate-spin" : ""}`}>
              <FaSyncAlt size={10} />
            </div>
            <span>{t("Refresh Balance")}</span>
          </button>
        </div>
      </div>

      {/* 5. Withdrawal Form */}
      <form onSubmit={handleSubmitWithdrawal} className="px-4 pt-3 relative">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[#1e293b] font-bold text-sm">
            {t("Withdrawal Amount:")}
          </h2>
          {amount && (
            <button
              type="button"
              onClick={() => setAmount("")}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={13} />
            </button>
          )}
        </div>

        {/* Amount Input */}
        <div className="relative">
          <div className="border border-gray-300 rounded-[10px] px-3.5 py-3 flex items-center bg-white focus-within:border-[#0047ba] transition">
            <span className="font-bold text-sm text-[#1e293b] w-20 shrink-0">
              {t("Amount")}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5,000 ~ 1,000,000"
              className="w-full text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-hidden"
            />
            {amount && (
              <button
                type="button"
                onClick={() => setAmount("")}
                className="w-5 h-5 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs shrink-0 hover:bg-gray-500"
              >
                <FaTimes size={10} />
              </button>
            )}
          </div>

          {/* Floating Lucky Spin Wheel Badge on the right */}
          <div
            onClick={() => showToast("Lucky Spin available with deposit!")}
            className="absolute -right-2 -top-2 w-[46px] h-[46px] cursor-pointer hover:scale-105 active:scale-95 transition z-10"
            title="Free Spin Wheel"
          >
            <img
              src="/npr/withdrawal/wheel_roulette.png"
              alt="Roulette Wheel"
              className="w-full h-full object-contain pointer-events-none drop-shadow-md"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="relative mt-3">
          <div className="border border-gray-300 rounded-[10px] px-3.5 py-3 flex items-center bg-white focus-within:border-[#0047ba] transition">
            <span className="font-bold text-sm text-[#1e293b] w-20 shrink-0">
              {t("Password")}
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition shrink-0 p-1 cursor-pointer"
            >
              {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
            </button>
          </div>

          {/* Floating Orange Down Arrow Badge */}
          <div className="absolute -right-1.5 -bottom-2 w-6 h-6 rounded-full bg-[#ff6b00] text-white flex items-center justify-center shadow-md pointer-events-none">
            <FaChevronDown size={11} />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full h-12 rounded-[10px] font-bold text-base mt-6 flex items-center justify-center transition shadow-sm ${isFormValid
              ? "bg-[#0047ba] hover:bg-[#003da5] text-white cursor-pointer active:scale-[0.99]"
              : "bg-[#d1d5db] text-white cursor-not-allowed"
            }`}
        >
          {t("Submit")}
        </button>
      </form>

      {/* 6. Modal: Add Bank Account / E-Wallet */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 animate-scale-up">
            {/* Modal Header */}
            <div className="bg-[#0047ba] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUniversity size={16} />
                <h3 className="font-bold text-sm">
                  {activeTab === "bank"
                    ? t("Link Bank Account")
                    : activeTab === "ewallet"
                      ? t("Link E-Wallet")
                      : t("Link Crypto Wallet")}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                <FaTimes size={12} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAccount} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {activeTab === "bank" ? t("Select Bank") : activeTab === "ewallet" ? t("Select Wallet") : t("Crypto Network")}
                </label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-hidden focus:border-[#0047ba]"
                >
                  {(activeTab === "bank" ? popularNepalBanks : activeTab === "ewallet" ? popularEwallets : ["USDT (TRC20)", "USDT (ERC20)", "Bitcoin (BTC)"]).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t("Account Holder Name")}
                </label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder={t("Full Legal Name")}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-hidden focus:border-[#0047ba]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {activeTab === "bank" ? t("Bank Account Number") : activeTab === "ewallet" ? t("Mobile / Wallet ID") : t("Wallet Address")}
                </label>
                <input
                  type="text"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  placeholder={activeTab === "bank" ? "e.g. 01234567890123" : "e.g. 9800000000"}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-hidden focus:border-[#0047ba]"
                  required
                />
              </div>

              {activeTab === "bank" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t("Branch Name")}
                  </label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    placeholder="e.g. New Road / Thamel"
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-hidden focus:border-[#0047ba]"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-10 bg-[#0047ba] hover:bg-[#003da5] text-white font-bold text-xs rounded-lg transition shadow-sm active:scale-98"
                >
                  {t("Save & Link Account")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50 animate-bounce flex items-center gap-1.5">
          <FaCheckCircle className="text-emerald-400" size={13} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default WithdrawalPage;

