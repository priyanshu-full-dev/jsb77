import API from "../../api/axios";
import { setFancyLocks, setMarketLocks } from "../../redux/slices/lockSlice";
import store from "../../redux/store";

export const fetchMatchLockDetails = async (matchId) => {


  try {
    const domainId = store.getState()?.site?.siteDetails?._id || "";

    const { data } = await API.get(
      `https://api.professor.monster/api/v1/match-lock/${matchId}?domainId=${domainId}`,
    );


    const lockData = data?.data || {};

    const marketLocks = {};
    (lockData.matchOddsLocks || []).forEach((mid) => {
      marketLocks[mid] = true;
    });

    const fancyLocks = {};
    (lockData.fancyLocks || []).forEach((sid) => {
      fancyLocks[sid] = true;
    });

    store.dispatch(setMarketLocks({ matchId, data: marketLocks }));
    store.dispatch(setFancyLocks({ matchId, data: fancyLocks }));

    return { marketLocks, fancyLocks };
  } catch (err) {
    console.error("Match lock error:", err);
    return { marketLocks: {}, fancyLocks: {} };
  }
};
