import { Link, useLocation } from "react-router-dom";
import { preloadRoute } from "../Kuberbook666Routes";

export default function TopNavChips() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  return (
    <div className="relative">
      <div className="flex overflow-x-auto no-scrollbar w-full bg-bg_Quaternary p-1 items-start md:items-center md:justify-center">
        {/* Home */}
        <Link to="/" onMouseEnter={() => preloadRoute("home")} onTouchStart={() => preloadRoute("home")}>
          <button
            className={`text-xs cursor-pointer uppercase hide-border-in-dark mr-1 active:border-primary rounded-full text-nowrap whitespace-nowrap font-semibold bg-bg_Ternary8 hover:bg-bg_Ternary9 border w-max px-3 py-1 text-text_HeaderDeskNavMenu md:hidden ${
              path === "/" ? "border-primary border-[#c10831]" : "border-transparent"
            }`}
          >
            <span className="flex flex-row items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 576 512" fill="currentColor">
                <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"></path>
              </svg>
              <span className="font font-lato text-[12px]">Home</span>
            </span>
          </button>
        </Link>

        {/* SPORTS */}
        <Link to="/sports" onMouseEnter={() => preloadRoute("sports")} onTouchStart={() => preloadRoute("sports")}>
          <button
            className={`text-xs cursor-pointer uppercase border mr-1 hide-border-in-dark active:border-primary rounded-full text-nowrap whitespace-nowrap font-semibold bg-bg_Ternary8 hover:bg-bg_Ternary9 w-max px-3 py-1 text-text_HeaderDeskNavMenu md:hidden ${
              path.startsWith("/sports") ? "border-primary border-[#c10831]" : "border-transparent"
            }`}
          >
            <span className="flex w-full items-center h-full gap-3">
              <span className="flex flex-row items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" height="16" width="16">
                  <path d="M400 0L176 0c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8L24 64C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9L192 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l192 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-26.1 0C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24L446.4 64c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112l84.4 0c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6l84.4 0c-5.1 66.3-31.1 111.2-63 142.3z"></path>
                </svg>
                <span className="font font-lato text-[12px] ml-[4px]">SPORTS</span>
              </span>
            </span>
          </button>
        </Link>

        {/* Cricket */}
        <Link to="/sports" onMouseEnter={() => preloadRoute("sports")} onTouchStart={() => preloadRoute("sports")}>
          <button className="text-xs gap-1 cursor-pointer uppercase mr-1 active:border-primary hide-border-in-dark rounded-full text-nowrap whitespace-nowrap font-semibold bg-bg_Ternary8 hover:bg-bg_Ternary9 border w-max px-2 py-1 text-text_HeaderDeskNavMenu hidden md:flex">
            <svg width="16" height="16" viewBox="0 0 19 18" xmlns="http://www.w3.org/2000/svg" fill="var(--cricket-icon-color)">
              <circle cx="9.5" cy="9" r="8.5" fill="#ffffff" />
              <path d="M4.36255 16.7108C4.35063 16.7037 4.34109 16.6966 4.32917 16.6895C3.88333 16.4077 3.4518 16.107 3.05842 15.7566C2.91299 15.6263 2.77709 15.489 2.63404 15.3564C2.59828 15.3256 2.61974 15.3067 2.63642 15.283C2.81524 15.0533 2.99643 14.8213 3.17524 14.5916C3.92148 13.635 4.6701 12.676 5.41634 11.7194C6.27225 10.6231 7.12578 9.52678 7.98169 8.43047C8.8066 7.37204 9.6339 6.31125 10.4588 5.25282C11.329 4.14231 12.1969 3.02942 13.0647 1.9189C13.2292 1.70816 13.3961 1.49506 13.5582 1.28195C13.5797 1.25354 13.5916 1.24644 13.6274 1.26538C13.9468 1.45244 14.2472 1.67028 14.5333 1.90233C14.6692 2.01125 14.8123 2.1107 14.9458 2.22199C15.0817 2.34038 15.2128 2.46351 15.3439 2.58663C15.3773 2.61742 15.3535 2.63162 15.3368 2.65293C15.1008 2.95602 14.8623 3.26147 14.6263 3.56455C13.9254 4.46433 13.222 5.36411 12.5211 6.26389C11.7343 7.27259 10.9476 8.28129 10.1584 9.29C9.42648 10.2277 8.69693 11.1653 7.965 12.103C7.12101 13.1827 6.2794 14.2648 5.43542 15.3446C5.08971 15.7874 4.7464 16.2278 4.40069 16.6706C4.39116 16.6848 4.38401 16.7037 4.36255 16.7108Z" fill="var(--cricket-icon-color)"></path>
            </svg>
            <span className="font font-lato text-[12px]">Cricket</span>
          </button>
        </Link>

        {/* Aura */}
        <Link to="/aura" onMouseEnter={() => preloadRoute("casino")} onTouchStart={() => preloadRoute("casino")}>
          <button
            className={`text-xs cursor-pointer uppercase border mr-1 active:border-primary hide-border-in-dark rounded-full text-nowrap whitespace-nowrap font-semibold bg-bg_Ternary8 hover:bg-bg_Ternary9 w-max px-3 py-1 text-text_HeaderDeskNavMenu ${
              path.startsWith("/aura") ? "border-primary border-[#c10831]" : "border-transparent"
            }`}
          >
            <span className="flex w-full items-center h-full gap-3">
              <span className="flex flex-row items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 511.643 511.643" fill="#c10831">
                  <path d="M453.209 184.081C373.725 121.725 300.804 41.437 270.565 6.713c-7.795-8.951-21.691-8.951-29.486 0-30.24 34.723-103.16 115.011-182.644 177.368C22.372 212.373 1.267 254.915 1.267 299.99c0 80 66.652 144.853 148.871 144.853 27.807 0 53.101-10.455 71.97-27.539v28.247c0 34.386-24.644 38.65-43.766 54.707-4.599 3.862-1.775 11.384 4.23 11.384h145.994c5.984 0 8.811-7.47 4.262-11.358-18.926-16.176-43.294-19.786-43.294-54.478v-28.503c18.869 17.084 44.163 27.539 71.97 27.539 82.219 0 148.871-64.853 148.871-144.853.001-45.074-21.104-87.616-57.166-115.908z" fill="#c10831"></path>
                </svg>
                <span className="font font-lato text-[12px] ml-[4px]">Aura</span>
              </span>
            </span>
          </button>
        </Link>

        {/* MAC88 */}
        <Link to="/mac88" onMouseEnter={() => preloadRoute("casino")} onTouchStart={() => preloadRoute("casino")}>
          <button
            className={`text-xs cursor-pointer uppercase border mr-1 active:border-primary hide-border-in-dark rounded-full text-nowrap whitespace-nowrap font-semibold bg-bg_Ternary8 hover:bg-bg_Ternary9 w-max px-3 py-1 text-text_HeaderDeskNavMenu ${
              path.startsWith("/mac88") ? "border-primary border-[#c10831]" : "border-transparent"
            }`}
          >
            <span className="flex w-full items-center h-full gap-3">
              <span className="flex flex-row items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 48 48">
                  <path fill="#333" d="M43.8 31.1 25.4 1.4c-.2-.3-.5-.6-.9-.7-.4-.1-.8 0-1.1.2L.8 14.8c-.3.2-.6.5-.7.9-.1.4 0 .8.2 1.1l18.3 29.8c.3.5.8.7 1.3.7.3 0 .5-.1.8-.2l22.6-13.9c.3-.2.6-.5.7-.9.1-.4 0-.8-.2-1.2z"></path>
                  <path fill="#d2d2d2" d="M8.7 6.5h26.6v35H8.7z" transform="rotate(-31.647 22.023 23.998)"></path>
                  <path fill="#e44b4b" d="M39.3 26.4c0 3.7-6.2 7.3-6.2 7.3S27 30.1 27 26.4c0-1.8 1.5-3.3 3.3-3.3 1.3 0 2.3.7 2.9 1.8.5-1 1.6-1.8 2.9-1.8 1.8 0 3.2 1.4 3.2 3.3z"></path>
                </svg>
                <span className="font font-lato text-[12px] ml-[4px]">MAC88</span>
              </span>
            </span>
          </button>
        </Link>

        {/* Live Casino */}
        <Link to="/live-casino" onMouseEnter={() => preloadRoute("live-casino")} onTouchStart={() => preloadRoute("live-casino")}>
          <button
            className={`text-xs cursor-pointer uppercase border mr-1 active:border-primary hide-border-in-dark rounded-full text-nowrap whitespace-nowrap font-semibold bg-bg_Ternary8 hover:bg-bg_Ternary9 w-max px-3 py-1 text-text_HeaderDeskNavMenu ${
              path.startsWith("/live-casino") ? "border-primary border-[#c10831]" : "border-transparent"
            }`}
          >
            <span className="flex w-full items-center h-full gap-3">
              <span className="flex flex-row items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 48 48">
                  <path fill="#333" d="M43.8 31.1 25.4 1.4c-.2-.3-.5-.6-.9-.7-.4-.1-.8 0-1.1.2L.8 14.8c-.3.2-.6.5-.7.9-.1.4 0 .8.2 1.1l18.3 29.8c.3.5.8.7 1.3.7.3 0 .5-.1.8-.2l22.6-13.9c.3-.2.6-.5.7-.9.1-.4 0-.8-.2-1.2z"></path>
                  <path fill="#d2d2d2" d="M8.7 6.5h26.6v35H8.7z" transform="rotate(-31.647 22.023 23.998)"></path>
                  <path fill="#e44b4b" d="M39.3 26.4c0 3.7-6.2 7.3-6.2 7.3S27 30.1 27 26.4c0-1.8 1.5-3.3 3.3-3.3 1.3 0 2.3.7 2.9 1.8.5-1 1.6-1.8 2.9-1.8 1.8 0 3.2 1.4 3.2 3.3z"></path>
                </svg>
                <span className="font font-lato text-[12px] ml-[4px]">Live Casino</span>
              </span>
            </span>
          </button>
        </Link>

        {/* Aviator / Crash */}
        <Link to="/crash" onMouseEnter={() => preloadRoute("casino")} onTouchStart={() => preloadRoute("casino")}>
          <button
            className={`text-xs cursor-pointer uppercase border mr-1 active:border-primary hide-border-in-dark rounded-full text-nowrap whitespace-nowrap font-semibold bg-bg_Ternary8 hover:bg-bg_Ternary9 w-max px-3 py-1 text-text_HeaderDeskNavMenu ${
              path.startsWith("/crash") || path.startsWith("/aviator") ? "border-primary border-[#c10831]" : "border-transparent"
            }`}
          >
            <span className="flex w-full items-center h-full gap-3">
              <span className="flex flex-row items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.2208 25.2081C8.58995 23.849 8.72593 21.3034 10.4923 20.1258L22.5839 12.7529L30.5466 12.458L39.7792 6.91839C46.1332 3.10599 53.757 2.0196 60.923 3.90539C62.9758 10.2502 62.0646 17.1819 58.4418 22.7807L51.1908 33.9869L50.6009 42.2446L42.3433 54.3361C41.4141 55.0795 40.1911 55.3464 39.0367 55.0578L38.8483 55.0107C38.6265 54.9553 38.424 54.8406 38.2623 54.6789L37.9195 54.3361L32.611 45.7836L26.1229 46.6683L21.1093 41.6547L16.6855 36.9361L17.8652 30.153L10.4923 25.4343L10.2208 25.2081ZM52.9603 19.2411C52.9603 23.4759 49.5273 26.9089 45.2925 26.9089C41.0576 26.9089 37.6246 23.4759 37.6246 19.2411C37.6246 15.0062 41.0576 11.5732 45.2925 11.5732C49.5273 11.5732 52.9603 15.0062 52.9603 19.2411ZM17.376 44.2883L2 58.9329L4.01489 61.0484L19.3909 46.4039L17.376 44.2883ZM10.2577 58.9316L21.2972 48.4172L23.3121 50.5327L12.2725 61.0471L10.2577 58.9316ZM13.0396 40.1595L2 50.6739L4.01489 52.7894L15.0545 42.275L13.0396 40.1595Z" fill="#c10831"></path>
                </svg>
                <span className="font font-lato text-[12px] ml-[4px]">AVIATOR</span>
              </span>
            </span>
          </button>
        </Link>

        {/* SLOTS */}
        <Link to="/slots" onMouseEnter={() => preloadRoute("casino")} onTouchStart={() => preloadRoute("casino")}>
          <button
            className={`text-xs cursor-pointer uppercase border mr-1 active:border-primary hide-border-in-dark rounded-full text-nowrap whitespace-nowrap font-semibold bg-bg_Ternary8 hover:bg-bg_Ternary9 w-max px-3 py-1 text-text_HeaderDeskNavMenu ${
              path.startsWith("/slots") ? "border-primary border-[#c10831]" : "border-transparent"
            }`}
          >
            <span className="flex w-full items-center h-full gap-3">
              <span className="flex flex-row items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_1245_1520)">
                    <path d="M13.5056 3H5.50562C4.13062 3 3.00562 4.125 3.00562 5.5V13.5C3.00562 14.875 4.13062 16 5.50562 16H13.5056C14.8806 16 16.0056 14.875 16.0056 13.5V5.5C16.0056 4.125 14.8806 3 13.5056 3ZM6.50562 14C5.67762 14 5.00562 13.328 5.00562 12.5C5.00562 11.672 5.67762 11 6.50562 11C7.33362 11 8.00562 11.672 8.00562 12.5C8.00562 13.328 7.33362 14 6.50562 14ZM6.50562 8C5.67762 8 5.00562 7.328 5.00562 6.5C5.00562 5.672 5.67762 5 6.50562 5C7.33362 5 8.00562 5.672 8.00562 6.5C8.00562 7.328 7.33362 8 6.50562 8ZM9.50562 11C8.67762 11 8.00562 10.328 8.00562 9.5C8.00562 8.672 8.67762 8 9.50562 8C10.3336 8 11.0056 8.672 11.0056 9.5C11.0056 10.328 10.3336 11 9.50562 11ZM12.5056 14C11.6776 14 11.0056 13.328 11.0056 12.5C11.0056 11.672 11.6776 11 12.5056 11C13.3336 11 14.0056 11.672 14.0056 12.5C14.0056 13.328 13.3336 14 12.5056 14ZM12.5056 8C11.6776 8 11.0056 7.328 11.0056 6.5C11.0056 5.672 11.6776 5 12.5056 5C13.3336 5 14.0056 5.672 14.0056 6.5C14.0056 7.328 13.3336 8 12.5056 8ZM12.9546 2C12.7216 0.862 11.7096 0 10.5056 0H2.50562C1.13062 0 0.00561523 1.125 0.00561523 2.5V10.5C0.00561523 11.704 0.867615 12.716 2.00562 12.949V3C2.00562 2.45 2.45562 2 3.00562 2H12.9546Z" fill="#c10831"></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_1245_1520">
                      <rect width="16" height="16" fill="white" transform="translate(0.00561523)"></rect>
                    </clipPath>
                  </defs>
                </svg>
                <span className="font font-lato text-[12px] ml-[4px]">SLOTS</span>
              </span>
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
}
