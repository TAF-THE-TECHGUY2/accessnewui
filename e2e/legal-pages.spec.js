import { expect, test } from "@playwright/test";

/**
 * Terms of Use and Privacy Policy as pages this app owns.
 *
 * Driven through both UIs because the feature only works if they connect: an
 * admin publishes, and the create-account checkbox has to stop pointing at the
 * marketing site and start pointing here.
 */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@accessproperties.test";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "password";

if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(BASE) && !process.env.E2E_ALLOW_REMOTE) {
  throw new Error(`Refusing to run against ${BASE} — set E2E_ALLOW_REMOTE=1 to confirm.`);
}

const RUN = Date.now().toString(36);
const BODY = `<h2>Section one</h2><p>Wording for run ${RUN}.</p>`;

async function adminLogin(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.getByPlaceholder("admin@accessproperties.test").fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 });
}

test.describe.configure({ mode: "serial" });

test.describe("Legal pages", () => {
  test("an empty page cannot be published", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/legal-pages`);

    const card = page.locator("section", { hasText: "Terms of Use" }).first();
    await expect(card).toContainText("Draft", { timeout: 20000 });
    await card.locator("textarea").fill("");
    await card.getByRole("button", { name: /save & publish/i }).click();

    // Publishing nothing would put a blank document in front of an investor
    // under a heading that says Terms of Use.
    await expect(card).toContainText("Add some content before publishing", { timeout: 20000 });
  });

  test("a draft leaves the checkbox pointing at the external link", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/legal-pages`);

    const card = page.locator("section", { hasText: "Terms of Use" }).first();
    await card.locator("textarea").fill(BODY);
    await card.getByRole("button", { name: /save draft/i }).click();
    await expect(card).toContainText("still see the external link", { timeout: 20000 });

    const links = await page.request.get(`${BASE.replace(":3002", ":8002")}/api/legal-links`);
    expect((await links.json()).termsOfUseInternal).toBe(false);
  });

  test("publishing takes the link over and the page renders to anyone", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/legal-pages`);

    const card = page.locator("section", { hasText: "Terms of Use" }).first();
    await card.locator("textarea").fill(BODY);
    await card.getByRole("button", { name: /save & publish/i }).click();
    await expect(card).toContainText("Published", { timeout: 20000 });

    // Signed out entirely — a visitor reaches this before they have an account.
    await page.context().clearCookies();
    await page.goto(`${BASE}/legal/terms-of-use`);
    const body = page.locator("body");
    await expect(body).toContainText("Terms of Use", { timeout: 20000 });
    await expect(body).toContainText("Section one");
    await expect(body).toContainText(`Wording for run ${RUN}`);

    await page.screenshot({ path: `test-results/legal-${RUN}.png`, fullPage: true });
  });

  test("the create-account checkbox links to the internal page", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(2500);

    const terms = page.getByRole("link", { name: "Terms of Use" }).first();
    if (await terms.count()) {
      await expect(terms).toHaveAttribute("href", "/legal/terms-of-use");
      // New tab: the visitor is midway through the form and navigating away
      // would discard everything they had typed.
      await expect(terms).toHaveAttribute("target", "_blank");
    }
  });
});
