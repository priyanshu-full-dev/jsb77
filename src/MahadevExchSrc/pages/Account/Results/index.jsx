import { useState } from 'react';

const sportsOptions = ['Cricket', 'Soccer', 'Tennis', 'Horse', 'Greyhound', 'Kabaddi', 'Election'];

const matchData = [
  { date: '01/10/2024 13:24', event: 'International Twenty20 Matches-Canada v Oman [30/09/2024 16:00]' },
  { date: '01/10/2024 11:23', event: 'Irani Cup 2024 -Mumbai V Rest of India [01/10/2024 04:00]' },
  { date: '01/10/2024 18:02', event: 'International Twenty20 Matches-Canada v Nepal [01/10/2024 16:00]' },
  { date: '01/10/2024 13:11', event: 'Taj cric club T10 League-Durbanville Dynamos v Soloman Strikers [01/10/2024 11:30]' },
  { date: '01/10/2024 09:58', event: 'Taj cric club T10 League-Tygerberg Tigers v Victoria Vipers [01/10/2024 08:00]' },
  { date: '01/10/2024 18:04', event: 'Legends League Cricket-Manipal Tigers v Southern Super Stars [01/10/2024 13:30]' },
  { date: '01/10/2024 08:34', event: 'Test Matches-India v Bangladesh [27/09/2024 04:00]' },
  { date: '01/10/2024 15:35', event: 'International Twenty20 Matches-Namibia v USA [01/10/2024 12:00]' },
];

export default function Results() {
  const [selectedSport, setSelectedSport] = useState('Cricket');

  return (
    <div className="p-2">
      <div className="bg-gray-200 p-4 rounded-t-lg">
        <h2 className="text-base font-bold mb-4">Results</h2>
        <div className="flex justify-between items-center mb-4">
          <div>
            <button className="bg-gray2 text-white px-2 py-2 text-xs mr-2 rounded-l">Today</button>
            <button className="bg-gray2 text-white px-2 py-2 text-xs rounded-r">Yesterday</button>
          </div>
          <div className="relative">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e?.target.value)}
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
              {sportsOptions.map((sport) => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-gray2 text-white">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Event Name</th>
            </tr>
          </thead>
          <tbody>
            {matchData.map((match, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                <td className="border px-4 py-2">{match.date}</td>
                <td className="border px-4 py-2">
                  <a href="#" className="text-blue hover:underline">{match.event}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}