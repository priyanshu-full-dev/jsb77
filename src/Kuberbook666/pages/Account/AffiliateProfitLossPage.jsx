import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAccountStatements, getProfitLossReport } from "../../../api";
import { selectSite } from "../../../utils/helper/commonSelectors";
import ShareAffiliateDrawer from "../../components/ShareAffiliateDrawer";
import "../../styles/affiliate.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AffiliateProfitLossPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.userData);
  const siteDetails = useSelector(selectSite());

  // Date range state
  const [selectedRangeType, setSelectedRangeType] = useState(7); // 7, 14, 28, or "custom"
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(() => new Date());

  // Calendar popup state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calSelectingStart, setCalSelectingStart] = useState(true);
  const calendarRef = useRef(null);

  // Data & loading states
  const [loading, setLoading] = useState(false);
  const [reportList, setReportList] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);

  // Referral code for share drawer
  const referralCode =
    user?.userName ||
    user?.username ||
    user?.referralCode ||
    user?.userId ||
    "wasimkhan";

  const referralUrl = `https://kuberbook666.online?af_code=${referralCode}`;

  // Helper to format date in "September 12, 2026"
  const formatDisplayDate = (d) => {
    if (!d) return "";
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper to format YYYY-MM-DD for APIs
  const toApiDate = (d) => {
    if (!d) return "";
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString("en-CA");
  };

  // Quick range selector
  const handleSelectDays = (days) => {
    setSelectedRangeType(days);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start);
    setEndDate(end);
    fetchReport(start, end);
  };

  // Fetch report data
  const fetchReport = async (sDate = startDate, eDate = endDate) => {
    setLoading(true);
    try {
      const s = toApiDate(sDate);
      const e = toApiDate(eDate);

      let res = null;
      try {
        res = await getAccountStatements({
          filterby: "settlement",
          page: 1,
          limit: 50,
          startDate: s,
          endDate: e,
        });
      } catch {
        res = null;
      }

      if (!res?.data?.transactions?.length) {
        try {
          res = await getProfitLossReport({
            startDate: s,
            endDate: e,
            page: 1,
            limit: 50,
          });
        } catch {
          // silent fallback
        }
      }

      const items =
        res?.data?.transactions ||
        res?.data?.data ||
        res?.data?.report ||
        res?.data ||
        [];

      if (Array.isArray(items)) {
        setReportList(items);
      } else {
        setReportList([]);
      }
    } catch (err) {
      console.error("Failed to fetch profit loss report:", err);
      setReportList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [user]);

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral Link Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Calendar logic
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => {
    // 0 = Sunday, 1 = Monday... we want Mon = 0, Sun = 6
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handleDateClick = (day) => {
    const clicked = new Date(calYear, calMonth, day);
    if (calSelectingStart) {
      setStartDate(clicked);
      setEndDate(clicked);
      setCalSelectingStart(false);
    } else {
      if (clicked < startDate) {
        setStartDate(clicked);
        setEndDate(startDate);
      } else {
        setEndDate(clicked);
      }
      setSelectedRangeType("custom");
      setCalSelectingStart(true);
      setIsCalendarOpen(false);
      fetchReport(startDate < clicked ? startDate : clicked, clicked);
    }
  };

  const isDateSelected = (day) => {
    const current = new Date(calYear, calMonth, day);
    current.setHours(0, 0, 0, 0);

    const s = new Date(startDate);
    s.setHours(0, 0, 0, 0);

    const e = new Date(endDate);
    e.setHours(0, 0, 0, 0);

    return current >= s && current <= e;
  };

  const isDateEdge = (day) => {
    const current = new Date(calYear, calMonth, day);
    current.setHours(0, 0, 0, 0);

    const s = new Date(startDate);
    s.setHours(0, 0, 0, 0);

    const e = new Date(endDate);
    e.setHours(0, 0, 0, 0);

    return current.getTime() === s.getTime() || current.getTime() === e.getTime();
  };

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
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
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out bg-white hover:bg-gray-100 px-4 py-2 flex items-center justify-center border border-gray-300 rounded-full text-gray-700 whitespace-nowrap uppercase font-bold text-xs cursor-pointer shadow-sm"
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
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out text-white px-4 py-2 flex items-center justify-center border border-[#c10931] rounded-full whitespace-nowrap uppercase font-bold text-xs cursor-pointer shadow"
              style={{ backgroundColor: "#c10931" }}
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

        {/* Date Filter Bar Card */}
        <div className="flex shadow-sm flex-col mb-3 rounded-lg w-full bg-white m-2 lg:m-0 lg:mt-3 border border-gray-200">
          <div className="relative w-full p-2.5">
            <div className="w-full flex flex-col gap-2">
              {/* Date Input + Search Button */}
              <div className="flex items-center gap-2 w-full">
                {/* Date range trigger */}
                <div
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="flex flex-1 items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:border-gray-400 transition bg-white min-h-[38px] text-xs sm:text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between w-full text-gray-700 font-semibold text-xs sm:text-[13px]">
                      <span>{formatDisplayDate(startDate)}</span>
                      {/* Arrow Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C10B32"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 mx-2 shrink-0"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M7 10h14l-4 -4"></path>
                        <path d="M17 14h-14l4 4"></path>
                      </svg>
                      <span>{formatDisplayDate(endDate)}</span>
                    </div>
                  </div>

                  {/* Red Calendar SVG Icon */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 w-5 h-5"
                  >
                    <path d="M7.17236 4.79175C6.8307 4.79175 6.54736 4.50841 6.54736 4.16675V1.66675C6.54736 1.32508 6.8307 1.04175 7.17236 1.04175C7.51403 1.04175 7.79736 1.32508 7.79736 1.66675V4.16675C7.79736 4.50841 7.51403 4.79175 7.17236 4.79175Z" fill="#C10B32"></path>
                    <path d="M13.8394 4.79175C13.4977 4.79175 13.2144 4.50841 13.2144 4.16675V1.66675C13.2144 1.32508 13.4977 1.04175 13.8394 1.04175C14.181 1.04175 14.4644 1.32508 14.4644 1.66675V4.16675C14.4644 4.50841 14.181 4.79175 13.8394 4.79175Z" fill="#C10B32"></path>
                    <path d="M7.58919 12.0834C7.48086 12.0834 7.37253 12.0584 7.27253 12.0168C7.16419 11.9751 7.08086 11.9168 6.99753 11.8418C6.84753 11.6834 6.75586 11.4751 6.75586 11.2501C6.75586 11.1418 6.78086 11.0334 6.82253 10.9334C6.86419 10.8334 6.92253 10.7418 6.99753 10.6584C7.08086 10.5834 7.16419 10.5251 7.27253 10.4834C7.57253 10.3584 7.94753 10.4251 8.18086 10.6584C8.33086 10.8168 8.42253 11.0334 8.42253 11.2501C8.42253 11.3001 8.41419 11.3584 8.40586 11.4168C8.39753 11.4668 8.38086 11.5168 8.35586 11.5668C8.33919 11.6168 8.31419 11.6668 8.28086 11.7168C8.25586 11.7584 8.21419 11.8001 8.18086 11.8418C8.02253 11.9918 7.80586 12.0834 7.58919 12.0834Z" fill="#C10B32"></path>
                    <path d="M10.5057 12.0832C10.3974 12.0832 10.289 12.0582 10.189 12.0166C10.0807 11.9749 9.99736 11.9166 9.91403 11.8416C9.76403 11.6832 9.67236 11.4749 9.67236 11.2499C9.67236 11.1416 9.69736 11.0332 9.73903 10.9332C9.7807 10.8332 9.83903 10.7416 9.91403 10.6582C9.99736 10.5832 10.0807 10.5249 10.189 10.4832C10.489 10.3499 10.864 10.4249 11.0974 10.6582C11.2474 10.8166 11.339 11.0332 11.339 11.2499C11.339 11.2999 11.3307 11.3582 11.3224 11.4166C11.314 11.4666 11.2974 11.5166 11.2724 11.5666C11.2557 11.6166 11.2307 11.6666 11.1974 11.7166C11.1724 11.7582 11.1307 11.7999 11.0974 11.8416C10.939 11.9916 10.7224 12.0832 10.5057 12.0832Z" fill="#C10B32"></path>
                    <path d="M13.4227 12.0832C13.3144 12.0832 13.206 12.0582 13.106 12.0166C12.9977 11.9749 12.9144 11.9166 12.831 11.8416C12.7977 11.7999 12.7644 11.7582 12.731 11.7166C12.6977 11.6666 12.6727 11.6166 12.656 11.5666C12.631 11.5166 12.6144 11.4666 12.606 11.4166C12.5977 11.3582 12.5894 11.2999 12.5894 11.2499C12.5894 11.0332 12.681 10.8166 12.831 10.6582C12.9144 10.5832 12.9977 10.5249 13.106 10.4832C13.4144 10.3499 13.781 10.4249 14.0144 10.6582C14.1644 10.8166 14.256 11.0332 14.256 11.2499C14.256 11.2999 14.2477 11.3582 14.2394 11.4166C14.231 11.4666 14.2144 11.5166 14.1894 11.5666C14.1727 11.6166 14.1477 11.6666 14.1144 11.7166C14.0894 11.7582 14.0477 11.7999 14.0144 11.8416C13.856 11.9916 13.6394 12.0832 13.4227 12.0832Z" fill="#C10B32"></path>
                    <path d="M17.589 8.19995H3.42236C3.0807 8.19995 2.79736 7.91662 2.79736 7.57495C2.79736 7.23328 3.0807 6.94995 3.42236 6.94995H17.589C17.9307 6.94995 18.214 7.23328 18.214 7.57495C18.214 7.91662 17.9307 8.19995 17.589 8.19995Z" fill="#C10B32"></path>
                    <path d="M13.8392 18.9584H7.17253C4.13086 18.9584 2.38086 17.2084 2.38086 14.1667V7.08342C2.38086 4.04175 4.13086 2.29175 7.17253 2.29175H13.8392C16.8809 2.29175 18.6309 4.04175 18.6309 7.08342V14.1667C18.6309 17.2084 16.8809 18.9584 13.8392 18.9584ZM7.17253 3.54175C4.78919 3.54175 3.63086 4.70008 3.63086 7.08342V14.1667C3.63086 16.5501 4.78919 17.7084 7.17253 17.7084H13.8392C16.2225 17.7084 17.3809 16.5501 17.3809 14.1667V7.08342C17.3809 4.70008 16.2225 3.54175 13.8392 3.54175H7.17253Z" fill="#C10B32"></path>
                  </svg>
                </div>

                {/* Search Button */}
                <button
                  onClick={() => fetchReport()}
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-[#8b0a24] text-white shadow-sm hover:bg-[#6e081c] active:scale-95 transition cursor-pointer"
                  type="button"
                >
                  <svg fill="#ffffff" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M21.71,20.29,18,16.61A9,9,0,1,0,16.61,18l3.68,3.68a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,20.29ZM11,18a7,7,0,1,1,7-7A7,7,0,0,1,11,18Z"></path>
                  </svg>
                </button>
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex items-center gap-2 w-full justify-center pt-1">
                <button
                  onClick={() => handleSelectDays(7)}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                    selectedRangeType === 7
                      ? "bg-[#8b0a24] text-white border-[#8b0a24]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  type="button"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => handleSelectDays(14)}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                    selectedRangeType === 14
                      ? "bg-[#8b0a24] text-white border-[#8b0a24]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  type="button"
                >
                  Last 14 days
                </button>
                <button
                  onClick={() => handleSelectDays(28)}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                    selectedRangeType === 28
                      ? "bg-[#8b0a24] text-white border-[#8b0a24]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  type="button"
                >
                  Last 28 days
                </button>
              </div>
            </div>

            {/* Calendar Popover */}
            {isCalendarOpen && (
              <div
                ref={calendarRef}
                className="absolute top-12 left-2 z-50 bg-white rounded-2xl p-4 shadow-2xl border border-gray-200 w-[290px] animate-scaleUp text-gray-800"
              >
                {/* Month / Year header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={calMonth}
                      onChange={(e) => setCalMonth(Number(e.target.value))}
                      className="text-xs font-bold text-gray-800 border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={m} value={idx}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      value={calYear}
                      onChange={(e) => setCalYear(Number(e.target.value))}
                      className="text-xs font-bold text-gray-800 border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none"
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevMonth}
                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs"
                      type="button"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextMonth}
                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs"
                      type="button"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 text-center text-[11px] font-bold text-gray-600 mb-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayOfMonth(calMonth, calYear) }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8"></div>
                  ))}

                  {/* Month days */}
                  {Array.from({ length: daysInMonth(calMonth, calYear) }).map((_, i) => {
                    const day = i + 1;
                    const selected = isDateSelected(day);
                    const edge = isDateEdge(day);

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition cursor-pointer ${
                          selected
                            ? "bg-[#fce7eb] text-[#8b0a24] font-bold"
                            : "hover:bg-gray-100 text-gray-700"
                        } ${edge ? "ring-2 ring-[#8b0a24]" : ""}`}
                        type="button"
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto bg-white rounded-lg m-2 lg:m-0 lg:mt-3 shadow border border-gray-200">
          <table className="table bg-white w-full border-collapse">
            <thead>
              <tr style={{ background: "var(--color-bg-primary-aff, #c10931)" }}>
                <th className="text-center py-2.5 px-2 text-white text-xs font-bold uppercase tracking-wider">
                  Date
                </th>
                <th className="text-center py-2.5 px-2 text-white text-xs font-bold uppercase tracking-wider">
                  Event
                </th>
                <th className="text-center py-2.5 px-2 text-white text-xs font-bold uppercase tracking-wider">
                  Profit / Loss
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center text-xs py-6 text-gray-500 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-[#c10931]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : reportList.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-xs py-4 text-gray-600 font-medium">
                    No Data Found
                  </td>
                </tr>
              ) : (
                reportList.map((item, idx) => {
                  const pl = Number(item.amount ?? item.profitLoss ?? item.pl ?? 0);
                  const isProfit = pl >= 0;

                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="text-center py-2.5 px-2 text-xs text-gray-700 whitespace-nowrap">
                        {item.date || item.createdAt ? formatDisplayDate(item.date || item.createdAt) : "-"}
                      </td>
                      <td className="text-center py-2.5 px-2 text-xs font-semibold text-gray-800">
                        {item.event || item.narration || item.marketName || item.gameName || "Casino / Sports"}
                      </td>
                      <td
                        className={`text-center py-2.5 px-2 text-xs font-bold ${
                          isProfit ? "text-[#16a34a]" : "text-[#dc2626]"
                        }`}
                      >
                        {isProfit ? `+₹${pl.toFixed(2)}` : `-₹${Math.abs(pl).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
          className="footerMenu"
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
          className="footerMenu active"
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
    </div>
  );
}
