import API from "../api/axios";
import { setMatchLocks } from "../redux/slices/lockSlice";
import store from "../redux/store";

const sports = ["cricket", "soccer", "tennis"];

export const fetchLocksApi = async () => {
  try {
    const domainId =
      store.getState()?.site?.siteDetails?._id || "";

    let finalLockMap = {};

    const responses = await Promise.all(
      sports.map((sport) =>
        API.get(
          `https://api.professor.monster/api/v1/match-lock/list?sport=${sport}&domainId=${domainId}`
        ).catch(() => null)
      )
    );

    responses.forEach((res) => {
      const data = res?.data;

      const locksArray = Array.isArray(data?.data)
        ? data.data
        : data?.data
        ? [data.data]
        : [];

      locksArray.forEach((item) => {
        if (item.matchId && item.isMatchLocked) {
          finalLockMap[item.matchId] = true;
        }
      });
    });

    store.dispatch(setMatchLocks(finalLockMap));

    return finalLockMap;
  } catch (err) {
    console.error("Failed to fetch locks:", err);
    return {};
  }
};