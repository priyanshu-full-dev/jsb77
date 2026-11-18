import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import {
  getUserId,
  selectSite,
  selectSiteLoginColor,
} from "../../../../utils/helper/commonSelectors";
import PaymentGateway from "./PaymentGateway";
import {
  getactiveAdminDepositMethod,
  getPaymentsByUserId,
} from "../../../../api/index";
import { format } from "date-fns";
import Loader from "../../../../utils/Loader";
import {
  useGradientColor,
  usePrimaryColor,
  useSecondaryColor,
} from "../../hooks/useThemeColors";
import { BsBank2, BsCheckCircleFill, BsQrCode } from "react-icons/bs";
import { FaDollarSign } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const topHeaderColor = useSelector(selectSite())?.headerColor;
  const [userPayment, setUserPayment] = useState([]);
  const [loading, setLoading] = useState(false);
  const userID = useSelector(getUserId());
  const loginBtnColor = useSelector(selectSiteLoginColor());
  const SecondrayCtaBg = useSecondaryColor();
  const PrimaryColor = usePrimaryColor();
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [paymentDetails, setPaymentDetails] = useState({
    account: [],
    gpay: [],
    usdt: [],
  });
  const allPayments = [
    ...paymentDetails.account.map((i) => ({ ...i, method: "bank" })),

    ...(paymentDetails.gpay?.length
      ? [{ ...paymentDetails.gpay[0], method: "qr" }]
      : []),

    ...paymentDetails.usdt.map((i) => ({ ...i, method: "usdt" })),
  ];

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getactiveAdminDepositMethod();
        const account = res?.data?.filter((acc) => acc.type === "bank") || [];
        const gpay = res?.data?.filter((acc) => acc.type === "qr") || [];
        const usdt = res?.data?.filter((acc) => acc.type === "usdt") || []; // Assuming USDT type

        setPaymentDetails({ account, gpay, usdt });
      } catch (error) {
        toast.error("Failed to fetch payment details");
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = () => {
    if (!selectedPayment) {
      toast.error("Please select a payment method");
      return;
    }

    const amt = Number(amount);

    if (!amt || isNaN(amt)) {
      toast.error("Please enter a valid amount");
      return;
    }

    const minAmount = Number(selectedPayment.minAmount);
    const maxAmount = Number(selectedPayment.maxAmount);

    if (amt < minAmount) {
      toast.error(
        `Minimum deposit amount is ${
          selectedPayment.method === "usdt" ? "$" : "₹"
        }${minAmount}`,
      );
      return;
    }

    if (amt > maxAmount) {
      toast.error(
        `Maximum deposit amount is ${
          selectedPayment.method === "usdt" ? "$" : "₹"
        }${maxAmount}`,
      );
      return;
    }

    // ✅ All validations passed
    setOpen(true);
  };

  return (
    <div className="container mx-auto">
      {loading && <Loader />}
      <div className="flex flex-wrap">
        {/* Left Section */}
        <div className="w-full md:w-2/3 p-2">
          {!open && (
            <>
              <div className="shadow-md rounded p-4 bg-light-bg dark:bg-dark-bg">
                <form id="amountForm" method="post">
                  <input
                    type="hidden"
                    name="_token"
                    defaultValue="q0NGrW4D7O4NshxddDB9bmook0H18gEbSbmNnMFx"
                  />
                  <div className="mb-4">
                    <label className="block text-[15.5px] font-bold text-black dark:text-white">
                      Amount
                    </label>
                    <div className="flex mt-1">
                      <input
                        type="number"
                        className="border border-[#363636cc] rounded-[10px] px-4 py-3 w-full outline-blue bg-light-bg dark:bg-dark-bg text-black dark:text-white"
                        name="amount"
                        id="amount"
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                      />
                    </div>

                    {/* PAYMENT METHODS */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {allPayments?.map((item, index) => {
                        console.log({ item });

                        const isSelected = selectedPayment?._id === item._id;

                        const title =
                          item.method === "qr"
                            ? item.name || item.upiId?.[0] || `UPI ${index + 1}`
                            : item.method === "usdt"
                              ? "USDT"
                              : item.bankName || "Bank";

                        return (
                          <div
                            key={item._id || index}
                            onClick={() => setSelectedPayment(item)}
                            className={`relative cursor-pointer rounded-xl border p-2.5 transition-all duration-200
  ${
    isSelected
      ? "border-[#5f259f] bg-gradient-to-br from-[#faf5ff] to-[#f3e8ff] shadow-sm"
      : "border-gray-200 bg-white hover:border-[#5f259f]/40"
  }`}
                          >
                            {/* Top */}
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-[9px] font-bold ${
                                  isSelected
                                    ? "text-[#5f259f]"
                                    : "text-gray-400"
                                }`}
                              >
                                #{index + 1}
                              </span>

                              {isSelected && (
                                <BsCheckCircleFill
                                  size={12}
                                  className="text-[#5f259f]"
                                />
                              )}
                            </div>

                            {/* Icon */}
                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2
    ${isSelected ? "bg-[#5f259f] text-white" : "bg-gray-100 text-gray-500"}`}
                            >
                              {item.method === "qr" && <BsQrCode size={14} />}
                              {item.method === "bank" && <BsBank2 size={14} />}
                              {item.method === "usdt" && (
                                <img
                                  src="/usdt.png"
                                  alt="USDT"
                                  className="h-4 w-4"
                                />
                              )}
                            </div>

                            {/* Title */}
                            <h4
                              className={`text-[11px] font-bold truncate mb-2 ${
                                isSelected ? "text-[#5f259f]" : "text-gray-800"
                              }`}
                            >
                              {title}
                            </h4>

                            {/* Amounts */}
                            <div className="space-y-1 text-[10px]">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Min</span>
                                <span
                                  className={`font-bold ${
                                    isSelected
                                      ? "text-[#5f259f]"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {item.method === "usdt"
                                    ? `$${item.minAmount}`
                                    : `₹${item.minAmount}`}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-400">Max</span>
                                <span
                                  className={`font-bold ${
                                    isSelected
                                      ? "text-[#5f259f]"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {item.method === "usdt"
                                    ? `$${item.maxAmount}`
                                    : `₹${item.maxAmount}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="w-full rounded-lg bg-gradient-to-r from-[#6f30ca] to-[#6f30ca] py-3 text-lg font-bold text-white mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSubmit}
                    >
                      SUBMIT
                    </button>
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
              paymentDetails={paymentDetails}
            />
          </section>
        </div>

        {/* Enhanced Right Section - Transaction History */}
        <div className="w-full md:w-1/3 p-2">
          <div className="bg-light-bg dark:bg-dark-bg shadow-md rounded-lg mt-2">
            <div
              className="p-4 border-b rounded-sm"
              style={{
                backgroundImage: PrimaryColor,
              }}
            >
              <div className="flex justify-between items-center">
                <h2 className="sm:text-base text-sm font-bold text-white">
                  Transaction History
                </h2>
                <button
                  onClick={fetchPayment}
                  className="rounded-full transition-colors"
                  title="Refresh transactions"
                >
                  <RefreshCw size={20} className="text-gray text-white" />
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="text-white text-xs uppercase rounded-sm">
                    <th className="p-1.5 text-xs text-left bg-[#1f323f]">No</th>
                    <th className="p-1.5 text-xs text-left bg-[#1f323f]">
                      Trans. ID
                    </th>
                    <th className="p-1.5 text-xs text-right bg-[#1f323f]">
                      Amount
                    </th>
                    <th className="p-1.5 text-xs text-center bg-[#1f323f]">
                      Status
                    </th>
                    <th className="p-1.5 text-xs text-center bg-[#1f323f]">
                      Time
                    </th>
                    <th className="p-1.5 text-xs text-center bg-[#1f323f]">
                      Date
                    </th>

                    <th className="p-1.5 text-xs text-center bg-[#1f323f]">
                      Reason
                    </th>
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
                          className="hover:bg-gray-50 transition-colors bg-light-bg dark:bg-dark-bg"
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
                    <tr className="w-full">
                      <td colSpan={8} className="p-4 text-center text-gray-500">
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
