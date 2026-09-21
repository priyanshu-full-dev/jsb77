import React, { useEffect, useState, useCallback, useRef } from "react";
import { Copy, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import { SiPhonepe, SiTether } from "react-icons/si";
import { BsBank2 } from "react-icons/bs";
import { saveAs } from "file-saver";

// API Endpoints & Helpers
import {
  getactiveAdminDepositMethod,
  uploadMedia,
  createPayment,
} from "../../api";
import { generatePresignedUrl } from "../../utils/helper/generatePresignedUrl";

const INITIAL_FORM_DATA = {
  UTR: "",
  amount: 0,
  image: null,
  termsAccepted: false,
  PaymentMode: "",
  PaymentBy: "",
  domainId: "",
};

export default function PaymentGateway({ amount, open = true, toggle, fetchTransactions }) {
  const siteDetails = useSelector((state) => state?.site?.siteDetails);
  const userID = useSelector(
    (state) => state?.user?.userData?._id || localStorage.getItem("userId") || ""
  );

  let localSite = {};
  try {
    localSite = JSON.parse(localStorage.getItem("siteDetails") || "{}");
  } catch {
    localSite = {};
  }

  const domainId =
    siteDetails?.admindomainName?._id ||
    siteDetails?.siteDetails?.admindomainName?._id ||
    siteDetails?.domainDetails?._id ||
    siteDetails?.siteDetails?.domainDetails?._id ||
    siteDetails?.domainId ||
    localSite?.admindomainName?._id ||
    localSite?.domainDetails?._id ||
    localSite?.domainId ||
    "6a85553b526a2dbeb187f071";

  const [activeTab, setActiveTab] = useState("phone pe");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [paymentDetails, setPaymentDetails] = useState({
    account: [],
    gpay: [],
    usdt: [],
  });
  const fileInputRef = useRef(null);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const topHeaderColor = siteDetails?.headerColor;

  const handleCopy = useCallback((text) => {
    if (!text) return;
    navigator.clipboard
      .writeText(String(text))
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  }, []);

  // Update formData when dependencies change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amount: Number(amount) || 0,
      PaymentMode: activeTab,
      PaymentBy: userID,
      domainId,
    }));
  }, [amount, activeTab, userID, domainId]);

  // Fetch presigned URL for QR code (for PhonePe and USDT)
  useEffect(() => {
    const generateUrl = async () => {
      const qrSource =
        activeTab === "phone pe" ? paymentDetails.gpay : paymentDetails.usdt;
      if (qrSource?.[0]?.imageUrl) {
        setLoading(true);
        try {
          const key = qrSource[0].imageUrl;
          const presignedUrl = await generatePresignedUrl(key);
          setQrImageUrl(presignedUrl || key);
        } catch (error) {
          console.error("Failed to load QR code:", error);
          setQrImageUrl(qrSource[0].imageUrl || "");
        } finally {
          setLoading(false);
        }
      } else {
        setQrImageUrl("");
      }
    };
    generateUrl();
  }, [paymentDetails.gpay, paymentDetails.usdt, activeTab]);

  // Fetch admin payment deposit methods
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getactiveAdminDepositMethod();
        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        const account = data.filter((acc) => (acc.type || "").toLowerCase() === "bank") || [];
        const gpay = data.filter(
          (acc) =>
            (acc.type || "").toLowerCase() === "qr" ||
            (acc.type || "").toLowerCase() === "upi"
        ) || [];
        const usdt = data.filter(
          (acc) =>
            (acc.type || "").toLowerCase() === "usdt" ||
            (acc.type || "").toLowerCase() === "crypto"
        ) || [];

        setPaymentDetails({ account, gpay, usdt });
      } catch (error) {
        toast.error("Failed to fetch payment details");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = async (e) => {
    const { id, value, type, checked, files } = e?.target || {};
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
      const renamedFile = new File([file], cleanedFileName, { type: file.type });
      const imageFormData = new FormData();
      imageFormData.append("image", renamedFile);

      setLoading(true);
      try {
        const response = await uploadMedia(imageFormData);
        const imageUrl = response?.data?.data?.url || response?.data?.url;
        if (imageUrl) {
          setFormData((prev) => ({ ...prev, image: imageUrl }));
          toast.success("Image uploaded successfully");
        } else {
          toast.error("Failed to retrieve image URL");
        }
      } catch (error) {
        toast.error("Failed to upload image");
        console.error("Upload error:", error);
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

  const handlePayment = async (e) => {
    e?.preventDefault();
    const requiredFields = [
      "UTR",
      "image",
      "amount",
      "PaymentMode",
      "PaymentBy",
      "domainId",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field] || (field === "amount" && Number(formData[field]) <= 0)
    );
    if (missingFields.length > 0) {
      toast.error(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }
    if (!formData.termsAccepted) {
      toast.error("You must accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await createPayment({
        ...formData,
        amount: Number(formData.amount),
        termsAccepted: true,
      });

      if (
        response?.success ||
        response?.data?.success ||
        response?.statusCode === 200 ||
        response?.data?.message?.toLowerCase().includes("success") ||
        response?.message?.toLowerCase().includes("success")
      ) {
        toast.success("Payment uploaded successfully");
        setFormData(INITIAL_FORM_DATA);
        setImagePreview("");
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        if (typeof toggle === "function") {
          toggle();
        }
        if (typeof fetchTransactions === "function") {
          fetchTransactions();
        }
      } else {
        toast.error(
          response?.data?.message ||
            response?.message ||
            "Request not submitted. Please try again later"
        );
      }
    } catch (error) {
      toast.error("An error occurred during payment");
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabData = [
    {
      name: "phone pe",
      color: "bg-[#673AB7]",
      icon: <SiPhonepe className="h-6 w-6 text-white" />,
    },
    {
      name: "account",
      color: "bg-[#0288D1]",
      icon: <BsBank2 className="h-6 w-6 text-white" />,
    },
    {
      name: "usdt",
      color: "bg-[#26A17B]",
      icon: <SiTether className="h-6 w-6 text-white" />,
    },
  ];

  const handleTabClick = (name) => {
    setActiveTab(name);
  };

  const goWhatsapp = (whatsappSupport) => {
    if (!whatsappSupport) return;
    const message = "Hello, I am interested in your service.";
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${whatsappSupport.replaceAll(" ", "")}?text=${encodedMessage}`,
      "_blank"
    );
  };

  const handleDownload = () => {
    try {
      const imgElement = document.querySelector('img[alt="QR Code"]') || document.querySelector('img[alt="USDT QR Code"]');
      if (!imgElement || !imgElement.src) {
        throw new Error("Image not found");
      }
      saveAs(imgElement.src, "qr-code.png");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error('Unable to download automatically. Please right-click the QR code and select "Save image as..."');
    }
  };

  const renderPaymentDetails = (details) => {
    if (!details?.length) {
      return (
        <div className="text-center py-4 text-gray-500 text-xs">
          No payment details available
        </div>
      );
    }
    return (
      <div className="bg-[#F1F5F9] mt-4 rounded-lg space-y-3 p-4">
        {details.map((item, idx) => (
          <div key={item._id || idx} className="space-y-2">
            {item.type === "bank" && (
              <>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Bank Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.bankName}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.bankName)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">{item.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.accountNumber)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">IFSC Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">{item.ifsc || item.ifscCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.ifsc || item.ifscCode)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Account Holder:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.accountHolderName || item.accountHolder}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.accountHolderName || item.accountHolder)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
            {(item.type === "qr" || item.type === "upi") && (
              <div className="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
                <span className="font-semibold text-xs sm:text-sm text-gray-800">UPI ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-xs sm:text-sm text-blue-800">{item.upiId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.upiId)}
                    className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
            {(item.type === "usdt" || item.type === "crypto") && (
              <>
                <div className="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
                  <span className="font-semibold text-xs text-gray-800">Wallet Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-[11px] break-all">{item.walletAddress || item.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.walletAddress || item.accountNumber)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700 cursor-pointer shrink-0"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {(item.network || item.bankName) && (
                  <div className="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
                    <span className="font-semibold text-xs text-gray-800">Network:</span>
                    <span className="font-bold text-xs">{item.network || item.bankName}</span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "phone pe":
        return (
          <div>
            {renderPaymentDetails(paymentDetails.gpay)}
            {paymentDetails.gpay?.[0]?.imageUrl && (
              <div className="flex flex-col justify-center items-center bg-[#F1F5F9] shadow-md p-3 rounded-md mt-4">
                <img
                  onClick={handleDownload}
                  src={qrImageUrl || paymentDetails.gpay[0].imageUrl}
                  alt="QR Code"
                  className="w-[65%] h-[160px] object-contain shadow-md cursor-pointer bg-white p-2 rounded"
                  loading="lazy"
                />
                <p className="text-[10px] text-gray-500 mt-1">Click QR to download</p>
              </div>
            )}
          </div>
        );
      case "account":
        return <div className="space-y-4">{renderPaymentDetails(paymentDetails.account)}</div>;
      case "usdt":
        return (
          <div>
            {renderPaymentDetails(paymentDetails.usdt)}
            {paymentDetails.usdt?.[0]?.imageUrl && (
              <div className="flex flex-col justify-center items-center bg-[#F1F5F9] shadow-md p-3 rounded-md mt-4">
                <img
                  onClick={handleDownload}
                  src={qrImageUrl || paymentDetails.usdt[0].imageUrl}
                  alt="USDT QR Code"
                  className="w-[65%] h-[160px] object-contain shadow-md cursor-pointer bg-white p-2 rounded"
                  loading="lazy"
                />
                <p className="text-[10px] text-gray-500 mt-1">Click QR to download</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!amount || !open) return null;
  const isFormValid =
    formData.UTR &&
    formData.image &&
    Number(formData.amount) > 0 &&
    formData.termsAccepted;

  return (
    <div className="container mx-auto max-w-7xl font-sans">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] text-white font-bold">
          <p>Processing...</p>
        </div>
      )}

      {/* Header / Back */}
      <div
        style={{ backgroundColor: topHeaderColor?.start || "#680a1e" }}
        className="w-full p-2 flex items-center rounded-t-lg"
      >
        <button
          type="button"
          onClick={toggle}
          className="flex items-center px-3 py-1 text-white bg-[#343435] rounded text-sm hover:bg-gray-700 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex w-full overflow-x-auto mt-2 space-x-2 bg-white border-b p-2 mb-4">
        {tabData.map(({ name, color, icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => handleTabClick(name)}
            className={`flex-1 flex flex-col items-center justify-center p-2 text-white hover:opacity-90 ${color} rounded-md transition-all cursor-pointer ${
              activeTab === name ? "ring-2 ring-black ring-offset-1" : ""
            }`}
          >
            {icon}
            <span className="text-[10px] sm:text-xs uppercase font-bold mt-1">
              {name}
            </span>
          </button>
        ))}
        {siteDetails?.whatsappSupport && (
          <button
            type="button"
            onClick={() => goWhatsapp(siteDetails.whatsappSupport)}
            className="flex-1 flex flex-col items-center justify-center p-2 text-white hover:opacity-90 bg-[#00C951] rounded-md transition-all cursor-pointer"
          >
            <FaWhatsapp className="h-6 w-6 text-white" />
            <span className="text-[10px] sm:text-xs uppercase font-bold mt-1">
              Whatsapp
            </span>
          </button>
        )}
      </div>

      {/* Main Payment Card */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div
          style={{ backgroundColor: topHeaderColor?.start || "#680a1e" }}
          className="w-full p-2 flex items-center rounded-t"
        >
          <h2 className="text-sm text-white font-bold text-center w-full uppercase tracking-wider">
            {activeTab} PAYMENT DETAILS
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-4">
          {/* Left: Account/QR Details */}
          {renderContent()}

          {/* Right: Submission Form */}
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label htmlFor="UTR" className="block text-xs font-bold text-gray-700 mb-1">
                {activeTab === "usdt" ? "Transaction Hash" : "UTR / Transaction ID"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="UTR"
                value={formData.UTR}
                onChange={handleInputChange}
                placeholder={activeTab === "usdt" ? "Enter Transaction Hash" : "6-12 Digit UTR"}
                className="w-full p-2.5 border rounded text-xs focus:outline-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-xs font-bold text-gray-700 mb-1">
                Payment Proof / Screenshot <span className="text-red-500">*</span>
              </label>
              <input
                id="image"
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-xs focus:outline-blue-500 cursor-pointer"
                accept="image/*"
                required
              />
              {imagePreview && (
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    className="object-cover rounded h-12 w-12 border"
                  />
                  {formData?.image ? (
                    <p className="text-green-600 text-xs font-semibold">Image uploaded successfully</p>
                  ) : (
                    <p className="text-red-500 text-xs font-semibold">Uploading...</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-xs font-bold text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                id="amount"
                type="number"
                value={formData.amount}
                readOnly
                className="w-full p-2.5 border rounded text-xs bg-gray-100 font-bold text-gray-800"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 rounded text-[#680a1e]"
                />
                I accept the terms and conditions <span className="text-red-500">*</span>
              </label>
            </div>

            <button
              style={{
                backgroundColor: topHeaderColor?.start || "#680a1e",
              }}
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full p-3 text-white font-bold text-sm rounded shadow hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Processing..." : "Submit Payment Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
