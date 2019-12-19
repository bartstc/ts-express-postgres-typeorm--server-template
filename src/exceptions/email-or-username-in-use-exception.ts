import { HttpException } from "./http-exception";

export class EmailOrUsernameInUseException extends HttpException {
  constructor() {
    super(409, `Email or username already taken`);
  }
}
