import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import config from "../../config";
import { LoginData, TwoFactorData } from "./auth.schema";
import { findUserByUsername } from "../users/users.model";
import { verifyTotp } from "./totp.service";
import { AuthenticatedUser } from "../../middlewares/requireAuth";

type TwoFactorChallenge = {
  userId: string;
  username: string;
  expiresAt: number;
};

const twoFactorChallenges = new Map<string, TwoFactorChallenge>();

export const authService = {
  login: async (data: LoginData) => {
    const { username, password } = data;

    const user = await findUserByUsername(username);

    if (!user || !user.isActive) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const CHALLENGE_LIFE_MS = 60000;

    const challengeId = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + CHALLENGE_LIFE_MS;

    twoFactorChallenges.set(challengeId, {
      userId: user.id,
      username: user.username,
      expiresAt: expiresAt,
    });

    setTimeout(() => {
      twoFactorChallenges.delete(challengeId);
    }, CHALLENGE_LIFE_MS);

    return {
      challengeId,
      expiresAt,
    };
  },
  verifyTwoFactor: async (data: TwoFactorData) => {
    const { challengeId, code } = data;

    const challenge = twoFactorChallenges.get(challengeId);

    if (!challenge) {
      throw new Error("INVALID_CREDENTIALS");
    }

    twoFactorChallenges.delete(challengeId);

    const isValidCode = verifyTotp(config.totp.secret, code);

    if (!isValidCode) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = jwt.sign(
      {
        username: challenge.username,
      },
      config.jwt.secret,
      {
        subject: challenge.userId,
        expiresIn: config.jwt.expiresIn,
      },
    );

    return {
      token,
    };
  },
  welcome: (authUser: AuthenticatedUser) => {
    const { username } = authUser;

    return {
      message: `Welcome, ${username}! You have access to this protected route.`,
    };
  },
};
