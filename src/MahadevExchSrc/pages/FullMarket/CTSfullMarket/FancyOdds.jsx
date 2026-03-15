import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isMobile } from "react-device-detect";
import { useDispatch, useSelector } from "react-redux";
// import PlaceBet from "../../../components/PlaceBet";
import { sportsMapping } from "./MatchDetailsBanner";
import { useSearchParams } from "react-router-dom";

import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import MarketCell from "./MarketCell";
import { ImArrowRight } from "react-icons/im";
// import FancyBook from "../../../../AsianExchangeSrc/components/Popup/FancyBook";

import { IoInformationCircleOutline } from "react-icons/io5";
import { handleOpenPlaceBet } from "../../../../redux/slices/placeBetSlice";
import { Premiumcricket } from "../../../../utils/helper/commonSelectors";
import { getSportsBook } from "../../../../api";

const tabs11 = ["ALL", "Fancy", "Over", "Ball by Ball", "Meter", "Khado"];
// let tabs22 = [];
function isDecimal(num) {
  return typeof num === "number" && !Number.isInteger(num);
}

function categorizeQuery(query) {
  const categories = {
    runs: [
      "over runs",
      "run",
      "pship Runs",
      "Total Runs",
      "Highest Scoring over Runs",
      "Death Over Runs",
    ],
    boundaries: [
      "Boundaries",
      "Four Hitters",
      "Six Hitters",
      "Most 4s",
      "Most 6s",
      "No Boundaries overs",
    ],
    wickets: [
      "Wkt",
      "Wickets",
      "Wicket Takers",
      "Caught Outs",
      "Bowled",
      "LBW",
      "Runout",
    ],
    balls_faced: ["balls face", "Balls Faced", "How Many Balls"],
    extras: ["Extras", "Wides", "Legbyes", "Maidens"],
    dot_balls: ["Dot balls", "Dotballs"],
    partnerships: ["Pship", "Highest Pship"],
    impact: ["Impact overs"],
    scorers: ["Single Digit Scorers", "Double Digit Scorers", "Fifties", "30s"],
    bowlers: [
      "Most Dotballs By a Bowler",
      "Most Wickets By a Bowler",
      "Most Runs Given by a Bowler",
      "Most Boundaries Given by a Bowler",
      "Bowlers Giving 40 Plus Runs",
    ],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => query.includes(keyword))) {
      return category;
    }
  }
  return "Run";
}

const getDataWithSelectionId = (selectionId, currentOddsBetData) => {
  const data = currentOddsBetData?.filter((data) => {
    if (!data || typeof data.selectionId === "undefined") {
      return false;
    }

    const condition =
      data.selectionId?.toString().trim() === selectionId?.toString().trim();

    return condition;
  });

  return data;
};

const getSumOfAgainstForSingleSelection = (againstData, backSize, laySize) => {
  if (!againstData || !Array.isArray(againstData)) {
    return null;
  }

  // Separate back and lay bets with their prices and sizes
  const backBets = againstData?.filter((bet) => bet.type === "Back");
  const layBets = againstData?.filter((bet) => bet.type === "Lay");

  const filteredBetsOnPrice = againstData?.filter((bet) => {
    if (bet.type === "Lay") {
      return backBets.some(
        (bps) =>
          (bet.price <= bps.price && bet.size !== bps.size) ||
          (bet.size === bps.size && bet.price > bps.price),
      );
    }
    if (bet.type === "Back") {
      return layBets.some(
        (lps) =>
          (bet.size === lps.size && bet.price < lps.price) ||
          (bet.price <= lps.price && lps.size !== bet.size),
      );
    }
    return false;
  });

  // Remaining bets
  const remainingAgainstData = againstData?.filter(
    (item) => !filteredBetsOnPrice.includes(item),
  );

  // Calculate againstValue
  const againstValue = remainingAgainstData?.reduce((sum, bet) => {
    const margin = parseFloat(bet.againstMargin);
    if (backSize >= laySize) {
      return sum + margin;
    }
    return sum + (bet.type === "Lay" ? margin : -margin);
  }, 0);

  // Calculate reagainstValue
  const reagainstValue = filteredBetsOnPrice?.reduce((sum, bet) => {
    const margin = parseFloat(bet.againstMargin);
    return sum + (bet.type === "Back" ? parseFloat(bet.favourMargin) : -margin);
  }, 0);

  return Math.abs(reagainstValue - againstValue);
};

function FancyOdds({ f, s }) {
  const [selectedMarketTab, setSelectedMarketTab] = useState("f"); // f ==> fancy, s ==> sportsbook/Premium Cricket
  const [selectedFancyFilterTab, setSelectedFancyFilterTab] = useState("ALL"); // f ==> fancy, s ==> sportsbook/Premium Cricket
  const [selectedSbFilterTab, setSelectedSbFilterTab] = useState("ALL"); // f ==> fancy, s ==> sportsbook/Premium Cricket

  const [sbOdds, setSbOdds] = useState([]);
  const [tabs22, setTabs22] = useState([]);

  useEffect(() => {
    if (f === "false" && s === "true") {
      setSelectedMarketTab("s");
    }
  }, [f, s]);

  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId");
  const legueId = searchParams.get("competitionId");
  const matchId = searchParams.get("matchId") || eventId;

  useEffect(() => {
    let intervalId;

    const fetchData = async () => {
      try {
        const res = await getSportsBook(legueId, matchId);

        if (res.success) {
          const markets = res.data.data.markets.matchOdds || [];
          setSbOdds(markets);
        }
      } catch (error) {
        console.error("Error fetching sportsbook data:", error);
      }
    };

    fetchData();
    if (selectedMarketTab === "s" && s === "true") {
      intervalId = setInterval(fetchData, 4000);
    }

    return () => clearInterval(intervalId);
  }, [legueId, matchId, selectedMarketTab]);

  useEffect(() => {
    const categoryMap = {};
    sbOdds.forEach((m) => {
      const cat = m.category || "Other";
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat]++;
    });

    const dynamicTabs = Object.entries(categoryMap).map(
      ([name, count]) => name,
    );
    setTabs22(["ALL", ...dynamicTabs].sort((a, b) => a.localeCompare(b)));
  }, [sbOdds]);

  const premiumCricket = useSelector(Premiumcricket());

  return (
    <div className="flex flex-col w-[98%] mx-auto">
      <div className="flex flex-row items-center mt-6 gap-2">
        {f === "true" && (
          <ClippedMarketTab
            title="Fancy Bet"
            isTopLeftRounded={false}
            handleClickLeft={() => setSelectedMarketTab("f")}
            handleClickRight={() => console.log("clickedRight")}
          />
        )}

        {s === "true" && premiumCricket && (
          <ClippedMarketTab
            title="Sportsbook"
            isTopLeftRounded={true}
            showNew={true}
            handleClickLeft={() => setSelectedMarketTab("s")}
            handleClickRight={() => console.log("clickedRight")}
          />
        )}
      </div>
      {f === "true" && selectedMarketTab === "f" && (
        <MarketFilterTabBar
          tabs={tabs11}
          bgFrom="from-cyan-500"
          bgTo="to-cyan-700"
          bg="bg-[#ffffff80]"
          setSelectedFilterTab={setSelectedFancyFilterTab}
        />
      )}
      {s === "true" && selectedMarketTab === "s" && premiumCricket && (
        <MarketFilterTabBar
          tabs={tabs22}
          bgFrom="from-[#d14100]"
          bgTo="to-[#f26d1c]"
          bg="bg-[#ffffff80]"
          setSelectedFilterTab={setSelectedSbFilterTab}
        />
      )}
      {f === "true" && selectedMarketTab === "f" && (
        <FancyTabPane selectedFancyFilterTab={selectedFancyFilterTab} />
      )}
      {s === "true" && selectedMarketTab === "s" && premiumCricket && (
        <SportsbookTabPane sbOdds={sbOdds} activeTab={selectedSbFilterTab} />
      )}
    </div>
  );
}

const FancyTabPane = ({ selectedFancyFilterTab }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const sportId = Number(searchParams.get("eventType"));
  const competitionId = Number(searchParams.get("competitionId"));
  const matchId = Number(searchParams.get("eventId"));

  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);
  const [selfSelectedSize, setSelfSelectedSize] = useState(0);
  const { bets } = useSelector((state) => state?.account);

  const filteredBets = bets?.filter(
    (bet) =>
      bet.matchId.toString() === matchId.toString() &&
      bet.markettype === "Fancy",
  );

  const handleMarketCellClick = (
    betBoxBgColor,
    price,
    size,
    selectionId,
    betType,
  ) => {
    setSelfSelectedOdds(price);
    setSelfSelectedSize(size);

    dispatch(
      handleOpenPlaceBet({
        sportName: sportsMapping[sportId],
        sportId: sportId,
        competitionId,
        market: "Fancy",
        markettype: "Fancy",
        marketId: `${sportId}-${competitionId}-${matchId}`,
        selectionId,
        betBoxBgColor,
        betType,
      }),
    );
  };

  const { fancyData: FData } = useSelector((state) => state.fancyOdds);
  const fancyOddsData = useMemo(() => {
    const FancyData = FData[matchId];
    return FancyData?.data || null;
  }, [FData, matchId]);
  const filteredData =
    selectedFancyFilterTab === "ALL" || selectedFancyFilterTab === "Fancy"
      ? fancyOddsData
      : fancyOddsData?.filter((item) => {
          const find =
            selectedFancyFilterTab === "Ball by Ball"
              ? "ball"
              : selectedFancyFilterTab.toLowerCase();
          return item?.RunnerName?.toLowerCase()?.includes(find);
        });

  const [activeInfoId, setActiveInfoId] = useState(null);

  return (
    <div className="w-full flex flex-col h-full bg-[white]">
      {/* Header Row */}
      <div className="w-full flex flex-row justify-between border-b border-[#00000033] mt-[0.5px]">
        <div
          className={`w-full flex flex-grow ${
            isMobile ? "w-[65%]" : "w-[30%]"
          } px-2 py-1`}
        >
          <p className="text-[12px] font-bold text-[#00000080]">Min: 0 /Max: 0</p>
        </div>
        <div
          className={`flex justify-end ${
            isMobile ? "w-[65%]" : "w-[70%]"
          } text-xs font-semibold`}
        >
          <div className="w-1/2 text-[14px] font-extrabold flex justify-center items-center py-1">
            No
          </div>
          <div className="w-1/2 text-[14px] font-extrabold flex justify-center items-center py-1">
            Yes
          </div>
        </div>
      </div>

      {/* Odds Rows */}
      {Array.isArray(filteredData) &&
        filteredData?.map((fod, index) => {
          if (
            isDecimal(fod?.LayPrice1) ||
            isDecimal(fod?.BackPrice1) ||
            fod?.LaySize1 > 500 ||
            fod?.BackSize1 > 500
          ) {
            return null;
          }
          let subject;
          subject = categorizeQuery(fod?.RunnerName);
          const LocalDataWithSelectionId = getDataWithSelectionId(
            fod?.SelectionId,
            filteredBets,
          );
          const currentOddsBetData = filteredBets?.find(
            (item) => item?.selectionId === fod?.SelectionId,
          );

          const betBackSize = currentOddsBetData?.backSize;
          const betLaySize = currentOddsBetData?.laySize;

          return (
            <Fragment key={index}>
              <div className="w-full flex flex-row justify-between border-b border-[#00000033]">
                <div
                  className={`w-full flex flex-col flex-grow ${
                    isMobile ? "w-[65%]" : "w-[30%]"
                  } px-2 py-1 text-[11px] font-semibold items-start justify-center text-black dark:text-white`}
                >
                  <p className="text-[14px] font-extrabold text-black">
                    {fod?.RunnerName}
                  </p>

                  {/* <FancyBook
                    fancyBook={{
                      currentOddsBetDataOfThisMarket:
                        LocalDataWithSelectionId || [],
                      marketRunnerName: fod?.RunnerName,
                      subject,
                      min: fod?.min,
                      max: fod?.max,
                      id:index
                    }}
                    activeInfoId={activeInfoId}
          setActiveInfoId={setActiveInfoId}
                  /> */}
                  {LocalDataWithSelectionId?.length > 0 &&
                  LocalDataWithSelectionId[0]?.SelectionId ==
                    fod?.SelectionId.toString() ? (
                    <span className="text-red-600 cursor-pointer">
                      {LocalDataWithSelectionId?.length > 0 &&
                        Math.abs(
                          getSumOfAgainstForSingleSelection(
                            LocalDataWithSelectionId,
                            betBackSize,
                            betLaySize,
                          ),
                        )}
                    </span>
                  ) : (
                    <span className="text-red-600 cursor-pointer">
                      {LocalDataWithSelectionId?.length > 0 &&
                        Math.abs(
                          getSumOfAgainstForSingleSelection(
                            LocalDataWithSelectionId,
                            betBackSize,
                            betLaySize,
                          ),
                        )}
                    </span>
                  )}
                </div>

                {/* Odds Cells */}
                <div
                  className={`flex suspended p-1 gap-1 justify-end ${
                    isMobile ? "w-[65%]" : "w-[70%]"
                  } ${
                    fod.GameStatus.toLowerCase() != "" &&
                    fod.GameStatus.toLowerCase() != "active"
                      ? "aura-suspended"
                      : ""
                  }`}
                  data-label={
                    fod.GameStatus.toLowerCase() != "" &&
                    fod.GameStatus.toLowerCase() != "active"
                      ? fod?.GameStatus.toLowerCase() === "suspended" ||
                        fod?.GameStatus.toLowerCase() === "ball running"
                        ? "Ball Running"
                        : fod?.GameStatus
                      : ""
                  }
                >
                  <div
                    onClick={() => {
                      handleMarketCellClick(
                        "#ffa0d0",
                        fod?.LayPrice1,
                        fod?.LaySize1,
                        fod?.SelectionId,
                        "Lay",
                      );
                    }}
                    className="w-1/2 bg-[#ffa0d0] rounded-md flex flex-col justify-center items-center h-[44px] text-nowrap"
                  >
                    <p className="text-[14px] font-bold">
                      {fod?.LayPrice1 || "--"}
                    </p>
                    <p className="text-[11px] text-[#00000080] font-bold">
                      {fod?.LaySize1 || "--"}
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      handleMarketCellClick(
                        "8ec5fe",
                        fod?.BackPrice1,
                        fod?.BackSize1,
                        fod?.SelectionId,
                        "Back",
                      );
                    }}
                    className="w-1/2 bg-[#8ec5fe] rounded-md flex flex-col justify-center items-center h-[44px] text-nowrap"
                  >
                    <p className="text-[14px] font-bold">
                      {fod?.BackPrice1 || "--"}
                    </p>
                    <p className="text-[11px] text-[#00000080] font-bold">
                      {fod?.BackSize1 || "--"}
                    </p>
                  </div>
                </div>
              </div>
              {/* <PlaceBet
                sportName={sportsMapping[sportId]}
                sportId={sportId}
                competitionId={competitionId}
                marketId={`${sportId}-${competitionId}-${matchId}`}
                market="Fancy"
                markettype="Fancy"
                selectionId={fod.SelectionId}
                selection={fod.RunnerName}
                selectedOdds={selfSelectedOdds}
                selectedSize={selfSelectedSize}
                isFancyBet={true}
                runners={[
                  {
                    runnerName: fod.RunnerName,
                    selectionId: fod.SelectionId,
                    gtype: fod.gtype,
                  },
                ]}
                backSize={fod?.BackSize1}
                laySize={fod?.LaySize1}
                suspendNow={
                  fod.GameStatus.toLowerCase() != "" &&
                  fod.GameStatus.toLowerCase() != "active"
                    ? "aura-suspended"
                    : ""
                }
              /> */}
            </Fragment>
          );
        })}
    </div>
  );
};

const SportsbookTabPane = ({ sbOdds, activeTab }) => {
  const filteredOdds =
    activeTab === "ALL"
      ? sbOdds
      : sbOdds.filter((m) => (m.category || "Other") === activeTab);
  return (
    <div className="flex flex-col">
      {Array.isArray(filteredOdds) &&
        filteredOdds.map(
          ({ marketName, marketId, runners, status: marketStatus }) => {
            return (
              <SportsbookMarketContainer
                marketName={marketName}
                marketId={marketId}
                runners={runners}
                marketStatus={marketStatus}
              />
            );
          },
        )}
    </div>
  );
};

const SportsbookMarketContainer = ({
  marketName,
  marketId,
  runners,
  marketStatus,
}) => {
  const [showMarket, setShowMarket] = useState(true);
  const [activeBet, setActiveBet] = useState(null);
  const [searchParams] = useSearchParams();
  const eventId = Number(searchParams.get("eventId"));
  const sportId = Number(searchParams.get("eventType"));

  const eventName = searchParams.get("eventName");
  const competitionId = Number(searchParams.get("competitionId"));

  const placedBets = useSelector((state) => state.account.bets);
  const placedBetsInThisMarket = placedBets.filter(
    (pb) =>
      pb?.marketId == marketId &&
      pb.market == "Premium Cricket" &&
      pb.event == eventName,
  );

  return (
    <div className="flex flex-col mt-1">
      <div className="w-full min-h-7 flex flex-row items-center justify-between   bg-[#0000001a] text-black pl-2 text-[14px] font-bold">
        {marketName}
      </div>
      {showMarket && (
        <div>
          {runners.map(
            ({ runnerName, runnerId, backPrices, status: runnerStatus }) => {
              return (
                <MarketRunnerContainer
                  placedBetsInThisMarket={placedBetsInThisMarket}
                  key={runnerId}
                  marketId={marketId}
                  marketName={marketName}
                  runnerName={runnerName}
                  backPrice={backPrices?.[0]?.price}
                  backSize={backPrices?.[0]?.size || "100000"}
                  runnerId={runnerId}
                  runners={runners}
                  activeBet={activeBet}
                  setActiveBet={setActiveBet}
                  runnerStatus={runnerStatus}
                  marketStatus={marketStatus}
                />
              );
            },
          )}
        </div>
      )}
    </div>
  );
};

export const MarketRunnerContainer = ({
  placedBetsInThisMarket = [],
  marketName,
  marketId,
  runner,
  runnerData,
  marketRunners,
  setActiveBet,
  activeBet,
  runnerName,
  runners,
  backPrice,
  backSize,
  runnerId,
  runnerStatus,
  marketStatus,
}) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const sportId = Number(searchParams.get("eventType"));
  const eventId = Number(searchParams.get("eventId"));
  const competitionId = Number(searchParams.get("competitionId"));

  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);

  const handleMarketCellClick = (betBoxBgColor, price, betType) => {
    setSelfSelectedOdds(price);
    dispatch(
      handleOpenPlaceBet({
        sportName: sportsMapping[sportId],
        sportId: sportId,
        competitionId,
        marketId,
        market: "Premium Cricket",
        markettype: "Match Odds",
        selectionId: runnerId,
        betBoxBgColor,
        betType,
      }),
    );
  };

  const calculateBetValues = useCallback(
    (runner, marketId) => {
      const filteredBets = placedBetsInThisMarket || [];

      const fbOfThisRunner =
        filteredBets?.filter(
          (fb) =>
            fb.selectionId.toString() === runnerId.toString() &&
            eventId.toString() === fb.matchId.toString() &&
            fb.marketId === marketId,
        ) || [];

      const fbOfOtherRunners =
        filteredBets?.filter(
          (fb) =>
            fb.selectionId.toString() !== runnerId.toString() &&
            eventId.toString() === fb.matchId.toString() &&
            fb.marketId === marketId,
        ) || [];

      let placedBetCalculation =
        fbOfThisRunner.reduce(
          (acc, fbr) =>
            acc + (fbr.type === "Back" ? fbr.favourMargin : -fbr.againstMargin),
          0,
        ) +
        fbOfOtherRunners.reduce(
          (acc, fbor) =>
            acc +
            (fbor.type === "Back" ? -fbor.againstMargin : fbor.favourMargin),
          0,
        );

      return placedBetCalculation;
    },
    [placedBetsInThisMarket, eventId],
  );

  const placedBetCalculation = calculateBetValues(runner, marketId);

  const newCalc =
    activeBet && runnerId === activeBet?.selectionId
      ? activeBet?.favourMargin.toFixed(1)
      : activeBet?.againstMargin.toFixed(1);

  return (
    <div key={runnerId} className="relative w-full p-1 bg-[white]">
      <div className="w-full flex items-stretch justify-between ">
        {/* Runner Column */}
        <div
          className={`flex flex-col bg-[white] justify-center w-[${
            isMobile ? "70%" : "30%"
          }] pl-2 pr-1 py-1`}
        >
          <p className="text-[14px] font-bold text-[black]">
            {runnerName || "unknown"}
          </p>
          {/* {activeBet && newCalc && <p className={`flex flex-row items-center text-[10px] font-semibold ${newCalc > 0 ? "text-green-600" : "text-red-500"}`}> <span> <ImArrowRight className='mr-1' /> </span> {Math.abs(newCalc)} </p>} */}
          <div className="flex flex-row items-center">
            {placedBetCalculation !== 0 && (
              <p
                className={`flex flex-row items-center text-[10px] font-semibold ${
                  placedBetCalculation > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {" "}
                <span>
                  {" "}
                  <ImArrowRight className="mr-1" />{" "}
                </span>{" "}
                {Math.abs(placedBetCalculation.toFixed(0))}{" "}
              </p>
            )}
            {activeBet && newCalc && (
              <p
                className={`flex flex-row items-center text-[10px] font-semibold ${
                  placedBetCalculation === 0 ? "" : "ml-2"
                } ${
                  Number(newCalc || 0) + (Number(placedBetCalculation) || 0) > 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {" "}
                <span>
                  {" "}
                  <ImArrowRight className="mr-1" />{" "}
                </span>{" "}
                {Math.abs(
                  (
                    Number(newCalc) + (Number(placedBetCalculation) || 0)
                  ).toFixed(0),
                )}{" "}
              </p>
            )}
          </div>
        </div>

        {/* MarketCell Column */}

        <div
          className={` bg-[white]
                ${
                  runnerStatus?.toLowerCase() != "active" ||
                  marketStatus?.toLowerCase() != "active" ||
                  !backPrice
                    ? "sport-aura-suspended"
                    : ""
                } 
                flex flex-wrap flex-grow w-[${isMobile ? "45%" : "70%"}]`}
          data-label={
            runnerStatus?.toLowerCase() != "active" ||
            marketStatus?.toLowerCase() != "active" ||
            !backPrice
              ? "SUSPENDED"
              : ""
          }
        >
          <MarketCell
            handleMarketCellClick={handleMarketCellClick}
            price={backPrice}
            size={backSize}
            bgColor="#8ec5fe"
            betType="Back"
          />
        </div>
      </div>

      {/* <PlaceBet
        sportName={sportsMapping[sportId]}
        sportId={sportId}
        competitionId={competitionId}
        marketId={marketId}
        market="Premium Cricket"
        markettype="Match Odds"
        selectionId={runnerId}
        selection={runnerName}
        selectedOdds={selfSelectedOdds}
        setActiveBet={setActiveBet}
        suspendNow={`${
          runnerStatus?.toLowerCase() != "active" ||
          marketStatus?.toLowerCase() != "active" ||
          !backPrice
            ? "aura-suspended"
            : ""
        }`}
        runners={runners}
        question={marketName}
      /> */}
    </div>
  );
};

const MarketFilterTabBar = ({
  tabs,
  bgFrom,
  bgTo,
  bg,
  setSelectedFilterTab,
}) => {
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    setSelectedFilterTab(activeTab);
    return () => {};
  }, [activeTab]);

  return (
    <div
      className={`flex  flex-row w-full overflow-x-auto scrollbar-hide rounded-tr-[10px] items-center bg-[#000000cc] px-8 py-1`}
    >
      <div className="rounded-md w-max flex items-center">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-[2px] text-[12px] font-[700] whitespace-nowrap transition-colors duration-200
      ${activeTab === tab ? "text-white" : "text-[#ffffff80]"}
      ${index !== tabs.length - 1 ? "border-r border-[#ffffff33] pr-2 mr-2" : ""}
      `}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

const ClippedMarketTab = ({
  title,
  bgLeft,
  bgRight,
  isTopLeftRounded = false,
  handleClickLeft,
  handleClickRight,
  showNew = false,
}) => {
  return (
    <div
      className={`relative  flex flex-row items-center h-[32px] w-fit text-white font-semibold `}
    >
      {/* NEW Badge */}
      {showNew && (
        <span className="absolute -top-2 left-[35%] bg-yellow-400 text-black text-[10px] font-bold px-1.5 rounded">
          NEW
        </span>
      )}

      {/* LEFT TAB */}
      <div
        onClick={handleClickLeft}
        className={`bg-[#2b2b2b] rounded-tl-[12px] pl-3 pr-4 flex items-center h-[32px] text-[13px] font-bold `}
      >
        {title}
      </div>

      {/* INFO CLIPPED PART */}
      <div
        onClick={handleClickRight}
        className="bg-[#3c3b3b] flex items-center justify-center h-[32px] w-[42px]"
        style={{
          clipPath:
            "polygon(55% 0, 65% 3%, 72% 8%, 78% 15%, 82% 24%, 100% 100%, 0 100%, 0 0, 22% 0)",
        }}
      >
        <IoInformationCircleOutline size={16} />
      </div>
    </div>
  );
};

export default FancyOdds;
