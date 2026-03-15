import React from "react";


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
  const MarketCategory = [
    "Popular",
    ...(Array.isArray(markets) ? markets.map((m) => m).filter(Boolean) : []),
  ];



  return (
    <div className="flex overflow-x-auto space-x-2 p-1.5 justify-start items-center pb-0">
      {/* ALL button */}
      <div
        className="cursor-pointer text-nowrap font-[700] rounded-[4.8vw] px-[3vw] p-[2.4vw] text-[3.46667vw] border border-black"
        onClick={() => setactiveMarket("All")}

      >
        All
      </div>

      {/* Market category buttons */}
      {MarketCategory.map((category, index) => (
        <div
          key={index}
          onClick={() => setactiveMarket(category)}
          className="cursor-pointer text-nowrap font-[700] rounded-[4.8vw] p-[2.4vw] text-[3.46667vw] border border-black"
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
