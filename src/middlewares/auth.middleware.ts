import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";

import { User } from "@modules/auth/user.entity";

import { DataStoredInToken } from "@global-types/data-stored-in-token";

import { WrongAuthenticationTokenException } from "@exceptions/wrong-authentication-token-exception";
import { AuthenticationTokenMissingException } from "@exceptions/authentication-token-missing-exception";

import { RequestHandler } from "@global-types/request-handler";

export const authMiddleware: RequestHandler = async (req, _, next) => {
  const userRepository = getRepository(User);
  const token = req.header("x-auth-token");

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;

      if (secret) {
        const decoded = jwt.verify(token, secret) as DataStoredInToken;
        const user = await userRepository.findOne(decoded.id);
        if (user) {
          req.user = user;
          next();
        } else {
          next(new WrongAuthenticationTokenException());
        }
      }
    } catch (e) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
};
