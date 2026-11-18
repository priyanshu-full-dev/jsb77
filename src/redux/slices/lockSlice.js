import { createSlice } from "@reduxjs/toolkit";

const lockSlice = createSlice({
  name: "locks",
  initialState: {
    matchLocks: {},      // 🔥 global match locks
    marketLocks: {},     // 🔥 per match market locks
    fancyLocks: {},      // 🔥 per match fancy locks
    ready: false,
  },
  reducers: {
    setMatchLocks: (state, action) => {
      state.matchLocks = action.payload;
      state.ready = true;
    },

    setMarketLocks: (state, action) => {
      const { matchId, data } = action.payload;
      state.marketLocks[matchId] = data;
    },

    setFancyLocks: (state, action) => {
      const { matchId, data } = action.payload;
      state.fancyLocks[matchId] = data;
    },
  },
});

export const {
  setMatchLocks,
  setMarketLocks,
  setFancyLocks,
} = lockSlice.actions;

export default lockSlice.reducer;