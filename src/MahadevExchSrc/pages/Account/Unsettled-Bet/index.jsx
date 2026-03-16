import { useEffect, useState } from "react";



import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getUnsettledBets } from "../../../../api";
import { selectSite } from "../../../../utils/helper/commonSelectors";

export default function UnsettledBet() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [betHistory, setBetHistory] = useState([]);
  const topHeaderColor = useSelector(selectSite())?.headerColor;

  const fetchSettledBets = async (searchQuery = "") => {
    try {
      setLoading(true);
      const res = await getUnsettledBets({ search: searchQuery });
      const bets = res?.data?.data || res?.data || [];
      setBetHistory(bets);
    } catch (error) {
      console.error("Error fetching unsettled bets:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSettledBets(search);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    fetchSettledBets();
  }, []);

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
    <div className="bg-white-100 mt-2">
      <h2
        className="text-[13px] p-1.5 font-sans font-bold text-white"
        style={{
          backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
        }}
      >
        Unsettled Bet
      </h2>
      <div className="bg-white shadow-md rounded  sm:px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-1.5">
          <input
            className="border text-[12px] p-1.5 rounded focus:bg-[#e1faff] focus:outline-none focus:ring-0"
            type="text"
            placeholder="Search Event..."
            value={search}
            onChange={(e) => setSearch(e?.target.value)}
          />

          <div className="flex gap-1 pt-1">
            <button
              type="button"
              onClick={fetchSettledBets}
              className="px-4 py-1.5 text-sm font-normal text-white rounded-l rounded-r-none border border-gray-500 border-r-0"
              style={{
                background: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
              }}
            >
              Go
            </button>

            <button
              type="button"
              onClick={fetchSettledBets}
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
        </div>

        {loading ? (
          <>Loading...</>
        ) : betHistory?.length === 0 ? (
          <p className="text-center text-white-500">No bet history found.</p>
        ) : (
          <div className="overflow-x-auto px-1">
            <table className="min-w-full bg-white border border-white">
              <thead className="bg-[#ededed] text-[white] text-xs sm:text-sm">
                <tr
                  id="upsettled-match-head"
                  style={{
                    backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
                  }}
                >
                  <th className=" text-center px-1">No</th>
                  <th className="py-2 px-2 sm:px-4 text-center">Date</th>

                  <th className="py-2 px-2 sm:px-4 text-center">Event</th>
                  <th className="py-2 px-2 sm:px-4 text-center">Nation</th>
                  <th className="py-2 px-2 sm:px-4 text-center hidden md:table-cell">
                    Market
                  </th>

                  <th className="py-2 px-2 sm:px-4 text-left hidden sm:table-cell">
                    Side
                  </th>

                  <th className="py-2 px-2 sm:px-4 text-right">Rate</th>
                  <th className="py-2 px-2 sm:px-4 text-right">Amount</th>
                  <th className="py-2 px-2 sm:px-4 text-right whitespace-nowrap">
                    Win Amount
                  </th>
                  <th className="py-2 px-2 sm:px-4 text-right whitespace-nowrap">
                    Loss Amount
                  </th>

                  <th className="py-2 px-2 sm:px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(betHistory) && betHistory?.length > 0 ? (
                  betHistory.map((bet, index) => (
                    <tr
                      id="upsettled-match"
                      style={{
                        fontSize: "10px",
                        height: "35px",
                      }}
                      key={index}
                      className={`bg-[#75a8c4]  transition-colors text-xs hover:bg-[#060c10]`}
                    >
                      <td
                        style={{ borderRight: "1px solid white" }}
                        className={`text-center text-[12px] ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"}`}
                      >
                        {index + 1}
                      </td>
                      <td
                        style={{
                          textWrap: "nowrap",
                          borderRight: "1px solid white",
                        }}
                        className={`py-2 px-2 whitespace-nowrap sm:px-4 ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"} text-center`}
                        title={bet.placeTime}
                      >
                        <div className="whitespace-nowrap">
                          {new Date(bet.placeTime).toLocaleString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </div>
                        <span className="whitespace-nowrap">
                          {new Date(bet.placeTime).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      <td
                        style={{ borderRight: "1px solid white" }}
                        className={`py-2 px-2 whitespace-nowrap sm:px-4 ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"} text-center`}
                        title={bet.event}
                      >
                        {bet.event || "NA"}
                      </td>
                      <td
                        style={{ borderRight: "1px solid white" }}
                        className={`py-2 whitespace-nowrap px-2 sm:px-4 ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"} text-center`}
                      >
                        {bet.selection || "NA"}
                      </td>
                      <td
                        style={{
                          textWrap: "nowrap",
                          borderRight: "1px solid white",
                        }}
                        className={`py-2 px-2 sm:px-4 hidden md:table-cell ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"} text-center`}
                        title={bet.market}
                      >
                        {bet.market || "NA"}
                      </td>

                      <td
                        className={`py-2 px-2 sm:px-4 hidden md:table-cell ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"} text-center`}
                        style={{
                          textWrap: "nowrap",
                          borderRight: "1px solid white",
                        }}
                      >
                        {bet.type || "NA"}
                      </td>

                      <td
                        className={`py-2 px-2 sm:px-4 text-right  ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"}`}
                        style={{
                          textWrap: "nowrap",
                          borderRight: "1px solid white",
                        }}
                      >
                        {bet?.oddsReq || `${bet?.price}/${bet?.size}` || "NA"}
                      </td>
                      <td
                        className={`py-2 px-2 sm:px-4 text-right  ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"}`}
                        style={{
                          textWrap: "nowrap",
                          borderRight: "1px solid white",
                        }}
                      >
                        {bet.stake || "NA"}
                      </td>

                      <td
                        className={`py-2 px-2 text-[green] sm:px-4 text-center  ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"}`}
                        style={{
                          textWrap: "nowrap",
                          borderRight: "1px solid white",
                        }}
                      >
                        {bet.favourMargin || "NA"}
                      </td>

                      <td
                        className={`py-2 px-2 text-[red] sm:px-4 text-center  ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"}`}
                        style={{
                          textWrap: "nowrap",
                          borderRight: "1px solid white",
                        }}
                      >
                        {bet.againstMargin || "NA"}
                      </td>

                      <td
                        className={`py-2 px-2 sm:px-4  ${bet.type === "Lay" ? "bg-[#faa9ba]" : "bg-[#7acbff]"}`}
                        style={{
                          textWrap: "nowrap",
                          borderRight: "1px solid white",
                        }}
                      >
                        {bet.status ? bet.status.toUpperCase() : "NA"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="text-center py-4 text-white-500"
                    >
                      No bet history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
