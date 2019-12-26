import { ErrorRequestHandler } from "@global-types/error-request-handler";

export const errorMiddleware: ErrorRequestHandler = async (
  { status = 500, message = "Something went wrong" },
  _,
  res,
  __
) => {
  res.status(status).send({
    message,
    status
  });
};

export default errorMiddleware;
