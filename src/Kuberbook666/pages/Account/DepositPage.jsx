import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PaymentGateway from "../../components/PaymentGateway";
import { getPaymentsByUserId } from "../../../api";

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

export default function DepositPage() {
  const [amount, setAmount] = useState("100");
  const [openGateway, setOpenGateway] = useState(false);
  const [userPayment, setUserPayment] = useState([]);
  const [loading, setLoading] = useState(false);

  const userID = useSelector(
    (state) => state?.user?.userData?._id || localStorage.getItem("userId")
  );

  const fetchPayment = async () => {
    if (!userID || userID === "undefined") return;
    try {
      setLoading(true);
      const res = await getPaymentsByUserId(userID);
      // Agar 404 ya empty hai toh safely [] set karo
      setUserPayment(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setUserPayment([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchPayment();
    }
  }, [userID]);

  const handleQuickAmount = (val) => {
    setAmount((prev) => ((parseInt(prev, 10) || 0) + val).toString());
  };

  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-wrap gap-6 mt-4">
      {/* Left: Amount Selection or Payment Gateway */}
      <div className="w-full lg:w-2/3">
        {!openGateway ? (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Deposit Funds</h2>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Amount (Min: 100 - Max: 200000)
            </label>
            <div className="relative mb-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full text-lg font-bold p-3 border rounded-lg focus:outline-blue-500 pl-8 text-gray-900"
              />
              <span className="absolute left-3 top-3.5 text-gray-500 font-bold">₹</span>
            </div>
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="border border-red-800 text-[#800020] font-bold py-2 rounded-lg hover:bg-red-50 text-xs transition-all cursor-pointer active:scale-95"
                >
                  +{val}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpenGateway(true)}
              disabled={!amount || Number(amount) < 100}
              className="w-full bg-[#800020] hover:bg-[#600018] text-white font-bold py-3.5 rounded-lg shadow transition-all disabled:opacity-50 cursor-pointer active:scale-98"
            >
              PROCEED TO PAYMENT
            </button>
          </div>
        ) : (
          <PaymentGateway
            amount={amount}
            open={openGateway}
            toggle={() => setOpenGateway(false)}
            fetchTransactions={fetchPayment}
          />
        )}
      </div>

      {/* Right: Transaction History */}
      <div className="w-full lg:w-1/3">
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-gray-800">
              Deposit History ({userPayment.length})
            </h3>
            <button
              type="button"
              onClick={fetchPayment}
              disabled={loading}
              className="text-xs text-red-800 font-semibold hover:underline cursor-pointer disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {userPayment.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No deposit history yet
              </div>
            ) : (
              <div className="space-y-2">
                {userPayment.map((item, idx) => (
                  <div
                    key={idx}
                    className="border p-2.5 rounded-lg flex justify-between items-center text-xs bg-gray-50"
                  >
                    <div>
                      <div className="font-bold text-gray-800 uppercase">
                        {item.PaymentMode || "Deposit"}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        UTR: {item.UTR || "N/A"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">₹{item.amount}</div>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          item.status === "Approved" || item.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Rejected" || item.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
