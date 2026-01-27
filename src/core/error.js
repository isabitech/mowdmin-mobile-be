import { AppError } from "../Utils/AppError.js";
import { logger } from "./logger.js";
import { sendError } from "./response.js";

export { AppError };

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new (message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, res) => {
  logger.error("request_error", {
    statusCode: err.statusCode,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });

  return sendError(res, {
    statusCode: err.statusCode,
    status: err.status,
    message: err.message,
    meta: err?.meta,
    data: { stack: err.stack, error: err },
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return sendError(res, {
      statusCode: err.statusCode,
      status: err.status,
      message: err.message,
      meta: err?.meta,
    });
  }

  // Programming or other unknown error: don't leak error details
  logger.error("ERROR 💥", err);

  return sendError(res, {
    statusCode: 500,
    status: "error",
    message: "Something went very wrong!",
    meta: err?.meta,
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message; // Explicitly copy message as it's not enumerable

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  } else {
    // Default fallback (treat as dev or prod depending on preference, sticking to dev for visibility if not strictly prod)
    sendErrorDev(err, res);
  }
};
