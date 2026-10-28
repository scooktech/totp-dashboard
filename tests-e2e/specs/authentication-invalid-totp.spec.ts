import { test, expect } from "@playwright/test";

import { generateInvalidDemoTotp } from "./helpers/totp";

const demoUsername = process.env.DEMO_USERNAME;
const demoPassword = process.env.DEMO_PASSWORD;

if (!demoUsername || !demoPassword) {
  throw new Error("Demo credentials are not defined");
}

test("rejects an invalid TOTP code", async ({ page }) => {
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

  const authenticationCodeInput = page.getByLabel("Authentication code");

  await expect(authenticationCodeInput).toBeVisible();

  const invalidTotpCode = generateInvalidDemoTotp();

  await authenticationCodeInput.fill(invalidTotpCode);

  await page.getByRole("button", { name: "Verify code" }).click();

  await expect(page.getByText("Invalid credentials")).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Two-factor authentication",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Welcome to your dashboard",
    }),
  ).not.toBeVisible();

  await expect(page).not.toHaveURL(/\/dashboard$/);
});
