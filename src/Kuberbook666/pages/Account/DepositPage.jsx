import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getactiveAdminDepositMethod,
  getPaymentsByUserId,
  uploadMedia,
  createPayment,
} from "../../../api/index";
import {
  getUserData,
  getUserId,
  selectDomainID,
} from "../../../utils/helper/commonSelectors";
import { generatePresignedUrl } from "../../../utils/helper/generatePresignedUrl";

export default function DepositPage() {
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

  // Step 1 = Amount Selection, Step 2 = Payment Gateway Details & Submission
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  // Dynamic Payment methods fetched from Admin API
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Selected Type: e.g. "UPI", "BANK", "QR", "USDT"
  const [selectedType, setSelectedType] = useState("");
  // Selected option index within that type
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  // Dynamic Presigned QR image URL
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [loadingQr, setLoadingQr] = useState(false);

  // UTR & Image Upload & Terms
  const [utr, setUtr] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);

  // Notice toggle
  const [showMoreRules, setShowMoreRules] = useState(false);

  // Deposit History
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryTab, setShowHistoryTab] = useState(false);

  // Carousel refs
  const typesScrollRef = useRef(null);
  const optionsScrollRef = useRef(null);

  // Quick Amount chips
  const quickAmounts = [100, 500, 1000, 5000, 10000, 50000];

  // Fetch admin deposit methods dynamically
  const fetchMethods = useCallback(async () => {
    try {
      setLoadingMethods(true);
      const res = await getactiveAdminDepositMethod();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      
      setPaymentMethods(list);

      if (list.length > 0) {
        const firstType = list[0]?.type?.toUpperCase() || "UPI";
        setSelectedType(firstType);
        setSelectedOptionIndex(0);
      }
    } catch (err) {
      console.error("Failed to load admin deposit methods:", err);
      setPaymentMethods([]);
    } finally {
      setLoadingMethods(false);
    }
  }, []);

  // Fetch deposit history
  const fetchHistory = useCallback(async () => {
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
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMethods();
    fetchHistory();
  }, [fetchMethods, fetchHistory]);

  // Extract unique payment types dynamically from API
  const availableTypes = useMemo(() => {
    if (!paymentMethods || paymentMethods.length === 0) return [];
    const typeSet = new Set();
    paymentMethods.forEach((m) => {
      const t = (m.type || "UPI").toUpperCase();
      typeSet.add(t);
    });
    return Array.from(typeSet);
  }, [paymentMethods]);

  // Filter active options for the chosen type
  const activeOptions = useMemo(() => {
    if (!paymentMethods || paymentMethods.length === 0) return [];
    if (!selectedType) return paymentMethods;
    return paymentMethods.filter(
      (m) => (m.type || "UPI").toUpperCase() === selectedType.toUpperCase()
    );
  }, [paymentMethods, selectedType]);

  // Current selected option
  const currentOption = useMemo(() => {
    if (activeOptions.length > 0) {
      return activeOptions[selectedOptionIndex] || activeOptions[0];
    }
    return null;
  }, [activeOptions, selectedOptionIndex]);

  // Resolve dynamic Presigned URL from Admin S3 key
  useEffect(() => {
    const resolveQr = async () => {
      const img = currentOption?.imageUrl;
      if (!img) {
        setQrImageUrl("");
        return;
      }
      if (img.startsWith("http://") || img.startsWith("https://")) {
        setQrImageUrl(img);
        return;
      }
      try {
        setLoadingQr(true);
        const presigned = await generatePresignedUrl(img);
        setQrImageUrl(presigned || img);
      } catch (err) {
        console.error("Presigned QR resolution error:", err);
        setQrImageUrl("");
      } finally {
        setLoadingQr(false);
      }
    };
    resolveQr();
  }, [currentOption]);

  // Copy helper
  const handleCopy = useCallback((text, label = "Details") => {
    if (!text) return;
    navigator.clipboard
      .writeText(String(text))
      .then(() => toast.success(`${label} copied to clipboard!`))
      .catch(() => toast.error("Failed to copy"));
  }, []);

  // Quick Amount chip click
  const handleChipClick = (val) => {
    const current = Number(amount) || 0;
    const next = current + val;
    setAmount(String(next));
    if (next >= 100) {
      setAmountError("");
    }
  };

  // Step 1: Submit Amount
  const handleAmountSubmit = (e) => {
    e?.preventDefault();
    const num = Number(amount);
    if (!num || isNaN(num) || num <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }
    if (num < 100) {
      setAmountError("Amount can't be less than 100");
      return;
    }
    if (num > 200000) {
      setAmountError("Maximum deposit amount is ₹200,000");
      return;
    }
    setAmountError("");
    setStep(2);
  };

  // Image Upload Handler
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    setImagePreview(URL.createObjectURL(file));

    // Upload to media server
    const cleanFileName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_.-]/g, "");
    const renamedFile = new File([file], cleanFileName, { type: file.type });
    const formData = new FormData();
    formData.append("image", renamedFile);

    setUploadingImage(true);
    try {
      const res = await uploadMedia(formData);
      const url = res?.data?.data?.url || res?.data?.url;
      if (url) {
        setUploadedImageUrl(url);
        toast.success("Receipt uploaded successfully!");
      } else {
        toast.error("Failed to retrieve image URL from server");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed. Please try again.");
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  // Final Submit Deposit Payment
  const handleSubmitPayment = async (e) => {
    e?.preventDefault();

    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }
    if (num < 100 || num > 200000) {
      toast.error("Amount must be between ₹100 and ₹200,000");
      return;
    }
    if (!utr.trim() || utr.trim().length < 6) {
      toast.error("Please enter a valid 12-digit UTR / Transaction ID");
      return;
    }
    if (!uploadedImageUrl) {
      toast.error("Please upload payment screenshot proof before submitting");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please agree to the terms of payment and withdrawal policy");
      return;
    }

    const payload = {
      UTR: utr.trim(),
      amount: num,
      image: uploadedImageUrl,
      PaymentMode: (currentOption?.type || selectedType || "upi").toLowerCase(),
      PaymentBy: userId,
      domainId: admindomainId || domainId,
      termsAccepted: true,
    };

    setSubmitting(true);
    try {
      const res = await createPayment(payload);
      if (
        res?.success ||
        res?.data?.success ||
        res?.statusCode === 200 ||
        res?.status === 200 ||
        res?.data?.message?.toLowerCase().includes("success") ||
        res?.message?.toLowerCase().includes("success")
      ) {
        toast.success(
          res?.data?.message ||
            res?.message ||
            "Deposit request submitted successfully! Funds will be credited after admin verification."
        );
        // Reset form
        setUtr("");
        setUploadedImageUrl("");
        setImagePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setStep(1);
        setAmount("");
        // Refresh deposit history
        fetchHistory();
      } else {
        toast.error(
          res?.data?.message || res?.message || "Deposit request failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Deposit submission error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit deposit request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Carousel scroll helpers
  const scrollTypes = (direction) => {
    if (typesScrollRef.current) {
      typesScrollRef.current.scrollBy({
        left: direction === "left" ? -150 : 150,
        behavior: "smooth",
      });
    }
  };

  const scrollOptions = (direction) => {
    if (optionsScrollRef.current) {
      optionsScrollRef.current.scrollBy({
        left: direction === "left" ? -150 : 150,
        behavior: "smooth",
      });
    }
  };

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} ${d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col transition-all ease-in-out duration-100 min-h-[calc(100dvh-110px)] bg-[#eef0f3] text-gray-900">
      <div className="flex items-start justify-start w-full">
        {/* Desktop Left Sidebar Menu */}
        <div
          title="Menu"
          id="leftDeskSideBar"
          className="hidden lg:flex p-2 overflow-y-auto z-10 w-[20%] h-[calc(100dvh-120px)] sticky top-[54px] lg:top-[110px]"
        >
          <ul className="flex border border-gray-200 bg-white overflow-x-hidden flex-col w-full shadow-sm rounded-lg">
            <li className="text-sm cursor-pointer py-3.5 whitespace-nowrap font-semibold w-full border-b border-gray-100 hover:bg-red-50">
              <a
                className="flex w-full items-center px-5 gap-3 text-gray-800"
                href="/sports-page/Cricket/4"
              >
                <span className="w-2 h-2 rounded-full bg-[#C10931]"></span>
                <span className="font-medium text-sm">Cricket</span>
              </a>
            </li>
            <li className="text-sm cursor-pointer py-3.5 whitespace-nowrap font-semibold w-full border-b border-gray-100 hover:bg-red-50">
              <a
                className="flex w-full items-center px-5 gap-3 text-gray-800"
                href="/sports-page/Football/1"
              >
                <span className="w-2 h-2 rounded-full bg-[#C10931]"></span>
                <span className="font-medium text-sm">Football</span>
              </a>
            </li>
            <li className="text-sm cursor-pointer py-3.5 whitespace-nowrap font-semibold w-full border-b border-gray-100 hover:bg-red-50">
              <a
                className="flex w-full items-center px-5 gap-3 text-gray-800"
                href="/sports-page/Tennis/2"
              >
                <span className="w-2 h-2 rounded-full bg-[#C10931]"></span>
                <span className="font-medium text-sm">Tennis</span>
              </a>
            </li>
            <li className="text-sm cursor-pointer py-3.5 whitespace-nowrap font-semibold w-full border-b border-gray-100 hover:bg-red-50">
              <a
                className="flex w-full items-center px-5 gap-3 text-gray-800"
                href="/casino"
              >
                <span className="w-2 h-2 rounded-full bg-[#C10931]"></span>
                <span className="font-medium text-sm">Casino</span>
              </a>
            </li>
            <li className="text-sm cursor-pointer py-3.5 whitespace-nowrap font-semibold w-full border-b border-gray-100 hover:bg-red-50">
              <a
                className="flex w-full items-center px-5 gap-3 text-gray-800"
                href="/live-casino"
              >
                <span className="w-2 h-2 rounded-full bg-[#C10931]"></span>
                <span className="font-medium text-sm">Live Casino</span>
              </a>
            </li>
            <li className="text-sm cursor-pointer py-3.5 whitespace-nowrap font-semibold w-full hover:bg-red-50">
              <a
                className="flex w-full items-center px-5 gap-3 text-gray-800"
                href="/withdraw"
              >
                <span className="w-2 h-2 rounded-full bg-[#C10931]"></span>
                <span className="font-medium text-sm">Withdraw</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Middle Main Content Container */}
        <div
          className="w-full md:mt-[0px] mt-[10px] lg:overflow-auto lg:w-[54%] pb-12"
          style={{ minHeight: "calc(100dvh - 110px)" }}
        >
          <div></div>
          <div className="mx-2 sm:mx-4">
            
            {/* ============================================================== */}
            {/* STEP 1: AMOUNT SELECTION (MATCHES EXACT SCREENSHOT)            */}
            {/* ============================================================== */}
            {step === 1 && (
              <div className="w-full mt-2.5 py-[15px] rounded-lg bg-white shadow-sm border border-gray-200 px-3 sm:px-4">
                <div className="font-lato font-bold text-gray-900 text-base leading-5">
                  <p>
                    Amount<span className="text-red-600 font-bold ml-0.5">*</span>
                  </p>
                </div>

                <div className="w-full mt-2 py-2 grid grid-cols-12 border rounded-[4px] px-2 items-center justify-center border-gray-300 bg-white focus-within:border-[#8b0a24]">
                  <input
                    className="block focus:outline-none bg-white col-span-11 w-full h-max font-lato placeholder:font-lato placeholder:font-normal font-bold text-base text-gray-900"
                    placeholder="Enter Amount"
                    autoComplete="off"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (Number(e.target.value) >= 100) setAmountError("");
                    }}
                  />
                  <span className="font-lato font-bold leading-4 text-gray-400 text-base col-span-1 text-center">
                    ₹
                  </span>
                </div>

                <span className="text-xs pl-1 mt-1 text-gray-500 font-lato block">
                  <span>Min 100</span>
                  <span className="text-xs"> - </span>
                  <span>Max 200000</span>
                </span>

                {/* Quick Amount Buttons */}
                <div className="w-full grid grid-cols-3 gap-[10px] mt-[18px]">
                  {quickAmounts.map((val) => (
                    <button
                      key={val}
                      onClick={() => handleChipClick(val)}
                      className="inline-block relative overflow-hidden transition-all ease-in-out duration-300 active:scale-95 text-white min-h-9 text-base font-lato rounded-md font-[800] leading-4 cursor-pointer shadow hover:opacity-95"
                      type="button"
                      style={{ background: "#8b0a24" }}
                    >
                      <span>+{val >= 1000 ? val.toLocaleString("en-IN") : val}</span>
                    </button>
                  ))}
                </div>

                {/* Error message if invalid amount */}
                {amountError ? (
                  <div className="my-2">
                    <span className="text-red-600 text-sm font-lato font-medium leading-4">
                      {amountError}
                    </span>
                  </div>
                ) : (
                  <div className="my-2 h-4"></div>
                )}

                <button
                  onClick={handleAmountSubmit}
                  className="relative overflow-hidden transition duration-150 ease-in-out flex items-center justify-center gap-x-2 w-full text-white h-10 text-base rounded-md font-[500] leading-4 cursor-pointer active:scale-95 shadow hover:opacity-95"
                  style={{ background: "#8b0a24" }}
                >
                  Submit
                </button>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: LOCKED AMOUNT + PAYMENT GATEWAY DETAILS               */}
            {/* ============================================================== */}
            {step === 2 && (
              <>
                {/* 1. Locked Amount Card */}
                <div className="w-full mt-2.5 py-[15px] rounded-lg bg-white shadow-sm border border-gray-200 px-3 sm:px-4">
                  <div className="font-lato font-bold text-gray-900 text-base leading-5">
                    <p>
                      Amount<span className="text-red-600 ml-0.5">*</span>
                    </p>
                  </div>

                  <div className="w-full mt-2 py-2 grid grid-cols-12 border-2 rounded-[4px] px-2 items-center justify-center border-green-600 bg-white">
                    <input
                      className="block focus:outline-none bg-white col-span-11 w-full h-max font-lato placeholder:font-lato placeholder:font-normal font-bold text-base text-gray-900"
                      placeholder="Enter Amount"
                      autoComplete="off"
                      type="number"
                      value={amount}
                      disabled
                    />
                    <span className="font-lato font-bold leading-4 text-green-600 text-base col-span-1 text-center">
                      ₹
                    </span>
                  </div>

                  <span className="text-xs pl-1 mt-1 text-gray-500 font-lato block">
                    <span>Min 100</span>
                    <span className="text-xs"> - </span>
                    <span>Max 200000</span>
                  </span>

                  <div className="my-2 h-2"></div>

                  <button
                    onClick={() => setStep(1)}
                    className="relative overflow-hidden transition duration-150 ease-in-out flex items-center justify-center gap-x-2 w-full text-white h-10 text-base rounded-md font-[500] leading-4 cursor-pointer active:scale-95 shadow hover:opacity-90"
                    style={{ background: "#8b0a24" }}
                  >
                    Edit
                  </button>
                </div>

                {loadingMethods ? (
                  <div className="w-full py-8 text-center text-xs text-gray-500 bg-white rounded-lg mt-2.5 border border-gray-200">
                    Loading active payment gateways...
                  </div>
                ) : availableTypes.length === 0 ? (
                  <div className="w-full py-8 text-center text-xs text-gray-500 bg-white rounded-lg mt-2.5 px-4 border border-gray-200">
                    No active deposit methods configured yet. Please contact support.
                  </div>
                ) : (
                  <>
                    {/* 2. Payment Types Carousel Card */}
                    <div className="rounded-lg mt-2.5 bg-white shadow-sm border border-gray-200 overflow-hidden transition-height duration-500 ease-in-out h-max px-3 pt-[15px] pb-[20px]">
                      <div className="flex flex-row justify-between items-center w-full">
                        <span className="text-base text-gray-900 font-lato font-bold leading-5">
                          Payment Types
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => scrollTypes("left")}
                            className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[26px] h-[26px] p-1 justify-center items-center text-gray-700 border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
                            type="button"
                            aria-label="Previous type"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 7 12" fill="none">
                              <path d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z" fill="#111827"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => scrollTypes("right")}
                            className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[26px] h-[26px] p-1 justify-center items-center text-gray-700 border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
                            type="button"
                            aria-label="Next type"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 7 12" fill="none" className="-rotate-180">
                              <path d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z" fill="#111827"></path>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div
                        id="payMentOptions"
                        ref={typesScrollRef}
                        className="flex items-center gap-x-2 pt-[18px] pb-[8px] overflow-x-auto no-scrollbar scroll-smooth cursor-pointer w-full transition-all ease-in-out duration-150"
                      >
                        {availableTypes.map((typeKey) => {
                          const isSelected = selectedType.toUpperCase() === typeKey.toUpperCase();
                          return (
                            <div
                              key={typeKey}
                              onClick={() => {
                                setSelectedType(typeKey);
                                setSelectedOptionIndex(0);
                              }}
                              className={`flex justify-start items-center flex-col gap-y-2 rounded-[10px] bg-white py-2 w-full min-w-[117px] max-w-[130px] px-[20px] relative border transition duration-150 shadow-sm ${
                                isSelected
                                  ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md"
                                  : "border-gray-200 hover:border-gray-400"
                              }`}
                            >
                              <div className="absolute top-1 right-1">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "border-red-600 bg-red-600"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-y-2 flex-col w-full py-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-800">
                                  {typeKey.slice(0, 3)}
                                </div>
                                <span className="text-xs text-gray-900 font-lato font-bold truncate w-full uppercase text-center">
                                  {typeKey}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Payment Options Carousel Card */}
                    {activeOptions.length > 0 && (
                      <div className="mt-2 rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden transition-height duration-500 ease-in-out h-max px-3 pt-[15px] pb-[20px]">
                        <div className="flex flex-row justify-between items-center w-full">
                          <span className="text-base text-gray-900 font-lato font-bold leading-5 flex items-center">
                            Payment Options
                            <span className="ml-1.5 inline-flex items-center justify-center size-5 rounded-full text-green-700 bg-green-100 font-bold text-xs border border-green-500">
                              {activeOptions.length}
                            </span>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => scrollOptions("left")}
                              className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[26px] h-[26px] p-1 justify-center items-center text-gray-700 border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
                              type="button"
                              aria-label="Previous option"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 7 12" fill="none">
                                <path d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z" fill="#111827"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => scrollOptions("right")}
                              className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex w-[26px] h-[26px] p-1 justify-center items-center text-gray-700 border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
                              type="button"
                              aria-label="Next option"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 7 12" fill="none" className="-rotate-180">
                                <path d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z" fill="#111827"></path>
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div
                          id="payMentOptions"
                          ref={optionsScrollRef}
                          className="flex items-center gap-x-2 pt-3 pb-2.5 overflow-x-auto no-scrollbar scroll-smooth cursor-pointer w-full transition-all ease-in-out duration-150"
                        >
                          {activeOptions.map((opt, idx) => {
                            const isSelected = selectedOptionIndex === idx;
                            const holder =
                              opt.accountHolder ||
                              opt.accountHolderName ||
                              opt.bankName ||
                              opt.upiId ||
                              `Account ${idx + 1}`;
                            const min = opt.minAmount || 100;
                            const max = opt.maxAmount || 200000;

                            return (
                              <div
                                key={opt._id || idx}
                                onClick={() => setSelectedOptionIndex(idx)}
                                className={`overflow-hidden h-full min-w-max relative border rounded-[10px] pl-2 pr-4 py-2 sm:pl-[10px] sm:pr-[25px] gap-x-2.5 sm:py-2.5 transition-all duration-200 ease-in-out bg-white shadow-sm ${
                                  isSelected
                                    ? "border-blue-600 ring-2 ring-blue-500/20"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                <div className="flex flex-col gap-y-2 items-start sm:items-center justify-center sm:flex-row sm:justify-between sm:gap-x-4 min-w-max">
                                  <div className="flex items-start justify-between w-full gap-x-2">
                                    <div className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                                      {opt.type || selectedType}
                                    </div>
                                    <div className="sm:absolute top-2 right-2">
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                          isSelected
                                            ? "border-red-600 bg-red-600"
                                            : "border-gray-300 bg-white"
                                        }`}
                                      >
                                        {isSelected && (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-start gap-y-1 min-w-[100px] max-w-[130px]">
                                    <span className="font-lato font-bold truncate w-full uppercase text-left text-xs text-gray-900">
                                      {holder}
                                    </span>
                                    <div className="flex w-full gap-x-1 sm:gap-x-3 items-start sm:items-center text-xs font-lato text-gray-600">
                                      <div className="flex sm:flex-col gap-y-0.5">
                                        <span className="hidden sm:block text-[10px] text-gray-500">Min</span>
                                        <span className="font-bold font-roboto text-xs whitespace-nowrap">
                                          ₹ {min}
                                        </span>
                                      </div>
                                      <div className="block sm:hidden">-</div>
                                      <div className="flex flex-col gap-y-0.5">
                                        <span className="hidden sm:block text-[10px] text-gray-500">Max</span>
                                        <span className="font-bold font-roboto text-xs whitespace-nowrap">
                                          ₹ {max >= 1000 ? max.toLocaleString("en-IN") : max}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <p className="text-xs md:text-sm pt-2 font-lato font-normal leading-4 text-gray-700">
                          1. Deposit money only in the below available accounts to get the fastest credits and avoid possible delays.
                        </p>
                        {showMoreRules && (
                          <div className="mt-2 space-y-1 text-xs text-gray-600 font-lato leading-relaxed border-t border-gray-100 pt-2">
                            <p>2. Please do not save account details. Always check the active gateway before transferring.</p>
                            <p>3. After payment, copy the exact 12-digit UTR/Transaction Reference number.</p>
                            <p>4. Upload the original payment screenshot for quick verification.</p>
                          </div>
                        )}
                        <p
                          onClick={() => setShowMoreRules(!showMoreRules)}
                          className="text-[#8b0a24] pt-1 font-sans text-xs md:text-sm font-semibold cursor-pointer hover:underline"
                        >
                          {showMoreRules ? "See Less.." : "See More.."}
                        </p>
                      </div>
                    )}

                    {/* 4. Payment Details Card */}
                    {currentOption && (
                      <div className="w-full mt-2.5 rounded-[10px] bg-white shadow-sm border border-gray-200 text-gray-900 px-3 py-[15px]">
                        <div className="w-full relative bottom-[4px] right-[4px]">
                          <span
                            className="text-xs sm:text-sm mt-1 rounded font-roboto shadow-md text-white px-3 py-1 my-1 inline-block font-bold"
                            style={{ background: "#8b0a24" }}
                          >
                            Current Available Balance: ₹ {balance}
                          </span>
                        </div>

                        <div className="font-bold mt-[4px] text-base leading-5">
                          <span>Payment Details</span>
                        </div>

                        {/* Dynamic QR Code from Admin API */}
                        {qrImageUrl && (
                          <div className="flex items-center mt-3 justify-center w-full">
                            <div className="relative overflow-hidden rounded-lg shadow-md border border-gray-200 bg-white p-2 max-w-[220px]">
                              {loadingQr ? (
                                <div className="w-[180px] h-[180px] flex items-center justify-center text-xs text-gray-500">
                                  Loading QR...
                                </div>
                              ) : (
                                <img
                                  src={qrImageUrl}
                                  alt="Payment QR"
                                  className="rounded-lg shadow-sm border object-contain w-[180px] h-[180px]"
                                  loading="lazy"
                                  width="180"
                                  height="180"
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dynamic UPI ID */}
                        {currentOption.upiId && (
                          <div className="mt-3 w-full border-b border-gray-100 pb-2">
                            <span className="flex flex-col items-start justify-start">
                              <span className="text-gray-500 text-[10px] leading-4 sm:text-xs">
                                UPI ID
                              </span>
                              <div className="flex items-center justify-between w-full text-base font-semibold leading-5 tracking-wide">
                                <span className="font-mono text-sm sm:text-base text-gray-900">
                                  {currentOption.upiId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(currentOption.upiId, "UPI ID")}
                                  className="p-1.5 rounded hover:bg-gray-100 text-[#c10931] cursor-pointer"
                                  title="Copy UPI ID"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14" fill="none">
                                    <path
                                      d="M8.50391 14H3.28125C2.07503 14 1.09375 13.0187 1.09375 11.8125V4.40234C1.09375 3.19612 2.07503 2.21484 3.28125 2.21484H8.50391C9.71013 2.21484 10.6914 3.19612 10.6914 4.40234V11.8125C10.6914 13.0187 9.71013 14 8.50391 14ZM3.28125 3.30859C2.67819 3.30859 2.1875 3.79929 2.1875 4.40234V11.8125C2.1875 12.4156 2.67819 12.9062 3.28125 12.9062H8.50391C9.10696 12.9062 9.59766 12.4156 9.59766 11.8125V4.40234C9.59766 3.79929 9.10696 3.30859 8.50391 3.30859H3.28125ZM12.8789 10.4453V2.1875C12.8789 0.981277 11.8976 0 10.6914 0H4.62109C4.31903 0 4.07422 0.244812 4.07422 0.546875C4.07422 0.848938 4.31903 1.09375 4.62109 1.09375H10.6914C11.2945 1.09375 11.7852 1.58444 11.7852 2.1875V10.4453C11.7852 10.7474 12.03 10.9922 12.332 10.9922C12.6341 10.9922 12.8789 10.7474 12.8789 10.4453Z"
                                      fill="#C10B32"
                                    ></path>
                                  </svg>
                                </button>
                              </div>
                            </span>
                          </div>
                        )}

                        {/* Dynamic Bank Name */}
                        {currentOption.bankName && (
                          <div className="mt-2.5 w-full border-b border-gray-100 pb-2">
                            <span className="flex flex-col items-start justify-start">
                              <span className="text-gray-500 text-[10px] leading-4 sm:text-xs">
                                Bank Name
                              </span>
                              <div className="flex items-center justify-between w-full text-base font-semibold leading-5 tracking-wide">
                                <span>{currentOption.bankName}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(currentOption.bankName, "Bank Name")}
                                  className="p-1.5 rounded hover:bg-gray-100 text-[#c10931]"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M8.50391 14H3.28125C2.07503 14 1.09375 13.0187 1.09375 11.8125V4.40234C1.09375 3.19612 2.07503 2.21484 3.28125 2.21484H8.50391C9.71013 2.21484 10.6914 3.19612 10.6914 4.40234V11.8125C10.6914 13.0187 9.71013 14 8.50391 14Z" fill="#C10B32"></path>
                                  </svg>
                                </button>
                              </div>
                            </span>
                          </div>
                        )}

                        {/* Dynamic Account Number */}
                        {currentOption.accountNumber && (
                          <div className="mt-2.5 w-full border-b border-gray-100 pb-2">
                            <span className="flex flex-col items-start justify-start">
                              <span className="text-gray-500 text-[10px] leading-4 sm:text-xs">
                                Account Number
                              </span>
                              <div className="flex items-center justify-between w-full text-base font-semibold leading-5 tracking-wide">
                                <span className="font-mono">{currentOption.accountNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(currentOption.accountNumber, "Account Number")}
                                  className="p-1.5 rounded hover:bg-gray-100 text-[#c10931]"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M8.50391 14H3.28125C2.07503 14 1.09375 13.0187 1.09375 11.8125V4.40234C1.09375 3.19612 2.07503 2.21484 3.28125 2.21484H8.50391C9.71013 2.21484 10.6914 3.19612 10.6914 4.40234V11.8125C10.6914 13.0187 9.71013 14 8.50391 14Z" fill="#C10B32"></path>
                                  </svg>
                                </button>
                              </div>
                            </span>
                          </div>
                        )}

                        {/* Dynamic IFSC Code */}
                        {currentOption.ifscCode && (
                          <div className="mt-2.5 w-full border-b border-gray-100 pb-2">
                            <span className="flex flex-col items-start justify-start">
                              <span className="text-gray-500 text-[10px] leading-4 sm:text-xs">
                                IFSC Code
                              </span>
                              <div className="flex items-center justify-between w-full text-base font-semibold leading-5 tracking-wide">
                                <span className="font-mono">{currentOption.ifscCode}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(currentOption.ifscCode, "IFSC Code")}
                                  className="p-1.5 rounded hover:bg-gray-100 text-[#c10931]"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M8.50391 14H3.28125C2.07503 14 1.09375 13.0187 1.09375 11.8125V4.40234C1.09375 3.19612 2.07503 2.21484 3.28125 2.21484H8.50391C9.71013 2.21484 10.6914 3.19612 10.6914 4.40234V11.8125C10.6914 13.0187 9.71013 14 8.50391 14Z" fill="#C10B32"></path>
                                  </svg>
                                </button>
                              </div>
                            </span>
                          </div>
                        )}

                        {/* Dynamic Account Holder Name */}
                        {(currentOption.accountHolder || currentOption.accountHolderName) && (
                          <div className="mt-2.5 w-full">
                            <span className="flex flex-col items-start justify-start">
                              <span className="text-gray-500 text-[10px] leading-4 sm:text-xs">
                                Account Name
                              </span>
                              <div className="flex items-center justify-between w-full text-base font-semibold leading-5 tracking-wide">
                                <span>{currentOption.accountHolder || currentOption.accountHolderName}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(
                                      currentOption.accountHolder || currentOption.accountHolderName,
                                      "Account Name"
                                    )
                                  }
                                  className="p-1.5 rounded hover:bg-gray-100 text-[#c10931] cursor-pointer"
                                  title="Copy Account Name"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14" fill="none">
                                    <path
                                      d="M8.50391 14H3.28125C2.07503 14 1.09375 13.0187 1.09375 11.8125V4.40234C1.09375 3.19612 2.07503 2.21484 3.28125 2.21484H8.50391C9.71013 2.21484 10.6914 3.19612 10.6914 4.40234V11.8125C10.6914 13.0187 9.71013 14 8.50391 14ZM3.28125 3.30859C2.67819 3.30859 2.1875 3.79929 2.1875 4.40234V11.8125C2.1875 12.4156 2.67819 12.9062 3.28125 12.9062H8.50391C9.10696 12.9062 9.59766 12.4156 9.59766 11.8125V4.40234C9.59766 3.79929 9.10696 3.30859 8.50391 3.30859H3.28125ZM12.8789 10.4453V2.1875C12.8789 0.981277 11.8976 0 10.6914 0H4.62109C4.31903 0 4.07422 0.244812 4.07422 0.546875C4.07422 0.848938 4.31903 1.09375 4.62109 1.09375H10.6914C11.2945 1.09375 11.7852 1.58444 11.7852 2.1875V10.4453C11.7852 10.7474 12.03 10.9922 12.332 10.9922C12.6341 10.9922 12.8789 10.7474 12.8789 10.4453Z"
                                      fill="#C10B32"
                                    ></path>
                                  </svg>
                                </button>
                              </div>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. Upload Payment Slip Card */}
                    <form onSubmit={handleSubmitPayment}>
                      <div className="w-full mt-2.5 rounded-md bg-white shadow-sm border border-gray-200 py-3.5 px-3">
                        <div className="font-lato font-bold text-gray-900 leading-5">
                          Upload your payment slip below<span className="text-red-600 ml-0.5">*</span>
                        </div>

                        <div className="w-full relative mt-2">
                          <label
                            className="flex items-center border border-dashed border-gray-300 rounded-[4px] py-3 pl-3 pr-1 cursor-pointer hover:border-[#8b0a24] transition bg-gray-50/50"
                            htmlFor="image-uploader"
                          >
                            <input
                              ref={fileInputRef}
                              className="hidden w-0 h-0"
                              accept=".jpg,.jpeg,.png,.pdf,.webp"
                              type="file"
                              id="image-uploader"
                              name="image-uploader"
                              onChange={handleImageChange}
                            />
                            <span className="cursor-pointer pl-8 font-inherit text-base text-gray-800 font-normal">
                              {uploadingImage ? "Uploading..." : "Upload"}
                            </span>
                            <span className="ml-1 font-inherit text-base text-gray-500 font-normal">
                              or drop a file right here
                            </span>
                          </label>

                          <div className="absolute top-[14px] left-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M21.7491 10.9999V16.9999C21.8078 17.5066 21.7512 18.0199 21.5835 18.5016C21.4158 18.9833 21.1414 19.4209 20.7807 19.7815C20.42 20.1422 19.9825 20.4166 19.5008 20.5843C19.0191 20.752 18.5057 20.8086 17.9991 20.7499H5.99906C5.4924 20.8086 4.97902 20.752 4.49732 20.5843C4.01563 20.4166 3.57808 20.1422 3.21742 19.7815C2.85676 19.4209 2.58232 18.9833 2.41463 18.5016C2.24694 18.0199 2.19034 17.5066 2.24906 16.9999V6.9999C2.19034 6.49324 2.24694 5.97986 2.41463 5.49817C2.58232 5.01647 2.85676 4.57893 3.21742 4.21827C3.57808 3.8576 4.01563 3.58316 4.49732 3.41547C4.97902 3.24778 5.4924 3.19118 5.99906 3.2499H13.9991C14.198 3.2499 14.3887 3.32892 14.5294 3.46957C14.67 3.61023 14.7491 3.80099 14.7491 3.9999C14.7491 4.19882 14.67 4.38958 14.5294 4.53023C14.3887 4.67089 14.198 4.7499 13.9991 4.7499H5.99906C4.42206 4.7499 3.74906 5.4229 3.74906 6.9999V16.2499L6.28906 13.7099C6.47787 13.5226 6.73307 13.4174 6.99906 13.4174C7.26505 13.4174 7.52025 13.5226 7.70906 13.7099L8.64906 14.6499C8.74252 14.7415 8.86818 14.7928 8.99906 14.7928C9.12994 14.7928 9.2556 14.7415 9.34906 14.6499L14.2891 9.7099C14.4779 9.52255 14.7331 9.41742 14.9991 9.41742C15.265 9.41742 15.5203 9.52255 15.7091 9.7099L20.2491 14.2499V10.9999C20.2491 10.801 20.3281 10.6102 20.4687 10.4696C20.6094 10.3289 20.8001 10.2499 20.9991 10.2499C21.198 10.2499 21.3887 10.3289 21.5294 10.4696C21.67 10.6102 21.7491 10.801 21.7491 10.9999ZM7.99206 7.7499C7.66005 7.75083 7.34198 7.88349 7.1077 8.11875C6.87342 8.35401 6.7421 8.67264 6.74256 9.00465C6.74302 9.33666 6.87524 9.65492 7.11017 9.88952C7.34511 10.1241 7.66355 10.2559 7.99556 10.2559C8.32757 10.2559 8.64601 10.1241 8.88095 9.88952C9.11588 9.65492 9.24809 9.33666 9.24856 9.00465C9.24902 8.67264 9.1177 8.35401 8.88342 8.11875C8.64914 7.88349 8.33107 7.75083 7.99906 7.7499H7.99206ZM18.5291 5.0299L18.7491 4.8109V6.9999C18.7491 7.19882 18.8281 7.38958 18.9687 7.53023C19.1094 7.67089 19.3001 7.7499 19.4991 7.7499C19.698 7.7499 19.8887 7.67089 20.0294 7.53023C20.17 7.38958 20.2491 7.19882 20.2491 6.9999V4.8109L20.4691 5.0299C20.6112 5.16238 20.7993 5.23451 20.9936 5.23108C21.1879 5.22765 21.3733 5.14894 21.5107 5.01153C21.6481 4.87411 21.7268 4.68873 21.7302 4.49443C21.7337 4.30013 21.6615 4.11208 21.5291 3.9699L20.0291 2.4699C19.8883 2.3297 19.6977 2.25098 19.4991 2.25098C19.3004 2.25098 19.1098 2.3297 18.9691 2.4699L17.4691 3.9699C17.3366 4.11208 17.2645 4.30013 17.2679 4.49443C17.2713 4.68873 17.35 4.87411 17.4874 5.01153C17.6249 5.14894 17.8102 5.22765 18.0045 5.23108C18.1988 5.23451 18.3869 5.16238 18.5291 5.0299Z"
                                fill="#c10931"
                              ></path>
                            </svg>
                          </div>
                        </div>

                        {/* Preview of Uploaded Slip */}
                        {imagePreview && (
                          <div className="mt-3 flex items-center gap-3 p-2 rounded border border-gray-200 bg-gray-50">
                            <img
                              src={imagePreview}
                              alt="Slip preview"
                              className="h-16 w-16 object-cover rounded shadow-sm border border-gray-300"
                            />
                            <div className="flex flex-col text-xs">
                              <span className="font-bold text-gray-800">
                                Receipt Selected
                              </span>
                              <span className="text-gray-500">
                                {uploadingImage ? "Uploading to server..." : "Upload complete ✓"}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview("");
                                  setUploadedImageUrl("");
                                  if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="text-red-500 hover:underline mt-1 text-[11px] text-left"
                              >
                                Remove file
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 6. Unique Transaction Reference (UTR) Card */}
                      <div className="w-full mt-2.5 bg-white shadow-sm border border-gray-200 rounded-md px-3 py-3.5">
                        <div className="font-lato font-bold text-gray-900 text-sm mb-2 leading-5">
                          Unique Transaction Reference<span className="text-red-600 ml-0.5">*</span>
                        </div>
                        <div className="w-full relative font-lato">
                          <input
                            className="block w-full focus:outline-none border-[1px] bg-white font-lato px-3 py-2.5 rounded-[4px] placeholder:font-lato font-semibold text-base border-gray-300 focus:border-[#8b0a24] text-gray-900"
                            placeholder="Enter UTR/RRN No"
                            minLength={6}
                            maxLength={24}
                            autoComplete="off"
                            type="text"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* 7. Terms & Conditions Agreement */}
                      <div className="flex items-start justify-center gap-x-2 py-3 px-3 sm:px-5">
                        <div className="inline-flex items-center pt-0.5">
                          <label className="relative flex cursor-pointer items-center rounded" htmlFor="termsCheckbox">
                            <input
                              id="termsCheckbox"
                              type="checkbox"
                              checked={termsAccepted}
                              onChange={(e) => setTermsAccepted(e.target.checked)}
                              className="w-4 h-4 rounded text-[#8b0a24] border-gray-300 focus:ring-[#8b0a24] cursor-pointer"
                            />
                          </label>
                        </div>
                        <span className="text-sm text-gray-700 font-lato font-[400] leading-5">
                          I have read and agree with{" "}
                          <span className="text-[#8b0a24] underline text-sm font-lato font-[400] leading-4 cursor-pointer">
                            the terms of payment and withdrawal policy.
                          </span>
                        </span>
                      </div>

                      {/* 8. Submit Button */}
                      <div className="w-full text-center py-2 px-2">
                        <button
                          type="submit"
                          disabled={submitting || uploadingImage}
                          className="relative overflow-hidden transition duration-150 ease-in-out flex items-center justify-center gap-x-2 w-full text-white h-10 text-base rounded-md font-[500] leading-4 cursor-pointer active:scale-95 shadow disabled:opacity-60 hover:opacity-95"
                          style={{ background: "#8b0a24" }}
                        >
                          <span>{submitting ? "SUBMITTING..." : "SUBMIT"}</span>
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* 9. Notes Card */}
                <div className="w-full h-max flex flex-col items-center justify-start bg-white shadow-sm border border-gray-200 px-3 py-[15px] rounded-md mb-2 mt-3">
                  <h2 className="text-gray-900 w-full text-base font-bold font-lato">
                    Notes
                  </h2>

                  <div className="w-full flex items-center justify-start mt-4 gap-y-4 flex-col">
                    {/* Step 1 */}
                    <div className="flex w-full flex-row items-start gap-x-3 justify-start">
                      <span className="p-1.5 min-w-5 min-h-5 aspect-square bg-[#8b0a24] flex items-center justify-center rounded-full text-[11px] font-lato text-white font-bold">
                        1
                      </span>
                      <div className="flex items-start justify-start flex-col gap-y-0.5">
                        <span className="text-gray-900 font-bold text-sm leading-4">
                          Send Amount
                        </span>
                        <span className="text-gray-600 font-medium text-[13px] leading-4">
                          Send your deposit amount on the given bank account or UPI.
                        </span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex w-full flex-row items-start gap-x-3 justify-start">
                      <span className="p-1.5 min-w-5 min-h-5 aspect-square bg-[#8b0a24] flex items-center justify-center rounded-full text-[11px] font-lato text-white font-bold">
                        2
                      </span>
                      <div className="flex items-start justify-start flex-col gap-y-1 w-full">
                        <span className="text-gray-900 font-bold text-sm leading-4">
                          Attach Screenshot
                        </span>
                        <div className="w-full flex flex-col items-start justify-start text-[13px] text-gray-600">
                          <span>Copy and Enter the 12 digit UTR Number.</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex w-full flex-row items-start gap-x-3 justify-start">
                      <span className="p-1.5 min-w-5 min-h-5 aspect-square bg-[#8b0a24] flex items-center justify-center rounded-full text-[11px] font-lato text-white font-bold">
                        3
                      </span>
                      <div className="flex items-start justify-start flex-col gap-y-0.5">
                        <span className="text-gray-900 font-bold text-sm leading-4">
                          Upload Proof
                        </span>
                        <span className="text-gray-600 font-medium text-[13px] leading-4">
                          Upload transaction Screenshot.
                        </span>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex w-full flex-row items-start gap-x-3 justify-start">
                      <span className="p-1.5 min-w-5 min-h-5 aspect-square bg-[#8b0a24] flex items-center justify-center rounded-full text-[11px] font-lato text-white font-bold">
                        4
                      </span>
                      <div className="flex items-start justify-start flex-col gap-y-0.5">
                        <span className="text-gray-900 font-bold text-sm leading-4">
                          Submit
                        </span>
                        <span className="text-gray-600 font-medium text-[13px] leading-4">
                          Submit the form &amp; Receive credits instantly.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10. Deposit History Toggle & List */}
                <div className="w-full mt-3">
                  <button
                    type="button"
                    onClick={() => setShowHistoryTab(!showHistoryTab)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-white shadow-sm border border-gray-200 font-bold text-sm text-gray-900"
                  >
                    <span>Deposit History ({history.length})</span>
                    <span className="text-xs text-[#8b0a24]">
                      {showHistoryTab ? "Hide History ▲" : "View History ▼"}
                    </span>
                  </button>

                  {showHistoryTab && (
                    <div className="mt-2 rounded-lg bg-white shadow-sm border border-gray-200 p-3 overflow-x-auto">
                      {loadingHistory ? (
                        <div className="text-center py-6 text-xs text-gray-500">
                          Loading past deposits...
                        </div>
                      ) : history.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-500">
                          No deposit transactions recorded yet.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-gray-200 text-gray-500 pb-2">
                              <th className="py-2 px-2">Date</th>
                              <th className="py-2 px-2">Amount</th>
                              <th className="py-2 px-2">Mode</th>
                              <th className="py-2 px-2">UTR</th>
                              <th className="py-2 px-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {history.map((item, idx) => {
                              const st = (item.status || "pending").toLowerCase();
                              let badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
                              if (st === "accepted" || st === "approved" || st === "success") {
                                badgeColor = "bg-green-100 text-green-800 border-green-300";
                              } else if (st === "rejected" || st === "failed") {
                                badgeColor = "bg-red-100 text-red-800 border-red-300";
                              }

                              return (
                                <tr key={item._id || idx} className="hover:bg-gray-50">
                                  <td className="py-2.5 px-2 text-gray-600 whitespace-nowrap">
                                    {formatDate(item.createdAt || item.date)}
                                  </td>
                                  <td className="py-2.5 px-2 font-bold text-gray-900">
                                    ₹ {item.amount}
                                  </td>
                                  <td className="py-2.5 px-2 uppercase text-gray-600">
                                    {item.PaymentMode || item.type || "UPI"}
                                  </td>
                                  <td className="py-2.5 px-2 font-mono text-gray-700">
                                    {item.UTR || item.utr || "-"}
                                  </td>
                                  <td className="py-2.5 px-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase ${badgeColor}`}
                                    >
                                      {item.status || "Pending"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
