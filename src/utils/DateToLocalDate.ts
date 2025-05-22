import { LocalDate } from "@js-joda/core"

export const DateToLocalDate = (date: Date) => {
    return LocalDate.parse(date.toISOString().substring(0, 10));
}