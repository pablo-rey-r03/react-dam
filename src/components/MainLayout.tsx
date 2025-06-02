import { jwtDecode } from "jwt-decode";
import type React from "react";
import { useNavigate } from "react-router-dom";
import type JWTDecoded from "../model/JWTDecoded";
import type Employee from "../model/Employee";
import { useEffect, useRef, useState } from "react";
import { getEmployeeById, updateEmployee } from "../service/EmployeeService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { Toast } from "primereact/toast";
import { useAuth } from "../context/AuthContext";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { HomeRoutes } from "../routing/HomeRoutes";
import type Company from "../model/Company";
import { COUNTRY_BY_CODE, type CountryCode } from "../model/enum/Country";
import { updateCompany } from "../service/CompanyService";
import type ResponseEntity from "../model/msg/ResponseEntity";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import Utils from "../utils/Utils";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";

export const MainLayout: React.FC = () => {

    const [jwt, setJwt] = useState<string | null>(localStorage.getItem("token"));
    const [jwtDecoded, setDecoded] = useState<JWTDecoded | null>(jwt ? jwtDecode<JWTDecoded>(jwt) : null);

    const [employee, setEmployee] = useState<Employee>();
    const [companyDialogVisible, setCompanyDialogVisible] = useState<boolean>(false);
    const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);

    const [name, setName] = useState<string>();
    const [address, setAddress] = useState<string>();
    const [cif, setCif] = useState<string>();
    const [country, setCountry] = useState<CountryCode>();

    const [profileDialogVisible, setProfileDialogVisible] = useState<boolean>(false);

    const [nif, setNif] = useState<string>("");
    const [empName, setEmpName] = useState<string>("");
    const [surname, setSurname] = useState<string | undefined>(undefined);
    const [empCountry, setEmpCountry] = useState<CountryCode>();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [job, setJob] = useState<string>("");
    const [department, setDepartment] = useState<string>("");
    const [additionalInfo, setInfo] = useState<string | undefined>(undefined);

    const auth = useAuth();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const menu = useRef<Menu>(null);


    const items = [
        { label: "Inicio", icon: "pi pi-home", command: () => navigate("/home/dashboard") },
        { label: 'Mi empresa', icon: 'pi pi-building', command: () => navigate('/home/my_comp') },
        { label: 'Subcontratas', icon: 'pi pi-briefcase', command: () => navigate('/home/companies') },
        { label: 'Documentos', icon: 'pi pi-file-check', command: () => navigate('/home/docs') },
    ];

    const profileItems = [
        { label: 'Perfil', icon: 'pi pi-user', command: () => openProfileDialog() },
        { separator: true },
        {
            label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => {
                auth.logout();
                navigate('/auth', { replace: true });
            }
        }
    ];

    useEffect(() => {
        setJwt(localStorage.getItem("token") ?? null);
        setDecoded(jwt ? jwtDecode<JWTDecoded>(jwt) : null);
    }, []);

    useEffect(() => {
        if (!jwtDecoded) {
            navigate("/auth");
            return;
        }
        getEmployeeById(jwtDecoded.employee_id)
            .then(data => {
                console.log(data)
                setEmployee(data);
                if (data.company) {
                    setName(data.company.name);
                    setCif(data.company.cif);
                    setCountry(data.company.country);
                    setAddress(data.company.address);
                }

                setEmpName(data.name);
                setSurname(data.surname ?? undefined);
                setNif(data.nif);
                setJob(data.job);
                setDepartment(data.department);
                setEmpCountry(data.country);
                setStartDate(Utils.LocalDateToDate(data.start_date));
                setInfo(data.additional_info ?? undefined);
            })
            .catch((err: ErrorMessage) => {
                console.log(err)
                toast.current?.show({
                    severity: "error",
                    summary: "Error al obtener el empleado en sesión",
                    detail: err.detail,
                    life: 3000
                });
            });

        const options = Object.entries(COUNTRY_BY_CODE).map(([code, name]) => ({ label: name, value: code }));
        setCountryOptions(options);
    }, [jwtDecoded, navigate]);

    const openCompanyDialog = () => {
        setCompanyDialogVisible(true);
    };

    const hideCompanyDialog = () => {
        setCompanyDialogVisible(false);
    };

    const openProfileDialog = () => {
        setProfileDialogVisible(true);
    };
    const hideProfileDialog = () => {
        setProfileDialogVisible(false);
    };

    const saveCompany = () => {
        if (employee) {
            if (!name?.trim()) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al actualizar la empresa",
                    detail: "El nombre de la empresa es obligatorio",
                    life: 3000
                });
                return;
            }
            if (!cif?.trim()) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al actualizar la empresa",
                    detail: "El nombre de la empresa es obligatorio",
                    life: 3000
                });
                return;
            }
            if (!address?.trim()) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al actualizar la empresa",
                    detail: "El nombre de la empresa es obligatorio",
                    life: 3000
                });
                return;
            }
            if (!country) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al actualizar la empresa",
                    detail: "El nombre de la empresa es obligatorio",
                    life: 3000
                });
                return;
            }
            updateCompany(employee.company.id, {
                name: name ?? "",
                cif: cif ?? "",
                address: address ?? "",
                country
            })
                .then((res: ResponseEntity<Company>) => {
                    setEmployee(prev => prev ? { ...prev, company: res.entity } : prev);
                    toast.current?.show({
                        severity: "success",
                        summary: "Empresa actualizada",
                        detail: "La información de la empresa ha sido actualizada correctamente",
                        life: 3000
                    });
                    hideCompanyDialog();
                })
                .catch((err: ErrorMessage) => {
                    toast.current?.show({
                        severity: "error",
                        summary: "Error al actualizar la empresa",
                        detail: err.detail,
                        life: 3000
                    });
                });
        }
    };

    const dialogFooter = (
        <div>
            <Button label="Guardar" icon="pi pi-check" onClick={saveCompany} autoFocus />
        </div>
    );

    const saveProfile = () => {

        if (!nif?.trim()) {
            toast.current?.show({
                severity: "error",
                summary: "Error al actualizar perfil",
                detail: "El NIF es obligatorio",
                life: 3000
            });
            return;
        }
        if (!empName?.trim()) {
            toast.current?.show({
                severity: "error",
                summary: "Error al actualizar perfil",
                detail: "El nombre es obligatorio",
                life: 3000
            });
            return;
        }
        if (!empCountry) {
            toast.current?.show({
                severity: "error",
                summary: "Error al actualizar perfil",
                detail: "Debes seleccionar un país",
                life: 3000
            });
            return;
        }
        if (!startDate) {
            toast.current?.show({
                severity: "error",
                summary: "Error al actualizar perfil",
                detail: "La fecha de inicio es obligatoria",
                life: 3000
            });
            return;
        }
        if (!job?.trim()) {
            toast.current?.show({
                severity: "error",
                summary: "Error al actualizar perfil",
                detail: "El puesto de trabajo es obligatorio",
                life: 3000
            });
            return;
        }
        if (!department?.trim()) {
            toast.current?.show({
                severity: "error",
                summary: "Error al actualizar perfil",
                detail: "El departamento es obligatorio",
                life: 3000
            });
            return;
        }

        if (!employee) {
            toast.current?.show({
                severity: "error",
                summary: "Error al actualizar perfil",
                detail: "No se encontró el empleado",
                life: 3000
            });
            return;
        }

        updateEmployee(employee.id, {
            nif,
            name: empName,
            surname,
            additionalInfo,
            job,
            department,
            startDate: Utils.DateToLocalDate(startDate),
            country: empCountry
        })
            .then((res: ResponseEntity<Employee>) => {
                setEmployee(res.entity);
                toast.current?.show({
                    severity: "success",
                    summary: "Perfil actualizado",
                    detail: "Los datos de usuario se han actualizado correctamente",
                    life: 3000
                });
                hideProfileDialog();
            })
            .catch((err: ErrorMessage) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al actualizar perfil",
                    detail: err.detail,
                    life: 3000
                });
            });
    };

    const dialogFooterProfile = (
        <div>
            <Button label="Guardar" icon="pi pi-check" onClick={saveProfile} autoFocus />
        </div>
    );

    return (
        <div className="flex flex-col h-screen">
            <Toast ref={toast} />
            <div className="flex items-center shadow-md text-white px-2">
                <div className="flex-1">
                    <Menubar
                        model={items}
                        className="bg-transparent border-none p-0" />
                </div>

                <div
                    className="
                        flex-1
                        text-center
                        truncate
                        overflow-hidden
                        whitespace-nowrap
                        font-semibold
                        px-4
                    "
                    title={employee?.company.name}
                >
                    <Button
                        className="p-button-text text-white"
                        label={employee?.company.name}
                        icon="pi pi-building"
                        onClick={openCompanyDialog} />
                </div>

                <div className="flex-0 flex items-center space-x-2">
                    <Button
                        label={employee?.name}
                        icon="pi pi-user"
                        className="p-button-text text-white"
                        onClick={e => menu.current?.toggle(e)}
                    />
                    <Menu model={profileItems} popup ref={menu} />
                </div>
            </div>

            <Dialog
                header="Editar información de la empresa"
                visible={companyDialogVisible}
                style={{ width: '450px' }}
                modal
                footer={dialogFooter}
                onHide={hideCompanyDialog}
            >
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="name">Nombre</label>
                        <InputText
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="cif">CIF</label>
                        <InputText
                            id="cif"
                            value={cif}
                            onChange={e => setCif(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="country">País</label>
                        <Dropdown
                            id="country"
                            value={country}
                            options={countryOptions}
                            placeholder="Selecciona un país"
                            optionLabel="label"
                            optionValue="value"
                            onChange={e => setCountry(e.value)}
                            filter filterLocale="es"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="address">Dirección</label>
                        <InputText
                            id="address"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog
                header="Editar perfil de usuario"
                visible={profileDialogVisible}
                style={{ width: "550px" }}
                modal
                footer={dialogFooterProfile}
                onHide={hideProfileDialog}
            >
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="nif">NIF</label>
                        <InputText
                            id="nif"
                            value={nif}
                            onChange={e => setNif(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="empName">Nombre</label>
                        <InputText
                            id="empName"
                            value={empName}
                            onChange={e => setEmpName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="surname">Apellidos</label>
                        <InputText
                            id="surname"
                            value={surname}
                            onChange={e => setSurname(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="empCountry">País</label>
                        <Dropdown
                            id="empCountry"
                            value={empCountry}
                            options={countryOptions}
                            placeholder="Selecciona un país"
                            optionLabel="label"
                            optionValue="value"
                            onChange={e => setEmpCountry(e.value)}
                            required
                            filter filterLocale="es"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="startDate">Fecha de contratación</label>
                        <Calendar
                            id="startDate"
                            value={startDate}
                            onChange={e => setStartDate(e.value as Date)}
                            dateFormat="yy-mm-dd"
                            showIcon
                            required
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="job">Puesto</label>
                        <InputText
                            id="job"
                            value={job}
                            onChange={e => setJob(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="department">Departamento</label>
                        <InputText
                            id="department"
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="additionalInfo">Información adicional</label>
                        <InputTextarea
                            id="additionalInfo"
                            value={additionalInfo}
                            onChange={e => setInfo(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </Dialog>

            <main className="flex-1 overflow-auto p-4 bg-gray-50">
                <HomeRoutes />
            </main>
        </div>
    );
}