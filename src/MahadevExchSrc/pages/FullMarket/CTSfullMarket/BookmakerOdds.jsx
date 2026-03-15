import { useDispatch, useSelector } from "react-redux";
import { BsInfoCircleFill } from "react-icons/bs";
import { isMobile } from "react-device-detect";
import useGetMarketNameByMarketId from "../../../../CommonComponents/useGetMarketNameByMarketId";
import { useCallback, useMemo, useState } from "react";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import MarketCell from "./MarketCell";
import { AnimatePresence, motion } from "framer-motion";
// import CashOutAura from "../../../components/CashoutAura";

// import PlaceBet from "../../../components/PlaceBet";
import { sportsMapping } from "./MatchDetailsBanner";
import { useSearchParams } from "react-router-dom";
import { MdArrowRightAlt } from "react-icons/md";
import { ImArrowRight } from "react-icons/im";
import { IoInformationCircleOutline } from "react-icons/io5";
import RulesModal from "./RulesModal";
import { handleOpenPlaceBet } from "../../../../redux/slices/placeBetSlice";
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

function BookMakerOdds() {
  const [searchParams] = useSearchParams();
  const eventId = Number(searchParams.get("eventId"));
  const { bookMakerData: BmakerData } = useSelector(
    (state) => state.bookmakerOdds || [],
  );

  const marketoddsData = useMemo(() => {
    const BookmakerData = BmakerData[eventId];
    return BookmakerData?.data || null;
  }, [BmakerData, eventId]);
  const markets = useSelector((state) => state?.marketOdds?.marketName || []);

  return (
    <div className="w-full flex flex-col">
      {Array.isArray(marketoddsData) &&
        marketoddsData?.map((market, i) => {
          return <MarketContainer market={market} markets={markets} />;
        })}
    </div>
  );
}

const MarketContainer = ({ market, markets }) => {
  const {
    marketId,
    totalMatched,
    runners: marketRunners,
    status: marketStatus,
    market: marketName,
  } = market;
  // const { marketName } = useGetMarketNameByMarketId(marketId, markets);
  const [showMarket, setShowMarket] = useState(true);
  const [activeBet, setActiveBet] = useState(null);
  const [searchParams] = useSearchParams();
  const eventId = Number(searchParams.get("eventId"));
  const sportId = Number(searchParams.get("eventType"));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const eventName = searchParams.get("eventName");
  const competitionId = Number(searchParams.get("competitionId"));

  const placedBets = useSelector((state) => state.account.bets);
  const placedBetsInThisMarket = placedBets.filter(
    (pb) =>
      pb?.marketId == marketId &&
      pb.market == marketName &&
      pb.event == eventName,
  );

  return (
    <motion.div
      key={marketId}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.1, ease: "easeInOut" }}
      className="shadow-sm"
    >
      <RulesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Dropdown Section with Framer Motion */}
      <AnimatePresence initial={false}>
        {showMarket && (
          <motion.div
            key="marketContent"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="overflow-hidden rounded-[10px] w-[98%] mx-auto mt-[45px]"
          >
             {/* Market Header */}
            <div className="w-full flex justify-between items-center  text-white  text-[12px] font-semibold ">
              <div className="bg-[#2d2d2d]  absolute z-0 text-white px-2 h-[55px] rounded-t-[10px] flex gap-2 items-center font-semibold">
                <span className="flex items-center -mt-6 gap-2.5 text-[12px] uppercase">
                  {marketName || "Market"}
                </span>
                <IoInformationCircleOutline className="-mt-6 text-[20px]"/>

              </div>
            </div>

            {/* Market Header */}
            <div className="w-full bg-[white] border-b border-[00000033]  relative z-10 text-white">
              <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold">
                <div className="text-[#7c7c7c] text-[11px] w-[65%] ">
                  Min: 100 | Max: 100000
                </div>

                {/* Back Lay Labels */}
                <div
                  className={`flex text-[13px] ${isMobile ? "w-[42%]" : "w-[70%]"} justify-end`}
                >
                  <div className="w-[50%] text-center font-extrabold text-[black]">
                    BACK
                  </div>

                  <div className="w-[50%] text-center font-extrabold text-[black]">
                    LAY
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            {marketRunners?.map((runner, index) => {
              let marketRunnerData = markets.find(
                (m) => m.marketId === marketId,
              );
              let runnerData = marketRunnerData?.runners.find(
                (r) => r.selectionId === runner.selectionId,
              );

              return (
                <MarketRunnerContainer
                  placedBetsInThisMarket={placedBetsInThisMarket}
                  marketName={marketName}
                  marketId={marketId}
                  runner={runner}
                  runnerData={runnerData}
                  marketRunners={marketRunners}
                  setActiveBet={setActiveBet}
                  activeBet={activeBet}
                  index={index}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const MarketRunnerContainer = ({
  placedBetsInThisMarket,
  marketName,
  marketId,
  runner,
  runnerData,
  marketRunners,
  setActiveBet,
  activeBet,
  index,
}) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const sportId = Number(searchParams.get("eventType"));
  const eventId = Number(searchParams.get("eventId"));

  const competitionId = Number(searchParams.get("competitionId"));

  const [selfSelectedOdds, setSelfSelectedOdds] = useState(0);

  // const handleMarketCellClick = (betBoxBgColor, price) => {
  //     setSelfSelectedOdds(price);
  //     dispatch(handleOpenPlaceBet({
  //         sportName: sportsMapping[sportId], sportId: sportId, competitionId, marketId, selectionId: runner.selectionId, betBoxBgColor
  //     }))
  // }
  const handleMarketCellClick = (betBoxBgColor, price, betType) => {
    setSelfSelectedOdds(price);
    if (price === 0) return;
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

  // const newCalc = activeBet && runner?.selectionId === activeBet?.selectionId ?
  //     activeBet?.favourMargin.toFixed(1) : activeBet?.againstMargin.toFixed(1)

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
  return (
    <div key={runner.selectionId} className="relative z-10 w-full bg-[white]">
      <div
        className={`w-full flex items-stretch justify-between min-h-[44px] 
    ${index === marketRunners?.length - 1 ? "" : "border-b border-[#00000033]"}`}
      >
        {/* Runner Column */}
        <div
          className={`flex flex-col justify-center w-[${
            isMobile ? "65%" : "30%"
          }] pl-2 pr-1 py-1`}
        >
          <p className="text-[14px] font-extrabold text-[#212529]">
            {runnerData?.runnerName || runner?.runner || "unknown"}
          </p>
          {/* {activeBet && newCalc && <p className={`flex flex-row items-center text-[10px] font-semibold ${newCalc>0 ? "text-green-600": "text-red-500"}`}> <span> <ImArrowRight className='mr-1' /> </span> {Math.abs(newCalc)} </p>} */}
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
                {Math.abs(placedBetCalculation)}{" "}
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
          className={`p-1.5 pr-2  ${
            runner.status.toLowerCase() != "active" ? "aura-suspended" : ""
          } flex gap-1 flex-grow w-[${isMobile ? "45%" : "70%"}]`}
          data-label={
            runner.status.toLowerCase() != "active"
              ? runner?.status || "Suspended"
              : ""
          }
        >
          {!isMobile && (
            <MarketCell
              handleMarketCellClick={handleMarketCellClick}
              price={runner?.ex?.availableToBack?.[2]?.price}
              size={runner?.ex?.availableToBack?.[2]?.size}
              bgColor="#8ec5fe"
              hideOnMobile
              betType="Back"
            />
          )}
          {!isMobile && (
            <MarketCell
              handleMarketCellClick={handleMarketCellClick}
              price={runner?.ex?.availableToBack?.[1]?.price}
              size={runner?.ex?.availableToBack?.[1]?.size}
              bgColor="#8ec5fe"
              hideOnMobile
              betType="Back"
            />
          )}
          <MarketCell
            handleMarketCellClick={handleMarketCellClick}
            price={runner?.ex?.availableToBack?.[0]?.price}
            size={runner?.ex?.availableToBack?.[0]?.size}
            bgColor="#8ec5fe"
            betType="Back"
          />
          <MarketCell
            handleMarketCellClick={handleMarketCellClick}
            price={runner?.ex?.availableToLay?.[0]?.price}
            size={runner?.ex?.availableToLay?.[0]?.size}
            bgColor="#ffa0d0"
            betType="Lay"
          />
          {!isMobile && (
            <MarketCell
              handleMarketCellClick={handleMarketCellClick}
              price={runner?.ex?.availableToLay?.[1]?.price}
              size={runner?.ex?.availableToLay?.[1]?.size}
              bgColor="#ffa0d0"
              hideOnMobile
              betType="Lay"
            />
          )}
          {!isMobile && (
            <MarketCell
              handleMarketCellClick={handleMarketCellClick}
              price={runner?.ex?.availableToLay?.[2]?.price}
              size={runner?.ex?.availableToLay?.[2]?.size}
              bgColor="#ffa0d0"
              hideOnMobile
              betType="Lay"
            />
          )}
        </div>
      </div>

      {/* <PlaceBet
                sportName={sportsMapping[sportId]}
                sportId={sportId}
                competitionId={competitionId}
                marketId={marketId}
                selectionId={runner.selectionId}
                selectedOdds={selfSelectedOdds}
            /> */}

      {/* <PlaceBet
        sportName={sportsMapping[sportId]}
        sportId={sportId}
        competitionId={competitionId}
        marketId={marketId}
        market={marketName}
        markettype="Bookmaker"
        selectionId={runner.selectionId}
        selection={runner?.runner}
        selectedOdds={selfSelectedOdds}
        setActiveBet={setActiveBet}
        suspendNow={`${
          runner.status.toLowerCase() != "active" || selfSelectedOdds == 0 ? "aura-suspended" : ""
        }`}
        runners={marketRunners.map(({ runner: r, selectionId: sid }) => {
          return { runner: r, selectionId: sid };
        })}
      /> */}
    </div>
  );
};

export default BookMakerOdds;
