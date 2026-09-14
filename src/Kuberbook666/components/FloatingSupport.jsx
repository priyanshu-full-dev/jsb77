import React from "react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { useSelector } from "react-redux";

const FloatingSupport = () => {
  const siteDetails = useSelector((state) => state?.site?.siteDetails);
  const whatsappNumber = siteDetails?.support_contact_number || "919999999999";
  const telegramHandle = siteDetails?.telegram_channel || "kuberbook666_support";

  const openWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`, "_blank");
  };

  const openTelegram = () => {
    window.open(`https://t.me/${telegramHandle}`, "_blank");
  };

  return (
    <>
      {/* WhatsApp Floating Badge - Bottom Left */}
      <div className="fixed bottom-16 left-3 z-30 flex items-center select-none">
        <button
          onClick={openWhatsApp}
          aria-label="WhatsApp Support"
          className="group flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white pl-1.5 pr-2.5 py-1.5 rounded-full shadow-xl transition-all duration-200 active:scale-95 border-2 border-white/60"
        >
          <div className="w-7 h-7 rounded-full bg-white text-[#25D366] flex items-center justify-center text-lg shadow-sm">
            <FaWhatsapp />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[8px] font-black uppercase text-yellow-200 tracking-tighter">
              24x7 Support
            </span>
            <span className="text-[10px] font-black tracking-tight">WhatsApp</span>
          </div>
        </button>
      </div>

      {/* Telegram Floating Button - Bottom Right */}
      <div className="fixed bottom-16 right-3 z-30 select-none">
        <button
          onClick={openTelegram}
          aria-label="Telegram Channel"
          className="w-11 h-11 rounded-full bg-[#0088cc] hover:bg-[#0077b5] text-white flex items-center justify-center text-xl shadow-xl transition-all duration-200 active:scale-95 border-2 border-white/60"
        >
          <FaTelegramPlane className="ml-[-1px] mt-[1px]" />
        </button>
      </div>
    </>
  );
};

export default FloatingSupport;
