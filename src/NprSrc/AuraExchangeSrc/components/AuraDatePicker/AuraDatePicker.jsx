import { useState, useEffect, useRef } from "react";

const pad = (n) => String(n).padStart(2, "0");

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const parseDateValue = (val) => {
  if (!val) return null;
  // Handle YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split("-").map(Number);
    return { year: y, month: m - 1, day: d };
  }
  // Handle DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split("-").map(Number);
    return { year: y, month: m - 1, day: d };
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }
  return null;
};

const AuraDatePicker = ({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parsed = parseDateValue(value);
  const now = new Date();
  const currentYear = parsed ? parsed.year : now.getFullYear();
  const currentMonth = parsed ? parsed.month : now.getMonth();

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);

  // Sync view when value changes or when opened
  useEffect(() => {
    const p = parseDateValue(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value, isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (year, month, day) => {
    const formatted = `${year}-${pad(month + 1)}-${pad(day)}`;
    if (onChange) {
      onChange({ target: { value: formatted } });
    }
    setIsOpen(false);
  };

  // Generate 42 calendar grid cells (Monday start)
  const generateGrid = () => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // JS getDay(): Sun=0, Mon=1, ..., Sat=6 -> Monday start index: (day + 6) % 7
    const firstDayIndex = (firstDay.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({
        day,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      cells.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }

    // Next month leading days (to fill 42 cells = 6 rows)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({
        day: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return cells;
  };

  const gridCells = generateGrid();

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input row */}
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className="relative flex items-center w-full h-[32px] bg-[#e5e7ea] border border-[#b8c2c6] rounded-[3px] overflow-hidden cursor-pointer select-none"
      >
        <input
          type="text"
          readOnly
          value={value || ""}
          placeholder={placeholder}
          className="w-full h-full px-2.5 bg-[#e5e7ea] text-[13px] text-[#333] font-normal focus:bg-[#e5e7ea] focus:outline-none cursor-pointer"
        />
        <div className="w-[34px] h-full bg-[#c8d0d5] hover:bg-[#bcc5cb] flex items-center justify-center border-l border-[#b8c2c6] shrink-0 transition-colors">
          <svg
            className="w-4 h-4 text-black"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="2"
              x2="16"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="2"
              x2="8"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="3"
              y1="9"
              x2="21"
              y2="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <rect x="6" y="11.5" width="2.5" height="2" fill="currentColor" />
            <rect x="10.75" y="11.5" width="2.5" height="2" fill="currentColor" />
            <rect x="15.5" y="11.5" width="2.5" height="2" fill="currentColor" />
            <rect x="6" y="15.5" width="2.5" height="2" fill="currentColor" />
            <rect x="10.75" y="15.5" width="2.5" height="2" fill="currentColor" />
            <rect x="15.5" y="15.5" width="2.5" height="2" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-[38px] left-0 z-[100] bg-white border border-[#8cd4ee] rounded-[5px] shadow-[0_4px_16px_rgba(0,0,0,0.18)] p-2.5 w-[240px] select-none animate-fadeIn">
          {/* Top Triangle Caret / Beak */}
          <div className="absolute -top-[5px] left-5 w-2.5 h-2.5 bg-white border-t border-l border-[#8cd4ee] transform rotate-45" />

          {/* Header (Nav & Title) */}
          <div className="flex items-center justify-between px-1 mb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-[#222] hover:text-black focus:outline-none cursor-pointer transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span className="text-[13.5px] font-bold text-[#222]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-[#222] hover:text-black focus:outline-none cursor-pointer transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Weekdays Row */}
          <div className="grid grid-cols-7 text-center mb-1 text-[11.5px] font-bold text-[#444]">
            {WEEKDAYS.map((day, idx) => (
              <div key={day} className={idx === 6 ? "text-[#d9534f]" : ""}>
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 text-center gap-y-0.5 text-[12px]">
            {gridCells.map((cell, idx) => {
              const isSunday = idx % 7 === 6;
              const isSelected =
                parsed &&
                parsed.year === cell.year &&
                parsed.month === cell.month &&
                parsed.day === cell.day;

              let textColor = "text-[#333]";
              if (!cell.isCurrentMonth) {
                textColor = isSunday ? "text-[#f3a6a6]" : "text-[#c2c2c2]";
              } else if (isSunday) {
                textColor = "text-[#d9534f] font-medium";
              }

              return (
                <div
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  onClick={() =>
                    handleSelectDate(cell.year, cell.month, cell.day)
                  }
                  className={`h-6 flex items-center justify-center cursor-pointer rounded-[2px] transition-colors hover:bg-[#ebf4fa] ${textColor} ${
                    isSelected ? "font-bold text-[#1b65a5] underline" : ""
                  }`}
                >
                  {cell.day}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraDatePicker;
