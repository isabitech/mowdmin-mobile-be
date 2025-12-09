import { AppError } from "../Utils/AppError.js";
import { logger } from "./logger.js";
import { sendError } from "./response.js";

export { AppError };

export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error("request_error", {
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  return sendError(res, {
    message,
    statusCode,
    data: process.env.NODE_ENV === "development" ? { stack: err.stack } : {},
  });
};
