import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QUICK_BUTTON_COLUMNS } from "../data/quickButtonsData";

const CategoryBanners = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollStartLeft = useRef(0);
  const draggedDistance = useRef(0);

  // 6 cycles to provide long smooth scrolling
  const allColumns = Array(6).fill(QUICK_BUTTON_COLUMNS).flat();

  // 1-second auto-slide interval
  useEffect(() => {
    const interval = setInterval(() => {
      // Pause auto-sliding if user is actively dragging or hovering with cursor
      if (isDragging || isHovered || isDown.current) return;

      if (scrollRef.current) {
        const container = scrollRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const step = 240; // width of one column

        if (container.scrollLeft >= maxScroll - 20) {
          // Loop back to start smoothly
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: step, behavior: "smooth" });
        }
      }
    }, 1200); // 1.2 second step

    return () => clearInterval(interval);
  }, [isDragging, isHovered]);

  // Mouse Drag handlers for manual cursor sliding
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    setIsDragging(true);
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollStartLeft.current = scrollRef.current.scrollLeft;
    draggedDistance.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.6;
    draggedDistance.current += Math.abs(e.movementX);
    scrollRef.current.scrollLeft = scrollStartLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Safe navigation that distinguishes between a drag and a simple click
  const handleItemClick = (path) => {
    if (draggedDistance.current > 6) {
      // Dragging detected, do not navigate
      return;
    }
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="py-1 px-[2px] w-full select-none">
      <div className="flex flex-col items-center justify-start w-full scrollSmooth no-scrollbar">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className={`flex overflow-auto w-full scrollSmooth no-scrollbar ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {allColumns.map((col, colIdx) => (
            <div key={colIdx} title={col.qbTitle} className="grid grid-row-2">
              {col.items.map((item, itemIdx) => (
                <span
                  key={itemIdx}
                  title={item.title}
                  className=" col-span-1 px-[3px] py-[3px]"
                >
                  <div
                    onClick={() => handleItemClick(item.path)}
                    className="relative w-full active:scale-95 cursor-pointer  bg-bg_SkeletonBgLoaderColor transition-all ease-in-out duration-150 shadow-quickAccessBtnBoxShadows min-h-9 bg-cover bg-center bg-no-repeat rounded-[4px] overflow-hidden undefined"
                    style={{ backgroundImage: `url("${item.bg}")` }}
                  >
                    <div className="flex justify-center w-full h-full min-h-9 relative z-10 items-center min-w-[175px] sm:min-w-[240px] md:min-w-[280px] pl-[5px] pt-[2px] pb-[2px] pr-1  opacity-100">
                      <img
                        src={item.icon}
                        width="16"
                        height="16"
                        className="  w-4 h-4 sm:w-5 sm:h-5  ml-1 autoAnimate pointer-events-none "
                        alt={`${item.title}-image`}
                        loading="lazy"
                        title={item.title}
                        onError={(e) => {
                          e.currentTarget.style.opacity = "0.7";
                        }}
                      />
                      <span className=" ml-1 autoAnimate text-white text-xs capitalize pr-[2px] md:text-sm text-nowrap w-full truncate font-lato-bold  font-semibold md:font-semibold pointer-events-none">
                        {item.title}
                      </span>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full  min-h-9 rounded-[4px] pointer-events-none"></div>
                  </div>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBanners;
