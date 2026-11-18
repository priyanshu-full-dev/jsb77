import { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

const AppDownloadBanner = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="npr-download-bar flex items-center justify-between px-3 py-2 text-white border-b border-blue-900/60 text-xs">
      {/* Left: App Logo + Info */}
      <div className="flex items-center gap-2.5">
        <img
          src="/npr/app_download_icon_npr77f7_20251223131424.webp"
          alt="NPR77 App Icon"
          className="w-10 h-10 rounded-lg object-contain shadow-sm border border-blue-400/40 flex-shrink-0"
        />
        <div>
          <div className="font-extrabold text-sm tracking-wide text-white leading-none">NPR77</div>
          <div className="flex items-center text-[#ffbe18] gap-0.5 text-[10px] mt-1">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
          </div>
        </div>
      </div>

      {/* Right: Download Button + Close */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => alert("Downloading NPR77 APK app...")}
          className="bg-white hover:bg-gray-100 text-[#003da5] font-extrabold text-xs px-4 py-1.5 rounded-md shadow transition transform active:scale-95"
        >
          {t("Download")}
        </button>
        <button
          onClick={() => setVisible(false)}
          className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white/80 transition"
          aria-label="Close download banner"
        >
          <FaTimes size={11} />
        </button>
      </div>
    </div>
  );
};

export default AppDownloadBanner;

