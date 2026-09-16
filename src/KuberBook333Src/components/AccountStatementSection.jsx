import React, { useState, useEffect } from 'react';
import { getAccountStatements } from '../../api';

export default function AccountStatementSection({ user, onToast }) {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStatements = async () => {
    // If demo mode or no active backend auth token, avoid triggering 401 auto-logout in axios interceptor
    const token = localStorage.getItem('token') || user?.token;
    if (!token || user?.isDemo || user?.username === 'DEMO') {
      setTransactions([]);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    try {
      const res = await getAccountStatements({
        startDate: fromDate,
        endDate: toDate,
        filterby: typeFilter === 'All' ? '' : typeFilter,
        page,
        limit: 20,
      });
      if (res?.data?.transactions) {
        setTransactions(res.data.transactions);
        const total = res.data.total || res.data.transactions.length;
        setTotalPages(Math.max(1, Math.ceil(total / 20)));
      } else {
        setTransactions([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching statements:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, [page]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchStatements();
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      if (onToast) {
        onToast({
          id: Date.now(),
          type: 'add',
          message: 'No statement data to export.',
        });
      } else {
        alert('No statement data to export.');
      }
      return;
    }

    const headers = ['SR. NO', 'DATE', 'DESCRIPTION', 'CREDIT', 'DEBIT', 'BALANCE', 'REMARK'];
    const rows = transactions.map((t, idx) => [
      idx + 1,
      t.date || t.createdAt || 'N/A',
      `"${(t.description || t.narration || '').replace(/"/g, '""')}"`,
      t.credit || 0,
      t.debit || 0,
      t.balance || 0,
      `"${(t.remark || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `account_statement_${fromDate}_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const desc = (t.description || t.narration || '').toLowerCase();
    const date = (t.date || t.createdAt || '').toLowerCase();
    return desc.includes(q) || date.includes(q);
  });

  return (
    <div className="w-full bg-[#f2f4f7] min-h-screen pb-24 text-neutral-900 select-none p-2 pt-2 flex flex-col gap-3">
      {/* 1. FILTER & SEARCH FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-[10px] p-3 shadow-xs border border-gray-200 flex flex-col gap-2.5"
      >
        {/* Row 1: Date Range */}
        <div className="grid grid-cols-2 gap-3">
          {/* From */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-gray-700">From</label>
            <div className="border border-gray-300 rounded-[6px] px-2.5 py-1.5 flex items-center justify-between bg-white focus-within:border-amber-600 transition-colors">
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
            <label className="text-[13px] font-semibold text-gray-700">To Date</label>
            <div className="border border-gray-300 rounded-[6px] px-2.5 py-1.5 flex items-center justify-between bg-white focus-within:border-amber-600 transition-colors">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-transparent text-[13.5px] text-gray-800 font-medium outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Types Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-semibold text-gray-700">Types</label>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-[6px] px-3 py-2 bg-white text-[14px] text-gray-800 font-medium outline-none appearance-none cursor-pointer pr-8 focus:border-amber-600 transition-colors"
            >
              <option value="All">All</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdraw">Withdraw</option>
              <option value="Cricket">Cricket</option>
              <option value="Soccer">Soccer</option>
              <option value="Tennis">Tennis</option>
              <option value="Casino">Casino</option>
              <option value="Aviator">Aviator</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-currentColor stroke-2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Row 3: Search Bet, SUBMIT, and Export Button */}
        <div className="flex items-end gap-2 pt-1">
          {/* Search Bet Input */}
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-gray-700">Search Bet</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-[40px] border border-gray-300 rounded-[6px] px-3 py-2 bg-white text-[14px] text-gray-800 font-medium outline-none placeholder-gray-400 focus:border-amber-600 transition-colors"
            />
          </div>

          {/* SUBMIT Button */}
          <button
            type="submit"
            style={{
              background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
            }}
            className="h-[40px] px-5 rounded-[6px] text-white font-extrabold text-[14px] tracking-wider uppercase flex items-center justify-center shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            SUBMIT
          </button>

          {/* Download / Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
            }}
            className="w-[46px] h-[40px] rounded-[6px] flex items-center justify-center text-white shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Download Statement"
          >
            <svg
              viewBox="0 0 512 512"
              className="w-[20px] h-[20px] fill-white"
            >
              <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z" />
            </svg>
          </button>
        </div>
      </form>

      {/* 2. ACCOUNT STATEMENT DATA TABLE */}
      <div className="w-full bg-white rounded-[6px] shadow-xs border border-gray-300 overflow-hidden flex flex-col">
        {/* Scrollable Table Container */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="bg-[#e9ecef] text-neutral-900 text-[13px] font-bold tracking-tight border-b border-gray-300">
                <th className="py-2.5 px-3 text-center border-r border-gray-300 whitespace-nowrap w-[70px]">
                  SR. NO
                </th>
                <th className="py-2.5 px-3 text-center border-r border-gray-300 whitespace-nowrap w-[110px]">
                  DATE
                </th>
                <th className="py-2.5 px-3 text-left border-r border-gray-300 min-w-[150px]">
                  DESCRIPTION
                </th>
                <th className="py-2.5 px-3 text-center border-r border-gray-300 whitespace-nowrap w-[90px]">
                  CREDIT
                </th>
                <th className="py-2.5 px-3 text-center border-r border-gray-300 whitespace-nowrap w-[90px]">
                  DEBIT
                </th>
                <th className="py-2.5 px-3 text-center border-r border-gray-300 whitespace-nowrap w-[95px]">
                  BALANCE
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap w-[100px]">
                  REMARK
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-left text-gray-600 font-medium text-[14.5px]">
                    Loading Statement...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-5 px-4 text-left text-black font-medium text-[15px]">
                    No Data To Display
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50/60 text-[12.5px] transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center border-r border-gray-200 text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-gray-200 text-gray-600 whitespace-nowrap">
                      {t.date || t.createdAt || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 font-medium text-gray-900">
                      {t.description || t.narration || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-gray-200 font-bold text-emerald-600 whitespace-nowrap">
                      {t.credit ? `+${t.credit}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-gray-200 font-bold text-red-600 whitespace-nowrap">
                      {t.debit ? `-${t.debit}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-gray-200 font-bold text-gray-900 whitespace-nowrap">
                      {t.balance ?? 0}
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-600 whitespace-nowrap">
                      {t.remark || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. PAGINATION CONTROLS INSIDE CARD */}
        <div className="flex justify-center my-3.5">
          <div className="inline-flex items-center border border-[#9c6e20] rounded-[6px] overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-1.5 text-[14px] font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white border-r border-[#9c6e20] cursor-pointer transition-colors"
            >
              &laquo; Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-1.5 text-[14px] font-bold text-black hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
            >
              Next &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
