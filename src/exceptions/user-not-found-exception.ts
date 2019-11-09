import { HttpException } from './http-exception';

export class UserNotFoundException extends HttpException {
  constructor(id: number) {
    super(404, `User with id ${id} not found`);
  }
}
