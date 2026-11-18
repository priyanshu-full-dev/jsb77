import React, { useMemo, useRef, useState, useEffect } from "react";

const getFlagUrl = (flagName) => {
  if (!flagName) return "";
  if (flagName.startsWith("http://") || flagName.startsWith("https://")) {
    return flagName;
  }
  const cleanFlag = String(flagName).trim();
  if (cleanFlag.includes("TeamKit") || cleanFlag.startsWith("TeamKit_")) {
    const ext = cleanFlag.includes(".") ? "" : ".svg";
    return `https://spxstatic.com/sports/others/media/spTeamKits/${cleanFlag}${ext}`;
  }
  const cleanId = cleanFlag.replace(/\.(png|svg|jpg)$/i, "");
  return `https://spxstatic.com/sports/others/media/spTeamKits/TeamKit_${cleanId}.svg`;
};

function CricketScoreBoard({ scoreData, eventName: propEventName, eventId: propEventId }) {
  const prevEventIdRef = useRef(null);
  const cachedLast6Ref = useRef("");
  const cachedBowlerRef = useRef("");
  const cachedBatsmenRef = useRef("");
  const cachedTossRef = useRef("");
  const cachedBattingRef = useRef(false);
  const lockedTeamsRef = useRef({ eventId: null, team1: "", team2: "" });

  const [transientCommentary, setTransientCommentary] = useState("");
  const transientTimerRef = useRef(null);
  const prevStatusRef = useRef("");

  const sourceData = useMemo(() => {
    if (scoreData?.data?.data?.exEventId || scoreData?.data?.data?.liveDoc) return scoreData.data.data;
    if (scoreData?.data?.exEventId || scoreData?.data?.liveDoc) return scoreData.data;
    return scoreData;
  }, [scoreData]);

  const score = sourceData?.exEventId || sourceData?.liveDoc || sourceData?.innings ? sourceData : sourceData?.score || sourceData;

  const sliderScore =
    score?.liveDoc?.slider?.[0]?.score ||
    score?.slider?.[0]?.score ||
    score?.data?.liveDoc?.slider?.[0]?.score ||
    score?.data?.slider?.[0]?.score;

  const teamInfo = sliderScore?.teamInfo;

  const innings = Array.isArray(score?.innings)
    ? score.innings
    : Array.isArray(score?.data?.innings)
    ? score.data.innings
    : [];

  const currentInnings =
    innings.find((inn) => inn?.done === false) ||
    innings[innings.length - 1] ||
    {};

  const getValue = (data = [], iconName) => {
    const item = data?.find((i) => i?.iconName === iconName);
    if (item && item.value !== "" && item.value !== null && item.value !== undefined) {
      return item.value;
    }
    if (iconName === "runrate") {
      const scoreVal = data?.find((i) => i?.iconName === "score")?.value;
      const oversVal = data?.find((i) => i?.iconName === "overs")?.value;
      if (scoreVal && oversVal) {
        const runsMatch = String(scoreVal).match(/^(\d+)/);
        const oversMatch = String(oversVal).match(/^(\d+)(?:\.(\d+))?/);
        if (runsMatch && oversMatch) {
          const runs = Number(runsMatch[1]);
          const completedOvers = Number(oversMatch[1]);
          const balls = oversMatch[2] ? Number(oversMatch[2]) : 0;
          const totalCompletedOvers = completedOvers + balls / 6;
          if (totalCompletedOvers > 0) return (runs / totalCompletedOvers).toFixed(1);
        }
      }
    }
    return item?.value ?? "";
  };

  const normalizeText = (value) => {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (item === null || item === undefined) return "";
          if (typeof item === "object") {
            return item?.value ?? item?.text ?? item?.displayText ?? "";
          }
          return String(item);
        })
        .filter(Boolean)
        .join(" ");
    }
    if (typeof value === "object") {
      return value?.value ?? value?.text ?? value?.displayText ?? "";
    }
    return String(value);
  };

  const formatTeamName = (name) => {
    if (!name) return "-";
    let str = String(name).trim();
    str = str.replace(/\bwomen\b/i, "(W)");
    str = str.replace(/\(women\)/i, "(W)");
    str = str.replace(/\s+\(W\)/i, " (W)");
    return str;
  };

  const payloadTeamNames = [
    score?.teams?.[0]?.teamName ||
      score?.teams?.[0]?.name ||
      score?.data?.teams?.[0]?.teamName ||
      score?.data?.teams?.[0]?.name ||
      "",
    score?.teams?.[1]?.teamName ||
      score?.teams?.[1]?.name ||
      score?.data?.teams?.[1]?.teamName ||
      score?.data?.teams?.[1]?.name ||
      "",
  ];

  const scoreItems = sliderScore?.scoreItems || [];



  // Extract team names from all possible structures
  const extractName = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item.trim();
    return (item.teamName || item.name || item.shortName || "").trim();
  };

  const rawTeam1Name =
    extractName(score?.event?.teams?.[0]) ||
    extractName(score?.teams?.[0]) ||
    extractName(score?.data?.teams?.[0]) ||
    extractName(teamInfo?.team1Name) ||
    "";

  const rawTeam2Name =
    extractName(score?.event?.teams?.[1]) ||
    extractName(score?.teams?.[1]) ||
    extractName(score?.data?.teams?.[1]) ||
    extractName(teamInfo?.team2Name) ||
    "";

  const matchEventName =
    propEventName ||
    score?.event?.name ||
    score?.event?.eventName ||
    score?.eventName ||
    score?.data?.event?.name ||
    "";

  const currentEventId = String(
    propEventId ||
      score?.eventId ||
      score?.exEventId ||
      score?.event?.id ||
      score?.data?.eventId ||
      "",
  );

  if (currentEventId && lockedTeamsRef.current.eventId !== currentEventId) {
    lockedTeamsRef.current = { eventId: currentEventId, team1: "", team2: "" };
  }

  let canonTeam1 = lockedTeamsRef.current.team1;
  let canonTeam2 = lockedTeamsRef.current.team2;

  if (!canonTeam1 || !canonTeam2) {
    if (matchEventName && /\s+(?:v|vs|\/)\s+/i.test(matchEventName)) {
      const parts = matchEventName.split(/\s+(?:v|vs|\/)\s+/i);
      if (parts.length >= 2) {
        canonTeam1 = formatTeamName(parts[0].trim());
        canonTeam2 = formatTeamName(parts[1].trim());
      }
    }
    if (!canonTeam1 || !canonTeam2) {
      canonTeam1 = formatTeamName(rawTeam1Name);
      canonTeam2 = formatTeamName(rawTeam2Name);
    }
    if (canonTeam1 && canonTeam2) {
      lockedTeamsRef.current.team1 = canonTeam1;
      lockedTeamsRef.current.team2 = canonTeam2;
      if (currentEventId) {
        lockedTeamsRef.current.eventId = currentEventId;
      }
    }
  }

  const team1Name = canonTeam1 || formatTeamName(rawTeam1Name);
  const team2Name = canonTeam2 || formatTeamName(rawTeam2Name);

  // Clean strings for matching
  const cleanStr = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const team1Clean = cleanStr(team1Name);
  const team2Clean = cleanStr(team2Name);

  // Toss text
  const rawToss =
    score?.info?.toss ||
    score?.data?.info?.toss ||
    sliderScore?.tossText ||
    sliderScore?.toss ||
    score?.tossText ||
    score?.toss ||
    teamInfo?.tossText ||
    score?.liveDoc?.toss ||
    "";

  let tossText = normalizeText(rawToss).trim();
  if (tossText) {
    if (
      (tossText.toLowerCase().includes("chose to") ||
        tossText.toLowerCase().includes("elected to") ||
        tossText.toLowerCase().includes("opted to")) &&
      !tossText.toLowerCase().startsWith("toss")
    ) {
      tossText = `Toss: ${tossText}`;
    }
    if (!tossText.endsWith(".")) {
      tossText = `${tossText}.`;
    }
  }

  const tossTextLower = tossText.toLowerCase();

  // Status / commentary from API
  const rawStatus = normalizeText(
    sliderScore?.statusCommentary ??
      sliderScore?.statusCommentry ??
      score?.status ??
      score?.commentary ??
      "",
  ).trim();

  // Determine if 2nd innings chase is currently active
  const isChaseActive =
    rawStatus.toLowerCase().includes("need") ||
    innings.length >= 2 ||
    (innings[0]?.done === true && innings.length > 0);

  // Check which team is currently batting ("battng pe uper aata hai")
  const item0Bat = (scoreItems?.[0]?.scoreData || []).some(
    (item) => item?.iconName === "bat-ball" && String(item?.value).toLowerCase() === "bat",
  );
  const item1Bat = (scoreItems?.[1]?.scoreData || []).some(
    (item) => item?.iconName === "bat-ball" && String(item?.value).toLowerCase() === "bat",
  );

  const item0HasScore = (scoreItems?.[0]?.scoreData || []).some(
    (item) => item?.iconName === "score" && item?.value !== "" && item?.value !== undefined && item?.value !== null,
  );
  const item1HasScore = (scoreItems?.[1]?.scoreData || []).some(
    (item) => item?.iconName === "score" && item?.value !== "" && item?.value !== undefined && item?.value !== null,
  );

  const rawBattingTeam = String(
    score?.battingTeam || score?.data?.battingTeam || currentInnings?.team || "",
  ).toLowerCase();

  const isBattingByTeam = (tClean) => {
    if (!tClean) return false;

    const matchedItem = scoreItems.find((it) => {
      const itClean = cleanStr(it?.teamName);
      return itClean && (itClean.includes(tClean) || tClean.includes(itClean));
    });
    if (matchedItem) {
      const hasBat = (matchedItem?.scoreData || []).some(
        (sd) => sd?.iconName === "bat-ball" && String(sd?.value).toLowerCase() === "bat",
      );
      if (hasBat) return true;
    }

    if (rawBattingTeam && (rawBattingTeam.includes(tClean) || tClean.includes(rawBattingTeam))) {
      return true;
    }

    const innTeam = cleanStr(currentInnings?.team || currentInnings?.teamName);
    if (innTeam && (innTeam.includes(tClean) || tClean.includes(innTeam))) {
      return true;
    }

    if (
      tossTextLower &&
      (tossTextLower.includes(`${tClean} chose to bat`) ||
        tossTextLower.includes(`${tClean} elected to bat`) ||
        tossTextLower.includes(`${tClean} opted to bat`) ||
        tossTextLower.includes(`${tClean} won the toss and elected to bat`))
    ) {
      return true;
    }

    return false;
  };

  const isT1Bat = isBattingByTeam(team1Clean);
  const isT2Bat = isBattingByTeam(team2Clean);

  let isTeam2Batting = false;
  if (isT2Bat && !isT1Bat) {
    isTeam2Batting = true;
  } else if (isT1Bat && !isT2Bat) {
    isTeam2Batting = false;
  } else if (item1Bat && !item0Bat) {
    isTeam2Batting = true;
  } else if (item0Bat && !item1Bat) {
    isTeam2Batting = false;
  } else if (!item0HasScore && item1HasScore) {
    isTeam2Batting = true;
  } else if (item0HasScore && !item1HasScore) {
    isTeam2Batting = false;
  } else {
    isTeam2Batting = cachedBattingRef.current;
  }

  if (isT1Bat || isT2Bat || item0Bat || item1Bat) {
    cachedBattingRef.current = isTeam2Batting;
  }

  // Extract team flag / jersey from all possible API fields
  const extractFlag = (idx) => {
    const targetTeamName = idx === 0 ? team1Name : team2Name;
    const targetClean = cleanStr(targetTeamName);

    const tInfoFlag =
      idx === 0
        ? teamInfo?.team1Kit ||
          teamInfo?.team1TeamKit ||
          teamInfo?.team1Flag ||
          teamInfo?.team1Jersey
        : teamInfo?.team2Kit ||
          teamInfo?.team2TeamKit ||
          teamInfo?.team2Flag ||
          teamInfo?.team2Jersey;

    const matchedTObj = (Array.isArray(score?.teams) ? score.teams : []).find(
      (t) => targetClean && cleanStr(t?.name || t?.teamName).includes(targetClean),
    ) || score?.teams?.[idx] || score?.data?.teams?.[idx] || score?.event?.teams?.[idx];

    const matchedItem = scoreItems.find(
      (it) => targetClean && cleanStr(it?.teamName).includes(targetClean),
    ) || scoreItems?.[idx];

    return (
      tInfoFlag ||
      matchedTObj?.kit ||
      matchedTObj?.teamKit ||
      matchedTObj?.jersey ||
      matchedTObj?.flag ||
      matchedTObj?.flagName ||
      matchedItem?.kit ||
      matchedItem?.teamKit ||
      matchedItem?.flag ||
      matchedItem?.flagName ||
      ""
    );
  };

  // Base team objects
  const team1Obj = {
    name: team1Name,
    flag: extractFlag(0),
    sourceIndex: 0,
  };

  const team2Obj = {
    name: team2Name,
    flag: extractFlag(1),
    sourceIndex: 1,
  };

  const formatBatsmanName = (name) => {
    const clean = String(name || "").replace(/\*/g, "").trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length < 2) return parts[0] || "";
    return `${parts[0][0]}.${parts.slice(1).join(" ")}`;
  };

  const formatCreaseText = (text) => {
    if (!text) return "";
    return text
      .split(",")
      .map((item) => {
        const trimmed = item.trim();
        const match = trimmed.match(/^([A-Za-z\s.'-]+?)\s+(\d+\*?)$/);
        if (match) {
          const name = formatBatsmanName(match[1]);
          return `${name} ${match[2]}`;
        }
        return trimmed;
      })
      .join(", ");
  };

  const eventKey = currentEventId || `${team1Name}-${team2Name}`;

  if (prevEventIdRef.current && prevEventIdRef.current !== eventKey) {
    cachedLast6Ref.current = "";
    cachedBowlerRef.current = "";
    cachedBatsmenRef.current = "";
    cachedTossRef.current = "";
  }
  prevEventIdRef.current = eventKey;

  const batsmen = currentInnings?.batsmen || currentInnings?.batting || [];

  // Extract Bowler for Bowling Team (e.g. "M.Beardman (7.1 - 0 - 66 - 1 - 9.43)")
  const extractBowlerInfo = () => {
    const toList = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "object") return Object.values(val);
      return [];
    };

    const bList = [
      ...toList(currentInnings?.bowling),
      ...toList(currentInnings?.bowlers),
      ...toList(currentInnings?.bowler),
      ...toList(score?.bowling),
      ...toList(score?.bowlers),
      ...toList(score?.data?.bowlers),
      ...toList(score?.data?.bowling),
      ...toList(score?.liveDoc?.bowling),
      ...toList(score?.liveDoc?.bowler),
      ...toList(sliderScore?.bowling),
      ...toList(sliderScore?.bowlers),
      ...toList(scoreData?.bowling),
      ...toList(scoreData?.bowlers),
      ...toList(scoreData?.data?.bowlers),
      ...toList(scoreData?.data?.bowling),
    ].filter((b) => b && typeof b === "object");

    const isCurrent = (b) =>
      b?.current === true ||
      b?.current === "true" ||
      b?.current === 1 ||
      b?.isCurrent === true ||
      b?.isCurrentBowler === true ||
      b?.currentBowler === true ||
      b?.isBowling === true ||
      b?.bowling === true ||
      b?.active === true ||
      b?.isActive === true ||
      String(b?.status || "").toLowerCase() === "bowling" ||
      String(b?.state || "").toLowerCase() === "bowling" ||
      String(b?.name || "").includes("*") ||
      String(b?.playerName || "").includes("*") ||
      String(b?.bowlerName || "").includes("*");

    let bObj =
      bList.find(isCurrent) ||
      bList.find((b) => {
        const ovStr = String(b?.overs ?? b?.ovs ?? b?.o ?? "");
        return ovStr.includes(".");
      }) ||
      (bList.length > 0 ? bList[bList.length - 1] : null) ||
      currentInnings?.currentBowler ||
      currentInnings?.bowler ||
      score?.currentBowler ||
      score?.bowler ||
      score?.data?.currentBowler ||
      score?.data?.bowler ||
      sliderScore?.currentBowler ||
      sliderScore?.bowler;

    if (bObj) {
      if (typeof bObj === "string") {
        const norm = normalizeText(bObj).trim();
        if (norm) return norm;
      } else if (typeof bObj === "object") {
        const rawName =
          bObj.name ||
          bObj.bowlerName ||
          bObj.playerName ||
          bObj.pName ||
          bObj.bowler ||
          bObj.player ||
          bObj.shortName ||
          "";

        const bName = formatBatsmanName(rawName);

        const ov =
          bObj.overs ??
          bObj.oversText ??
          bObj.ovs ??
          bObj.ov ??
          bObj.o ??
          bObj.over ??
          "0";

        const maidens =
          bObj.maidens ??
          bObj.maiden ??
          bObj.m ??
          bObj.mdn ??
          0;

        const runs =
          bObj.runs ??
          bObj.r ??
          bObj.conceded ??
          bObj.runsConceded ??
          bObj.rc ??
          0;

        const wickets =
          bObj.wickets ??
          bObj.wicket ??
          bObj.w ??
          bObj.wick ??
          bObj.wkts ??
          bObj.wkt ??
          0;

        let econ = bObj.economy ?? bObj.econ ?? bObj.er ?? bObj.eco;
        if (econ === undefined || econ === null || econ === "") {
          const parsedOv = parseFloat(ov);
          if (!isNaN(parsedOv) && parsedOv > 0) {
            const oversDec = Math.floor(parsedOv) + ((parsedOv % 1) * 10) / 6;
            econ = oversDec > 0 ? (runs / oversDec).toFixed(2) : "0.00";
          } else {
            econ = "0.00";
          }
        } else {
          const parsedEcon = Number(econ);
          econ = !isNaN(parsedEcon) ? parsedEcon.toFixed(2) : String(econ);
        }

        if (bName) {
          return `${bName} (${ov} - ${maidens} - ${runs} - ${wickets} - ${econ})`;
        }
      }
    }

    const bowlingTeamIndex = isTeam2Batting ? 0 : 1;
    const bowlingItem = scoreItems?.[bowlingTeamIndex];
    const bowlingPos4 = (bowlingItem?.scoreData || []).find(
      (sd) =>
        sd?.pos === "pos4" ||
        sd?.iconName === "currentBatsman" ||
        sd?.iconName === "currentBowler" ||
        sd?.iconName === "subText" ||
        sd?.iconName === "extraInfo",
    )?.value;

    const strCandidate =
      bowlingPos4 ||
      (isTeam2Batting ? teamInfo?.team1SubText : teamInfo?.team2SubText) ||
      (isTeam2Batting ? sliderScore?.team1SubText : sliderScore?.team2SubText) ||
      (isTeam2Batting ? teamInfo?.team1ExtraInfo : teamInfo?.team2ExtraInfo) ||
      bowlingItem?.currentBowler ||
      bowlingItem?.currentBatsman ||
      bowlingItem?.subText ||
      score?.currentBowler ||
      score?.bowler;

    const normStr = normalizeText(strCandidate).trim();
    if (normStr) {
      return normStr;
    }

    return "";
  };

  const computedBowlerText = extractBowlerInfo();
  if (computedBowlerText) {
    cachedBowlerRef.current = computedBowlerText;
  }
  const activeBowlerText = computedBowlerText || cachedBowlerRef.current;

  // Extract Batsmen for Batting Team (e.g. "S.Konstas 141*, O.Davies 5")
  const generatedSubText = batsmen.length
    ? batsmen
        .filter((b) => b && !b.out)
        .slice(0, 2)
        .map((b, idx) => {
          const rawName = b.name || b.batsmanName || b.playerName || "";
          const pName = formatBatsmanName(rawName);
          const runs = b.runs !== undefined && b.runs !== null ? ` ${b.runs}` : "";
          const isStrike =
            b.strike === true ||
            b.onStrike === true ||
            b.isStrike === true ||
            String(rawName).includes("*") ||
            (b.runs !== undefined && b.balls !== undefined && idx === 0);
          const star = isStrike ? "*" : "";
          return `${pName}${runs}${star}`.trim();
        })
        .filter(Boolean)
        .join(", ")
    : "";

  const rawAtCrease = normalizeText(
    sliderScore?.atCrease ||
      score?.atCrease ||
      currentInnings?.atCrease ||
      (isTeam2Batting ? teamInfo?.team2SubText : teamInfo?.team1SubText) ||
      scoreItems?.[isTeam2Batting ? 1 : 0]?.currentBatsman ||
      scoreItems?.[isTeam2Batting ? 1 : 0]?.subText ||
      "",
  );

  const computedBatsmenText = rawAtCrease
    ? formatCreaseText(rawAtCrease)
    : generatedSubText;

  if (computedBatsmenText) {
    cachedBatsmenRef.current = computedBatsmenText;
  }
  const activeBatsmenText = computedBatsmenText || cachedBatsmenRef.current;

  const isTeamBatting = (rowIdx) => (rowIdx === 0 ? !isTeam2Batting : isTeam2Batting);

  const getRowSubText = (rowIdx) => {
    const isBatting = isTeamBatting(rowIdx);
    if (isBatting) {
      return activeBatsmenText;
    }

    if (activeBowlerText) {
      return activeBowlerText;
    }

    const tObj = rowIdx === 0 ? team1Obj : team2Obj;
    const tClean = cleanStr(tObj?.name);
    const mItem = scoreItems.find((it) => {
      const itClean = cleanStr(it?.teamName);
      return itClean && tClean && (itClean.includes(tClean) || tClean.includes(itClean));
    }) || scoreItems?.[rowIdx];

    const pos4Val = (mItem?.scoreData || []).find(
      (sd) =>
        sd?.pos === "pos4" ||
        sd?.iconName === "currentBatsman" ||
        sd?.iconName === "currentBowler" ||
        sd?.iconName === "subText" ||
        sd?.iconName === "extraInfo",
    )?.value;

    const candidate =
      mItem?.currentBowler ||
      mItem?.bowler ||
      pos4Val ||
      (rowIdx === 0 ? teamInfo?.team1CurrentBowler : teamInfo?.team2CurrentBowler) ||
      (rowIdx === 0 ? sliderScore?.team1CurrentBowler : sliderScore?.team2CurrentBowler);

    const norm = normalizeText(candidate).trim();
    const atCreaseLower = (rawAtCrease || "").toLowerCase();
    const batsmenLower = (activeBatsmenText || "").toLowerCase();
    const isBatsmenOverlap =
      (atCreaseLower && norm && (atCreaseLower.includes(norm.toLowerCase()) || norm.toLowerCase().includes(atCreaseLower))) ||
      (batsmenLower && norm && (batsmenLower.includes(norm.toLowerCase()) || norm.toLowerCase().includes(batsmenLower)));

    if (isBatsmenOverlap) {
      return cachedBowlerRef.current || "";
    }
    return norm || cachedBowlerRef.current || "";
  };

  const displayTeams = [
    { ...team1Obj, subText: getRowSubText(0) },
    { ...team2Obj, subText: getRowSubText(1) },
  ];

  const teams = displayTeams;

  const allCompetitionText = [
    propEventName,
    matchEventName,
    score?.event?.tournament,
    score?.event?.name,
    score?.event?.eventName,
    score?.info?.competition,
    score?.info?.matchType,
    score?.info?.format,
    score?.info?.type,
    score?.event?.format,
    score?.event?.matchType,
    score?.matchFormat,
    score?.matchType,
    score?.format,
    score?.type,
    score?.competition,
    score?.tournament,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const formatStr = String(
    score?.format ||
      sliderScore?.format ||
      score?.matchFormat ||
      score?.info?.format ||
      score?.event?.format ||
      scoreData?.format ||
      "",
  ).toLowerCase().trim();

  let maxObservedOvers = 0;
  scoreItems.forEach((item) => {
    const ov = getValue(item?.scoreData, "overs");
    if (ov) {
      const parsed = parseFloat(String(ov).split("/")[0]);
      if (!isNaN(parsed) && parsed > maxObservedOvers) {
        maxObservedOvers = parsed;
      }
    }
  });
  innings.forEach((inn) => {
    const ov = inn?.oversText ?? inn?.overs;
    if (ov) {
      const parsed = parseFloat(String(ov).split("/")[0]);
      if (!isNaN(parsed) && parsed > maxObservedOvers) {
        maxObservedOvers = parsed;
      }
    }
  });
  (Array.isArray(score?.teams) ? score.teams : []).forEach((t) => {
    const ov = t?.overs ?? t?.ovs ?? t?.ov;
    if (ov) {
      const parsed = parseFloat(String(ov).split("/")[0]);
      if (!isNaN(parsed) && parsed > maxObservedOvers) {
        maxObservedOvers = parsed;
      }
    }
  });

  const isExplicitODI =
    /odi|one.?day|50\s*over|world\s*cup|list.?a|trophy/i.test(allCompetitionText) ||
    formatStr === "odi" ||
    formatStr === "50" ||
    formatStr === "oneday" ||
    formatStr === "one-day" ||
    formatStr === "one day";

  const isExplicitT10 =
    /t10|10\s*over|ten10/i.test(allCompetitionText) ||
    formatStr === "t10" ||
    formatStr === "10";

  const isExplicitT20 =
    !isExplicitODI &&
    maxObservedOvers <= 20 &&
    (/t20|twenty20|20\s*over|wbbl|bbl|ipl|psl|cpl|wpl|hundred|blast|smash|premier\s*league|super\s*smash/i.test(allCompetitionText) ||
      formatStr === "t20" ||
      formatStr === "20");

  const isExplicitTest =
    !isExplicitT20 &&
    !isExplicitODI &&
    !isExplicitT10 &&
    formatStr !== "t20" &&
    formatStr !== "20" &&
    formatStr !== "odi" &&
    formatStr !== "50" &&
    formatStr !== "t10" &&
    (/\btest\b|\bfirst.?class\b|\branji\b|\bshield\b/i.test(allCompetitionText) ||
      formatStr === "test" ||
      formatStr === "first class" ||
      score?.isTestMatch === true ||
      sliderScore?.isTestMatch === true ||
      teamInfo?.isTestMatch === true ||
      scoreData?.isTestMatch === true);

  const isTestByFormat =
    !isExplicitT20 &&
    !isExplicitODI &&
    (formatStr === "test" ||
      formatStr === "first class" ||
      formatStr === "multi");

  const isMultiInnings = innings.length > 2 || Boolean(score?.hasMultipleInnings);

  const isTestMatch =
    (isExplicitTest ||
      isTestByFormat ||
      isMultiInnings ||
      maxObservedOvers > 50 ||
      Boolean(score?.isTestMatch) ||
      Boolean(sliderScore?.isTestMatch)) &&
    !isExplicitT20 &&
    !isExplicitODI &&
    !isExplicitT10 &&
    formatStr !== "t20" &&
    formatStr !== "20" &&
    formatStr !== "odi" &&
    formatStr !== "50" &&
    formatStr !== "t10";

  // Check explicit denominator in any overs field (e.g. "41/47.0" or "19.0/47.0")
  let denomOvers = "";
  scoreItems.forEach((item) => {
    const rawVal = getValue(item?.scoreData, "overs") || "";
    if (String(rawVal).includes("/")) {
      const d = String(rawVal).split("/")[1]?.trim();
      if (d && d !== "0") denomOvers = d;
    }
  });
  if (!denomOvers) {
    (Array.isArray(score?.teams) ? score.teams : []).forEach((t) => {
      const rawVal = String(t?.overs ?? t?.ovs ?? "").trim();
      if (rawVal.includes("/")) {
        const d = rawVal.split("/")[1]?.trim();
        if (d && d !== "0") denomOvers = d;
      }
    });
  }

  const rawConfiguredOvers =
    score?.maxOvers ??
    score?.oversLimit ??
    score?.totalOvers ??
    score?.oversTotal ??
    score?.matchOvers ??
    score?.info?.maxOvers ??
    score?.info?.oversLimit ??
    score?.info?.totalOvers ??
    score?.info?.overs ??
    score?.event?.maxOvers ??
    score?.event?.overs ??
    score?.event?.totalOvers ??
    sliderScore?.maxOvers ??
    sliderScore?.totalOvers ??
    sliderScore?.overs ??
    sliderScore?.oversLimit ??
    currentInnings?.maxOvers ??
    currentInnings?.oversLimit ??
    currentInnings?.totalOvers ??
    score?.data?.maxOvers ??
    score?.data?.info?.maxOvers ??
    score?.data?.event?.maxOvers ??
    score?.data?.sliderScore?.totalOvers;

  let configuredOvers = denomOvers || rawConfiguredOvers;
  if (configuredOvers && maxObservedOvers > 20 && parseFloat(configuredOvers) <= 20) {
    configuredOvers = "50";
  }

  let totalOvers = "";
  if (isTestMatch) {
    totalOvers = "";
  } else if (configuredOvers) {
    totalOvers = String(configuredOvers);
  } else if (isExplicitODI || (maxObservedOvers > 20 && maxObservedOvers <= 50)) {
    totalOvers = "50";
  } else if (isExplicitT10) {
    totalOvers = "10";
  } else if (isExplicitT20) {
    totalOvers = "20";
  } else if (maxObservedOvers > 20) {
    totalOvers = "50";
  } else if (maxObservedOvers > 10 && maxObservedOvers <= 20) {
    totalOvers = "20";
  } else {
    totalOvers = "";
  }

  const apiHeaders =
    sliderScore?.headers ||
    sliderScore?.scoreHeaders ||
    sliderScore?.scoreHeader ||
    score?.headers ||
    score?.scoreHeaders ||
    score?.data?.headers ||
    score?.liveDoc?.headers;

  const headers = useMemo(() => {
    if (Array.isArray(apiHeaders) && apiHeaders.length >= 3) {
      return [apiHeaders[0], apiHeaders[1], apiHeaders[2]];
    }
    if (isTestMatch) {
      return ["1ST", "2ND", "RR"];
    }
    return ["SCORE", "OVS", "RR"];
  }, [apiHeaders, isTestMatch]);

  // Calculate Last 6 balls
  const overEndsMap = new Map(
    Object.entries(currentInnings?.overEnds || {}).map(([e, s]) => [Number(e), s]),
  );

  if (currentInnings?.currentOver?.balls?.length) {
    const nextOverNo = Number(
      currentInnings.currentOver.over ||
        (overEndsMap.size > 0 ? Math.max(...overEndsMap.keys()) + 1 : 1),
    );
    overEndsMap.set(nextOverNo, { balls: currentInnings.currentOver.balls });
  }

  const allBallsWithOver = [...overEndsMap.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([overNo, data]) =>
      (data?.balls || []).map((ball) => ({
        overNo,
        ball: String(ball),
      })),
    );

  const last6List = allBallsWithOver.slice(-6);

  let computedLast6 = "";
  if (last6List.length > 0) {
    computedLast6 = last6List
      .map((item, idx) => {
        const prefix =
          idx === 0
            ? ""
            : item.overNo !== last6List[idx - 1].overNo
            ? " | "
            : " ";
        const ballDisplay = item.ball === "0" ? "•" : item.ball;
        return `${prefix}${ballDisplay}`;
      })
      .join("");
  } else {
    const rawLast6 =
      sliderScore?.last6balls ||
      sliderScore?.last6Balls ||
      sliderScore?.lastSixBalls ||
      score?.last6balls ||
      score?.last6Balls ||
      score?.lastSixBalls ||
      score?.recentBalls ||
      score?.data?.last6balls ||
      score?.data?.last6Balls ||
      score?.liveDoc?.last6balls ||
      score?.liveDoc?.last6Balls ||
      teamInfo?.last6balls ||
      teamInfo?.last6Balls ||
      scoreData?.last6balls ||
      scoreData?.last6Balls ||
      currentInnings?.last6Balls ||
      currentInnings?.recentBalls ||
      "";

    if (Array.isArray(rawLast6) && rawLast6.length > 0) {
      computedLast6 = rawLast6
        .slice(-6)
        .map((b) => {
          const s = String(b).trim();
          return s === "0" ? "•" : s;
        })
        .join(" ");
    } else if (typeof rawLast6 === "string" && rawLast6.trim()) {
      computedLast6 = rawLast6.trim();
    }
  }

  // Extract and cache last 6 balls from rawStatus if present
  const last6InStatusMatch = rawStatus.match(/last\s*6\s*balls?:\s*([^\n\r]+)/i);
  if (last6InStatusMatch && last6InStatusMatch[1]) {
    const extracted = last6InStatusMatch[1].trim();
    if (extracted) {
      computedLast6 = extracted;
    }
  }

  if (computedLast6) {
    cachedLast6Ref.current = computedLast6;
  }
  const effectiveLast6 = computedLast6 || cachedLast6Ref.current;

  // Format Status Commentary
  let mainStatus = rawStatus;
  const needMatch = mainStatus.match(/need\s+(\d+)\s+runs?\s+from\s+(\d+)\s+balls?/i);
  if (needMatch) {
    const reqRuns = Number(needMatch[1]);
    const remBalls = Number(needMatch[2]);
    const remOvers = `${Math.floor(remBalls / 6)}.${remBalls % 6}`;
    const rrr = remBalls > 0 ? (reqRuns / (remBalls / 6)).toFixed(1) : "0.0";
    mainStatus = `Win need ${reqRuns} from ${remOvers} ovs. RRR: ${rrr}`;
  }

  if (rawToss) {
    cachedTossRef.current = rawToss;
  }
  const effectiveToss = rawToss || cachedTossRef.current || tossText;

  let tossMsg = normalizeText(effectiveToss).trim();
  if (tossMsg) {
    const lower = tossMsg.toLowerCase();
    if (
      !lower.startsWith("toss") &&
      !lower.includes("won the toss") &&
      (lower.includes("chose to") || lower.includes("elected to") || lower.includes("opted to"))
    ) {
      tossMsg = `Toss: ${tossMsg}`;
    }
  }

  useEffect(() => {
    const statusClean = rawStatus.trim();
    if (!statusClean) return;

    const isPermanent =
      statusClean.toLowerCase().includes("won the toss") ||
      statusClean.toLowerCase().includes("elected to") ||
      statusClean.toLowerCase().includes("opted to") ||
      statusClean.toLowerCase().includes("chose to") ||
      statusClean.toLowerCase().includes("win need") ||
      statusClean.toLowerCase().includes("last 6") ||
      statusClean.toLowerCase().includes("break") ||
      statusClean.toLowerCase().includes("won by") ||
      statusClean.toLowerCase().includes("tied") ||
      statusClean.toLowerCase().includes("day") ||
      statusClean.toLowerCase().includes("session") ||
      statusClean.toLowerCase().includes("stumps") ||
      statusClean.toLowerCase().includes("lunch") ||
      statusClean.toLowerCase().includes("tea") ||
      statusClean.toLowerCase().includes("lead") ||
      statusClean.toLowerCase().includes("trail") ||
      statusClean.toLowerCase().includes("innings break") ||
      statusClean.toLowerCase().includes("rain delay") ||
      statusClean.toLowerCase().includes("no result");

    if (!isPermanent && statusClean !== prevStatusRef.current) {
      prevStatusRef.current = statusClean;
      setTransientCommentary(statusClean);
      if (transientTimerRef.current) clearTimeout(transientTimerRef.current);
      transientTimerRef.current = setTimeout(() => {
        setTransientCommentary("");
      }, 2500);
    }
    return () => {
      if (transientTimerRef.current) clearTimeout(transientTimerRef.current);
    };
  }, [rawStatus]);

  const isMatchStarted =
    innings.length > 0 ||
    scoreItems.some((it) => (it?.scoreData || []).some((sd) => sd?.iconName === "score" && sd?.value));

  let statusToDisplay = "";
  if (mainStatus && (isMatchStarted || !tossMsg)) {
    statusToDisplay = mainStatus.replace(/\.+$/, "").trim();
  } else if (tossMsg) {
    statusToDisplay = tossMsg.replace(/\.+$/, "").trim();
  } else if (mainStatus) {
    statusToDisplay = mainStatus.replace(/\.+$/, "").trim();
  }

  const isInningsBreak =
    rawStatus.toLowerCase().includes("innings break") ||
    rawStatus.toLowerCase().includes("break") ||
    rawStatus.toLowerCase().includes("rain delay") ||
    rawStatus.toLowerCase().includes("match delayed") ||
    rawStatus.toLowerCase().includes("won by") ||
    rawStatus.toLowerCase().includes("tied") ||
    rawStatus.toLowerCase().includes("no result");

  let bottomMessage = "";
  if (transientCommentary) {
    bottomMessage = transientCommentary;
  } else if (isInningsBreak) {
    bottomMessage = statusToDisplay || "Innings Break";
  } else if (/last\s*6\s*balls/i.test(rawStatus)) {
    bottomMessage = rawStatus;
  } else {
    const ballsPart = effectiveLast6 || "• • • • • •";
    bottomMessage = statusToDisplay
      ? `${statusToDisplay} Last 6 balls: ${ballsPart}`
      : `Last 6 balls: ${ballsPart}`;
  }

  const getTeamScoreValues = (rowIndex) => {
    const isBatting = rowIndex === 0 ? !isTeam2Batting : isTeam2Batting;
    const teamObj = teams[rowIndex];
    const targetClean = cleanStr(teamObj?.name);

    if (isTestMatch) {
      // Test match columns: col1 (1ST), col2 (2ND), col3 (RR / role)
      const teamInnings = innings.filter((inn) => {
        const innTeam = cleanStr(inn?.team || inn?.teamName);
        return innTeam && targetClean && (innTeam.includes(targetClean) || targetClean.includes(innTeam));
      });

      let inn1 = teamInnings[0];
      let inn2 = teamInnings[1];

      if (!inn1 && !inn2 && innings.length > 0) {
        inn1 = innings[rowIndex];
        inn2 = innings[rowIndex + 2];
      } else if (inn1 && !inn2 && innings.length >= 3) {
        if (rowIndex === 0 && innings[2]) {
          const inn2Team = cleanStr(innings[2]?.team || innings[2]?.teamName);
          if (!inn2Team || inn2Team.includes(targetClean) || targetClean.includes(inn2Team)) {
            inn2 = innings[2];
          }
        } else if (rowIndex === 1 && innings[3]) {
          inn2 = innings[3];
        }
      }

      const formatTestInningScore = (inn, isCurrent) => {
        if (!inn) return "-";
        const runs = inn.runs !== undefined && inn.runs !== null ? String(inn.runs).trim() : "";
        const wkts = inn.wickets !== undefined && inn.wickets !== null ? String(inn.wickets).trim() : "";
        const ovs = inn.oversText ?? inn.overs ?? "";

        if (runs === "" && wkts === "") return "-";

        const isDeclared = inn.declared || inn.isDeclared;
        const isAllOut = Number(wkts) === 10 || inn.allOut || inn.isAllOut;

        let scoreStr = "";
        if (isAllOut || (!isCurrent && (wkts === "" || Number(wkts) === 10))) {
          scoreStr = `${runs}`;
        } else if (wkts !== "") {
          scoreStr = `${runs}/${wkts}${isDeclared ? " d" : ""}`;
        } else {
          scoreStr = `${runs}`;
        }

        if (isCurrent && ovs) {
          return `${scoreStr} (${ovs})`;
        }
        return scoreStr;
      };

      const isInn2Active = inn2 && (!inn2.done || (isBatting && innings[innings.length - 1] === inn2));
      const isInn1Active = inn1 && (!inn1.done && !inn2);

      let col1 = inn1 ? formatTestInningScore(inn1, isInn1Active && isBatting) : "-";
      let col2 = inn2 ? formatTestInningScore(inn2, isInn2Active && isBatting) : "-";

      const teamItem = scoreItems.find((it) => {
        const itClean = cleanStr(it?.teamName);
        return itClean && targetClean && (itClean.includes(targetClean) || targetClean.includes(itClean));
      }) || scoreItems?.[teamObj?.sourceIndex ?? rowIndex];

      const sd1 =
        getValue(teamItem?.scoreData, "1st") ||
        getValue(teamItem?.scoreData, "firstIngs") ||
        getValue(teamItem?.scoreData, "first") ||
        getValue(teamItem?.scoreData, "score1") ||
        teamItem?.firstIngs ||
        teamObj?.firstIngs ||
        teamItem?.score1;

      const sd2 =
        getValue(teamItem?.scoreData, "2nd") ||
        getValue(teamItem?.scoreData, "secondIngs") ||
        getValue(teamItem?.scoreData, "second") ||
        getValue(teamItem?.scoreData, "score2") ||
        teamItem?.secondIngs ||
        teamObj?.secondIngs ||
        teamItem?.score2;

      if (sd1 && sd1 !== "-") col1 = sd1;
      if (sd2 && sd2 !== "-") col2 = sd2;

      // Fallback: If col1 is still "-", check score and overs so scores are never blank
      if (col1 === "-") {
        const rawScore = getValue(teamItem?.scoreData, "score") || teamObj?.score || "";
        const rawOvers = getValue(teamItem?.scoreData, "overs") || teamObj?.overs || "";
        if (rawScore && rawScore !== "-") {
          col1 = rawOvers && rawOvers !== "-" ? `${rawScore} (${rawOvers})` : String(rawScore);
        }
      }

      let col3 = "";
      const rawRR = getValue(teamItem?.scoreData, "runrate");
      if (rawRR && rawRR !== "0" && rawRR !== "") {
        col3 = String(rawRR);
      } else {
        col3 = isBatting ? "bat" : "ball";
      }

      const sdBatBall = (teamItem?.scoreData || []).find((sd) => sd?.iconName === "bat-ball")?.value;
      if (sdBatBall) {
        col3 = String(sdBatBall).toLowerCase();
      }

      return {
        col1,
        col2,
        col3,
        score: col1,
        overs: col2,
        runrate: col3,
      };
    }

    const teamItem = scoreItems.find((it) => {
      const itClean = cleanStr(it?.teamName);
      return itClean && targetClean && (itClean.includes(targetClean) || targetClean.includes(itClean));
    }) || scoreItems?.[teamObj?.sourceIndex ?? rowIndex];

    let rawScore = getValue(teamItem?.scoreData, "score");
    let rawOvers = getValue(teamItem?.scoreData, "overs");
    let rawRR = getValue(teamItem?.scoreData, "runrate");

    // Also check innings object matching this team
    if (rawScore === "" || rawScore === undefined || rawScore === null) {
      const teamInning = innings.find((inn) => {
        const innTeam = cleanStr(inn?.team || inn?.teamName);
        const tClean = cleanStr(teamObj?.name);
        return innTeam && tClean && (innTeam.includes(tClean) || tClean.includes(innTeam));
      }) || (isBatting ? currentInnings : (innings.length > 1 ? innings.find((inn) => inn !== currentInnings) : null));

      if (teamInning) {
        if (teamInning.runs !== undefined && teamInning.wickets !== undefined) {
          rawScore = `${teamInning.runs}/${teamInning.wickets}`;
        } else if (teamInning.runs !== undefined) {
          rawScore = `${teamInning.runs}`;
        }
        if (
          (rawOvers === "" || rawOvers === undefined || rawOvers === null) &&
          teamInning.oversText !== undefined
        ) {
          rawOvers = teamInning.oversText;
        }
        if (
          (rawRR === "" || rawRR === undefined || rawRR === null) &&
          teamInning.rr !== undefined
        ) {
          rawRR = teamInning.rr;
        }
      }
    }

    const formattedTotalOvers = totalOvers ? String(totalOvers) : "";

    // 1. Format Score:
    let score = "";
    if (rawScore !== "" && rawScore !== null && rawScore !== undefined) {
      let str = String(rawScore).trim().replace("-", "/");
      if (str.endsWith("/10")) {
        str = str.replace(/\/10$/, "");
      }
      score = str;
    } else if (isBatting && isChaseActive) {
      score = "0/0";
    }

    // 2. Format Overs:
    let overs = "";
    if (rawOvers !== "" && rawOvers !== null && rawOvers !== undefined) {
      const cleanOvers = String(rawOvers).trim();
      if (cleanOvers.includes("/")) {
        const parts = cleanOvers.split("/");
        // If the overs had /20 mistakenly in an ODI / 50 over match (or >20 overs bowled):
        if (
          formattedTotalOvers &&
          parts[1] &&
          parts[1] !== formattedTotalOvers &&
          (maxObservedOvers > 20 || isExplicitODI || parseFloat(formattedTotalOvers) > 20)
        ) {
          overs = `${parts[0]}/${formattedTotalOvers}`;
        } else {
          overs = cleanOvers;
        }
      } else if (formattedTotalOvers && !isTestMatch) {
        overs = `${cleanOvers}/${formattedTotalOvers}`;
      } else {
        overs = cleanOvers;
      }
    } else if (isBatting && isChaseActive) {
      overs = formattedTotalOvers && !isTestMatch ? `0/${formattedTotalOvers}` : "0";
    }

    // 3. Format Run Rate:
    let runrate = "";
    if (rawRR !== "" && rawRR !== null && rawRR !== undefined) {
      const num = Number(rawRR);
      runrate = !isNaN(num) ? num.toFixed(1) : String(rawRR);
    } else if (isBatting && isChaseActive) {
      runrate = "0.0";
    }

    return {
      col1: score,
      col2: overs,
      col3: runrate,
      score,
      overs,
      runrate,
    };
  };

  return (
    <div className="pricing-page-top__match-centre w-full lg:w-[99.25%] lg:relative lg:left-[3px] m-0 overflow-hidden h-[150px]">
      <div className="match-centre__score-and-events desktopView flex flex-col justify-center w-full bg-black mb-0 h-[150px]">
        <div className="item ng-star-inserted">
          <div className="cricket mc-sc text-white">
            <div className="mc-sc__ctnr flex items-center mx-[6px] pb-[10px]">
              {/* LEFT TEAM DETAILS */}
              <div className="mc-sc__tm-dtl w-[50%] md:w-[48%] relative">
                <div className="mc-sc__add-inf flex uppercase text-[13px] text-[#ccc6c6] mt-[7px] font-[Arial,Helvetica,Tahoma,sans-serif] text-left leading-[28px] h-[28px]">
                  <div
                    style={{
                      fontSize: "13px",
                      textTransform: "capitalize",
                      fontWeight: 500,
                    }}
                  >
                    Powered By Universe Score
                  </div>
                </div>

                {teams.map((team, index) => {
                  const showBat = isTeamBatting(index);
                  const flagUrl = getFlagUrl(team.flag, team.name);
                  return (
                    <div
                      key={`team-row-${index}`}
                      className="mc-sc__tm-ctnr flex items-center leading-[19px] h-[34px]"
                    >
                      {/* Bat/Ball SVG Icon - only show when NOT test match */}
                      {!isTestMatch && (
                        <div
                          className={`score-item pos1 bat-ball ${
                            showBat ? "val-bat" : "val-ball"
                          } w-[20px] overflow-hidden font-bold font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[14px] text-[#b2b2b2] flex items-center justify-center shrink-0`}
                        >
                          <span className="ng-star-inserted">
                            <img
                              className={`score-item__img ${
                                showBat ? "bat" : "ball"
                              } bat-ball w-[13px] inline-block align-middle text-center shrink-0`}
                              src={showBat ? "/bat.svg" : "/ball.svg"}
                              alt={showBat ? "bat" : "ball"}
                            />
                          </span>
                        </div>
                      )}

                      {/* Team Strip / Kit fetched from API */}
                      <div className="team-kit w-[35px] shrink-0">
                        <div className="team-strip small w-[20px] overflow-hidden font-bold font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[14px] text-right mx-[5px] min-w-[18px] lg:relative lg:right-[2px]">
                          {flagUrl ? (
                            <img
                              src={flagUrl}
                              alt=""
                              className="w-[18px] h-[24px] inline-block align-middle text-center max-md:relative max-md:right-[2px] object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}
                        </div>
                      </div>

                      {/* Team Name & Extra Info */}
                      <div className="mc-sc__tm-dtls-container flex relative flex-1 min-w-0 flex-col justify-center">
                        <div className="mc-sc__team-and-score font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[14px] font-bold uppercase flex-auto flex text-left overflow-visible tracking-[1.2px] items-center">
                          <div className="mc-sc__team-name overflow-hidden whitespace-nowrap text-ellipsis !font-[500] text-white">
                            {team.name}
                          </div>
                        </div>
                        {team.subText && (
                          <div className="mc-sc__team-extra-info absolute top-[20px] w-full">
                            <div className="score-item pos4 currentBatsman w-full text-[9px] leading-[9px] h-[20px] relative font-['Open_Sans',Arial,sans-serif] text-[#b4b4b4] overflow-hidden whitespace-nowrap text-ellipsis">
                              <span className="score-item__value m-0 inline-block">
                                {team.subText || ""}
                                <span className="score-item__extra-info text-[10px] relative top-[-4px] left-[-3px]" />
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT SCORE DETAILS */}
              <div className="mc-sc__score-detail w-[50%] md:w-[52%]">
                <div className="mc-sc__score-header flex leading-[28px] h-[28px] my-[3px_4px] text-[11px] uppercase font-normal text-white font-['Century_Gothic','Century_Gothic_W01',sans-serif]">
                  <div className={`${isTestMatch ? "w-[40%]" : "w-[30%]"} text-center overflow-hidden whitespace-nowrap text-ellipsis`}>
                    {headers[0]}
                  </div>
                  <div className={`${isTestMatch ? "w-[38%]" : "w-[45%]"} text-center overflow-hidden whitespace-nowrap text-ellipsis`}>
                    {headers[1]}
                  </div>
                  <div className={`${isTestMatch ? "w-[22%]" : "w-[25%]"} text-center md:text-right md:pr-4 overflow-hidden whitespace-nowrap text-ellipsis`}>
                    {headers[2]}
                  </div>
                </div>

                {/* Values Rows */}
                <div>
                  {teams.map((team, index) => {
                    const rowValues = getTeamScoreValues(index);
                    const col1Val = rowValues.col1;
                    const col2Val = rowValues.col2;
                    const col3Val = rowValues.col3;

                    return (
                      <div
                        key={`score-val-${index}`}
                        className="mc-sc__score-values flex items-center leading-[32px] h-[32px] text-[12px] font-['Century_Gothic','Century_Gothic_W01',sans-serif]"
                      >
                        <div className={`${isTestMatch ? "w-[40%]" : "w-[30%]"} text-center overflow-hidden whitespace-nowrap text-ellipsis font-bold text-[#b2b2b2]`}>
                          <span className="score-item__value mx-auto inline-block">
                            {col1Val}
                          </span>
                        </div>
                        <div className={`${isTestMatch ? "w-[38%]" : "w-[45%]"} text-center overflow-hidden whitespace-nowrap text-ellipsis font-normal text-[#b2b2b2]`}>
                          <span className="score-item__value mx-auto inline-block">
                            {col2Val}
                          </span>
                        </div>
                        <div className={`${isTestMatch ? "w-[22%]" : "w-[25%]"} text-center md:text-right md:pr-4 overflow-hidden whitespace-nowrap text-ellipsis font-normal text-[#b2b2b2]`}>
                          <span className="score-item__value mx-auto inline-block">
                            {col3Val}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BOTTOM STATUS / COMMENTARY - STATIC LEFT ALIGNED */}
            <div className="mc-sc__status-text h-[16px] w-full my-[3px]  text-white overflow-hidden whitespace-nowrap text-ellipsis text-left ">
              <div className="text-[12px] md:text-[13px] text-[#B2B2B2] overflow-hidden whitespace-nowrap text-ellipsis text-left font-[Tahoma,Helvetica,sans-serif] font-normal">
                {bottomMessage || ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CricketScoreBoard;
