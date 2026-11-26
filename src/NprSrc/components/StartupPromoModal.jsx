import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

export const popupSlides = [
  {
    id: 1,
    title: "▲ STOP! THAGHARUKO JHUKYAN MA NAPARNUHOS!",
    image: "/npr/popup/popup_1.png",
    link: "/deposit",
  },
  {
    id: 2,
    title: "HIMALAYAN WITHDRAW PROBLEM NOTICE",
    image: "/npr/popup/popup_2.png",
    link: "/withdrawal",
  },
  {
    id: 3,
    title: "DAILY GROWTH CENTER BONUS",
    image: "/npr/popup/popup_3.png",
    link: "/promotion",
  },
  {
    id: 4,
    title: "TURBO SPIN SLOT BONUS 25% AT MIDNIGHT (10PM-6AM)",
    image: "/npr/popup/popup_4.png",
    link: "/promotion",
  },
  {
    id: 5,
    title: "DEPOSIT AND WIN GOLD",
    image: "/npr/popup/popup_5.png",
    link: "/deposit",
  },
  {
    id: 6,
    title: "EVOLUTION NIGHT BONAZA 10% POWER UP",
    image: "/npr/popup/popup_6.png",
    link: "/casino",
  },
  {
    id: 7,
    title: "NEW PLAYER BONUS RS277 AND RS577",
    image: "/npr/popup/popup_7.png",
    link: "/register",
  },
  {
    id: 8,
    title: "REGISTER FREE RS77 NOW!!",
    image: "/npr/popup/popup_8.png",
    link: "/register",
  },
];

const StartupPromoModal = ({ isOpen, onClose, onOpenLogin, onOpenRegister, user }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === popupSlides.length - 1;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < popupSlides.length - 1 ? prev + 1 : prev));
  }, []);

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && !isLastSlide) handleNext();
      else if (diff < 0 && !isFirstSlide) handlePrev();
    }
    setTouchStartX(null);
  };

  const isLoggedIn = Boolean(
    user ||
    (typeof window !== "undefined" && (
      localStorage.getItem("token") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("npr_user")
    ))
  );

  if (!isOpen || isLoggedIn) return null;

  const currentSlide = popupSlides[currentIndex];

  const handleSlideClick = (e) => {
    if (e) e.stopPropagation();
    if (!currentSlide) return;
    onClose();

    const isLoggedIn = Boolean(
      user ||
      localStorage.getItem("token") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("npr_user")
    );

    switch (currentSlide.id) {
      case 1: // Deposit Warning Notice
      case 5: // Deposit and win gold
        if (isLoggedIn) {
          navigate("/deposit");
        } else if (onOpenLogin) {
          onOpenLogin();
        } else {
          navigate("/login");
        }
        break;

      case 2: // Himalayan Withdraw Problem Notice
        if (isLoggedIn) {
          navigate("/withdrawal");
        } else if (onOpenLogin) {
          onOpenLogin();
        } else {
          navigate("/login");
        }
        break;

      case 3: // Daily Growth Center Bonus
      case 4: // Turbo Spin Slot Bonus 25%
        navigate("/promotion");
        break;

      case 6: // Evolution Night Bonanza 10%
        navigate("/casino");
        break;

      case 7: // New Player Bonus Rs277 & Rs577
      case 8: // Register Free Rs77 Now
        if (!isLoggedIn) {
          if (onOpenRegister) {
            onOpenRegister();
          } else {
            navigate("/register");
          }
        } else {
          // If already logged in, navigate to promotions page instead of register
          navigate("/promotion");
        }
        break;

      default:
        if (currentSlide.link) {
          navigate(currentSlide.link);
        }
        break;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-4 select-none animate-fadeIn backdrop-blur-[2px]"
      onClick={onClose}
    >
      {/* Modal Dialog Card - Uniform Fixed Size across all slides */}
      <div
        className="w-[92vw] max-w-[360px] sm:max-w-[390px] h-[450px] sm:h-[470px] max-h-[90vh] bg-white text-gray-900 rounded-[14px] shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/20 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Header with Centered Title & Blue Close Button (Fixed Height) */}
        <div className="relative w-full h-[54px] min-h-[54px] px-9 flex items-center justify-center">
          <h2 className="text-[#0047ba] font-black text-[13px] sm:text-[14.5px] text-center uppercase tracking-tight leading-[1.2] line-clamp-2">
            {currentSlide.title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2.5 w-8 h-8 flex items-center justify-center text-[#0047ba] hover:opacity-80 active:scale-90 transition cursor-pointer select-none"
            title="Close"
            aria-label="Close"
          >
            <FaTimes size={20} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Banner Image Container with Left and Right Circular Navigation Arrows */}
        <div className="relative w-full flex-1 min-h-0 px-3.5 py-1 flex items-center justify-center">
          {/* Left Arrow Button: Disabled and Grey on First Slide */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (!isFirstSlide) handlePrev();
            }}
            disabled={isFirstSlide}
            className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 w-[36px] h-[36px] rounded-full flex items-center justify-center transition select-none ${
              isFirstSlide
                ? "bg-[#9ea8ba] text-white/70 cursor-not-allowed opacity-50 shadow-none"
                : "bg-[#1872f2] hover:bg-[#0047ba] text-white cursor-pointer active:scale-90 shadow-lg border border-white/40"
            }`}
            title="Previous"
            aria-label="Previous"
          >
            <FaChevronLeft size={14} className="mr-0.5" />
          </button>

          {/* Banner Graphic - Clean crop with zero cut-off title text */}
          <div
            onClick={handleSlideClick}
            className="w-full h-full flex items-center justify-center rounded-[10px] overflow-hidden cursor-pointer hover:opacity-95 transition"
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-auto h-auto max-w-full max-h-full object-contain block pointer-events-none select-none rounded-[8px]"
              draggable={false}
            />
          </div>

          {/* Right Arrow Button: Disabled and Grey on Last Slide */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (!isLastSlide) handleNext();
            }}
            disabled={isLastSlide}
            className={`absolute right-1 top-1/2 -translate-y-1/2 z-20 w-[36px] h-[36px] rounded-full flex items-center justify-center transition select-none ${
              isLastSlide
                ? "bg-[#9ea8ba] text-white/70 cursor-not-allowed opacity-50 shadow-none"
                : "bg-[#1872f2] hover:bg-[#0047ba] text-white cursor-pointer active:scale-90 shadow-lg border border-white/40"
            }`}
            title="Next"
            aria-label="Next"
          >
            <FaChevronRight size={14} className="ml-0.5" />
          </button>
        </div>

        {/* Pagination Dots indicator (Fixed Height) */}
        <div className="h-[32px] min-h-[32px] flex items-center justify-center gap-1.5 pb-2">
          {popupSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                index === currentIndex
                  ? "w-5 bg-[#0047ba]"
                  : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
              title={`Slide ${index + 1}`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

StartupPromoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpenLogin: PropTypes.func,
  onOpenRegister: PropTypes.func,
  user: PropTypes.object,
};

export default StartupPromoModal;
