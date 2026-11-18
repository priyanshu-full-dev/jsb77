import { useEffect, useState, useMemo } from "react";
import InplayTodayTomorrowTabs from "./InplayTodayTomorrowTabs";
import SportMatchList from "./SportMatchList";
import { useSelector } from "react-redux";
import { subscribeToAuraEventsData } from "../../../../socketClient";

function Inplay() {
  const [activeTab, setActiveTab] = useState("Inplay");

  useEffect(() => {
    const unsubs = [4, 1, 2, 7, 4339, 7522].map((sportId) =>
      subscribeToAuraEventsData({ sportId }),
    );

    return () => {
      unsubs.forEach((unsub) => {
        if (typeof unsub === "function") unsub();
      });
    };
  }, []);

  // Fetch dedicated sports data from remote response in Redux
  const cricketData = useSelector(
    (state) => state?.auraMatches?.cricket?.matches?.data
  );
  const soccerData = useSelector(
    (state) => state?.auraMatches?.soccer?.matches?.data
  );
  const tennisData = useSelector(
    (state) => state?.auraMatches?.tennis?.matches?.data
  );
  const horseData = useSelector(
    (state) => state?.auraMatches?.horse?.matches?.data
  );
  const greyhoundData = useSelector(
    (state) => state?.auraMatches?.greyhound?.matches?.data
  );
  const basketballData = useSelector(
    (state) => state?.auraMatches?.basketball?.matches?.data
  );

  // Preserve remote response sequence without re-ordering
  const soccerMatches = useMemo(() => {
    if (Array.isArray(soccerData) && soccerData.length > 0) {
      return soccerData;
    }
    if (Array.isArray(cricketData)) {
      return cricketData.filter((match) => String(match?.sportId) === "1");
    }
    return [];
  }, [soccerData, cricketData]);

  const tennisMatches = useMemo(() => {
    if (Array.isArray(tennisData) && tennisData.length > 0) {
      return tennisData;
    }
    if (Array.isArray(cricketData)) {
      return cricketData.filter((match) => String(match?.sportId) === "2");
    }
    return [];
  }, [tennisData, cricketData]);

  const cricketMatches = useMemo(() => {
    if (Array.isArray(cricketData)) {
      return cricketData.filter(
        (match) =>
          String(match?.sportId) === "4" &&
          match?.tournamentName !== "BallByBall"
      );
    }
    return [];
  }, [cricketData]);

  const horseMatches = useMemo(() => {
    if (Array.isArray(horseData) && horseData.length > 0) {
      return horseData;
    }
    // if (Array.isArray(cricketData)) {
    //   return cricketData.filter((match) => String(match?.sportId) === "7");
    // }
    return [];
  }, [horseData]);

  const greyhoundMatches = useMemo(() => {
    if (Array.isArray(greyhoundData) && greyhoundData.length > 0) {
      return greyhoundData;
    }
    // if (Array.isArray(cricketData)) {
    //   return cricketData.filter((match) => String(match?.sportId) === "4339");
    // }
    return [];
  }, [greyhoundData]);

  const basketballMatches = useMemo(() => {
    if (Array.isArray(basketballData) && basketballData.length > 0) {
      return basketballData;
    }
    if (Array.isArray(cricketData)) {
      return cricketData.filter(
        (match) =>
          String(match?.sportId) === "7522" ||
          String(match?.sportId) === "1002" ||
          /basketball/i.test(match?.sportName || "")
      );
    }
    return [];
  }, [basketballData, cricketData]);

  return (
    <div
      className="w-full flex flex-col pb-8"
      style={{
        maxHeight: "calc(100vh - 60px - 56px)",
        overflowY: "auto",
      }}
    >
      <InplayTodayTomorrowTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <SportMatchList
        sportId={4}
        filter={activeTab}
        sportTitle="Cricket"
        matchesList={cricketMatches}
      />

      <SportMatchList
        sportId={1}
        filter={activeTab}
        sportTitle="Soccer"
        matchesList={soccerMatches}
      />

      <SportMatchList
        sportId={2}
        filter={activeTab}
        sportTitle="Tennis"
        matchesList={tennisMatches}
      />
    </div>
  );
}

export default Inplay;