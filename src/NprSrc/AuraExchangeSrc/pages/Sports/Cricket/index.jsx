import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import SportsMatchesList from "../../../components/SportsMatchesList";
import { subscribeToAuraEventsData } from "../../../../../socketClient";

function CricketMatchesList() {
  useEffect(() => {
    const unsub = subscribeToAuraEventsData({ sportId: 4 });
    return () => unsub?.();
  }, []);

  const rawMatches = useSelector(
    (state) => state.auraMatches?.cricket?.matches?.data
  );

  const cricketMatches = useMemo(() => {
    return Array.isArray(rawMatches)
      ? rawMatches.filter(
          (match) =>
            String(match?.sportId) === "4" &&
            match?.tournamentName !== "BallByBall"
        )
      : [];
  }, [rawMatches]);

  return <SportsMatchesList sportId={4} matchesList={cricketMatches} />;
}

export default CricketMatchesList;
