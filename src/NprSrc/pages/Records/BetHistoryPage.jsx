import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronDown,
  FaSearch,
  FaRegCalendarAlt,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";

const categories = [
  { id: "live", label: "Live" },
  { id: "slot", label: "Slot" },
  { id: "fish", label: "Fish" },
  { id: "sports", label: "Sports" },
  { id: "poker", label: "Poker" },
];

const BetHistoryPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("live");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateRangeOption, setDateRangeOption] = useState("today");
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  // Format today's date range: "MM/DD 00:00:00- MM/DD 23:59:59"
  const formattedDateRange = useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${mm}/${dd} 00:00:00- ${mm}/${dd} 23:59:59`;
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1e293b] flex flex-col relative pb-28 select-none">
      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-[#0047ba] text-white flex items-center justify-between px-3.5 h-12 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center -ml-1 text-white hover:opacity-80 active:scale-95 transition cursor-pointer"
          aria-label="Back"
        >
          <FaChevronLeft size={18} />
        </button>

        <h1 className="font-bold text-[17px] tracking-tight">Bet History</h1>

        {/* Exclusion turnover list button */}
        <button
          type="button"
          onClick={() => setShowExclusionModal(true)}
          className="bg-[#0091ff] hover:bg-[#0080ea] text-white text-[10px] font-bold px-3 py-1 rounded-full text-center leading-tight shadow-xs active:scale-95 transition cursor-pointer"
        >
          Exclusion
          <br />
          turnover list
        </button>
      </header>

      {/* 2. Category Tabs */}
      <div className="border-b border-gray-100 flex items-center justify-around bg-white px-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-3 text-[14.5px] text-center font-bold relative transition cursor-pointer ${
                isActive ? "text-[#0088ff]" : "text-gray-800 hover:text-[#0088ff]"
              }`}
            >
              {cat.label}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#0088ff] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Filter Controls Row */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto npr-no-scrollbar">
        {/* Date Range Box */}
        <div
          onClick={() => showToast("Viewing records for today")}
          className="border border-[#0088ff] rounded-[6px] h-8 px-2 flex items-center gap-1.5 bg-white text-[#0088ff] text-[11px] font-semibold cursor-pointer shrink-0 hover:bg-blue-50/40 transition"
          title="Date Range"
        >
          <FaRegCalendarAlt size={12} className="shrink-0" />
          <span className="whitespace-nowrap">{formattedDateRange}</span>
        </div>

        {/* Provider / Status Dropdown */}
        <div className="relative shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#0088ff] rounded-[6px] h-8 pl-2 pr-6 bg-white text-[#0088ff] text-[11px] font-semibold appearance-none cursor-pointer focus:outline-hidden hover:bg-blue-50/40 transition"
          >
            <option value="All">All</option>
            <option value="Settled">Settled</option>
            <option value="Unsettled">Unsettled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <FaChevronDown
            size={9}
            className="text-[#0088ff] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Type / Sub-filter Dropdown */}
        <div className="relative shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-[#0088ff] rounded-[6px] h-8 pl-2 pr-6 bg-white text-[#0088ff] text-[11px] font-semibold appearance-none cursor-pointer focus:outline-hidden hover:bg-blue-50/40 transition"
          >
            <option value="All">All</option>
            <option value="Main">Main Bet</option>
            <option value="Side">Side Bet</option>
          </select>
          <FaChevronDown
            size={9}
            className="text-[#0088ff] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Search Icon */}
        <button
          type="button"
          onClick={() => showToast("Refreshing bet records...")}
          className="w-8 h-8 flex items-center justify-center text-[#0088ff] hover:opacity-80 active:scale-90 transition cursor-pointer shrink-0 ml-auto"
          title="Search"
        >
          <FaSearch size={15} />
        </button>
      </div>

      {/* 4. Empty State Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-10">
        <div className="w-[230px] h-[190px] flex items-center justify-center">
          <img
            src="/npr/records/bet_empty.png"
            alt="No bet data"
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
        <h2 className="text-[#0088ff] font-bold text-[24px] mt-2">
          No data
        </h2>
      </div>

      {/* 5. Floating Badges (Free Spin, Down Arrow, Close) */}
      <div className="fixed right-3 bottom-24 flex flex-col items-end gap-2.5 z-10 pointer-events-auto">
        {/* Grey Close Icon */}
        <button
          onClick={() => showToast("Dismissed")}
          className="w-6 h-6 rounded-full bg-black/45 text-white flex items-center justify-center text-xs hover:bg-black/60 transition"
        >
          <FaTimes size={11} />
        </button>

        {/* Free Spin Badge */}
        <div
          onClick={() => showToast("Free Spin reward available!")}
          className="w-12 h-12 cursor-pointer hover:scale-105 active:scale-95 transition"
        >
          <img
            src="/npr/withdrawal/free_spin_badge.png"
            alt="Free Spin"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>

        {/* Orange Down Arrow Badge */}
        <div className="w-7 h-7 rounded-full bg-[#ff6b00] text-white flex items-center justify-center shadow-md">
          <FaChevronDown size={12} />
        </div>
      </div>

      {/* 6. Fixed Bottom Summary Bar (Matching Screenshot) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#f1f3f5] border-t border-gray-200 px-4 py-2.5 z-20 select-none shadow-xs">
        <div className="grid grid-cols-2 gap-4">
          {/* Column 1 */}
          <div>
            <span className="text-[#1e293b] font-semibold text-[12px] block">Bet amount</span>
            <span className="text-[#66a80f] font-bold text-[12px] block">0.00</span>
            <span className="text-[#1e293b] font-semibold text-[12px] block mt-1">Winnings</span>
            <span className="text-[#66a80f] font-bold text-[12px] block">0.00</span>
          </div>

          {/* Column 2 */}
          <div>
            <span className="text-[#1e293b] font-semibold text-[12px] block">Valid bet</span>
            <span className="text-[#66a80f] font-bold text-[12px] block">0.00</span>
            <span className="text-[#1e293b] font-semibold text-[12px] block mt-1">Profit and loss</span>
            <span className="text-[#66a80f] font-bold text-[12px] block">0.00</span>
          </div>
        </div>
      </div>

      {/* 7. Exclusion Turnover List Modal */}
      {showExclusionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 animate-scale-up">
            <div className="bg-[#0047ba] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaInfoCircle size={16} />
                <h3 className="font-bold text-sm">Exclusion Turnover List</h3>
              </div>
              <button
                onClick={() => setShowExclusionModal(false)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                <FaTimes size={12} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs text-gray-700">
              <p className="font-semibold text-gray-900">
                Turnover Exclusion Criteria:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                <li>Opposite bets / hedge betting are excluded from turnover calculation.</li>
                <li>Draws, cancelled bets, and refunded bets do not count towards wagering requirements.</li>
                <li>Live Roulette bets covering more than 24 numbers are excluded.</li>
                <li>Bonus turnover must be met on eligible games only.</li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowExclusionModal(false)}
                  className="w-full h-9 bg-[#0047ba] hover:bg-[#003da5] text-white font-bold rounded-lg transition"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50 animate-fadeIn">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default BetHistoryPage;

