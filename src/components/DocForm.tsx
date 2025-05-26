import { Toast } from "primereact/toast";
import type React from "react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type Doc from "../model/Doc";
import { getSubcontractsRelationshipBySubcontractId } from "../service/CompanyService";
import type Company from "../model/Company";
import { jwtDecode } from "jwt-decode";
import type JWTDecoded from "../model/JWTDecoded";
import { getEmployeeById } from "../service/EmployeeService";
import type Employee from "../model/Employee";
import type ErrorMessage from "../model/msg/ErrorMessage";
import type SubcontractingRelationship from "../model/SubcontractingRelationship";
import { addFile, getDocById, getFileBlob, newDoc, updateDoc } from "../service/DocService";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { type ValidationState, ValidationStates } from "../model/enum/ValidationState";
import { FloatLabel } from "primereact/floatlabel";
import type ResponseEntity from "../model/msg/ResponseEntity";
import { Message } from "primereact/message";
import Utils from "../utils/Utils";

export const DocuForm: React.FC = () => {
    const employeeId: number = jwtDecode<JWTDecoded>(localStorage.getItem("token")!).employee_id;

    const { id } = useParams<{ id: string }>();
    const isEdit: boolean = !!id;
    const [fileHasChanged, setFileHasChanged] = useState<boolean>(false);
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const [doc, setDoc] = useState<Doc>();
    const [subRels, setSubRels] = useState<SubcontractingRelationship[]>();
    const [contracts, setContracts] = useState<Company[]>([]);
    const [employee, setEmployee] = useState<Employee>();

    //CAMPOS DEL FORMULARIO
    const [validationState, setValidationState] = useState<ValidationState>("VA");
    const [contractId, setContractId] = useState<number>(0);
    const [name, setName] = useState<string>("");
    const [date, setDate] = useState<Date>(new Date());
    const [expirationDate, setExpDate] = useState<Date | null>(null);
    const [validationDate, setValDate] = useState<Date | null>(null);
    const [additionalInfo, setInfo] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        getEmployeeById(employeeId)
            .then(res => {
                setEmployee(res);
                return getSubcontractsRelationshipBySubcontractId(res.company.id);
            })
            .then(data => {
                setSubRels(data);
                const conLista = data.map((rel: SubcontractingRelationship) => rel.contractor);
                setContracts(conLista);
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

        if (isEdit && id) {
            getDocById(parseInt(id))
                .then((docRes: Doc) => {
                    console.log(docRes);
                    setDoc(docRes);
                    setName(docRes.name);
                    setContractId(docRes.contractor.id);
                    setDate(Utils.LocalDateToDate(docRes.date));
                    setExpDate(docRes.expiration_date ? Utils.LocalDateToDate(docRes.expiration_date) : null);
                    setValDate(docRes.validation_date ? Utils.LocalDateToDate(docRes.validation_date) : null);
                    setInfo(docRes.additional_info ? docRes.additional_info : null);

                    if (docRes.id) {
                        getFileBlob(docRes.id)
                            .then((res: Blob) => {
                                const filename = docRes.file_path
                                    ? docRes.file_path.split(/[/\\]/).pop()!
                                    : `documento-${docRes.id}`;

                                const existingFile = new File([res], filename, { type: res.type });
                                setFile(existingFile);
                            })
                            .catch((err: ErrorMessage) => {
                                toast.current?.show({
                                    severity: "error",
                                    summary: "Error en la carga del archivo adjunto",
                                    detail: err.detail,
                                    life: 3000
                                });
                                setFile(null);
                            })
                    }
                })
                .catch((err: ErrorMessage) => {
                    if (err.status == 204) return;
                    toast.current?.show({
                        severity: "error",
                        summary: "Error",
                        detail: err.detail,
                        life: 3000
                    });
                })
        }
    }, [employeeId, id, isEdit]);

    const STATES = Object.entries(ValidationStates).map(
        ([key, label]) => ({ label, value: key as ValidationState })
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (file) {
            if (id && isEdit) {
                updateDoc(parseInt(id), {
                    validationState: "VA",
                    contractorId: contractId,
                    subcontractId: employee!.company.id,
                    name,
                    date: Utils.DateToLocalDate(date),
                    expirationDate: expirationDate ? Utils.DateToLocalDate(expirationDate) : null,
                    validationDate: null,
                    employeeId,
                    additionalInfo
                })
                    .then((res: ResponseEntity<Doc>) => {
                        if (fileHasChanged) return addFile(res.entity.id, file);
                        navigate("/home/dashboard");
                    })
                    .then(() => {
                        navigate("/home/dashboard");
                    })
                    .catch((e: ErrorMessage) => {
                        toast.current?.show({
                            severity: "error",
                            summary: "Error durante la actualización del documento",
                            detail: e.detail,
                            life: 3000
                        });
                    });
            } else {
                newDoc({
                    validationState,
                    contractorId: contractId,
                    subcontractId: employee!.company.id,
                    name,
                    date: Utils.DateToLocalDate(new Date()),
                    expirationDate: null,
                    validationDate: null,
                    employeeId,
                    additionalInfo: additionalInfo?.length != 0 ? additionalInfo : null
                })
                    .then((res: ResponseEntity<Doc>) => {
                        return addFile(res.entity.id, file);
                    })
                    .then((data: any) => {
                        console.log(data);
                        toast.current?.show({
                            severity: "success",
                            summary: "Documento subido correctamente",
                            detail: data.message,
                            life: 3000
                        });
                        navigate(-1);
                    })
                    .catch((err: ErrorMessage) => {
                        toast.current?.show({
                            severity: "error",
                            summary: "Error durante la subida del documento",
                            detail: err.detail,
                            life: 3000
                        });
                    });
            }
        } else {
            toast.current?.show({
                severity: "error",
                summary: "Error durante la subida del documento",
                detail: "Debe adjuntar algún archivo",
                life: 3000
            });
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto bg-gray-800 rounded-2xl">
            <Toast ref={toast} />
            <h2 className="text-2xl font-semibold text-white mb-5">
                {isEdit ? 'Editar Documento' : 'Nuevo Documento'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                <FloatLabel>
                    <InputText
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full mv-2"
                        required
                    />
                    <label className="block text-gray-300 mb-1">Nombre</label>
                </FloatLabel>
                <FloatLabel>
                    <Dropdown
                        options={contracts}
                        optionLabel="name"
                        optionValue="id"
                        value={contractId}
                        onChange={e => setContractId(e.target.value)}
                        placeholder="Selecciona..."
                        className="w-full"
                        required
                    />
                    <label className="block text-gray-300">Contratista</label>

                </FloatLabel>
                {(isEdit && ((doc?.employee && doc?.employee.id !== employeeId) || (!doc?.employee && doc?.subcontract.id !== employee?.company.id))) &&

                    <FloatLabel>
                        <Calendar
                            value={date}
                            onChange={e => setDate(e.value!)}
                            showIcon
                            className="w-full"
                            required
                        />
                        <label className="block text-gray-300 mb-1">Fecha</label>

                    </FloatLabel>
                }
                {(isEdit && ((doc?.employee && doc?.employee.id !== employeeId) || (!doc?.employee && doc?.subcontract.id !== employee?.company.id))) &&

                    <FloatLabel>
                        <Calendar
                            value={expirationDate}
                            onChange={e => setExpDate(e.value!)}
                            showIcon
                            className="w-full"
                        />
                        <label className="block text-gray-300 mb-1">Fecha de expiración</label>

                    </FloatLabel>
                }
                {(isEdit && ((doc?.employee && doc?.employee.id !== employeeId) || (!doc?.employee && doc?.subcontract.id !== employee?.company.id))) &&
                    <FloatLabel>

                        <Dropdown
                            options={STATES}
                            optionLabel="label"
                            optionValue="value"
                            value={validationState}
                            onChange={e => setValidationState(e.value)}
                            placeholder="Selecciona..."
                            className="w-full"
                        />
                        <label className="block text-gray-300 mb-1">Estado de validación</label>

                    </FloatLabel>
                }
                <FloatLabel>
                    <InputTextarea
                        value={additionalInfo ? additionalInfo : ""}
                        onChange={e => setInfo(e.target.value)}
                        rows={3}
                        className="w-full"
                    />
                    <label className="block text-gray-300 mb-1">Información adicional</label>

                </FloatLabel>
                <FileUpload
                    name="file"
                    mode="basic"
                    auto
                    multiple={false}
                    maxFileSize={10000000}
                    url={undefined}
                    customUpload={false}
                    onSelect={(e) => {
                        setFileHasChanged(true);
                        setFile(e.files[0]);
                        toast.current?.show({
                            severity: "info",
                            summary: `Archivo adjunto correctamente`,
                            detail: `Se ha adjuntado ${e.files[0].name}`,
                            life: 3000
                        });
                    }}
                    onRemove={() => setFile(null)}
                    chooseLabel="Seleccionar archivo PDF"
                    accept=".pdf"
                    className="w-full"
                />
                <div className="mt-2">
                    <Message
                        severity={file ? "info" : "warn"}
                        text={!file ? "No se ha adjuntado ningún archivo" : (file && !isEdit ? file.name : (file && isEdit && fileHasChanged ? file.name : Utils.GetOriginalFileName(file.name)))}
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button label="Cancelar" type="button" className="p-button-secondary m-2" onClick={() => navigate(-1)} />
                    <Button label="Guardar" type="submit" className="m-2" />
                </div>
            </form>
        </div >
    );
}