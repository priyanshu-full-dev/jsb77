import { IoRadio } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaFutbol, FaGavel } from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import {
  setMarketName,
  setMarketOddsData,
  setRunningData,
} from "../../redux/slices/fullmarketSlice";

const MatchLive = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const { matches: cricketMatches } = useSelector(
    (state) => state.matches.cricket,
  );
  const { matches: soccerMatches } = useSelector(
    (state) => state.matches.soccer,
  );
  const { matches: tennisMatches } = useSelector(
    (state) => state.matches.tennis,
  );

  /* =========================
       FILTER + ICON
  ========================= */
  const filterMatches = (matches, sportName) => {
    const iconMap = {
      Cricket: <MdSportsCricket className="text-[14px]" />,
      Soccer: <FaFutbol className="text-[14px]" />,
      Tennis: <FaGavel className="text-[14px]" />,
    };

    return (
      matches?.data
        ?.filter((e) => e?.matchOdds?.some((odds) => odds?.inplay))
        ?.map((match) => ({
          ...match,
          sportName,
          icon: iconMap[sportName],
        })) || []
    );
  };

  /* =========================
       MERGE + SORT
  ========================= */
  const sportPriority = {
    Cricket: 1,
    Soccer: 2,
    Tennis: 3,
  };

  const mergedInplayMatches = [
    ...filterMatches(cricketMatches, "Cricket"),
    ...filterMatches(soccerMatches, "Soccer"),
    ...filterMatches(tennisMatches, "Tennis"),
  ].sort((a, b) => sportPriority[a.sportName] - sportPriority[b.sportName]);

  /* =========================
       NAVIGATION
  ========================= */
  const handleClick = (e) => {
    dispatch(setRunningData(e?.matchRunners));
    dispatch(setMarketName(e?.markets));

    dispatch(
      setMarketOddsData({
        data: { data: e?.matchOdds },
        sport: e?.sportName,
      }),
    );

    navigate(
      `/full-market?eventType=${e?.sportId}&eventId=${e?.eventId}&marketId=${e?.marketId}&joinedMarketIds=${e?.joinedMarketIds}&competitionId=${e?.competitionId}&bm=${e?.bm}&fancy=${e?.fancy}&pc=${e?.pc}&eventName=${encodeURIComponent(
        e?.eventName,
      )}&openDate=${e?.openDate}&tv=${e?.tv}`,
    );
  };

  return (
    <div className="px-3 py-3 bg-black overflow-x-auto hide-scrollbar">
      <div ref={scrollRef} className="flex gap-[10px] min-w-max">
        {mergedInplayMatches.map((match, i) => {
          const event = match?.eventName || "";

          const teams = event.includes(" vs ")
            ? event.split(" vs ")
            : event.split(" v ");

          const team1 = teams?.[0]?.trim();
          const team2 = teams?.[1]?.trim();

          const odds1 =
            match?.matchOdds?.[0]?.runners?.[0]?.ex?.availableToBack?.[0]
              ?.price || "-";

          const odds2 =
            match?.matchOdds?.[0]?.runners?.[1]?.ex?.availableToBack?.[0]
              ?.price || "-";

          return (
            <div
              key={i}
              onClick={(e) => handleClick(match, e.currentTarget)}
              className="bg-[#2a2c38] rounded-[6px] px-[8px] py-[3px] text-white w-[230px] flex-shrink-0 cursor-pointer hover:bg-[#323442] transition"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-[10px]">
                <div className="flex items-center gap-[6px]">
                  <IoRadio className="text-green-400 text-[14px] animate-pulse" />

                  <span className="truncate w-[120px] text-[12px] text-[#ffffffb3] font-semibold">
                    {match.competitionName}
                  </span>
                </div>

                <img
                  src={`/SportsIcon/${match.sportName.toLowerCase()}.svg`}
                  alt=""
                  className="w-[16px] h-[16px]"
                />
              </div>

              {/* TEAM 1 */}
              <div className="flex items-center mb-1 justify-between">
                <span className="text-[12px] truncate w-[65%] font-medium">
                  {team1}
                </span>

                <div className="flex items-center justify-between border border-[#fff] rounded-[3px] w-[62px] h-[24px] px-[8px] bg-[#ffffff66]">
                  <span className="text-[12px] text-white">2</span>
                  <span className="text-[12px] text-black font-semibold">
                    {odds1}
                  </span>
                </div>
              </div>

              {/* TEAM 2 */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] truncate w-[65%] font-medium">
                  {team2}
                </span>

                <div className="flex items-center justify-between border border-[#fff] rounded-[3px] w-[62px] h-[24px] px-[8px] bg-[#ffffff66]">
                  <span className="text-[12px] text-white">2</span>
                  <span className="text-[12px] text-black font-semibold">
                    {odds2}
                  </span>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-[10px] text-[#ffffff80] font-semibold mt-[4px] flex items-center gap-1">
                {match.sportName} • Match Odds
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchLive;
