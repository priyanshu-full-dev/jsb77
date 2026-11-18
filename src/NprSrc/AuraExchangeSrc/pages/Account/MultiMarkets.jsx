import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import SportsMatchesList from "../../components/SportsMatchesList";
import HorseFilteredMatches from "../Sports/Horse/HorseFilteredMatches";
import GreyhoundFilteredMatches from "../Sports/Greyhound/GreyhoundFilteredMatches";

const MultiMarkets = () => {
  const [pinnedEvents, setPinnedEvents] = useState([]);
  const [pinnedTrackNames, setPinnedTrackNames] = useState([]);

  useEffect(() => {
    const loadPinnedEvents = () => {
      setPinnedEvents(JSON.parse(localStorage.getItem("pinnedEvents") || "[]"));
    };
    loadPinnedEvents();
    window.addEventListener("pinnedEventsUpdated", loadPinnedEvents);
    return () =>
      window.removeEventListener("pinnedEventsUpdated", loadPinnedEvents);
  }, []);

  useEffect(() => {
    const loadPinnedTracks = () => {
      setPinnedTrackNames(
        JSON.parse(localStorage.getItem("pinnedTrackName") || "[]")
      );
    };
    loadPinnedTracks();
    window.addEventListener("pinnedTrackNameUpdated", loadPinnedTracks);
    return () =>
      window.removeEventListener("pinnedTrackNameUpdated", loadPinnedTracks);
  }, []);

  const horseMatches = useSelector((state) => state?.horse?.horseRaceList);
  const greyhoundMatches = useSelector(
    (state) => state?.greyhound?.greyhoundRaceList
  );
  const cricketMatches = useSelector(
    (state) => state.matches.cricket.matches.data
  );
  const tennisMatches = useSelector(
    (state) => state.matches.tennis.matches.data
  );
  const soccerMatches = useSelector(
    (state) => state.matches.soccer.matches.data
  );

  const filteredHorseMatches =
    horseMatches
      ?.map((match) => ({
        ...match,
        children: match.children?.filter((child) =>
          pinnedTrackNames.includes(child.ename)
        ),
      }))
      .filter((match) => match.children?.length > 0) || [];

  const filteredGreyhoundMatches =
    greyhoundMatches
      ?.map((match) => ({
        ...match,
        children: match.children?.filter((child) =>
          pinnedTrackNames.includes(child.ename)
        ),
      }))
      .filter((match) => match.children?.length > 0) || [];

  const allFilteredMatches = [
    ...(cricketMatches || []).filter((e) => pinnedEvents.includes(e.eventId)),
    ...(tennisMatches || []).filter((e) => pinnedEvents.includes(e.eventId)),
    ...(soccerMatches || []).filter((e) => pinnedEvents.includes(e.eventId)),
  ];

  const hasMatches =
    allFilteredMatches.length > 0 ||
    filteredHorseMatches.length > 0 ||
    filteredGreyhoundMatches.length > 0;

  return (
    <div>
      {hasMatches && (
        <div className="!bg-[white] w-full">
          <div
            className="w-full p-1"
            style={{
              background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
            }}
          >
            <h3 className="text-center font-bold text-[12px] text-[white]">
              Multi Markets
            </h3>
          </div>
        </div>
      )}

      {allFilteredMatches.length > 0 && (
        <SportsMatchesList matchesList={allFilteredMatches} />
      )}

      {filteredHorseMatches.length > 0 && (
        <HorseFilteredMatches
          data={filteredHorseMatches}
          activeTab="ALL"
          DisplayName={false}
        />
      )}

      {filteredGreyhoundMatches.length > 0 && (
        <GreyhoundFilteredMatches
          data={filteredGreyhoundMatches}
          activeTab="ALL"
          DisplayName={false}
        />
      )}

      {allFilteredMatches.length === 0 &&
        filteredHorseMatches.length === 0 &&
        filteredGreyhoundMatches.length === 0 && (
          <div className="w-full p-3 sm:p-5 flex justify-center items-center mt-2">
            <div className="w-full max-w-[460px] bg-white border border-[#8da5b5] rounded-[10px] p-4 sm:p-5 shadow-sm">
              {/* Top Section */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-[#708a9c]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="3" r="1.1" />
                    <circle cx="8" cy="7" r="1.1" />
                    <circle cx="12" cy="7" r="1.1" />
                    <circle cx="16" cy="7" r="1.1" />
                    <circle cx="4" cy="11" r="1.1" />
                    <circle cx="8" cy="11" r="1.1" />
                    <circle cx="12" cy="11" r="1.1" />
                    <circle cx="16" cy="11" r="1.1" />
                    <circle cx="20" cy="11" r="1.1" />
                    <circle cx="4" cy="15" r="1.1" />
                    <circle cx="8" cy="15" r="1.1" />
                    <circle cx="12" cy="15" r="1.1" />
                    <circle cx="16" cy="15" r="1.1" />
                    <circle cx="20" cy="15" r="1.1" />
                    <circle cx="8" cy="19" r="1.1" />
                    <circle cx="12" cy="19" r="1.1" />
                    <circle cx="16" cy="19" r="1.1" />
                    <circle cx="12" cy="23" r="1.1" />
                  </svg>
                </div>

                <h2 className="text-[#506879] text-[16px] sm:text-[17.5px] font-normal leading-snug text-center m-0">
                  There are currently no followed
                  <br />
                  multi markets.
                </h2>
              </div>

              {/* Divider */}
              <div className="border-t border-[#e2e8f0] my-3.5 w-full" />

              {/* Bottom Section */}
              <p className="text-[#60798a] text-[14px] sm:text-[14.5px] font-normal text-center m-0">
                Please add some markets from events.
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default MultiMarkets;