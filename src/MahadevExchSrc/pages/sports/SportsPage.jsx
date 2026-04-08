import { useParams, useSearchParams } from "react-router-dom";
import SportsTabs from "../../components/Sports/SportsTabs";
import SportsNav from "../../components/Sports/SportsNav";
import AnnouncementBar from "../../components/Sports/AnnouncementBar";
import { useSelector } from "react-redux";
import { SelectUserLockApplications } from "../../../utils/helper/commonSelectors";
import MatchList from "../../components/Sports/MatchList";
import SportsHeader from "../../components/SportsHeader";

const SportsPage = () => {
  const { sport, type } = useParams();
  const lockData = useSelector(SelectUserLockApplications());
  const [searchParams] = useSearchParams();

  const isSportsbook = searchParams.has("sportsbook");
  const { matches: cricketMatches } = useSelector(
    (state) => state.matches.cricket,
  );
  const { matches: soccerMatches } = useSelector(
    (state) => state.matches.soccer,
  );
  const { matches: tennisMatches } = useSelector(
    (state) => state.matches.tennis,
  );

  const sportLockStatus = {
    cricket: lockData?.cricket,
    soccer: lockData?.soccer,
    tennis: lockData?.tennis,
    kabaddi: lockData?.kabaddi,
    horse: lockData?.horse,
    greyhound: lockData?.greyhound,
  };

  const sportMatches = {
    cricket: cricketMatches,
    soccer: soccerMatches,
    tennis: tennisMatches,
  };

  const currentMatches = sportMatches?.[sport];

  const filteredMatches = currentMatches?.data?.filter((match) => {
    const isInPlay = match?.matchOdds?.some((odds) => odds?.inplay);

    const matchDate = new Date(match?.openDate);
    const today = new Date();

    const isToday = matchDate.toDateString() === today.toDateString();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

    if (type === "inplay") return isInPlay;
    if (type === "today") return isToday;
    if (type === "tomorrow") return isTomorrow;

    return true;
  });

  const sportMap = {
    cricket: "ক্রিকেট",
    soccer: "ফুটবল",
    tennis: "টেনিস",
  };

  return (
    <div className="bg-[#D9D9D9] min-h-screen pb-[100px]">
      {isSportsbook ? (
        <SportsHeader />
      ) : (
        <>
          <AnnouncementBar />
          <SportsTabs />
          <SportsNav type={type} />
        </>
      )}

      {!sportLockStatus?.[sport] && (
        <div className="mt-5 relative">
          {!filteredMatches?.length ? (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center">
              <img
                src="/no_event.svg"
                alt="No Event"
                className="w-[90px] mb-3"
              />

              <p className="text-[16px] font-semibold text-gray-600">
                No Event(s) Currently
              </p>

              <p className="text-[13px] text-gray-400 mt-1">
                Please check again later
              </p>
            </div>
          ) : (
            <>
              {/* Sport Header */}
              <div className="flex items-end w-[97%] mx-auto absolute top-0 left-0 right-0 z-0">
                <div className="bg-[#2d2d2d] text-white px-3 h-[55px] rounded-t-[10px] flex items-center font-semibold">
                  <div className="flex items-center -mt-6 gap-2.5 text-[12px]">
                    <span>{sportMap[sport] || sport}</span>

                    <img
                      src={`/SportsIcon/${sport}.svg`}
                      alt={sport}
                      className="w-[16px] h-[16px]"
                    />
                  </div>
                </div>
              </div>

              {/* Match List */}
              <div className="pt-[32px] relative z-10">
                <MatchList matches={currentMatches} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SportsPage;
