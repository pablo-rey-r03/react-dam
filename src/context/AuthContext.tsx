import { createContext, useState, type ReactNode } from "react";
import type LoginDTO from "../model/dto/LoginDTO";
import { login } from "../service/AuthService";

interface AuthContextType {
  token: string | null;
  signIn: (data: LoginDTO) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [token, setToken] = useState<string|null>(null);

  const signIn = async (data: LoginDTO) => {
    const {token} = await login(data);
    setToken(token);
    localStorage.setItem("token", token);
  }

  const signOut = () => {
    setToken(null);
    localStorage.removeItem("token");
  }
} 