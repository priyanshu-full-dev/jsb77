import React, { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { motion, AnimatePresence } from "framer-motion";
import "./MarketCell.css";
import { formatToKOrM } from "./MarketOdds";

const MarketCell = React.memo(function MarketCell({
  handleMarketCellClick,
  price,
  size,
  bgColor,
  betType,
}) {
  const [flash, setFlash] = useState(false);
  const prevPrice = useRef(null);
  const prevSize = useRef(null);

  const isFirstPrice = useRef(true);
  const isFirstSize = useRef(true);

  useEffect(() => {
    const priceChanged = price !== prevPrice.current;
    const sizeChanged = size !== prevSize.current;

    if (priceChanged || sizeChanged) {
      setFlash(true);
      const timeout = setTimeout(() => setFlash(false), 222);

      prevPrice.current = price;
      prevSize.current = size;

      return () => clearTimeout(timeout);
    }

    if (price && isFirstPrice.current) {
      isFirstPrice.current = false;
    }

    if (size && isFirstSize.current) {
      isFirstSize.current = false;
    }
  }, [price, size]);

  const textVariants = {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  };

  return (
    <div
      onClick={() => handleMarketCellClick(bgColor, price, betType)}
      className={`market-cell rounded-md ${flash ? "flash" : ""}`}
      style={{
        backgroundColor: bgColor,
        flexGrow: 1,
        flexBasis: isMobile ? "50%" : "16.6667%",
        height: "2.70rem",
        padding: "0.25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems: "center",
        transition: "background-color 0.3s ease",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={price} // re-triggers animation on price change
          className="text-[14px] font-bold"
        >
          {!!price ? price : 0 }
        </motion.span>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.span
          key={size} // re-triggers animation on size change
          className="text-[11px] text-[#00000080] font-bold"
        >
          {formatToKOrM(size) || "--"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
});

export default MarketCell;
