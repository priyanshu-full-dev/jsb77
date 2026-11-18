import { Modal } from "@mui/material";
import { useMemo, useState } from "react";
import { ImCross } from "react-icons/im";
import { useSelector } from "react-redux";
import {
  selectSite,
  selectSiteLayout,
} from "../../../../utils/helper/commonSelectors";
import { MdOutlineInfo } from "react-icons/md";

const FancyBook = ({ fancyBook = {}, activeInfoId, setActiveInfoId }) => {
  const [open, setOpen] = useState(false);
  const topHeaderColor = useSelector(selectSite())?.headerColor;
  const layout = useSelector(selectSiteLayout());

  const {
    currentOddsBetDataOfThisMarket = [],
    marketRunnerName = "",
    min,
    max,
  } = fancyBook;

  const bets = useMemo(() => {
    if (!Array.isArray(currentOddsBetDataOfThisMarket)) return [];

    return currentOddsBetDataOfThisMarket.filter(
      (item) => item && typeof item === "object",
    );
  }, [currentOddsBetDataOfThisMarket]);

  const hasBet = bets.length > 0;

  const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const prices = useMemo(
    () => bets.map((item) => toNumber(item?.price)),
    [bets],
  );

  // Show a 21-run window for a single bet (10 runs below and 10 above).
  const priceRange = useMemo(() => {
    if (!prices.length) return [];

    const minPrice = Math.floor(Math.min(...prices)) - 10;
    const maxPrice = Math.ceil(Math.max(...prices)) + 10;
    const range = [];

    for (let price = minPrice; price <= maxPrice; price += 1) {
      range.push(price);
    }

    return range;
  }, [prices]);

  const handleClose = () => setOpen(false);

  const infoId = fancyBook?.id ?? fancyBook?.selectionId ?? marketRunnerName;
  const isInfoOpen = activeInfoId === infoId;

  const toggleInfo = () => {
    if (!setActiveInfoId) return;
    setActiveInfoId(isInfoOpen ? null : infoId);
  };

  const getExposureAtPrice = (resultPrice) => {
    let amount = 0;

    bets.forEach((bet) => {
      const betPrice = toNumber(bet?.price);
      const favour = toNumber(bet?.favourMargin);
      const against = toNumber(bet?.againstMargin);
      const type = String(bet?.type || "").toLowerCase();

      if (type === "back") {
        amount += resultPrice >= betPrice ? favour : -against;
      } else if (type === "lay") {
        amount += resultPrice < betPrice ? favour : -against;
      }
    });

    return Number(amount.toFixed(2));
  };

  const formatAmount = (amount) => Number(amount.toFixed(2)).toString();

  const headerStyle = {
    height: 30,
  
    boxSizing: "border-box",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 15px",
    color: "#fff",
    backgroundImage: `linear-gradient(180deg, ${
      topHeaderColor?.start || "#242424"
    }, ${topHeaderColor?.end || "#050505"})`,
  };

  const headerCellStyle = {
    width: "50%",
    height: 22.5,
    padding: "0 8px",
    border: "1px solid #373737",
    backgroundColor: "#dfe5e6",
    color: "#080808",
    textAlign: "center",
    verticalAlign: "middle",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1,
    boxSizing: "border-box",
  };

  const getCellStyle = (amount) => ({
    height: 22.5,
    padding: "0 8px",
    border: "1px solid #373737",
    backgroundColor: amount < 0 ? "#f6a5b8" : "#76b9e8",
    color: "#171717",
    textAlign: "center",
    verticalAlign: "middle",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1,
    boxSizing: "border-box",
  });

  return (
    <>
      <div className="relative flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => hasBet && setOpen(true)}
          disabled={!hasBet}
          style={{
            textAlign: "left",
            cursor: hasBet ? "pointer" : "default",
          }}
          className="text-left text-[12px] font-bold text-[#23282C]"
        >
          {marketRunnerName}
        </button>

        {layout === "auraexchange" && setActiveInfoId && (
          <>
            <button
              type="button"
              onClick={toggleInfo}
              className="ml-2 text-[10px]"
              aria-label="Show min and max"
            >
              <MdOutlineInfo size={24} color="#3b5160" />
            </button>

            {isInfoOpen && (
              <div className="absolute -right-0.5 -top-3 z-[100] mt-1">
                <div className="relative flex items-center rounded-[6px] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.18)]">
                  <div className="flex-1 px-5 text-center">
                    <p className="text-[11px] font-bold text-[#577c94]">
                      Min / Max
                    </p>
                    <p className="text-[12px] font-extrabold text-black">
                      {min ?? 0} - {max ?? 0}
                    </p>
                  </div>

                  <div className="h-[40px] w-px bg-gray-200" />

                  <button
                    type="button"
                    onClick={() => setActiveInfoId(null)}
                    aria-label="Close min and max"
                    className="flex h-[40px] w-[30px] items-center justify-center text-black hover:text-gray-600"
                  >
                    <ImCross size={9} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={open} onClose={handleClose}>
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflow: "hidden",
            padding: "4px 8px",
            backgroundColor: "rgba(0, 0, 0, 0.48)",
            boxSizing: "border-box",
          }}
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Book"
            style={{
              width: "100%",
              maxWidth: 760,
              maxHeight: "calc(100dvh - 8px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              margin: 0,
            
              backgroundColor: "#fff",
              
              boxSizing: "border-box",
              boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
              fontFamily: "Arial, Helvetica, sans-serif",
              
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Dynamic theme header */}
            <div style={headerStyle}>
              <h2
                style={{
                  margin: 0,
                  color: "#fff",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1,
                }}
              >
                Book
              </h2>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close book"
                style={{
                 
     
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: 0,
                  background: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <ImCross size={13} />
              </button>
            </div>

            {/* Scrollable Run / Amount table */}
            <div
              style={{
                padding: 5,
                overflowY: "auto",
                overscrollBehavior: "contain",
                maxHeight: "calc(100dvh - 95px)",
                minHeight: 0,
                boxSizing: "border-box",
                backgroundColor: "#fff",
              }}
            >
              <table
                style={{
                  width: "100%",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                  border: "2px solid #373737",
                  margin: 0,
                  padding: 0,
                }}
              >
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={headerCellStyle} className="fancy-book-header-cell">Run</th>
                    <th style={headerCellStyle} className="fancy-book-header-cell">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {priceRange.length > 0 ? (
                    priceRange.map((price) => {
                      const amount = getExposureAtPrice(price);
                      const cellStyle = getCellStyle(amount);

                      return (
                        <tr key={price}>
                          <td className="!border-b !border-[black]" style={cellStyle}>{price}</td>
                          <td className="!border-b !border-[black]" style={cellStyle}>{formatAmount(amount)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          padding: "18px 8px",
                          border: "1px solid #373737",
                          backgroundColor: "#fff",
                          textAlign: "center",
                          color: "#666",
                          fontSize: 14,
                        }}
                      >
                        No bet data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FancyBook;
