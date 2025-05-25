import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getEmployeeById } from "../service/EmployeeService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { Toast } from "primereact/toast";
import type JWTDecoded from "../model/JWTDecoded";
import type Employee from "../model/Employee";
import type Company from "../model/Company";
import { useNavigate } from "react-router-dom";
import { deleteDocById, downloadFile, getDocsByEmpId } from "../service/DocService";
import type Doc from "../model/Doc";
import { Button } from "primereact/button";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Dialog } from "primereact/dialog";
import { ValidationStates, type ValidationState } from "../model/enum/ValidationState";

export const Home: React.FC = (): ReactNode => {
    const employeeId = jwtDecode<JWTDecoded>(localStorage.getItem("token")!).employee_id;

    const [employee, setEmployee] = useState<Employee>();
    const [company, setCompany] = useState<Company>();
    const [docs, setDocs] = useState<Doc[]>();
    const [selectedDoc, setSelDoc] = useState<Doc | null>(null);
    const [showDialog, setShowDialog] = useState<boolean>(false);

    const toast = useRef<Toast>(null);
    const navigate = useNavigate();

    const StateBorderClasses: Record<ValidationState, string> = {
        OK: "!border-green-600 !hover:border-green-400",
        VA: "!border-yellow-600 !hover:border-yellow-400",
        ER: "!border-red-600 !hover:border-red-400",
        EX: "!border-amber-800 !hover:border-amber-600"
    };

    useEffect(() => {
        getEmployeeById(employeeId)
            .then(res => {
                setEmployee(res);
                setCompany(res.company);
                return getDocsByEmpId(res.id);
            })
            .then(data => {
                setDocs(data);
            })
            .catch((err: ErrorMessage) => {
                if (err.status == 204) return;
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: err.detail,
                    life: 3000
                });
            });
    }, [employeeId]);

    const handleDownload = (docId: number) => {
        downloadFile(docId)
            .catch((err: ErrorMessage) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: err.detail,
                    life: 3000
                });
            })
    }

    const handleEdit = (docId: number) => {
        navigate(`/home/formDoc/${docId}`)
    }

    const deleteDoc = (docId: number) => {
        deleteDocById(docId)
            .then(() => {
                setDocs(current => current?.filter(d => d.id !== docId));
                toast.current?.show({
                    severity: "success",
                    summary: "Documento eliminado",
                    detail: "Se ha eliminado correctamente el documento",
                    life: 3000
                });
            })
            .catch((err: ErrorMessage) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al eliminar documento",
                    detail: err.detail,
                    life: 3000
                });
            })
    }

    const confirmDelete = (e: React.MouseEvent<HTMLElement>, docId: number) => {
        confirmPopup({
            target: e.currentTarget,
            message: "¿Desea eliminar el documento?",
            acceptLabel: "Eliminar",
            rejectLabel: "Cancelar",
            icon: "pi pi-exclamation-circle",
            accept: () => deleteDoc(docId)
        });
    }

    return (
        <div className="p-6 space-y-8">
            <Toast ref={toast} />
            <ConfirmPopup />
            <h2 className="text-2xl font-semibold text-white flex items-center">
                {company ? (
                    <span className="text-purple-300">Tus documentos</span>
                ) : "Cargando..."}
                <Button
                    icon="pi pi-file-plus"
                    label="Subir documento"
                    className="p-button-success ml-4"
                    onClick={() => navigate("/home/formDoc")} />
            </h2>

            <div className="flex flex-wrap gap-4 pb-2">
                {docs && (docs.length > 0) ? docs?.map(doc => (
                    <div
                        onClick={() => {
                            setSelDoc(doc);
                            setShowDialog(true);
                        }}
                        key={doc.id}
                        className={`
                                    relative
                                    group
                                    z-0
                                    w-[250px]
                                    bg-gray-800
                                    rounded-2xl
                                    border-2
                                    ${StateBorderClasses[doc.validation_state]}
                                    pt-7
                                    pl-3
                                    pr-7
                                    pb-3
                                    m-4
                                    transform-gpu
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    hover:z-10        
                                    hover:scale-105
                                    hover:shadow-2xl
                                    shadow-lg
                                    cursor-pointer
                                `}
                    >
                        <div className="absolute top-2 right-2 flex opacity-100 transition-opacity duration-200 space-x-1 z-10">
                            <Button
                                icon="pi pi-download"
                                className="p-button-rounded p-button-sm bg-gray-500 text-white
                           hover:bg-blue-500 transition-colors m-1"
                                severity="info"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(doc.id);
                                }}
                                tooltipOptions={{ position: "bottom" }}
                            />
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-rounded p-button-sm bg-gray-500 text-white
                           hover:bg-yellow-500 transition-colors m-1"
                                severity="warning"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(doc.id);
                                }}
                                tooltipOptions={{ position: "bottom" }} />
                            <Button
                                icon="pi pi-trash"
                                className="p-button-rounded p-button-sm bg-gray-500 text-white
                           hover:bg-red-500 transition-colors m-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(e, doc.id);
                                }}
                                severity="danger"
                                tooltipOptions={{ position: "bottom" }} />
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-white truncate">{doc.name}</h3>
                        <p className="text-sm text-gray-300 truncate">{doc.contractor.name}</p>
                        {doc.additional_info && <p className="text-sm mt-1 text-gray-400 truncate">{doc.additional_info}</p>}
                    </div>
                )) : (
                    <p className="text-gray-400">No has subido documentos</p>
                )}
            </div>

            <Dialog
                header="Detalles del documento"
                visible={showDialog}
                style={{ width: "400px" }}
                onHide={() => setShowDialog(false)}>
                {selectedDoc && (
                    <div className="space-y-2 text-gray-700">
                        <p className="whitespace-normal break-words"><strong>Nombre:</strong> {selectedDoc.name}</p>
                        <p><strong>Contratista:</strong> {selectedDoc.contractor.name}</p>
                        <p><strong>Estado:</strong> {ValidationStates[selectedDoc.validation_state]}</p>
                        <p><strong>Fecha de subida:</strong> {selectedDoc.date.toString()}</p>
                        {selectedDoc.expiration_date && (
                            <p><strong>Expira:</strong> {selectedDoc.expiration_date.toString()}</p>
                        )}
                        {selectedDoc.validation_date && (
                            <p><strong>Se validó:</strong> {selectedDoc.validation_date.toString()}</p>
                        )}
                        {selectedDoc.additional_info && (
                            <p className="whitespace-normal break-words"><strong>Info adicional:</strong>
                                <br />{selectedDoc.additional_info}
                            </p>
                        )}
                        <Button
                            label="Descargar archivo adjunto"
                            icon="pi pi-download"
                            className="p-button-sm p-button-info mt-2"
                            onClick={() => {
                                downloadFile(selectedDoc.id);
                            }}
                        />
                    </div>
                )}
            </Dialog>
        </div>
    )
}