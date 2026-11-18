import React, { useEffect, useMemo, useRef } from "react";
import { usePrimaryColor } from "./../../../hooks/useThemeColors";

// Helper: Title Case
const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const MatchCategory = ({
  markets = [],
  activeMarketCategory,
  setactiveMarket,
}) => {
  const primaryBg = usePrimaryColor();

  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  const marketCategories = useMemo(() => {
    return [
      "Popular",
      ...(Array.isArray(markets)
        ? [...new Set(markets.filter(Boolean))]
        : []),
    ];
  }, [markets]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeMarketCategory]);

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto space-x-2 p-1.5 pl-[7px] pb-0 items-center scrollbar-hide"
    >
      {/* All */}
      <div
        ref={activeMarketCategory === "All" ? activeRef : null}
        onClick={() => setactiveMarket("All")}
        className="flex-shrink-0 cursor-pointer whitespace-nowrap font-[700] rounded-[4.8vw] px-[2.4vw] py-[2vw] text-[3.46667vw] border border-black"
        style={{
          background:
            activeMarketCategory === "All"
              ? primaryBg
              : "linear-gradient(to top, #2E4B5E 0%, #243A48 82%)",
          color: activeMarketCategory === "All" ? "black" : "white",
        }}
      >
        All
      </div>

      {/* Categories */}
      {marketCategories.map((category, index) => (
        <div
          key={`${category}-${index}`}
          ref={activeMarketCategory === category ? activeRef : null}
          onClick={() => setactiveMarket(category)}
          className="flex-shrink-0 cursor-pointer whitespace-nowrap font-[700] rounded-[4.8vw] px-[3vw] py-[2.4vw] text-[3.46667vw] border border-black"
          style={{
            background:
              activeMarketCategory === category
                ? primaryBg
                : "linear-gradient(to top, #2E4B5E 0%, #243A48 82%)",
            color: activeMarketCategory === category ? "black" : "white",
          }}
        >
          {toTitleCase(category)}
        </div>
      ))}
    </div>
  );
};

export default MatchCategory;