import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import SportsMatchesList from "../../../components/SportsMatchesList";
import { subscribeToAuraEventsData } from "../../../../../socketClient";

function BasketballMatchesList() {
  useEffect(() => {
    const unsub = subscribeToAuraEventsData({ sportId: 7522 });
    return () => {
      unsub?.();
    };
  }, []);

  const dedicated = useSelector(
    (state) => state?.auraMatches?.basketball?.matches?.data
  );
  const pool = useSelector(
    (state) => state?.auraMatches?.cricket?.matches?.data
  );

  const basketballMatches = useMemo(() => {
    const list =
      Array.isArray(dedicated) && dedicated.length > 0 ? dedicated : pool;
    return Array.isArray(list)
      ? list.filter(
          (match) =>
            String(match?.sportId) === "7522" ||
            String(match?.sportId) === "1002" ||
            /basketball/i.test(match?.sportName || "")
        )
      : [];
  }, [dedicated, pool]);

  return (
    <SportsMatchesList
      sportId={7522}
      sportName="Basketball"
      matchesList={basketballMatches}
    />
  );
}

export default BasketballMatchesList;
