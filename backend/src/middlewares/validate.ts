import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultValidation = schema.safeParse(req.body);

    if (!resultValidation.success) {
      const fieldErrors: Record<string, string> = {};

      for (const issue of resultValidation.error.issues) {
        const fieldName = issue.path.join(".");
        fieldErrors[fieldName] = issue.message;
      }

      return res.status(400).json({
        message: "Validation error",
        errors: fieldErrors,
      });
    }

    req.body = resultValidation.data;

    next();
  };
};
