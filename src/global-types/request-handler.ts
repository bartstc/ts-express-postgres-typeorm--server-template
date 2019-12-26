import { Response, NextFunction } from "express";

import { RequestWithUser } from "@global-types/request-with-user";

export type RequestHandler<T = void> = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => Promise<T>;
