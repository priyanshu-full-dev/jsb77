import React from "react";

/**
 * Dedicated Countdown Timer for Ball by Ball, replicating the Diamond Casino
 * table timer style without touching any original casino components.
 */
const BallByBallTimer = ({ gameTime = 0, totalTime = 20 }) => {
  const numericTime = Math.ceil(Math.max(0, Number(gameTime) || 0));
  if (numericTime <= 0) return null;

  const isDanger = numericTime <= 5;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  const maxDuration = totalTime > 0 ? totalTime : 20;
  const progress = Math.min(1, Math.max(0, numericTime / maxDuration));
  const offset = circumference * progress;

  return (
    <div
      style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        background: "#000",
        zIndex: 25,
      }}
    >
      <svg
        width="52"
        height="52"
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="#222"
          strokeWidth="5"
        />

        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke={isDanger ? "#ff0000" : "green"}
          strokeWidth="5"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 26 26)"
          style={{
            transition: "stroke-dashoffset 1s linear",
          }}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: isDanger ? "#ff0000" : "#fff",
          fontWeight: "bold",
          fontSize: "18px",
          animation: isDanger ? "bbbTimerPulse 0.5s infinite alternate" : "none",
        }}
      >
        {numericTime}
      </div>

      <style>
        {`
          @keyframes bbbTimerPulse {
            from { transform: scale(1); }
            to { transform: scale(1.25); }
          }
        `}
      </style>
    </div>
  );
};

export default BallByBallTimer;
