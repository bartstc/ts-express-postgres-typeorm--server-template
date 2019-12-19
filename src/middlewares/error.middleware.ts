import { NextFunction, Request, Response } from "express";

import { HttpException } from "@exceptions/http-exception";

export const errorMiddleware = (
  { status = 500, message = "Something went wrong" }: HttpException,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  res.status(status).send({
    message,
    status
  });
};

export default errorMiddleware;
