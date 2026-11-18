import { createSlice } from "@reduxjs/toolkit";

const getInitialSportMatches = (sportId) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = localStorage.getItem("auraSportsEvents");
      if (raw) {
        const parsed = JSON.parse(raw);
        const events = parsed?.eventsBySport?.[String(sportId)];
        if (Array.isArray(events) && events.length > 0) {
          return {
            matches: { data: events },
            marketOdds: null,
            status: "succeeded",
            error: null,
          };
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return { matches: [], marketOdds: null, status: "idle", error: null };
};

const auraMatchesSlice = createSlice({
  name: "auramatches",

  initialState: {
    cricket: getInitialSportMatches(4),
    soccer: getInitialSportMatches(1),
    tennis: getInitialSportMatches(2),
    horse: getInitialSportMatches(7),
    greyhound: getInitialSportMatches(4339),
    basketball: getInitialSportMatches(7522),
    oddsCache: {},
  },

  reducers: {
    updateAuraMatches: (state, action) => {
      const { sport, data } = action.payload;

      if (!state[sport]) {
        state[sport] = {
          matches: { data: [] },
          marketOdds: null,
          status: "idle",
          error: null,
        };
      }
      state[sport].matches = data;
      state[sport].status = "succeeded";
    },

    updateAuraMarketOdds: (state, action) => {
      const { sport, data } = action.payload;

      if (!state[sport]) {
        state[sport] = {
          matches: { data: [] },
          marketOdds: null,
          status: "idle",
          error: null,
        };
      }
      state[sport].marketOdds = data;
      state[sport].status = "succeeded";
    },

    setAuraOddsData: (state, action) => {
      const { exEventId, oddsData } = action.payload;
      if (exEventId && oddsData) {
        const key = String(exEventId);
        if (!state.oddsCache || typeof state.oddsCache !== "object") {
          state.oddsCache = {};
        }
        // Keep Redux/IndexedDB oddsCache bounded and timestamped for TTL validation
        if (state.oddsCache[key]) {
          delete state.oddsCache[key];
        } else {
          const keys = Object.keys(state.oddsCache);
          while (keys.length >= 15) {
            const oldestKey = keys.shift();
            if (oldestKey) delete state.oddsCache[oldestKey];
          }
        }
        const now = Date.now();
        state.oddsCache[key] = Array.isArray(oddsData)
          ? Object.assign([...oddsData], { _cachedAt: now })
          : { ...oddsData, _cachedAt: now };
      }
    },
  },
});

export const { updateAuraMatches, updateAuraMarketOdds, setAuraOddsData } =
  auraMatchesSlice.actions;

export default auraMatchesSlice.reducer;
