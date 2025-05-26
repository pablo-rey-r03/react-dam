import { API_URL } from "../config";
import type Company from "../model/Company";
import type CompanyDTO from "../model/dto/CompanyDTO";
import type SubcontractingRelationshipDTO from "../model/dto/SubcontractingRelationshipDTO";
import type ErrorMessage from "../model/msg/ErrorMessage";
import type ResponseEntity from "../model/msg/ResponseEntity";
import type SubcontractingRelationship from "../model/SubcontractingRelationship";

const COMPANY_API = API_URL + "/company";

export const getAllCompanies = async (): Promise<Company[] | undefined> => {
    const res = await fetch(`${COMPANY_API}`, {
        method: "GET"
    });

    if (res.status == 204) {
        return;
    } else if (res.status == 200) {
        return (await res.json()) as Company[];
    } else {
        const error: ErrorMessage = await res.json();
        throw error;
    }
}

export const getSubcontractsRelationshipByContractorId = async (id: number): Promise<SubcontractingRelationship[] | undefined> => {
    const res = await fetch(`${COMPANY_API}/${id}/hires`, {
        method: "GET",
        headers: {
            authorization: "Bearer " + localStorage.getItem("token")
        }
    });

    if (res.status == 204) {
        return;
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

export const updateSubcontractRelationship = async (contId: number, subId: number, dto: SubcontractingRelationshipDTO) => {
    const res = await fetch(`${COMPANY_API}/${contId}/hires/${subId}`, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dto)
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as ResponseEntity<SubcontractingRelationship>;
}

export const deleteSubcontractRelationship = async (contId: number, subId: number) => {
    const res = await fetch(`${COMPANY_API}/${contId}/fires/${subId}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
        }
    });

    if (res.status === 204) {
        return;
    }

    if (res.ok) {
        return;
    }

    const error: ErrorMessage = await res.json();
    throw error;
}

export const createSubcontractRelationship = async (contId: number, subId: number, dto: SubcontractingRelationshipDTO): Promise<ResponseEntity<SubcontractingRelationship>> => {
    const res = await fetch(`${COMPANY_API}/${contId}/hires/${subId}`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dto)
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as ResponseEntity<SubcontractingRelationship>;
}

export const createCompany = async (dto: CompanyDTO): Promise<ResponseEntity<Company>> => {
    const res = await fetch(`${COMPANY_API}`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dto)
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as ResponseEntity<Company>;
}