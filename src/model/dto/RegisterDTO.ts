import type { LocalDate } from "@js-joda/core";
import type { CountryCode } from "../enum/Country";

export default interface RegisterDTO {
  email: string;
  password: string;
  nif: string;
  name: string;
  surname?: string;
  active: boolean;
  country: CountryCode;
  start_date: LocalDate;
  job: string;
  department: string;
  company_id: number
}