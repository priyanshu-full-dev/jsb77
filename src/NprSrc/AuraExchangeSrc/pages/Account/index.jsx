import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../../../redux/slices/userSlice";
import { ReCallCasinoBalance } from "../../../../api";
import { toast } from "react-toastify";
import { useState } from "react";
import { PiCurrencyInrFill } from "react-icons/pi";
import { isSignupUser } from "../../../../utils/helper/commonSelectors";
import DepositWithdraw from "../../components/Deposit&Withdraw/Deposit&Withdraw";
import { FaUserCircle } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { resetBetSettings } from "../../../../redux/slices/betSettingsSlice";
import { resetApp } from "../../../../redux/appReset";
import { logout } from "../../../../redux/slices/userSlice";
import { revertAccount } from "../../../../redux/slices/accountSlice";
import { persistor } from "../../../../redux/store";
import { setUserOffline } from "../../../../socketClient";
import ExposureToast from "../../components/ExposureToast";

const Account = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);
  const [isLoading, setIsLoading] = useState(false);
  const signupUser = useSelector(isSignupUser());
  const IsLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const menuItems = [
    { name: "My Profile", href: "/myprofile" },
    { name: "Multi Markets", href: "/multi-market" },
    { name: "Rolling Commission", href: "/rolling-commission" },
    { name: "Account Statement", href: "/account-statement" },
    { name: "Bets History", href: "/bets-history" },
    { name: "Profit & Loss", href: "/profit-loss" },
    { name: "Password History", href: "/password-history" },
    { name: "Activity Log", href: "/activity-log" },
    { name: "Casino Balance", href: "#" },
  ];

  const handleMenuClick = (item) => {
    console.log(`Clicked on ${item.name}`);
  };

  // const handleLogout = async (event) => {
  //   event.preventDefault();
  //   try {
  //     // reset Redux slices
  //     dispatch(revertUser());
  //     dispatch(revertAccount());
  //     dispatch(resetBetSettings());

  //     // stop persistence & purge storage
  //     persistor.pause();
  //     await persistor.purge();

  //     // clear any other app-specific localStorage keys
  //     Object.keys(localStorage).forEach((key) => {
  //       if (key !== "siteDetails") localStorage.removeItem(key);
  //     });

  //     // ensure purge is flushed before reload
  //     await persistor.flush();

  //     // final reset
  //     window.location.reload();
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //   }
  // };

  // const handleLogout = (e) => {
  //   if (e?.preventDefault) e.preventDefault();

  //   toast.dismiss();
  //   toast.success(
  //     <ExposureToast
  //       type="success"
  //       subtitle="Logout Sucsessfully"
  //     />,
  //   );

  //   try {
  //     const uid = userData?._id || userData?.userId || userData?.id;
  //     if (uid && uid !== "Demo") {
  //       setUserOffline(uid);
  //     }
  //   } catch (err) {
  //     console.error("Error setting user offline:", err);
  //   }

  //   dispatch(resetApp());
  //   dispatch(resetBetSettings());
  //   // navigate("/cricket", { replace: true });
  //   window.location.href = "/cricket";
  // };

  const handleLogout = (e) => {
    if (e?.preventDefault) e.preventDefault();

    toast.dismiss();
    toast.success(
      <ExposureToast type="success" subtitle="Logout Sucsessfully" />,
    );

    try {
      const uid = userData?._id || userData?.userId || userData?.id;
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

  const handlereCall = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await ReCallCasinoBalance({
        CasinoBalance: userData?.casinoBalance,
      });

      dispatch(updateAvailableBalance(response.data.user.availableBalance));
      dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[#ededed]">
        {IsLoggedIn && signupUser && <DepositWithdraw />}

        {/* Account Header - Original TXT */}
        <div
          className="
          bg-[linear-gradient(-180deg,#2E4B5E_0%,#243A48_82%)]
          text-white
          text-[3.73333vw]
          leading-[2.2]
          px-[7.5px]
          m-0
          flex
          items-center
          justify-start
          h-auto
        "
        >
          <FaUserCircle
            className="
            relative
            text-[3.73333vw]
            mr-1
          "
          />

          <span className="text-[3.73333vw] leading-[2.2]">
            &nbsp;&nbsp;
            {userData?.userName || "Unknown User"}
          </span>
        </div>

        {/* Account Menu */}
        <div className="bg-[#ededed]">
          <ul className="m-0 mb-5 p-0 list-none">
            {menuItems
              .filter(
                (item) =>
                  item.name !== "Casino Balance" ||
                  (userData?.casinoBalance && userData?.casinoBalance !== 0),
              )
              .map((item, index, arr) => {
                const isLast = index === arr.length - 1;

                return item.name === "Casino Balance" ? (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={() => handleMenuClick(item)}
                    className="
                    flex
                    items-center
                    justify-between
                    w-full
                    no-underline
                    outline-none
                    relative
                    font-bold
                    leading-[1.6]
                    text-[#2789ce]
                    bg-white
                    border-b
                    border-[#e0e6e6]
                    box-border
                    px-[2.06667vw]
                    py-[2.13333vw]
                    pl-[2.66667vw]
                    min-h-[39.98px]
                  "
                  >
                    <span className="text-[15.72px] font-bold leading-[1.6]">
                      {item.name}
                    </span>

                    <div className="flex items-center">
                      <button
                        onClick={handlereCall}
                        disabled={isLoading}
                        className="
                        flex
                        items-center
                        gap-2
                        px-3
                        py-1
                        bg-gradient-to-r
                        from-[#2b6cb0]
                        to-[#4299e1]
                        text-white
                        font-medium
                        rounded
                        shadow
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                        aria-label={`Recall casino balance${
                          userData?.casinoBalance
                            ? ` of ${userData.casinoBalance.toFixed(0)}`
                            : ""
                        }`}
                      >
                        <PiCurrencyInrFill className="w-4 h-4" />

                        <span className="text-[13px]">Recall</span>

                        <span
                          className="
                          bg-white
                          text-[#2b6cb0]
                          px-2
                          py-0.5
                          rounded-full
                          text-[10px]
                          font-bold
                        "
                        >
                          {isLoading ? (
                            <svg
                              className="animate-spin h-4 w-4 text-[#2b6cb0]"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />

                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          ) : (
                            userData?.casinoBalance?.toFixed(0) || "0"
                          )}
                        </span>
                      </button>
                    </div>
                  </Link>
                ) : (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={() => handleMenuClick(item)}
                    className={`
                    flex
                    items-center
                    justify-between
                    w-full
                    no-underline
                    outline-none
                    relative
                    font-bold
                    leading-[1.6]
                    text-[#2789ce]
                    bg-white
                    border-b
                    border-[#e0e6e6]
                    box-border
                    px-[2.06667vw]
                    py-[2.13333vw]
                    pl-[2.66667vw]
                    min-h-[39.98px]
                    ${isLast ? "" : ""}
                  `}
                  >
                    {/* Original TXT:
                      font-size: 15.72px
                  */}
                    <span
                      className="
                      text-[15.72px]
                      font-bold
                      leading-[1.6]
                      text-[#2789ce]
                    "
                    >
                      {item.name}
                    </span>

                    {/* Original TXT:
                      width: 6.4vw
                      height: 6.4vw
                      border: 1px
                      border-radius: 1.06667vw
                  */}
                    <div
                      className="
                      flex
                      items-center
                      justify-center
                      shrink-0
                      w-[6.4vw]
                      h-[6.4vw]
                      border
                      border-[#1e1e1e]
                      bg-white
                      text-[#1e1e1e]
                      rounded-[1.06667vw]
                      relative
                      right-[1.5px]
                    "
                    >
                      <svg
                        className="w-[21px] h-[21px] text-[#1e1e1e]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                );
              })}
          </ul>
        </div>
      </div>

      {/* Original TXT Logout */}
      <div className="bg-[#ededed]">
        <button
          onClick={handleLogout}
          className="
          w-full
          bg-[linear-gradient(-180deg,#e93522_0%,#be2414_100%)]
          h-[12.8vw]
          border
          border-[#8a0011]
          border-x-0
          text-white
          text-[4.26667vw]
          font-bold
          mb-[5.33333vw]
          flex
          items-center
          justify-center
          text-center
        "
        >
          <span className="relative left-[2px]">LOGOUT</span>

          <FaSignOutAlt
            className="
            ml-2
            text-[#fafafa]
            text-[14px]
            relative
            right-[2.7px]
            bottom-[0.5px]
          "
          />
        </button>
      </div>
    </>
  );
};

export default Account;
