import React, { useMemo } from "react";
import { selectSiteHeaderColor } from "../../../utils/helper/commonSelectors";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";

const BallbyBallRes = ({ isOpen, onClose, gameId: gmid, result, gameName }) => {
  const headerColor = useSelector(selectSiteHeaderColor());


  /* ================= FIX START ================= */

  const TV_DOMAIN = "https://aura444.com/api/users";

  const videoUrl = useMemo(() => {
    const raw = result?.streamUrl;

    if (raw === null || raw === undefined || typeof raw !== "string") {
      return null;
    }

    const url = raw.trim();

    if (!url) {
      return null;
    }

    if (url.includes("{$domain}")) {
      return url.replace("{$domain}", TV_DOMAIN);
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${TV_DOMAIN}${url.startsWith("/") ? "" : "/"}${url}`;
  }, [result?.streamUrl]);

  /* ================= FIX END ================= */

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999999]  font-[Tahoma,Helvetica,sans-serif] flex items-start justify-center bg-black bg-opacity-50 px-2"
        >
          <motion.div
            initial={{ scale: 0.9, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-md shadow-lg border w-full sm:w-[400px] overflow-hidden relative max-h-[87vh] top-[8px] flex flex-col"
          >
            {/* Header */}
            <div
              className="relative flex items-center justify-center px-4 py-2 text-white font-bold text-sm sm:text-base"
              style={{
                background: `linear-gradient(180deg, ${headerColor?.start || "#0d47a1"
                  }, ${headerColor?.end || "#1976d2"})`,
              }}
            >
              <span className="text-start w-full"> {"Ball By Ball"}</span>
              <button
                onClick={onClose}
                className="absolute text-[18px] font-bold right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto">
              {/* Round Id */}
              <div className="text-end text-[12px] text-black py-2 px-3">
                <span className="font-bold">
                  Round Id: {result?.marketId}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-1 items-center  border-b border-[#ccc]">
                <div className="w-full h-[200px] bg-[black]">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center flex justify-center items-center w-full py-4 border-t border-[#ccc]">
                  <button class="bg-[#198754] flex items-center justify-center gap-2 text-white font-bold text-[14px] px-4 py-2 rounded">
                    {result?.result} <FaTrophy />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BallbyBallRes;
