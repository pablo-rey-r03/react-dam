import type { LocalDate } from "@js-joda/core";
import type Company from "./Company";
import type Employee from "./Employee";
import type { ValidationState } from "./enum/ValidationState";

export default interface Doc {
    id: number;
    validation_state: ValidationState;
    contractor: Company;
    subcontract: Company;
    name: string;
    date: LocalDate;
    expiration_date?: LocalDate;
    validation_date?: LocalDate;
    employee?: Employee;
    additional_info?: string;
    file_path?: string;
}