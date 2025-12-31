import { Request, Response, NextFunction } from "express";
import { apiError } from "../utils/apiError";
import { QueryFailedError } from "typeorm";

export const Error_Handler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error: apiError;

  // 1️⃣ If already a known apiError → reuse
  if (err instanceof apiError) {
    error = err;
  }
  // 2️⃣ TypeORM database errors
  else if (err instanceof QueryFailedError) {
    error = new apiError(
      400,
      "Database error",
      [],
      process.env.NODE_ENV === "development" ? err.stack : undefined
    );
  }
  // 3️⃣ Generic JS Error
  else if (err instanceof Error) {
    error = new apiError(
      500,
      err.message || "Something went wrong",
      [],
      process.env.NODE_ENV === "development" ? err.stack : undefined
    );
  }
  // 4️⃣ Truly unknown
  else {
    error = new apiError(500, "Something went wrong");
  }

  // 5️⃣ Response shape (controlled)
  const response = {
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};
