import { Toast } from "primereact/toast";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type SubcontractingRelationship from "../model/SubcontractingRelationship";
import type Doc from "../model/Doc";
import type { ValidationState } from "../model/enum/ValidationState";
import { jwtDecode } from "jwt-decode";
import type JWTDecoded from "../model/JWTDecoded";
import { getEmployeeById } from "../service/EmployeeService";
import { getSubcontractsRelationshipByContractorId } from "../service/CompanyService";
import { downloadFile, getDocsByEmpId, getDocsBySubId } from "../service/DocService";
import { Button } from "primereact/button";
import type Company from "../model/Company";
import type ErrorMessage from "../model/msg/ErrorMessage";

export const DocManager: React.FC = () => {

    const toast = useRef<Toast>(null);
    const [companyId, setCompanyId] = useState<number>();
    const [subRels, setSubRels] = useState<SubcontractingRelationship[] | undefined>([]);
    const [groupedDocs, setGroupedDocs] = useState<Record<number, { subDocs: Doc[]; empDocs: Doc[] }>>({});
    const [expandedSub, setExpandedSub] = useState<number | null>(null);

    const StateBorderClasses: Record<ValidationState, string> = {
        OK: "!border-green-600 !hover:border-green-400",
        VA: "!border-yellow-600 !hover:border-yellow-400",
        ER: "!border-red-600 !hover:border-red-400",
        EX: "!border-amber-800 !hover:border-amber-600"
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const empId = jwtDecode<JWTDecoded>(token).employee_id;
        getEmployeeById(empId)
            .then(emp => {
                setCompanyId(emp.company.id);
                return getSubcontractsRelationshipByContractorId(emp.company.id);
            })
            .then(res => setSubRels(res))
            .catch((err: ErrorMessage) => {
                if (err.status !== 204)
                    toast.current?.show({ severity: "error", summary: "Error", detail: err.detail, life: 3000 });
            });
    }, []);

    useEffect(() => {
        if (!companyId || !subRels || subRels.length === 0) return;

        const loadAll = async () => {
            const result: typeof groupedDocs = {};
            for (const rel of subRels) {
                const allDocs: Doc[] = await getDocsBySubId(rel.subcontract.id)
                    .then(docs => docs ?? [])
                    .catch((err: ErrorMessage) => {
                        toast.current?.show({ severity: "error", summary: "Error al obtener documentos", detail: err.detail, life: 3000 });
                        return [];
                    });

                const subDocs: Doc[] = allDocs.filter(d => !d.employee);
                const empDocs: Doc[] = allDocs.filter(d => !!d.employee);

                result[rel.subcontract.id] = { subDocs: subDocs, empDocs };

            }
            setGroupedDocs(result);
        };

        loadAll();
    }, [companyId, subRels]);


    const groupByEmployee = (docs: Doc[]) => {
        return docs.reduce((acc: Record<number, Doc[]>, doc) => {
            const empId = doc.employee?.id;
            if (empId) {
                if (!acc[empId]) acc[empId] = [];
                acc[empId].push(doc);
            }
            return acc;
        }, {});
    };

    const handleDownload = (docId: number) => {
        downloadFile(docId)
            .catch((err: ErrorMessage) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: err.detail,
                    life: 3000
                });
            })
    }

    return (
        <div className="space-y-4 p-6">
            <Toast ref={toast} />
            {!subRels || subRels.length === 0 ? (
                <p>Tu empresa no tiene relaciones contractuales con otras</p>
            ) : (
                subRels.map(rel => {
                    const subId = rel.subcontract.id;
                    const isOpen = expandedSub === subId;
                    const docs = groupedDocs[subId] || { subDocs: [], empDocs: [] };
                    const empGroups = groupByEmployee(docs.empDocs);

                    return (
                        <div key={subId} className="bg-gray-900 rounded-lg">
                            <button
                                className="w-full text-left p-4 flex justify-between items-center bg-gray-800 rounded-t-lg hover:bg-gray-700"
                                onClick={() => setExpandedSub(isOpen ? null : subId)}
                            >
                                <span className="text-xl font-semibold text-white">
                                    <span className="text-purple-300">{rel.subcontract.name}</span>
                                </span>
                                <i className={`pi pi-chevron-${isOpen ? 'up' : 'down'} text-white`} />
                            </button>

                            {isOpen && (
                                <div className="p-4 space-y-6">
                                    {docs.subDocs.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-200 mb-2">Documentos de la empresa</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {docs.subDocs
                                                    .filter(doc => !doc.employee)
                                                    .map(doc => (
                                                        <div
                                                            key={doc.id}
                                                            onClick={() => { /* set selected if needed */ }}
                                                            className={`w-75 bg-gray-800 rounded-2xl border-2 ${StateBorderClasses[doc.validation_state]} p-4 relative cursor-pointer`}
                                                        >
                                                            <h5 className="text-white font-medium truncate">{doc.name}</h5>
                                                            <p className="text-gray-400 text-sm">{doc.date.toString()}</p>
                                                            <div className="absolute top-2 right-2">
                                                                <Button
                                                                    icon="pi pi-download"
                                                                    className="p-button-rounded p-button-sm bg-gray-500 text-white
                                                                                hover:bg-blue-500 transition-colors m-1"
                                                                    severity="info"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownload(doc.id);
                                                                    }}
                                                                    tooltipOptions={{ position: "bottom" }}
                                                                />                                                               </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {Object.keys(empGroups).length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-200 mb-2">Documentos de empleados</h4>
                                            <div className="space-y-4">
                                                {Object.entries(empGroups).map(([empId, docs]) => (
                                                    <div key={empId} className="rounded-lg p-3">
                                                        <h5 className="text-md font-semibold text-gray-100 mb-2">
                                                            {docs[0].employee?.name} {docs[0].employee?.surname}
                                                        </h5>
                                                        <div className="flex flex-wrap gap-4">
                                                            {docs.map(doc => (
                                                                <div
                                                                    key={doc.id}
                                                                    className={`w-75 bg-gray-800 rounded-2xl border-2 ${StateBorderClasses[doc.validation_state]} p-4 relative cursor-pointer`}
                                                                    onClick={() => { /* set selected if needed */ }}
                                                                >
                                                                    <h5 className="text-white font-medium truncate">{doc.name}</h5>
                                                                    <p className="text-gray-400 text-sm">{doc.date.toString()}</p>
                                                                    <div className="absolute top-2 right-2">
                                                                        <Button
                                                                            icon="pi pi-download"
                                                                            className="p-button-rounded p-button-sm bg-gray-500 text-white
                                                                                hover:bg-blue-500 transition-colors m-1"
                                                                            severity="info"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDownload(doc.id);
                                                                            }}
                                                                            tooltipOptions={{ position: "bottom" }}
                                                                        />                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No docs case */}
                                    {docs.subDocs.length === 0 && Object.keys(empGroups).length === 0 && (
                                        <p className="text-gray-400">No hay documentos disponibles para esta subcontrata</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}