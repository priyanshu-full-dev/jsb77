import React, { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

const OpenBets = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("casino"); // default ACE CASINO

  return (
    <div className="fixed inset-0 z-[999999] flex items-end px-2">
      {/* Overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60 z-[1]" />

      <div className="relative z-[2] w-full md:w-[420px] modal-open">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute font-bold h-[50px] right-0 top-[-129px] bg-[#2c2c2c] text-white text-[12px] px-4 rounded-[10px]"
        >
          <div className="flex items-center gap-2 -mt-5">
            <span>CLOSE</span>
            <IoCloseSharp size={18} />
          </div>
        </button>

        {/* MAIN BOX */}
        <div className="relative bottom-[100px] overflow-hidden bg-[#1a1a1a] w-full md:w-[420px] rounded-[10px] pt-4 shadow-xl">
          
          <div className="w-full h-[400px] bg-white">
            
            {/* HEADER */}
            <h2 className="text-center font-extrabold text-[23px] py-2">
              MATCHED BETS
            </h2>

            {/* 🔥 TABS */}
            <div className="flex mx-3 mt-2 border border-gray-300 rounded-[4px] p-1 overflow-hidden text-[12px] font-bold">
              
              <button
                onClick={() => setActiveTab("sports")}
                className={`flex-1 border-r font-[14px] py-1.5 ${
                  activeTab === "sports"
                    ? "bg-green-700 text-white"
                    : "bg-white text-black"
                }`}
              >
                SPORTS
              </button>

              <button
                onClick={() => setActiveTab("casino")}
                className={`flex-1 border-r font-[14px] py-1.5 ${
                  activeTab === "casino"
                    ? "bg-green-700 text-white"
                    : "bg-white text-black"
                }`}
              >
                CASINO
              </button>

              <button
                onClick={() => setActiveTab("special")}
                className={`flex-1 font-[14px] py-1.5 ${
                  activeTab === "special"
                    ? "bg-green-700 text-white"
                    : "bg-white text-black"
                }`}
              >
                SPECIAL MARKET
              </button>
            </div>

            {/* 🔥 CONTENT CHANGE */}
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              
              {activeTab === "sports" && (
                <p className="text-gray-600 font-semibold">
                  No Sports Bets
                </p>
              )}

              {activeTab === "casino" && (
                <p className="text-gray-600 font-semibold">
                  No Casino Bets
                </p>
              )}

              {activeTab === "special" && (
                <p className="text-gray-600 font-semibold">
                  No Special Market Bets
                </p>
              )}

            </div>
          </div>
        </div>

        {/* POINTER IMAGE */}
        <div className="absolute bottom-[75px] right-[16%]">
          <img src="/dwonAR.png" alt="" className="w-[97px] h-[32px]" />
        </div>
      </div>
    </div>
  );
};

export default OpenBets;