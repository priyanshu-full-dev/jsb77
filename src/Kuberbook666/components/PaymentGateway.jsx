import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getactiveAdminDepositMethod,
  uploadMedia,
  createPayment,
} from "../../api";
import { generatePresignedUrl } from "../../utils/helper/generatePresignedUrl";

export default function PaymentGateway({ amount, toggle, fetchTransactions, onClose }) {
  const [activeTab, setActiveTab] = useState("qr"); // 'qr' | 'bank' | 'usdt'
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({ qr: [], bank: [], usdt: [] });
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const userId = useSelector(
    (state) => state?.user?.userData?._id || localStorage.getItem("userId") || ""
  );
  const domainId = useSelector(
    (state) =>
      state?.site?.siteDetails?.admindomainName?._id ||
      state?.site?.siteDetails?.domainDetails?._id ||
      state?.site?.siteDetails?.domainId ||
      ""
  );

  const [formData, setFormData] = useState({
    UTR: "",
    amount: amount,
    image: null,
    termsAccepted: false,
    PaymentMode: "qr",
    PaymentBy: userId,
    domainId: domainId,
  });

  // 1. Fetch active admin deposit methods
  useEffect(() => {
    const fetchMethods = async () => {
      setLoading(true);
      try {
        const res = await getactiveAdminDepositMethod();
        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        const bank = data.filter(
          (acc) => (acc.type || "").toLowerCase() === "bank"
        );
        const qr = data.filter(
          (acc) =>
            (acc.type || "").toLowerCase() === "qr" ||
            (acc.type || "").toLowerCase() === "upi"
        );
        const usdt = data.filter(
          (acc) =>
            (acc.type || "").toLowerCase() === "usdt" ||
            (acc.type || "").toLowerCase() === "crypto"
        );

        setPaymentMethods({ bank, qr, usdt });

        // Set default active tab based on what's available
        if (qr.length > 0) setActiveTab("qr");
        else if (bank.length > 0) setActiveTab("bank");
        else if (usdt.length > 0) setActiveTab("usdt");
      } catch (err) {
        console.error("Failed to load deposit payment methods:", err);
        toast.error("Failed to load payment methods");
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  // 2. Fetch dynamic presigned QR image url when QR / USDT tab is active
  useEffect(() => {
    const loadQr = async () => {
      const activeList =
        activeTab === "qr" ? paymentMethods.qr : paymentMethods.usdt;
      const targetItem = activeList?.[0];
      const imgKey = targetItem?.imageUrl;

      if (!imgKey) {
        setQrImageUrl("");
        return;
      }

      if (imgKey.startsWith("http://") || imgKey.startsWith("https://")) {
        setQrImageUrl(imgKey);
        return;
      }

      try {
        const presigned = await generatePresignedUrl(imgKey);
        setQrImageUrl(presigned || imgKey);
      } catch (err) {
        console.error("QR presigned URL error:", err);
        setQrImageUrl(imgKey);
      }
    };
    loadQr();
  }, [activeTab, paymentMethods]);

  // 3. Handle File / Slip Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const cleanFileName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_.-]/g, "");
    const renamedFile = new File([file], cleanFileName, { type: file.type });

    const uploadData = new FormData();
    uploadData.append("image", renamedFile);

    setUploadingImage(true);
    try {
      const res = await uploadMedia(uploadData);
      const imageUrl = res?.data?.data?.url || res?.data?.url;
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        toast.success("Payment slip uploaded!");
      } else {
        toast.error("Failed to retrieve uploaded image URL");
      }
    } catch (err) {
      console.error("Slip upload error:", err);
      toast.error("Failed to upload slip. Try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // 4. Submit Payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.UTR.trim()) {
      toast.error("Please enter 12-digit UTR / Transaction ID");
      return;
    }
    if (!formData.image) {
      toast.error("Please upload payment screenshot / receipt");
      return;
    }
    if (!formData.termsAccepted) {
      toast.error("Please accept the terms & conditions");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: Number(amount),
        PaymentMode: activeTab,
        PaymentBy: userId,
        domainId: domainId,
      };

      const res = await createPayment(payload);
      if (
        res?.data?.success ||
        res?.success ||
        res?.data?.message?.toLowerCase().includes("success") ||
        res?.message?.toLowerCase().includes("success")
      ) {
        toast.success("Deposit request submitted successfully!");
        if (typeof fetchTransactions === "function") {
          fetchTransactions();
        }
        if (typeof toggle === "function") {
          toggle();
        }
        if (typeof onClose === "function") {
          onClose();
        }
      } else {
        toast.error(res?.data?.message || res?.message || "Failed to submit request");
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      toast.error(
        err?.response?.data?.message || "An error occurred during submission"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label = "Item") => {
    if (!text) return;
    navigator.clipboard
      .writeText(String(text))
      .then(() => toast.success(`${label} copied to clipboard!`))
      .catch(() => toast.error("Failed to copy"));
  };

  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-lg p-4 sm:p-6 font-sans">
      {/* Header with Back button */}
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-[#680a1e] transition-colors cursor-pointer"
        >
          <span>←</span> Back to Amount
        </button>
        <div className="text-right">
          <span className="text-xs text-gray-500 font-semibold block">Deposit Amount</span>
          <span className="text-base sm:text-lg font-black text-[#680a1e]">₹{Number(amount).toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Method Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#f2f3f7] p-1 rounded-xl mb-5">
        <button
          type="button"
          className={`py-2 px-1 text-center rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "qr"
              ? "bg-[#680a1e] text-white shadow-sm"
              : "text-gray-700 hover:text-black"
          }`}
          onClick={() => setActiveTab("qr")}
        >
          UPI / QR Code
        </button>
        <button
          type="button"
          className={`py-2 px-1 text-center rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "bank"
              ? "bg-[#680a1e] text-white shadow-sm"
              : "text-gray-700 hover:text-black"
          }`}
          onClick={() => setActiveTab("bank")}
        >
          Bank Transfer
        </button>
        <button
          type="button"
          className={`py-2 px-1 text-center rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "usdt"
              ? "bg-[#680a1e] text-white shadow-sm"
              : "text-gray-700 hover:text-black"
          }`}
          onClick={() => setActiveTab("usdt")}
        >
          USDT / Crypto
        </button>
      </div>

      {/* Method 1: UPI / QR Code Details */}
      {activeTab === "qr" && (
        <div className="text-center p-4 bg-gray-50 border border-gray-100 rounded-xl mb-5">
          <p className="text-xs sm:text-sm font-bold text-gray-800 mb-3">
            Scan QR code using PhonePe / GPay / Paytm
          </p>
          {qrImageUrl ? (
            <div className="inline-block p-2 bg-white rounded-xl border-2 border-gray-200 shadow-sm mb-3">
              <img
                src={qrImageUrl}
                alt="Admin QR Code"
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain mx-auto rounded"
              />
            </div>
          ) : (
            <div className="w-44 h-44 mx-auto flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded-xl border border-dashed mb-3">
              {loading ? "Loading QR..." : "No QR available"}
            </div>
          )}
          {paymentMethods.qr?.[0]?.upiId && (
            <div className="flex justify-center items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg max-w-sm mx-auto shadow-xs">
              <span className="font-mono text-xs sm:text-sm font-bold text-gray-800 break-all">
                {paymentMethods.qr[0].upiId}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(paymentMethods.qr[0].upiId, "UPI ID")}
                className="text-[#680a1e] text-xs font-bold px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition cursor-pointer"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Method 2: Bank Transfer Details */}
      {activeTab === "bank" && (
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-5 text-xs sm:text-sm space-y-2.5">
          {paymentMethods.bank?.[0] ? (
            <>
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Bank Name:</span>
                <span className="font-bold text-gray-900">{paymentMethods.bank[0].bankName || "Bank"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Account Number:</span>
                <span className="font-mono font-bold text-gray-900 flex items-center gap-2">
                  {paymentMethods.bank[0].accountNumber}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentMethods.bank[0].accountNumber, "Account Number")}
                    className="text-[#680a1e] text-[11px] font-bold px-1.5 py-0.5 bg-red-50 hover:bg-red-100 rounded transition cursor-pointer"
                  >
                    Copy
                  </button>
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">IFSC Code:</span>
                <span className="font-mono font-bold text-gray-900 flex items-center gap-2">
                  {paymentMethods.bank[0].ifsc}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentMethods.bank[0].ifsc, "IFSC Code")}
                    className="text-[#680a1e] text-[11px] font-bold px-1.5 py-0.5 bg-red-50 hover:bg-red-100 rounded transition cursor-pointer"
                  >
                    Copy
                  </button>
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-semibold">Account Holder:</span>
                <span className="font-bold text-gray-900">{paymentMethods.bank[0].accountHolderName}</span>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-400 text-xs">
              {loading ? "Loading bank details..." : "No active bank accounts found"}
            </div>
          )}
        </div>
      )}

      {/* Method 3: USDT / Crypto Details */}
      {activeTab === "usdt" && (
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-5 text-xs sm:text-sm space-y-2.5">
          {paymentMethods.usdt?.[0] ? (
            <>
              {qrImageUrl && (
                <div className="text-center mb-3">
                  <div className="inline-block p-2 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                    <img
                      src={qrImageUrl}
                      alt="USDT QR"
                      className="w-40 h-40 object-contain mx-auto rounded"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Network:</span>
                <span className="font-bold text-gray-900">{paymentMethods.usdt[0].network || "TRC20"}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-semibold">Wallet Address:</span>
                <span className="font-mono font-bold text-gray-900 flex items-center gap-2 break-all text-[11px]">
                  {paymentMethods.usdt[0].walletAddress || paymentMethods.usdt[0].accountNumber}
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        paymentMethods.usdt[0].walletAddress || paymentMethods.usdt[0].accountNumber,
                        "Wallet Address"
                      )
                    }
                    className="text-[#680a1e] text-[11px] font-bold px-1.5 py-0.5 bg-red-50 hover:bg-red-100 rounded transition cursor-pointer"
                  >
                    Copy
                  </button>
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-400 text-xs">
              {loading ? "Loading USDT details..." : "No active USDT accounts found"}
            </div>
          )}
        </div>
      )}

      {/* Payment Proof / Slip Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">
            12-Digit UTR / Transaction ID <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 329482910392"
            value={formData.UTR}
            onChange={(e) => setFormData({ ...formData, UTR: e.target.value })}
            className="w-full bg-[#f2f4f8] border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 focus:outline-hidden focus:border-red-600 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">
            Upload Payment Proof / Screenshot <span className="text-red-600">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#680a1e] file:text-white hover:file:opacity-90 cursor-pointer"
          />
          {uploadingImage && (
            <p className="text-xs text-blue-600 font-semibold mt-1 animate-pulse">
              Uploading receipt to server...
            </p>
          )}
          {imagePreview && !uploadingImage && (
            <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 border rounded-xl">
              <img
                src={imagePreview}
                alt="Slip preview"
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <span className="text-xs text-green-700 font-bold">✓ Screenshot Attached</span>
            </div>
          )}
        </div>

        <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer pt-1">
          <input
            type="checkbox"
            required
            checked={formData.termsAccepted}
            onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
            className="mt-0.5 rounded text-[#680a1e] focus:ring-red-600"
          />
          <span>I confirm that I have transferred ₹{amount} to the designated admin account.</span>
        </label>

        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full py-3 rounded-xl bg-[#680a1e] hover:bg-[#580718] text-white font-bold text-sm tracking-wide shadow-md active:scale-98 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Processing..." : "SUBMIT DEPOSIT REQUEST"}
        </button>
      </form>
    </div>
  );
}
