import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  type AuthResponse,
  clearAuth,
  getStoredAuth,
  login as apiLogin,
  logout as apiLogout,
  restoreSession,
} from "../lib/api";
import { AuthContext } from "./authContextState";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthResponse | null>(() => getStoredAuth());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    restoreSession()
      .then((session) => {
        if (!ignore) setAuth(session);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    const syncAuth = () => setAuth(getStoredAuth());
    window.addEventListener("edukos-auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      ignore = true;
      window.removeEventListener("edukos-auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setAuth(response);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      clearAuth();
    }
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
