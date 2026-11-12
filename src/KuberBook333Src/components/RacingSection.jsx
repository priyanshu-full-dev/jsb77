import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  subscribeToHorseMatchesData,
  subscribeToGreyhoundMatchesData,
} from '../../socketClient';

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

  // 1. Subscribe to live socket stream
  useEffect(() => {
    const unsub = isHorse
      ? subscribeToHorseMatchesData()
      : subscribeToGreyhoundMatchesData();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [isHorse]);

  // Redux Selectors for live socket racing data (100% Real Socket Stream)
  const reduxHorseRaceList = useSelector((state) => state?.horse?.horseRaceList);
  const reduxGreyhoundRaceList = useSelector((state) => state?.greyhound?.greyhoundRaceList);

  const rawList = isHorse ? reduxHorseRaceList : reduxGreyhoundRaceList;

  // 2. Extract dynamic countries directly from live socket data
  const countries = useMemo(() => {
    if (!Array.isArray(rawList) || rawList.length === 0) {
      return [];
    }
    const countrySet = new Set();
    rawList.forEach((group) => {
      const code = (group?.cname || group?.countryCode || '').toUpperCase().trim();
      if (code) countrySet.add(code);
    });
    return Array.from(countrySet).map((c) => ({ id: c, label: c }));
  }, [rawList]);

  const [activeCountry, setActiveCountry] = useState('');

  // Auto-select first available live country
  useEffect(() => {
    if (countries.length > 0) {
      if (!activeCountry || !countries.some((c) => c.id === activeCountry)) {
        setActiveCountry(countries[0].id);
      }
    } else {
      setActiveCountry('');
    }
  }, [countries, activeCountry]);

  // 3. Extract real live venues & race times for the active country
  const venues = useMemo(() => {
    if (!Array.isArray(rawList) || rawList.length === 0 || !activeCountry) {
      return [];
    }

    const countryGroups = rawList.filter(
      (r) => (r?.cname || r?.countryCode || '').toUpperCase().trim() === activeCountry.toUpperCase()
    );

    const parsedVenues = [];

    countryGroups.forEach((group) => {
      const trackChildren = group?.children || group?.childs || (group?.ename ? [group] : []);

      trackChildren.forEach((trackObj, tIdx) => {
        const venueName = trackObj?.ename || trackObj?.venue || trackObj?.name || 'Track';
        const raceList = trackObj?.children || trackObj?.childs || [];

        const validRaces = [];
        raceList.forEach((rc) => {
          if (rc?.gOdds?.status === 'CLOSED') return;
          const stime = rc?.stime || rc?.startTime || rc?.openDate || rc?.time;
          let timeDisplay = '';
          if (stime) {
            try {
              const d = new Date(stime);
              if (!isNaN(d.getTime())) {
                timeDisplay = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
              } else {
                timeDisplay = String(stime);
              }
            } catch {
              timeDisplay = String(stime);
            }
          }
          if (!timeDisplay && rc?.time) timeDisplay = String(rc.time);

          if (timeDisplay) {
            validRaces.push({
              gmid: String(rc?.gmid || rc?.marketId || rc?.eventId || `${activeCountry}_${tIdx}_${timeDisplay}`),
              time: timeDisplay,
              raw: rc,
            });
          }
        });

        if (validRaces.length > 0) {
          parsedVenues.push({
            id: String(trackObj?.gmid || `${activeCountry}_${venueName}_${tIdx}`),
            venue: venueName,
            hasTv: Boolean(trackObj?.tv || trackObj?.hasTv),
            races: validRaces,
          });
        }
      });
    });

    return parsedVenues;
  }, [rawList, activeCountry]);

  const handleRaceClick = (venueName, raceItem) => {
    const effectiveGmid = raceItem.gmid;
    const timeStr = raceItem.time;
    const sportType = isHorse ? 'horse' : 'greyhound';
    const eventType = isHorse ? '7' : '43';
    navigate(
      `/match/${effectiveGmid}?eventId=${effectiveGmid}&marketId=${effectiveGmid}&gmid=${effectiveGmid}&eventType=${eventType}&sport=${sportType}&eventName=${encodeURIComponent(venueName + ' - ' + timeStr)}`
    );
  };

  return (
    <div className="w-full bg-white select-none flex flex-col p-[16px] pt-[20px] min-h-[500px]">
      {/* 1. Country Filter Tabs from Live Socket */}
      {countries.length > 0 ? (
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
                className={`w-[52px] h-[40px] rounded-[4px] font-extrabold text-[16px] text-black flex items-center justify-center cursor-pointer transition-all active:scale-95 select-none shrink-0 ${
                  isActive ? 'shadow-xs' : 'hover:bg-[#e4e7ec]'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* 2. White Card Container with Live Racing Venues */}
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
                {venueItem.races.map((raceItem) => (
                  <button
                    key={raceItem.gmid || raceItem.time}
                    type="button"
                    onClick={() => handleRaceClick(venueItem.venue, raceItem)}
                    className="h-[32px] px-3.5 bg-[#5e6368] hover:bg-[#4f5358] cursor-pointer text-white rounded-[5px] text-[13.5px] font-bold flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                  >
                    {raceItem.time}
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
          <div className="py-12 text-center text-gray-500 font-bold text-[13px]">
            {countries.length === 0
              ? `Loading live ${isHorse ? 'horse' : 'greyhound'} racing schedule...`
              : `No scheduled races active for ${activeCountry} right now.`}
          </div>
        )}
      </div>
    </div>
  );
}
