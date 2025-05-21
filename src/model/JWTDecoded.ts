export default interface JWTDecoded {
    iss: string;
    sub: string;
    upn: string;
    groups: string[],
    iat: number,
    exp: number,
    employee_id: number,
    jti: string
}