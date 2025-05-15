import type { CountryCode } from "./enum/Country";

export default interface Company {
  id: number;
  cif: string;
  name: string;
  country: CountryCode;
  address: string;
}