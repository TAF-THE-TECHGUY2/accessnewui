/**
 * Authenticator-app sign-in. The admin and investor APIs expose the same
 * endpoints under their own prefix, so each side builds its client from here.
 *
 * The device token behind "remember this device" lives beside the session
 * token. Signing out keeps it — that is the point of remembering — and the
 * server drops it after 30 days or when two-factor is reset.
 */
export const deviceTokenStore = (key) => ({
  read: () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  write: (token) => {
    try {
      if (token) window.localStorage.setItem(key, token);
    } catch {
      // Private mode: the device just isn't remembered.
    }
  },
});

export const makeTwoFactorApi = (client) => ({
  status: async () => (await client.get("/two-factor")).data,
  setup: async () => (await client.post("/two-factor/setup")).data,
  confirm: async (code) => (await client.post("/two-factor/confirm", { code })).data,
  addDevice: async (code) => (await client.post("/two-factor/add-device", { code })).data,
  regenerateRecoveryCodes: async (code) =>
    (await client.post("/two-factor/recovery-codes", { code })).data,
  forgetDevices: async () => (await client.delete("/two-factor/devices")).data,
  // Both need the risk warning accepted; the server records it.
  disable: async ({ password, code }) =>
    (await client.delete("/two-factor", { data: { password, code, acknowledged: true } })).data,
  optOut: async () => (await client.post("/two-factor/opt-out", { acknowledged: true })).data,
});

/** The message to show for a failed two-factor request. */
export const twoFactorError = (err, fallback = "Something went wrong. Please try again.") =>
  err?.response?.data?.message || fallback;
