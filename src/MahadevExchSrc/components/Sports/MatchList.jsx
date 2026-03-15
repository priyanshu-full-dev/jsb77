import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setMarketName,
  setMarketOddsData,
  setRunningData,
} from "../../../redux/slices/fullmarketSlice";
import MatchSkeleton from "../Skeleton/MatchSkeleton";
import { Premiumcricket } from "../../../utils/helper/commonSelectors";
import { BsFillPinFill } from "react-icons/bs";
import { MdOutlineAlarmOn } from "react-icons/md";
import LiveIocn from "../../../../public/SportsIcon/LiveIocn";

const OddsBox = ({ value, type, hasChanged }) => (
  <div
    className={`h-[30px] flex items-center justify-center rounded-[8px] text-[14px] font-bold
    ${type === "back" ? "bg-[#8ec5fe]" : "bg-[#ffa0d0]"}
    ${hasChanged ? "animate-pulse" : ""}
    `}
  >
    {value || "-"}
  </div>
);

export default function MatchList({ matches }) {
  const location = useLocation();
  const pathname = location.pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const premiumCricket = useSelector(Premiumcricket());

  const { type } = useParams();

  const [pinnedMatches, setPinnedMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prevOdds, setPrevOdds] = useState({});
  const prevOddsRef = useRef({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pinnedMatches");
      const parsed = stored ? JSON.parse(stored) : [];
      setPinnedMatches(parsed);
    } catch (err) {
      console.error("Failed to load pinned matches:", err);
    }
  }, []);

  const handlePin = (marketId, eventId, bmOdds, event) => {
    event?.stopPropagation();

    let updatedMatches = JSON.parse(
      localStorage.getItem("pinnedMatches") || "[]",
    );

    const matchIndex = updatedMatches.findIndex((m) => m.id === eventId);

    if (matchIndex !== -1) {
      updatedMatches = updatedMatches.filter((m) => m.id !== eventId);
    } else {
      updatedMatches.push({
        id: eventId,
        matchOdds: true,
        bookmaker: !!bmOdds,
        marketId,
        bmOdds,
        eventId,
      });
    }

    setPinnedMatches(updatedMatches);
    localStorage.setItem("pinnedMatches", JSON.stringify(updatedMatches));
  };

  useEffect(() => {
    if (!matches?.data) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    const newOdds = {};
    matches.data?.forEach((match) => {
      const filteredOdds = match?.matchOdds?.find(
        (odds) => odds?.marketId === match?.marketId,
      );

      if (filteredOdds && filteredOdds?.runners?.[0]) {
        newOdds[match.eventId] = {
          back: filteredOdds.runners[0].ex.availableToBack.map((b) => b.price),
          lay: filteredOdds.runners[0].ex.availableToLay.map((l) => l.price),
        };
      }
    });

    prevOddsRef.current = prevOdds;
    setPrevOdds(newOdds);
  }, [matches]);

  const filteredMatches = matches?.data
    ?.filter((match) => {
      const isInPlay = match?.matchOdds?.some((odds) => odds?.inplay);

      const matchDate = new Date(match?.openDate);
      const today = new Date();

      const isToday = matchDate.toDateString() === today.toDateString();

      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

      if (type === "inplay") {
        return isInPlay;
      }

      if (type === "today") {
        return isToday;
      }

      if (type === "tomorrow") {
        return isTomorrow;
      }

      return true;
    })
    ?.sort((a, b) => {
      const aInPlay = a?.matchOdds?.some((odds) => odds?.inplay);
      const bInPlay = b?.matchOdds?.some((odds) => odds?.inplay);
      return bInPlay - aInPlay;
    });

  if (isLoading) return <MatchSkeleton />;

  if (!filteredMatches?.length)
    return <div className="text-center p-3">No live matches currently.</div>;

  return (
    <div className="w-[97%] mx-auto rounded-xl overflow-hidden">
      {filteredMatches.map((e) => {
        const filteredOdds = e?.matchOdds?.find(
          (odds) => odds?.marketId === e?.marketId,
        );

        if (e?.marketName !== "Match Odds") return null;

        const isPinned = pinnedMatches.some(
          (m) => m.id === e?.eventId && (m.matchOdds || m.bookmaker),
        );

        return (
          <div
            key={e?.eventId}
            className="bg-white p-3  cursor-pointer border-b border-[#00000033]"
            onClick={() => {
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
            }}
          >
            {/* Match Title */}
            <div className="flex justify-between items-start mb-2">
              <div className="font-extrabold text-[14px] leading-[18px] text-[#212529] mb-1">
                {e?.eventName}
              </div>

              <div className="flex items-center gap-1">
                {e?.pc && premiumCricket && (
                  <img
                    src="/SportsIcon/premiummarkets.svg"
                    alt="bm"
                    className="w-[16px]"
                  />
                )}

                {e?.bm && (
                  <img
                    src="/SportsIcon/bookmakerSymbol.svg"
                    alt="bm"
                    className="w-[25px]"
                  />
                )}
                {/* 
                {e?.fancy && (
                  <img src="/Icon/fancy.svg" alt="fancy" className="h-[14px]" />
                )} */}

                {e?.matchOdds?.some((odds) => odds?.inplay) && <LiveIocn />}
                {/* 
                <div
                  className={`h-[22px] w-[22px]   rounded flex items-center justify-center cursor-pointer ${
                    isPinned ? "bg-[#095771]" : ""
                  }`}
                  onClick={(event) =>
                    handlePin(e.marketId, e.eventId, e.bmOdds, event)
                  }
                >
                  <BsFillPinFill
                    size={12}
                    color={isPinned ? "#fff" : "#095771"}
                  />
                </div> */}
              </div>
            </div>

            {/* Odds */}
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 3 }).map((_, index) => {
                const backPrice =
                  filteredOdds?.runners[0]?.ex.availableToBack[index]?.price;

                const layPrice =
                  filteredOdds?.runners[0]?.ex.availableToLay[index]?.price;

                const prevBack = prevOddsRef.current[e?.eventId]?.back?.[index];

                const prevLay = prevOddsRef.current[e?.eventId]?.lay?.[index];

                const backChanged =
                  backPrice !== prevBack && prevBack !== undefined;

                const layChanged =
                  layPrice !== prevLay && prevLay !== undefined;

                return (
                  <Fragment key={index}>
                    <OddsBox
                      value={backPrice}
                      type="back"
                      hasChanged={backChanged}
                    />
                    <OddsBox
                      value={layPrice}
                      type="lay"
                      hasChanged={layChanged}
                    />
                  </Fragment>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
