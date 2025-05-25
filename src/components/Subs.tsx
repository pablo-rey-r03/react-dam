import type React from "react";
import type Employee from "../model/Employee";
import { useEffect, useRef, useState } from "react";
import type Company from "../model/Company";
import type SubcontractingRelationship from "../model/SubcontractingRelationship";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { getEmployeeById } from "../service/EmployeeService";
import { getSubcontractsRelationshipByContractorId, updateSubcontractRelationship } from "../service/CompanyService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { jwtDecode } from "jwt-decode";
import type JWTDecoded from "../model/JWTDecoded";
import { getCountryName } from "../model/enum/Country";
import type SubcontractingRelationshipDTO from "../model/dto/SubcontractingRelationshipDTO";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import Utils from "../utils/Utils";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { LocalDate } from "@js-joda/core";

export const Subs: React.FC = () => {

    const employeeId = jwtDecode<JWTDecoded>(localStorage.getItem("token")!).employee_id;

    const [employee, setEmployee] = useState<Employee>();
    const [company, setCompany] = useState<Company>();
    const [subRels, setSubRels] = useState<SubcontractingRelationship[]>();
    const [subs, setSubs] = useState<Company[]>();

    // Modal
    const [visible, setVisible] = useState<boolean>(false);
    const [selectedRel, setSelectedRel] = useState<SubcontractingRelationship | null>(null);
    const [form, setForm] = useState({ start_date: '', end_date: '', additional_info: '' });
    const [dirty, setDirty] = useState<{ [key: string]: boolean }>({});

    const toast = useRef<Toast>(null);
    const navigate = useNavigate();

    useEffect(() => {
        getEmployeeById(employeeId)
            .then(res => {
                setEmployee(res);
                setCompany(res.company);
                return getSubcontractsRelationshipByContractorId(res.company.id);
            })
            .then(data => {
                setSubRels(data);
                const subLista = data.map((rel: SubcontractingRelationship) => rel.subcontract);
                setSubs(subLista);
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

    const openModal = (rel: SubcontractingRelationship) => {
        setSelectedRel(rel);
        setForm({
            start_date: rel.start_date.toString(),
            end_date: rel.end_date?.toString() || '',
            additional_info: rel.additional_info || ''
        });
        setDirty({});
        setVisible(true);
    }

    const confirmField = (field: keyof typeof form) => {
        if (!selectedRel) return;
        const dto: SubcontractingRelationshipDTO = {
            startDate: LocalDate.parse(form.start_date),
            endDate: form.end_date ? LocalDate.parse(form.end_date) : null,
            additionalInfo: form.additional_info.trim() !== "" ? form.additional_info : null
        };
        updateSubcontractRelationship(selectedRel.contractor.id, selectedRel.subcontract.id, dto)
            .then(() => {
                const fieldMessages: { [key in keyof typeof form]: string } = {
                    start_date: "La fecha de inicio ha sido actualizada",
                    end_date: "La fecha de fin ha sido actualizada",
                    additional_info: "La información adicional ha sido actualizada"
                };
                toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: fieldMessages[field] || "Contrato actualizado", life: 3000 });
                setDirty(prev => ({ ...prev, [field]: false }));
                return getSubcontractsRelationshipByContractorId(employee!.company.id);
            })
            .then(data => {
                setSubRels(data);
                const subLista = data.map((rel: SubcontractingRelationship) => rel.subcontract);
                setSubs(subLista);
            })
            .catch((err: ErrorMessage) => {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: err.detail, life: 3000 });
            });
    }


    return (
        <div className="p-6 space-y-8">
            <Toast ref={toast} />
            <h2 className="text-2xl font-semibold text-white">
                Subcontratas de{" "}
                {company ? (
                    <span className="text-purple-300 hover:underline cursor-pointer">{company.name}</span>
                ) : "Cargando..."}
            </h2>

            <div className="flex overflow-x-auto overflow-y-visible group space-x-4 pb-2 group-hover:overflow-visible">
                {subs && (subs.length > 0) ? subs?.map((sub, idx) => {
                    const rel = subRels![idx];
                    return <div
                        key={sub.id}
                        className={`
                            relative
                            z-0
                            min-w-[250px]
                            bg-gray-800
                            rounded-2xl
                            border-2
                            !border-purple-600
                            p-4
                            m-3
                            transform-gpu
                            transition-all
                            duration-300
                            ease-in-out
                            hover:z-10        
                            hover:scale-105
                            hover:shadow-2xl
                            hover:border-purple-400
                            shadow-lg
                            cursor-pointer
                        `}
                        onClick={() => openModal(rel)}>
                        <h3 className="text-lg font-medium mb-2 text-white">{sub.name}</h3>
                        <p className="text-sm text-gray-300">{sub.address}</p>
                        <p className="text-sm mt-1 text-gray-400">{getCountryName(sub.country)}</p>
                    </div>
                }) : (
                    <p className="text-gray-400">No hay empresas subcontratadas.</p>
                )}
            </div>

            <Dialog header="Detalles del contrato" visible={visible} style={{ width: '450px' }} onHide={() => setVisible(false)}>
                {selectedRel && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-100">Fecha de inicio</label>
                            <div className="flex items-center">
                                <Calendar
                                    value={Utils.LocalDateToDate(form.start_date)}
                                    onChange={e => {
                                        const date: Date = e.value as Date;
                                        const str = Utils.DateToLocalDate(date).toString();
                                        setForm({ ...form, start_date: str });
                                        setDirty({ ...dirty, start_date: true });
                                    }}
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                />                                {dirty.start_date && <Button icon="pi pi-check" className="ml-2 p-button-text" onClick={() => confirmField('start_date')} />}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-100">Fecha de fin</label>
                            <div className="flex items-center">
                                <Calendar
                                    value={form.end_date ? Utils.LocalDateToDate(form.end_date) : null}
                                    onChange={e => {
                                        const date: Date = e.value as Date;
                                        const str = Utils.DateToLocalDate(date).toString();
                                        setForm({ ...form, end_date: str });
                                        setDirty({ ...dirty, end_date: true });
                                    }}
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                    placeholder="Sin fecha"
                                />
                                {dirty.end_date && <Button icon="pi pi-check" className="ml-2 p-button-text" onClick={() => confirmField('end_date')} />}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-100">Información adicional</label>
                            <div className="flex items-center">
                                <InputTextarea value={form.additional_info} onChange={e => setForm({ ...form, additional_info: e.target.value })} onFocus={() => setDirty({ ...dirty, additional_info: true })} />
                                {dirty.additional_info && <Button icon="pi pi-check" className="ml-2 p-button-text" onClick={() => confirmField('additional_info')} />}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}