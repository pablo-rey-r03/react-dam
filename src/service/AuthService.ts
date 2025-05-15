import type LoginDTO from "../model/dto/LoginDTO"
import type LoginResponse from "../model/dto/LoginResponse"
import {API} from "../axios"

export const login = async (data: LoginDTO): Promise<LoginResponse> => {
  return (await API.post<LoginResponse>("/auth/login", data)).data;
}