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
  subscribeToHourseOddsData,
  unsubscribeFromHourseOdds,
} from "../../../socketClient";
import { revertOnlyHorseMarkets } from "../../../redux/slices/horseSlice";
import { setBetData } from "../../../redux/slices/fullmarketSlice";
import MarketCell from "../FullMarket/CTSfullMarket/MarketCell";
import Loader from "../../components/Loader/Loader";

export function formatToKOrM(value) {
  if (!value) return value;
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + "K";
  }
  return value?.toFixed?.(1) ?? value;
}

const isPastOneMinute = (raceName) => {
  const dateTimePart = raceName.replace(/^[^\d]+/, "");
  const currentYear = new Date().getFullYear();
  const raceDate = new Date(`${dateTimePart} ${currentYear}`);
  raceDate.setMinutes(raceDate.getMinutes() + 1);
  const now = new Date();
  return now > raceDate;
};

const HorseMarket = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const gmid = searchParams.get("gmid");
  const raceName = searchParams.get("raceName") || "Grand National 14:30";
  const [showMarket, setShowMarket] = useState(true);
  const [activeBet, setActiveBet] = useState(null);
  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [showHorseDetails, setShowHorseDetails] = useState("");
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 800);
  const [loading, setLoading] = useState(true);
  // Redux state
  const oddsData = useSelector((state) => state.horse.horseMarkets);
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
          bet.sportsName === "Horse Race",
      ) || [],
    [bets, gmid],
  );

  const handleMarketCellClick = useCallback(
    (betBoxBgColor, price, betType, runner, index) => {
      if (!price || isSuspended) return;

      const stake = Number(activeBet?.stake || 0);
      setSelfSelectedOdds(price);

      dispatch(
        handleOpenPlaceBet({
          sportName: "Horse Race",
          competitionId: gmid,
          marketId: gmid,
          market: "Horse Race",
          markettype: "Match Odds",
          selectionId: runner.sid,
          betBoxBgColor,
          betType,
          eventId: 10,
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
    [dispatch, gmid, activeBet, isSuspended],
  );

  // Update betData in Redux when activeBet changes
  useEffect(() => {
    if (!activeBet) return;
    const stake = Number(activeBet?.stake);
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

  useEffect(() => {
    if (marketData && runners?.section?.length > 0) {
      setLoading(false);
    }
  }, [marketData, runners]);

  // Reset loading when gmid changes
  useEffect(() => {
    setLoading(true);
  }, [gmid]);
  // Subscribe/unsubscribe socket
  useEffect(() => {
    if (!gmid) return;
    setLoading(true); // Start loading on subscribe
    subscribeToHourseOddsData({ gmid });
    return () => {
      unsubscribeFromHourseOdds(gmid);
      dispatch(revertOnlyHorseMarkets());
    };
  }, [dispatch, gmid]);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 800);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading if data is being fetched
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-screen-xl flex flex-col bg-light-bg dark:bg-dark-bg p-4"
      >
        <Loader />
        <div className="mt-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Show error only if not loading and no data
  if (!marketData || !runners?.section) {
    return (
      <div className="w-full text-center py-10 text-gray-500">
        No market data available
      </div>
    );
  }


  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.1, ease: "easeInOut" }}
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

                const selfSuspend = runners.status === "SUSPENDED" || matchOver;

                let formattedRunner = runner.nat.split(".");
                formattedRunner =
                  formattedRunner?.length > 1 ? formattedRunner[1] : runner.nat;

                return (
                  <Fragment key={`runner-${runner.sid}-${idx}`}>
                    <div className="relative w-full bg-light-bg dark:bg-dark-bg ">
                      <div className="w-full py-1 flex items-stretch justify-between min-h-11 border-b-[1px] border-[#7e97a7] bg-light-bg dark:bg-dark-bg border-t-[0.3px]">
                        {/* Runner Info */}
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
                                setShowHorseDetails((prev) => (prev !== runner.nat ? runner.nat : ""))
                              }
                            >
                              <IoIosArrowDropdownCircle
                                size={18}
                                color="#18ADC5"
                                className={showHorseDetails === runner.nat ? "rotate-up" : "rotate-down"}
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
                                {Math.abs(newCalc)}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {/* Odds Section */}
                        <div
                          className={`${
                            isSuspended ? "aura-suspended" : ""
                          } flex pr-1 gap-0.5 flex-grow w-[${
                            isMobile ? "35%" : "70%"
                          }]`}
                          data-label={
                            isSuspended ? "Suspended" || runner.gstatus : ""
                          }
                        >
                          {/* REMOVED Overlay */}
                          {/* {runner.gstatus === "REMOVED" && (
                            <div className="asian-full-market-inner">
                              {runner.gstatus} {runner.adfa + "%"} {runner.rdt}
                            </div>
                          )} */}

                          {/* SUSPENDED Overlay */}
                          {(runner.status === "SUSPENDED" || selfSuspend) && (
                            <div className="asian-full-market-inner"></div>
                          )}

                          {/* Full Row Replacement for REMOVED or selfSuspend */}
                          {runner.gstatus === "REMOVED" ? (
                            <td
                              className="absolute top-0 left-0 w-full h-full bg-white/50 border-2 border-[#ca1010] grid place-items-center"
                              colSpan={6}
                            >
                              {runner.gstatus === "REMOVED" && (
                                <div className="! text-bold">
                                  {runner.gstatus} {runner.adfa + "%"}{" "}
                                  {runner.rdt}
                                </div>
                              )}
                              {selfSuspend && (
                                <div className="removed-text">SUSPENDED</div>
                              )}
                            </td>
                          ) : null}

                          {/* Back Cells */}
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

                          {/* Lay Cells */}
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
                              bgColor="#EFD3D9"
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
                              bgColor="#F6E6EA"
                              hideOnMobile
                              betType="Lay"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 p-1">
                        <p className="bg-[#bed5d8] rounded text-black px-[4px] text-[10px] whitespace-nowrap">
                          <span className="font-bold">Jockey:</span>{" "}
                          {runner.jname || "NA"}
                        </p>
                        <p className="bg-[#bed5d8] rounded text-black px-[4px] text-[10px] whitespace-nowrap">
                          <span className="font-bold">Trainer:</span>{" "}
                          {runner.tname || "NA"}
                        </p>
                        <p className="bg-[#bed5d8] rounded text-black px-[4px] text-[10px] whitespace-nowrap">
                          <span className="font-bold">Age:</span>{" "}
                          {runner.hage || "NA"}
                        </p>
                        <p className="bg-[#bed5d8] rounded text-black px-[4px] text-[10px] whitespace-nowrap">
                          <span className="font-bold">Weight:</span>{" "}
                          {runner.hweight || "NA"}
                        </p>
                      </div>

                      {/* PlaceBet */}
                      {activeBet?.selectionId === runner.sid && (
                        <PlaceBet
                          sportName={"Horse Race"}
                          competitionId={gmid}
                          marketId={gmid}
                          market="Horse Race"
                          eventNames={raceName}
                          markettype="Match Odds"
                          selectionId={runner.sid}
                          selection={runner.nat}
                          selectedOdds={selfSelectedOdds}
                          setActiveBet={setActiveBet}
                          suspendNow={isSuspended ? "aura-suspended" : ""}
                          runners={runners?.section}
                          eventId={10}
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

export default HorseMarket;
