import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CustomSVG from "./CustomSVG";
import {
  getUserData,
  getUserId,
  selectDomainID,
} from "../../../utils/helper/commonSelectors";
import {
  createAccount,
  getAllAccounts,
  deleteAccount,
  createwithdraw,
  checkWithdrawalAllowed,
} from "../../../api/index";
import { Trash2 } from "lucide-react";
import Loader from "../../components/Loader/Loader";

const Withdraw = () => {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [withdrawalCheck, setWithdrawalCheck] = useState({
    withdrawalAllowed: false,
  });

  const admindomainId = useSelector(
    (state) => state?.site?.siteDetails?.admindomainName?._id || "",
  ); // Added fallback to avoid undefined
  const userId = useSelector(getUserId());
  const UserMobileNo = useSelector(getUserData())?.mobile;
  const domainId = useSelector(selectDomainID());

  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    mobileNo: UserMobileNo || "",
    domainId: domainId || "",
    userId: userId || "",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAccounts();

      const accountData = Array.isArray(response)
        ? response
        : response.data || [];
      setAccounts(accountData.slice(0, 3));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch accounts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e, accountId) => {
    const { name, value } = e?.target;
    if (name === "amount") {
      setAmounts((prev) => ({
        ...prev,
        [accountId]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleIncreaseAmount = (value, accountId) => {
    const currentAmount = parseInt(amounts[accountId] || "0");
    const newAmount = currentAmount + parseInt(value);
    setAmounts((prev) => ({
      ...prev,
      [accountId]: newAmount.toString(),
    }));
  };

  const handleSaveAccount = async () => {
    if (accounts?.length >= 3) {
      toast.error("Maximum 3 bank accounts allowed");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await createAccount({
        ...formData,
        domainId,
        userId,
      });

      if (response?.success) {
        setAccounts((prev) => [...prev, response.data].slice(0, 3));
        setShowForm(false);
        setFormData({
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
          bankName: "",
          mobileNo: UserMobileNo || "",
          domainId: domainId || "",
          userId: userId || "",
        });
        toast.success("Account added successfully");
        fetchAccounts();
      } else {
        toast.error(response?.data.message || "Failed to create account");
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

  const handleRemoveAccount = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await deleteAccount(id); // axios request

      // ✅ Check if API call succeeded
      if (res.success) {
        toast.success(res?.data?.message || "Account removed successfully");

        setAccounts((prev) => prev?.filter((account) => account._id !== id));
        setSelectedAccount(null);

        setAmounts((prev) => {
          const newAmounts = { ...prev };
          delete newAmounts[id];
          return newAmounts;
        });

        fetchAccounts();
      } else {
        // ❌ Server responded but not successful
        const message =
          res?.data?.message || "Failed to delete account. Please try again.";
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      // ❌ Axios caught an error (network/server/validation)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while deleting the account.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankClick = (stepNumber) => {
    if (accounts?.length < 3) {
      setShowForm(true);
      setStep(stepNumber);
    }
  };

  const handleBackClick = () => {
    setShowForm(false);
    setStep(0);
  };

  const handleAccountClick = (accountId) => {
    setSelectedAccount((prev) => (prev === accountId ? null : accountId));
  };

  const handleCreateWithdrawal = async (accountId) => {
    if (!withdrawalCheck.withdrawalAllowed) {
      return;
    }
    const withdrawAmount = parseFloat(amounts[accountId]);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount to withdraw");
      return;
    }

    // Example: Check for minimum withdrawal amount
    if (withdrawAmount < 100) {
      toast.error("Withdrawal amount must be at least 100");
      return;
    }

    // Check if admindomainId is available
    if (!admindomainId) {
      toast.error("Domain ID is missing. Please try again later.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fallback for environments where crypto.randomUUID is not available
      const uuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Fallback UTR generation

      const response = await createwithdraw({
        UTR: uuid,
        accountId,
        withdrawAmount,
        userId,
        domainId: admindomainId,
        // withdrawPassword: "some-password", // Uncomment and add if required
      });

      if (response?.success) {
        toast.success(
          `Withdrawal request for ${withdrawAmount} initiated successfully`,
        );
        setAmounts((prev) => ({
          ...prev,
          [accountId]: "",
        }));
        setSelectedAccount(null);
      } else {
        console.error("Failed to create withdrawal");
        // throw new Error(response?.data.message || "Failed to create withdrawal");
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

  useEffect(() => {
    const fetchWithdrawalAllowed = async () => {
      setLoading(true);
      const response = await checkWithdrawalAllowed();
      setWithdrawalCheck(response.data.data);
      setLoading(false);
    };
    if (window.location.hostname === "d2.blacklion.club") {
      fetchWithdrawalAllowed();
    } else {
      setWithdrawalCheck({ withdrawalAllowed: true });
    }

    return () => {};
  }, []);

  const isBangladesh = window.location.host === "playbangla777.com";

  return (
    <>
      {loading && <Loader />}
      <p className="text-gray-700 bg-[#08182f] text-[12px] text-white mt-[-1px] text-center">
        Kindly check the bank details before withdrawal
      </p>
      <div className="p-4 flex w-full flex-col">
        {!showForm && (
          <div className="w-full space-y-4">
            <h1 className="text-[16px] font-semibold text-gray-800 mb-4">
              Choose a bank to Withdraw into
            </h1>

            {[1, 2, 3].map((slot) => {
              const account = accounts[slot - 1];
              return account ? (
                <div key={account._id} className="w-full">
                  <div
                    className="w-full text-center overflow-hidden rounded-lg cursor-pointer"
                    onClick={() => handleAccountClick(account._id)}
                  >
                    <div className="flex items-center justify-between text-center bg-[#00723c] px-4 py-2">
                      <h2 className="text-[13px] font-bold text-[white]">
                        BANK {slot}
                      </h2>
                      <button
                        className="text-black hover:text-gray-700"
                        aria-label="Delete bank account"
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleRemoveAccount(account._id);
                        }}
                        disabled={loading}
                      >
                        <Trash2 className="h-5 w-5 text-[white]" />
                      </button>
                    </div>

                    <div className="bg-[#1e1e1e] text-white">
                      {/* IFSC ONLY INDIA */}

                        <div className="border-b border-gray-800 px-4 py-3">
                          <p className="text-xs text-gray-400">IFSC / SWIFT</p>
                          <p className="font-medium">
                            {account?.ifscCode || "N/A"}
                          </p>
                        </div>
                

                      {/* BANK / SERVICE NAME */}
                      <div className="border-b border-gray-800 px-4 py-3">
                        <p className="text-xs text-gray-400">
                          {isBangladesh ? "SERVICE NAME" : "BANK NAME"}
                        </p>
                        <p className="font-medium">
                          {account?.bankName || "N/A"}
                        </p>
                      </div>

                      {/* ACCOUNT HOLDER */}
                      <div className="border-b border-gray-800 px-4 py-3">
                        <p className="text-xs text-gray-400">
                          {isBangladesh
                            ? "ACCOUNT HOLDER"
                            : "ACCOUNT HOLDER NAME"}
                        </p>
                        <p className="font-medium">
                          {account?.accountHolderName ||
                            account?.accountHolder ||
                            "N/A"}
                        </p>
                      </div>

                      {/* ACCOUNT NUMBER */}
                      <div className="px-4 py-3">
                        <p className="text-xs text-gray-400">
                          {isBangladesh ? "ACCOUNT / NUMBER" : "ACCOUNT NO"}
                        </p>
                        <p className="font-medium">
                          {account?.accountNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedAccount === account._id && (
                    <div className="mt-4">
                      <p className="mt-2 rounded-md font-medium bg-[#212121]">
                        <input
                          type="text"
                          name="amount"
                          value={amounts[account._id] || ""}
                          onChange={(e) => handleInputChange(e, account._id)}
                          placeholder="Enter Amount"
                          className="h-full w-full text-white text-[12px] p-3 py-5 bg-transparent focus:text-[white] focus:bg-transparent outline-none border-none focus:ring-0"
                        />
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          "+100",
                          "+200",
                          "+500",
                          "+1000",
                          "+2000",
                          "+5000",
                        ].map((e, i) => (
                          <button
                            onClick={() =>
                              handleIncreaseAmount(
                                e?.replace("+", ""),
                                account._id,
                              )
                            }
                            key={i}
                            className="px-2.5 py-2 border text-[13px] font-[sans-serif] font-[500] border-[#bababa] text-black rounded-md"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleCreateWithdrawal(account._id)}
                        className="w-full mt-4 bg-[#00723c] font-bold text-white py-3 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={
                          window.location.hostname === "d2.blacklion.club"
                            ? loading ||
                              !amounts[account._id] ||
                              !withdrawalCheck.withdrawalAllowed
                            : loading || !amounts[account._id]
                        }
                      >
                        {loading ? "Processing..." : "Request Withdrawal"}
                      </button>
                      {window.location.hostname === "d2.blacklion.club" &&
                        !withdrawalCheck.withdrawalAllowed && (
                          <div className="text-sm font-semibold text-orange-500">
                            {" "}
                            {`Note: Play for more exposure of ${withdrawalCheck.moreExposureRequiredToWithdraw} to make the withdrawal.`}{" "}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  key={slot}
                  onClick={() => handleAddBankClick(slot)}
                  className="w-full h-[100px] flex items-center justify-center py-3 bg-gray-300 text-gray-700 rounded-sm border-[1px] border-dotted border-[#6e6e6e] hover:bg-gray-400 transition"
                  disabled={loading}
                >
                  <p className="bg-[#CDCDCD] p-2 px-4 font-bold text-[13px] rounded">
                    TAP TO ADD BANK {slot}
                  </p>
                </button>
              );
            })}
          </div>
        )}

       {showForm && (
  <div className="w-full">
    <div className="flex w-full items-center">
      <div
        onClick={handleBackClick}
        className="flex justify-center items-center cursor-pointer"
      >
        <CustomSVG />
      </div>

      <p className="text-center w-full font-bold text-[20px]">
        {isBangladesh ? "ACCOUNT" : "BANK"} {step}
      </p>
    </div>

    <div className="w-full p-3 rounded-sm mt-6 border-[1px] border-dotted border-[#6e6e6e]">

      {/* IFSC ONLY INDIA */}

        <>
          <p className="text-[11px] mb-1">IFSC / SWIFT</p>
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleInputChange}
            placeholder="IFSC / SWIFT"
            className="w-full px-4 py-2.5 mb-4 border text-[13px] rounded-md bg-white text-black"
          />
        </>
 

      {/* BANK / SERVICE */}
      <p className="text-[11px] mb-1">
        {isBangladesh ? "Service Name" : "Bank Name"}
      </p>
      <input
        type="text"
        name="bankName"
        value={formData.bankName}
        onChange={handleInputChange}
        placeholder={
          isBangladesh
            ? "e.g. bKash / Nagad / Bank"
            : "Enter Bank Name"
        }
        className="w-full px-4 py-2.5 mb-4 border text-[13px] rounded-md bg-white text-black"
      />

      {/* ACCOUNT HOLDER */}
      <p className="text-[11px] mb-1">
        {isBangladesh ? "Account Holder" : "Account Holder Name"}
      </p>
      <input
        type="text"
        name="accountHolderName"
        value={formData.accountHolderName}
        onChange={handleInputChange}
        placeholder="Enter Name"
        className="w-full px-4 py-2.5 mb-4 border text-[13px] rounded-md bg-white text-black"
      />

      {/* ACCOUNT NUMBER */}
      <p className="text-[11px] mb-1">
        {isBangladesh ? "Account / Number" : "Account No"}
      </p>
      <input
        type="text"
        name="accountNumber"
        value={formData.accountNumber}
        onChange={handleInputChange}
        placeholder={
          isBangladesh
            ? "Enter Mobile Number / Account"
            : "Enter Account No"
        }
        className="w-full px-4 py-2.5 mb-4 border text-[13px] rounded-md bg-white text-black"
      />

      {/* BUTTON */}
      <button
        onClick={handleSaveAccount}
        className="w-full mt-4 mb-6 bg-[#00723c] font-bold text-white py-3 rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={
          loading ||
          !formData.accountNumber ||
          !formData.accountHolderName ||
          !formData.bankName ||
          (!isBangladesh && !formData.ifscCode) // 🔥 CONDITION FIX
        }
      >
        {loading
          ? "Adding..."
          : isBangladesh
            ? "ADD ACCOUNT"
            : "ADD BANK"}
      </button>
    </div>
  </div>
)}
      </div>
    </>
  );
};

export default Withdraw;
