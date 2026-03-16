import { useEffect, useState } from "react";


import { useSelector } from "react-redux";


import { getAccountStatements } from "../../../../api";
import { selectSite } from "../../../../utils/helper/commonSelectors";
import Pagination from "../../../components/Pagination/Pagination";

export default function ProfitLossReport() {
  const [filter, setFilter] = useState("ALL");

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const topHeaderColor = useSelector(selectSite())?.headerColor;

  const getAccountSummary = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAccountStatements({
        filterby: "settlement",
        page,
        limit,
        startDate,
        endDate,
        sportId: filter === "ALL" ? undefined : filter,
      });

      setTransactions(res?.data?.transactions || []);

      // calculate total pages
      const totalItems = res?.data?.total || 0;
      setTotalPages(Math.ceil(totalItems / limit));
    } catch (error) {
      console.error("Error fetching account statements", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAccountSummary(page);
  }, [filter, startDate, endDate, page]);

  // Handle pagination click
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedBet(null);
  };

  return (
    <section className="pb-8">
      {loading && <>Loading...</>}
      <div className="container mx-auto">
        <div className="w-full">
          <h2
            className="text-[13px] text-white font-bold mb-4 p-1.5"
            style={{
              backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
            }}
          >
            Profit/Loss Total
          </h2>

          {/* Filter Section */}
          <div className="mb-6 p-2">
            <form className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
              <div className="w-full md:w-1/6">
                <select
                  className="w-full p-1 py-1.5 text-sm rounded-md border"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="ALL">All Sports</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Soccer">Soccer</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Casino">Casino</option>
                  <option value="Horse">Horse</option>
                  <option value="Greyhound">Greyhound</option>
                </select>
              </div>
              <div className="w-full md:w-1/6">
                <input
                  type="date"
                  className="w-full p-1 rounded-md text-sm border"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/6">
                <input
                  type="date"
                  className="w-full p-1 rounded-md text-sm border"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/6">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(1);
                    getAccountSummary(page)// Re set to first page
                  }}
                  className="w-full p-1.5 rounded-md text-sm text-white"
                  style={{
                    backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
                  }}
                >
                  Get Statement
                </button>
              </div>
            </form>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto p-2">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 font-semibold py-4">
                No statements found.
              </p>
            ) : (
              <>
                <table className="w-full border-collapse border border-gray">
                  <thead>
                    <tr className="bg-[#108097] text-[13px] text-white">
                      <th className="border border-gray-300 px-4 py-2">No</th>
                      <th className="border border-gray-300 px-4 py-2">Date</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Event
                      </th>
                      <th className="border border-gray-300 px-4 py-2">P/L</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Balance
                      </th>
                      {/* <th className="border border-gray-300 px-4 py-2">
                        Casino Balance
                      </th> */}
                      <th className="border border-gray-300 px-4 py-2">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.map((e, i) => (
                      <tr key={i} style={{ fontWeight: "bold" }}>
                        <td className="border border-gray-300 px-4 py-2 text-[12px] text-center">
                          {(page - 1) * limit + i + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-[12px] text-center">
                          {new Date(e?.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-[12px] text-center">
                          {e?.remark?.includes("International")
                            ? "Int Casino"
                            : e?.event}
                        </td>
                        <td
                          className={`border border-gray-300 px-4 py-2 text-[12px] text-center ${e?.deposit ? "text-green-600" : "text-red-500"
                            }`}
                        >
                          {e?.withdraw
                            ? Number(e?.withdraw).toFixed(2)
                            : e?.deposit
                              ? Number(e?.deposit).toFixed(2)
                              : "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-[12px] text-center">
                          {Number(e?.balance).toFixed(2)}
                        </td>
                        {/* <td className="border border-gray-300 px-4 py-2 text-[12px] text-center">
                          {e?.casinoBalance
                            ? Number(e?.casinoBalance).toFixed(2)
                            : "-"}
                        </td> */}
                        <td className="border border-gray-300 px-4 py-2 text-[12px] text-center">
                          {e?.remark}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  setPage={handlePageChange}
                />
              </>
            )}
          </div>

          {/* Popup Section */}
          {isPopupOpen && selectedBet && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-gray text-black p-4 rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold tracking-wide">
                    Bet Details
                  </h3>
                  <button
                    onClick={closePopup}
                    className="text-lg font-bold text-gray-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="border border-gray-700 rounded-md overflow-hidden">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr className="bg-gray-800">
                        <td className="border border-gray-700 px-3 py-1.5 font-medium text-gray-300">
                          Market
                        </td>
                        <td className="border border-gray-700 px-3 py-1.5">
                          {selectedBet?.market ||
                            "Chennai Super Kings v Mumbai Indians"}
                        </td>
                      </tr>
                      <tr className="bg-gray-800">
                        <td className="border border-gray-700 px-3 py-1.5 font-medium text-gray-300">
                          Selected
                        </td>
                        <td className="border border-gray-700 px-3 py-1.5">
                          {selectedBet?.selection ||
                            "D Conway run (CSK v MI) adv"}
                        </td>
                      </tr>
                      <tr className="bg-gray-800">
                        <td className="border border-gray-700 px-3 py-1.5 font-medium text-gray-300">
                          Type
                        </td>
                        <td className="border border-gray-700 px-3 py-1.5">
                          {selectedBet?.type || "No (Lay)"}
                        </td>
                      </tr>
                      <tr className="bg-gray-800">
                        <td className="border border-gray-700 px-3 py-1.5 font-medium text-gray-300">
                          Odds
                        </td>
                        <td className="border border-gray-700 px-3 py-1.5">
                          {selectedBet?.price && selectedBet?.size
                            ? `${selectedBet.price}/${selectedBet.size}`
                            : "25/110"}
                        </td>
                      </tr>
                      <tr className="bg-gray-800">
                        <td className="border border-gray-700 px-3 py-1.5 font-medium text-gray-300">
                          Stake
                        </td>
                        <td className="border border-gray-700 px-3 py-1.5">
                          {selectedBet?.stake || "100"}
                        </td>
                      </tr>
                      <tr className="bg-gray-800">
                        <td className="border border-gray-700 px-3 py-1.5 font-medium text-gray-300">
                          Settled As
                        </td>
                        <td className="border border-gray-700 px-3 py-1.5">
                          {selectedBet?.betStatus || "Win"}
                        </td>
                      </tr>
                      <tr className="bg-gray-800">
                        <td className="border border-gray-700 px-3 py-1.5 font-medium text-gray-300">
                          Placed At
                        </td>
                        <td className="border border-gray-700 px-3 py-1.5">
                          {selectedBet?.createdAt
                            ? new Date(selectedBet.createdAt).toLocaleString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              }
                            )
                            : "3/20/2025, 7:06:17 PM"}
                        </td>
                      </tr>
                      <tr className="bg-gray-800">
                        <td className="border border-gray-700 px-3 py-1.5 font-medium text-gray-300">
                          Settled At
                        </td>
                        <td className="border border-gray-700 px-3 py-1.5">
                          {selectedBet?.settledAt
                            ? new Date(selectedBet.settledAt).toLocaleString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              }
                            )
                            : "3/20/2025, 7:07:37 PM"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
