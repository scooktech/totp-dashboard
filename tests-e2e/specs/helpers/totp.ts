import * as OTPAuth from "otpauth";

const demoTOTPSecret = process.env.DEMO_TOTP_SECRET;

if (!demoTOTPSecret) {
  throw new Error("DEMO_TOTP_SECRET is not defined");
}

export const generateDemoTotp = (): string => {
  const totp = new OTPAuth.TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(demoTOTPSecret),
  });

  return totp.generate();
};

export const generateInvalidDemoTotp = (): string => {
  const validTotpCode = generateDemoTotp();
  const lastDigit = validTotpCode.endsWith("0") ? "1" : "0";

  return `${validTotpCode.slice(0, -1)}${lastDigit}`;
};

export const secondsRemainingInTotpPeriod = (): number => {
  const currentUnixTime = Math.floor(Date.now() / 1000);

  return 30 - (currentUnixTime % 30);
};

export const waitForStableTotpWindow = async (): Promise<void> => {
  while (secondsRemainingInTotpPeriod() <= 5) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};
