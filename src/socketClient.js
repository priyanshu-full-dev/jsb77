import io from "socket.io-client";
import API, { baseUrl } from "./api/axios";
import {
  setMatchesLoading,
  updateMatches,
  setMatchesError,
} from "./redux/slices/matchSlice";
import {
  setMarketOddsLoading,
  setMarketOddsData,
  setMarketOddsError,
} from "./redux/slices/fullmarketSlice";
import {
  setBookmakerData,
  setBookmakerError,
  setBookmakerLoading,
} from "./redux/slices/bookmakerSlice";
import { setUserData } from "./redux/slices/userSlice";
import {
  updateProfileData,
  addLatestBet,
  addBet,
} from "./redux/slices/accountSlice";
import {
  setFancyOddsData,
  setFancyOddsError,
  setFancyOddsLoading,
} from "./redux/slices/fancySlice";
import {
  updateHorseMarket,
  updateHorseSlice,
} from "./redux/slices/horseSlice";
import {
  updateGreyhoundMarket,
  updateGreyhoundSlice,
} from "./redux/slices/greyhoundSlice";
import { toast } from "react-toastify";
import {
  updateKabaddiMarket,
  updatekabaddiSlice,
} from "./redux/slices/kabaddiSlice";
import { addMatchBetsData } from "./redux/slices/betsSlice";
import {
  setDiamondCasinoOddsData,
  setDiamondCasinoOddsError,
  setDiamondCasinoOddsLoading,
} from "./redux/slices/diamondCasinoOddsSlice";
import {
  updateAuraMatches,
  setAuraOddsData,
} from "./redux/slices/auraMatchesSlice";
import { fetchLocksApi } from "./utils/fetchLocks";
import { fetchMatchLockDetails } from "./utils/helper/fetchMatcOdds";
import ExposureToast from "./NprSrc/AuraExchangeSrc/components/ExposureToast";
import { createElement } from "react";

export const auraOddsMemoryCache = new Map();
export const casinoOddsMemoryCache = new Map();
const MAX_AURA_CACHE_SIZE = 20;

// Dynamic Store Injection
let reduxStore = null;
export const injectStore = (_store) => {
  reduxStore = _store;
};
export const getStore = () => reduxStore;

const safeDispatch = (action) => {
  if (reduxStore?.dispatch && action) {
    try {
      reduxStore.dispatch(action);
    } catch (e) {
      // safe dispatch
    }
  }
};

const safeGetState = () => {
  return reduxStore?.getState ? reduxStore.getState() : {};
};

export const getCasinoOddsCache = (gmid) => {
  if (!gmid) return null;
  return casinoOddsMemoryCache.get(String(gmid)) || null;
};

export const prefetchDiamondCasinoOdds = (gmid) => {
  if (!gmid || !socket?.connected) return;
  const actualId = String(gmid);
  socket.emit("subscribeToDiamondCasinoOdds", {
    eventId: actualId,
    eventType: "casino",
    gmid: actualId,
  });
};

// Flatten lock keys only when the Redux lock object identity changes.
// Live odds can arrive frequently; rebuilding these objects per packet is wasteful.
const flattenedLockCache = new WeakMap();
const EMPTY_LOCK_SET = new Set();
const EMPTY_LOCK_GROUPS = Object.freeze({});

const getFlattenedLockIds = (lockGroups) => {
  if (!lockGroups || typeof lockGroups !== "object") {
    return EMPTY_LOCK_SET;
  }

  const cached = flattenedLockCache.get(lockGroups);
  if (cached) return cached;

  const ids = new Set();
  Object.values(lockGroups).forEach((group) => {
    if (!group || typeof group !== "object") return;
    Object.keys(group).forEach((id) => ids.add(String(id)));
  });

  flattenedLockCache.set(lockGroups, ids);
  return ids;
};

export const setAuraOddsCache = (id, oddsData) => {
  if (!oddsData) return;
  const cacheKey = String(id);
  if (auraOddsMemoryCache.has(cacheKey)) {
    auraOddsMemoryCache.delete(cacheKey);
  } else if (auraOddsMemoryCache.size >= MAX_AURA_CACHE_SIZE) {
    const oldestKey = auraOddsMemoryCache.keys().next().value;
    auraOddsMemoryCache.delete(oldestKey);
  }
  const cachedValue = Array.isArray(oddsData)
    ? Object.assign([...oddsData], { _cachedAt: Date.now() })
    : { ...oddsData, _cachedAt: Date.now() };
  auraOddsMemoryCache.set(cacheKey, cachedValue);
};

export const getFreshAuraOddsCache = (
  id,
  reduxOdds = null,
  maxAgeMs = 10000,
) => {
  if (!id) return null;
  const now = Date.now();
  const mem = auraOddsMemoryCache.get(String(id));
  if (mem && mem._cachedAt && now - mem._cachedAt <= maxAgeMs) {
    return mem;
  }
  if (
    reduxOdds &&
    reduxOdds._cachedAt &&
    now - reduxOdds._cachedAt <= maxAgeMs
  ) {
    return reduxOdds;
  }
  return null;
};

const activeSubscriptions = {
  matches: new Map(), // key: `${eventId}-${eventType}`
  marketOdds: new Map(), // key: `${eventId}-${marketId}`
  auraMarketOdds: new Map(),
  bookmaker: new Map(), // key: eventId
  auraBookmaker: new Map(),
  fancyOdds: new Map(), // key: eventId
  horseMatches: false,
  horseOdds: new Map(), // key: gmid
  greyhoundMatches: false,
  greyhoundOdds: new Map(), // key: gmid
  kabaddiMatches: false,
  kabaddiOdds: new Map(), // key: gmid
  diamondCasino: new Map(), // key: gmid
  profileRoom: null,
  myBets: null,
  // ---- New Aura Universe ----
  auraEvents: new Map(), // key: sportId
  auraOdds: new Map(), // key: `${sportId}-${exEventId}`
  auraState: new Map(), // key: `${sportId}-${exEventId}`
};

let isResubscribing = false;

const socketServerUrl =
  (import.meta.env.PROD
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_DEV) ||
  import.meta.env.VITE_API_BASE_URL_PROD ||
  "https://api.professor.monster";

export const socket = io(socketServerUrl, {
  // Resolve the token at handshake time, not while this module is importing.
  // This also picks up a token obtained after initial page load.
  auth: (callback) => {
    callback({ token: safeGetState()?.user?.token || "" });
  },
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 2500,
  reconnectionAttempts: Infinity,
  timeout: 15000,
  transports: ["websocket", "polling"],
  upgrade: true,
});

// ==================== GLOBAL LISTENERS (only one time) ====================

let lastConnectErrorMessage = "";
let lastServerPacketAt = Date.now();
let lastLiveOddsPacketAt = Date.now();
let lastMissingRoomResubAt = 0;
let syncAckTimer = null;
const auraOddsDeliveryTimers = new Map();

const clearAuraDeliveryTimer = (key) => {
  const timer = auraOddsDeliveryTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    auraOddsDeliveryTimers.delete(key);
  }
};

const clearAllAuraDeliveryTimers = () => {
  for (const timer of auraOddsDeliveryTimers.values()) {
    clearTimeout(timer);
  }
  auraOddsDeliveryTimers.clear();
};

const clearAuraDeliveryTimersForEvent = (exEventId) => {
  const suffix = `-${String(exEventId)}`;
  for (const [key, timer] of auraOddsDeliveryTimers.entries()) {
    if (key.endsWith(suffix)) {
      clearTimeout(timer);
      auraOddsDeliveryTimers.delete(key);
    }
  }
};

const hasPeriodicLiveOddsSubscription = () =>
  activeSubscriptions.auraOdds.size > 0 ||
  activeSubscriptions.auraMarketOdds.size > 0 ||
  activeSubscriptions.auraBookmaker.size > 0 ||
  activeSubscriptions.diamondCasino.size > 0;

const hasActiveLiveOddsSubscription = () =>
  hasPeriodicLiveOddsSubscription() ||
  activeSubscriptions.marketOdds.size > 0 ||
  activeSubscriptions.bookmaker.size > 0 ||
  activeSubscriptions.fancyOdds.size > 0 ||
  activeSubscriptions.horseOdds.size > 0 ||
  activeSubscriptions.greyhoundOdds.size > 0 ||
  activeSubscriptions.kabaddiOdds.size > 0;

const clearSyncAckTimer = () => {
  if (syncAckTimer) {
    clearTimeout(syncAckTimer);
    syncAckTimer = null;
  }
};

socket.onAny(() => {
  lastServerPacketAt = Date.now();
});

socket.on("connect", () => {
  clearSyncAckTimer();
  const now = Date.now();
  lastServerPacketAt = now;
  lastLiveOddsPacketAt = now;
  lastConnectErrorMessage = "";
  console.log("Socket connected");
  fetchLocksApi();
  resubscribeAll();
});

const verifySocketAliveOrReconnect = (force = false) => {
  if (!socket.connected) {
    clearSyncAckTimer();
    socket.connect();
    return;
  }

  if (syncAckTimer && !force) {
    return;
  }

  clearSyncAckTimer();
  syncAckTimer = setTimeout(() => {
    syncAckTimer = null;
    console.warn("Socket zombie connection detected, reconnecting...");
    try {
      socket.disconnect();
    } catch {
      // ignore
    }
    socket.connect();
  }, 2500);

  socket.emit("syncCheck", (res) => {
    const now = Date.now();
    lastServerPacketAt = now;
    clearSyncAckTimer();
    if (
      res &&
      typeof res.resyncedRooms === "number" &&
      res.resyncedRooms === 0 &&
      hasActiveLiveOddsSubscription() &&
      now - lastMissingRoomResubAt >= 4000
    ) {
      lastMissingRoomResubAt = now;
      resubscribeAll();
    }
  });
};

const scheduleAuraOddsDeliveryCheck = (key) => {
  clearAuraDeliveryTimer(key);
  const timer = setTimeout(() => {
    auraOddsDeliveryTimers.delete(key);
    if (!activeSubscriptions.auraOdds.has(key)) return;
    if (
      typeof document !== "undefined" &&
      document.visibilityState === "hidden"
    ) {
      return;
    }
    if (!socket.connected) {
      socket.connect();
      return;
    }
    verifySocketAliveOrReconnect();
  }, 2500);
  auraOddsDeliveryTimers.set(key, timer);
};

let pageHiddenAt = null;
let windowBlurredAt = null;
let lastResumeSyncAt = 0;

const syncConnectionOnResume = (hiddenDurationMs = 0, force = false) => {
  const now = Date.now();
  if (!force && now - lastResumeSyncAt < 800) return;
  lastResumeSyncAt = now;

  if (!socket.connected) {
    // Immediate reconnect without waiting for backoff timer after background sleep
    socket.connect();
    return;
  }

  const idleSincePacket = now - lastServerPacketAt;
  const idleSinceLiveOdds = now - lastLiveOddsPacketAt;

  // Re-emit active subscriptions and verify socket liveness so half-open TCP sleeps recover immediately
  if (force || hiddenDurationMs >= 2000) {
    resubscribeAll();
    verifySocketAliveOrReconnect(true);
    if (force || hiddenDurationMs >= 15000) {
      fetchLocksApi();
    }
  } else if (
    (hasActiveLiveOddsSubscription() && idleSinceLiveOdds >= 2500) ||
    idleSincePacket >= 8000
  ) {
    verifySocketAliveOrReconnect();
  }
};

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      pageHiddenAt = Date.now();
    } else if (document.visibilityState === "visible") {
      const hiddenStart = pageHiddenAt || windowBlurredAt;
      const diff = hiddenStart ? Date.now() - hiddenStart : 0;
      pageHiddenAt = null;
      windowBlurredAt = null;
      syncConnectionOnResume(diff);
    }
  });

  // Chrome Page Lifecycle API when a frozen background tab resumes
  document.addEventListener("resume", () => {
    const hiddenStart = pageHiddenAt || windowBlurredAt;
    const diff = hiddenStart ? Date.now() - hiddenStart : 15000;
    pageHiddenAt = null;
    windowBlurredAt = null;
    syncConnectionOnResume(diff, true);
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("blur", () => {
    if (!windowBlurredAt) {
      windowBlurredAt = Date.now();
    }
  });

  window.addEventListener("focus", () => {
    const blurDiff = windowBlurredAt ? Date.now() - windowBlurredAt : 0;
    windowBlurredAt = null;
    if (
      typeof document === "undefined" ||
      document.visibilityState === "visible"
    ) {
      const hiddenDiff = pageHiddenAt ? Date.now() - pageHiddenAt : 0;
      if (pageHiddenAt) pageHiddenAt = null;
      syncConnectionOnResume(Math.max(hiddenDiff, blurDiff));
    }
  });

  window.addEventListener("pageshow", (event) => {
    if (event?.persisted) {
      pageHiddenAt = null;
      windowBlurredAt = null;
      syncConnectionOnResume(15000, true);
    }
  });

  window.addEventListener("online", () => {
    pageHiddenAt = null;
    windowBlurredAt = null;
    syncConnectionOnResume(15000, true);
  });

  // Catch OS sleep/wakeups AND stalled foreground live-odds feeds (silent TCP stalls)
  let lastHeartbeatTickAt = Date.now();
  setInterval(() => {
    const now = Date.now();
    const delta = now - lastHeartbeatTickAt;
    lastHeartbeatTickAt = now;
    const isVisible =
      typeof document === "undefined" || document.visibilityState === "visible";
    if (!isVisible) return;

    if (delta > 15000) {
      syncConnectionOnResume(delta, true);
      return;
    }

    if (
      hasPeriodicLiveOddsSubscription() &&
      now - lastLiveOddsPacketAt >= 7500
    ) {
      verifySocketAliveOrReconnect();
    }
  }, 4000);
}

socket.on("disconnect", (reason) => {
  clearSyncAckTimer();
  clearAllAuraDeliveryTimers();
  console.log("Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  const message = error?.message || "Socket connection failed";
  if (message === lastConnectErrorMessage) return;
  lastConnectErrorMessage = message;

  console.error("Connection error:", message);
  safeDispatch(setMatchesError({ sport: "all", error: message }));
  safeDispatch(setMarketOddsError(message));
});

// ==================== MATCH UPDATES ====================
socket.on("matchUpdate", (data) => {
  const lockState = safeGetState()?.locks || {};
  const locks = lockState.matchLocks || {};
  const isReady = lockState.ready;

  if (!isReady) return;

  if (data.matches && data.sport) {
    const matchesArray = Array.isArray(data.matches) ? data.matches : [];

    const filteredMatches = matchesArray.filter((match) => {
      const matchId = match.eventId;
      return !locks[matchId];
    });

    safeDispatch(
      updateMatches({
        sport: data.sport,
        data: { data: filteredMatches },
      }),
    );
    return;
  }

  if (data?.eventId && data?.eventType) {
    const sport = data.sport || "unknown";

    if (data.matches) {
      const matchesArray = Array.isArray(data.matches) ? data.matches : [];

      const filteredMatches = matchesArray.filter((match) => {
        const matchId = match.eventId;
        return !locks[matchId];
      });

      safeDispatch(
        updateMatches({
          sport,
          data: { data: filteredMatches },
        }),
      );
    }
  }
});

// ==================== NEW AURA UNIVERSE LISTENERS ====================
socket.on("auraEventsUpdate", (data) => {
  const lockState = safeGetState()?.locks || {};
  const locks = lockState.matchLocks || {};

  if (data?.events) {
    const eventsArray = Array.isArray(data.events) ? data.events : [];

    const filteredEvents = eventsArray.filter((event) => {
      const matchId = event.eventId || event.exEventId || event.id;
      return !locks[matchId];
    });

    const sportMap = {
      4: "cricket",
      1: "soccer",
      2: "tennis",
      7: "horse",
      4339: "greyhound",
      8: "kabaddi",
      7522: "basketball",
      1002: "basketball",
    };

    const sportIdStr = String(data.sportId);
    const sport = sportMap[sportIdStr] || "unknown";

    safeDispatch(
      updateAuraMatches({
        sport,
        data: {
          data: filteredEvents,
        },
      }),
    );

    // Save to auraSportsEvents in localStorage (matching original site)
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem("auraSportsEvents");
        const parsed = raw ? JSON.parse(raw) : { eventsBySport: {} };
        parsed.at = Date.now();
        if (!parsed.eventsBySport) parsed.eventsBySport = {};
        parsed.eventsBySport[sportIdStr] = filteredEvents;
        window.localStorage.setItem("auraSportsEvents", JSON.stringify(parsed));
      }
    } catch (e) {
      // ignore
    }
  }
});

socket.on("auraOddsUpdate", (data) => {
  if (data?.oddsData && data?.exEventId) {
    const id = String(data.exEventId);
    const isActiveEvent = Array.from(activeSubscriptions.auraOdds.values()).some(
      (sub) => String(sub?.exEventId) === id,
    );
    if (isActiveEvent) {
      lastLiveOddsPacketAt = Date.now();
    }
    clearAuraDeliveryTimersForEvent(id);
    setAuraOddsCache(id, data.oddsData);
    safeDispatch(
      setAuraOddsData({
        exEventId: id,
        oddsData: data.oddsData,
      }),
    );
  }
});

socket.on("auraStateUpdate", (data) => {
  if (data?.state) {
    // TODO: jab auraStateSlice bane to yahan dispatch karna
    // safeDispatch(setAuraStateData({ ...data }));
  }
});

// ==================== MARKET ODDS ====================
socket.on("marketOddsUpdate", (data) => {
  if (Array.isArray(data?.marketOdds)) {
    lastLiveOddsPacketAt = Date.now();
    const sport = data.sport || "unknown";

    const lockState = safeGetState()?.locks || {};
    const marketLocks = lockState.marketLocks || EMPTY_LOCK_GROUPS;

    const lockedMarketIds = getFlattenedLockIds(marketLocks);

    const filteredMarketOdds = data.marketOdds.filter((market) => {
      const marketId = String(market.marketId);
      return !lockedMarketIds.has(marketId);
    });

    safeDispatch(
      setMarketOddsData({
        data: { data: filteredMarketOdds },
        sport,
      }),
    );
  }
});

socket.on("auramarketOddsUpdate", (data) => {
  if (data.auraMarketOdds) {
    lastLiveOddsPacketAt = Date.now();
    const sport = data.sport || "unknown";
    safeDispatch(
      setMarketOddsData({ data: { data: data.auraMarketOdds }, sport }),
    );
  }
});

// ==================== BOOKMAKER ====================
socket.on("bookmakerUpdate", (data) => {
  if (data.bookmakerOdds) {
    lastLiveOddsPacketAt = Date.now();
    const sport = data.sport || "unknown";
    safeDispatch(
      setBookmakerData({
        data: data.bookmakerOdds,
        sport,
        matchId: data.matchId || null,
      }),
    );
  }
});

socket.on("auraBookmakerUpdate", (data) => {
  if (data.auraBookmakerOdds) {
    lastLiveOddsPacketAt = Date.now();
    const sport = data.sport || "unknown";
    safeDispatch(
      setBookmakerData({
        data: data.auraBookmakerOdds,
        sport,
        matchId: data.matchId || null,
      }),
    );
  }
});

// ==================== FANCY ODDS ====================
socket.on("fancyOddsUpdate", (data) => {
  if (Array.isArray(data?.fancyOdds)) {
    lastLiveOddsPacketAt = Date.now();
    const sport = data.sport || "unknown";

    const lockState = safeGetState()?.locks || {};
    const fancyLocks = lockState.fancyLocks || EMPTY_LOCK_GROUPS;

    const lockedSelectionIds = getFlattenedLockIds(fancyLocks);

    const filteredFancyOdds = data.fancyOdds.filter((item) => {
      const selectionId = String(item.SelectionId);
      return !lockedSelectionIds.has(selectionId);
    });

    safeDispatch(
      setFancyOddsData({
        data: filteredFancyOdds,
        sport,
        matchId: data?.matchId || null,
      }),
    );
  }
});

// ==================== HORSE ====================
socket.on("horseMatchesUpdate", (data) => {
  if (activeSubscriptions.horseMatches && data.status && data.data) {
    safeDispatch(updateHorseSlice({ horseRaceList: data?.data?.t1 }));
  }
});

socket.on("horseOddsUpdate", (data) => {
  if (data.horseOdds?.data?.length > 0) {
    const gmid = data.horseOdds.data[0].gmid;
    if (activeSubscriptions.horseOdds.has(gmid.toString())) {
      lastLiveOddsPacketAt = Date.now();
      safeDispatch(updateHorseMarket({ gmid, odds: data.horseOdds.data }));
    }
  }
});

// ==================== GREYHOUND ====================
socket.on("greyhoundMatchesUpdate", (data) => {
  const raceList = data?.data?.t1 || data?.data || data?.t1;
  if (activeSubscriptions.greyhoundMatches && raceList) {
    safeDispatch(updateGreyhoundSlice({ greyhoundRaceList: raceList }));
  }
});

socket.on("greyhoundOddsUpdate", (data) => {
  if (data.greyhoundOdds?.data?.length > 0) {
    const gmid = data.greyhoundOdds.data[0].gmid;
    if (activeSubscriptions.greyhoundOdds.has(gmid.toString())) {
      lastLiveOddsPacketAt = Date.now();
      safeDispatch(
        updateGreyhoundMarket({ gmid, odds: data.greyhoundOdds.data }),
      );
    }
  }
});

// ==================== KABADDI ====================
socket.on("kabaddiMatchesUpdate", (data) => {
  if (activeSubscriptions.kabaddiMatches && data?.kabaddiMatches) {
    safeDispatch(updatekabaddiSlice({ kabaddiList: data.kabaddiMatches }));
  }
});

socket.on("kabaddiOddsUpdate", (data) => {
  if (data?.kabaddiOdds?.length > 0) {
    const gmid = data.kabaddiOdds[0].gmid;
    if (activeSubscriptions.kabaddiOdds.has(gmid.toString())) {
      lastLiveOddsPacketAt = Date.now();
      safeDispatch(updateKabaddiMarket({ gmid, odds: data.kabaddiOdds }));
    }
  }
});

// ==================== DIAMOND CASINO ====================
socket.on("diamondCasinoOddsUpdate", (data) => {
  if (data?.diamondCasinoOdds) {
    const odds = data.diamondCasinoOdds;
    const candidateGmids = [
      data?.gmid,
      data?.matchId && data.matchId !== "casino" ? data.matchId : null,
      data?.eventId && data.eventId !== "casino" ? data.eventId : null,
      odds?.eventId,
      odds?.gmid,
      odds?.data?.eventId,
      odds?.data?.gmid,
    ]
      .filter((v) => v !== undefined && v !== null && v !== "")
      .map(String);

    // Cache latest odds for instantaneous zero-latency table switches
    candidateGmids.forEach((id) => {
      casinoOddsMemoryCache.set(id, odds);
    });

    // Guard: Only process packets for the currently active subscribed diamond casino game
    if (activeSubscriptions.diamondCasino.size > 0) {
      const activeKey = String(
        activeSubscriptions.diamondCasino.keys().next().value || "",
      );
      if (activeKey && candidateGmids.length > 0) {
        const matches = candidateGmids.some(
          (id) =>
            id === activeKey ||
            id.includes(activeKey) ||
            activeKey.includes(id),
        );
        if (!matches) {
          return;
        }
      }
      lastLiveOddsPacketAt = Date.now();
    }
    safeDispatch(setDiamondCasinoOddsData({ data: odds }));
  } else if (data?.message) {
    safeDispatch(setDiamondCasinoOddsError(data.message));
  }
});

// ==================== PROFILE & MY BETS ====================
socket.on("ProfileUpdated", (data) => {
  if (activeSubscriptions.profileRoom && data) {
    safeDispatch(setUserData(data));
    safeDispatch(updateProfileData(data));
  }
});

socket.on("myBetsUpdate", (data) => {
  if (activeSubscriptions.myBets) {
    const reversedData = Array.isArray(data?.data)
      ? [...data.data].reverse()
      : [];
    safeDispatch(addMatchBetsData(reversedData));
    safeDispatch(addBet(reversedData));
  }
});

// Global error
socket.on("error", (error) => {
  console.error("Socket error:", error.message);
});

// ==================== RESUBSCRIBE ON RECONNECT ====================
const resubscribeAll = () => {
  if (isResubscribing || !socket.connected) return;
  isResubscribing = true;

  try {
    console.log("Resubscribing all active channels...");

    activeSubscriptions.matches.forEach((params) => {
      socket.emit("subscribeToMatches", {
        eventId: params.eventId,
        eventType: params.eventType,
      });
    });

    activeSubscriptions.marketOdds.forEach((params) => {
      socket.emit("subscribeToMarketOdds", params);
    });

    activeSubscriptions.auraMarketOdds.forEach((params) => {
      socket.emit("subscribeToAuraMarketOdds", params);
    });

    activeSubscriptions.bookmaker.forEach((params) => {
      socket.emit("subscribeToBookmaker", params);
    });

    activeSubscriptions.auraBookmaker.forEach((params) => {
      socket.emit("subscribeToAuraBookmaker", params);
    });

    activeSubscriptions.fancyOdds.forEach((params) => {
      socket.emit("subscribeToFancyOdds", params);
    });

    if (activeSubscriptions.horseMatches) {
      socket.emit("subscribeToHourseMatches");
    }

    activeSubscriptions.horseOdds.forEach((params) =>
      socket.emit("subscribeToHourseOdds", params),
    );

    if (activeSubscriptions.greyhoundMatches) {
      socket.emit("subscribeToGreyhoundMatches");
    }

    activeSubscriptions.greyhoundOdds.forEach((params) =>
      socket.emit("subscribeToGreyHoundOdds", params),
    );

    if (activeSubscriptions.kabaddiMatches) {
      socket.emit("subscribeToKabaddiMatches", { eventId: "8" });
    }

    activeSubscriptions.kabaddiOdds.forEach((params) =>
      socket.emit("subscribeToKabaddiOdds", params),
    );

    activeSubscriptions.diamondCasino.forEach((params) =>
      socket.emit("subscribeToDiamondCasinoOdds", params),
    );

    // ---- New Aura Universe ----
    activeSubscriptions.auraEvents.forEach((params) => {
      socket.emit("subscribeToAuraEvents", { sportId: params.sportId });
    });

    activeSubscriptions.auraOdds.forEach((params, key) => {
      socket.emit("subscribeToAuraOdds", {
        sportId: params.sportId,
        exEventId: params.exEventId,
      });
      scheduleAuraOddsDeliveryCheck(key);
    });

    activeSubscriptions.auraState.forEach((params) => {
      socket.emit("subscribeToAuraState", {
        sportId: params.sportId,
        exEventId: params.exEventId,
      });
    });

    if (activeSubscriptions.profileRoom) {
      socket.emit("joinProfileRoom", activeSubscriptions.profileRoom);
    }

    if (activeSubscriptions.myBets) {
      socket.emit("joinMyBets", activeSubscriptions.myBets);
    }
  } finally {
    isResubscribing = false;
  }
};

// ==================== SUBSCRIPTION FUNCTIONS ====================

// ---- New Aura Universe ----
const auraEventRefCounts = new Map();

export const subscribeToAuraEventsData = ({ sportId }) => {
  const key = String(sportId);
  const nextCount = (auraEventRefCounts.get(key) || 0) + 1;
  auraEventRefCounts.set(key, nextCount);
  activeSubscriptions.auraEvents.set(key, { sportId });

  if (nextCount === 1 && socket.connected) {
    socket.emit("subscribeToAuraEvents", { sportId });
  }

  return () => {
    const remaining = (auraEventRefCounts.get(key) || 1) - 1;
    if (remaining <= 0) {
      auraEventRefCounts.delete(key);
      activeSubscriptions.auraEvents.delete(key);
      if (socket.connected) {
        socket.emit("unsubscribeFromAuraEvents", { sportId });
      }
    } else {
      auraEventRefCounts.set(key, remaining);
    }
  };
};

const prefetchedAuraTimers = new Map();
const MAX_CONCURRENT_AURA_PREFETCHES = 2;

const cleanupPrefetchedAuraKey = (key, emitUnsubscribe = true) => {
  const entry = prefetchedAuraTimers.get(key);
  if (!entry) return;
  clearTimeout(entry.timer);
  prefetchedAuraTimers.delete(key);
  if (emitUnsubscribe && !activeSubscriptions.auraOdds.has(key) && socket.connected) {
    socket.emit("unsubscribeFromAuraOdds", {
      sportId: entry.sportId,
      exEventId: entry.exEventId,
    });
  }
};

export const prefetchAuraOddsData = ({ sportId, exEventId }) => {
  if (!sportId || !exEventId || !socket.connected) return;
  const key = `${sportId}-${exEventId}`;
  const idStr = String(exEventId);

  // If already an active viewing subscription, skip
  if (activeSubscriptions.auraOdds.has(key)) return;

  const existingCache = auraOddsMemoryCache.get(idStr);
  // If cache is fresh within 15 seconds, memory is already warm
  if (
    existingCache &&
    existingCache._cachedAt &&
    Date.now() - existingCache._cachedAt < 15000
  ) {
    return;
  }

  // A pending prefetch already owns this event; do not emit duplicate
  // subscribe packets on repeated mouseenter/hover events.
  if (prefetchedAuraTimers.has(key)) return;

  // Keep prefetch fan-out bounded so scrolling/list load never floods the socket
  while (prefetchedAuraTimers.size >= MAX_CONCURRENT_AURA_PREFETCHES) {
    const oldestKey = prefetchedAuraTimers.keys().next().value;
    if (!oldestKey) break;
    cleanupPrefetchedAuraKey(oldestKey, true);
  }

  // Pre-subscribe: Server pushes real live odds into auraOddsUpdate -> memory cache
  socket.emit("subscribeToAuraOdds", { sportId, exEventId });

  // Auto-unsubscribe after 10 seconds if user never clicked / navigated
  const timer = setTimeout(() => {
    prefetchedAuraTimers.delete(key);
    if (!activeSubscriptions.auraOdds.has(key) && socket.connected) {
      socket.emit("unsubscribeFromAuraOdds", { sportId, exEventId });
    }
  }, 10000);

  prefetchedAuraTimers.set(key, { sportId, exEventId, timer });
};

export const subscribeToAuraOddsData = ({ sportId, exEventId }) => {
  const newKey = `${sportId}-${exEventId}`;

  // Clear this match's prefetch timer if any, and immediately close all other pending prefetches
  for (const existingPrefetchKey of Array.from(prefetchedAuraTimers.keys())) {
    if (existingPrefetchKey === newKey) {
      const entry = prefetchedAuraTimers.get(existingPrefetchKey);
      if (entry?.timer) clearTimeout(entry.timer);
      prefetchedAuraTimers.delete(existingPrefetchKey);
    } else {
      cleanupPrefetchedAuraKey(existingPrefetchKey, true);
    }
  }

  // Enforce single active stream: cleanup any other active aura odds streams
  activeSubscriptions.auraOdds.forEach((val, existingKey) => {
    if (existingKey !== newKey) {
      clearAuraDeliveryTimer(existingKey);
      activeSubscriptions.auraOdds.delete(existingKey);
      if (socket.connected) {
        socket.emit("unsubscribeFromAuraOdds", {
          sportId: val.sportId,
          exEventId: val.exEventId,
        });
      }
    }
  });

  activeSubscriptions.auraOdds.set(newKey, { sportId, exEventId });
  lastLiveOddsPacketAt = Date.now();
  scheduleAuraOddsDeliveryCheck(newKey);
  if (socket.connected) {
    socket.emit("subscribeToAuraOdds", { sportId, exEventId });
  } else {
    socket.connect();
  }

  return () => {
    clearAuraDeliveryTimer(newKey);
    activeSubscriptions.auraOdds.delete(newKey);
    if (socket.connected) {
      socket.emit("unsubscribeFromAuraOdds", { sportId, exEventId });
    }
  };
};

export const subscribeToAuraStateData = ({ sportId, exEventId }) => {
  const key = `${sportId}-${exEventId}`;
  activeSubscriptions.auraState.set(key, { sportId, exEventId });
  if (socket.connected) {
    socket.emit("subscribeToAuraState", { sportId, exEventId });
  }

  return () => {
    activeSubscriptions.auraState.delete(key);
    if (socket.connected) {
      socket.emit("unsubscribeFromAuraState", { sportId, exEventId });
    }
  };
};

// ---- Existing ----
export const subscribeToMatchData = ({
  eventId,
  eventType,
  sport = "unknown",
}) => {
  const key = `${eventId}-${eventType}`;
  activeSubscriptions.matches.set(key, { eventId, eventType, sport });

  safeDispatch(setMatchesLoading({ sport }));
  socket.emit("subscribeToMatches", { eventId, eventType });

  return () => {
    activeSubscriptions.matches.delete(key);
    socket.emit("unsubscribeFromMatches", { eventId });
  };
};

export const subscribeToMarketOddsData = ({
  eventId,
  eventType,
  competitionId,
  matchId,
  marketId,
  sport = "unknown",
}) => {
  const key = `${eventId}-${marketId}`;
  const params = { eventId, eventType, competitionId, matchId, marketId };

  activeSubscriptions.marketOdds.set(key, { ...params, sport });
  safeDispatch(setMarketOddsLoading());
  socket.emit("subscribeToMarketOdds", params);

  fetchMatchLockDetails(matchId);

  return () => {
    activeSubscriptions.marketOdds.delete(key);
    socket.emit("unsubscribeFromMarketOdds", { eventId, marketId });
  };
};

export const subscribeToAuraMarketOddsData = ({
  eventId,
  eventType,
  competitionId,
  matchId,
  marketId,
  sport = "unknown",
}) => {
  const key = `${eventId}-${marketId}`;
  const params = { eventId, eventType, competitionId, matchId, marketId };

  activeSubscriptions.auraMarketOdds.set(key, { ...params, sport });
  safeDispatch(setMarketOddsLoading());
  socket.emit("subscribeToAuraMarketOdds", params);

  return () => {
    activeSubscriptions.auraMarketOdds.delete(key);
    socket.emit("unsubscribeFromAuraMarketOdds", { eventId, marketId });
  };
};

export const subscribeToLeaveMyBets = () => {
  const userId = safeGetState()?.user?.userData?._id;
  if (!userId) return;

  activeSubscriptions.myBets = null;
  socket.emit("leaveMyBets", userId);
  // Keep the module-level myBetsUpdate listener registered. It checks
  // activeSubscriptions.myBets before dispatching and is shared by the app.
};

export const subscribeToBookmakerData = ({
  eventId,
  eventType,
  competitionId,
  sport = "unknown",
}) => {
  const key = `${eventId}`;
  const params = { eventId, eventType, competitionId };

  activeSubscriptions.bookmaker.set(key, { ...params, sport });
  safeDispatch(setBookmakerLoading());
  socket.emit("subscribeToBookmaker", params);

  return () => {
    activeSubscriptions.bookmaker.delete(key);
    socket.emit("unsubscribeFromBookmaker", { eventId });
  };
};

export const subscribeToAuraBookmakerData = ({
  eventId,
  eventType,
  competitionId,
  sport = "unknown",
}) => {
  const key = `${eventId}`;
  const params = { eventId, eventType, competitionId };

  activeSubscriptions.auraBookmaker.set(key, { ...params, sport });
  safeDispatch(setBookmakerLoading());
  socket.emit("subscribeToAuraBookmaker", params);

  return () => {
    activeSubscriptions.auraBookmaker.delete(key);
    socket.emit("unsubscribeFromAuraBookmaker", { eventId });
  };
};

export const subscribeToFancyOddsData = ({
  eventId,
  eventType,
  competitionId,
  sport = "unknown",
}) => {
  const key = `${eventId}`;
  const params = { eventId, eventType, competitionId };

  activeSubscriptions.fancyOdds.set(key, { ...params, sport });
  safeDispatch(setFancyOddsLoading());
  socket.emit("subscribeToFancyOdds", params);

  return () => {
    activeSubscriptions.fancyOdds.delete(key);
    socket.emit("unsubscribeFromFancyOdds", { eventId });
  };
};

export const subscribeToHorseMatchesData = () => {
  activeSubscriptions.horseMatches = true;
  socket.emit("subscribeToHourseMatches");

  return () => {
    activeSubscriptions.horseMatches = false;
    socket.emit("unsubscribeFromHourseMatches", {});
  };
};

export const subscribeToHourseOddsData = ({ eventId, eventType, gmid }) => {
  const key = `${gmid}`;
  activeSubscriptions.horseOdds.set(key, { eventId, eventType, gmid });
  socket.emit("subscribeToHourseOdds", { eventId, eventType, gmid });

  return () => {
    activeSubscriptions.horseOdds.delete(key);
    socket.emit("unsubscribeFromHourseOdds", { eventId, gmid });
  };
};

export const subscribeToGreyhoundMatchesData = () => {
  activeSubscriptions.greyhoundMatches = true;
  socket.emit("subscribeToGreyhoundMatches");

  return () => {
    activeSubscriptions.greyhoundMatches = false;
  };
};

export const subscribeToGreyHoundOddsData = ({ eventId, eventType, gmid }) => {
  const key = `${gmid}`;
  activeSubscriptions.greyhoundOdds.set(key, { eventId, eventType, gmid });
  socket.emit("subscribeToGreyHoundOdds", { eventId, eventType, gmid });

  return () => {
    activeSubscriptions.greyhoundOdds.delete(key);
    socket.emit("unsubscribeFromGreyHoundOdds", { eventId, gmid });
  };
};

export const subscribeToKabaddiMatchesData = () => {
  activeSubscriptions.kabaddiMatches = true;
  socket.emit("subscribeToKabaddiMatches", { eventId: "8" });

  return () => {
    activeSubscriptions.kabaddiMatches = false;
  };
};

export const subscribeToKabaddiMatchesDataOdds = (gmid) => {
  const key = `${gmid}`;
  activeSubscriptions.kabaddiOdds.set(key, {
    eventId: "8",
    eventType: "kabaddi",
    gmid,
  });
  socket.emit("subscribeToKabaddiOdds", {
    eventId: "8",
    eventType: "kabaddi",
    gmid,
  });

  return () => {
    activeSubscriptions.kabaddiOdds.delete(key);
    socket.emit("unsubscribeFromKabaddiOdds", { gmid });
  };
};

export const subscribeToDiamondCasinoOddsData = ({
  eventId,
  eventType,
  gmid,
}) => {
  const actualId = String(gmid || eventId || "");
  const key = actualId;

  // Ensure only one active diamond casino subscription exists at any time
  if (activeSubscriptions.diamondCasino.size > 0) {
    for (const oldKey of Array.from(activeSubscriptions.diamondCasino.keys())) {
      if (oldKey !== key) {
        activeSubscriptions.diamondCasino.delete(oldKey);
        socket.emit("unsubscribeFromDiamondCasinoOdds", { gmid: oldKey });
      }
    }
  }

  activeSubscriptions.diamondCasino.set(key, {
    eventId: actualId,
    eventType: eventType || "casino",
    gmid: actualId,
  });
  safeDispatch(setDiamondCasinoOddsLoading());
  socket.emit("subscribeToDiamondCasinoOdds", {
    eventId: actualId,
    eventType: eventType || "casino",
    gmid: actualId,
  });

  return () => {
    activeSubscriptions.diamondCasino.delete(key);
    socket.emit("unsubscribeFromDiamondCasinoOdds", { gmid: actualId });
  };
};

export const subscribeToJoinProfileRoom = (currentUserId) => {
  activeSubscriptions.profileRoom = currentUserId;
  socket.emit("joinProfileRoom", currentUserId);

  return () => {
    activeSubscriptions.profileRoom = null;
    socket.emit("profile_disconnect");
  };
};

export const subscribeToJoinMyBets = () => {
  const userId = safeGetState()?.user?.userData?._id;
  if (!userId) return () => { };

  activeSubscriptions.myBets = userId;
  socket.emit("joinMyBets", userId);

  return () => {
    activeSubscriptions.myBets = null;
    socket.emit("leaveMyBets", userId);
  };
};

// ==================== MANUAL UNSUBSCRIBE EXPORTS ====================
export const unsubscribeFromMatches = (eventId) => {
  activeSubscriptions.matches.forEach((value, key) => {
    if (value.eventId === eventId) {
      activeSubscriptions.matches.delete(key);
    }
  });
  socket.emit("unsubscribeFromMatches", { eventId });
};

export const unsubscribeFromMarketOdds = (eventId, marketId) => {
  const key = `${eventId}-${marketId}`;
  activeSubscriptions.marketOdds.delete(key);
  socket.emit("unsubscribeFromMarketOdds", { eventId, marketId });
};

export const unsubscribeFromAuraMarketOdds = (eventId, marketId) => {
  const key = `${eventId}-${marketId}`;
  activeSubscriptions.auraMarketOdds.delete(key);
  socket.emit("unsubscribeFromAuraMarketOdds", { eventId, marketId });
};

export const unsubscribeFromBookmaker = (eventId) => {
  activeSubscriptions.bookmaker.delete(`${eventId}`);
  socket.emit("unsubscribeFromBookmaker", { eventId });
};

export const unsubscribeFromAuraBookmaker = (eventId) => {
  activeSubscriptions.auraBookmaker.delete(`${eventId}`);
  socket.emit("unsubscribeFromAuraBookmaker", { eventId });
};

export const unsubscribeFromFancyOdds = (eventId) => {
  activeSubscriptions.fancyOdds.delete(`${eventId}`);
  socket.emit("unsubscribeFromFancyOdds", { eventId });
};

export const unsubscribeFromHourseOdds = (gmid) => {
  activeSubscriptions.horseOdds.delete(`${gmid}`);
  socket.emit("unsubscribeFromHourseOdds", { gmid });
};

export const unsubscribeFromGreyHoundOdds = (gmid) => {
  activeSubscriptions.greyhoundOdds.delete(`${gmid}`);
  socket.emit("unsubscribeFromGreyHoundOdds", { gmid });
};

export const unsubscribeFromKabaddiOdds = (gmid) => {
  activeSubscriptions.kabaddiOdds.delete(`${gmid}`);
  socket.emit("unsubscribeFromKabaddiOdds", { gmid });
};

export const unsubscribeFromDiamondCasinoOdds = (gmid) => {
  activeSubscriptions.diamondCasino.delete(`${gmid}`);
  socket.emit("unsubscribeFromDiamondCasinoOdds", { gmid });
};

// ---- New Aura Universe unsubscribes ----
export const unsubscribeFromAuraEvents = (sportId) => {
  const key = String(sportId);
  auraEventRefCounts.delete(key);
  activeSubscriptions.auraEvents.delete(key);
  if (socket.connected) {
    socket.emit("unsubscribeFromAuraEvents", { sportId });
  }
};

export const unsubscribeFromAuraOdds = (sportId, exEventId) => {
  const key = `${sportId}-${exEventId}`;
  clearAuraDeliveryTimer(key);
  activeSubscriptions.auraOdds.delete(key);
  if (socket.connected) {
    socket.emit("unsubscribeFromAuraOdds", { sportId, exEventId });
  }
};

export const unsubscribeFromAuraState = (sportId, exEventId) => {
  const key = `${sportId}-${exEventId}`;
  activeSubscriptions.auraState.delete(key);
  if (socket.connected) {
    socket.emit("unsubscribeFromAuraState", { sportId, exEventId });
  }
};

export const setUserOnline = (userId) =>
  socket.emit("userOnline", { currentUserId: userId });

export const setUserOffline = (userId) =>
  socket.emit("userOffline", { currentUserId: userId });

export const placeBet = async (betData) => {
  const oddsLimits = {
    Cricket: 10,
    Soccer: 10,
    Tennis: 10,
    "Horse Racing": 10,
  };

  const limit = oddsLimits[betData.sportsName];

  if (
    limit &&
    String(betData.type).toLowerCase() === "lay" &&
    betData.markettype == "Match Odds" &&
    betData.oddsReq > limit
  ) {
    // toast.error(`Max odds allowed: ${limit}`);
    toast.error(
      createElement(ExposureToast, {
        type: "error",
        subtitle: "We do not accept bet above rate 10.00",
      }),
    );
    return;
  }

  const state = store?.getState();
  const {
    minBet: globalMin,
    maxBet: globalMax,
    sports,
  } = state?.betSettingsSlice?.betSettings || {};
  const { ip, isp } = state?.network || {};
  const siteId = state?.site?.siteDetails?._id || "";
  const layout = state?.site?.siteDetails?.layout || "";
  const UserAvailableBalance = state?.user?.userData?.availableBalance;
  let minBet = globalMin || 50;
  let maxBet = globalMax || 500000;

  if (betData.sportsName && betData.market) {
    const sport = sports?.find((s) => s.sportName === betData.sportsName);
    if (sport) {
      const market = sport.markets?.find(
        (m) => m.marketName === betData.market,
      );
      if (market) {
        minBet = market.minBet ?? globalMin;
        maxBet = market.maxBet ?? globalMax;
      }
    }
  }

  if (UserAvailableBalance < 0) {
    toast.error("Your balance is negative. Please deposit funds.");
    return Promise.reject();
  }

  const _id = localStorage?.getItem("userId") || "";

  const finalLayout =
    betData?.isCashout === true
      ? "asianexchange"
      : window.location.host === "raftaarclub.com" ||
        window.location.host === "localhost:500"
        ? "asianexchange"
        : layout;

  // Bet placement is HTTP now. Keep the Socket.IO connection for live odds,
  // myBetsUpdate, profile updates, and the other realtime subscriptions.
  const PLACE_BET_API_ENDPOINT = "/api/v1/place";
  const payload = {
    ...betData,
    type: betData?.type?.toLowerCase()?.trim() === "lay" ? "Lay" : "Back",
    userId: _id,
    layout: finalLayout,
    siteId,
    network: {
      deviceIp: ip,
      isp,
    },
  };

  try {
    const { data: response } = await API.post(PLACE_BET_API_ENDPOINT, payload);

    // API may return either an envelope:
    //   { success: true, bet: { ... } }
    // or the saved bet document directly:
    //   { _id, status, stake, marketId, ... }
    // Normalize both shapes so PlaceBet.jsx receives a consistent response.
    const betCandidates = [
      response?.bet,
      response?.data?.bet,
      response?.data,
      response,
    ];

    const latestBet = betCandidates.find(
      (candidate) =>
        candidate &&
        typeof candidate === "object" &&
        candidate._id &&
        (candidate.stake !== undefined || candidate.selectionId !== undefined),
    );

    const isSuccess =
      response?.success === true ||
      Boolean(
        latestBet?._id && response?.success !== false && !response?.error,
      );

    if (!isSuccess) {
      return {
        ...(response && typeof response === "object" ? response : {}),
        success: false,
        message:
          response?.message || response?.error || "Bet placement failed.",
      };
    }

    if (latestBet?._id) {
      const currentState = safeGetState();
      const betId = String(latestBet._id);
      const sameBet = (item) => String(item?._id ?? "") === betId;

      // Market P/L reads state.account.bets. Keep this list updated immediately
      // from the saved API response instead of waiting for myBetsUpdate.
      const currentAccountBets = Array.isArray(currentState?.account?.bets)
        ? currentState.account.bets
        : [];
      const nextAccountBets = [
        latestBet,
        ...currentAccountBets.filter((item) => !sameBet(item)),
      ];
      safeDispatch(addBet(nextAccountBets));

      // Other bet widgets read state.bets. Update that list immediately too.
      const betsState = currentState?.bets;
      const currentMatchBets = Array.isArray(betsState)
        ? betsState
        : Array.isArray(betsState?.bets)
          ? betsState.bets
          : Array.isArray(betsState?.data)
            ? betsState.data
            : Array.isArray(betsState?.data?.bets)
              ? betsState.data.bets
              : [];
      const nextMatchBets = [
        latestBet,
        ...currentMatchBets.filter((item) => !sameBet(item)),
      ];
      safeDispatch(addMatchBetsData(nextMatchBets));

      // Keep the latest-bet selector in sync as well.
      // safeDispatch(addLatestBet(latestBet));
    }

    // The sample API document uses balanceAfterBet/exposureAfterBet, while
    // older API responses may use userData.availableBalance/exposure.
    const availableBalance =
      response?.userData?.availableBalance ??
      response?.data?.userData?.availableBalance ??
      response?.balanceAfterBet ??
      latestBet?.balanceAfterBet;
    const exposure =
      response?.exposure ??
      response?.data?.exposure ??
      response?.exposureAfterBet ??
      latestBet?.exposureAfterBet;

    return {
      ...(response && typeof response === "object" ? response : {}),
      success: true,
      statusCode: response?.statusCode ?? 200,
      ...(latestBet ? { bet: latestBet } : {}),
      userData: {
        ...(response?.userData || response?.data?.userData || {}),
        ...(availableBalance !== undefined ? { availableBalance } : {}),
      },
      ...(exposure !== undefined ? { exposure } : {}),
    };
  } catch (error) {
    const apiResponse = error?.response?.data;
    if (apiResponse) return apiResponse;

    console.error("Place bet API error:", error);
    throw error;
  }
};

export const generatePresignedUrlFromS3Url = (s3Url) => {
  const urlStr =
    typeof s3Url === "object" && s3Url !== null ? s3Url?.url : s3Url;
  if (typeof urlStr !== "string" || !urlStr.trim()) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    socket.emit("generatePresignedUrlFromS3Url", urlStr, (response) => {
      if (response?.status === "success") resolve(response.data);
      else resolve(null);
    });
  });
};

export const subscribeToLogin = (payload) => {
  return new Promise((resolve) => {
    const domainId =
      safeGetState()?.site?.siteDetails?.domainDetails?._id || "";
    socket.emit("login", { ...payload, domainid: domainId }, (response) => {
      resolve(response);
    });
  });
};

let latestBallByBallState = null;

export function subscribeToBallByBall({ onState, onUpdate, onError } = {}) {
  // Emit memory-cached state immediately (0ms) so UI renders instantly without waiting for network roundtrip
  if (latestBallByBallState) {
    try {
      onState?.(latestBallByBallState);
    } catch (e) {
      console.error("[subscribeToBallByBall cache err]", e);
    }
  }

  const handleState = (payload) => {
    latestBallByBallState = payload;
    onState?.(payload);
  };
  const handleUpdate = (payload) => {
    if (latestBallByBallState && payload?.round) {
      latestBallByBallState = {
        ...latestBallByBallState,
        round: payload.round,
      };
    }
    onUpdate?.(payload);
  };
  const handleError = (payload) => onError?.(payload);

  socket.on("ballbyball:state", handleState);
  socket.on("ballbyball:update", handleUpdate);
  socket.on("ballbyball:error", handleError);
  socket.emit("ballbyball:subscribe");

  return () => {
    socket.off("ballbyball:state", handleState);
    socket.off("ballbyball:update", handleUpdate);
    socket.off("ballbyball:error", handleError);
  };
}

export default socket;
