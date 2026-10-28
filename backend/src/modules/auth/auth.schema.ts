import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must contain at least 3 characters")
    .regex(/^\S+$/, "Username cannot contain spaces"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must contain at least 8 characters"),
});

export const twoFactorSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),

  code: z
    .string()
    .regex(/^\d{6}$/, "Authentication code must contain exactly 6 digits"),
});

export type LoginData = z.infer<typeof loginSchema>;
export type TwoFactorData = z.infer<typeof twoFactorSchema>;
