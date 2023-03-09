import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export {};

declare global {
  namespace Express {
    export interface Request {
      token: string | null;
      user: DecodedIdToken | null;
    }
  }
}
