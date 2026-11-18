import {
  IoMenu,
  IoClose,
  IoChevronForward,
  IoCopyOutline,
  IoPencil,
  IoNotificationsOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoGlobeOutline,
  IoLanguageOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import {
  FaRupeeSign,
  FaWallet,
  FaAndroid,
  FaApple,
  FaGift,
} from "react-icons/fa";
import {
  HiOutlineIdentification,
  HiOutlineLogout,
  HiDownload,
} from "react-icons/hi";

import { PiGameControllerLight } from "react-icons/pi";
import { BiSupport } from "react-icons/bi";
import { TbReportMoney } from "react-icons/tb";
import { IoGiftOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RiLoginCircleLine, RiUserAddLine } from "react-icons/ri";
import { resetApp } from "../../../../redux/appReset";
import { logout } from "../../../../redux/slices/userSlice";
import { revertAccount } from "../../../../redux/slices/accountSlice";
import { persistor } from "../../../../redux/store";
import { resetBetSettings } from "../../../../redux/slices/betSettingsSlice";
import { setUserOffline } from "../../../../socketClient";
import { toast } from "react-toastify";
import ExposureToast from "../ExposureToast";
import Bets from "../../../../CommonComponents/Svg/Bets";
import OpenBets from "../OpenBets/OpenBets";
import { getCasinoBalance } from "../../../../api";
import { updateSiteCasinoSlice } from "../../../../redux/slices/siteCasinoSlice";
import { selectSite } from "../../../../utils/helper/commonSelectors";
import ProfileEditModal from "./Profileeditmodal";
import { generatePresignedUrl } from "../../../../utils/helper/generatePresignedUrl";

function useResolvedAvatar(profileKey) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let active = true;

    if (!profileKey) {
      setUrl(null);
      return;
    }

    generatePresignedUrl(profileKey)
      .then((resolved) => {
        if (active) setUrl(resolved);
      })
      .catch((err) => {
        console.error("Couldn't resolve avatar image:", err);
        if (active) setUrl(null);
      });

    return () => {
      active = false;
    };
  }, [profileKey]);

  return url || "/raftaar/user.jpeg";
}

const menuItems = [
  {
    key: "myprofile",
    label: "Account",
    desc: "Manage your account details",
    icon: <IoPersonOutline size={20} />,
  },
  {
    key: "account-statement",
    label: "Transactions",
    desc: "View your transaction history",
    icon: <IoWalletOutline size={20} />,
  },
  {
    key: "bets-history",
    label: "Game History",
    desc: "Check your game activity",
    icon: <PiGameControllerLight size={21} />,
  },
  {
    key: "referral",
    label: "Referral & Earn",
    desc: "Invite friends & earn rewards",
    icon: <IoGiftOutline size={20} />,
  },
  {
    key: "contact",
    label: "Customer Support",
    desc: "Get help & support",
    icon: <BiSupport size={21} />,
  },
  {
    key: "profit-loss",
    label: "Profit & Lose",
    desc: "Track your profit and loss",
    icon: <TbReportMoney size={21} />,
  },
  {
    key: "multi-market",
    label: "Multi Market",
    desc: "Explore multiple markets",
    icon: <IoGlobeOutline size={20} />,
  },

  {
    key: "logout",
    label: "Logout",
    desc: "Sign out from your account",
    icon: <IoLogOutOutline size={20} />,
  },
];

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);
  const dispatch = useDispatch();
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const avatarUrl = useResolvedAvatar(userData?.profile);

  const handleLogout = (e) => {
    if (e?.preventDefault) e.preventDefault();

    onClose?.();

    toast.dismiss();
    toast.success(
      <ExposureToast
        type="success"
        subtitle="Logout Sucsessfully"
      />,
    );

    try {
      const uid = userData?.id || userData?.userId || userData?._id;
      if (uid && uid !== "Demo") {
        setUserOffline(uid);
      }
    } catch (err) {
      console.error("Error setting user offline:", err);
    }

    dispatch(logout());
    dispatch(resetApp());
    dispatch(revertAccount());
    dispatch(resetBetSettings());

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("loginExpiryAt");
        localStorage.removeItem("loggedInType");
        localStorage.removeItem("user");
        sessionStorage.clear();
      }
      persistor.purge();
    } catch (purgeErr) {
      console.error("Storage purge error on logout:", purgeErr);
    }

    navigate("/cricket", { replace: true });
  };

  const handleProfileSave = (updatedUser) => {
    console.log("Profile photo updated:", updatedUser);
  };

  const copyId = () => {
    const id = userData?.id || userData?.userId || userData?._id;
    if (id) {
      navigator.clipboard.writeText(String(id));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-[#0a1424] z-[70] flex flex-col transition-transform duration-300 ease-out border-l border-[#00e676]/20 shadow-[0_0_40px_rgba(0,230,118,0.12)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
        >
          <IoClose size={18} />
        </button>

        {/* Profile Section */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-b from-[#ff5a3c] to-[#c62828] flex items-center justify-center flex-shrink-0 shadow-lg">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-white font-bold text-[15px] truncate mt-0.5 leading-tight">
                {userData?.userName || "Unknown User"}
              </p>

              <button
                onClick={() => setProfileEditOpen(true)}
                className="mt-1.5 flex items-center gap-1 text-[#00e676] font-bold text-[13px] hover:text-[#69f0ae] transition-colors"
              >
                Profile Edit
                <IoPencil size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10 mx-4" />

        {/* Menu list */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === "logout") {
                  onClose?.();
                  handleLogout({ preventDefault: () => {} });
                } else if (item.key) {
                  navigate(item.key);
                  onClose();
                }
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/5 transition-colors group"
            >
              <div className="relative w-10 h-10 rounded-xl border border-[#00e676]/45 bg-[#00e676]/8 flex items-center justify-center text-[#00e676] group-hover:border-[#00e676]/80 group-hover:bg-[#00e676]/15 transition-all ">
                {item.icon}

                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-[#00e676] text-[#0a1424] text-[10px] font-bold flex items-center justify-center px-1 shadow-md">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <p className="text-[#e8eef7] font-bold text-[14px] leading-tight">
                  {item.label}
                </p>
                <p className="text-[#6b7c93] text-[11.5px] mt-0.5 truncate">
                  {item.desc}
                </p>
              </div>

              <IoChevronForward
                size={16}
                className="text-[#4a5a72] flex-shrink-0"
              />
            </button>
          ))}
        </div>

        {/* App download bar */}
        <div className="border-t border-white/10 px-5 py-4 flex items-center justify-between bg-[#0a1424]">
          <div className="flex items-center gap-2.5">
            <HiDownload size={18} className="text-[#8fa0bd]" />
            <span className="text-[#c3cfe0] font-bold text-[13.5px]">
              RaftaarClub App
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[#8fa0bd]">
            <FaAndroid size={17} />
            <FaApple size={17} />
            <IoChevronForward size={14} />
          </div>
        </div>
      </div>

      <ProfileEditModal
        open={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        onSave={handleProfileSave}
      />
    </>
  );
}

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const userData = useSelector((state) => state?.user?.userData);
  const loginType = useSelector((state) => state.user.loggedInType);
  const [openBetsSide, setOpenBetsSide] = useState("");
  const avatarUrl = useResolvedAvatar(userData?.profile);

  const dispatch = useDispatch();

  const siteDetails = useSelector(selectSite());

  // const fetchData = async () => {
  //   try {
  //     const res = await getCasinoBalance({
  //       domainId: siteDetails?.domainName?._id || "",
  //       userDomainId: siteDetails?.domainName?._id || "",
  //     });
  //     dispatch(updateSiteCasinoSlice(res?.data?.data));
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#131826] to-[#131826] shadow-[0_2px_16px_rgba(0,0,0,0.4)] border-b border-[#00e676]/10">
        <div className="flex items-center justify-between px-2 h-[52px] gap-1.5">
          {/* Logo */}
          <Link to="/" className="shrink-0 relative">
            <img
              src="/raftaar/raf-logo.png"
              className="h-[42px] w-auto max-w-[110px] object-contain drop-shadow-[0_0_10px_rgba(0,230,118,0.25)]"
              alt="logo"
            />
          </Link>

          {/* Center Balance Card */}
          {!loginType ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="flex h-9 items-center bg-gradient-to-b from-[#ff4d4d] to-[#e01e1e] gap-1.5 rounded-full border border-white/10 px-3 text-[12px] font-bold text-white shadow-[0_2px_10px_rgba(224,30,30,0.45)] active:scale-95 transition-transform"
              >
                <RiLoginCircleLine size={17} />
                <span>Login</span>
              </Link>

              <Link
                to="/signup"
                className="flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] px-2.5 text-[12px] font-bold text-[#1a1a1a] shadow-[0_2px_10px_rgba(245,158,11,0.45)] active:scale-95 transition-transform"
              >
                <RiUserAddLine size={17} />
                <span>SignUp</span>
              </Link>
            </div>
          ) : (
            <div className="relative flex-1 min-w-0 max-w-[280px]">
              {/* subtle neon glow behind card */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00e676]/25 via-transparent to-[#ffd21c]/20 rounded-[14px] blur-[6px] opacity-70 pointer-events-none" />

              <div className="relative flex items-center bg-gradient-to-b from-[#0f2230] to-[#0a1820] rounded-[13px] border border-[#2a4a5e] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]">
                {/* Profile Avatar */}
                <div className="w-[42px] sm:w-[48px] flex items-center justify-center shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004635] overflow-hidden border-2 border-[#00e676]/70 shadow-[0_0_8px_rgba(0,230,118,0.4)]">
                    <img
                      className="h-full w-full object-cover"
                      src={avatarUrl}
                      alt=""
                    />
                  </div>
                </div>

                {/* Balance Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 px-2 py-1 border-l border-white/[0.06]">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gradient-to-b from-[#3dffa0] to-[#1fb35a] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_6px_rgba(61,255,160,0.6)]">
                      <FaRupeeSign className="text-black text-[8px]" />
                    </div>
                    <span
                      className="
                        font-sans
                        font-extrabold
                        text-[9px]
                        min-[360px]:text-[10px]
                        min-[400px]:text-[11px]
                        sm:text-[13px]
                        text-[#3dffa0]
                        leading-none
                        whitespace-nowrap
                        drop-shadow-[0_0_6px_rgba(61,255,160,0.35)]
                      "
                    >
                      {(
                        (Number(userData?.availableBalance) || 0) -
                        (Number(userData?.exposure) || 0)
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 self-start rounded-full px-1.5 py-[1px]">
                    <span className="text-[#ff5c4d] font-sans text-[8px] sm:text-[8.5px] font-bold leading-none truncate">
                      Exp: {(Number(userData?.exposure) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bonus Balance Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 px-2 py-1 border-l border-white/[0.06]">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gradient-to-b from-[#ffe066] to-[#ffb300] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_6px_rgba(255,179,0,0.6)]">
                      <FaGift className="text-black text-[8px]" />
                    </div>
                    <span className="text-[#c3cfe0] font-bold text-[9px] sm:text-[10px] leading-none truncate">
                      Bonus
                    </span>
                  </div>

                <span
                className="
                  text-[#ffd21c]
                  font-sans
                  text-[9px]
                  min-[360px]:text-[10px]
                  min-[400px]:text-[11px]
                  sm:text-[13px]
                  font-extrabold
                  leading-none
       
                  min-[360px]:pl-[16px]
                  min-[400px]:pl-[18px]
                  sm:pl-[20px]
                  whitespace-nowrap
                  drop-shadow-[0_0_6px_rgba(255,210,28,0.35)]
                "
              >
                {(Number(userData?.bonusBalance) || 0).toFixed(2)}
            </span>
                </div>

              </div>
            </div>
          )}

          {loginType && (
            <button
              onClick={() => setMenuOpen(true)}
              className="shrink-0 w-9 h-9 bg-gradient-to-b from-white to-[#e8eef7] rounded-[8px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)] active:scale-90 transition-transform"
            >
              <IoMenu color="#063246" size={26} />
            </button>
          )}
        </div>
      </div>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <OpenBets openSide={openBetsSide} closeBets={() => setOpenBetsSide("")} />
    </>
  );
};

export default Header;