import { expect, test } from "@playwright/test";

/**
 * Declaring the accountant's quarterly fee and seeing it allocated.
 *
 * The website must not calculate this fee — it takes the accountant's total and
 * splits it by ownership. What this checks through the browser is that the
 * figure entered on the admin side is the figure the investor is shown a share
 * of, and that the portal presents it as informational rather than as a charge.
 */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@accessproperties.test";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "password";

if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(BASE) && !process.env.E2E_ALLOW_REMOTE) {
  throw new Error(`Refusing to run against ${BASE} — set E2E_ALLOW_REMOTE=1 to confirm.`);
}

const RUN = Date.now().toString(36);
const INVESTOR_EMAIL = `e2e-fee-${RUN}@example.com`;
const INVESTOR_PASSWORD = "password123";
const FUND_CODE = process.env.E2E_FUND_CODE ?? "aref-i";

// $1,435,000 gross asset value x 1% / 4.
const QUARTERLY_FEE = "3587.50";
const GROSS_ASSET_VALUE = "1435000";

async function adminLogin(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.getByPlaceholder("admin@accessproperties.test").fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 });
}

test.describe.configure({ mode: "serial" });

test.describe("Quarterly fee allocation", () => {
  let investorCode;

  test("admin creates an investor with a position", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/investors`);
    await page.getByRole("button", { name: "Add Investor" }).click();

    await page.getByLabel("First name").fill("Fee");
    await page.getByLabel("Last name").fill(`Run ${RUN}`);
    await page.getByLabel("Email (login)").fill(INVESTOR_EMAIL);
    await page.getByLabel(/Temporary password/).fill(INVESTOR_PASSWORD);
    await page.getByLabel("Address line 1").fill("1 Test Street");
    await page.getByLabel("City").fill("Boston");
    await page.getByLabel("State / Province").fill("MA");
    await page.getByLabel("ZIP / Postal").fill("02101");
    await page.getByLabel(/Commitment/).fill("121000");
    await page.getByLabel(/Investment date/).fill("2023-01-30");
    await page.getByLabel(/Units purchased/).fill("12100");

    await page.locator('button[type="submit"]', { hasText: /create investor/i }).click();
    await page.waitForURL(/\/admin\/investors\/inv-\d+/, { timeout: 30000 });
    investorCode = page.url().match(/inv-\d+/)?.[0];
    expect(investorCode).toMatch(/inv-\d+/);
    console.log(`  created ${investorCode} (${INVESTOR_EMAIL})`);
  });

  test("admin activates them so the portal is reachable", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/investors/${investorCode}`);
    await page.getByRole("button", { name: "Processing" }).click();
    await page.getByRole("button", { name: /Fully activate/i }).click();

    const modal = page.locator("div", { hasText: "Reason (required, 10+ chars)" }).last();
    await modal.locator("textarea").fill("End-to-end test: activating to check fee allocation");
    await modal.locator('input[type="number"]').fill("121000");
    await page.getByRole("button", { name: /apply override/i }).click();
    await page.getByRole("button", { name: /apply override/i }).click().catch(() => {});
    await page.waitForTimeout(4000);
  });

  test("the form shows the implied figure but records what was entered", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/funds/${FUND_CODE}`);

    const panel = page.locator("section", { hasText: "Declare fee" });
    await panel.locator('input[name="grossAssetValue"]').fill(GROSS_ASSET_VALUE);
    await panel.locator('input[name="totalAmount"]').fill(QUARTERLY_FEE);

    // The gross-asset-value cross-check is a convenience, not a calculation:
    // the accountant's figure is what gets stored.
    await expect(panel).toContainText("$3587.50", { timeout: 10000 });

    // Enter a total that disagrees with the implied figure — the form must warn
    // and still defer to what was typed.
    await panel.locator('input[name="totalAmount"]').fill("4000.00");
    await expect(panel).toContainText(/would be \$3587\.50, not \$4000\.00/, { timeout: 10000 });
    await expect(panel).toContainText(/figure you entered is what will be used/);
  });

  test("the declared total is allocated and reconciles", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/funds/${FUND_CODE}`);

    const panel = page.locator("section", { hasText: "Declare fee" });
    await panel.locator('input[name="grossAssetValue"]').fill(GROSS_ASSET_VALUE);
    await panel.locator('input[name="totalAmount"]').fill(QUARTERLY_FEE);
    await panel.locator('input[name="periodStart"]').fill("2026-04-01");
    await panel.locator('input[name="periodEnd"]').fill("2026-06-30");
    await panel.getByRole("button", { name: /record & allocate/i }).click();

    await expect(panel).toContainText(/Allocated \$3,587\.50 across \d+ investor/, {
      timeout: 20000,
    });
    // The failure mode this guards: allocations that do not sum to the books.
    await expect(panel).not.toContainText("do not sum to the entered total");

    await page.screenshot({
      path: `test-results/fee-01-admin-allocated-${RUN}.png`,
      fullPage: true,
    });
  });

  test("the portal shows the share as informational, not as a charge", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder("name@email.com").fill(INVESTOR_EMAIL);
    await page.locator('input[type="password"]').fill(INVESTOR_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 20000 });

    await page.getByRole("link", { name: /view details/i }).first().click();
    await page.waitForURL(/\/dashboard\/funds\//, { timeout: 20000 });
    await page.getByRole("button", { name: /^Fees/ }).click();

    const body = page.locator("body");

    await expect(body).toContainText("for transparency only", { timeout: 20000 });
    await expect(body).toContainText("already net of");
    await expect(body).toContainText("Do not subtract the amounts below again");

    // The fund's declared total and this investor's share of it, side by side.
    await expect(body).toContainText("$3,587.50");
    await expect(body).toContainText("2026-04-01 → 2026-06-30");
    await expect(body).toContainText("Fund total");
    await expect(body).toContainText("Your share");

    await page.screenshot({
      path: `test-results/fee-02-portal-disclosure-${RUN}.png`,
      fullPage: true,
    });
  });

  test.afterAll(async () => {
    if (investorCode) {
      console.log(
        `\n  Created ${investorCode} (${INVESTOR_EMAIL}) on ${BASE}.\n` +
          `    php artisan investors:clear --code=${investorCode} --force\n`,
      );
    }
  });
});
