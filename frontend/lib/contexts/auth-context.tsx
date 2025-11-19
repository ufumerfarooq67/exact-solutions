"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: any | null;
  login: (user?: any, token?: string) => void;
  logout: () => void;
  clearUser: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (user?: any, token?: string) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem("token", token);
    }
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const clearUser = () => {
    setUser(null);
  };

  // Effects
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Constants
  const isAdmin = user?.role === "admin";

  return <AuthContext.Provider value={{ user, login, logout, clearUser, isAdmin, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
