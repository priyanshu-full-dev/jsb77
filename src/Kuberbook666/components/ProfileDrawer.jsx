import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/userSlice";

const ProfileDrawer = ({ isOpen, onClose, onOpenDeposit, onOpenWithdraw }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);
  const exposureBalance = useSelector((state) => state?.user?.exposureBalance);

  const username = userData?.username || userData?.name || "wasimkhan";
  const phone = userData?.mobile || userData?.phone || "+91-8292463648";
  const balance =
    typeof userData?.availableBalance === "number"
      ? userData.availableBalance
      : typeof userData?.balance === "number"
        ? userData.balance
        : 0.0;
  const exposure =
    typeof exposureBalance === "number"
      ? exposureBalance
      : typeof userData?.exposure === "number"
        ? userData.exposure
        : 0.0;

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

  const handleDepositClick = () => {
    onClose();
    if (onOpenDeposit) {
      onOpenDeposit();
    } else {
      navigate("/transactions");
    }
  };

  const handleWithdrawClick = () => {
    onClose();
    if (onOpenWithdraw) {
      onOpenWithdraw();
    } else {
      navigate("/transactions");
    }
  };

  const handleLinkClick = () => {
    onClose();
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
      <div className="fixed transition-all ease-in-out openDrawerFromRight origin-left top-0 right-0 z-50 w-[70%] max-w-sm h-full overflow-y-auto bg-bg_Quaternary-side-right shadow-lg">
        <ul className="overflow-y-auto h-max divide-y">
          {/* User Mobile & Close Button */}
          <li className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center justify-start gap-x-1.5">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="var(--color-iconsColor)"
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
              <span className="font-lato-bold font-semibold text-sm xs:text-base text-text_Ternary-new">
                {username} ({phone})
              </span>
            </div>
            <button
              onClick={onClose}
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out active:scale-105 cursor-pointer"
              type="button"
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
                  fill="var(--color-ternary1)"
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
                  stroke="var(--color-iconsColor)"
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
              <span className="font-lato-bold font-semibold text-sm xs:text-base text-text_Ternary-new">
                Balance Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-0.5 w-full">
              <div className="flex w-full flex-col rounded items-start bg-bg_Ternary11 border px-2 py-1 col-span-2">
                <span className="uppercase font-normal text-[8px]">
                  Balance
                </span>
                <span className="font-lato text-sm font-medium text-text_Success">
                  {" "}
                  {typeof balance === "number" ? balance.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex w-full flex-col rounded items-start bg-bg_Ternary11 border px-2 py-1 col-span-1">
                <span className="uppercase font-normal text-[8px]">
                  Free Cash
                </span>
                <span className="font-lato text-sm font-medium text-gray-900">
                  {typeof balance === "number" ? balance.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex w-full flex-col rounded items-start bg-bg_Ternary11 border px-2 py-1 col-span-1">
                <span className="uppercase font-normal text-[8px]">
                  Net Exposure
                </span>
                <span className="font-lato text-sm font-medium text-text_Danger">
                  {" "}
                  {typeof exposure === "number" ? exposure.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
            <div className="flex col-span-2 items-center justify-center w-full">
              <div
                id="deposit_withdraw_btn"
                className="flex items-center justify-center w-full gap-1"
              >
                <button
                  onClick={handleDepositClick}
                  className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex bg-none border-none shadow-none w-full cursor-pointer"
                  type="button"
                >
                  <span className="text-white capitalize border flex rounded px-3 py-1 flex-col text-[10px] hover:opacity-100 w-full font-semibold items-center justify-center bg-bg_HomeDepositBtnBgColor">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="19"
                      viewBox="0 0 21 19"
                      fill="none"
                      stroke="#fff"
                    >
                      <path
                        d="M3.62143 4.52979C3.52275 4.52988 3.42507 4.54945 3.33397 4.58737C3.24287 4.62528 3.16014 4.68079 3.09054 4.75074C3.02094 4.82068 2.96584 4.90368 2.92837 4.99496C2.8909 5.08624 2.87181 5.18402 2.8722 5.28269C2.8724 5.48134 2.95139 5.67179 3.09185 5.81225C3.23232 5.95271 3.42278 6.03171 3.62143 6.03191H16.6423C17.4549 6.03191 18.0115 6.5801 18.0115 7.19078V8.50099C18.0111 8.59998 18.0303 8.69805 18.068 8.78958C18.1057 8.8811 18.1612 8.96425 18.2312 9.03424C18.3012 9.10424 18.3843 9.15969 18.4758 9.19739C18.5674 9.23508 18.6654 9.25429 18.7644 9.2539C18.8631 9.2538 18.9608 9.23424 19.0519 9.19632C19.143 9.1584 19.2257 9.10288 19.2953 9.03293C19.3649 8.96299 19.42 8.87999 19.4575 8.78871C19.4949 8.69743 19.514 8.59966 19.5136 8.50099V7.19078C19.5136 5.6859 18.1796 4.52979 16.6423 4.52979H3.62143Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M16.6606 7.75177C15.5639 7.75177 14.6603 8.65906 14.6603 9.75583V11.2579C14.6603 12.3547 15.5639 13.262 16.6606 13.262H18.7459C19.8427 13.262 20.75 12.3547 20.75 11.2579V9.75583C20.75 8.65906 19.8427 7.75177 18.7459 7.75177H16.6606ZM16.6606 9.25389H18.7459C19.032 9.25389 19.2478 9.46966 19.2478 9.75583V11.2579C19.2478 11.5441 19.032 11.7599 18.7459 11.7599H16.6606C16.3745 11.7599 16.1587 11.5441 16.1587 11.2579V9.75583C16.1587 9.46966 16.3745 9.25389 16.6606 9.25389Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M10.2315 13.0663C10.0329 13.0665 9.84242 13.1455 9.70195 13.286C9.56149 13.4265 9.4825 13.6169 9.4823 13.8156V17.7499C9.4825 17.9485 9.56149 18.139 9.70195 18.2794C9.84242 18.4199 10.0329 18.4989 10.2315 18.4991C10.4302 18.4989 10.6206 18.4199 10.7611 18.2794C10.9015 18.139 10.9805 17.9485 10.9807 17.7499V13.8156C10.9805 13.6169 10.9015 13.4265 10.7611 13.286C10.6206 13.1455 10.4302 13.0665 10.2315 13.0663Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M10.2315 13.0663C10.1327 13.0664 10.0348 13.086 9.94364 13.124C9.85243 13.162 9.76964 13.2177 9.70001 13.2878L7.72179 15.2771C7.58156 15.4177 7.50281 15.6081 7.50281 15.8067C7.50281 16.0053 7.58156 16.1957 7.72179 16.3363C7.79147 16.4063 7.8743 16.4619 7.9655 16.4997C8.05671 16.5376 8.15449 16.5571 8.25325 16.5571C8.35201 16.5571 8.44981 16.5376 8.54101 16.4997C8.63221 16.4619 8.71503 16.4063 8.78471 16.3363L10.7629 14.347C10.8327 14.2771 10.8879 14.1941 10.9255 14.1027C10.9631 14.0114 10.9822 13.9135 10.9819 13.8148C10.9815 13.716 10.9617 13.6183 10.9234 13.5272C10.8852 13.4361 10.8294 13.3535 10.7592 13.2841C10.6188 13.1448 10.4292 13.0665 10.2315 13.0663Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M10.2353 13.0664C10.1367 13.0659 10.0391 13.085 9.94786 13.1223C9.85667 13.1597 9.77374 13.2147 9.70381 13.2841C9.63357 13.3535 9.57774 13.4361 9.53952 13.5272C9.5013 13.6183 9.48143 13.716 9.48108 13.8148C9.48073 13.9135 9.4999 14.0114 9.53747 14.1027C9.57504 14.1941 9.63028 14.2771 9.70002 14.347L11.6783 16.3363C11.7479 16.4063 11.8308 16.4619 11.922 16.4998C12.0132 16.5376 12.111 16.5571 12.2097 16.5571C12.3085 16.5571 12.4063 16.5376 12.4975 16.4998C12.5887 16.4619 12.6715 16.4063 12.7412 16.3363C12.8819 16.1962 12.9614 16.0061 12.9621 15.8075C12.9628 15.6089 12.8847 15.4182 12.745 15.2771L10.763 13.2878C10.6233 13.1471 10.4335 13.0675 10.2353 13.0664Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M1.49923 2.62171C1.30058 2.6219 1.11013 2.70089 0.96967 2.84135C0.829205 2.98181 0.750198 3.17227 0.75 3.37091V13.8747C0.75 15.3796 2.08406 16.532 3.6214 16.532H5.75093C5.94957 16.5318 6.14003 16.4528 6.28049 16.3123C6.42095 16.1719 6.49995 15.9814 6.50015 15.7828C6.49995 15.5841 6.42095 15.3937 6.28049 15.2532C6.14003 15.1128 5.94957 15.0338 5.75093 15.0336H3.6214C2.8088 15.0336 2.25214 14.4854 2.25214 13.8747V3.37091C2.25204 3.27224 2.23247 3.17456 2.19455 3.08347C2.15664 2.99237 2.10113 2.90965 2.03118 2.84005C1.96124 2.77045 1.87824 2.71533 1.78696 2.67786C1.69568 2.6404 1.5979 2.62132 1.49923 2.62171ZM18.7644 11.7599C18.6654 11.7595 18.5673 11.7787 18.4758 11.8164C18.3843 11.8541 18.3011 11.9096 18.2311 11.9795C18.1611 12.0495 18.1057 12.1327 18.068 12.2242C18.0303 12.3157 18.0111 12.4138 18.0115 12.5128V13.8747C18.0115 14.4854 17.4548 15.0336 16.6422 15.0336H14.7489C14.5503 15.0338 14.3598 15.1128 14.2193 15.2532C14.0789 15.3937 13.9999 15.5841 13.9997 15.7828C13.9999 15.9814 14.0789 16.1719 14.2193 16.3123C14.3598 16.4528 14.5503 16.5318 14.7489 16.532H16.6422C18.1796 16.532 19.5136 15.3796 19.5136 13.8747V12.5128C19.514 12.4141 19.4949 12.3164 19.4574 12.2251C19.42 12.1338 19.3649 12.0508 19.2953 11.9809C19.2257 11.9109 19.1429 11.8554 19.0518 11.8175C18.9608 11.7796 18.8631 11.76 18.7644 11.7599Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M3.6214 0.713562C2.08514 0.713543 0.75 1.86619 0.75 3.37088C0.75 4.87556 2.08514 6.03188 3.6214 6.03188C3.82005 6.03168 4.01049 5.95269 4.15095 5.81223C4.29141 5.67177 4.37041 5.48131 4.37061 5.28267C4.37099 5.184 4.35191 5.08622 4.31444 4.99493C4.27697 4.90365 4.22186 4.82067 4.15226 4.75073C4.08266 4.68078 3.99994 4.62526 3.90885 4.58734C3.81775 4.54942 3.72008 4.52986 3.6214 4.52976C2.81475 4.52976 2.25214 3.97492 2.25214 3.37088C2.25214 2.76683 2.81475 2.21197 3.6214 2.21199H14.963C15.4851 2.21199 15.893 2.61991 15.893 3.14205V5.28267C15.8932 5.48131 15.9722 5.67177 16.1127 5.81223C16.2531 5.95269 16.4436 6.03168 16.6422 6.03188C16.7409 6.03227 16.8387 6.01318 16.93 5.97571C17.0212 5.93825 17.1042 5.88314 17.1742 5.81354C17.2441 5.74394 17.2996 5.66122 17.3376 5.57012C17.3755 5.47903 17.395 5.38134 17.3951 5.28267V3.14205C17.3951 1.8093 16.2957 0.713562 14.963 0.713562H3.6214Z"
                        fill="var(--color-quaternary)"
                      ></path>
                    </svg>
                    deposit
                  </span>
                </button>
                <button
                  onClick={handleWithdrawClick}
                  className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex bg-none border-none shadow-none w-full cursor-pointer"
                  type="button"
                >
                  <span className="text-white capitalize border flex rounded px-3 py-1 flex-col text-[10px] hover:opacity-100 w-full font-semibold items-center justify-center bg-bg_HomeWithdrawBtnBgColor">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="19"
                      viewBox="0 0 21 19"
                      fill="none"
                      stroke="#fff"
                    >
                      <path
                        d="M3.11825 4.52979C3.01958 4.52988 2.92189 4.54945 2.8308 4.58737C2.7397 4.62528 2.65697 4.68079 2.58737 4.75074C2.51777 4.82068 2.46266 4.90368 2.42519 4.99496C2.38772 5.08624 2.36864 5.18402 2.36902 5.28269C2.36922 5.48134 2.44821 5.67179 2.58868 5.81225C2.72914 5.95271 2.91961 6.03171 3.11825 6.03191H16.1391C16.9517 6.03191 17.5083 6.5801 17.5083 7.19078V8.50099C17.5079 8.59998 17.5272 8.69805 17.5649 8.78958C17.6026 8.8811 17.658 8.96425 17.728 9.03425C17.798 9.10424 17.8811 9.15969 17.9727 9.19739C18.0642 9.23508 18.1623 9.25429 18.2612 9.2539C18.3599 9.2538 18.4576 9.23424 18.5487 9.19632C18.6398 9.1584 18.7225 9.10288 18.7921 9.03293C18.8617 8.96299 18.9168 8.87999 18.9543 8.78871C18.9918 8.69743 19.0108 8.59967 19.0105 8.50099V7.19078C19.0105 5.6859 17.6764 4.52979 16.1391 4.52979H3.11825Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M16.1575 7.75177C15.0607 7.75177 14.1571 8.65906 14.1571 9.75583V11.2579C14.1571 12.3547 15.0607 13.262 16.1575 13.262H18.2427C19.3395 13.262 20.2468 12.3547 20.2468 11.2579V9.75583C20.2468 8.65906 19.3395 7.75177 18.2427 7.75177H16.1575ZM16.1575 9.25389H18.2427C18.5289 9.25389 18.7447 9.46966 18.7447 9.75583V11.2579C18.7447 11.5441 18.5289 11.7599 18.2427 11.7599H16.1575C15.8713 11.7599 15.6555 11.5441 15.6555 11.2579V9.75583C15.6555 9.46966 15.8713 9.25389 16.1575 9.25389Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M9.73015 18.4992C9.9288 18.499 10.1193 18.42 10.2597 18.2796C10.4002 18.1391 10.4792 17.9486 10.4794 17.75L10.4794 13.8157C10.4792 13.617 10.4002 13.4266 10.2597 13.2861C10.1193 13.1457 9.9288 13.0667 9.73016 13.0665C9.53151 13.0667 9.34106 13.1457 9.2006 13.2861C9.06013 13.4266 8.98114 13.617 8.98094 13.8157L8.98094 17.75C8.98114 17.9486 9.06013 18.1391 9.2006 18.2796C9.34106 18.42 9.53151 18.499 9.73015 18.4992Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M9.7302 18.4992C9.82901 18.4991 9.92683 18.4795 10.018 18.4415C10.1092 18.4035 10.192 18.3479 10.2617 18.2778L12.2399 16.2885C12.3801 16.1479 12.4589 15.9574 12.4589 15.7589C12.4589 15.5603 12.3801 15.3698 12.2399 15.2292C12.1702 15.1592 12.0874 15.1037 11.9962 15.0658C11.905 15.0279 11.8072 15.0084 11.7084 15.0084C11.6097 15.0084 11.5119 15.0279 11.4207 15.0658C11.3295 15.1037 11.2466 15.1592 11.177 15.2292L9.19874 17.2185C9.12899 17.2885 9.07376 17.3715 9.03619 17.4628C8.99861 17.5542 8.97945 17.652 8.9798 17.7508C8.98015 17.8495 9.00001 17.9473 9.03823 18.0383C9.07645 18.1294 9.13227 18.212 9.20251 18.2815C9.34285 18.4208 9.53244 18.499 9.7302 18.4992Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M9.7264 18.4992C9.82495 18.4996 9.92262 18.4806 10.0138 18.4432C10.105 18.4059 10.1879 18.3509 10.2579 18.2814C10.3281 18.212 10.3839 18.1294 10.4222 18.0383C10.4604 17.9473 10.4802 17.8495 10.4806 17.7508C10.4809 17.652 10.4618 17.5542 10.4242 17.4628C10.3866 17.3715 10.3314 17.2885 10.2617 17.2185L8.28341 15.2292C8.21373 15.1592 8.13092 15.1037 8.03971 15.0658C7.94851 15.0279 7.85071 15.0084 7.75195 15.0084C7.65319 15.0084 7.55539 15.0279 7.46419 15.0658C7.37299 15.1037 7.29017 15.1592 7.22049 15.2292C7.07976 15.3693 7.00032 15.5595 6.99961 15.7581C6.9989 15.9566 7.07698 16.1474 7.21671 16.2885L9.19862 18.2778C9.33835 18.4184 9.52812 18.4981 9.7264 18.4992Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M0.996056 2.62171C0.797411 2.6219 0.606961 2.70089 0.466496 2.84135C0.326031 2.98181 0.247024 3.17227 0.246826 3.37091V13.8747C0.246826 15.3796 1.58089 16.532 3.11823 16.532H5.24776C5.4464 16.5318 5.63686 16.4528 5.77732 16.3123C5.91778 16.1719 5.99678 15.9814 5.99697 15.7828C5.99678 15.5841 5.91778 15.3937 5.77732 15.2532C5.63686 15.1128 5.4464 15.0338 5.24776 15.0336H3.11823C2.30563 15.0336 1.74896 14.4854 1.74896 13.8747V3.37091C1.74886 3.27224 1.7293 3.17456 1.69138 3.08347C1.65346 2.99237 1.59795 2.90965 1.52801 2.84005C1.45807 2.77045 1.37507 2.71533 1.28379 2.67786C1.19251 2.6404 1.09473 2.62132 0.996056 2.62171ZM18.2612 11.7599C18.1622 11.7595 18.0642 11.7787 17.9726 11.8164C17.8811 11.8541 17.798 11.9096 17.728 11.9795C17.658 12.0495 17.6025 12.1327 17.5648 12.2242C17.5271 12.3157 17.5079 12.4138 17.5083 12.5128V13.8747C17.5083 14.4854 16.9517 15.0336 16.1391 15.0336H14.2457C14.0471 15.0338 13.8566 15.1128 13.7162 15.2532C13.5757 15.3937 13.4967 15.5841 13.4965 15.7828C13.4967 15.9814 13.5757 16.1719 13.7162 16.3123C13.8566 16.4528 14.0471 16.5318 14.2457 16.532H16.1391C17.6764 16.532 19.0104 15.3796 19.0104 13.8747V12.5128C19.0108 12.4141 18.9917 12.3164 18.9543 12.2251C18.9168 12.1338 18.8617 12.0508 18.7921 11.9809C18.7225 11.9109 18.6398 11.8554 18.5487 11.8175C18.4576 11.7796 18.3599 11.76 18.2612 11.7599Z"
                        fill="var(--color-quaternary)"
                      ></path>
                      <path
                        d="M3.11823 0.713562C1.58197 0.713543 0.246826 1.86619 0.246826 3.37088C0.246826 4.87556 1.58197 6.03188 3.11823 6.03188C3.31687 6.03168 3.50732 5.95269 3.64778 5.81223C3.78824 5.67177 3.86723 5.48131 3.86743 5.28267C3.86782 5.184 3.84873 5.08622 3.81126 4.99494C3.7738 4.90365 3.71869 4.82067 3.64909 4.75073C3.57949 4.68078 3.49677 4.62526 3.40567 4.58734C3.31458 4.54942 3.2169 4.52986 3.11823 4.52976C2.31158 4.52976 1.74896 3.97492 1.74896 3.37088C1.74896 2.76683 2.31158 2.21197 3.11823 2.21199H14.4598C14.9819 2.21199 15.3898 2.61991 15.3898 3.14205V5.28267C15.39 5.48131 15.4691 5.67177 15.6095 5.81223C15.75 5.95269 15.9404 6.03168 16.1391 6.03188C16.2377 6.03227 16.3355 6.01318 16.4268 5.97571C16.5181 5.93825 16.6011 5.88314 16.671 5.81354C16.7409 5.74394 16.7965 5.66122 16.8344 5.57012C16.8723 5.47903 16.8919 5.38134 16.892 5.28267V3.14205C16.892 1.8093 15.7925 0.713562 14.4598 0.713562H3.11823Z"
                        fill="var(--color-quaternary)"
                      ></path>
                    </svg>
                    withdraw
                  </span>
                </button>
              </div>
            </div>
          </li>

          {/* Spacer */}
          <div className="flex flex-wrap p-2 w-full gap-2 items-center justify-center font-roboto"></div>

          {/* Bonus Information */}
          <li className="px-3 py-2 flex items-start justify-start flex-col gap-2">
            <div className="flex items-center justify-start gap-x-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="var(--color-iconsColor)"
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
              <span className="font-lato-bold font-semibold text-sm xs:text-base text-text_Ternary-new">
                Bonus Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-0.5 w-full">
              <div className="flex w-full col-span-1 flex-col rounded items-start bg-[#f2f2f2] border px-2 py-1">
                <span className="uppercase font-normal text-[8px]">
                  Bonus Balance
                </span>
                <span className="font-lato text-sm text-text_color_ternary">
                  0
                </span>
              </div>
              <div className="flex w-full col-span-1 flex-col rounded items-start bg-[#f2f2f2] border px-2 py-1">
                <span className="uppercase font-normal text-[8px]">
                  Net Exposure
                </span>
                <span className="font-lato text-sm text-text_color_danger">
                  0.00
                </span>
              </div>
              <div className="flex w-full col-span-1 flex-col rounded items-start bg-[#f2f2f2] border px-2 py-1 col-span-2">
                <button
                  className="leading-normal relative overflow-hidden transition duration-150 ease-in-out flex bg-none border-none shadow-none w-full cursor-pointer"
                  type="button"
                >
                  <span className="text-white capitalize border flex rounded px-3 py-1 flex-col text-[10px] hover:opacity-100 w-full font-semibold items-center justify-center bg-bg_HomeDepositBtnBgColor">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="red"
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
          <li className="divide-y flex items-start justify-start flex-col">
            <span className="font-lato-bold font-semibold px-3 py-1 w-full bg-border-[#d1d1d1] text-xs xs:text-sm text-text_Ternary-new">
              Help &amp; Support
            </span>
            <div className="divide-y pl-5 flex items-start justify-start w-full flex-col">
              <div className="w-full border-[#d1d1d1]">
                <a
                  href="https://api.whatsapp.com/send/?phone=16093083535&text=Hi&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-iconsColor)"
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
              <div className="w-full border-[#d1d1d1]">
                <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                  <span className="w-4 h-auto xs:w-5 text-text_Primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor)"
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
          <li className="divide-y flex items-start justify-start flex-col">
            <span className="font-lato-bold text-text_Ternary-new font-semibold px-3 py-1 w-full border-[#d1d1d1] text-xs xs:text-sm">
              Statements
            </span>
            <div className="divide-y pl-5 flex items-start justify-start w-full flex-col">
              {/* Affiliate */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/affiliate" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 21 21"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_2_27154_pd)">
                          <path
                            d="M5.41956 2.33087C5.53248 2.22009 5.68648 2.15784 5.84691 2.15784C6.00735 2.15784 6.16119 2.22025 6.27427 2.33102L8.05331 4.07541C8.17108 4.19077 8.32744 4.2544 8.49336 4.2544C8.61977 4.2544 11.6435 4.2544 12.1735 4.2544C12.3395 4.2544 12.4957 4.19077 12.6146 4.0745L14.3624 2.36917C14.4754 2.25885 14.6289 2.1969 14.7889 2.1969C14.789 2.1969 14.7893 2.1969 14.7895 2.1969C14.9498 2.19705 15.1033 2.25946 15.2162 2.37009L20.4208 7.47141C20.6543 7.7003 20.6539 8.06971 20.4197 8.29814L18.927 9.75322C18.6443 10.0305 18.4886 10.3993 18.4886 10.7919C18.4886 11.2999 18.3421 11.7857 18.0698 12.2042C18.6623 12.9052 18.6241 13.9492 17.9544 14.6055C17.6302 14.9234 17.2057 15.1071 16.7504 15.1287C16.7296 15.5572 16.5527 15.9796 16.2196 16.306C15.8954 16.6238 15.4709 16.8075 15.0155 16.8292C14.9948 17.2577 14.8177 17.68 14.4848 18.0064C13.9605 18.5203 13.2082 18.6499 12.5729 18.4279C12.4854 18.6738 12.3417 18.9045 12.1416 19.1006C11.4267 19.8016 10.2672 19.8018 9.5521 19.1006L9.29788 18.8516C9.13902 18.6958 9.01591 18.518 8.92809 18.3284C8.21688 18.9398 7.12066 18.9262 6.42764 18.2469C6.09454 17.9205 5.91764 17.4981 5.89694 17.0697C5.44167 17.0482 5.01699 16.8643 4.69282 16.5464C4.35972 16.2201 4.18283 15.7977 4.16197 15.3692C3.70686 15.3477 3.28217 15.1638 2.95801 14.8462C2.29212 14.1935 2.25025 13.1573 2.83239 12.4563C2.40817 11.8748 2.17842 11.1807 2.17842 10.4518C2.17842 10.281 2.10801 10.1141 1.98521 9.9937L0.214951 8.25785C-0.0180931 8.02943 -0.0180931 7.66078 0.214951 7.43235L5.41956 2.33087ZM17.0995 12.9051L16.2321 12.0549C15.9886 11.8161 15.5959 11.8159 15.3522 12.0549C15.106 12.2961 15.106 12.6886 15.3522 12.9296L16.2196 13.78C16.4633 14.0188 16.8558 14.0188 17.0995 13.78C17.3456 13.5388 17.3456 13.1463 17.0995 12.9051ZM15.3647 14.6055L13.6299 12.9051C13.3862 12.6663 12.9935 12.6661 12.7498 12.9051C12.5037 13.1463 12.5037 13.5388 12.7498 13.78C13.3682 14.3861 13.4011 14.4183 14.4848 15.4805C14.7285 15.7191 15.121 15.7193 15.3647 15.4803C15.6108 15.2392 15.6108 14.8468 15.3647 14.6055ZM13.6299 17.1808C13.876 16.9397 13.876 16.5472 13.6299 16.306L12.7625 15.4557C12.5188 15.2169 12.1261 15.2169 11.8824 15.4557C11.6551 15.6785 11.6382 16.0299 11.8308 16.2725C11.8838 16.3202 11.8049 16.2436 12.7498 17.1808C12.9935 17.4197 13.386 17.4199 13.6299 17.1808ZM10.1526 18.0259L10.4068 18.275C10.6505 18.5139 11.0431 18.5139 11.2868 18.275C11.511 18.0552 11.5303 17.7102 11.3459 17.4682C11.0153 17.1431 11.0314 17.1623 10.9739 17.1009C10.728 16.9128 10.3769 16.9314 10.1526 17.1511C9.90653 17.3924 9.90669 17.7848 10.1526 18.0259ZM3.81271 14.0205C4.05642 14.2593 4.44912 14.2593 4.69282 14.0205L5.81429 12.9213C6.04859 12.6916 6.42999 12.6902 6.66602 12.9182C6.90204 13.1462 6.90345 13.5171 6.66916 13.7468L5.54753 14.846C5.30147 15.0872 5.30147 15.4797 5.54753 15.7208C5.79124 15.9597 6.18393 15.9597 6.42764 15.7208L7.54911 14.6215C7.78357 14.3919 8.16481 14.3905 8.40084 14.6185C8.63686 14.8465 8.63827 15.2176 8.40397 15.4472L7.2825 16.5464C7.03629 16.7877 7.03629 17.1801 7.2825 17.4212C7.52606 17.6602 7.91875 17.6602 8.16262 17.4212C9.34321 16.2735 9.28659 16.2986 9.40547 16.2288C9.71222 15.9718 10.0922 15.8229 10.4971 15.8027C10.5189 15.3759 10.6958 14.9554 11.0275 14.6301C11.1977 14.4635 11.3956 14.3338 11.6109 14.245C11.2025 13.5609 11.2971 12.6655 11.8951 12.0796C12.508 11.4788 13.4248 11.4061 14.1084 11.7956C14.197 11.5898 14.3264 11.3967 14.4973 11.2294C15.2124 10.5284 16.3717 10.5284 17.087 11.2294L17.183 11.3235C17.2492 11.1563 17.2841 10.9767 17.2841 10.7919C17.2841 10.0878 17.5641 9.42592 18.0734 8.92649L19.1438 7.8831L14.7879 3.61353L13.4684 4.90091C13.1735 5.18992 12.7954 5.36768 12.3869 5.41376L15.078 8.55571C15.2909 8.80442 15.2564 9.17384 15.0009 9.3809C14.3831 9.88185 13.6018 10.1188 12.8009 10.048C12.0002 9.97722 11.2755 9.60719 10.76 9.00523C10.5443 8.75346 10.1816 8.67762 9.87752 8.82045C9.25695 9.11219 8.57491 9.2187 7.90401 9.13539L3.81271 13.1456C3.56665 13.3868 3.56665 13.7793 3.81271 14.0205ZM2.83992 9.16804C3.19011 9.51121 3.38285 9.96715 3.38285 10.4518C3.38285 10.8607 3.49185 11.2529 3.69541 11.5971L6.62446 8.7263C6.02569 8.4022 5.53467 7.91499 5.20894 7.31104C5.05447 7.02448 5.16801 6.67033 5.46253 6.52003C5.75705 6.36958 6.12105 6.48005 6.27552 6.76661C6.60235 7.37269 7.16332 7.7772 7.79172 7.92704C7.81932 7.93116 7.84677 7.93696 7.87358 7.9449C8.35645 8.04209 8.87414 7.99067 9.35356 7.7653C10.1564 7.38795 11.115 7.58937 11.6859 8.25587C11.9948 8.61644 12.4296 8.83845 12.9099 8.88102C13.183 8.90513 13.4521 8.86958 13.7017 8.7794L10.9138 5.52393C10.6954 5.45908 10.4689 5.42124 10.2406 5.42124H8.49336C8.00406 5.42124 7.54425 5.23966 7.19845 4.90091L5.84676 3.57553L1.49074 7.8451L2.83992 9.16804Z"
                            fill="var(--icon-color-brand-secondary)"
                          ></path>
                        </g>
                        <defs>
                          <clipPath id="clip0_2_27154_pd">
                            <rect
                              width="20.5556"
                              height="20"
                              fill="white"
                              transform="matrix(-1 0 0 1 20.5555 0.868774)"
                            ></rect>
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                      Affiliate (Refer &amp; Earn)
                    </span>
                  </div>
                </Link>
              </div>

              {/* Refer and Earn */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/refer-earn" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
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
                </Link>
              </div>

              {/* Transactions */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/transactions" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
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
                </Link>
              </div>

              {/* Bonuses */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/bonuses" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
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
                </Link>
              </div>

              {/* Open Bets */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/open-bets" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M17.8 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z"></path>
                        <path d="M6.2 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z"></path>
                        <path d="M12 9.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z"></path>
                      </svg>
                    </span>
                    <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                      Open Bets
                    </span>
                  </div>
                </Link>
              </div>

              {/* Betting Profit & Loss */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/betting-profit-loss" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
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
                </Link>
              </div>

              {/* Account Statement */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/account-statement" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
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
                </Link>
              </div>

              {/* Bonus Statement */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/bonus-statement" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
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
                </Link>
              </div>

              {/* Bonus Rules */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/bonus-rules" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
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
                </Link>
              </div>

              {/* Transfer Statement */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/transfer-statement" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
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
                </Link>
              </div>
            </div>
          </li>

          {/* Account Settings */}
          <li className="divide-y flex items-start justify-start flex-col">
            <span className="font-lato-bold font-semibold text-text_Ternary-new px-3 py-1 w-full border-[#d1d1d1] text-xs xs:text-sm">
              Account Settings
            </span>
            <div className="divide-y pl-5 flex items-start justify-start w-full flex-col">
              {/* Time Settings */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/time-setting" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
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
                </Link>
              </div>

              {/* Settings */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/settings" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
                        <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                      </svg>
                    </span>
                    <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                      Settings
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </li>

          {/* Account actions */}
          <li className="divide-y flex items-start justify-start flex-col">
            <span className="font-lato-bold text-text_Ternary-new font-semibold px-3 py-1 w-full bg-border-[#d1d1d1] text-xs xs:text-sm">
              Account actions
            </span>
            <div className="divide-y pl-5 flex items-start justify-start w-full flex-col">
              {/* Change Password */}
              <div className="w-full border-[#d1d1d1]">
                <Link to="/change-password" onClick={handleLinkClick}>
                  <div className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer">
                    <span className="w-4 h-auto xs:w-5 text-text_Primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="var(--color-iconsColor)"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"></path>
                        <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
                        <path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>
                      </svg>
                    </span>
                    <span className="font-medium text-text_Ternary-new text-sm xs:text-base">
                      Change Password
                    </span>
                  </div>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="w-full border-[#d1d1d1]">
                <div
                  onClick={handleSignOut}
                  className="flex transition-all px-0.5 rounded-sm ease-in-out duration-150 active:scale-[99%] items-center justify-start gap-3 w-full py-2 cursor-pointer"
                >
                  <span className="w-4 h-auto xs:w-5 text-text_Primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="var(--color-iconsColor)"
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

          {/* Footer Promo Text */}
          <li className="px-3 py-2 flex items-center justify-start gap-x-2 flex-col">
            <span className="flex text-center text-text_Primary-new text-sm xs:text-base font-medium justify-center bg-[bg_text_brand_primary] bg-clip-text text-gray-700">
              Register online and play online
            </span>
          </li>
          <li className="p-1"></li>
        </ul>
      </div>
    </>
  );
};

export default ProfileDrawer;
