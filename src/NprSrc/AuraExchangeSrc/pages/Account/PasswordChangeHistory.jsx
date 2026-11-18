import { useEffect, useState } from "react";
import { GetDownlinelogPasswordHistory } from "../../../../api";

const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const PasswordChangeHistory = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [PassWordHistoryData, setPassWordHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GetDownlinelogPasswordHistoryFromApi();
  }, []);

  const GetDownlinelogPasswordHistoryFromApi = async () => {
    try {
      setLoading(true);
      const response = await GetDownlinelogPasswordHistory();
      const data = response?.data?.data || response?.data || [];
      if (!response.success && !Array.isArray(data)) {
        throw new Error(
          data.message || "Failed to fetch password history data"
        );
      }
      setPassWordHistoryData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err.message);
      setPassWordHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalEntries = PassWordHistoryData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = PassWordHistoryData.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handleEntriesChange = (value) => {
    setEntriesPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="p-1 sm:p-4 max-w-full space-y-4 mt-4">
      {/* Bottom Table Card */}
      <div className="border border-[#cdd5dc] rounded-[4px] bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[linear-gradient(-180deg,_#2E4B5E_0%,_#243A48_82%)] px-3.5 py-2">
          <h2 className="text-white text-[14px] font-bold tracking-wide m-0">
            Password Change History
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

        {/* Table Content - Single screen fit, no horizontal scroll */}
        <div className="px-2 sm:px-4 pb-2 bg-white w-full">
          <table
            className="w-full"
            style={{
              borderCollapse: "collapse",
              border: "1px solid #c8ced3",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#dfe6e7" }}>
                <th
                  className="px-2 sm:px-3 py-2 sm:py-2.5 text-center text-black font-bold text-[12.5px] sm:text-[13.5px] w-[45%]"
                  style={{
                    borderRight: "1px solid #c8ced3",
                    borderBottom: "1px solid #c8ced3",
                  }}
                  scope="col"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <span>Date/Time</span>
                    <svg className="w-3 h-3.5 sm:w-3.5 sm:h-4 shrink-0" viewBox="0 0 24 24">
                      <polygon points="12,4 5,11 19,11" fill="#70808a" />
                      <polygon points="12,20 5,13 19,13" fill="#70808a" />
                    </svg>
                  </div>
                </th>
                <th
                  className="px-2 sm:px-3 py-2 sm:py-2.5 text-center text-black font-bold text-[12.5px] sm:text-[13.5px] w-[55%]"
                  style={{
                    borderBottom: "1px solid #c8ced3",
                  }}
                  scope="col"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <span>Remark</span>
                    <svg className="w-3 h-3.5 sm:w-3.5 sm:h-4 shrink-0" viewBox="0 0 24 24">
                      <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                      <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                    </svg>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="text-[12px] sm:text-[13px] text-black bg-white"
                  >
                    <td
                      className="px-2 sm:px-3 py-2 sm:py-2.5 text-center"
                      style={{
                        borderRight: "1px solid #c8ced3",
                        borderBottom: "1px solid #c8ced3",
                      }}
                    >
                      {formatDate(row?.createdAt || row?.dateTime)}
                    </td>
                    <td
                      className="px-2 sm:px-3 py-2 sm:py-2.5 text-center"
                      style={{ borderBottom: "1px solid #c8ced3" }}
                    >
                      {row?.remark || row?.remarks || "--"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-4 text-center text-gray-500 text-[13px]"
                    style={{ borderBottom: "1px solid #c8ced3" }}
                  >
                    {loading
                      ? "Loading..."
                      : "No password change history found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info & Pagination */}
        <div className="text-center text-[13px] text-[#555] py-2 border-t border-gray-100">
          Showing {totalEntries > 0 ? startIndex + 1 : 0} to{" "}
          {Math.min(startIndex + entriesPerPage, totalEntries)} of{" "}
          {totalEntries} entries
        </div>

        <div className="flex items-center justify-center gap-3 text-[13px] text-[#333] pb-3.5 pt-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(1)}
            className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            First
          </button>
          <button
            type="button"
            disabled={currentPage <= 1}
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
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeHistory;
