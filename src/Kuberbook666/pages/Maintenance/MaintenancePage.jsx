import React from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

export default function MaintenancePage({ title }) {
  const location = useLocation();

  // Infer title from pathname if not directly passed
  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname.toLowerCase();
    if (path.includes("download-apk") || path.includes("download")) return "Download APK";
    if (path.includes("blogs") || path.includes("news")) return "Blogs & News";
    if (path.includes("responsible-gambling")) return "Responsible Gambling";
    if (path.includes("privacy-policy")) return "Privacy Policy";
    if (path.includes("exclusion-policy")) return "Exclusion Policy";
    if (path.includes("rules-regulations") || path.includes("rules")) return "Rules & Regulations";
    return "Service Maintenance";
  };

  const currentTitle = getPageTitle();

  return (
    <div className="w-full flex justify-center py-6 px-3 md:px-6">
      <div
        className="w-full md:mt-[0px] lg:overflow-auto lg:w-[54%] flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl bg-bg_color_primary shadow-sm border border-border_color_primary1"
        style={{ minHeight: "calc(100dvh - 180px)" }}
      >
        {/* Animated Maintenance Illustration SVG */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-amber-500/10 via-amber-500/5 to-transparent flex items-center justify-center animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-20 md:w-24 md:h-24 text-[#e28424]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Construction Cone / Tool Wrench */}
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              <path d="M8.5 15.5l-3.5 3.5" />
              <circle cx="12" cy="12" r="1" />
            </svg>
          </div>
          {/* Gear overlay */}
          <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-bg_color_primary shadow-md border border-border_color_primary1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-amber-500 animate-spin"
              style={{ animationDuration: "10s" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
        </div>

        {/* Maintenance Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span>UNDER MAINTENANCE</span>
        </div>

        {/* Dynamic Title */}
        <h2 className="text-xl md:text-2xl font-bold text-text_color_primary1 mb-2">
          {currentTitle}
        </h2>

        {/* Description */}
        <p className="text-xs md:text-sm text-text_Ternary max-w-md mx-auto mb-6 leading-relaxed">
          This section is currently undergoing scheduled maintenance &amp; upgrades to serve you better. We apologize for the inconvenience and will be back shortly!
        </p>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#871128] hover:bg-[#a01531] text-white font-bold text-xs md:text-sm shadow-md active:scale-95 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}

MaintenancePage.propTypes = {
  title: PropTypes.string,
};
