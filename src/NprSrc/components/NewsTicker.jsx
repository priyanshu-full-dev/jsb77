import { useState, useEffect, useRef } from "react";

const announcements = [
  "JSB77 मा स्वागत छ!! JSB77 मार्फत जुनसुकै बेला र जहाँसुकै",
  "आनन्द लिनुहोस्! अहिले नै हामीसँग सामेल हुनुहोस् र थप प्रचारहरू",
];

const NewsTicker = () => {
  const containerRef = useRef(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const currentIndexRef = useRef(0);

  // Auto vertical scroll cycling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (isUserInteracting) return;
      currentIndexRef.current = (currentIndexRef.current + 1) % announcements.length;
      container.scrollTo({
        top: currentIndexRef.current * 20,
        behavior: "smooth",
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [isUserInteracting]);

  // Keep track of scroll position when user manually scrolls
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const currentIdx = Math.round(container.scrollTop / 20) % announcements.length;
    currentIndexRef.current = currentIdx;
  };

  return (
    <div className="mx-2.5 mt-[6px] mb-[8px] sm:mx-3 select-none">
      <div className="bg-white border-[1.5px] border-[#2b6be4] rounded-full pl-3.5 pr-3 py-1 flex items-center gap-2.5 shadow-xs overflow-hidden h-[33px]">
        {/* Exact Blue Loudspeaker Icon */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <svg
            className="w-[17px] h-[17px] text-[#004bbd] flex-shrink-0"
            viewBox="2.5 2.5 19 19"
            fill="currentColor"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        </div>

        {/* Vertically Scrollable Announcement Text (Scrollable on drag/wheel + Auto-scrolling) */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsUserInteracting(true)}
          onMouseLeave={() => setIsUserInteracting(false)}
          onTouchStart={() => setIsUserInteracting(true)}
          onTouchEnd={() => {
            setTimeout(() => setIsUserInteracting(false), 2500);
          }}
          className="flex-1 h-[20px] overflow-y-auto scroll-smooth snap-y snap-mandatory cursor-ns-resize npr-no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Looped items for continuous scroll */}
          {[...announcements, ...announcements, ...announcements].map((text, idx) => (
            <div
              key={idx}
              className="h-[20px] flex items-center snap-center"
            >
              <p className="text-[11px] sm:text-[11.5px] font-medium text-[#1c55ba] whitespace-nowrap leading-none select-none tracking-tight">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;

