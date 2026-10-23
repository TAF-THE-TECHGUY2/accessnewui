import api, { setAuthToken } from "./api";
import { deviceTokenStore, makeTwoFactorApi } from "./twoFactorService";

const device = deviceTokenStore("access_admin_device");

export const adminTwoFactor = makeTwoFactorApi(api);

const finishSignIn = (data) => {
  setAuthToken(data.token);
  device.write(data.deviceToken);
  return { user: data.user, twoFactorSetupRequired: Boolean(data.twoFactorSetupRequired) };
};

/**
 * Either signs in, or — when the account has two-factor on and this browser
 * is not remembered — returns `{ twoFactorRequired, challenge }` for the code
 * step.
 */
export const login = async ({ email, password }) => {
  const { data } = await api.post("/login", {
    email,
    password,
    deviceToken: device.read(),
  });

  if (data.twoFactorRequired) {
    return { twoFactorRequired: true, challenge: data.challenge };
  }

  return finishSignIn(data);
};

export const completeTwoFactorLogin = async ({ challenge, code, recoveryCode, remember }) => {
  const { data } = await api.post("/login/two-factor", {
    challenge,
    code,
    recoveryCode,
    remember,
  });
  return finishSignIn(data);
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } finally {
    setAuthToken(null);
  }
};

export const me = async () => {
  const { data } = await api.get("/me");
  return data.user;
};
