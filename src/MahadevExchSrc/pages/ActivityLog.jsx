import { useEffect, useState } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLoginRecord } from "../../api";
import { getUserId } from "../../utils/helper/commonSelectors";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Loader from "../components/Loader/Loader";

const ActivityLog = () => {
  const [activeLogs, setActiveLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const userID = useSelector(getUserId());

  const fetchActiveData = async (pageNo = 1) => {
    setLoading(true);

    try {
      const loginRecord = await getLoginRecord(userID, pageNo);

      const res = loginRecord?.data;

      setActiveLogs(res?.data || []);
      setPagination(res?.pagination || {});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveData(page);
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 p-3">

      {/* TITLE */}
      <div className="bg-white border rounded-md p-3 mb-3 shadow-sm">
        <h2 className="text-[16px] font-semibold">Activity Log</h2>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-md shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <div className="min-w-[720px]">

            {/* HEADER */}
            <div className="grid grid-cols-6 bg-[#f3f4f6] text-[12px] font-semibold border-b">
              <div className="px-3 py-2">Login Time</div>
              <div className="px-3 py-2">Status</div>
              <div className="px-3 py-2">IP Address</div>
              <div className="px-3 py-2">ISP</div>
              <div className="px-3 py-2">Location</div>
              <div className="px-3 py-2 text-right">Device</div>
            </div>

            {/* BODY */}
            {loading ? (
             <Loader/>
            ) : activeLogs.length > 0 ? (
              activeLogs.map((e, i) => (
                <div
                  key={e._id}
                  className={`grid grid-cols-6 text-[12px] border-b ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100`}
                >
                  <div className="px-3 py-2">
                    {moment(e.createdAt).format("DD MMM YYYY HH:mm")}
                  </div>

                  <div
                    className={`px-3 py-2 font-semibold capitalize ${
                      e.status === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {e.status}
                  </div>

                  <div className="px-3 py-2">{e.query}</div>

                  <div className="px-3 py-2">{e.isp}</div>

                  <div className="px-3 py-2">{e.cityStateCountry}</div>

                  <div className="px-3 py-2 text-right">Browser</div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 text-[13px]">
                No Activity Found
              </div>
            )}
          </div>
        </div>

        {/* PAGINATION */}
        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 p-3 border-t">

            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1 text-[12px] border rounded disabled:opacity-40"
            >
              <IoChevronBack />
              Prev
            </button>

            <span className="text-[12px] font-semibold">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 px-3 py-1 text-[12px] border rounded disabled:opacity-40"
            >
              Next
              <IoChevronForward />
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;