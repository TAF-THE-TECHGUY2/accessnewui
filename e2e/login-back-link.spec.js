import { expect, test } from "@playwright/test";

/**
 * The Back link under Sign in, and the three states an admin can put it in.
 *
 * The endpoint is stubbed rather than driven through the admin panel: what
 * needs proving here is that the sign-in page renders whatever it is told,
 * including being told nothing.
 */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";

const serve = (page, loginBackUrl) =>
  page.route("**/api/public-settings", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        termsOfUseUrl: "https://www.ap.boston/terms-of-use",
        privacyPolicyUrl: "https://www.ap.boston/privacy-policy",
        loginBackUrl,
      }),
    }),
  );

const backLink = (page) => page.getByRole("link", { name: /^Back$/ });

test.describe("Sign-in page — Back link", () => {
  test("points where an admin configured it, below the Sign in button", async ({
    page,
  }) => {
    await serve(page, "https://www.ap.boston/invest");
    await page.goto(`${BASE}/login`);

    await expect(backLink(page)).toHaveAttribute(
      "href",
      "https://www.ap.boston/invest",
    );

    // "Under the Sign in button" is the requirement, so assert the geometry
    // rather than trusting source order. Width matters too: the form element is
    // itself the white panel, so a link placed after it floats outside the card
    // at the panel's full outer width instead of sitting inside with Sign in.
    const signIn = await page.getByRole("button", { name: /sign in/i }).boundingBox();
    const back = await backLink(page).boundingBox();
    expect(back.y).toBeGreaterThan(signIn.y);
    expect(Math.abs(back.width - signIn.width)).toBeLessThan(2);
    expect(Math.abs(back.x - signIn.x)).toBeLessThan(2);
  });

  test("is hidden when an admin clears the setting", async ({ page }) => {
    await serve(page, null);
    await page.goto(`${BASE}/login`);

    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(backLink(page)).toHaveCount(0);
  });

  test("stays hidden, and signing in still works, if settings are unreachable", async ({
    page,
  }) => {
    await page.route("**/api/public-settings", (route) => route.abort());
    await page.goto(`${BASE}/login`);

    // A missing way back must never cost the visitor the ability to sign in.
    await expect(page.getByRole("button", { name: /sign in/i })).toBeEnabled();
    await expect(page.getByPlaceholder("name@email.com")).toBeEditable();
    await expect(backLink(page)).toHaveCount(0);
  });
});
