"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  apiFetch,
  refreshSession,
  setAccessToken,
  type AuthResponse,
  type User,
} from "@/lib/api";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type RegisterInput = { name: string; email: string; password: string };

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // On page load the access token is gone (it was only in memory),
  // so ask for a new one with the refresh cookie. No cookie = not logged in.
  useEffect(() => {
    let active = true;
    refreshSession().then((session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setStatus(session ? "authenticated" : "anonymous");
    });
    return () => {
      active = false;
    };
  }, []);

  function startSession(session: AuthResponse) {
    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus("authenticated");
  }

  async function login(email: string, password: string) {
    const session = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    startSession(session);
  }

  async function register(input: RegisterInput) {
    const session = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    startSession(session);
  }

  async function logout() {
    try {
      await apiFetch<void>("/api/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("anonymous");
    }
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}