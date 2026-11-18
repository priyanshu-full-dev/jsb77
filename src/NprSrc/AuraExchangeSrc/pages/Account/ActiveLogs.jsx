import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserId } from "../../../../utils/helper/commonSelectors";
import { getLoginRecord } from "../../../../api";
import Loader from "../../../../utils/Loader";
import { toast } from "react-toastify";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const pad = (n) => String(n).padStart(2, "0");
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const ActiveLogs = () => {
  const userID = useSelector(getUserId());

  const [activeLogs, setActiveLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entries, setEntries] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalEntries / entries));

  const fetchActiveData = async () => {
    if (!userID) return;

    setLoading(true);
    try {
      const res = await getLoginRecord(userID, {
        page: currentPage,
        limit: entries,
      });

      const records = res?.data?.data || [];
      setActiveLogs(
        records.map((log, idx) => ({
          id: log._id || idx,
          dateTime: formatDate(log.createdAt),
          status:
            log.status === "success" || String(log.status).toLowerCase().includes("success")
              ? "Login Successful"
              : "Login Failed",
          ipAddress: log.query || log.ip || "-",
          isp: log.isp || "-",
          location: log.cityStateCountry || log.city || "-",
        }))
      );

      setTotalEntries(res?.data?.pagination?.totalRecords || records.length);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveData();
  }, [userID, currentPage, entries]);

  const handleEntriesChange = (val) => {
    setEntries(Number(val));
    setCurrentPage(1);
  };

  return (
    <div className="p-1 sm:p-4 max-w-full space-y-4 mt-4">
      {/* Loader */}
      {/* {loading && <Loader />} */}

      {/* Bottom Table Card */}
      {true && (
        <div className="border border-[#cdd5dc] rounded-[4px] bg-white overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-[linear-gradient(-180deg,_#2E4B5E_0%,_#243A48_82%)] px-3.5 py-2">
            <h2 className="text-white text-[14px] font-bold tracking-wide m-0">
              Activity Log
            </h2>
          </div>

          {/* Show Entries */}
          <div className="py-2.5 flex items-center justify-center gap-1.5 text-[13px] text-[#333]">
            <span>Show</span>
            <select
              value={entries}
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
                      <span>Login Date & Time</span>
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
                      <span>Login Status</span>
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
                      <span>IP Address</span>
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
                      <span>ISP</span>
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
                      <span>City/State/Country</span>
                      <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 24 24">
                        <polygon points="12,4 5,11 19,11" fill="#b0bcc2" />
                        <polygon points="12,20 5,13 19,13" fill="#b0bcc2" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeLogs.length > 0 ? (
                  activeLogs.map((row, index) => {
                    const isSuccess = row.status === "Login Successful";
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
                          {row.dateTime}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-center whitespace-nowrap font-bold ${
                            isSuccess ? "text-green-600" : "text-red-600"
                          }`}
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {row.status}
                        </td>
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {row.ipAddress}
                        </td>
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{
                            borderRight: "1px solid #c8ced3",
                            borderBottom: "1px solid #c8ced3",
                          }}
                        >
                          {row.isp}
                        </td>
                        <td
                          className="px-3 py-2.5 text-center whitespace-nowrap"
                          style={{ borderBottom: "1px solid #c8ced3" }}
                        >
                          {row.location}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-gray-500 text-[13px]"
                      style={{ borderBottom: "1px solid #c8ced3" }}
                    >
                      No login records found
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
              ? (currentPage - 1) * Number(entries) + 1
              : 0}{" "}
            to {Math.min(currentPage * Number(entries), totalEntries)} of{" "}
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
              onClick={() => setCurrentPage(currentPage - 1)}
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
              onClick={() => setCurrentPage(currentPage + 1)}
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
        </div>
      )}
    </div>
  );
};

export default ActiveLogs;
