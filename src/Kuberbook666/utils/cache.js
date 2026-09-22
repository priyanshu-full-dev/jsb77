/**
 * Smart Client-Side Caching Strategy
 * 10-Minute Expiring Cache for static/semi-static data (configs, logos, casino catalogs, etc.)
 */

const DEFAULT_CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Get cached item if it exists and has not expired
 * @param {string} key Cache key
 * @param {number} expiryMs Optional custom expiry duration in ms
 * @returns {any|null}
 */
export const getCache = (key, expiryMs = DEFAULT_CACHE_EXPIRY) => {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const cachedData = localStorage.getItem(`kb_cache_${key}`);
    const cacheTime = localStorage.getItem(`kb_cache_${key}_time`);

    if (cachedData && cacheTime) {
      const parsedTime = parseInt(cacheTime, 10);
      if (Date.now() - parsedTime < expiryMs) {
        return JSON.parse(cachedData); // Instant load, zero network latency
      }
      // Expired, clear stale entry
      removeCache(key);
    }
  } catch (err) {
    console.warn(`Cache read error for key: ${key}`, err);
  }
  return null;
};

/**
 * Set item in cache with current timestamp
 * @param {string} key Cache key
 * @param {any} data Serializable data
 */
export const setCache = (key, data) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(`kb_cache_${key}`, JSON.stringify(data));
    localStorage.setItem(`kb_cache_${key}_time`, String(Date.now()));
  } catch (err) {
    console.warn(`Cache write error for key: ${key}`, err);
  }
};

/**
 * Remove cached item
 * @param {string} key Cache key
 */
export const removeCache = (key) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.removeItem(`kb_cache_${key}`);
    localStorage.removeItem(`kb_cache_${key}_time`);
  } catch (err) {
    console.warn(`Cache remove error for key: ${key}`, err);
  }
};

/**
 * Clear all expired caches
 */
export const clearExpiredCache = (expiryMs = DEFAULT_CACHE_EXPIRY) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("kb_cache_") && k.endsWith("_time")) {
        const timeVal = parseInt(localStorage.getItem(k) || "0", 10);
        if (now - timeVal > expiryMs) {
          const rawKey = k.replace(/^kb_cache_/, "").replace(/_time$/, "");
          removeCache(rawKey);
        }
      }
    }
  } catch (err) {
    console.warn("Error cleaning expired cache:", err);
  }
};
