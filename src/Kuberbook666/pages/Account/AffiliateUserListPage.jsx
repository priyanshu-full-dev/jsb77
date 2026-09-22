import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAffiliateData, getSitesByDomain, signUp } from "../../../api";
import { selectSite } from "../../../utils/helper/commonSelectors";
import ShareAffiliateDrawer from "../../components/ShareAffiliateDrawer";
import "../../styles/affiliate.css";

export default function AffiliateUserListPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.userData);
  const siteDetails = useSelector(selectSite());

  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New user form state
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
        console.error("Failed to fetch site details:", err);
      }
    };
    fetchSiteDetails();
  }, []);

  // Fetch referred users list dynamically
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const currentUserId = user?._id || user?.userId || "";
      const response = await getAffiliateData(1, 50, "", [], "active", currentUserId);
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setUserList(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setUserList(response.data);
      } else if (Array.isArray(response?.users)) {
        setUserList(response.users);
      } else {
        setUserList([]);
      }
    } catch (err) {
      console.error("Failed to fetch affiliate users:", err);
      setUserList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral Link Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex items-start justify-center w-full min-h-screen bg-[#f2f4f7] pb-24 lg:pb-10 font-sans">
      <div
        className="w-full md:mt-[0px] lg:overflow-auto lg:w-[85%] mb-[105px] lg:mb-[10px]"
        style={{ minHeight: "calc(100dvh - 110px)" }}
      >
        {/* Desktop Top Tabs Navigation */}
        <div className="flex items-center hidden lg:flex justify-between w-full overflow-x-auto gap-[3px] no-scrollbar mt-3 text-center">
          <div className="flex gap-[6px]">
            <button
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out bg-white hover:bg-gray-100 px-4 py-2 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 whitespace-nowrap uppercase font-bold text-xs cursor-pointer shadow-sm"
              type="button"
              onClick={() => navigate("/affiliate")}
            >
              <span>Dashboard</span>
            </button>
            <button
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out text-white px-4 py-2 flex items-center justify-center border border-[#c10931] rounded-full whitespace-nowrap uppercase font-bold text-xs cursor-pointer shadow"
              style={{ backgroundColor: "#c10931" }}
              type="button"
              onClick={() => navigate("/affiliate/user-list")}
            >
              <span>User List</span>
            </button>
            <button
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out bg-white hover:bg-gray-100 px-4 py-2 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 whitespace-nowrap uppercase font-bold text-xs cursor-pointer shadow-sm"
              type="button"
              onClick={() => setShowShareDrawer(true)}
            >
              <span>Share Affiliate</span>
            </button>
            <button
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out bg-white hover:bg-gray-100 px-4 py-2 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 whitespace-nowrap uppercase font-bold text-xs cursor-pointer shadow-sm"
              type="button"
              onClick={() => navigate("/affiliate/user-profit-loss")}
            >
              <span>User Profit/Loss</span>
            </button>
            <button
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out bg-white hover:bg-gray-100 px-4 py-2 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 whitespace-nowrap uppercase font-bold text-xs cursor-pointer shadow-sm"
              type="button"
              onClick={() => navigate("/affiliate/report")}
            >
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto bg-white rounded-lg m-2 lg:m-0 lg:mt-3 shadow border border-gray-200">
          <table className="table bg-white w-full border-collapse">
            <thead>
              <tr style={{ background: "var(--color-bg-primary-aff, #c10931)" }}>
                <th className="text-center py-2.5 px-2 text-white text-nowrap text-xs font-bold uppercase tracking-wider">
                  User Name
                </th>
                <th className="text-center py-2.5 px-2 text-white text-xs font-bold uppercase tracking-wider">
                  Balance
                </th>
                <th className="text-center py-2.5 px-2 text-white text-nowrap text-xs font-bold uppercase tracking-wider">
                  Created Date Time
                </th>
                <th className="text-center py-2.5 px-2 text-white text-nowrap text-xs font-bold uppercase tracking-wider">
                  Statement
                </th>
                <th className="text-center py-2.5 px-2 text-white text-nowrap text-xs font-bold uppercase tracking-wider">
                  PL
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center text-xs py-6 text-gray-500 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-[#c10931]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading referral users...</span>
                    </div>
                  </td>
                </tr>
              ) : userList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-xs py-4 text-gray-600 font-medium">
                    No Records Found
                  </td>
                </tr>
              ) : (
                userList.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="text-center py-2.5 px-2 text-xs font-bold text-gray-800">
                      {item.userName || item.username || item.mobile || "-"}
                    </td>
                    <td className="text-center py-2.5 px-2 text-xs font-bold text-gray-800">
                      ₹{Number(item.availableBalance ?? item.balance ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="text-center py-2.5 px-2 text-xs text-gray-600 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="text-center py-2.5 px-2 text-xs font-bold text-[#c10931] cursor-pointer hover:underline">
                      Statement
                    </td>
                    <td
                      className={`text-center py-2.5 px-2 text-xs font-bold ${
                        (item.pl || 0) >= 0 ? "text-[#16a34a]" : "text-red-600"
                      }`}
                    >
                      {item.pl || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add New User Button */}
        <div className="nw-affi-add-new-user-btn-sec m-2 lg:m-0 mt-3">
          <button
            className="nw-affi-add-new-user-btn"
            onClick={() => setShowAddUserModal(true)}
            type="button"
          >
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[11px] font-bold">
                +
              </span>
              <span>ADD NEW USER</span>
            </span>
          </button>
        </div>

        {/* Share Bottom Drawer */}
        <ShareAffiliateDrawer
          isOpen={showShareDrawer}
          onClose={() => setShowShareDrawer(false)}
          referralUrl={referralUrl}
          copied={copied}
          onCopy={handleCopyLink}
        />
      </div>

      {/* Mobile Footer */}
      <div className="mobileFooter flex lg:hidden">
        <div className="footerMenu" onClick={() => navigate("/affiliate")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="5" ry="5"></rect>
            <line x1="9" y1="14" x2="9" y2="10"></line>
            <line x1="12" y1="15" x2="12" y2="9"></line>
            <line x1="15" y1="14" x2="15" y2="11"></line>
          </svg>
          <span>Dashboard</span>
        </div>
        <div
          className="footerMenu active"
          onClick={() => navigate("/affiliate/user-list")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>User List</span>
        </div>
        <div className="footerMenu footerCasino">
          <button
            className="affi-share-button active:scale-95 transition-transform mt-[-45px]"
            onClick={() => setShowShareDrawer(true)}
            type="button"
          >
            <img
              src="/affshare.png"
              alt="Share"
              style={{ width: "75px", height: "75px", objectFit: "contain" }}
            />
          </button>
        </div>
        <div
          className="footerMenu"
          onClick={() => navigate("/affiliate/user-profit-loss")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
          <span>Profit/Loss</span>
        </div>
        <div
          className="footerMenu"
          onClick={() => navigate("/affiliate/report")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="8" y1="13" x2="16" y2="13"></line>
            <line x1="8" y1="17" x2="12" y2="17"></line>
            <text x="13.5" y="19.5" fontSize="7" fontWeight="bold" fill="#ffffff" stroke="none">%</text>
          </svg>
          <span>Report</span>
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
          <div className="w-full max-w-[340px] bg-white rounded-2xl p-5 shadow-2xl relative text-gray-800 animate-scaleUp">
            {/* Round Black Close Button */}
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
                    referredBy: referralCode,
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
                    fetchUsers();
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
              {/* Phone */}
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

              <div className="text-right text-[11px] text-red-500 font-semibold mt-1 mb-3.5 pr-1">
                {newPhone.length}/10
              </div>

              {/* Username */}
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

              {/* Password */}
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

              {/* Confirm Password */}
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

              {/* Self Password */}
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

              {errorAddUser && (
                <div className="text-red-600 text-xs font-semibold mb-3 text-center">
                  {errorAddUser}
                </div>
              )}

              {/* Submit */}
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
    </div>
  );
}
