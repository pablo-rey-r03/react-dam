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
import { getDocById, newDoc, updateDoc } from "../service/DocService";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { type ValidationState, ValidationStates } from "../model/enum/ValidationState";
import { DateToLocalDate } from "../utils/DateToLocalDate";
import { FloatLabel } from "primereact/floatlabel";

export const DocuForm: React.FC = () => {
    const employeeId: number = jwtDecode<JWTDecoded>(localStorage.getItem("token")!).employee_id;
    const { id } = useParams<{ id: string }>();
    const isEdit: boolean = !!id;
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
    const [expirationDate, setExpDate] = useState<Date>(new Date());
    const [validationDate, setValDate] = useState<Date>(new Date());
    const [additionalInfo, setInfo] = useState<string>("");

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
                .then((doc: Doc) => {
                    setDoc(doc);
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
    }, []);

    const STATES = Object.entries(ValidationStates).map(
        ([key, label]) => ({ label, value: key as ValidationState })
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {

        } else {
            newDoc({
                validationState,
                contractorId: contractId,
                subcontractId: employee!.company.id,
                name,
                date: DateToLocalDate(date),
                expirationDate: DateToLocalDate(expirationDate),
                validationDate: DateToLocalDate(validationDate),
                employeeId,
                additionalInfo
            })
                .then()
                .catch();
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto bg-gray-800 rounded-2xl">
            <Toast ref={toast} />
            <h2 className="text-2xl font-semibold text-white mb-4">
                {isEdit ? 'Editar Documento' : 'Nuevo Documento'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FloatLabel>
                    <InputText
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full"
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
                    />
                    <label className="block text-gray-300 mb-1">Contratista</label>

                </FloatLabel>
                <FloatLabel>
                    <Calendar
                        value={date}
                        onChange={e => setDate(e.value!)}
                        showIcon
                        className="w-full"
                    />
                    <label className="block text-gray-300 mb-1">Fecha</label>

                </FloatLabel>
                <FloatLabel>
                    <Calendar
                        value={expirationDate}
                        onChange={e => setExpDate(e.value!)}
                        showIcon
                        className="w-full"
                    />
                    <label className="block text-gray-300 mb-1">Fecha de expiración</label>

                </FloatLabel>
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
                <FloatLabel>
                    <InputTextarea
                        value={additionalInfo}
                        onChange={e => setInfo(e.target.value)}
                        rows={3}
                        className="w-full"
                    />
                    <label className="block text-gray-300 mb-1">Información adicional</label>

                </FloatLabel>
                <FloatLabel>
                    <FileUpload
                        name="file"
                        customUpload
                        auto
                        uploadHandler={(e) => {
                            // TODO: Implement upload
                        }}
                    />
                    <label className="block text-gray-300 mb-1">Archivo</label>
                </FloatLabel>
                <div className="flex justify-end space-x-2">
                    <Button label="Cancelar" type="button" className="p-button-secondary" onClick={() => navigate('/dashboard')} />
                    <Button label="Guardar" type="submit" />
                </div>
            </form>
        </div>
    );
}