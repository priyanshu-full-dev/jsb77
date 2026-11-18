import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import {
  selectSiteHeaderColor,
  selectSiteBanners,
} from "../../../../utils/helper/commonSelectors";

import News from "../News";
import TopHeader from "./TopHeader";
import TopNav from "./TopNav";

import RaftaarHeader from "../Raftaar/Header";
import {
  generatePresignedUrl,
  formatS3PathStyle,
} from "../../../../utils/helper/generatePresignedUrl";
import BannerSlider from "../Banner";

function Header() {
  const location = useLocation();

  const headerColor = useSelector(selectSiteHeaderColor());

  const loginType = useSelector(
    (state) => state.user.loggedInType
  );

  // ==============================
  // GET BANNERS FROM REDUX
  // ==============================
  const siteBanners = useSelector(selectSiteBanners());

  const getInitialBanners = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = localStorage.getItem("site_banners_cache");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.data) && parsed.data.length > 0) {
            return parsed.data.map((b) => ({
              ...b,
              url: formatS3PathStyle(b?.url || b),
            }));
          }
        }
        const fallbackRaw = localStorage.getItem("siteBanners");
        if (fallbackRaw) {
          const parsed = JSON.parse(fallbackRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((b) => ({
              ...b,
              url: formatS3PathStyle(b?.url || b),
            }));
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return [];
  };

  const [banners, setBanners] = useState(getInitialBanners);
  const [loading, setLoading] = useState(false);

  // ==============================
  // FETCH BANNERS
  // ==============================
  const fetchBanners = async () => {
    try {
      setLoading(true);

      const cacheKey = "siteBanners";
      const cacheTimeKey = "siteBannersTimestamp";

      const now = Date.now();

      let cachedBanners = null;
      let cachedTime = null;

      // ==============================
      // READ LOCAL STORAGE
      // ==============================
      try {
        const rawSiteBannersCache = localStorage.getItem("site_banners_cache");
        if (rawSiteBannersCache) {
          const parsedCache = JSON.parse(rawSiteBannersCache);
          if (Array.isArray(parsedCache?.data) && parsedCache.data.length > 0) {
            cachedBanners = JSON.stringify(parsedCache.data);
            cachedTime = String(parsedCache.timestamp || now);
          }
        }
        if (!cachedBanners) {
          cachedBanners = localStorage.getItem(cacheKey);
          cachedTime = localStorage.getItem(cacheTimeKey);
        }
      } catch (err) {
        console.warn("localStorage read error:", err);
      }

      // ==============================
      // CACHE EXPIRE - 10 MIN
      // ==============================
      const expired =
        !cachedTime ||
        now - parseInt(cachedTime || "0", 10) >
        10 * 60 * 1000;

      // ==============================
      // USE CACHE
      // ==============================
      if (cachedBanners && !expired) {
        try {
          const parsed = JSON.parse(cachedBanners);

          if (Array.isArray(parsed) && parsed.length > 0) {
            setBanners(parsed);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn(
            "Cached banners JSON parse failed:",
            err
          );
        }
      }

      // ==============================
      // GET BANNERS FROM REDUX
      // ==============================
      if (
        Array.isArray(siteBanners) &&
        siteBanners.length > 0
      ) {
        const bannersWithPresignedUrls =
          await Promise.all(
            siteBanners.map(async (banner) => {
              try {
                const raw =
                  banner?.url || banner;

                if (!raw) {
                  return null;
                }

                const signedUrl =
                  await generatePresignedUrl(raw);

                return {
                  url: signedUrl || raw,
                  path: banner?.path || "",
                };
              } catch (err) {
                console.error(
                  "Presign failed for banner:",
                  banner,
                  err
                );

                return null;
              }
            })
          );

        const validBanners =
          bannersWithPresignedUrls.filter(Boolean);

        if (validBanners.length > 0) {
          setBanners(validBanners);

          // ==============================
          // SAVE CACHE
          // ==============================
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify(validBanners)
            );

            localStorage.setItem(
              cacheTimeKey,
              now.toString()
            );

            localStorage.setItem(
              "site_banners_cache",
              JSON.stringify({ data: validBanners, timestamp: now })
            );

            localStorage.setItem("gpCoinCached", "1");
          } catch (err) {
            console.warn(
              "localStorage write failed:",
              err
            );
          }
        }
      }
      // If siteBanners in Redux is not yet populated or empty, KEEP the cached banners!
    } catch (error) {
      console.error(
        "Error fetching banners:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // FETCH WHEN REDUX BANNERS CHANGE
  // ==============================
  useEffect(() => {
    fetchBanners();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteBanners]);

  // ==============================
  // TOP NAV HIDDEN PATHS
  // ==============================
  const hiddenPaths = [
    "/inplay",
    "/my-sports",
    "/full-market",
    "/horse-market",
    "/greyhound-market",
    "/account",
    "/myprofile",
    "/multi-market",
    "/rolling-commission",
    "/account-statement",
    "/bets-history",
    "/profit-loss",
    "/password-history",
    "/activity-log",
    "/settings",
    "/deposit",
    "/withdraw",
    "/casino",
    "/userBetHistory",
    "/vimaan",
    "/balloon"
  ];

  const hideTopNav =
    hiddenPaths.includes(location.pathname) ||
    location.pathname.startsWith("/casino") ||
    location.pathname.startsWith("/ballByBall") ||
    location.pathname.startsWith("/vimaan") ||
    location.pathname.startsWith("/balloon");

  // ==============================
  // RAFTAAR
  // ==============================
  if (window.location.host === "raftaarclub.com") {
    return (
      <div className="-mb-1">
        <RaftaarHeader />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* HEADER */}
      <TopHeader headerColor={headerColor} />

      {!hideTopNav && (
        <>
          {/* BANNER */}
          {!location.pathname.startsWith("/live-casino") &&
            banners.length > 0 && (
              <BannerSlider images={banners} />
            )}

          {/* TOP NAV */}
          <TopNav
            headerColor={headerColor}
            location={location}
          />
        </>
      )}
    </div>
  );
}

export default Header;