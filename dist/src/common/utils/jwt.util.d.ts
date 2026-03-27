export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export declare function signJwt(payload: JwtPayload, secret: string, expiresInSeconds?: number): string;
export declare function hashPassword(password: string): string;
export declare function verifyPassword(password: string, hash: string): boolean;
