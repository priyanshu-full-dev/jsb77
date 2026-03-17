import React, { useEffect, useState } from "react";
import { MdPushPin, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateGreyhoundMarket } from "../../../redux/slices/greyhoundSlice";

const GreyhoundFilteredMatches = ({ data, activeTab, DisplayName = true }) => {
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

  const handleDispatchGreyhoundOdds = (gmid, raceName, odds) => {
    dispatch(updateGreyhoundMarket({ gmid, odds }));
    setTimeout(() => {
      navigate(
        `/greyhound-market?gmid=${gmid}&sportsName=greyhound&raceName=${raceName}&sportId=65`,
      );
    }, 100);
  };

  return (
    <>
      {data
        ?.filter((e) => activeTab === "ALL" || e?.cname === activeTab)
        ?.map((e, i) => {
          return (
            <div className="mb-4" key={i}>
              <div className="p-1 pl-2  font-bold text-[13.5px] text-[white] bg-[#484848]">
                {e?.cname}
              </div>

              {e?.children?.map((e, i) => {
                let firstMatch = e?.children?.[0]?.stime;
                let matchDate = firstMatch
                  ? new Date(firstMatch).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "";
                let allMatchClosed = e?.children?.every(
                  (match) => match?.hOdds?.status === "CLOSED",
                );
                if (allMatchClosed) {
                  return null;
                }
                const trackNameAndDate = `${e?.ename} ${matchDate}`;
                const isPinned = pinnedEvents.includes(e?.ename);

                return (
                  <div className="border-b" key={i}>
                    <div
                      className={`font-bold bg-[#484848] px-2 py-1 flex items-center justify-between text-[13px] font-[sans-serif] mt-2 ${
                        !DisplayName ? "bg-[#294251] text-black" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {!DisplayName && (
                          <span className="text-[white]">{e?.cname}</span>
                        )}
                        {!DisplayName && (
                          <MdKeyboardDoubleArrowRight color="white" />
                        )}
                        <span
                          className={`font-semibold ${
                            !DisplayName ? "text-[#ffffff]" : ""
                          }`}
                        >
                          {trackNameAndDate}
                        </span>
                      </div>
                      <div
                        onClick={() => handlePinClick(e?.ename)}
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

                    <div className="flex flex-wrap gap-2 p-2">
                      {e?.children?.map((match, index) => {
                        const matchTime = new Date(match.stime);
                        matchTime.setMinutes(matchTime.getMinutes() - 20);
                        const currentTime = new Date();
                        currentTime.setMinutes(currentTime.getMinutes() + 10);
                        const currentlyAheadOfMatchTime =
                          matchTime <= currentTime;
                        const isActive =
                          currentlyAheadOfMatchTime &&
                          match?.hOdds?.status !== "CLOSED" &&
                          match?.hOdds?.status !== "SUSPENDED";
                        if (match?.hOdds?.status === "CLOSED") {
                          return null;
                        }
                        const correctMatchTime = new Date(match.stime);
                        const formattedTime =
                          correctMatchTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });

                        const showFormattedTime =
                          correctMatchTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });

                        const raceName = trackNameAndDate + " " + formattedTime;
                        const now = new Date();
                        const timeDifferenceInMinutes = Math.floor(
                          (correctMatchTime - now) / (1000 * 60),
                        );

                        return (
                          <button
                            onClick={() =>
                              handleDispatchGreyhoundOdds(
                                match?.gmid?.toString(),
                                raceName,
                                match.hOdds,
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
                                timeDifferenceInMinutes < 5 ? "inplay2" : ""
                              }
                            >
                              {formattedTime}
                            </span>
                            <GoDotFill
                              className={`ml-1 ${isActive ? "inplay2" : ""}`}
                              color={
                                match?.hOdds?.status === "SUSPENDED"
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
          );
        })}
    </>
  );
};

export default GreyhoundFilteredMatches;
