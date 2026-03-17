import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaFutbol, FaGavel } from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";

const Navbar = () => {
  const navigate = useNavigate();

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
       ICON + INPLAY FILTER
  ========================= */
  const filterInplayMatchesWithIcon = (matches, sportName) => {
    const iconMap = {
      Cricket: <MdSportsCricket className="text-[15px]" />,
      Soccer: <FaFutbol className="text-[15px]" />,
      Tennis: <FaGavel className="text-[15px]" />,
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

  const sportPriority = {
    Cricket: 1,
    Soccer: 2,
    Tennis: 3,
  };

  const mergedInplayMatches = [
    ...filterInplayMatchesWithIcon(cricketMatches, "Cricket"),
    ...filterInplayMatchesWithIcon(soccerMatches, "Soccer"),
    ...filterInplayMatchesWithIcon(tennisMatches, "Tennis"),
  ].sort((a, b) => sportPriority[a.sportName] - sportPriority[b.sportName]);

  const handleClick = (e) => {
    navigate(
      `/full-market?eventType=${e?.sportId}&eventId=${e?.eventId}&marketId=${e?.marketId}&joinedMarketIds=${e?.joinedMarketIds}&competitionId=${e?.competitionId}&bm=${e?.bm}&fancy=${e?.fancy}&pc=${e?.pc}&eventName=${encodeURIComponent(
        e?.eventName,
      )}&openDate=${e?.openDate}&tv=${e?.tv}`,
    );
  };

  return (
    <div className="bg-[#1c1c1c] border-b border-[#2a2a2a]">
      <div className="flex items-center overflow-x-auto hide-scrollbar h-[47px] px-2">
        {mergedInplayMatches.map((item, i) => (
          <div
            key={i}
            onClick={() => handleClick(item)}
            className="flex items-center text-white text-[12px] font-semibold whitespace-nowrap px-4 relative cursor-pointer hover:bg-[#2a2a2a] transition"
          >
            {/* ICON */}
            <span className="mr-2 text-white iconPulse">{item.icon}</span>

            {/* TITLE */}
            <span>{item.eventName || item.title}</span>

            {/* DIVIDER */}
            {i !== mergedInplayMatches.length - 1 && (
              <div className="absolute right-0 h-[22px] w-[1px] bg-[#3a3a3a]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
