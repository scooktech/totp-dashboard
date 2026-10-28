import * as OTPAuth from "otpauth";

const createTotp = (secretBase32: string): OTPAuth.TOTP => {
  return new OTPAuth.TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
};

export const generateTotp = (
  secretBase32: string,
  timestampMs: number = Date.now(),
): string => {
  const totp = createTotp(secretBase32);

  return totp.generate({
    timestamp: timestampMs,
  });
};

export const verifyTotp = (
  secretBase32: string,
  providedCode: string,
  timestampMs: number = Date.now(),
): boolean => {
  const totp = createTotp(secretBase32);

  const validationResult = totp.validate({
    token: providedCode,
    timestamp: timestampMs,
    window: 1,
  });

  return validationResult !== null;
};
