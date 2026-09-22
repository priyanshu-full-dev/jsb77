import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths } from "date-fns";
import { getAccountStatements } from "../../../api";

export default function BonusStatementPage() {
  const navigate = useNavigate();

  // Date range state
  const [startDate, setStartDate] = useState(() => subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(() => new Date());
  const [quickFilter, setQuickFilter] = useState("7"); // "7", "14", "28", "custom"

  // Bonus Type Dropdown state
  const [bonusType, setBonusType] = useState("Sport Bonus");
  const [showBonusDropdown, setShowBonusDropdown] = useState(false);

  // Calendar dropdown state
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  // Data & loading state
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(false);

  const calendarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close modals on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBonusDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStatements = useCallback(async (start, end, type) => {
    try {
      setLoading(true);
      const sStr = format(start, "yyyy-MM-dd");
      const eStr = format(end, "yyyy-MM-dd");

      const res = await getAccountStatements({
        startDate: sStr,
        endDate: eStr,
        filterby: type ? type.toLowerCase().replace(" ", "_") : "bonus",
        limit: 100,
      });

      const list = res?.data?.transactions || res?.data?.statements || [];
      // Filter for bonus records if generic statements are returned
      const bonusList = Array.isArray(list)
        ? list.filter((item) => {
            const remark = (item?.remark || item?.narration || item?.description || item?.type || "").toLowerCase();
            return remark.includes("bonus") || item?.isBonus || item?.bonusType;
          })
        : [];

      setStatements(bonusList);
    } catch (error) {
      console.error("Error fetching bonus statements:", error);
      setStatements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatements(startDate, endDate, bonusType);
  }, [fetchStatements, startDate, endDate, bonusType]);

  const handleQuickFilter = (days) => {
    setQuickFilter(days.toString());
    const newStart = subDays(new Date(), days);
    const newEnd = new Date();
    setStartDate(newStart);
    setEndDate(newEnd);
    fetchStatements(newStart, newEnd, bonusType);
  };

  const handleSearch = () => {
    setShowCalendar(false);
    fetchStatements(startDate, endDate, bonusType);
  };

  const handleDateClick = (day) => {
    if (selectingStart) {
      setStartDate(day);
      if (day > endDate) {
        setEndDate(day);
      }
      setSelectingStart(false);
    } else {
      if (day < startDate) {
        setStartDate(day);
      } else {
        setEndDate(day);
      }
      setSelectingStart(true);
      setQuickFilter("custom");
    }
  };

  // Calendar calculations
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = (monthStart.getDay() + 6) % 7;

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  const bonusOptions = ["Sport Bonus", "Casino Bonus", "Deposit Bonus", "Referral Bonus", "All Bonus"];

  return (
    <div className="flex flex-col transition-all ease-in-out duration-100">
      <div className="flex items-start justify-start w-full">
        {/* Desktop Left Sidebar Menu */}
        <div
          title="Menu"
          id="leftDeskSideBar"
          className="hidden lg:flex p-2 overflow-y-auto z-10 w-[20%] h-[calc(100dvh-120px)] sticky top-[54px] lg:top-[110px]"
        >
          <ul className="flex border border-ternary3 bg-bg_Quaternary-side overflow-x-hidden flex-col w-full bg-white shadow-sm rounded-lg">
            {/* Cricket */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Cricket/4"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 19 18"
                  fill="currentColor"
                  className="text-red-600"
                >
                  <path d="M4.36255 16.7108C4.35063 16.7037 4.34109 16.6966 4.32917 16.6895C3.88333 16.4077 3.4518 16.107 3.05842 15.7566C2.91299 15.6263 2.77709 15.489 2.63404 15.3564C2.59828 15.3256 2.61974 15.3067 2.63642 15.283C2.81524 15.0533 2.99643 14.8213 3.17524 14.5916C3.92148 13.635 4.6701 12.676 5.41634 11.7194C6.27225 10.6231 7.12578 9.52678 7.98169 8.43047C8.8066 7.37204 9.6339 6.31125 10.4588 5.25282C11.329 4.14231 12.1969 3.02942 13.0647 1.9189C13.2292 1.70816 13.3961 1.49506 13.5582 1.28195C13.5797 1.25354 13.5916 1.24644 13.6274 1.26538C13.9468 1.45244 14.2472 1.67028 14.5333 1.90233C14.6692 2.01125 14.8123 2.1107 14.9458 2.22199C15.0817 2.34038 15.2128 2.46351 15.3439 2.58663C15.3773 2.61742 15.3535 2.63162 15.3368 2.65293C15.1008 2.95602 14.8623 3.26147 14.6263 3.56455C13.9254 4.46433 13.222 5.36411 12.5211 6.26389C11.7343 7.27259 10.9476 8.28129 10.1584 9.29C9.42648 10.2277 8.69693 11.1653 7.965 12.103C7.12101 13.1827 6.2794 14.2648 5.43542 15.3446C5.08971 15.7874 4.7464 16.2278 4.40069 16.6706C4.39116 16.6848 4.38401 16.7037 4.36255 16.7108Z"></path>
                  <path d="M17.9928 8.49706C17.9761 8.16556 17.9451 7.83643 17.8927 7.50967C17.8283 7.11424 17.7305 6.72591 17.6137 6.33995C17.3777 5.55146 17.0225 4.8198 16.5814 4.12365C16.4336 3.89161 16.2762 3.66903 16.1022 3.45119C16.0879 3.46776 16.0736 3.48197 16.0617 3.49854C15.7231 3.93423 15.3869 4.36991 15.0484 4.80322C14.2426 5.84271 13.4367 6.88219 12.6309 7.92167C11.7988 8.99431 10.9691 10.0669 10.1371 11.1372C9.34792 12.1554 8.55639 13.1759 7.76724 14.1941C6.99001 15.1981 6.2104 16.202 5.43317 17.2036C5.40456 17.2391 5.40695 17.251 5.44986 17.2699C6.43213 17.6867 7.45492 17.9211 8.52063 17.9803C9.05468 18.0087 9.58872 17.9921 10.1204 17.9258C10.571 17.869 11.0144 17.7814 11.4483 17.6511C12.247 17.412 13.0052 17.0852 13.7157 16.6495C14.4619 16.1925 15.1247 15.6385 15.7112 14.9897C16.0998 14.5587 16.4455 14.097 16.7411 13.5998C17.1917 12.8421 17.5136 12.0346 17.7353 11.1846C17.8736 10.6518 17.9594 10.1096 17.988 9.56022C18.0095 9.20741 18.0119 8.85224 17.9928 8.49706Z"></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Cricket
                </span>
              </a>
            </li>

            {/* Football */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/football/1"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 96 96"
                  height="16"
                  width="16"
                  className="text-gray-700"
                >
                  <path d="M95.994 53.946a11.3 11.3 0 0 0-4.743-1.029c-1.718 0-3.349.38-4.814 1.059l.07-.03c.313-1.146.494-2.46.494-3.814 0-5.252-2.702-9.874-6.787-12.551l-.057-.037c6.913-.642 10.53-12.58 10.53-12.58-4.555-8.412-11.233-15.168-19.328-19.69l-.247-.127S59.454 3.54 55.956 7.236C51.615.202 39.275.202 39.275.202c-9.79 1.878-18.28 6.503-24.888 13.03l.006-.005a12.33 12.33 0 0 0 4.637 9.629l.024.018c-6.15 1.447-12.542 10.09-11.496 13.588a6.71 6.71 0 0 0-5.378-2.695q-.089 0-.178.003h.009C.745 37.897.009 42.64 0 47.554v.009c0 5.303.868 10.401 2.47 15.165l-.097-.335a15.8 15.8 0 0 0 4.95-6.925l.033-.109c3.048 2.011 6.79 3.205 10.809 3.205 1.977 0 3.889-.29 5.695-.829l-.142.036c-1.266 2.56-2.008 5.572-2.008 8.759 0 4 1.17 7.727 3.184 10.856l-.048-.078a16.44 16.44 0 0 0-9.838 5.173l-.012.013c8.632 8.23 20.344 13.298 33.242 13.304 4.1-.009 8.077-.537 11.867-1.52l-.329.073c-2.24-5.189-6.32-9.229-11.396-11.363l-.142-.051c5.629-.323 11.176-8.563 12.06-14.191 4.043 1.839 8.77 2.909 13.748 2.909a34 34 0 0 0 3.605-.19l-.147.012c-.863 2.12-1.363 4.58-1.363 7.154 0 2.575.5 5.035 1.41 7.287l-.044-.13c9.876-7.609 16.678-18.794 18.463-31.583l.03-.253zM59.131 62.67c-6.15-8.683-23.757-13.869-33.004-8.722 5.306-13.025 3.458-21.506-3.136-30.511 12.06 1.124 26.372-5.146 32.16-13.184 1.65 8.722 11.255 23.275 20.1 26.208-14.39 6.551-16.039 16.883-16.12 26.209"></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Football
                </span>
              </a>
            </li>

            {/* Tennis */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/tennis/2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="#7FBA42"
                >
                  <path d="M9.5403 19.3516C9.28848 19.3516 9.03913 19.3516 8.78731 19.3516C8.74781 19.3516 8.73546 19.3442 8.73793 19.3021C8.78237 18.8565 8.7725 18.4135 8.75275 17.9679C8.73546 17.5595 8.69596 17.1535 8.6219 16.7526C8.49599 16.0743 8.30836 15.4109 8.06395 14.7624C7.68128 13.7476 7.15542 12.8119 6.4839 11.9579C6.13086 11.5074 5.74326 11.0891 5.3285 10.698C4.65698 10.0668 3.91387 9.53709 3.09916 9.10639C2.31902 8.69549 1.50924 8.3638 0.652565 8.15835C0.548875 8.1336 0.445185 8.11132 0.341495 8.08904C0.306931 8.08162 0.294587 8.07419 0.301994 8.02964C0.363714 7.74498 0.418028 7.45785 0.49703 7.17566C0.679722 6.51724 0.93401 5.88604 1.26977 5.28949C1.51418 4.85137 1.78081 4.42809 2.09188 4.03452C2.43505 3.59887 2.81031 3.19788 3.23001 2.83648C3.64724 2.47509 4.09162 2.15578 4.56811 1.87607C5.41244 1.38349 6.30862 1.02953 7.26405 0.829027C7.68128 0.742392 8.10592 0.687936 8.53302 0.660707C9.02678 0.631004 9.52055 0.650806 10.0143 0.660707C10.0513 0.660707 10.0587 0.675559 10.0563 0.707738C10.0513 0.801799 10.0513 0.898335 10.0464 0.992396C10.0316 1.30428 10.0365 1.61617 10.0464 1.92558C10.0958 2.28697 10.0958 2.64589 10.1452 3.00233C10.2143 3.49244 10.318 3.97512 10.4562 4.45037C10.6636 5.16821 10.9549 5.84891 11.3055 6.50734C11.6462 7.14844 12.0437 7.74993 12.5053 8.30935C13.004 8.91331 13.5669 9.4554 14.1866 9.93313C14.9124 10.495 15.6951 10.9629 16.5295 11.344C17.122 11.6139 17.7392 11.8144 18.3688 11.9752C18.5021 12.0099 18.4996 12.0099 18.4749 12.1411C18.3169 12.9802 18.038 13.7797 17.6479 14.5372C17.3343 15.1411 16.9517 15.6981 16.5122 16.2179C15.9074 16.9308 15.2087 17.5347 14.4162 18.0248C13.5669 18.5521 12.6584 18.9358 11.6832 19.1536C11.2586 19.2476 10.8265 19.3095 10.392 19.3417C10.1081 19.3615 9.82421 19.3665 9.5403 19.3665C9.5403 19.3615 9.5403 19.3566 9.5403 19.3516Z"></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Tennis
                </span>
              </a>
            </li>

            {/* Horse Racing */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/horse-racing"
              >
                <svg
                  viewBox="10.35099 0 170.59965 192.83511"
                  width="16"
                  height="16"
                  fill="#864D44"
                >
                  <g transform="translate(-.981 -.981)scale(1.01)">
                    <path d="M37.332 151.44c-25.932 -38.27 -7.631 -68.158 -7.631 -68.158 -4.252 -1.259 -17.851 7.653 -17.851 7.653 7.648 -28.029 49.717 -51.843 49.717 -51.843 -4.67 -1.709 -17.845 1.686 -17.845 1.686 34.417 -33.124 76.49 -20.807 76.49 -20.807C121.482 12.742 142.314 0 142.314 0c-2.131 2.11 -2.99 13.6 -2.99 13.6 2.125 -3.83 8.936 -7.653 8.936 -7.653 -3.821 8.912 0 28.03 0 28.03 11.047 11.057 23.366 49.307 23.366 49.307l4.688 6.797c5.951 8.511 3.764 21.892 -2.131 25.065 -22.09 11.926 -24.227 -9.767 -24.227 -9.767 -18.274 -2.125 -31.874 -22.529 -31.874 -22.529 -24.639 12.745 -10.916 48.7 -0.277 62.507 13.669 17.698 3.66 46.328 3.66 46.328s-58.527 -2.424 -84.133 -40.244"></path>
                  </g>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Horse Racing
                </span>
              </a>
            </li>

            {/* Greyhound Racing */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/greyhound-racing"
              >
                <svg
                  viewBox="0.84 94.15 422.84 233.7"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="text-gray-700"
                >
                  <path d="m415.501 229.82-101.146-52.965c-2.592-11.371-8.942-25.952-24.06-38.143-15.015-12.109-35.906-19.814-62.242-22.521L27.658 94.656a8.995 8.995 0 0 0-9.797 7.198c-.113.571-2.711 14.166 2.438 30.739 2.181 7.02 5.985 15.256 12.577 23.378l-26.269 7.247A8.999 8.999 0 0 0 .21 173.822c.122.556 3.114 13.764 14.148 26.747 7.718 9.082 20.66 19.491 41.182 23.883-18.63 40.612-24.831 77.128-25.109 78.809a9 9 0 0 0 7.96 10.424l116.955 11.99a9.002 9.002 0 0 0 9.635-6.712c6.019-23.404 17.513-54.518 47.719-54.518 15.748 0 33.407 7.798 48.724 15.107 21.949 10.475 42.852 15.786 62.125 15.786 35.848 0 56.374-18.09 63.731-26.137 26.525-1.407 32.873-22.809 33.043-31.227a8.997 8.997 0 0 0-4.822-8.154zm-129.957-36.751a11.508 11.508 0 0 1-8.513 3.724 11.553 11.553 0 0 1-11.575-11.126c-.249-6.385 4.737-11.782 11.115-12.037a11.554 11.554 0 0 1 12.039 11.117 11.517 11.517 0 0 1-3.066 8.322z"></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Greyhound Racing
                </span>
              </a>
            </li>

            {/* Indian Card Games */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/bonus-statement"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 511.643 511.643"
                  fill="#c10931"
                >
                  <path d="M453.209 184.081C373.725 121.725 300.804 41.437 270.565 6.713c-7.795-8.951-21.691-8.951-29.486 0-30.24 34.723-103.16 115.011-182.644 177.368C22.372 212.373 1.267 254.915 1.267 299.99c0 80 66.652 144.853 148.871 144.853 27.807 0 53.101-10.455 71.97-27.539v28.247c0 34.386-24.644 38.65-43.766 54.707-4.599 3.862-1.775 11.384 4.23 11.384h145.994c5.984 0 8.811-7.47 4.262-11.358-18.926-16.176-43.294-19.786-43.294-54.478v-28.503c18.869 17.084 44.163 27.539 71.97 27.539 82.219 0 148.871-64.853 148.871-144.853.001-45.074-21.104-87.616-57.166-115.908z"></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Indian Card Games
                </span>
              </a>
            </li>

            {/* Sportsbook */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Sportsbook/0"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 17 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7049 9.67407C11.4822 9.67407 11.3018 9.49359 11.3018 9.27097C11.3018 9.04835 11.4822 8.86787 11.7049 8.86787C13.9299 8.86522 15.7331 7.06211 15.7357 4.83703V1.61235H12.108C11.8853 1.61235 11.7049 1.43187 11.7049 1.20925C11.7049 0.986634 11.8853 0.806152 12.108 0.806152H16.1388C16.3615 0.806152 16.5419 0.986634 16.5419 1.20925V4.83703C16.5388 7.50715 14.375 9.67097 11.7049 9.67407Z"
                    fill="#FFA000"
                  ></path>
                  <path
                    d="M4.83704 9.67456C2.16692 9.67146 0.00309873 7.50764 0 4.83752V1.20974C0 0.987123 0.180482 0.806641 0.403099 0.806641H4.43394C4.65656 0.806641 4.83704 0.987123 4.83704 1.20974C4.83704 1.43236 4.65656 1.61284 4.43394 1.61284H0.80616V4.83752C0.808843 7.06259 2.61196 8.86571 4.83704 8.8684C5.05966 8.8684 5.24014 9.04888 5.24014 9.27149C5.2401 9.49407 5.05966 9.67456 4.83704 9.67456Z"
                    fill="#FFA000"
                  ></path>
                  <path
                    d="M10.4899 15.9049L10.3187 15.7393C9.65185 15.0925 9.46858 7.28414 9.45459 6.64213C9.45113 6.47879 9.30968 6.34812 9.1364 6.34814H7.86366C7.69062 6.34812 7.54929 6.47845 7.54547 6.64154C7.53211 7.28355 7.34883 15.0907 6.68128 15.7387L6.51009 15.9043C5.63635 16.7521 3 17.3647 3 18.0481C3 18.2138 3.14247 18.3481 3.31819 18.3481H13.6818C13.8575 18.3481 14 18.2138 14 18.0481C14 17.3647 11.3637 16.7521 10.4899 15.9049Z"
                    fill="#FFA000"
                  ></path>
                  <path
                    d="M13.1084 0H3.43435C3.21173 0 3.03125 0.180482 3.03125 0.403099V7.8525C3.06904 10.7307 5.39312 13.0548 8.27139 13.0926C11.1497 13.0548 13.4737 10.7307 13.5115 7.85246V0.403099C13.5115 0.180482 13.331 0 13.1084 0Z"
                    fill="#FFC107"
                  ></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Sportsbook
                </span>
              </a>
            </li>

            {/* Live Casino */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/bonus-statement"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#333"
                    d="M43.8 31.1 25.4 1.4c-.2-.3-.5-.6-.9-.7-.4-.1-.8 0-1.1.2L.8 14.8c-.3.2-.6.5-.7.9-.1.4 0 .8.2 1.1l18.3 29.8c.3.5.8.7 1.3.7.3 0 .5-.1.8-.2l22.6-13.9c.3-.2.6-.5.7-.9.1-.4 0-.8-.2-1.2z"
                  ></path>
                  <path
                    fill="#d2d2d2"
                    d="M8.7 6.5h26.6v35H8.7z"
                    transform="rotate(-31.647 22.023 23.998)"
                  ></path>
                  <path
                    fill="#e44b4b"
                    d="M39.3 26.4c0 3.7-6.2 7.3-6.2 7.3S27 30.1 27 26.4c0-1.8 1.5-3.3 3.3-3.3 1.3 0 2.3.7 2.9 1.8.5-1 1.6-1.8 2.9-1.8 1.8 0 3.2 1.4 3.2 3.3z"
                  ></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Live Casino
                </span>
              </a>
            </li>

            {/* Aviator */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/bonus-statement"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.2208 25.2081C8.58995 23.849 8.72593 21.3034 10.4923 20.1258L22.5839 12.7529L30.5466 12.458L39.7792 6.91839C46.1332 3.10599 53.757 2.0196 60.923 3.90539C62.9758 10.2502 62.0646 17.1819 58.4418 22.7807L51.1908 33.9869L50.6009 42.2446L42.3433 54.3361C41.4141 55.0795 40.1911 55.3464 39.0367 55.0578L38.8483 55.0107C38.6265 54.9553 38.424 54.8406 38.2623 54.6789L37.9195 54.3361L32.611 45.7836L26.1229 46.6683L21.1093 41.6547L16.6855 36.9361L17.8652 30.153L10.4923 25.4343L10.2208 25.2081Z"
                    fill="#c10931"
                  ></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Aviator
                </span>
              </a>
            </li>

            {/* Slot Games */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/slot-games"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.5056 3H5.50562C4.13062 3 3.00562 4.125 3.00562 5.5V13.5C3.00562 14.875 4.13062 16 5.50562 16H13.5056C14.8806 16 16.0056 14.875 16.0056 13.5V5.5C16.0056 4.125 14.8806 3 13.5056 3Z"
                    fill="#c10931"
                  ></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Slot Games
                </span>
              </a>
            </li>

            {/* MAC88 */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/slot-games"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.5056 3H5.50562C4.13062 3 3.00562 4.125 3.00562 5.5V13.5C3.00562 14.875 4.13062 16 5.50562 16H13.5056C14.8806 16 16.0056 14.875 16.0056 13.5V5.5C16.0056 4.125 14.8806 3 13.5056 3Z"
                    fill="#c10931"
                  ></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  MAC88
                </span>
              </a>
            </li>
          </ul>
        </div>

        {/* Center Main Content Area */}
        <div
          className="w-full md:mt-[0px] lg:overflow-auto lg:w-[54%] px-2 lg:px-4"
          style={{ minHeight: "calc(100dvh - 110px)" }}
        >
          {/* Mobile Header with Back Button */}
          <div
            title="Bonus Statement"
            className="sticky top-0 z-10 w-full bg-white h-max py-2.5 flex flex-col lg:hidden border-b border-gray-100 font-lato"
          >
            <div className="flex items-center gap-2 w-full pl-2 pr-2">
              <button
                onClick={() => navigate(-1)}
                className="relative overflow-hidden bg-gray-100 rounded w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                >
                  <path
                    d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z"
                    fill="#C10B32"
                  ></path>
                </svg>
              </button>
              <div className="flex-1 flex items-center justify-between">
                <h3 className="text-gray-900 text-base font-bold">
                  Bonus Statement
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="border-t border-border_color_primary mt-2 lg:border-none">
              <div className="relative w-full">
                <div className="w-full flex flex-col gap-2.5 bg-white py-2 rounded-xl shadow-sm border border-gray-100">
                  {/* Date Range Picker Row */}
                  <div className="flex items-center gap-2 w-full px-2">
                    <div
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="flex flex-1 items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg cursor-pointer shadow-sm hover:border-gray-400 transition-colors min-h-[36px] text-xs sm:text-sm bg-white"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 justify-between w-full">
                          <span className="text-gray-800 font-medium truncate">
                            {format(startDate, "MMMM d, yyyy")}
                          </span>
                          {/* Exchange Arrows Icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#C10B32"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 flex-shrink-0"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M7 10h14l-4 -4"></path>
                            <path d="M17 14h-14l4 4"></path>
                          </svg>
                          <span className="text-gray-800 font-medium truncate">
                            {format(endDate, "MMMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      {/* Red Calendar Icon */}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-shrink-0 w-4 h-4"
                      >
                        <path
                          d="M7.17236 4.79175C6.8307 4.79175 6.54736 4.50841 6.54736 4.16675V1.66675C6.54736 1.32508 6.8307 1.04175 7.17236 1.04175C7.51403 1.04175 7.79736 1.32508 7.79736 1.66675V4.16675C7.79736 4.50841 7.51403 4.79175 7.17236 4.79175Z"
                          fill="#C10B32"
                        ></path>
                        <path
                          d="M13.8394 4.79175C13.4977 4.79175 13.2144 4.50841 13.2144 4.16675V1.66675C13.2144 1.32508 13.4977 1.04175 13.8394 1.04175C14.181 1.04175 14.4644 1.32508 14.4644 1.66675V4.16675C14.4644 4.50841 14.181 4.79175 13.8394 4.79175Z"
                          fill="#C10B32"
                        ></path>
                        <path
                          d="M17.589 8.19995H3.42236C3.0807 8.19995 2.79736 7.91662 2.79736 7.57495C2.79736 7.23328 3.0807 6.94995 3.42236 6.94995H17.589C17.9307 6.94995 18.214 7.23328 18.214 7.57495C18.214 7.91662 17.9307 8.19995 17.589 8.19995Z"
                          fill="#C10B32"
                        ></path>
                        <path
                          d="M13.8392 18.9584H7.17253C4.13086 18.9584 2.38086 17.2084 2.38086 14.1667V7.08342C2.38086 4.04175 4.13086 2.29175 7.17253 2.29175H13.8392C16.8809 2.29175 18.6309 4.04175 18.6309 7.08342V14.1667C18.6309 17.2084 16.8809 18.9584 13.8392 18.9584ZM7.17253 3.54175C4.78919 3.54175 3.63086 4.70008 3.63086 7.08342V14.1667C3.63086 16.5501 4.78919 17.7084 7.17253 17.7084H13.8392C16.2225 17.7084 17.3809 16.5501 17.3809 14.1667V7.08342C17.3809 4.70008 16.2225 3.54175 13.8392 3.54175H7.17253Z"
                          fill="#C10B32"
                        ></path>
                      </svg>
                    </div>

                    {/* Search Button */}
                    <button
                      onClick={handleSearch}
                      className="relative overflow-hidden w-9 h-9 min-w-[36px] min-h-[36px] aspect-square flex items-center justify-center rounded-lg cursor-pointer bg-[#8b0a24] hover:bg-[#72081d] active:scale-95 shadow-sm transition-all"
                      type="button"
                      title="Search"
                    >
                      <svg
                        fill="#ffffff"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M21.71,20.29,18,16.61A9,9,0,1,0,16.61,18l3.68,3.68a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,20.29ZM11,18a7,7,0,1,1,7-7A7,7,0,0,1,11,18Z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Quick Filters */}
                  <div className="flex items-center gap-2 w-full justify-center px-2">
                    <button
                      type="button"
                      onClick={() => handleQuickFilter(7)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg cursor-pointer shadow-sm transition-colors text-xs font-semibold ${
                        quickFilter === "7"
                          ? "bg-[#8b0a24] text-white"
                          : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-700"
                      }`}
                    >
                      Last 7 days
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFilter(14)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg cursor-pointer shadow-sm transition-colors text-xs font-semibold ${
                        quickFilter === "14"
                          ? "bg-[#8b0a24] text-white"
                          : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-700"
                      }`}
                    >
                      Last 14 days
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFilter(28)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg cursor-pointer shadow-sm transition-colors text-xs font-semibold ${
                        quickFilter === "28"
                          ? "bg-[#8b0a24] text-white"
                          : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-700"
                      }`}
                    >
                      Last 28 days
                    </button>
                  </div>
                </div>

                {/* Calendar Dropdown Popup Modal */}
                {showCalendar && (
                  <div
                    ref={calendarRef}
                    className="absolute left-2 right-2 sm:left-4 sm:right-auto sm:w-[320px] top-[105px] z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-fadeIn"
                  >
                    {/* Month & Year Selection */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={calendarMonth.getMonth()}
                          onChange={(e) => {
                            const newDate = new Date(calendarMonth);
                            newDate.setMonth(parseInt(e.target.value));
                            setCalendarMonth(newDate);
                          }}
                          className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                        >
                          {monthsList.map((m, idx) => (
                            <option key={m} value={idx}>
                              {m}
                            </option>
                          ))}
                        </select>

                        <select
                          value={calendarMonth.getFullYear()}
                          onChange={(e) => {
                            const newDate = new Date(calendarMonth);
                            newDate.setFullYear(parseInt(e.target.value));
                            setCalendarMonth(newDate);
                          }}
                          className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                        >
                          {yearsList.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                          className="w-7 h-7 flex items-center justify-center bg-pink-50 hover:bg-pink-100 text-[#8b0a24] rounded-md font-bold text-xs cursor-pointer"
                        >
                          &lt;
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                          className="w-7 h-7 flex items-center justify-center bg-pink-50 hover:bg-pink-100 text-[#8b0a24] rounded-md font-bold text-xs cursor-pointer"
                        >
                          &gt;
                        </button>
                      </div>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-700 mb-1.5">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {Array.from({ length: startDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-8"></div>
                      ))}

                      {daysInMonth.map((day) => {
                        const isStart = isSameDay(day, startDate);
                        const isEnd = isSameDay(day, endDate);
                        const inRange =
                          isWithinInterval(day, { start: startDate, end: endDate });

                        return (
                          <button
                            type="button"
                            key={day.toISOString()}
                            onClick={() => handleDateClick(day)}
                            className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition cursor-pointer ${
                              isStart || isEnd
                                ? "bg-[#8b0a24] text-white shadow-sm"
                                : inRange
                                ? "bg-[#fde8ec] text-[#8b0a24]"
                                : "hover:bg-gray-100 text-gray-800"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    {/* Apply button */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="bg-[#8b0a24] hover:bg-[#72081d] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm cursor-pointer"
                      >
                        Apply Date Range
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sport Bonus Dropdown Button Row */}
            <div className="w-full flex relative items-center justify-end mr-4 p-1.5 z-[10] cursor-pointer">
              <div ref={dropdownRef} className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setShowBonusDropdown(!showBonusDropdown)}
                  className="text-xs bg-[#8b0a24] font-medium text-white px-4 py-1.5 flex flex-row items-center rounded-lg shadow-sm hover:bg-[#72081d] transition"
                >
                  <span className="flex font-lato items-center text-xs font-semibold">
                    {bonusType}
                  </span>
                  <span className={`flex items-center ml-2 transition-transform duration-200 ${showBonusDropdown ? "rotate-0" : "-rotate-180"}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      transform="rotate(180)"
                      viewBox="0 0 512 512"
                      height="12"
                      width="12"
                      fill="#ffffff"
                    >
                      <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
                    </svg>
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showBonusDropdown && (
                  <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fadeIn">
                    {bonusOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setBonusType(opt);
                          setShowBonusDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 flex items-center justify-between ${
                          bonusType === opt ? "text-[#8b0a24] font-bold bg-pink-50/50" : "text-gray-700"
                        }`}
                      >
                        {opt}
                        {bonusType === opt && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8b0a24]"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Statement List / Empty State */}
            <div className="w-full flex-1 flex flex-col p-2">
              {loading ? (
                <div className="w-full min-h-[calc(100dvh-200px)] flex items-center justify-center flex-col py-10">
                  <div className="w-8 h-8 border-3 border-[#8b0a24] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 font-medium mt-2">
                    Loading bonus statement...
                  </p>
                </div>
              ) : statements.length > 0 ? (
                <div className="flex flex-col gap-2.5 py-2">
                  {statements.map((stmt, idx) => {
                    const amount = Number(
                      stmt?.amount ||
                      stmt?.bonusAmount ||
                      stmt?.netAmount ||
                      0
                    );
                    const dateStr = stmt?.createdAt
                      ? format(new Date(stmt.createdAt), "dd MMM yyyy, hh:mm a")
                      : "N/A";

                    return (
                      <div
                        key={stmt?._id || idx}
                        className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">
                            {stmt?.remark ||
                              stmt?.narration ||
                              stmt?.bonusTitle ||
                              `${bonusType} Credited`}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {dateStr}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-bold text-green-600">
                            +₹{Math.abs(amount).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-green-700 font-medium px-2 py-0.5 bg-green-50 rounded-full block mt-0.5">
                            {stmt?.status || "CLAIMED"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Exact Document with Magnifying Glass Illustration Empty State */
                <div className="w-full min-h-[calc(100dvh-200px)] flex items-center justify-center flex-col py-6">
                  <div
                    role="button"
                    aria-label="animation"
                    tabIndex="0"
                    style={{
                      width: "300px",
                      height: "300px",
                      overflow: "hidden",
                      margin: "0px auto",
                      outline: "none",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 642 642"
                      width="300"
                      height="300"
                      preserveAspectRatio="xMidYMid meet"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <defs>
                        <clipPath id="__lottie_bonus_bg">
                          <rect width="642" height="642" x="0" y="0"></rect>
                        </clipPath>
                      </defs>
                      <g clipPath="url(#__lottie_bonus_bg)">
                        {/* Background Pastel Cloud Blob */}
                        <path
                          fill="#FDE8E8"
                          d="M 280 180 C 420 190 490 270 480 370 C 470 470 380 500 280 490 C 180 480 150 420 160 340 C 170 240 200 170 280 180 Z"
                        />

                        {/* Document Sheet */}
                        <g transform="translate(190, 160)">
                          <path
                            d="M 40 0 L 190 0 C 210 0 210 40 210 40 L 210 320 C 210 330 190 340 180 340 L 20 340 C 0 340 0 320 0 300 L 0 40 C 0 0 40 0 40 0 Z"
                            fill="#FFFFFF"
                            stroke="#9CA3AF"
                            strokeWidth="5"
                          />
                          {/* Fold */}
                          <path
                            d="M 170 0 L 210 40 L 170 40 Z"
                            fill="#9CA3AF"
                          />
                          {/* Roll */}
                          <path
                            d="M -10 310 C -10 340 30 350 160 350 C 180 350 180 330 180 330 L 10 330 C -10 330 -10 310 -10 310 Z"
                            fill="#9CA3AF"
                          />
                          {/* Text Lines */}
                          <line
                            x1="40"
                            y1="80"
                            x2="150"
                            y2="80"
                            stroke="#9CA3AF"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                          <line
                            x1="40"
                            y1="130"
                            x2="170"
                            y2="130"
                            stroke="#9CA3AF"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                          <line
                            x1="40"
                            y1="180"
                            x2="130"
                            y2="180"
                            stroke="#9CA3AF"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                          <line
                            x1="40"
                            y1="230"
                            x2="80"
                            y2="230"
                            stroke="#9CA3AF"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                        </g>

                        {/* Magnifying Glass Illustration */}
                        <g transform="translate(290, 240)">
                          <circle
                            cx="70"
                            cy="70"
                            r="48"
                            fill="#ECFDF5"
                            opacity="0.8"
                          />
                          <circle
                            cx="70"
                            cy="70"
                            r="48"
                            fill="none"
                            stroke="#DC2626"
                            strokeWidth="10"
                          />
                          <circle
                            cx="70"
                            cy="70"
                            r="42"
                            fill="#FFFFFF"
                            opacity="0.9"
                          />
                          {/* Handle */}
                          <line
                            x1="105"
                            y1="105"
                            x2="145"
                            y2="145"
                            stroke="#DC2626"
                            strokeWidth="14"
                            strokeLinecap="round"
                          />
                        </g>
                      </g>
                    </svg>
                  </div>
                  <span className="text-gray-600 font-normal text-center text-sm sm:text-base mt-2">
                    No data found for selected date range...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

BonusStatementPage.Element = function Element() {
  return <BonusStatementPage />;
};
