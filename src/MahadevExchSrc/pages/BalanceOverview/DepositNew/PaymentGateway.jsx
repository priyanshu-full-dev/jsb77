import { useEffect, useState, useCallback, useRef } from "react";
import { Copy, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import { SiPhonepe } from "react-icons/si";
import { BsBank2 } from "react-icons/bs";
import { saveAs } from "file-saver";

import {
  createPayment,
  getactiveAdminDepositMethod,
  uploadMedia,
} from "../../../../api";
import {
  getUserId,
  newSky,
  selectSite,
}  from "../../../../utils/helper/commonSelectors";
import { generatePresignedUrl } from "../../../../utils/helper/generatePresignedUrl";
import Loader from "../../../components/Loader/Loader";



const INITIAL_FORM_DATA = {
  UTR: "",
  amount: 0,
  image: null,
  termsAccepted: false,
  PaymentMode: "",
  PaymentBy: "",
  domainId: "",
};

function PaymentGateway({ amount, open, toggle, fetchTransactions }) {
  const siteDetails = useSelector(selectSite);
  const userID = useSelector(getUserId);
  const SkyDesign = useSelector(newSky);
  const domainId = useSelector((state) => state?.site?.siteDetails?.admindomainName?._id);
  const [activeTab, setActiveTab] = useState("phone pe");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [paymentDetails, setPaymentDetails] = useState({
    account: [],
    gpay: [],
  });
  const [imagePreview, setImagePreview] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const fileInputRef = useRef(null);
  const topHeaderColor = siteDetails?.headerColor;

  const handleCopy = useCallback((text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amount: Number(amount) || 0,
      PaymentMode: activeTab,
      PaymentBy: userID || "",
      domainId: domainId || "",
    }));
  }, [amount, activeTab, userID, domainId]);

  useEffect(() => {
    const generateUrl = async () => {
      if (!paymentDetails.gpay?.[0]?.imageUrl) return;
      setLoading(true);
      try {
        const key = paymentDetails.gpay[0].imageUrl;
        const presignedUrl = await generatePresignedUrl(key);
        setQrImageUrl(presignedUrl);
      } catch (error) {
        toast.error("Failed to load QR code");
        console.error("QR code generation error:", error);
        setQrImageUrl("");
      } finally {
        setLoading(false);
      }
    };
    generateUrl();
  }, [paymentDetails.gpay]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getactiveAdminDepositMethod();
        const account = res?.data?.filter((acc) => acc.type === "bank") || [];
        const gpay = res?.data?.filter((acc) => acc.type === "qr") || [];
        setPaymentDetails({ account, gpay });
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
      const renamedFile = new File([file], cleanedFileName, { type: file.type });

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

  const handlePayment = async (e) => {
    e?.preventDefault();

    // Enhanced validation
    if (
      !formData.UTR ||
      !formData.image ||
      formData.amount <= 0 ||
      !formData.PaymentMode ||
      !formData.PaymentBy ||
      !formData.domainId
    ) {
      toast.error("Please fill all required fields: UTR, Amount, Image, Payment Mode, and User ID");
      return;
    }

    if (formData.UTR.length < 6 || formData.UTR.length > 12) {
      toast.error("UTR must be 6-12 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await createPayment(formData);
      if (response.success) {
        toast.success("Payment uploaded successfully");
        setFormData(INITIAL_FORM_DATA);
        setImagePreview(""); // Clear image preview
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        toggle();
        fetchTransactions();
      } else {
        toast.error(response.data.message || "Request not submitted. Please try agian later");
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
  ];

  const handleTabClick = (name) => {
    setActiveTab(name);
  };

  const phoneNumber = SkyDesign === "true" ? "+917371917717" : "+13433414145";
  const message = "Hello, I am interested in your service.";

  const goWhatsapp = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${phoneNumber.replaceAll(" ", "")}?text=${encodedMessage}`,
      "_blank"
    );
  };

  const handleShare = async () => {
    if (navigator.share && qrImageUrl) {
      try {
        await navigator.share({
          title: "QR Code",
          text: "Scan this QR code",
          url: qrImageUrl,
        });
      } catch (error) {
        console.error("Share error:", error);
        toast.error("Failed to share QR code");
      }
    } else {
      toast.error("Sharing not supported on this device");
    }
  };

  const handleDownload = () => {
    if (!qrImageUrl) {
      toast.error("No QR code available to download");
      return;
    }
    try {
      saveAs(qrImageUrl, "qr-code.png");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download QR code. Right-click and save manually.");
    }
  };

  const renderPaymentDetails = (details) => {
    if (!details?.length) {
      return <div className="text-center py-4">No payment details available</div>;
    }

    return (
      <div className="bg-[#F1F5F9] mt-6 rounded-lg space-y-4 p-4">
        {details.map((item) => (
          <div key={item._id} className="space-y-2">
            {item.type === "bank" && (
              <>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold">Bank Name:</span>
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
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold">Account Number:</span>
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
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold">IFSC Code:</span>
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
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold">Account Holder Name:</span>
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
                <span className="font-semibold text-[17px]">UPI ID:</span>
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
            {paymentDetails.gpay?.[0]?.imageUrl && qrImageUrl && (
              <div className="flex flex-col justify-center items-center bg-[#F1F5F9] shadow-md p-3 rounded-md">
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  className="w-[65%] h-[160px] object-cover shadow-md"
                  loading="lazy"
                  onClick={handleDownload}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleShare}
                    className="p-2 bg-[#00A63E] text-white rounded hover:bg-green-700 text-xs"
                  >
                    Share QR
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-[#0288D1] text-white rounded hover:bg-blue-700 text-xs"
                  >
                    Download QR
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case "account":
        return <div className="space-y-6">{renderPaymentDetails(paymentDetails.account)}</div>;
      default:
        return null;
    }
  };

  if (!amount || !open) return null;

  return (
    <div className="container mx-auto max-w-7xl">
      {loading && (
           <Loader/>
      )}
      <div
        style={{ backgroundColor: topHeaderColor?.start || "#000" }}
        className="w-full p-1 flex items-center"
      >
        <button
          onClick={toggle}
          className="flex items-center px-2 text-white bg-[#343435] rounded"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>
      <div className="flex w-full overflow-x-auto mt-2 space-x-2 h-15 bg-white border-b mb-4">
        {tabData.map(({ name, color, icon }) => (
          <button
            key={name}
            onClick={() => handleTabClick(name)}
            className={`flex-1 flex flex-col items-center justify-center p-2 text-white hover:opacity-90 ${color} border border-gray-300 rounded-md`}
          >
            {icon}
            <span className="text-[10px] sm:text-xs uppercase font-bold mt-1">
              {name}
            </span>
          </button>
        ))}
        {siteDetails?.whatsappSupport && (
          <button
            onClick={goWhatsapp}
            className="flex-1 flex flex-col items-center justify-center p-2 text-white hover:opacity-90 bg-[#00C951] border border-gray-300 rounded-md"
          >
            <FaWhatsapp className="h-6 w-6 text-white" />
            <span className="text-[10px] sm:text-xs uppercase font-bold mt-1">
              Whatsapp
            </span>
          </button>
        )}
      </div>
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div
          style={{ backgroundColor: topHeaderColor?.start || "#000" }}
          className="w-full p-2 flex items-center justify-center"
        >
          <h2 className="text-[14px] text-white font-bold">
            {activeTab.toUpperCase()}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 p-4">
          {renderContent()}
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="UTR" className="block text-[12px] font-bold">
                UTR <span className="text-red-500">*</span>
              </label>
              <input
                id="UTR"
                value={formData.UTR}
                onChange={handleInputChange}
                placeholder="6-12 Digit UTR"
                className="w-full p-2 border rounded text-xs"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image" className="block text-[12px] font-bold">
                Payment Proof <span className="text-red-500">*</span>
              </label>
              <input
                id="image"
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-xs"
                accept="image/*"
                required
              />
              {imagePreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    className="object-cover rounded h-[35px] w-[35px]"
                  />
                  <p className="text-green-600 text-xs">
                    Image uploaded successfully
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-[12px] font-bold">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                id="amount"
                type="number"
                value={formData.amount}
                readOnly
                className="w-full p-2 border rounded text-xs bg-[#F3F4F6]"
              />
            </div>
            <button
              style={{
                backgroundImage: `linear-gradient(180deg, ${
                  topHeaderColor?.start || "#000"
                }, ${topHeaderColor?.end || "#000"})`,
              }}
              type="submit"
              disabled={loading || !formData.image}
              className="w-full p-2 text-white rounded hover:from-[#008631] hover:to-[#00A63E] disabled:opacity-50"
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