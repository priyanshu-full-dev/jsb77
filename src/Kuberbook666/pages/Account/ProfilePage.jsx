import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaUserCircle, FaWallet, FaHistory, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import { logout } from "../../../redux/slices/userSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state?.user?.userData);
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="w-full px-3 py-4 space-y-4 max-w-lg mx-auto">
      {/* Profile Card */}
      <div className="bg-gradient-to-r from-[#6e0b0b] to-[#450505] p-5 rounded-2xl text-white shadow-xl flex items-center gap-4 border border-red-900/50">
        <FaUserCircle className="text-5xl text-yellow-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold truncate">
            {userData?.username || "Guest Player"}
          </h2>
          <span className="text-xs text-yellow-300 font-bold">Kuberbook VIP Club</span>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="bg-[#181924] p-4 rounded-2xl border border-gray-800 shadow-md flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
            <FaWallet />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block">Main Balance</span>
            <span className="text-lg font-black text-white">
              ₹ {userData?.balance || "0.00"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow">
            Deposit
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 border border-gray-700">
            Withdraw
          </button>
        </div>
      </div>

      {/* Action Links */}
      <div className="bg-[#181924] rounded-2xl border border-gray-800 divide-y divide-gray-800 text-sm font-semibold text-gray-300 overflow-hidden">
        <div className="p-3.5 flex items-center justify-between hover:bg-gray-800/40 cursor-pointer">
          <div className="flex items-center gap-3">
            <FaHistory className="text-blue-400" />
            <span>Betting History</span>
          </div>
          <span className="text-gray-500">→</span>
        </div>
        <div className="p-3.5 flex items-center justify-between hover:bg-gray-800/40 cursor-pointer">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-emerald-400" />
            <span>Security & Password</span>
          </div>
          <span className="text-gray-500">→</span>
        </div>
      </div>

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-sm flex items-center justify-center gap-2 transition"
        >
          <FaSignOutAlt />
          <span>Log Out</span>
        </button>
      )}
    </div>
  );
};

export default ProfilePage;
