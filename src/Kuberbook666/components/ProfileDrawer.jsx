import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/userSlice";

const ProfileDrawer = ({
  isOpen,
  onClose,
  onOpenDeposit,
  onOpenWithdraw,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);

  const username =
    userData?.username || userData?.name || "wasimkhan";
  const phone =
    userData?.mobile || userData?.phone || "+91-8292463648";
  const balance =
    typeof userData?.availableBalance === "number"
      ? userData.availableBalance
      : typeof userData?.balance === "number"
      ? userData.balance
      : 0.0;
  const exposure =
    typeof userData?.exposure === "number" ? userData.exposure : 0.0;

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignOut = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onClose();
    navigate("/");
  };

  const handleLinkClick = (path) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right Drawer */}
      <div
        className="fixed transition-all ease-in-out openDrawerFromRight origin-left top-0 right-0 z-50 w-[78%] max-w-sm h-full overflow-y-auto bg-bg_Quaternary-side-right shadow-2xl select-none"
        role="dialog"
        aria-modal="true"
      >
        <ul className="overflow-y-auto h-max divide-y divide-white/10 dark:divide-white/10 divide-gray-200">
          {/* Header with User Mobile & Close Button */}
          <li className="px-3 py-2.5 flex items-center justify-between bg-black/10">
            <div className="flex items-center justify-start gap-x-1.5">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="var(--color-iconsColor, #c10931)"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z"></path>
                  <path d="M11 4h2"></path>
                  <path d="M12 17v.01"></path>
                </svg>
              </span>
              <span className="font-lato font-semibold text-sm xs:text-base text-text_Ternary-new">
                {username} ({phone})
              </span>
            </div>
            <button
              onClick={onClose}
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out active:scale-110 cursor-pointer p-1 rounded-full hover:bg-white/10"
              type="button"
              aria-label="Close Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
              >
                <path
                  d="M5.1875 16.5891L4.3125 15.7141L9.125 10.9016L4.3125 6.08905L5.1875 5.21405L10 10.0266L14.8125 5.21405L15.6875 6.08905L10.875 10.9016L15.6875 15.7141L14.8125 16.5891L10 11.7766L5.1875 16.5891Z"
                  fill="var(--color-ternary1, #9ca3af)"
                ></path>
              </svg>
            </button>
          </li>

          {/* Balance Information */}
          <li className="px-3 py-2 flex items-start justify-start flex-col gap-2">
            <div className="flex items-center justify-start gap-2.5">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="var(--color-iconsColor, #c10931)"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M3 21l18 0"></path>
                  <path d="M3 10l18 0"></path>
                  <path d="M5 6l7 -3l7 3"></path>
                  <path d="M4 10l0 11"></path>
                  <path d="M20 10l0 11"></path>
                  <path d="M8 14l0 3"></path>
                  <path d="M12 14l0 3"></path>
                  <path d="M16 14l0 3"></path>
                </svg>
              </span>
              <span className="font-lato font-semibold text-sm xs:text-base text-text_Ternary-new">
                Balance Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 w-full">
              <div className="flex w-full flex-col rounded items-start bg-bg_Ternary11 border border-white/10 dark:border-white/10 px-2 py-1 col-span-2">
                <span className="uppercase font-normal text-xxs text-gray-400">
                  Balance
                </span>
                <span className="font-lato text-sm font-medium text-text_Success">
                  {" "}
                  {Number(balance).toFixed(2)}
                </span>
              </div>
              <div className="flex w-full flex-col rounded items-start bg-bg_Ternary11 border border-white/10 dark:border-white/10 px-2 py-1 col-span-1">
                <span className="uppercase font-normal text-xxs text-gray-400">
                  Free Cash
                </span>
                <span className="font-lato text-sm font-medium text-text_Ternary-new">
                  0.00
                </span>
              </div>
              <div className="flex w-full flex-col rounded items-start bg-bg_Ternary11 border border-white/10 dark:border-white/10 px-2 py-1 col-span-1">
                <span className="uppercase font-normal text-xxs text-gray-400">
                  Net Exposure
                </span>
                <span className="font-lato text-sm font-medium text-text_Danger">
                  {" "}
                  {Number(exposure).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex col-span-2 items-center justify-center w-full mt-1">
              <div
                id="deposit_withdraw_btn"
                className="flex items-center justify-center w-full gap-2"
              >
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenDeposit) onOpenDeposit();
                  }}
                  className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex bg-none border-none shadow-none w-full cursor-pointer active:scale-95"
                  type="button"
                >
                  <span className="text-white capitalize border flex rounded px-3 py-1.5 flex-col text-[11px] hover:opacity-95 w-full font-semibold items-center justify-center bg-bg_HomeDepositBtnBgColor border-depositBtn shadow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="19"
                      viewBox="0 0 21 19"
                      fill="none"
                      stroke="#fff"
                      className="mb-0.5"
                    >
                      <path
                        d="M3.62143 4.52979C3.52275 4.52988 3.42507 4.54945 3.33397 4.58737C3.24287 4.62528 3.16014 4.68079 3.09054 4.75074C3.02094 4.82068 2.96584 4.90368 2.92837 4.99496C2.8909 5.08624 2.87181 5.18402 2.8722 5.28269C2.8724 5.48134 2.95139 5.67179 3.09185 5.81225C3.23232 5.95271 3.42278 6.03171 3.62143 6.03191H16.6423C17.4549 6.03191 18.0115 6.5801 18.0115 7.19078V8.50099C18.0111 8.59998 18.0303 8.69805 18.068 8.78958C18.1057 8.8811 18.1612 8.96425 18.2312 9.03424C18.3012 9.10424 18.3843 9.15969 18.4758 9.19739C18.5674 9.23508 18.6654 9.25429 18.7644 9.2539C18.8631 9.2538 18.9608 9.23424 19.0519 9.19632C19.143 9.1584 19.2257 9.10288 19.2953 9.03293C19.3649 8.96299 19.42 8.87999 19.4575 8.78871C19.4949 8.69743 19.514 8.59966 19.5136 8.50099V7.19078C19.5136 5.6859 18.1796 4.52979 16.6423 4.52979H3.62143Z"
                        fill="var(--color-quaternary, #ffffff)"
                      ></path>
                      <path
                        d="M16.6606 7.75177C15.5639 7.75177 14.6603 8.65906 14.6603 9.75583V11.2579C14.6603 12.3547 15.5639 13.262 16.6606 13.262H18.7459C19.8427 13.262 20.75 12.3547 20.75 11.2579V9.75583C20.75 8.65906 19.8427 7.75177 18.7459 7.75177H16.6606ZM16.6606 9.25389H18.7459C19.032 9.25389 19.2478 9.46966 19.2478 9.75583V11.2579C19.2478 11.5441 19.032 11.7599 18.7459 11.7599H16.6606C16.3745 11.7599 16.1587 11.5441 16.1587 11.2579V9.75583C16.1587 9.46966 16.3745 9.25389 16.6606 9.25389Z"
                        fill="var(--color-quaternary, #ffffff)"
                      ></path>
                    </svg>
                    deposit
                  </span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenWithdraw) onOpenWithdraw();
                    else navigate("/transactions");
                  }}
                  className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex bg-none border-none shadow-none w-full cursor-pointer active:scale-95"
                  type="button"
                >
                  <span className="text-white capitalize border border-gray-600 flex rounded px-3 py-1.5 flex-col text-[11px] hover:opacity-95 w-full font-semibold items-center justify-center bg-bg_HomeWithdrawBtnBgColor shadow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="19"
                      viewBox="0 0 21 19"
                      fill="none"
                      stroke="#fff"
                      className="mb-0.5"
                    >
                      <path
                        d="M3.11825 4.52979C3.01958 4.52988 2.92189 4.54945 2.8308 4.58737C2.7397 4.62528 2.65697 4.68079 2.58737 4.75074C2.51777 4.82068 2.46266 4.90368 2.42519 4.99496C2.38772 5.08624 2.36864 5.18402 2.36902 5.28269C2.36922 5.48134 2.44821 5.67179 2.58868 5.81225C2.72914 5.95271 2.91961 6.03171 3.11825 6.03191H16.1391C16.9517 6.03191 17.5083 6.5801 17.5083 7.19078V8.50099C17.5079 8.59998 17.5272 8.69805 17.5649 8.78958C17.6026 8.8811 17.658 8.96425 17.728 9.03425C17.798 9.10424 17.8811 9.15969 17.9727 9.19739C18.0642 9.23508 18.1623 9.25429 18.2612 9.2539C18.3599 9.2538 18.4576 9.23424 18.5487 9.19632C18.6398 9.1584 18.7225 9.10288 18.7921 9.03293C18.8617 8.96299 18.9168 8.87999 18.9543 8.78871C18.9918 8.69743 19.0108 8.59967 19.0105 8.50099V7.19078C19.0105 5.6859 17.6764 4.52979 16.1391 4.52979H3.11825Z"
                        fill="var(--color-quaternary, #ffffff)"
                      ></path>
                      <path
                        d="M16.1575 7.75177C15.0607 7.75177 14.1571 8.65906 14.1571 9.75583V11.2579C14.1571 12.3547 15.0607 13.262 16.1575 13.262H18.2427C19.3395 13.262 20.2468 12.3547 20.2468 11.2579V9.75583C20.2468 8.65906 19.3395 7.75177 18.2427 7.75177H16.1575ZM16.1575 9.25389H18.2427C18.5289 9.25389 18.7447 9.46966 18.7447 9.75583V11.2579C18.7447 11.5441 18.5289 11.7599 18.2427 11.7599H16.1575C15.8713 11.7599 15.6555 11.5441 15.6555 11.2579V9.75583C15.6555 9.46966 15.8713 9.25389 16.1575 9.25389Z"
                        fill="var(--color-quaternary, #ffffff)"
                      ></path>
                    </svg>
                    withdraw
                  </span>
                </button>
              </div>
            </div>
          </li>

          <div className="flex flex-wrap p-1 w-full gap-2 items-center justify-center font-roboto"></div>

          {/* Bonus Information */}
          <li className="px-3 py-2 flex items-start justify-start flex-col gap-2">
            <div className="flex items-center justify-start gap-x-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="var(--color-iconsColor, #c10931)"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="bonusInformation"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"></path>
                <path d="M12 8l0 13"></path>
                <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7"></path>
                <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5"></path>
              </svg>
              <span className="font-lato font-semibold text-sm xs:text-base text-text_Ternary-new">
                Bonus Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 w-full">
              <div className="flex w-full col-span-1 flex-col rounded items-start bg-[#f2f2f2] dark:bg-[#1f2330] border border-white/10 px-2 py-1">
                <span className="uppercase font-normal text-xxs text-gray-500">
                  Bonus Balance
                </span>
                <span className="font-lato text-sm text-text_Ternary-new font-semibold">
                  0
                </span>
              </div>
              <div className="flex w-full col-span-1 flex-col rounded items-start bg-[#f2f2f2] dark:bg-[#1f2330] border border-white/10 px-2 py-1">
                <span className="uppercase font-normal text-xxs text-gray-500">
                  Net Exposure
                </span>
                <span className="font-lato text-sm text-text_Danger font-semibold">
                  0.00
                </span>
              </div>
              <div className="flex w-full col-span-2 flex-col rounded items-start bg-[#f2f2f2] dark:bg-[#1f2330] border border-white/10 px-2 py-1">
                <button
                  className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex bg-none border-none shadow-none w-full cursor-pointer active:scale-98"
                  type="button"
                >
                  <span className="text-white capitalize border flex rounded px-3 py-1 flex-row text-[10px] hover:opacity-100 w-full font-semibold items-center justify-center gap-1.5 bg-bg_HomeDepositBtnBgColor border-depositBtn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="#ffffff"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"></path>
                      <path d="M12 8l0 13"></path>
                      <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7"></path>
                      <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5"></path>
                    </svg>
                    LOCKED BONUS: 0
                  </span>
                </button>
              </div>
            </div>
          </li>

          {/* Help & Support */}
          <li className="divide-y divide-white/10 dark:divide-white/10 flex items-start justify-start flex-col">
            <span className="font-lato font-semibold px-3 py-1.5 w-full bg-black/15 text-xs xs:text-sm text-text_Ternary-new">
              Help &amp; Support
            </span>
            <div className="divide-y divide-white/10 dark:divide-white/10 pl-5 flex items-start justify-start w-full flex-col">
              <div className="w-full">
                <a
                  href="https://api.whatsapp.com/send/?phone=16093083535&text=Hi&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full"
                >
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80">
                    <span className="w-5 h-auto text-red-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-iconsColor, #c10931)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 9h8"></path>
                        <path d="M8 13h6"></path>
                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"></path>
                      </svg>
                    </span>
                    <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                      Chat With Us
                    </span>
                  </div>
                </a>
              </div>
              <div className="w-full">
                <div
                  onClick={() => alert("Downloading KuberBook APK...")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
                      <path d="M7 11l5 5l5 -5"></path>
                      <path d="M12 4l0 12"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Download APK
                  </span>
                </div>
              </div>
            </div>
          </li>

          {/* Statements */}
          <li className="divide-y divide-white/10 dark:divide-white/10 flex items-start justify-start flex-col">
            <span className="font-lato text-text_Ternary-new font-semibold px-3 py-1.5 w-full bg-black/15 text-xs xs:text-sm">
              Statements
            </span>
            <div className="divide-y divide-white/10 dark:divide-white/10 pl-5 flex items-start justify-start w-full flex-col">
              {/* Affiliate (Refer & Earn) */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/affiliate")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 21 21"
                      fill="none"
                    >
                      <path
                        d="M5.41956 2.33087C5.53248 2.22009 5.68648 2.15784 5.84691 2.15784C6.00735 2.15784 6.16119 2.22025 6.27427 2.33102L8.05331 4.07541C8.17108 4.19077 8.32744 4.2544 8.49336 4.2544C8.61977 4.2544 11.6435 4.2544 12.1735 4.2544C12.3395 4.2544 12.4957 4.19077 12.6146 4.0745L14.3624 2.36917C14.4754 2.25885 14.6289 2.1969 14.7889 2.1969C14.789 2.1969 14.7893 2.1969 14.7895 2.1969C14.9498 2.19705 15.1033 2.25946 15.2162 2.37009L20.4208 7.47141C20.6543 7.7003 20.6539 8.06971 20.4197 8.29814L18.927 9.75322C18.6443 10.0305 18.4886 10.3993 18.4886 10.7919C18.4886 11.2999 18.3421 11.7857 18.0698 12.2042C18.6623 12.9052 18.6241 13.9492 17.9544 14.6055C17.6302 14.9234 17.2057 15.1071 16.7504 15.1287C16.7296 15.5572 16.5527 15.9796 16.2196 16.306C15.8954 16.6238 15.4709 16.8075 15.0155 16.8292C14.9948 17.2577 14.8177 17.68 14.4848 18.0064C13.9605 18.5203 13.2082 18.6499 12.5729 18.4279C12.4854 18.6738 12.3417 18.9045 12.1416 19.1006C11.4267 19.8016 10.2672 19.8018 9.5521 19.1006L9.29788 18.8516C9.13902 18.6958 9.01591 18.518 8.92809 18.3284C8.21688 18.9398 7.12066 18.9262 6.42764 18.2469C6.09454 17.9205 5.91764 17.4981 5.89694 17.0697C5.44167 17.0482 5.01699 16.8643 4.69282 16.5464C4.35972 16.2201 4.18283 15.7977 4.16197 15.3692C3.70686 15.3477 3.28217 15.1638 2.95801 14.8462C2.29212 14.1935 2.25025 13.1573 2.83239 12.4563C2.40817 11.8748 2.17842 11.1807 2.17842 10.4518C2.17842 10.281 2.10801 10.1141 1.98521 9.9937L0.214951 8.25785C-0.0180931 8.02943 -0.0180931 7.66078 0.214951 7.43235L5.41956 2.33087Z"
                        fill="var(--icon-color-brand-secondary, #c10931)"
                      ></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Affiliate (Refer &amp; Earn)
                  </span>
                </div>
              </div>

              {/* Refer and Earn */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/refer-earn")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                      <path d="M9 7l1 0"></path>
                      <path d="M9 13l6 0"></path>
                      <path d="M13 17l2 0"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Refer and Earn
                  </span>
                </div>
              </div>

              {/* Transactions */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/transactions")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M11 16h10"></path>
                      <path d="M11 16l4 4"></path>
                      <path d="M11 16l4 -4"></path>
                      <path d="M13 8h-10"></path>
                      <path d="M13 8l-4 4"></path>
                      <path d="M13 8l-4 -4"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Transactions
                  </span>
                </div>
              </div>

              {/* Bonuses */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/bonuses")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"></path>
                      <path d="M12 8l0 13"></path>
                      <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7"></path>
                      <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Bonuses
                  </span>
                </div>
              </div>

              {/* Open Bets */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/open-bets")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M17.8 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z"></path>
                      <path d="M6.2 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z"></path>
                      <path d="M12 9.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Open Bets
                  </span>
                </div>
              </div>

              {/* Betting Profit & Loss */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/betting-profit-loss")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M4 6m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path>
                      <path d="M6 4l0 2"></path>
                      <path d="M6 11l0 9"></path>
                      <path d="M10 14m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path>
                      <path d="M12 4l0 10"></path>
                      <path d="M12 19l0 1"></path>
                      <path d="M16 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path>
                      <path d="M18 4l0 1"></path>
                      <path d="M18 11l0 9"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Betting Profit &amp; Loss
                  </span>
                </div>
              </div>

              {/* Account Statement */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/account-statement")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                      <path d="M9 7l1 0"></path>
                      <path d="M9 13l6 0"></path>
                      <path d="M13 17l2 0"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Account Statement
                  </span>
                </div>
              </div>

              {/* Bonus Statement */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/bonus-statement")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"></path>
                      <path d="M12 8l0 13"></path>
                      <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7"></path>
                      <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Bonus Statement
                  </span>
                </div>
              </div>

              {/* Bonus Rules */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/bonus-rules")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path>
                      <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path>
                      <path d="M9 12h6"></path>
                      <path d="M9 16h6"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Bonus Rules
                  </span>
                </div>
              </div>

              {/* Transfer Statement */}
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/transfer-statement")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M4 21v-4a3 3 0 0 1 3 -3h5"></path>
                      <path d="M9 17l3 -3l-3 -3"></path>
                      <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                      <path d="M5 11v-6a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-9.5"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Transfer Statement
                  </span>
                </div>
              </div>
            </div>
          </li>

          {/* Account Settings */}
          <li className="divide-y divide-white/10 dark:divide-white/10 flex items-start justify-start flex-col">
            <span className="font-lato font-semibold text-text_Ternary-new px-3 py-1.5 w-full bg-black/15 text-xs xs:text-sm">
              Account Settings
            </span>
            <div className="divide-y divide-white/10 dark:divide-white/10 pl-5 flex items-start justify-start w-full flex-col">
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/time-setting")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M10.5 21h-4.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v3"></path>
                      <path d="M16 3v4"></path>
                      <path d="M8 3v4"></path>
                      <path d="M4 11h10"></path>
                      <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
                      <path d="M18 16.5v1.5l.5 .5"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Time Settings
                  </span>
                </div>
              </div>
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/settings")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
                      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Settings
                  </span>
                </div>
              </div>
            </div>
          </li>

          {/* Account Actions */}
          <li className="divide-y divide-white/10 dark:divide-white/10 flex items-start justify-start flex-col">
            <span className="font-lato text-text_Ternary-new font-semibold px-3 py-1.5 w-full bg-black/15 text-xs xs:text-sm">
              Account actions
            </span>
            <div className="divide-y divide-white/10 dark:divide-white/10 pl-5 flex items-start justify-start w-full flex-col">
              <div className="w-full">
                <div
                  onClick={() => handleLinkClick("/change-password")}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"></path>
                      <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
                      <path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Change Password
                  </span>
                </div>
              </div>
              <div className="w-full">
                <div
                  onClick={handleSignOut}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2.5 cursor-pointer hover:opacity-80 text-red-400 hover:text-red-300"
                >
                  <span className="w-5 h-auto text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor, #c10931)"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"></path>
                      <path d="M9 12h12l-3 -3"></path>
                      <path d="M18 15l3 -3"></path>
                    </svg>
                  </span>
                  <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                    Sign Out
                  </span>
                </div>
              </div>
            </div>
          </li>

          {/* Footer note */}
          <li className="px-3 py-3 flex items-center justify-start gap-x-2 flex-col">
            <span className="flex text-center text-text_Primary-new text-sm xs:text-base font-medium justify-center text-white/80">
              Register online and play online
            </span>
          </li>
          <li className="p-2"></li>
        </ul>
      </div>
    </>
  );
};

export default ProfileDrawer;
