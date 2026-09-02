import React, { useState } from "react";
import BannerSlider from "../../components/BannerSlider";
import IceCasinoIcon from "../../components/icons/IceCasinoIcon";
import LiveCasinoIcon from "../../components/icons/LiveCasinoIcon";
import SlotsIcon from "../../components/icons/SlotsIcon";

import LiveCasinoPage from "./LiveCasinoGames";
import { t } from "../../utils/language";

const CasinoGames = () => {
  const [activeTab, setActiveTab] = useState("ace");

const tabs = [
  { id: "ace", name: t("Ace Casino", "এইস ক্যাসিনো"), icon: IceCasinoIcon },
  { id: "live", name: t("Live Casino", "লাইভ ক্যাসিনো"), icon: LiveCasinoIcon },
  { id: "slots", name: t("Slots", "স্লটস"), icon: SlotsIcon },
];  

  const images = ["/1.png","/2.png","/3.png","/4.png","/5.png","/6.png"];

  return (
    <div className="bg-[#1a1a1a] min-h-screen pb-20 -mt-1">
      <BannerSlider images={images}/>

      {/* TABS */}

      <div className="grid grid-cols-3 gap-2.5 px-3 mt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-[100px] border border-[rgba(255,255,255,0.2)]
              rounded-[10px] flex flex-col justify-center items-center cursor-pointer
              ${activeTab === tab.id ? "bg-[#343434]" : "bg-[#272727]"}`}
            >
              <Icon className="text-white mb-1" />

              <p className="text-[13px] font-bold uppercase text-white">
                {tab.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      <div className="mt-4">
        {activeTab === "ace" && <LiveCasinoPage tab="ace" />}
        {activeTab === "live" && <LiveCasinoPage tab="live" />}
        {activeTab === "slots" && <LiveCasinoPage tab="slots" />}
      </div>
    </div>
  );
};

export default CasinoGames;
