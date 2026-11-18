import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuraGetProfitLoss } from "../../../../api";
import Loader from "../../../../utils/Loader";
import { selectSite } from "../../../../utils/helper/commonSelectors";
import CommonTable from "../../components/TableComponent/TableComponent";
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
      second,
    )}+05:30`;
    const d = new Date(isoWithOffset);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split(".")[0] + "Z";
  } catch {
    return null;
  }
};

const ProfitLoss = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const level = searchParams.get("level") || "sport";
  const selectedSport = searchParams.get("sport") || "";
  const selectedEvent = searchParams.get("event") || "";

  const urlDataSource = searchParams.get("dataSource") || "";
  const urlStartDate = searchParams.get("startDate") || "";
  const urlEndDate = searchParams.get("endDate") || "";

  const savedDataSource =
    urlDataSource ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("pl_dataSource") || ""
      : "");
  const [dataSource, setDataSource] = useState(
    savedDataSource || (level !== "sport" ? "Old Data" : "Live Data"),
  );

  const topHeaderColor = useSelector(selectSite())?.headerColor || {
    start: "#2E4B5E",
    end: "#243A48",
  };

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state — NEW
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const todayStr = getISTToday();
  const getDatesForSource = (src) => {
    if (src === "Live Data") {
      return { start: todayStr, end: todayStr };
    } else if (src === "Backup Data") {
      const d = new Date(todayStr + "T00:00:00");
      d.setMonth(d.getMonth() - 3);
      return { start: formatYYYYMMDD(d), end: todayStr };
    } else if (src === "Old Data") {
      const d = new Date(todayStr + "T00:00:00");
      d.setFullYear(d.getFullYear() - 1);
      return { start: formatYYYYMMDD(d), end: todayStr };
    } else {
      const d = new Date(todayStr + "T00:00:00");
      d.setDate(d.getDate() - 7);
      return { start: formatYYYYMMDD(d), end: todayStr };
    }
  };

  const savedStart =
    urlStartDate ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("pl_startDate") || ""
      : "");
  const savedEnd =
    urlEndDate ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("pl_endDate") || ""
      : "");

  const initialDates =
    savedStart && savedEnd
      ? { start: savedStart, end: savedEnd }
      : getDatesForSource(savedDataSource || (level !== "sport" ? "Old Data" : "Live Data"));

  const [startDateLocal, setStartDateLocal] = useState(initialDates.start);
  const [endDateLocal, setEndDateLocal] = useState(initialDates.end);

  const controllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);

  const updateURL = (obj) => {
    const copy = Object.fromEntries(searchParams.entries());
    if (dataSource) copy.dataSource = dataSource;
    if (startDateLocal) copy.startDate = startDateLocal;
    if (endDateLocal) copy.endDate = endDateLocal;
    Object.keys(obj).forEach((key) => {
      if (obj[key] === "" || obj[key] == null) delete copy[key];
      else copy[key] = obj[key];
    });
    setSearchParams(copy);
  };

  const handleDataSourceChange = (newSource) => {
    setDataSource(newSource);
    if (newSource) {
      const dates = getDatesForSource(newSource);
      setStartDateLocal(dates.start);
      setEndDateLocal(dates.end);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pl_dataSource", newSource);
        sessionStorage.setItem("pl_startDate", dates.start);
        sessionStorage.setItem("pl_endDate", dates.end);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (dataSource) sessionStorage.setItem("pl_dataSource", dataSource);
      if (startDateLocal) sessionStorage.setItem("pl_startDate", startDateLocal);
      if (endDateLocal) sessionStorage.setItem("pl_endDate", endDateLocal);
    }
  }, [dataSource, startDateLocal, endDateLocal]);

  const getProfitLossSummary = useCallback(
    async (page = 1, pageSize = entriesPerPage) => {
      const reqId = ++latestRequestIdRef.current;

      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const startDateUTC = istDateToUTCZ(startDateLocal, 0, 0, 0);
        const endDateUTC = istDateToUTCZ(endDateLocal, 23, 59, 59);

        // When in market level, fetch all bets for this event to calculate total P&L per market
        const limitParam = level === "market" ? 1000 : pageSize;

        const params = {
          sport: selectedSport || "",
          event: selectedEvent || "",
          startDate: startDateUTC,
          endDate: endDateUTC,
          page: level === "market" ? 1 : page,
          limit: limitParam,
        };

        const res = await AuraGetProfitLoss(params, {
          signal: controller.signal,
        });

        if (reqId !== latestRequestIdRef.current) return;

        const apiData = res?.data?.data || [];
        const pagination = res?.data?.pagination || {};

        if (level === "market") {
          // Group bets by market and calculate total P&L, Commission, and result.
          // Note: Fancy bets are NOT merged - each Fancy bet shows as its own single row.
          const marketMap = new Map();
          apiData.forEach((row, idx) => {
            const rawMarket =
              row.market || row.markettype || row.marketName || "--";
            const isFancy =
              String(row.markettype || "").trim().toLowerCase().startsWith("fancy") ||
              String(row.marketType || "").trim().toLowerCase().startsWith("fancy") ||
              String(row.market || "").trim().toLowerCase().startsWith("fancy") ||
              String(row.marketName || "").trim().toLowerCase().startsWith("fancy");

            // For fancy bets, use a unique key so they are NEVER merged
            const groupKey = isFancy
              ? `fancy_${row.betId || row._id || row.id || idx}_${idx}`
              : rawMarket;

            const displayMarket = isFancy
              ? (row.selection || (row.marketName && String(row.marketName).trim().toLowerCase() !== "fancy" ? row.marketName : rawMarket))
              : rawMarket;

            const pl = Number(row.playerProfitLoss ?? row.profitLoss ?? 0);
            const comm = Number(row.superCommission ?? row.commission ?? 0);

            if (!marketMap.has(groupKey)) {
              marketMap.set(groupKey, {
                ...row,
                id: row.betId || row._id || row.marketId || idx,
                sportName: row.sportName || row.sport || selectedSport,
                eventName: row.eventName || row.event || selectedEvent,
                market: displayMarket,
                isFancy,
                winnerResult:
                  row.winnerResult || row.result || row.winner || "--",
                profitLoss: pl,
                superCommission: comm,
                settledAt: row.settledAt || row.settleTime || row.createdAt,
                userId: row.userId,
                userName: row.userName,
                eventId: row.eventId,
                marketId: row.marketId,
                betId: row.betId || row._id,
              });
            } else {
              const existing = marketMap.get(groupKey);
              existing.profitLoss += pl;
              existing.superCommission += comm;
              if (
                (!existing.winnerResult || existing.winnerResult === "--") &&
                (row.winnerResult || row.result || row.winner)
              ) {
                existing.winnerResult =
                  row.winnerResult || row.result || row.winner;
              }
              if (row.settledAt) {
                existing.settledAt = row.settledAt;
              }
              if (!existing.marketId && row.marketId)
                existing.marketId = row.marketId;
              if (!existing.betId && row.betId) existing.betId = row.betId;
            }
          });

          const transformed = Array.from(marketMap.values());
          setTransactions(transformed);
          setTotalItems(transformed.length);
          setTotalPages(
            Math.max(1, Math.ceil(transformed.length / Number(entriesPerPage))),
          );
          setCurrentPage(1);
        } else {
          const transformed = apiData.map((row, idx) => ({
            ...row,
            id: row._id || idx,
            sportName: row.sportName || row.sport || "--",
            eventName: row.eventName || row.event || "--",
            market: row.market || row.markettype || "--",
            profitLoss: Number(row.playerProfitLoss || 0).toFixed(2),
            settledAt: row.settledAt,
          }));

          setTransactions(transformed);
          setTotalItems(pagination.total || pagination.totalItems || 0);
          setTotalPages(pagination.totalPages || 1);
          setCurrentPage(page);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setError("Failed to fetch profit/loss.");
        setTransactions([]);
      } finally {
        if (reqId === latestRequestIdRef.current) setLoading(false);
      }
    },
    [
      selectedSport,
      selectedEvent,
      startDateLocal,
      endDateLocal,
      entriesPerPage,
      level,
    ],
  );

  // Reset page to 1 when any filter changes, and fetch on mount/refresh
  useEffect(() => {
    if (dataSource || level !== "sport") {
      setCurrentPage(1);
      getProfitLossSummary(1);
    }
  }, [
    dataSource,
    startDateLocal,
    endDateLocal,
    selectedSport,
    selectedEvent,
    entriesPerPage,
    level,
  ]);

  // Handle pagination click
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (level !== "market") {
      getProfitLossSummary(page);
    }
  };

  const handleEntriesChange = (pageSize) => {
    const next = Number(pageSize) || 10;
    setEntriesPerPage(next);
    setCurrentPage(1);
    if (level === "market") {
      setTotalPages(Math.max(1, Math.ceil(transactions.length / next)));
    } else {
      getProfitLossSummary(1, next);
    }
  };

  const handleGetHistory = () => {
    setCurrentPage(1);
    getProfitLossSummary(1);
  };

  const handleSportClick = (row) =>
    updateURL({ level: "event", sport: row.sportName, event: "" });
  const handleEventClick = (row) =>
    updateURL({ level: "market", sport: selectedSport, event: row.eventName });

  const handleMarketClick = (row) => {
    if (row?.sportName !== "Int Casino") {
      const isFancy =
        row?.isFancy ||
        String(row?.markettype || "").trim().toLowerCase().startsWith("fancy") ||
        String(row?.marketType || "").trim().toLowerCase().startsWith("fancy") ||
        String(row?.market || "").trim().toLowerCase().startsWith("fancy") ||
        String(row?.marketName || "").trim().toLowerCase().startsWith("fancy");

      const betIdParam = row?.betId || row?._id || "";
      const marketIdParam = isFancy && betIdParam ? "" : (row?.marketId || "");
      const url = `/userBetHistory?userId=${row?.userId || ""}&userName=${row?.userName || ""}&sportName=${row?.sportName || selectedSport}&eventId=${row?.eventId || ""}&marketId=${marketIdParam}${betIdParam ? `&betId=${betIdParam}` : ""}`;
      navigate(url);
    }
  };

  const handleBack = () => {
    if (level === "market") updateURL({ level: "event", event: "" });
    else if (level === "event")
      updateURL({ level: "sport", sport: "", event: "" });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatPL = (val) => {
    const num = Number(val || 0);
    if (isNaN(num)) return "0";
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  const formatSettleTime = (val) => {
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

  const displayedTransactions = useMemo(() => {
    let list = [...transactions];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.sportName?.toLowerCase().includes(q) ||
          r.eventName?.toLowerCase().includes(q) ||
          r.market?.toLowerCase().includes(q) ||
          r.winnerResult?.toLowerCase().includes(q) ||
          String(r.profitLoss).includes(q) ||
          String(r.settledAt).includes(q),
      );
    }
    if (sortField) {
      list.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === "profitLoss" || sortField === "superCommission") {
          valA = Number(valA || 0);
          valB = Number(valB || 0);
        } else {
          valA = String(valA || "").toLowerCase();
          valB = String(valB || "").toLowerCase();
        }
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    if (level === "market") {
      const start = (currentPage - 1) * Number(entriesPerPage);
      return list.slice(start, start + Number(entriesPerPage));
    }
    return list;
  }, [
    transactions,
    searchQuery,
    sortField,
    sortDirection,
    level,
    currentPage,
    entriesPerPage,
  ]);

  return (
    <div className="p-1 sm:p-4 max-w-full space-y-4 mt-4">
      {/* Filter Section: ONLY shown on top level (sport) */}
      {level === "sport" && (
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
              onChange={(e) => handleDataSourceChange(e.target.value)}
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
            value={startDateLocal}
            onChange={(e) => setStartDateLocal(e.target.value)}
            placeholder="YYYY-MM-DD"
          />

          {/* Row 3: End Date */}
          <AuraDatePicker
            value={endDateLocal}
            onChange={(e) => setEndDateLocal(e.target.value)}
            placeholder="YYYY-MM-DD"
          />

          {/* Row 4: Get P&L Button */}
          <div>
            <button
              type="button"
              onClick={handleGetHistory}
              disabled={loading}
              className={`h-[32px] w-[178px] text-white font-bold text-[13.5px] rounded-[3px] transition-colors cursor-pointer inline-flex items-center justify-center shadow-sm hover:brightness-110 active:brightness-90 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
              }}
            >
              Get P&L
            </button>
          </div>

          {error && (
            <div className="p-2 bg-red-100 text-red-700 border border-red-300 rounded text-sm text-center">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Loader */}
      {/* {loading && <Loader />} */}

      {/* Bottom Table Card */}
      {true && (
        <div className="border border-[#cdd5dc] rounded-[4px] bg-white overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-[linear-gradient(-180deg,_#2E4B5E_0%,_#243A48_82%)] px-3.5 py-2 flex items-center">
            <h2 className="text-white text-[14px] font-bold tracking-wide m-0">
              {level === "event"
                ? "Profit/Loss Events"
                : level === "market"
                ? "Profit/Loss Markets"
                : "Profit/Loss"}
            </h2>
          </div>

          {/* Show Entries & Search Controls */}
          <div className="pt-2.5 pb-2 text-[13px] text-[#333] flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-1.5">
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

            {/* Search Input for Events / Markets */}
            {level !== "sport" && (
              <div className="flex items-center justify-center gap-1.5">
                <span>Search:</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-[28px] w-[150px] px-2 bg-white border border-[#cdd5dc] rounded-[3px] text-[13px] text-[#333] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Table Content */}
          <div
            className={`px-2 sm:px-4 pb-2 bg-white w-full ${
              level === "market" ? "overflow-x-auto" : ""
            }`}
          >
            <table
              className={`w-full ${
                level === "market" ? "min-w-[760px]" : "table-fixed"
              }`}
              style={{
                borderCollapse: "collapse",
                border: "1px solid #c8ced3",
              }}
            >
              <thead>
                {level === "market" ? (
                  <tr style={{ backgroundColor: "#dfe6e7" }}>
                    {/* 1. Sport Name */}
                    <th
                      onClick={() => handleSort("sportName")}
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                      style={{
                        width: "12%",
                        minWidth: "100px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Sport Name</span>
                        <svg className="w-3 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <polygon
                            points="12,4 5,11 19,11"
                            fill={
                              sortField === "sportName" &&
                              sortDirection === "asc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                          <polygon
                            points="12,20 5,13 19,13"
                            fill={
                              sortField === "sportName" &&
                              sortDirection === "desc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                        </svg>
                      </div>
                    </th>

                    {/* 2. Event Name */}
                    <th
                      onClick={() => handleSort("eventName")}
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                      style={{
                        width: "22%",
                        minWidth: "160px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Event Name</span>
                        <svg className="w-3 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <polygon
                            points="12,4 5,11 19,11"
                            fill={
                              sortField === "eventName" &&
                              sortDirection === "asc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                          <polygon
                            points="12,20 5,13 19,13"
                            fill={
                              sortField === "eventName" &&
                              sortDirection === "desc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                        </svg>
                      </div>
                    </th>

                    {/* 3. Market Name */}
                    <th
                      onClick={() => handleSort("market")}
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                      style={{
                        width: "16%",
                        minWidth: "120px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Market Name</span>
                        <svg className="w-3 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <polygon
                            points="12,4 5,11 19,11"
                            fill={
                              sortField === "market" && sortDirection === "asc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                          <polygon
                            points="12,20 5,13 19,13"
                            fill={
                              sortField === "market" && sortDirection === "desc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                        </svg>
                      </div>
                    </th>

                    {/* 4. Result */}
                    <th
                      onClick={() => handleSort("winnerResult")}
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                      style={{
                        width: "14%",
                        minWidth: "100px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Result</span>
                        <svg className="w-3 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <polygon
                            points="12,4 5,11 19,11"
                            fill={
                              sortField === "winnerResult" &&
                              sortDirection === "asc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                          <polygon
                            points="12,20 5,13 19,13"
                            fill={
                              sortField === "winnerResult" &&
                              sortDirection === "desc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                        </svg>
                      </div>
                    </th>

                    {/* 5. Profit/Loss */}
                    <th
                      onClick={() => handleSort("profitLoss")}
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                      style={{
                        width: "12%",
                        minWidth: "90px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Profit/Loss</span>
                        <svg className="w-3 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <polygon
                            points="12,4 5,11 19,11"
                            fill={
                              sortField === "profitLoss" &&
                              sortDirection === "asc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                          <polygon
                            points="12,20 5,13 19,13"
                            fill={
                              sortField === "profitLoss" &&
                              sortDirection === "desc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                        </svg>
                      </div>
                    </th>

                    {/* 6. Commission */}
                    <th
                      onClick={() => handleSort("superCommission")}
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                      style={{
                        width: "11%",
                        minWidth: "80px",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Commission</span>
                        <svg className="w-3 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <polygon
                            points="12,4 5,11 19,11"
                            fill={
                              sortField === "superCommission" &&
                              sortDirection === "asc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                          <polygon
                            points="12,20 5,13 19,13"
                            fill={
                              sortField === "superCommission" &&
                              sortDirection === "desc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                        </svg>
                      </div>
                    </th>

                    {/* 7. Settle Time */}
                    <th
                      onClick={() => handleSort("settledAt")}
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                      style={{
                        width: "13%",
                        minWidth: "140px",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Settle Time</span>
                        <svg className="w-3 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <polygon
                            points="12,4 5,11 19,11"
                            fill={
                              sortField === "settledAt" &&
                              sortDirection === "asc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                          <polygon
                            points="12,20 5,13 19,13"
                            fill={
                              sortField === "settledAt" &&
                              sortDirection === "desc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                        </svg>
                      </div>
                    </th>
                  </tr>
                ) : (
                  <tr style={{ backgroundColor: "#dfe6e7" }}>
                    {/* Column 1: Sport Name */}
                    <th
                      onClick={() => handleSort("sportName")}
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                      style={{
                        width: level === "sport" ? "36%" : "25%",
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Sport Name</span>
                        <svg className="w-3 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <polygon
                            points="12,4 5,11 19,11"
                            fill={
                              sortField === "sportName" &&
                              sortDirection === "asc"
                                ? "#222"
                                : "#70808a"
                            }
                          />
                          <polygon
                            points="12,20 5,13 19,13"
                            fill={
                              sortField === "sportName" &&
                              sortDirection === "desc"
                                ? "#222"
                                : "#70808a"
                            }
                          />
                        </svg>
                      </div>
                    </th>

                    {/* Column 2: Event Name */}
                    {level === "event" && (
                      <th
                        onClick={() => handleSort("eventName")}
                        className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                        style={{
                          width: "50%",
                          borderRight: "1px solid #c8ced3",
                          borderBottom: "1px solid #c8ced3",
                        }}
                        scope="col"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Event Name</span>
                          <svg
                            className="w-3 h-3.5 shrink-0"
                            viewBox="0 0 24 24"
                          >
                            <polygon
                              points="12,4 5,11 19,11"
                              fill={
                                sortField === "eventName" &&
                                sortDirection === "asc"
                                  ? "#222"
                                  : "#b0bcc2"
                              }
                            />
                            <polygon
                              points="12,20 5,13 19,13"
                              fill={
                                sortField === "eventName" &&
                                sortDirection === "desc"
                                  ? "#222"
                                  : "#b0bcc2"
                              }
                            />
                          </svg>
                        </div>
                      </th>
                    )}

                    {/* Column: Profit/Loss */}
                    <th
                      onClick={() => handleSort("profitLoss")}
                      className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                      style={{
                        width: level === "sport" ? "34%" : "25%",
                        borderRight:
                          level === "sport" ? "1px solid #c8ced3" : "none",
                        borderBottom: "1px solid #c8ced3",
                      }}
                      scope="col"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Profit/Loss</span>
                        <svg className="w-3 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <polygon
                            points="12,4 5,11 19,11"
                            fill={
                              sortField === "profitLoss" &&
                              sortDirection === "asc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                          <polygon
                            points="12,20 5,13 19,13"
                            fill={
                              sortField === "profitLoss" &&
                              sortDirection === "desc"
                                ? "#222"
                                : "#b0bcc2"
                            }
                          />
                        </svg>
                      </div>
                    </th>

                    {/* Column: Commission (ONLY on sport level) */}
                    {level === "sport" && (
                      <th
                        onClick={() => handleSort("superCommission")}
                        className="px-2 py-2.5 text-center text-black font-bold text-[13px] cursor-pointer select-none"
                        style={{
                          width: "30%",
                          borderBottom: "1px solid #c8ced3",
                        }}
                        scope="col"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Commission</span>
                          <svg
                            className="w-3 h-3.5 shrink-0"
                            viewBox="0 0 24 24"
                          >
                            <polygon
                              points="12,4 5,11 19,11"
                              fill={
                                sortField === "superCommission" &&
                                sortDirection === "asc"
                                  ? "#222"
                                  : "#b0bcc2"
                              }
                            />
                            <polygon
                              points="12,20 5,13 19,13"
                              fill={
                                sortField === "superCommission" &&
                                sortDirection === "desc"
                                  ? "#222"
                                  : "#b0bcc2"
                              }
                            />
                          </svg>
                        </div>
                      </th>
                    )}
                  </tr>
                )}
              </thead>
              <tbody>
                {displayedTransactions.length > 0 ? (
                  level === "market" ? (
                    displayedTransactions.map((row, index) => {
                      const pl = Number(row.profitLoss || 0);
                      const isPlPos = pl > 0;
                      const comm = Number(
                        row.superCommission || row.commission || 0,
                      );
                      const isCommPos = comm > 0;

                      return (
                        <tr
                          key={row.id || index}
                          className="text-[13px] text-black bg-white"
                        >
                          {/* 1. Sport Name */}
                          <td
                            className="px-2 py-2.5 text-center"
                            style={{
                              borderRight: "1px solid #c8ced3",
                              borderBottom: "1px solid #c8ced3",
                            }}
                          >
                            <span className="text-black font-normal">
                              {row.sportName}
                            </span>
                          </td>

                          {/* 2. Event Name */}
                          <td
                            className="px-2 py-2.5 text-center break-words"
                            style={{
                              borderRight: "1px solid #c8ced3",
                              borderBottom: "1px solid #c8ced3",
                            }}
                          >
                            <span className="text-black font-normal">
                              {row.eventName}
                            </span>
                          </td>

                          {/* 3. Market Name */}
                          <td
                            className="px-2 py-2.5 text-center break-words"
                            style={{
                              borderRight: "1px solid #c8ced3",
                              borderBottom: "1px solid #c8ced3",
                            }}
                          >
                            <span
                              className="text-[#2789ce] font-bold cursor-pointer hover:underline"
                              onClick={() => handleMarketClick(row)}
                            >
                              {row.market}
                            </span>
                          </td>

                          {/* 4. Result */}
                          <td
                            className="px-2 py-2.5 text-center text-black break-words"
                            style={{
                              borderRight: "1px solid #c8ced3",
                              borderBottom: "1px solid #c8ced3",
                            }}
                          >
                            {row.winnerResult || "--"}
                          </td>

                          {/* 5. Profit/Loss */}
                          <td
                            className={`px-2 py-2.5 text-center font-bold ${
                              isPlPos ? "text-[#188c3a]" : "text-[#d0021b]"
                            }`}
                            style={{
                              borderRight: "1px solid #c8ced3",
                              borderBottom: "1px solid #c8ced3",
                            }}
                          >
                            {formatPL(pl)}
                          </td>

                          {/* 6. Commission */}
                          <td
                            className={`px-2 py-2.5 text-center font-bold ${
                              isCommPos ? "text-[#188c3a]" : "text-[#d0021b]"
                            }`}
                            style={{
                              borderRight: "1px solid #c8ced3",
                              borderBottom: "1px solid #c8ced3",
                            }}
                          >
                            {formatPL(comm)}
                          </td>

                          {/* 7. Settle Time */}
                          <td
                            className="px-2 py-2.5 text-center text-black whitespace-nowrap"
                            style={{ borderBottom: "1px solid #c8ced3" }}
                          >
                            {formatSettleTime(row.settledAt)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    displayedTransactions.map((row, index) => {
                      const pl = Number(
                        row.profitLoss || row.playerProfitLoss || 0,
                      );
                      const isPlPos = pl > 0;
                      const comm = Number(
                        row.superCommission || row.commission || 0,
                      );

                      return (
                        <tr
                          key={row.id || index}
                          className="text-[13px] text-black bg-white"
                        >
                          {/* Sport Name */}
                          <td
                            className="px-2 py-2.5 text-center break-words"
                            style={{
                              borderRight: "1px solid #c8ced3",
                              borderBottom: "1px solid #c8ced3",
                            }}
                          >
                            {level === "sport" ? (
                              <span
                                className="text-[#2789ce] font-bold cursor-pointer hover:underline"
                                onClick={() => handleSportClick(row)}
                              >
                                {row.sportName}
                              </span>
                            ) : (
                              <span className="text-black font-normal">
                                {row.sportName}
                              </span>
                            )}
                          </td>

                          {/* Event Name */}
                          {level === "event" && (
                            <td
                              className="px-2 py-2.5 text-center break-words"
                              style={{
                                borderRight: "1px solid #c8ced3",
                                borderBottom: "1px solid #c8ced3",
                              }}
                            >
                              <span
                                className="text-[#2789ce] font-bold cursor-pointer hover:underline"
                                onClick={() => handleEventClick(row)}
                              >
                                {row.eventName}
                              </span>
                            </td>
                          )}

                          {/* Profit/Loss */}
                          <td
                            className={`px-2 py-2.5 text-center font-bold ${
                              isPlPos ? "text-[#188c3a]" : "text-[#d0021b]"
                            }`}
                            style={{
                              borderRight:
                                level === "sport"
                                  ? "1px solid #c8ced3"
                                  : "none",
                              borderBottom: "1px solid #c8ced3",
                            }}
                          >
                            {formatPL(pl)}
                          </td>

                          {/* Commission (ONLY on sport level) */}
                          {level === "sport" && (
                            <td
                              className="px-2 py-2.5 text-center"
                              style={{ borderBottom: "1px solid #c8ced3" }}
                            >
                              {comm.toFixed(2)}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={level === "market" ? 7 : 3}
                      className="px-3 py-4 text-center text-gray-500 text-[13px]"
                      style={{ borderBottom: "1px solid #c8ced3" }}
                    >
                      No statements found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info & Pagination */}
          <div className="text-center text-[13px] text-[#555] py-2 border-t border-gray-100">
            Showing{" "}
            {totalItems > 0
              ? (currentPage - 1) * Number(entriesPerPage) + 1
              : 0}{" "}
            to {Math.min(currentPage * Number(entriesPerPage), totalItems)} of{" "}
            {totalItems} entries
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

export default ProfitLoss;
