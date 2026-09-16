import React, { useState, useEffect } from 'react';
import { getProfitLossReport } from '../../api';

export default function BettingProfitLossSection({ user, onToast }) {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [profitLossList, setProfitLossList] = useState([]);
  const [totalPL, setTotalPL] = useState(0);

  const fetchProfitLoss = async () => {
    const token = localStorage.getItem('token') || user?.token;
    if (!token || user?.isDemo || user?.username === 'DEMO') {
      setProfitLossList([]);
      setTotalPL(0);
      return;
    }

    setLoading(true);
    try {
      const res = await getProfitLossReport({
        startDate: fromDate,
        endDate: toDate,
      });

      if (res?.data?.data || res?.data?.records || res?.data?.profit_loss) {
        const list = res?.data?.data || res?.data?.records || res?.data?.profit_loss || [];
        setProfitLossList(Array.isArray(list) ? list : []);
        
        // Compute total P/L
        const total = (Array.isArray(list) ? list : []).reduce(
          (acc, curr) => acc + (Number(curr.pnl || curr.profitLoss || curr.amount || 0) || 0),
          0
        );
        setTotalPL(total);
      } else {
        setProfitLossList([]);
        setTotalPL(0);
      }
    } catch (err) {
      console.error('Error fetching profit and loss:', err);
      setProfitLossList([]);
      setTotalPL(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    fetchProfitLoss();
  };

  return (
    <div className="w-full bg-[#f2f4f7] min-h-screen pb-24 text-neutral-900 select-none flex flex-col pt-0">
      {/* 1. GOLD TOP BANNER: "Profit and Loss" | "Total P/L : 0.00" */}
      <div
        style={{
          background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
        }}
        className="w-full px-3 py-2.5 flex items-center justify-between shadow-xs"
      >
        <h2 className="text-white font-bold text-[16px] tracking-wide drop-shadow-xs">
          Profit and Loss
        </h2>
        <div className="text-[14px] font-bold text-black flex items-center gap-1">
          <span>Total P/L :</span>
          <span
            className={`${
              totalPL > 0 ? 'text-green-700' : 'text-[#e53935]'
            }`}
          >
            {totalPL.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 2. FILTER CARD: "From" & "To Date" + "Submit" Button */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white px-3 py-3 border-b border-gray-200 flex flex-col gap-2.5"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* From */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-gray-700">From</label>
            <div className="border border-gray-300 rounded-[4px] px-2.5 py-1.5 flex items-center justify-between bg-white focus-within:border-amber-600 transition-colors">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-transparent text-[13.5px] text-gray-800 font-medium outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-gray-700">To Date</label>
            <div className="border border-gray-300 rounded-[4px] px-2.5 py-1.5 flex items-center justify-between bg-white focus-within:border-amber-600 transition-colors">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-transparent text-[13.5px] text-gray-800 font-medium outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
            }}
            className="w-fit min-w-[90px] px-6 py-1.5 rounded-[4px] text-[13.5px] font-bold text-black hover:brightness-105 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </form>

      {/* 3. TABLE SECTION: "Event" & "P&L" */}
      <div className="w-full mt-3 bg-white border-t border-b border-gray-300 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-2 bg-[#e9ecef] border-b border-gray-300 text-[13.5px] font-bold text-gray-700">
          <div className="py-2.5 px-3 text-center border-r border-gray-300">
            Event
          </div>
          <div className="py-2.5 px-3 text-center">
            P&L
          </div>
        </div>

        {/* Table Rows / Empty State */}
        {loading ? (
          <div className="w-full py-8 flex flex-col items-center justify-center gap-2 bg-white text-gray-500">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px]">Loading records...</span>
          </div>
        ) : profitLossList.length === 0 ? (
          <div className="w-full py-3.5 px-4 text-center text-[13.5px] font-medium text-gray-900 bg-white">
            No Data Found
          </div>
        ) : (
          profitLossList.map((item, index) => {
            const pnl = Number(item.pnl || item.profitLoss || item.amount || 0);
            return (
              <div
                key={item.id || index}
                className="grid grid-cols-2 border-b border-gray-200 bg-white text-[13px] hover:bg-amber-50/30 transition-colors"
              >
                <div className="py-2.5 px-3 text-left border-r border-gray-200 font-medium text-gray-800 break-words">
                  <div>{item.eventName || item.event || item.matchName || 'Bet'}</div>
                  {item.marketName && (
                    <div className="text-[11px] text-gray-500">{item.marketName}</div>
                  )}
                  {item.date && (
                    <div className="text-[11px] text-gray-400">{item.date}</div>
                  )}
                </div>
                <div
                  className={`py-2.5 px-3 text-center font-bold flex items-center justify-center ${
                    pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {pnl >= 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
