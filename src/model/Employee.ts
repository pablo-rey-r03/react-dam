import type Company from "./Company";
import type { CountryCode } from "./enum/Country";

export default interface Employee {
  id: number,
  nif: string,
  name: string,
  surname?: string,
  active: boolean,
  country: CountryCode,
  startDate: string,
  endDate?: string,
  job: string,
  department: string,
  additionalInfo?: string,
  company: Company
}