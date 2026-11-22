import { useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

const youtubeVideos = [
  {
    id: 1,
    title: "I PLAYED EVERY GATES OF OLYMPUS",
    channel: "Fly",
    image: "/npr/video_slide_1.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Fly+I+PLAYED+EVERY+GATES+OF+OLYMPUS",
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1",
  },
  {
    id: 2,
    title: "How much cash can I win with $2000",
    channel: "Casino King Games",
    image: "/npr/video_slide_2.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Casino+King+Games+How+much+cash+can+I+win+with+%242000",
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1",
  },
  {
    id: 3,
    title: "RARE ONE TUMBLE GATES OF OLYMPUS",
    channel: "DAILY Degens",
    image: "/npr/video_slide_3.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=gates+of+olympus+rare+one+tumble+daily+degens",
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1",
  },
];

const FloatingWidgets = ({ onOpenFeatured }) => {
  const { t } = useLanguage();
  const [videoVisible, setVideoVisible] = useState(true);
  const [activeDot, setActiveDot] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const currentVideo = youtubeVideos[activeDot] || youtubeVideos[0];

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setActiveDot((prev) => (prev - 1 + youtubeVideos.length) % youtubeVideos.length);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setActiveDot((prev) => (prev + 1) % youtubeVideos.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <>
      {/* 1. YouTube Video Carousel (3 Videos) */}
      {videoVisible && (
        <div className="w-full relative select-none bg-[#f4f7fb]">
          <div
            className="relative w-full aspect-[820/300] overflow-hidden bg-black shadow-xs cursor-pointer group"
            onClick={() => setModalOpen(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* The active video banner graphic */}
            <img
              src={currentVideo.image}
              alt={currentVideo.title}
              className="w-full h-full object-cover transition-opacity duration-300 block select-none pointer-events-none"
              draggable={false}
            />

            {/* Left slide chevron navigation arrow */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-9 bg-blue-600/80 hover:bg-blue-600 text-white rounded-r-md flex items-center justify-center transition shadow-md z-10 cursor-pointer"
              title="Previous Video"
              aria-label="Previous Video"
            >
              <FaChevronLeft size={11} />
            </button>

            {/* Right slide chevron navigation arrow */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-9 bg-blue-600/80 hover:bg-blue-600 text-white rounded-l-md flex items-center justify-center transition shadow-md z-10 cursor-pointer"
              title="Next Video"
              aria-label="Next Video"
            >
              <FaChevronRight size={11} />
            </button>
          </div>

          {/* 3 Pagination Dots below Video Banner */}
          <div className="flex items-center justify-center gap-2 pt-2.5 pb-2.5 bg-[#f4f7fb]">
            {youtubeVideos.map((vid, idx) => (
              <button
                key={vid.id}
                type="button"
                onClick={() => setActiveDot(idx)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeDot
                    ? "w-[9px] h-[9px] bg-[#0052cc]"
                    : "w-[8px] h-[8px] bg-[#c2d3f2] hover:bg-[#a6c0ee]"
                }`}
                title={`Video ${idx + 1}`}
                aria-label={`Video Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. Interactive YouTube Video Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0d1527] rounded-2xl overflow-hidden shadow-2xl border border-blue-500/40">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0a1020] border-b border-blue-900/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <h3 className="text-sm font-bold text-white truncate max-w-[280px]">
                  {currentVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Video Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src={currentVideo.embedUrl}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#0a1020] flex items-center justify-between text-xs text-slate-300">
              <span>Channel: <strong className="text-white">{currentVideo.channel}</strong></span>
              <a
                href={currentVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-bold underline"
              >
                Open in YouTube →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 3. Floating 3D "Featured Games" Badge (Fixed Lower-Right) */}
      <div className="fixed right-3 bottom-20 z-40 flex flex-col items-center gap-1.5 pointer-events-auto">
        <button
          onClick={onOpenFeatured}
          className="npr-floating-featured relative w-16 h-16 rounded-full shadow-2xl p-0.5 border-2 border-[#ffbe18] overflow-hidden group focus:outline-none bg-blue-900"
          title="Featured Games"
        >
          <img
            src="/games/SEXYBCRT-LOBBY-Dk461TCC.jpg"
            alt="Featured Games"
            className="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end justify-center pb-1">
            <span className="text-[7.5px] font-black text-[#ffbe18] uppercase tracking-tighter text-center leading-tight drop-shadow-md">
              {t("Featured Games")}
            </span>
          </div>
        </button>

        {/* Scroll down orange pill button */}
        <button
          onClick={() => window.scrollBy({ top: 380, behavior: "smooth" })}
          className="w-6 h-6 rounded-full bg-[#ff7a00] hover:bg-[#e06b00] text-white flex items-center justify-center shadow-md transition"
          title="Scroll Down"
        >
          <FaChevronDown size={10} />
        </button>
      </div>
    </>
  );
};

FloatingWidgets.propTypes = {
  onOpenFeatured: PropTypes.func,
};

export default FloatingWidgets;

