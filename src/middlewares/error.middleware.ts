import { NextFunction, Request, Response } from "express";

import { HttpException } from "exceptions/http-exception";

export const errorMiddleware = (
  error: HttpException,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || "Something went wrong";
  res.status(status).send({
    message,
    status
  });
};

export default errorMiddleware;
