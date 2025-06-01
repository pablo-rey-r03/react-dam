import type { LocalDate } from "@js-joda/core";
import type { CountryCode } from "../enum/Country";

export default interface EmployeeDTO {
    nif: string;
    name: string;
    surname?: string;
    startDate: LocalDate;
    job: string;
    department: string;
    country: CountryCode;
    additionalInfo?: string;
}