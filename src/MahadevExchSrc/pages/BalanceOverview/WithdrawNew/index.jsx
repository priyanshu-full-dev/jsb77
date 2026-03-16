import { useEffect, useState, useCallback } from "react";
import { FaTrash, FaCopy } from "react-icons/fa";
import { useSelector } from "react-redux";
import {
  getUserData,
  getUserId,
  selectDomainID,
  selectSite,
  selectUserAvailableBalance,
} from "../../../../../AsianExchangeSrc/utils/helper/commonSelectors";

import {
  createAccount,
  getAllAccounts,
  deleteAccount,
  createwithdraw,
  getwithdrawals,
} from "../../../../../AsianExchangeSrc/api/index";
import { toast } from "react-toastify";
import Loader from "../../../../../AsianExchangeSrc/utils/Loader";

const Index = () => {
  const [amount, setAmount] = useState([]); // Corrected state as an array of objects
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const UserMobileNo = useSelector(getUserData())?.mobile;
  const userExposure = useSelector(getUserData())?.exposure;
  const userId = useSelector(getUserId());
  const domainId = useSelector(selectDomainID());
  const admindomainId = useSelector(
    (state) => state?.site?.siteDetails?.admindomainName?._id
  );
  const topHeaderColor = useSelector(selectSite())?.headerColor;
  const userAvailableBalance = useSelector(selectUserAvailableBalance()) || 0;

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isOpenPass, setIsOpenPass] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);

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

  // Fetch all accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAccounts();

      const accountData = Array.isArray(response)
        ? response
        : response.data || [];
      if (!accountData?.length) {
        setAccounts([]);
      } else {
        setAccounts(accountData);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch accounts";
      setError(errorMessage);
      setAccounts([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getwithdrawals(userId);

      const transactionData = Array.isArray(response)
        ? response
        : response.data.data || [];
      if (!transactionData?.length) {
        setTransactions([]);
      } else {
        setTransactions(transactionData);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch transactions";
      setError(errorMessage);
      setTransactions([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Handle delete account
  const handleRemoveAccount = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await deleteAccount(id);

      setAccounts(accounts?.filter((account) => account._id !== id));
      toast.success("Account deleted successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete account";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle save account
  const handleSaveAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await createAccount({
        ...formData,
        domainId: domainId,
        userId: userId,
      });

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
        console.error("Failed to create account");
        // throw new Error(response?.data.message || "Failed to create account");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create account";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for formData
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e?.target.name]: e?.target.value });
  };

  // Handle copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Handle withdrawal (open password popup)
  const handleCreateWithdraw = (accountId) => {
    const withdrawAmount = amount.find(
      (item) => item.accountID === accountId
    )?.amount;
    if (!withdrawAmount || userAvailableBalance < withdrawAmount) {
      toast.error("Insufficient balance or invalid amount for withdrawal");
      return;
    }
    setSelectedAccountId(accountId);
    setIsOpenPass(true);
  };

  // Handle submit withdrawal password and create withdrawal
  const handleSubmitPassword = async () => {
    try {
      setLoading(true);
      setError(null);
      const withdrawAmount = amount.find(
        (item) => item.accountID === selectedAccountId
      )?.amount;
      if (!withdrawAmount) {
        console.error("No amount specified for withdrawal");
        return;
        // throw new Error("No amount specified for withdrawal");
      }
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
          prev?.filter((item) => item.accountID !== selectedAccountId)
        ); // Reset amount for this account
        fetchTransactions();
        toast.success(
          response?.data.message || "Withdrawal request created successfully"
        );
      } else {
        toast.error(response?.data.message || "Failed to create withdrawal");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create withdrawal";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Modal transitions
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  // Generate gradient style
  const getGradientStyle = () => {
    return {
      backgroundImage: `linear-gradient(180deg, ${
        topHeaderColor?.start || "#000"
      }, ${topHeaderColor?.end || "#000"})`,
    };
  };

  const handleBack = () => {
    window.history.back();
  };

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
      <div className="bg-gray-100 relative min-h-screen">
        {/* Header */}
        <div
          className="w-full p-1 flex items-center"
          style={getGradientStyle()}
        >
          <button
            onClick={handleBack}
            className="text-[11px] md:text-xs text-white px-4 py-1.5 bg-[#393939]"
          >
            BACK
          </button>
        </div>

        <div className="p-2 md:p-4 max-w-7xl mx-auto">
          {loading && <Loader />}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-[black] text-red-700 p-4 mb-4 rounded-r animate-fade-in">
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

          {/* Add Account Button */}
          <div className="bg-gray-100">
            <div className="flex justify-start p-2 mt-4">
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center text-[15px] gap-2 px-4 text-black font-bold disabled:opacity-50 hover:bg-gray-200 transition-colors rounded-md"
                disabled={loading}
              >
                <span className="bg-red-500 text-white p-1 text-[12px] h-[22px] w-[22px] rounded-full flex justify-center items-center">
                  +
                </span>{" "}
                ADD ACCOUNT
              </button>
            </div>
            <div className="border-t-2 border-dashed border-black mt-3"></div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 mt-4 items-start">
            {/* Left Column - Info and Accounts */}
            <div className="w-full lg:w-3/5">
              {/* Info Box */}

              {/* Account Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {accounts?.length > 0
                  ? accounts.map((account) => (
                      <div
                        key={account._id}
                        className="bg-white p-4 rounded-md relative shadow-md transition-transform hover:shadow-lg"
                      >
                        <button
                          className="absolute top-2 right-2 text-white p-2 rounded hover:bg-red-800 disabled:opacity-50"
                          style={getGradientStyle()}
                          onClick={() => handleRemoveAccount(account._id)}
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>

                        <h3 className="font-bold accountNumber-holder-name text-sm text-center pb-2 truncate">
                          {account.accountHolderName}
                        </h3>

                        <div className="bg-gray-100 p-3 rounded-md mt-3 flex flex-col gap-1">
                          <p className="flex text-[12px] justify-between items-center">
                            <span className="truncate pr-2">
                              Account No: {account.accountNumber}
                            </span>
                            <FaCopy
                              className="text-[#0c667d] cursor-pointer flex-shrink-0"
                              onClick={() => handleCopy(account.accountNumber)}
                            />
                          </p>
                          <p className="flex text-[12px] justify-between items-center">
                            <span className="truncate pr-2">
                              IFSC Code: {account.ifscCode}
                            </span>
                            <FaCopy
                              className="text-[#0c667d] cursor-pointer  flex-shrink-0"
                              onClick={() => handleCopy(account.ifscCode)}
                            />
                          </p>
                        </div>

                        <input
                          type="number"
                          value={
                            amount.find(
                              (item) => item.accountID === account._id
                            )?.amount || ""
                          }
                          onChange={(e) => {
                            const newAmount = e?.target.value;
                            if (newAmount > userAvailableBalance - userExposure)
                              return; // Prevent exceeding balance
                            setAmount((prev) => {
                              const existing = prev.find(
                                (item) => item.accountID === account._id
                              );
                              if (existing) {
                                return prev?.map((item) =>
                                  item.accountID === account._id
                                    ? { ...item, amount: newAmount }
                                    : item
                                );
                              }
                              return [
                                ...prev,
                                { accountID: account._id, amount: newAmount },
                              ];
                            });
                          }}
                          placeholder="Enter amount"
                          className="w-full p-2 border border-gray-300 rounded-md mt-2 outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-100"
                          disabled={loading}
                          min="1"
                          max={userAvailableBalance}
                        />

                        {userAvailableBalance == "0" && (
                          <p>
                            <p className="text-[12px] mt-1 text-[red]">
                              No Available Balance
                            </p>
                          </p>
                        )}

                        <button
                          className={`text-white w-full p-2 mt-2 rounded-md hover:opacity-90 transition-opacity ${
                            loading ||
                            amount.find(
                              (item) => item.accountID === account._id
                            )?.amount < 1
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          style={getGradientStyle()}
                          disabled={
                            loading ||
                            amount.find(
                              (item) => item.accountID === account._id
                            )?.amount < 1
                          }
                          onClick={() => handleCreateWithdraw(account._id)}
                        >
                          {loading ? "Processing..." : "WITHDRAW"}
                        </button>
                      </div>
                    ))
                  : !loading && (
                      <div className="bg-white p-6 rounded-md shadow-md text-center col-span-full">
                        <h3 className="text-gray-600 text-lg font-semibold">
                          No Accounts Found
                        </h3>
                        <p className="text-gray-500 text-sm mt-2">
                          Add an account to get started!
                        </p>
                      </div>
                    )}
              </div>
              <p className="text-[13px] text-[#ff5c00] text-center mt-2">
                <b>NOTE:</b> Withdrawal amount must be equal to or less than the
                available balance.
              </p>
            </div>

            {/* Right Column - Transaction History */}
            <div className="w-full lg:w-2/5 mt-6 lg:mt-0">
              <div className="bg-white rounded-md shadow-sm overflow-hidden h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] flex flex-col">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr
                        className="text-[11px] text-white overflow-y-auto"
                        style={getGradientStyle()}
                      >
                        <th className="p-2">NO</th>
                        <th className="p-2">AMOUNT</th>
                        <th className="p-2">STATUS</th>
                        <th className="p-2 ">ACCOUNT</th>
                        <th className="p-2">DATE</th>
                        <th className="p-2">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions?.length > 0 ? (
                        transactions
                          ?.slice()
                          .reverse()
                          .map((transaction, index) => (
                            <tr
                              key={index}
                              className={`text-[10px] sm:text-xs text-gray-700 hover:bg-gray border-b ${
                                index % 2 === 0 ? "bg-gray-100" : "bg-white"
                              }`}
                            >
                              <td className="p-2 text-center relative font-bold border-r">
                                {transaction.status == "Pending" && (
                                  <span
                                    // onClick={() =>
                                    //   StatusUpdate(transaction?.transactionId)
                                    // }
                                    className="h-[13px] text-[9px] w-[13px] bg-[red] absolute top-1 left-0 flex justify-center items-center cursor-pointer rounded"
                                  >
                                    X
                                  </span>
                                )}
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
                                  -5
                                )}
                                {"-"}
                                {transaction.accountId?.accountNumber
                                  ? `${transaction.accountId.accountNumber.slice(
                                      -4
                                    )}`
                                  : "N/A"}
                              </td>

                              <td
                                style={{ textWrap: "nowrap" }}
                                className="p-2 text-center font-bold border-r"
                              >
                                {transaction.createdAt
                                  ? `${new Date(transaction.createdAt)
                                      .toLocaleDateString("en-GB")
                                      .replace(/\//g, "-")} 
                                  ${new Date(
                                    transaction.createdAt
                                  ).toLocaleTimeString("en-US", {
                                    hour12: true,
                                  })}`
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
                            colSpan="5"
                          >
                            No transactions found!
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

        {/* Add Account Modal */}
        {isOpen && (
          <div
            className={`fixed z-[9999] inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <div
              className={`bg-white w-[90%] max-w-[500px] rounded-lg shadow-lg transform transition-all duration-300 ${
                isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
              onClick={(e) => e?.stopPropagation()}
            >
              <div
                style={getGradientStyle()}
                className="p-3 text-white rounded-t-lg font-bold text-sm relative"
              >
                Add Account
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-2 text-[white] text-[16px]"
                >
                  ✖
                </button>
              </div>

              <div className="p-4 pb-0">
                <label className="block text-[12px] text-gray-700 mb-1">
                  ACCOUNT TYPE
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  className="w-full text-[12px] p-2 border border-gray-300 rounded-md mb-4 disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  disabled={loading}
                >
                  <option value="">---Select Account Type---</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>

                {[
                  {
                    label: "NAME",
                    name: "accountHolderName",
                    type: "text",
                    autocomplete: "off",
                  },
                  {
                    label: "A/C NUMBER",
                    name: "accountNumber",
                    type: "text",
                    autocomplete: "off",
                  },
                  {
                    label: "IFSC CODE",
                    name: "ifscCode",
                    type: "text",
                    autocomplete: "off",
                  },
                  {
                    label: "PASSWORD",
                    name: "withdrawPassword",
                    type: "password",
                    autocomplete: "new-password",
                  },
                ]?.map((field, index) => (
                  <div key={index} className="mb-4">
                    <label className="block text-[12px] text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      placeholder={`Enter ${field.label}`}
                      readOnly={field.name === "mobileNo"}
                      className="w-full p-2 text-[12px] border-b border-[#cfcfcf] focus:outline-none focus:ring-1 focus:ring-gray-400 focus:bg-transparent focus:shadow-none disabled:bg-gray-100"
                      disabled={loading}
                      autoComplete={field.autocomplete}
                    />
                  </div>
                ))}
              </div>

              <div className="pb-4 flex justify-end gap-3 rounded-b-lg p-4 pt-0">
                <button
                  className="bg-[#3d3d3d] text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-600 disabled:opacity-50 text-sm"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Close
                </button>
                <button
                  style={getGradientStyle()}
                  className="text-white px-6 py-2 rounded-md shadow hover:opacity-90 transition disabled:opacity-50 text-sm"
                  onClick={handleSaveAccount}
                  disabled={loading}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Password Modal */}
        {isOpenPass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity flex items-center justify-center z-[9999]">
            <div className="bg-white p-5 rounded-lg shadow-xl relative w-[90%] max-w-md">
              <button
                onClick={() => {
                  setIsOpenPass(false);
                  setPassword("");
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
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

              <h2 className="text-lg font-medium mb-4 text-center">
                Enter Withdrawal Password
              </h2>

              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e?.target.value)}
                    placeholder="Enter your withdrawal password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleSubmitPassword}
                  style={getGradientStyle()}
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

export default Index;
