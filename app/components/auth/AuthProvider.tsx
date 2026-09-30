"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import api, {
  authApi,
  clearAccessToken,
  isAuthenticationError,
  onSessionExpired,
  refreshAccessToken,
  setAccessToken,
} from "@/app/api/api";

type User = Record<string, unknown> & { id_igreja?: number | null };
type Status = "loading" | "authenticated" | "unauthenticated" | "unavailable" | "forbidden";

type AuthContextValue = {
  status: Status;
  user: User | null;
  retry: () => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
// These values were written by the previous web login implementation.  They
// are deliberately removed after one read: profile data and access tokens do
// not belong in browser storage now that refresh is handled by an HttpOnly
// cookie.
const LEGACY_AUTH_PROFILE_KEYS = [
  "token",
  "accessToken",
  "nome",
  "typeUser",
  "id_grupo",
  "email",
  "user",
  "usuario",
  "profile",
];

function readUser(data: unknown): User | null {
  if (!data || typeof data !== "object") return null;
  const payload = data as Record<string, unknown>;
  const user = payload.user ?? payload.usuario ?? payload;
  return user && typeof user === "object" && !Array.isArray(user)
    ? user as User
    : null;
}

function consumeLegacyToken(): string | null {
  try {
    const token = sessionStorage.getItem("token");
    LEGACY_AUTH_PROFILE_KEYS.forEach((key) => sessionStorage.removeItem(key));
    return token;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);
  const legacyToken = useRef<string | null>(null);
  const bootstrapped = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);
  const operation = useRef(0);

  const retry = useCallback(async () => {
    const currentOperation = ++operation.current;
    setStatus("loading");
    try {
      await refreshAccessToken();
      const { data } = await api.get("/auth/me");
      const currentUser = readUser(data);
      if (!currentUser) throw new Error("Invalid user response");
      if (currentOperation !== operation.current) return;
      legacyToken.current = null;
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401 && legacyToken.current) {
        try {
          const { data } = await authApi.get("/auth/me", {
            headers: { Authorization: `Bearer ${legacyToken.current}` },
          });
          const currentUser = readUser(data);
          if (!currentUser) throw new Error("Invalid user response");
          if (currentOperation !== operation.current) return;
          setAccessToken(legacyToken.current);
          legacyToken.current = null;
          setUser(currentUser);
          setStatus("authenticated");
          return;
        } catch (legacyError) {
          if (currentOperation !== operation.current) return;
          if (!isAuthenticationError(legacyError)) {
            setStatus("unavailable");
            return;
          }
          legacyToken.current = null;
        }
      }

      if (currentOperation !== operation.current) return;
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setStatus("forbidden");
      } else if (isAuthenticationError(error)) {
        clearAccessToken();
        setUser(null);
        setStatus("unauthenticated");
      } else {
        setStatus("unavailable");
      }
    }
  }, []);

  useEffect(() => {
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      legacyToken.current = consumeLegacyToken();
      void retry();
    }

    const unsubscribe = onSessionExpired(() => {
      operation.current += 1;
      legacyToken.current = null;
      setUser(null);
      setStatus("unauthenticated");
    });

    if (typeof BroadcastChannel !== "undefined") {
      channel.current = new BroadcastChannel("adoracao-auth");
      channel.current.onmessage = (event) => {
        if (event.data === "logout") {
          operation.current += 1;
          legacyToken.current = null;
          clearAccessToken();
          setUser(null);
          setStatus("unauthenticated");
        }
      };
    }

    return () => {
      unsubscribe();
      channel.current?.close();
      channel.current = null;
    };
  }, [retry]);

  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const { data } = await authApi.post("/login", {
      email,
      password,
      clientType: "web",
      rememberMe,
    });
    const token = data?.accessToken ?? data?.token;
    const currentUser = readUser(data?.user ?? data?.usuario);
    if (typeof token !== "string" || !token || !currentUser) {
      throw new Error("Invalid login response");
    }
    operation.current += 1;
    setAccessToken(token);
    setUser(currentUser);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.post("/auth/logout");
    } catch (error) {
      // If the server has already invalidated the refresh cookie, the local
      // session must still end. A transport failure is different: keep the
      // session visible so the user can retry without losing an active flow.
      if (!isAuthenticationError(error)) throw error;
    }
    operation.current += 1;
    legacyToken.current = null;
    clearAccessToken();
    setUser(null);
    setStatus("unauthenticated");
    channel.current?.postMessage("logout");
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, retry, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
