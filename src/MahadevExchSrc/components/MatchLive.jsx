import { FaCircle } from "react-icons/fa";
import { IoRadio } from "react-icons/io5";
import { useSelector } from "react-redux";

const matches = [
  {
    league: "Pakistan National T20 Cup",
    team1: "Karachi Region Blues",
    team2: "Multan Region",
    odds1: "270",
    odds2: "-",
  },
  {
    league: "SA T20 League SRL",
    team1: "Sunrisers Eastern Cape",
    team2: "Joburg Super Kings",
    odds1: "1.85",
    odds2: "2.10",
  },
  {
    league: "SA T20 League SRL",
    team1: "Sunrisers Eastern Cape",
    team2: "Joburg Super Kings",
    odds1: "1.85",
    odds2: "2.10",
  },
  {
    league: "SA T20 League SRL",
    team1: "Sunrisers Eastern Cape",
    team2: "Joburg Super Kings",
    odds1: "1.85",
    odds2: "2.10",
  },
  {
    league: "SA T20 League SRL",
    team1: "Sunrisers Eastern Cape",
    team2: "Joburg Super Kings",
    odds1: "1.85",
    odds2: "2.10",
  },
];

const MatchLive = () => {
  const { matches: cricketMatches } = useSelector(
    (state) => state.matches.cricket,
  );


  /* =========================
       ICON + INPLAY FILTER
    ========================= */
  const filterInplayMatchesWithIcon = (matches, sportName) => {
    return (
      matches?.data
        ?.filter((e) => e?.matchOdds?.some((odds) => odds?.inplay))
        ?.map((match) => ({
          ...match,
          sportName,
        })) || []
    );
  };

  const sportPriority = {
    Cricket: 1,
  };

  const mergedInplayMatches = [
    ...filterInplayMatchesWithIcon(cricketMatches, "Cricket"),
  ].sort((a, b) => sportPriority[a.sportName] - sportPriority[b.sportName]);

  console.log({mergedInplayMatches});
  

  return (
    <div className="px-3 py-3 bg-black overflow-x-auto scrollbar-hide">
      <div className="flex gap-[10px] min-w-max">
  {mergedInplayMatches.map((match, i) => {
    const team1 = match?.matchOdds?.[0]?.runners?.[0]?.runnerName;
    const team2 = match?.matchOdds?.[0]?.runners?.[1]?.runnerName;

    const odds1 =
      match?.matchOdds?.[0]?.runners?.[0]?.ex?.availableToBack?.[0]?.price || "-";

    const odds2 =
      match?.matchOdds?.[0]?.runners?.[1]?.ex?.availableToBack?.[0]?.price || "-";

    return (
      <div
        key={i}
        className="bg-[#2a2c38] rounded-[6px] px-[8px] py-[3px] text-white w-[230px] flex-shrink-0"
      >
        {/* League Header */}
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[6px]">
            <IoRadio className="text-green-400 text-[14px]" />

          <span className="truncate w-[140px] text-[12px] text-[#ffffffb3] font-semibold">
  {match.competitionName}
</span>
          </div>

          <img
            src="/cricket-icon.svg"
            alt=""
            className="w-[16px] h-[16px]"
          />
        </div>

        {/* Team 1 */}
        <div className="flex items-center mb-1 justify-between">
          <span className="text-[12px] truncate w-[65%] text-white font-medium">
            {team1}
          </span>

          <div className="flex items-center justify-between border border-[#fff] rounded-[3px] w-[62px] h-[24px] px-[8px] bg-[#ffffff66]">
            <span className="text-[12px] text-white">2</span>

            <span className="text-[12px] text-black font-semibold">
              {odds1}
            </span>
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] truncate w-[65%] text-white font-medium">
            {team2}
          </span>

          <div className="flex items-center justify-between border border-[#fff] rounded-[3px] w-[62px] h-[24px] px-[8px] bg-[#ffffff66]">
            <span className="text-[12px] text-white">2</span>

            <span className="text-[12px] text-black font-semibold">
              {odds2}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-[#ffffff80] font-semibold mt-[4px]">
          Match_odds
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
};

export default MatchLive;
