import { API_URL } from "../config";
import type Company from "../model/Company";
import type ErrorMessage from "../model/msg/ErrorMessage";
import type SubcontractingRelationship from "../model/SubcontractingRelationship";

const COMPANY_API = API_URL + "/company";

export const getAllCompanies = async (): Promise<Company[]> => {
    const res = await fetch(`${COMPANY_API}`, {
        method: "GET"
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as Company[];
}

export const getSubcontractsRelationshipByContractorId = async (id: number): Promise<SubcontractingRelationship[]> => {
    const res = await fetch(`${COMPANY_API}/${id}/hires`, {
        method: "GET",
        headers: {
            authorization: "Bearer " + localStorage.getItem("token")
        }
    });

    if (res.status == 204) {
        const error: ErrorMessage = { status: 204, error: "No hay relaciones", detail: "No hay subcontratas para la empresa dada", stack: "" };
        throw error;
    } else if (res.status == 200) {
        return (await res.json()) as SubcontractingRelationship[];
    } else {
        const error: ErrorMessage = await res.json();
        throw error;
    }
}

export const getSubcontractsRelationshipBySubcontractId = async (id: number): Promise<SubcontractingRelationship[]> => {
    const res = await fetch(`${COMPANY_API}/${id}/ishired`, {
        method: "GET",
        headers: {
            authorization: "Bearer " + localStorage.getItem("token")
        }
    });

    if (res.status == 204) {
        const error: ErrorMessage = { status: 204, error: "No hay relaciones", detail: "No hay contratistas para la subcontrata dada", stack: "" };
        throw error;
    } else if (res.status == 200) {
        return (await res.json()) as SubcontractingRelationship[];
    } else {
        const error: ErrorMessage = await res.json();
        throw error;
    }
}