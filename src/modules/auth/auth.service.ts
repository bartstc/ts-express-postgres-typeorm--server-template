import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";

import { DataStoredInToken } from "@global-types/data-stored-in-token";
import { TokenData } from "@global-types/token-data";
import { UserData } from "@global-types/user-data";

import { EmailOrUsernameInUseException } from "@exceptions/email-or-username-in-use-exception";
import { WrongCredentialsException } from "@exceptions/wrong-credentials-exception";
import { UserNotFoundException } from "@exceptions/user-not-found-exception";
import { HttpException } from "@exceptions/http-exception";

import { CreateUserDTO } from "./dto/create-user.dto";
import { LoginUserDTO } from "./dto/login-user.dto";
import { User } from "./user.entity";

export class AuthService {
  private userRepository = getRepository(User);

  signUp = async (userData: CreateUserDTO): Promise<Partial<UserData>> => {
    const existingUser = await this.userRepository
      .createQueryBuilder()
      .where("username = :username OR email = :email", {
        username: userData.username,
        email: userData.email
      })
      .getOne();

    if (existingUser) throw new EmailOrUsernameInUseException();

    const newUser = await this.userRepository.create(userData).save();

    const { token } = this.createToken(newUser);

    return { token, id: newUser.id, username: newUser.username };
  };

  signIn = async (loginData: LoginUserDTO): Promise<Partial<UserData>> => {
    const existingUser = await this.userRepository.findOne({
      email: loginData.email
    });

    if (!existingUser) {
      throw new WrongCredentialsException();
    }

    const isMatch = await bcrypt.compare(
      loginData.password,
      existingUser.password
    );

    if (!isMatch) {
      throw new WrongCredentialsException();
    }

    const user = { id: existingUser.id, username: existingUser.username };

    const { token } = this.createToken(existingUser);

    return { token, ...user };
  };

  deleteAccount = async (userId: number): Promise<void> => {
    const deletedUser = await this.userRepository.delete({ id: userId });

    if (deletedUser.affected === 0) throw new UserNotFoundException(userId);
  };

  createToken = (user: User): TokenData => {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      id: user.id
    };

    if (!secret) {
      throw new HttpException(500, "Something goes wrong");
    }

    const token = jwt.sign(dataStoredInToken, secret, { expiresIn });

    return { token };
  };
}
