/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useRef } from "react";
import { usePrimaryColor } from "../../../../hooks/useThemeColors";

// Helper: Title Case
const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const HorseCategoryTabs = ({
  markets = [],
  categories = [],
  activeCategory = "Popular",
  activeMarketCategory,
  onSelectCategory,
  setactiveMarket,
}) => {
  const primaryBg = usePrimaryColor();
  const active = activeMarketCategory || activeCategory;
  const onSelect = setactiveMarket || onSelectCategory;

  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  // Filter out 'All' and 'Popular' since we add them in order
  const rawList = markets?.length ? markets : categories;
  const filteredMarkets = useMemo(() => {
    return (rawList || []).filter(
      (m) => m && String(m).toLowerCase() !== "all" && String(m).toLowerCase() !== "popular",
    );
  }, [rawList]);

  const marketCategories = useMemo(() => {
    return [
      "Popular",
      ...(Array.isArray(filteredMarkets)
        ? [...new Set(filteredMarkets.filter(Boolean))]
        : []),
    ];
  }, [filteredMarkets]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [active]);

  return (
    <div className="w-full bg-[#e0e6e6] py-2 px-2 flex items-center justify-start overflow-hidden">
      <div
        ref={scrollRef}
        className="w-full flex items-center overflow-x-auto space-x-2 scrollbar-hide py-0"
      >
        {/* All */}
        <button
          type="button"
          ref={active === "All" ? activeRef : null}
          onClick={() => onSelect?.("All")}
          className="flex-shrink-0 cursor-pointer whitespace-nowrap font-bold rounded-[4.8vw] px-[2.8vw] py-[1.8vw] text-[3.46667vw] border border-black flex items-center justify-center leading-none my-auto transition-colors"
          style={{
            background:
              active === "All"
                ? primaryBg
                : "linear-gradient(to top, #2E4B5E 0%, #243A48 82%)",
            color: active === "All" ? "black" : "white",
          }}
        >
          All
        </button>

        {/* Categories */}
        {marketCategories.map((category, index) => (
          <button
            type="button"
            key={`${category}-${index}`}
            ref={active === category ? activeRef : null}
            onClick={() => onSelect?.(category)}
            className="flex-shrink-0 cursor-pointer whitespace-nowrap font-bold rounded-[4.8vw] px-[3vw] py-[1.8vw] text-[3.46667vw] border border-black flex items-center justify-center leading-none my-auto transition-colors"
            style={{
              background:
                active === category
                  ? primaryBg
                  : "linear-gradient(to top, #2E4B5E 0%, #243A48 82%)",
              color: active === category ? "black" : "white",
            }}
          >
            {toTitleCase(category)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(HorseCategoryTabs);
