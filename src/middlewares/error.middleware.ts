import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

export const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof Error ? 400 : 500;
    const message = error.message || 'Une erreur est survenue';
    error = new ApiError(statusCode, message, false);
  }
  next(error);
};  

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode, message } = err;
  
  const response = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
