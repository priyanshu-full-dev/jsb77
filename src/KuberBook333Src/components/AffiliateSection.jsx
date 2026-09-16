import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Share2, Plus, Download, Gift, UserPlus, HelpCircle, DollarSign, X, Check, Search, TrendingUp, Users, FileText, PieChart } from 'lucide-react';

export default function AffiliateSection({ user, onToast }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (pathname) => {
    const path = pathname.toLowerCase();
    if (path.includes('user-list') || path.includes('user_list') || path.includes('userlist')) return 'user_list';
    if (path.includes('profit-loss') || path.includes('profit_loss') || path.includes('profitloss')) return 'profit_loss';
    if (path.includes('report') || path.includes('statement')) return 'report';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') navigate('/affiliate');
    else if (tab === 'user_list') navigate('/affiliate/user-list');
    else if (tab === 'profit_loss') navigate('/affiliate/profit-loss');
    else if (tab === 'report') navigate('/affiliate/report');
  };

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Referral code & link
  const referralCode = user?.referralCode || 'KB333_98742';
  const referralLink = `https://kuberbook333.online/register?ref=${referralCode}`;

  // Form state for Add New User
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // User list state (empty by default showing 'No Records Found' matching design)
  const [referredUsers, setReferredUsers] = useState([]);
  // Profit / Loss records state
  const [profitLossData, setProfitLossData] = useState([]);
  // Report tab states
  const [reportType, setReportType] = useState('commission'); // 'commission' | 'user'
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [commissionReports, setCommissionReports] = useState([]);
  const [userReports, setUserReports] = useState([]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    if (onToast) {
      onToast({
        id: Date.now(),
        type: 'add',
        message: 'Referral link copied to clipboard!',
      });
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('affiliate-qr-code');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `kuberbook333_qr_${referralCode}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    if (onToast) {
      onToast({
        id: Date.now(),
        type: 'add',
        message: 'QR Code downloaded successfully!',
      });
    }
  };

  const handleDownloadChartSVG = () => {
    const svgElement = document.getElementById('affiliate-performance-chart');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'affiliate_performance_chart.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    if (onToast) {
      onToast({ id: Date.now(), type: 'add', message: 'Chart SVG downloaded successfully!' });
    }
  };

  const handleDownloadChartPNG = () => {
    const svgElement = document.getElementById('affiliate-performance-chart');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'affiliate_performance_chart.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      if (onToast) {
        onToast({ id: Date.now(), type: 'add', message: 'Chart PNG downloaded successfully!' });
      }
    };
    img.src = url;
  };

  const handleDownloadChartCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Day,Performance\n0,0\n1,0\n2,0\n3,0\n4,0\n5,0\n6,0\n7,0\n8,0\n9,0\n10,0';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'affiliate_performance_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) {
      onToast({ id: Date.now(), type: 'add', message: 'Chart CSV exported successfully!' });
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserForm.username || !newUserForm.password) {
      alert('Please enter username and password');
      return;
    }
    if (newUserForm.password !== newUserForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const newUser = {
      id: newUserForm.username,
      name: newUserForm.fullName || newUserForm.username,
      date: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      deposit: '0',
      commission: '0',
      status: 'Active',
    };

    setReferredUsers([newUser, ...referredUsers]);
    setShowAddUserModal(false);
    setNewUserForm({ username: '', fullName: '', phone: '', password: '', confirmPassword: '' });

    if (onToast) {
      onToast({
        id: Date.now(),
        type: 'add',
        message: `User ${newUser.name} created successfully!`,
      });
    }
  };

  return (
    <div className="w-full bg-[#f2f4f7] min-h-screen flex flex-col pb-24 text-neutral-900 select-none">
      {/* ========================================================= */}
      {/* 1. TOP AFFILIATE CONTENT (ACCORDING TO ACTIVE SUB-TAB)   */}
      {/* ========================================================= */}
      <div className="p-2 pt-5 flex flex-col gap-3.5">
        {activeTab === 'dashboard' ? (
          <>
            {/* ----------------------------------------------------- */}
            {/* CARD 1: TODAY STATUS                                  */}
            {/* ----------------------------------------------------- */}
            <div
              style={{
                background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
                border: '1px solid #ffffff29',
              }}
              className="w-full rounded-md p-[15px] text-black shadow-md relative overflow-hidden"
            >
              {/* Ellipse background graphic */}
              <img
                src="/games/ellip.svg"
                alt=""
                className="absolute top-0 right-0 pointer-events-none select-none"
              />

              <h2 className="text-white font-extrabold text-[17px] tracking-wide mb-3 relative z-10">
                Today Status
              </h2>

              <div className="grid grid-cols-2 mt-[15px] relative z-10">
                {/* Left Column */}
                <div className="flex flex-col items-center justify-center gap-5 pr-2">
                  <div className="flex flex-col items-center py-[5px]">
                    <span className="font-extrabold text-[22px] text-neutral-900 leading-none">
                      0
                    </span>
                    <span className="text-[12px] font-medium text-neutral-900 mt-1">
                      Total Deposit
                    </span>
                  </div>
                  <div className="flex flex-col items-center py-[5px]">
                    <span className="font-extrabold text-[22px] text-neutral-900 leading-none">
                      0
                    </span>
                    <span className="text-[12px] font-medium text-neutral-900 mt-1">
                      Total User
                    </span>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="absolute left-1/2 top-1 bottom-1 w-[1px] bg-[#3a5833]/40 transform -translate-x-1/2" />

                {/* Right Column */}
                <div className="flex flex-col items-center justify-center gap-5 pl-2">
                  <div className="flex flex-col items-center py-[5px]">
                    <span className="font-extrabold text-[22px] text-neutral-900 leading-none">
                      0
                    </span>
                    <span className="text-[12px] font-medium text-neutral-900 mt-1">
                      Total Deposit Count
                    </span>
                  </div>
                  <div className="flex flex-col items-center py-[5px]">
                    <span className="font-extrabold text-[22px] text-neutral-900 leading-none">
                      0
                    </span>
                    <span className="text-[12px] font-medium text-neutral-900 mt-1">
                      Total Commision
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* CARD 2: INVITE YOUR FRIENDS & INVITATION CODE         */}
            {/* ----------------------------------------------------- */}
            <div
              style={{
                background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
                border: '1px solid #ffffff29',
              }}
              className="w-full rounded-md p-3.5 shadow-md flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Top Row: Title + Girl Avatar */}
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <h3 className="text-white font-extrabold text-[18px] leading-tight tracking-wide">
                    Invite Your Friends
                  </h3>
                  <p className="text-black font-semibold text-[13px] mt-1 leading-snug">
                    To Join And You Can Receive Huge Bonuses
                  </p>
                </div>
                <div className="shrink-0">
                  <img
                    src="/games/affi-invite-img.svg"
                    alt="Invite Friends"
                    className="w-[56px] h-auto object-contain"
                  />
                </div>
              </div>

              {/* Middle: "+ ADD NEW USER" Button */}
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                style={{
                  background: '#a2782a',
                }}
                className="w-full py-2.5 rounded-full flex items-center justify-center gap-2 text-white font-black text-[14px] tracking-wider shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white font-black text-[13px] leading-none">
                  +
                </span>
                <span>ADD NEW USER</span>
              </button>

              {/* Bottom: INVITATION CODE SUB-BOX */}
              <div
                style={{
                  background: '#a2782a',
                }}
                className="w-full rounded-[12px] p-3 flex flex-col gap-2.5 shadow-sm"
              >
                {/* Header: Gift Icon + Title */}
                <div className="flex items-center gap-2 text-white">
                  <img
                    src="/games/invite-gift.svg"
                    alt="Gift"
                    className="w-[22px] h-[22px] object-contain"
                  />
                  <span className="font-bold text-[14.5px] tracking-wide">
                    Invitation Code
                  </span>
                </div>

                {/* Link Box */}
                <div className="w-full bg-[#dfca83] border border-[#f0df9c] rounded-[4px] px-2.5 py-1.5 flex items-center justify-between text-neutral-900 shadow-xs">
                  <span className="font-semibold text-[12px] truncate tracking-tight text-neutral-900">
                    {referralLink}
                  </span>
                </div>

                {/* QR Code & Action Buttons Row */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  {/* Left: QR Code Box */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-1.5 rounded-[6px] shadow-sm border border-gray-300">
                      <svg
                        id="affiliate-qr-code"
                        viewBox="0 0 100 100"
                        className="w-[84px] h-[84px]"
                      >
                        {/* Realistic Clean Vector QR Code Representation */}
                        <rect width="100" height="100" fill="white" />
                        {/* Top-Left Corner Box */}
                        <rect x="5" y="5" width="28" height="28" fill="black" />
                        <rect x="9" y="9" width="20" height="20" fill="white" />
                        <rect x="13" y="13" width="12" height="12" fill="black" />

                        {/* Top-Right Corner Box */}
                        <rect x="67" y="5" width="28" height="28" fill="black" />
                        <rect x="71" y="9" width="20" height="20" fill="white" />
                        <rect x="75" y="13" width="12" height="12" fill="black" />

                        {/* Bottom-Left Corner Box */}
                        <rect x="5" y="67" width="28" height="28" fill="black" />
                        <rect x="9" y="71" width="20" height="20" fill="white" />
                        <rect x="13" y="75" width="12" height="12" fill="black" />

                        {/* QR Data Pattern Dots */}
                        <rect x="38" y="8" width="8" height="8" fill="black" />
                        <rect x="50" y="8" width="10" height="6" fill="black" />
                        <rect x="38" y="20" width="12" height="6" fill="black" />
                        <rect x="54" y="20" width="8" height="12" fill="black" />
                        <rect x="8" y="38" width="6" height="12" fill="black" />
                        <rect x="20" y="38" width="10" height="8" fill="black" />
                        <rect x="36" y="36" width="12" height="12" fill="black" />
                        <rect x="52" y="38" width="16" height="8" fill="black" />
                        <rect x="74" y="38" width="18" height="8" fill="black" />
                        <rect x="38" y="52" width="8" height="14" fill="black" />
                        <rect x="50" y="52" width="12" height="6" fill="black" />
                        <rect x="68" y="52" width="10" height="10" fill="black" />
                        <rect x="82" y="52" width="10" height="8" fill="black" />
                        <rect x="38" y="72" width="10" height="10" fill="black" />
                        <rect x="52" y="72" width="14" height="6" fill="black" />
                        <rect x="70" y="70" width="8" height="16" fill="black" />
                        <rect x="82" y="74" width="12" height="10" fill="black" />
                        <rect x="38" y="86" width="24" height="6" fill="black" />
                        <rect x="68" y="88" width="14" height="6" fill="black" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadQR}
                      className="text-white font-bold text-[12.5px] mt-1.5 hover:underline cursor-pointer tracking-tight"
                    >
                      Download
                    </button>
                  </div>

                  {/* Right: Copy Link & Share Buttons */}
                  <div className="flex-1 flex flex-col gap-2.5 pl-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      style={{
                        background: 'linear-gradient(to bottom, #cca24b 0%, #b28328 100%)',
                        border: '1.5px solid #ebda8d',
                      }}
                      className="w-full py-2.5 rounded-full flex items-center justify-center gap-2 text-white font-bold text-[13.5px] shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Copy size={16} />
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      style={{
                        background: 'linear-gradient(to bottom, #936829 0%, #76501a 100%)',
                        border: '1.5px solid #ebda8d',
                      }}
                      className="w-full py-2.5 rounded-full flex items-center justify-center gap-2 text-white font-bold text-[13.5px] shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* CARD 3: PERFORMANCE LINE CHART                        */}
            {/* ----------------------------------------------------- */}
            <div className="w-full bg-white rounded-md p-3.5 pt-4 shadow-sm border border-gray-100 relative">
              {/* Top Right: Hamburger Menu Icon & Dropdown */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setShowChartMenu(!showChartMenu)}
                  className="text-[#5a6b82] hover:text-[#1e293b] p-1 cursor-pointer"
                  title="Chart Options"
                >
                  <div className="flex flex-col gap-[3px] items-end">
                    <span className="w-[18px] h-[2.5px] bg-[#5a6b82] rounded-xs" />
                    <span className="w-[18px] h-[2.5px] bg-[#5a6b82] rounded-xs" />
                    <span className="w-[18px] h-[2.5px] bg-[#5a6b82] rounded-xs" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showChartMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowChartMenu(false)}
                    />
                    <div className="absolute right-0 top-7 w-[145px] bg-white rounded-[4px] shadow-lg border border-gray-300 py-1.5 z-30 animate-in fade-in zoom-in-95">
                      <button
                        type="button"
                        onClick={() => {
                          setShowChartMenu(false);
                          handleDownloadChartSVG();
                        }}
                        className="w-full text-left px-3 py-1.5 text-[13px] font-medium text-black hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Download SVG
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowChartMenu(false);
                          handleDownloadChartPNG();
                        }}
                        className="w-full text-left px-3 py-1.5 text-[13px] font-medium text-black hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Download PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowChartMenu(false);
                          handleDownloadChartCSV();
                        }}
                        className="w-full text-left px-3 py-1.5 text-[13px] font-medium text-black hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Download CSV
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Chart SVG Canvas */}
              <div className="w-full pt-2">
                <svg
                  id="affiliate-performance-chart"
                  viewBox="0 0 350 240"
                  className="w-full h-auto overflow-visible select-none"
                >
                  {/* Horizontal Grid lines & Y-axis labels */}
                  {[
                    { label: '2', y: 50 },
                    { label: '1.5', y: 85 },
                    { label: '1', y: 120 },
                    { label: '0.5', y: 155 },
                    { label: '0', y: 190 },
                  ].map((grid, idx) => (
                    <g key={idx}>
                      <text
                        x="27"
                        y={grid.y + 4}
                        fontSize="12.5"
                        fill="#1e293b"
                        textAnchor="end"
                        fontWeight="400"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {grid.label}
                      </text>
                      <line
                        x1="38"
                        y1={grid.y}
                        x2="335"
                        y2={grid.y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* X-axis labels: 0 through 10 */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val, idx) => {
                    const x = 38 + idx * 29.7;
                    return (
                      <g key={idx}>
                        <text
                          x={x}
                          y="214"
                          fontSize="12.5"
                          fill="#1e293b"
                          textAnchor="middle"
                          fontWeight="400"
                          fontFamily="system-ui, -apple-system, sans-serif"
                        >
                          {val}
                        </text>
                        <line
                          x1={x}
                          y1="190"
                          x2={x}
                          y2="196"
                          stroke="#cbd5e1"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}

                  {/* Bottom X-axis baseline */}
                  <line x1="38" y1="190" x2="335" y2="190" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* CARD 4: BONUS INFORMATION                             */}
            {/* ----------------------------------------------------- */}
            <div
              style={{
                background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
                border: '1px solid #ffffff29',
              }}
              className="w-full rounded-md p-3.5 shadow-md relative overflow-hidden"
            >
              {/* Ellipse background graphic */}
              <img
                src="/games/ellip.svg"
                alt=""
                className="absolute top-0 right-0 pointer-events-none select-none"
              />

              <h3 className="text-white font-extrabold text-[16.5px] tracking-wide mb-3 relative z-10">
                Bonus Information
              </h3>

              <div className="grid grid-cols-2 mt-[15px] relative z-10">
                {/* Left: How to Get Bonus */}
                <button
                  type="button"
                  onClick={() => setShowBonusModal(true)}
                  className="flex flex-col items-center justify-center pr-2 group cursor-pointer"
                >
                  <img
                    src="/games/affi-bonus.svg"
                    alt="How To Get Bonus"
                    className="w-[54px] h-[64px] object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <span className="font-bold text-[13px] text-neutral-900 mt-2 text-center group-hover:underline">
                    How To Get Bonus?
                  </span>
                </button>

                {/* Vertical Divider */}
                <div className="absolute left-1/2 top-1 bottom-1 w-[1px] bg-[#3a5833]/40 transform -translate-x-1/2" />

                {/* Right: Commission Info */}
                <button
                  type="button"
                  onClick={() => setShowCommissionModal(true)}
                  className="flex flex-col items-center justify-center pl-2 group cursor-pointer"
                >
                  <img
                    src="/games/affi-bonus-2.svg"
                    alt="Commission Info"
                    className="w-[54px] h-[64px] object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <span className="font-bold text-[13px] text-neutral-900 mt-2 text-center group-hover:underline">
                    Commission Info
                  </span>
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* CARD 5: TODAY PROFIT AND LOSS TABLE                   */}
            {/* ----------------------------------------------------- */}
            <div className="w-full flex flex-col gap-1 mt-1">
              <h4 className="text-[14.5px] font-bold text-gray-300 ml-0.5">
                Today Profit And Loss
              </h4>

              <div className="w-full bg-white rounded-[6px] shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
                  <span className="font-bold text-[13px] text-black">Type</span>
                  <span className="font-bold text-[13px] text-black">PL</span>
                </div>

                {/* Row 1: Sports */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 hover:bg-gray-50/50">
                  <span className="font-semibold text-[13px] text-neutral-800">Sports</span>
                  <span className="font-bold text-[13px] text-[#16a34a]">0</span>
                </div>

                {/* Row 2: Casino */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 hover:bg-gray-50/50">
                  <span className="font-semibold text-[13px] text-neutral-800">Casino</span>
                  <span className="font-bold text-[13px] text-[#16a34a]">0</span>
                </div>

                {/* Row 3: International Casino (QT) */}
                <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50/50">
                  <span className="font-semibold text-[13px] text-neutral-800">
                    International Casino (QT)
                  </span>
                  <span className="font-bold text-[13px] text-[#16a34a]">0</span>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'user_list' ? (
          /* ========================================================= */
          /* SUB-VIEW 2: USER LIST                                     */
          /* ========================================================= */
          <div className="w-full flex flex-col gap-3.5">
            {/* User List Table Card matching design */}
            <div className="w-full bg-white rounded-[10px] shadow-sm border border-gray-200 overflow-hidden">
              {/* Dark Table Header matching design */}
              <div className="grid grid-cols-4 px-3.5 py-3 bg-[#2d3238] text-white font-bold text-[14px] tracking-tight items-center">
                <span className="text-left">User Name</span>
                <span className="text-center">Balance</span>
                <span className="text-center leading-tight">Created Date Time</span>
                <span className="text-right">Statement</span>
              </div>

              {/* Table Body */}
              {referredUsers.length === 0 ? (
                <div className="py-5 px-3 text-center text-black font-medium text-[15px] bg-white">
                  No Records Found
                </div>
              ) : (
                <div className="divide-y divide-gray-100 bg-white">
                  {referredUsers.map((u, idx) => (
                    <div key={idx} className="grid grid-cols-4 px-3.5 py-3 text-[12.5px] items-center">
                      <span className="font-bold text-gray-900 truncate text-left">{u.name || u.id}</span>
                      <span className="text-center font-semibold text-gray-800">{u.deposit || u.balance || '0'}</span>
                      <span className="text-center text-gray-600 text-[11.5px]">{u.date || u.createdAt || 'N/A'}</span>
                      <span className="text-right font-medium text-amber-600 hover:underline cursor-pointer">View</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* "+ ADD NEW USER" Button */}
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              style={{
                background: '#a2782a',
              }}
              className="w-full h-[46px] rounded-full flex items-center justify-center gap-2.5 text-white shadow-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="w-[22px] h-[22px] rounded-full border-[2px] border-white flex items-center justify-center text-white font-bold text-[15px] leading-none shrink-0">
                +
              </div>
              <span className="font-bold text-[15px] tracking-wide uppercase">ADD NEW USER</span>
            </button>
          </div>
        ) : activeTab === 'profit_loss' ? (
          /* ========================================================= */
          /* SUB-VIEW 3: PROFIT / LOSS TABLE                           */
          /* ========================================================= */
          <div className="w-full flex flex-col gap-3.5">
            {/* Profit Loss Table Card matching design */}
            <div className="w-full bg-white rounded-[10px] shadow-sm border border-gray-200 overflow-hidden">
              {/* Dark Table Header */}
              <div className="grid grid-cols-3 px-4 py-3 bg-[#2d3238] text-white font-bold text-[15px] tracking-tight items-center">
                <span className="text-left pl-1">Date</span>
                <span className="text-center">Event</span>
                <span className="text-right pr-1">Profit / Loss</span>
              </div>

              {/* Table Body */}
              {profitLossData.length === 0 ? (
                <div className="py-5 px-3 text-center text-black font-medium text-[15px] bg-white">
                  No Data Found
                </div>
              ) : (
                <div className="divide-y divide-gray-100 bg-white">
                  {profitLossData.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 px-4 py-3 text-[13px] items-center">
                      <span className="text-left pl-1 font-medium text-gray-700">{item.date}</span>
                      <span className="text-center font-bold text-gray-900">{item.event}</span>
                      <span
                        className={`text-right pr-1 font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                      >
                        {item.amount >= 0 ? `+${item.amount}` : item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* SUB-VIEW 4: COMMISSION & USER REPORT                      */
          /* ========================================================= */
          <div className="w-full flex flex-col gap-3.5">
            {/* Top Report Type Toggle Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => setReportType('commission')}
                style={
                  reportType === 'commission'
                    ? {
                        background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
                        borderColor: '#b6842d',
                      }
                    : {
                        background: '#ffffff',
                        borderColor: '#b6842d',
                      }
                }
                className="w-full py-2.5 rounded-[8px] border text-black font-extrabold text-[13.5px] tracking-wide uppercase transition-all shadow-xs cursor-pointer text-center"
              >
                COMMISSION REPORT
              </button>
              <button
                type="button"
                onClick={() => setReportType('user')}
                style={
                  reportType === 'user'
                    ? {
                        background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
                        borderColor: '#b6842d',
                      }
                    : {
                        background: '#ffffff',
                        borderColor: '#b6842d',
                      }
                }
                className="w-full py-2.5 rounded-[8px] border text-black font-extrabold text-[13.5px] tracking-wide uppercase transition-all shadow-xs cursor-pointer text-center"
              >
                USER REPORT
              </button>
            </div>

            {/* Date Filter Card */}
            <div className="w-full bg-white rounded-[10px] p-3 shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                {/* From Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-gray-700">From</label>
                  <div className="border border-gray-300 rounded-[6px] px-2.5 py-1.5 flex items-center justify-between bg-white">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full bg-transparent text-[13.5px] text-gray-800 font-medium outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* To Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-gray-700">To Date</label>
                  <div className="border border-gray-300 rounded-[6px] px-2.5 py-1.5 flex items-center justify-between bg-white">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full bg-transparent text-[13.5px] text-gray-800 font-medium outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Report Table Card */}
            <div className="w-full bg-white rounded-[10px] shadow-sm border border-gray-200 overflow-hidden">
              {/* Dark Table Header */}
              {reportType === 'commission' ? (
                <div className="flex items-center justify-between px-4 py-3 bg-[#2d3238] text-white font-bold text-[15px] tracking-tight">
                  <span className="text-left pl-1">Date</span>
                  <span className="text-right pr-1">Commision</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 px-4 py-3 bg-[#2d3238] text-white font-bold text-[15px] tracking-tight items-center">
                  <span className="text-left pl-1">User Name</span>
                  <span className="text-center">Date</span>
                  <span className="text-right pr-1">Commision</span>
                </div>
              )}

              {/* Table Body */}
              {((reportType === 'commission' ? commissionReports : userReports).length === 0) ? (
                <div className="py-5 px-3 text-center text-black font-medium text-[15px] bg-white">
                  No Records Found
                </div>
              ) : (
                <div className="divide-y divide-gray-100 bg-white">
                  {(reportType === 'commission' ? commissionReports : userReports).map((item, idx) => (
                    <div
                      key={idx}
                      className={
                        reportType === 'commission'
                          ? 'flex items-center justify-between px-4 py-3 text-[13px]'
                          : 'grid grid-cols-3 px-4 py-3 text-[13px] items-center'
                      }
                    >
                      {reportType === 'user' && (
                        <span className="text-left pl-1 font-bold text-gray-900">{item.userName}</span>
                      )}
                      <span className="text-left pl-1 font-medium text-gray-700">{item.date}</span>
                      <span className="text-right pr-1 font-bold text-emerald-600">₹{item.amount || '0'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. DEDICATED AFFILIATE BOTTOM NAVIGATION BAR              */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full max-w-[480px] bg-black border-t border-neutral-900 flex items-stretch justify-between h-[56px] relative pointer-events-auto shadow-2xl">
          {/* Tab 1: Dashboard */}
          <button
            type="button"
            onClick={() => handleTabChange('dashboard')}
            style={
              activeTab === 'dashboard'
                ? { background: 'transparent  linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)' }
                : { background: 'transparent' }
            }
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${activeTab === 'dashboard' ? 'text-black font-bold' : 'text-white font-medium hover:text-amber-200'
              }`}
          >
            <img
              src="/games/dashboard/dashboard.svg"
              alt="Dashboard"
              className={`w-[21px] h-[21px] object-contain ${activeTab === 'dashboard' ? 'brightness-0' : ''}`}
            />
            <span className="text-[11px] mt-0.5 tracking-tight">Dashboard</span>
          </button>

          {/* Tab 2: User List */}
          <button
            type="button"
            onClick={() => handleTabChange('user_list')}
            style={
              activeTab === 'user_list'
                ? { background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)' }
                : { background: 'transparent' }
            }
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${activeTab === 'user_list' ? 'text-black font-bold' : 'text-white font-medium hover:text-amber-200'
              }`}
          >
            <img
              src="/games/dashboard/user-list.svg"
              alt="User List"
              className={`w-[20px] h-[20px] object-contain ${activeTab === 'user_list' ? 'brightness-0' : ''}`}
            />
            <span className="text-[11px] mt-0.5 tracking-tight">User List</span>
          </button>

          {/* Tab 3 (Center): Elevated Black Circle Share Button */}
          <div className="relative -top-4 flex items-center justify-center px-1">
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="w-[62px] h-[62px] rounded-full bg-black border-[3px] border-white shadow-2xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="Share Referral Code"
            >
              <svg viewBox="0 0 512 512" className="w-[23px] h-[23px] fill-white group-hover:scale-110 transition-transform">
                <path d="M352 320c-22.608 0-43.387 7.819-59.79 20.895l-102.486-64.054a96.551 96.551 0 0 0 0-41.683l102.486-64.054C308.613 184.181 329.392 192 352 192c53.019 0 96-42.981 96-96S405.019 0 352 0s-96 42.981-96 96c0 7.158.79 14.13 2.276 20.841L155.79 180.895C139.387 167.819 118.608 160 96 160c-53.019 0-96 42.981-96 96s42.981 96 96 96c22.608 0 43.387-7.819 59.79-20.895l102.486 64.054A96.301 96.301 0 0 0 256 416c0 53.019 42.981 96 96 96s96-42.981 96-96-42.981-96-96-96z" />
              </svg>
            </button>
          </div>

          {/* Tab 4: Profit/Loss */}
          <button
            type="button"
            onClick={() => handleTabChange('profit_loss')}
            style={
              activeTab === 'profit_loss'
                ? { background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)' }
                : { background: 'transparent' }
            }
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${activeTab === 'profit_loss' ? 'text-black font-bold' : 'text-white font-medium hover:text-amber-200'
              }`}
          >
            <img
              src="/games/dashboard/graph.svg"
              alt="Profit/Loss"
              className={`w-[21px] h-[21px] object-contain ${activeTab === 'profit_loss' ? 'brightness-0' : ''}`}
            />
            <span className="text-[11px] mt-0.5 tracking-tight">Profit/Loss</span>
          </button>

          {/* Tab 5: Report */}
          <button
            type="button"
            onClick={() => handleTabChange('report')}
            style={
              activeTab === 'report'
                ? { background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)' }
                : { background: 'transparent' }
            }
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${activeTab === 'report' ? 'text-black font-bold' : 'text-white font-medium hover:text-amber-200'
              }`}
          >
            <img
              src="/games/dashboard/report.png"
              alt="Report"
              className={`w-[20px] h-[20px] object-contain ${activeTab === 'report' ? 'brightness-0' : ''}`}
            />
            <span className="text-[11px] mt-0.5 tracking-tight">Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD NEW USER POPUP                               */}
      {/* ========================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-[360px] bg-white rounded-[16px] shadow-2xl overflow-hidden border border-amber-300 animate-in zoom-in-95">
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #c79f48 0%, #ebda8d 50%, #b5832a 100%)',
              }}
              className="p-3.5 flex items-center justify-between text-black"
            >
              <div className="flex items-center gap-2">
                <UserPlus size={20} className="text-black" />
                <h3 className="font-extrabold text-[16px] tracking-wide">Add New Referral User</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="p-4 flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user1234"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter secure password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={newUserForm.confirmPassword}
                  onChange={(e) => setNewUserForm({ ...newUserForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[13px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(to bottom, #caa049 0%, #b5832a 100%)',
                  }}
                  className="flex-1 py-2.5 rounded-[8px] text-black font-extrabold text-[13px] shadow-sm hover:brightness-110 cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: HOW TO GET BONUS POPUP                           */}
      {/* ========================================================= */}
      {showBonusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-[360px] bg-white rounded-[16px] shadow-2xl overflow-hidden border border-amber-300 animate-in zoom-in-95">
            <div
              style={{
                background: 'linear-gradient(135deg, #c79f48 0%, #ebda8d 50%, #b5832a 100%)',
              }}
              className="p-3.5 flex items-center justify-between text-black"
            >
              <div className="flex items-center gap-2">
                <img src="/games/affi-bonus.svg" alt="" className="w-5 h-5 object-contain" />
                <h3 className="font-extrabold text-[16px] tracking-wide">How To Get Bonus?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBonusModal(false)}
                className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3 text-[13px] text-gray-800">
              <div className="flex items-start gap-2.5 bg-amber-50 p-2.5 rounded-[8px] border border-amber-200">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-[12px]">1</span>
                <div>
                  <h4 className="font-bold text-gray-900">Share Your Referral Link</h4>
                  <p className="text-[12px] text-gray-600 mt-0.5">Invite your friends using your unique invitation code or QR code.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-amber-50 p-2.5 rounded-[8px] border border-amber-200">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-[12px]">2</span>
                <div>
                  <h4 className="font-bold text-gray-900">Friend Registers & Deposits</h4>
                  <p className="text-[12px] text-gray-600 mt-0.5">When your friend completes their first deposit, your bonus activates instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-amber-50 p-2.5 rounded-[8px] border border-amber-200">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-[12px]">3</span>
                <div>
                  <h4 className="font-bold text-gray-900">Get Instant Commission</h4>
                  <p className="text-[12px] text-gray-600 mt-0.5">Receive unlimited real-time turnover bonuses directly into your wallet.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowBonusModal(false);
                  handleCopyLink();
                }}
                style={{
                  background: 'linear-gradient(to bottom, #caa049 0%, #b5832a 100%)',
                }}
                className="w-full py-2.5 rounded-full text-black font-extrabold text-[13px] mt-1 shadow-sm hover:brightness-110 cursor-pointer"
              >
                Copy Link & Start Earning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: COMMISSION INFO POPUP                            */}
      {/* ========================================================= */}
      {showCommissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-[360px] bg-white rounded-[16px] shadow-2xl overflow-hidden border border-amber-300 animate-in zoom-in-95">
            <div
              style={{
                background: 'linear-gradient(135deg, #c79f48 0%, #ebda8d 50%, #b5832a 100%)',
              }}
              className="p-3.5 flex items-center justify-between text-black"
            >
              <div className="flex items-center gap-2">
                <img src="/games/affi-bonus-2.svg" alt="" className="w-5 h-5 object-contain" />
                <h3 className="font-extrabold text-[16px] tracking-wide">Commission Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCommissionModal(false)}
                className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3 text-[13px] text-gray-800">
              <p className="text-[12px] text-gray-600">
                Earn transparent lifetime revenue share commissions automatically calculated from your referred players' turnover:
              </p>

              <div className="border border-gray-200 rounded-[8px] overflow-hidden">
                <div className="flex items-center justify-between bg-gray-100 px-3 py-2 font-bold text-[12px] text-gray-700">
                  <span>Game Category</span>
                  <span>Commission Rate</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
                  <span className="font-medium text-gray-800">Cricket & Sportsbook</span>
                  <span className="font-bold text-emerald-600">1.50%</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
                  <span className="font-medium text-gray-800">Live Casino & Table</span>
                  <span className="font-bold text-emerald-600">1.00%</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
                  <span className="font-medium text-gray-800">Slot Games & Aviator</span>
                  <span className="font-bold text-emerald-600">0.75%</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-[8px] border border-emerald-200 text-[12px] text-emerald-800">
                ✓ Commissions are settled automatically and directly credited into your main wallet.
              </div>

              <button
                type="button"
                onClick={() => setShowCommissionModal(false)}
                style={{
                  background: 'linear-gradient(to bottom, #caa049 0%, #b5832a 100%)',
                }}
                className="w-full py-2.5 rounded-full text-black font-extrabold text-[13px] shadow-sm hover:brightness-110 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: SHARE AFFILIATE LINK OR CODE                     */}
      {/* ========================================================= */}
      {showShareModal && (
        <div
          className="fixed inset-0  z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-[440px] bg-white rounded-t-[20px] sm:rounded-[16px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className=" p-[10px] flex items-center justify-between bg-white">
              <h3 className="font-extrabold text-[18.5px] text-black tracking-tight">
                Share Affiliate Link Or Code
              </h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-[26px] h-[26px] rounded-full border border-black flex items-center justify-center hover:bg-gray-100 text-black cursor-pointer transition-colors"
                title="Close"
              >
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>

            {/* Modal Content */}
            <div className=" p-[10px] flex flex-col gap-3.5 bg-white">
              {/* Promotional Banner Illustration SVG */}
              <div className="w-full rounded-[12px] overflow-hidden shadow-xs border border-gray-100 bg-[#0d0906]">
                <img
                  src="/games/dashboard/af-share-img.svg"
                  alt="Affiliate and Rewards - Invite Friends Earn Money"
                  className="w-full h-auto object-contain block"
                />
              </div>

              {/* Share Link Section */}
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="font-bold text-[15px] text-neutral-900 tracking-tight">
                  Share Link
                </span>

                {/* Referral Link Box with Copy Button */}
                <div
                  style={{
                    background: '#a2782a',
                  }}
                  className="w-full rounded-[10px] p-2 pl-3.5 flex items-center justify-between gap-2 shadow-xs"
                >
                  <span className="text-[13px] font-medium text-white truncate flex-1 underline decoration-white/60 tracking-tight">
                    {referralLink}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      background: 'linear-gradient(180deg, #d3aa4e 0%, #b88a32 100%)',
                    }}
                    className="px-5  py-2.5 rounded-[8px] text-white font-bold text-[13.5px] shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
