import React, { createContext, useContext, useEffect, useState } from "react";
import type LoginDTO from "../model/dto/LoginDTO";
import * as authService from "../service/AuthService";

interface AuthContextType {
  token: string | null;
  login: (data: LoginDTO) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token)
    } else {
      localStorage.removeItem("token");
    }
  }, [token])

  const login = async (data: LoginDTO) => {
    const {token} = await authService.login(data);
    setToken(token);
  }

  const logout = () => {
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{token, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro del provider.");
  return ctx;
}