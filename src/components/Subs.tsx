import type React from "react";
import type Employee from "../model/Employee";
import { useEffect, useRef, useState } from "react";
import type Company from "../model/Company";
import type SubcontractingRelationship from "../model/SubcontractingRelationship";
import { Toast } from "primereact/toast";
import { getEmployeeById } from "../service/EmployeeService";
import { createCompany, createSubcontractRelationship, deleteSubcontractRelationship, getAllCompanies, getSubcontractsRelationshipByContractorId, updateSubcontractRelationship } from "../service/CompanyService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { jwtDecode } from "jwt-decode";
import type JWTDecoded from "../model/JWTDecoded";
import { COUNTRY_BY_CODE, getCountryName, type CountryCode } from "../model/enum/Country";
import type SubcontractingRelationshipDTO from "../model/dto/SubcontractingRelationshipDTO";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import Utils from "../utils/Utils";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { LocalDate } from "@js-joda/core";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { OverlayPanel } from "primereact/overlaypanel";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import type ResponseEntity from "../model/msg/ResponseEntity";

export const Subs: React.FC = () => {

    const employeeId = jwtDecode<JWTDecoded>(localStorage.getItem("token")!).employee_id;

    const [employee, setEmployee] = useState<Employee>();
    const [company, setCompany] = useState<Company>();
    const [subRels, setSubRels] = useState<SubcontractingRelationship[]>();
    const [subs, setSubs] = useState<Company[]>();
    const [otherCompanies, setOtherCompanies] = useState<Company[]>();

    // Modal
    const [visible, setVisible] = useState<boolean>(false);
    const [selectedRel, setSelectedRel] = useState<SubcontractingRelationship | null>(null);
    const [form, setForm] = useState({ startDate: '', endDate: '', additionalInfo: '' });
    const [dirty, setDirty] = useState<{ [key: string]: boolean }>({});
    const [relationVisible, setRelationVisible] = useState<boolean>(false);
    const [relationMode, setRelationMode] = useState<'new' | 'existing'>('existing');
    const [relationForm, setRelationForm] = useState({
        // campos de empresa
        name: '',
        cif: '',
        country: '' as CountryCode,
        address: '',
        // campos de relación
        startDate: '',
        endDate: '',
        additionalInfo: ''
    });
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);


    const toast = useRef<Toast>(null);
    const overlayRef = useRef<OverlayPanel>(null);

    useEffect(() => {
        getEmployeeById(employeeId)
            .then(res => {
                setEmployee(res);
                setCompany(res.company);
                return getSubcontractsRelationshipByContractorId(res.company.id);
            })
            .then(data => {
                setSubRels(data);
                const subLista = data ? data.map((rel: SubcontractingRelationship) => rel.subcontract) : null;
                setSubs(subLista ?? undefined);
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
    }, [employeeId, setVisible, setRelationVisible]);

    useEffect(() => {
        if (employee)
            getAllCompanies()
                .then(list => setOtherCompanies(list ? list.filter(c => c.id !== employee!.company.id) : undefined))
                .catch(err => toast.current?.show({ severity: 'error', summary: 'Error al obtener empresas', detail: err.detail, life: 3000 }));
    }, [employee, setRelationVisible]);

    const openModal = (rel: SubcontractingRelationship) => {
        setSelectedRel(rel);
        setForm({
            startDate: rel.start_date.toString(),
            endDate: rel.end_date?.toString() || '',
            additionalInfo: rel.additional_info || ''
        });
        setDirty({});
        setVisible(true);
    }

    const confirmField = (field: keyof typeof form) => {
        if (!selectedRel) return;
        const dto: SubcontractingRelationshipDTO = {
            startDate: LocalDate.parse(form.startDate),
            endDate: form.endDate ? LocalDate.parse(form.endDate) : null,
            additionalInfo: form.additionalInfo.trim() !== "" ? form.additionalInfo : null
        };
        updateSubcontractRelationship(selectedRel.contractor.id, selectedRel.subcontract.id, dto)
            .then(() => {
                const fieldMessages: { [key in keyof typeof form]: string } = {
                    startDate: "La fecha de inicio ha sido actualizada",
                    endDate: "La fecha de fin ha sido actualizada",
                    additionalInfo: "La información adicional ha sido actualizada"
                };
                toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: fieldMessages[field] || "Contrato actualizado", life: 3000 });
                setDirty(prev => ({ ...prev, [field]: false }));
                return getSubcontractsRelationshipByContractorId(employee!.company.id);
            })
            .then(data => {
                setSubRels(data);
                const subLista = data ? data.map((rel: SubcontractingRelationship) => rel.subcontract) : null;
                setSubs(subLista ?? undefined);
            })
            .catch((err: ErrorMessage) => {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: err.detail, life: 3000 });
            });
    }

    const deleteConfirm = () => {
        if (!selectedRel) return;
        confirmDialog({
            message: "¿Seguro que deseas eliminar esta relación contractual?",
            header: "Confirmar eliminación",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Sí",
            rejectLabel: "No",
            accept: () => deleteRelation()
        });
    };

    const deleteRelation = () => {
        if (!selectedRel || !subRels) return;
        const { contractor, subcontract } = selectedRel;
        deleteSubcontractRelationship(contractor.id, subcontract.id)
            .then(() => {
                return getSubcontractsRelationshipByContractorId(contractor.id)
            })
            .then((res: SubcontractingRelationship[] | undefined) => {
                setSubRels(res);
                setSubs(res ? res.map(r => r.subcontract) : undefined);
                setVisible(false);
                setSelectedRel(null);
                toast.current?.show({ severity: "success", summary: "Eliminado", detail: "Relación eliminada", life: 3000 });
            })
            .catch((err: ErrorMessage) => {
                toast.current?.show({ severity: "error", summary: "Error al eliminar la relación", detail: err.detail, life: 3000 });
            });
    }


    return (
        <div className="p-6 space-y-8">
            <ConfirmDialog />
            <Toast ref={toast} />
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">
                    Subcontratas de {company?.name || 'Cargando...'}
                </h2>
                <Button
                    label="Crear relación"
                    icon="pi pi-plus"
                    className="p-button-success"
                    onClick={e => overlayRef.current?.toggle(e)}
                />
            </div>

            <OverlayPanel ref={overlayRef} showCloseIcon style={{ width: '300px' }}>
                <div className="space-y-4">
                    <label className="block text-sm font-medium">Selecciona empresa</label>
                    <Dropdown
                        options={otherCompanies}
                        optionLabel="name"
                        placeholder="Elige una empresa"
                        className="w-full"
                        filter
                        onChange={e => {
                            setSelectedCompany(e.value);
                            setRelationMode('existing');
                            setRelationForm(f => ({
                                ...f,
                                startDate: '',
                                endDate: '',
                                additionalInfo: ''
                            }));
                            setRelationVisible(true);
                            overlayRef.current?.hide();
                        }}
                    />

                    <Button
                        label="Nueva empresa"
                        icon="pi pi-building"
                        className="p-button-text"
                        onClick={() => {
                            setRelationMode('new');
                            setSelectedCompany(null);
                            setRelationForm({
                                name: '',
                                cif: '',
                                country: '' as CountryCode,
                                address: '',
                                startDate: '',
                                endDate: '',
                                additionalInfo: ''
                            });
                            setRelationVisible(true);
                            overlayRef.current?.hide();
                        }}
                    />
                </div>
            </OverlayPanel>

            <div className="flex flex-wrap gap-4 pb-2">
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
                    <p className="text-gray-400">No hay empresas subcontratadas</p>
                )}
            </div>

            <Dialog header={"Detalles del contrato con " + selectedRel?.subcontract.name} visible={visible} style={{ width: '450px' }} onHide={() => setVisible(false)}
                footer={
                    <div className="flex justify-between">
                        <Button
                            icon="pi pi-trash"
                            label="Eliminar relación"
                            className="p-button-text p-button-danger"
                            onClick={() => deleteConfirm()}
                        />
                    </div>
                }>
                {selectedRel && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-100">Fecha de inicio</label>
                            <div className="flex items-center">
                                <Calendar
                                    value={form.startDate ? Utils.LocalDateToDate(form.startDate) : null}
                                    onChange={e => {
                                        const date: Date = e.value as Date;
                                        const str = Utils.DateToLocalDate(date).toString();
                                        setForm({ ...form, startDate: str });
                                        setDirty({ ...dirty, startDate: true });
                                    }}
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                />                                {dirty.startDate && <Button icon="pi pi-check" className="ml-2 p-button-text" onClick={() => confirmField('startDate')} />}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-100">Fecha de fin</label>
                            <div className="flex items-center">
                                <Calendar
                                    value={form.endDate ? Utils.LocalDateToDate(form.endDate) : null}
                                    onChange={e => {
                                        const date: Date = e.value as Date;
                                        const str = Utils.DateToLocalDate(date).toString();
                                        setForm({ ...form, endDate: str });
                                        setDirty({ ...dirty, endDate: true });
                                    }}
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                    placeholder="Sin fecha"
                                />
                                {dirty.endDate && <Button icon="pi pi-check" className="ml-2 p-button-text" onClick={() => confirmField('endDate')} />}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-100">Información adicional</label>
                            <div className="flex items-center">
                                <InputTextarea value={form.additionalInfo} onChange={e => setForm({ ...form, additionalInfo: e.target.value })} onFocus={() => setDirty({ ...dirty, additionalInfo: true })} />
                                {dirty.additionalInfo && <Button icon="pi pi-check" className="ml-2 p-button-text" onClick={() => confirmField('additionalInfo')} />}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            <Dialog
                header={relationMode === 'new'
                    ? 'Crear nueva empresa y relación'
                    : `Crear relación con ${selectedCompany?.name}`}
                visible={relationVisible}
                style={{ width: '500px' }}
                onHide={() => setRelationVisible(false)}
                footer={
                    <div className="flex justify-end space-x-2">
                        <Button
                            label="Crear relación"
                            icon="pi pi-sitemap"
                            className="p-button-success"
                            onClick={() => {
                                if (!relationForm.startDate) {
                                    toast.current?.show({
                                        severity: "warn",
                                        summary: "Aviso",
                                        detail: "La fecha de inicio es obligatoria",
                                        life: 3000
                                    });
                                    return;
                                }
                                if (relationMode === 'new') {
                                    if (!relationForm.name || !relationForm.cif || !relationForm.country || !relationForm.address) {
                                        toast.current?.show({
                                            severity: "warn",
                                            summary: "Aviso",
                                            detail: "Los datos de la nueva empresa son obligatorios",
                                            life: 3000
                                        });
                                        return;
                                    }
                                    createCompany({
                                        name: relationForm.name,
                                        cif: relationForm.cif,
                                        country: relationForm.country,
                                        address: relationForm.address
                                    })
                                        .then((res: ResponseEntity<Company>) => {
                                            let companies = otherCompanies ?? [];
                                            companies.push(res.entity);
                                            setOtherCompanies(companies);
                                            return createSubcontractRelationship(company!.id, res.entity.id, {
                                                startDate: LocalDate.parse(relationForm.startDate),
                                                endDate: relationForm.endDate ? LocalDate.parse(relationForm.endDate) : null,
                                                additionalInfo: relationForm.additionalInfo ?? null
                                            })
                                        })
                                        .then(() => {
                                            return getSubcontractsRelationshipByContractorId(company!.id);
                                        })
                                        .then((res: SubcontractingRelationship[] | undefined) => {
                                            setSubRels(res);
                                            const subLista = res ? res.map((rel: SubcontractingRelationship) => rel.subcontract) : null;
                                            setSubs(subLista ?? undefined);
                                            setRelationVisible(false);
                                            setSelectedCompany(null);
                                            toast.current?.show({
                                                severity: "success",
                                                summary: "Creado",
                                                detail: "Se ha creado la relación con la nueva empresa",
                                                life: 3000
                                            });
                                        })
                                        .catch((err: ErrorMessage) => {
                                            toast.current?.show({
                                                severity: "error",
                                                summary: "Error al crear la relación",
                                                detail: err.detail,
                                                life: 3000
                                            });
                                        });
                                } else {
                                    createSubcontractRelationship(company!.id, selectedCompany!.id, {
                                        startDate: LocalDate.parse(relationForm.startDate),
                                        endDate: relationForm.endDate ? LocalDate.parse(relationForm.endDate) : null,
                                        additionalInfo: relationForm.additionalInfo ?? null
                                    })
                                        .then(() => {
                                            return getSubcontractsRelationshipByContractorId(company!.id);
                                        })
                                        .then((res: SubcontractingRelationship[] | undefined) => {
                                            setSubRels(res);
                                            const subLista = res ? res.map((rel: SubcontractingRelationship) => rel.subcontract) : null;
                                            setSubs(subLista ?? undefined);
                                            setRelationVisible(false);
                                            setSelectedCompany(null);
                                            toast.current?.show({
                                                severity: "success",
                                                summary: "Creado",
                                                detail: "Se ha creado la relación con la empresa",
                                                life: 3000
                                            });
                                        })
                                        .catch((err: ErrorMessage) => {
                                            toast.current?.show({
                                                severity: "error",
                                                summary: "Error al crear la relación",
                                                detail: err.detail,
                                                life: 3000
                                            });
                                        });
                                }
                            }}
                        />
                    </div>
                }
            >
                <div className="space-y-4">
                    {relationMode === 'new' && (
                        <>
                            <div>
                                <label className="block text-sm">Nombre</label>
                                <InputText
                                    value={relationForm.name}
                                    onChange={e => setRelationForm({ ...relationForm, name: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm">CIF</label>
                                <InputText
                                    value={relationForm.cif}
                                    onChange={e => setRelationForm({ ...relationForm, cif: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm">País</label>
                                <Dropdown
                                    options={Object.entries(COUNTRY_BY_CODE).map(([code, name]) => ({ code, name }))}
                                    optionValue="code"
                                    optionLabel="name"
                                    value={relationForm.country}
                                    onChange={e => setRelationForm({ ...relationForm, country: e.value })}
                                    placeholder="Selecciona país"
                                    className="w-full"
                                    filter
                                />
                            </div>
                            <div>
                                <label className="block text-sm">Dirección</label>
                                <InputText
                                    value={relationForm.address}
                                    onChange={e => setRelationForm({ ...relationForm, address: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm">Fecha de inicio</label>
                        <Calendar
                            value={relationForm.startDate ? Utils.LocalDateToDate(relationForm.startDate) : null}
                            onChange={e => {
                                const d = e.value as Date;
                                setRelationForm({ ...relationForm, startDate: Utils.DateToLocalDate(d).toString() });
                            }}
                            dateFormat="yy-mm-dd"
                            showIcon
                            className="w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm">Fecha de fin</label>
                        <Calendar
                            value={relationForm.endDate ? Utils.LocalDateToDate(relationForm.endDate) : null}
                            onChange={e => {
                                const d = e.value as Date;
                                setRelationForm({ ...relationForm, endDate: Utils.DateToLocalDate(d).toString() });
                            }}
                            dateFormat="yy-mm-dd"
                            showIcon
                            placeholder="Opcional"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm">Información adicional</label>
                        <InputTextarea
                            value={relationForm.additionalInfo}
                            onChange={e => setRelationForm({ ...relationForm, additionalInfo: e.target.value })}
                            rows={3}
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

        </div>
    )
}