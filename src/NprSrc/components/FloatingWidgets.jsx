import { useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaChevronLeft, FaChevronDown } from "react-icons/fa";

const FloatingWidgets = ({ onOpenFeatured }) => {
  const [videoVisible, setVideoVisible] = useState(true);
  const [activeDot, setActiveDot] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* 1. Video Teaser Section (Gates of Olympus Big Win) */}
      {videoVisible && (
        <div className="w-full relative select-none bg-[#f4f7fb]">
          <div className="relative w-full aspect-[512/182] overflow-hidden bg-black shadow-xs">
            {/* The exact high-res Gates of Olympus video banner */}
            <img
              src="/npr/gates_of_olympus_video.jpg"
              alt="Rare One Tumble Gates of Olympus - DAILY Degens"
              className="w-full h-full object-cover object-[center_18%] cursor-pointer block"
              onClick={() => setModalOpen(true)}
              draggable={false}
            />

            {/* Left slide chevron navigation arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDot((prev) => (prev - 1 + 3) % 3);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-9 bg-blue-600/80 hover:bg-blue-600 text-white rounded-r-md flex items-center justify-center transition shadow-md z-10"
              title="Previous Video"
            >
              <FaChevronLeft size={11} />
            </button>
          </div>

          {/* 3 Pagination Dots below Video Banner - Seamless uniform background color */}
          <div className="flex items-center justify-center gap-2 pt-2.5 pb-2.5 bg-[#f4f7fb]">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveDot(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === activeDot
                    ? "w-[8px] h-[8px] bg-[#0052cc]"
                    : "w-[8px] h-[8px] bg-[#c2d3f2] hover:bg-[#a6c0ee]"
                }`}
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
                  RARE ONE TUMBLE GATES OF OLYMPUS
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Video Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Gates of Olympus Big Win"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#0a1020] flex items-center justify-between text-xs text-slate-300">
              <span>Channel: <strong className="text-white">DAILY Degens</strong></span>
              <a
                href="https://www.youtube.com/results?search_query=gates+of+olympus+rare+one+tumble+daily+degens"
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
              Featured<br />Games
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

