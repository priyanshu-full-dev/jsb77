
import { useState } from 'react';

export default function TransactionReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (e) => setStartDate(e?.target.value);
  const handleEndDateChange = (e) => setEndDate(e?.target.value);

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleGo = () => {
    // console.log('Generating report for:', { startDate, endDate });
    // Add your report generation logic here
  };

  return (
      <div className="p-3">
        <h2 className="text-sm font-bold mb-6 bg-offwhite2 text-gray2 p-2.5">Transactions Report</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="datetime-local"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start Date"
          />
          <input
            type="datetime-local"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="End Date"
          />
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGo}
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go
          </button>
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
