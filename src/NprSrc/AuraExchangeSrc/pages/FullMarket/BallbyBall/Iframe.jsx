import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getVideoResult } from "./videoResultMap";
import BallByBallTimer from "./BallByBallTimer";

const MAX_COUNTDOWN = 20;
const FALLBACK_GIF = "/ballbyball.gif";

export const getBallAsset = (result) => {
  if (!result) return "/balls/ball_2.svg";
  const str = String(result).trim().toUpperCase();

  if (str.includes("WICKET") || str === "W" || str.includes("OUT")) {
    return "/balls/ball_wicket.svg";
  }
  if (str.includes("EXTRA") || str.includes("EX")) {
    return "/balls/ball_extra.svg";
  }

  const match = str.match(/\d+/);
  if (match) {
    const num = match[0];
    if (["0", "1", "2", "3", "4", "6"].includes(num)) {
      return `/balls/ball_${num}.svg`;
    }
    if (num === "5") {
      return "/ball5.png";
    }
  }

  return "/balls/ball_2.svg";
};

const Iframe = ({
  data,
  videoUrl,
  result,
  socketSeconds = 0,
  setSelfSuspend,
  onVideoDuration,
  onVideoTimeUpdate,
  onVideoEnded,
}) => {
  const roundId = data?.roundId || data?.marketId || "default";

  const videoRef = useRef(null);
  const previousRoundRef = useRef(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);
  const [showBallPopup, setShowBallPopup] = useState(false);

  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.min(MAX_COUNTDOWN, Number(socketSeconds) || 0)),
  );

  const lastAcceptedServerTime = useRef(
    Math.max(0, Math.min(MAX_COUNTDOWN, Number(socketSeconds) || 0)),
  );

  const roundResult =
    result ||
    data?.result ||
    data?.win ||
    (videoUrl ? getVideoResult(videoUrl) : null) ||
    data?.selectionName ||
    data?.label ||
    "";

  const ballAsset = useMemo(() => {
    return getBallAsset(roundResult);
  }, [roundResult]);

  // Reset video ended state and duration when round or video URL changes
  useEffect(() => {
    setIsVideoEnded(false);
    setIsVideoReady(false);
    setVideoDuration(null);
    setShowBallPopup(false);
  }, [roundId, videoUrl]);

  const triggerVideoEnd = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch {}
    }
    setIsVideoEnded(true);
    setIsVideoReady(false);
    setShowBallPopup(false);
    onVideoEnded?.();
  }, [onVideoEnded]);

  const isVideoPhase = String(data?.status || "").toUpperCase() === "VIDEO";
  const shouldPlayVideo =
    Boolean(videoUrl) && !isVideoEnded && (timeLeft <= 0 || isVideoPhase);

  // Play video (muted) when shouldPlayVideo becomes true
  useEffect(() => {
    if (!shouldPlayVideo || !videoRef.current) return;

    const vid = videoRef.current;
    vid.muted = true;
    vid.volume = 0;

    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsVideoReady(true);
        })
        .catch(() => {});
    }
  }, [shouldPlayVideo]);

  // High-frequency 60 FPS monitor: detects ball popup 2s before end, and ends video with 0.00s delay
  useEffect(() => {
    if (!shouldPlayVideo || isVideoEnded) return;

    let rafId = null;
    const checkFrame = () => {
      const vid = videoRef.current;
      if (vid) {
        const cur = vid.currentTime;
        const dur = vid.duration || videoDuration;
        if (Number.isFinite(dur) && dur > 0) {
          // Trigger result ball zoom-in-zoom-out 2 seconds before video ends
          if (dur >= 2.0 && cur >= dur - 2.0 && !isVideoEnded) {
            setShowBallPopup(true);
          }
          if (cur >= dur - 0.03 || vid.ended) {
            triggerVideoEnd();
            return;
          }
        }
      }
      rafId = requestAnimationFrame(checkFrame);
    };

    rafId = requestAnimationFrame(checkFrame);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [shouldPlayVideo, isVideoEnded, videoDuration, triggerVideoEnd]);

  // Fallback safety timer: guarantees transition even if video events stall
  useEffect(() => {
    if (
      shouldPlayVideo &&
      !isVideoEnded &&
      videoDuration &&
      videoDuration > 0
    ) {
      const safetyTimer = setTimeout(() => {
        triggerVideoEnd();
      }, videoDuration * 1000);
      return () => clearTimeout(safetyTimer);
    }
  }, [shouldPlayVideo, isVideoEnded, videoDuration, triggerVideoEnd]);

  const animationRef = useRef(null);
  const lastFrameRef = useRef(null);

  /*
   * ROUND CHANGE
   */
  useEffect(() => {
    const serverTime = Math.max(
      0,
      Math.min(MAX_COUNTDOWN, Number(socketSeconds) || 0),
    );

    if (previousRoundRef.current === null) {
      previousRoundRef.current = roundId;
      lastAcceptedServerTime.current = serverTime;
      setTimeLeft(serverTime);
      return;
    }

    if (String(previousRoundRef.current) !== String(roundId)) {
      previousRoundRef.current = roundId;
      lastAcceptedServerTime.current = serverTime;
      setTimeLeft(serverTime);
      lastFrameRef.current = null;
      return;
    }

    if (serverTime < lastAcceptedServerTime.current) {
      lastAcceptedServerTime.current = serverTime;
      setTimeLeft((current) => Math.min(current, serverTime));
    }

    if (serverTime === 0) {
      lastAcceptedServerTime.current = 0;
      setTimeLeft(0);
    }
  }, [roundId, socketSeconds]);

  /*
   * LOCAL COUNTDOWN with 0ms handover to video
   */
  useEffect(() => {
    const tick = (timestamp) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const delta = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      setTimeLeft((current) => {
        if (current <= 0) {
          return 0;
        }

        const next = Math.max(0, current - delta);
        if (next === 0 && current > 0) {
          // Timer finished in this frame! Instantly trigger preloaded video
          if (videoRef.current && !isVideoEnded) {
            const vid = videoRef.current;
            vid.muted = true;
            vid.volume = 0;
            const p = vid.play();
            if (p) {
              p.then(() => setIsVideoReady(true)).catch(() => {});
            }
          }
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastFrameRef.current = null;
    };
  }, [isVideoEnded]);

  /*
   * BET SUSPEND
   */
  useEffect(() => {
    setSelfSuspend?.(timeLeft > 0);
  }, [timeLeft, setSelfSuspend]);

  return (
    <div className="bg-black aspect-video relative w-full h-full overflow-hidden select-none">
      <style>{`
        @keyframes ballZoomPulse {
          0% {
            transform: scale(0.2);
            opacity: 0;
          }
          20% {
            transform: scale(1.35);
            opacity: 1;
          }
          50% {
            transform: scale(0.95);
            opacity: 1;
          }
          75% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        .ball-zoom-pulse {
          animation: ballZoomPulse 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      {/* ====================================================
          GIF (Persistent background layer - zero delay reveal)
      ==================================================== */}
      <img
        src={FALLBACK_GIF}
        alt="Ball By Ball"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* ====================================================
          VIDEO (Preloaded in background, plays instantly at 0s)
      ==================================================== */}
      {Boolean(videoUrl) && !isVideoEnded && (
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          className={`absolute inset-0 w-full h-full object-cover z-10 ${
            shouldPlayVideo && isVideoReady
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          muted
          playsInline
          preload="auto"
          controls={false}
          onLoadedData={() => {
            if (shouldPlayVideo) {
              setIsVideoReady(true);
            }
          }}
          onPlaying={() => {
            setIsVideoReady(true);
          }}
          onLoadedMetadata={(event) => {
            const dur = event.currentTarget.duration;
            if (Number.isFinite(dur) && dur > 0) {
              setVideoDuration(dur);
              onVideoDuration?.(dur);
              const remaining = Math.max(0, Math.ceil(dur));
              onVideoTimeUpdate?.(remaining);
            }
          }}
          onTimeUpdate={(event) => {
            const cur = event.currentTarget.currentTime;
            const dur = event.currentTarget.duration || videoDuration;
            if (Number.isFinite(dur) && dur > 0) {
              const remaining = Math.max(0, Math.ceil(dur - cur));
              onVideoTimeUpdate?.(remaining);
              if (dur >= 2.0 && cur >= dur - 2.0 && !isVideoEnded) {
                setShowBallPopup(true);
              }
              if (cur >= dur - 0.03) {
                triggerVideoEnd();
              }
            }
          }}
          onEnded={() => {
            triggerVideoEnd();
          }}
          onCanPlay={(event) => {
            const vid = event.currentTarget;
            if (shouldPlayVideo) {
              vid.muted = true;
              vid.volume = 0;
              const playPromise = vid.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => setIsVideoReady(true))
                  .catch(() => {});
              }
            } else {
              vid.pause();
              vid.currentTime = 0;
            }
          }}
          onError={() => {
            triggerVideoEnd();
          }}
        />
      )}

      {/* ====================================================
          BALL RESULT POPUP (Zooms in / out 2s before video end)
      ==================================================== */}
      {showBallPopup && ballAsset && shouldPlayVideo && !isVideoEnded && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="ball-zoom-pulse flex items-center justify-center">
            <img
              src={ballAsset}
              alt={roundResult || "Result"}
              className="w-[125px] sm:w-[145px] md:w-[165px] h-auto opacity-100 drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
            />
          </div>
        </div>
      )}

      {/* ====================================================
          COUNTDOWN (Exact Casino Table Timer Style)
      ==================================================== */}
      {timeLeft > 0 && (
        <BallByBallTimer gameTime={timeLeft} totalTime={MAX_COUNTDOWN} />
      )}
    </div>
  );
};

export default Iframe;
