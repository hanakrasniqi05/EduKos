import React, {
  createContext,
  useCallback,
  useContext,
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

type AuthContextValue = {
  auth: AuthResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
