import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("clarior-token") || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]); // unused but keeping to maintain structure if any
  const { addToast } = useToast();

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
      if (res.data.theme_preference && res.data.theme_preference !== "system") {
        localStorage.setItem("clarior-theme", res.data.theme_preference);
        document.documentElement.setAttribute("data-theme", res.data.theme_preference);
      }
    } catch (_err) {
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("clarior-token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      localStorage.removeItem("clarior-token");
      delete api.defaults.headers.common["Authorization"];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [token, fetchUser]);

  // Handle auto-logout on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          addToast("Session expired. Please log in again.", "warning");
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [logout, addToast]);

  const login = async (email, password, rememberMe) => {
    const res = await api.post("/api/auth/login", { email, password, rememberMe });
    setToken(res.data.token);
    setUser(res.data.user);
    if (rememberMe) {
      localStorage.setItem("clarior-remembered-email", email);
    } else {
      localStorage.removeItem("clarior-remembered-email");
    }
    if (res.data.user?.theme_preference && res.data.user.theme_preference !== "system") {
      localStorage.setItem("clarior-theme", res.data.user.theme_preference);
      document.documentElement.setAttribute("data-theme", res.data.user.theme_preference);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post("/api/auth/register", userData);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Refresh user data without re-login (e.g., after profile update)
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
