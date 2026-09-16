import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunk to fetch matches
export const fetchMatchesByEventId = createAsyncThunk(
  "matches/fetchMatchesByEventId",
  async ({ eventId, sport }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://api.professor.monster/api/v1/get-matches-by-eventid/${eventId}`
      );
      return { data: response?.data, sport };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

const ensureSportState = (state, sport) => {
  if (!sport || typeof sport !== "string") return null;
  const key = sport.trim().toLowerCase();
  if (!key) return null;
  if (!state[key]) {
    state[key] = { matches: [], status: "idle", error: null };
  }
  return state[key];
};

const matchesSlice = createSlice({
  name: "matches",
  initialState: {
    cricket: { matches: [], status: "idle", error: null },
    soccer: { matches: [], status: "idle", error: null },
    tennis: { matches: [], status: "idle", error: null },
  },
  reducers: {
    setMatchesLoading: (state, action) => {
      const { sport } = action.payload || {};
      if (sport === "all") {
        Object.keys(state).forEach((key) => {
          if (state[key]) state[key].status = "loading";
        });
        return;
      }
      const sportState = ensureSportState(state, sport);
      if (sportState) {
        sportState.status = "loading";
      }
    },
    updateMatches: (state, action) => {
      const { sport, data } = action.payload || {};
      const sportState = ensureSportState(state, sport);
      if (sportState) {
        sportState.matches = data;
        sportState.status = "succeeded";
        sportState.error = null;
      }
    },
    updateMarketOdds: (state, action) => {
      const { sport, data } = action.payload || {};
      const sportState = ensureSportState(state, sport);
      if (sportState) {
        sportState.marketOdds = data;
        sportState.status = "succeeded";
        sportState.error = null;
      }
    },
    setMatchesError: (state, action) => {
      const { sport, error } = action.payload || {};
      if (sport === "all") {
        Object.keys(state).forEach((key) => {
          if (state[key]) {
            state[key].status = "failed";
            state[key].error = error;
          }
        });
        return;
      }
      const sportState = ensureSportState(state, sport);
      if (sportState) {
        sportState.status = "failed";
        sportState.error = error;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchesByEventId.pending, (state, action) => {
        const sport = action.meta?.arg?.sport;
        const sportState = ensureSportState(state, sport);
        if (sportState) {
          sportState.status = "loading";
        }
      })
      .addCase(fetchMatchesByEventId.fulfilled, (state, action) => {
        const { sport, data } = action.payload || {};
        const sportState = ensureSportState(state, sport);
        if (sportState) {
          sportState.status = "succeeded";
          sportState.matches = data;
          sportState.error = null;
        }
      })
      .addCase(fetchMatchesByEventId.rejected, (state, action) => {
        const sport = action.meta?.arg?.sport;
        const sportState = ensureSportState(state, sport);
        if (sportState) {
          sportState.status = "failed";
          sportState.error = action.payload;
        }
      });
  },
});
export const { setMatchesLoading, updateMatches, updateMarketOdds, setMatchesError } = matchesSlice.actions;
export default matchesSlice.reducer;
