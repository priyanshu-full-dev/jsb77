import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="pb-12 px-3 md:px-0 mt-1 w-full md:pr-0 mb:pb-0 md:pl-0 font-lato">
      <div id="homeFooterMobile" className="w-full bg-bg_color_primary rounded-xl shadow-sm">
        {/* Top: Connect with us (Social Links) */}
        <div className="border-b-[0.5px] border-border_color_primary1 py-4 px-4">
          <h3 className="hidden md:block text-text_color_primary1 font-normal text-start text-lg md:text-xl font-bold w-full mb-3">
            Connect with us
          </h3>
          <div className="w-full flex justify-center items-center md:items-start md:justify-start gap-2 lg:gap-2.5">
            {/* Telegram */}
            <div className="flex items-center justify-center overflow-hidden rounded-md">
              <a
                title="https://t.me/kuberbookoffer"
                href="https://t.me/kuberbookoffer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-md bg-bg_color_icon size-[45px] md:size-[50px] hover:scale-[110%] transition-all duration-300 hover:shadow-lg hover:opacity-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                  className="w-6 h-6 md:w-[28px] md:h-[28px]"
                >
                  <g clipPath="url(#clip0_140_22026)">
                    <path
                      d="M9.917 15.1809L9.52 20.7649C10.088 20.7649 10.334 20.5209 10.629 20.2279L13.292 17.6829L18.81 21.7239C19.822 22.2879 20.535 21.9909 20.808 20.7929L24.43 3.82092L24.431 3.81992C24.752 2.32392 23.89 1.73892 22.904 2.10592L1.61399 10.2569C0.160995 10.8209 0.182995 11.6309 1.36699 11.9979L6.81 13.6909L19.453 5.77992C20.048 5.38592 20.589 5.60392 20.144 5.99792L9.917 15.1809Z"
                      fill="var(--icon-color-brand-secondary)"
                    ></path>
                  </g>
                  <defs>
                    <linearGradient
                      id="paint0_linear_140_22026"
                      x1="-1.74013"
                      y1="1.99951"
                      x2="28.9377"
                      y2="5.12347"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#6e081c"></stop>
                      <stop offset="1" stopColor="var(--icon-color-brand-secondary)"></stop>
                    </linearGradient>
                    <clipPath id="clip0_140_22026">
                      <rect width="24" height="24" fill="white" transform="translate(0.5)"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </a>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center justify-center overflow-hidden rounded-md">
              <a
                title="https://api.whatsapp.com/send/?phone=16093083535&text=Hi&type=phone_number&app_absent=0"
                href="https://api.whatsapp.com/send/?phone=16093083535&text=Hi&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-md bg-bg_color_icon size-[45px] md:size-[50px] hover:scale-[110%] transition-all duration-300 hover:shadow-lg hover:opacity-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-6 md:w-[28px] md:h-[28px]"
                >
                  <g clipPath="url(#clip0_140_22030)">
                    <path
                      d="M12.003 0H11.997C5.3805 0 0 5.382 0 12C0 14.625 0.846 17.058 2.2845 19.0335L0.789 23.4915L5.4015 22.017C7.299 23.274 9.5625 24 12.003 24C18.6195 24 24 18.6165 24 12C24 5.3835 18.6195 0 12.003 0ZM18.9855 16.9455C18.696 17.763 17.547 18.441 16.6305 18.639C16.0035 18.7725 15.1845 18.879 12.4275 17.736C8.901 16.275 6.63 12.6915 6.453 12.459C6.2835 12.2265 5.028 10.5615 5.028 8.8395C5.028 7.1175 5.9025 6.279 6.255 5.919C6.5445 5.6235 7.023 5.4885 7.482 5.4885C7.6305 5.4885 7.764 5.496 7.884 5.502C8.2365 5.517 8.4135 5.538 8.646 6.0945C8.9355 6.792 9.6405 8.514 9.7245 8.691C9.81 8.868 9.8955 9.108 9.7755 9.3405C9.663 9.5805 9.564 9.687 9.387 9.891C9.21 10.095 9.042 10.251 8.865 10.47C8.703 10.6605 8.52 10.8645 8.724 11.217C8.928 11.562 9.633 12.7125 10.671 13.6365C12.0105 14.829 13.0965 15.21 13.485 15.372C13.7745 15.492 14.1195 15.4635 14.331 15.2385C14.5995 14.949 14.931 14.469 15.2685 13.9965C15.5085 13.6575 15.8115 13.6155 16.1295 13.7355C16.4535 13.848 18.168 14.6955 18.5205 14.871C18.873 15.048 19.1055 15.132 19.191 15.2805C19.275 15.429 19.275 16.1265 18.9855 16.9455Z"
                      fill="var(--icon-color-brand-secondary)"
                    ></path>
                  </g>
                  <defs>
                    <linearGradient
                      id="paint0_linear_140_22030"
                      x1="-2.24"
                      y1="-7.70251e-08"
                      x2="28.5351"
                      y2="2.61163"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#6e081c"></stop>
                      <stop offset="1" stopColor="var(--icon-color-brand-secondary)"></stop>
                    </linearGradient>
                    <clipPath id="clip0_140_22030">
                      <rect width="24" height="24" fill="white"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Second Row: Payment & Regulatory Certification Logos */}
        <div className="border-b-[0.5px] border-border_color_primary1 py-4 w-full grid px-3 grid-cols-2 xxs:grid-cols-3 sm:grid-cols-5 gap-4 place-items-center justify-center">
          {/* UPI */}
          <div className="w-full max-w-[150px] aspect-[3/1] relative flex items-center justify-center">
            <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
              <img
                src="/assets/upi-acoR-VsZ.svg"
                alt="Upi"
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 625px"
                className="footer-partner-logo w-full h-full object-contain"
                title="Upi"
                width="300"
                height="100"
                loading="eager"
              />
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="w-full max-w-[150px] aspect-[3/1] relative flex items-center justify-center">
            <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
              <img
                src="/assets/bankTransfer-DttK06Lb.svg"
                alt="Bank Transfer"
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 625px"
                className="footer-partner-logo w-full h-full object-contain"
                title="Bank Transfer"
                width="300"
                height="100"
                loading="eager"
              />
            </div>
          </div>

          {/* BeGamble Aware */}
          <div className="w-full max-w-[150px] aspect-[3/1] relative flex items-center justify-center">
            <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
              <img
                src="/assets/BeGamble-CGvmhqLb.svg"
                alt="BeGamble Aware"
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 625px"
                className="footer-partner-logo w-full h-full object-contain"
                title="BeGamble Aware"
                width="300"
                height="100"
                loading="eager"
              />
            </div>
          </div>

          {/* Ecogra */}
          <div className="w-full max-w-[150px] aspect-[3/1] relative flex items-center justify-center">
            <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
              <img
                src="/assets/corga2-21RtzKol.svg"
                alt="Ecogra"
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 625px"
                className="footer-partner-logo w-full h-full object-contain"
                title="Ecogra"
                width="300"
                height="100"
                loading="eager"
              />
            </div>
          </div>

          {/* Gambling Commission */}
          <div className="w-full max-w-[150px] aspect-[3/1] relative flex items-center justify-center">
            <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
              <img
                src="/assets/gamblingCom-B7j01ozS.svg"
                alt="Gambling Commission"
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 625px"
                className="footer-partner-logo w-full h-full object-contain"
                title="Gambling Commission"
                width="300"
                height="100"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* Third Row: App Download Action Buttons (Flex Side-by-Side) */}
        <div className="border-b-[0.5px] border-border_color_primary1 w-full px-3 py-4 flex flex-row items-center justify-center gap-3 sm:gap-4">
          {/* Android App Button */}
          <Link
            to="/download-apk"
            title="Android App"
            className="flex-1 max-w-[280px] min-h-[52px] flex items-center justify-between p-2 pr-3 bg-bg_scoreAndAndroidAppBtn rounded-lg shadow-lg active:scale-[98%] transition-all duration-300 cursor-pointer"
            aria-label="Download Android App"
            style={{ backgroundImage: "var(--footer-down-bg-color)" }}
          >
            <div className="flex items-center gap-x-2 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 21 20" fill="none" className="shrink-0">
                <path
                  d="M2.86361 6.323C2.20466 6.323 1.59089 6.84291 1.59089 7.48341V12.4518C1.59089 13.0926 2.20466 13.6122 2.86361 13.6122C3.52225 13.6122 4.13634 13.0926 4.13634 12.4518V7.48373C4.13634 6.84291 3.52225 6.323 2.86361 6.323Z"
                  fill="#62DF2E"
                ></path>
                <path
                  d="M13.2392 1.67272L13.4613 1.3469L13.6837 1.0249L14.1791 0.301037C14.2412 0.21131 14.2154 0.0916734 14.1241 0.0328097C14.0337 -0.0273267 13.9087 -0.0021903 13.8495 0.0869006L13.0932 1.18876L12.8657 1.52063C12.1469 1.2489 11.346 1.09745 10.5 1.09745C9.65584 1.09745 8.85339 1.24922 8.13462 1.52063L7.90839 1.18908L7.68471 0.863583L7.15334 0.087537C7.09193 -0.00187211 6.96848 -0.0254176 6.87684 0.0334461C6.78616 0.0926279 6.76102 0.212264 6.82148 0.301673L7.31657 1.02586L7.53898 1.34817L7.76234 1.67304C6.07471 2.43826 4.93275 3.95472 4.93275 5.54563H16.0675C16.0675 3.95472 14.9259 2.43826 13.2392 1.67272ZM8.11393 4.00086C7.78334 4.00086 7.51702 3.7409 7.51702 3.41986C7.51702 3.09881 7.78334 2.84013 8.11393 2.84013C8.44357 2.84013 8.71052 3.09881 8.71052 3.41986C8.71052 3.7409 8.44389 4.00086 8.11393 4.00086ZM12.8867 4.00086C12.5564 4.00086 12.2894 3.7409 12.2894 3.41986C12.2894 3.09881 12.5564 2.84013 12.8867 2.84013C13.2163 2.84013 13.4833 3.09881 13.4833 3.41986C13.4833 3.7409 13.2163 4.00086 12.8867 4.00086Z"
                  fill="#62DF2E"
                ></path>
                <path
                  d="M2.92025 8.91666C2.4242 8.91666 1.90907 8.44862 1.59089 7.7063V12.452C1.59089 13.0928 2.20466 13.6124 2.86361 13.6124C3.52225 13.6124 4.13634 13.0928 4.13634 12.452V7.95384C3.81816 8.55012 3.35807 8.91666 2.92025 8.91666Z"
                  fill="#62DF2E"
                ></path>
                <path
                  d="M18.1363 6.323C17.4774 6.323 16.8636 6.84291 16.8636 7.48341V12.4518C16.8636 13.0926 17.4774 13.6122 18.1363 13.6122C18.795 13.6122 19.4091 13.0926 19.4091 12.4518V7.48373C19.4091 6.84291 18.795 6.323 18.1363 6.323Z"
                  fill="#62DF2E"
                ></path>
                <path
                  d="M18.193 8.91691C17.6969 8.91691 17.1818 8.44886 16.8636 7.70654V12.4522C16.8636 13.093 17.4774 13.6126 18.1363 13.6126C18.795 13.6126 19.4091 13.093 19.4091 12.4522V7.95409C19.0909 8.55036 18.6308 8.91691 18.193 8.91691Z"
                  fill="#62DF2E"
                ></path>
                <path
                  d="M13.4833 3.41959C13.4833 3.74063 13.2163 4.00059 12.8867 4.00059C12.5564 4.00059 12.2894 3.74063 12.2894 3.41959C12.2894 3.24554 12.3693 3.09186 12.4937 2.98559C11.8647 2.88059 11.1955 2.823 10.5 2.823C9.80443 2.823 9.13562 2.88059 8.50625 2.98559C8.63098 3.09154 8.71084 3.24554 8.71084 3.41959C8.71084 3.74063 8.44389 4.00059 8.11425 4.00059C7.78366 4.00059 7.51734 3.74063 7.51734 3.41959C7.51734 3.3375 7.53548 3.25954 7.56698 3.18859C6.61307 3.43932 5.79343 3.80523 5.17489 4.25482C5.01898 4.66432 4.93275 5.2275 4.93275 5.54568H16.0675C16.0675 5.2275 15.9813 4.66463 15.8257 4.25545C15.2075 3.80523 14.3875 3.43868 13.4343 3.18795C13.4654 3.25891 13.4833 3.33782 13.4833 3.41959Z"
                  fill="#62DF2E"
                ></path>
                <path
                  d="M10.5 6.11108C8.35637 6.11108 6.61107 6.11108 5.09089 6.11108V14.839C5.09089 15.5151 5.49689 16.0455 6.19275 16.0455H7.10116C7.06998 16.0455 6.99998 16.275 6.99998 16.3876V18.8395C6.99998 19.4803 7.61439 19.9999 8.27271 19.9999C8.93134 19.9999 9.54543 19.4803 9.54543 18.8395V16.3876C9.54543 16.275 9.42262 16.0455 9.39239 16.0455H11.6082C11.578 16.0455 11.4545 16.275 11.4545 16.3876V18.8395C11.4545 19.4803 12.0677 19.9999 12.726 19.9999C13.3859 19.9999 14 19.4803 14 18.8395V16.3876C14 16.275 13.9303 16.0455 13.8991 16.0455H14.8088C15.5047 16.0455 15.9091 15.5151 15.9091 14.839V6.11108C14 6.28272 12.6436 6.11108 10.5 6.11108Z"
                  fill="#62DF2E"
                ></path>
              </svg>
              <div className="flex flex-col items-start justify-center text-xs truncate">
                <span className="text-text_color_primary3 font-normal" style={{ color: "rgb(139, 139, 139)" }}>
                  Download
                </span>
                <span className="text-text_color_primary2 font-semibold uppercase whitespace-nowrap">Android App</span>
              </div>
            </div>
            <span className="w-5 h-5 -rotate-180 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 7 12" fill="none">
                <path d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z" fill="#fff"></path>
              </svg>
            </span>
          </Link>

          {/* Score App Button */}
          <Link
            to="/download-apk"
            title="Score App"
            className="flex-1 max-w-[280px] min-h-[52px] flex items-center justify-between p-2 pr-3 bg-bg_scoreAndAndroidAppBtn rounded-lg shadow-lg active:scale-[98%] transition-all duration-300 cursor-pointer"
            aria-label="Download Score App"
            style={{ backgroundImage: "var(--footer-down-bg-color)" }}
          >
            <div className="flex items-center gap-x-2 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                x="0"
                y="0"
                viewBox="0 0 64 64"
                className="shrink-0"
                fill="#fff"
              >
                <g>
                  <path
                    d="M57 8.5H7a3.009 3.009 0 0 0-3 3v4a1.003 1.003 0 0 0 1 1h13v3H8a2.006 2.006 0 0 0-2 2v32a2.006 2.006 0 0 0 2 2h21a2 2 0 0 0 2-2v-32a2 2 0 0 0-2-2h-9v-3h24v3h-9a2 2 0 0 0-2 2v32a2 2 0 0 0 2 2h21a2.006 2.006 0 0 0 2-2v-32a2.006 2.006 0 0 0-2-2H46v-3h13a1.003 1.003 0 0 0 1-1v-4a3.009 3.009 0 0 0-3-3ZM22.34 30.59a5.39 5.39 0 0 1 0 7.76L16.48 44h6.46a1 1 0 0 1 0 2H14a1.004 1.004 0 0 1-.69-1.72l7.64-7.37A3.37 3.37 0 0 0 22 34.47c.087-3.096-4.128-4.542-6.21-2.44l-1.09 1.04a1 1 0 0 1-1.39-1.44l1.08-1.04a5.796 5.796 0 0 1 7.95 0ZM46.22 29a4.76 4.76 0 0 1 2.93 8.5 4.763 4.763 0 0 1-2.93 8.5h-1.51a4.79 4.79 0 0 1-4.69-3.8 1 1 0 1 1 1.96-.4 2.777 2.777 0 0 0 2.73 2.2h1.51a2.75 2.75 0 0 0 0-5.5 1 1 0 0 1 0-2 2.75 2.75 0 1 0 0-5.5h-1.51a2.78 2.78 0 0 0-2.73 2.2 1.002 1.002 0 0 1-1.18.78c-1.686-.566-.274-2.784.52-3.59 1.262-1.352 3.175-1.478 4.9-1.39Z"
                    fill="#fff"
                    opacity="1"
                  ></path>
                </g>
              </svg>
              <div className="flex flex-col items-start justify-center text-xs truncate">
                <span className="text-text_color_primary3 font-normal" style={{ color: "rgb(139, 139, 139)" }}>
                  Download
                </span>
                <span className="text-text_color_primary2 font-semibold uppercase whitespace-nowrap">Score App</span>
              </div>
            </div>
            <span className="w-5 h-5 -rotate-180 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 7 12" fill="none">
                <path d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z" fill="#fff"></path>
              </svg>
            </span>
          </Link>
        </div>

        {/* Fourth Row: Quick Links (2-Column Grid as in screenshot) */}
        <div className="py-4 w-full px-4 border-b-[0.5px] border-border_color_primary1">
          <h2 className="text-text_Ternary text-start text-lg md:text-xl font-bold relative w-max pb-1 mb-3">
            <span>Quick Links</span>
            <span className="absolute bottom-0 origin-left popUpOpenAnimation left-0 w-[75%] h-0.5 bg-bg_text_brand_primary rounded-full"></span>
          </h2>
          <div className="w-full grid grid-cols-2 gap-x-4 sm:gap-x-12 gap-y-3 py-1">
            <Link
              className="text-sm md:text-base transition-all duration-300 active:text-text_brand_primary hover:text-text_brand_primary text-text_Ternary font-medium"
              title="Responsible Gambling"
              to="/responsible-gambling"
            >
              <span className="tw-text-nowrap">Responsible Gambling</span>
            </Link>
            <Link
              className="text-sm md:text-base transition-all duration-300 active:text-text_brand_primary hover:text-text_brand_primary text-text_Ternary font-medium"
              title="Privacy Policy"
              to="/privacy-policy"
            >
              <span className="tw-text-nowrap">Privacy Policy</span>
            </Link>
            <Link
              className="text-sm md:text-base transition-all duration-300 active:text-text_brand_primary hover:text-text_brand_primary text-text_Ternary font-medium"
              title="Exclusion Policy"
              to="/exclusion-policy"
            >
              <span className="tw-text-nowrap">Exclusion Policy</span>
            </Link>
            <Link
              className="text-sm md:text-base transition-all duration-300 active:text-text_brand_primary hover:text-text_brand_primary text-text_Ternary font-medium"
              title="Rules & Regulations"
              to="/rules-regulations"
            >
              <span className="tw-text-nowrap">Rules &amp; Regulations</span>
            </Link>
          </div>
        </div>

        {/* Fifth Row: Gaming Curacao License Logo */}
        <div className="flex py-4 items-center justify-center border-b-[0.5px] border-border_color_primary1">
          <img
            alt="footer-logo"
            title="Gaming"
            loading="eager"
            width="1000"
            height="1000"
            decoding="async"
            data-nimg="1"
            className="w-[100px] h-auto sm:w-[150px] sm:h-auto fill-inherit"
            src="/assets/gaming-1--h3c922D.png"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/assets/gaming-1--h3c922D.svg";
            }}
            style={{ color: "transparent" }}
          />
        </div>

        {/* Sixth Row: Copyright Text */}
        <div className="text-center text-sm py-3 text-text_color_primary1 font-medium">
          © 2026 KUBERBOOK666. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
