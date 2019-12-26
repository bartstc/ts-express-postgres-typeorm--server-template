import express from "express";

import { validationMiddleware } from "@middlewares/validation.middleware";
import { authMiddleware } from "@middlewares/auth.middleware";

import { RequestHandler } from "@global-types/request-handler";
import { Controller } from "@global-types/controller";

import { CreateUserDTO } from "./dto/create-user.dto";
import { LoginUserDTO } from "./dto/login-user.dto";
import { AuthService } from "./auth.service";

export class AuthController implements Controller {
  public path = "/auth";
  public router = express.Router();
  private authService = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes = (): void => {
    this.router
      .post(
        `${this.path}/signup`,
        validationMiddleware(CreateUserDTO),
        this.signUp
      )
      .post(
        `${this.path}/signin`,
        validationMiddleware(LoginUserDTO),
        this.signIn
      )
      .delete(this.path, authMiddleware, this.deleteAccount)
      .get(this.path, authMiddleware, this.getCurrentUser);
  };

  private signUp: RequestHandler = async (req, res, next) => {
    const userData: CreateUserDTO = req.body;

    try {
      const authData = await this.authService.signUp(userData);
      res.status(200).json(authData);
    } catch (err) {
      next(err); // allow errorMiddleware to handle catched error, throw default exception
    }
  };

  private signIn: RequestHandler = async (req, res, next) => {
    const loginData: LoginUserDTO = req.body;

    try {
      const authData = await this.authService.signIn(loginData);
      res.status(200).json(authData);
    } catch (err) {
      next(err);
    }
  };

  private deleteAccount: RequestHandler = async (req, res, next) => {
    try {
      await this.authService.deleteAccount(req.user.id);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  private getCurrentUser: RequestHandler = async (req, res, next) => {
    try {
      const { id, username } = req.user;
      res.status(200).json({ id, username });
    } catch (err) {
      next(err);
    }
  };
}
