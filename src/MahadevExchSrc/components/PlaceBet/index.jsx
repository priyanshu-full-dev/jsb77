import { useCallback, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { useDispatch, useSelector } from "react-redux";

import { useSearchParams } from "react-router-dom";
import { placeBet } from "../../../socketClient";

import { toast } from "react-toastify";

import { handleCancelPlaceBet } from "../../../redux/slices/placeBetSlice";
import {
  updateAvailableBalance,
  updateExposureBalance,
} from "../../../redux/slices/userSlice";

function PlaceBet(props) {
  const {
    sportName,
    sportId,
    competitionId,
    eventId,
    market,
    markettype,
    marketId,
    selectedOdds,
    selectionId,
    isFancyBet = false,
    setActiveBet,
  } = props;

  const placeBetId = `${sportId}:${competitionId}:${eventId}:${marketId}:${market}:${markettype}:${selectionId}`;
  const [wantToPlaceBet, setWantToPlaceBet] = useState(false);
  const openPlaceBetId = useSelector((state) => state?.placeBet?.placeBetId);

  useEffect(() => {
    if (openPlaceBetId === placeBetId) {
      setWantToPlaceBet(true);
    } else {
      setWantToPlaceBet(false);
    }
    return () => {
      if (setActiveBet) {
        setActiveBet(null);
      }
    };
  }, [openPlaceBetId]);

  if (wantToPlaceBet) {
    return <BetBox {...props} />;
  }
  return null;
}

const BetBox = (props) => {
  const {
    selectedOdds,
    isFancyBet = false,
    selectedSize: betSize,
    backSize,
    laySize,
    setActiveBet,
    setActiveOption,
    setActiveIndex,
    market,
    markettype,
    sportName,
    sportId,
    marketId,
    competitionId,
    selectionId,
    selection,
    suspendNow,
    runners,
    question,
    eventId: newEventId,
    eventNames,
    mid,
    min,
    max,
    disableOdds,
    joinedMarketId,
  } = props;
  const { betType } = useSelector((state) => state?.placeBet);
  const [searchParams] = useSearchParams();

  const eventName = searchParams.get("eventName") || eventNames;
  // const sportId = searchParams.get("eventType");
  const eventId = searchParams.get("eventId") || newEventId;
  // const competitionId = searchParams.get("competitionId");
  const joinedMarketIds = searchParams.get("joinedMarketIds") || joinedMarketId;

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  const [isSports, setIsSports] = useState(false);

  useEffect(() => {
    setIsSports(pathname.includes("full-market"));
  }, [pathname]);

  const handleStakeClick = (value) => {
    if (isSports) {
      setBetStake((prev) => Number(prev) + Number(value));
    } else {
      setBetStake(Number(value));
    }
  };

  const dispatch = useDispatch();
  const betBoxBgColor = useSelector((state) => state?.placeBet?.betBoxBgColor);

  const [betPrice, setBetPrice] = useState(0);
  const [betStake, setBetStake] = useState(null);
  const [betData, setBetData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setActiveIndex?.(null);
    setActiveOption?.(null);
    setActiveBet?.(null);

    dispatch(handleCancelPlaceBet());
  };

  useEffect(() => {
    setBetPrice(selectedOdds);
    // return () => {
    //     handleCancel()
    // }
  }, [selectedOdds]);

  useEffect(() => {
    const createBetData = {
      type: betType,

      event: eventName,
      eventId: eventId,
      eventType: sportId,
      joinedMarketIds: joinedMarketIds,
      legueId: competitionId,
      market: market,
      marketId: marketId,
      markettype: markettype,
      matchId:
        market === "Horse Race" || market === "Greyhound Race"
          ? marketId
          : eventId,
      roundId: mid,

      oddsReq: selectedOdds,
      price: selectedOdds,
      placeTime: new Date().toISOString(),
      runners:
        market === "Horse Race" || "Greyhound Race"
          ? runners
          : runners?.map(({ runnerName, runner, selectionId }) => ({
              [runnerName ? "runnerName" : "runner"]: runnerName
                ? runnerName
                : runner,
              selectionId,
            })),
      runnersCount: runners?.length,
      selection,
      selectionId: selectionId,
      // siteId: ,
      sportsName: sportName,
      stake: betStake,
    };
    if (markettype === "Bookmaker") {
      createBetData.favourMargin =
        betType === "Lay" ? betStake : (selectedOdds * Number(betStake)) / 100;
      createBetData.againstMargin =
        betType === "Back"
          ? -betStake
          : -((selectedOdds * Number(betStake)) / 100);
    }
    if (markettype === "Match Odds") {
      const stake = Number(betStake);
      const odds = Number(selectedOdds);

      if (isNaN(stake) || isNaN(odds)) {
        console.error("Invalid stake or odds value");
      } else {
        createBetData.favourMargin =
          betType === "Lay" ? stake : (odds - 1) * stake;

        createBetData.againstMargin =
          betType === "Back" ? -stake : -((odds - 1) * stake);

        // Format only after calculations are done
        createBetData.favourMargin = Number(
          createBetData.favourMargin.toFixed(2),
        );
        createBetData.againstMargin = Number(
          createBetData.againstMargin.toFixed(2),
        );
      }
    }

    if (markettype === "Casino") {
      createBetData.favourMargin =
        betType === "Lay" ? betStake : (selectedOdds - 1) * Number(betStake);
      createBetData.againstMargin =
        betType === "Back"
          ? -betStake
          : -((selectedOdds - 1) * Number(betStake));
    }

    if (market === "Premium Cricket" && question) {
      createBetData.question = question;
    }
    if (markettype === "Fancy") {
      if (betPrice && betSize && betStake && betType) {
        const newSize = parseFloat(betSize) / 100;
        const pl = parseFloat(newSize) * parseFloat(betStake);
        let fancyProfit = 0.0;
        let fancyLoss = 0.0;
        if (betType === "Back") {
          fancyProfit = pl?.toFixed(2);
          fancyLoss = parseFloat(betStake)?.toFixed(2);
        } else if (betType === "Lay") {
          fancyProfit = parseFloat(betStake)?.toFixed(2);
          fancyLoss = pl?.toFixed(2);
        }
        // setBetData((prev) => ({
        //   ...prev,
        createBetData.favourMargin = fancyProfit;
        createBetData.againstMargin = fancyLoss;
        createBetData.stake = createBetData.stake.toString();
        createBetData.price = createBetData.oddsReq;
        createBetData.size = betSize;
        createBetData.backSize = backSize;
        createBetData.laySize = laySize;

        //   againstMargin: fancyLoss,
        //   sportsName: sport,
        // }));
      }
    }
    if (setActiveBet) {
      setActiveBet(createBetData);
    }
    setBetData(createBetData);
  }, [betPrice, betStake]);

  // Helpers
  const incrementValue = (val) =>
    val === 0 ? 1 : parseFloat((val + val * 0.05).toFixed(2));
  const decrementValue = (val) =>
    val === 0 ? 0 : Math.max(0, parseFloat((val - val * 0.05).toFixed(2)));

  const handlePlaceBet = async () => {
    setLoading(true);

    try {
      if (betData.stake < min || betData.stake > max) {
        toast.warning(`Bet must be between ${min} - ${max}`);
        handleCancel();
        return;
      }

      const placeBetResponse = await placeBet({
        ...betData,
        againstMargin: Math.abs(betData?.againstMargin)?.toString(),
        legueId: betData.legueId.toString(),
        stake: betData.stake.toString(),
      });

      if (!placeBetResponse?.success) {
        toast.warning(placeBetResponse?.message || "Bet failed");
        handleCancel();
        return;
      }

      if (setActiveBet) {
        setActiveBet(null);
      }

      dispatch(
        updateAvailableBalance(placeBetResponse?.userData?.availableBalance),
      );
      dispatch(updateExposureBalance(placeBetResponse?.exposure));

      toast.success(placeBetResponse?.message);
      handleCancel();
    } catch (error) {
      console.error("Place bet error:", error);
      // toast.error("Something went wrong while placing bet");
      handleCancel();
    } finally {
      setLoading(false);
    }
  };

  const [stakes, setStakes] = useState(() => {
    const savedStakes = localStorage.getItem("stakes");
    if (savedStakes) {
      try {
        const parsedStakes = JSON.parse(savedStakes);
        if (Array.isArray(parsedStakes)) {
          return parsedStakes;
        }
      } catch (err) {
        console.error("Failed to parse saved stakes:", err);
      }
    }

    return [
      { id: 1, buttonValue: "100" },
      { id: 2, buttonValue: "500" },
      { id: 3, buttonValue: "800" },
      { id: 4, buttonValue: "1000" },
      { id: 5, buttonValue: "5000" },
      { id: 6, buttonValue: "10000" },
      { id: 7, buttonValue: "50000" },
      { id: 8, buttonValue: "100000" },
    ];
  });


  console.log({betData});
  

return (
  <>
    {loading && <>Loading...</>}

    <div className={` w-full border-b ${ betType === "Back" ? "border-[#9ec9ff]" : "border-[#f9b6c2]"}  `}>

      {/* HEADER */}
      <div
        className={`flex justify-between items-center text-sm font-semibold ${
          betType === "Back" ? "bg-[#9ecaffe0]" : "bg-[#f9b6c2d6]"
        }`}
      >
        <div className="flex items-center gap-3">

          <button
            onClick={handleCancel}
            className={`font-bold h-[45px] w-[70px] text-black ${
          betType === "Back" ? "bg-[#8ebff9]" : "bg-[#fbafbd]"
        }`}
          >
            BACK
          </button>

          <div className="flex flex-col">
            <span className="font-bold text-black">
              {selection || eventName}
            </span>

            <span className="text-[11px] -mt-1 text-gray-800">
              {market} ({markettype})
            </span>
          </div>

        </div>


      </div>

      {/* MIN BET */}
      <div className="bg-[#2f2f2f] text-white px-3 py-2 text-sm font-semibold">
        Minimum Bet : {min}
      </div>

      {/* BODY */}
      <div className="bg-[white] p-3">

        {/* ODDS + STAKE */}
        <div className="flex items-center gap-3 mb-3">

          <span className="text-[12px] font-semibold">Odds</span>

          <button
            className="bg-black text-white w-[20px] h-[28px] flex justify-center items-center rounded"
            onClick={() =>
              setBetPrice((prev) => decrementValue(Number(prev)))
            }
          >
            -
          </button>

          <input
            type="number"
            value={betPrice}
            onChange={(e) => setBetPrice(Number(e.target.value))}
            className="w-[90px] h-[28px] text-center border rounded bg-white"
          />

          <button
            className="bg-black text-white w-[20px] h-[28px] flex justify-center items-center rounded"
            onClick={() =>
              setBetPrice((prev) => incrementValue(Number(prev)))
            }
          >
            +
          </button>

          <span className="text-[12px] font-semibold ml-4">
            Stake
          </span>

          <input
            type="number"
            value={betStake ?? ""}
            onChange={(e) => setBetStake(Number(e.target.value))}
            className="w-[150px] h-[28px] text-center border rounded bg-white"
          />

        </div>

        {/* QUICK BUTTONS */}
        <div className="grid grid-cols-4 gap-2 mb-3">

          {[50, 100, 250, 400, 1000, 5000, 10000].map((num) => (
            <button
              key={num}
              className="bg-white border border-[#0000001a] rounded py-1 text-[12px] font-semibold"
              onClick={() => handleStakeClick(num)}
            >
              +{num}
            </button>
          ))}

          <button
            className="bg-black text-white rounded py-1 text-[12px] font-semibold"
            onClick={() => setBetStake(1000000)}
          >
            MAX
          </button>

        </div>

        {/* ACCEPT ODDS */}
        {/* <div className="flex items-center gap-3 mb-4">

          <span className="text-sm font-semibold">
            Accept Any Odds
          </span>

          <label className="relative inline-flex items-center cursor-pointer">

            <input
              type="checkbox"
              className="sr-only peer"
              defaultChecked
            />

            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500"></div>

            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>

          </label>

        </div> */}

        {/* BUTTONS */}
        <div className="flex gap-3">

          <button
            onClick={handleCancel}
            className="flex-1 bg-[#ff0000] text-white py-1.5 text-[14px] rounded font-bold"
          >
            CANCEL
          </button>

          <button
            disabled={!betStake || !betPrice}
            onClick={handlePlaceBet}
            className="flex-1 bg-[#38b44b] text-[14px] text-white py-1.5 rounded font-bold"
          >
            PLACE BET ✓
          </button>

        </div>

      </div>
    </div>
  </>
);
};

export default PlaceBet;
