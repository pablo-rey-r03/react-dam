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
            "Authorization": "Bearer " + localStorage.getItem("token")
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

export const getDocsBySubId = async (id: number): Promise<Doc[] | undefined> => {
    const res = await fetch(`${DOC_API}/sub/${id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    });

    if (res.status == 204) {
        return;
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
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
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
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")

        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as ResponseEntity<Doc>;
}

export const addFile = async (id: number, file: File): Promise<ResponseEntity<Doc>> => {
    const form = new FormData();
    form.append("file", file, file.name);

    const res = await fetch(`${DOC_API}/${id}`, {
        method: "POST",
        headers: {
            authorization: "Bearer " + localStorage.getItem("token")
        },
        body: form
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as ResponseEntity<Doc>;
}

export const downloadFile = async (docId: number): Promise<void> => {
    const res = await fetch(`${DOC_API}/${docId}/file`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    // Obtenemos la respuesta como blob
    const blob = await res.blob();

    const contentDisp = res.headers.get("Content-Disposition") || "";
    const match = /filename="?([^"]+)"?/.exec(contentDisp);
    if (!match || !match[1]) {
        const error: ErrorMessage = { status: 204, error: "Error en la descarga", detail: "No se ha recibido el nombre de fichero desde el servidor", stack: "" };
        throw error;
    }
    const filename = match[1];

    // Causamos la descarga del archivo (generando un enlace invisible)
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

export const deleteDocById = async (id: number): Promise<void> => {
    const res = await fetch(`${DOC_API}/${id}`, {
        method: "DELETE",
        headers: {
            authorization: "Bearer " + localStorage.getItem("token")
        }
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    };
}

export const getFileBlob = async (docId: number): Promise<Blob> => {
    const res = await fetch(`${DOC_API}/${docId}/file`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    });

    if (!res.ok) {
        const err: ErrorMessage = await res.json();
        throw err;
    }

    return await res.blob();
}