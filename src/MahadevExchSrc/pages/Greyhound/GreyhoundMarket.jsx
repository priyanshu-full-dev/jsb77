import { useState, useEffect, useCallback, Fragment, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import { ImArrowRight } from "react-icons/im";
import { BsInfoCircleFill } from "react-icons/bs";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import { isMobile } from "react-device-detect";
import { AnimatePresence, motion } from "framer-motion";

import "../FullMarket/aura-suspended.css";

import PlaceBet from "../../components/PlaceBet";
import { handleOpenPlaceBet } from "../../../redux/slices/placeBetSlice";
import {
  subscribeToGreyhoundMatchesData,
  unsubscribeFromGreyHoundOdds,
} from "../../../socketClient";
import { revertOnlyGreyhoundMarkets } from "../../../redux/slices/greyhoundSlice";
import MarketCell from "../FullMarket/CTSfullMarket/MarketCell";
import { setBetData } from "../../../redux/slices/fullmarketSlice";
export function formatToKOrM(value) {
  if (!value) return value;
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + "K";
  }
  return value?.toFixed?.(1) ?? value;
}

const sportsMapping = {
  65: "Greyhound Race",
};

const isPastOneMinute = (raceName) => {
  const dateTimePart = raceName.replace(/^[^\d]+/, "");
  const currentYear = new Date().getFullYear();
  const raceDate = new Date(`${dateTimePart} ${currentYear}`);
  raceDate.setMinutes(raceDate.getMinutes() + 1);
  const now = new Date();
  return now > raceDate;
};

const GreyhoundMarket = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const gmid = searchParams.get("gmid");
  const raceName = searchParams.get("raceName") || "Grand National 14:30";
  const [showMarket, setShowMarket] = useState(true);
  const [activeBet, setActiveBet] = useState(null);
  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [showGreyhoundDetails, setShowGreyhoundDetails] = useState("");
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 800);

  // Redux state
  const oddsData = useSelector((state) => state.greyhound.greyhoundMarkets);
  const bets = useSelector((state) => state.account.bets);
  const { betData } = useSelector((state) => state.marketOdds);

  const marketData = oddsData.find(
    (hm) => String(hm.gmid) === String(gmid) && hm.odds,
  );
  const runners =
    marketData?.odds?.find((e) => e?.mname === "MATCH_ODDS") || {};
  const totalMatched = marketData?.totalMatched || 0;
  const marketStatus = runners?.status || "ACTIVE";
  const matchOver = isPastOneMinute(raceName);
  const isSuspended = marketStatus === "SUSPENDED" || matchOver;
  // Memoized filtered bets
  const filteredBets = useMemo(
    () =>
      bets?.filter(
        (bet) =>
          bet.matchId === gmid &&
          bet.markettype === "Match Odds" &&
          bet.sportsName === "Greyhound Race",
      ) || [],
    [bets, gmid],
  );

  const handleMarketCellClick = useCallback(
    (betBoxBgColor, price, betType, runner, index) => {
      if (!price || isSuspended) return;

      const stake = Number(activeBet?.stake);
      setSelfSelectedOdds(price);

      dispatch(
        handleOpenPlaceBet({
          sportName: sportsMapping[65],
          competitionId: gmid,
          marketId: gmid,
          market: "Greyhound Race",
          markettype: "Match Odds",
          selectionId: runner.sid,
          betBoxBgColor,
          betType,
          eventId: 65,
        }),
      );

      setActiveBet({
        selectionId: runner.sid,
        type: betType,
        stake,
        oddsReq: price,
        index,
      });
    },
    [dispatch, gmid, raceName, activeBet, isSuspended],
  );

  // Update betData in Redux when activeBet changes
  useEffect(() => {
    if (!activeBet) return;
    const stake = Number(activeBet?.stake || 0);
    const oddsReq = Number(activeBet?.oddsReq || 0);
    const calculateValue = oddsReq && stake ? oddsReq * stake - stake : 0;

    dispatch(
      setBetData({
        calculateValue,
        index: activeBet.index,
        addedValue: stake,
        selectionId: activeBet.selectionId,
        type: activeBet.type,
        marketId: gmid,
      }),
    );
  }, [activeBet, dispatch, gmid]);

  // Subscribe/unsubscribe socket
  useEffect(() => {
    if (!gmid) return;
    subscribeToGreyhoundMatchesData({
      eventId: null,
      eventType: null,
      gmid,
      sport: null,
    });
    return () => {
      unsubscribeFromGreyHoundOdds(gmid);
      dispatch(revertOnlyGreyhoundMarkets());
    };
  }, [dispatch, gmid]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 800);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Guard clause for missing marketData or runners
  if (!marketData || !runners?.section) {
    return <div>No market data available</div>;
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="w-full max-w-screen-xl flex flex-col !pb-[100px]"
    >
      <div className="w-full h-full flex flex-row items-center justify-between min-h-7 mt-2 border-b-[1px] border-[#7e97a7] bg-light-bg dark:bg-dark-bg border-t-[0.3px] pr-2">
        <div className="w-full flex flex-row flex-grow items-center">
          <span className="whitespace-nowrap min-h-7 flex flex-row gap-2 items-center justify-between text-center pl-2 pr-2 py-1 rounded-tr-xl bg-[#2c2c2c] text-white  text-xs font-semibold">
            {raceName}
            <BsInfoCircleFill />
          </span>
        </div>
        <div className="flex flex-row items-center pr-2 whitespace-nowrap text-black ">
          <span className="text-[9px] font-extralight mr-1">Matched</span>
          <span className="text-[10px] font-semibold">
            €{formatToKOrM(totalMatched)}
          </span>
        </div>
        <div
          role="button"
          onClick={() => setShowMarket((prev) => !prev)}
          className="rounded-full bg-[black] text-[white]"
        >
          {showMarket ? (
            <CiCircleMinus size={18} />
          ) : (
            <CiCirclePlus size={18} />
          )}
        </div>
      </div>
      {/* Dropdown Section */}
      <AnimatePresence initial={false}>
        {showMarket && (
          <motion.div
            key="marketContent"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="overflow-hidden bg-light-bg dark:bg-dark-bg"
          >
            {/* Top section */}
            <div className="w-full h-full flex flex-row items-center justify-between min-h-7 border-b-[1px] border-[#7e97a7] bg-light-bg dark:bg-dark-bg border-t-[0.3px]">
              <div
                className={`flex flex-col justify-center w-[${
                  isMobile ? "65%" : "30%"
                }] pl-2 pr-1 py-1`}
              >
                <div className="w-full text-[12px] font-bold bg-[#bed5d8] rounded-[4px] flex justify-center">
                  <div>
                    <span className="text-[#315195] text-[10px]">
                      Min/Max &nbsp;
                    </span>
                    <span className="text-[10px] font-semibold">
                      {`${formatToKOrM(
                        marketData?.minStake || 100,
                      )} - ${formatToKOrM(
                        marketData?.maxStake || runners?.umaxbof || 5000,
                      )}`}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`flex pr-1  flex-grow w-[${
                  isMobile ? "35%" : "70%"
                }] min-h-7`}
              >
                <div
                  className={`w-full flex flex-grow basis-[${
                    isMobile ? "50%" : "16.67%"
                  }] min-h-7 ${
                    isMobile
                      ? "bg-[#8ec5fe]"
                      : "bg-gradient-to-r from-[#D7E8F4] to-[#8ec5fe]"
                  } rounded-tl-md text-xs font-semibold mt-1 items-center justify-center`}
                >
                  Back
                </div>
                <div
                  className={`w-full flex flex-grow basis-[${
                    isMobile ? "50%" : "16.67%"
                  }] min-h-7 ${
                    isMobile
                      ? "bg-[#ffa0d0]"
                      : "bg-gradient-to-r from-[#ffa0d0] to-[#F6E6EA]"
                  } rounded-tr-md text-xs font-semibold mt-1 items-center justify-center`}
                >
                  Lay
                </div>
              </div>
            </div>
            {/* Top section */}
            {/* Runners */}
            {runners?.section?.length > 0 ? (
              runners.section.map((runner, idx) => {
                const runnerId = runner?.sid;
                let placedBetCalculation = 0;
                const fbOfthisRunner = filteredBets?.filter(
                  (fb) =>
                    fb.selectionId.toString() === runner.sid.toString() &&
                    gmid.toString() === fb.matchId.toString(),
                );
                fbOfthisRunner?.forEach((fbr) => {
                  const subject =
                    fbr.type === "Back" ? fbr.favourMargin : -fbr.againstMargin;
                  placedBetCalculation += subject;
                });
                const fbOfOtherRunners = filteredBets?.filter(
                  (fb) =>
                    fb.selectionId.toString() !== runner.sid.toString() &&
                    gmid.toString() === fb.matchId.toString(),
                );
                fbOfOtherRunners?.forEach((fbor) => {
                  const subject =
                    fbor.type === "Back"
                      ? -fbor.againstMargin
                      : fbor.favourMargin;
                  placedBetCalculation += subject;
                });

                let newCalc = 0;
                if (betData?.type === "Back") {
                  newCalc =
                    betData?.selectionId !== runnerId
                      ? -betData?.addedValue + placedBetCalculation
                      : betData?.calculateValue + placedBetCalculation;
                } else {
                  newCalc =
                    betData?.selectionId !== runnerId
                      ? betData?.addedValue + placedBetCalculation
                      : -betData?.calculateValue + placedBetCalculation;
                }

                let formattedRunner = runner.nat.split(".");
                formattedRunner =
                  formattedRunner?.length > 1 ? formattedRunner[1] : runner.nat;

                return (
                  <Fragment key={`runner-${runner.sid}-${idx}`}>
                    <div className="relative w-full bg-light-bg dark:bg-dark-bg">
                      <div className="w-full flex items-stretch justify-between min-h-11 border-b-[1px] border-[#7e97a7] bg-light-bg dark:bg-dark-bg border-t-[0.3px]">
                        {/* Runner Column */}
                        <div
                          className={`flex flex-col justify-center w-[${
                            isMobile ? "65%" : "30%"
                          }] pl-2 pr-1 py-1`}
                        >
                          <div className="flex flex-row items-center">
                            <div className="flex flex-col justify-center items-center">
                              {runner.cno && (
                                <span
                                  style={{ width: 14 }}
                                  className="text-[8px] text-center text-nowrap"
                                >
                                  {runner.cno}
                                </span>
                              )}
                              {runner.sdraw && (
                                <span
                                  style={{ width: 14 }}
                                  className="text-[8px] text-center text-nowrap"
                                >
                                  ({runner.sdraw})
                                </span>
                              )}
                            </div>
                            <span className="mx-1">
                              {imageErrors.has(idx) ? (
                                <div
                                  style={{
                                    width: 26,
                                    height: 21,
                                    backgroundColor: `hsl(${
                                      (idx * 57) % 360
                                    }, 70%, 60%)`,
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    borderRadius: "2px",
                                  }}
                                >
                                  {idx + 1}
                                </div>
                              ) : (
                                <img
                                  height={21}
                                  width={26}
                                  src={`https://sitethemedata.com/race_icons/${gmid}/${runner.himg}`}
                                  onError={() =>
                                    setImageErrors(
                                      (prev) => new Set([...prev, idx]),
                                    )
                                  }
                                  alt={`Runner ${idx + 1}`}
                                />
                              )}
                            </span>
                            <span className="ml-1 text-[11px] text-nowrap font-semibold">{`${formattedRunner}`}</span>
                            {/* <span
                              className="ml-1"
                              role="button"
                              onClick={() =>
                                setShowGreyhoundDetails((prev) => (prev !== runner.nat ? runner.nat : ""))
                              }
                            >
                              <IoIosArrowDropdownCircle
                                size={18}
                                color="#18ADC5"
                                className={showGreyhoundDetails === runner.nat ? "rotate-up" : "rotate-down"}
                              />
                            </span> */}
                          </div>
                          <div className="flex flex-row items-center">
                            {filteredBets && filteredBets?.length > 0 && (
                              <p
                                className={`flex flex-row items-center text-[10px] font-semibold ${
                                  placedBetCalculation < 0
                                    ? "text-red-500"
                                    : "text-green-600"
                                }`}
                              >
                                <span>
                                  <ImArrowRight className="mr-1" />
                                </span>
                                {Math.abs(placedBetCalculation)}
                              </p>
                            )}
                            {activeBet &&
                            betData?.marketId === gmid &&
                            (betData.calculateValue || betData.addedValue) ? (
                              <p
                                className={`flex flex-row items-center text-[10px] font-semibold ${
                                  placedBetCalculation === 0 ? "" : "ml-2"
                                } ${
                                  newCalc > 0
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              >
                                <span>
                                  <ImArrowRight className="mr-1" />
                                </span>
                                {Math.abs(newCalc.toFixed(0))}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {/* Odds Column */}
                        <div
                          className={`${
                            isSuspended ? "aura-suspended" : ""
                          } flex py-1 pr-1 gap-0.5 flex-grow w-[${
                            isMobile ? "35%" : "70%"
                          }]`}
                          data-label={
                            isSuspended ? "Suspended" || runner.gstatus : ""
                          }
                        >
                          {!isMobile && (
                            <MarketCell
                              handleMarketCellClick={(
                                bgColor,
                                price,
                                betType,
                              ) =>
                                handleMarketCellClick(
                                  bgColor,
                                  price,
                                  betType,
                                  runner,
                                  idx,
                                )
                              }
                              price={runner?.odds?.[2]?.odds || 0}
                              size={runner?.odds?.[2]?.size || 0}
                              bgColor="#8ec5fe"
                              hideOnMobile
                              betType="Back"
                            />
                          )}
                          {!isMobile && (
                            <MarketCell
                              handleMarketCellClick={(
                                bgColor,
                                price,
                                betType,
                              ) =>
                                handleMarketCellClick(
                                  bgColor,
                                  price,
                                  betType,
                                  runner,
                                  idx,
                                )
                              }
                              price={runner?.odds?.[1]?.odds || 0}
                              size={runner?.odds?.[1]?.size || 0}
                              bgColor="#8ec5fe"
                              hideOnMobile
                              betType="Back"
                            />
                          )}
                          <MarketCell
                            handleMarketCellClick={(bgColor, price, betType) =>
                              handleMarketCellClick(
                                bgColor,
                                price,
                                betType,
                                runner,
                                idx,
                              )
                            }
                            price={runner?.odds?.[0]?.odds || 0}
                            size={runner?.odds?.[0]?.size || 0}
                            bgColor="#8ec5fe"
                            betType="Back"
                          />
                          <MarketCell
                            handleMarketCellClick={(bgColor, price, betType) =>
                              handleMarketCellClick(
                                bgColor,
                                price,
                                betType,
                                runner,
                                idx,
                              )
                            }
                            price={runner?.odds?.[3]?.odds || 0}
                            size={runner?.odds?.[3]?.size || 0}
                            bgColor="#ffa0d0"
                            betType="Lay"
                          />
                          {!isMobile && (
                            <MarketCell
                              handleMarketCellClick={(
                                bgColor,
                                price,
                                betType,
                              ) =>
                                handleMarketCellClick(
                                  bgColor,
                                  price,
                                  betType,
                                  runner,
                                  idx,
                                )
                              }
                              price={runner?.odds?.[4]?.odds || 0}
                              size={runner?.odds?.[4]?.size || 0}
                              bgColor="#ffa0d0"
                              hideOnMobile
                              betType="Lay"
                            />
                          )}
                          {!isMobile && (
                            <MarketCell
                              handleMarketCellClick={(
                                bgColor,
                                price,
                                betType,
                              ) =>
                                handleMarketCellClick(
                                  bgColor,
                                  price,
                                  betType,
                                  runner,
                                  idx,
                                )
                              }
                              price={runner?.odds?.[5]?.odds || 0}
                              size={runner?.odds?.[5]?.size || 0}
                              bgColor="#ffa0d0"
                              hideOnMobile
                              betType="Lay"
                            />
                          )}
                        </div>
                      </div>

                      {/* Greyhound Details */}
                      {/* {showGreyhoundDetails === runner.nat && (
                        <div className="flex flex-col p-4">
                          <p className="text-[10px] text-left">{`Jockey: ${runner.jname || "NA"}`}</p>
                          <p className="text-[10px] text-left">{`Trainer: ${runner.tname || "NA"}`}</p>
                          <p className="text-[10px] text-left">{`Greyhound Age: ${runner.hage || "NA"}`}</p>
                        </div>
                      )} */}

                      {/* PlaceBet Component */}
                      {activeBet?.selectionId === runner.sid && (
                        <PlaceBet
                          sportName={sportsMapping[65]}
                          competitionId={gmid}
                          marketId={gmid}
                          market={"Greyhound Race"}
                          eventNames={raceName}
                          markettype="Match Odds"
                          selectionId={runner.sid}
                          selection={runner.nat}
                          selectedOdds={selfSelectedOdds}
                          setActiveBet={setActiveBet}
                          suspendNow={isSuspended ? "aura-suspended" : ""}
                          runners={runners?.section}
                          eventId={65}
                          joinedMarketId={gmid}
                        />
                      )}
                    </div>
                  </Fragment>
                );
              })
            ) : (
              <div>No runners available</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GreyhoundMarket;
