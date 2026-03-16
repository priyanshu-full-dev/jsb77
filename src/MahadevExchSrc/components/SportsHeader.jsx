import { NavLink } from "react-router-dom";
import { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const sports = [
  { name: "cricket", label: "Cricket", ext: "svg" },
  { name: "soccer", label: "Soccer", ext: "svg" },
  { name: "tennis", label: "Tennis", ext: "svg" },
  { name: "horse", label: "Horse Racing", ext: "png" },
  { name: "greyhound", label: "Greyhound Racing", ext: "png" },
  { name: "kabaddi", label: "Kabaddi", ext: "svg" },
];

const dummyResults = [
  "India vs Australia",
  "Pakistan vs England",
  "Barcelona vs Real Madrid",
  "Chelsea vs Arsenal",
  "India vs South Africa",
  "IPL 2026 Final - CSK vs MI",
];

const SportsHeader = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");

  const filteredResults = dummyResults.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <header className="w-full bg-gradient-to-b from-[#1a1a1a] to-[#121212] border-b border-[#2a2a2a] shadow-sm">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">

        {/* SPORTS TABS */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center min-w-max px-1">
            {sports.map((sport) => (
              <NavLink
                key={sport.name}
                to={`/sports/${sport.name}/tomorrow?sportsbook`}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 px-5 py-3.5 transition-all duration-200 border-b-2 whitespace-nowrap
                  ${
                    isActive
                      ? "text-white border-[#00723b] bg-gradient-to-t from-[#00723b]/20 to-transparent"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border-transparent"
                  }`
                }
              >
                <img
                  src={`/SportsIcon/${sport.name}.${sport.ext}`}
                  alt={sport.label}
                  className={`w-5 h-5 object-contain transition-transform group-hover:scale-110
                    ${
                      sport.name === "horse" || sport.name === "greyhound"
                        ? "brightness-0 invert"
                        : ""
                    }`}
                />
                <span className="text-sm font-medium tracking-tight">
                  {sport.label}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setOpenSearch(true)}
            className="p-3.5 text-gray-400 hover:text-white transition-colors"
          >
            <FaSearch className="text-lg" />
          </button>
        </div>
      </div>

      {/* SEARCH DROPDOWN */}
      {openSearch && (
        <div
          className="fixed inset-x-0 top-[50px] w-full bg-[#1a1a1a]/95 backdrop-blur-lg 
          border border-[#333]/70 shadow-2xl shadow-black/70 z-50 overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">

            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />

              <input
                type="text"
                placeholder="Search matches, teams, tournaments..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#111] text-gray-100 placeholder-gray-500 
                pl-10 pr-10 py-2.5 rounded-lg text-[14px] outline-none border border-[#333]"
                autoFocus
              />

              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setOpenSearch(false)}
              className="ml-4 text-gray-400 hover:text-white text-lg"
            >
              <FaTimes />
            </button>
          </div>

          {/* RESULTS */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query ? (
              filteredResults.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">
                  No events found for "{query}"
                </div>
              ) : (
                filteredResults.map((item, i) => (
                  <div
                    key={i}
                    className="px-6 py-4 text-gray-200 text-[15px] border-b border-[#222]
                    hover:bg-[#222] hover:text-white cursor-pointer transition-all"
                    onClick={() => {
                      console.log("Selected:", item);
                      setOpenSearch(false);
                      setQuery("");
                    }}
                  >
                    {item}
                  </div>
                ))
              )
            ) : (
              <div className="px-6 py-6 text-xs text-gray-500 uppercase">
                Popular / Recent Searches
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default SportsHeader;