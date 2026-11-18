// CommonTable.jsx
import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import "../../App.css";

export default function CommonTable({
  data = [],
  columns = [],
  title = "Table",
  showEntriesOptions = [10, 25, 50, 100],
  initialEntriesPerPage = 10,
  entriesPerPage,
  onEntriesPerPageChange,
  showPagination = true,
  emptyMessage = "No data available.",
  tbodyClassName = "font-bold",
  toggleableView = false,
  currentPage = 1,
  totalPages = 1,
  totalEntries = 0,
  onPageChange,
  // Optional callbacks for clickable rows
  onUserSportsProfitLossClick,
  onUserEventProfitLossClick,
  onUserBetDetailsClick,
  level = "sport",
  LaybackButton = false,
}) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [entriesPerPageInternal, setEntriesPerPageInternal] = useState(
    initialEntriesPerPage.toString()
  );

  // Use controlled value when provided, otherwise fall back to internal state
  const effectiveEntriesPerPage = (
    entriesPerPage != null ? entriesPerPage : entriesPerPageInternal
  ).toString();
  const [displayData, setDisplayData] = useState(data);
  // Since we're doing SERVER-SIDE pagination, we do NOT slice the data
  // The `data` prop already contains only the records for current page
  useEffect(() => {
    setDisplayData(data);
  }, [data]);
  const pageSize = Number.parseInt(effectiveEntriesPerPage, 10) || 10;
  const showingStart = totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(currentPage * pageSize, totalEntries);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };

  const renderCellContent = (row, column) => {
    if (column.renderCell) {
      return column.renderCell(row);
    }
    return String(row[column.key] ?? "");
  };

  return (
    <div className="bg-light-bg dark:bg-dark-bg border-t-2 rounded-t-sm border-gray-900">
      <div className="rounded-t overflow-hidden shadow-lg">
        {/* Header */}
        <div className="p-2 bg-gradient-to-b from-[#2E4B5E] to-[#243A48] flex justify-between items-center">
          <h2 className="text-white text-[14px] font-bold">{title}</h2>

          {toggleableView && (
            <div className="flex items-center space-x-3">
              <span className="text-white text-sm">
                {isMobileView ? "Card View" : "Table View"}
              </span>
              <button
                type="button"
                onClick={() => setIsMobileView(!isMobileView)}
                className="relative inline-flex h-7 w-12 items-center rounded-full bg-gray-700 transition-colors focus:outline-none"
                aria-checked={isMobileView}
                role="switch"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition ${
                    isMobileView ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="bg-light-bg dark:bg-dark-bg">
          <div className="overflow-x-auto">
            {/* Top Info Bar */}
            {showPagination && (
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 text-sm">Show</span>

                  <select
                    value={effectiveEntriesPerPage}
                    onChange={(e) => {
                      const next = e.target.value;
                      setEntriesPerPageInternal(next);
                      onEntriesPerPageChange?.(Number(next));
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {showEntriesOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <span className="text-gray-700 text-sm">entries</span>
                </div>
              </div>
            )}
            {/* Empty State */}
            {displayData.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-lg">
                {emptyMessage}
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                {isMobileView ? (
                  <div className="p-4 space-y-4">
                    {displayData.map((row, i) => (
                      <div
                        key={`${row.id}-${currentPage}`}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border border-gray-200"
                      >
                        {columns.map((col) => (
                          <div
                            key={col.key}
                            className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-gray-600">
                              {col.mobileLabel || col.header}
                            </span>
                            <span className="text-right">
                              {renderCellContent(row, col)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Desktop Table View */
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#e0e6e6]  border-2 border-[#c8ced3] text-black font-bold text-sm">
                        {columns.map((col, i) => (
                          <th
                            key={i}
                            className="px-6 py-3 text-left text-[13px] font-bold  tracking-wider whitespace-nowrap aura-table-head
                             bg-[#e0e6e6]"
                          >
                            {col.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                      {displayData.map((row, i) => {
                        const rowClass =
                          row.type === "Back"
                            ? "bg-blue-50"
                            : row.type === "Lay"
                            ? "bg-red-50"
                            : "";

                        return (
                          <tr
                            key={`${row.id}-${currentPage}`}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${rowClass}`}
                          >
                            {columns.map((col) => {
                              const content = renderCellContent(row, col);

                              const isClickableSport =
                                col.key === "sportName" && level === "sport";
                              const isClickableEvent =
                                col.key === "eventName" && level === "event";
                              const isClickableMarket =
                                col.key === "market" && level === "market";

                              return (
                                <td
                                  key={col.key}
                                  className={`px-4 py-3 text-center text-[13px] ${tbodyClassName} border-r border-gray-200 last:border-r-0`}
                                >
                                  {isClickableSport ? (
                                    <button
                                      onClick={() =>
                                        onUserSportsProfitLossClick?.(row)
                                      }
                                      className="text-blue-600 hover:underline"
                                    >
                                      {content}
                                    </button>
                                  ) : isClickableEvent ? (
                                    <button
                                      onClick={() =>
                                        onUserEventProfitLossClick?.(row)
                                      }
                                      className="text-blue-600 hover:underline"
                                    >
                                      {content}
                                    </button>
                                  ) : isClickableMarket ? (
                                    <button
                                      onClick={() =>
                                        onUserBetDetailsClick?.(row)
                                      }
                                      className="text-blue-600 hover:underline"
                                    >
                                      {content}
                                    </button>
                                  ) : (
                                    content
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {/* Pagination Controls */}
            {/* Pagination Controls */}
            {showPagination && totalEntries > 0 && (
              <div className="sm:flex flex-col flex space-y-3 justify-center w-full sm:justify-between items-center mt-4 px-4 py-2">
                <div className="text-sm text-gray-700">
                  Showing {showingStart} to {showingEnd} of {totalEntries}{" "}
                  entries
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageClick(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>

                  <button
                    onClick={() => handlePageClick(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1 text-sm font-medium bg-gray-100 rounded">
                    {currentPage}
                  </span>

                  <button
                    onClick={() => handlePageClick(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>

                  <button
                    onClick={() => handlePageClick(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
