import React, { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getEmployeeById } from "../service/EmployeeService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { Toast } from "primereact/toast";
import type JWTDecoded from "../model/JWTDecoded";
import type Employee from "../model/Employee";
import type Company from "../model/Company";
import { useNavigate } from "react-router-dom";
import { addFile, deleteDocById, downloadFile, getDocsByEmpId, getFileBlob, newDoc, updateDoc } from "../service/DocService";
import type Doc from "../model/Doc";
import { Button } from "primereact/button";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Dialog } from "primereact/dialog";
import { ValidationStates, type ValidationState } from "../model/enum/ValidationState";
import Utils from "../utils/Utils";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Message } from "primereact/message";

export const Home: React.FC = (): ReactNode => {
    const employeeId = jwtDecode<JWTDecoded>(localStorage.getItem("token")!).employee_id;
    const toast = useRef<Toast>(null);

    // Datos principales
    const [employee, setEmployee] = useState<Employee>();
    const [company, setCompany] = useState<Company>();
    const [docs, setDocs] = useState<Doc[]>();

    // Modales (detalle y formulario)
    const [selectedDoc, setSelDoc] = useState<Doc | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [showForm, setShowForm] = useState<boolean>(false);

    const navigate = useNavigate();

    // Estados del formulario
    const [contracts, setContracts] = useState<Company[]>([]);
    const [validationState, setValidationState] = useState<ValidationState>("VA");
    const [contractId, setContractId] = useState<number>(0);
    const [name, setName] = useState<string>("");
    const [date, setDate] = useState<Date>(new Date());
    const [expirationDate, setExpDate] = useState<Date | null>(null);
    const [additionalInfo, setInfo] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [fileHasChanged, setFileHasChanged] = useState<boolean>(false);

    // Estilos del borde de la card según 
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
            .then(setDocs)
            .catch((err: ErrorMessage) => {
                if (err.status != 204)
                    toast.current?.show({
                        severity: "error",
                        summary: "Error",
                        detail: err.detail,
                        life: 3000
                    });
            });
    }, [employeeId]);

    const openForm = (doc?: Doc) => {
        if (doc) {
            // Editar: precargar
            setSelDoc(doc);
            setName(doc.name);
            setContractId(doc.contractor.id);
            setDate(Utils.LocalDateToDate(doc.date));
            setExpDate(doc.expiration_date ? Utils.LocalDateToDate(doc.expiration_date) : null);
            setInfo(doc.additional_info ?? null);
            setValidationState(doc.validation_state);
            // Carga archivo existente
            getFileBlob(doc.id)
                .then(blob => setFile(new File([blob], doc.file_path ? doc.file_path.split(/[/\\]/).pop()! : "", { type: blob.type })))
                .catch(() => setFile(null));
        } else {
            // Nuevo: reset
            setSelDoc(null);
            setName("");
            setContractId(0);
            setDate(new Date());
            setExpDate(null);
            setInfo(null);
            setValidationState("VA");
            setFile(null);
        }

        setShowForm(true);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.current?.show({ severity: "error", summary: "Error", detail: "Debe adjuntar un archivo", life: 3000 });
            return;
        }
        const payload = {
            validationState,
            contractorId: contractId,
            subcontractId: employee!.company.id,
            name,
            date: Utils.DateToLocalDate(date),
            expirationDate: expirationDate ? Utils.DateToLocalDate(expirationDate) : null,
            validationDate: null,
            employeeId,
            additionalInfo
        };
        const op = selectedDoc
            ? updateDoc(selectedDoc.id, payload).then(res => selectedDoc && fileHasChanged ? addFile(selectedDoc.id, file) : res)
            : newDoc(payload).then(res => addFile(res.entity.id, file));
        op
            .then(() => {
                return getDocsByEmpId(employeeId);
            })
            .then(setDocs)
            .then(() => {
                setShowForm(false);
                toast.current?.show({ severity: "success", summary: "Guardado", detail: "Documento guardado correctamente", life: 3000 });
            })
            .catch((err: ErrorMessage) => {
                toast.current?.show({ severity: "error", summary: "Error", detail: err.detail, life: 3000 });
            });
    };

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
        <div className="p-6">
            <Toast ref={toast} />
            <ConfirmPopup />
            <h2 className="text-2xl flex items-center">
                <span className="text-purple-300">Tus documentos</span>
                <Button
                    icon="pi pi-file-plus"
                    label="Subir documento"
                    className="p-button-success ml-4"
                    onClick={() => openForm()} />
            </h2>

            <div className="flex flex-wrap gap-4">
                {docs?.map(doc => (
                    <div key={doc.id} onClick={() => openForm(doc)} className={`w-[250px] bg-gray-800 rounded-2xl border-2 ${StateBorderClasses[doc.validation_state]} p-4 cursor-pointer`}>
                        <h3 className="text-white truncate">{doc.name}</h3>
                        <p className="text-gray-300 truncate">{doc.contractor.name}</p>
                        <div className="absolute top-2 right-2 flex space-x-1">
                            <Button icon="pi pi-download" size="small" onClick={e => { e.stopPropagation(); downloadFile(doc.id); }} />
                            <Button icon="pi pi-trash" size="small" onClick={e => { e.stopPropagation(); confirmPopup({ target: e.currentTarget, message: "¿Eliminar?", accept: () => deleteDocById(doc.id).then(() => setDocs(ds => ds?.filter(d => d.id !== doc.id))) }); }} />
                        </div>
                    </div>
                ))}
            </div>

            <Dialog
                header="Detalles del documento"
                visible={showDetails}
                style={{ width: "400px" }}
                onHide={() => setShowDetails(false)}>
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

            <Dialog header={selectedDoc ? "Editar documento - " + selectedDoc.name : "Nuevo documento"} visible={showForm} style={{ width: '500px' }} onHide={() => setShowForm(false)}>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <FloatLabel className="m-5">
                        <InputText value={name} onChange={e => setName(e.target.value!)} required />
                        <label>Nombre</label>
                    </FloatLabel>
                    <FloatLabel className="m-5">
                        <Dropdown emptyMessage="Sin empresas contratistas" options={contracts} optionLabel="name" optionValue="id" value={contractId} onChange={e => setContractId(e.value)} required />
                        <label>Contratista</label>
                    </FloatLabel>
                    <FloatLabel className="m-5">
                        <Calendar value={date} onChange={e => setDate(e.value!)} showIcon required />
                        <label>Fecha</label>
                    </FloatLabel>
                    <FloatLabel className="m-5">
                        <InputTextarea value={additionalInfo || ""} onChange={e => setInfo(e.target.value!)} rows={3} />
                        <label>Info adicional</label>
                    </FloatLabel>
                    <FileUpload className="m-5" mode="basic" chooseLabel="Seleccionar archivo PDF" auto multiple={false} accept=".pdf"
                        onSelect={e => { setFile(e.files[0]); setFileHasChanged(true); }}
                        onRemove={() => setFile(null)}
                    />
                    <Message severity={file ? "info" : "warn"}
                        text={file ? file.name : "No hay archivo"} className="m-2"
                    />
                    <div className="flex justify-end space-x-2 space-y-2 m-2">
                        <Button className="m-2" label="Cancelar" onClick={() => setShowForm(false)} />
                        <Button className="m-2" label="Guardar" type="submit" />
                    </div>
                </form>
            </Dialog>
        </div>
    )
}