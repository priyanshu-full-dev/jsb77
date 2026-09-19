import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  getAllAccounts,
  createAccount,
  deleteAccount,
  createwithdraw,
  checkWithdrawalAllowed,
} from "../../../api/index";
import {
  getUserData,
  getUserId,
  selectDomainID,
} from "../../../utils/helper/commonSelectors";
import { setUserData } from "../../../redux/slices/userSlice";

export default function WithdrawalPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // User details from Redux
  const user = useSelector(getUserData());
  const userId = useSelector(getUserId()) || user?._id || user?.id || "";
  const domainId = useSelector(selectDomainID()) || "";
  const admindomainId = useSelector(
    (state) =>
      state?.site?.siteDetails?.admindomainName?._id ||
      state?.site?.siteDetails?.domainId ||
      ""
  );

  const rawBalance =
    typeof user?.availableBalance === "number"
      ? user.availableBalance
      : typeof user?.balance === "number"
      ? user.balance
      : 0.0;
  const balance = Number(rawBalance || 0).toFixed(2);

  // Active Withdrawal Method: "BANK" or "UPI"
  const [selectedMethod, setSelectedMethod] = useState("BANK");

  // Account Mode: "new" (Use New Account) or "previous" (Use Previous Account)
  const [accountMode, setAccountMode] = useState("new");

  // Accordion for "See More.." rules
  const [showMoreRules, setShowMoreRules] = useState(false);

  // Terms and conditions acceptance
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Saved accounts list
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedSavedAccountId, setSelectedSavedAccountId] = useState(null);
  const [previousAccountAmount, setPreviousAccountAmount] = useState("");

  // Submitting loading state
  const [submitting, setSubmitting] = useState(false);

  // Payment Options carousel scroll ref
  const paymentOptionsRef = useRef(null);

  // Form State for Bank
  const [bankForm, setBankForm] = useState({
    amount: "",
    ifsc: "",
    accountNo: "",
    bankType: "",
    accountName: "",
    bankName: "",
  });

  // Form State for UPI
  const [upiForm, setUpiForm] = useState({
    amount: "",
    upiId: "",
    mobileNo: user?.mobile || "",
    accountName: user?.name || user?.username || "",
  });

  // Withdrawal allowed check
  const [withdrawalCheck, setWithdrawalCheck] = useState({
    withdrawalAllowed: true,
    moreExposureRequiredToWithdraw: 0,
  });

  useEffect(() => {
    const verifyWithdrawalAllowed = async () => {
      try {
        const response = await checkWithdrawalAllowed();
        if (response?.data?.data) {
          setWithdrawalCheck(response.data.data);
        }
      } catch {
        // fallback
        setWithdrawalCheck({ withdrawalAllowed: true });
      }
    };
    verifyWithdrawalAllowed();
  }, []);

  // Fetch saved accounts when switching to previous or on mount
  const fetchAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);
      const res = await getAllAccounts();
      const accountData = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];
      setSavedAccounts(accountData);
      if (accountData.length > 0 && !selectedSavedAccountId) {
        setSelectedSavedAccountId(accountData[0]._id || accountData[0].id);
      }
    } catch {
      setSavedAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  }, [selectedSavedAccountId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleScrollCarousel = (direction) => {
    if (paymentOptionsRef.current) {
      const scrollAmount = direction === "left" ? -150 : 150;
      paymentOptionsRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankForm((prev) => ({
      ...prev,
      [name]: name === "ifsc" ? value.toUpperCase() : value,
    }));
  };

  const handleUpiChange = (e) => {
    const { name, value } = e.target;
    setUpiForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteSavedAccount = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setSubmitting(true);
      const res = await deleteAccount(id);
      if (res?.success || res?.status === 200) {
        toast.success("Account removed successfully");
        setSavedAccounts((prev) => prev.filter((acc) => acc._id !== id && acc.id !== id));
        if (selectedSavedAccountId === id) {
          setSelectedSavedAccountId(null);
        }
      } else {
        toast.error(res?.data?.message || "Failed to delete account");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error deleting account");
    } finally {
      setSubmitting(false);
    }
  };

  // Validation logic
  const isBankFormValid = useMemo(() => {
    const amt = parseFloat(bankForm.amount);
    return (
      amt >= 300 &&
      amt <= 1000000 &&
      bankForm.ifsc.trim().length >= 4 &&
      bankForm.accountNo.trim().length >= 6 &&
      bankForm.bankType &&
      bankForm.accountName.trim().length >= 2 &&
      bankForm.bankName.trim().length >= 2 &&
      termsAccepted
    );
  }, [bankForm, termsAccepted]);

  const isUpiFormValid = useMemo(() => {
    const amt = parseFloat(upiForm.amount);
    return (
      amt >= 300 &&
      amt <= 1000000 &&
      upiForm.upiId.trim().includes("@") &&
      upiForm.mobileNo.trim().length >= 10 &&
      upiForm.accountName.trim().length >= 2 &&
      termsAccepted
    );
  }, [upiForm, termsAccepted]);

  const isFormValid = selectedMethod === "BANK" ? isBankFormValid : isUpiFormValid;

  // Handle New Account Withdrawal Submission
  const handleSubmitNewAccount = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error("Please accept the terms of payment and withdrawal policy.");
      return;
    }

    if (!withdrawalCheck.withdrawalAllowed) {
      toast.error(
        `Withdrawal not allowed. Play for more exposure of ${
          withdrawalCheck.moreExposureRequiredToWithdraw || 0
        } to withdraw.`
      );
      return;
    }

    const withdrawAmount = parseFloat(
      selectedMethod === "BANK" ? bankForm.amount : upiForm.amount
    );

    if (isNaN(withdrawAmount) || withdrawAmount < 300 || withdrawAmount > 1000000) {
      toast.error("Withdrawal amount must be between 300 and 1,000,000");
      return;
    }

    if (withdrawAmount > rawBalance) {
      toast.error("Insufficient balance for withdrawal");
      return;
    }

    try {
      setSubmitting(true);

      const uuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 1. Create/Save the account if needed
      let createdAccId = null;
      try {
        const accountPayload =
          selectedMethod === "BANK"
            ? {
                accountHolderName: bankForm.accountName,
                accountNumber: bankForm.accountNo,
                ifscCode: bankForm.ifsc,
                bankName: bankForm.bankName,
                accountType: bankForm.bankType,
                mobileNo: user?.mobile || "",
                domainId: domainId || admindomainId,
                userId: userId,
              }
            : {
                accountHolderName: upiForm.accountName,
                accountNumber: upiForm.upiId,
                ifscCode: "UPI",
                bankName: "UPI",
                mobileNo: upiForm.mobileNo,
                domainId: domainId || admindomainId,
                userId: userId,
              };

        const accRes = await createAccount(accountPayload);
        if (accRes?.success && accRes?.data?._id) {
          createdAccId = accRes.data._id;
        }
      } catch (err) {
        console.warn("Account creation skipped or already exists:", err?.message);
      }

      // 2. Create the withdrawal request
      const withdrawalPayload = {
        UTR: uuid,
        accountId: createdAccId || "DIRECT_WITHDRAW",
        withdrawAmount: withdrawAmount,
        userId: userId,
        domainId: admindomainId || domainId,
        paymentMethod: selectedMethod,
        ...(selectedMethod === "BANK"
          ? {
              bankName: bankForm.bankName,
              accountHolderName: bankForm.accountName,
              accountNumber: bankForm.accountNo,
              ifscCode: bankForm.ifsc,
              accountType: bankForm.bankType,
            }
          : {
              upiId: upiForm.upiId,
              accountHolderName: upiForm.accountName,
              mobileNo: upiForm.mobileNo,
            }),
      };

      const response = await createwithdraw(withdrawalPayload);

      if (response?.success || response?.status === 200 || response?.data?.success) {
        toast.success(
          `Withdrawal request for ₹${withdrawAmount} submitted successfully!`
        );
        // Deduct local balance
        const newBal = Math.max(0, rawBalance - withdrawAmount);
        dispatch(
          setUserData({
            ...user,
            availableBalance: newBal,
            balance: newBal,
          })
        );
        // Reset forms
        setBankForm({
          amount: "",
          ifsc: "",
          accountNo: "",
          bankType: "",
          accountName: "",
          bankName: "",
        });
        setUpiForm({
          amount: "",
          upiId: "",
          mobileNo: user?.mobile || "",
          accountName: user?.name || user?.username || "",
        });
        fetchAccounts();
      } else {
        toast.error(
          response?.data?.message ||
            response?.message ||
            "Failed to submit withdrawal request"
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit withdrawal request. Please check your details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Previous Account Withdrawal Submission
  const handleSubmitPreviousAccount = async () => {
    if (!selectedSavedAccountId) {
      toast.error("Please select an account to withdraw into");
      return;
    }
    const amt = parseFloat(previousAccountAmount);
    if (isNaN(amt) || amt < 300 || amt > 1000000) {
      toast.error("Please enter a valid amount between 300 and 1,000,000");
      return;
    }
    if (amt > rawBalance) {
      toast.error("Insufficient balance for withdrawal");
      return;
    }

    try {
      setSubmitting(true);
      const uuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const response = await createwithdraw({
        UTR: uuid,
        accountId: selectedSavedAccountId,
        withdrawAmount: amt,
        userId: userId,
        domainId: admindomainId || domainId,
      });

      if (response?.success || response?.status === 200 || response?.data?.success) {
        toast.success(`Withdrawal request for ₹${amt} initiated successfully!`);
        const newBal = Math.max(0, rawBalance - amt);
        dispatch(
          setUserData({
            ...user,
            availableBalance: newBal,
            balance: newBal,
          })
        );
        setPreviousAccountAmount("");
        setSelectedSavedAccountId(null);
      } else {
        toast.error(response?.data?.message || "Failed to create withdrawal");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process withdrawal"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col transition-all ease-in-out duration-100">
      <div className="flex items-start justify-start w-full">
        {/* Desktop Left Sidebar Menu */}
        <div
          title="Menu"
          id="leftDeskSideBar"
          className="hidden lg:flex p-2 overflow-y-auto z-10 w-[20%] h-[calc(100dvh-120px)] sticky top-[54px] lg:top-[110px]"
        >
          <ul className="flex border border-ternary3 bg-bg_Quaternary-side overflow-x-hidden flex-col w-full bg-white shadow-sm rounded-lg">
            {/* Cricket */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Cricket/4"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.4414 1.55859C13.3601 -0.519531 10.0152 -0.519531 7.93389 1.55859L6.50529 2.98719C6.46779 3.02469 6.46779 3.09031 6.50529 3.12781L13.8722 10.4947C13.9097 10.5322 13.9753 10.5322 14.0128 10.4947L15.4414 9.06611C17.5195 6.9848 17.5195 3.63989 15.4414 1.55859Z"
                    fill="#C10931"
                  ></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Cricket
                </span>
              </a>
            </li>

            {/* Football */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Football/1"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.5 0C3.80588 0 0 3.80588 0 8.5C0 13.1941 3.80588 17 8.5 17C13.1941 17 17 13.1941 17 8.5C17 3.80588 13.1941 0 8.5 0Z"
                    fill="#1A56DB"
                  ></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Football
                </span>
              </a>
            </li>

            {/* Tennis */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Tennis/2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="8.5" cy="8.5" r="8.5" fill="#84CC16" />
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Tennis
                </span>
              </a>
            </li>

            {/* Horse Racing */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/horse-racing"
              >
                <span className="font-medium text-start text-text_Ternary-new">
                  Horse Racing
                </span>
              </a>
            </li>

            {/* Greyhound Racing */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/greyhound-racing"
              >
                <span className="font-medium text-start text-text_Ternary-new">
                  Greyhound Racing
                </span>
              </a>
            </li>

            {/* Sportsbook */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Sportsbook/0"
              >
                <span className="font-medium text-start text-text_Ternary-new">
                  Sportsbook
                </span>
              </a>
            </li>
          </ul>
        </div>

        {/* Center Main Content Area */}
        <div
          className="w-full md:mt-[0px] lg:overflow-auto lg:w-[54%]"
          style={{ minHeight: "calc(100dvh - 110px)" }}
        >
          {/* Mobile Top Sticky Navigation Header */}
          <div
            title="Withdraw Funds"
            className="sticky top-0 z-10 w-full bg-white h-max py-2.5 flex flex-col lg:hidden border-b border-gray-200 font-lato shadow-xs"
          >
            <div className="flex items-center gap-2 w-full pl-[13px] pr-2">
              <button
                onClick={() => navigate(-1)}
                className="relative overflow-hidden bg-gray-100 border border-gray-200 rounded w-[26px] h-[26px] flex items-center justify-center active:scale-95 transition"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                >
                  <path
                    d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z"
                    fill="#8b0a24"
                  ></path>
                </svg>
              </button>
              <div className="flex-1 flex items-center justify-between">
                <h3 className="text-gray-900 text-base font-bold">
                  Withdraw Funds
                </h3>
              </div>
            </div>
          </div>

          <div className="px-2 pb-6 flex flex-col items-start justify-start gap-y-2 mt-1 md:mt-[0px]">
            {/* Payment Options Header Card */}
            <div className="w-full flex flex-col gap-2 pt-3 pb-2 px-4 rounded-xl bg-white shadow-xs border border-gray-200 mt-2">
              <div className="flex flex-row justify-between items-center w-full">
                <span className="text-base text-gray-900 font-lato font-bold leading-5">
                  Withdraw Funds
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleScrollCarousel("left")}
                    className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[26px] h-[26px] p-1 justify-center items-center text-gray-700 border border-gray-300 rounded hover:bg-gray-50 active:scale-95 cursor-pointer"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="8"
                      height="10"
                      viewBox="0 0 7 12"
                      fill="none"
                    >
                      <path
                        d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z"
                        fill="#8b0a24"
                      ></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleScrollCarousel("right")}
                    className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[26px] h-[26px] p-1 justify-center items-center text-gray-700 border border-gray-300 rounded hover:bg-gray-50 active:scale-95 cursor-pointer"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="8"
                      height="10"
                      viewBox="0 0 7 12"
                      fill="none"
                      className="-rotate-180"
                    >
                      <path
                        d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z"
                        fill="#8b0a24"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Payment Gateways Carousel */}
              <div
                id="payMentOptions"
                ref={paymentOptionsRef}
                className="flex items-center gap-x-2.5 pt-[14px] pb-[8px] overflow-x-auto no-scrollbar scroll-smooth w-full transition-all ease-in-out duration-150"
              >
                {/* BANK Option */}
                <div
                  onClick={() => setSelectedMethod("BANK")}
                  className={`flex justify-start items-center flex-col gap-y-2 rounded-[10px] bg-white py-2 w-full min-w-[117px] max-w-[130px] px-[20px] relative border cursor-pointer transition duration-150 ${
                    selectedMethod === "BANK"
                      ? "border-[#8b0a24] ring-2 ring-[#8b0a24]/20 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="absolute top-1 right-1">
                    <div className="inline-flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          selectedMethod === "BANK"
                            ? "border-[#8b0a24] bg-[#8b0a24]"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {selectedMethod === "BANK" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-y-1 flex-col w-full">
                    <img
                      alt="BANK"
                      loading="lazy"
                      width="77"
                      height="57"
                      className="h-[57px] w-[77px] object-contain rounded-md"
                      src="https://imagedelivery.net/_oGMRGIDYQYkAb8XFE2QBQ/wallets-11cd6d54-6f33-46cf-8c7c-2305255b1785.jpeg/public"
                    />
                    <span className="text-xs text-gray-900 font-lato font-bold truncate w-full uppercase text-center">
                      BANK
                    </span>
                  </div>
                </div>

                {/* UPI Option */}
                <div
                  onClick={() => setSelectedMethod("UPI")}
                  className={`flex justify-start items-center flex-col gap-y-2 rounded-[10px] bg-white py-2 w-full min-w-[117px] max-w-[130px] px-[20px] relative border cursor-pointer transition duration-150 ${
                    selectedMethod === "UPI"
                      ? "border-[#8b0a24] ring-2 ring-[#8b0a24]/20 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="absolute top-1 right-1">
                    <div className="inline-flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          selectedMethod === "UPI"
                            ? "border-[#8b0a24] bg-[#8b0a24]"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {selectedMethod === "UPI" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-y-1 flex-col w-full">
                    <img
                      alt="UPI"
                      loading="lazy"
                      width="77"
                      height="57"
                      className="h-[57px] w-[77px] object-contain rounded-md"
                      src="https://imagedelivery.net/_oGMRGIDYQYkAb8XFE2QBQ/wallets-3f73cbc7-da34-4c32-8d03-46d58c04373e.jpeg/public"
                    />
                    <span className="text-xs text-gray-900 font-lato font-bold truncate w-full uppercase text-center">
                      UPI
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions / Notice */}
              <div className="w-full flex flex-col text-xs text-gray-700 transition-all ease-in-out duration-100 pt-1 border-t border-gray-100">
                <div className="text-xs md:text-sm font-lato pt-1 font-semibold leading-4 text-gray-800">
                  1. This form is for withdrawing the amount from the main wallet only.
                </div>
                {showMoreRules && (
                  <div className="space-y-1 mt-1 text-xs text-gray-600 font-lato leading-relaxed">
                    <div>
                      2. Minimum withdrawal amount is ₹300, maximum is ₹10,00,000 per transaction.
                    </div>
                    <div>
                      3. Double check your IFSC / UPI details. Providing wrong details will lead to transaction delay.
                    </div>
                    <div>
                      4. Withdrawals are processed 24x7 within 15-45 minutes.
                    </div>
                  </div>
                )}
                <div
                  onClick={() => setShowMoreRules(!showMoreRules)}
                  className="pt-1 w-full cursor-pointer text-[#8b0a24] font-semibold text-xs hover:underline"
                >
                  {showMoreRules ? "See Less.." : "See More.."}
                </div>
              </div>
            </div>

            {/* Account Mode Selection Switch */}
            <div className="text-base text-gray-900 font-roboto w-full font-[700] flex flex-col items-start justify-start gap-y-1 mt-2">
              <span className="font-lato text-xs sm:text-sm text-gray-700 font-semibold">
                Please fill in all required fields*
              </span>
              <div className="font-lato text-sm w-full">
                <div
                  id="step-selectMode"
                  className="relative flex w-[100%] rounded-lg border border-gray-200 shadow-sm bg-gray-100 overflow-clip p-0.5"
                >
                  <button
                    type="button"
                    onClick={() => setAccountMode("new")}
                    className={`flex items-center justify-center w-full gap-1.5 tracking-wider p-3 text-sm font-semibold transition-all duration-200 rounded-md cursor-pointer ${
                      accountMode === "new"
                        ? "bg-[#8b0a24] text-white shadow-md font-bold"
                        : "bg-transparent text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    Use New Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMode("previous");
                      fetchAccounts();
                    }}
                    className={`flex items-center justify-center w-full gap-1.5 tracking-wider p-3 text-sm font-semibold transition-all duration-200 rounded-md cursor-pointer ${
                      accountMode === "previous"
                        ? "bg-[#8b0a24] text-white shadow-md font-bold"
                        : "bg-transparent text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    Use Previous Account
                  </button>
                </div>
              </div>
            </div>

            {/* VIEW 1: USE PREVIOUS ACCOUNT */}
            {accountMode === "previous" && (
              <div className="w-full mt-2">
                {loadingAccounts ? (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-white rounded-xl border border-gray-200">
                    <div className="w-7 h-7 border-2 border-[#8b0a24] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-xs font-semibold">Loading saved accounts...</span>
                  </div>
                ) : savedAccounts.length === 0 ? (
                  /* Screenshot 3: No accounts found state */
                  <div className="w-full flex flex-col items-center justify-center py-12 px-6 bg-white rounded-xl shadow-xs border border-gray-200 text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-[#b91c1c] flex items-center justify-center mb-4 text-[#b91c1c] text-3xl font-bold">
                      !
                    </div>
                    <p className="text-sm sm:text-base font-bold text-gray-900 max-w-sm leading-snug">
                      Oops! Currently there are no accounts found! Please select Other Methods or Use New Account option to continue.
                    </p>
                    <button
                      onClick={() => setAccountMode("new")}
                      className="mt-5 px-6 py-2.5 bg-[#8b0a24] text-white font-bold text-xs rounded-lg shadow hover:bg-[#72081d] transition"
                    >
                      Use New Account
                    </button>
                  </div>
                ) : (
                  /* Saved accounts list */
                  <div className="w-full space-y-3">
                    <div className="flex gap-2 flex-wrap mb-1">
                      <span className="text-xs sm:text-sm bg-[#8b0a24] rounded-md font-roboto shadow-sm text-white px-3 py-1 font-semibold">
                        Min/Max: 300 / 1,000,000
                      </span>
                      <span className="text-xs sm:text-sm bg-[#8b0a24] rounded-md font-roboto shadow-sm text-white px-3 py-1 font-semibold">
                        Available: ₹{balance}
                      </span>
                    </div>

                    {savedAccounts.map((acc, index) => {
                      const isSelected =
                        selectedSavedAccountId === (acc._id || acc.id);
                      return (
                        <div
                          key={acc._id || acc.id || index}
                          onClick={() =>
                            setSelectedSavedAccountId(acc._id || acc.id)
                          }
                          className={`w-full rounded-xl border transition-all cursor-pointer overflow-hidden ${
                            isSelected
                              ? "border-[#8b0a24] ring-2 ring-[#8b0a24]/20 shadow-md bg-white"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between bg-[#8b0a24] px-4 py-2.5 text-white">
                            <span className="font-bold text-xs sm:text-sm">
                              {acc.bankName || "BANK / UPI"} - {acc.accountHolderName || "Saved Account"}
                            </span>
                            <button
                              onClick={(e) =>
                                handleDeleteSavedAccount(acc._id || acc.id, e)
                              }
                              className="text-white hover:text-red-200 p-1 text-xs transition"
                              title="Delete Account"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="p-3 text-xs space-y-1 text-gray-700 bg-gray-50/50">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Account / UPI:</span>
                              <span className="font-bold text-gray-900">
                                {acc.accountNumber || "N/A"}
                              </span>
                            </div>
                            {acc.ifscCode && acc.ifscCode !== "UPI" && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">IFSC Code:</span>
                                <span className="font-bold text-gray-900">
                                  {acc.ifscCode}
                                </span>
                              </div>
                            )}
                          </div>

                          {isSelected && (
                            <div className="p-3 border-t border-gray-200 bg-white space-y-3">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-800">
                                  Enter Amount to Withdraw*
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="Enter Amount (min 300)"
                                  value={previousAccountAmount}
                                  onChange={(e) =>
                                    setPreviousAccountAmount(
                                      e.target.value.replace(/[^0-9]/g, "")
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#8b0a24]"
                                />
                              </div>
                              <button
                                onClick={handleSubmitPreviousAccount}
                                disabled={
                                  submitting ||
                                  !previousAccountAmount ||
                                  parseFloat(previousAccountAmount) < 300
                                }
                                className="w-full py-2.5 bg-[#8b0a24] text-white font-bold text-sm rounded-lg shadow hover:bg-[#72081d] disabled:opacity-50 transition"
                              >
                                {submitting ? "Processing..." : "WITHDRAW FUNDS"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: USE NEW ACCOUNT (BANK / UPI FORM) */}
            {accountMode === "new" && (
              <form
                onSubmit={handleSubmitNewAccount}
                className="flex flex-col items-start justify-start w-full gap-y-2 mt-1"
              >
                <div className="rounded-xl bg-white border border-gray-200 py-3 px-3.5 pb-5 flex flex-col items-start justify-start w-full gap-y-3 shadow-xs">
                  {/* Info badges */}
                  <div className="w-full flex items-start justify-start flex-col">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm bg-[#8b0a24] rounded-md font-roboto shadow-sm text-white px-2.5 py-1 my-0.5 font-bold">
                        Min/Max withdrawal : 300/1000000
                      </span>
                      <span className="text-xs sm:text-sm bg-[#8b0a24] rounded-md font-roboto shadow-sm text-white px-2.5 py-1 my-0.5 font-bold">
                        Available to withdrawal: {balance}
                      </span>
                    </div>

                    {/* Amount Input */}
                    <div className="flex flex-col w-full mt-3">
                      <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold">
                        Amount<span className="text-red-600">*</span>
                      </div>
                      <div className="relative mt-1">
                        <input
                          id="amount"
                          placeholder="Enter Amount"
                          className="block w-full text-gray-900 focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg px-3 text-sm transition"
                          autoComplete="off"
                          type="text"
                          inputMode="numeric"
                          name="amount"
                          value={
                            selectedMethod === "BANK"
                              ? bankForm.amount
                              : upiForm.amount
                          }
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            if (selectedMethod === "BANK") {
                              setBankForm((prev) => ({ ...prev, amount: val }));
                            } else {
                              setUpiForm((prev) => ({ ...prev, amount: val }));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* BANK FORM FIELDS */}
                  {selectedMethod === "BANK" && (
                    <>
                      {/* IFSC Code */}
                      <div className="flex flex-col w-full">
                        <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold">
                          IFSC Code<span className="text-red-600">*</span>
                        </div>
                        <div className="relative mt-1">
                          <input
                            id="ifsc"
                            placeholder="Enter IFSC Code"
                            className="block w-full text-gray-900 focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg px-3 text-sm uppercase transition"
                            autoComplete="off"
                            type="text"
                            name="ifsc"
                            value={bankForm.ifsc}
                            onChange={handleBankChange}
                          />
                        </div>
                      </div>

                      {/* Account No */}
                      <div className="flex flex-col w-full">
                        <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold">
                          Account No<span className="text-red-600">*</span>
                        </div>
                        <div className="relative mt-1">
                          <input
                            id="accountNo"
                            placeholder="Enter Account Number"
                            className="block w-full text-gray-900 focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg px-3 text-sm transition"
                            autoComplete="off"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="accountNo"
                            value={bankForm.accountNo}
                            onChange={(e) =>
                              setBankForm((prev) => ({
                                ...prev,
                                accountNo: e.target.value.replace(/[^0-9]/g, ""),
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Account Type */}
                      <div className="flex flex-col w-full">
                        <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold">
                          Account Type<span className="text-red-600">*</span>
                        </div>
                        <div className="relative mt-1">
                          <select
                            id="bank_type"
                            name="bankType"
                            value={bankForm.bankType}
                            onChange={handleBankChange}
                            className="block w-full text-gray-900 focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg px-3 text-sm transition"
                          >
                            <option value="">Select Account Type</option>
                            <option value="SAVING">Saving</option>
                            <option value="CURRENT">Current</option>
                          </select>
                        </div>
                      </div>

                      {/* Account Name */}
                      <div className="flex flex-col w-full">
                        <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold">
                          Account Name<span className="text-red-600">*</span>
                        </div>
                        <div className="relative mt-1">
                          <input
                            id="accountName"
                            placeholder="Enter Account Name"
                            className="block w-full text-gray-900 focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg px-3 text-sm transition"
                            autoComplete="off"
                            type="text"
                            name="accountName"
                            value={bankForm.accountName}
                            onChange={handleBankChange}
                          />
                        </div>
                      </div>

                      {/* Bank Name */}
                      <div className="flex flex-col w-full">
                        <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold">
                          Bank Name<span className="text-red-600">*</span>
                        </div>
                        <div className="relative mt-1">
                          <input
                            id="bankName"
                            placeholder="Enter Bank Name"
                            className="block w-full text-gray-900 focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg px-3 text-sm transition"
                            autoComplete="off"
                            type="text"
                            name="bankName"
                            value={bankForm.bankName}
                            onChange={handleBankChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* UPI FORM FIELDS */}
                  {selectedMethod === "UPI" && (
                    <>
                      {/* UPI ID */}
                      <div className="flex flex-col w-full">
                        <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold">
                          UPI ID<span className="text-red-600">*</span>
                        </div>
                        <div className="relative mt-1">
                          <input
                            id="upiId"
                            placeholder="Enter UPI ID (e.g. 9876543210@paytm)"
                            className="block w-full text-gray-900 focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg px-3 text-sm transition"
                            autoComplete="off"
                            type="text"
                            name="upiId"
                            value={upiForm.upiId}
                            onChange={handleUpiChange}
                          />
                        </div>
                      </div>

                      {/* Mobile No */}
                      <div className="flex flex-col w-full">
                        <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold">
                          Mobile No<span className="text-red-600">*</span>
                        </div>
                        <div className="relative mt-1">
                          <input
                            id="mobileNo"
                            placeholder="Enter Mobile Number"
                            className="block w-full text-gray-900 focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg px-3 text-sm transition"
                            autoComplete="off"
                            type="text"
                            inputMode="numeric"
                            name="mobileNo"
                            value={upiForm.mobileNo}
                            onChange={(e) =>
                              setUpiForm((prev) => ({
                                ...prev,
                                mobileNo: e.target.value.replace(/[^0-9]/g, ""),
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Account Name */}
                      <div className="flex flex-col w-full">
                        <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold">
                          Account Name<span className="text-red-600">*</span>
                        </div>
                        <div className="relative mt-1">
                          <input
                            id="accountNameUPI"
                            placeholder="Enter Account Name"
                            className="block w-full text-gray-900 focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg px-3 text-sm transition"
                            autoComplete="off"
                            type="text"
                            name="accountName"
                            value={upiForm.accountName}
                            onChange={handleUpiChange}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="flex items-start justify-center gap-x-2 my-2 px-1">
                  <div className="inline-flex items-center pt-0.5">
                    <label
                      className="relative flex cursor-pointer items-center rounded-md"
                      htmlFor="rulesAccept"
                    >
                      <input
                        id="rulesAccept"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="peer relative cursor-pointer appearance-none border border-gray-400 rounded-sm checked:border-green-600 checked:bg-green-600 h-4 w-4 transition-all"
                      />
                      <span className="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </label>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-800 font-lato font-[400] leading-5">
                    I have read and agree with{" "}
                    <span
                      onClick={() => setShowMoreRules(true)}
                      className="text-[#8b0a24] underline text-xs sm:text-sm font-lato font-semibold cursor-pointer"
                    >
                      the terms of payment and withdrawal policy.
                    </span>
                  </span>
                </div>

                {/* Submit Button */}
                <div className="w-full h-max">
                  <button
                    disabled={submitting || !isFormValid}
                    className="relative overflow-hidden transition duration-150 ease-in-out bg-[#8b0a24] hover:bg-[#72081d] active:scale-[99%] w-full text-white h-11 text-base shadow-md font-lato rounded-lg font-[900] leading-4 disabled:opacity-60 flex gap-x-1 items-center justify-center cursor-pointer"
                    type="submit"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>PROCESSING...</span>
                      </div>
                    ) : (
                      <span>SUBMIT</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

WithdrawalPage.Element = function Element() {
  return <WithdrawalPage />;
};
