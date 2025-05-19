import { API_URL } from "../config"
import type LoginDTO from "../model/dto/LoginDTO"
import type RegisterDTO from "../model/dto/RegisterDTO"
import type Employee from "../model/Employee"
import type ErrorMessage from "../model/msg/ErrorMessage"
import type LoginResponse from "../model/msg/LoginResponse"
import type ResponseEntity from "../model/msg/ResponseEntity"

const AUTH_API = API_URL + "/auth"

export const login = async (data: LoginDTO): Promise<LoginResponse> => {
    const res = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }
    return (await res.json()) as LoginResponse;
}

export const register = async (data: RegisterDTO): Promise<ResponseEntity<Employee>> => {
    const res = await fetch(`${AUTH_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as ResponseEntity<Employee>;
}