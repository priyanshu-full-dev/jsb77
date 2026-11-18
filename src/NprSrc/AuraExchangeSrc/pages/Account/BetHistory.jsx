import { useState, useEffect, useCallback, useRef } from "react";
import { getSettledBets } from "../../../../api";
import Loader from "../../../../utils/Loader";
import CommonTable from "../../components/TableComponent/TableComponent";
import { toast } from "react-toastify";
import { getUserId } from "../../../../utils/helper/commonSelectors";
import { useSelector } from "react-redux";
import AuraDatePicker from "../../components/AuraDatePicker/AuraDatePicker";

const pad = (n) => String(n).padStart(2, "0");
const formatYYYYMMDD = (d) => d.toISOString().split("T")[0];

const getISTToday = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
};

const istDateToUTCZ = (dateStr, hour = 0, minute = 0, second = 0) => {
  if (!dateStr) return null;
  try {
    const isoWithOffset = `${dateStr}T${pad(hour)}:${pad(minute)}:${pad(
      second
    )}+05:30`;
    const d = new Date(isoWithOffset);
    if (isNaN(d.getTime())) return null;
    // Payload format: 2025-12-07T18:30:00Z
    return d.toISOString().split(".")[0] + "Z";
  } catch {
    return null;
  }
};

const BetHistory = () => {
  const savedSource =
    typeof window !== "undefined"
      ? sessionStorage.getItem("bh_dataSource") || ""
      : "";
  const [dataSource, setDataSource] = useState(savedSource);
  const [sport, setSport] = useState("Cricket");
  const [betStatus, setBetStatus] = useState("settled");

  const userId = useSelector(getUserId());

  const istToday = getISTToday();
  const initialEnd = istToday;
  const initialStart = (() => {
    const d = new Date(istToday + "T00:00:00");
    d.setDate(d.getDate() - 3);
    return formatYYYYMMDD(d);
  })();

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [betHistory, setBetHistory] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const controllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);
  const [pageLoading, setPageLoading] = useState(false);

  // In fetchSettledBets, setPageLoading(true) at start, false at end
  // Then show spinner in table when pageLoading
  // Date range handling (no Int Casino special case now)
  useEffect(() => {
    if (typeof window !== "undefined" && dataSource) {
      sessionStorage.setItem("bh_dataSource", dataSource);
    }
    const todayStr = getISTToday();

    if (dataSource === "Live Data") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (dataSource === "Backup Data") {
      const d = new Date(todayStr + "T00:00:00");
      d.setMonth(d.getMonth() - 3);
      setStartDate(formatYYYYMMDD(d));
      setEndDate(todayStr);
    } else if (dataSource === "Old Data") {
      const d = new Date(todayStr + "T00:00:00");
      d.setFullYear(d.getFullYear() - 1);
      setStartDate(formatYYYYMMDD(d));
      setEndDate(todayStr);
    } else {
      const d = new Date(todayStr + "T00:00:00");
      d.setDate(d.getDate() - 3);
      setStartDate(formatYYYYMMDD(d));
      setEndDate(todayStr);
    }
  }, [dataSource]);
  useEffect(() => {
    setCurrentPage(1);
  }, [sport, startDate, endDate, betStatus, dataSource]);

  const fetchSettledBets = useCallback(
    async (opts = {}) => {
      const page = opts.page || 1; // Always prefer passed page
      const limit = opts.limit || entriesPerPage;
      const reqId = ++latestRequestIdRef.current;

      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const startDateUTC = istDateToUTCZ(startDate, 0, 0, 0);
        const endDateUTC = istDateToUTCZ(endDate, 23, 59, 59);

        const params = {
          sportId: sport,
          startDate: startDateUTC,
          endDate: endDateUTC,
          betStatus,
          page, // ← use the fresh page from opts
          limit,
        };

        console.log("Fetching page:", page); // ← debug this

        const res = await getSettledBets(params, { signal: controller.signal });
        console.log("res", res);

        if (reqId !== latestRequestIdRef.current) return;

        if (res?.success || res?.data) {
          const bets = res?.data?.data || [];
          const pagination = res?.data?.pagination || res?.pagination;

          setBetHistory(
            bets.map((bet, i) => ({
              id: bet._id,
              sportsName: bet.sportsName || "-",
              event: bet.event || "-",
              market: bet.market == "Fancy" ? bet?.selection : bet?.market || "-",
              selection: bet.selection || "-",
              type: bet.type || "-",
              oddsReq:
                bet?.market === "Fancy"
                  ? `${bet?.oddsReq ?? "-"}/${bet?.laySize ?? "-"}`
                  : bet?.oddsReq || "-",
              stake: bet.stake ?? 0,
              createdAt: bet.createdAt || "-",
            }))
          );

          if (pagination) {
            setTotalPages(pagination.totalPages || 1);
            setTotalRecords(pagination.total || 0);
            // Only update currentPage if not manually set
            if (opts.page) {
              setCurrentPage(pagination.page || opts.page);
            }
          }
        } else {
          setBetHistory([]);
          setError("No bets found");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError("Failed to load bets");
        setBetHistory([]);
      } finally {
        if (reqId === latestRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [sport, betStatus, startDate, endDate, entriesPerPage] // ← REMOVE currentPage from deps!
  );
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchSettledBets({ page: newPage }); // ← pass fresh page
  };
  const handleEntriesChange = (newLimit) => {
    const nextLimit = Number(newLimit) || 10;
    setEntriesPerPage(nextLimit);
    setCurrentPage(1);
    fetchSettledBets({ page: 1, limit: nextLimit });
  };
  useEffect(() => {
    setCurrentPage(1);
    fetchSettledBets({ page: 1 });
  }, [sport, betStatus, startDate, endDate, dataSource]);
  useEffect(() => {
    if (dataSource === "") return;
    setCurrentPage(1);
    fetchSettledBets({ page: 1 });
  }, [dataSource]);

  const handleGetHistory = () => {
    if (dataSource === "") {
      toast.error("Please select data source");
      return;
    }
    setCurrentPage(1);
    fetchSettledBets({ page: 1 });
  };

  const columns = [
    { key: "sportsName", header: "Sport Name", mobileLabel: "Sport" },
    { key: "event", header: "Event Name", mobileLabel: "Event" },
    { key: "market", header: "Market Name", mobileLabel: "Market" },
    { key: "selection", header: "Selection", mobileLabel: "Selection" },
    {
      key: "type",
      header: "Type",
      mobileLabel: "Type",
      renderCell: (row) => {
        const type = String(row.type || "").toLowerCase();
        const base = " text-[13px] font-bold";
        if (type === "back")
          return <span className={`${base} text-green-700`}>Back</span>;
        if (type === "lay")
          return <span className={`${base} text-red-600`}>Lay</span>;
        if (type === "void")
          return <span className={`${base} text-yellow-700`}>Void</span>;
        return <span className={`${base} text-gray-700`}>{row.type}</span>;
      },
    },
    { key: "oddsReq", header: "Odds Req.", mobileLabel: "Odds" },
    {
      key: "stake",
      header: "Stake",
      mobileLabel: "Stake",
      renderCell: (row) => (
        <span className="font-bold">
          {Number(row.stake || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Matched Time",
      mobileLabel: "Time",
      renderCell: (row) => {
        const date = new Date(row.createdAt);
        return (
          <span>
            {isNaN(date.getTime())
              ? "-"
              : `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-1 sm:p-4 max-w-full space-y-4 mt-4">
      {/* Filter Section */}
      <div
        className="p-3 space-y-2.5 shadow-sm"
        style={{
          borderTop: "2px solid #000501",
          borderBottom: "1px solid #000501",
          borderLeft: "1px solid #b8c4c7",
          borderRight: "1px solid #b8c4c7",
          backgroundColor: "#e0e6e6",
          borderRadius: "4px",
        }}
      >
        {/* Row 1: Dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              className="w-full h-[32px] px-2 bg-white border border-[#b8c2c6] rounded-[3px] text-[13px] text-[#333] focus:outline-none cursor-pointer"
            >
              <option value="">Data Source</option>
              <option value="Live Data">Live Data</option>
              <option value="Backup Data">Backup Data</option>
              <option value="Old Data">Old Data</option>
            </select>
          </div>

          <div>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full h-[32px] px-2 bg-white border border-[#b8c2c6] rounded-[3px] text-[13px] text-[#333] focus:outline-none cursor-pointer"
            >
              <option value="Cricket">Cricket</option>
              <option value="Soccer">Soccer</option>
              <option value="Tennis">Tennis</option>
              <option value="Horse Race">Horse Race</option>
              <option value="Greyhound Race">Greyhound Race</option>
              <option value="Casino">Casino</option>
              <option value="Int Casino">Int Casino</option>
            </select>
          </div>
        </div>

        {/* Row 2: Bet Status */}
        <div>
          <select
            value={betStatus}
            onChange={(e) => setBetStatus(e.target.value)}
            className="w-full h-[32px] px-2 bg-white border border-[#b8c2c6] rounded-[3px] text-[13px] text-[#333] focus:outline-none cursor-pointer"
          >
            <option value="settled">Settle</option>
            <option value="void">Void</option>
            <option value="unsettled">Unsettle</option>
          </select>
        </div>

        {/* Row 3: Start Date */}
        <AuraDatePicker
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="YYYY-MM-DD"
        />

        {/* Row 4: End Date */}
        <AuraDatePicker
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="YYYY-MM-DD"
        />

        {/* Row 5: Get History Button */}
        <div>
          <button
            type="button"
            onClick={handleGetHistory}
            disabled={loading}
            className={`h-[32px] w-[178px] text-white font-bold text-[13.5px] rounded-[3px] transition-colors cursor-pointer inline-flex items-center justify-center shadow-sm hover:brightness-110 active:brightness-90 ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            style={{
              background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
            }}
          >
            {"Get History"}
          </button>
        </div>

        {error && (
          <div className="p-2 bg-red-100 text-red-700 border border-red-300 rounded text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {/* Loader */}
      {/* {loading && <Loader />} */}

      {/* Bottom Table Card */}
      {true && (
        <div className="border border-[#cdd5dc] rounded-[4px] bg-white overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-[linear-gradient(-180deg,_#2E4B5E_0%,_#243A48_82%)] px-3.5 py-2">
            <h2 className="text-white text-[14px] font-bold tracking-wide m-0">
              Bet History
            </h2>
          </div>

          {/* Show Entries */}
          <div className="py-2.5 flex items-center justify-center gap-1.5 text-[13px] text-[#333]">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => handleEntriesChange(e.target.value)}
              className="h-[28px] px-2 bg-white border border-[#cdd5dc] rounded-[3px] text-[13px] text-[#333] focus:outline-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>

          {/* Table Content with hidden scrollbar */}
          <div
            className="px-3.5 sm:px-4 pb-2 bg-white overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <table
              className="w-full min-w-[750px]"
              style={{
                borderCollapse: "collapse",
                border: "1px solid #c8ced3",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#dfe6e7" }}>
                  <th
                    className="px-3 py-2.5 text-center text-black font-bold whitespace-nowrap text-[13.5px]"
                    style={{
                      borderRight: "1px solid #c8ced3",
                      borderBottom: "1px solid #c8ced3",
                    }}
                    scope="col"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Sport Name</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-black font-bold whitespace-nowrap text-[13.5px]"
                    style={{
                      borderRight: "1px solid #c8ced3",
                      borderBottom: "1px solid #c8ced3",
                    }}
                    scope="col"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Event Name</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-black font-bold whitespace-nowrap text-[13.5px]"
                    style={{
                      borderRight: "1px solid #c8ced3",
                      borderBottom: "1px solid #c8ced3",
                    }}
                    scope="col"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Market name</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-black font-bold whitespace-nowrap text-[13.5px]"
                    style={{
                      borderRight: "1px solid #c8ced3",
                      borderBottom: "1px solid #c8ced3",
                    }}
                    scope="col"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Selection</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-black font-bold whitespace-nowrap text-[13.5px]"
                    style={{
                      borderRight: "1px solid #c8ced3",
                      borderBottom: "1px solid #c8ced3",
                    }}
                    scope="col"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Odds Req.</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-black font-bold whitespace-nowrap text-[13.5px]"
                    style={{
                      borderRight: "1px solid #c8ced3",
                      borderBottom: "1px solid #c8ced3",
                    }}
                    scope="col"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Type</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>

                  <th
                    className="px-3 py-2.5 text-center text-black font-bold whitespace-nowrap text-[13.5px]"
                    style={{
                      borderRight: "1px solid #c8ced3",
                      borderBottom: "1px solid #c8ced3",
                    }}
                    scope="col"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Stake</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-black font-bold whitespace-nowrap text-[13.5px]"
                    style={{
                      borderBottom: "1px solid #c8ced3",
                    }}
                    scope="col"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Matched Time</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {betHistory.length > 0 ? (
                  betHistory.map((row, index) => {
                    const type = String(row.type || "").toLowerCase();
                    const base = " text-[13px] font-bold";
                    let typeElement = <span className={`${base} text-gray-700`}>{row.type}</span>;
                    if (type === "back") typeElement = <span className={`${base} text-green-700`}>Back</span>;
                    if (type === "lay") typeElement = <span className={`${base} text-red-600`}>Lay</span>;
                    if (type === "void") typeElement = <span className={`${base} text-yellow-700`}>Void</span>;

                    const date = new Date(row.createdAt);
                    const formattedDate = isNaN(date.getTime())
                      ? "-"
                      : `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

                    return (
                      <tr
                        key={row.id || index}
                        className="text-[13px] text-black bg-white"
                      >
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {row.sportsName}
                        </td>
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {row.event}
                        </td>
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {row.market}
                        </td>
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {row.selection}
                        </td>
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {row.oddsReq}
                        </td>
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {typeElement}
                        </td>

                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap font-bold"
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {Number(row.stake || 0).toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{ borderBottom: "1px solid #c8ced3" }}
                        >
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-4 text-center text-gray-500 text-[13px]"
                      style={{ borderBottom: "1px solid #c8ced3" }}
                    >
                      No bet history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info & Pagination */}
          <div className="text-center text-[13px] text-[#555] py-2 border-t border-gray-100">
            Showing{" "}
            {totalRecords > 0
              ? (currentPage - 1) * Number(entriesPerPage) + 1
              : 0}{" "}
            to {Math.min(currentPage * Number(entriesPerPage), totalRecords)} of{" "}
            {totalRecords} entries
          </div>

          <div className="flex items-center justify-center gap-3 text-[13px] text-[#333] pb-3.5 pt-1">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(1)}
              className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
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
              onClick={() => handlePageChange(currentPage + 1)}
              className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(totalPages)}
              className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetHistory;
