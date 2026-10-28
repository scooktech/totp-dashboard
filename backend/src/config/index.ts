import jwt from "jsonwebtoken";

interface AppConfig {
  environment: { port: string | number };
  db: { url: string };
  jwt: {
    secret: string;
    expiresIn: jwt.SignOptions["expiresIn"];
  };
  totp: { secret: string };
}

const config: AppConfig = {
  environment: {
    port: process.env.PORT || 3000,
  },
  db: {
    url: process.env.DATABASE_URL || "",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "",
    expiresIn: (process.env.JWT_EXPIRES_IN ||
      "30m") as jwt.SignOptions["expiresIn"],
  },
  totp: {
    secret: process.env.TOTP_SECRET || "",
  },
};

export default config;
