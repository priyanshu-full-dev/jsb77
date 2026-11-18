import { useEffect, useState, useMemo, useRef, Suspense } from "react";

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
import { KuberBook333Router } from "./KuberBook333Src/KuberBook333Routes";
import PageSkeleton from "./Kuberbook666/components/Loader/PageSkeleton";

/* =========================================================
   ROUTER LOADERS
========================================================= */

const routerLoaders = {
  playbangla: () =>
    import("./MahadevExchSrc/MahadevExchRoutes").then(
      (module) => module.MahadevExchRouter,
    ),

  kuberbook666: () =>
    import("./Kuberbook666/Kuberbook666Routes").then(
      (module) => module.Kuberbook666Router,
    ),

  kuberbook333: () =>
    import("./KuberBook333Src/KuberBook333Routes").then(
      (module) => module.KuberBook333Router,
    ),

  asianexchange: () =>
    import("./KuberBook333Src/KuberBook333Routes").then(
      (module) => module.KuberBook333Router,
    ),

  npr: () =>
    import("./NprSrc/NprRoutes").then(
      (module) => module.NprRouter,
    ),
};

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

      domainDetails:
        rawData.siteDetails?.domainDetails || rawData.domainDetails,

      admindomainName:
        rawData.siteDetails?.admindomainName || rawData.admindomainName,

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
     SITE DETAILS FROM LOCAL STORAGE
  --------------------------------------------------------- */

  const [siteDetails, setSiteDetailsState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("siteDetails")) || {};
    } catch {
      return {};
    }
  });

  /* ---------------------------------------------------------
     SELECTED ROUTER
  --------------------------------------------------------- */

  const [SelectedRouter, setSelectedRouter] = useState(null);

  /* ---------------------------------------------------------
     DOMAIN
  --------------------------------------------------------- */

  const domainName = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlDomain = searchParams.get("domain");
    if (urlDomain) return urlDomain;

    const envDomain = import.meta.env.VITE_SITE_DOMAIN;
    if (envDomain) return envDomain;

    return window.location.host.includes("localhost") ||
      window.location.host.includes("127.0.0.1") ||
      window.location.host.includes("vercel.app")
      ? "asianexchange.club"
      : window.location.host;
  }, []);

  /* =========================================================
     LOAD ROUTER USING siteDetails.layout
  ========================================================= */

  useEffect(() => {
    let active = true;

    const loadRouter = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const urlLayout =
        searchParams.get("project") || searchParams.get("layout");
      const isPort5177 =
        window.location.port === "5177" ||
        window.location.host.includes("5177");
      const domainLayout =
        domainName.toLowerCase().includes("npr") || isPort5177 ? "npr" : null;
      const layout = urlLayout || domainLayout || siteDetails?.layout;

      if (!layout) {
        return;
      }

      try {
        const normalizedLayout = String(layout).toLowerCase().trim();

        const loader = routerLoaders[normalizedLayout];

        if (!loader) {
          console.warn("No router found for layout:", normalizedLayout);

          return;
        }

        const router = await loader();

        if (active && router) {
          setSelectedRouter(router);
        }
      } catch (error) {
        console.error("Router preload failed:", error);
      }
    };

    loadRouter();

    return () => {
      active = false;
    };
  }, [domainName, siteDetails?.layout]);

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
        console.log({details});
        

        if (details && mountedRef.current) {
          /* ---------------------------------------------
             Redux
          --------------------------------------------- */

          dispatch(setSiteDetails(details));

          /* ---------------------------------------------
             Local State
          --------------------------------------------- */

          setSiteDetailsState(details);

          /* ---------------------------------------------
             Local Storage
          --------------------------------------------- */

          localStorage.setItem("siteDetails", JSON.stringify(details));

          /* ---------------------------------------------
             PRELOAD ROUTER
          --------------------------------------------- */

          const layout = details?.layout?.toLowerCase()?.trim();

          if (layout && routerLoaders[layout]) {
            routerLoaders[layout]().catch((error) => {
              console.error("Router preload error:", error);
            });
          }

          /* ---------------------------------------------
             META DATA
          --------------------------------------------- */

          await fetchSiteMetaData(details?._id);

          /* ---------------------------------------------
             META PIXEL
          --------------------------------------------- */

          const pixelId = details?.meta_data?.metaPixelId;

          if (pixelId) {
            if (window.__LOADED_PIXEL_ID__ !== pixelId) {
              loadMetaPixel(pixelId);

              window.__LOADED_PIXEL_ID__ = pixelId;
            }
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
     PERIODIC SITE REFRESH
     EVERY 15 MINUTES
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

            setSiteDetailsState(details);

            localStorage.setItem("siteDetails", JSON.stringify(details));
          }
        } catch (error) {
          console.error("Refresh failed:", error);
        }
      };

      /* Run immediately */
      refresh();

      /* Then every 15 minutes */
      intervalId = setInterval(refresh, 900000);
    };

    /* Wait for complete page load */

    if (document.readyState === "complete") {
      startRefresh();
    } else {
      window.addEventListener("load", startRefresh, {
        once: true,
      });
    }

    return () => {
      active = false;

      if (intervalId) {
        clearInterval(intervalId);
      }

      window.removeEventListener("load", startRefresh);
    };
  }, [dispatch, domainName]);

  /* =========================================================
     NETWORK DETAILS
     EVERY 15 MINUTES
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
     UI & FINAL ROUTER (NPR77)
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
