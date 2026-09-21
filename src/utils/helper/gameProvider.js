import axios from "axios";

// Global in-memory cache & deduplication promise
let _cachedRawCasinos = null;
let _cachedDomainId = null;
let _lastFetchTime = 0;
let _fetchPromise = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache

// Synchronous getter for instant 0ms component initialization
export const getCachedCasinoData = () => {
  if (_cachedRawCasinos && Array.isArray(_cachedRawCasinos) && _cachedRawCasinos.length > 0) {
    return _cachedRawCasinos;
  }
  try {
    const fromSession = sessionStorage.getItem("cached_casino_data");
    if (fromSession) {
      const parsed = JSON.parse(fromSession);
      if (Array.isArray(parsed?.data) && parsed.data.length > 0) {
        _cachedRawCasinos = parsed.data;
        _lastFetchTime = parsed.time || Date.now();
        return _cachedRawCasinos;
      }
    }
  } catch {
    // ignore sessionStorage errors
  }
  return [];
};

// Asynchronous fetcher with deduplication & caching
export const fetchCasinoData = async (domainId, forceRefresh = false) => {
  const now = Date.now();

  // 1. Return in-memory cache if valid and not forced
  if (
    !forceRefresh &&
    _cachedRawCasinos &&
    Array.isArray(_cachedRawCasinos) &&
    _cachedRawCasinos.length > 0 &&
    now - _lastFetchTime < CACHE_TTL
  ) {
    return _cachedRawCasinos;
  }

  // 2. Reuse in-flight fetch promise to prevent duplicate concurrent network calls
  if (_fetchPromise) {
    return _fetchPromise;
  }

  // 3. Initiate single network request
  _fetchPromise = (async () => {
    try {
      let rawList = [];
      const urlWithDomain = domainId
        ? `https://api.professor.monster/api/int/getIntCasinos?domainId=${domainId}`
        : "https://api.professor.monster/api/int/getIntCasinos";

      try {
        const response = await axios.get(urlWithDomain, { timeout: 15000 });
        rawList = response?.data || [];
      } catch (err) {
        console.warn("Domain-specific casino fetch failed, trying fallback...", err);
      }

      // Fallback if empty
      if (!Array.isArray(rawList) || rawList.length === 0) {
        const fallbackRes = await axios.get(
          "https://api.professor.monster/api/int/getIntCasinos",
          { timeout: 15000 }
        );
        rawList = fallbackRes?.data || [];
      }

      if (Array.isArray(rawList) && rawList.length > 0) {
        _cachedRawCasinos = rawList;
        _cachedDomainId = domainId;
        _lastFetchTime = Date.now();

        try {
          sessionStorage.setItem(
            "cached_casino_data",
            JSON.stringify({ data: rawList, time: _lastFetchTime })
          );
        } catch {
          // ignore storage quota errors
        }
      }

      return _cachedRawCasinos || rawList || [];
    } catch (error) {
      console.error("Error fetching casino data:", error);
      return _cachedRawCasinos || [];
    } finally {
      _fetchPromise = null;
    }
  })();

  return _fetchPromise;
};
