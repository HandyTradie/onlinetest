import { NextFunction, Response, Request } from 'express';

export const deserializeToken = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    req.token = req.headers.authorization.split(' ')[1];
  } else {
    req.token = null;
  }
  return next();
};
