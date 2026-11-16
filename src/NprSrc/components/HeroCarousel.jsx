import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { nprBanners } from "../data/nprMockData";

const HeroCarousel = ({ onActionClick }) => {
  const banners = nprBanners;
  const total = banners.length;

  // Cloned array for seamless infinite sliding: [last, ...banners, first]
  const extendedBanners = [banners[total - 1], ...banners, banners[0]];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mouseStartX = useRef(0);
  const isDragging = useRef(false);

  // Auto-play timer: slides advance continuously from right to left
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  // Seamless jump on reaching cloned boundary slides
  const handleTransitionEnd = () => {
    if (currentIndex >= total + 1) {
      // Reached cloned first slide, instant jump to real first slide
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      // Reached cloned last slide, instant jump to real last slide
      setIsTransitioning(false);
      setCurrentIndex(total);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swiped Left -> Slide in next from the right
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    } else if (diff < -45) {
      // Swiped Right -> Slide in previous from the left
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
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
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    } else if (diff < -45) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Current active dot index (0 to total - 1)
  const activeDot = (currentIndex - 1 + total) % total;

  const goToSlide = (idx) => {
    setIsTransitioning(true);
    setCurrentIndex(idx + 1);
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none bg-white cursor-default"
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
    >
      {/* 1 Slide = Exactly 1 Single Complete Image (No cut-offs, No adjacent slide bleed) */}
      <div className="relative w-full aspect-[512/351] overflow-hidden bg-white">
        <div
          className={`flex w-full h-full ${
            isTransitioning ? "transition-transform duration-500 ease-out" : ""
          }`}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            willChange: "transform",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedBanners.map((banner, idx) => (
            <div
              key={`${banner.id}-${idx}`}
              className="w-full h-full flex-shrink-0 relative overflow-hidden"
            >
              <img
                src={banner.image}
                alt={banner.title || `JSB77 Promo Banner ${idx}`}
                className="w-full h-full object-cover object-center block pointer-events-none"
                loading={idx === 1 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div
        className="absolute bottom-2.5 right-4 flex items-center gap-[4px] z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === activeDot
                ? "w-4 h-1.5 bg-white shadow-sm"
                : "w-1.5 h-1.5 bg-white/70 hover:bg-white"
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
