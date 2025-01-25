import { Request } from 'express';
import { IUser } from './model';
import { IInstructor } from './instructor';

export interface AuthenticatedRequest extends Request {
  user: IUser | IInstructor;
}