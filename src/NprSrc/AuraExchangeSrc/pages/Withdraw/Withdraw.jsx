import { useEffect, useState, useCallback } from "react";
import { FaTrash, FaCopy } from "react-icons/fa";
import { useSelector } from "react-redux";
import {
  getUserData,
  getUserId,
  selectDomainID,
  selectSite,
  selectUserAvailableBalance,
} from "../../../../utils/helper/commonSelectors";
import {
  createAccount,
  getAllAccounts,
  deleteAccount,
  createwithdraw,
  getwithdrawals,
} from "../../../../api/index";
import { toast } from "react-toastify";
import Loader from "../../../../utils/Loader";
import { PiHandWithdrawFill } from "react-icons/pi";
import {
  useGradientColor,
  usePrimaryColor,
  useSecondaryColor,
} from "../../hooks/useThemeColors";

const Withdraw = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [amount, setAmount] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const UserMobileNo = useSelector(getUserData())?.mobile;
  const userId = useSelector(getUserId());
  const domainId = useSelector(selectDomainID());
  const admindomainId = useSelector(
    (state) => state?.site?.siteDetails?.admindomainName?._id,
  );
  const userAvailableBalance = useSelector(selectUserAvailableBalance()) || 0;
  const userExposure = useSelector(getUserData())?.exposure;

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isOpenPass, setIsOpenPass] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  
  const PrimaryColor = usePrimaryColor();
  const gradiantColor = useGradientColor();

  const [formData, setFormData] = useState({
    accountType: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    withdrawPassword: "",
    mobileNo: UserMobileNo || "",
    domainId: domainId || "",
    userId: userId || "",
  });

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAccounts();
      const accountData = Array.isArray(response)
        ? response
        : response.data || [];
      setAccounts(accountData?.length ? accountData : []);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch accounts";
      setError(msg);
      setAccounts([]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getwithdrawals(userId);
      const data = Array.isArray(response)
        ? response
        : response.data.data || [];
      setTransactions(data?.length ? data : []);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch transactions";
      setError(msg);
      setTransactions([]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleRemoveAccount = async (id) => {
    try {
      setLoading(true);
      const response = await deleteAccount(id);
      if (!response?.success) {
        toast.error(response?.data?.message || "Failed to delete account", {
          toastId: "delete-account-error",
        });
        return;
      }
      setAccounts((prev) => prev?.filter((a) => a._id !== id));
      toast.success("Account deleted successfully");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete account",
        { toastId: "delete-account-error" },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    try {
      setLoading(true);
      const response = await createAccount({ ...formData, domainId, userId });
      if (response?.success === true) {
        setAccounts([...accounts, response.data]);
        setIsOpen(false);
        setFormData({
          accountType: "",
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
          withdrawPassword: "",
          mobileNo: UserMobileNo || "",
          domainId: domainId || "",
          userId: userId || "",
        });
        toast.success(response?.data.message || "Account created successfully");
        fetchAccounts();
      } else {
        throw new Error(response?.data.message || "Failed to create account");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to create account",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e?.target.name]: e?.target.value });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleCreateWithdraw = (accountId) => {
    const withdrawAmount = amount.find(
      (item) => item.accountID === accountId,
    )?.amount;
    if (!withdrawAmount || userAvailableBalance < withdrawAmount) {
      toast.error("Insufficient balance or invalid amount for withdrawal");
      return;
    }
    setSelectedAccountId(accountId);
    setIsOpenPass(true);
  };

  const handleSubmitPassword = async () => {
    try {
      setLoading(true);
      const withdrawAmount = amount.find(
        (item) => item.accountID === selectedAccountId,
      )?.amount;
      if (!withdrawAmount)
        throw new Error("No amount specified for withdrawal");
      const uuid = crypto.randomUUID();
      const response = await createwithdraw({
        UTR: uuid,
        accountId: selectedAccountId,
        withdrawAmount,
        userId,
        domainId: admindomainId,
        withdrawPassword: password,
      });
      if (response?.success === true) {
        setIsOpenPass(false);
        setPassword("");
        setAmount((prev) =>
          prev?.filter((item) => item.accountID !== selectedAccountId),
        );
        fetchTransactions();
        toast.success(
          response?.data.message || "Withdrawal request created successfully",
        );
      } else {
        throw new Error(
          response?.data.message || "Failed to create withdrawal",
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to create withdrawal",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) setTimeout(() => setIsVisible(true), 10);
    else setIsVisible(false);
  }, [isOpen]);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  const handleBack = () => window.history.back();

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      accountType: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      withdrawPassword: "",
    });
  };

  return (
    <>
      <div className="bg-light-bg dark:bg-dark-bg relative min-h-screen">
        {/* ── Header ── */}
        <div
          className="w-full p-1 flex items-center justify-between pr-3"
          style={{ background: PrimaryColor }}
        >
          <button
            onClick={handleBack}
            className="text-md font-extrabold md:text-xs text-white px-4 py-1.5"
          >
            Withdraw
          </button>
          <PiHandWithdrawFill size={24} className="text-white" />
        </div>

        <div className="p-2 md:p-4 max-w-7xl mx-auto">
          {loading && <Loader />}

          {error && (
            <div className="bg-red-100 border-l-4 border-black text-red-700 p-4 mb-4 rounded-r">
              <div className="flex items-center justify-between">
                <p>{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 hover:text-red-900 font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div
            className="w-full flex items-center justify-between px-3 rounded-md py-2 cursor-pointer"
            style={{ background: gradiantColor }}
            onClick={() => !loading && setIsOpen(true)}
          >
            <span className="text-white font-bold text-sm tracking-wide">
              Add Account
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 2v10M2 7h10"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          {/* ── TABS ── */}
          <div className="flex mt-4 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("accounts")}
              className="flex-1 py-3 text-[12px] font-bold tracking-wide transition-all"
              style={{
                background:
                  activeTab === "accounts" ? PrimaryColor : "transparent",
                color: activeTab === "accounts" ? "#fff" : undefined,
              }}
            >
              <span
                className={
                  activeTab !== "accounts"
                    ? "text-black dark:text-white opacity-50"
                    : ""
                }
              >
                Accounts {accounts.length > 0 && `(${accounts.length})`}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
             className="flex-1 py-3 text-[12px] font-bold tracking-wide transition-all"
              style={{
                background:
                  activeTab === "transactions" ? PrimaryColor : "transparent",
                color: activeTab === "transactions" ? "#fff" : undefined,
              }}
            >
              <span
                className={
                  activeTab !== "transactions"
                    ? "text-black dark:text-white opacity-50"
                    : ""
                }
              >
                Transactions{" "}
                {transactions.length > 0 && `(${transactions.length})`}
              </span>
            </button>
          </div>

          {/* ── TAB: ACCOUNTS ── */}
          {activeTab === "accounts" && (
            <div className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts?.length > 0
                  ? accounts.map((account) => (
                      <div
                        key={account._id}
                        className="relative rounded-2xl p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-black dark:text-white shadow-sm"
                      >
                        {/* Badge + Delete */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-xs font-medium px-3 py-1 rounded-full"
                            style={
                              account.accountType === "UPI"
                                ? { background: "#d1fae5", color: "#166534" }
                                : {
                                    background: "transparent",
                                    color: "#93c5fd",
                                    border: "1px solid #3b82f6",
                                  }
                            }
                          >
                            {account.accountType === "UPI"
                              ? "UPI"
                              : "Bank Account"}
                          </span>
                          <button
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 disabled:opacity-50 transition-colors"
                            onClick={() => handleRemoveAccount(account._id)}
                            disabled={loading}
                          >
                            <FaTrash
                              size={13}
                              className="text-gray-400 hover:text-red-500"
                            />
                          </button>
                        </div>

                        {/* Name */}
                        <p className="text-base font-bold mb-3 truncate">
                          {account.accountHolderName}
                        </p>

                        {/* UPI Box */}
                        {account.accountType === "UPI" ? (
                          <div className="rounded-xl px-4 py-3 flex items-center justify-between mb-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-700">
                                <svg
                                  viewBox="0 0 24 24"
                                  width="14"
                                  height="14"
                                  fill="none"
                                  stroke="#bbf7d0"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
                                  UPI ID
                                </p>
                                <p className="text-sm font-bold text-green-900 dark:text-green-100">
                                  {account.accountNumber}
                                </p>
                              </div>
                            </div>
                            <FaCopy
                              className="cursor-pointer flex-shrink-0 text-green-700 dark:text-green-400"
                              size={15}
                              onClick={() => handleCopy(account.accountNumber)}
                            />
                          </div>
                        ) : (
                          /* Bank Info Box */
                          <div className="rounded-xl px-4 py-3 flex flex-col gap-3 mb-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                Account No.
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-black dark:text-white">
                                  {account.accountNumber}
                                </span>
                                <FaCopy
                                  className="cursor-pointer flex-shrink-0 text-blue-500"
                                  size={14}
                                  onClick={() =>
                                    handleCopy(account.accountNumber)
                                  }
                                />
                              </div>
                            </div>
                            {account.ifscCode && (
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                  IFSC
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-bold text-black dark:text-white">
                                    {account.ifscCode}
                                  </span>
                                  <FaCopy
                                    className="cursor-pointer flex-shrink-0 text-blue-500"
                                    size={14}
                                    onClick={() => handleCopy(account.ifscCode)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Amount Input */}
                        <input
                          type="number"
                          value={
                            amount.find(
                              (item) => item.accountID === account._id,
                            )?.amount || ""
                          }
                          onChange={(e) => {
                            const newAmount = e?.target.value;
                            if (newAmount > userAvailableBalance - userExposure)
                              return;
                            setAmount((prev) => {
                              const existing = prev.find(
                                (item) => item.accountID === account._id,
                              );
                              if (existing)
                                return prev?.map((item) =>
                                  item.accountID === account._id
                                    ? { ...item, amount: newAmount }
                                    : item,
                                );
                              return [
                                ...prev,
                                { accountID: account._id, amount: newAmount },
                              ];
                            });
                          }}
                          placeholder="Enter amount"
                          className="w-full px-4 py-3 text-sm rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-black dark:text-white placeholder-gray-400"
                          disabled={loading}
                          min="1"
                          max={userAvailableBalance}
                        />

                        {userAvailableBalance == "0" && (
                          <p className="text-[11px] mb-2 text-red-500">
                            No Available Balance
                          </p>
                        )}

                        {/* Withdraw Button */}
                        <button
                          style={{ background: gradiantColor }}
                          className="w-full rounded-xl py-3 text-sm font-bold tracking-wide disabled:opacity-50 transition-opacity text-white bg-gray-100  border-gray-200 dark:border-gray-700 hover:opacity-80"
                          disabled={loading}
                          onClick={() => handleCreateWithdraw(account._id)}
                        >
                          {loading ? "Processing..." : "Withdraw"}
                        </button>
                      </div>
                    ))
                  : !loading && (
                      <div className="p-6 rounded-md text-center col-span-full bg-light-bg dark:bg-dark-bg">
                        <h3 className="text-gray-600 text-lg font-bold">
                          No Accounts Found
                        </h3>
                        <p className="text-gray-500 text-sm mt-2">
                          Add an account to get started!
                        </p>
                      </div>
                    )}
              </div>
              <p className="text-[13px] text-[#ff5c00] text-center mt-4">
                <b>NOTE:</b> Withdrawal amount must be equal to or less than the
                available balance.
              </p>
            </div>
          )}

          {/* ── TAB: TRANSACTIONS ── */}
          {activeTab === "transactions" && (
            <div className="mt-4  overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr
                      className="text-[11px] text-white"
                      style={{ background: PrimaryColor }}
                    >
                      {[
                        "NO",
                        "AMOUNT",
                        "STATUS",
                        "ACCOUNT",
                        "DATE",
                        "REMARK",
                      ].map((h) => (
                        <th key={h} className="p-2 bg-[#1f323f]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.length > 0 ? (
                      transactions
                        ?.slice()
                        .reverse()
                        .map((transaction, index) => (
                          <tr
                            key={index}
                            className="text-[10px] sm:text-xs text-black dark:text-white border-b bg-light-bg dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <td className="p-2 text-center font-bold border-r">
                              {index + 1}
                            </td>
                            <td className="p-2 text-center font-bold border-r">
                              {transaction.withdrawAmount || "N/A"}
                            </td>
                            <td className="p-2 text-center border-r">
                              <span
                                className={`px-2 py-1 rounded text-[8px] sm:text-[10px] ${
                                  transaction.status === "Accepted"
                                    ? "bg-green-700 text-white"
                                    : transaction.status === "Rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {transaction.status || "Pending"}
                              </span>
                            </td>
                            <td className="p-2 text-center font-bold border-r">
                              {transaction?.accountId?.accountHolderName.slice(
                                -5,
                              )}
                              {"-"}
                              {transaction.accountId?.accountNumber
                                ? transaction.accountId.accountNumber.slice(-4)
                                : "N/A"}
                            </td>
                            <td
                              style={{ textWrap: "nowrap" }}
                              className="p-2 text-center font-bold border-r"
                            >
                              {transaction.createdAt
                                ? `${new Date(transaction.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")} ${new Date(transaction.createdAt).toLocaleTimeString("en-US", { hour12: true })}`
                                : "N/A"}
                            </td>
                            <td
                              className="p-2 font-bold border-r"
                              style={{ textWrap: "nowrap" }}
                            >
                              {transaction.remarks || "N/A"}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          className="p-4 text-center text-gray-500"
                          colSpan="6"
                        >
                          No transactions found!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Add Account Modal ── */}
        {isOpen && (
          <div
            className={`fixed z-[9999] inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${isVisible ? "opacity-100" : "opacity-0"}`}
            onClick={() => setIsOpen(false)}
          >
            <div
              className={`bg-light-bg dark:bg-dark-bg w-[90%] max-w-[500px] rounded-lg shadow-lg transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
              onClick={(e) => e?.stopPropagation()}
            >
              <div
                style={{ background: PrimaryColor }}
                className="p-3 text-white rounded-t-lg font-bold text-base relative"
              >
                Add Account
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-2.5 text-white text-[16px]"
                >
                  ✖
                </button>
              </div>
              <div className="p-4 pb-0">
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-light-bg dark:bg-dark-bg rounded-lg border border-black text-black dark:text-white focus:outline-none focus:ring-2"
                  disabled={loading}
                >
                  <option value="">---Select Account Type---</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="UPI">UPI</option>
                </select>
                <div className="mb-4 mt-4">
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    placeholder="Enter Name"
                    className="w-full px-4 py-3 border border-black rounded-lg bg-light-bg dark:bg-dark-bg text-black dark:text-white"
                    disabled={loading}
                  />
                </div>
                {formData.accountType === "UPI" && (
                  <div className="mb-4">
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Enter UPI ID (example@upi)"
                      className="w-full px-4 py-3 border border-black rounded-lg bg-light-bg dark:bg-dark-bg text-black dark:text-white"
                      disabled={loading}
                    />
                  </div>
                )}
                {formData.accountType !== "UPI" && (
                  <>
                    <div className="mb-4">
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        placeholder="Enter Account Number"
                        className="w-full px-4 py-3 border border-black rounded-lg bg-light-bg dark:bg-dark-bg text-black dark:text-white"
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-4">
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        placeholder="Enter IFSC Code"
                        className="w-full px-4 py-3 border border-black rounded-lg bg-light-bg dark:bg-dark-bg text-black dark:text-white"
                        disabled={loading}
                      />
                    </div>
                  </>
                )}
                <div className="mb-4">
                  <input
                    type="password"
                    name="withdrawPassword"
                    value={formData.withdrawPassword}
                    onChange={handleInputChange}
                    placeholder="Enter Password"
                    className="w-full px-4 py-3 border border-black rounded-lg bg-light-bg dark:bg-dark-bg text-black dark:text-white"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="pb-4 p-4 pt-0">
                <button
                 style={{ background: gradiantColor }}
                  className="w-full  rounded-lg py-3 text-lg font-bold text-white mt-5"
                  onClick={handleSaveAccount}
                  disabled={loading}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Withdrawal Password Modal ── */}
        {isOpenPass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-light-bg dark:bg-dark-bg p-5 rounded-lg shadow-xl relative w-[90%] max-w-md">
              <button
                onClick={() => {
                  setIsOpenPass(false);
                  setPassword("");
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-medium mb-4 text-center text-black dark:text-white">
                Enter Withdrawal Password
              </h2>
              <div className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e?.target.value)}
                  placeholder="Enter your withdrawal password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-light-bg dark:bg-dark-bg text-black dark:text-white"
                  required
                  disabled={loading}
                />
                <button
                  onClick={handleSubmitPassword}
                  style={{ background: gradiantColor }}
                  className="w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50 hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Withdraw;
