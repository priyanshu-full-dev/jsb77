import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import { formatIndianNumber } from "../../../../utils/helper/formatNumberIndianStyle";
import Pagination from "../../../components/Pagination/Pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAccountStatements, getBet } from "../../../../api";
import { getUserId, selectSite } from "../../../../utils/helper/commonSelectors";

export default function AccountStatement() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toLocaleDateString("en-CA");
  });

  // new changes

  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const topHeaderColor = useSelector(selectSite())?.headerColor;
  const loggedInUserId = useSelector(getUserId());
  const [selectedBet, setSelectedBet] = useState(null);

  const [betDetails, setBetDetails] = useState(null);
  const [betLoading, setBetLoading] = useState(false);

  console.log({ betDetails });

  const [filterby, setFilterby] = useState("");

  const getAccountSummary = async () => {
    setLoading(true);
    try {
      const res = await getAccountStatements({
        filterby,
        page,
        limit,
        startDate,
        endDate,
      });

      console.log({ res });

      setTransactions(res?.data?.transactions || []);
      const totalItems = res?.data?.total || 0;
      setTotalPages(Math.ceil(totalItems / limit));
    } catch (error) {
      console.error("Error fetching account statements", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAccountSummary();
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const fetchBetDetails = async () => {
    const betId = selectedBet?.BetId?._id || selectedBet?.FancyBetIds?.[0];

    if (!betId) return;

    try {
      setBetLoading(true);

      const res = await getBet({ BetId: betId });

      if (res?.success) {
        setBetDetails(res?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching bet details:", error);
    } finally {
      setBetLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBet?.BetId?._id || selectedBet?.FancyBetIds?.[0]) {
      fetchBetDetails();
    }
  }, [selectedBet]);

  const SkeletonRow = () => (
    <tr>
      {[...Array(9)].map((_, i) => (
        <td key={i} className="px-3 py-2 border">
          <div className="h-3 bg-gray-300 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );

  const downloadCSV = () => {
    if (!transactions?.length) return;

    const headers = ["Date", "Credit", "Debit", "Balance", "Bonus", "Remark"];

    const rows = transactions.map((item) => [
      new Date(item.createdAt).toLocaleString(),
      item.deposit || 0,
      item.withdraw || 0,
      (Number(item.balance || 0) + Number(item.casinoBalance || 0)).toFixed(2),
      item.toUserBonusBalance || 0,
      item.remark || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Account_Report_${new Date().toISOString()}.csv`,
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    if (!transactions?.length) return;

    const doc = new jsPDF();

    const tableColumn = [
      "Date",
      "Credit",
      "Debit",
      "Balance",
      "Bonus",
      "Remark",
    ];

    const tableRows = transactions.map((item) => [
      new Date(item.createdAt).toLocaleString(),
      item.deposit || 0,
      item.withdraw || 0,
      (Number(item.balance || 0) + Number(item.casinoBalance || 0)).toFixed(2),
      item.toUserBonusBalance || 0,
      item.remark || "",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
    });

    doc.save(`Account_Report_${new Date().toISOString()}.pdf`);
  };

  return (
    <section className="pb-8">
      {loading && <>Loading...</>}
      <div className="container mx-auto">
        <div className="w-full">
          <h2
            className="text-[13px] text-white font-sans font-bold mt-2 md:mt-8  bg-[#343435] p-1.5"
            style={{
              backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
            }}
          >
            Account Statement
          </h2>
          <div className="border rounded-md overflow-hidden">
            <div className="p-0 px-2 pt-2">
              <form className="space-y-3 md:space-y-0 md:grid md:grid-cols-12 md:gap-3 md:items-end">
                {/* Report Type */}
                <div className="md:col-span-3">
                  <label className="hidden md:block text-xs mb-1 font-medium">
                    Report Type
                  </label>
                  <select
                    value={filterby}
                    onChange={(e) => setFilterby(e.target.value)}
                    className="w-full p-2 text-xs md:text-sm rounded border border-[#ced4da] bg-white"
                  >
                    <option value="">All</option>
                    <option value="account">Balance Reports</option>
                    <option value="settlement">Game Reports</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="md:col-span-3">
                  <label className="hidden md:block text-xs mb-1 font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 text-xs md:text-sm rounded border border-[#ced4da] bg-white"
                  />
                </div>

                {/* End Date */}
                <div className="md:col-span-3">
                  <label className="hidden md:block text-xs mb-1 font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 text-xs md:text-sm rounded border border-[#ced4da] bg-white"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      getAccountSummary();
                      setPage(1);
                    }}
                    className="px-4 py-1.5 text-sm font-normal text-white 
                      rounded-l rounded-r-none 
                      border border-gray-500 border-r-0"
                    style={{
                      background: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
                    }}
                  >
                    Go
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="px-4 py-1.5 text-sm font-normal text-white 
                      rounded-r rounded-l-none 
                      border border-gray-500 border-r-0"
                    style={{
                      background: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
                    }}
                  >
                    Reset
                  </button>

                  <div
                    onClick={downloadCSV}
                    className="h-[38px] w-[32px] ml-2 flex items-center justify-center cursor-pointer hover:scale-105 transition"
                  >
                    <img src="./csv-icon.svg" alt="CSV" />
                  </div>

                  <div
                    onClick={downloadPDF}
                    className="h-[38px] w-[32px]  flex items-center justify-center cursor-pointer hover:scale-105 transition"
                  >
                    <img src="./pdf-icon.svg" alt="PDF" />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="overflow-x-auto p-2">
            {transactions?.length === 0 ? (
              <p className="text-center text-gray-500 font-semibold py-4">
                No statements found.
              </p>
            ) : (
              <div className="overflow-x-auto border border-gray-300">
                <table className="w-full text-[12px] border-collapse">
                  {/* Header */}
                  <thead>
                    <tr className="bg-[#0f7c8f] text-white text-[12px]">
                      <th className="px-3 py-2 text-left border-r border-gray-300">
                        Date
                      </th>
                      <th className="px-3 py-2 text-right border-r border-gray-300">
                        Credit
                      </th>
                      <th className="px-3 py-2 text-right border-r border-gray-300">
                        Debit
                      </th>
                      <th className="px-3 py-2 text-right border-r border-gray-300">
                        Balance
                      </th>
                      <th className="px-3 py-2 text-right border-r border-gray-300">
                        Bonus
                      </th>
                      <th className="px-3 py-2 text-start border-r border-gray-300">
                        User
                      </th>
                      <th className="px-3 py-2 text-left">Remarks</th>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody>
                    {transactions?.map((statement, i) => {
                      let deposit = "--";
                      let withdraw = "--";
                      let closingBalance = "--";
                      let bonusBalance = "--";
                      let from = "-";
                      let to = "-";

                      const isSelf =
                        String(loggedInUserId) ===
                        String(statement?.userId?._id);

                      const isReceiver =
                        String(loggedInUserId) ===
                        String(statement?.toUserId?._id);

                      if (
                        statement?.type === "settlement" &&
                        Number(statement?.deposit) === 0 &&
                        Number(statement?.withdraw) === 0
                      ) {
                        return null;
                      }

                      // =====================================
                      // CASE 1: CASINO / SETTLEMENT
                      // =====================================
                      if (statement?.type === "settlement") {
                        if (statement?.deposit > 0) {
                          deposit = Number(statement.deposit).toFixed(2);
                        }

                        if (statement?.withdraw > 0) {
                          withdraw = Number(statement.withdraw).toFixed(2);
                        }

                        const normalBalance = Number(statement?.balance || 0);
                        const casinoBal = Number(statement?.casinoBalance || 0);

                        const totalBalance = normalBalance + casinoBal;

                        closingBalance = totalBalance.toFixed(2);
                      }

                      // =====================================
                      // CASE 2: ACCOUNT TRANSFER
                      // =====================================
                      else if (statement?.type === "account") {
                        if (isSelf) {
                          if (statement?.withdraw > 0) {
                            withdraw = Number(statement.withdraw).toFixed(2);
                          }
                          closingBalance = Number(
                            statement?.userBalance || 0,
                          ).toFixed(2);
                        }

                        if (isReceiver) {
                          if (statement?.deposit > 0) {
                            deposit = Number(statement.deposit).toFixed(2);
                          }
                          closingBalance = Number(
                            statement?.toUserBalance || 0,
                          ).toFixed(2);
                        }
                      } else {
                        return null;
                      }

                      // =====================================
                      // BONUS
                      // =====================================
                      if (statement?.isBonus) {
                        bonusBalance = Number(
                          statement?.toUserBonusBalance || 0,
                        ).toFixed(2);
                      }

                      from = statement?.userId?.userName || "User Deleted";
                      to = statement?.toUserId?.userName || "User Deleted";

                      return (
                        <tr
                          key={i}
                          className="bg-[#f2f2f2] border-b border-gray-300 hover:bg-[#e6f4f7] transition"
                        >
                          <td className="px-3 py-2 whitespace-nowrap border-r border-gray-300">
                            {new Date(statement?.createdAt).toLocaleString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              },
                            )}
                          </td>

                          {/* Credit */}
                          <td className="px-3 py-2 text-right text-green-600 font-medium border-r border-gray-300">
                            {formatIndianNumber(deposit)}
                          </td>

                          {/* Debit */}
                          <td className="px-3 py-2 text-right text-red-600 font-medium border-r border-gray-300">
                            {formatIndianNumber(withdraw)}
                          </td>

                          {/* Balance */}
                          <td className="px-3 py-2 text-right font-medium border-r border-gray-300">
                            {formatIndianNumber(closingBalance)}
                          </td>

                          {/* Bonus */}
                          <td className="px-3 py-2 text-right border-r border-gray-300">
                            {formatIndianNumber(bonusBalance)}
                          </td>

                          {/* User */}
                          <td className="px-3 py-2 text-start whitespace-nowrap border-r border-gray-300">
                            <span className="text-gray-700 whitespace-nowrap">
                              {from} → {to}
                            </span>
                          </td>

                          {/* Remarks */}
                          <td
                            onClick={() => {
                              if (
                                statement?.BetId ||
                                statement?.FancyBetIds[0]
                              ) {
                                setSelectedBet(statement);
                              }
                            }}
                            className="px-3 py-2 text-left text-[#1288a0] cursor-pointer hover:underline whitespace-nowrap border-r border-gray-300"
                          >
                            {statement?.remark || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={handlePageChange}
        />

        {selectedBet && (
          <div className="fixed inset-0 z-50 flex items-start top-4 justify-center bg-black/40">
            <div className="w-[95%] md:w-[750px] bg-white rounded shadow-xl overflow-hidden">
              {/* Header */}
              <div
                className=" text-white px-4 py-2 flex justify-between items-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
                }}
              >
                <h2 className="text-[14px] font-sans font-semibold">
                  User Market Bets
                </h2>
                <button
                  onClick={() => setSelectedBet(null)}
                  className="text-white text-xl hover:text-gray-200"
                >
                  ×
                </button>
              </div>

              {/* Table */}
              <div className="p-3 bg-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px] font-sans border-collapse">
                    <thead>
                      <tr className="bg-[#3a8dad] text-white">
                        <th className="px-3 py-2 border">Competition</th>
                        <th className="px-3 py-2 border">Event</th>
                        <th className="px-3 py-2 border">Market</th>
                        <th className="px-3 py-2 border">Runner</th>
                        <th className="px-3 py-2 border">Side</th>
                        <th className="px-3 py-2 border">Line</th>
                        <th className="px-3 py-2 border">Rate</th>
                        <th className="px-3 py-2 border">Amount</th>
                        <th className="px-3 py-2 border">Profit/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {betLoading ? (
                        <SkeletonRow />
                      ) : betDetails ? (
                        <tr className="text-black">
                          <td
                            className={`px-3 py-2 border font-medium text-black ${
                              betDetails?.type === "Back"
                                ? "bg-[#72bbef]"
                                : betDetails?.type === "Lay"
                                  ? "bg-[#f4a9ba]"
                                  : ""
                            }`}
                          >
                            {betDetails?.sportsName || "-"}
                          </td>

                          <td
                            className={`px-3 py-2 border font-medium text-black ${
                              betDetails?.type === "Back"
                                ? "bg-[#72bbef]"
                                : betDetails?.type === "Lay"
                                  ? "bg-[#f4a9ba]"
                                  : ""
                            }`}
                          >
                            {betDetails?.event || "-"}
                          </td>

                          <td
                            className={`px-3 py-2 border font-medium text-black ${
                              betDetails?.type === "Back"
                                ? "bg-[#72bbef]"
                                : betDetails?.type === "Lay"
                                  ? "bg-[#f4a9ba]"
                                  : ""
                            }`}
                          >
                            {betDetails?.market || "-"}
                          </td>

                          <td
                            className={`px-3 py-2 border font-medium text-black ${
                              betDetails?.type === "Back"
                                ? "bg-[#72bbef]"
                                : betDetails?.type === "Lay"
                                  ? "bg-[#f4a9ba]"
                                  : ""
                            }`}
                          >
                            {betDetails?.selection || "-"}
                          </td>

                          {/* ✅ SIDE COLUMN WITH COLOR */}
                          <td
                            className={`px-3 py-2 border font-medium text-black ${
                              betDetails?.type === "Back"
                                ? "bg-[#72bbef]"
                                : betDetails?.type === "Lay"
                                  ? "bg-[#f4a9ba]"
                                  : ""
                            }`}
                          >
                            {betDetails?.type || "-"}
                          </td>

                          <td
                            className={`px-3 py-2 border font-medium text-black ${
                              betDetails?.type === "Back"
                                ? "bg-[#72bbef]"
                                : betDetails?.type === "Lay"
                                  ? "bg-[#f4a9ba]"
                                  : ""
                            }`}
                          >
                            -
                          </td>

                          <td
                            className={`px-3 py-2 border font-medium text-black ${
                              betDetails?.type === "Back"
                                ? "bg-[#72bbef]"
                                : betDetails?.type === "Lay"
                                  ? "bg-[#f4a9ba]"
                                  : ""
                            }`}
                          >
                            {betDetails?.oddsReq != null
                              ? Number(betDetails.oddsReq)
                              : betDetails?.price != null &&
                                  betDetails?.size != null
                                ? `${Number(betDetails.price)} / ${Number(
                                    betDetails.size,
                                  )}`
                                : "-"}
                          </td>

                          <td
                            className={`px-3 py-2 border font-medium text-black ${
                              betDetails?.type === "Back"
                                ? "bg-[#72bbef]"
                                : betDetails?.type === "Lay"
                                  ? "bg-[#f4a9ba]"
                                  : ""
                            }`}
                          >
                            {betDetails?.stake
                              ? betDetails.stake.toFixed(2)
                              : "-"}
                          </td>

                          <td
                            className={`px-3 py-2 border font-semibold ${
                              betDetails?.betStatus === "win"
                                ? "text-green-600"
                                : "text-red-600"
                            } ${
                              betDetails?.type === "Back"
                                ? "bg-[#72bbef]"
                                : betDetails?.type === "Lay"
                                  ? "bg-[#f4a9ba]"
                                  : ""
                            }`}
                          >
                            <div className="text-xs opacity-80">
                              {betDetails?.betStatus === "win"
                                ? `+${Number(betDetails?.favourMargin || 0).toFixed(2)}`
                                : `-${Number(betDetails?.againstMargin || 0).toFixed(2)}`}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            No Bet Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Cancel Button */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setSelectedBet(null)}
                    className="px-4 py-1 border text-[14px] border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
