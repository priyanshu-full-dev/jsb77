import { useParams } from "react-router-dom";
import SportsTabs from "../../components/Sports/SportsTabs";
import SportsNav from "../../components/Sports/SportsNav";
import AnnouncementBar from "../../components/Sports/AnnouncementBar";
import { useSelector } from "react-redux";
import { SelectUserLockApplications } from "../../../utils/helper/commonSelectors";
import MatchList from "../../components/Sports/MatchList";

const SportsPage = () => {
  const { sport, type } = useParams();
  const lockData = useSelector(SelectUserLockApplications());

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

  return (
    <div className="bg-[#D9D9D9] min-h-screen pb-[100px]">
      <AnnouncementBar />

      <SportsTabs />

      <SportsNav type={type} />

      {!sportLockStatus?.[sport] && (
  <div className="mt-5 relative">

    {!currentMatches?.data?.length ? (
      <div className="w-[97%] mx-auto mt-6 bg-white rounded-lg p-4 text-center text-gray-500 font-semibold">
        No data available
      </div>
    ) : (
      <>
        {/* Sport Header */}
        <div className="flex items-end w-[97%] mx-auto absolute top-0 left-0 right-0 z-0">
          <div className="bg-[#2d2d2d] text-white px-3 h-[55px] rounded-t-[10px] flex items-center font-semibold">
            <div className="flex items-center -mt-6 gap-2.5 text-[12px]">
              {sport?.toUpperCase()}

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
