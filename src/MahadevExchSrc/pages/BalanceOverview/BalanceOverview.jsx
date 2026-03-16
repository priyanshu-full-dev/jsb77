import { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdKeyboardArrowRight, MdMenu, MdClose } from "react-icons/md";

import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

import DepositNew from "./DepositNew";

const BalanceOverview = () => {
  const [activeTab, setActiveTab] = useState("deposit");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#f0ece1]">
      {/* Mobile Menu Button */}

      {/* Main Content */}

      <div className="w-full mx-auto md:w-[80%] lg:w-[82%] flex flex-col">
        <div className="bg-[#2f2f2f] relative min-h-[250px] w-full">
          <div className="pb-3">
            <div className="w-[95%] md:w-[80%] lg:w-[60%] mx-auto mt-[3em] md:mt-[5em] bg-white rounded-lg shadow-lg">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`w-1/2 py-3 text-center font-semibold ${
                    activeTab === "deposit"
                      ? "border-b-[6px] border-[#ffb80c] text-blue-500"
                      : "text-gray-500 border-b-[6px] border-white"
                  }`}
                  onClick={() => setActiveTab("deposit")}
                >
                  DEPOSIT
                </button>
                <button
                  className={`w-1/2 py-3 text-center font-semibold ${
                    activeTab === "withdraw"
                      ? "border-b-[6px] border-[#ffb80c] text-blue-500"
                      : "text-gray-500 border-b-[6px] border-white"
                  }`}
                  onClick={() => setActiveTab("withdraw")}
                >
                  WITHDRAW
                </button>
              </div>

              {/* Tab Content */}
              <div className="sm:p-4">
                {activeTab === "deposit" ? <Deposit /> : <Withdraw />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* CSS for hover effects */}
      <style>
        {`
          .deposit-ul li:hover {
            background-color: #f6ce6f;
          }
          .deposit-ul li:hover button {
            border: 1px solid #ffb80c;
            background: #ffb80c;
            color: white;
          }
        `}
      </style>
    </div>
  );
};

export default BalanceOverview;
