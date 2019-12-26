import {Request } from 'express';

import {User} from "@modules/auth/user.entity";

export interface RequestWithUser extends Request {
  user: User;
}