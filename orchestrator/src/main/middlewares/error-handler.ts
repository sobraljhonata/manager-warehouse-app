import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../presentation/errors';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  console.error('Unexpected error:', error);
  return res.status(500).json({
    error: 'Internal server error'
  });
}; 