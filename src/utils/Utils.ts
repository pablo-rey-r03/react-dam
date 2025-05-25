import { LocalDate, ZoneOffset } from "@js-joda/core";
import { jwtDecode } from "jwt-decode";
import type JWTDecoded from "../model/JWTDecoded";

const Utils = {

    // Transforma de una fecha completa al formato yyyy-mm-dd
    DateToLocalDate: (date: Date) => {
        return LocalDate.of(date.getFullYear(), date.getMonth() + 1, date.getDate());
    },

    // Transforma de una fecha con formato yyyy-mm-dd a una fecha completa
    LocalDateToDate: (input: LocalDate | string): Date => {
        const localDate = typeof input === "string"
            ? LocalDate.parse(input)
            : input;
        const instant = localDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        return new Date(instant.toEpochMilli());
    },

    // Comprueba la existencia del token y si está expirado o no
    TokenIsValid: (token: string | null): boolean => {
        if (token) {
            return jwtDecode<JWTDecoded>(token).exp > Math.floor(Date.now() / 1000);
        }

        return false;
    },

    // Extrae la cadena conteniendo el nombre original del archivo, antes de guardarse en la bbdd
    GetOriginalFileName: (fileName: string): string => {
        const firstDash = fileName.indexOf('-');
        const secondDash = fileName.indexOf('-', firstDash + 1);
        const thirdDash = fileName.indexOf('-', secondDash + 1);
        return fileName.substring(thirdDash + 1);
    }
}

export default Utils;