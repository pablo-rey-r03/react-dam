import type { LocalDate } from "@js-joda/core";
import type Company from "./Company";
import type { CountryCode } from "./enum/Country";

export default interface Employee {
  id: number,
  nif: string,
  name: string,
  surname?: string,
  active: boolean,
  country: CountryCode,
  startDate: LocalDate,
  endDate?: LocalDate,
  job: string,
  department: string,
  additionalInfo?: string,
  company: Company
}