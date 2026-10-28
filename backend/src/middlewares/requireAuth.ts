import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import config from "../config";

export type AuthenticatedUser = {
  userId: string;
  username: string;
};

const isJwtPayload = (payload: string | JwtPayload): payload is JwtPayload => {
  return typeof payload !== "string";
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw new Error("INVALID_AUTHORIZATION");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (!scheme || !token || scheme.toUpperCase() !== "BEARER") {
    throw new Error("INVALID_AUTHORIZATION");
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);

    if (
      !isJwtPayload(payload) ||
      typeof payload.sub !== "string" ||
      typeof payload.username !== "string"
    ) {
      throw new Error("INVALID_AUTHORIZATION");
    }

    const authenticatedUser = {
      userId: payload.sub,
      username: payload.username,
    };

    req.authenticatedUser = authenticatedUser;

    next();
  } catch {
    throw new Error("INVALID_AUTHORIZATION");
  }
};
