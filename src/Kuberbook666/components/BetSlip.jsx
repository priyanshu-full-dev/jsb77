import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { placeBet } from "../../socketClient";
import { handleCancelPlaceBet } from "../../redux/slices/placeBetSlice";
import { updateAvailableBalance, updateExposureBalance } from "../../redux/slices/userSlice";
import { fetchBets } from "../../redux/slices/betsSlice";
import { useTheme } from "../context/ThemeContext";

export function calculateMargins(markettype, betType, selectedOdds, betStake, betSize = 100) {
  const stake = Number(betStake);
  const odds = Number(selectedOdds);
  let favourMargin = 0;
  let againstMargin = 0;
  const isBack = String(betType || "").toLowerCase() === "back";

  if (
    markettype === "Match Odds" ||
    markettype === "Horse Race" ||
    markettype === "Greyhound Race" ||
    markettype === "Winner"
  ) {
    if (isBack) {
      favourMargin = Number(((odds - 1) * stake).toFixed(2));
      againstMargin = -stake;
    } else {
      favourMargin = stake;
      againstMargin = Number((-((odds - 1) * stake)).toFixed(2));
    }
  } else if (markettype === "Bookmaker") {
    if (isBack) {
      favourMargin = Number(((odds * stake) / 100).toFixed(2));
      againstMargin = -stake;
    } else {
      favourMargin = stake;
      againstMargin = Number((-((odds * stake) / 100)).toFixed(2));
    }
  } else if (markettype === "Fancy") {
    const pl = (parseFloat(betSize) / 100) * stake;
    if (isBack) {
      favourMargin = Number(pl.toFixed(2));
      againstMargin = -stake;
    } else {
      favourMargin = stake;
      againstMargin = Number((-pl).toFixed(2));
    }
  } else if (markettype === "Casino") {
    if (isBack) {
      favourMargin = Number(((odds - 1) * stake).toFixed(2));
      againstMargin = -stake;
    } else {
      favourMargin = stake;
      againstMargin = Number((-((odds - 1) * stake)).toFixed(2));
    }
  } else {
    if (isBack) {
      favourMargin = Number(((odds - 1) * stake).toFixed(2));
      againstMargin = -stake;
    } else {
      favourMargin = stake;
      againstMargin = Number((-((odds - 1) * stake)).toFixed(2));
    }
  }
  return { favourMargin, againstMargin };
}

const DEFAULT_STAKE_PRESETS = [50, 200, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

const getStoredStakes = () => {
  try {
    const saved = localStorage.getItem("kuber_user_stakes");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_STAKE_PRESETS;
};

const formatStakeLabel = (val) => {
  const num = Number(val);
  return `+ ${num.toLocaleString("en-IN")}`;
};

const BetSlip = ({
  activeBet,
  onClose,
  onBetChange,
  min = 100,
  max = 100000,
  sportId,
  competitionId,
  eventId,
  eventName,
  currentSport = "cricket",
}) => {
  const dispatch = useDispatch();
  const isBack = activeBet?.betType === "Back";
  const initialOdds = activeBet?.odds || "1.00";

  // Granular Redux Selectors (Leaf / Primitive nodes)
  const availableBalance = useSelector((state) => state.user?.userData?.availableBalance ?? 0);
  const exposureBalance = useSelector((state) => state.user?.exposureBalance ?? 0);
  const isUserLoggedInState = useSelector((state) => Boolean(state.user?.token || state.user?.userData?.token));

  const [odds, setOdds] = useState(initialOdds);
  const [stake, setStake] = useState("");
  const [confirmBet, setConfirmBet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setIsCountingDown] = useState(false);
  const [userStakes, setUserStakes] = useState(getStoredStakes);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleStakesUpdate = () => {
      setUserStakes(getStoredStakes());
    };
    window.addEventListener("kuber_stakes_updated", handleStakesUpdate);
    window.addEventListener("storage", handleStakesUpdate);
    return () => {
      window.removeEventListener("kuber_stakes_updated", handleStakesUpdate);
      window.removeEventListener("storage", handleStakesUpdate);
    };
  }, []);

  useEffect(() => {
    const nextOdds = activeBet?.odds || "1.00";
    setOdds(nextOdds);
    if (onBetChange) {
      onBetChange({ odds: nextOdds, stake });
    }
  }, [activeBet?.odds, activeBet?.betKey]);

  const updateOdds = useCallback((newOdds) => {
    setOdds(newOdds);
    if (onBetChange) {
      onBetChange({ odds: newOdds, stake });
    }
  }, [onBetChange, stake]);

  const updateStake = useCallback((newStake) => {
    setStake(newStake);
    if (onBetChange) {
      onBetChange({ odds, stake: newStake });
    }
  }, [onBetChange, odds]);

  // Decrement Odds handler
  const handleDecrementOdds = useCallback(() => {
    const val = parseFloat(odds) || 0;
    if (val <= 1.01) return;
    let nextVal;
    if (val <= 2) {
      nextVal = (val - 0.01).toFixed(2);
    } else if (val <= 3) {
      nextVal = (val - 0.02).toFixed(2);
    } else if (val <= 4) {
      nextVal = (val - 0.05).toFixed(2);
    } else if (val <= 6) {
      nextVal = (val - 0.1).toFixed(2);
    } else if (val <= 10) {
      nextVal = (val - 0.2).toFixed(2);
    } else if (val <= 20) {
      nextVal = (val - 0.5).toFixed(1);
    } else if (val <= 30) {
      nextVal = (val - 1).toFixed(0);
    } else if (val <= 50) {
      nextVal = (val - 2).toFixed(0);
    } else if (val <= 100) {
      nextVal = (val - 5).toFixed(0);
    } else {
      nextVal = (val - 10).toFixed(0);
    }
    updateOdds(nextVal);
  }, [odds, updateOdds]);

  // Increment Odds handler
  const handleIncrementOdds = useCallback(() => {
    const val = parseFloat(odds) || 0;
    let nextVal;
    if (val < 2) {
      nextVal = (val + 0.01).toFixed(2);
    } else if (val < 3) {
      nextVal = (val + 0.02).toFixed(2);
    } else if (val < 4) {
      nextVal = (val + 0.05).toFixed(2);
    } else if (val < 6) {
      nextVal = (val + 0.1).toFixed(2);
    } else if (val < 10) {
      nextVal = (val + 0.2).toFixed(2);
    } else if (val < 20) {
      nextVal = (val + 0.5).toFixed(1);
    } else if (val < 30) {
      nextVal = (val + 1).toFixed(0);
    } else if (val < 50) {
      nextVal = (val + 2).toFixed(0);
    } else if (val < 100) {
      nextVal = (val + 5).toFixed(0);
    } else {
      nextVal = (val + 10).toFixed(0);
    }
    updateOdds(nextVal);
  }, [odds, updateOdds]);

  // Handle stake additions
  const handleAddStake = useCallback((val) => {
    const curr = Number(stake) || 0;
    const nextStake = String(curr + val);
    updateStake(nextStake);
  }, [stake, updateStake]);

  // Min, Max, Clear
  const handleMin = useCallback(() => updateStake(String(activeBet?.min || min || 100)), [activeBet?.min, min, updateStake]);
  const handleMax = useCallback(() => updateStake(String(activeBet?.max || max || 100000)), [activeBet?.max, max, updateStake]);
  const handleClear = useCallback(() => updateStake(""), [updateStake]);

  // Live Profit and Liability Calculation (Back & Lay, Fancy, Bookmaker, Casino, Racing)
  const { profit, liability, favourMargin, againstMargin } = useMemo(() => {
    const numStake = Number(stake) || 0;
    const numOdds = parseFloat(odds) || 0;
    if (numStake <= 0 || numOdds <= 0) {
      return { profit: 0, liability: 0, favourMargin: 0, againstMargin: 0 };
    }

    const mType = activeBet?.marketType || activeBet?.markettype || activeBet?.market || "Match Odds";
    const bType = isBack ? "Back" : "Lay";
    const bSize = parseFloat(activeBet?.size) || 100;

    const margins = calculateMargins(mType, bType, numOdds, numStake, bSize);
    return {
      profit: margins.favourMargin,
      liability: Math.abs(margins.againstMargin),
      favourMargin: margins.favourMargin,
      againstMargin: margins.againstMargin,
    };
  }, [stake, odds, isBack, activeBet?.marketType, activeBet?.markettype, activeBet?.market, activeBet?.size]);

  // Place Bet submission with Strict Pre-Flight Validations
  const handlePlaceBet = async () => {
    // 1. Market Suspended Pre-flight Check
    if (activeBet?.isSuspended || activeBet?.status === "SUSPENDED" || activeBet?.status === "BALL RUNNING") {
      toast.warning("Market is currently suspended or inactive");
      return;
    }

    const numStake = Number(stake) || 0;
    const numOdds = parseFloat(odds) || 0;
    const minVal = Number(activeBet?.min || min || 100);
    const maxVal = Number(activeBet?.max || max || 100000);

    // 2. Stake Amount Validity
    if (!numStake || numStake <= 0) {
      toast.warning("Please enter a valid stake amount");
      return;
    }

    // 3. Min & Max Limits Check
    if (numStake < minVal || numStake > maxVal) {
      toast.warning(`Bet must be between ₹${minVal.toLocaleString()} - ₹${maxVal.toLocaleString()}`);
      return;
    }

    // 4. Sport-wise Max Odds Limits (Cricket: 20, Soccer: 15, Tennis: 10)
    const sType = String(sportId || activeBet?.sportId || "4");
    const maxAllowedOdds = sType === "4" ? 20 : sType === "1" ? 15 : sType === "2" ? 10 : 50;
    if (numOdds > maxAllowedOdds && activeBet?.marketType === "Match Odds") {
      toast.warning(`Maximum odds allowed for this sport is ${maxAllowedOdds}`);
      return;
    }

    // 5. User Authentication Pre-flight Check
    const token = localStorage.getItem("token") || localStorage.getItem("userId");
    if (!token && !isUserLoggedInState) {
      toast.error("Please login to place bet");
      window.dispatchEvent(new Event("kuber_open_login"));
      return;
    }

    // 6. Strict Balance & Liability Validation
    const numAvail = Number(availableBalance) || 0;
    const numExpo = Number(exposureBalance) || 0;
    const usableBalance = numAvail - numExpo;
    const requiredAmount = isBack ? numStake : (liability || (numOdds - 1) * numStake);

    if (numAvail <= 0 || usableBalance <= 0) {
      toast.error("Insufficient Balance. Please deposit funds to play.");
      return;
    }

    if (usableBalance < requiredAmount) {
      toast.error(
        `Insufficient Balance! Required: ₹${requiredAmount.toFixed(2)}, Available: ₹${Math.max(0, usableBalance).toFixed(2)}`
      );
      return;
    }

    if (confirmBet) {
      const ok = window.confirm(`Confirm bet: ${activeBet?.runnerName} @ ${odds} for ₹${numStake}?`);
      if (!ok) return;
    }

    setLoading(true);
    setIsCountingDown(true);

    try {
      const betPayload = {
        type: isBack ? "Back" : "Lay",
        event: eventName || activeBet?.eventName || activeBet?.event,
        eventId: String(eventId || activeBet?.eventId || ""),
        matchId: String(eventId || activeBet?.eventId || ""),
        eventType: String(sportId || activeBet?.sportId || activeBet?.eventType || "4"),
        sportsName: currentSport || activeBet?.sportsName || "cricket",
        market: activeBet?.marketType || activeBet?.market || "Match Odds",
        markettype: activeBet?.marketType || activeBet?.markettype || "Match Odds",
        marketId: String(activeBet?.marketId || `${sportId}-${eventId}`),
        legueId: String(activeBet?.competitionId || competitionId || activeBet?.legueId || "0"),
        selectionId: String(activeBet?.selectionId ?? ""),
        selection: activeBet?.runnerName || activeBet?.selection || "",
        price: String(odds),
        oddsReq: String(odds),
        stake: String(numStake),
        againstMargin: String(Math.abs(againstMargin)),
        favourMargin: String(favourMargin),
        roundId: activeBet?.roundId || activeBet?.mid || "",
        runners: activeBet?.runners || [],
        runnersCount: activeBet?.runnersCount || 0,
        placeTime: new Date().toISOString(),
      };

      const res = await placeBet(betPayload);
      if (res?.success || res?.statusCode === 200 || res?.status === "success") {
        toast.success(res?.message || "Bet placed successfully!");
        if (res?.userData?.availableBalance !== undefined) {
          dispatch(updateAvailableBalance(res.userData.availableBalance));
        }
        if (res?.exposure !== undefined) {
          dispatch(updateExposureBalance(res.exposure));
        }
        
        // Refresh open bets list immediately so open bets count updates from 0 to 1, 2, etc.
        dispatch(fetchBets());

        dispatch(handleCancelPlaceBet());
        if (onClose) onClose();
      } else {
        toast.warning(res?.message || "Failed to place bet. Please try again.");
      }
    } catch (err) {
      console.warn("Place bet error:", err);
      toast.error(err?.message || "Bet could not be placed. Check connection or balance.");
    } finally {
      setLoading(false);
      setIsCountingDown(false);
    }
  };

  const handleCancel = () => {
    dispatch(handleCancelPlaceBet());
    if (onClose) onClose();
  };

  const isStakeValid = Number(stake) > 0;

  const maxStakeDisplay = useMemo(() => {
    const raw = activeBet?.max ?? max ?? 100000;
    const num = Number(raw);
    return isNaN(num) || num <= 0 ? "100,000" : num.toLocaleString();
  }, [activeBet?.max, max]);

  return (
    <span className="col-span-12 h-max w-full">
      <div
        title="Bet Slip"
        id="betSlipPlaceorder"
        style={{
          backgroundColor: isDark ? "#1c1f2b" : "#ffffff",
          color: isDark ? "#ffffff" : "#111827",
        }}
        className={`w-full text-selection-none border-[2px] border-b-[5px] font-lato origin-top transition-all ease-in-out p-3 rounded-sm scaleVerticalOpen ${
          isBack ? "border-backBtn" : "border-layBtn"
        }`}
      >
        {/* Top Part: ODDS & STAKE inputs */}
        <div id="topPartOfBetSlip" title="Bet Slip Top Part" className="grid grid-cols-12 pt-[2px] gap-x-[15px]">
          <span
            style={{ color: isDark ? "#cbd5e1" : "#1f2937" }}
            className="col-span-6 text-[10px] font-bold uppercase tracking-wider"
          >
            ODDS
          </span>
          <div className="col-span-6 w-full flex items-center justify-between">
            <span
              style={{ color: isDark ? "#cbd5e1" : "#1f2937" }}
              className="text-[10px] font-bold uppercase tracking-wider text-start pl-1"
            >
              STAKE
            </span>
          </div>

          {/* Odds Stepper: [-] [60] [+] */}
          <span title="Odds" className="col-span-6 pt-1.5 w-full">
            <div className="grid grid-cols-12 min-h-[35px]">
              <span className="col-span-12 h-full pr-1 overflow-hidden">
                <div
                  style={{
                    backgroundColor: isDark ? "#252836" : "#ffffff",
                    borderColor: isDark ? "#323647" : "#94a3b8",
                  }}
                  className="flex items-center justify-center border rounded-[4px] overflow-hidden h-[36px]"
                >
                  <button
                    onClick={handleDecrementOdds}
                    type="button"
                    title="Decrease Odds"
                    className="relative rounded-l-[3px] h-full w-[36px] min-w-[32px] flex items-center justify-center bg-placeBetBtnGrd text-white cursor-pointer active:opacity-80 transition select-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="3" viewBox="0 0 18 4" fill="none">
                      <path
                        d="M16.3363 3.1535H1.66367C1.02639 3.1535 0.51001 2.63713 0.51001 1.99985C0.51001 1.36257 1.02639 0.846191 1.66367 0.846191H16.3363C16.9736 0.846191 17.49 1.36257 17.49 1.99985C17.49 2.63713 16.9736 3.1535 16.3363 3.1535Z"
                        fill="#ffffff"
                      />
                    </svg>
                  </button>
                  <input
                    placeholder="Enter Odds"
                    id="odd-input"
                    aria-label="Odds input"
                    inputMode="decimal"
                    style={{ color: isDark ? "#ffffff" : "#111827" }}
                    className="block w-full focus:outline-none bg-transparent text-sm md:text-base font-bold text-center border-0 py-1"
                    autoComplete="off"
                    type="number"
                    step="0.01"
                    value={odds}
                    onChange={(e) => updateOdds(e.target.value)}
                  />
                  <button
                    onClick={handleIncrementOdds}
                    type="button"
                    title="Increase Odds"
                    className="relative rounded-r-[3px] h-full w-[36px] min-w-[32px] flex items-center justify-center bg-placeBetBtnGrd text-white cursor-pointer active:opacity-80 transition select-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M8.99997 17.4897C8.36269 17.4897 7.84631 16.9734 7.84631 16.3361V1.66342C7.84631 1.02614 8.36269 0.509766 8.99997 0.509766C9.63725 0.509766 10.1536 1.02614 10.1536 1.66342V16.3361C10.1536 16.9734 9.63725 17.4897 8.99997 17.4897Z"
                        fill="#ffffff"
                      />
                      <path
                        d="M16.3363 10.1535H1.66367C1.02639 10.1535 0.51001 9.63713 0.51001 8.99985C0.51001 8.36257 1.02639 7.84619 1.66367 7.84619H16.3363C16.9736 7.84619 17.49 8.36257 17.49 8.99985C17.49 9.63713 16.9736 10.1535 16.3363 10.1535Z"
                        fill="#ffffff"
                      />
                    </svg>
                  </button>
                </div>
              </span>
            </div>
          </span>

          {/* Stake Input */}
          <span title="Stakes" className="col-span-6 pt-1.5 w-full px-[1px] overflow-hidden">
            <input
              id="stakeInput"
              inputMode="numeric"
              style={{
                backgroundColor: isDark ? "#252836" : "#e2e8f0",
                borderColor: isDark ? "#323647" : "transparent",
                color: isDark ? "#ffffff" : "#111827",
              }}
              className="focus:outline-none border text-sm md:text-base font-bold w-full h-[36px] text-center flex items-center justify-center rounded-[4px] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#c10931] active:border-[#c10931]"
              placeholder={`Max : ${maxStakeDisplay}`}
              autoComplete="off"
              pattern="\d*"
              type="number"
              value={stake}
              onChange={(e) => updateStake(e.target.value)}
            />
          </span>
        </div>

        {/* Quick Stake Preset Buttons Grid */}
        <div
          style={{
            backgroundColor: isDark ? "#1a1d29" : "#e4e7ec",
            borderColor: isDark ? "#2e3344" : "#cbd5e1",
          }}
          className="mt-[15px] p-2.5 rounded-md border"
        >
          <div className="grid grid-cols-12 gap-x-1.5 gap-y-1.5">
            {userStakes.map((val, idx) => (
              <button
                key={`${val}-${idx}`}
                onClick={() => handleAddStake(Number(val))}
                className="inline-block leading-normal relative transition duration-150 ease-in-out col-span-4 w-full overflow-hidden text-[12px] font-bold rounded-[4px] bg-[#9e092f] hover:bg-[#830827] text-white text-center py-2 cursor-pointer active:scale-95 shadow-sm"
                type="button"
              >
                <span>{formatStakeLabel(val)}</span>
              </button>
            ))}
          </div>

          {/* Quick Action Buttons: MIN, MAX, EDIT STAKES, CLEAR */}
          <div className="grid grid-cols-12 gap-x-1.5 gap-y-1.5 pt-[15px]">
            <button
              onClick={handleMin}
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out col-span-3 w-full text-[11px] min-h-[28px] font-bold rounded-[4px] bg-minBtnGrd text-white py-2 cursor-pointer active:scale-95 shadow-sm"
              type="button"
            >
              MIN
            </button>
            <button
              onClick={handleMax}
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out col-span-3 w-full text-[11px] font-bold rounded-[4px] bg-maxBtnGrd text-white py-2 cursor-pointer active:scale-95 shadow-sm"
              type="button"
            >
              MAX
            </button>
            <button
              onClick={() => {
                window.location.href = "/settings";
              }}
              className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out col-span-3 w-full text-[11px] font-bold rounded-[4px] text-white py-2 bg-editStakesGrd cursor-pointer active:scale-95 shadow-sm"
              type="button"
            >
              EDIT STAKES
            </button>
            <button
              onClick={handleClear}
              className="inline-block relative overflow-hidden transition duration-150 ease-in-out col-span-3 w-full text-[11px] font-bold rounded-[4px] bg-clearBtnGrd text-white leading-4 py-2 cursor-pointer active:scale-95 shadow-sm"
              id="clearBtn"
              type="button"
            >
              CLEAR
            </button>
          </div>
        </div>

        {/* Bottom Actions: Cancel Bet & Place Bet with Stopwatch & Profit */}
        <div className="flex items-center justify-center gap-x-[13px] pt-3.5 w-full">
          <button
            type="button"
            onClick={handleCancel}
            style={{
              backgroundColor: isDark ? "transparent" : "#ffffff",
              color: isDark ? "#cbd5e1" : "#64748b",
              borderColor: "#e11d48",
            }}
            className="leading-normal relative overflow-hidden transition duration-150 ease-in-out px-5 py-2.5 w-[50%] flex items-center justify-center min-h-[46px] text-sm font-bold border-[1.5px] rounded-md cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95"
          >
            <span className="font-bold text-base leading-5">Cancel Bet</span>
          </button>

          <div className="w-[50%] h-max">
            <button
              disabled={!isStakeValid || loading}
              onClick={handlePlaceBet}
              type="button"
              style={
                !isStakeValid || loading
                  ? { backgroundColor: isDark ? "#475569" : "#94a3b8" }
                  : {}
              }
              className={`leading-normal overflow-hidden transition duration-150 ease-in-out py-1 relative w-full flex min-h-[46px] px-3 rounded-md font-medium border-0 flex-row items-center justify-between ${
                isStakeValid && !loading
                  ? "bg-placeBetBtnGrd cursor-pointer hover:brightness-110 active:scale-95 shadow-md"
                  : "opacity-90 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start justify-start flex-col">
                <span className="font-bold text-sm text-white">
                  {loading ? "Placing..." : "Place Bet"}
                </span>
                <span className="text-xs text-white">
                  <div>
                    <span>Profit : </span>
                    <span className="font-semibold">{profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </span>
              </div>

              {/* Stopwatch countdown icon & text in white */}
              <span className="text-xs flex items-center justify-center gap-x-1 text-white opacity-80">
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <g clipPath="url(#clip0_2144_3162)">
                      <path
                        d="M9.91095 3.68857L10.3814 3.21808C10.5643 3.03525 10.5643 2.7388 10.3814 2.55606C10.1986 2.37323 9.90225 2.37323 9.71942 2.55606L9.24893 3.02655C8.45956 2.36884 7.50037 1.9715 6.47717 1.87848V0.93631H6.92972C7.18826 0.93631 7.39783 0.726654 7.39783 0.468109C7.39783 0.209564 7.18826 0 6.92972 0H5.08832C4.82977 0 4.62021 0.209564 4.62021 0.468109C4.62021 0.726654 4.82977 0.93631 5.08832 0.93631H5.54086V1.87848C2.97958 2.11139 0.9375 4.26306 0.9375 6.92844C0.9375 9.73141 3.20572 12 6.00906 12C8.81195 12 11.0805 9.73178 11.0805 6.92844C11.0805 5.73111 10.6682 4.59723 9.91095 3.68857ZM6.00897 11.0637C3.72885 11.0637 1.87372 9.20865 1.87372 6.92844C1.87372 4.64832 3.72885 2.79327 6.00897 2.79327C8.28918 2.79327 10.1442 4.64832 10.1442 6.92844C10.1442 9.20865 8.28918 11.0637 6.00897 11.0637ZM8.1785 4.759C8.36133 4.94183 8.36133 5.23828 8.1785 5.42102L6.34003 7.25949C6.1572 7.44232 5.86075 7.44232 5.67801 7.25949C5.49518 7.07666 5.49518 6.78021 5.67801 6.59747L7.51639 4.759C7.69922 4.57617 7.99567 4.57617 8.1785 4.759Z"
                        fill="#ffffff"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_2144_3162">
                        <rect width="12" height="12" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
                <span className="font-bold text-sm text-white">0s</span>
              </span>
            </button>
          </div>
        </div>

        {/* Toggle Switch: Confirm bet before placing */}
        <div className="flex items-center justify-between w-full px-1 pt-3.5">
          <span
            style={{ color: isDark ? "#e2e8f0" : "#1f2937" }}
            className="text-[13px] font-medium"
          >
            Confirm bet before placing
          </span>
          <label className="inline-flex items-center cursor-pointer relative">
            <input
              className="sr-only peer"
              type="checkbox"
              checked={confirmBet}
              onChange={(e) => setConfirmBet(e.target.checked)}
            />
            <div
              style={{
                backgroundColor: confirmBet
                  ? "#40af52"
                  : isDark
                    ? "#374151"
                    : "#ffffff",
                borderColor: confirmBet
                  ? "#40af52"
                  : isDark
                    ? "#6b7280"
                    : "#9ca3af",
              }}
              className="relative border-[0.5px] font-lato rounded-full h-7 w-14 transition-colors duration-200"
            >
              <span
                style={{
                  color: confirmBet
                    ? "#ffffff"
                    : isDark
                      ? "#d1d5db"
                      : "#374151",
                }}
                className={`absolute top-1/2 transform -translate-y-1/2 font-bold text-[10px] ${
                  confirmBet ? "left-[7px]" : "right-[6px]"
                }`}
              >
                {confirmBet ? "ON" : "OFF"}
              </span>
              <div
                className={`bg-white h-[22px] w-[22px] shadow-sm top-[2px] transition-transform ease-in-out aspect-square absolute rounded-full ${
                  confirmBet ? "translate-x-[30px]" : "translate-x-[2px]"
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </span>
  );
};

BetSlip.propTypes = {
  activeBet: PropTypes.any,
  onClose: PropTypes.func,
  onBetChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  sportId: PropTypes.any,
  competitionId: PropTypes.any,
  eventId: PropTypes.any,
  eventName: PropTypes.string,
  currentSport: PropTypes.string,
};

export default BetSlip;
