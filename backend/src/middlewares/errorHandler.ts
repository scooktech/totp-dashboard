import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(error);

  if (error.message === "INVALID_CREDENTIALS") {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  if (error.message === "INVALID_AUTHORIZATION") {
    return res.status(401).json({
      message: "Invalid authorization",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
};
