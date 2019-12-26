import { Response, Request, NextFunction } from "express";

export type RequestHandler<T = void> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;
