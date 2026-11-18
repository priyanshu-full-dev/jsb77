import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserData, getUserId } from "../../../utils/helper/commonSelectors";
import {
  updateAvailableBalance,
  updateExposureBalance,
} from "../../../redux/slices/userSlice";
import { fetchuserdata } from "../../../api";
import { toast } from "react-toastify";
import { audioService } from "../services/audioService";
import { apiService } from "../services/apiService";

const GameContext = createContext();

export function GameProvider({ children }) {
  
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const accountType = useSelector((state) => state?.account?.accountType) || "";
  const loggedInType = useSelector((state) => state?.user?.loggedInType) || "";
  const userData = useSelector(getUserData());
  const userId = useSelector(getUserId());
  const isDemoUser =
    accountType === "demo" ||
    loggedInType === "demo" ||
    userId === "Demo" ||
    userData?.userName === "Democlient" ||
    Boolean(userData?.isDemo);
  const authToken = useSelector((state) =>
    state?.user?.token ||
    state?.user?.accessToken ||
    state?.user?.authToken ||
    state?.user?.userData?.token ||
    state?.user?.userData?.accessToken ||
    state?.auth?.token ||
    state?.auth?.accessToken ||
    null
  );
  const userDataRef = useRef(userData);
  const seenStatementsRef = useRef(new Set());

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  // Real Aura user balance = availableBalance minus exposure
  const auraActualBalance = Math.max(
    0,
    Number((userData?.availableBalance ?? 0) - (userData?.exposure ?? 0))
  );

  // Game Lifecycle States: 'WAITING' | 'FLYING' | 'CRASHED'
  // Starts in 'WAITING' with countdown 0 until authoritative backend broadcasts state
  const [gameState, setGameState] = useState("WAITING");
  const [multiplier, setMultiplier] = useState(1.0);
  const [waitingCountdown, setWaitingCountdown] = useState(0);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [cashoutAlert, setCashoutAlert] = useState(null); // { multiplier, winAmount, id }
  const [stakeError, setStakeError] = useState(null);

  // Authoritative User Balance from Aura wallet
  const [balance, setBalance] = useState(auraActualBalance);

  // Synchronize local balance state with actual Aura balance
  useEffect(() => {
    if (isLoggedIn && userData) {
      setBalance(auraActualBalance);
    }
  }, [isLoggedIn, userData?.availableBalance, userData?.exposure, auraActualBalance]);

  // Refresh the canonical AsianExchange wallet after session start or when the
  // user explicitly refreshes. Vimaan's socket balance remains the live display
  // source; Redux stores the full availableBalance and exposure fields.
  const refreshAsianExchangeWallet = useCallback(async () => {
    if (!userId || isDemoUser) return null;
    try {
      const response = await fetchuserdata(userId);
      const account = response?.data?.userdata;
      if (!response?.success || !account) return null;

      const availableBalance = Number(account.availableBalance ?? 0);
      const exposure = Number(account.exposure ?? 0);
      const nextUserData = {
        ...(userDataRef.current || {}),
        ...account,
        availableBalance,
        exposure,
      };
      userDataRef.current = nextUserData;
      dispatch(updateAvailableBalance(availableBalance));
      dispatch(updateExposureBalance(exposure));
      const spendable = Math.max(0, Number((availableBalance - exposure).toFixed(2)));
      setBalance(spendable);
      return nextUserData;
    } catch (error) {
      console.warn('Unable to refresh AsianExchange wallet:', error?.message || error);
      return null;
    }
  }, [dispatch, userId]);

  // Authoritative Room Bets ("All Bets" Tab) from Redis
  const [liveBets, setLiveBets] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'my'
  const [myBetsHistory, setMyBetsHistory] = useState([]);

  // Panel 1 (Left Bet Box)
  const [panel1, setPanel1] = useState({
    amount: 0,
    isAuto: false,
    isAutoCashout: false,
    autoCashout: "1.10",
    hasBet: false,
    isNextRoundBet: false,
    cashedOut: false,
    cashoutMultiplier: null,
    winAmount: 0,
    betId: null,
    isCashingOut: false,
    isPlacing: false,
    isCancelling: false,
  });

  // Panel 2 (Right Bet Box)
  const [panel2, setPanel2] = useState({
    amount: 0,
    isAuto: false,
    isAutoCashout: false,
    autoCashout: "1.10",
    hasBet: false,
    isNextRoundBet: false,
    cashedOut: false,
    cashoutMultiplier: null,
    winAmount: 0,
    betId: null,
    isCashingOut: false,
    isPlacing: false,
    isCancelling: false,
  });

  // Flight start time for seamless reconnect/reload sync
  const [flightStartTime, setFlightStartTime] = useState(0);

  // Keep references to prevent stale closures
  const panel1Ref = useRef(panel1);
  const panel2Ref = useRef(panel2);
  const gameStateRef = useRef(gameState);
  const multiplierRef = useRef(multiplier);
  const balanceRef = useRef(balance);
  const isConnectedRef = useRef(false);
  const lastTickSecondRef = useRef(0);

  useEffect(() => {
    panel1Ref.current = panel1;
  }, [panel1]);
  useEffect(() => {
    panel2Ref.current = panel2;
  }, [panel2]);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);
  useEffect(() => {
    balanceRef.current = balance;
    // Notify only the embedding origin (never broadcast wallet data to '*').
    try {
      if (typeof window !== "undefined" && window.parent && window.parent !== window && document.referrer) {
        const parentOrigin = new URL(document.referrer).origin;
        window.parent.postMessage({ type: "VIMAAN_BALANCE_UPDATE", balance }, parentOrigin);
      }
    } catch {
      // No valid referrer or cross-origin policy prevented messaging.
    }
  }, [balance]);

  // Sync mute state with audioService
  useEffect(() => {
    audioService?.setMuted?.(isMuted);
  }, [isMuted]);

  // Toggle Mute
  const toggleSound = () => {
    setIsMuted((prev) => {
      const next = !prev;
      audioService?.setMuted?.(next);
      return next;
    });
  };

  /**
   * Cash Out Handler:
   * 100% Server-Authoritative.
   * Does NOT compute win locally. Sends command to backend.
   * Backend executes atomic Redis Lua script (walletSettleBet.lua)
   * and emits bet:updated + wallet:updated with the authoritative payout.
   */
  const cashOut = useCallback(async (panelNum) => {
    const isP1 = panelNum === 1;
    const panel = isP1 ? panel1Ref.current : panel2Ref.current;
    const setPanel = isP1 ? setPanel1 : setPanel2;

    if (!panel.hasBet || panel.cashedOut || panel.isCashingOut || panel.isPlacing || panel.isCancelling || gameStateRef.current !== "FLYING") {
      return;
    }
    if (!panel.betId || !isConnectedRef.current) {
      setStakeError("Game server is reconnecting. Please retry.");
      return;
    }

    const targetBetId = panel.betId;
    const currentMult = Number(multiplierRef.current) || 1.0;
    const activeBetAmt = panel.placedBetAmount || panel.amount;
    const estWin = activeBetAmt * currentMult;
    const pending = {
      ...panel,
      isCashingOut: true,
      cashedOut: true,
      cashoutMultiplier: currentMult,
      winAmount: estWin,
    };
    if (isP1) panel1Ref.current = pending;
    else panel2Ref.current = pending;
    setPanel(pending);
    setCashoutAlert({ multiplier: currentMult, winAmount: estWin, id: Date.now() });
    audioService?.playCashout?.();

    try {
      const response = await apiService.cashOut(targetBetId);
      if (!response?.success) {
        throw new Error(response?.message || response?.error || response?.code || "Cash out was rejected by the server.");
      }
      // Do not credit balance or declare a win locally. The authoritative
      // bet:updated + wallet:updated events settle the panel and wallet.
    } catch (error) {
      setCashoutAlert(null);
      const current = isP1 ? panel1Ref.current : panel2Ref.current;
      if (current.betId === targetBetId) {
        const reset = {
          ...current,
          isCashingOut: false,
          cashedOut: false,
          cashoutMultiplier: null,
          winAmount: 0,
        };
        if (isP1) panel1Ref.current = reset;
        else panel2Ref.current = reset;
        setPanel(reset);
      }
      const message = error?.message || "Cash out failed. Please retry.";
      setStakeError(message);
    }
  }, []);

  /**
   * Cancel Bet Handler:
   * Sends cancel command to backend.
   * Backend executes atomic Redis Lua script (walletCancelBet.lua) and refunds wallet.
   */
  const cancelBet = useCallback(async (panelNum) => {
    const isP1 = panelNum === 1;
    const panel = isP1 ? panel1Ref.current : panel2Ref.current;
    const setPanel = isP1 ? setPanel1 : setPanel2;

    if ((!panel.hasBet && !panel.isNextRoundBet) || !panel.betId || panel.isCancelling || panel.isCashingOut) return;
    if (!isConnectedRef.current) {
      const message = "Game server is reconnecting. Please retry cancellation.";
      setStakeError(message);
      return;
    }

    const targetBetId = panel.betId;
    const pending = { ...panel, isCancelling: true, hasBet: false, isNextRoundBet: false };
    if (isP1) panel1Ref.current = pending;
    else panel2Ref.current = pending;
    setPanel(pending);
    audioService?.playClick?.();

    try {
      const response = await apiService.cancelBet(targetBetId);
      if (!response?.success) {
        throw new Error(response?.message || response?.error || response?.code || "Cancellation was rejected by the server.");
      }
      // Refund/balance updates arrive from the backend. Never refund locally.
      const current = isP1 ? panel1Ref.current : panel2Ref.current;
      if (current.betId === targetBetId) {
        const cancelled = {
          ...current,
          hasBet: false,
          isNextRoundBet: false,
          cashedOut: false,
          cashoutMultiplier: null,
          winAmount: 0,
          betId: null,
          isCashingOut: false,
          isPlacing: false,
          isCancelling: false,
        };
        if (isP1) panel1Ref.current = cancelled;
        else panel2Ref.current = cancelled;
        setPanel(cancelled);
      }
    } catch (error) {
      const current = isP1 ? panel1Ref.current : panel2Ref.current;
      if (current.betId === targetBetId) {
        const reset = { ...current, isCancelling: false };
        if (isP1) panel1Ref.current = reset;
        else panel2Ref.current = reset;
        setPanel(reset);
      }
      const message = error?.message || "Unable to cancel bet.";
      setStakeError(message);
    }
  }, []);

  /**
   * Place Bet Handler:
   * Works in WAITING phase or queues for NEXT round mid-flight.
   * Backend executes atomic Redis Lua script (walletDebitBet.lua).
   */
  const placeBet = useCallback(
    async (panelNum) => {
      const isP1 = panelNum === 1;
      const panel = isP1 ? panel1Ref.current : panel2Ref.current;
      const setPanel = isP1 ? setPanel1 : setPanel2;
      const betAmount = Number(panel.amount);
      if (panel.isPlacing || panel.isCancelling || panel.isCashingOut) return;

      // Clicking an active/queued bet during the waiting phase cancels it.
      if (panel.isNextRoundBet || (panel.hasBet && gameStateRef.current === "WAITING")) {
        await cancelBet(panelNum);
        return;
      }

      if (!Number.isFinite(betAmount) || betAmount <= 0) {
        setStakeError("Please select the stake First.");
        return;
      }

      if (!isLoggedIn) {
        const message = "Please log in to place a bet.";
        setStakeError(message);
        return;
      }
      if (isDemoUser) {
        setStakeError("You have insufficient balance.");
        return;
      }
      if (!isConnectedRef.current) {
        const message = "Connecting to Vimaan server. Please retry in a moment.";
        setStakeError(message);
        return;
      }

      const spendableBalance = Number(balanceRef.current ?? 0);
      if (!Number.isFinite(betAmount) || betAmount <= 0) {
        const message = "Enter a valid bet amount.";
        setStakeError(message);
        return;
      }
      if (spendableBalance < betAmount) {
        const message = "Insufficient balance.";
        setStakeError(message);
        return;
      }

      const autoCashoutVal = panel.isAuto && panel.isAutoCashout
        ? Number.parseFloat(panel.autoCashout)
        : null;
      const isWaiting = gameStateRef.current === "WAITING";
      const isQueued = !isWaiting;
      const pending = {
        ...panel,
        amount: betAmount,
        placedBetAmount: betAmount,
        isPlacing: true,
        hasBet: !isQueued,
        isNextRoundBet: isQueued,
        cashedOut: false,
      };
      if (isP1) panel1Ref.current = pending;
      else panel2Ref.current = pending;
      setPanel(pending);
      audioService?.playClick?.();
      setStakeError(null);

      try {
        const response = await apiService.placeBet(betAmount, panelNum, autoCashoutVal);
        if (!response?.success || !response?.data) {
          throw new Error(response?.message || response?.error || response?.code || "Bet rejected by Vimaan server.");
        }

        const betId = response.data.betId;
        const isQueued = Boolean(response.data.isQueuedNext || !isWaiting);
        const updated = {
          ...pending,
          betId,
          placedBetAmount: betAmount,
          hasBet: !isQueued,
          isNextRoundBet: isQueued,
          cashedOut: false,
          cashoutMultiplier: null,
          winAmount: 0,
          isCashingOut: false,
          isPlacing: false,
          isCancelling: false,
        };
        if (isP1) panel1Ref.current = updated;
        else panel2Ref.current = updated;
        setPanel(updated);

        if (response.data?.exposure !== undefined && response.data?.exposure !== null) {
          const exp = Number(response.data.exposure) || 0;
          dispatch(updateExposureBalance(exp));
          if (userDataRef.current) {
            userDataRef.current = { ...userDataRef.current, exposure: exp };
          }
        }
        if (response.data?.availableBalance !== undefined && response.data?.availableBalance !== null) {
          const avail = Number(response.data.availableBalance) || 0;
          dispatch(updateAvailableBalance(avail));
          if (userDataRef.current) {
            userDataRef.current = { ...userDataRef.current, availableBalance: avail };
          }
        }

        setLiveBets((previous) => [
          {
            id: betId,
            user: "You",
            bet: betAmount.toFixed(2),
            multiplier: null,
            cashedOut: false,
            avatar: 99,
          },
          ...previous.filter((bet) => bet.id !== betId),
        ].slice(0, 80));
        // Balance is updated from wallet:updated/ wallet:statement only.
      } catch (error) {
        const current = isP1 ? panel1Ref.current : panel2Ref.current;
        const reset = { ...current, isPlacing: false, isCashingOut: false, betId: null, hasBet: false, isNextRoundBet: false };
        if (isP1) panel1Ref.current = reset;
        else panel2Ref.current = reset;
        setPanel(reset);
        const message = error?.message || "Failed to place bet.";
        setStakeError(message);
      }
    },
    [cancelBet, isLoggedIn],
  );

  // Connect to authoritative backend on mount
  useEffect(() => {
    let isMounted = true;

    const handleInteraction = () => {
      audioService?.handleUserGesture?.();
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    const getParentOrigin = () => {
      try {
        if (typeof document !== "undefined" && document.referrer) {
          return new URL(document.referrer).origin;
        }
      } catch {
        // No trustworthy referrer available; skip parent messaging.
      }
      return null;
    };

    const handleIframeMessage = (event) => {
      try {
        const parentOrigin = getParentOrigin();
        if (!parentOrigin || event.source !== window.parent || event.origin !== parentOrigin) return;
        if (!event.data || typeof event.data !== "object") return;

        // The backend is the only source of wallet truth in AsianExchange wallet mode.
        // Parent-origin SET_BALANCE messages are intentionally ignored.
        if (event.data.type === "GET_BALANCE") {
          window.parent.postMessage(
            { type: "BALANCE_RESPONSE", balance: balanceRef.current },
            parentOrigin,
          );
        }
      } catch (error) {
        console.warn("Vimaan parent message handling failed:", error);
      }
    };
    window.addEventListener("message", handleIframeMessage);

    async function initAuthoritativeBackend() {
      try {
        // A launch token in the URL supports iframe launches. Otherwise the
        // client asks the authenticated AsianExchange /api/vimaan/launch proxy.
        if (!apiService.hasLaunchTokenInUrl() && (!isLoggedIn || !userId)) return;
        const session = await apiService.initSession(userId, auraActualBalance, authToken || userData?.token || userData?.accessToken);
        if (!session || !isMounted) {
          const message = apiService.getLastError?.() || "Unable to connect to Vimaan.";
          setStakeError(message);
          return;
        }

        if (session.wallet?.displayBalance !== undefined && session.wallet?.displayBalance !== null) {
          setBalance(Number(session.wallet.displayBalance));
        }
        await refreshAsianExchangeWallet();
        if (!isMounted) return;

        apiService.connectSocket({
          onConnect: () => {
            if (!isMounted) return;
            isConnectedRef.current = true;
            apiService.requestResync?.();
          },
          onConnectError: (error) => {
            if (!isMounted) return;
            console.warn("Vimaan socket connection error:", error?.message || error);
            isConnectedRef.current = false;
          },
          onDisconnect: () => {
            if (!isMounted) return;
            isConnectedRef.current = false;
            setGameState("WAITING");
            setWaitingCountdown(0);
          },
          onBetRejected: (data) => {
            if (!isMounted) return;
            const msg = data?.message || data?.error || "Bet was rejected by Vimaan.";
            setStakeError(msg);
          },
          onSnapshot: (snap) => {
            if (!isMounted) return;
            if (snap.wallet?.displayBalance !== undefined && snap.wallet?.displayBalance !== null) {
              setBalance(Number(snap.wallet.displayBalance));
            }
            if (snap.wallet?.exposure !== undefined && snap.wallet?.exposure !== null) {
              const exp = Number(snap.wallet.exposure) || 0;
              dispatch(updateExposureBalance(exp));
              if (userDataRef.current) {
                userDataRef.current = { ...userDataRef.current, exposure: exp };
              }
            }
            if (snap.startTime) {
              setFlightStartTime(Number(snap.startTime));
            }
            if (snap.multiplier) {
              const parsedM = parseFloat(snap.multiplier);
              if (!isNaN(parsedM)) setMultiplier(parsedM);
            }
            if (snap.gameState === "RUNNING") {
              setGameState("FLYING");
            } else if (snap.gameState === "CRASHED") {
              setGameState("CRASHED");
            } else {
              setGameState("WAITING");
              if (snap.waitingCountdown !== undefined) {
                setWaitingCountdown(parseFloat(snap.waitingCountdown) || 0);
              }
            }
            if (Array.isArray(snap.history)) {
              const safeHist = snap.history
                .map((h) => {
                  const val =
                    typeof h === "object"
                      ? h.multiplier || h.crashMultiplier || h.finalCrash
                      : h;
                  const parsed = parseFloat(val);
                  return isNaN(parsed) ? 1.0 : parsed;
                })
                .filter((n) => !isNaN(n));
              setHistory(safeHist.slice(0, 25));
            }
            if (Array.isArray(snap.allBets)) {
              setLiveBets(snap.allBets);
            }

            // Restore active player bets on reload
            if (snap.activeBets?.slot1) {
              const b1 = snap.activeBets.slot1;
              const amt = b1.amount
                ? b1.amount / 100
                : panel1Ref.current.amount;
              const restored1 = {
                ...panel1Ref.current,
                betId: b1.id,
                amount: amt,
                hasBet: b1.status === "ACCEPTED",
                isNextRoundBet: b1.status === "QUEUED_NEXT",
                cashedOut: b1.status === "WON",
                cashoutMultiplier: b1.cashoutMultiplier
                  ? b1.cashoutMultiplier / 100
                  : null,
                winAmount: b1.payout ? b1.payout / 100 : 0,
                isCashingOut: false,
              };
              panel1Ref.current = restored1;
              setPanel1(restored1);
            }
            if (snap.activeBets?.slot2) {
              const b2 = snap.activeBets.slot2;
              const amt = b2.amount
                ? b2.amount / 100
                : panel2Ref.current.amount;
              const restored2 = {
                ...panel2Ref.current,
                betId: b2.id,
                amount: amt,
                hasBet: b2.status === "ACCEPTED",
                isNextRoundBet: b2.status === "QUEUED_NEXT",
                cashedOut: b2.status === "WON",
                cashoutMultiplier: b2.cashoutMultiplier
                  ? b2.cashoutMultiplier / 100
                  : null,
                winAmount: b2.payout ? b2.payout / 100 : 0,
                isCashingOut: false,
              };
              panel2Ref.current = restored2;
              setPanel2(restored2);
            }
          },
          onCountdown: (data) => {
            if (!isMounted) return;
            setGameState("WAITING");
            const countdownVal = parseFloat(data.countdown);
            if (!isNaN(countdownVal)) {
              setWaitingCountdown(countdownVal);
              setCashoutAlert(null);
              const secFloor = Math.ceil(countdownVal);
              if (secFloor !== lastTickSecondRef.current) {
                lastTickSecondRef.current = secFloor;
                audioService?.playTick?.();
              }
            }
          },
          onStarted: (data) => {
            if (!isMounted) return;
            setGameState("FLYING");
            setMultiplier(1.0);
            if (data?.startTime) {
              setFlightStartTime(Number(data.startTime));
            } else {
              setFlightStartTime(Date.now());
            }
            audioService?.playTakeoff?.();

            // ONLY activate bet if user actually placed a bet in WAITING or queued for this round WITH a valid betId
            const p1 = panel1Ref.current;
            const p2 = panel2Ref.current;

            const hasActiveBet1 = Boolean(
              p1.betId && (p1.hasBet || p1.isNextRoundBet),
            );
            const hasActiveBet2 = Boolean(
              p2.betId && (p2.hasBet || p2.isNextRoundBet),
            );

            const nextP1 = {
              ...p1,
              hasBet: hasActiveBet1,
              isNextRoundBet: false,
              cashedOut: false,
              cashoutMultiplier: null,
              winAmount: 0,
              isCashingOut: false,
              isPlacing: false,
              isCancelling: false,
              betId: hasActiveBet1 ? p1.betId : null,
            };
            const nextP2 = {
              ...p2,
              hasBet: hasActiveBet2,
              isNextRoundBet: false,
              cashedOut: false,
              cashoutMultiplier: null,
              winAmount: 0,
              isCashingOut: false,
              isPlacing: false,
              isCancelling: false,
              betId: hasActiveBet2 ? p2.betId : null,
            };
            panel1Ref.current = nextP1;
            panel2Ref.current = nextP2;
            setPanel1(nextP1);
            setPanel2(nextP2);
          },
          onTick: (data) => {
            if (!isMounted) return;
            const currentMult = parseFloat(data.multiplier);
            if (!isNaN(currentMult)) {
              setMultiplier(currentMult);
              try {
                if (
                  typeof audioService?.updateFlightMultiplier === "function"
                ) {
                  audioService.updateFlightMultiplier(currentMult);
                }
              } catch (e) {
                console.warn(e);
              }
            }
          },
          onCrashed: (data) => {
            if (!isMounted) return;
            const rawCrash = data.crashMultiplier || data.finalCrash;
            const parsedCrash = parseFloat(rawCrash);
            const finalCrash = isNaN(parsedCrash) ? 1.0 : parsedCrash;
            setMultiplier(finalCrash);
            setGameState("CRASHED");
            audioService?.playCrashFlyAway?.();

            // Clear current round bet states completely. Only preserve queued next round bets!
            const p1 = panel1Ref.current;
            const p2 = panel2Ref.current;

            const reset1 = {
              ...p1,
              hasBet: false,
              isNextRoundBet: Boolean(p1.isNextRoundBet),
              cashedOut: false,
              cashoutMultiplier: null,
              winAmount: 0,
              isCashingOut: false,
              isPlacing: false,
              isCancelling: false,
              betId: p1.isNextRoundBet ? p1.betId : null,
            };
            const reset2 = {
              ...p2,
              hasBet: false,
              isNextRoundBet: Boolean(p2.isNextRoundBet),
              cashedOut: false,
              cashoutMultiplier: null,
              winAmount: 0,
              isCashingOut: false,
              isPlacing: false,
              isCancelling: false,
              betId: p2.isNextRoundBet ? p2.betId : null,
            };
            panel1Ref.current = reset1;
            panel2Ref.current = reset2;
            setPanel1(reset1);
            setPanel2(reset2);

            if (Array.isArray(data.history) && data.history.length > 0) {
              const safeHistory = data.history
                .map((h) => {
                  const val =
                    typeof h === "object"
                      ? h.multiplier || h.crashMultiplier || h.finalCrash
                      : h;
                  const parsed = parseFloat(val);
                  return isNaN(parsed) ? 1.0 : parsed;
                })
                .filter((n) => !isNaN(n));
              setHistory(safeHistory.slice(0, 25));
            } else {
              setHistory((prev) =>
                [finalCrash, ...prev.filter((p) => !isNaN(p))].slice(0, 25),
              );
            }
          },
          onWalletUpdated: (data) => {
            if (!isMounted) return;
            if (data.balanceDisplay !== undefined && data.balanceDisplay !== null) {
              setBalance(Number(data.balanceDisplay));
            }
            if (data.exposure !== undefined && data.exposure !== null) {
              const exp = Number(data.exposure) || 0;
              dispatch(updateExposureBalance(exp));
              if (userDataRef.current) {
                userDataRef.current = { ...userDataRef.current, exposure: exp };
              }
            }
            if (data.availableBalance !== undefined && data.availableBalance !== null) {
              const avail = Number(data.availableBalance) || 0;
              dispatch(updateAvailableBalance(avail));
              if (userDataRef.current) {
                userDataRef.current = { ...userDataRef.current, availableBalance: avail };
              }
            }
          },
          onBetAccepted: (bet) => {
            if (!isMounted) return;
            if (bet.exposure !== undefined && bet.exposure !== null) {
              const exp = Number(bet.exposure) || 0;
              dispatch(updateExposureBalance(exp));
              if (userDataRef.current) {
                userDataRef.current = { ...userDataRef.current, exposure: exp };
              }
            }
            if (bet.availableBalance !== undefined && bet.availableBalance !== null) {
              const avail = Number(bet.availableBalance) || 0;
              dispatch(updateAvailableBalance(avail));
              if (userDataRef.current) {
                userDataRef.current = { ...userDataRef.current, availableBalance: avail };
              }
            }
            const slot = Number(bet.slot) || 1;
            const setPanel = slot === 1 ? setPanel1 : setPanel2;
            const targetPanel =
              slot === 1 ? panel1Ref.current : panel2Ref.current;
            const updated = {
              ...targetPanel,
              betId: bet.betId,
              hasBet: !bet.isQueuedNext,
              isNextRoundBet: Boolean(bet.isQueuedNext),
              cashedOut: false,
              isCashingOut: false,
              isPlacing: false,
              isCancelling: false,
            };
            if (slot === 1) panel1Ref.current = updated;
            else panel2Ref.current = updated;
            setPanel(updated);
          },
          /**
           * Authoritative Settlement Result from Backend Lua Script:
           * Server alone determines WON vs LOST, exact multiplier, and payout.
           */
          onBetUpdated: (bet) => {
            if (!isMounted || !bet) return;
            if (bet.exposure !== undefined && bet.exposure !== null) {
              const exp = Number(bet.exposure) || 0;
              dispatch(updateExposureBalance(exp));
              if (userDataRef.current) {
                userDataRef.current = { ...userDataRef.current, exposure: exp };
              }
            }
            if (bet.availableBalance !== undefined && bet.availableBalance !== null) {
              const avail = Number(bet.availableBalance) || 0;
              dispatch(updateAvailableBalance(avail));
              if (userDataRef.current) {
                userDataRef.current = { ...userDataRef.current, availableBalance: avail };
              }
            }
            const slot = Number(bet.slot) || 1;
            const setPanel = slot === 1 ? setPanel1 : setPanel2;
            const panel = slot === 1 ? panel1Ref.current : panel2Ref.current;

            if (bet.status === "WON" || bet.status === "CASHED_OUT") {
              const mult = Number.parseFloat(bet.multiplierDisplay) || multiplierRef.current;
              const payout = Number.parseFloat(bet.payoutDisplay) || 0;
              const updated = {
                ...panel,
                hasBet: false,
                isNextRoundBet: false,
                cashedOut: true,
                cashoutMultiplier: mult,
                winAmount: payout,
                isCashingOut: false,
                isPlacing: false,
                isCancelling: false,
                betId: null,
              };
              const wasAlreadyCashedOut = Boolean(panel.cashedOut);
              if (slot === 1) panel1Ref.current = updated;
              else panel2Ref.current = updated;
              setPanel(updated);
              setCashoutAlert((prev) =>
                prev
                  ? { ...prev, multiplier: mult, winAmount: payout }
                  : { multiplier: mult, winAmount: payout, id: Date.now() },
              );
              if (!wasAlreadyCashedOut) {
                audioService?.playCashout?.();
              }

              setLiveBets((previous) => previous.map((item) =>
                item.id === bet.betId
                  ? { ...item, cashedOut: true, multiplier: mult, payout: payout.toFixed(2) }
                  : item,
              ));
              setMyBetsHistory((previous) => [
                {
                  id: bet.betId || `my-${Date.now()}-${slot}`,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                  bet: panel.amount,
                  multiplier: mult,
                  cashout: payout,
                  status: "WON",
                },
                ...previous,
              ]);
            } else if (bet.status === "LOST") {
              const updated = {
                ...panel,
                hasBet: false,
                isNextRoundBet: false,
                cashedOut: false,
                cashoutMultiplier: null,
                winAmount: 0,
                isCashingOut: false,
                isPlacing: false,
                isCancelling: false,
                betId: null,
              };
              if (slot === 1) panel1Ref.current = updated;
              else panel2Ref.current = updated;
              setPanel(updated);

              setMyBetsHistory((previous) => [
                {
                  id: bet.betId || `my-lost-${Date.now()}-${slot}`,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                  bet: panel.amount,
                  multiplier: null,
                  cashout: 0,
                  status: "LOST",
                },
                ...previous,
              ]);
            } else if (bet.status === "CANCELLED" || bet.status === "VOID") {
              const cancelled = {
                ...panel,
                hasBet: false,
                isNextRoundBet: false,
                cashedOut: false,
                cashoutMultiplier: null,
                winAmount: 0,
                isCashingOut: false,
                isPlacing: false,
                isCancelling: false,
                betId: null,
              };
              if (slot === 1) panel1Ref.current = cancelled;
              else panel2Ref.current = cancelled;
              setPanel(cancelled);
            }
          },
          // Room Live Bets Listeners (Real-time community room activity from Redis)
          onBetsAll: (data) => {
            if (!isMounted) return;
            if (Array.isArray(data.bets)) {
              setLiveBets(data.bets);
            }
          },
          onBetsNew: (newBet) => {
            if (!isMounted) return;
            setLiveBets((prev) =>
              [newBet, ...prev.filter((b) => b.id !== newBet.id)].slice(0, 80),
            );
          },
          onBetsSettled: (settled) => {
            if (!isMounted) return;
            setLiveBets((prev) =>
              prev.map((b) =>
                b.id === settled.id
                  ? {
                      ...b,
                      cashedOut: settled.cashedOut,
                      multiplier: parseFloat(settled.multiplier),
                      payout: settled.payout,
                    }
                  : b,
              ),
            );
          },
          onBetsClear: () => {
            if (!isMounted) return;
            setLiveBets([]);
          },
          onStatement: (statement) => {
            if (!isMounted || !statement) return;

            // Idempotent client mirror: the backend emits wallet:statement and
            // bet:statement for the same financial event. ApiService subscribes
            // only to wallet:statement, and this guard also ignores repeats.
            const statementKey = statement.statementId || [
              statement.type,
              statement.betId,
              statement.action,
              statement.timestamp,
              statement.balanceBefore,
              statement.balanceAfter,
            ].join(":");
            if (seenStatementsRef.current.has(statementKey)) return;
            seenStatementsRef.current.add(statementKey);
            if (seenStatementsRef.current.size > 250) {
              const oldest = seenStatementsRef.current.values().next().value;
              seenStatementsRef.current.delete(oldest);
            }

            const before = Number(statement.balanceBefore);
            const after = Number(statement.balanceAfter);
            if (Number.isFinite(before) && Number.isFinite(after)) {
              const delta = Number((after - before).toFixed(2));
              setBalance(Math.max(0, after));

              if (statement.exposure !== undefined && statement.exposure !== null) {
                const exp = Number(statement.exposure) || 0;
                dispatch(updateExposureBalance(exp));
                if (userDataRef.current) {
                  userDataRef.current = { ...userDataRef.current, exposure: exp };
                }
              }
              if (statement.availableBalance !== undefined && statement.availableBalance !== null) {
                const avail = Number(statement.availableBalance) || 0;
                dispatch(updateAvailableBalance(avail));
                if (userDataRef.current) {
                  userDataRef.current = { ...userDataRef.current, availableBalance: avail };
                }
              } else if (delta !== 0 && userDataRef.current) {
                const currentAvailable = Number(userDataRef.current.availableBalance ?? 0);
                const nextAvailable = Math.max(0, Number((currentAvailable + delta).toFixed(2)));
                const nextUserData = { ...userDataRef.current, availableBalance: nextAvailable };
                userDataRef.current = nextUserData;
                dispatch(updateAvailableBalance(nextAvailable));
              } else if (delta !== 0) {
                refreshAsianExchangeWallet();
              }
            }

            // Preserve the old parent integration events, but send only to the
            // embedding page's exact origin. Never use postMessage('*') for wallet data.
            try {
              if (window.parent && window.parent !== window && document.referrer) {
                const parentOrigin = new URL(document.referrer).origin;
                const stake = Number(statement.stake || 0);
                const profit = Number(statement.profit || 0);
                const total = Number(statement.total ?? statement.payout ?? 0);
                const multiplierValue = statement.multiplier == null ? null : Number(statement.multiplier);
                const balanceBefore = Number(statement.balanceBefore || 0);
                const balanceAfter = Number(statement.balanceAfter || 0);
                const common = {
                  action: statement.action,
                  outcome: statement.outcome,
                  stake,
                  profit,
                  total,
                  payout: total,
                  multiplier: multiplierValue,
                  balanceBefore,
                  balanceAfter,
                  betId: statement.betId,
                  roundId: statement.roundId,
                  slot: statement.slot,
                  timestamp: statement.timestamp || new Date().toISOString(),
                };
                window.parent.postMessage({ type: "VIMAAN_STATEMENT", ...common }, parentOrigin);
                window.parent.postMessage({ type: "VIMAAN_WIN_LOSS", ...common }, parentOrigin);
                window.parent.postMessage({ type: "VIMAAN_BALANCE_UPDATE", balance: balanceAfter }, parentOrigin);
              }
            } catch (error) {
              console.warn("Vimaan parent statement notification failed:", error?.message || error);
            }
          },
        });
      } catch (err) {
        console.warn("Backend connection error:", err.message);
      }
    }

    initAuthoritativeBackend();

    return () => {
      isMounted = false;
      isConnectedRef.current = false;
      apiService.disconnectSocket?.();
      audioService?.stopAll?.();
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("message", handleIframeMessage);
    };
  }, [isLoggedIn, userId, authToken, userData?.token, userData?.accessToken, refreshAsianExchangeWallet, dispatch]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        multiplier,
        waitingCountdown,
        flightStartTime,
        history,
        isHistoryOpen,
        setIsHistoryOpen,
        isMuted,
        toggleSound,
        balance,
        setBalance,
        liveBets,
        activeTab,
        setActiveTab,
        myBetsHistory,
        panel1,
        setPanel1,
        panel2,
        setPanel2,
        placeBet,
        cancelBet,
        cashOut,
        cashoutAlert,
        setCashoutAlert,
        stakeError,
        setStakeError,
        isDemoUser,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
