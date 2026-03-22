import React, { useEffect, useState } from "react";
import { MdPushPin } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { MdKeyboardDoubleArrowRight } from "react-icons/md";

import { updateHorseMarket } from "../../../redux/slices/horseSlice";

const HorseFilteredMatches = ({ data, activeTab, DisplayName = true }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.token);
  const [pinnedEvents, setPinnedEvents] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pinnedTrackName") || "[]");
    setPinnedEvents(stored);
  }, []);

  const handlePinClick = (trackName) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    let updatedPins = [...pinnedEvents];

    if (updatedPins.includes(trackName)) {
      updatedPins = updatedPins.filter((id) => id !== trackName);
    } else {
      updatedPins.push(trackName);
    }

    setPinnedEvents(updatedPins);
    localStorage.setItem("pinnedTrackName", JSON.stringify(updatedPins));
    window.dispatchEvent(new Event("pinnedTrackNameUpdated"));
  };

  const handleDispatchHorseOdds = (gmid, raceName, odds) => {

    dispatch(updateHorseMarket({ gmid, odds }));

    setTimeout(() => {
      navigate(
        `/horse-market?gmid=${gmid}&sportsName=horse&raceName=${raceName}&sportId=${10}`
      );
    }, 100);
  };

  return (
    <>
      {data
        ?.filter((e) => activeTab === "ALL" || e?.cname === activeTab)
        .map((e, i) => (
          <div className="mb-4 " key={i}>
            {DisplayName && (
              <div className="p-1 bg-[#484848] pl-2 font-bold text-[13.5px] text-white">
                {e?.cname}
              </div>
            )}

            {e?.children?.map((track, idx) => {
              const firstMatch = track?.children?.[0]?.stime;
              const matchDate = firstMatch
                ? new Date(firstMatch).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })
                : "";

              const allMatchClosed = track?.childs?.every(
                (match) => match?.gOdds?.status === "CLOSED"
              );
              if (allMatchClosed) return null;

              const trackNameAndDate = `${track?.ename} ${matchDate}`;
              const isPinned = pinnedEvents.includes(track?.ename);

              return (
                <div className="border-b  border-[#c8ced3]" key={idx}>
                  <div
                    className={`font-bold bg-[#484848] px-2 py-1  flex items-center justify-between text-[13px] font-[sans-serif] mt-2 ${
                      !DisplayName
                        ? "bg-[#294251] text-black"
                        : ""
                    }`}
                  >
                    <div className="flex items-center  gap-1">
                      {!DisplayName && (
                        <span className="text-[white]"> {e?.cname}</span>
                      )}

                      {!DisplayName && <MdKeyboardDoubleArrowRight color="white"/>}

                      <span
                        className={`font-semibold ${
                          !DisplayName ? "text-[#ffffff]" : ""
                        }`}
                      >
                        {trackNameAndDate}
                      </span>
                    </div>
                    <div
                      onClick={() => handlePinClick(track?.ename)}
                      className={`ml-2 rounded-full flex flex-row justify-center items-center p-[2px] w-[22px] h-[22px] cursor-pointer transition-all duration-200 ${
                        isPinned
                          ? "bg-light-bg dark:bg-dark-bg border border-emerald-500"
                          : "border border-[#7e97a6] bg-transparent"
                      }`}
                    >
                      <MdPushPin
                        color={isPinned ? "#059669" : "#7e97a6"}
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2  p-2">
                    {track?.children?.map((match, index) => {
                      if (match?.gOdds?.status === "CLOSED") return null;

                      const matchTime = new Date(match.stime);
                      matchTime.setMinutes(matchTime.getMinutes() - 20);

                      const currentTime = new Date();
                      currentTime.setMinutes(currentTime.getMinutes() + 10);

                      const currentlyAheadOfMatchTime =
                        matchTime <= currentTime;
                      const isActive =
                        currentlyAheadOfMatchTime &&
                        match?.gOdds?.status !== "CLOSED" &&
                        match?.gOdds?.status !== "SUSPENDED";

                      const correctMatchTime = new Date(match.stime);
                      const formattedTime = correctMatchTime.toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      );

                      const showFormattedTime =
                        correctMatchTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        });

                      const raceName = `${trackNameAndDate} ${formattedTime}`;
                      const now = new Date();
                      const timeDifferenceInMinutes = Math.floor(
                        (correctMatchTime - now) / (1000 * 60)
                      );

                      return (
                        <button
                          onClick={() =>
                            handleDispatchHorseOdds(
                              match?.gmid?.toString(),
                              raceName,
                              match.hOdds
                            )
                          }
                          key={index}
                          className={`px-1.5 flex items-center py-1.5 rounded text-[13px] ${
                            isActive
                              ? "bg-[#0c667e] text-white dark:text-white"
                              : "bg-[#d4d3d3] text-black"
                          } border border-transparent hover:border-[0.5px] hover:border-[#27a6c3]`}
                        >
                          <span
                            className={
                              timeDifferenceInMinutes < 5
                                ? "inplay2"
                                : undefined
                            }
                          >
                            {showFormattedTime}
                          </span>
                          <GoDotFill
                            className={`ml-1 ${isActive ? "inplay2" : ""}`}
                            color={
                              match?.gOdds?.status === "SUSPENDED"
                                ? "red"
                                : "green"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </>
  );
};

export default HorseFilteredMatches;
