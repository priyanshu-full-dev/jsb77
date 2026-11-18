import { io } from "socket.io-client";
import { updateAuraMatches } from "./redux/slices/auraMatchesSlice";
import store from "./redux/store";

export const socket = io("https://uni.exchange24x7.live", {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export const subscribeToAuraMatches = ({
  sportId,
  eventType = null,
  onUpdate,
}) => {
  const subscribe = () => {
    socket.emit("subscribeToAuraMatches", {
      eventId: sportId,
      eventType,
    });
  };

  if (socket.connected) {
    subscribe();
  } else {
    socket.once("connect", subscribe);
  }

  const handler = (data) => {
    const lockState = store.getState()?.locks || {};
    const locks = lockState.matchLocks || {};

    const sportMap = {
      4: "cricket",
      1: "soccer",
      2: "tennis",
    };

    const sport =
      data?.sport ||
      sportMap[String(data?.eventType)] ||
      sportMap[String(eventType)];

    if (data?.matches) {
      const matchesArray = Array.isArray(data.matches) ? data.matches : [];

      const filteredMatches = matchesArray.filter((match) => {
        const matchId = match.eventId;
        return !locks[matchId];
      });

      store.dispatch(
        updateAuraMatches({
          sport,
          data: {
            data: filteredMatches,
          },
        }),
      );
    }

    onUpdate?.(data);
  };

  socket.on("auraMatchUpdate", handler);

  return () => {
    socket.emit("unsubscribeFromAuraMatches", {
      eventId: sportId,
    });

    socket.off("auraMatchUpdate", handler);
  };
};

export const subscribeToAuraOdds = ({
  eventId,
  eventType,
  competitionId,
  matchId,
  marketId,
  sport,
  onUpdate,
}) => {
  const payload = {
    eventId,
    eventType,
    competitionId,
    matchId,
    marketId,
    sport,
  };

  const subscribe = () => {
    socket.emit("subscribeToAuraOdds", payload);
  };

  if (socket.connected) {
    subscribe();
  } else {
    socket.once("connect", subscribe);
  }

  const handler = (data) => {
    onUpdate?.(data);
  };

  socket.on("auraOddsUpdate", handler);

  return () => {
    socket.emit("unsubscribeFromAuraOdds", payload);

    socket.off("auraOddsUpdate", handler);
  };
};

/* -------------------------------------------------------------------------- */
/*                               GAME SOCKET (NEW)                            */
/* -------------------------------------------------------------------------- */

export const subscribeToGame = ({
  eventId,
  sessionToken,
  onState,
  onResults,
  onAck,
  onDisconnect,
}) => {
  if (!eventId || !sessionToken) return () => {};

  let ws;
  let reconnectTimer;
  let closedByUser = false;

  const connect = () => {
    ws = new WebSocket(
      `wss://universeapi.shop/public/ws?eventId=${encodeURIComponent(
        eventId
      )}&sessionToken=${encodeURIComponent(sessionToken)}`
    );

    ws.onopen = () => {
      console.log("✅ Game WebSocket Connected");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "subscribed":
            onAck?.(message);
            break;

          case "state":
            // backend sends:
            // { type: "state", data: {...} }
            onState?.(message.data ?? message);
            break;

          case "results":
            onResults?.(message.data ?? message);
            break;

          default:
            console.log("Game WS:", message);
            break;
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("Game WS Error:", err);
    };

    ws.onclose = (event) => {
      console.log("❌ Game WebSocket Closed");

      onDisconnect?.(event);

      if (!closedByUser) {
        reconnectTimer = setTimeout(connect, 1000);
      }
    };
  };

  connect();

  return () => {
    closedByUser = true;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    if (ws) {
      ws.close();
    }
  };
};