import { test, expect } from "@playwright/test";

import { generateDemoTotp, waitForStableTotpWindow } from "./helpers/totp";

const demoUsername = process.env.DEMO_USERNAME;
const demoPassword = process.env.DEMO_PASSWORD;

if (!demoUsername || !demoPassword) {
  throw new Error("Demo credentials are not defined");
}

test("allows access with valid credentials and a valid TOTP code", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.getByLabel("Username").fill(demoUsername);
  await page.getByLabel("Password").fill(demoPassword);

  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Two-factor authentication",
    }),
  ).toBeVisible();

  await expect(page.getByText("Step 2 of 2")).toBeVisible();

  const authenticationCodeInput = page.getByLabel("Authentication code");

  await expect(authenticationCodeInput).toBeVisible();

  await waitForStableTotpWindow();

  const totpCode = generateDemoTotp();

  await authenticationCodeInput.fill(totpCode);

  await page.getByRole("button", { name: "Verify code" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Welcome to your dashboard",
    }),
  ).toBeVisible();

  await expect(page.getByText("Protected session")).toBeVisible();

  await expect(page).toHaveURL(/\/dashboard$/);
});
