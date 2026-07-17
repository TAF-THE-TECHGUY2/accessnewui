---
name: verify
description: Build, run, and drive the Access Properties frontend (Vite React SPA) to verify changes at the browser surface.
---

# Verifying the Access Properties frontend

## Build / launch

- `npm run build` — fast (<1s), catches syntax/import errors.
- `npm run dev -- --port 5199 --strictPort` — dev server (run in background). App root `/` is the investor onboarding flow; `/faq`, `/login`, `/dashboard` (investor portal), `/admin/*`.

## Driving the UI

No Playwright browsers are installed on this machine, but Google Chrome is at
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Install
`puppeteer-core` in the scratchpad and launch with `executablePath` pointing at
Chrome, `headless: "new"`.

## Backend gotcha

The Laravel backend (`VITE_LARAVEL_PUBLIC_API_URL`, default
`http://localhost:8000/api`) is usually NOT running locally. To verify flows
that hit it (e.g. `POST /investors/register` on the onboarding Create Account
page), use puppeteer request interception to stub the response — and you MUST
also answer the CORS preflight `OPTIONS` request with
`Access-Control-Allow-Origin/Methods/Headers` headers, or the POST never fires
and the UI hangs on the submit.

Successful register response shape: `{ token, investor: { code } }` — the app
stores `token` and the Complete page then navigates to `/dashboard`.

## Flows worth driving

- Onboarding (3 pages): `/` Welcome → "Create Investor Account" → Profile form
  (validation: empty submit shows "Required" per field; password mismatch shows
  "Doesn't match"; API failure shows red banner) → Complete → "Continue to
  Investor Portal" → `/dashboard`.
