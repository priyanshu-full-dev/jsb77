import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getRefreshSitesByDomain,
  getSiteMetaData,
  getSitesByDomain,
} from "./api";
import { setMetaDataSettings, setSiteDetails } from "./redux/slices/siteSlice";
import { fetchNetworkDetails } from "./redux/slices/networkSlice";

import "./App.css";

import { getUserId } from "./utils/helper/commonSelectors";

import { MahadevExchRouter } from "./MahadevExchSrc/MahadevExchRoutes";
import { KuberBook333Router } from "./KuberBook333Src/KuberBook333Routes";
import { Kuberbook666Router } from "./Kuberbook666/Kuberbook666Routes";
import Loader from "./MahadevExchSrc/components/Loader/Loader";
import PageSkeleton from "./Kuberbook666/components/Loader/PageSkeleton";

const App = () => {
  const dispatch = useDispatch();
  const mountedRef = useRef(true);
  const currentUserId = useSelector(getUserId());
  const accountType = useSelector((state) => state?.account?.accountType) || "";
  // Hydrate from localStorage instantly
  const [siteDetails, setSiteDetailsState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("siteDetails")) || {};
    } catch {
      return {};
    }
  });
  const [SelectedRouter, setSelectedRouter] = useState(null);

  const domainName = useMemo(() => window.location.host, []);

  // --- Load router instantly if cached ---
  useEffect(() => {
    let active = true;
    const loadRouter = async () => {
      const layout = siteDetails?.layout;
      if (!layout) return;
      try {
        const loader = null;
        if (!loader) return;
        const router = await loader();
        if (active) setSelectedRouter(router);
      } catch (err) {
        console.error("Router preload failed:", err);
      }
    };
    loadRouter();
    return () => {
      active = false;
    };
  }, [siteDetails]);

  const fetchSiteMetaData = async (siteID) => {
    try {
      const response = await getSiteMetaData(siteID);

      if (response.success && response.data)
        dispatch(setMetaDataSettings(response.data));
    } catch {
      showToast.error("Failed to fetch site meta data.", "error", 2000);
    }
  };
  // --- Initial site fetch (background, non-blocking) ---
  useEffect(() => {
    mountedRef.current = true;
    const fetchInitial = async () => {
      try {
        const response = await getSitesByDomain(domainName);
        const details = response?.data?.siteDetails;
        if (details && mountedRef.current) {
          dispatch(setSiteDetails(details));
          setSiteDetailsState(details);
          localStorage.setItem("siteDetails", JSON.stringify(details));


          await fetchSiteMetaData(details?._id);
          if (details?.meta_data?.metaPixelId) {
            if (window.__LOADED_PIXEL_ID__ !== details.meta_data.metaPixelId) {
              loadMetaPixel(details.meta_data.metaPixelId);
              window.__LOADED_PIXEL_ID__ = details.meta_data.metaPixelId;
            }
          }
        }
      } catch (err) {
        console.error("Site fetch failed:", err);
      }
    };
    fetchInitial();
    return () => {
      mountedRef.current = false;
    };
  }, [dispatch, domainName]);

  // --- Periodic refresh (start only after full page load) ---
  useEffect(() => {
    let active = true;
    let intervalId;

    const startRefresh = () => {
      const refresh = async () => {
        try {
          const response = await getRefreshSitesByDomain(domainName);
          const details = response?.data?.siteDetails;

          if (details && active) {
            dispatch(setSiteDetails(details));
            setSiteDetailsState(details);
            localStorage.setItem("siteDetails", JSON.stringify(details));
          }
        } catch (err) {
          console.error("Refresh failed:", err);
        }
      };

      // ✅ run immediately
      refresh();

      // then every 15 minutes
      intervalId = setInterval(refresh, 900000);
    };

    // wait for full page load
    if (document.readyState === "complete") {
      startRefresh();
    } else {
      window.addEventListener("load", startRefresh, { once: true });
    }

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("load", startRefresh);
    };
  }, [dispatch, domainName]);

  // --- Poll network details every 15 min ---
  useEffect(() => {
    dispatch(fetchNetworkDetails());
    const id = setInterval(() => dispatch(fetchNetworkDetails()), 900000);
    return () => clearInterval(id);
  }, [dispatch]);

  // --- Run KuberBook333 Directly ---
  return (
    <>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={KuberBook333Router} />
      </Suspense>
    </>
  );
};

export default App;
