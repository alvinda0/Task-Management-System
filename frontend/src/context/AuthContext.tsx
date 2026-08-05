import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService } from "@/services/auth.service";
import type { AuthUser, LoginPayload, RegisterPayload, RegisterResult } from "@/types/auth.types";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<{ success: boolean }>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function getTokenExpiryMs(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 - Date.now();
  } catch {
    return 0;
  }
}

function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem("token");
    if (stored && isTokenExpired(stored)) {
      clearAuthStorage();
      return null;
    }
    return stored;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("token");
    if (stored && isTokenExpired(stored)) {
      return null;
    }
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });
  const [loading, setLoading] = useState(false);

  // Auto-logout when token expires
  useEffect(() => {
    if (!token) return;

    const msUntilExpiry = getTokenExpiryMs(token);
    if (msUntilExpiry <= 0) {
      handleExpiry();
      return;
    }

    const timer = setTimeout(() => {
      handleExpiry();
    }, msUntilExpiry);

    return () => clearTimeout(timer);
  }, [token]);

  function handleExpiry() {
    setToken(null);
    setUser(null);
    clearAuthStorage();
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === "/login" || currentPath === "/register";
    if (!isAuthPage) {
      window.location.href = "/login?expired=true";
    }
  }

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  async function login(credentials: LoginPayload): Promise<{ success: boolean }> {
    setLoading(true);
    try {
      const { token: newToken, user: userData } = await authService.login(credentials);
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true };
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: RegisterPayload): Promise<RegisterResult> {
    setLoading(true);
    try {
      return await authService.register(payload);
    } finally {
      setLoading(false);
    }
  }

  function logout(): void {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const value: AuthContextValue = {
    token,
    user,
    isAuthenticated: Boolean(token),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
