import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { getAccountStatements } from "../../../../api";
import Loader from "../../../../utils/Loader";
import { getUserId } from "../../../../utils/helper/commonSelectors";
import CommonTable from "../../components/TableComponent/TableComponent";
import AuraDatePicker from "../../components/AuraDatePicker/AuraDatePicker";

const pad = (n) => String(n).padStart(2, "0");
const formatYYYYMMDD = (d) => d.toISOString().split("T")[0];

// Always gives today's date in IST (YYYY-MM-DD)
const getISTToday = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // returns YYYY-MM-DD
};

// Convert a YYYY-MM-DD (IST day) + hh:mm:ss to UTC ISO Z string WITHOUT milliseconds.
const istDateToUTCZ = (dateStr, hour = 0, minute = 0, second = 0) => {
  if (!dateStr) return null;
  try {
    const isoWithOffset = `${dateStr}T${pad(hour)}:${pad(minute)}:${pad(
      second
    )}+05:30`;
    const d = new Date(isoWithOffset);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split(".")[0] + "Z";
  } catch {
    return null;
  }
};

const AccountStatement = () => {
  const savedSource =
    typeof window !== "undefined"
      ? sessionStorage.getItem("as_dataSource") || ""
      : "";
  const [dataSource, setDataSource] = useState(savedSource);

  // Use IST "today" for initial values (so "Live Data" shows IST date)
  const istToday = getISTToday(); // YYYY-MM-DD string
  const initialEndLocal = istToday;
  const initialStartLocal = (() => {
    const d = new Date(initialEndLocal + "T00:00:00");
    d.setDate(d.getDate() - 7); // default: 7 days back (change to -6 if you want inclusive last 7 days)
    return formatYYYYMMDD(d);
  })();

  const [startDate, setStartDate] = useState(() => initialStartLocal);
  const [endDate, setEndDate] = useState(() => initialEndLocal);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const loggedInUserId = useSelector(getUserId());

  // cancellation & stale-response guard + debounce
  const controllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);
  const debounceTimerRef = useRef(null);
  const hasMountedRef = useRef(false);

  const updateURL = (obj) => {
    // If you want to update URL params, implement using react-router's setSearchParams here.
    // Kept placeholderish because original component didn't use URL params.
  };

  // When dataSource changes, update start/end using IST today
  useEffect(() => {
    if (typeof window !== "undefined" && dataSource) {
      sessionStorage.setItem("as_dataSource", dataSource);
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
      // default 7 days back
      const d = new Date(todayStr + "T00:00:00");
      d.setDate(d.getDate() - 7);
      setStartDate(formatYYYYMMDD(d));
      setEndDate(todayStr);
    }
  }, [dataSource]);

  // Fetch function with abort + stale-response guard
  const getAccountSummary = useCallback(
    async (page = 1, pageSizeOverride) => {
      const pageSize = Number(pageSizeOverride ?? entriesPerPage) || 10;
      const reqId = ++latestRequestIdRef.current;

      try {
        if (controllerRef.current) controllerRef.current.abort();
      } catch (e) {
        /* ignore */
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        // compute UTC strings from current local (IST) YYYY-MM-DD
        const startDateUTC = istDateToUTCZ(startDate, 0, 0, 0);
        const endDateUTC = istDateToUTCZ(endDate, 23, 59, 59);

        const params = {
          filterby: "account",
          startDate: startDateUTC,
          endDate: endDateUTC,
          page,
          limit: Number(entriesPerPage) || 10,
          // add userId if your API needs it; example: userId: loggedInUserId
        };

        // Pass signal if wrapper supports it; if not, wrapper should be adapted.
        const res = await getAccountStatements(params, {
          signal: controller.signal,
        }).catch((err) => {
          throw err;
        });

        // stale response guard
        if (reqId !== latestRequestIdRef.current) return;

        // Normalize result
        const apiTransactions = res?.data?.transactions || res?.data || [];

        setTransactions(Array.isArray(apiTransactions) ? apiTransactions : []);

        const pagination = res?.data?.pagination || {};
        const total = pagination.total ?? apiTransactions.length ?? 0;
        const totalPagesComputed =
          pagination.totalPages || Math.max(1, Math.ceil(total / pageSize));

        setTotalEntries(total);
        setTotalPages(totalPagesComputed);
        setCurrentPage(pagination.page || page);
      } catch (err) {
        if (err && (err.name === "AbortError" || err.message === "canceled")) {
          // request aborted — ignore
          return;
        }
        console.error("Error fetching account statements:", err);
        setError(
          err?.message ||
            "Failed to fetch account statements. Please try again."
        );
        setTransactions([]);
      } finally {
        if (reqId === latestRequestIdRef.current) setLoading(false);
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [startDate, endDate, entriesPerPage]
  );

  // Debounced effect to call fetch when filters change (only if dataSource selected)
  useEffect(() => {
    // on first mount, if dataSource exists from storage, fetch immediately
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (dataSource) {
        getAccountSummary(1);
      }
      return;
    }

    if (dataSource === "") return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      getAccountSummary(1);
    }, 100); // 100ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, dataSource, entriesPerPage]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (controllerRef.current) controllerRef.current.abort();
      } catch (e) {}
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleGetCommission = () => {
    if (dataSource === "") return;
    setCurrentPage(1);
    getAccountSummary(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getAccountSummary(page);
  };

  const handleEntriesChange = (value) => {
    const next = Number(value) || 10;
    setEntriesPerPage(String(next));
    setCurrentPage(1);
    getAccountSummary(1, next);
  };

  // Process transactions for table
  const processedTransactions = transactions.map((transaction) => {
    let deposit = "--";
    let withdraw = "--";
    let closingBalance = "--";
    let fromTo = "-";

    // ensure numeric comparisons safe
    const dep = Number(transaction.deposit || 0);
    const wdr = Number(transaction.withdraw || 0);

    if (dep > 0) {
      if (loggedInUserId === transaction?.userId?._id) {
        withdraw = dep.toFixed(2);
        closingBalance =
          transaction.userBalance != null
            ? Number(transaction.userBalance).toFixed(2)
            : "--";
        fromTo = `${transaction.userId?.userName || "User Deleted"} → ${
          transaction.toUserId?.userName || "User Deleted"
        }`;
      } else {
        deposit = dep.toFixed(2);
        closingBalance =
          transaction.toUserBalance != null
            ? Number(transaction.toUserBalance).toFixed(2)
            : "--";
        fromTo = `${transaction.userId?.userName || "User Deleted"} → ${
          transaction.toUserId?.userName || "User Deleted"
        }`;
      }
    } else if (wdr > 0) {
      if (loggedInUserId === transaction?.userId?._id) {
        withdraw = wdr.toFixed(2);
        closingBalance =
          transaction.userBalance != null
            ? Number(transaction.userBalance).toFixed(2)
            : "--";
        fromTo = `${transaction.userId?.userName || "User Deleted"} → ${
          transaction.toUserId?.userName || "User Deleted"
        }`;
      } else {
        deposit = wdr.toFixed(2);
        closingBalance =
          transaction.toUserBalance != null
            ? Number(transaction.toUserBalance).toFixed(2)
            : "--";
        fromTo = `${transaction.userId?.userName || "User Deleted"} → ${
          transaction.toUserId?.userName || "User Deleted"
        }`;
      }
    }

    return {
      id: transaction._id || Math.random().toString(36).slice(2, 9),
      dateTime: transaction?.createdAt || "--",
      deposit,
      withdraw,
      balance: closingBalance,
      remark: transaction.remark || "--",
      fromTo,
    };
  });

  const columns = [
    {
      key: "dateTime",
      header: "Date/Time",
      mobileLabel: "Date/Time",
      renderCell: (row) => {
        const date = new Date(row.dateTime);

        const formattedDate = date
          .toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(",", "");

        return <span className="font-normal">{formattedDate}</span>;
      },
    },
    {
      key: "deposit",
      header: "Deposit",
      mobileLabel: "Deposit",
      renderCell: (row) => {
        return <span className="font-normal">{row.deposit}</span>;
      },
    },
    {
      key: "withdraw",
      header: "Withdraw",
      mobileLabel: "Withdraw",
      renderCell: (row) => {
        const value = Number.parseFloat(row.withdraw);
        return (
          <span
            className={
              !isNaN(value) && value > 0 ? "text-red-600" : "text-gray-950"
            }
          >
            {row.withdraw}
          </span>
        );
      },
    },
    { key: "balance", header: "Balance", mobileLabel: "Balance" },
    { key: "remark", header: "Remarks", mobileLabel: "Remarks",
      renderCell: (row) => {
        return <span className="font-normal">{row.remark}</span>;
      }
     },
    {
      key: "fromTo",
      header: "From/To",
      mobileLabel: "From/To",
      renderCell: (row) => {
        return <span className="font-normal">{row.fromTo}</span>;
      },
    },
  ];

  return (
    <div className="p-1 sm:p-4 max-w-full space-y-4 mt-4">
      {/* Top Filter Card */}
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
        {/* Row 1: Dropdown */}
        <div className="relative w-full">
          <select
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value)}
            className="w-full h-[32px] pl-2.5 pr-9 bg-white border border-[#b8c2c6] rounded-[3px] text-[13px] text-[#333] appearance-none focus:outline-none cursor-pointer"
          >
            <option value="">Data Source</option>
            <option value="Live Data">Live Data</option>
            <option value="Backup Data">Backup Data</option>
            <option value="Old Data">Old Data</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-black">
            <svg
              className="w-3 h-3 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Row 2: Start Date */}
        <AuraDatePicker
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="YYYY-MM-DD"
        />

        {/* Row 3: End Date */}
        <AuraDatePicker
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="YYYY-MM-DD"
        />

        {/* Row 4: Get Statement Button */}
        <div>
          <button
            type="button"
            onClick={handleGetCommission}
            disabled={loading}
             className={`h-[32px] w-[178px] text-white font-bold text-[13.5px] rounded-[3px] transition-colors cursor-pointer inline-flex items-center justify-center shadow-sm hover:brightness-110 active:brightness-90 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{
              background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
            }}
          >
            Get Statement
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
          {error}
        </div>
      )}

      {/* Loader */}
      {/* {loading && <Loader />} */}

      {/* Bottom Table Card */}
      {!error && (
        <div className="border border-[#cdd5dc] rounded-[4px] bg-white overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-[linear-gradient(-180deg,_#2E4B5E_0%,_#243A48_82%)] px-3.5 py-2">
            <h2 className="text-white text-[14px] font-bold tracking-wide m-0">
              Account Statement
            </h2>
          </div>

          {/* Show Entries */}
          <div className="py-2.5 flex items-center justify-center gap-1.5 text-[13px] text-[#333]">
            <span>Show</span>
            <div className="relative inline-flex items-center">
              <select
                value={entriesPerPage}
                onChange={(e) => handleEntriesChange(e.target.value)}
                className="h-[28px] pl-2 pr-6 bg-white border border-[#cdd5dc] rounded-[3px] text-[13px] text-[#333] appearance-none focus:outline-none cursor-pointer"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <div className="pointer-events-none absolute right-1.5 flex items-center text-black">
                <svg
                  className="w-2.5 h-2.5 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            <span>entries</span>
          </div>

          {/* Table Content with hidden scrollbar */}
          <div
            className="px-3.5 sm:px-4 pb-2 bg-white overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <table
              className="w-full min-w-[650px]"
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
                      <span>Date/Time</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#70808a" />
                        <polygon points="12,20 5,13 19,13" fill="#70808a" />
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
                      <span>Deposit</span>
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
                      <span>Withdraw</span>
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
                      <span>Balance</span>
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
                      <span>Remark</span>
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
                      <span>From/To</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedTransactions.length > 0 ? (
                  processedTransactions.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="text-[13px] text-black bg-white"
                    >
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap"
                        style={{
                          borderRight: "1px solid #c8ced3",
                          borderBottom: "1px solid #c8ced3",
                        }}
                      >
                        {row.dateTime !== "--"
                          ? new Date(row.dateTime)
                              .toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              })
                              .replace(",", "")
                          : "--"}
                      </td>
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap"
                        style={{
                          borderRight: "1px solid #c8ced3",
                          borderBottom: "1px solid #c8ced3",
                        }}
                      >
                        {row.deposit}
                      </td>
                      <td
                        className={`px-3 py-2 text-center whitespace-nowrap ${
                          Number(row.withdraw) > 0
                            ? "text-red-600 font-bold"
                            : ""
                        }`}
                        style={{
                          borderRight: "1px solid #c8ced3",
                          borderBottom: "1px solid #c8ced3",
                        }}
                      >
                        {row.withdraw}
                      </td>
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap"
                        style={{
                          borderRight: "1px solid #c8ced3",
                          borderBottom: "1px solid #c8ced3",
                        }}
                      >
                        {row.balance}
                      </td>
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap"
                        style={{
                          borderRight: "1px solid #c8ced3",
                          borderBottom: "1px solid #c8ced3",
                        }}
                      >
                        {row.remark}
                      </td>
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap"
                        style={{ borderBottom: "1px solid #c8ced3" }}
                      >
                        {row.fromTo}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-4 text-center text-gray-500 text-[13px]"
                      style={{ borderBottom: "1px solid #c8ced3" }}
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info & Pagination */}
          <div className="text-center text-[13px] text-[#555] py-2 border-t border-gray-100">
            Showing{" "}
            {totalEntries > 0
              ? (currentPage - 1) * Number(entriesPerPage) + 1
              : 0}{" "}
            to {Math.min(currentPage * Number(entriesPerPage), totalEntries)} of{" "}
            {totalEntries} entries
          </div>

          <div className="flex items-center justify-center gap-4 text-[13px] text-[#333] pb-3.5 pt-1">
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

export default AccountStatement;
