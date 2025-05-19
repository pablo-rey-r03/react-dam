import { API_URL } from "../config"
import type LoginDTO from "../model/dto/LoginDTO"
import type LoginResponse from "../model/dto/LoginResponse"

const AUTH_API = API_URL + "/auth"

export const login = async (data: LoginDTO): Promise<LoginResponse> => {
  const res = await fetch(`${AUTH_API}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(await error?.message ?? "Error en el inicio de sesión.");
    
  }
  return (await res.json()) as LoginResponse;
}