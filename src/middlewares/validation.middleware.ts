import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

import { HttpException } from "@exceptions/http-exception";
import { RequestHandler } from "@global-types/request-handler";

export const validationMiddleware = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any,
  skipMissingProperties = false
): RequestHandler => {
  return async (req, _, next) => {
    const errors = await validate(plainToClass(type, req.body), {
      skipMissingProperties
    });

    if (errors.length > 0) {
      // get first error message from array of ValidationErrors
      const message = Object.values(errors[0].constraints)[0];
      next(new HttpException(400, message));
    } else {
      next();
    }
  };
};
