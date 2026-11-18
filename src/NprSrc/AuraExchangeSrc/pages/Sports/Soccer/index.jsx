import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import SportsMatchesList from "../../../components/SportsMatchesList";
import { subscribeToAuraEventsData } from "../../../../../socketClient";

function SoccerMatchesList() {
  useEffect(() => {
    const unsub = subscribeToAuraEventsData({ sportId: 1 });
    return () => unsub?.();
  }, []);

  const rawMatches = useSelector(
    (state) => state.auraMatches?.soccer?.matches?.data
  );

  const soccerMatches = useMemo(() => {
    return Array.isArray(rawMatches)
      ? rawMatches.filter((match) => String(match?.sportId) === "1")
      : [];
  }, [rawMatches]);

  return <SportsMatchesList sportId={1} matchesList={soccerMatches} />;
}

export default SoccerMatchesList;
