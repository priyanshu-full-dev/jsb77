import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";

import "./deposit.css";
import PaymentGateway from "./PaymentGateway";
import { format } from "date-fns";

// import Loader from "../../../../../AsianExchangeSrc/utils/Loader";
import { getPaymentsByUserId } from "../../../../api";
import { getUserId, selectSite } from "../../../../utils/helper/commonSelectors";
import Loader from "../../../components/Loader/Loader";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("UPI");
  const topHeaderColor = useSelector(selectSite())?.headerColor;
  const [userPayment, setUserPayment] = useState([]);
  const [loading, setLoading] = useState(false);
  const userID = useSelector(getUserId());

  const handleAmountChange = (e) => {
    setAmount(e?.target.value);
  };

  const handleQuickAmount = (value) => {
    setAmount((prevAmount) => {
      const currentAmount = parseInt(prevAmount) || 0;
      return (currentAmount + value).toString();
    });
  };

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const res = await getPaymentsByUserId(userID);
      if (Array.isArray(res.data)) {
        setUserPayment(res.data);
      } else {
        console.error("Unexpected response format:", res.data);
        setUserPayment([]);
      }
    } catch (error) {
      console.error("Error fetching payment", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="container mx-auto">
      {loading &&    <Loader/>}
      <div className="flex flex-wrap">
        {/* Left Section */}
        <div className="w-full md:w-2/3 p-2">
          {!open && (
            <>
              <div
                style={{ backgroundColor: topHeaderColor?.start }}
                className="w-full  p-1 flex items-center"
              >
                <button
                  onClick={handleBack}
                  className={`flex items-center px-2  text-[white] bg-[#343435]`}
                >
                  Back
                </button>
              </div>

              <div className="shadow-md rounded p-4 mt-2 bg-white">
                <form id="amountForm" method="post">
                  <input
                    type="hidden"
                    name="_token"
                    defaultValue="q0NGrW4D7O4NshxddDB9bmook0H18gEbSbmNnMFx"
                  />
                  <div className="mb-4">
                    <label className="block text-[15.5px] font-bold text-black">
                      Amount
                    </label>
                    <div className="flex mt-1">
                      <input
                        type="number"
                        className="border rounded-l px-4 py-3 w-full outline-blue"
                        name="amount"
                        id="amount"
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                      />
                      <button
                        type="button"
                        className="text-white px-4 py-2 rounded-r"
                        style={{
                          backgroundImage: `linear-gradient(180deg, ${
                            topHeaderColor?.start || "#000"
                          }, ${topHeaderColor?.end || "#000"})`,
                        }}
                        onClick={() => setOpen(true)}
                      >
                        SUBMIT
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}

          <section>
            <PaymentGateway
              amount={amount}
              open={open}
              toggle={() => setOpen(false)}
              fetchTransactions={() => fetchPayment()}
            />
          </section>
        </div>

        {/* Enhanced Right Section - Transaction History */}
        <div className="w-full md:w-1/3 p-2">
          <div className="bg-white shadow-md rounded-lg mt-2">
            <div
              className="p-2 border-b"
              style={{
                backgroundImage: `linear-gradient(180deg, ${
                  topHeaderColor?.start || "#000"
                }, ${topHeaderColor?.end || "#000"})`,
              }}
            >
              <div className="flex justify-between items-center">
                <h2 className="sm:text-sm text-xs font-semibold text-white">
                  Transaction History
                </h2>
                <button
                  onClick={fetchPayment}
                  className="hover:bg-gray-100 rounded-full transition-colors"
                  title="Refresh transactions"
                >
                  <RefreshCw size={16} className="text-gray" />
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr
                    className="text-white text-xs uppercase"
                    style={{
                      backgroundImage: `linear-gradient(180deg, ${
                        topHeaderColor?.start || "#000"
                      }, ${topHeaderColor?.end || "#000"})`,
                    }}
                  >
                    <th className="p-1.5 text-xs text-left">No</th>
                    <th className="p-1.5 text-xs text-left">Trans. ID</th>
                    <th className="p-1.5 text-xs text-right">Amount</th>
                    <th className="p-1.5 text-xs text-center">Status</th>
                    <th className="p-1.5 text-xs text-center">Time</th>
                    <th className="p-1.5 text-xs text-center">Date</th>

                    <th className="p-1.5 text-xs text-center">Reason</th>
                  </tr>
                </thead>
                <tbody id="Trans-head">
                  {userPayment?.length > 0 ? (
                    userPayment
                      ?.slice()
                      .reverse()
                      .map((e, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3 text-left font-mono border-r border-black">
                            {i + 1}
                          </td>
                          <td className="p-3 text-left font-mono border-r border-black">
                            {e?.UTR}
                          </td>
                          <td className="p-3 text-right font-bold text-[13px] border-r border-black">
                            {parseFloat(e?.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-center border-r border-black">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                e?.status === "accepted"
                                  ? "bg-green-700 text-white"
                                  : e?.status === "pending"
                                  ? "bg-yellow-100 text-black"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {e?.status}
                            </span>
                          </td>
                          <td
                            style={{ textWrap: "nowrap" }}
                            className="p-3 text-center text-gray-600 border-r border-black"
                          >
                            {format(new Date(e?.createdAt), "hh:mm a")}
                          </td>
                          <td
                            style={{ textWrap: "nowrap" }}
                            className="p-3 text-center text-gray-600 border-r border-black"
                          >
                            <span>
                              {" "}
                              {format(new Date(e?.createdAt), "dd MMM")}
                            </span>

                            {format(new Date(e?.createdAt), "yyyy")}
                          </td>
                          <td className="p-3 text-center text-gray-500">
                            {e?.remarks || "NA"}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
