import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { nprBanners } from "../data/nprMockData";

const HeroCarousel = ({ onActionClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mouseStartX = useRef(0);
  const isDragging = useRef(false);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % nprBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Touch handlers
  const handleTouchStart = (e) => {
    const x = e.targetTouches[0].clientX;
    touchStartX.current = x;
    touchEndX.current = x;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swiped Left -> Next Slide
      setCurrentIndex((prev) => (prev + 1) % nprBanners.length);
    } else if (diff < -45) {
      // Swiped Right -> Previous Slide
      setCurrentIndex((prev) => (prev - 1 + nprBanners.length) % nprBanners.length);
    }
  };

  // Mouse drag handlers (for desktop testing)
  const handleMouseDown = (e) => {
    isDragging.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = mouseStartX.current - e.clientX;
    if (diff > 45) {
      setCurrentIndex((prev) => (prev + 1) % nprBanners.length);
    } else if (diff < -45) {
      setCurrentIndex((prev) => (prev - 1 + nprBanners.length) % nprBanners.length);
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none bg-white cursor-pointer"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        isDragging.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onActionClick}
    >
      {/* 1 Slide = Exactly 1 Single Complete Image (No cut-offs, No adjacent slide bleed) */}
      <div className="relative w-full aspect-[492/325] overflow-hidden bg-white">
        {nprBanners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${idx === currentIndex
              ? "opacity-100 z-10 pointer-events-auto"
              : "opacity-0 z-0 pointer-events-none"
              }`}
          >
            <img
              src={banner.image}
              alt={banner.title || `JSB77 Promo Banner ${idx + 1}`}
              className="w-full h-full object-cover object-center block"
              loading={idx === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Pagination Indicator Dots */}
      <div
        className="absolute bottom-2.5 right-4 flex items-center gap-[5px] z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {nprBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full w-[9px] h-[9px] cursor-pointer ${idx === currentIndex
              ? "bg-white shadow-sm scale-105"
              : "bg-white/55 hover:bg-white/80"
              }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

HeroCarousel.propTypes = {
  onActionClick: PropTypes.func,
};

export default HeroCarousel;
