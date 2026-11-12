import { useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaMoneyBillWave, FaQrcode, FaCheckCircle } from "react-icons/fa";

const depositMethods = [
  { id: "esewa", name: "eSewa", color: "#60bb46", min: 500, max: 50000 },
  { id: "khalti", name: "Khalti", color: "#5c2d91", min: 500, max: 50000 },
  { id: "bank", name: "Bank Transfer", color: "#0047ba", min: 1000, max: 100000 },
  { id: "imepay", name: "IME Pay", color: "#ed1c24", min: 500, max: 50000 },
];

const amountPresets = [500, 1000, 2000, 5000, 10000, 25000];

const DepositModal = ({ isOpen, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState("esewa");
  const [amount, setAmount] = useState(1000);
  const [txnId, setTxnId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      alert(`Deposit request of Rs. ${amount} via ${selectedMethod.toUpperCase()} submitted successfully!`);
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  const method = depositMethods.find((m) => m.id === selectedMethod) || depositMethods[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003da5] via-[#005bf8] to-[#003da5] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave size={18} className="text-[#ffd700]" />
            <h3 className="font-extrabold text-sm uppercase">NPR Deposit Gateway</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <FaTimes size={12} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Methods */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Select Payment Method (Nepal)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {depositMethods.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-between ${
                    selectedMethod === m.id
                      ? "border-2 border-[#0047ba] bg-blue-50 text-[#003da5]"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    {m.name}
                  </span>
                  {selectedMethod === m.id && <FaCheckCircle className="text-[#0047ba]" size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Presets */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Deposit Amount (RS)
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {amountPresets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-1.5 rounded-md text-xs font-bold border transition ${
                    amount === val
                      ? "bg-[#0047ba] text-white border-[#0047ba]"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Rs. {val.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:border-[#0047ba] transition">
              <span className="text-xs font-bold text-gray-600 mr-2">Rs.</span>
              <input
                type="number"
                min={method.min}
                max={method.max}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full text-xs font-bold bg-transparent focus:outline-none text-gray-900"
              />
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">
              Min: Rs. {method.min} | Max: Rs. {method.max.toLocaleString()}
            </span>
          </div>

          {/* QR & Account placeholder */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-800 shadow-sm flex-shrink-0">
              <FaQrcode size={34} />
            </div>
            <div className="text-left text-xs">
              <p className="font-extrabold text-[#003da5]">Official {method.name} Pay</p>
              <p className="text-[11px] text-gray-600 font-mono">9801234567</p>
              <p className="text-[10px] text-emerald-600 font-bold">Name: JSB77 Nepal Agent</p>
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Transaction ID / Reference ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 12345678"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-gray-50 focus-within:bg-white focus:outline-none focus:border-[#0047ba]"
            />
          </div>

          <button
            type="submit"
            disabled={submitted}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#0047ba] to-[#006aff] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-98 transition disabled:opacity-50"
          >
            {submitted ? "Processing..." : `Confirm Deposit Rs. ${amount.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};

DepositModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DepositModal;

