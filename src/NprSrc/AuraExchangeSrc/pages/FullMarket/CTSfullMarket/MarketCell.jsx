import React, { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import "./MarketCell.css";
import { formatToKOrM } from "./MarketOdds";

const MarketCell = React.memo(function MarketCell({
  handleMarketCellClick,
  price,
  size,
  bgColor,
  betType,
  h,
  isActive,
}) {
  const [isFlashing, setIsFlashing] = useState(false);

  // Keep the first render from flashing. Flash only when the live
  // price/size value actually changes.
  const previousValueRef = useRef({
    price,
    size,
  });
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    const previous = previousValueRef.current;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousValueRef.current = { price, size };
      return;
    }

    const priceChanged = previous.price !== price;
    const sizeChanged = previous.size !== size;

    if (priceChanged || sizeChanged) {
      setIsFlashing(true);

      const timeout = setTimeout(() => {
        setIsFlashing(false);
      }, 180);

      previousValueRef.current = { price, size };

      return () => {
        clearTimeout(timeout);
      };
    }

    previousValueRef.current = { price, size };
  }, [price, size]);

  return (
    <div
      onClick={() => handleMarketCellClick(bgColor, price, betType)}
      className={`market-cell ${
        isActive
          ? betType === "Lay"
            ? "market-cell-active-lay"
            : "market-cell-active-back"
          : ""
      } ${
        isFlashing
          ? betType === "Lay"
            ? "market-cell-flash-lay"
            : "market-cell-flash-back"
          : ""
      }`}
      style={{
        backgroundColor: isFlashing
          ? betType === "Lay"
            ? "#D2E9FF"
            : "#FFF2B2"
          : bgColor,
        flexGrow: 1,
        flexBasis: isMobile ? "50%" : "16.6667%",
        height: h ? "40px" : "44px",
        borderRadius: h ? "4px" : "0px",
        border: h ? "1px solid white" : "",
        padding: "0.25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems: "center",
        transition: isFlashing ? "none" : "background-color 0.25s ease",
      }}
    >
      <span
        className="text-[12px] font-bold"
        style={{
          color: isActive ? "#ffffff" : "#000000",
          fontFamily: "Tahoma, Helvetica, sans-serif",
        }}
      >
        {price || 0}
      </span>
      <span
        className="text-[11px]"
        style={{
          color: isActive ? "#ffffff" : "#000000",
          fontFamily: "Tahoma, Helvetica, sans-serif",
        }}
      >
        {formatToKOrM(size) || "--"}
      </span>
    </div>
  );
});

export default MarketCell;
