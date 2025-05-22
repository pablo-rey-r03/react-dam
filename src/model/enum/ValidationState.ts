export const ValidationStates = {
    OK: "Validado",
    ER: "Erróneo",
    VA: "Pendiente de validación",
    EX: "Expirado",
} as const;

export type ValidationState = keyof typeof ValidationStates;