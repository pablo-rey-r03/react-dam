import { API_URL } from "../config";
import type Doc from "../model/Doc";
import type DocFormDTO from "../model/dto/DocFormDTO";
import type ErrorMessage from "../model/msg/ErrorMessage";
import type ResponseEntity from "../model/msg/ResponseEntity";

const DOC_API = API_URL + "/document";


export const getDocsByEmpId = async (id: number): Promise<Doc[]> => {
    const res = await fetch(`${DOC_API}/emp/${id}`, {
        method: "GET",
        headers: {
            authorization: "Bearer " + localStorage.getItem("token")
        }
    });

    if (res.status == 204) {
        const error: ErrorMessage = { status: 204, error: "No hay documentos", detail: "No hay documentos asociados a este empleado", stack: "" };
        throw error;
    } else if (res.status == 200) {
        return (await res.json()) as Doc[];
    } else {
        const error: ErrorMessage = await res.json();
        throw error;
    }
}

export const getDocById = async (id: number): Promise<Doc> => {
    const res = await fetch(`${DOC_API}/${id}`, {
        method: "GET",
        headers: {
            authorization: "Bearer " + localStorage.getItem("token")
        }
    });

    if (res.status == 204) {
        const error: ErrorMessage = { status: 204, error: "No hay documentos", detail: "No hay documentos con ese ID.", stack: "" };
        throw error;
    } else if (res.status == 200) {
        return (await res.json()) as Doc;
    } else {
        const error: ErrorMessage = await res.json();
        throw error;
    }
}

export const newDoc = async (data: DocFormDTO): Promise<ResponseEntity<Doc>> => {
    const res = await fetch(`${DOC_API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as ResponseEntity<Doc>;
}

export const updateDoc = async (id: number, data: DocFormDTO): Promise<ResponseEntity<Doc>> => {
    const res = await fetch(`${DOC_API}/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as ResponseEntity<Doc>;
}