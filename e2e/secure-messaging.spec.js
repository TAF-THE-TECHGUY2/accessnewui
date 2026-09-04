import { expect, test } from "@playwright/test";

/**
 * The secure messaging round trip, through both UIs.
 *
 * The point of driving the browser here is that the feature only works if both
 * halves connect: an investor's thread has to reach the team's inbox, and the
 * team's reply has to land back in the portal. Either side passes its own API
 * tests while the pair is still broken.
 */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@accessproperties.test";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "password";

if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(BASE) && !process.env.E2E_ALLOW_REMOTE) {
  throw new Error(
    `Refusing to run against ${BASE} — this test creates a real investor.\n` +
      `Set E2E_ALLOW_REMOTE=1 to confirm.`,
  );
}

const RUN = Date.now().toString(36);
const INVESTOR_EMAIL = `e2e-msg-${RUN}@example.com`;
const INVESTOR_PASSWORD = "password123";
const SUBJECT = `Adding to my position ${RUN}`;
const INVESTOR_BODY = "Could you share the process and current availability?";
const TEAM_REPLY = "Happy to help — the next close is at the end of the quarter.";

async function adminLogin(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.getByPlaceholder("admin@accessproperties.test").fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 });
}

async function investorLogin(page) {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder("name@email.com").fill(INVESTOR_EMAIL);
  await page.locator('input[type="password"]').fill(INVESTOR_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
}

test.describe.configure({ mode: "serial" });

test.describe("Secure messaging", () => {
  let investorCode;

  test("admin creates an investor to message as", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/investors`);
    await page.getByRole("button", { name: "Add Investor" }).click();

    await page.getByLabel("First name").fill("Msg");
    await page.getByLabel("Last name").fill(`Run ${RUN}`);
    await page.getByLabel("Email (login)").fill(INVESTOR_EMAIL);
    await page.getByLabel(/Temporary password/).fill(INVESTOR_PASSWORD);
    await page.getByLabel("Address line 1").fill("1 Test Street");
    await page.getByLabel("City").fill("Boston");
    await page.getByLabel("State / Province").fill("MA");
    await page.getByLabel("ZIP / Postal").fill("02101");
    await page.getByLabel(/Commitment/).fill("25000");

    await page.locator('button[type="submit"]', { hasText: /create investor/i }).click();
    await page.waitForURL(/\/admin\/investors\/inv-\d+/, { timeout: 30000 });
    investorCode = page.url().match(/inv-\d+/)?.[0];
    expect(investorCode).toMatch(/inv-\d+/);
    console.log(`  created ${investorCode} (${INVESTOR_EMAIL})`);
  });

  test("admin activates the investor so the portal is reachable", async ({ page }) => {
    // Until an investor is activated the whole portal is replaced by the
    // onboarding tracker, Communications included — so secure messaging is
    // unreachable during onboarding, which is when an investor is most likely
    // to have a question. Flagged separately; this step just gets the test
    // past it.
    await adminLogin(page);
    await page.goto(`${BASE}/admin/investors/${investorCode}`);
    await page.getByRole("button", { name: "Processing" }).click();
    await page.getByRole("button", { name: /Fully activate/i }).click();

    const modal = page.locator("div", { hasText: "Reason (required, 10+ chars)" }).last();
    await modal.locator("textarea").fill("End-to-end test: activating to reach the portal");
    await modal.locator('input[type="number"]').fill("25000");

    await page.getByRole("button", { name: /apply override/i }).click();
    await page.getByRole("button", { name: /apply override/i }).click().catch(() => {});
    await page.waitForTimeout(4000);
  });

  test("the sidebar opens a thread with the topic already chosen", async ({ page }) => {
    await investorLogin(page);
    await page.goto(`${BASE}/dashboard/communications`);

    // Request a call is the interesting one: it has to land on the compose
    // form with its own category selected, not a blank general enquiry.
    await page.getByRole("button", { name: /request a call/i }).click();

    const compose = page.locator("form", { hasText: "New secure message" });
    await expect(compose).toBeVisible({ timeout: 20000 });
    await expect(compose.locator("select")).toHaveValue("call_request");
  });

  test("an investor opens a thread and it appears as awaiting a reply", async ({ page }) => {
    await investorLogin(page);
    await page.goto(`${BASE}/dashboard/communications`);
    await page.getByRole("button", { name: "Secure messages" }).click();
    await page.getByRole("button", { name: /new message/i }).click();

    const compose = page.locator("form", { hasText: "New secure message" });
    await compose.locator('input[name="subject"]').fill(SUBJECT);
    await compose.locator('textarea[name="body"]').fill(INVESTOR_BODY);
    await compose.getByRole("button", { name: /send securely/i }).click();

    const body = page.locator("body");
    await expect(body).toContainText(SUBJECT, { timeout: 20000 });
    await expect(body).toContainText(INVESTOR_BODY);
    await expect(body).toContainText("Awaiting response");

    await page.screenshot({
      path: `test-results/msg-01-investor-sent-${RUN}.png`,
      fullPage: true,
    });
  });

  test("the thread reaches the team inbox and a reply lands back in the portal", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/communications`);
    await page.getByRole("button", { name: "Secure messages" }).click();

    const inbox = page.locator("body");
    await expect(inbox).toContainText(SUBJECT, { timeout: 20000 });
    await expect(inbox).toContainText("Awaiting reply");
    await expect(inbox).toContainText(investorCode);

    await page.getByRole("button", { name: SUBJECT }).click();
    await expect(page.locator("body")).toContainText(INVESTOR_BODY, { timeout: 20000 });

    await page.locator("textarea").fill(TEAM_REPLY);
    await page.getByRole("button", { name: /^Send reply$/ }).click();
    await expect(page.locator("body")).toContainText(TEAM_REPLY, { timeout: 20000 });
    await expect(page.locator("body")).toContainText("Replied");

    await page.screenshot({
      path: `test-results/msg-02-admin-replied-${RUN}.png`,
      fullPage: true,
    });

    // Back to the portal: the reply has to be there, and it has to be marked
    // unread until the investor opens it.
    await investorLogin(page);
    await page.goto(`${BASE}/dashboard/communications`);
    await page.getByRole("button", { name: "Secure messages" }).click();

    const portal = page.locator("body");
    await expect(portal).toContainText(SUBJECT, { timeout: 20000 });
    await expect(portal).toContainText("1 new");

    await page.getByRole("button", { name: SUBJECT }).click();
    await expect(portal).toContainText(TEAM_REPLY, { timeout: 20000 });

    await page.screenshot({
      path: `test-results/msg-03-investor-received-${RUN}.png`,
      fullPage: true,
    });

    // Reading it clears the badge.
    await page.getByRole("button", { name: /back to messages/i }).click();
    await expect(portal).not.toContainText("1 new");
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
