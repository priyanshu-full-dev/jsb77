import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RiPushpin2Line } from "react-icons/ri";
import dayjs from "dayjs";

/* Icons */

import { FaFutbol } from "react-icons/fa";
import { IoTennisball } from "react-icons/io5";
import { PiCricketFill } from "react-icons/pi";
import { MdSports } from "react-icons/md";

import { FiTv, FiMonitor } from "react-icons/fi";
import { FaCrown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import {
  setMarketName,
  setMarketOddsData,
  setRunningData,
} from "../../../../redux/slices/fullmarketSlice";

const BMIcon = () => (
  <div className="w-5 h-5 rounded-full bg-[#d39c00] text-white text-[10px] font-bold flex items-center justify-center">
    BM
  </div>
);

/* ---- shared diagonal hatch texture used inside the green wedges,
   matches the faint diagonal linework visible in the reference art ---- */
const HatchTexture = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.12]"
    style={{
      backgroundImage:
        "repeating-linear-gradient(58deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 10px)",
    }}
  />
);

/* ---- Diagonal-cut "wedge" — the slanted parallelogram silhouette used by
   the active top-nav pill and the left block of the section header ---- */
const Wedge = ({ children, className = "", style = {}, clip = "88% 100%" }) => (
  <div
    className={`relative overflow-hidden ${className}`}
    style={{
      clipPath: `polygon(0 0, 100% 0, ${clip}, 0% 100%)`,
      ...style,
    }}
  >
    <HatchTexture />
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

/* ---- Glow bar — the bright blurred green line sitting under a wedge ---- */
const GlowUnderline = ({ widthClass = "w-full" }) => (
  <div className={`relative h-[3px] ${widthClass}`}>
    <div className="absolute inset-0 bg-[#4dff85] rounded-full blur-[3px] opacity-90" />
    <div
      className="absolute inset-0 bg-[#8fffb0] rounded-full"
      style={{ height: "1.5px", top: "0.5px" }}
    />
  </div>
);

/* Top Nav */
const NAV_ITEMS = [
  { key: "sports", label: "Sports", Icon: MdSports },
  { key: "cricket", label: "Cricket", Icon: PiCricketFill },
  { key: "football", label: "Football", Icon: FaFutbol },
  { key: "tennis", label: "Tennis", Icon: IoTennisball },
];

const TopNav = ({ activeTab, onChange }) => (
  <div
    className="relative  border overflow-hidden "
    style={{
      background: "linear-gradient(180deg, #060a08 0%, #081109 100%)",
      borderColor: "#122318",
    }}
  >
    <div className="flex items-stretch overflow-x-auto scrollbar-hide">
      {NAV_ITEMS.map(({ key, label, Icon }, idx) => {
        const isActive = activeTab === key;

        if (isActive) {
          return (
            <div key={key} className="flex-shrink-0 flex flex-col">
              <Wedge
                style={{
                  background:
                    "linear-gradient(150deg, #35c85f 0%, #159640 45%, #0a5c28 100%)",
                }}
              >
                <button
                  onClick={() => onChange(key)}
                  className="flex items-center gap-2.5 h-[42px] pl-5 pr-10 whitespace-nowrap"
                >
                  <Icon
                    size={18}
                    className="flex-shrink-0 text-white drop-shadow-sm"
                  />
                  <span className="w-px h-4 bg-white/35" />
                  <span className="leading-none text-white font-black italic text-[14px] tracking-wide uppercase font-sans">
                    {label}
                  </span>
                </button>
              </Wedge>
              <GlowUnderline widthClass="w-[78%]" />
            </div>
          );
        }

        return (
          <div key={key} className="flex items-center flex-shrink-0">
            {idx !== 0 && (
              <span className="text-[#3a5546] font-light text-[18px] -skew-x-12 mx-1.5 select-none">
                /
              </span>
            )}
            <button
              onClick={() => onChange(key)}
              className="flex items-center gap-[7px] h-[42px] px-2.5 whitespace-nowrap text-[13px] font-black italic uppercase text-[#dbe5df] hover:text-white transition-colors font-sans"
            >
              <Icon size={17} className="flex-shrink-0 text-white font-sans" />
              <span className="leading-none">{label}</span>
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

/* Section Header — angled green wedge on the left (icon + title) with glow
   underline, and a row of outlined pill toggle buttons on the right. */
const SectionHeader = ({
  Icon,
  title,
  liveOnly,
  onToggleLive,
  virtualOn,
  onToggleVirtual,
  premiumOn,
  onTogglePremium,
}) => (
  <div
    className="relative flex items-center justify-between w-full  overflow-hidden border"
    style={{
      background: "#050c08",
      borderColor: "#132a1c",
    }}
  >
    <div className="flex flex-col flex-shrink-0" style={{ maxWidth: "58%" }}>
      <Wedge
        clip="82% 100%"
        style={{
          background:
            "linear-gradient(150deg, #1fbf52 0%, #0f8a3c 45%, #063d1e 100%)",
        }}
      >
        <div className="flex items-center gap-3 h-[40px] pl-4 pr-12">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-black/10 shadow-[inset_0_0_6px_rgba(0,0,0,0.4)]">
            {Icon}
          </div>
          <span className="text-[14px] font-sans font-black italic uppercase text-white tracking-wide truncate drop-shadow-md">
            {title}
          </span>
        </div>
      </Wedge>
      <GlowUnderline widthClass="w-[85%]" />
    </div>

    <div className="flex items-center gap-2 pr-3 flex-shrink-0">
      <button
        onClick={onToggleLive}
        className={`flex items-center gap-2 text-[11px] font-black italic uppercase rounded-full px-3.5 py-[7px] whitespace-nowrap border transition-colors font-sans ${
          liveOnly
            ? "bg-[#1fbf52] text-white border-[#1fbf52]"
            : "bg-[#081a10] text-[#d6ecdc] border-[#2c5c3e]"
        }`}
      >
        Live
        <span
          className={`w-[7px] h-[7px] rounded-full ${
            liveOnly ? "bg-white" : "bg-[#3ee06a]"
          }`}
        />
      </button>

      {/* <button
        onClick={onToggleVirtual}
        className={`flex items-center gap-2 text-[11px] font-black italic uppercase rounded-full px-3.5 py-[7px] whitespace-nowrap border transition-colors font-sans ${
          virtualOn
            ? "bg-[#1fbf52] text-white border-[#1fbf52]"
            : "bg-[#081a10] text-[#d6ecdc] border-[#2c5c3e]"
        }`}
      >
        Virtual
        <FiMonitor
          size={13}
          className={virtualOn ? "text-white" : "text-[#3ee06a]"}
        />
      </button> */}

      <button
        onClick={onTogglePremium}
        className={`flex items-center gap-2 text-[11px] font-black italic uppercase rounded-full px-3.5 py-[7px] whitespace-nowrap border transition-colors font-sans ${
          premiumOn
            ? "bg-[#1fbf52] text-white border-[#1fbf52]"
            : "bg-[#081a10] text-[#d6ecdc] border-[#2c5c3e]"
        }`}
      >
        Premium
        <FaCrown
          size={13}
          className={premiumOn ? "text-white" : "text-[#3ee06a]"}
        />
      </button>
    </div>
  </div>
);

/* Date Formatter */
const formatDateCard = (date) => ({
  day: dayjs(date).format("DD MMM"),
  time: dayjs(date).format("hh:mm A"),
});


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


const formatCellPrice = (price) => (price && price > 0 ? price : "-");

const buildCells = (match) => {
  const runners = match?.runners || [];
  const cells = [];

  runners.forEach((runner) => {
    cells.push(formatCellPrice(runner?.backPrice));
    cells.push(formatCellPrice(runner?.layPrice));
  });

  while (cells.length < 6) cells.push("-");

  return cells.slice(0, 6);
};

const MatchRow = ({ match, index }) => {
  const runners = match.runners || [];
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setRunningData(match.runnersData));
    dispatch(setMarketName(match.marketName));
    dispatch(
      setMarketOddsData({
        data: { data: match.oddsData },
        sport: match.sportName,
      }),
    );

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

  const cells = buildCells(match);
  const isLive = match.inPlay;
  const date = formatDateCard(match.eventTime);

  return (
    <div
      className={
        index % 2 === 0 ? "bg-white" : "bg-gray-50 border-b border-gray-100"
      }
    >
      <div
        onClick={handleClick}
        className="flex items-center px-2 py-0.5 gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="font-bold uppercase font-sans text-[12px] text-slate-900 truncate">
            {match.eventName}
          </div>

          <div className="text-[10px] uppercase font-sans text-gray-500 truncate">
            ({match.tournamentName})
          </div>
        </div>
        {isLive && (
          <div className="relative text-green-600 font-sans text-xs font-bold ">
            LIVE
            <div className="relative  h-[2px]">
              <div className="absolute left-0 top-0 w-4 h-[2px] bg-green-500 animate-live"></div>
            </div>
          </div>
        )}
        <div className="inline-flex flex-col items-center rounded-[2px] justify-center bg-[#dbdada73]  px-1 py-1 ">
          <span className="text-[#d66a6a] text-[10px] font-sans leading-none uppercase">
            {date.day}
          </span>

          <span className="mt-0.5 text-[#d66a6a] text-[10px] font-sans  leading-none uppercase">
            {date.time}
          </span>
        </div>

        <div className="flex w-[90px] items-center justify-between gap-3">
          <div className="pl-2 flex gap-1 items-center">
            {match.tv && <FiTv className="w-3 h-3" />}
            {match.isFancy && (
              <img className="h-[14px] w-[10px]" src="/raftaar/rf.png" alt="" />
            )}

            {match.isBookmakers && <BMIcon />}
          </div>

          <RiPushpin2Line size={18} className="text-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-6 text-center text-sm font-bold">
        {cells.map((price, i) => (
          <div
            key={i}
            className={`py-[6px] text-[12.5px] font-sans border-r border-gray-100  ${
              i % 2 === 0 ? "bg-[#73d2f4]" : "bg-[#ffb4c8]"
            } text-slate-900`}
          >
            {price}
          </div>
        ))}
      </div>
    </div>
  );
};

/* Sport Section — filters to inPlay matches only when liveOnly is true */
const SportSection = ({
  Icon,
  title,
  matches = [],
  liveOnly,
  onToggleLive,
  virtualOn,
  onToggleVirtual,
  premiumOn,
  onTogglePremium,
}) => {
  const displayed = liveOnly
    ? matches.filter((m) => m?.inPlay === true)
    : matches;

  if (!matches?.length) return null;

  return (
    <div className=" mt-1.5">
      <SectionHeader
        Icon={Icon}
        title={title}
        liveOnly={liveOnly}
        onToggleLive={onToggleLive}
        virtualOn={virtualOn}
        onToggleVirtual={onToggleVirtual}
        premiumOn={premiumOn}
        onTogglePremium={onTogglePremium}
      />
      {displayed.length > 0 ? (
        displayed.map((match, i) => (
          <MatchRow key={match._id || i} match={match} index={i} />
        ))
      ) : (
        <div className="text-center text-[12px] text-gray-400 font-sans py-4 bg-white">
          No live matches right now
        </div>
      )}
    </div>
  );
};

/* Main Component */
const SportsGame = () => {
  const [activeTab, setActiveTab] = useState("sports");

  // one liveOnly flag per sport section — toggled independently
  const [liveFilters, setLiveFilters] = useState({
    cricket: false,
    football: false,
    tennis: false,
  });

  // VIRTUAL / PREMIUM toggles per sport section (cosmetic filters, same pattern as LIVE)
  const [virtualFilters, setVirtualFilters] = useState({
    cricket: false,
    football: false,
    tennis: false,
  });
  const [premiumFilters, setPremiumFilters] = useState({
    cricket: false,
    football: false,
    tennis: false,
  });

  const toggleLive = (sport) =>
    setLiveFilters((prev) => ({ ...prev, [sport]: !prev[sport] }));
  const toggleVirtual = (sport) =>
    setVirtualFilters((prev) => ({ ...prev, [sport]: !prev[sport] }));
  const togglePremium = (sport) =>
    setPremiumFilters((prev) => ({ ...prev, [sport]: !prev[sport] }));

  const cricketDataRaw = useSelector(
    (state) => state?.matches?.cricket?.matches?.data,
  );
  const tennisDataRaw = useSelector(
    (state) => state?.matches?.tennis?.matches?.data,
  );
  const soccerDataRaw = useSelector(
    (state) => state?.matches?.soccer?.matches?.data,
  );

  // ---- FIXED: flatten raw redux matches before handing them to SportSection ----
  const cricketData = transformMatches(cricketDataRaw);
  const tennisData = transformMatches(tennisDataRaw);
  const soccerData = transformMatches(soccerDataRaw);

  return (
    <div className="font-sans bg-[#050c08] ">
      <TopNav activeTab={activeTab} onChange={setActiveTab} />

      {(activeTab === "sports" || activeTab === "cricket") && (
        <SportSection
          Icon={
            <img
              className="h-[30px] w-[30px]"
              src="/raftaar/balls-cricket.png"
            />
          }
          title="CRICKET"
          matches={cricketData || []}
          liveOnly={liveFilters.cricket}
          onToggleLive={() => toggleLive("cricket")}
          virtualOn={virtualFilters.cricket}
          onToggleVirtual={() => toggleVirtual("cricket")}
          premiumOn={premiumFilters.cricket}
          onTogglePremium={() => togglePremium("cricket")}
        />
      )}
      {(activeTab === "sports" || activeTab === "football") && (
        <SportSection
          Icon={
            <img
              className="h-[30px] w-[30px]"
              src="/raftaar/balls-footbal.png"
            />
          }
          title="FOOTBALL"
          matches={soccerData || []}
          liveOnly={liveFilters.football}
          onToggleLive={() => toggleLive("football")}
          virtualOn={virtualFilters.football}
          onToggleVirtual={() => toggleVirtual("football")}
          premiumOn={premiumFilters.football}
          onTogglePremium={() => togglePremium("football")}
        />
      )}
      {(activeTab === "sports" || activeTab === "tennis") && (
        <SportSection
          Icon={
            <img
              className="h-[30px] w-[30px]"
              src="/raftaar/balls-tennis.png"
            />
          }
          title="TENNIS"
          matches={tennisData || []}
          liveOnly={liveFilters.tennis}
          onToggleLive={() => toggleLive("tennis")}
          virtualOn={virtualFilters.tennis}
          onToggleVirtual={() => toggleVirtual("tennis")}
          premiumOn={premiumFilters.tennis}
          onTogglePremium={() => togglePremium("tennis")}
        />
      )}
    </div>
  );
};

export default SportsGame;