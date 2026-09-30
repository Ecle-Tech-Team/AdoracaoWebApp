import axios from "axios";

const options = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  withCredentials: true,
};

const api = axios.create(options);
export const authApi = axios.create(options);

let accessToken = null;
let refreshPromise = null;
let sessionVersion = 0;
const expirationListeners = new Set();
const REFRESH_LOCK_NAME = "adoracao-auth-refresh";

export function setAccessToken(token) {
  accessToken = token;
  sessionVersion += 1;
}

export function clearAccessToken() {
  accessToken = null;
  sessionVersion += 1;
}

export function onSessionExpired(listener) {
  expirationListeners.add(listener);
  return () => expirationListeners.delete(listener);
}

export function isAuthenticationError(error) {
  return axios.isAxiosError(error) && [401, 403].includes(error.response?.status);
}

async function requestRefresh(version) {
  const sendRefreshRequest = () => authApi.post("/auth/refresh");
  // Locks are scoped to the browser origin, so separate tabs cannot rotate the
  // HttpOnly refresh cookie at the same time. This module can also be imported
  // while rendering on the server, where `navigator` does not exist.
  const locks = typeof navigator === "undefined" ? null : navigator.locks;

  if (!locks?.request) {
    return sendRefreshRequest();
  }

  return locks.request(REFRESH_LOCK_NAME, { mode: "exclusive" }, () => {
    // Another local auth operation (such as login/logout) may have completed
    // while this call was waiting for the cross-tab lock. It no longer needs
    // to rotate a cookie belonging to that newer local session.
    if (version !== sessionVersion) return null;
    return sendRefreshRequest();
  });
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    const version = sessionVersion;
    refreshPromise = requestRefresh(version).then((response) => {
      if (version !== sessionVersion) {
        if (accessToken) return { accessToken };
        throw new Error("Session changed");
      }
      const data = response?.data;
      const token = data?.accessToken ?? data?.token;
      if (typeof token !== "string" || !token) {
        throw new Error("Invalid refresh response");
      }
      setAccessToken(token);
      return data;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  // Associate every request with the current in-memory session, including
  // requests sent before a token is available.
  config._authSessionVersion = sessionVersion;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || !original) {
      return Promise.reject(error);
    }
    if (original._authSessionVersion !== sessionVersion) {
      return Promise.reject(error);
    }
    if (original._authRetried) {
      clearAccessToken();
      expirationListeners.forEach((listener) => listener());
      return Promise.reject(error);
    }

    original._authRetried = true;
    try {
      await refreshAccessToken();
    } catch (refreshError) {
      // A 401 means the refresh session has expired. A 403 is an authorization
      // decision and must stay visible to the caller instead of being turned
      // into a global logout; transport errors likewise leave the session
      // untouched.
      if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
        clearAccessToken();
        expirationListeners.forEach((listener) => listener());
      }
      return Promise.reject(refreshError);
    }
    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${accessToken}`;
    return api(original);
  },
);

export default api;
