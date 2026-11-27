import { useEffect, useRef, Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  getRefreshSitesByDomain,
  getSiteMetaData,
  getSitesByDomain,
} from "./api";

import { setMetaDataSettings, setSiteDetails } from "./redux/slices/siteSlice";
import { fetchNetworkDetails } from "./redux/slices/networkSlice";
import "./App.css";

import { NprRouter } from "./NprSrc/NprRoutes";
import { LanguageProvider } from "./NprSrc/context/LanguageContext";
import PageSkeleton from "./CommonComponents/Loader/PageSkeleton";

/* =========================================================
   NORMALIZE SITE DETAILS
========================================================= */

const normalizeSiteDetails = (rawData) => {
  if (!rawData) return null;

  if (rawData?.siteDetails) {
    return {
      ...rawData.siteDetails,
      createdBy: rawData.createdBy || rawData.siteDetails?.createdBy,
      userRoleId: rawData.userRoleId || rawData.siteDetails?.userRoleId,
      domainDetails: rawData.siteDetails?.domainDetails || rawData.domainDetails,
      admindomainName: rawData.siteDetails?.admindomainName || rawData.admindomainName,
      siteDetails: rawData.siteDetails,
    };
  }

  return rawData;
};

/* =========================================================
   META PIXEL
========================================================= */

const loadMetaPixel = (pixelId) => {
  if (!pixelId) return;

  if (window.fbq && window.__PIXEL_ALREADY_INIT__) {
    return;
  }

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;

    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };

    if (!f._fbq) f._fbq = n;

    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];

    t = b.createElement(e);
    t.async = true;
    t.src = v;

    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js",
  );

  window.fbq("init", pixelId);
  window.__PIXEL_ALREADY_INIT__ = true;
};

/* =========================================================
   APP
========================================================= */

const App = () => {
  const dispatch = useDispatch();
  const mountedRef = useRef(true);

  /* ---------------------------------------------------------
     DOMAIN
  --------------------------------------------------------- */
  const domainName = useRef(
    (() => {
      const searchParams = new URLSearchParams(window.location.search);
      const urlDomain = searchParams.get("domain");
      if (urlDomain) return urlDomain;

      const envDomain = import.meta.env.VITE_SITE_DOMAIN;
      if (envDomain) return envDomain;

      return window.location.host.includes("localhost") ||
        window.location.host.includes("127.0.0.1") ||
        window.location.host.includes("vercel.app")
        ? "jsb77.com"
        : window.location.host;
    })()
  ).current;

  /* =========================================================
     FETCH SITE META DATA
  ========================================================= */
  const fetchSiteMetaData = async (siteID) => {
    if (!siteID) return;

    try {
      const response = await getSiteMetaData(siteID);
      if (response?.success && response?.data) {
        dispatch(setMetaDataSettings(response.data));
      }
    } catch (error) {
      console.error("Failed to fetch site meta data:", error);
    }
  };

  /* =========================================================
     INITIAL SITE FETCH
  ========================================================= */
  useEffect(() => {
    mountedRef.current = true;

    const fetchInitial = async () => {
      try {
        const response = await getSitesByDomain(domainName);
        const rawData = response?.data;
        const details = normalizeSiteDetails(rawData);

        if (details && mountedRef.current) {
          dispatch(setSiteDetails(details));
          localStorage.setItem("siteDetails", JSON.stringify(details));
          await fetchSiteMetaData(details?._id);

          const pixelId = details?.meta_data?.metaPixelId;
          if (pixelId && window.__LOADED_PIXEL_ID__ !== pixelId) {
            loadMetaPixel(pixelId);
            window.__LOADED_PIXEL_ID__ = pixelId;
          }
        }
      } catch (error) {
        console.error("Site fetch failed:", error);
      }
    };

    fetchInitial();

    return () => {
      mountedRef.current = false;
    };
  }, [dispatch, domainName]);

  /* =========================================================
     PERIODIC SITE REFRESH (EVERY 15 MINUTES)
  ========================================================= */
  useEffect(() => {
    let active = true;
    let intervalId;

    const startRefresh = () => {
      const refresh = async () => {
        try {
          const response = await getRefreshSitesByDomain(domainName);
          const rawData = response?.data;
          const details = normalizeSiteDetails(rawData);

          if (details && active) {
            dispatch(setSiteDetails(details));
            localStorage.setItem("siteDetails", JSON.stringify(details));
          }
        } catch (error) {
          console.error("Refresh failed:", error);
        }
      };

      refresh();
      intervalId = setInterval(refresh, 900000);
    };

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

  /* =========================================================
     NETWORK DETAILS (EVERY 15 MINUTES)
  ========================================================= */
  useEffect(() => {
    dispatch(fetchNetworkDetails());

    const intervalId = setInterval(() => {
      dispatch(fetchNetworkDetails());
    }, 900000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);

  /* =========================================================
     UI & FINAL ROUTER (NPR77 / JSB77)
  ========================================================= */
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LanguageProvider>
        <RouterProvider router={NprRouter} />
      </LanguageProvider>
    </Suspense>
  );
};

export default App;
