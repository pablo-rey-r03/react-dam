import type { CountryCode } from "../enum/Country";

export default interface CompanyDTO {
    name: string;
    cif: string;
    country: CountryCode;
    address: string
}