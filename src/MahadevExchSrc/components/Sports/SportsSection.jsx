import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";

import {
  FaBullhorn,
  FaFootballBall,
  FaHockeyPuck,
  FaVolleyballBall,
} from "react-icons/fa";
import { GiCricketBat, GiTennisBall } from "react-icons/gi";

import "swiper/css";

const sports = [
  { name: "CRICKET", icon: <GiCricketBat size={22} /> },
  { name: "GAMES", icon: <FaFootballBall size={20} /> },
  { name: "SOCCER", icon: <FaFootballBall size={20} /> },
  { name: "TENNIS", icon: <GiTennisBall size={20} /> },
  { name: "ICE HOCKEY", icon: <FaHockeyPuck size={20} /> },
  { name: "VOLLEYBALL", icon: <FaVolleyballBall size={20} /> },
];

const SportsSection = () => {
  const [activeTab, setActiveTab] = useState("INPLAY");

  return (
    <div className="w-full bg-[#0b6a3b]">

      {/* ANNOUNCEMENT */}

      <div className="flex items-center gap-2 bg-[#0a4f2d] px-3 py-2 text-white text-[12px]">
        <FaBullhorn />
        <marquee>
          KETBALL AND VOLLEYBALL BETS HAVE STARTED IN OUR EXCHANGE
        </marquee>
      </div>

      {/* TABS */}

      <div className="flex justify-around text-white font-semibold text-[14px]">
        {["INPLAY", "TODAY", "TOMORROW"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 ${
              activeTab === tab
                ? "border-b-[3px] border-white"
                : "opacity-70"
            }`}
          >
            {tab.replace("INPLAY", "IN-PLAY")}
          </button>
        ))}
      </div>

      {/* SPORTS SLIDER */}

      <div className="bg-[#0b6a3b] border-t border-[#ffffff22]">

        <Swiper
          modules={[FreeMode]}
          slidesPerView="auto"
          freeMode
          spaceBetween={0}
          className="sportsSwiper"
        >
          {sports.map((sport, i) => (
            <SwiperSlide
              key={i}
              className="!w-[90px] border-r border-[#ffffff22]"
            >
              <div className="flex flex-col items-center justify-center py-3 text-white text-[11px]">
                <div className="mb-1">{sport.icon}</div>
                <span>{sport.name}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </div>
  );
};

export default SportsSection;