import type React from "react";
import type Employee from "../model/Employee";
import { useEffect, useRef, useState } from "react";
import type Company from "../model/Company";
import type SubcontractingRelationship from "../model/SubcontractingRelationship";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { getEmployeeById } from "../service/EmployeeService";
import { getSubcontractsRelationshipByContractorId } from "../service/CompanyService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { jwtDecode } from "jwt-decode";
import type JWTDecoded from "../model/JWTDecoded";
import { getCountryName } from "../model/enum/Country";

export const Subs: React.FC = () => {

    const employeeId = jwtDecode<JWTDecoded>(localStorage.getItem("token")!).employee_id;

    const [employee, setEmployee] = useState<Employee>();
    const [company, setCompany] = useState<Company>();
    const [subRels, setSubRels] = useState<SubcontractingRelationship[]>();
    const [subs, setSubs] = useState<Company[]>();

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

    const goToCompany = (id: number) => {
        navigate("/company")
    }

    return (
        <div className="p-6 space-y-8">
            <Toast ref={toast} />
            <h2 className="text-2x1 font-semibold text-white">
                Subcontratas de{" "}
                {company ? (
                    <span className="text-purple-300 hover:underline cursor-pointer" onClick={() => goToCompany(company.id)}>{company.name}</span>
                ) : "Cargando..."}
            </h2>

            <div className="flex overflow-x-auto overflow-y-visible group space-x-4 pb-2 group-hover:overflow-visible">
                {subs && (subs.length > 0) ? subs?.map(sub => (
                    <div
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
                        onClick={() => goToCompany(sub.id)}>
                        <h3 className="text-lg font-medium mb-2 text-white">{sub.name}</h3>
                        <p className="text-sm text-gray-300">{sub.address}</p>
                        <p className="text-sm mt-1 text-gray-400">{getCountryName(sub.country)}</p>
                    </div>
                )) : (
                    <p className="text-gray-400">No hay empresas subcontratadas.</p>
                )}
            </div>
        </div>
    )
}