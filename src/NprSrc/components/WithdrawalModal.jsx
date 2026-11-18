import { useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaMoneyBillWave, FaUniversity, FaWallet, FaCheckCircle } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

const withdrawalMethods = [
  { id: "esewa", name: "eSewa", icon: FaWallet, color: "bg-[#60bb46] text-white", fee: "0% Fee" },
  { id: "khalti", name: "Khalti", icon: FaWallet, color: "bg-[#5c2d91] text-white", fee: "0% Fee" },
  { id: "bank", name: "Bank Transfer", icon: FaUniversity, color: "bg-[#0045b8] text-white", fee: "Fast 24/7" },
];

const WithdrawalModal = ({ isOpen, onClose, balance = "0.00" }) => {
  const { t } = useLanguage();
  const [method, setMethod] = useState("esewa");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(amount) < 500) {
      alert("Minimum withdrawal amount is Rs. 500");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      alert(`Withdrawal request of Rs. ${amount} via ${method.toUpperCase()} submitted! Funds will arrive within 15 minutes.`);
      setSubmitted(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-side-redeem-in">
        {/* Modal Header */}
        <div className="bg-[#0045b8] px-4 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-yellow-300" size={18} />
            <h3 className="font-bold text-base tracking-tight">{t("Withdrawal")}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition focus:outline-none"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Balance Card */}
          <div className="bg-[#f4f7fb] p-3 rounded-xl border border-gray-200/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-bold uppercase block">
                Available Withdrawable
              </span>
              <span className="text-lg font-black text-[#0045b8]">
                Rs. {balance}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <FaCheckCircle size={10} /> Instant
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Select Payout Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {withdrawalMethods.map((m) => {
                const isSelected = method === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                      isSelected
                        ? "border-[#0045b8] bg-blue-50/60 ring-2 ring-[#0045b8]/20"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${m.color}`}>
                      <Icon size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-800 leading-none">
                      {m.name}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold">
                      {m.fee}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Details */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {method === "bank" ? "Bank Account Number" : `${method === "esewa" ? "eSewa" : "Khalti"} ID / Mobile`}
            </label>
            <input
              type="text"
              required
              placeholder={method === "bank" ? "Enter Bank Account No." : "Enter 98XXXXXXXX"}
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full h-[44px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-sm px-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] font-normal"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Withdrawal Amount (Rs.)
            </label>
            <input
              type="number"
              required
              min="500"
              placeholder="Min. Rs. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-[44px] bg-[#e8e8e8] text-gray-800 placeholder-[#9e9e9e] text-sm px-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0045b8] font-normal"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitted}
            className="w-full h-[46px] rounded-lg bg-gradient-to-b from-[#1872f2] via-[#0356e0] to-[#062d75] border border-[#389aff]/40 text-white text-[15px] font-bold shadow-[0_4px_12px_rgba(6,45,117,0.35)] hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
          >
            {submitted ? "Processing..." : "Submit Withdrawal"}
          </button>
        </form>
      </div>
    </div>
  );
};

WithdrawalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  balance: PropTypes.string,
};

export default WithdrawalModal;

