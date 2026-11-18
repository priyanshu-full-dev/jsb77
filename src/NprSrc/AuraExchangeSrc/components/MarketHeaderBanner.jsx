import { useState, useEffect } from "react";

const MarketHeaderBanner = ({
  backgroundImage = "/public/aura/horseRacing.jpg",
  gradientFrom = "from-purple-950/60",
  gradientVia = "via-purple-900/0",
  gradientTo = "to-black/0",

  statusText = "SUSPENDED",
  statusColor = "text-white",
  mainText = "Newcastle 27 Oct 21:40",
  mainTextColor = "text-white",
  timeLabel = "Game time",
  dateTime = "",
  locale = "en-GB",
  separator = " ",
  updateInterval = 1000,

  height = "h-[90px]",
  containerClass = "w-full",
  contentPadding = "p-2 md:p-4",
  startedText = "Bet Started",
  isInPlay = false,
  isPreBet = false,
  preBet = false,
}) => {
  // ---- Helper: Parse "Newcastle 27 Oct 21:40"
  const parseMatchInfo = (input) => {
    if (!input) return { matchName: "", dateStr: "" };

    const parts = input.split(" ");
    const matchName = parts[0] || "";
    const dateStr = parts.slice(1).join(" ") || "";

    return { matchName, dateStr };
  };

  const { matchName, dateStr } = parseMatchInfo(mainText);

  // --- Live Time Display ---
  const getFormattedTime = (dateTime) => {
    if (!dateTime) return "";

    const date = new Date(dateTime);

    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const hourStr = String(hour12).padStart(2, "0");

    return `${day}-${month}-${year} ${hourStr}:${minutes}:${seconds} ${ampm}`;
  };

  const [gameTime, setGameTime] = useState(getFormattedTime(dateTime));
  const [countdown, setCountdown] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const updateTimeAndCountdown = () => {
      setGameTime(getFormattedTime(dateTime));

      const hasPreBet = Boolean(isPreBet || preBet);

      if (isInPlay || hasPreBet) {
        setCountdown("");
        setIsStarted(true);
        return;
      }

      if (!dateTime) {
        setCountdown("");
        setIsStarted(false);
        return;
      }

      const targetTime = new Date(dateTime).getTime();

      if (isNaN(targetTime)) {
        setCountdown("");
        setIsStarted(false);
        return;
      }

      const diff = targetTime - Date.now();

      // Game time reached
      if (diff <= 0) {
        setCountdown("");
        setIsStarted(true);
        return;
      }

      // Game not started yet
      setIsStarted(false);

      const totalSec = Math.floor(diff / 1000);

      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      setCountdown(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(
          2,
          "0"
        )}:${String(secs).padStart(2, "0")}`
      );
    };

    updateTimeAndCountdown();

    const interval = setInterval(
      updateTimeAndCountdown,
      updateInterval
    );

    return () => clearInterval(interval);
  }, [dateTime, updateInterval, isInPlay, isPreBet, preBet]);

  // Clean background image path (handles Vite /public prefix cleanly)
  const resolvedBg = backgroundImage?.startsWith("/public/")
    ? backgroundImage.replace("/public", "")
    : backgroundImage || "/aura/horseRacing.jpg";

  // ---- Determine which text to show ----
  const displayText =
    dateTime && gameTime
      ? gameTime
      : mainText
      ? mainText
      : "No Match Info";

  return (
    <div className={containerClass}>
      <style>
        {`
          @keyframes pulse-scale {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.08);
            }
          }
        `}
      </style>

      <div
        className={`relative w-full ${height} overflow-hidden shadow-2xl`}
        style={{
          backgroundImage: `url(${resolvedBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient */}
        <div
          className={`absolute inset-0 bg-[#01010147]`}
        />

        <div
          className={`relative h-full flex flex-col justify-between ${contentPadding}`}
        >
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div
              className={`${statusColor} rounded font-bold text-[12px] md:text-lg tracking-widest shadow-lg`}
              style={{
                textShadow: "#FC0 1px 0 10px",
              }}
            >
              {statusText}
            </div>

            <div
              className="font-bold text-[12px] md:text-base text-right tracking-wide"
              style={{
                textShadow: "#FC0 1px 0 10px",
              }}
            >
              {/* Original UI reference ke anusaar timeLabel white text me dikhaya gaya hai */}
              <span className="text-white">
                {timeLabel}
              </span>{" "}
              <span className="text-white">
                {displayText}
              </span>
            </div>
          </div>

          {/* Center Section: Bet Started (Image 2) or live Count Down */}
          <div className="flex flex-col items-center justify-center mt-1">
            {isStarted ? (
              // Game started
              <h1
                className="text-[#b6f932] text-[14px] md:text-lg font-bold tracking-wide animate-[pulse-scale_1.5s_ease-in-out_infinite]"
                style={{
                  textShadow: "#FC0 1px 0 10px",
                }}
              >
                {startedText}
              </h1>
            ) : countdown ? (
              // Countdown running
              <div className="flex flex-col items-center text-center">
                <span className="text-white text-[11px] md:text-[13px] font-bold tracking-wider drop-shadow-sm">
                  Count Down
                </span>

                <span
                  className="text-[#b6f932] text-[12px] font-extrabold tracking-widest font-mono tracking-wide animate-[pulse-scale_0.8s_ease-in-out_infinite]"
                  style={{
                    textShadow:
                      "0 0 6px rgba(182, 249, 50, 0.7)",
                  }}
                >
                  {countdown}
                </span>
              </div>
            ) : (
              // No valid dateTime or open
              <h1
                className="text-[#b6f932] text-[14px] md:text-lg font-bold tracking-wide animate-[pulse-scale_1.5s_ease-in-out_infinite]"
                style={{
                  textShadow: "#FC0 1px 0 10px",
                }}
              >
                {startedText}
              </h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeaderBanner;