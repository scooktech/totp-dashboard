import { test, expect } from "@playwright/test";

test("rejects requests without a valid authentication token", async ({
  request,
}) => {
  const responseWithoutToken = await request.get("/api/auth/welcome");

  expect(responseWithoutToken.status()).toBe(401);

  const responseWithInvalidToken = await request.get("/api/auth/welcome", {
    headers: {
      Authorization: "Bearer invalid-token",
    },
  });

  expect(responseWithInvalidToken.status()).toBe(401);
});
