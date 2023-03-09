import { NextFunction, Request, Response } from 'express';

export const errorHandlingMiddleware = (
  err: APIHTTPError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.statusCode || 500).json({
    name: err.name,
    message: err.message
  });

  return next(err);
};

export enum StatusCodes {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500
}

export class APIHTTPError extends Error {
  statusCode: number;

  constructor(name: keyof typeof StatusCodes, message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.message = message;
    this.statusCode = StatusCodes[name];

    Error.captureStackTrace(this);
  }
}

export class InternalOPError extends APIHTTPError {
  constructor(message: string) {
    super('INTERNAL_SERVER_ERROR', message);
  }
}
