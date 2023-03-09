import { NextFunction, Request, Response } from 'express';
import { admin } from '../firebase';

export const requiresAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req?.token) {
    return res
      .status(401)
      .json({ error: 'authentication', message: 'Missing authentication token' });
  }

  try {
    const userInfo = await admin.auth().verifyIdToken(req.token);
    req.user = userInfo;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: 'authentication', message: 'You are not authorized to make this request' });
  }
};
