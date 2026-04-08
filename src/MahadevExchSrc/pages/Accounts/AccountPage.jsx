import { IoChevronBack, IoNotifications } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { resetApp } from "../../../redux/appReset";
import { resetBetSettings } from "../../../redux/slices/betSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AccountPage = () => {
  const getPlColor = () => {
    if (Pl > 0) return "text-green-600";
    if (Pl < 0) return "text-red-600";
    return "text-black";
  };

  const userData = useSelector((state) => state?.user?.userData) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
const menuItems = [
  { label: "ডিপোজিট ও উত্তোলন", path: "/balance-overview" },
  { label: "অসম্পূর্ণ বাজি", path: "/unsettled-bet" },
  { label: "বাজির ইতিহাস", path: "/bet-history" },
  { label: "ব্যাংক ট্রান্সফার", path: "/myAccount/bank-transfer" },
  { label: "লাভ ও ক্ষতি", path: "/profit-loss-report" },
  { label: "অ্যাক্টিভিটি লগ", path: "/activityLog" },
  { label: "অ্যাকাউন্ট স্টেটমেন্ট", path: "/account-statement" },
  { label: "অ্যাকাউন্ট সেটিংস", path: "/change-password" },
];

  const exposure = Number(userData?.exposure || 0);

  const availableBalance = Number((userData?.availableBalance || 0) - exposure);

  const Pl = Number(
    (userData?.availableBalance || 0) - (userData?.creditReference || 0),
  );

const balanceList = [
  {
    label: "উপলব্ধ ব্যালেন্স",
    value: availableBalance.toFixed(2),
    color: "text-black",
  },
  {
    label: "ওয়ালেট ব্যালেন্স",
    value: Number(userData?.bonusBalance || 0).toFixed(2),
    color: "text-black",
  },
  {
    label: "লাভ/ক্ষতি",
    value: Pl.toFixed(2),
    color: getPlColor(),
  },
  {
    label: "এক্সপোজার",
    value: exposure.toFixed(2),
    color: "text-red-600",
  },
];

  const handleLogout = (e) => {
    e.preventDefault();

    dispatch(resetApp());
    dispatch(resetBetSettings());

    navigate("/");

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[white] mb-[80px]">
      {/* HEADER */}
      <div className="bg-[#00723B] text-white flex items-center justify-between px-2 py-2.5">
        <div
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 font-bold text-[14px]"
        >
          <IoChevronBack size={20} />
          ফিরে যান
        </div>

        <IoNotifications size={17} />
      </div>

      <div>
        {/* USER CARD */}
        <div className="bg-[#00723B] m-4 text-white flex items-center justify-between p-2 px-2.5 rounded-md mb-4">
          <h2 className="font-bold text-[16px] notranslate" translate="yes">{userData?.userName}</h2>

          <FaCircleUser size={28} />
        </div>

        {/* BALANCE LIST */}
        <div className="bg-white  overflow-hidden  border-t border-[#00000033]">
          {balanceList.map((item, index) => (
            <div
              key={index}
              className={`flex text-black text-[14px] justify-between px-7 py-2 
               border-b border-[#00000033]
              `}
            >
              <span className="font-semibold text-[#212529]">{item.label}</span>
              <span className={`font-bold text-[16px] ${item.color}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* MENU BUTTONS */}
        <div className="space-y-2.5 mx-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full text-[14px] border border-[#000] bg-white py-2 rounded-xl font-bold"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* LOGOUT BUTTON */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLogout}
            className="bg-[#ff0000] text-[16px] text-white font-bold py-2.5 rounded-[8px] w-[75%]"
          >
            লগআউট
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
