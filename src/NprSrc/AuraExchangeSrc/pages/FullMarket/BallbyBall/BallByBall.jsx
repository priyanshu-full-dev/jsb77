import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TvIframe from "./Iframe";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { subscribeToBallByBall } from "../../../../../socketClient";
import Card from "./Card";
import { IoInformationCircleSharp } from "react-icons/io5";
import BallbyBallRes from "../../../../../CommonComponents/DiamondCasino/Result/BallbyBallRes";
import { getVideoResult } from "./videoResultMap";

const DEFAULT_GAME_ID = "4.3544687543453";
const TV_DOMAIN = "https://aura444.com/api/users";

/**
 * Adapt Redis Ball-by-Ball socket rounds to the existing result modal/card UI.
 * A completed result is only expected after the server emits the RESULT event.
 */
const toUiRound = (round) => {
  if (!round) return null;

  const resultText =
    round.result ??
    round.win ??
    round.nat ??
    round.selectionName ??
    round.label ??
    "";

  return {
    ...round,
    win: resultText,
    result: resultText,
    streamUrl: round.streamUrl || round.videoUrl || "",
    roundId:
      round.roundId ||
      round.marketId ||
      round.sourceRoundId ||
      round.roundKey ||
      "",
    marketId:
      round.marketId ||
      round.roundId ||
      round.sourceRoundId ||
      round.roundKey ||
      "",
  };
};

const mergeHistory = (previous = [], incoming = []) => {
  const byId = new Map();

  [...incoming, ...previous].forEach((item) => {
    const normalized = toUiRound(item);
    const id =
      normalized?.roundId ||
      normalized?.roundKey ||
      normalized?.marketId ||
      normalized?.sourceRoundId;
    if (id && normalized?.result && !byId.has(String(id))) {
      byId.set(String(id), normalized);
    }
  });

  return [...byId.values()]
    .sort((a, b) => Number(b.sequence || 0) - Number(a.sequence || 0))
    .slice(0, 20);
};

export const DEFAULT_BALLBYBALL_RUNNERS = [
  { selectionId: "1", label: "0 RUNS", selectionName: "0 RUNS", backPrice: 1.98, backSize: 100000, status: "ACTIVE" },
  { selectionId: "2", label: "1 RUNS", selectionName: "1 RUNS", backPrice: 1.98, backSize: 100000, status: "ACTIVE" },
  { selectionId: "3", label: "2 RUNS", selectionName: "2 RUNS", backPrice: 1.98, backSize: 100000, status: "ACTIVE" },
  { selectionId: "4", label: "3 RUNS", selectionName: "3 RUNS", backPrice: 1.98, backSize: 100000, status: "ACTIVE" },
  { selectionId: "5", label: "4 RUNS", selectionName: "4 RUNS", backPrice: 1.98, backSize: 100000, status: "ACTIVE" },
  { selectionId: "6", label: "6 RUNS", selectionName: "6 RUNS", backPrice: 1.98, backSize: 100000, status: "ACTIVE" },
  { selectionId: "7", label: "WICKET", selectionName: "WICKET", backPrice: 1.98, backSize: 100000, status: "ACTIVE" },
  { selectionId: "8", label: "EXTRA RUNS", selectionName: "EXTRA RUNS", backPrice: 1.98, backSize: 100000, status: "ACTIVE" },
];

let moduleCachedRound = null;
let moduleCachedHistory = [];

const BallByBall = () => {
  const { gameId } = useParams();
  const activeGameId = gameId || DEFAULT_GAME_ID;

  const [showInfo, setShowInfo] = useState(false);
  const [selfSuspend, setSelfSuspend] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showTeen20, setShowTeen20] = useState(false);

  // Ball-by-Ball round lifecycle data: instant loading from cache/defaults in 0.0s
  const [cronRound, setCronRound] = useState(() => {
    if (moduleCachedRound) return moduleCachedRound;
    try {
      const saved = localStorage.getItem("bbb_last_round");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return toUiRound(parsed);
      }
    } catch {}
    return {
      roundId: "",
      status: "OPEN",
      runners: DEFAULT_BALLBYBALL_RUNNERS,
    };
  });

  const [cronHistory, setCronHistory] = useState(() => {
    if (moduleCachedHistory && moduleCachedHistory.length > 0) return moduleCachedHistory;
    try {
      const saved = localStorage.getItem("bbb_last_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [cronServerOffsetMs, setCronServerOffsetMs] = useState(0);
  const [cronClockNow, setCronClockNow] = useState(Date.now());
  const [socketError, setSocketError] = useState("");

  const [videoTimeLeft, setVideoTimeLeft] = useState(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const lastVideoRoundRef = useRef(null);

  const currentRoundKey =
    cronRound?.sourceRoundId ||
    cronRound?.roundKey ||
    cronRound?.marketId ||
    "";

  useEffect(() => {
    if (
      String(cronRound?.status || "").toUpperCase() !== "VIDEO" ||
      lastVideoRoundRef.current !== currentRoundKey
    ) {
      lastVideoRoundRef.current = currentRoundKey;
      setIsVideoEnded(false);
      setVideoTimeLeft(null);
    }
  }, [cronRound?.status, currentRoundKey]);

  // Redux fallback supports legacy rounds only; current round runners arrive over Ball-by-Ball socket.
  const { odds } = useSelector((state) => state.diamondCasinoOdds || {});

  const rootData = useMemo(
    () =>
      odds?.diamondCasinoOdds?.data ||
      odds?.diamondCasinoOdds ||
      odds?.data ||
      odds ||
      {},
    [odds],
  );

  // Instant zero-latency runners: always populated from frame 0
  const runners = useMemo(() => {
    if (Array.isArray(cronRound?.runners) && cronRound.runners.length > 0) {
      return cronRound.runners;
    }
    if (Array.isArray(rootData?.runners) && rootData.runners.length > 0) {
      return rootData.runners;
    }
    return DEFAULT_BALLBYBALL_RUNNERS;
  }, [cronRound?.runners, rootData?.runners]);

  const isSuspended =
    runners.length === 0 ||
    runners.every(
      (runner) => String(runner?.status || "").toUpperCase() === "SUSPEND",
    );

  /** Subscribe to the new Redis-backed Ball-by-Ball socket only. */
  useEffect(() => {
    const unsubscribe = subscribeToBallByBall({
      onState: (payload) => {
        const emittedAt = Number(payload?.emittedAt);
        if (Number.isFinite(emittedAt) && emittedAt > 0) {
          setCronServerOffsetMs(emittedAt - Date.now());
        }

        if (payload?.round) {
          const uiR = toUiRound(payload.round);
          moduleCachedRound = uiR;
          try {
            localStorage.setItem("bbb_last_round", JSON.stringify(payload.round));
          } catch {}
          setCronRound(uiR);
        }

        setCronHistory((previous) => {
          const merged = mergeHistory(
            previous,
            Array.isArray(payload?.history) ? payload.history : [],
          );
          moduleCachedHistory = merged;
          try {
            localStorage.setItem("bbb_last_history", JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setSocketError("");
      },
      onUpdate: (payload) => {
        const round = payload?.round;
        const emittedAt = Number(payload?.emittedAt);

        if (Number.isFinite(emittedAt) && emittedAt > 0) {
          setCronServerOffsetMs(emittedAt - Date.now());
        }

        if (round) {
          const uiR = toUiRound(round);
          moduleCachedRound = uiR;
          try {
            localStorage.setItem("bbb_last_round", JSON.stringify(round));
          } catch {}
          setCronRound(uiR);

          // The cron publishes RESULT and then immediately OPENs the next round.
          // Preserve the completed result in history before that next OPEN arrives.
          if (
            String(payload?.type || "").toUpperCase() === "RESULT" ||
            round.result
          ) {
            setCronHistory((previous) => {
              const merged = mergeHistory(previous, [round]);
              moduleCachedHistory = merged;
              try {
                localStorage.setItem("bbb_last_history", JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }

        setSocketError("");
      },
      onError: (error) => {
        setSocketError(error?.message || "Ball-by-Ball socket error");
        console.error("[ballbyball socket]", error?.message || error);
      },
    });

    const clockId = window.setInterval(() => {
      setCronClockNow(Date.now());
    }, 250);

    return () => {
      unsubscribe?.();
      window.clearInterval(clockId);
    };
  }, []);

  const cronPhaseEndAt = useMemo(() => {
    const status = String(cronRound?.status || "").toUpperCase();
    if (status === "OPEN") return Number(cronRound?.bettingClosesAt || 0);
    if (status === "VIDEO") return Number(cronRound?.videoEndsAt || 0);
    return 0;
  }, [cronRound?.status, cronRound?.bettingClosesAt, cronRound?.videoEndsAt]);

  const cronRemainingSeconds = cronPhaseEndAt
    ? Math.max(
        0,
        Math.ceil(
          (cronPhaseEndAt - (cronClockNow + cronServerOffsetMs)) / 1000,
        ),
      )
    : 0;

  const isBettingOpen =
    String(cronRound?.status || "").toUpperCase() === "OPEN";

  const videoUrl = useMemo(() => {
    const raw = cronRound?.videoUrl || cronRound?.streamUrl;
    if (typeof raw !== "string" || !raw.trim()) return null;

    const url = raw.trim();
    if (url.includes("{$domain}")) return url.replace("{$domain}", TV_DOMAIN);
    if (/^https?:\/\//i.test(url)) return url;
    return `${TV_DOMAIN}${url.startsWith("/") ? "" : "/"}${url}`;
  }, [cronRound?.videoUrl, cronRound?.streamUrl]);

  const recentResults = useMemo(() => cronHistory, [cronHistory]);

  const getGradient = useCallback((label) => {
    const value = String(label || "").toLowerCase();

    if (value.includes("wicket") || value === "w") {
      return "linear-gradient(to bottom, #d84848, #ff7a7a, #d84848)";
    }
    if (value.includes("4")) {
      return "linear-gradient(to bottom, #3fb36b, #6bdc95, #3fb36b)";
    }
    if (value.includes("6")) {
      return "linear-gradient(to bottom, #8b97ff, #a8bdff, #7173fc)";
    }
    return "linear-gradient(to bottom, #c9bf34, #f7eb4c, #c9bf34)";
  }, []);

  const formatResultLabel = useCallback((label) => {
    if (!label) return "";
    const text = String(label).trim();
    const upper = text.toUpperCase();

    if (upper.includes("WICKET")) return "W";
    if (upper.includes("EXTRA")) return "Ex";

    const number = upper.match(/\d+/);
    return number ? number[0] : text;
  }, []);

  // Fixed TV height keeps the content underneath from jumping.
  const fixedTvRef = useRef(null);
  const [tvHeight, setTvHeight] = useState(0);

  useEffect(() => {
    const element = fixedTvRef.current;
    if (!element) return undefined;

    const updateHeight = () => setTvHeight(element.offsetHeight || 0);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const currentRoundLabel =
    cronRound?.sourceRoundId ||
    cronRound?.roundKey ||
    rootData?.roundId ||
    rootData?.marketId ||
    "--";

  const cardRoundStatus =
    cronRound && !isBettingOpen ? "MARKET_SUSPENDED" : rootData?.roundStatus;

  const currentVideoResult = useMemo(() => {
    // 1. Direct result from current round if provided
    if (cronRound?.result && String(cronRound.result).trim()) {
      return String(cronRound.result).trim();
    }
    if (cronRound?.win && String(cronRound.win).trim()) {
      return String(cronRound.win).trim();
    }
    // 2. Exact mapped result from the active video clip
    if (videoUrl) {
      const fromVideo = getVideoResult(videoUrl);
      if (fromVideo) return fromVideo;
    }
    // 3. Fallback to rootData if present
    if (rootData?.result && String(rootData.result).trim()) {
      return String(rootData.result).trim();
    }
    return "";
  }, [cronRound?.result, cronRound?.win, videoUrl, rootData?.result]);

  const handleVideoEnded = useCallback(() => {
    setIsVideoEnded(true);
    setVideoTimeLeft(0);
  }, []);

  return (
    <div className="w-full">
      {/* Fixed TV */}
      <div
        ref={fixedTvRef}
        className="fixed top-[60px] left-0 right-0 z-20 bg-white"
        style={{ overflow: "hidden" }}
        onScroll={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.preventDefault()}
      >
        {/* Header */}
        <div
          className="w-full flex items-center justify-between px-2 py-1.5"
          style={{
            background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
          }}
        >
          <span className="text-white text-[15px] font-bold tracking-wide">
            BALL BY BALL
          </span>
          <span className="text-white text-[12px] font-bold">
            {currentRoundLabel}
          </span>
        </div>


        <TvIframe
          gameId={activeGameId}
          data={cronRound || rootData}
          result={currentVideoResult}
          videoUrl={videoUrl}
          socketSeconds={cronRemainingSeconds}
          setSelfSuspend={setSelfSuspend}
          onVideoTimeUpdate={(remainingSecs) => {
            setVideoTimeLeft(remainingSecs);
          }}
          onVideoEnded={handleVideoEnded}
        />
      </div>

      {/* Spacer for fixed TV */}
      <div style={{ paddingTop: `${tvHeight}px` }}>
        {/* Sub header */}
        <div
          className="w-full flex items-center justify-between px-2 py-[2px]"
          style={{
            background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
          }}
        >
          <span className="text-white text-[13px] font-bold tracking-wide">
            Runs
          </span>

          <div className="relative flex items-center gap-2">
            <IoInformationCircleSharp
              size={16}
              className="cursor-pointer text-white"
              onClick={() => setShowInfo((previous) => !previous)}
            />
            {showInfo && (
              <div
                onClick={() => setShowInfo((previous) => !previous)}
                className="absolute -bottom-1 right-0 z-50"
              >
                <div className="bg-black text-white px-3 py-1 rounded text-[12px] shadow-lg whitespace-nowrap">
                  Min/Max: {rootData?.min ?? 100} – {rootData?.max ?? 100000}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Runner selections and prices come directly from the Ball-by-Ball socket payload. */}
        <Card
          gameId={activeGameId}
          runners={runners}
          marketId={
            cronRound?.sourceRoundId ||
            cronRound?.roundKey ||
            rootData?.marketId ||
            rootData?.roundId
          }
          currentRoundId={cronRound?.sourceRoundId}
          currentRoundKey={cronRound?.roundKey}
          min={rootData?.min ?? 100}
          max={rootData?.max ?? 100000}
          roundStatus={cardRoundStatus}
          selfSuspend={isSuspended || !cronRound || !isBettingOpen}
        />

        {/* News */}
        <div
          className="bg-[#c2d5e4] h-[24px]"
          style={{ boxShadow: "inset 0 2px #0000001a" }}
        >
          <marquee
            direction="left"
            scrollamount="5"
            className="text-[14px] mt-[1px] font-bold text-[#3b5160]"
          >
            {rootData?.news ||
              "Results are based on stream only. Score board may be different or updated later"}
          </marquee>
        </div>

        {/* Recent results received from Ball-by-Ball socket history */}
        {recentResults.length > 0 && (
          <div className="bg-black px-2 flex justify-start items-center overflow-x-scroll max-w-[100vw] mt-2 py-1.5 overflow-y-hidden">
            <p
              className="text-white font-bold text-[0.9rem] mr-2"
              style={{ textWrap: "nowrap" }}
            >
              Recent Result
            </p>

            <div className="flex gap-2 grow">
              {recentResults.map((item, index) => {
                const fullLabel =
                  item?.result ||
                  item?.win ||
                  item?.nat ||
                  item?.selectionName ||
                  item?.label ||
                  "";

                return (
                  <button
                    key={`${item?.roundKey || item?.marketId || fullLabel}-${index}`}
                    title={fullLabel}
                    style={{ background: getGradient(fullLabel) }}
                    onClick={() => {
                      setSelectedResult(toUiRound(item));
                      setShowTeen20(true);
                    }}
                    className="min-w-[36px] h-8 px-2 text-[13px] rounded-full text-black font-bold grid place-items-center shadow shrink-0"
                  >
                    {formatResultLabel(fullLabel)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {socketError && (
          <div className="px-2 py-1 text-xs text-red-600" role="status">
            Ball-by-Ball socket: {socketError}
          </div>
        )}
      </div>

      <BallbyBallRes
        isOpen={showTeen20}
        onClose={() => setShowTeen20(false)}
        result={selectedResult}
        gameId={activeGameId}
        gameName="Ball By Ball"
      />
    </div>
  );
};

export default BallByBall;
