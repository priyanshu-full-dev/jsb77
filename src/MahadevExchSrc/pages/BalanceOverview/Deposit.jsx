import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BsQrCode, BsBank2, BsWhatsapp } from "react-icons/bs";
import { IoMdDownload } from "react-icons/io";
import { AiOutlinePaperClip } from "react-icons/ai";
import { FaCopy, FaDollarSign } from "react-icons/fa";



import { getUserId, selectSite } from "../../../utils/helper/commonSelectors";
import {
  createPayment,
  getactiveAdminDepositMethod,
  uploadMedia,
} from "../../../api";
import { generatePresignedUrl } from "../../../utils/helper/generatePresignedUrl";
import Loader from "../../components/Loader/Loader";

const INITIAL_FORM_DATA = {
  UTR: "",
  amount: "",
  image: null,
  termsAccepted: false,
  PaymentMode: "QR",
  PaymentBy: "",
  domainId: "",
};

// const UpiRow = ({ upi }) => {
//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(upi);
//       toast.success("UPI ID copied");
//     } catch {
//       toast.error("Failed to copy");
//     }
//   };

//   return (
//     <div className="flex items-center justify-between bg-[#f8fafc] border border-gray-200 rounded px-3 py-2">
//       <span className="text-sm text-gray-800 break-all">{upi}</span>
//       <button
//         onClick={handleCopy}
//         className="text-gray-500 hover:text-[#0c385c] transition"
//         title="Copy UPI ID"
//       >
//         <FaCopy size={18} />
//       </button>
//     </div>
//   );
// };

const Deposit = () => {
  const siteDetails = useSelector(selectSite());
  const userID = useSelector(getUserId());
  const domainId = useSelector(
    (state) => state?.site?.siteDetails?.admindomainName?._id || "",
  );

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(null);

  const handleCopyUpi = (upi) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(upi);

    setTimeout(() => {
      setCopiedUpi(null);
    }, 2000); // 2 sec baad reset
  };

  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState();
  useEffect(() => {
    if (!selectedPayment) return;

    if (selectedPayment.method === "qr") {
      setActiveTab("QR");
    } else if (selectedPayment.method === "usdt") {
      setActiveTab("USDT");
    } else {
      setActiveTab("Bank");
    }
  }, [selectedPayment]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [paymentDetails, setPaymentDetails] = useState({
    account: [],
    gpay: [],
    usdt: [],
  });

  const allPayments = [
    ...paymentDetails.account.map((i) => ({ ...i, method: "bank" })),
    ...paymentDetails.gpay.map((i) => ({ ...i, method: "qr" })),
    ...paymentDetails.usdt.map((i) => ({ ...i, method: "usdt" })),
  ];

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [usdtImageUrl, setUsdtImageUrl] = useState("");
  const fileInputRef = useRef(null);

  // Update formData with userID and domainId
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      PaymentBy: userID || "",
      domainId: domainId || "",
    }));
  }, [userID, domainId]);

  // Fetch payment details
  useEffect(() => {
    fetchData();
  }, []);

  // Generate presigned URL for QR code
  useEffect(() => {
    const generateUrl = async () => {
      if (paymentDetails.gpay?.[0]?.imageUrl) {
        setLoading(true);
        try {
          const key = paymentDetails.gpay[0].imageUrl;
          const presignedUrl = await generatePresignedUrl(key);
          setQrImageUrl(presignedUrl);
        } catch (error) {
          toast.error("Failed to load QR code");
          console.error("QR code error:", error);
          setQrImageUrl("");
        } finally {
          setLoading(false);
        }
      }
    };
    generateUrl();
  }, [paymentDetails.gpay]);

  // Generate presigned URL for USDT QR code
  useEffect(() => {
    const generateUsdtUrl = async () => {
      if (paymentDetails.usdt?.[0]?.imageUrl) {
        setLoading(true);
        try {
          const key = paymentDetails.usdt[0].imageUrl;
          const presignedUrl = await generatePresignedUrl(key);
          setUsdtImageUrl(presignedUrl);
        } catch (error) {
          toast.error("Failed to load USDT QR code");
          console.error("USDT QR code error:", error);
          setUsdtImageUrl("");
        } finally {
          setLoading(false);
        }
      }
    };
    generateUsdtUrl();
  }, [paymentDetails.usdt]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getactiveAdminDepositMethod();
      const account = res?.data?.filter((acc) => acc.type === "bank") || [];
      const gpay = res?.data?.filter((acc) => acc.type === "qr") || [];
      const usdt = res?.data?.filter((acc) => acc.type === "usdt") || [];
      setPaymentDetails({ account, gpay, usdt });
    } catch (error) {
      toast.error("Failed to fetch payment details");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const newValue = e.target.value;
    if (/^\d*$/.test(newValue)) {
      setFormData((prev) => ({
        ...prev,
        amount: newValue,
      }));
    }
  };

  const handleIncreaseAmount = (value) => {
    setFormData((prev) => {
      const currentAmount = parseInt(prev.amount) || 0;
      const newAmount = currentAmount + parseInt(value);
      return { ...prev, amount: newAmount.toString() };
    });
  };

  const handleFormInputChange = async (e) => {
    const { id, value, type, checked, files } = e.target;

    if (type === "file" && files?.[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      const cleanedFileName = file.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.-]/g, "");
      const renamedFile = new File([file], cleanedFileName, {
        type: file.type,
      });

      const imageFormData = new FormData();
      imageFormData.append("image", renamedFile);

      setLoading(true);
      try {
        const response = await uploadMedia(imageFormData);
        const imageUrl = response?.data?.data?.url;
        if (imageUrl) {
          setFormData((prev) => ({ ...prev, image: imageUrl }));
          toast.success("Image uploaded successfully");
        } else {
          throw new Error("No image URL returned");
        }
      } catch (error) {
        toast.error("Failed to upload image");
        console.error("Upload error:", error);
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview("");
      } finally {
        setLoading(false);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleNextStep = () => {
    if (!selectedPayment) {
      toast.error("Please select a payment method first");
      return;
    }

    const amount = Number(formData.amount);

    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    const minAmount = Number(selectedPayment.minAmount);
    const maxAmount = Number(selectedPayment.maxAmount);

    if (amount < minAmount) {
      toast.error(`Minimum deposit amount is ₹${minAmount}`);
      return;
    }

    if (amount > maxAmount) {
      toast.error(`Maximum deposit amount is ₹${maxAmount}`);
      return;
    }

    if (!formData.domainId) {
      toast.error("Domain ID is missing");
      return;
    }

    if (!formData.PaymentBy) {
      toast.error("User ID is missing");
      return;
    }

    setStep(2);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setFormData((prev) => ({
      ...prev,
      PaymentMode: tab === "QR" ? "QR" : tab === "USDT" ? "USDT" : "Bank",
      PaymentBy:
        tab === "QR"
          ? paymentDetails.gpay?.[0]?.accountHolderName || userID
          : tab === "USDT"
            ? paymentDetails.usdt?.[0]?.name || userID
            : paymentDetails.account?.[0]?.accountHolderName || userID,
    }));
  };

  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${text} copied to clipboard!`);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy text");
      });
  };

  const validateForm = () => {
    if (!formData.UTR.trim()) {
      toast.error("Please enter a valid UTR");
      return false;
    }
    if (!formData.image) {
      toast.error("Please upload a payment screenshot");
      return false;
    }
    if (!formData.amount || parseInt(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }
    if (!formData.domainId) {
      toast.error("Domain ID is missing");
      return false;
    }
    if (!formData.PaymentBy) {
      toast.error("PaymentBy field is missing");
      return false;
    }
    if (!formData.PaymentMode) {
      toast.error("Payment mode is missing");
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (loading) {
      toast.warn("Please wait, processing...");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseInt(formData.amount),
      };
      const response = await createPayment(payload);

      if (response.success) {
        toast.success("Payment uploaded successfully");
        setFormData({ ...INITIAL_FORM_DATA, PaymentBy: userID, domainId });
        setImagePreview("");
        setStep(1);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      } else {
        toast.error(
          response.data.message ||
            "Request not submitted. Please try agian later",
        );
      }
    } catch (error) {
      toast.error("An error occurred during payment");
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type) => {
    try {
      const imgElement = document.querySelector(`img[alt="${type} QR Code"]`);
      if (!imgElement || !imgElement.src) {
        throw new Error(`${type} QR code image not found`);
      }
      const link = document.createElement("a");
      link.href = imgElement.src;
      link.download = `${type.toLowerCase()}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(
        `Unable to download automatically. Please right-click the ${type} QR code and select "Save image as..."`,
      );
    }
  };

  const details = paymentDetails.account?.[0]
    ? [
        {
          label: "BANK NAME",
          value: paymentDetails.account[0].bankName || "N/A",
        },
        {
          label: "ACCOUNT HOLDER NAME",
          value: paymentDetails.account[0].accountHolder || "N/A",
        },
        {
          label: "IFSC/SWIFT",
          value: paymentDetails.account[0].ifscCode || "N/A",
        },
        {
          label: "ACCOUNT NO",
          value: paymentDetails.account[0].accountNumber || "N/A",
        },
      ]
    : [];

  const phoneNumber = paymentDetails.gpay?.[0]?.phoneNumber || "13433414145";
  const message = "Hello, I am interested in your service.";

  const handleWhatsAppRedirect = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${phoneNumber.replace(/\s/g, "")}?text=${encodedMessage}`,
      "_blank",
    );
  };

  return (
    <div className="p-6">
      {loading &&    <Loader/>}
      {step === 1 && (
        <>
          {/* HEADER */}
          <div className="text-center mt-2">
            <p className="text-[16px] font-semibold text-gray-900">
              Enter Amount to Continue
            </p>
            <p className="text-[12px] text-gray-500 mt-1">
              भुगतान विवरण देखने के लिए राशि दर्ज करें
            </p>
          </div>

          {/* PAYMENT METHODS */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {allPayments?.map((item, index) => {
              const isSelected = selectedPayment?._id === item._id;

              const title =
                item.method === "qr"
                  ? "UPI / GPay"
                  : item.method === "usdt"
                    ? "USDT"
                    : "Bank";

              return (
                <div
                  key={item._id || index}
                  onClick={() => {
                    setSelectedPayment(item);
                    setFormData((prev) => ({
                      ...prev,
                      PaymentMode:
                        item.method === "qr"
                          ? "QR"
                          : item.method === "usdt"
                            ? "USDT"
                            : "Bank",
                    }));
                  }}
                  className={`relative cursor-pointer rounded-2xl border p-3 transition-all
          ${
            isSelected
              ? "border-[#5f259f] bg-[#f3e8ff] shadow-md scale-[1.02]"
              : "border-gray-200 bg-white hover:border-[#5f259f]"
          }`}
                >
                  {/* Selected Tick */}
                  {isSelected && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold text-[#5f259f]">
                      SELECTED
                    </span>
                  )}

                  {/* ICON */}
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center mb-2
            ${
              isSelected
                ? "bg-[#5f259f] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
                  >
                    {item.method === "qr" && <BsQrCode size={18} />}
                    {item.method === "bank" && <BsBank2 size={18} />}
                    {item.method === "usdt" && (
                      <img src="/usdt.png" alt="USDT" className="h-5 w-5" />
                    )}
                  </div>

                  {/* TITLE */}
                  <p className="text-sm font-semibold text-gray-900">{title}</p>

                  {/* MIN / MAX */}
                  <div className="mt-1 text-[12px] text-gray-600 leading-snug">
                    {item.method === "usdt" ? (
                      <>
                        <div className="flex items-center gap-1">
                          Min <FaDollarSign className="text-[10px]" />
                          {item.minAmount}
                        </div>
                        <div className="flex items-center gap-1">
                          Max <FaDollarSign className="text-[10px]" />
                          {item.maxAmount}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>Min ₹{item.minAmount}</div>
                        <div>Max ₹{item.maxAmount}</div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AMOUNT INPUT */}
          <div
            className="mt-4 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm
             focus-within:border-[#5f259f]"
          >
            <p className="text-xs text-gray-500">Amount</p>

            <input
              type="text"
              id="amount"
              value={formData.amount}
              onChange={handleAmountChange}
              placeholder={
                selectedPayment ? "Enter amount" : "Select payment method first"
              }
              className="
      mt-1 w-full text-lg font-semibold text-gray-900
      bg-transparent
      border-none outline-none ring-0
      focus:outline-none focus:ring-0 focus:border-none
      placeholder:text-gray-400
    "
            />
          </div>

          {/* QUICK AMOUNT BUTTONS */}
          <div className="mt-3 flex flex-wrap gap-2">
            {["+100", "+200", "+500", "+1000", "+2000", "+5000"].map((e, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleIncreaseAmount(e.replace("+", ""))}
                className="
        px-4 py-2 rounded-full
        border border-gray-300
        text-[13px] font-semibold text-gray-800
        bg-white
        hover:bg-[#f3e8ff] hover:border-[#5f259f]
        active:scale-95
        transition-all
        focus:outline-none focus:ring-0
      "
              >
                {e}
              </button>
            ))}
          </div>

          {/* NEXT STEP */}
          <button
            onClick={handleNextStep}
            disabled={loading}
            className="mt-6 w-full py-3 rounded-xl font-semibold
      bg-[#5f259f] text-white
      hover:bg-[#4b1f82] transition
      disabled:opacity-50"
          >
            NEXT STEP
          </button>

          {/* IMPORTANT INSTRUCTIONS */}
          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-[14px] font-semibold text-gray-800 mb-2">
              Important Instructions
            </p>

            <ul className="list-decimal pl-4 space-y-2 text-[12px] text-gray-700 leading-relaxed">
              <li>
                Deposit money <b>only in the available accounts</b> shown above.
              </li>
              <li>
                Deposits made <b>45 minutes after account removal</b> are valid.
              </li>
              <li>
                Site is <b>not responsible</b> for deposits to old or inactive
                accounts.
              </li>
              <li>
                After payment, <b>submit UTR and amount</b> to get balance.
              </li>
              <li>
                <b>NEFT time:</b> 40 minutes to 2 hours.
              </li>
              <li>
                After account change, payment valid for <b>1 hour</b>.
              </li>
            </ul>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="mt-2 rounded-md font-medium bg-[#212121]">
            <input
              type="text"
              value={formData.amount}
              readOnly
              className="h-full w-full text-white text-[12px] p-3 py-5 bg-transparent focus:text-white focus:bg-transparent outline-none border-none focus:ring-0"
            />
          </p>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {/* QR */}
            <button
              onClick={() => handleTabClick("QR")}
              className={`rounded-xl p-3 border text-center transition
      ${
        activeTab === "QR"
          ? "border-[#5f259f] bg-[#f3e8ff]"
          : "border-gray-200 bg-white"
      }`}
            >
              <BsQrCode
                size={22}
                className={`mx-auto ${
                  activeTab === "QR" ? "text-[#5f259f]" : "text-gray-500"
                }`}
              />
              <p className="text-[11px] mt-1 font-medium">UPI</p>
            </button>

            {/* Bank */}
            <button
              onClick={() => handleTabClick("Bank")}
              className={`rounded-xl p-3 border text-center transition
      ${
        activeTab === "Bank"
          ? "border-[#5f259f] bg-[#f3e8ff]"
          : "border-gray-200 bg-white"
      }`}
            >
              <BsBank2
                size={22}
                className={`mx-auto ${
                  activeTab === "Bank" ? "text-[#5f259f]" : "text-gray-500"
                }`}
              />
              <p className="text-[11px] mt-1 font-medium">Bank</p>
            </button>

            {/* USDT */}
            <button
              onClick={() => handleTabClick("USDT")}
              className={`rounded-xl p-3 border text-center transition
      ${
        activeTab === "USDT"
          ? "border-[#5f259f] bg-[#f3e8ff]"
          : "border-gray-200 bg-white"
      }`}
            >
              <img src="/usdt.png" className="h-5 mx-auto" />
              <p className="text-[11px] mt-1 font-medium">USDT</p>
            </button>

            {/* WhatsApp */}
            {siteDetails?.whatsappSupport && (
              <button
                onClick={handleWhatsAppRedirect}
                className="rounded-xl p-3 border border-green-300 bg-white"
              >
                <BsWhatsapp size={22} className="mx-auto text-green-500" />
                <p className="text-[11px] mt-1 font-medium">Help</p>
              </button>
            )}
          </div>

          {activeTab === "QR" && (
            <div className="mt-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-semibold text-[#5f259f]">
                  Scan & Pay via UPI
                </h3>
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#f3e8ff] text-[#5f259f] border border-[#e9d5ff]">
                  Secure
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* QR SECTION */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  {qrImageUrl ? (
                    <>
                      <div className="flex justify-center">
                        <img
                          src={qrImageUrl}
                          alt="QR Code"
                          className="h-72 object-contain"
                        />
                      </div>

                      <p className="mt-3 text-center text-sm text-gray-600">
                        Scan using any UPI app (PhonePe, GPay, Paytm)
                      </p>
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-16">
                      QR Code not available
                    </p>
                  )}
                </div>

                {/* DETAILS SECTION */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  {/* Account Holder */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Account Holder Name
                    </p>
                    <p className="mt-1 px-3 py-2 rounded-md bg-gray-50 text-gray-900 text-sm font-medium">
                      {paymentDetails.gpay?.[0]?.name || "N/A"}
                    </p>
                  </div>

                  {/* UPI IDs */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 uppercase">UPI ID(s)</p>

                    {Array.isArray(paymentDetails?.gpay?.[0]?.upiId) &&
                    paymentDetails.gpay[0].upiId.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {paymentDetails.gpay[0].upiId.map((upi, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center
                    bg-gray-50 border border-gray-200
                    px-3 py-2 rounded-md text-sm"
                          >
                            <span className="break-all text-gray-800">
                              {upi}
                            </span>
                            <button
                              onClick={() => handleCopyUpi(upi)}
                              className={`text-xs font-medium transition
                               ${copiedUpi === upi ? "text-green-600" : "text-[#5f259f]"}`}
                            >
                              {copiedUpi === upi ? "COPIED" : "COPY"}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">
                        No UPI ID available
                      </p>
                    )}
                  </div>

                  {/* DOWNLOAD */}
                  <button
                    onClick={() => handleDownload("QR")}
                    disabled={!qrImageUrl}
                    className="mt-5 w-full py-3 rounded-xl font-semibold
            bg-[#5f259f] text-white
            flex items-center justify-center gap-2
            hover:bg-[#4b1f82] transition-all disabled:opacity-50"
                  >
                    <IoMdDownload size={18} />
                    Download QR
                  </button>

                  <p className="text-[11px] text-gray-500 text-center mt-3">
                    Amount will be credited after UTR verification
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === "USDT" && (
            <div className="mt-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-semibold text-[#16a34a]">
                  Pay using USDT
                </h3>
                <span className="text-[11px] px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  Crypto Payment
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* QR CARD */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  {usdtImageUrl ? (
                    <>
                      <div className="flex justify-center">
                        <img
                          src={usdtImageUrl}
                          alt="USDT QR Code"
                          className="h-72 object-contain"
                        />
                      </div>

                      <p className="mt-3 text-center text-sm text-gray-600">
                        Scan this QR from your crypto wallet
                      </p>
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-16">
                      USDT QR Code not available
                    </p>
                  )}
                </div>

                {/* DETAILS */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  {/* Wallet Address */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Wallet Address
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-md">
                      <span className="text-sm text-gray-800 break-all">
                        {paymentDetails.usdt?.[0]?.walletAddress || "N/A"}
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            paymentDetails.usdt?.[0]?.walletAddress || "",
                          )
                        }
                        className="text-green-600 text-xs font-medium"
                      >
                        COPY
                      </button>
                    </div>
                  </div>

                  {/* Network */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 uppercase">Network</p>
                    <p className="mt-1 px-3 py-2 rounded-md bg-gray-50 text-sm font-medium text-gray-900">
                      {paymentDetails.usdt?.[0]?.network || "N/A"}
                    </p>
                  </div>

                  {/* Warning */}
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-[12px] text-yellow-800 leading-relaxed">
                      ⚠️ Send <b>USDT only</b> on the selected network. Sending
                      via wrong network may result in permanent loss.
                    </p>
                  </div>

                  {/* DOWNLOAD */}
                  <button
                    onClick={() => handleDownload("USDT")}
                    disabled={!usdtImageUrl}
                    className="mt-5 w-full py-3 rounded-xl font-semibold
            bg-[#16a34a] text-white
            flex items-center justify-center gap-2
            hover:bg-[#15803d] transition-all disabled:opacity-50"
                  >
                    <IoMdDownload size={18} />
                    Download USDT QR
                  </button>

                  <p className="text-[11px] text-gray-500 text-center mt-3">
                    Deposit will be credited after blockchain confirmation
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Bank" && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-[#1f2937]">
                  Bank Transfer Details
                </h3>
                <span className="text-[11px] px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Secure Bank
                </span>
              </div>

              {details?.length > 0 ? (
                <div className="space-y-3">
                  {details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between
              bg-gray-50 border border-gray-200
              rounded-xl px-4 py-3"
                    >
                      {/* Left */}
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-500 uppercase tracking-wide">
                          {detail.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 break-all">
                          {detail.value}
                        </span>
                      </div>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(detail.value)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        <FaCopy className="w-4 h-4" />
                        COPY
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">
                  No bank details available
                </p>
              )}

              {/* Info Note */}
              <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-[12px] text-yellow-800 leading-relaxed">
                  ⚠️ Please transfer funds only to the above bank account.
                  Transfers to old or inactive accounts may not be credited.
                </p>
              </div>
            </div>
          )}

          <input
            type="text"
            id="UTR"
            value={formData.UTR}
            onChange={handleFormInputChange}
            placeholder="ENTER TRANSACTION / UTR / REFERENCE NO."
            className="w-full uppercase px-4 py-2.5 mt-4 border-[1px] text-[13px] border-[#ababab] rounded-md bg-white focus:bg-transparent text-black focus:outline-none focus:ring-0 cursor-pointer"
          />

          <div className="w-full">
            <input
              type="file"
              id="image"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFormInputChange}
              accept="image/*"
            />
            <button
              onClick={handleButtonClick}
              className="w-full px-4 py-5 mt-4 rounded text-[13px] bg-[#dbdbdb] text-gray-700 focus:outline-none focus:ring-0 cursor-pointer flex justify-between items-center"
            >
              <p className="font-bold text-center">ATTACH SCREENSHOT</p>
              <AiOutlinePaperClip className="w-5 h-5 text-gray-700" />
            </button>

            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Image Preview:</p>
                <img
                  src={imagePreview}
                  alt="Uploaded Preview"
                  className="size-32 object-cover rounded-md mt-2"
                />
              </div>
            )}
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-5 w-full py-3 rounded-xl font-semibold
    bg-[#5f259f] text-white
    flex items-center justify-center gap-2
    hover:bg-[#4b1f82]
    transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "DEPOSIT"}
          </button>
        </>
      )}
    </div>
  );
};

export default Deposit;
