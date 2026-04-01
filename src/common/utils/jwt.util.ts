import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

const SALT_ROUNDS = 12;

export function signJwt(payload: JwtPayload, secret: string, expiresInSeconds = 86400): string {
  return jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role },
    secret,
    { expiresIn: expiresInSeconds },
  );
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  // Support legacy SHA256 hashes during migration
  if (hash.length === 64 && !hash.startsWith('$2')) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password + 'midefensaperu_salt').digest('hex') === hash;
  }
  return bcrypt.compareSync(password, hash);
}
