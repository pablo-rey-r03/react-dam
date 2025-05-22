import type { LocalDate } from "@js-joda/core";
import type { ValidationState } from "../enum/ValidationState";

export default interface DocFormDTO {
    validationState: ValidationState;
    contractorId: number;
    subcontractId: number;
    name: string;
    date: LocalDate;
    expirationDate?: LocalDate;
    validationDate?: LocalDate;
    employeeId?: number;
    additionalInfo?: string;
}