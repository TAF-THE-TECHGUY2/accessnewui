import axios from "axios";

import { setInvestorAuthToken } from "./investorApi";

const PUBLIC_API_BASE_URL =
  import.meta.env.VITE_LARAVEL_PUBLIC_API_URL || "http://localhost:8000/api";

const publicApi = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const parseAmount = (value) => {
  if (typeof value === "number") return value;
  const raw = String(value).trim();
  const suffix = raw.match(/([kKmMbB])\s*$/)?.[1]?.toLowerCase();
  const multiplier =
    suffix === "b" ? 1_000_000_000 : suffix === "m" ? 1_000_000 : suffix === "k" ? 1_000 : 1;
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return parsed * multiplier;
};

export const registerInvestor = async ({
  profile,
  experience,
  investmentAmount,
  accreditationStatus,
  password,
  passwordConfirmation,
}) => {
  const payload = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    password,
    password_confirmation: passwordConfirmation,
    mobilePhone: profile.mobilePhone || null,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2 || null,
    city: profile.city,
    stateProvince: profile.stateProvince,
    zipPostalCode: profile.zipPostalCode,
    country: profile.country,
    experience,
    investmentAmount: parseAmount(investmentAmount),
    accreditationStatus,
    receiveUpdates: Boolean(profile.receiveUpdates),
  };

  const { data } = await publicApi.post("/investors/register", payload);

  if (data?.token) {
    setInvestorAuthToken(data.token);
  }

  return data;
};
