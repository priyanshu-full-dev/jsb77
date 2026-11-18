import { useState, useMemo, useEffect, useRef } from "react";

import { IoMdTv } from "react-icons/io";

import { useSelector } from "react-redux";

import { useSearchParams } from "react-router-dom";

import MarketHeaderBanner from "../../../components/MarketHeaderBanner";

import { FaLock } from "react-icons/fa";

import axios from "axios";
import API from "../../../../../api/axios";
import CricketScoreBoard from "./ScoreBoards/CricketScoreBoard";
import SoccerScoreBoard from "./ScoreBoards/SoccerScoreBoard";
import TennisScoreBoard from "./ScoreBoards/TennisScoreBoard";

const EMPTY_MATCHES_ARRAY = [];

export const sportsMapping = {
  4: "Cricket",

  1: "Soccer",

  2: "Tennis",

  7522: "Basketball",

  1002: "Basketball",
};

const sportsImageMapping = {
  4: "/aura/cricket.jpg",

  1: "/aura/soccer.jpg",

  2: "/aura/tennis.jpg",

  7522: "/aura/basketball.jpg",

  1002: "/aura/basketball.jpg",
};

// Scoreboard Component
const LiveScoreBoard = ({ scoreData, sportId, eventName, eventId }) => {
  if (String(sportId) === "1") {
    return (
      <SoccerScoreBoard
        scoreData={scoreData}
        eventName={eventName}
        eventId={eventId}
      />
    );
  }
  if (String(sportId) === "2") {
    return (
      <TennisScoreBoard
        scoreData={scoreData}
        eventName={eventName}
        eventId={eventId}
      />
    );
  }
  return (
    <CricketScoreBoard
      scoreData={scoreData}
      eventName={eventName}
      eventId={eventId}
    />
  );
};

// Main MatchDetailsBanner Component

function MatchDetailsBanner({
  sportId,

  eventId,

  eventName,

  openDate,

  inPlay: propInPlay,

  statusText,

  preBet: propPreBet,

  onScoreDataChange,
}) {
  const [liveTv, setLiveTv] = useState(false);
  const [tvMatchId, setTvMatchId] = useState(null);

  const [activeTab, setActiveTab] = useState("score");

  const [scoreData, setScoreData] = useState(null);

  const [scoreLoading, setScoreLoading] = useState(false);

  const [scoreError, setScoreError] = useState("");

  // Share the same live scoreboard payload with the Fancy UI.
  useEffect(() => {
    onScoreDataChange?.(scoreData);
  }, [scoreData, onScoreDataChange]);

  // Clear old score data when the event, sport, or scoreboard tab changes.
  useEffect(() => {
    setScoreData(null);
    setScoreError("");
  }, [sportId, eventId, liveTv, activeTab]);

  const [searchParams] = useSearchParams();

  const usertype = useSelector((state) => state.account.accountType);

  const abortControllerRef = useRef(null);

  const isAuthenticated = useSelector((state) => state.user.isLoggedIn);

  const sportMap = useMemo(
    () => ({
      4: "cricket",

      1: "soccer",

      2: "tennis",

      7: "horse",

      4339: "greyhound",

      8: "kabaddi",

      7522: "basketball",

      1002: "basketball",
    }),

    [],
  );

  const sportKey = sportMap[String(sportId)] || "cricket";


  // Fetch the provider match list for this sport and use only its `id` for TV.
  useEffect(() => {
    if (!sportId || !eventId) {
      setTvMatchId(null);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const fetchTvMatchId = async () => {
      // try {
      //   const url = new URL("https://apiv2.9tens.live:5010/v1/spb/get-match-list");
      //   url.searchParams.set("game_type", String(sportId));
      //   url.searchParams.set("version", "v3");

      //   const response = await fetch(url.toString(), {
      //     method: "GET",
      //     signal: controller.signal,
      //   });

      //   if (!response.ok) {
      //     throw new Error(`TV match-list request failed: ${response.status}`);
      //   }

      //   const body = await response.json();
      //   const matches = Array.isArray(body?.data?.matches)
      //     ? body.data.matches
      //     : [];

      //   const currentEventId = String(eventId);
      //   const currentEventName = String(eventName || "").trim().toLowerCase();

      //   const matched = matches.find((match) => {
      //     const providerId = String(match?.id ?? "");
      //     const providerEventId = String(match?.eventId ?? "");
      //     const providerName = String(match?.name || "").trim().toLowerCase();

      //     return (
      //       providerId === currentEventId ||
      //       providerEventId === currentEventId ||
      //       (currentEventName && providerName === currentEventName)
      //     );
      //   });

      //   if (active) {
      //     setTvMatchId(matched?.id != null ? String(matched.id) : null);
      //   }
      // } catch (error) {
      //   if (error?.name !== "AbortError" && active) {
      //     console.error("TV match-list fetch failed:", error);
      //     setTvMatchId(null);
      //   }
      // }
    };

    fetchTvMatchId();

    return () => {
      active = false;
      controller.abort();
    };
  }, [sportId, eventId, eventName]);



  const auraMatchesList = useSelector((state) => {
    const list = state?.auraMatches?.[sportKey]?.matches?.data;
    return Array.isArray(list) ? list : EMPTY_MATCHES_ARRAY;
  });

  const isInPlay = useMemo(() => {
    if (typeof propInPlay === "boolean") return propInPlay;

    if (
      searchParams.get("inplay") === "true" ||
      searchParams.get("inPlay") === "true"
    )
      return true;

    const match = auraMatchesList.find(
      (m) =>
        String(m?.eventId) === String(eventId) ||
        String(m?.exEventId) === String(eventId) ||
        String(m?._id) === String(eventId),
    );

    return (
      match?.inPlay === true || match?.inplay === true || match?.iplay === true
    );
  }, [propInPlay, searchParams, auraMatchesList, eventId]);

  const isPreBet = useMemo(() => {
    if (typeof propPreBet === "boolean") return propPreBet;
    if (propPreBet === "true" || propPreBet === 1) return true;

    if (
      searchParams.get("preBet") === "true" ||
      searchParams.get("preBet") === "1" ||
      searchParams.get("prebet") === "true"
    ) {
      return true;
    }

    const match = auraMatchesList.find(
      (m) =>
        String(m?.eventId) === String(eventId) ||
        String(m?.exEventId) === String(eventId) ||
        String(m?._id) === String(eventId),
    );

    return (
      match?.preBet === true ||
      match?.preBet === 1 ||
      match?.preBet === "true" ||
      match?.isPreBet === true ||
      match?.isPreBet === 1 ||
      match?.isPreBet === "true"
    );
  }, [propPreBet, searchParams, auraMatchesList, eventId]);

  // Scoreboard API Polling

  useEffect(() => {
    // Cricket scoreboard stays fresh while the market page is open so Fancy UI
    // can use the same score payload. Soccer and Tennis fetch scores when the
    // user opens TV and selects the Live Score tab.
    const isCricket = String(sportId) === "4";
    const isSoccerOrTennis = String(sportId) === "1" || String(sportId) === "2";

    if (
      !eventId ||
      (!isCricket && (!isSoccerOrTennis || !liveTv || activeTab !== "score"))
    ) {
      return;
    }

    let mounted = true;

    let intervalId = null;

    const stopPolling = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);

        intervalId = null;
      }
    };

    const isCancelledRequest = (error) =>
      error?.name === "AbortError" ||
      error?.name === "CanceledError" ||
      error?.code === "ERR_CANCELED";

    const hasScoreShape = (value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
      }

      return [
        "sportId",
        "exEventId",
        "available",
        "innings",
        "teams",
        "battingTeam",
        "liveDoc",
        "slider",
        "score",
        "statusCommentry",
        "statusCommentary",
        "goals",
        "homeTeam",
        "awayTeam",
        "home",
        "away",
        "team1Name",
        "team2Name",
        "matchTime",
        "minute",
        "format",
      ].some((key) => value[key] !== undefined);
    };

    const getResponseLayers = (body) => {
      const layers = [];

      let current = body;

      // Handle nested API response envelopes without unwrapping

      // the actual scoreboard payload.

      for (let depth = 0; depth < 5; depth += 1) {
        if (!current || typeof current !== "object" || Array.isArray(current)) {
          break;
        }

        layers.push(current);

        const next = current.data;

        if (
          !next ||
          typeof next !== "object" ||
          Array.isArray(next) ||
          next === current
        ) {
          break;
        }

        current = next;
      }

      return layers;
    };

    const normalizeScorePayload = (payload) => {
      if (!payload || typeof payload !== "object") {
        return null;
      }

      // Keep the existing Universe/provider slider response unchanged.
      const existingSliderScore =
        payload?.liveDoc?.slider?.[0]?.score ||
        payload?.slider?.[0]?.score ||
        payload?.data?.liveDoc?.slider?.[0]?.score ||
        payload?.data?.slider?.[0]?.score;

      if (existingSliderScore) {
        return payload;
      }

      // Check for stream.chimneysolutions.info API format
      const rawData =
        payload?.data &&
          typeof payload.data === "object" &&
          !Array.isArray(payload.data) &&
          (payload.data.teams ||
            payload.data.statusCommentry ||
            payload.data.statusCommentary ||
            payload.data.homeTeam ||
            payload.data.awayTeam ||
            payload.data.home ||
            payload.data.away ||
            payload.data.score ||
            payload.data.goals ||
            payload.data.team1Name ||
            payload.data.team2Name)
          ? payload.data
          : payload;

      let rawTeams = Array.isArray(rawData?.teams) ? [...rawData.teams] : [];

      const rawFormat = String(rawData?.format || payload?.format || "").toLowerCase().trim();
      const isSoccer =
        String(sportId) === "1" ||
        String(payload?.sportId) === "1" ||
        String(rawData?.sportId) === "1" ||
        rawFormat === "soccer" ||
        rawFormat === "football";

      const isTestMatch = Boolean(
        rawData?.isTestMatch ||
        payload?.isTestMatch ||
        rawFormat === "test" ||
        rawFormat === "first class" ||
        rawFormat === "4 day" ||
        rawFormat === "5 day"
      );

      // If soccer (or match with missing teams) but we have event name or home/away objects, construct teams
      if (
        rawTeams.length === 0 &&
        (isSoccer ||
          rawData?.homeTeam ||
          rawData?.awayTeam ||
          rawData?.home ||
          rawData?.away ||
          rawData?.team1Name ||
          rawData?.team2Name ||
          eventName)
      ) {
        let t1Name =
          rawData?.team1Name ||
          rawData?.homeTeam?.name ||
          rawData?.home?.name ||
          "";
        let t2Name =
          rawData?.team2Name ||
          rawData?.awayTeam?.name ||
          rawData?.away?.name ||
          "";
        if (
          (!t1Name || !t2Name) &&
          eventName &&
          /\s+(?:v|vs|v\.|vs\.|\/|-)\s+/i.test(eventName)
        ) {
          const parts = eventName.split(/\s+(?:v|vs|v\.|vs\.|\/|-)\s+/i);
          if (parts[0]) t1Name = parts[0].trim();
          if (parts[1]) t2Name = parts[1].trim();
        }
        if (t1Name || t2Name) {
          rawTeams = [
            {
              name: t1Name || "Team 1",
              score:
                rawData?.homeScore ??
                rawData?.score?.home ??
                rawData?.goals?.home ??
                rawData?.scoreHome ??
                0,
              htscore:
                rawData?.homeHT ??
                rawData?.ht?.home ??
                rawData?.htHome ??
                0,
              corners:
                rawData?.homeCorners ??
                rawData?.corners?.home ??
                0,
              yellowCard:
                rawData?.homeYellow ??
                rawData?.yellow?.home ??
                0,
              redCard:
                rawData?.homeRed ??
                rawData?.red?.home ??
                0,
            },
            {
              name: t2Name || "Team 2",
              score:
                rawData?.awayScore ??
                rawData?.score?.away ??
                rawData?.goals?.away ??
                rawData?.scoreAway ??
                0,
              htscore:
                rawData?.awayHT ??
                rawData?.ht?.away ??
                rawData?.htAway ??
                0,
              corners:
                rawData?.awayCorners ??
                rawData?.corners?.away ??
                0,
              yellowCard:
                rawData?.awayYellow ??
                rawData?.yellow?.away ??
                0,
              redCard:
                rawData?.awayRed ??
                rawData?.red?.away ??
                0,
            },
          ];
        }
      }

      if (
        rawTeams.length > 0 ||
        isSoccer ||
        rawData?.statusCommentry !== undefined ||
        rawData?.statusCommentary !== undefined ||
        rawData?.commentary !== undefined
      ) {
        const format = rawFormat || (isSoccer ? "soccer" : isTestMatch ? "test" : "");

        const isODI =
          /odi|one.?day|50\s*over|world\s*cup|list.?a|trophy/i.test(format + " " + (eventName || "")) ||
          format === "odi" ||
          format === "50" ||
          format === "oneday" ||
          format === "one-day" ||
          format === "one day";

        const isT10 =
          /t10|10\s*over|ten10/i.test(format + " " + (eventName || "")) ||
          format === "t10" ||
          format === "10";

        const isT20 =
          !isODI &&
          (/t20|twenty20|20\s*over|wbbl|bbl|ipl|psl|cpl|wpl|hundred|blast|smash|premier\s*league/i.test(format + " " + (eventName || "")) ||
            format === "t20" ||
            format === "20");

        let maxObs = 0;
        let denomOvers = "";
        rawTeams.forEach((t) => {
          const rawOv = String(t?.overs ?? t?.ovs ?? t?.ov ?? t?.o ?? "").trim();
          if (rawOv.includes("/")) {
            const parts = rawOv.split("/");
            const n = parseFloat(parts[0]);
            if (!isNaN(n) && n > maxObs) maxObs = n;
            if (parts[1] && parts[1] !== "0") denomOvers = parts[1].trim();
          } else {
            const n = parseFloat(rawOv);
            if (!isNaN(n) && n > maxObs) maxObs = n;
          }
        });

        const apiExplicitOvers =
          rawData?.maxOvers ??
          rawData?.totalOvers ??
          rawData?.oversLimit ??
          rawData?.info?.maxOvers ??
          rawData?.info?.totalOvers ??
          payload?.maxOvers ??
          payload?.totalOvers;

        let maxOvers = "";
        if (isTestMatch) {
          maxOvers = "";
        } else if (denomOvers) {
          maxOvers = denomOvers;
        } else if (
          apiExplicitOvers !== undefined &&
          apiExplicitOvers !== null &&
          String(apiExplicitOvers).trim() !== "" &&
          String(apiExplicitOvers).trim() !== "0"
        ) {
          const strExplicit = String(apiExplicitOvers).trim();
          if (maxObs > 20 && parseFloat(strExplicit) <= 20) {
            maxOvers = "50";
          } else {
            maxOvers = strExplicit;
          }
        } else if (isODI || (maxObs > 20 && maxObs <= 50)) {
          maxOvers = "50";
        } else if (isT20 && maxObs <= 20) {
          maxOvers = "20";
        } else if (isT10 && maxObs <= 10) {
          maxOvers = "10";
        } else if (maxObs > 20) {
          maxOvers = "50";
        } else if (maxObs > 10 && maxObs <= 20) {
          maxOvers = "20";
        }

        let battingTeamName = "";
        let battingBatsman = "";
        let currentBowler = String(rawData?.currentBowler || rawData?.bowler || "").trim();

        rawTeams.forEach((team) => {
          if (team?.isBatting) {
            battingTeamName = team?.name || team?.teamName || "";
            if (team?.batsman) battingBatsman = String(team.batsman).trim();
          } else {
            if (team?.bowler && !currentBowler) {
              currentBowler = String(team.bowler).trim();
            }
          }
        });

        const teamNames = [
          rawData?.team1Name || rawTeams[0]?.name || rawTeams[0]?.teamName || "",
          rawData?.team2Name || rawTeams[1]?.name || rawTeams[1]?.teamName || "",
        ];

        const scoreItems = rawTeams.map((team, idx) => {
          const tName = team?.name || team?.teamName || teamNames[idx] || "";
          const scoreData = [];

          // Robust score extraction from all API formats (string, number, object, or runs/wickets)
          let teamScore = "";
          if (typeof team?.score === "string" || typeof team?.score === "number") {
            const s = String(team.score).trim();
            if (s && s !== "-") teamScore = s;
          } else if (team?.score && typeof team.score === "object") {
            const r = team.score.runs ?? team.score.r ?? team.score.run;
            const w = team.score.wickets ?? team.score.w ?? team.score.wicket;
            if (r !== undefined && r !== null) {
              teamScore = w !== undefined && w !== null ? `${r}/${w}` : String(r);
            }
          }
          if (!teamScore) {
            const runs = team?.runs ?? team?.r ?? team?.run ?? team?.goals ?? team?.goal;
            const wkts = team?.wickets ?? team?.w ?? team?.wicket;
            if (runs !== undefined && runs !== null && runs !== "") {
              teamScore = wkts !== undefined && wkts !== null && wkts !== "" ? `${runs}/${wkts}` : String(runs);
            }
          }

          // 1. Test Match Innings mapping (1st & 2nd innings)
          const rawScore1 =
            team?.firstIngs ??
            team?.["1stIngs"] ??
            team?.firstInnings ??
            team?.firstInns ??
            team?.first_ings ??
            team?.score1 ??
            team?.first ??
            team?.["1st"] ??
            team?.inn1 ??
            team?.inns1 ??
            team?.score_1 ??
            team?.innings1;

          const rawScore2 =
            team?.secondIngs ??
            team?.["2ndIngs"] ??
            team?.secondInnings ??
            team?.secondInns ??
            team?.second_ings ??
            team?.score2 ??
            team?.second ??
            team?.["2nd"] ??
            team?.inn2 ??
            team?.inns2 ??
            team?.score_2 ??
            team?.innings2;

          const score1 =
            rawScore1 !== undefined && rawScore1 !== null && String(rawScore1).trim() !== "" && String(rawScore1).trim() !== "-"
              ? String(rawScore1).trim()
              : teamScore && teamScore !== "-"
              ? teamScore
              : "";

          const score2 =
            rawScore2 !== undefined && rawScore2 !== null && String(rawScore2).trim() !== "" && String(rawScore2).trim() !== "-"
              ? String(rawScore2).trim()
              : "";

          if (score1) {
            scoreData.push({ iconName: "1st", value: score1 });
            scoreData.push({ iconName: "firstIngs", value: score1 });
          } else if (teamScore && isTestMatch) {
            scoreData.push({ iconName: "1st", value: teamScore });
          }

          if (score2) {
            scoreData.push({ iconName: "2nd", value: score2 });
            scoreData.push({ iconName: "secondIngs", value: score2 });
          }

          // 2. Score field (e.g. "185/4" or "185")
          if (teamScore) {
            scoreData.push({ iconName: "score", value: teamScore });
          } else if (score1) {
            scoreData.push({ iconName: "score", value: score1 });
          }

          // 3. Overs field
          let teamOvers = "";
          const ovRaw = team?.overs ?? team?.ovs ?? team?.ov ?? team?.o ?? team?.oversText ?? team?.over;
          if (ovRaw !== undefined && ovRaw !== null && ovRaw !== "" && String(ovRaw).trim() !== "-") {
            teamOvers = String(ovRaw).trim();
          } else if (team?.score && typeof team.score === "object") {
            const ovObj = team.score.overs ?? team.score.ovs ?? team.score.ov;
            if (ovObj !== undefined && ovObj !== null && ovObj !== "" && String(ovObj).trim() !== "-") teamOvers = String(ovObj).trim();
          }

          if (teamOvers.includes("/")) {
            const parts = teamOvers.split("/");
            teamOvers = parts[0];
            if (parts[1] && !isTestMatch) {
              if (maxObs <= 20 || parseFloat(parts[1]) > 20) {
                maxOvers = parts[1];
              }
            }
          }
          if (teamOvers && teamOvers !== "0") {
            scoreData.push({ iconName: "overs", value: teamOvers });
          }

          // 4. Run Rate field
          const rrRaw = team?.rr ?? team?.runrate ?? team?.runRate ?? team?.crr;
          if (rrRaw !== undefined && rrRaw !== null && rrRaw !== "" && rrRaw !== "0" && String(rrRaw).trim() !== "-") {
            scoreData.push({ iconName: "runrate", value: String(rrRaw) });
          }

          // 5. Batting indicator (non-soccer)
          if (!isSoccer) {
            if (team?.isBatting) {
              scoreData.push({ iconName: "bat-ball", value: "bat" });
            } else {
              scoreData.push({ iconName: "bat-ball", value: "ball" });
            }
          }

          // 6. Current Batsman & Bowler
          if (team?.batsman) {
            scoreData.push({
              iconName: "currentBatsman",
              value: String(team.batsman),
            });
          }
          if (team?.bowler) {
            scoreData.push({
              iconName: "currentBowler",
              value: String(team.bowler),
            });
          }

          // 7. Soccer fields
          if (isSoccer) {
            const soccerScore =
              team?.score ??
              team?.goals ??
              team?.goal ??
              team?.ft ??
              (idx === 0
                ? rawData?.homeScore ?? rawData?.score?.home ?? rawData?.goals?.home
                : rawData?.awayScore ?? rawData?.score?.away ?? rawData?.goals?.away) ??
              0;
            const soccerHT =
              team?.htscore ??
              team?.htScore ??
              team?.ht ??
              team?.halfTime ??
              (idx === 0
                ? rawData?.homeHT ?? rawData?.ht?.home
                : rawData?.awayHT ?? rawData?.ht?.away) ??
              0;
            const soccerCorners =
              team?.corners ??
              team?.corner ??
              team?.cornerCount ??
              (idx === 0
                ? rawData?.homeCorners ?? rawData?.corners?.home
                : rawData?.awayCorners ?? rawData?.corners?.away) ??
              0;
            const soccerYellow =
              team?.yellowCard ??
              team?.yellowCards ??
              team?.yellow ??
              (idx === 0
                ? rawData?.homeYellow ?? rawData?.yellow?.home
                : rawData?.awayYellow ?? rawData?.yellow?.away) ??
              0;
            const soccerRed =
              team?.redCard ??
              team?.redCards ??
              team?.red ??
              (idx === 0
                ? rawData?.homeRed ?? rawData?.red?.home
                : rawData?.awayRed ?? rawData?.red?.away) ??
              0;

            scoreData.push({ iconName: "score", value: String(soccerScore) });
            scoreData.push({ iconName: "ht", value: String(soccerHT) });
            scoreData.push({ iconName: "corners", value: String(soccerCorners) });
            scoreData.push({ iconName: "yellowCard", value: String(soccerYellow) });
            scoreData.push({ iconName: "redCard", value: String(soccerRed) });
          } else {
            if (team?.corners !== undefined && team?.corners !== null) {
              scoreData.push({ iconName: "corners", value: String(team.corners) });
            }
            if (team?.yellowCard !== undefined && team?.yellowCard !== null) {
              scoreData.push({ iconName: "yellowCard", value: String(team.yellowCard) });
            }
            if (team?.redCard !== undefined && team?.redCard !== null) {
              scoreData.push({ iconName: "redCard", value: String(team.redCard) });
            }
            if (team?.htscore !== undefined && team?.htscore !== null) {
              scoreData.push({ iconName: "ht", value: String(team.htscore) });
            }
          }

          // 8. Tennis fields (sets, points, set-0 to set-4, server ball)
          if (team?.sets !== undefined && team?.sets !== null) {
            scoreData.push({ iconName: "sets", value: String(team.sets) });
          }
          const ptsVal = team?.pts ?? team?.points;
          if (ptsVal !== undefined && ptsVal !== null) {
            scoreData.push({ iconName: "points", value: String(ptsVal) });
          }
          [1, 2, 3, 4, 5].forEach((sNum, sIdx) => {
            const sVal = team?.[`set${sNum}`] ?? team?.[`set_${sNum}`] ?? team?.[`s${sNum}`];
            if (sVal !== undefined && sVal !== null && sVal !== "") {
              scoreData.push({ iconName: `set-${sIdx}`, value: String(sVal) });
            }
          });
          if (team?.isServer || team?.server || team?.serving) {
            scoreData.push({ iconName: "server", value: "ball" });
          }

          return {
            teamName: tName,
            currentBatsman: team?.batsman ? String(team.batsman) : "",
            currentBowler: team?.bowler ? String(team.bowler) : "",
            isServer: Boolean(team?.isServer || team?.server || team?.serving),
            kit: team?.kit || team?.teamKit || team?.flag || "",
            firstIngs: score1 || "",
            secondIngs: score2 || "",
            score1: score1 || "",
            score2: score2 || "",
            score: team?.score ?? team?.goals ?? "",
            goals: team?.goals ?? team?.score ?? "",
            htscore: team?.htscore ?? team?.htScore ?? team?.ht ?? "",
            corners: team?.corners ?? "",
            yellowCard: team?.yellowCard ?? team?.yellowCards ?? "",
            redCard: team?.redCard ?? team?.redCards ?? "",
            scoreData,
          };
        });

        const statusText =
          rawData?.statusCommentry ||
          rawData?.statusCommentary ||
          rawData?.status ||
          (rawData?.minute != null ? `${rawData.minute}'` : "") ||
          "";

        const last6Balls =
          rawData?.last6balls ||
          rawData?.last6Balls ||
          rawData?.recentBalls ||
          [];

        const teamInfo = {
          team1Name: teamNames[0],
          team2Name: teamNames[1],
          team1SubText: rawTeams[0]?.isBatting
            ? rawTeams[0]?.batsman || battingBatsman || ""
            : rawTeams[0]?.bowler || currentBowler || "",
          team2SubText: rawTeams[1]?.isBatting
            ? rawTeams[1]?.batsman || battingBatsman || ""
            : rawTeams[1]?.bowler || currentBowler || "",
          team1CurrentBowler: !rawTeams[0]?.isBatting ? (rawTeams[0]?.bowler || currentBowler) : "",
          team2CurrentBowler: !rawTeams[1]?.isBatting ? (rawTeams[1]?.bowler || currentBowler) : "",
          statusCommentary: statusText,
          statusCommentry: statusText,
          tossText: rawData?.info?.toss || rawData?.toss || "",
          isTestMatch,
          format,
          last6Balls,
          last6balls: last6Balls,
        };

        const headers = isTestMatch
          ? ["1ST", "2ND", "RR"]
          : isSoccer
          ? ["GOALS", "HT", "CORNERS", "YELLOW", "RED"]
          : format === "tennis"
          ? ["SETS", "1", "2", "3", "PTS"]
          : ["SCORE", "OVS", "RR"];

        // Synthetic innings for Test matches so multi-innings render cleanly
        const syntheticInnings = Array.isArray(rawData?.innings) ? [...rawData.innings] : [];
        if (syntheticInnings.length === 0 && isTestMatch) {
          rawTeams.forEach((t, tIdx) => {
            const tName = teamNames[tIdx] || "";
            const s1 =
              t?.firstIngs ??
              t?.["1stIngs"] ??
              t?.firstInnings ??
              t?.score1 ??
              t?.first ??
              t?.["1st"];
            const s2 =
              t?.secondIngs ??
              t?.["2ndIngs"] ??
              t?.secondInnings ??
              t?.score2 ??
              t?.second ??
              t?.["2nd"];
            if (s1 !== undefined && s1 !== null && String(s1).trim() !== "" && String(s1).trim() !== "-") {
              syntheticInnings.push({ team: tName, teamName: tName, runs: String(s1).trim(), inning: 1 });
            }
            if (s2 !== undefined && s2 !== null && String(s2).trim() !== "" && String(s2).trim() !== "-") {
              syntheticInnings.push({ team: tName, teamName: tName, runs: String(s2).trim(), inning: 2 });
            }
          });
        }

        return {
          ...payload,
          ...rawData,
          eventId: rawData?.eventId || payload?.eventId,
          format,
          isTestMatch,
          statusCommentary: statusText,
          statusCommentry: statusText,
          atCrease: battingBatsman,
          currentBowler,
          bowler: currentBowler,
          last6Balls,
          last6balls: last6Balls,
          maxOvers,
          totalOvers: maxOvers,
          battingTeam: battingTeamName,
          innings: syntheticInnings.length > 0 ? syntheticInnings : rawData?.innings || payload?.innings,
          liveDoc: {
            ...(payload.liveDoc || {}),
            slider: [
              {
                score: {
                  headers,
                  teamInfo,
                  scoreItems,
                  maxOvers,
                  totalOvers: maxOvers,
                  statusCommentary: statusText,
                  statusCommentry: statusText,
                  atCrease: battingBatsman,
                  currentBowler,
                  bowler: currentBowler,
                  last6Balls,
                  last6balls: last6Balls,
                  isTestMatch,
                  format,
                },
              },
            ],
          },
        };
      }

      // Convert the API's innings-based response into the structure

      // expected by LiveScoreBoard.

      if (!Array.isArray(payload.innings) || !Array.isArray(payload.teams)) {
        return payload;
      }

      const innings = payload.innings;

      const currentInnings =
        innings.find((inning) => inning?.done === false) ||
        innings[innings.length - 1] ||
        {};

      const teamNames = payload.teams.map((team) =>
        typeof team === "string" ? team : team?.name || "",
      );

      const battingTeam = payload.battingTeam || currentInnings.team || "";

      const normalizeTeamName = (name) =>
        String(name || "")
          .trim()
          .toLowerCase();

      const scoreItems = teamNames.map((teamName) => {
        const inning = [...innings]

          .reverse()

          .find(
            (item) =>
              normalizeTeamName(item?.team) === normalizeTeamName(teamName),
          );

        const scoreData = [];

        if (inning) {
          scoreData.push(
            {
              iconName: "score",

              value: `${inning.runs ?? 0}/${inning.wickets ?? 0}`,
            },

            {
              iconName: "overs",

              value: inning.oversText ?? "",
            },

            {
              iconName: "runrate",

              value: inning.rr ?? "",
            },
          );
        }

        if (normalizeTeamName(teamName) === normalizeTeamName(battingTeam)) {
          scoreData.push({
            iconName: "bat-ball",

            value: "bat",
          });
        }

        return {
          teamName,

          scoreData,
        };
      });

      const team1Flag =
        payload.teams?.[0]?.flag ||
        payload.teams?.[0]?.flagName ||
        payload.teams?.[0]?.kit ||
        payload.teams?.[0]?.teamKit ||
        payload.team1Flag ||
        "";

      const team2Flag =
        payload.teams?.[1]?.flag ||
        payload.teams?.[1]?.flagName ||
        payload.teams?.[1]?.kit ||
        payload.teams?.[1]?.teamKit ||
        payload.team2Flag ||
        "";

      const maxOvers =
        payload.maxOvers ??
        payload.oversLimit ??
        payload.info?.maxOvers ??
        payload.info?.overs;

      const teamInfo = {
        team1Name: teamNames[0] || "",
        team2Name: teamNames[1] || "",
        team1Flag,
        team2Flag,
        team1Kit:
          payload.teams?.[0]?.kit || payload.teams?.[0]?.teamKit || team1Flag,
        team2Kit:
          payload.teams?.[1]?.kit || payload.teams?.[1]?.teamKit || team2Flag,
        team1SubText:
          normalizeTeamName(teamNames[0]) === normalizeTeamName(battingTeam)
            ? payload.atCrease || ""
            : payload.currentBowler ||
            payload.bowler ||
            currentInnings?.currentBowler ||
            currentInnings?.bowler ||
            "",
        team2SubText:
          normalizeTeamName(teamNames[1]) === normalizeTeamName(battingTeam)
            ? payload.atCrease || ""
            : payload.currentBowler ||
            payload.bowler ||
            currentInnings?.currentBowler ||
            currentInnings?.bowler ||
            "",
        tossText: payload.info?.toss || "",
      };

      return {
        ...payload,
        maxOvers,
        liveDoc: {
          ...(payload.liveDoc || {}),
          slider: [
            {
              score: {
                teamInfo,
                scoreItems,
                maxOvers,
                tossText: payload.info?.toss || "",
                statusCommentary: payload.status || "",
                currentBowler: payload.currentBowler || payload.bowler || "",
              },
            },
          ],
        },
      };
    };

    const fetchScoreboard = async () => {
      // Do not start another request while the previous one is pending.

      if (abortControllerRef.current) {
        return;
      }

      const controller = new AbortController();

      abortControllerRef.current = controller;

      try {
        if (mounted) {
          setScoreLoading(true);

          setScoreError("");
        }

        const scoreUrl = `https://stream.chimneysolutions.info/api/sports/score/${encodeURIComponent(eventId)}?sportId=${encodeURIComponent(sportId)}`;
        let responseBody = null;

        try {
          const streamResponse = await axios.get(scoreUrl, {
            signal: controller.signal,
            timeout: 3500,
          });
          const streamData = streamResponse?.data;
          if (streamData && typeof streamData === "object") {
            responseBody = streamData;
          }
        } catch (streamErr) {
          if (isCancelledRequest(streamErr)) {
            return;
          }
          if (String(sportId) === "4") {
            try {
              const fallbackResponse = await API.get(
                `/api/v1/fetch-score/${encodeURIComponent(sportId)}/${encodeURIComponent(eventId)}`,
                { signal: controller.signal, timeout: 3500 },
              );
              if (fallbackResponse?.data) {
                responseBody = fallbackResponse.data;
              }
            } catch (fallbackErr) {
              if (isCancelledRequest(fallbackErr)) {
                return;
              }
            }
          }
        }

        const responseLayers = getResponseLayers(responseBody);

        // Find the actual scoreboard object, regardless of the number
        // of API response wrappers.
        const scorePayload =
          [...responseLayers]
            .reverse()
            .find(hasScoreShape) || responseBody;

        const errorMessage = responseLayers
          .flatMap((layer) => [layer?.error, layer?.message, layer?.msg])
          .filter((message) => typeof message === "string" && message)
          .join(" ");

        const normalizedError = errorMessage.toLowerCase();

        const isExplicitUnavailable =
          scorePayload?.available === false ||
          normalizedError.includes("no score received") ||
          normalizedError.includes("live score unavailable");

        if (isExplicitUnavailable) {
          if (mounted && !scoreData) {
            const fallbackNorm = normalizeScorePayload({
              eventId,
              sportId,
              eventName,
              teams: [],
            });
            if (fallbackNorm) setScoreData(fallbackNorm);
          }
          if (mounted) setScoreError("");
          return;
        }

        if (scorePayload && typeof scorePayload === "object") {
          const normalizedScore = normalizeScorePayload(scorePayload);
          if (mounted && normalizedScore) {
            setScoreData(normalizedScore);
            setScoreError("");
          }
        } else if (mounted && !scoreData) {
          const fallbackNorm = normalizeScorePayload({
            eventId,
            sportId,
            eventName,
            teams: [],
          });
          if (fallbackNorm) setScoreData(fallbackNorm);
        }
      } catch (error) {
        if (isCancelledRequest(error)) {
          return;
        }

        const errorBody = error?.response?.data;
        const errorMessage = [
          errorBody?.error,
          errorBody?.message,
          errorBody?.msg,
          error?.message,
        ]
          .filter((message) => typeof message === "string" && message)
          .join(" ")
          .toLowerCase();

        const isExplicitlyUnavailable =
          errorMessage.includes("no score received") ||
          errorMessage.includes("live score unavailable");

        if (!isExplicitlyUnavailable) {
          console.error(
            "Scoreboard API error:",
            error?.response?.data || error?.message,
          );
        }

        if (mounted && !scoreData) {
          const fallbackNorm = normalizeScorePayload({
            eventId,
            sportId,
            eventName,
            teams: [],
          });
          if (fallbackNorm) setScoreData(fallbackNorm);
        }
        if (mounted) setScoreError("");
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        if (mounted) {
          setScoreLoading(false);
        }
      }
    };

    fetchScoreboard();

    // If a request takes longer than 2 seconds, subsequent ticks

    // will skip it until the pending request finishes.

    intervalId = setInterval(fetchScoreboard, 1500);

    return () => {
      mounted = false;

      stopPolling();

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();

        abortControllerRef.current = null;
      }
    };
  }, [sportId, eventId, liveTv, activeTab]);

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleTvToggle = () => {
    setLiveTv((prev) => !prev);

    setActiveTab("score");
  };

  return (
    <div className="w-full">
      <style>{`

        @keyframes tvInplayPulse {

          0%, 100% { transform: scale(1); color: #ffffff; fill: #ffffff; }

          50% { transform: scale(1.09); color: #ff0000; fill: #ff0000; }

        }

        .tv-inplay-animated {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          animation: tvInplayPulse 1.1s ease-in-out infinite;

          transform-origin: center;

        }

      `}</style>

      {/* Sport Title & TV Toggle Header */}

      {isAuthenticated && (
        <div
          className="w-full flex flex-row justify-between items-center min-h-[34px] px-3"
          style={{
            background: "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
          }}
        >
          <div />

          <p
            className="text-white font- line-clamp-1 text-center text-[15px]"
            style={{ width: "calc(100% - 30px - 25px)" }}
          >
            {sportsMapping[sportId]}
          </p>

          <div
            role="button"
            onClick={handleTvToggle}
            className={`cursor-pointer flex items-center justify-center p-1 select-none transition-transform ${isInPlay ? "tv-inplay-animated" : "text-white"}`}
          >
            <IoMdTv
              size={19}
              className={isInPlay ? "tv-inplay-animated" : "text-white"}
              style={{ color: isInPlay ? undefined : "white" }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}

      {liveTv && (
        <div className="flex h-[31px] w-full text-white bg-[linear-gradient(180deg,_#303030,_#303030_42%)] border-b border-[#666060]">
          <div
            onClick={() => handleTabChange("score")}
            className={`flex-1 text-center text-[13px] py-[5px] cursor-pointer border-r border-[#666060] ${activeTab === "score" ? "border-b border-b-white" : ""}`}
          >
            Live Score
          </div>

          <div
            onClick={() => handleTabChange("tv")}
            className={`flex-1 text-center text-[13px] py-[5px] cursor-pointer ${activeTab === "tv" ? "border-b border-b-white" : ""}`}
          >
            Watch Live
          </div>
        </div>
      )}

      {/* Default Header Banner */}

      {!liveTv && !isInPlay && (
        <MarketHeaderBanner
          dateTime={openDate}
          statusText={statusText || "OPEN"}
          backgroundImage={sportsImageMapping[sportId] || ""}
          isInPlay={isInPlay}
          isPreBet={isPreBet}
        />
      )}

      {usertype == null && isInPlay && (
        <MarketHeaderBanner
          dateTime={openDate}
          statusText={statusText || "OPEN"}
          backgroundImage={sportsImageMapping[sportId] || ""}
          isInPlay={isInPlay}
          isPreBet={isPreBet}
        />
      )}

      {/* Live Score Tab */}

      {liveTv && activeTab === "score" && (
        <div className="w-full bg-black overflow-hidden">
          {scoreLoading && !scoreData && (
            <div className="w-full h-[150px] flex items-center justify-center bg-black">
              <span className="text-[#aaa] text-[13px]">Loading score...</span>
            </div>
          )}

          {(!scoreLoading || scoreData) && (
            <LiveScoreBoard
              scoreData={scoreData || { eventId, eventName, sportId }}
              sportId={sportId}
              eventName={eventName}
              eventId={eventId}
            />
          )}
        </div>
      )}

      {/* Watch Live Tab */}

      {liveTv && activeTab === "tv" && (
        <div className="w-full bg-[#141435] flex justify-center items-center overflow-hidden">
          {usertype == "demo" ? (
            <div className="h-[214px] w-full bg-[#000] flex items-center justify-center px-4">
              <div className="w-full p-[14px] rounded-[8px] border border-[#29334a] bg-[#0d1526] flex items-start">
                <div className="w-[40px] h-[40px] rounded-full border-[1.5px] border-[#fbbf2452] bg-[#201d18] flex items-center justify-center">
                  <FaLock className="text-[#ffbd1b]" size={16} />
                </div>

                <div className="ml-3">
                  <h2 className="text-white text-[16px] font-bold leading-tight">
                    Stream access restricted
                  </h2>

                  <p className="text-[#c5cede] text-[14px] font-normal leading-[1.4] mt-2">
                    You have to be logged in with a real ID to
                    <br />
                    view the stream.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-video overflow-hidden">
              <iframe

                key={`tv-${sportId}-${eventId}`}

                src={`https://universeapi.tech/embed/tv?event=${eventId}`}

                title="Live TV"

                allow="autoplay; picture-in-picture"

                className="absolute inset-0 w-full h-full border-0 z-0 p-0 m-0"

                loading="lazy"

                allowFullScreen

              />

              {/* {tvMatchId ? (
                <iframe
                  key={`tv-${sportId}-${tvMatchId}`}
                  src={`https://ofa247.live/fairplay247/dtvp.html?id=${encodeURIComponent(tvMatchId)}`}
                  title="Live TV"
                  allow="autoplay; picture-in-picture"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-black text-white text-sm">
                  TV stream is unavailable for this match.
                </div>
              )} */}

              {/* <div className="flex items-center justify-center p-4">

                <p className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font- text-red-500 shadow-sm">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/15 text-base">

                    !

                  </span>

                  Domain not whitelisted

                </p>

              </div> */}

              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                <span className="tv-floating-watermark">{`www.${window?.location.host}`}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MatchDetailsBanner;