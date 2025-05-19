import { API_URL } from "../config";
import type Company from "../model/Company";
import type ErrorMessage from "../model/msg/ErrorMessage";

const COMPANY_API = API_URL + "/company";

export const getAllCompanies = async (): Promise<Company[]> => {
    const res = await fetch(`${COMPANY_API}`, {
        method: "GET"
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw new Error(await error?.detail ?? "Error al obtener las empresas");
    }

    return (await res.json()) as Company[];
}