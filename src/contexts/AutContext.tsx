import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type { User } from "../services/AuthService";
import {
  AUTH_STORAGE_CHANGED_EVENT,
  clearAuthenticationStorage,
} from "../utils/AuthStorage";

interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

const AUTH_KEY = "isAuthenticated";
const USER_KEY = "authenticatedUser";
const DISCOUNT_TRIGGER_KEY = "reservahub-show-discount-after-login";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_KEY) === "true",
  );

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const synchronizeLogout = () => {
      if (localStorage.getItem("token")) {
        return;
      }

      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(DISCOUNT_TRIGGER_KEY);

      setIsAuthenticated(false);
      setUser(null);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (
        (event.key === "token" && event.newValue === null) ||
        event.key === null
      ) {
        synchronizeLogout();
      }
    };

    window.addEventListener(AUTH_STORAGE_CHANGED_EVENT, synchronizeLogout);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_STORAGE_CHANGED_EVENT, synchronizeLogout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (authenticatedUser: User) => {
    localStorage.setItem(AUTH_KEY, "true");
    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    localStorage.setItem(DISCOUNT_TRIGGER_KEY, "true");

    setIsAuthenticated(true);
    setUser(authenticatedUser);

    window.dispatchEvent(new Event("reservahub:login"));
  };

  const logout = () => {
    clearAuthenticationStorage();

    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }

  return context;
};

export const resetPassword = (password: string): void => {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return;
  }

  try {
    const user = JSON.parse(storedUser) as User;

    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        ...user,
        password,
      }),
    );
  } catch {
    return;
  }
};
