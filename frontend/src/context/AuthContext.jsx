import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

// Backend response envelope is { success, message, data, metadata }.
// Token may arrive under metadata.token (recommended) or data.token,
// depending on how /auth/login was implemented — we check both.
function extractToken(payload) {
  return payload?.metadata?.token || payload?.data?.token || null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  async function login({ email, password }) {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const newToken = extractToken(res.data);
      if (!newToken) {
        throw new Error("Token tidak ditemukan pada response login");
      }
      setToken(newToken);
      const userData = res.data?.data || { email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true };
    } finally {
      setLoading(false);
    }
  }

  async function register({ name, email, password }) {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      return { success: true, data: res.data?.data };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const value = {
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
