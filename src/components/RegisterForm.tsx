import type React from "react";
import { useEffect, useRef, useState } from "react";
import { COUNTRY_BY_CODE, type CountryCode } from "../model/enum/Country";
import { LocalDate } from "@js-joda/core";
import type Company from "../model/Company";
import * as authService from "../service/AuthService";
import { Toast } from "primereact/toast";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Message } from "primereact/message";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { getAllCompanies } from "../service/CompanyService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { Button } from "primereact/button";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const RegisterForm: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPw] = useState<string>("");
    const [rPw, setRPw] = useState<string>("");
    const [nif, setNif] = useState<string>("");
    const [name, setname] = useState<string>("");
    const [surname, setSurname] = useState<string | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [country, setCountry] = useState<CountryCode | undefined>(undefined);
    const [job, setJob] = useState<string>("");
    const [department, setDepartment] = useState<string>("");
    const [companyId, setCompanyId] = useState<number | undefined>(undefined);
    const [companies, setCompanies] = useState<Company[]>();
    const [loading, setLoading] = useState<boolean>(true);

    const toast = useRef<Toast>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        getAllCompanies()
            .then(data => setCompanies(data))
            .catch((err: ErrorMessage) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al obtener las empresas",
                    detail: err.detail,
                    life: 3000
                });
            })
            .finally(() => setLoading(false));
    }, []);

    const COUNTRIES = Object
        .entries(COUNTRY_BY_CODE)
        .map(([code, name]) => ({
            label: name,
            value: code as CountryCode
        })
        );

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!country) {
            toast.current?.show({
                severity: "error",
                summary: "Error en el registro",
                detail: "La nacionalidad es obligatoria",
                life: 3000
            });
            return;
        }

        if (!startDate) {
            toast.current?.show({
                severity: "error",
                summary: "Error en el registro",
                detail: "La fecha de contratación es obligatoria",
                life: 3000
            });
            return;
        }

        if (!companyId || companyId == 0) {
            toast.current?.show({
                severity: "error",
                summary: "Error en el registro",
                detail: "Debes trabajar para una empresa registrada para acceder a la plataforma de administración",
                life: 3000
            });
            return;
        }

        if (password.length < 5) {
            toast.current?.show({
                severity: "error",
                summary: "Error en el registro",
                detail: "La contraseña es demasiado breve",
                life: 3000
            });
            return;
        }

        if (password !== rPw) {
            toast.current?.show({
                severity: "error",
                summary: "Error en el registro",
                detail: "Las contraseñas deben ser coincidentes ",
                life: 3000
            });
            return;
        }

        const jsDate: Date = startDate;
        const iso = jsDate.toISOString().substring(0, 10);

        await authService.register({
            name,
            surname,
            email,
            password,
            active: true,
            nif,
            start_date: LocalDate.parse(iso),
            country,
            department,
            job,
            company_id: companyId
        })
            .then(() => {
                return login({ email, password });
            })
            .then(() => navigate("/home"))
            .catch((err: ErrorMessage) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error en el registro",
                    detail: err.detail,
                    life: 3000
                });
            });
    };

    return (
        <div className="flex justify-center px-4">
            <div className="w-full max-w-4xl m-2">
                <Toast ref={toast} />
                <h2 className="text-2xl font-semibold text-center mb-6">Crear cuenta</h2>
                <form onSubmit={onSubmit} className="grid grid-cols-3 gap-4">
                    <FloatLabel className="min-w-[150px]">
                        <InputText id="nameR" value={name} onChange={e => setname(e.target.value)} required />
                        <label htmlFor="nameR">Nombre</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <InputText id="surnameR" value={surname} onChange={e => setSurname(e.target.value)} />
                        <label htmlFor="surnameR">Apellidos</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <InputText id="nifR" value={nif} onChange={e => setNif(e.target.value)} required />
                        <label htmlFor="nifR">NIF</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <Dropdown
                            id="countryR"
                            value={country}
                            options={COUNTRIES}
                            onChange={e => setCountry(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecciona un país"
                            filter
                            required
                            filterLocale="es"
                        />
                        <label htmlFor="countryR">Nacionalidad</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <Calendar dateFormat="yy-mm-dd" id="startDateR" value={startDate} onChange={e => setStartDate(e.value!)} showIcon locale="es" maxDate={new Date()} required />
                        <label htmlFor="startDateR">Fecha de contratación</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <Dropdown
                            id="companyR"
                            value={companyId}
                            options={companies}
                            onChange={e => setCompanyId(e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Selecciona una empresa"
                            filter
                            disabled={loading}
                            required
                            filterLocale="es"
                        />
                        <label htmlFor="companyR">Empresa</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <InputText id="jobR" value={job} onChange={e => setJob(e.target.value)} required />
                        <label htmlFor="jobR">Puesto</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <InputText id="departmentR" value={department} onChange={e => setDepartment(e.target.value)} required />
                        <label htmlFor="departmentR">Departamento</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <InputText type="email" id="emailR" value={email} onChange={e => setEmail(e.target.value)} required />
                        <label htmlFor="emailR">Correo electrónico</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <Password id="passwordR" value={password} onChange={e => setPw(e.target.value)} required toggleMask feedback={false} />
                        <label htmlFor="passwordR">Contraseña</label>
                    </FloatLabel>
                    <FloatLabel className="min-w-[150px]">
                        <Password id="confirmR" value={rPw} onChange={e => setRPw(e.target.value)} required toggleMask feedback={false} />
                        <label htmlFor="confirmR">Repetir contraseña</label>
                    </FloatLabel>
                    <div />
                    {(password.length != 0 && rPw.length != 0 && password !== rPw) && <Message className="col-span-2" severity="warn" text="Las contraseñas no coinciden" />}
                    {(password.length != 0 && password.length < 5) && <Message className="col-span-2" severity="warn" text="La contraseña es demasiado breve" />}
                    <div />
                    <div className="col-start-3">
                        <Button type="submit" label="Crear cuenta y registrarse" icon="pi pi-user-plus" />
                    </div>
                </form>
            </div>
        </div>
    );
}