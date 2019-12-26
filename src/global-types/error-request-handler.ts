import { Response, NextFunction, Request } from "express";

import { HttpException } from "@exceptions/http-exception";

export type ErrorRequestHandler<T = void> = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;
