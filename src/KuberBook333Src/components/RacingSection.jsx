import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TV Monitor Icon
const TvMonitorIcon = () => (
  <svg
    viewBox="0 0 640 512"
    className="w-[14px] h-[14px] mr-1.5 text-[#2c3e50] shrink-0"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M592 0H48A48 48 0 0 0 0 48v320a48 48 0 0 0 48 48h240v32H112a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H352v-32h240a48 48 0 0 0 48-48V48a48 48 0 0 0-48-48zm-16 352H64V64h512z" />
  </svg>
);

export default function RacingSection({ sport = 'horse' }) {
  const navigate = useNavigate();
  const isHorse = sport === 'horse';

  // Country tabs matching reference: US, ZA, GB, FR, IE
  const countries = isHorse
    ? [
      { id: 'US', label: 'US' },
      { id: 'ZA', label: 'ZA' },
      { id: 'GB', label: 'GB' },
      { id: 'FR', label: 'FR' },
      { id: 'IE', label: 'IE' },
    ]
    : [
      { id: 'GB', label: 'GB' },
      { id: 'AU', label: 'AU' },
      { id: 'IE', label: 'IE' },
      { id: 'FR', label: 'FR' },
      { id: 'US', label: 'US' },
    ];

  const [activeCountry, setActiveCountry] = useState(isHorse ? 'US' : 'GB');

  React.useEffect(() => {
    setActiveCountry(isHorse ? 'US' : 'GB');
  }, [sport, isHorse]);

  // Horse racing data by country
  const horseRacingData = {
    US: [
      {
        id: 'charles_town',
        venue: 'Charles Town',
        hasTv: false,
        races: ['06:32'],
      },
    ],
    ZA: [
      {
        id: 'turffontein',
        venue: 'Turffontein',
        hasTv: true,
        races: ['15:10', '15:45', '16:20', '16:55', '17:30'],
      },
    ],
    FR: [
      {
        id: 'lyon_parilly',
        venue: 'Lyon-Parilly',
        hasTv: true,
        races: ['16:57', '17:42', '18:17', '18:52', '19:27'],
      },
      {
        id: 'auteuil',
        venue: 'Auteuil',
        hasTv: false,
        races: ['18:00', '18:35', '19:10', '19:45', '20:20', '20:55', '21:30', '22:08'],
      },
    ],
    AU: [
      {
        id: 'flemington',
        venue: 'Flemington',
        hasTv: true,
        races: ['11:15', '11:50', '12:25', '13:00', '13:35', '14:10', '14:45', '15:20'],
      },
      {
        id: 'randwick',
        venue: 'Randwick',
        hasTv: true,
        races: ['12:05', '12:40', '13:15', '13:50', '14:25', '15:00', '15:35'],
      },
      {
        id: 'doomben',
        venue: 'Doomben',
        hasTv: false,
        races: ['13:18', '13:54', '14:30', '15:06', '15:42', '16:18'],
      },
    ],
    GB: [
      {
        id: 'ascot',
        venue: 'Ascot',
        hasTv: true,
        races: ['13:30', '14:05', '14:40', '15:15', '15:50', '16:25', '17:00'],
      },
      {
        id: 'sandown',
        venue: 'Sandown',
        hasTv: false,
        races: ['14:15', '14:50', '15:25', '16:00', '16:35', '17:10', '17:45'],
      },
      {
        id: 'newmarket',
        venue: 'Newmarket',
        hasTv: false,
        races: ['13:10', '13:45', '14:20', '14:55', '15:30', '16:05'],
      },
      {
        id: 'kempton',
        venue: 'Kempton',
        hasTv: false,
        races: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'],
      },
    ],
    IE: [
      {
        id: 'curragh',
        venue: 'Curragh',
        hasTv: true,
        races: ['13:45', '14:20', '14:55', '15:30', '16:05', '16:40', '17:15'],
      },
      {
        id: 'leopardstown',
        venue: 'Leopardstown',
        hasTv: false,
        races: ['14:00', '14:35', '15:10', '15:45', '16:20', '16:55'],
      },
      {
        id: 'fairyhouse',
        venue: 'Fairyhouse',
        hasTv: false,
        races: ['15:05', '15:40', '16:15', '16:50', '17:25', '18:00'],
      },
    ],
  };

  // Greyhound racing data by country
  const greyhoundRacingData = {
    GB: [
      {
        id: 'romford',
        venue: 'Romford',
        hasTv: true,
        races: ['18:09', '18:28', '18:43', '19:01', '19:16', '19:34', '19:51', '20:08', '20:26'],
      },
      {
        id: 'crayford',
        venue: 'Crayford',
        hasTv: false,
        races: ['18:17', '18:33', '18:48', '19:07', '19:24', '19:44', '20:03', '20:21'],
      },
      {
        id: 'sheffield',
        venue: 'Sheffield',
        hasTv: false,
        races: ['14:04', '14:19', '14:36', '14:54', '15:09', '15:27', '15:44', '16:02'],
      },
      {
        id: 'hove',
        venue: 'Hove',
        hasTv: false,
        races: ['18:08', '18:24', '18:41', '18:59', '19:17', '19:36', '19:54', '20:12'],
      },
    ],
    AU: [
      {
        id: 'wentworth_park',
        venue: 'Wentworth Park',
        hasTv: true,
        races: ['18:12', '18:34', '18:55', '19:15', '19:38', '20:01', '20:22'],
      },
      {
        id: 'albion_park',
        venue: 'Albion Park',
        hasTv: false,
        races: ['18:20', '18:42', '19:03', '19:25', '19:47', '20:10'],
      },
    ],
    IE: [
      {
        id: 'shelbourne_park',
        venue: 'Shelbourne Park',
        hasTv: true,
        races: ['19:30', '19:48', '20:06', '20:24', '20:42', '21:00'],
      },
      {
        id: 'curraheen_park',
        venue: 'Curraheen Park',
        hasTv: false,
        races: ['19:40', '19:58', '20:16', '20:34', '20:52', '21:10'],
      },
    ],
    FR: [
      {
        id: 'lyon_parilly_dogs',
        venue: 'Lyon-Parilly',
        hasTv: true,
        races: ['15:21', '15:53', '16:25', '16:57', '17:42', '18:17', '18:52'],
      },
    ],
    US: [
      {
        id: 'derby_lane',
        venue: 'Derby Lane',
        hasTv: false,
        races: ['19:30', '19:45', '20:00'],
      },
    ],
  };

  const currentDataset = isHorse ? horseRacingData : greyhoundRacingData;
  const venues = currentDataset[activeCountry] || [];

  const handleRaceClick = (venueName, raceTime) => {
    const raceId = `race_${venueName.toLowerCase().replace(/\s+/g, '_')}_${raceTime.replace(':', '')}`;
    navigate(`/match/${raceId}`);
  };

  return (
    <div className="w-full bg-white select-none flex flex-col p-[16px] pt-[20px]  min-h-[500px]">
      {/* 1. Country Filter Tabs (US, FR, AU, IE, GB) */}
      <div className="flex items-center gap-1 mb-1 overflow-x-auto no-scrollbar">
        {countries.map((c) => {
          const isActive = activeCountry === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCountry(c.id)}
              style={
                isActive
                  ? {
                    background: 'linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
                  }
                  : {
                    background: '#f1f1f1',
                  }
              }
              className={`w-[52px] h-[40px] rounded-[4px] font-extrabold text-[16px] text-black flex items-center justify-center cursor-pointer transition-all active:scale-95 select-none shrink-0 ${isActive ? 'shadow-xs' : 'hover:bg-[#e4e7ec]'
                }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* 2. White Card Container with Racing Venues */}
      <div className="bg-white rounded-[6px] p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] border border-[#e8ecf0] flex flex-col">
        {venues.length > 0 ? (
          venues.map((venueItem, idx) => (
            <div key={venueItem.id} className="flex flex-col">
              {/* Venue Header */}
              <div className="flex items-center gap-2 mb-2.5">
                {venueItem.hasTv && <TvMonitorIcon />}
                <span className="font-bold text-[16px] text-[#283544] tracking-tight leading-none">
                  {venueItem.venue}
                </span>
              </div>

              {/* Race Timings */}
              <div className="flex flex-wrap gap-2 mb-1">
                {venueItem.races.map((timeStr) => (
                  <button
                    key={timeStr}
                    type="button"
                    onClick={() => handleRaceClick(venueItem.venue, timeStr)}
                    className="h-[32px] px-3.5 bg-[#5e6368] hover:bg-[#4f5358] cursor-pointer text-white rounded-[5px] text-[13.5px] font-bold flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                  >
                    {timeStr}
                  </button>
                ))}
              </div>

              {/* Divider between venues (except last) */}
              {idx < venues.length - 1 && (
                <div className="w-full border-b border-gray-200 my-3" />
              )}
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-gray-500 font-bold text-[13px]">
            No races scheduled for {activeCountry} today.
          </div>
        )}
      </div>
    </div>
  );
}
