import type { LocalDate } from "@js-joda/core";

export default interface SubcontractingRelationshipDTO {
    startDate: LocalDate;
    endDate?: LocalDate | null;
    additionalInfo?: string | null;
}