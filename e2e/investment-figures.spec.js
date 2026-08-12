import { expect, test } from "@playwright/test";

/**
 * Drives the whole path a fund manager actually takes, through the browser:
 * admin login, create an investor with the first investment, record two more,
 * then log in as that investor and check every displayed figure.
 *
 * Every expected value comes from the fund manager's calculations workbook.
 *
 * The point of driving the UI rather than the API is that two defects reached
 * him precisely because verification kept going through service methods and
 * skipping the form. A wrong unit count is invisible in the API response if the
 * form sent the wrong thing in the first place.
 *
 * Configure with env vars — defaults target a local dev server:
 *   E2E_BASE_URL        http://localhost:3002
 *   E2E_ADMIN_EMAIL     admin@accessproperties.test
 *   E2E_ADMIN_PASSWORD  password
 *   E2E_FUND_NAME       Access Real Estate Fund I
 *   E2E_ALLOW_REMOTE    required to point at anything but localhost
 */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@accessproperties.test";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "password";
const FUND_NAME = process.env.E2E_FUND_NAME ?? "Access Real Estate Fund I";

// This test creates a real investor with a real fund position. Against a live
// environment that is a row someone has to go and delete, so pointing at one is
// a decision that has to be stated, not something a bare `npx playwright test`
// can do by accident.
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(BASE) && !process.env.E2E_ALLOW_REMOTE) {
  throw new Error(
    `Refusing to run against ${BASE} — this test creates a real investor.\n` +
      `Set E2E_ALLOW_REMOTE=1 to confirm, and clean up afterwards with the\n` +
      `investors:clear command printed at the end of the run.`,
  );
}

// Unique per run so a rerun never collides with, or silently reuses, an earlier
// investor — and so cleanup can target exactly this run.
const RUN = Date.now().toString(36);
const INVESTOR_EMAIL = `e2e-${RUN}@example.com`;
const INVESTOR_PASSWORD = "password123";

/** The three investments, and what each must produce. */
const INVESTMENTS = [
  {
    contribution: "121000",
    units: "12100",
    date: "2023-01-30",
    expect: {
      unitPrice: "10.000000",
      unitsValue: "160,325.00",
      gain: "39,325.00",
      gainPct: "32.50%",
      years: "3.4141",
      annualized: "8.59%",
    },
  },
  {
    contribution: "404329.34",
    units: "40400",
    date: "2023-03-31",
    expect: {
      unitPrice: "10.008152",
      unitsValue: "535,300.00",
      gain: "130,970.66",
      gainPct: "32.39%",
      years: "3.2498",
      annualized: "9.02%",
    },
  },
  {
    contribution: "50140.82",
    units: "5000",
    date: "2023-05-01",
    expect: {
      unitPrice: "10.028164",
      unitsValue: "66,250.00",
      gain: "16,109.18",
      gainPct: "32.13%",
      years: "3.1650",
      annualized: "9.20%",
    },
  },
];

const TOTALS = {
  contribution: "575,470.16",
  units: "57,500",
  weightedAverageUnitPrice: "10.008177",
  unitsValue: "761,875.00",
  gain: "186,404.84",
  gainPct: "32.39%",
  wahp: "3.2770",
  annualized: "8.94%",
};

/**
 * Signs in to the admin console.
 *
 * Waits for the dashboard specifically, not /admin/*, because /admin/login also
 * matches that pattern — so a loose wait resolves while still on the login page
 * and the next navigation bounces straight back to it.
 */
async function adminLogin(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.getByPlaceholder("admin@accessproperties.test").fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 });
}

test.describe.configure({ mode: "serial" });

test.describe("Investment figures, end to end through the UI", () => {
  let investorCode;

  test("admin creates an investor with the first investment", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/investors`);
    await page.getByRole("button", { name: "Add Investor" }).click();

    const first = INVESTMENTS[0];

    await page.getByLabel("First name").fill("E2E");
    await page.getByLabel("Last name").fill(`Run ${RUN}`);
    await page.getByLabel("Email (login)").fill(INVESTOR_EMAIL);
    await page.getByLabel(/Temporary password/).fill(INVESTOR_PASSWORD);
    await page.getByLabel("Address line 1").fill("1 Test Street");
    await page.getByLabel("City").fill("Boston");
    await page.getByLabel("State / Province").fill("MA");
    await page.getByLabel("ZIP / Postal").fill("02101");

    await page.getByLabel(/Commitment/).fill(first.contribution);
    await page.getByLabel(/Investment date/).fill(first.date);
    await page.getByLabel(/Units purchased/).fill(first.units);
    // Unit price deliberately left blank — it must be derived.

    // The preview is the guard against a wrong unit count reaching the ledger.
    // Asserting it here is the whole reason this test drives the form.
    const preview = page.locator("text=This will record").locator("..").locator("..");
    await expect(preview).toContainText(first.expect.unitPrice, { timeout: 15000 });
    await expect(preview).toContainText("12,100");

    await page.screenshot({
      path: `test-results/01-create-preview-${RUN}.png`,
      fullPage: true,
    });

    // The modal's submit only — "Add Investor" on the page behind it also
    // matches a looser name.
    await page.locator('button[type="submit"]', { hasText: /create investor/i }).click();

    // Creating navigates to the new investor's detail page, so the code comes
    // from the URL rather than from scraping a paginated list.
    await page.waitForURL(/\/admin\/investors\/inv-\d+/, { timeout: 30000 });
    investorCode = page.url().match(/inv-\d+/)?.[0];
    expect(investorCode, "investor code should appear in the URL").toMatch(/inv-\d+/);
    console.log(`  created ${investorCode} (${INVESTOR_EMAIL})`);
  });

  test("admin records the second and third investments", async ({ page }) => {
    await adminLogin(page);

    for (const [index, inv] of INVESTMENTS.slice(1).entries()) {
      await page.goto(`${BASE}/admin/investors/${investorCode}`);
      await page.getByRole("button", { name: "Investments" }).click();

      // Scoped by name attribute: the OA / MIPA field's hint text mentions
      // "deposit date", so a label match is ambiguous.
      const panel = page.locator("section", { hasText: "Record an investment" });
      await panel.locator('input[name="amount"]').fill(inv.contribution);
      await panel.locator('input[name="investmentDate"]').fill(inv.date);
      await panel.locator('input[name="units"]').fill(inv.units);

      await expect(panel).toContainText(inv.expect.unitPrice, { timeout: 20000 });

      await page.screenshot({
        path: `test-results/02-record-${index + 2}-preview-${RUN}.png`,
        fullPage: true,
      });

      await panel.getByRole("button", { name: "Record investment" }).click();
      await expect(page.locator(`text=/Recorded .*${inv.date}/`)).toBeVisible({
        timeout: 20000,
      });
    }
  });

  test("fully activating does not double the position", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/investors/${investorCode}`);

    // Unlocks the portal's Investment tab, and doubles as the regression check:
    // this override forces an amount, and passing it to the funding path used to
    // record the same money a second time.
    await page.getByRole("button", { name: "Processing" }).click();
    await page.getByRole("button", { name: /Fully activate/i }).click();

    const modal = page.locator("div", { hasText: "Reason (required, 10+ chars)" }).last();
    await modal.locator("textarea").fill("End-to-end test: activating to verify the portal figures");

    // Assert the same total already in the ledger. Nothing should be minted.
    await modal.locator('input[type="number"]').fill(TOTALS.contribution.replace(/,/g, ""));

    await page.getByRole("button", { name: /apply override/i }).click();
    await page.getByRole("button", { name: /apply override/i }).click().catch(() => {});

    await page.waitForTimeout(4000);

    // The Funded figure derives from the ledger, so it is what would move if the
    // override re-minted. The admin panel renders currency without decimals.
    await page.goto(`${BASE}/admin/investors/${investorCode}`);
    await page.getByRole("button", { name: "Investments" }).click();

    const body = page.locator("body");
    await expect(body).toContainText("$575,470", { timeout: 20000 });
    // The original defect: the same money counted twice.
    await expect(body).not.toContainText("$1,150,940");

    await page.screenshot({
      path: `test-results/03-after-activate-${RUN}.png`,
      fullPage: true,
    });
  });

  test("the portal shows every figure from the workbook", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder("name@email.com").fill(INVESTOR_EMAIL);
    await page.locator('input[type="password"]').fill(INVESTOR_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 20000 });

    // The preceding test activated this investor, so the onboarding tracker
    // should be gone. If it is still showing, activation failed and that is the
    // finding — not something to skip past.
    await expect(
      page.locator("text=/Verify your identity/i"),
      "investor should be past onboarding after the activation step",
    ).toHaveCount(0, { timeout: 20000 });

    const body = page.locator("body");

    // Headline totals.
    await expect(body).toContainText(TOTALS.contribution, { timeout: 20000 });
    await expect(body).toContainText(TOTALS.unitsValue);
    await expect(body).toContainText(TOTALS.gain);
    await expect(body).toContainText(TOTALS.gainPct);
    await expect(body).toContainText(TOTALS.annualized);

    // Per-investment table: the price and value of every row.
    for (const inv of INVESTMENTS) {
      await expect(body).toContainText(inv.expect.unitPrice);
      await expect(body).toContainText(inv.expect.unitsValue);
      await expect(body).toContainText(inv.expect.gain);
    }

    // The weighted average that deliberately differs from his sheet.
    await expect(body).toContainText(TOTALS.weightedAverageUnitPrice);
    await expect(body).toContainText(TOTALS.wahp);

    // Never show cost basis as market value — a reported defect.
    await expect(body).not.toContainText("+0.00%");

    // Never invent a premium. Where any deposit predates the published price
    // series its book value is unknown, so no comparison is available — a
    // fabricated one produced "$7.90 book value plus a 26.8% entry premium"
    // against a real $10.01 entry price.
    await expect(body).not.toContainText(/entry premium/i);

    // One answer per question. The annualized return appeared twice with
    // different math, +8.94% in the table and +8.27% below it.
    await expect(body).not.toContainText("+8.27%");

    await page.screenshot({
      path: `test-results/04-portal-investment-tab-${RUN}.png`,
      fullPage: true,
    });
  });

  test.afterAll(async () => {
    if (investorCode) {
      console.log(
        `\n  Created ${investorCode} (${INVESTOR_EMAIL}) on ${BASE}.\n` +
          `  Remove it from that environment's backend with:\n` +
          `    php artisan investors:clear --code=${investorCode} --force\n`,
      );
    }
  });
});
