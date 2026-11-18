import { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdPushPin } from "react-icons/md";
import MatchDateAndInplay from "./../../../components/SportsMatchesList/MatchDateAndInplay";
import {
  setRunningData,
  setMarketName,
  setMarketOddsData,
} from "../../../../../redux/slices/fullmarketSlice";
import {
  subscribeToKabaddiMatchesData,
  subscribeToKabaddiMatchesDataOdds,
} from "../../../../../socketClient";

function KabaddiMatchesList() {
  const kabaddiMatches = useSelector(
    (state) => state?.kabaddi?.kabaddiList?.t2 || []
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.token);
  const [pinnedEvents, setPinnedEvents] = useState([]);
  const compactDesign = false; // Define or fetch from state/props as needed
  const sportName = "kabaddi";

  useEffect(() => {
    subscribeToKabaddiMatchesData();
    subscribeToKabaddiMatchesDataOdds();

    const stored = JSON.parse(localStorage.getItem("pinnedEvents") || "[]");
    setPinnedEvents(stored);

    return () => {
      // Placeholder for socket cleanup; implement based on socketClient
    };
  }, []);

  const handlePinClick = (eventId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    let updatedPins = [...pinnedEvents];
    if (updatedPins.includes(eventId)) {
      updatedPins = updatedPins.filter((id) => id !== eventId);
    } else {
      updatedPins.push(eventId);
    }

    setPinnedEvents(updatedPins);
    localStorage.setItem("pinnedEvents", JSON.stringify(updatedPins));
    window.dispatchEvent(new Event("pinnedEventsUpdated"));
  };

  const handleMatchClick = ({
    gmid,
    ename,
    section,
    mname,
    etid,
    mid,
    cid,
    bm,
    f: fancy,
    iscc: pc,
  }) => {
    dispatch(setRunningData(section));
    dispatch(setMarketName(mname));
    dispatch(
      setMarketOddsData({
        data: { data: section.flatMap((s) => s.odds) },
        sport: sportName,
      })
    );
    navigate(
      `/kabaddi-market?gmid=${gmid}&sportsName=kabaddi&raceName=${ename}&sportId=${etid}&marketId=${mid}&competitionId=${cid}&bm=${bm}&fancy=${fancy}&pc=${pc}`
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {Array.isArray(kabaddiMatches) &&
        kabaddiMatches.map(
          (
            {
              gmid: eventId,
              ename: eventName,
              etid: sportId,
              cid: competitionId,
              mid: marketId,
              stime: openDate,
              iplay: inplay,
              bm,
              f: fancy,
              iscc: pc,
              section: matchRunners,
              mname: marketName,
              status,
            },
            i
          ) => {
            const isPinned = pinnedEvents.includes(eventId);
            const matchOdds = matchRunners.flatMap((section) => section.odds);

            return (
              <div
                key={`${i + 1}-${eventId}`}
                className={`w-full px-2 py-1 flex flex-col border-b border-[#c8ced3] ${
                  compactDesign ? "min-h-8" : "min-h-12"
                } `}
              >
                <div className="flex flex-row justify-between items-center">
                  <div
                    role="button"
                    onClick={() =>
                      handleMatchClick({
                        gmid: eventId,
                        ename: eventName,
                        section: matchRunners,
                        mname: marketName,
                        etid: sportId,
                        mid: marketId,
                        cid: competitionId,
                        bm,
                        f: fancy,
                        iscc: pc,
                      })
                    }
                    className="flex-1 pr-2 text-left cursor-pointer"
                  >
                    <span
                      className={`font-bold text-[#2789ce] ${
                        compactDesign ? "text-xs" : "text-sm"
                      }`}
                    >
                      {eventName}
                      {inplay && (
                        <span className="aura-inplay pl-2">In-play</span>
                      )}
                    </span>
                    {!inplay && openDate && (
                      <MatchDateAndInplay inplay={inplay} openDate={openDate} />
                    )}
                  </div>
                  <div className="flex flex-row items-center gap-1 self-stretch">
                    <div className="flex flex-row items-center gap-1 self-start mt-0.5">
                      {!!bm && (
                        <div
                          className={`aura-market-status aura-bm ${
                            compactDesign ? "text-[10px]" : "text-[12px]"
                          }`}
                        >
                          BM
                        </div>
                      )}

                      {!!fancy && (
                        <div
                          className={`aura-market-status aura-f ${
                            compactDesign ? "text-[10px]" : "text-[12px]"
                          }`}
                        >
                          F
                        </div>
                      )}

                      {!!pc && (
                        <div
                          className={`aura-market-status aura-s ${
                            compactDesign ? "text-[10px]" : "text-[12px]"
                          }`}
                        >
                          S
                        </div>
                      )}
                    </div>

                    <div
                      onClick={() => handlePinClick(eventId)}
                      className={`ml-2 rounded-full flex flex-row justify-center items-center p-[2px] w-[22px] h-[22px] self-center cursor-pointer transition-all duration-200 ${
                        isPinned
                          ? "bg-emerald-100 dark:bg-dark-bg border border-emerald-500"
                          : "border border-[#7e97a6] bg-transparent dark:bg-dark-bg"
                      }`}
                    >
                      <MdPushPin
                        color={isPinned ? "#059669" : "#7e97a6"}
                        size={16}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}
      {kabaddiMatches && kabaddiMatches.length === 0 && (
        <div className="w-full h-full flex flex-row justify-center items-center text-sm font-bold text-gray2">
          No match scheduled.
        </div>
      )}
    </div>
  );
}

export default KabaddiMatchesList;
