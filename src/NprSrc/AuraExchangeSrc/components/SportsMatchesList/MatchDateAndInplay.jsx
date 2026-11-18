import "./aura-inplay.css";


function MatchDateAndInplay({
  preBet,
  inplay = false,
  openDate,
  compactDesign = false,
  flexCol = false,
}) {
  if (!openDate) return null;

  const matchDate = new Date(openDate);
  if (isNaN(matchDate.getTime())) return null;

  // Timer will start only from 14-07-2026 15:30
  const timerStart = new Date(2026, 6, 14, 15, 30); // Month is 0-based

  const showTimer = matchDate.getTime() >= timerStart.getTime();

  const formattedDate = `${String(matchDate.getDate()).padStart(
    2,
    "0",
  )}-${String(matchDate.getMonth() + 1).padStart(
    2,
    "0",
  )}-${matchDate.getFullYear()} ${String(matchDate.getHours()).padStart(
    2,
    "0",
  )}:${String(matchDate.getMinutes()).padStart(2, "0")}`;

  if (inplay) {
    return <span className="aura-inplay pl-2">In-play</span>;
  }

  return (
    <span className="text-[12px] text-[#777777] dark:text-gray-300 whitespace-nowrap font-normal ml-1.5 align-baseline">
      {formattedDate}
    </span>
  );
}

export default MatchDateAndInplay;
