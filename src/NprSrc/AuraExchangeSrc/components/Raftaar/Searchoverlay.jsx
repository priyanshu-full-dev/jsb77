import React, { useState, useEffect, useRef } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setMarketName,
  setMarketOddsData,
  setRunningData,
} from "../../../../redux/slices/fullmarketSlice";

/**
 * ---- Same flattening logic as Home.jsx / SportsGame.jsx ----
 * Raw redux match objects have a nested `matchOdds` array (per-market, with
 * `inplay` flag + runner-level `ex.availableToBack/availableToLay`) and a
 * separate `matchRunners` array. This maps raw -> the flat shape everything
 * else in the app expects (match.runners, match.inPlay, match.tournamentName, etc.)
 */
const transformMatch = (rawMatch) => {
  if (!rawMatch) return null;

  const moOdds = (rawMatch.matchOdds || []).find(
    (m) => m.marketId === rawMatch.marketId,
  );

  if (!moOdds) return null;

  const runners = (rawMatch.matchRunners || []).map((r) => {
    const liveRunner = (moOdds.runners || []).find(
      (x) => x.selectionId === r.selectionId,
    );
    const back = liveRunner?.ex?.availableToBack?.[0];
    const lay = liveRunner?.ex?.availableToLay?.[0];

    return {
      selectionId: r.selectionId,
      runnerName: r.runnerName,
      backPrice: back?.price || 0,
      backSize: back?.size || 0,
      layPrice: lay?.price || 0,
      laySize: lay?.size || 0,
    };
  });

  return {
    _id: rawMatch.eventId,
    exEventId: rawMatch.eventId,
    sportId: rawMatch.sportId,
    sportID: rawMatch.sportId,
    sportName: rawMatch.sportName,
    tournamentName: rawMatch.competitionName,
    competitionId: rawMatch.competitionId,
    eventName: rawMatch.eventName,
    eventTime: rawMatch.openDate,
    openDate: rawMatch.openDate,
    marketId: rawMatch.marketId,
    marketName: rawMatch.marketName,
    joinedMarketIds: rawMatch.joinedMarketIds || rawMatch.marketId,
    isBookmakers: rawMatch.bm,
    isFancy: rawMatch.fancy,
    isSportsbook: rawMatch.pc,
    tv: rawMatch.tv,
    inPlay: moOdds.inplay === true,
    runners,
    runnersData: rawMatch.matchRunners,
    oddsData: moOdds,
  };
};

const transformMatches = (rawMatches) => {
  if (!Array.isArray(rawMatches)) return [];
  return rawMatches.map(transformMatch).filter(Boolean);
};

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cricketMatchesRaw = useSelector(
    (state) => state?.matches?.cricket?.matches?.data,
  );
  const tennisMatchesRaw = useSelector(
    (state) => state?.matches?.tennis?.matches?.data,
  );
  const soccerMatchesRaw = useSelector(
    (state) => state?.matches?.soccer?.matches?.data,
  );

  // ---- flatten raw redux matches before searching/displaying ----
  const allSports = [
    ...transformMatches(cricketMatchesRaw),
    ...transformMatches(tennisMatchesRaw),
    ...transformMatches(soccerMatchesRaw),
  ];

  const filteredResults = allSports.filter(
    (result) =>
      result?.eventName?.toLowerCase().includes(query.toLowerCase()) ||
      result?.marketName?.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const formatDate = (openDate) => {
    const date = new Date(openDate);
    if (isNaN(date)) return "";
    const dd = date.getDate().toString().padStart(2, "0");
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = date.getFullYear();
    const hours12 = date.getHours() % 12 || 12;
    const mins = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `${dd}/${mm}/${yyyy} ${hours12}:${mins} ${ampm}`;
  };

  const handleNavigateToEvent = (match) => {
    if (!match) return;

    dispatch(setRunningData(match.runnersData));
    dispatch(setMarketName(match.marketName));
    dispatch(
      setMarketOddsData({
        data: { data: match.oddsData },
        sport: match.sportName,
      }),
    );

    onClose?.();

    const params = new URLSearchParams({
      eventType: match.sportId || match.sportID || "",
      eventId: match.exEventId || "",
      marketId: match.marketId || "",
      joinedMarketIds: match.joinedMarketIds || match.marketId || "",
      competitionId: match.competitionId || "",
      bm: String(!!match.isBookmakers),
      fancy: String(!!match.isFancy),
      pc: String(!!match.isSportsbook),
      eventName: match.eventName || "",
    });

    navigate(`/full-market-2?${params.toString()}`);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-[#151828] rounded-t-[20px] shadow-[0_-8px_30px_rgba(0,0,0,.6)] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "82vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>

        <div className="sticky top-0 z-10 bg-[#151828] px-4 pb-3 pt-2 border-b border-white/5">
          <div className="flex items-center h-11 rounded-xl bg-[#1d2235] border border-white/5 px-3">
            <IoSearch size={18} className="text-[#39f16b] mr-2 flex-shrink-0" />

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search matches..."
              className="flex-1 bg-transparent text-white placeholder:text-[#70788f] text-[14px] outline-none border-none shadow-none focus:ring-0"
            />

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"
            >
              <IoClose size={16} className="text-[#98A2B8]" />
            </button>
          </div>
        </div>

        {/* Results list — now driven by flattened live Redux match data */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(82vh - 70px)" }}
        >
          {filteredResults.length > 0 ? (
            filteredResults.map((result, i) => (
              <button
                key={result._id || i}
                onClick={() => handleNavigateToEvent(result)}
                className="w-full text-left px-4 py-3.5 border-b border-white/5 active:bg-white/5 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[#e9ecf1] font-bold text-[13.5px] font-sans">
                    {result.sportName} | {result.marketName}
                  </span>
                  <span className="text-[#98A2B8] text-[12px] font-sans whitespace-nowrap flex-shrink-0">
                    {formatDate(result.openDate)}
                  </span>
                </div>
                <p className="text-[#c7cfdb] text-[13px] font-sans mt-0.5">
                  {result.eventName}
                </p>
              </button>
            ))
          ) : (
            <div className="text-[#5c6780] text-[13px] font-sans text-center py-10">
              {query
                ? `No results found for "${query}"`
                : "No matches available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}