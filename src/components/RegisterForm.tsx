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
    const [companyId, setCompanyId] = useState<number>(0);
    const [companies, setCompanies] = useState<Company[]>();
    const [loading, setLoading] = useState<boolean>(true);

    const toast = useRef<Toast>(null);

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

        if (!country) return;
        if (!startDate) return;

        const jsDate: Date = startDate;
        const iso = jsDate.toISOString().substring(0, 10);

        let message;

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
            .then(res => {
                message = res.message;

                toast.current?.show({
                    severity: "success",
                    summary: "¡Bienvenido!",
                    detail: message,
                    life: 3000
                });
            })
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
        <div className="register-container">
            <Toast ref={toast} />
            <form onSubmit={onSubmit} className="register-form">
                <h2>Registro</h2>
                <FloatLabel>
                    <InputText id="nameR" value={name} onChange={e => setname(e.target.value)} required />
                    <label htmlFor="nameR">Nombre</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText id="surnameR" value={surname} onChange={e => setSurname(e.target.value)} />
                    <label htmlFor="surnameR">Apellidos</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText id="nifR" value={nif} onChange={e => setNif(e.target.value)} required />
                    <label htmlFor="nifR">NIF</label>
                </FloatLabel>
                <FloatLabel>
                    <Dropdown
                        id="countryR"
                        value={country}
                        options={COUNTRIES}
                        onChange={e => setCountry(e.value)}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona un país"
                        filter
                    />
                    <label htmlFor="countryR">País</label>
                </FloatLabel>
                <FloatLabel>
                    <Calendar dateFormat="yy-mm-dd" id="startDateR" value={startDate} onChange={e => setStartDate(e.value!)} showIcon locale="es" />
                    <label htmlFor="startDateR">Fecha de contratación</label>
                </FloatLabel>
                <FloatLabel>
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
                    />
                    <label htmlFor="companyR">Empresa</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText id="jobR" value={job} onChange={e => setJob(e.target.value)} required />
                    <label htmlFor="jobR">Puesto</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText id="departmentR" value={department} onChange={e => setDepartment(e.target.value)} required />
                    <label htmlFor="departmentR">Departamento</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText id="emailR" value={email} onChange={e => setEmail(e.target.value)} required />
                    <label htmlFor="emailR">Correo electrónico</label>
                </FloatLabel>
                <FloatLabel>
                    <Password id="passwordR" value={password} onChange={e => setPw(e.target.value)} required toggleMask feedback={false} />
                    <label htmlFor="passwordR">Contraseña</label>
                </FloatLabel>
                <FloatLabel>
                    <Password id="confirmR" value={rPw} onChange={e => setRPw(e.target.value)} required toggleMask feedback={false} />
                    <label htmlFor="confirmR">Repetir contraseña</label>
                </FloatLabel>
                {(password.length != 0 && rPw.length != 0 && password !== rPw) && <Message severity="warn" text="Las contraseñas no coinciden" />}
                <Button type="submit" label="Crear cuenta y registrarse" className="p-mt-2" icon="pi pi-user-plus" />
            </form>
        </div>
    );
}