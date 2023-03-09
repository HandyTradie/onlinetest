import { AnyZodObject } from 'zod';
import { NextFunction, Response, Request } from 'express';

// Middleware to validate the request body against a schema
export const validate =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      return next();
    } catch (error) {
      return res
        .status(400)
        .json({ error: 'validation', message: 'Failed validation', validation: error });
    }
  };
