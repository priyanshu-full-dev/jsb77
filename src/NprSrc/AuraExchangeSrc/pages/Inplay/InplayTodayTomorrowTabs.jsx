import React from "react";
import SearchPopup from "../../components/Header/SearchPopup";

function InplayTodayTomorrowTabs({ activeTab, setActiveTab }) {
  const tabs = ["Inplay", "Today", "Tomorrow", "Result"];
  const displayLabels = {
    Inplay: "In-Play",
    Today: "Today",
    Tomorrow: "Tomorrow",
    Result: "Result",
  };

  return (
    <div className="w-full bg-[#1F3B58] px-2 py-1.5 flex items-center justify-between border-b border-[#142637] select-none shadow-xs">
      {/* 4 Tabs: In-Play, Today, Tomorrow, Result */}
      <div className="flex items-center bg-[#132537] border border-[#2B4963] rounded-[5px] p-[2.5px] flex-1 max-w-[370px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab && setActiveTab(tab)}
              className={`flex-1 text-center py-1 px-1.5 text-[12px] sm:text-[13px] font-bold rounded-[3px] transition select-none ${
                isActive
                  ? "bg-white text-black font-extrabold shadow-sm"
                  : "bg-transparent text-white hover:text-gray-200"
              }`}
            >
              {displayLabels[tab]}
            </button>
          );
        })}
      </div>

      {/* Search Icon on right matching reference */}
      <div className="flex items-center justify-center pl-2 flex-shrink-0">
        <SearchPopup />
      </div>
    </div>
  );
}

export default InplayTodayTomorrowTabs;
