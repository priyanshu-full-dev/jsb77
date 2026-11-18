import React from "react";

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
    const cleanTeam = String(teamName).trim().replace(/\s+/g, "");
    if (cleanTeam && cleanTeam !== "-") {
      return `https://spxstatic.com/sports/others/media/spTeamKits/TeamKit_${cleanTeam}.svg`;
    }
  }
  return "";
};

function TennisScoreBoard({ scoreData }) {
  const sourceData = React.useMemo(() => {
    if (scoreData?.data?.data?.exEventId || scoreData?.data?.data?.liveDoc) return scoreData.data.data;
    if (scoreData?.data?.exEventId || scoreData?.data?.liveDoc) return scoreData.data;
    return scoreData;
  }, [scoreData]);

  const raw = sourceData?.score && typeof sourceData.score === "object" ? sourceData.score : sourceData;
  const data = raw?.data?.data ?? raw?.data ?? raw ?? {};
  const nestedScore = data?.liveDoc?.slider?.[0]?.score ?? data?.slider?.[0]?.score ?? data?.data?.liveDoc?.slider?.[0]?.score;
  const info = nestedScore?.teamInfo ?? data?.teamInfo ?? {};
  const itemRows = nestedScore?.scoreItems ?? data?.scoreItems ?? [];
  const rawTeams = Array.isArray(data?.event?.teams) ? data.event.teams : Array.isArray(data?.teams) ? data.teams : [];

  const teamName = (value, fallback) =>
    typeof value === "string" ? value : value?.name ?? value?.teamName ?? value?.shortName ?? fallback;

  const home = data?.homeTeam ?? data?.home ?? data?.homeName ?? rawTeams[0] ?? info?.team1Name;
  const away = data?.awayTeam ?? data?.away ?? data?.awayName ?? rawTeams[1] ?? info?.team2Name;

  const getTeamRow = (index, name) =>
    itemRows.find((item) => String(item?.teamName) === String(name)) ?? itemRows[index] ?? {};

  const rows = [
    { name: teamName(home, info?.team1Name ?? "Player 1"), source: getTeamRow(0, teamName(home, info?.team1Name)), raw: home },
    { name: teamName(away, info?.team2Name ?? "Player 2"), source: getTeamRow(1, teamName(away, info?.team2Name)), raw: away },
  ];

  const getItem = (row, keys) => {
    for (const key of keys) {
      const found = (row?.scoreData ?? []).find((item) => item?.iconName === key);
      if (found?.value !== undefined && found?.value !== null && found.value !== "") return found.value;
    }
    return "";
  };

  const tennisPlayers = Array.isArray(data?.players) ? data.players : [];
  const tennisSets = Array.isArray(data?.sets) ? data.sets : Array.isArray(data?.setScores) ? data.setScores : [];
  const tennisPoints = Array.isArray(data?.points) ? data.points : [];

  const extractFlag = (idx, row) => {
    const tInfoFlag =
      idx === 0
        ? info?.team1Kit || info?.team1TeamKit || info?.team1Flag || info?.team1Jersey
        : info?.team2Kit || info?.team2TeamKit || info?.team2Flag || info?.team2Jersey;

    const tObj =
      rawTeams?.[idx] ||
      data?.teams?.[idx] ||
      data?.event?.teams?.[idx] ||
      (idx === 0 ? home : away);

    const sItem = itemRows?.[idx] || row?.source;

    return (
      tInfoFlag ||
      tObj?.kit ||
      tObj?.teamKit ||
      tObj?.jersey ||
      tObj?.flag ||
      tObj?.flagName ||
      sItem?.kit ||
      sItem?.teamKit ||
      sItem?.flag ||
      sItem?.flagName ||
      row?.raw?.kit ||
      row?.raw?.flag ||
      ""
    );
  };

  const displayRows = tennisPlayers.length
    ? tennisPlayers.slice(0, 2).map((player, index) => {
        const pName = teamName(player, `Player ${index + 1}`);
        return {
          name: pName,
          source: rows[index]?.source,
          raw: player,
          index,
          flag: extractFlag(index, { raw: player, source: rows[index]?.source }),
        };
      })
    : rows.map((row, index) => ({
        ...row,
        index,
        flag: extractFlag(index, row),
      }));

  const hasData = tennisPlayers.length > 0 || tennisSets.length > 0 || itemRows.length > 0 || Boolean(home || away);

  if (!hasData) {
    return (
      <div className="w-full h-[150px] bg-black flex items-center justify-center overflow-hidden">
        <span className="text-[#999] text-[13px]">Score not available</span>
      </div>
    );
  }

  // Columns: SETS, 1, 2, 3 (set numbers), PTS
  const hasSet4 = displayRows.some(
    (r) =>
      getItem(r.source, ["set-3", "set4", "set_4"]) !== "" ||
      Boolean(r?.raw?.set4 || r?.raw?.set_4),
  );
  const hasSet5 = displayRows.some(
    (r) =>
      getItem(r.source, ["set-4", "set5", "set_5"]) !== "" ||
      Boolean(r?.raw?.set5 || r?.raw?.set_5),
  );
  const numSets = Math.max(tennisSets.length, hasSet5 ? 5 : hasSet4 ? 4 : 3);

  const setCols = Array.from({ length: numSets }, (_, i) => ({
    key: `set-${i}`,
    title: String(i + 1),
    setIndex: i,
  }));

  const tennisColumns = [
    { key: "sets", title: "SETS", isSetsTotal: true },
    ...setCols,
    { key: "points", title: "PTS", isPoints: true },
  ];

  const tennisSetValue = (columnIndex, idx, rowName) => {
    // 1. Check scoreData item
    const fromScoreData = getItem(displayRows[idx]?.source, [
      `set-${columnIndex}`,
      `set${columnIndex + 1}`,
      `set_${columnIndex + 1}`,
      `s${columnIndex + 1}`,
    ]);
    if (fromScoreData !== "" && fromScoreData !== undefined && fromScoreData !== null) {
      return fromScoreData;
    }
    // 2. Check row.raw
    const direct =
      displayRows[idx]?.raw?.[`set${columnIndex + 1}`] ??
      displayRows[idx]?.raw?.[`set_${columnIndex + 1}`] ??
      displayRows[idx]?.raw?.[`s${columnIndex + 1}`];
    if (direct !== undefined && direct !== null && direct !== "") {
      return direct;
    }
    // 3. Check tennisSets
    const set = tennisSets[columnIndex];
    if (Array.isArray(set)) return set[idx] ?? "";
    if (set && typeof set === "object") {
      return set?.[idx] ?? set?.[`player${idx + 1}`] ?? set?.[rowName] ?? set?.score?.[idx] ?? "";
    }
    return "";
  };

  const getSetsWon = (row, idx) => {
    const fromItem = getItem(row?.source, ["sets", "score", "totalSets", "setsWon"]);
    if (fromItem !== "" && fromItem !== undefined && fromItem !== null) {
      return fromItem;
    }
    const directSets = row?.raw?.sets ?? row?.raw?.totalSets ?? row?.raw?.setsWon;
    if (directSets !== undefined && directSets !== null && directSets !== "") {
      return directSets;
    }
    if (Array.isArray(data?.setsWon) && data.setsWon[idx] !== undefined) {
      return data.setsWon[idx];
    }
    if (Array.isArray(data?.scores) && data.scores[idx] !== undefined) {
      return data.scores[idx];
    }
    let count = 0;
    for (let c = 0; c < numSets; c++) {
      const s0 = Number(tennisSetValue(c, 0, displayRows[0]?.name) || 0);
      const s1 = Number(tennisSetValue(c, 1, displayRows[1]?.name) || 0);
      if ((s0 >= 6 || s1 >= 6) && Math.abs(s0 - s1) >= 2) {
        if (idx === 0 && s0 > s1) count++;
        if (idx === 1 && s1 > s0) count++;
      } else if (s0 === 7 || s1 === 7) {
        if (idx === 0 && s0 > s1) count++;
        if (idx === 1 && s1 > s0) count++;
      }
    }
    return count;
  };

  return (
    <div className="pricing-page-top__match-centre w-full lg:w-[99.25%] lg:relative lg:left-[3px] m-0 overflow-hidden h-[150px]">
      <div className="match-centre__score-and-events desktopView flex flex-col justify-center w-full bg-black mb-0 h-[150px]">
        <div className="item ng-star-inserted">
          <div className="tennis mc-sc text-white">
            <div className="mc-sc__ctnr flex items-center mx-[6px] pb-[10px]">
              {/* LEFT PLAYERS */}
              <div className="mc-sc__tm-dtl w-[52%] max-md:w-[50%] relative">
                <div className="mc-sc__add-inf flex text-[13px] text-[#ccc6c6] mt-[7px] font-[Arial,Helvetica,Tahoma,sans-serif] text-left leading-[28px] h-[28px]">
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

                {displayRows.map((row) => {
                  const idx = row.index;
                  const serverVal =
                    data?.server ??
                    data?.liveDoc?.server ??
                    nestedScore?.server ??
                    data?.serving ??
                    data?.currentServer;

                  const isServerByData =
                    serverVal !== undefined && serverVal !== null && serverVal !== ""
                      ? Number(serverVal) === idx + 1 ||
                        String(serverVal) === String(idx + 1) ||
                        (Number(serverVal) === idx && (serverVal === 0 || serverVal === "0"))
                      : false;

                  const isServerByItem = (row.source?.scoreData || []).some(
                    (item) =>
                      item?.iconName === "server" &&
                      (String(item?.value) === "1" ||
                        String(item?.value).toLowerCase() === "ball" ||
                        item?.value === true)
                  );

                  const isServerByProp = Boolean(
                    row?.raw?.isServer ||
                    row?.raw?.server ||
                    row?.raw?.serving ||
                    row?.raw?.service ||
                    row?.source?.isServer ||
                    row?.source?.server ||
                    row?.source?.serving
                  );

                  const isServer = isServerByData || isServerByItem || isServerByProp;
                  const flagUrl = getFlagUrl(row.flag, row.name);

                  return (
                    <div
                      key={`${row.name}-${idx}`}
                      className="mc-sc__tm-ctnr flex items-center leading-[19px] h-[34px]"
                    >
                      {/* Tennis Server ball icon (20px width allocated, ball only if isServer) */}
                      <div className="score-item pos1 bat-ball val-ball w-[20px] overflow-hidden font-bold font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[14px] text-[#b2b2b2] flex items-center justify-center shrink-0">
                        <span className="ng-star-inserted">
                          {isServer ? (
                            <img
                              className="score-item__img ball bat-ball w-[13px] inline-block align-middle text-center shrink-0"
                              src="/ball.svg"
                              alt="ball"
                            />
                          ) : null}
                        </span>
                      </div>

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

                      {/* Player Name */}
                      <div className="mc-sc__tm-dtls-container flex relative flex-1 min-w-0 pr-[10px] flex-col justify-center">
                        <div className="mc-sc__team-and-score font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[14px] uppercase flex-auto flex text-left overflow-hidden tracking-[1.2px] items-center">
                          <div
                            className="mc-sc__team-name overflow-hidden whitespace-nowrap text-ellipsis !font-[500] text-white"
                            title={row.name}
                          >
                            {row.name || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT SETS & POINTS */}
              <div className="mc-sc__score-detail w-[48%] md:w-[50%]">
                <div
                  className="mc-sc__score-header grid text-center items-center leading-[28px] h-[28px] my-[3px_4px] text-[11px] font-normal uppercase text-white font-['Century_Gothic','Century_Gothic_W01',sans-serif]"
                  style={{ gridTemplateColumns: `repeat(${tennisColumns.length}, minmax(0, 1fr))` }}
                >
                  {tennisColumns.map((col) => (
                    <div
                      key={col.key}
                      className="tennis mc-sc__score-header-icons text-center overflow-hidden font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[11px] font-normal text-[#FFFFFF]"
                    >
                      {col.title}
                    </div>
                  ))}
                </div>

                <div>
                  {displayRows.map((row) => {
                    const idx = row.index;
                    const scoreValue =
                      getItem(row.source, ["points", "point", "gameScore", "pts"]) ||
                      (row?.raw?.pts ?? row?.raw?.points ?? "") ||
                      (tennisPoints[idx] ?? "") ||
                      getItem(row.source, ["score"]) ||
                      "0";

                    return (
                      <div
                        key={`tennis-row-${idx}`}
                        className="mc-sc__score-values grid text-center items-center leading-[32px] h-[32px]"
                        style={{ gridTemplateColumns: `repeat(${tennisColumns.length}, minmax(0, 1fr))` }}
                      >
                        {tennisColumns.map((col) => {
                          let val = "";
                          if (col.isSetsTotal) {
                            val = getSetsWon(row, idx);
                          } else if (col.isPoints) {
                            val = scoreValue;
                          } else {
                            val = tennisSetValue(col.setIndex, idx, row.name);
                          }
                          return (
                            <div
                              key={col.key}
                              className="score-item completed pos0 text-center overflow-hidden font-normal font-['Century_Gothic','Century_Gothic_W01',sans-serif] text-[13px] text-[#FFFFFF]"
                            >
                              <span className="score-item__value mx-auto inline-block text-white font-medium text-[13px]">
                                {val !== undefined && val !== null ? val : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TennisScoreBoard;
