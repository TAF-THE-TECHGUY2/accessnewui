export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Units are held to six decimals in the ledger and shown to two everywhere an
 * investor sees them. formatNumber would round them to whole units, which for
 * a holding of 7,547.169811 is a different number.
 */
export const formatUnits = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

export const formatDate = (
  value,
  options = { month: "short", day: "numeric", year: "numeric" }
) => {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
};

export const formatDateTime = (value) =>
  formatDate(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const formatStatusLabel = (value = "") =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/**
 * What an investor's accreditation reads as. A Managing Member is still
 * accredited underneath — every pathway and document decision keys on the raw
 * status — so this only swaps the label, and only for display.
 */
export const accreditationDisplayStatus = (status, isManagingMember) =>
  isManagingMember && status === "accredited" ? "managing_member" : status;

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
