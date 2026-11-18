import React, { useMemo, useRef } from "react";

const getFlagUrl = (flagName, teamName = "") => {
  if (flagName && (flagName.startsWith("http://") || flagName.startsWith("https://"))) {
    return flagName;
  }
  if (flagName) {
    const cleanFlag = String(flagName).trim();
    if (cleanFlag.includes("TeamKit") || cleanFlag.startsWith("TeamKit_")) {
      const ext = cleanFlag.includes(".") ? "" : ".svg";
      return `https://spxstatic.com/sports/others/media/spTeamKits/${cleanFlag}${ext}`;
    }
    const cleanId = cleanFlag.replace(/\.(png|svg|jpg)$/i, "");
    return `https://spxstatic.com/sports/others/media/spTeamKits/TeamKit_${cleanId}.svg`;
  }
  if (teamName) {
    const cleanTeam = String(teamName)
      .replace(/\s*\(W\)/i, "")
      .replace(/\s*women/i, "")
      .trim()
      .replace(/\s+/g, "");
    if (cleanTeam && cleanTeam !== "-") {
      return `https://spxstatic.com/sports/others/media/spTeamKits/TeamKit_${cleanTeam}.svg`;
    }
  }
  return "";
};

function SoccerScoreBoard({ scoreData, eventName: propEventName, eventId: propEventId }) {
  const lockedTeamsRef = useRef({ eventId: null, team1: "", team2: "" });

  // Gather all possible candidate layers and response envelopes
  const candidates = useMemo(() => {
    const list = [];
    const seen = new Set();
    const add = (obj) => {
      if (!obj || typeof obj !== "object" || seen.has(obj)) return;
      seen.add(obj);
      list.push(obj);
      if (obj.data && typeof obj.data === "object") add(obj.data);
      if (obj.score && typeof obj.score === "object") add(obj.score);
      if (obj.liveDoc && typeof obj.liveDoc === "object") add(obj.liveDoc);
      if (obj.slider && Array.isArray(obj.slider) && obj.slider[0]?.score) add(obj.slider[0].score);
    };
    add(scoreData);
    return list;
  }, [scoreData]);

  // Find sliderScore / nestedScore
  const nestedScore = useMemo(() => {
    for (const c of candidates) {
      const s =
        c?.liveDoc?.slider?.[0]?.score ||
        c?.slider?.[0]?.score ||
        (Array.isArray(c?.scoreItems) ? c : null);
      if (s) return s;
    }
    return {};
  }, [candidates]);

  const info = nestedScore?.teamInfo || {};

  // Find scoreItems
  const itemRows = useMemo(() => {
    if (Array.isArray(nestedScore?.scoreItems) && nestedScore.scoreItems.length) {
      return nestedScore.scoreItems;
    }
    for (const c of candidates) {
      if (Array.isArray(c?.scoreItems) && c.scoreItems.length) {
        return c.scoreItems;
      }
    }
    return [];
  }, [nestedScore, candidates]);

  // Find teams
  const rawTeams = useMemo(() => {
    for (const c of candidates) {
      if (Array.isArray(c?.event?.teams) && c.event.teams.length) return c.event.teams;
      if (Array.isArray(c?.teams) && c.teams.length) return c.teams;
    }
    return [];
  }, [candidates]);

  const getFromCandidates = (fn) => {
    for (const c of candidates) {
      if (!c || typeof c !== "object") continue;
      try {
        const val = fn(c);
        if (val !== undefined && val !== null && val !== "") return val;
      } catch (e) {
        // ignore
      }
    }
    return undefined;
  };

  const data = candidates[0] || {};

  const extractName = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item.trim();
    return (item.teamName || item.name || item.shortName || "").trim();
  };

  const formatTeamName = (name) => {
    if (!name) return "-";
    let str = String(name).trim();
    str = str.replace(/\bwomen\b/i, "(W)");
    str = str.replace(/\(women\)/i, "(W)");
    str = str.replace(/\s+\(W\)/i, " (W)");
    return str;
  };

  const rawTeam1Name =
    getFromCandidates((c) => extractName(c?.homeTeam) || extractName(c?.home) || extractName(c?.homeName)) ||
    extractName(rawTeams[0]) ||
    extractName(info?.team1Name) ||
    extractName(itemRows[0]) ||
    "";

  const rawTeam2Name =
    getFromCandidates((c) => extractName(c?.awayTeam) || extractName(c?.away) || extractName(c?.awayName)) ||
    extractName(rawTeams[1]) ||
    extractName(info?.team2Name) ||
    extractName(itemRows[1]) ||
    "";

  const matchEventName =
    propEventName ||
    getFromCandidates((c) => c?.event?.name || c?.event?.eventName || c?.eventName) ||
    "";

  const currentEventId = String(
    propEventId ||
      getFromCandidates((c) => c?.eventId || c?.exEventId || c?.event?.id) ||
      "",
  );

  if (currentEventId && lockedTeamsRef.current.eventId !== currentEventId) {
    lockedTeamsRef.current = { eventId: currentEventId, team1: "", team2: "" };
  }

  let canonTeam1 = lockedTeamsRef.current.team1;
  let canonTeam2 = lockedTeamsRef.current.team2;

  if (!canonTeam1 || !canonTeam2) {
    if (matchEventName && /\s+(?:v|vs|v\.|vs\.|\/|-)\s+/i.test(matchEventName)) {
      const parts = matchEventName.split(/\s+(?:v|vs|v\.|vs\.|\/|-)\s+/i);
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

  const team1Name = canonTeam1 || formatTeamName(rawTeam1Name) || "Team 1";
  const team2Name = canonTeam2 || formatTeamName(rawTeam2Name) || "Team 2";

  const cleanStr = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const extractFlag = (idx) => {
    const targetTeamName = idx === 0 ? team1Name : team2Name;
    const targetClean = cleanStr(targetTeamName);

    const tInfoFlag =
      idx === 0
        ? info?.team1Kit || info?.team1TeamKit || info?.team1Flag || info?.team1Jersey
        : info?.team2Kit || info?.team2TeamKit || info?.team2Flag || info?.team2Jersey;

    const matchedTObj = (Array.isArray(rawTeams) ? rawTeams : []).find(
      (t) => targetClean && cleanStr(t?.name || t?.teamName).includes(targetClean),
    ) || rawTeams?.[idx];

    const matchedItem = itemRows.find(
      (it) => targetClean && cleanStr(it?.teamName).includes(targetClean),
    ) || itemRows?.[idx];

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

  const rows = [
    { name: team1Name, flag: extractFlag(0), index: 0 },
    { name: team2Name, flag: extractFlag(1), index: 1 },
  ];

  const getTeamStat = (rowIndex, statType) => {
    const teamObj = rows[rowIndex];
    const teamClean = cleanStr(teamObj?.name);
    const mItem = itemRows.find((it) => {
      const itClean = cleanStr(it?.teamName || it?.name);
      return itClean && teamClean && (itClean.includes(teamClean) || teamClean.includes(itClean));
    }) || itemRows?.[rowIndex];

    const rawSD = mItem?.scoreData;
    const scoreData = Array.isArray(rawSD)
      ? rawSD
      : rawSD && typeof rawSD === "object"
      ? Object.entries(rawSD).map(([k, v]) => ({ iconName: k, value: v }))
      : [];
    const findInScoreData = (keys, fallbackIndex = -1) => {
      for (const k of keys) {
        const lowerK = String(k).toLowerCase();
        const found = scoreData.find((sd) => {
          const sIcon = String(sd?.iconName || "").toLowerCase();
          const sName = String(sd?.name || "").toLowerCase();
          const sKey = String(sd?.key || "").toLowerCase();
          const sPos = String(sd?.pos !== undefined ? sd?.pos : "").toLowerCase();
          const sType = String(sd?.type || "").toLowerCase();
          return (
            sIcon === lowerK ||
            sName === lowerK ||
            sKey === lowerK ||
            sPos === lowerK ||
            sType === lowerK
          );
        });
        if (found?.value !== undefined && found?.value !== null && found?.value !== "") {
          return String(found.value);
        }
      }

      if (fallbackIndex >= 0 && scoreData[fallbackIndex] !== undefined) {
        const itemObj = scoreData[fallbackIndex];
        const itemVal =
          typeof itemObj === "object" && itemObj !== null
            ? (itemObj.value ?? itemObj.val ?? itemObj.text)
            : itemObj;
        if (itemVal !== undefined && itemVal !== null && itemVal !== "") {
          return String(itemVal);
        }
      }

      return null;
    };

    if (statType === "score") {
      const fromSD = findInScoreData(
        ["score", "goals", "ft", "fulltime", "full-time", "goal", "currentscore"],
        0,
      );
      if (fromSD !== null) return fromSD;

      const mVal = mItem?.score ?? mItem?.goals ?? mItem?.ft ?? mItem?.goal;
      if (mVal !== undefined && mVal !== null && mVal !== "") return String(mVal);

      const teamVal = rawTeams[rowIndex]?.score ?? rawTeams[rowIndex]?.goals;
      if (teamVal !== undefined && teamVal !== null && teamVal !== "") return String(teamVal);

      const candidateVal =
        rowIndex === 0
          ? getFromCandidates(
              (c) =>
                c?.homeScore ??
                c?.score?.home ??
                c?.scores?.home ??
                c?.scoreHome ??
                c?.goals?.home ??
                c?.homeGoals,
            )
          : getFromCandidates(
              (c) =>
                c?.awayScore ??
                c?.score?.away ??
                c?.scores?.away ??
                c?.scoreAway ??
                c?.goals?.away ??
                c?.awayGoals,
            );
      if (candidateVal !== undefined && candidateVal !== null && candidateVal !== "") {
        return String(candidateVal);
      }

      return "0";
    }

    if (statType === "ht") {
      const fromSD = findInScoreData(
        [
          "ht",
          "htscore",
          "halftime",
          "half-time",
          "half_time",
          "firsthalf",
          "1sthalf",
          "ht1",
          "h_t",
        ],
        1,
      );
      if (fromSD !== null && fromSD !== "-") return fromSD;

      const mItemHT =
        mItem?.ht ??
        mItem?.halfTime ??
        mItem?.htScore ??
        mItem?.half_time ??
        mItem?.scores?.ht;
      if (mItemHT !== undefined && mItemHT !== null && mItemHT !== "" && mItemHT !== "-") {
        return String(mItemHT);
      }

      const teamHT =
        rawTeams[rowIndex]?.ht ??
        rawTeams[rowIndex]?.halfTime ??
        rawTeams[rowIndex]?.htScore;
      if (teamHT !== undefined && teamHT !== null && teamHT !== "" && teamHT !== "-") {
        return String(teamHT);
      }

      const candidateHT =
        rowIndex === 0
          ? getFromCandidates(
              (c) =>
                c?.homeHT ??
                c?.htHome ??
                c?.ht?.home ??
                c?.halfTimeScore?.home ??
                c?.scores?.ht?.home ??
                c?.htScore?.home ??
                c?.half_time?.home ??
                c?.score?.ht?.home ??
                (Array.isArray(c?.ht) ? c?.ht?.[0] : undefined),
            )
          : getFromCandidates(
              (c) =>
                c?.awayHT ??
                c?.htAway ??
                c?.ht?.away ??
                c?.halfTimeScore?.away ??
                c?.scores?.ht?.away ??
                c?.htScore?.away ??
                c?.half_time?.away ??
                c?.score?.ht?.away ??
                (Array.isArray(c?.ht) ? c?.ht?.[1] : undefined),
            );
      if (
        candidateHT !== undefined &&
        candidateHT !== null &&
        candidateHT !== "" &&
        candidateHT !== "-"
      ) {
        return String(candidateHT);
      }

      return "0";
    }

    if (statType === "corners") {
      const fromSD = findInScoreData(
        ["corner", "corners", "corner-flag", "cornerflag", "corner_flag", "cnr"],
        2,
      );
      if (fromSD !== null) return fromSD;

      const mVal =
        mItem?.corners ??
        mItem?.corner ??
        mItem?.cornerCount ??
        mItem?.cornerKicks;
      if (mVal !== undefined && mVal !== null && mVal !== "") return String(mVal);

      const teamVal =
        rawTeams[rowIndex]?.corners ??
        rawTeams[rowIndex]?.corner ??
        rawTeams[rowIndex]?.cornerCount;
      if (teamVal !== undefined && teamVal !== null && teamVal !== "") return String(teamVal);

      const candidateVal =
        rowIndex === 0
          ? getFromCandidates(
              (c) =>
                c?.homeCorners ??
                c?.corners?.home ??
                c?.cornerHome ??
                c?.corner?.home ??
                c?.cornerKicks?.home ??
                (Array.isArray(c?.corners) ? c?.corners?.[0] : undefined),
            )
          : getFromCandidates(
              (c) =>
                c?.awayCorners ??
                c?.corners?.away ??
                c?.cornerAway ??
                c?.corner?.away ??
                c?.cornerKicks?.away ??
                (Array.isArray(c?.corners) ? c?.corners?.[1] : undefined),
            );
      if (candidateVal !== undefined && candidateVal !== null && candidateVal !== "") {
        return String(candidateVal);
      }

      return "0";
    }

    if (statType === "yellow") {
      const fromSD = findInScoreData(
        ["yellow", "yellowcard", "yellow-card", "yellowcards", "yellow_card"],
        3,
      );
      if (fromSD !== null) return fromSD;

      const mVal =
        mItem?.yellow ??
        mItem?.yellowCard ??
        mItem?.yellowCards ??
        mItem?.yellows;
      if (mVal !== undefined && mVal !== null && mVal !== "") return String(mVal);

      const teamVal =
        rawTeams[rowIndex]?.yellow ?? rawTeams[rowIndex]?.yellowCards;
      if (teamVal !== undefined && teamVal !== null && teamVal !== "") return String(teamVal);

      const candidateVal =
        rowIndex === 0
          ? getFromCandidates(
              (c) =>
                c?.homeYellow ??
                c?.yellow?.home ??
                c?.yellowCards?.home ??
                c?.yellowCard?.home ??
                (Array.isArray(c?.yellow) ? c?.yellow?.[0] : undefined),
            )
          : getFromCandidates(
              (c) =>
                c?.awayYellow ??
                c?.yellow?.away ??
                c?.yellowCards?.away ??
                c?.yellowCard?.away ??
                (Array.isArray(c?.yellow) ? c?.yellow?.[1] : undefined),
            );
      if (candidateVal !== undefined && candidateVal !== null && candidateVal !== "") {
        return String(candidateVal);
      }

      return "0";
    }

    if (statType === "red") {
      const fromSD = findInScoreData(
        ["red", "redcard", "red-card", "redcards", "red_card"],
        4,
      );
      if (fromSD !== null) return fromSD;

      const mVal = mItem?.red ?? mItem?.redCard ?? mItem?.redCards ?? mItem?.reds;
      if (mVal !== undefined && mVal !== null && mVal !== "") return String(mVal);

      const teamVal = rawTeams[rowIndex]?.red ?? rawTeams[rowIndex]?.redCards;
      if (teamVal !== undefined && teamVal !== null && teamVal !== "") return String(teamVal);

      const candidateVal =
        rowIndex === 0
          ? getFromCandidates(
              (c) =>
                c?.homeRed ??
                c?.red?.home ??
                c?.redCards?.home ??
                c?.redCard?.home ??
                (Array.isArray(c?.red) ? c?.red?.[0] : undefined),
            )
          : getFromCandidates(
              (c) =>
                c?.awayRed ??
                c?.red?.away ??
                c?.redCards?.away ??
                c?.redCard?.away ??
                (Array.isArray(c?.red) ? c?.red?.[1] : undefined),
            );
      if (candidateVal !== undefined && candidateVal !== null && candidateVal !== "") {
        return String(candidateVal);
      }

      return "0";
    }

    return "0";
  };

  const normalizeText = (value) => {
    if (value === null || value === undefined) return "";
    return typeof value === "object" ? value?.value ?? value?.text ?? "" : String(value);
  };

  const statusText = normalizeText(
    getFromCandidates(
      (c) =>
        c?.statusCommentary ??
        c?.statusCommentry ??
        c?.status ??
        c?.matchStatus ??
        c?.commentary ??
        (c?.minute != null ? `${c.minute}'` : undefined) ??
        (c?.matchTime != null ? `${c.matchTime}'` : undefined),
    ) ||
      nestedScore?.statusCommentary ||
      "",
  );

  return (
    <div className="pricing-page-top__match-centre w-full lg:w-[99.25%] lg:relative lg:left-[3px] m-0 overflow-hidden h-[150px]">
      <div className="match-centre__score-and-events desktopView flex flex-col justify-center w-full bg-black mb-0 h-[150px] px-3 sm:px-4">
        <div className="item ng-star-inserted w-full">
          <div className="soccer mc-sc text-white w-full">
            {/* 1. HEADER ROW: Powered By Universe Score (Left) + 5 Stat Icons (Right) */}
            <div className="flex items-center justify-between h-[28px] w-full border-b border-transparent">
              {/* Left: Powered By Universe Score (Exact Cricket style) */}
              <div className="mc-sc__add-inf flex uppercase text-[13px] text-[#ccc6c6] font-[Arial,Helvetica,Tahoma,sans-serif] text-left leading-[28px] h-[28px]">
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

              {/* Right: 5 Column Headers using user uploaded SVGs */}
              <div className="flex items-center justify-end shrink-0">
                {/* 1. Soccer Ball (Goals) - /goal.svg */}
                <div className="w-[34px] sm:w-[38px] shrink-0 flex items-center justify-center">
                  <img
                    src="/goal.svg"
                    alt="goals"
                    className="w-[16px] h-[16px] object-contain"
                  />
                </div>

                {/* 2. HT (Exact Cricket header style) */}
                <div className="w-[34px] sm:w-[38px] shrink-0 flex items-center justify-center font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[11px] font-normal text-[#FFFFFF]">
                  HT
                </div>

                {/* 3. Corner Flag - /corner.svg */}
                <div className="w-[34px] sm:w-[38px] shrink-0 flex items-center justify-center">
                  <img
                    src="/corner.svg"
                    alt="corners"
                    className="w-[10px] h-[17px] object-contain"
                  />
                </div>

                {/* 4. Yellow Card - /yellow-card.svg */}
                <div className="w-[34px] sm:w-[38px] shrink-0 flex items-center justify-center">
                  <img
                    src="/yellow-card.svg"
                    alt="yellow card"
                    className="w-[11px] h-[15px] object-contain"
                  />
                </div>

                {/* 5. Red Card - /red-card.svg */}
                <div className="w-[34px] sm:w-[38px] shrink-0 flex items-center justify-center">
                  <img
                    src="/red-card.svg"
                    alt="red card"
                    className="w-[11px] h-[15px] object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 2. TEAM ROWS */}
            <div className="flex flex-col justify-center">
              {rows.map((row, index) => {
                const flagUrl = getFlagUrl(row.flag, row.name);
                const scoreVal = getTeamStat(index, "score");
                const htVal = getTeamStat(index, "ht");
                const cornersVal = getTeamStat(index, "corners");
                const yellowVal = getTeamStat(index, "yellow");
                const redVal = getTeamStat(index, "red");

                return (
                  <div
                    key={`soccer-team-row-${index}`}
                    className="flex items-center justify-between h-[34px] leading-[34px] w-full"
                  >
                    {/* Left: Jersey + Team Name (Exact Cricket style) */}
                    <div className="flex items-center min-w-0 flex-1 pr-2">
                      {/* Jersey border box with native img */}
                      <div className="w-[24px] h-[24px] shrink-0 mr-[8px] flex items-center justify-center border border-[#777] rounded-[1px] bg-black overflow-hidden">
                        {flagUrl ? (
                          <img
                            src={flagUrl}
                            alt=""
                            className="w-[18px] h-[20px] object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                      </div>

                      {/* Team Name in Exact Cricket typography */}
                      <div className="mc-sc__team-and-score font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[14px] uppercase flex-auto flex text-left overflow-hidden tracking-[1.2px] items-center">
                        <div
                          className="mc-sc__team-name overflow-hidden whitespace-nowrap text-ellipsis !font-[500] text-white"
                          title={row.name}
                        >
                          {row.name}
                        </div>
                      </div>
                    </div>

                    {/* Right: 5 Stat Values (Exact Cricket typography) */}
                    <div className="flex items-center justify-end shrink-0">
                      {/* 1. Goals */}
                      <div className="w-[34px] sm:w-[38px] shrink-0 text-center font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[13px] md:text-[14px] font-normal text-white">
                        {scoreVal}
                      </div>

                      {/* 2. HT */}
                      <div className="w-[34px] sm:w-[38px] shrink-0 text-center font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[13px] md:text-[14px] font-normal text-white">
                        {htVal}
                      </div>

                      {/* 3. Corners */}
                      <div className="w-[34px] sm:w-[38px] shrink-0 text-center font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[13px] md:text-[14px] font-normal text-white">
                        {cornersVal}
                      </div>

                      {/* 4. Yellow Cards */}
                      <div className="w-[34px] sm:w-[38px] shrink-0 text-center font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[13px] md:text-[14px] font-normal text-white">
                        {yellowVal}
                      </div>

                      {/* 5. Red Cards */}
                      <div className="w-[34px] sm:w-[38px] shrink-0 text-center font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[13px] md:text-[14px] font-normal text-white">
                        {redVal}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. BOTTOM STATUS / COMMENTARY (Exact Cricket style) */}
            <div className="mc-sc__status-text h-[16px] w-full my-[3px] text-white overflow-hidden whitespace-nowrap text-ellipsis text-left">
              <div className="text-[12px] md:text-[13px] text-[#B2B2B2] overflow-hidden whitespace-nowrap text-ellipsis text-left font-[Tahoma,Helvetica,sans-serif] font-normal">
                {statusText || ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoccerScoreBoard;
