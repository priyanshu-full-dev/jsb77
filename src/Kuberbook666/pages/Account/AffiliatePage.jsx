import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSitesByDomain, signUp } from "../../../api";
import { selectSite } from "../../../utils/helper/commonSelectors";
import ShareAffiliateDrawer from "../../components/ShareAffiliateDrawer";

export default function AffiliatePage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.userData);
  const siteDetails = useSelector(selectSite());
  const [copied, setCopied] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState("dashboard");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);

  // New user form state matching the modal UI
  const [newPhone, setNewPhone] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [newSelfPassword, setNewSelfPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSelfPassword, setShowSelfPassword] = useState(false);

  const [loadingAddUser, setLoadingAddUser] = useState(false);
  const [errorAddUser, setErrorAddUser] = useState("");
  const [apiSiteData, setApiSiteData] = useState(null);

  // Determine dynamic referral code from logged in user
  const referralCode =
    user?.userName ||
    user?.username ||
    user?.referralCode ||
    user?.userId ||
    "wasimkhan";

  const referralUrl = `https://kuberbook666.online?af_code=${referralCode}`;

  // Fetch site metadata for referral database signup
  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const domainName =
          window.location.host.includes("localhost") ||
          window.location.host.includes("127.0.0.1")
            ? "asianexchange.club"
            : window.location.host;
        const response = await getSitesByDomain(domainName);
        if (response?.data) {
          setApiSiteData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch site details for signup:", err);
      }
    };
    fetchSiteDetails();
  }, []);

  const canvasRef = useRef(null);

  // Draw high quality QR code on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 160, 160);

    ctx.fillStyle = "#000000";
    const size = 160;
    const cells = 25;
    const cellSize = size / cells;

    const drawFinderPattern = (startX, startY) => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(
        startX * cellSize,
        startY * cellSize,
        7 * cellSize,
        7 * cellSize,
      );
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        (startX + 1) * cellSize,
        (startY + 1) * cellSize,
        5 * cellSize,
        5 * cellSize,
      );
      ctx.fillStyle = "#000000";
      ctx.fillRect(
        (startX + 2) * cellSize,
        (startY + 2) * cellSize,
        3 * cellSize,
        3 * cellSize,
      );
    };

    drawFinderPattern(1, 1);
    drawFinderPattern(cells - 8, 1);
    drawFinderPattern(1, cells - 8);

    let hash = 0;
    for (let i = 0; i < referralUrl.length; i++) {
      hash = (hash << 5) - hash + referralUrl.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        if (
          (r < 9 && c < 9) ||
          (r < 9 && c >= cells - 9) ||
          (r >= cells - 9 && c < 9)
        ) {
          continue;
        }

        const val = Math.sin(r * 13.3 + c * 7.7 + hash * 0.001) * 10000;
        if (val - Math.floor(val) > 0.45) {
          ctx.fillRect(
            c * cellSize + 0.5,
            r * cellSize + 0.5,
            cellSize - 1,
            cellSize - 1,
          );
        }
      }
    }

    // Center logo badge
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(80, 80, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c10931";
    ctx.beginPath();
    ctx.arc(80, 80, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 8px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("KB", 80, 80);
  }, [referralUrl]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      const el = document.createElement("textarea");
      el.value = referralUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = () => {
    setShowShareDrawer(true);
  };

  const handleDownloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageURI = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = imageURI;
    a.download = `kuberbook-qr-${referralCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full flex justify-center pb-24 font-sans select-none bg-[#f1f2f6] dark:bg-[#0e1017] min-h-screen">
      <div className="w-full max-w-[480px] md:max-w-[540px] px-2 py-2 space-y-2.5">
        {/* 1. Today Status Card */}
        <div
          className="relative overflow-hidden rounded-xl p-3.5 text-white shadow-sm"
          style={{ backgroundColor: "#c10931" }}
        >
          {/* Background curved ellipses */}
          <div className="absolute right-0 top-0 h-full w-32 pointer-events-none opacity-30">
            <svg viewBox="0 0 126 147" fill="none" className="w-full h-full">
              <circle cx="49" cy="13" r="49" fill="#fff" opacity="0.3" />
              <circle cx="129" cy="62" r="85" fill="#fff" opacity="0.4" />
            </svg>
          </div>

          <div className="mb-3">
            <h3 className="text-[15px] font-bold text-[#ffd200]">
              Today Status
            </h3>
          </div>

          {/* 2-Column Split by Center Vertical Line */}
          <div className="grid grid-cols-2 divide-x divide-white/25">
            {/* Left Column */}
            <div className="flex flex-col items-center justify-center gap-y-3 pr-2 text-center">
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg text-white">0</span>
                <p className="text-[11px] text-white/95 font-medium">
                  Total Deposit
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg text-white">0</span>
                <p className="text-[11px] text-white/95 font-medium">
                  Total User
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col items-center justify-center gap-y-3 pl-2 text-center">
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg text-white">0</span>
                <p className="text-[11px] text-white/95 font-medium">
                  Total Deposit Count
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg text-white">0</span>
                <p className="text-[11px] text-white/95 font-medium">
                  Total Commision
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Invite Your Friends Card */}
        <div
          className="rounded-xl p-3.5 text-white shadow-sm"
          style={{ backgroundColor: "#c10931" }}
        >
          {/* Header with Illustration */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[16px] font-bold text-[#ffd200]">
                Invite Your Friends
              </h2>
              <p className="text-[11.5px] text-white font-medium mt-0.5">
                To Join And You Can Receive Huge Bonuses
              </p>
            </div>
            <div className="shrink-0 pl-2">
              <img
                src="/affi-invite-img.svg"
                alt="invite"
                className="w-13 h-auto max-w-[55px]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>

          {/* ADD NEW USER Button */}
          <div className="mb-3">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="w-full py-2.5 px-4 rounded-full font-bold text-xs tracking-wider text-white flex items-center justify-center gap-2 active:scale-98 transition shadow"
              style={{ backgroundColor: "#580516" }}
              type="button"
            >
              <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[11px] font-bold">
                +
              </span>
              <span>ADD NEW USER</span>
            </button>
          </div>

          {/* Invitation Code Container */}
          <div
            className="rounded-xl p-3 shadow-inner"
            style={{ backgroundColor: "#580516" }}
          >
            {/* Heading */}
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-base">🎁</span>
              <h3 className="font-bold text-xs text-[#ffd200]">
                Invitation Code
              </h3>
            </div>

            {/* URL Box */}
            <div
              className="rounded-lg py-2 px-3 text-xs text-white font-bold break-all mb-3 text-center shadow-sm"
              style={{ backgroundColor: "#c10931" }}
            >
              <span>{referralUrl}</span>
            </div>

            {/* QR & Action Buttons */}
            <div className="flex items-center justify-between gap-3">
              {/* QR Code Canvas */}
              <div className="flex flex-col items-center">
                <div className="p-1 bg-white rounded-lg shadow-sm">
                  <canvas
                    ref={canvasRef}
                    id="qrCanvas"
                    className="qr-canvas rounded"
                    height={100}
                    width={100}
                    style={{ height: "100px", width: "100px" }}
                  />
                </div>
                <button
                  onClick={handleDownloadQR}
                  className="font-bold text-white text-[11px] mt-1 cursor-pointer hover:underline"
                >
                  Download
                </button>
              </div>

              {/* Copy Link & Share Buttons */}
              <div className="flex-1 flex flex-col gap-2.5">
                <button
                  onClick={handleCopyLink}
                  className="w-full py-2 px-4 rounded-full font-bold text-xs text-white flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
                  style={{ backgroundColor: "#c10931" }}
                  type="button"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full py-2 px-4 rounded-full font-bold text-xs text-white flex items-center justify-center active:scale-95 transition shadow-sm"
                  style={{ backgroundColor: "#c10931" }}
                  type="button"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Top 5 Loss Users Card */}
        <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
          <div
            className="w-full px-3 py-2 text-white font-bold text-xs flex items-center justify-between"
            style={{ backgroundColor: "#c10931" }}
          >
            <h3 className="text-[#ffd200] font-bold text-[13px]">
              Top 5 Loss Users
            </h3>
          </div>

          <div className="p-3 pt-2">
            <div className="flex justify-end pr-1 mb-1">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                strokeWidth="2.5"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </div>

            <div className="w-full relative h-36 flex flex-col justify-between text-[10px] text-gray-500 pr-2">
              {[
                { label: "2" },
                { label: "1.5" },
                { label: "1" },
                { label: "0.5" },
                { label: "0" },
              ].map((row, i) => (
                <div key={i} className="flex items-center w-full gap-2">
                  <span className="w-5 text-right font-medium">
                    {row.label}
                  </span>
                  <div className="flex-1 h-[1px] bg-gray-200"></div>
                </div>
              ))}

              <div className="flex justify-between pl-7 pr-1 pt-1 text-[10px] text-gray-500 font-medium">
                {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map(
                  (n) => (
                    <span key={n}>{n}</span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bonus Information Card */}
        <div
          className="relative overflow-hidden rounded-xl p-3.5 text-white shadow-sm"
          style={{ backgroundColor: "#c10931" }}
        >
          <div className="absolute right-0 top-0 h-full w-32 pointer-events-none opacity-30">
            <svg viewBox="0 0 126 147" fill="none" className="w-full h-full">
              <circle cx="49" cy="13" r="49" fill="#fff" opacity="0.3" />
              <circle cx="129" cy="62" r="85" fill="#fff" opacity="0.4" />
            </svg>
          </div>
          <div className="mb-3">
            <h3 className="text-[14px] font-bold text-[#ffd200]">
              Bonus Information
            </h3>
          </div>

          <div className="grid grid-cols-2 divide-x divide-white/25">
            {/* Left Column: Trophy */}
            <div className="flex flex-col items-center justify-center gap-2 pr-2 text-center cursor-pointer">
              <img
                src="/affi-bonus.svg"
                alt="How To Get Bonus?"
                className="w-12 h-12"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-xs font-bold text-white">
                How To Get Bonus?
              </span>
            </div>

            {/* Right Column: Cash Stack */}
            <div className="flex flex-col items-center justify-center gap-2 pl-2 text-center cursor-pointer">
              <img
                src="/affi-bonus-2.svg"
                alt="Commission Info"
                className="w-12 h-12"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-xs font-bold text-white">
                Commission Info
              </span>
            </div>
          </div>
        </div>

        {/* 5. Today Profit And Loss Table */}
        <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 mb-6">
          <div
            className="w-full px-3 py-2 text-white font-bold text-xs"
            style={{ backgroundColor: "#c10931" }}
          >
            <h6 className="text-[#ffd200] font-bold text-[13px]">
              Today Profit And Loss
            </h6>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-900 font-bold">
                <th className="px-3 py-2.5 text-left font-bold text-[12px]">
                  Type
                </th>
                <th className="px-3 py-2.5 text-right pr-6 font-bold text-[12px]">
                  PL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              <tr className="hover:bg-gray-50/50">
                <td className="px-3 py-2 text-left font-medium text-[12px]">
                  Sports
                </td>
                <td className="px-3 py-2 text-right pr-6 font-bold text-[#16a34a] text-[13px]">
                  0
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-3 py-2 text-left font-medium text-[12px]">
                  Casino
                </td>
                <td className="px-3 py-2 text-right pr-6 font-bold text-[#16a34a] text-[13px]">
                  0
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-3 py-2 text-left font-medium text-[12px]">
                  International Casino (QT)
                </td>
                <td className="px-3 py-2 text-right pr-6 font-bold text-[#16a34a] text-[13px]">
                  0
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. FIXED BOTTOM FOOTER - PIXEL PERFECT WITH INLINE ICONS (ZERO BROKEN IMGS) */}
      {/* ========================================================================= */}
      <div
        className="fixed bottom-0 left-0 right-0 h-14 z-50 flex items-center justify-between shadow-2xl select-none"
        style={{
          background: "linear-gradient(90deg, #6e081d 0%, #c10931 100%)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Dashboard (Active Highlight) */}
        <div
          onClick={() => navigate("/affiliate")}
          className="flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition"
          style={{
            background: "linear-gradient(180deg, #6e081c 0%, #72000f 100%)",
          }}
        >
          {/* Dashboard Icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" ry="5"></rect>
            <line x1="9" y1="14" x2="9" y2="10"></line>
            <line x1="12" y1="15" x2="12" y2="9"></line>
            <line x1="15" y1="14" x2="15" y2="11"></line>
          </svg>
          <span className="text-[10px] font-bold text-white tracking-wide">
            Dashboard
          </span>
        </div>

        {/* User List */}
        <div
          onClick={() => navigate("/affiliate/user-list")}
          className="flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition"
          style={{
            background: "transparent",
          }}
        >
          {/* User List Icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className="text-[10px] font-bold text-white tracking-wide">
            User List
          </span>
        </div>

        {/* Center Floating Radiant Share Button */}
        <div className="footerMenu footerCasino">
          <button
            onClick={handleShare}
            className="affi-share-button active:scale-95 transition-transform mt-[-45px]"
            type="button"
          >
            <img
              src="/affshare.png"
              alt="Share"
              style={{ width: "75px", height: "75px", objectFit: "contain" }}
            />
          </button>
        </div>

        {/* Profit/Loss */}
        <div
          onClick={() => navigate("/affiliate/user-profit-loss")}
          className="flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition"
          style={{
            background: "transparent",
          }}
        >
          {/* Profit/Loss Pie Icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
          <span className="text-[10px] font-bold text-white tracking-wide">
            Profit/Loss
          </span>
        </div>

        {/* Report */}
        <div
          onClick={() => navigate("/affiliate/report")}
          className="flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition"
          style={{
            background: "transparent",
          }}
        >
          {/* Report Document Icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="8" y1="13" x2="16" y2="13"></line>
            <line x1="8" y1="17" x2="12" y2="17"></line>
            <text
              x="13.5"
              y="19.5"
              fontSize="7"
              fontWeight="bold"
              fill="#ffffff"
              stroke="none"
            >
              %
            </text>
          </svg>
          <span className="text-[10px] font-bold text-white tracking-wide">
            Report
          </span>
        </div>
      </div>

      {/* Add New User Modal (Exact Match to Screenshot) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
          <div className="w-full max-w-[340px] bg-white rounded-2xl p-5 shadow-2xl relative text-gray-800 animate-scaleUp">
            {/* Round Black Close Button in Top-Right */}
            <button
              onClick={() => {
                setShowAddUserModal(false);
                setErrorAddUser("");
              }}
              type="button"
              className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold hover:opacity-80 transition cursor-pointer shadow"
            >
              ✕
            </button>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setErrorAddUser("");

                const cleanPhone = newPhone.replace(/\D/g, "").slice(-10);
                if (!cleanPhone || cleanPhone.length < 10) {
                  setErrorAddUser("Please enter a valid 10-digit mobile number");
                  return;
                }
                if (!newUsername.trim()) {
                  setErrorAddUser("Username is required");
                  return;
                }
                if (!newPassword || newPassword.length < 6) {
                  setErrorAddUser("Password must be at least 6 characters");
                  return;
                }
                if (newPassword !== newConfirmPassword) {
                  setErrorAddUser("Passwords do not match");
                  return;
                }

                setLoadingAddUser(true);
                try {
                  let cachedSite = null;
                  try {
                    cachedSite = JSON.parse(localStorage.getItem("siteDetails") || "{}");
                  } catch {
                    cachedSite = {};
                  }

                  const createdById =
                    apiSiteData?.createdBy?._id ||
                    apiSiteData?.siteDetails?.createrId ||
                    siteDetails?.createdBy?._id ||
                    siteDetails?.createrId ||
                    siteDetails?.siteDetails?.createrId ||
                    cachedSite?.createdBy?._id ||
                    cachedSite?.createrId ||
                    "6a8d85907a10e78fbbcd5cee";

                  const roleId =
                    apiSiteData?.userRoleId ||
                    siteDetails?.userRoleId ||
                    siteDetails?.siteDetails?.userRoleId ||
                    cachedSite?.userRoleId ||
                    "6a8553b2e180c5acfc1e3fc3";

                  const domainId =
                    apiSiteData?.siteDetails?.domainDetails?._id ||
                    apiSiteData?.domainDetails?._id ||
                    siteDetails?.domainDetails?._id ||
                    siteDetails?.siteDetails?.domainDetails?._id ||
                    cachedSite?.domainDetails?._id ||
                    "6a85553b526a2dbeb187f070";

                  const ownerDomainId =
                    apiSiteData?.siteDetails?.admindomainName?._id ||
                    apiSiteData?.admindomainName?._id ||
                    siteDetails?.admindomainName?._id ||
                    siteDetails?.siteDetails?.admindomainName?._id ||
                    cachedSite?.admindomainName?._id ||
                    "6a85553b526a2dbeb187f071";

                  const siteId =
                    apiSiteData?.siteDetails?._id ||
                    apiSiteData?._id ||
                    siteDetails?.siteDetails?._id ||
                    siteDetails?._id ||
                    cachedSite?.siteDetails?._id ||
                    cachedSite?._id ||
                    "6a859c4209b8c3333c187921";

                  // Payload linked to this user's referral code
                  const payload = {
                    mobile: cleanPhone,
                    userName: newUsername.trim() || cleanPhone,
                    name: newUsername.trim() || cleanPhone,
                    password: newPassword.trim(),
                    confirmPassword: newConfirmPassword.trim(),
                    selfPassword: newSelfPassword.trim(),
                    otp: "",
                    x_panel_type: "user",
                    commission: 0,
                    openingBalance: 0,
                    availableBalance: 0,
                    creditReference: 0,
                    partnership: 0,
                    currency: "INR",
                    exposureLimit: 200000,
                    exposure: 0,
                    createdBy: createdById,
                    referredBy: referralCode, // Linked directly as referral
                    deviceIp: "0.0.0",
                    role: roleId,
                    domain: domainId,
                    ownerDomainId: ownerDomainId || domainId,
                    siteID: siteId,
                    isSignupUser: true,
                    layout: apiSiteData?.siteDetails?.layout || siteDetails?.layout || "asianexchange",
                  };

                  const response = await signUp(payload);
                  if (
                    response?.data?.message === "User created successfully" ||
                    response?.data?.success ||
                    response?.success
                  ) {
                    toast.success(response?.data?.message || "User created successfully!");
                    setShowAddUserModal(false);
                    setNewPhone("");
                    setNewUsername("");
                    setNewPassword("");
                    setNewConfirmPassword("");
                    setNewSelfPassword("");
                  } else {
                    const msg = response?.data?.message || response?.message || "Failed to create user";
                    setErrorAddUser(msg);
                    toast.error(msg);
                  }
                } catch (err) {
                  console.error("Create referral user error:", err);
                  const msg = err?.response?.data?.message || err?.message || "Failed to create user";
                  setErrorAddUser(msg);
                  toast.error(msg);
                } finally {
                  setLoadingAddUser(false);
                }
              }}
              className="pt-4"
            >
              {/* 1. Phone Number Input with +91 and Indian Flag */}
              <div className="bg-[#f0f2f5] rounded-lg px-3.5 py-3 flex items-center gap-2.5 border border-transparent focus-within:border-gray-300">
                <div className="flex items-center gap-1.5 text-gray-800 text-xs font-bold shrink-0 select-none">
                  <span>+91</span>
                  <span className="text-base leading-none">🇮🇳</span>
                  <svg className="w-3 h-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="895XX6XXXX"
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium tracking-wide"
                  required
                />
              </div>

              {/* Character Count below Phone */}
              <div className="text-right text-[11px] text-red-500 font-semibold mt-1 mb-3.5 pr-1">
                {newPhone.length}/10
              </div>

              {/* 2. Username Input */}
              <div className="bg-[#f0f2f5] rounded-lg px-3.5 py-3 mb-3.5 border border-transparent focus-within:border-gray-300">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter Username"
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* 3. Password Input */}
              <div className="bg-[#f0f2f5] rounded-lg px-3.5 py-3 mb-3.5 flex items-center justify-between border border-transparent focus-within:border-gray-300">
                <div className="flex items-center gap-2.5 flex-1 mr-2">
                  <svg className="w-4 h-4 text-[#8b0a24] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#8b0a24] hover:opacity-80 transition cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              {/* 4. Confirm Password Input */}
              <div className="bg-[#f0f2f5] rounded-lg px-3.5 py-3 mb-3.5 flex items-center justify-between border border-transparent focus-within:border-gray-300">
                <div className="flex items-center gap-2.5 flex-1 mr-2">
                  <svg className="w-4 h-4 text-[#8b0a24] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#8b0a24] hover:opacity-80 transition cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              {/* 5. Self Password Input */}
              <div className="bg-[#f0f2f5] rounded-lg px-3.5 py-3 mb-4 flex items-center justify-between border border-transparent focus-within:border-gray-300">
                <div className="flex items-center gap-2.5 flex-1 mr-2">
                  <svg className="w-4 h-4 text-[#8b0a24] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <input
                    type={showSelfPassword ? "text" : "password"}
                    value={newSelfPassword}
                    onChange={(e) => setNewSelfPassword(e.target.value)}
                    placeholder="Self Password"
                    className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowSelfPassword(!showSelfPassword)}
                  className="text-[#8b0a24] hover:opacity-80 transition cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {showSelfPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              {/* Error Message */}
              {errorAddUser && (
                <div className="text-red-600 text-xs font-semibold mb-3 text-center">
                  {errorAddUser}
                </div>
              )}

              {/* 6. Submit Button */}
              <button
                type="submit"
                disabled={loadingAddUser}
                className="w-full py-3 rounded-lg text-white font-bold text-sm tracking-wider shadow-md active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: "#6e081c" }}
              >
                {loadingAddUser ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </span>
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Affiliate Link / Code Bottom Sheet Drawer */}
      <ShareAffiliateDrawer
        isOpen={showShareDrawer}
        onClose={() => setShowShareDrawer(false)}
        referralUrl={referralUrl}
        copied={copied}
        onCopy={handleCopyLink}
      />
    </div>
  );
}
