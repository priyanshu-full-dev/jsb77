import React from "react";
import { Link, useLocation } from "react-router-dom";

const CHIPS_DATA = [
  {
    id: "home",
    label: "Home",
    path: "/",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 576 512"
        fill="currentColor"
      >
        <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
      </svg>
    ),
  },
  {
    id: "sports",
    label: "Sports",
    path: "/sports",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 576 512"
        fill="currentColor"
      >
        <path d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2.7 18 1.4 34.6 2 47.8H96C43 96 0 139 0 192v16c0 30.2 14 57.1 35.8 74.8C59.9 301.7 96 320 144 320h11.2c19.1 43.5 50.4 80.2 88.8 104.4V448H208c-17.7 0-32 14.3-32 32s14.3 32 32 32h160c17.7 0 32-14.3 32-32s-14.3-32-32-32h-36v-23.6c38.4-24.2 69.7-60.9 88.8-104.4H432c48 0 84.1-18.3 108.2-37.2C562 265.1 576 238.2 576 208v-16c0-53-43-96-96-96h-34.9c.6-13.2 1.3-29.8 2-47.8C448.1 21.8 426.5 0 400 0z" />
      </svg>
    ),
  },
  {
    id: "aura",
    label: "Aura",
    path: "/aura",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 512 512"
        fill="currentColor"
      >
        <path d="M256 0c-35.3 0-64 28.7-64 64 0 63.8-96 128-192 256 64 0 128 32 128 96 0 17.7 14.3 32 32 32h32v64H160c-17.7 0-32 14.3-32 32s14.3 32 32 32h192c17.7 0 32-14.3 32-32s-14.3-32-32-32h-32v-64h32c17.7 0 32-14.3 32-32 0-64 64-96 128-96-96-128-192-192.2-192-256 0-35.3-28.7-64-64-64z" />
      </svg>
    ),
  },
  {
    id: "mac88",
    label: "MAC88",
    path: "/mac88",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 448 512"
        fill="currentColor"
      >
        <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM128 128a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm192 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM224 224a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM128 320a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm192 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
      </svg>
    ),
  },
  {
    id: "live_casino",
    label: "Live Casino",
    path: "/live-casino",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M12 8v8" />
        <path d="m8 12 4-4 4 4" />
      </svg>
    ),
  },
  {
    id: "slots",
    label: "Slots",
    path: "/slots",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 5v8h2V8H7zm4 0v8h2V8h-2zm4 0v8h2V8h-2z" />
      </svg>
    ),
  },
  {
    id: "crash",
    label: "Crash",
    path: "/crash",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    ),
  },
  {
    id: "table",
    label: "Table",
    path: "/table",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" fill="#fff" />
      </svg>
    ),
  },
];

const TopNavChips = () => {
  const location = useLocation();

  return (
    <div className="relative select-none">
      <div className="flex overflow-x-auto no-scrollbar w-full bg-white dark:bg-[#13141f] p-1 items-start md:items-center md:justify-center border-b border-gray-200 dark:border-gray-800/80">
        {CHIPS_DATA.map((chip) => {
          const isActive = location.pathname === chip.path;
          return (
            <Link key={chip.id} to={chip.path}>
              <button
                type="button"
                className={`text-xs cursor-pointer uppercase mr-1 rounded-full text-nowrap whitespace-nowrap font-semibold border w-max px-3 py-1 transition-all duration-150 ${
                  isActive
                    ? "border-[#c10931] border-primary text-[#c10931] dark:text-[#ff3b5c] bg-red-50/50 dark:bg-[#251520] shadow-xs ring-1 ring-[#c10931]/30 font-extrabold"
                    : "bg-gray-100 dark:bg-[#1d1f2b] hover:bg-gray-200 dark:hover:bg-[#282b3c] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="flex flex-row items-center justify-center gap-1">
                  <span className={isActive ? "text-[#c10931] dark:text-[#ff3b5c]" : "text-gray-500 dark:text-gray-400"}>
                    {chip.svg}
                  </span>
                  <span className="font font-lato text-[12px]">{chip.label}</span>
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TopNavChips;
