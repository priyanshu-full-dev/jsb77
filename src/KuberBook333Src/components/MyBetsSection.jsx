import React, { useState, useEffect } from 'react';
import { getSettledBets } from '../../api';

export default function MyBetsSection({ user, onToast }) {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sportType, setSportType] = useState('All Sports');
  const [loading, setLoading] = useState(false);
  const [bets, setBets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBets = async () => {
    const token = localStorage.getItem('token') || user?.token;
    if (!token || user?.isDemo || user?.username === 'DEMO') {
      setBets([]);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    try {
      const res = await getSettledBets({
        startDate: fromDate,
        endDate: toDate,
        sportType: sportType === 'All Sports' ? '' : sportType.toLowerCase(),
        page,
        limit: 20,
      });

      if (res?.data?.bets || res?.data?.data || res?.data?.records) {
        const list = res.data.bets || res.data.data || res.data.records || [];
        setBets(Array.isArray(list) ? list : []);
        const total = res.data.total || list.length;
        setTotalPages(Math.max(1, Math.ceil(total / 20)));
      } else {
        setBets([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching settled bets:', err);
      setBets([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, [page]);

  const handleApply = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchBets();
  };

  return (
    <div className="w-full bg-[#f2f4f7] min-h-screen pb-24 text-neutral-900 select-none flex flex-col pt-0">
      {/* 1. GOLD TOP BANNER: "My Bets" */}
      <div
        style={{
          background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
        }}
        className="w-full px-3 py-2.5 flex items-center justify-between shadow-xs mb-1"
      >
        <h2 className="text-white font-bold text-[16px] tracking-wide drop-shadow-xs">
          My Bets
        </h2>
      </div>

      {/* 2. CARD CONTAINER: FILTERS + PAGINATION */}
      <div className="mx-2 bg-white rounded-[4px] border border-gray-300 p-3 shadow-2xs flex flex-col">
        {/* Filter Form */}
        <form onSubmit={handleApply} className="w-full flex flex-col gap-2.5">
          {/* Row 1: From & To */}
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

            {/* To */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-gray-700">To</label>
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

          {/* Row 2: Types & Apply Button */}
          <div className="grid grid-cols-2 gap-3 items-end">
            {/* Types Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-gray-700">Types</label>
              <div className="relative">
                <select
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  className="w-full border border-gray-300 rounded-[4px] px-2.5 py-2 bg-white text-[13.5px] text-gray-800 font-medium outline-none appearance-none cursor-pointer pr-7 focus:border-amber-600 transition-colors"
                >
                  <option value="All Sports">All Sports</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Soccer">Soccer</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Horse Racing">Horse Racing</option>
                  <option value="Greyhound Racing">Greyhound Racing</option>
                  <option value="Casino">Casino</option>
                  <option value="Aviator">Aviator</option>
                  <option value="MAC88">MAC88</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
                }}
                className="w-full py-2 px-6 rounded-[4px] text-[14px] font-bold text-white hover:brightness-105 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center disabled:opacity-60 drop-shadow-xs"
              >
                {loading ? 'Loading...' : 'Apply'}
              </button>
            </div>
          </div>
        </form>

        {/* Bets List if data exists */}
        {bets.length > 0 && (
          <div className="w-full flex flex-col gap-2.5 mt-3 pt-3 border-t border-gray-200">
            {bets.map((bet, idx) => {
              const isWin = Number(bet.pnl || bet.profitLoss || 0) > 0;
              const isLoss = Number(bet.pnl || bet.profitLoss || 0) < 0;
              return (
                <div
                  key={bet.id || idx}
                  className="w-full border border-gray-200 rounded-[6px] p-3 flex flex-col gap-1.5 bg-gray-50 text-[13px]"
                >
                  <div className="flex justify-between items-center font-bold text-gray-900">
                    <span>{bet.matchName || bet.event || 'Match'}</span>
                    <span
                      className={`text-[12px] px-2 py-0.5 rounded font-semibold ${
                        isWin
                          ? 'bg-green-100 text-green-700'
                          : isLoss
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {bet.status || (isWin ? 'WON' : isLoss ? 'LOST' : 'SETTLED')}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[12px]">
                    <span>
                      Selection: <strong className="text-gray-800">{bet.runnerName || bet.selection}</strong>
                    </span>
                    <span>
                      Odds: <strong className="text-gray-800">{bet.odds}</strong>
                    </span>
                    <span>
                      Stake: <strong className="text-gray-800">₹{bet.stake}</strong>
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px] pt-1 border-t border-gray-200">
                    <span className="text-gray-400">{bet.date || bet.createdAt}</span>
                    <span
                      className={`font-bold ${
                        isWin ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-700'
                      }`}
                    >
                      P/L: {isWin ? `+₹${bet.pnl}` : `₹${bet.pnl || 0}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Horizontal Divider Line */}
        <div className="w-full border-t border-gray-200 mt-4 mb-3" />

        {/* Centered Pagination Control with Gold Border */}
        <div className="w-full flex items-center justify-center pb-1">
          <div className="inline-flex items-center border border-[#cca24b] rounded-[4px] overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-r border-[#cca24b] transition-colors"
            >
              &laquo; Previous
            </button>
            <span className="px-4 py-1.5 text-[13.5px] font-bold bg-[#1976d2] text-white">
              {page}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-1.5 text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-l border-[#cca24b] transition-colors"
            >
              Next &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
