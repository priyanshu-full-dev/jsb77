import React, { useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { motion, AnimatePresence } from 'framer-motion';
import './MarketCell.css';
import { formatToKOrM } from './HorseMarket';

const MarketCell = React.memo(function MarketCell({ handleMarketCellClick, price, size, bgColor, betType, hideOnMobile }) {
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

    if (hideOnMobile && isMobile) {
      return null;
    }

    return (
        <div
            onClick={() => handleMarketCellClick(bgColor, price, betType)}
            className={`market-cell ${flash ? 'flash' : ''}`}
            style={{
                backgroundColor: bgColor,
                flexGrow: 1,
                flexBasis: isMobile ? '50%' : '16.6667%',
                minHeight: '2.75rem',
                padding: '0.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                transition: 'background-color 0.3s ease',
            }}
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={price}
                    variants={textVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    className="text-[12px] font-bold"
                >
                    {price || '--'}
                </motion.span>
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.span
                    key={size}
                    variants={textVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0 }}
                    className="text-[11px] font-extralight"
                >
                    {formatToKOrM(size) || '--'}
                </motion.span>
            </AnimatePresence>
        </div>
    );
});

export default MarketCell;