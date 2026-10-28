import { AuthenticatedUser } from "../middlewares/requireAuth";

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedUser;
    }
  }
}
