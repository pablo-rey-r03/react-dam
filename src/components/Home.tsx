import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getEmployeeById } from "../service/EmployeeService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { Toast } from "primereact/toast";
import type JWTDecoded from "../model/JWTDecoded";
import type Employee from "../model/Employee";
import type Company from "../model/Company";
import { useNavigate } from "react-router-dom";
import { getDocsByEmpId } from "../service/DocService";
import type Doc from "../model/Doc";
import { Button } from "primereact/button";

export const Home: React.FC = (): ReactNode => {
    const employeeId = jwtDecode<JWTDecoded>(localStorage.getItem("token")!).employee_id;

    const [employee, setEmployee] = useState<Employee>();
    const [company, setCompany] = useState<Company>();
    const [docs, setDocs] = useState<Doc[]>();

    const toast = useRef<Toast>(null);
    const navigate = useNavigate();

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

    return (
        <div className="p-6 space-y-8">
            <Toast ref={toast} />
            <h2 className="text-2x1 font-semibold text-white">
                {company ? (
                    <span className="text-purple-300">Tus documentos</span>
                ) : "Cargando..."}
                <Button
                    icon="pi pi-file-plus"
                    label="Subir documento"
                    className="p-button-success ml-4"
                    onClick={() => navigate("/home/formDoc")} />
            </h2>

            <div className="flex overflow-x-auto overflow-y-visible group space-x-4 pb-2 group-hover:overflow-visible">
                {docs && (docs.length > 0) ? docs?.map(doc => (
                    <div
                        key={doc.id}
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
                    >
                        <h3 className="text-lg font-medium mb-2 text-white">{doc.name}</h3>
                        <p className="text-sm text-gray-300">{doc.contractor.name}</p>
                        {doc.additional_info && <p className="text-sm mt-1 text-gray-400">{doc.additional_info}</p>}
                    </div>
                )) : (
                    <p className="text-gray-400">No has subido documentos</p>
                )}
            </div>
        </div>
    )
}