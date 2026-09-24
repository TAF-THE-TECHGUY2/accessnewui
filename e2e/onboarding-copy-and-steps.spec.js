import { expect, test } from "@playwright/test";

/**
 * The review fixes from the accredited onboarding walkthrough: three copy
 * corrections, the two legal links that went nowhere, and the step numbers
 * shown inside the onboarding modals.
 *
 * The step assertions are the reason this drives a browser. Every screen reads
 * its number out of the same `buildSteps` array, and the only way to prove the
 * modals agree with the tracker that opened them is to open them.
 */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const INVESTOR_EMAIL = process.env.E2E_STEP_INVESTOR_EMAIL ?? "steps@example.com";
const INVESTOR_PASSWORD = process.env.E2E_STEP_INVESTOR_PASSWORD ?? "password123";

if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(BASE) && !process.env.E2E_ALLOW_REMOTE) {
  throw new Error(
    `Refusing to run against ${BASE} — this test signs in as a seeded investor.\n` +
      `Set E2E_ALLOW_REMOTE=1 to confirm.`,
  );
}

/** Fills only what's needed to prove the form survives a click on a legal link. */
async function fillSomeOfTheForm(page) {
  await page.getByPlaceholder("First name").fill("Jane");
  await page.getByPlaceholder("Last name").fill("Doe");
  await page.getByPlaceholder("Email address").fill("jane.doe@example.com");
}

async function gotoCreateAccount(page) {
  await page.goto(`${BASE}/`);
  await page.getByRole("button", { name: /create investor account/i }).click();
  await expect(page.getByPlaceholder("First name")).toBeVisible();
}

test.describe("Accredited onboarding — review fixes", () => {
  test("welcome page carries the corrected fund wording", async ({ page }) => {
    await page.goto(`${BASE}/`);

    await expect(
      page.getByText("Advised by Access Investment Management, Inc."),
    ).toBeVisible();
    await expect(
      page.getByText("Accredited investor status verified before investment"),
    ).toBeVisible();

    // The superseded wording must be gone, not merely outnumbered.
    await expect(page.getByText("Managed by Access Investment")).toHaveCount(0);
    await expect(
      page.getByText("Accredited status verified before commitment"),
    ).toHaveCount(0);
  });

  test("newsletter checkbox carries the corrected wording and still toggles", async ({
    page,
  }) => {
    await gotoCreateAccount(page);

    const checkbox = page.locator('input[name="receiveUpdates"]');
    await expect(
      page.getByText("Receive updates and insights from Access Properties"),
    ).toBeVisible();
    await expect(page.getByText("Receive updates from Access Properties")).toHaveCount(0);

    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test("legal links follow whatever admins configured in settings", async ({
    page,
    context,
  }) => {
    // Admins maintain these under Settings -> Legal links; the page must render
    // what the API returns rather than anything baked into the bundle.
    await context.route("**/api/legal-links", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          termsOfUseUrl: "https://www.ap.boston/legal/terms-v2",
          privacyPolicyUrl: "https://www.ap.boston/legal/privacy-v2",
        }),
      }),
    );

    await gotoCreateAccount(page);

    await expect(page.getByRole("link", { name: "Terms of Use" })).toHaveAttribute(
      "href",
      "https://www.ap.boston/legal/terms-v2",
    );
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "https://www.ap.boston/legal/privacy-v2",
    );
  });

  test("legal links fall back to the bundled defaults when settings are unreachable", async ({
    page,
    context,
  }) => {
    await context.route("**/api/legal-links", (route) => route.abort());

    await gotoCreateAccount(page);

    // A failed lookup must not leave the consent boxes next to a dead link.
    await expect(page.getByRole("link", { name: "Terms of Use" })).toHaveAttribute(
      "href",
      "https://www.ap.boston/terms-of-use",
    );
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "https://www.ap.boston/privacy-policy",
    );
    await expect(page.getByRole("button", { name: /create account/i })).toBeEnabled();
  });

  test("legal links open the real pages without disturbing the form", async ({
    page,
    context,
  }) => {
    // Stubbed so the assertion is about this app's links, not the marketing
    // site's uptime.
    await context.route("https://www.ap.boston/**", (route) =>
      route.fulfill({ contentType: "text/html", body: "<h1>legal page</h1>" }),
    );

    await gotoCreateAccount(page);
    await fillSomeOfTheForm(page);

    for (const [name, expectedUrl] of [
      ["Terms of Use", "https://www.ap.boston/terms-of-use"],
      ["Privacy Policy", "https://www.ap.boston/privacy-policy"],
    ]) {
      const link = page.getByRole("link", { name });
      await expect(link).toHaveAttribute("href", expectedUrl);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);

      const popup = await Promise.all([
        context.waitForEvent("page"),
        link.click(),
      ]).then(([opened]) => opened);
      await expect(popup).toHaveURL(expectedUrl);
      await popup.close();
    }

    // The form is still on screen, still filled, and the consent boxes were
    // not toggled by clicking the links inside their labels.
    await expect(page.getByPlaceholder("First name")).toHaveValue("Jane");
    await expect(page.getByPlaceholder("Email address")).toHaveValue(
      "jane.doe@example.com",
    );
    await expect(page.locator('input[name="acceptTerms"]')).not.toBeChecked();
    await expect(page.locator('input[name="acceptPrivacy"]')).not.toBeChecked();
  });
});

test.describe("Accredited onboarding — step numbering", () => {
  const EXPECTED_STEPS = [
    "Review offering documents",
    "Verify your identity",
    "Verify accredited investor status",
    "Complete subscription documents",
    "Fund your subscription",
    "Investment confirmed",
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByPlaceholder("name@email.com").fill(INVESTOR_EMAIL);
    await page.locator('input[type="password"]').fill(INVESTOR_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/);
    await expect(page.getByText("Verify your identity")).toBeVisible();
  });

  test("the tracker numbers all six steps in the expected order", async ({ page }) => {
    for (const [index, title] of EXPECTED_STEPS.entries()) {
      await expect(
        page.getByRole("heading", { name: `${index + 1}. ${title}` }),
      ).toBeVisible();
    }
  });

  test("identity verification reports step 2, not step 1", async ({ page }) => {
    await page
      .getByRole("listitem")
      .filter({ hasText: "Verify your identity" })
      .getByRole("button")
      .click();

    await expect(
      page.getByRole("heading", { name: "Identity verification" }),
    ).toBeVisible();
    await expect(page.getByText("Step 2 of 6 \u00b7 Persona")).toBeVisible();
    // Scoped to the eyebrow: the tracker header legitimately reads "STEP 1 OF 6"
    // here, because the optional document review is still the first incomplete
    // step. The bug was the modal claiming step 1 for itself.
    await expect(page.getByText("Step 1 \u00b7 Persona")).toHaveCount(0);
    await expect(page.getByText("Step 1 of 6 \u00b7 Persona")).toHaveCount(0);
  });

  test("the header counts the step the investor is actually on", async ({ page }) => {
    // Regression: this used to read "STEP 1 OF 6" until the investor opened the
    // documents modal, because the counter pointed at the first incomplete
    // step and the optional review step is never complete on a fresh browser.
    await expect(page.getByText("STEP 2 OF 6")).toBeVisible();
    await expect(page.getByText("STEP 1 OF 6")).toHaveCount(0);
  });

  test("offering documents keeps step 1 when reopened after moving on", async ({
    page,
  }) => {
    const openDocs = page.getByRole("button", { name: /view documents/i });

    await openDocs.click();
    await expect(page.getByText("Step 1 of 6 \u00b7 Offering documents")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();

    // Reopening it is the "navigate backwards" case: viewing the documents
    // marks the step complete, and the modal must still call itself step 1.
    await openDocs.click();
    await expect(page.getByText("Step 1 of 6 \u00b7 Offering documents")).toBeVisible();
    await expect(page.getByText("STEP 2 OF 6")).toBeVisible();
  });

  test("step numbers survive a reload with restored progress", async ({ page }) => {
    await page.getByRole("button", { name: /view documents/i }).click();
    await page.getByRole("button", { name: "Close" }).click();
    await page.reload();

    // docsViewed is restored from local storage; the counter must not drift
    // because of it, and the per-step numbers stay pinned to the workflow order.
    await expect(page.getByText("STEP 2 OF 6")).toBeVisible();
    for (const [index, title] of EXPECTED_STEPS.entries()) {
      await expect(
        page.getByRole("heading", { name: `${index + 1}. ${title}` }),
      ).toBeVisible();
    }
  });
});
