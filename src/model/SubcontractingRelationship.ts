import type { LocalDate } from "@js-joda/core";
import type Company from "./Company";

export default interface SubcontractingRelationship {
    id: {
        contractorId: number;
        subcontractId: number
    };
    contractor: Company;
    subcontract: Company;
    start_date: LocalDate;
    end_date?: LocalDate;
    additional_info?: string;
}