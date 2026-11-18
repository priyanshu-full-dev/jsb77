import { useEffect, useState, useCallback, useRef } from "react";
import { Copy, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import { SiPhonepe } from "react-icons/si";
import { BsBank2, BsQrCode } from "react-icons/bs";
import { SiTether } from "react-icons/si";
import { saveAs } from "file-saver";

import {
  createPayment,
  getactiveAdminDepositMethod,
  uploadMedia,
} from "../../../../api";
import {
  getUserId,
  selectDomainID,
  selectSite,
} from "../../../../utils/helper/commonSelectors";
import Loader from "../../../../utils/Loader";
import { generatePresignedUrl } from "../../../../utils/helper/generatePresignedUrl";
import {
  useGradientColor,
  usePrimaryColor,
  useSecondaryColor,
} from "../../hooks/useThemeColors";

const INITIAL_FORM_DATA = {
  UTR: "",
  amount: 0,
  image: null,
  termsAccepted: false,
  PaymentMode: "",
  PaymentBy: "",
  domainId: "",
};

function PaymentGateway({
  amount,
  open,
  toggle,
  fetchTransactions,
  paymentDetails,
}) {
  const siteDetails = useSelector(selectSite());
  const userID = useSelector(getUserId());
  const domainId = useSelector(
    (state) => state?.site?.siteDetails?.admindomainName?._id,
  );

  const normalizePaymentMode = (mode) => {
    const m = mode?.toLowerCase();

    if (m === "phone pe" || m === "qr" || m === "upi") return "qr";
    if (m === "account" || m === "bank") return "bank";
    if (m === "usdt") return "usdt";

    return null;
  };

  const getConfigByPaymentMode = (mode) => {
    const normalized = normalizePaymentMode(mode);

    if (normalized === "bank") return paymentDetails?.account?.[0];
    if (normalized === "qr") return paymentDetails?.gpay?.[0];
    if (normalized === "usdt") return paymentDetails?.usdt?.[0];

    return null;
  };

  const [activeTab, setActiveTab] = useState("phone pe");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const fileInputRef = useRef(null);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const topHeaderColor = siteDetails?.headerColor;
  const SecondrayCtaBg = useSecondaryColor();
  const PrimaryColor = usePrimaryColor();
  const gradiantColor = useGradientColor();

  const handleCopy = useCallback((text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  }, []);

  // Update formData when dependencies change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amount,
      PaymentMode: activeTab,
      PaymentBy: userID,
      domainId,
    }));
  }, [amount, activeTab, userID, domainId]);

  // Fetch presigned URL for QR code (for PhonePe and USDT)
  const [qrUrls, setQrUrls] = useState({});
  useEffect(() => {
    const generateUrls = async () => {
      try {
        const urls = {};

        const allQr = [
          ...(paymentDetails.gpay || []),
          ...(paymentDetails.usdt || []),
        ];

        for (const item of allQr) {
          if (item.imageUrl) {
            urls[item._id] = await generatePresignedUrl(item.imageUrl);
          }
        }

        setQrUrls(urls);
      } catch (error) {
        console.error(error);
      }
    };

    generateUrls();
  }, [paymentDetails]);

  // Fetch payment details
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await getactiveAdminDepositMethod();
  //       const account = res?.data?.filter((acc) => acc.type === "bank") || [];
  //       const gpay = res?.data?.filter((acc) => acc.type === "qr") || [];
  //       const usdt = res?.data?.filter((acc) => acc.type === "usdt") || []; // Assuming USDT type
  //       setPaymentDetails({ account, gpay, usdt });
  //     } catch (error) {
  //       toast.error("Failed to fetch payment details");
  //       console.error("Fetch error:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);

  const handleInputChange = async (e) => {
    const { id, value, type, checked, files } = e?.target;

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

    const config = getConfigByPaymentMode(formData.PaymentMode);

    if (!config) {
      toast.error("Selected payment method is unavailable");
      return;
    }

    const amount = Number(formData.amount);

    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    const minAmount = Number(config.minAmount);
    const maxAmount = Number(config.maxAmount);

    if (amount < minAmount) {
      toast.error(`Minimum deposit amount is ₹${minAmount}`);
      return;
    }

    if (amount > maxAmount) {
      toast.error(`Maximum deposit amount is ₹${maxAmount}`);
      return;
    }

    const requiredFields = [
      "UTR",
      "image",
      "amount",
      "PaymentMode",
      "PaymentBy",
      "domainId",
    ];
    const missingFields = requiredFields.filter(
      (field) =>
        !formData[field] || (field === "amount" && formData[field] <= 0),
    );

    if (missingFields.length > 0) {
      toast.error(
        `Please fill all required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    if (!formData.termsAccepted) {
      toast.error("You must accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await createPayment(formData);
      if (response.success) {
        toast.success("Payment uploaded successfully");
        setFormData(INITIAL_FORM_DATA);
        setImagePreview("");
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        toggle();
        fetchTransactions();
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
    const message = "Hello, I am interested in your service.";
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${whatsappSupport.replaceAll(
        " ",
        "",
      )}?text=${encodedMessage}`,
      "_blank",
    );
  };

  const handleDownload = () => {
    try {
      const imgElement = document.querySelector('img[alt="QR Code"]');
      if (!imgElement || !imgElement.src) {
        throw new Error("Image not found");
      }
      saveAs(imgElement.src, "qr-code.png");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(
        'Unable to download automatically. Please right-click the QR code and select "Save image as..."',
      );
    }
  };

  const renderPaymentDetails = (details) => {
    if (!details?.length) {
      return (
        <div className="text-center py-1 text-sm">
          No payment details available
        </div>
      );
    }

    return (
      <div className="bg-light-bg dark:bg-dark-bg mt-0 rounded-lg space-y-4 p-4 text-black dark:text-white">
        {details.map((item) => (
          <div key={item._id} className="space-y-4">
            {item.type === "bank" && (
              <>
                <div className="flex justify-between items-center text-sm font-extrabold">
                  <span className="font-bold">Bank Name:</span>
                  <div className="flex items-center gap-2">
                    <span>{item.bankName}</span>
                    <button
                      onClick={() => handleCopy(item.bankName)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold">
                  <span className="font-bold">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span>{item.accountNumber}</span>
                    <button
                      onClick={() => handleCopy(item.accountNumber)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold">
                  <span className="font-bold">IFSC Code:</span>
                  <div className="flex items-center gap-2">
                    <span>{item.ifscCode}</span>
                    <button
                      onClick={() => handleCopy(item.ifscCode)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold">
                  <span className="font-bold">Account Holder Name:</span>
                  <div className="flex items-center gap-2">
                    <span>{item.accountHolder}</span>
                    <button
                      onClick={() => handleCopy(item.accountHolder)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
            {item.type === "qr" && (
              <div className="flex gap-2 items-center text-xs border-b border-[#ccafff] pb-2">
                <span className="font-bold text-[17px]">UPI ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px]">{item.upiId}</span>
                  <button
                    onClick={() => handleCopy(item.upiId)}
                    className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
            {item.type === "usdt" && (
              <>
                <div className="flex gap-2 items-center text-xs border-b border-[#ccafff] pb-2">
                  <span className="font-bold text-[13px]">
                    Wallet Address:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[12px]">
                      {item.walletAddress}
                    </span>
                    <button
                      onClick={() => handleCopy(item.walletAddress)}
                      className="p-1 bg-[#00A63E] text-white rounded hover:bg-green-700"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {item.network && (
                  <div className="flex gap-2 items-center text-xs border-b border-[#ccafff] pb-2">
                    <span className="font-bold text-[13px]">Network:</span>
                    <span className="font-bold text-[12px]">
                      {item.network}
                    </span>
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
          <div className="space-y-3">
            {paymentDetails.gpay?.map((item, index) => (
              <div
                key={item._id || index}
                className="
                  overflow-hidden
                  rounded-2xl
                  bg-white
                  border border-slate-200
                  transition-all
                  duration-300
                "
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#5f259f] to-[#7c3aed]">
                  <div className="flex items-center gap-2">
                    <BsQrCode className="text-white text-lg" />
                    <h3 className="text-white text-sm font-bold">
                      QR #{index + 1}
                    </h3>
                  </div>

                  <span className="text-[10px] font-medium bg-white/20 text-white px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>

                {/* Body */}
                <div className="p-3">
                  {renderPaymentDetails([item])}

                  {item.imageUrl && (
                    <div className="mt-2">
                      <div className="bg-[#faf7ff] border border-[#ede9fe] rounded-xl p-3">
                        <div className="flex justify-center">
                          <img
                            src={qrUrls[item._id]}
                            alt={`QR ${index + 1}`}
                            className="
                              w-[160px]
                              h-[160px]
                              object-contain
                              cursor-pointer
                              rounded-lg
                              transition-transform
                              duration-300
                              hover:scale-105
                            "
                            loading="lazy"
                            onClick={() => window.open(item.imageUrl, "_blank")}
                          />
                        </div>

                        <p className="text-center text-[11px] text-slate-500 mt-2">
                          Scan QR to complete payment
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case "account":
        return (
          <div className="space-y-6">
            {renderPaymentDetails(paymentDetails.account)}
          </div>
        );
      case "usdt":
        return (
          <div>
            {renderPaymentDetails(paymentDetails.usdt)}
            {paymentDetails.usdt?.[0]?.imageUrl && (
              <div className="flex flex-col justify-center items-center bg-[#F1F5F9] shadow-md p-3 rounded-md">
                <img
                  onClick={handleDownload}
                  src={qrImageUrl}
                  alt="USDT QR Code"
                  className="w-[65%] h-[160px] object-cover shadow-md"
                  loading="lazy"
                />
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
    formData.amount > 0 &&
    formData.termsAccepted;

  return (
    <div className="container mx-auto max-w-7xl">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
      <div
        style={{
          backgroundImage: PrimaryColor,
        }}
        className="w-full p-2.5 flex items-cente rounded-sm"
      >
        <button
          onClick={toggle}
          className="flex items-center p-1 px-3 text-xs text-black dark:text-white rounded-sm bg-light-bg dark:bg-dark-bg"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
      </div>
      <div className="flex w-full overflow-x-auto mt-2 space-x-2 h-15 bg-light-bg dark:bg-dark-bg border-b mb-4 py-5">
        {tabData.map(({ name, color, icon }) => (
          <button
            key={name}
            onClick={() => handleTabClick(name)}
            className={`flex-1 flex flex-col items-center justify-center p-2 text-white hover:opacity-90 ${color} border border-gray-300 rounded-md`}
          >
            {icon}
            <span className="text-[10px] sm:text-xs uppercase font-extrabold mt-1">
              {name}
            </span>
          </button>
        ))}
        {siteDetails?.whatsappSupport && (
          <button
            onClick={() => goWhatsapp(siteDetails.whatsappSupport)}
            className="flex-1 flex flex-col items-center justify-center p-2 text-white hover:opacity-90 bg-[#00C951] border border-gray-300 rounded-md"
          >
            <FaWhatsapp className="h-6 w-6 text-white" />
            <span className="text-[10px] sm:text-xs uppercase font-bold mt-1">
              Whatsapp
            </span>
          </button>
        )}
      </div>
      <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-0 shadow-md">
        <div
            style={{
          backgroundImage: PrimaryColor,
        }}
          className="w-full p-2.5 flex items-cente rounded-sm"
        >
          <h2 className="text-[14px] text-white font-extrabold text-center w-full">
            {activeTab.toUpperCase()}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-0 p-4">
          {renderContent()}
          <form
            onSubmit={handlePayment}
            className="space-y-6 text-black dark:text-white"
          >
            <div className="space-y-1">
              <label htmlFor="UTR" className="block text-[12px] font-bold">
                {activeTab === "usdt" ? "Transaction Hash" : "UTR"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="UTR"
                value={formData.UTR}
                onChange={handleInputChange}
                placeholder={
                  activeTab === "usdt"
                    ? "Enter Transaction Hash"
                    : "6-12 Digit UTR"
                }
                className="w-full px-4 py-3 pr-12 bg-light-bg dark:bg-dark-bg rounded-lg border border-black text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2"
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="image" className="block text-[12px] font-bold">
                Payment Proof <span className="text-red-500">*</span>
              </label>
              <input
                id="image"
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 bg-light-bg dark:bg-dark-bg rounded-lg border border-black text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2"
                accept="image/*"
                required
              />
              {imagePreview && (
                <div className="flex items-center gap-0">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    className="object-contain rounded h-[35px] w-[35px]"
                  />
                  <p className="text-green-500 text-xs">
                    Image uploaded successfully
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="amount" className="block text-[12px] font-bold">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                id="amount"
                type="number"
                value={formData.amount}
                readOnly
                className="w-full px-4 py-3 pr-12 bg-light-bg dark:bg-dark-bg rounded-lg border border-black text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 bg-[#F3F4F6]"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-[12px] font-bold">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                I accept the terms and conditions{" "}
                <span className="text-red-500">*</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-[#6f30ca] to-[#6f30ca] py-3 text-lg font-bold text-white mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PaymentGateway;
