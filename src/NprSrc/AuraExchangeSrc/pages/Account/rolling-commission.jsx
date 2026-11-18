import { useState } from "react";
import AuraDatePicker from "../../components/AuraDatePicker/AuraDatePicker";

const pad = (n) => String(n).padStart(2, "0");
const formatYYYYMMDD = (d) => {
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${year}-${month}-${day}`;
};

const getISTToday = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
};

const RollingCommission = () => {
  const [dataSource, setDataSource] = useState("");
  const [sport, setSport] = useState("Cricket");

  const istToday = getISTToday();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(istToday + "T00:00:00");
    d.setDate(d.getDate() - 7);
    return formatYYYYMMDD(d);
  });
  const [endDate, setEndDate] = useState(() => istToday);

  const [commissionData, setCommissionData] = useState([]);

  const handleGetCommission = () => {
    console.log("Get Commission clicked", {
      dataSource,
      sport,
      startDate,
      endDate,
    });
  };

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

        {/* Row 4: Get Commission Button */}
        <div>
          <button
            type="button"
            onClick={handleGetCommission}
            className="h-[32px] px-5 bg-[#6f808a] hover:bg-[#5d6e77] text-white font-bold text-[13.5px] rounded-[3px] transition-colors cursor-pointer inline-flex items-center justify-center shadow-sm"
          >
            Get Commission
          </button>
        </div>
      </div>

      {/* Bottom Table Card */}
      <div className="border border-[#cdd5dc] rounded-[4px] bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[linear-gradient(-180deg,_#2E4B5E_0%,_#243A48_82%)] px-3.5 py-2">
          <h2 className="text-white text-[14px] font-bold tracking-wide m-0">
            Rolling Commission
          </h2>
        </div>

        {/* Table Content */}
        <div className="p-3.5 sm:p-4 bg-white overflow-x-auto">
          <table className="w-full border-collapse border border-[#dee2e6]">
            <thead>
              <tr
                className="bg-[#dfe6e7] text-[13.5px]"
                style={{ borderBottom: "2px solid #dee2e6" }}
              >
                <th
                  className="px-3 py-2.5 text-center text-black font-bold border-r border-[#dee2e6]"
                  scope="col"
                >
                  Type
                </th>
                <th
                  className="px-3 py-2.5 text-center text-black font-bold border-r border-[#dee2e6]"
                  scope="col"
                >
                  Total Stack
                </th>
                <th
                  className="px-3 py-2.5 text-center text-black font-bold"
                  scope="col"
                >
                  Total Commission
                </th>
              </tr>
            </thead>
            <tbody>
              {commissionData.length > 0 ? (
                commissionData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#dee2e6] last:border-b-0 text-[13.5px] text-black bg-white"
                  >
                    <td className="px-3 py-2.5 text-center border-r border-[#dee2e6]">
                      {row.type}
                    </td>
                    <td className="px-3 py-2.5 text-center border-r border-[#dee2e6]">
                      {row.totalStack}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {row.totalCommission}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-4 text-center text-gray-500 text-[13px]"
                  >
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RollingCommission;
