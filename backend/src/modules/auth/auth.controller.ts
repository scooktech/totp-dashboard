import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  verifyTwoFactor: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.verifyTwoFactor(req.body);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  welcome: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = req.authenticatedUser;

      if (!authUser) {
        throw new Error("INVALID_AUTHORIZATION");
      }

      const result = authService.welcome(authUser);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
