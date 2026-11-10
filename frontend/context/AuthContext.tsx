"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, unwrapApiResponse } from "@/lib/api";
import type { Owner } from "@/types";

type AuthState = {
  user: Owner | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<Owner>;
  register: (payload: { fullName: string; farmName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const response = await api.get("/auth/me");
      const owner = unwrapApiResponse<Owner | null>(response.data);
      setUser(owner ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await api.get("/auth/me");
        const owner = unwrapApiResponse<Owner | null>(response.data);
        if (active) {
          setUser(owner ?? null);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const payload = unwrapApiResponse<{ owner?: Owner }>(response.data);
    const nextUser = payload.owner ?? null;
    setUser(nextUser);
    return nextUser as Owner;
  };

  const register = async (payload: { fullName: string; farmName: string; email: string; password: string }) => {
    await api.post("/auth/register", payload);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
