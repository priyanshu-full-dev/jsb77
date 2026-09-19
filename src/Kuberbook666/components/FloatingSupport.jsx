import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const FloatingSupport = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  const siteDetails = useSelector((state) => state?.site?.siteDetails);
  const whatsappNumber = siteDetails?.support_contact_number || "16093083535";
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber.replace(/[^0-9]/g, "")}&text=Hi&type=phone_number&app_absent=0`;
  const telegramUrl = siteDetails?.telegram_channel
    ? siteDetails.telegram_channel.startsWith("http")
      ? siteDetails.telegram_channel
      : `https://t.me/${siteDetails.telegram_channel}`
    : "https://t.me/kuberbookoffer";

  if (!isHomePage) return null;

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Floating WhatsApp Contact Button (Bottom Left) */}
      <div
        title="WhatsAppContact"
        onClick={handleWhatsAppClick}
        className="fixed cursor-pointer top-[calc(95dvh-64px)] left-3 z-50 flex w-max h-max items-center justify-center rounded-full transition-all duration-300 opacity-100 select-none"
      >
        <div className="h-full bg-transparent mt-[-3px] ml-[-3px]">
          <img
            src="/assets/wp_support-gWbb3nPa.webp"
            alt="WP_Support"
            width="60"
            className="w-[56px] md:w-[62px] hover:scale-110 active:scale-95 transition-all duration-300 drop-shadow-lg"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/assets/wp_support-gWbb3nPa.webp";
            }}
          />
        </div>
      </div>

      {/* Floating Telegram Button (Bottom Right) with Repeating Green Background Wave */}
      <div className="fixed cursor-pointer top-[calc(95dvh-64px)] right-3 z-50 flex items-center justify-center select-none transition-all duration-300">
        <div className="relative flex items-center justify-center telegram1">
          {/* Green Wave jo har 1 second me background se bahar nikalti hai aur fade ho jati hai (resting bg transparent rhta hai) */}
          <span className="absolute inset-0 rounded-xl bg-[#40af52] telegram-green-wave pointer-events-none"></span>

          {/* Telegram Main Blue Button */}
          <a
            title={telegramUrl}
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center justify-center rounded-xl bg-[#2AABEE] hover:bg-[#039be5] size-[46px] md:size-[50px] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg opacity-100"
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
                  fill="#fff"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_140_22026">
                  <rect
                    width="24"
                    height="24"
                    fill="white"
                    transform="translate(0.5)"
                  ></rect>
                </clipPath>
              </defs>
            </svg>
          </a>
        </div>
      </div>
    </>
  );
};

export default FloatingSupport;
