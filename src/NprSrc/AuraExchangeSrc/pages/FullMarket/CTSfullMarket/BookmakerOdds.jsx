import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsInfoCircleFill } from "react-icons/bs";
import { isMobile } from "react-device-detect";
import { useCallback, useMemo, useState, useEffect } from "react";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import MarketCell from "./MarketCell";
import CashOutAura from "../../../components/CashoutAura";
import { handleOpenPlaceBet, handleCancelPlaceBet } from "../../../../../redux/slices/placeBetSlice";
import { displayAuthModal } from "../../../../../redux/slices/authModalSlice";
import PlaceBet from "../../../components/PlaceBet";
import { sportsMapping } from "./MatchDetailsBanner";
import { useSearchParams } from "react-router-dom";
import { MdArrowRightAlt } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";
import { ImArrowRight } from "react-icons/im";
import { IoInformationCircleOutline } from "react-icons/io5";
import RulesModal from "./RulesModal";
export function formatToKOrM(value) {
  if (!value) return value;
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + "K";
  } else {
    return value?.toFixed?.(1) ?? value;
  }
}

function BookMakerOdds({ odds, activeMarketCategory }) {
  const marketoddsData = useMemo(() => {
    return Array.isArray(odds) ? odds : odds?.data || null;
  }, [odds]);

  const category = activeMarketCategory?.toLowerCase() || "all";

  const filteredMarketoddsData = useMemo(() => {
    if (!Array.isArray(marketoddsData)) return [];

    if (category === "all") {
      return marketoddsData;
    }

    if (category === "popular") {
      return marketoddsData;
    }

    return marketoddsData.filter(
      (market) => market.marketName?.toLowerCase() === category,
    );
  }, [marketoddsData, category]);

  return (
    <div className="w-full flex flex-col">
      {filteredMarketoddsData?.map((market, i) => (
        <MarketContainer key={market?.marketId || i} market={market} />
      ))}
    </div>
  );
}

const MarketContainer = React.memo(function MarketContainer({ market }) {
  const { marketId, marketName, min, max, runnersData, oddsData, news } =
    market;

  const effectiveMin =
    min ??
    market?.minBet ??
    market?.minL ??
    oddsData?.min ??
    oddsData?.minBet;
  const effectiveMax =
    max ??
    market?.maxBet ??
    market?.maxL ??
    oddsData?.max ??
    oddsData?.maxBet;

  // runners + status + totalMatched now live under oddsData
  const marketRunners = useMemo(
    () =>
      (oddsData?.runners || []).map((runner) => {
        const selectionId = String(runner.selectionId);

        return {
          selectionId: runner.selectionId,
          runnerName: runnersData[selectionId] || null,
          handicap: runner.handicap ?? 0,
          status: runner.status,
          price: runner.price,
        };
      }),
    [oddsData?.runners, runnersData],
  );
  const marketStatus = oddsData?.status || "";
  const totalMatched = oddsData?.totalMatched ?? 0;

  const [showMarket, setShowMarket] = useState(true);
  const [activeBet, setActiveBet] = useState(null);
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const sportId = Number(searchParams.get("eventType"));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const eventName = market?.eventName || searchParams.get("eventName") || "";



  const competitionId = Number(searchParams.get("competitionId"));

  const placedBets = useSelector((state) => state.account.bets);
  const placedBetsInThisMarket = useMemo(
    () =>
      placedBets.filter(
        (pb) =>
          pb?.marketId == marketId &&
          pb.market == marketName &&
          pb.event == eventName,
      ),
    [placedBets, marketId, marketName, eventName],
  );

  return (
    <div key={marketId} className="shadow-sm ">
      {/* Row 1 */}
      <div className="w-full h-full flex flex-row items-center justify-between min-h-7 mt-2 border-b-[1px] border-[#7e97a7] bg-white border-t-[0.3px] pr-2">
        <div className="w-full flex flex-row flex-grow items-center">
          <span className="whitespace-nowrap h-[30px] flex flex-row gap-2 items-center justify-between text-center  pl-2 pr-2 py-2.5 rounded-tr-[14px] bg-aura-blue-gradient text-white dark:text-white text-[12px] font-bold">
            {marketName}{" "}
            <IoInformationCircleOutline
              size={18}
              onClick={() => setIsModalOpen(true)}
            />
          </span>
          <span className="pl-2">
            <CashOutAura
              marketId={marketId}
              filteredBets={placedBetsInThisMarket}
              runningData={marketRunners}
              odds={marketRunners}
              runnerData={marketRunners.map((runner) => ({
                selectionId: runner.selectionId,
                runnerName: runner.runnerName,
                selectionName: runner.runnerName,
                name: runner.runnerName,
                price: runner.price,
                status: runner.status,
              }))}
              eventId={eventId}
              legueId={competitionId}
              matchId={eventId}
              event={eventName}
              markettype="Bookmaker"
              market={marketName}
              sportName={sportsMapping[sportId]}
              DisMarketName={marketName}
              min={effectiveMin}
              max={effectiveMax}
            />
          </span>
          {/* <p>{marketStatus}</p> */}
        </div>
        {marketName == "Bookmaker" && (
          <div
            className="flex flex-row items-center pr-2 whitespace-nowrap"
            style={{ color: "#000000", fontFamily: "Tahoma, Helvetica, sans-serif" }}
          >
            <span className="text-[11px] mr-1" style={{ color: "#000000" }}>Matched</span>
            <span className="text-[11px] font-bold" style={{ color: "#000000" }}>
              &#8364;{formatToKOrM(totalMatched || 0)}
            </span>
          </div>
        )}

        <div
          role="button"
          onClick={() => setShowMarket((prev) => !prev)}
          className="rounded-full bg-aura-blue-gradient text-white"
        >
          {/* {showMarket ? (
            <CiCircleMinus size={18} />
          ) : (
            <CiCirclePlus size={18} />
          )} */}
        </div>
      </div>

      {news && (
        <div className="m-0 p-0 leading-none">
          <marquee
            className="block bg-white h-[17px] leading-[17px] m-0 p-0 text-[11px] text-[#1d1f21] font-bold"
            scrollamount="4"
          >
            {news}
          </marquee>
        </div>
      )}

      {isModalOpen && (
        <RulesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Dropdown Section with Framer Motion */}
      <>
        {showMarket && (
          <div className="overflow-hidden bg-[#faf8d8]">
            {/* Row 2 */}
            <div className="w-full h-full flex flex-row items-center justify-between  border-b-[1px] border-[#7e97a7] bg-[#faf8d8] border-t-[0.3px]">
              <div
                className={`flex flex-grow w-[${isMobile ? "65%" : "30%"
                  }]  pl-2 pr-1`}
              >
                <div className="w-full text-[12px] h-[20px] font-bold bg-[#bed5d8] rounded-[3px] flex justify-center">
                  <div>
                    <span className="text-[#315195] text-[10px] font-bold">
                      Min/Max &nbsp;
                    </span>
                    <span className="text-[10px] font-bold text-black">
                      {effectiveMin != null && effectiveMax != null
                        ? `${effectiveMin} - ${effectiveMax}`
                        : effectiveMax != null
                          ? `${effectiveMax}`
                          : effectiveMin != null
                            ? `${effectiveMin}`
                            : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`flex flex-row flex-grow w-[${isMobile ? "35%" : "70%"
                  }]`}
              >
                <div
                  className={`w-full flex flex-grow basis-[${isMobile ? 1 / 2 : 1 / 6
                    }%] py-1 text-xs font-bold items-center justify-center ${isMobile
                      ? "bg-[linear-gradient(90deg,_rgba(130,183,221,0.15)_0%,_rgba(130,183,221,0.8)_65%)]"
                      : "bg-[linear-gradient(90deg,_rgba(130,183,221,0.15)_0%,_rgba(130,183,221,0.8)_65%)]"
                    }`}
                >
                  Back
                </div>
                <div
                  className={`w-full flex flex-grow basis-[${isMobile ? 1 / 2 : 1 / 6
                    }%] py-1 text-xs font-bold items-center justify-center ${isMobile
                      ? "bg-[linear-gradient(270deg,_rgba(231,170,184,0.15)_5%,_rgba(231,170,184,0.8)_60%)]"
                      : "bg-[linear-gradient(270deg,_rgba(231,170,184,0.15)_5%,_rgba(231,170,184,0.8)_60%)]"
                    }`}
                >
                  Lay
                </div>
              </div>
            </div>

            {/* Row 3 */}
            {marketRunners?.map((runner) => {
              const runnerName =
                runnersData?.[runner.selectionId] ??
                runnersData?.[String(runner.selectionId)] ??
                "unknown";

              return (
                <MarketRunnerContainer
                  key={runner.selectionId}
                  placedBetsInThisMarket={placedBetsInThisMarket}
                  marketName={marketName}
                  marketId={marketId}
                  runner={runner}
                  runnerName={runnerName}
                  marketRunners={marketRunners}
                  runnersData={runnersData}
                  setActiveBet={setActiveBet}
                  activeBet={activeBet}
                  marketStatus={marketStatus}
                  min={effectiveMin}
                  max={effectiveMax}
                  market={market}
                  oddsData={oddsData}
                />
              );
            })}
          </div>
        )}
      </>
    </div>
  );
});

export const MarketRunnerContainer = React.memo(
  ({
    placedBetsInThisMarket,
    marketName,
    marketId,
    runner,
    runnerName,
    marketRunners,
    runnersData,
    setActiveBet,
    activeBet,
    marketStatus,
    min,
    max,
    market,
    oddsData,
  }) => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
    const [searchParams] = useSearchParams();
    const sportId = Number(searchParams.get("eventType"));
    const eventId = searchParams.get("eventId");

    const competitionId = Number(searchParams.get("competitionId"));

    const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);

    const [activeCell, setActiveCell] = useState(null);

    const handleMarketCellClick = (
      betBoxBgColor,
      price,
      betType,
      activeKey,
    ) => {
      setSelfSelectedOdds(price);
      if (price === 0) return;
      setActiveCell(activeKey);

      dispatch(
        handleOpenPlaceBet({
          sportName: sportsMapping[sportId],
          sportId: sportId,
          competitionId,
          marketId,
          market: marketName,
          markettype: "Bookmaker",
          selectionId: runner.selectionId,
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
              fb.selectionId.toString() === runner.selectionId.toString() &&
              eventId.toString() === fb.matchId.toString() &&
              fb.marketId === marketId,
          ) || [];

        const fbOfOtherRunners =
          filteredBets?.filter(
            (fb) =>
              fb.selectionId.toString() !== runner.selectionId.toString() &&
              eventId.toString() === fb.matchId.toString() &&
              fb.marketId === marketId,
          ) || [];

        let placedBetCalculation =
          fbOfThisRunner.reduce(
            (acc, fbr) =>
              acc +
              (fbr.type === "Back" ? fbr.favourMargin : -fbr.againstMargin),
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

    const backPrice = runner?.price?.back?.[0]?.price;

    const statusInactive =
      runner?.status?.toLowerCase() !== "active" &&
      runner?.status?.toLowerCase() !== "online" &&
      runner?.status?.toLowerCase() !== "open";

    const marketInactive =
      marketStatus?.toLowerCase() !== "active" &&
      marketStatus?.toLowerCase() !== "online" &&
      marketStatus?.toLowerCase() !== "open";

    const isRunnerSuspended =
      marketInactive || statusInactive || !backPrice || backPrice === 0;

    useEffect(() => {
      if (isRunnerSuspended && activeCell) {
        setActiveCell(null);
        if (setActiveBet) setActiveBet(null);
        dispatch(handleCancelPlaceBet());
      }
    }, [isRunnerSuspended, activeCell, dispatch, setActiveBet]);

    let newCalc;
    if (activeBet) {
      if (
        runner?.selectionId === activeBet?.selectionId &&
        activeBet.type === "Back"
      ) {
        newCalc = Number(activeBet.favourMargin).toFixed(0);
      } else if (
        runner?.selectionId === activeBet?.selectionId &&
        activeBet.type === "Lay"
      ) {
        newCalc = Number(activeBet.againstMargin).toFixed(0);
      } else if (
        runner?.selectionId !== activeBet?.selectionId &&
        activeBet.type === "Back"
      ) {
        newCalc = Number(activeBet.againstMargin).toFixed(0);
      } else if (
        runner?.selectionId !== activeBet?.selectionId &&
        activeBet.type === "Lay"
      ) {
        newCalc = Number(activeBet.favourMargin).toFixed(0);
      }
    }
    if (newCalc == 0 || !activeBet?.stake || Number(activeBet?.stake) === 0) {
      newCalc = null;
    }
    return (
      <div key={runner.selectionId} className="relative w-full ">
        <div className="w-full flex items-stretch justify-between min-h-11 border-b-[1px] border-[#7e97a7] ">
          {/* Runner Column */}
          <div
            className={`flex flex-col justify-center w-[${isMobile ? "65%" : "30%"
              }] pl-2 pr-1 py-1`}
          >
            <p className="text-[13px] font-bold text-black ">
              {runnerName || "unknown"}
            </p>
            <div className="flex flex-row items-center">
              {placedBetCalculation !== 0 && (
                <p
                  className={`flex flex-row items-center text-[11px] font-bold ${placedBetCalculation > 0 ? "text-[#228B22]" : "text-[#D0021B]"
                    }`}
                >
                  <span>
                    <FaArrowRight
                      className="mr-1 inline-block"
                      size={10.5}
                      style={{ stroke: "currentColor", strokeWidth: 24 }}
                    />
                  </span>
                  {placedBetCalculation < 0 ? "-" : ""}
                  {Math.abs(placedBetCalculation).toFixed(2)}
                </p>
              )}
              {activeBet && newCalc && Number(newCalc) !== 0 && (
                <p
                  className={`flex flex-row items-center text-[11px] font-bold ${placedBetCalculation === 0 ? "" : "ml-0.5"
                    } ${Number(newCalc || 0) + (Number(placedBetCalculation) || 0) >
                      0
                      ? "text-[#228B22]"
                      : "text-[#D0021B]"
                    }`}
                >
                  (
                  {Number(newCalc || 0) + (Number(placedBetCalculation) || 0) <
                    0
                    ? ` -${Math.abs(
                      Number(newCalc || 0) +
                      (Number(placedBetCalculation) || 0),
                    ).toFixed(2)} `
                    : ` ${Math.abs(
                      Number(newCalc || 0) +
                      (Number(placedBetCalculation) || 0),
                    ).toFixed(2)} `}
                  )
                </p>
              )}
            </div>
          </div>

          {/* MarketCell Column */}

          <div
            className={`${isRunnerSuspended ? "aura-suspended" : ""
              } flex flex-wrap flex-grow w-[${isMobile ? "35%" : "70%"}]`}
            data-label={
              isRunnerSuspended
                ? (statusInactive
                  ? runner?.statusrawStatus?.charAt(0)?.toUpperCase() +
                  runner?.statusrawStatus?.slice(1)?.toLowerCase()
                  : "") || "Suspended"
                : ""
            }
          //  data-label={
          //           isRunnerSuspended

          //                 ? rawStatus.charAt(0).toUpperCase() +
          //                   rawStatus.slice(1).toLowerCase()
          //                 : ""

          //         }
          >
            {!isMobile && (
              <MarketCell
                handleMarketCellClick={handleMarketCellClick}
                price={runner?.price?.back?.[2]?.price}
                size={runner?.price?.back?.[2]?.size}
                bgColor="#D7E8F4"
                hideOnMobile
                betType="Back"
              />
            )}
            {!isMobile && (
              <MarketCell
                handleMarketCellClick={handleMarketCellClick}
                price={runner?.price?.back?.[1]?.price}
                size={runner?.price?.back?.[1]?.size}
                bgColor="#B7D5EB"
                hideOnMobile
                betType="Back"
              />
            )}
            <div className="w-[50%] p-[3px] bg-[linear-gradient(90deg,_rgba(130,183,221,0.15)_0%,_rgba(130,183,221,0.8)_65%)]">
              <MarketCell
                handleMarketCellClick={(bg, price, type) =>
                  handleMarketCellClick(
                    bg,
                    price,
                    type,
                    `${runner.selectionId}-Back`,
                  )
                }
                price={runner?.price?.back?.[0]?.price}
                size={runner?.price?.back?.[0]?.size}
                bgColor="#72BBEF"
                betType="Back"
                h={true}
                isActive={activeCell === `${runner.selectionId}-Back`}
              />
            </div>

            <div className="w-[50%] p-[3px] bg-[linear-gradient(270deg,_rgba(231,170,184,0.15)_5%,_rgba(231,170,184,0.8)_60%)]">
              <MarketCell
                handleMarketCellClick={(bg, price, type) =>
                  handleMarketCellClick(
                    bg,
                    price,
                    type,
                    `${runner.selectionId}-Lay`,
                  )
                }
                price={runner?.price?.lay?.[0]?.price}
                size={runner?.price?.lay?.[0]?.size}
                bgColor="#FAA9BA"
                betType="Lay"
                h={true}
                isActive={activeCell === `${runner.selectionId}-Lay`}
              />
            </div>

            {!isMobile && (
              <MarketCell
                handleMarketCellClick={handleMarketCellClick}
                price={runner?.price?.lay?.[1]?.price}
                size={runner?.price?.lay?.[1]?.size}
                bgColor="#EFD3D9"
                hideOnMobile
                betType="Lay"
              />
            )}
            {!isMobile && (
              <MarketCell
                handleMarketCellClick={handleMarketCellClick}
                price={runner?.price?.lay?.[2]?.price}
                size={runner?.price?.lay?.[2]?.size}
                bgColor="#F6E6EA"
                hideOnMobile
                betType="Lay"
                isActive={activeCell === runner?.selectionId}
              />
            )}
          </div>
        </div>

        {activeCell && (
          <PlaceBet
            sportName={sportsMapping[sportId]}
            sportId={sportId}
            competitionId={competitionId}
            marketId={marketId}
            market={marketName}
            markettype="Bookmaker"
            selectionId={runner.selectionId}
            selection={runnerName}
            selectedOdds={selfSelectedOdds}
            setActiveBet={setActiveBet}
            setActiveCell={setActiveCell}
            suspendNow={`${isRunnerSuspended || selfSelectedOdds == 0 ? "aura-suspended" : ""
              }`}
            runners={marketRunners.map(({ selectionId: sid }) => {
              return {
                runner: runnersData?.[sid] ?? runnersData?.[String(sid)],
                selectionId: sid,
              };
            })}
            min={
              min ??
              market?.minBet ??
              market?.minL ??
              oddsData?.min ??
              oddsData?.minBet
            }
            max={
              max ??
              market?.maxBet ??
              market?.maxL ??
              oddsData?.max ??
              oddsData?.maxBet
            }
          />
        )}
      </div>
    );
  },
);

export default React.memo(BookMakerOdds);
