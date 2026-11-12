import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaChevronLeft, FaTimes, FaGift, FaCheckCircle, FaCoins } from "react-icons/fa";

const categories = ["All", "Deposit", "Sports", "Live Casino", "Slots"];

const promotionData = [
  {
    id: 1,
    categories: ["All", "Deposit", "Live Casino", "Slots"],
    image: "/npr/promotions/promo_welcome_1777.jpg",
    dateTop: "12",
    dateBottom: "21",
    title: "WELCOME BONUS 100% DOUBLE UP TO RS1777",
    subtitle: "Double Your Money Bonus",
    bonusAmount: "Up to Rs. 1,777",
    minDeposit: "Rs. 200",
    turnover: "18x",
    applicableGames: "Live Casino, Slots, Crash Games",
    description:
      "Join JSB77 today and receive an instant 100% Welcome Match on your first deposit up to Rs. 1,777! Deposit using eSewa, Khalti, or Bank Transfer and start winning immediately.",
  },
  {
    id: 2,
    categories: ["All", "Deposit"],
    image: "/npr/promotions/promo_deposit_50.jpg",
    dateTop: "04",
    dateBottom: "05",
    title: "NEW MEMBER 2ND - 5TH DEPOSIT BONUS UP TO 50%",
    subtitle: "Tiered Loyalty Booster",
    bonusAmount: "Up to 50% Extra Cash",
    minDeposit: "Rs. 500",
    turnover: "15x",
    applicableGames: "All Games Available on JSB77",
    description:
      "Exclusive progressive reload boost for registered members! Claim up to 50% extra bonuses across your 2nd, 3rd, 4th, and 5th deposits with zero hassle.",
  },
];

const PromotionPage = () => {
  const navigate = useNavigate();
  const { onOpenDeposit, onOpenRegister } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState("All");
  const [selectedPromo, setSelectedPromo] = useState(null);

  const filteredPromos = promotionData.filter((promo) =>
    activeTab === "All" ? true : promo.categories.includes(activeTab)
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col select-none">
      {/* 1. Header Bar: Deep Blue with Back Chevron and Centered Title */}
      <header className="sticky top-0 z-30 w-full h-[50px] sm:h-[54px] bg-[#0045b8] px-3 flex items-center justify-between text-white shadow-sm">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          className="w-10 h-10 flex items-center justify-start text-white hover:opacity-80 active:scale-90 transition focus:outline-none cursor-pointer"
          title="Back"
          aria-label="Back"
        >
          <FaChevronLeft size={20} className="text-white drop-shadow-xs" />
        </button>

        <h1 className="text-white font-bold text-[17px] tracking-tight absolute left-1/2 -translate-x-1/2">
          Promotion
        </h1>

        <div className="w-10" />
      </header>

      {/* 2. Category Filter Tabs: White Bar with Blue Active Indicator */}
      <div className="sticky top-[50px] sm:top-[54px] z-20 w-full bg-white border-b border-gray-100 shadow-xs px-4 flex items-center gap-7 overflow-x-auto npr-no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`relative py-3 whitespace-nowrap text-[15px] font-bold transition-colors focus:outline-none cursor-pointer ${
                isActive
                  ? "text-[#0045b8]"
                  : "text-[#8898aa] hover:text-[#495057]"
              }`}
            >
              {cat}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0045b8] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Promotion Banner Cards List */}
      <div className="flex-1 p-3.5 sm:p-4 space-y-4 pb-20">
        {filteredPromos.length > 0 ? (
          filteredPromos.map((promo) => (
            <div
              key={promo.id}
              onClick={() => setSelectedPromo(promo)}
              className="w-full bg-[#0045b8] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.12)] cursor-pointer group hover:shadow-xl transition-all duration-200 active:scale-[0.99]"
            >
              {/* Banner Artwork Image */}
              <div className="relative w-full aspect-[418/303] bg-slate-900 overflow-hidden">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300 pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Blue Footer Info Box */}
              <div className="w-full bg-[#0045b8] px-3.5 py-3 flex items-center gap-3 border-t border-blue-400/20">
                {/* Date Block */}
                <div className="flex flex-col items-center justify-center min-w-[32px] text-white pr-3 border-r border-white/25">
                  <span className="text-[17px] font-black leading-tight tracking-tight">
                    {promo.dateTop}
                  </span>
                  <span className="text-[12px] font-bold text-white/85 leading-none">
                    {promo.dateBottom}
                  </span>
                </div>

                {/* Title */}
                <div className="flex-1">
                  <h3 className="text-white font-bold text-[13px] sm:text-[14px] leading-snug uppercase tracking-tight">
                    {promo.title}
                  </h3>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty state for tabs with no active promotions */
          <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500">
            <FaGift size={36} className="text-[#0045b8]/40 mb-2" />
            <p className="text-sm font-bold text-gray-700">
              No promotions found under &quot;{activeTab}&quot;
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Check out the &quot;All&quot; tab for active welcome and deposit bonuses.
            </p>
            <button
              onClick={() => setActiveTab("All")}
              className="mt-3 px-4 py-1.5 rounded-full bg-[#0045b8] text-white text-xs font-bold hover:bg-blue-700 transition"
            >
              View All Promotions
            </button>
          </div>
        )}
      </div>

      {/* 4. Promotion Details Interactive Modal */}
      {selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl text-gray-800 animate-side-redeem-in">
            {/* Header with image */}
            <div className="relative aspect-[418/250] w-full bg-slate-900">
              <img
                src={selectedPromo.image}
                alt={selectedPromo.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPromo(null)}
                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3">
              <h2 className="text-[#0045b8] font-black text-base uppercase leading-snug">
                {selectedPromo.title}
              </h2>

              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedPromo.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 bg-[#f4f7fb] p-3 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-[10.5px] text-gray-400 font-bold block uppercase">
                    Bonus Value
                  </span>
                  <span className="font-black text-[#0045b8]">
                    {selectedPromo.bonusAmount}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-gray-400 font-bold block uppercase">
                    Min Deposit
                  </span>
                  <span className="font-bold text-gray-800">
                    {selectedPromo.minDeposit}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-gray-400 font-bold block uppercase">
                    Rollover
                  </span>
                  <span className="font-bold text-gray-800">
                    {selectedPromo.turnover}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-gray-400 font-bold block uppercase">
                    Status
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <FaCheckCircle size={10} /> Active
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setSelectedPromo(null);
                    if (onOpenDeposit) onOpenDeposit();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-b from-[#1872f2] via-[#0356e0] to-[#062d75] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5"
                >
                  <FaCoins size={12} /> Deposit & Claim
                </button>
                <button
                  onClick={() => setSelectedPromo(null)}
                  className="px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionPage;
