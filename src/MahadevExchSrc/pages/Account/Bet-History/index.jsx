import { useEffect, useState } from "react";


import { useSelector } from "react-redux";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getSettledBets } from "../../../../api";
import { selectSite } from "../../../../utils/helper/commonSelectors";
import Pagination from "../../../components/Pagination/Pagination";

export default function BetHistory() {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const [filter, setFilter] = useState("ALL");

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toLocaleDateString("en-CA");
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toLocaleDateString("en-CA");
  });

  const [loading, setLoading] = useState(false);
  const [betHistory, setBetHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const topHeaderColor = useSelector(selectSite())?.headerColor;

  // ================= FETCH =================
  const fetchSettledBets = async () => {
    try {
      setLoading(true);
      const res = await getSettledBets({
        page,
        limit,
        startDate,
        endDate,
        filter,
      });

      if (res?.success) {
        setBetHistory(res?.data?.data || []);
        setTotalPages(res?.data?.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching settled bets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettledBets();
  }, [page, startDate, endDate]);

  // ================= CSV =================
  const downloadCSV = () => {
    if (!betHistory?.length) return;

    const headers = [
      "Date",
      "Event",
      "Market",
      "Runner",
      "Side",
      "Rate",
      "Amount",
      "Profit/Loss",
      "Status",
    ];

    const rows = betHistory.map((bet) => [
      bet.placeTime ? new Date(bet.placeTime).toLocaleString() : "NA",
      bet.event || "NA",
      bet.market || "NA",
      bet.selection || "NA",
      bet.type || "NA",
      bet.market === "Fancy" ? `${bet.price}/${bet.size}` : bet.oddsReq || "-",
      Number(bet.stake || 0).toFixed(2),
      Number(
        bet.betStatus === "win"
          ? bet.favourMargin || 0
          : bet.againstMargin || 0,
      ).toFixed(2),
      bet.status || "NA",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Bet_History_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ================= PDF =================
  const downloadPDF = () => {
    if (!betHistory?.length) return;

    const doc = new jsPDF();

    const tableColumn = [
      "Date",
      "Event",
      "Market",
      "Runner",
      "Side",
      "Rate",
      "Amount",
      "P/L",
      "Status",
    ];

    const tableRows = betHistory.map((bet) => [
      bet.placeTime ? new Date(bet.placeTime).toLocaleString() : "NA",
      bet.event || "NA",
      bet.market || "NA",
      bet.selection || "NA",
      bet.type || "NA",
      bet.market === "Fancy" ? `${bet.price}/${bet.size}` : bet.oddsReq || "-",
      Number(bet.stake || 0).toFixed(2),
      Number(
        bet.betStatus === "win"
          ? bet.favourMargin || 0
          : bet.againstMargin || 0,
      ).toFixed(2),
      bet.status?.toUpperCase() || "NA",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
    });

    doc.save(`Bet_History_${new Date().toISOString()}.pdf`);
  };

  return (
    <div>
      {loading &&    <Loader/>}

      <h2
        className="text-[13px] text-white font-sans font-bold  bg-[#343435] p-1.5"
        style={{
          backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
        }}
      >
        Bet History
      </h2>

      <div className="border rounded-md overflow-hidden">
        <div className="px-2 pt-2">
          <form className="space-y-3 md:space-y-0 md:grid md:grid-cols-12 md:gap-3 md:items-end">
            <div className="md:col-span-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 text-xs md:text-sm rounded border border-[#ced4da] bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 text-xs md:text-sm rounded border border-[#ced4da] bg-white"
              />
            </div>

            <div className="flex gap-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  fetchSettledBets();
                }}
                className="px-4 py-1.5 text-sm font-normal text-white rounded-l rounded-r-none border border-gray-500 border-r-0"
                style={{
                  background: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
                }}
              >
                Go
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilter("ALL");
                  setStartDate(formatDate(oneMonthAgo));
                  setEndDate(formatDate(today));
                  setPage(1);
                }}
                className="px-4 py-1.5 text-sm font-normal text-white rounded-r rounded-l-none border border-gray-500 border-r-0"
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
                className="h-[38px] w-[32px] flex items-center justify-center cursor-pointer hover:scale-105 transition"
              >
                <img src="./pdf-icon.svg" alt="PDF" />
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow-md rounded px-2 sm:px-8 pt-2 pb-8 mb-4">
        {betHistory?.length === 0 ? (
          <p className="text-center text-gray-500">No bet history found.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full bg-white border border-gray">
              <thead className="bg-[#1c2e3f] text-white text-xs sm:text-sm">
                <tr>
                  <th className="py-2 px-2 sm:px-4 text-left">Date</th>
                  <th className="py-2 px-2 sm:px-4 text-left">Event</th>
                  <th className="py-2 px-2 sm:px-4 text-left">Market</th>
                  <th className="py-2 px-2 sm:px-4 text-left">Runner</th>
                  <th className="py-2 px-2 sm:px-4 text-left">Side</th>
                  <th className="py-2 px-2 sm:px-4 text-right">Rate</th>
                  <th className="py-2 px-2 sm:px-4 text-right">Amount</th>
                  <th className="py-2 px-2 sm:px-4 text-right">P/L</th>
                  <th className="py-2 px-2 sm:px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {betHistory.map((bet, index) => (
                  <tr
                    className={`${
                      bet.type === "Back"
                        ? "bg-[#75a8c4]"
                        : bet.type === "Lay"
                          ? "bg-[#e89aa6]"
                          : ""
                    }`}
                  >
                    <td
                      className={`py-2 whitespace-nowrap px-2 text-[11px] sm:px-4 border-r border-gray-300 ${
                        bet.type === "Back"
                          ? "bg-[#72bbef]"
                          : bet.type === "Lay"
                            ? "bg-[#f4a9ba]"
                            : ""
                      }`}
                    >
                      {bet.placeTime
                        ? new Date(bet.placeTime).toLocaleString()
                        : "NA"}
                    </td>

                    <td
                      className={`py-2 px-2 whitespace-nowrap text-[11px] sm:px-4 border-r border-gray-300 ${
                        bet.type === "Back"
                          ? "bg-[#72bbef]"
                          : bet.type === "Lay"
                            ? "bg-[#f4a9ba]"
                            : ""
                      }`}
                    >
                      {bet.event}
                    </td>

                    <td
                      className={`py-2 px-2 text-[11px] sm:px-4 border-r border-gray-300 ${
                        bet.type === "Back"
                          ? "bg-[#72bbef]"
                          : bet.type === "Lay"
                            ? "bg-[#f4a9ba]"
                            : ""
                      }`}
                    >
                      {bet.market}
                    </td>

                    <td
                      className={`py-2 px-2 text-[11px] sm:px-4 border-r border-gray-300 ${
                        bet.type === "Back"
                          ? "bg-[#72bbef]"
                          : bet.type === "Lay"
                            ? "bg-[#f4a9ba]"
                            : ""
                      }`}
                    >
                      {bet.selection}
                    </td>

                    <td
                      className={`py-2 px-2 text-[11px] sm:px-4 border-r border-gray-300 ${
                        bet.type === "Back"
                          ? "bg-[#72bbef]"
                          : bet.type === "Lay"
                            ? "bg-[#f4a9ba]"
                            : ""
                      }`}
                    >
                      {bet.type}
                    </td>

                    <td
                      className={`py-2 px-2 text-[11px] sm:px-4 text-right border-r border-gray-300 ${
                        bet.type === "Back"
                          ? "bg-[#72bbef]"
                          : bet.type === "Lay"
                            ? "bg-[#f4a9ba]"
                            : ""
                      }`}
                    >
                      {bet.market === "Fancy"
                        ? `${bet.price}/${bet.size}`
                        : bet.oddsReq || "-"}
                    </td>

                    <td
                      className={`py-2 px-2 text-[11px] sm:px-4 text-right border-r border-gray-300 ${
                        bet.type === "Back"
                          ? "bg-[#72bbef]"
                          : bet.type === "Lay"
                            ? "bg-[#f4a9ba]"
                            : ""
                      }`}
                    >
                      {Number(bet.stake || 0).toFixed(2)}
                    </td>

                    <td
                      className={`py-2 px-2 text-[11px] sm:px-4 text-right border-r border-gray-300 ${
                        bet.type === "Back"
                          ? "bg-[#72bbef]"
                          : bet.type === "Lay"
                            ? "bg-[#f4a9ba]"
                            : ""
                      }`}
                      style={{
                        color: bet.betStatus === "loss" ? "red" : "green",
                      }}
                    >
                      {Number(
                        bet.betStatus === "win"
                          ? bet.favourMargin || 0
                          : bet.againstMargin || 0,
                      ).toFixed(2)}
                    </td>

                    <td
                      className={`py-2 px-2 text-[11px] sm:px-4 border-r border-gray-300 ${
                        bet.type === "Back"
                          ? "bg-[#72bbef]"
                          : bet.type === "Lay"
                            ? "bg-[#f4a9ba]"
                            : ""
                      }`}
                    >
                      {bet.status?.toUpperCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </div>
  );
}
