import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { useDispatch, useSelector } from "react-redux";
import { handleCancelPlaceBet } from "../../../../redux/slices/placeBetSlice";
import { displayAuthModal } from "../../../../redux/slices/authModalSlice";
import { useSearchParams } from "react-router-dom";
import { placeBet } from "../../../../socketClient";
import {
  updateAvailableBalance,
  updateExposureBalance,
} from "../../../../redux/slices/userSlice";
import { toast } from "react-toastify";
import Loader from "../../../../utils/Loader";
import {
  getUserData,
  selectSite,
} from "../../../../utils/helper/commonSelectors";
import MinusIcon from "./MinusIcon";
import PlusIcon from "./PlusIcon";
import { useGradientColor } from "../../hooks/useThemeColors";
import ExposureToast from "../ExposureToast";
import API from "../../../../api/axios";

const recentlyPlacedMarketKeys = new Set();

const normalizeMarketValue = (value) => String(value ?? "").trim();

const isValidMarketId = (value) => {
  const normalized = normalizeMarketValue(value);
  return Boolean(normalized && normalized !== "0" && normalized !== "null");
};

const getMarketIdentity = (bet = {}) => {
  const marketId = normalizeMarketValue(bet?.marketId);

  if (isValidMarketId(marketId)) {
    return `market:${marketId}`;
  }

  // Fallback for bet types that do not provide a usable marketId.
  return [
    "fallback",
    normalizeMarketValue(bet?.eventId || bet?.matchId),
    normalizeMarketValue(bet?.markettype).toLowerCase(),
    normalizeMarketValue(bet?.market).toLowerCase(),
    normalizeMarketValue(bet?.question).toLowerCase(),
    normalizeMarketValue(bet?.joinedMarketIds),
  ].join(":");
};

const getUserMarketKey = (userId, bet) =>
  `${normalizeMarketValue(userId) || "unknown-user"}|${getMarketIdentity(bet)}`;

const isSameMarketBet = (existingBet = {}, currentBet = {}) => {
  const existingMarketId = existingBet?.marketId;
  const currentMarketId = currentBet?.marketId;

  if (isValidMarketId(existingMarketId) && isValidMarketId(currentMarketId)) {
    return (
      normalizeMarketValue(existingMarketId) ===
      normalizeMarketValue(currentMarketId)
    );
  }

  const existingEventId = normalizeMarketValue(
    existingBet?.eventId || existingBet?.matchId,
  );
  const currentEventId = normalizeMarketValue(
    currentBet?.eventId || currentBet?.matchId,
  );

  return Boolean(
    existingEventId &&
    currentEventId &&
    existingEventId === currentEventId &&
    normalizeMarketValue(existingBet?.markettype).toLowerCase() ===
    normalizeMarketValue(currentBet?.markettype).toLowerCase() &&
    normalizeMarketValue(existingBet?.market).toLowerCase() ===
    normalizeMarketValue(currentBet?.market).toLowerCase() &&
    normalizeMarketValue(existingBet?.question).toLowerCase() ===
    normalizeMarketValue(currentBet?.question).toLowerCase(),
  );
};

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
  const dispatch = useDispatch();
  const openPlaceBetId = useSelector((state) => state?.placeBet?.placeBetId);
  const existingBets = useSelector((state) => {
    const betsState = state?.bets;

    if (Array.isArray(betsState)) return betsState;
    if (Array.isArray(betsState?.bets)) return betsState.bets;
    if (Array.isArray(betsState?.data)) return betsState.data;
    if (Array.isArray(betsState?.data?.bets)) return betsState.data.bets;

    return [];
  });

  useEffect(() => {
    const isSusp =
      props.suspendNow &&
      typeof props.suspendNow === "string" &&
      (props.suspendNow.toLowerCase().includes("suspend") ||
        props.suspendNow.toLowerCase().includes("ball_running") ||
        props.suspendNow.toLowerCase().includes("close"));

    if (isSusp && openPlaceBetId === placeBetId) {
      setWantToPlaceBet(false);
      dispatch(handleCancelPlaceBet());
      if (props.setActiveCell) props.setActiveCell(null);
      if (props.setActiveBet) props.setActiveBet(null);
    }
  }, [
    props.suspendNow,
    openPlaceBetId,
    placeBetId,
    dispatch,
    props.setActiveCell,
    props.setActiveBet,
  ]);

  // NOTE: track whether THIS instance was the open one on the previous
  // render, so we can tell "opening" apart from "closing/switching away".
  const wasOpenRef = useRef(openPlaceBetId === placeBetId);

  useEffect(() => {
    const isOpenNow = openPlaceBetId === placeBetId;
    setWantToPlaceBet(isOpenNow);

    return () => {
      if (wasOpenRef.current && setActiveBet) {
        setActiveBet(null);
      }
      wasOpenRef.current = isOpenNow;
    };
  }, [openPlaceBetId]);

  if (wantToPlaceBet) {
    return <BetBox {...props} existingBets={existingBets} />;
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
    isCasino,
    setActiveCell,
    existingBets = [],
    odds,
    selectedPriceIndex,
    betBoxBgColor: propBetBoxBgColor,
  } = props;
  const { betType = "Back" } = useSelector((state) => state?.placeBet) || {};
  const [searchParams] = useSearchParams();
  const userData = useSelector(getUserData());
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const loggedInType = useSelector((state) => state?.user?.loggedInType);

  const eventName = searchParams.get("eventName") || eventNames;
  // const sportId = searchParams.get("eventType");
  const eventId = searchParams.get("eventId") || newEventId;
  // const competitionId = searchParams.get("competitionId");
  const joinedMarketIds = searchParams.get("joinedMarketIds") || joinedMarketId;

  const gradiantcolor = useGradientColor();

  const siteDetails = useSelector(selectSite());

  const handleStakeClick = (value) => {
    setBetStake((prev) => (Number(prev) || 0) + Number(value));
  };

  const dispatch = useDispatch();
  const betBoxBgColor = useSelector((state) => state?.placeBet?.betBoxBgColor);
  const effectiveBetBoxBgColor = propBetBoxBgColor || betBoxBgColor;
  const isCasinoBet = isCasino || markettype === "Casino";
  const isOddsDisabled = disableOdds || isFancyBet || markettype !== "Match Odds";
  const isBallByBall =
    eventNames === "ballbyball" ||
    eventName === "ballbyball" ||
    market === "runs" ||
    marketId === "runs";

  const betSectionBgColor =
    betType === "Lay"
      ? "#faeff2"
      : effectiveBetBoxBgColor &&
        effectiveBetBoxBgColor.toLowerCase() !== "#72bbef"
        ? effectiveBetBoxBgColor
        : isBallByBall
          ? "#d3edd0"
          : "#D4E8F8";
  const [betPrice, setBetPrice] = useState(0);
  const [betStake, setBetStake] = useState(null);
  const [betData, setBetData] = useState(null);
  const [loading, setLoading] = useState(false);

  const isCancelledRef = useRef(false);

  const handleCancel = () => {
    isCancelledRef.current = true;
    setActiveIndex?.(null);
    setActiveOption?.(null);
    setActiveBet?.(null);
    setActiveCell?.(null);
    setBetStake(null);
    setBetPrice(0);
    dispatch(handleCancelPlaceBet());
  };

  useEffect(() => {
    setBetPrice(selectedOdds);
    // return () => {
    //     handleCancel()
    // }
  }, [selectedOdds]);

  useEffect(() => {
    // don't resurrect activeBet after Cancel was clicked
    if (isCancelledRef.current) return;

    const currentOdds = Number(betPrice);

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

      // IMPORTANT: current changed odds
      oddsReq: betPrice,
      price: betPrice,

      placeTime: new Date().toISOString(),

      runners:
        market === "Horse Race" || market === "Greyhound Race"
          ? runners
          : runners?.map(({ runnerName, runner, selectionId }) => ({
            [runnerName ? "runnerName" : "runner"]: runnerName
              ? runnerName
              : runner,
            selectionId,
          })),

      runnersCount: runners?.length,
      selection,
      selectionId,
      domain: siteDetails?._id || "",
      sportsName: sportName,
      stake: betStake,
      betRate: true,
    };

    // BOOKMAKER
    if (markettype === "Bookmaker") {
      createBetData.favourMargin =
        betType === "Lay" ? betStake : (currentOdds * Number(betStake)) / 100;

      createBetData.againstMargin =
        betType === "Back"
          ? -betStake
          : -(currentOdds * Number(betStake)) / 100;
    }

    // MATCH ODDS
    if (markettype === "Match Odds") {
      const stake = Number(betStake);
      const odds = currentOdds;

      if (isNaN(stake) || isNaN(odds)) {
        console.error("Invalid stake or odds value");
      } else {
        createBetData.favourMargin =
          betType === "Lay" ? stake : (odds - 1) * stake;

        createBetData.againstMargin =
          betType === "Back" ? -stake : -((odds - 1) * stake);

        createBetData.favourMargin = Number(
          createBetData.favourMargin.toFixed(2),
        );

        createBetData.againstMargin = Number(
          createBetData.againstMargin.toFixed(2),
        );
      }
    }

    // CASINO
    if (markettype === "Casino") {
      createBetData.favourMargin =
        betType === "Lay" ? betStake : (currentOdds - 1) * Number(betStake);

      createBetData.againstMargin =
        betType === "Back"
          ? -betStake
          : -((currentOdds - 1) * Number(betStake));
    }

    // PREMIUM CRICKET
    if (market === "Premium Cricket" && question) {
      createBetData.question = question;
    }

    // FANCY
    if (markettype === "Fancy") {
      if (betPrice && betSize && betStake && betType) {
        const newSize = parseFloat(betSize) / 100;
        const pl = parseFloat(newSize) * parseFloat(betStake);

        let fancyProfit = 0;
        let fancyLoss = 0;

        if (betType === "Back") {
          fancyProfit = pl.toFixed(2);
          fancyLoss = parseFloat(betStake).toFixed(2);
        } else if (betType === "Lay") {
          fancyProfit = parseFloat(betStake).toFixed(2);
          fancyLoss = pl.toFixed(2);
        }

        createBetData.favourMargin = fancyProfit;
        createBetData.againstMargin = fancyLoss;

        createBetData.stake = createBetData.stake.toString();
        createBetData.price = createBetData.oddsReq;
        createBetData.size = betSize;
        createBetData.backSize = backSize;
        createBetData.laySize = laySize;
      }
    }

    // IMPORTANT:
    // This updates active P/L/profile immediately
    if (setActiveBet) {
      setActiveBet(createBetData);
    }

    setBetData(createBetData);
  }, [betPrice, betStake]);

  // Helpers
  const incrementValue = (val) =>
    val === 0 ? 1 : parseFloat((val * 2).toFixed(2));
  const decrementValue = (val) =>
    val === 0 ? 0 : Math.max(100, parseFloat((val / 2).toFixed(2)));

  const [betLockData, setBetLockData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchBetLocks = async () => {
      try {
        const [userResponse] = await Promise.all([
          API.get("/api/v1/users/sports-lock", {
            params: { userId: userData?._id },
          }),
        ]);

        if (cancelled) return;

        setBetLockData({
          own: userResponse.data?.data?.ownSportsLock ?? {},
          inherited: userResponse.data?.data?.inheritedSportsLock ?? {},
        });
      } catch (error) {
        if (!cancelled) {
          setBetLockData({ error: "Unable to verify bet restrictions." });
        }
      }
    };

    const isDemo =
      userData?._id === "Demo" ||
      userData?.userName === "Democlient" ||
      loggedInType === "demo";

    if (userData?._id && !isDemo) {
      fetchBetLocks();
    }

    return () => {
      cancelled = true;
    };
  }, [userData?._id, userData?.userName, loggedInType]);
  const handlePlaceBet = async () => {
    if (!isLoggedIn) {
      dispatch(displayAuthModal("login"));
      return;
    }

    if (!betData) {
      handleCancel();
      return;
    }

    // Frontend guard for the Full Market Match Odds box. The entered rate must
    // equal the freshest live rate at the exact Back/Lay ladder level selected.
    // This catches both a manually changed rate (e.g. 1.41 -> 1.39/1.44) and a
    // live rate that moved while the bet box was open, before sending the socket request.
    if (markettype === "Match Odds" && selectedPriceIndex !== undefined) {
      const sideKey =
        String(betType ?? "Back").toLowerCase() === "lay" ? "lay" : "back";
      const sideLadder = odds?.price?.[sideKey];
      const liveEntry =
        Array.isArray(sideLadder) &&
          Number.isInteger(selectedPriceIndex) &&
          selectedPriceIndex >= 0
          ? sideLadder[selectedPriceIndex]
          : null;

      const currentLiveOdds = Number(liveEntry?.price);
      const requestedOdds = Number(betPrice);

      const hasCurrentLiveOdds =
        Number.isFinite(currentLiveOdds) && currentLiveOdds > 0;

      const hasRequestedOdds =
        Number.isFinite(requestedOdds) && requestedOdds > 0;

      // Maximum allowed difference: 0.02
      const oddsDifference = Math.abs(currentLiveOdds - requestedOdds);

      const sameOdds =
        hasCurrentLiveOdds && hasRequestedOdds && oddsDifference <= 0.0200001;

      if (!sameOdds) {
        toast.error(
          <ExposureToast
            type="error"
            subtitle={
              hasCurrentLiveOdds
                ? `Unmatched Bet Not Allowed.`
                : "Unmatched Bet Not Allowed."
            }
          />,
        );

        handleCancel();
        return;
      }
    }

    setLoading(true);

    try {
      const sportKey = (sportName || "").toLowerCase().trim();

      const isSportLocked =
        betLockData?.own?.[sportKey] === true ||
        betLockData?.inherited?.[sportKey] === true;

      if (isSportLocked) {
        toast.error(
          <ExposureToast
            type="error"
            subtitle={"Your Bet Has Been Locked. Please Contact To Upline"}
          />,
        );

        return;
      }
      const stakeNum = Number(betData?.stake ?? betStake ?? 0);

      const minLimit =
        min !== undefined &&
          min !== null &&
          min !== "" &&
          Number.isFinite(Number(min))
          ? Number(min)
          : null;

      const maxLimit =
        max !== undefined &&
          max !== null &&
          max !== "" &&
          Number.isFinite(Number(max))
          ? Number(max)
          : null;


      // Validate stake
      if (!Number.isFinite(stakeNum) || stakeNum <= 0) {
        toast.error(
          <ExposureToast
            type="error"
            subtitle="Please enter a valid bet amount."
          />
        );

        handleCancel();
        return;
      }

      // Minimum validation
      if (minLimit !== null && minLimit > 0 && stakeNum < minLimit) {
        toast.error(
          <ExposureToast
            type="error"
            subtitle={`Minimum bet limit is ${minLimit}`}
          />
        );

        handleCancel();
        return;
      }

      // Maximum validation
      if (maxLimit !== null && stakeNum > maxLimit) {
        toast.error(
          <ExposureToast
            type="error"
            subtitle={`Maximum bet limit is ${maxLimit}`}
          />
        );

        handleCancel();
        return;
      }

      const currentUserId = userData?._id || userData?.userId || "";
      const currentMarketKey = getUserMarketKey(currentUserId, betData);

      // Existing bets in this market are handled by the server. The local
      // balance check only applies when this is the user's first bet there.
      const hasExistingBetInMarket =
        recentlyPlacedMarketKeys.has(currentMarketKey) ||
        (Array.isArray(existingBets) &&
          existingBets.some((existingBet) =>
            isSameMarketBet(existingBet, betData),
          ));

      const availableBalance =
        Number(userData?.availableBalance ?? 0) -
        Number(userData?.exposure ?? 0);
      const requestedStake = Number(betData?.stake ?? 0);

      if (
        !hasExistingBetInMarket &&
        Number.isFinite(requestedStake) &&
        requestedStake > availableBalance
      ) {
        toast.error(
          <ExposureToast
            type="error"
            subtitle="You have insufficient balance."
          />,
        );
        handleCancel();
        return;
      }


      const placeBetResponse = await placeBet({
        ...betData,
        againstMargin: Math.abs(betData?.againstMargin)?.toString(),
        legueId: (
          betData?.legueId ??
          betData?.competitionId ??
          betData?.marketId ??
          "0"
        ).toString(),
        stake: (betData?.stake ?? "100").toString(),
      });

      if (!placeBetResponse?.success) {
        toast.error(
          <ExposureToast
            type="error"
            subtitle={placeBetResponse?.message || "Unmatched Bet Not Allowed."}
          />,
        );

        handleCancel();
        return;
      }

      // Remember this market only after the server confirms success.
      // This covers the period before the Redux bets list refreshes.
      recentlyPlacedMarketKeys.add(currentMarketKey);

      if (setActiveBet) {
        setActiveBet(null);
      }

      // Support both the normalized API response and a raw saved bet document.
      const nextAvailableBalance =
        placeBetResponse?.userData?.availableBalance ??
        placeBetResponse?.balanceAfterBet ??
        placeBetResponse?.bet?.balanceAfterBet;
      const nextExposure =
        placeBetResponse?.exposure ??
        placeBetResponse?.exposureAfterBet ??
        placeBetResponse?.bet?.exposureAfterBet;

      if (nextAvailableBalance !== undefined && nextAvailableBalance !== null) {
        dispatch(updateAvailableBalance(nextAvailableBalance));
      }
      if (nextExposure !== undefined && nextExposure !== null) {
        dispatch(updateExposureBalance(nextExposure));
      }

      toast.success(
        <ExposureToast
          type="success"
          title="Success"
          subtitle={"Matched Placebet Successfully."}
        />,
      );
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

  const ballByBallStakes = [
    { id: 1, buttonValue: "100" },
    { id: 2, buttonValue: "200" },
    { id: 3, buttonValue: "500" },
    { id: 4, buttonValue: "5000" },
    { id: 5, buttonValue: "10000" },
    { id: 6, buttonValue: "25000" },
    { id: 7, buttonValue: "50000" },
    { id: 8, buttonValue: "100000" },
  ];
  const activeStakes = isBallByBall ? ballByBallStakes : stakes;

  const getOddsStep = (odds, direction) => {
    const current = Number(odds) || 1.01;

    if (direction === "increment") {
      if (current < 2) return 0.01;
      if (current < 3) return 0.02;
      if (current < 4) return 0.05;
      if (current < 6) return 0.1;
      if (current < 10) return 0.2;
      if (current < 20) return 0.5;
      if (current < 30) return 1;
      if (current < 50) return 2;
      if (current < 100) return 5;
      return 10;
    }

    if (current <= 2) return 0.01;
    if (current <= 3) return 0.02;
    if (current <= 4) return 0.05;
    if (current <= 6) return 0.1;
    if (current <= 10) return 0.2;
    if (current <= 20) return 0.5;
    if (current <= 30) return 1;
    if (current <= 50) return 2;
    if (current <= 100) return 5;
    return 10;
  };

  const incrementOddsValue = (val) => {
    const current = Math.max(1.01, Number(val) || 1.01);
    const step = getOddsStep(current, "increment");

    return Number((current + step).toFixed(2));
  };

  const decrementOddsValue = (val) => {
    const current = Math.max(1.01, Number(val) || 1.01);

    if (current <= 1.01) return 1.01;

    const step = getOddsStep(current, "decrement");

    return Math.max(1.01, Number((current - step).toFixed(2)));
  };

  return (
    <>
      {loading && <Loader />}
      <div
        style={{ backgroundColor: betSectionBgColor }}
        className={`w-full ${isCasinoBet || isBallByBall
          ? "p-2"
          : "border-b-2 border-gray-300 p-1"
          } ${suspendNow}`}
        data-label="SUSPENDED"
      >
        <div className="w-full flex items-center space-x-2 mb-2">
          {!isMobile && (
            <button
              onClick={handleCancel}
              className="w-full flex flex-grow justify-center items-center py-2 bg-white text-black font-bold border rounded-md text-center text-xs h-[40px]"
            >
              Cancel
            </button>
          )}

          {/* Bet Price */}
          <div
            className={`w-1/2 h-[40px] flex flex-grow justify-between items-center rounded-md border border-gray-400 ${isOddsDisabled ? "bg-[#b2bcc5]" : "bg-white"
              }`}
          >
            {/* Minus */}
            <button
              type="button"
              className={`h-[40px] w-[40px] px-2 py-1 text-xl border-r border-gray-400 flex items-center justify-center ${!isOddsDisabled
                ? "text-[#1f72ac] cursor-pointer"
                : "text-[#1f72ac] opacity-50 cursor-not-allowed"
                }`}
              disabled={isOddsDisabled}
              onClick={() =>
                setBetPrice((prev) => decrementOddsValue(Number(prev)))
              }
            >
              <MinusIcon size={18} className="text-[#1f72ac]" />
            </button>

            {/* Price Input */}
            <input
              name="betPrice"
              id="betPrice"
              type={isFancyBet ? "text" : "number"}
              className="px-2 text-gray-900 max-w-[25vw] text-center text-sm font-bold flex-1 outline-none bg-transparent border-none focus:outline-none focus:ring-0 focus:shadow-none focus:bg-transparent"
              style={{
                backgroundColor: "transparent",
                outline: "none",
                boxShadow: "none",
              }}
              value={
                isFancyBet
                  ? `${selectedOdds}/${isFancyBet ? betSize : ""}`
                  : betPrice
              }
              min="0"
              readOnly
              onChange={(e) => setBetPrice(Math.max(0, Number(e.target.value)))}
              disabled={isOddsDisabled}
            />

            {/* Plus */}
            <button
              type="button"
              className={`h-[40px] w-[40px] px-2 py-1 text-xl border-l border-gray-400 flex items-center justify-center ${!isOddsDisabled
                ? "text-[#1f72ac] cursor-pointer"
                : "text-[#1f72ac] opacity-50 cursor-not-allowed"
                }`}
              onClick={() =>
                setBetPrice((prev) => incrementOddsValue(Number(prev)))
              }
              disabled={isOddsDisabled}
            >
              <PlusIcon size={18} className="text-[#1f72ac]" />
            </button>
          </div>

          {/* Bet Stake */}
          <div className="w-1/2 h-[40px] flex flex-grow justify-between items-center bg-white rounded-md border border-gray-400">
            <button
              className="h-[40px] w-[40px] px-2 py-1 text-blue-600 text-xl border-r border-gray-400 flex items-center justify-center"
              onClick={() =>
                setBetStake((prev) => decrementValue(Number(prev)))
              }
            >
              <MinusIcon size={18} className="text-[#1f72ac]" />
            </button>
            <input
              name="betStake"
              id="betStake"
              type="number"
              placeholder={isBallByBall ? "0" : ""}
              className="px-2 text-gray-900 placeholder:text-gray-900 placeholder:font-bold max-w-[25vw] text-center text-sm font-bold flex-1 outline-none bg-transparent border-none focus:outline-none focus:ring-0 focus:shadow-none focus:bg-transparent"
              style={{
                backgroundColor: "transparent",
                outline: "none",
                boxShadow: "none",
              }}
              value={betStake ?? ""}
              min="0"
              onChange={(e) => {
                const value = e.target.value;

                // allow empty while typing
                if (value === "") {
                  setBetStake(null);
                  return;
                }

                setBetStake(Math.max(0, Number(value)));
              }}
            />

            <button
              className="h-[40px] w-[40px] px-2 py-1 text-blue-600 text-xl border-l border-gray-400 flex items-center justify-center"
              onClick={() =>
                setBetStake((prev) => incrementValue(Number(prev)))
              }
            >
              <PlusIcon size={18} className="text-[#1f72ac]" />
            </button>
          </div>

          {!isMobile && (
            <button
              onClick={() => {
                handlePlaceBet();
              }}
              style={{
                background: gradiantcolor,
                opacity: !betStake || !betPrice || loading ? 0.65 : 1,
              }}
              disabled={!betStake || !betPrice || loading}
              className="w-full flex flex-grow justify-center items-center p-2 bg-gradient-to-b from-black to-yellow-500 text-white font-bold rounded-md text-center text-xs text-nowrap h-[40px] cursor-pointer"
            >
              Place Bet
            </button>
          )}
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {activeStakes?.map((amount) => (
            <button
              key={amount.buttonValue}
              className="
              bg-[#f9f9f9]
              border border-[#333]
              rounded-[4px]
              !text-[#000000]
              !font-[400]
              !leading-[18px]
              !text-[13px]
              !h-[31px]
              text-center
              w-full
            "
              onClick={() => handleStakeClick(amount.buttonValue)}
            >
              {amount.buttonValue}
            </button>
          ))}
        </div>

        <div className="w-full flex flex-row justify-between mt-2 gap-2">
          {isMobile && (
            <button
              onClick={handleCancel}
              className="
              flex-1
              w-1/2
              bg-[#f9f9f9]
              border
              border-[#333]
              rounded-[4px]
              !text-[#000000]
              !font-[700]
              !text-[13px]
              !h-[38px]
              mr-[5px]
              text-center
            "
            >
              Cancel
            </button>
          )}
          {isMobile && (
            <button
              style={{
                background: isBallByBall ? "#4f5e55" : gradiantcolor,
                opacity: !betStake || !betPrice || loading ? 0.65 : 1,
                touchAction: "manipulation",
              }}
              disabled={!betStake || !betPrice || loading}
              className="
                flex-1
                w-full
                !text-[16px]
                text-white
                border
                border-[#000000]
                h-[38px]
                m-0
                pointer-events-auto
                !font-[700]
                rounded-[5px]
                cursor-pointer
                text-center
              "
              onClick={() => {
                handlePlaceBet();
              }}
            >
              Place Bet
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export { BetBox };
export default PlaceBet;
