import axios from "axios";
import store, { persistor } from "./../redux/store";
import { revertUser } from "../redux/slices/userSlice";
import { revertAccount } from "../redux/slices/accountSlice";
import { encryptPayload, decryptPayload } from "../utils/cryptoUtil";

export const baseUrl =
  typeof window !== "undefined" && window.location.host.includes("vercel.app")
    ? ""
    : (import.meta.env.PROD
        ? import.meta.env.VITE_API_BASE_URL_PROD
        : import.meta.env.VITE_API_BASE_URL_DEV) ||
      import.meta.env.VITE_API_BASE_URL_PROD ||
      "https://api.professor.monster";

const API = axios.create({
  baseURL: baseUrl,
  timeout: 60000,
});

/* ===============================
   🔐 ROUTES WHERE ENCRYPTION SKIP
================================ */
const SKIP_ENCRYPT_ROUTES = [
  "qt.asianexchange.club",
  "localhost:4000",
];

const shouldSkipEncryption = (url = "") =>
  SKIP_ENCRYPT_ROUTES.some((route) => url.includes(route));

/* ===============================
    REQUEST INTERCEPTOR
================================ */
API.interceptors.request.use(
  async (config) => {
    let state = {};
    try {
      state = store?.getState ? store.getState() : {};
    } catch {
      state = {};
    }

    const token = state?.user?.token || localStorage.getItem("token") || "";
    let siteObj = state.site?.siteDetails;

    if (!siteObj || !siteObj._id) {
      try {
        siteObj = JSON.parse(localStorage.getItem("siteDetails") || "{}");
      } catch {
        siteObj = {};
      }
    }

    const domainId =
      config.headers.Domainid ||
      siteObj?.domainDetails?._id ||
      siteObj?.siteDetails?.domainDetails?._id ||
      siteObj?.domain ||
      "6a85553b526a2dbeb187f070";

    const admindomainId =
      config.headers.admindomainId ||
      siteObj?.admindomainName?._id ||
      siteObj?.siteDetails?.admindomainName?._id ||
      siteObj?.ownerDomainId ||
      "6a85553b526a2dbeb187f071";

    /* ALWAYS SET HEADERS */
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers.Domainid = domainId;
    config.headers.admindomainId = admindomainId;
    config.headers.X_Panel_Type = "user";

    /* ENCRYPT BODY (except skipped routes) */
    if (
      !shouldSkipEncryption(config.url) &&
      config.data &&
      !(config.data instanceof FormData) &&
      config.method?.toLowerCase() !== "get"
    ) {
      try {
        const encrypted = await encryptPayload(JSON.stringify(config.data));
        if (encrypted) {
          config.data = { _data: encrypted };
        }
      } catch (err) {
        console.error("Encryption Error:", err);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===============================
    LOGOUT HELPER
================================ */
const handleLogout = async () => {
  try {
    if (store?.dispatch) {
      store.dispatch(revertUser());
      store.dispatch(revertAccount());
    }
    localStorage.clear();
    if (persistor?.purge) {
      await persistor.purge();
    }
    window.location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
  }
};

/* ===============================
    RESPONSE & ERROR INTERCEPTOR
================================ */
API.interceptors.response.use(
  async (response) => {
    if (shouldSkipEncryption(response.config?.url)) {
      return response;
    }

    try {
      const encryptedData =
        response?.data?._data || response?.data?.data?._data;

      if (typeof encryptedData === "string") {
        const decrypted = await decryptPayload(encryptedData);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          if (response?.data?._data) {
            response.data = parsed;
          } else if (response?.data?.data?._data) {
            response.data.data = parsed;
          }
        }
      }
    } catch (err) {
      console.error("Decryption Error:", err);
    }

    return response;
  },
  async (error) => {
    // Decrypt Error Response Body
    if (error.response) {
      try {
        const encryptedData =
          error.response?.data?._data || error.response?.data?.data?._data;

        if (typeof encryptedData === "string") {
          const decrypted = await decryptPayload(encryptedData);
          if (decrypted) {
            const parsed = JSON.parse(decrypted);
            if (error.response?.data?._data) {
              error.response.data = parsed;
            } else if (error.response?.data?.data?._data) {
              error.response.data.data = parsed;
            }
          }
        }
      } catch (err) {
        console.error("Error Decryption Failed:", err);
      }
    }

    const url = error.config?.url || "";
    const isAuthRoute =
      url.includes("/api/v1/users/getuserdata") ||
      url.includes("/api/v1/users/change-password");

    const isExcludedRoute =
      shouldSkipEncryption(url) ||
      url.includes("qtlauncher") ||
      url.includes("launcher") ||
      url.includes("asianexchange") ||
      url.includes("getIntCasinos") ||
      url.includes("casino") ||
      url.includes("/users/login") ||
      url.includes("/users/signup");

    if (
      !isExcludedRoute &&
      isAuthRoute &&
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      await handleLogout();
    }

    return Promise.reject(error);
  }
);

export default API;
