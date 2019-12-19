import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { Request } from "express";

import { DataStoredInToken } from "@global-types/data-stored-in-token.interface";
import { TokenData } from "@global-types/token-data.interface";

import { EmailOrUsernameInUseException } from "@exceptions/email-or-username-in-use-exception";
import { WrongCredentialsException } from "@exceptions/wrong-credentials-exception";
import { UserNotFoundException } from "@exceptions/user-not-found-exception";
import { HttpException } from "@exceptions/http-exception";

import { User } from "./user.entity";

import { CreateUserDTO } from "./dto/create-user.dto";
import { LoginUserDTO } from "./dto/login-user.dto";

export class AuthService {
  private userRepository = getRepository(User);

  signUp = async (userData: CreateUserDTO) => {
    const existingUser = await this.userRepository
      .createQueryBuilder()
      .where("username = :username OR email = :email", {
        username: userData.username,
        email: userData.email
      })
      .getMany();

    if (existingUser.length !== 0) throw new EmailOrUsernameInUseException();

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    const savedUser = await this.userRepository.save(newUser);
    const user = { id: savedUser.id, username: savedUser.username };

    const { token } = this.createToken(savedUser);

    return { token, ...user };
  };

  signIn = async (loginData: LoginUserDTO) => {
    const existingUser = await this.userRepository.findOne({
      email: loginData.email
    });

    if (existingUser) {
      const isMatch = await bcrypt.compare(
        loginData.password,
        existingUser.password
      );

      if (isMatch) {
        const user = { id: existingUser.id, username: existingUser.username };

        const { token } = this.createToken(existingUser);

        return { token, ...user };
      } else {
        throw new WrongCredentialsException();
      }
    } else {
      throw new WrongCredentialsException();
    }
  };

  deleteAccount = async (req: Request) => {
    const { id } = req.user;

    const deletedUser = await this.userRepository.delete({ id });

    if (deletedUser.affected === 0) throw new UserNotFoundException(id);
  };

  createToken = (user: User): TokenData => {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      id: user.id
    };

    if (secret) {
      const token = jwt.sign(dataStoredInToken, secret, { expiresIn });

      return { token };
    } else throw new HttpException(500, "Something goes wrong");
  };
}
