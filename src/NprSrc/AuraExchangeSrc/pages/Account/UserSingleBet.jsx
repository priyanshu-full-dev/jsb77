import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { GetuserBetDetails } from "../../../../api";
import { getUserId } from "../../../../utils/helper/commonSelectors";
import Loader from "../../../../utils/Loader";

const UserSingleBet = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const reduxUserId = useSelector(getUserId());
  const userId =
    reduxUserId ||
    urlParams.get("userId") ||
    (typeof window !== "undefined" ? localStorage.getItem("userId") : null);

  const urlSportName = urlParams.get("sportName") || "";
  const urlEventId = urlParams.get("eventId") || "";
  const urlMarketId = urlParams.get("marketId") || "";
  const betId = urlParams.get("betId") || "";

  const [loading, setLoading] = useState(false);
  const [profitLossData, setProfitLossData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalEntries, setTotalEntries] = useState(0);
  const [error, setError] = useState(null);

  const capitalizeWords = (str) => {
    if (!str || typeof str !== "string") return "--";
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatNumber = (val) => {
    const num = Number(val);
    if (isNaN(num)) return val || "--";
    return num % 1 === 0 ? num.toString() : num.toString();
  };

  const formatDateTime = (val) => {
    if (!val) return "--";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
    } catch {
      return String(val);
    }
  };

  const HighlightHR = ({ value }) => {
    if (value === null || value === undefined || value === "") {
      return <span>--</span>;
    }
    const str = String(value).trim();
    const match = str.match(
      /^([+-]?\d+(?:\.\d+)?)\s*\(([+-]?\d+(?:\.\d+)?)\)$/,
    );

    if (!match) {
      const num = Number(str);
      if (!isNaN(num)) {
        return (
          <span
            className={
              num > 0
                ? "text-[#188c3a] font-bold"
                : "text-[#d0021b] font-bold"
            }
          >
            {num % 1 === 0 ? num.toString() : num.toFixed(2)}
          </span>
        );
      }
      return <span>{str}</span>;
    }

    const main = match[1];
    const sub = match[2];

    return (
      <span className="font-bold">
        <span className="text-[#188c3a]">{main}</span>{" "}
        <span className="text-[#d0021b]">({sub})</span>
      </span>
    );
  };

  const getUserBetDetailsFun = async () => {
    if (!userId) {
      setError("User ID missing");
      setProfitLossData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If marketId or eventId is provided, do NOT filter by a single betId
      // so all individual bets for this market/event are retrieved in full detail
      const res = await GetuserBetDetails({
        userId,
        sportsName: urlSportName || undefined,
        eventId: urlEventId || undefined,
        marketId: urlMarketId || undefined,
        page: currentPage,
        limit,
        betId: urlMarketId ? undefined : betId || undefined,
      });
      console.log(res)

      const list = res?.data?.data;
      if (!Array.isArray(list)) throw new Error("Invalid API response");


      const transformed = list.map((item, idx) => {
        const rawType = String(
          item?.type ||
          item?.betType ||
          item?.typeBet ||
          (item?.isBack ? "BACK" : ""),
        )
          .trim()
          .toUpperCase();

        const isBack =
          rawType === "BACK" ||
          rawType === "B" ||
          item?.isBack === true ||
          rawType.includes("BACK");
        const isLay =
          rawType === "LAY" ||
          rawType === "L" ||
          item?.isBack === false ||
          rawType.includes("LAY");
        const normalizedType = isBack
          ? "BACK"
          : isLay
            ? "LAY"
            : rawType || "--";

        return {
          ...item,
          id: item?._id || item?.betId || idx,
          createdBy: item?.createdBy?.userName || "--",
          sportsName: capitalizeWords(item?.sportsName || urlSportName),
          event: item?.event || item?.eventName || "--",
          market: item?.market || item?.markettype || "--",
          selection: item?.selection || item?.runnerName || "--",
          type: normalizedType,
          isBack,
          isLay,
          oddsReq: item?.odds || item?.fancyOdds || (item?.oddsReq ? formatNumber(item.oddsReq) : "--"),
          stake: item?.stake ? formatNumber(item.stake) : "0",
          betPl: item?.newBetPl ?? item?.betPl ?? "--",
          createdAt: item?.createdAt,
          settledAt: item?.settledAt || item?.matchDate || item?.settleTime,
        };
      });

      setProfitLossData(transformed);
      const total = res?.data?.pagination?.total || transformed.length;
      setTotalEntries(total);
    } catch (err) {
      console.error("Error fetching bet details:", err);
      setError("Failed to load data");
      setProfitLossData([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) getUserBetDetailsFun();
  }, [userId, urlSportName, urlEventId, urlMarketId, currentPage, limit]);

  const totalPages = Math.max(1, Math.ceil(totalEntries / limit));

  return (
    <div className="p-1 sm:p-4 max-w-full mt-4">
      {/* Table Card */}
      <div className="border border-[#cdd5dc] rounded-[4px] bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[linear-gradient(-180deg,_#2E4B5E_0%,_#243A48_82%)] px-3.5 py-2 flex items-center">
          <h2 className="text-white text-[14px] font-bold tracking-wide m-0">
            Bet History
          </h2>
        </div>

        {/* Legend: Back, Lay, Void badges with exact dimensions and colors */}
        <div className="flex justify-end items-center gap-1 px-3 pt-2.5 pb-2">
          <div
            style={{
              backgroundColor: "#72bbef",
              border: "1px solid #000000",
              width: "40px",
              height: "32px",
            }}
            className="text-black text-[13.5px] font-normal flex items-center justify-center select-none"
          >
            Back
          </div>
          <div
            style={{
              backgroundColor: "#faaabe",
              border: "1px solid #000000",
              width: "38px",
              height: "32px",
            }}
            className="text-black text-[13.5px] font-normal flex items-center justify-center select-none"
          >
            Lay
          </div>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #000000",
              width: "40px",
              height: "32px",
            }}
            className="text-black text-[13.5px] font-normal flex items-center justify-center select-none"
          >
            Void
          </div>
        </div>

        {/* {loading && <Loader />} */}

        {!loading && error && (
          <div className="p-4 text-center text-red-500 text-[13px]">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Horizontally scrollable table */}
            <div className="overflow-x-auto px-2 sm:px-4 pb-2 w-full">
              <table
                className="w-full min-w-[950px]"
                style={{
                  borderCollapse: "collapse",
                  border: "1px solid #c8ced3",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#dfe6e7" }}>
                    {/* 1. Sport Name */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "9%",
                        minWidth: "90px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      Sport Name
                    </th>

                    {/* 2. Event Name */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "16%",
                        minWidth: "160px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      Event Name
                    </th>

                    {/* 3. Market Name */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "11%",
                        minWidth: "110px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      Market Name
                    </th>

                    {/* 4. Selection Name */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "12%",
                        minWidth: "120px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      Selection Name
                    </th>

                    {/* 5. Bet Type */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "8%",
                        minWidth: "80px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      Bet Type
                    </th>

                    {/* 6. User Price */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "9%",
                        minWidth: "90px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      User Price
                    </th>

                    {/* 7. Amount */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "9%",
                        minWidth: "90px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      Amount
                    </th>

                    {/* 8. Profit/Loss */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "12%",
                        minWidth: "110px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      Profit/Loss
                    </th>

                    {/* 9. Place Date */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "12%",
                        minWidth: "130px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      Place Date
                    </th>

                    {/* 10. Match Date */}
                    <th
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] select-none"
                      style={{
                        width: "12%",
                        minWidth: "130px",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      Match Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profitLossData.length > 0 ? (
                    profitLossData.map((row, index) => {
                      const rowBgColor = row.isBack
                        ? "#72bbef"
                        : row.isLay
                          ? "#faaabe"
                          : "#ffffff";

                      const cellBorder =
                        row.isBack || row.isLay
                          ? "1px solid rgba(255, 255, 255, 0.6)"
                          : "1px solid #c8ced3";

                      return (
                        <tr
                          key={row.id || index}
                          style={{ backgroundColor: rowBgColor }}
                          className="text-[13px] text-black"
                        >
                          {/* 1. Sport Name */}
                          <td
                            className="px-2 py-2.5 text-center"
                            style={{
                              backgroundColor: rowBgColor,
                              borderRight: cellBorder,
                              borderBottom: cellBorder,
                            }}
                          >
                            {row.sportsName}
                          </td>

                          {/* 2. Event Name */}
                          <td
                            className="px-2 py-2.5 text-center break-words"
                            style={{
                              backgroundColor: rowBgColor,
                              borderRight: cellBorder,
                              borderBottom: cellBorder,
                            }}
                          >
                            {row.event}
                          </td>

                          {/* 3. Market Name */}
                          <td
                            className="px-2 py-2.5 text-center break-words"
                            style={{
                              backgroundColor: rowBgColor,
                              borderRight: cellBorder,
                              borderBottom: cellBorder,
                            }}
                          >
                            {row.market}
                          </td>

                          {/* 4. Selection Name */}
                          <td
                            className="px-2 py-2.5 text-center break-words"
                            style={{
                              backgroundColor: rowBgColor,
                              borderRight: cellBorder,
                              borderBottom: cellBorder,
                            }}
                          >
                            {row.selection}
                          </td>

                          {/* 5. Bet Type */}
                          <td
                            className="px-2 py-2.5 text-center font-normal"
                            style={{
                              backgroundColor: rowBgColor,
                              borderRight: cellBorder,
                              borderBottom: cellBorder,
                            }}
                          >
                            {row.type}
                          </td>

                          {/* 6. User Price */}
                          <td
                            className="px-2 py-2.5 text-center font-normal"
                            style={{
                              backgroundColor: rowBgColor,
                              borderRight: cellBorder,
                              borderBottom: cellBorder,
                            }}
                          >
                            {row.oddsReq}
                          </td>

                          {/* 7. Amount */}
                          <td
                            className="px-2 py-2.5 text-center font-normal"
                            style={{
                              backgroundColor: rowBgColor,
                              borderRight: cellBorder,
                              borderBottom: cellBorder,
                            }}
                          >
                            {row.stake}
                          </td>

                          {/* 8. Profit/Loss */}
                          <td
                            className="px-2 py-2.5 text-center font-normal whitespace-nowrap"
                            style={{
                              backgroundColor: rowBgColor,
                              borderRight: cellBorder,
                              borderBottom: cellBorder,
                            }}
                          >
                            <HighlightHR value={row.betPl} />
                          </td>

                          {/* 9. Place Date */}
                          <td
                            className="px-2 py-2.5 text-center font-normal whitespace-nowrap"
                            style={{
                              backgroundColor: rowBgColor,
                              borderRight: cellBorder,
                              borderBottom: cellBorder,
                            }}
                          >
                            {formatDateTime(row.createdAt)}
                          </td>

                          {/* 10. Match Date */}
                          <td
                            className="px-2 py-2.5 text-center font-normal whitespace-nowrap"
                            style={{
                              backgroundColor: rowBgColor,
                              borderBottom: cellBorder,
                            }}
                          >
                            {formatDateTime(row.settledAt)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-3 py-4 text-center text-gray-500 text-[13px]"
                        style={{ borderBottom: "1px solid #c8ced3" }}
                      >
                        No Bet History found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalEntries > 0 && (
              <>
                <div className="text-center text-[13px] text-[#555] py-2 border-t border-gray-100">
                  Showing {(currentPage - 1) * limit + 1} to{" "}
                  {Math.min(currentPage * limit, totalEntries)} of{" "}
                  {totalEntries} entries
                </div>

                <div className="flex items-center justify-center gap-3 text-[13px] text-[#333] pb-3.5 pt-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => setCurrentPage(1)}
                    className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    type="button"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-2.5 py-1 bg-white border border-[#cdd5dc] rounded-[3px] font-bold text-[13px]">
                    {currentPage}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => setCurrentPage(totalPages)}
                    className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserSingleBet;
