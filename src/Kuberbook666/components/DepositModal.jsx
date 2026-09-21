import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { IoCloseOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import PaymentGateway from "./PaymentGateway";
import { getPaymentsByUserId } from "../../api";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000, 50000];

const DepositModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [openGateway, setOpenGateway] = useState(false);
  const [activeView, setActiveView] = useState("deposit"); // 'deposit' | 'history'
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const userId = useSelector(
    (state) => state?.user?.userData?._id || localStorage.getItem("userId") || ""
  );

  const fetchTransactions = async () => {
    if (!userId) return;
    try {
      setLoadingHistory(true);
      const res = await getPaymentsByUserId(userId);
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res)
        ? res
        : [];
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (userId) {
        fetchTransactions();
      }
    } else {
      document.body.style.overflow = "";
      setOpenGateway(false);
      setError("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleAddAmount = (val) => {
    const current = parseInt(amount, 10) || 0;
    const next = current + val;
    setAmount(next.toString());
    setError("");
  };

  const handleProceed = (e) => {
    e?.preventDefault();
    const num = Number(amount);
    if (!num || isNaN(num)) {
      setError("Please enter a valid amount");
      return;
    }
    if (num < 100) {
      setError("Minimum deposit amount is ₹100");
      return;
    }
    if (num > 200000) {
      setError("Maximum deposit amount is ₹200,000");
      return;
    }

    setError("");
    setOpenGateway(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 font-sans max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#680a1e] to-[#c10931] text-white shrink-0">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="19"
              viewBox="0 0 21 19"
              fill="none"
              stroke="#ffffff"
            >
              <path
                d="M3.62143 4.52979C3.52275 4.52988 3.42507 4.54945 3.33397 4.58737C3.24287 4.62528 3.16014 4.68079 3.09054 4.75074C3.02094 4.82068 2.96584 4.90368 2.92837 4.99496C2.8909 5.08624 2.87181 5.18402 2.8722 5.28269C2.8724 5.48134 2.95139 5.67179 3.09185 5.81225C3.23232 5.95271 3.42278 6.03171 3.62143 6.03191H16.6423C17.4549 6.03191 18.0115 6.5801 18.0115 7.19078V8.50099C18.0111 8.59998 18.0303 8.69805 18.068 8.78958C18.1057 8.8811 18.1612 8.96425 18.2312 9.03424C18.3012 9.10424 18.3843 9.15969 18.4758 9.19739C18.5674 9.23508 18.6654 9.25429 18.7644 9.2539C18.8631 9.2538 18.9608 9.23424 19.0519 9.19632C19.143 9.1584 19.2257 9.10288 19.2953 9.03293C19.3649 8.96299 19.42 8.87999 19.4575 8.78871C19.4949 8.69743 19.514 8.59966 19.5136 8.50099V7.19078C19.5136 5.6859 18.1796 4.52979 16.6423 4.52979H3.62143Z"
                fill="#ffffff"
              ></path>
              <path
                d="M16.6606 7.75177C15.5639 7.75177 14.6603 8.65906 14.6603 9.75583V11.2579C14.6603 12.3547 15.5639 13.262 16.6606 13.262H18.7459C19.8427 13.262 20.75 12.3547 20.75 11.2579V9.75583C20.75 8.65906 19.8427 7.75177 18.7459 7.75177H16.6606ZM16.6606 9.25389H18.7459C19.032 9.25389 19.2478 9.46966 19.2478 9.75583V11.2579C19.2478 11.5441 19.032 11.7599 18.7459 11.7599H16.6606C16.3745 11.7599 16.1587 11.5441 16.1587 11.2579V9.75583C16.1587 9.46966 16.3745 9.25389 16.6606 9.25389Z"
                fill="#ffffff"
              ></path>
            </svg>
            <h3 className="font-bold text-base tracking-wide uppercase">
              {openGateway ? "Deposit Gateway" : "Deposit Funds"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 transition-colors text-white cursor-pointer"
            aria-label="Close"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* View Switcher (Deposit vs History) when not in Gateway */}
        {!openGateway && (
          <div className="flex border-b border-gray-200 bg-gray-50 px-4 pt-2">
            <button
              type="button"
              onClick={() => setActiveView("deposit")}
              className={`pb-2 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                activeView === "deposit"
                  ? "border-[#680a1e] text-[#680a1e]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Deposit Funds
            </button>
            <button
              type="button"
              onClick={() => setActiveView("history")}
              className={`pb-2 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView === "history"
                  ? "border-[#680a1e] text-[#680a1e]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>Transaction History</span>
              {transactions.length > 0 && (
                <span className="text-[10px] bg-red-100 text-[#680a1e] px-1.5 py-0.2 rounded-full">
                  {transactions.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {openGateway ? (
            /* Step 2: Payment Gateway Screen */
            <PaymentGateway
              amount={amount}
              toggle={() => setOpenGateway(false)}
              fetchTransactions={fetchTransactions}
              onClose={onClose}
            />
          ) : activeView === "deposit" ? (
            /* Step 1: Amount Selection */
            <div>
              <form onSubmit={handleProceed} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Deposit Amount (INR) <span className="text-red-600">*</span>
                    </label>
                    <span className="text-[11px] text-gray-500 font-medium">
                      Min: ₹100 | Max: ₹2,00,000
                    </span>
                  </div>

                  <div className="flex items-center bg-[#f2f4f8] border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#680a1e] transition">
                    <span className="text-base font-bold text-gray-700 mr-2">₹</span>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError("");
                      }}
                      className="bg-transparent text-base w-full outline-hidden font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-xs font-semibold mt-1.5">{error}</p>
                  )}
                </div>

                {/* Quick Add Chips */}
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">Quick Add Amount</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {QUICK_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleAddAmount(val)}
                        className="py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-red-50 hover:border-red-200 hover:text-[#680a1e] font-bold text-xs sm:text-sm text-gray-800 transition active:scale-95 cursor-pointer shadow-xs"
                      >
                        +₹{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#680a1e] hover:bg-[#580718] text-white font-bold text-sm tracking-wide shadow-md active:scale-98 transition cursor-pointer"
                  >
                    PROCEED TO PAYMENT →
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Transaction History View */
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-700">Recent Deposit Records</span>
                <button
                  type="button"
                  onClick={fetchTransactions}
                  disabled={loadingHistory}
                  className="text-xs font-bold text-[#680a1e] hover:underline cursor-pointer disabled:opacity-50"
                >
                  {loadingHistory ? "Refreshing..." : "↻ Refresh"}
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs sm:text-sm bg-gray-50 rounded-xl border border-dashed">
                  No deposit records found
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-700 border-b">
                      <tr>
                        <th className="p-2.5 font-bold">Date</th>
                        <th className="p-2.5 font-bold">UTR / Mode</th>
                        <th className="p-2.5 font-bold text-right">Amount</th>
                        <th className="p-2.5 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="p-2.5">
                            <div className="font-bold text-gray-900 uppercase text-[11px]">
                              {item.PaymentMode || "UPI"}
                            </div>
                            <div className="text-gray-400 text-[10px] font-mono">
                              {item.UTR || "—"}
                            </div>
                          </td>
                          <td className="p-2.5 text-right font-black text-green-700 whitespace-nowrap">
                            ₹{Number(item.amount || 0).toLocaleString()}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                item.status === "Approved" || item.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "Rejected" || item.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {item.status || "Pending ⏳"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
