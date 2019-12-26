import { User } from "@modules/auth/user.entity";

export interface UserData extends User {
  token: string;
}
