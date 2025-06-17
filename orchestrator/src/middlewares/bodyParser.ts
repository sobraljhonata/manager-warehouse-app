import { NextFunction, Request, Response } from 'express';

export const bodyParser = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.body) {
    next();
    return;
  }

  try {
    if (typeof req.body === 'string') {
      req.body = JSON.parse(req.body);
    }
    next();
  } catch (e) {
    next(new Error('Invalid JSON format'));
  }
}; 