// types/express/index.d.ts
import { Document, Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      identity?: Document & {
        _id: Types.ObjectId;
        username: string;
        email: string;
        authenticationPassword: string; 
        authenticationSessionToken?: string; 
      };
    }
  }
}
