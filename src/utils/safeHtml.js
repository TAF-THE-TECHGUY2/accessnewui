import DOMPurify from "dompurify";

/**
 * HTML from outside this app's code, made safe to insert.
 *
 * The admin console and the investor portal are one site, so a script that
 * runs on any page here can read both sign-in tokens from browser storage.
 * Keeps formatting, links and images; drops scripts, event handlers and
 * javascript: URLs.
 */
export const sanitizeHtml = (html) =>
  DOMPurify.sanitize(String(html ?? ""), { USE_PROFILES: { html: true } });
