import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import SportsMatchesList from "../../../components/SportsMatchesList";
import { subscribeToAuraEventsData } from "../../../../../socketClient";

function TennisMatchesList() {
  useEffect(() => {
    const unsub = subscribeToAuraEventsData({ sportId: 2 });
    return () => unsub?.();
  }, []);

  const rawMatches = useSelector(
    (state) => state.auraMatches?.tennis?.matches?.data
  );


  const tennisMatches = useMemo(() => {
    return Array.isArray(rawMatches)
      ? rawMatches.filter((match) => String(match?.sportId) === "2")
      : [];
  }, [rawMatches]);

  return <SportsMatchesList sportId={2} matchesList={tennisMatches} />;
}

export default TennisMatchesList;
