import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getEmployeeById } from "../service/EmployeeService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { Toast } from "primereact/toast";
import { getSubcontractsRelationshipByCompanyId } from "../service/CompanyService";
import type JWTDecoded from "../model/JWTDecoded";
import type Employee from "../model/Employee";
import type Company from "../model/Company";
import type SubcontractingRelationship from "../model/SubcontractingRelationship";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = (): ReactNode => {
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
                return getSubcontractsRelationshipByCompanyId(res.company.id);
            })
            .then(data => {
                setSubRels(data);
                const subLista = data.map((rel: SubcontractingRelationship) => rel.subcontract);
                setSubs(subLista);
            })
            .catch((err: ErrorMessage) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: err.detail,
                    life: 3000
                });
            })
    }, [employeeId]);

    const goToCompany = (id: number) => {
        navigate("/company")
    }

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-2x1 font-semibold">
                Subcontratas de
            </h2>
        </div>
    )
}