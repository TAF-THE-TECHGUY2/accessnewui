// Centralised tokens for the redesigned onboarding flow.
// Tweak the constants here and every page picks up the change.

// Brand accent — soft violet. Swap to the final brand purple once design lands.
export const BRAND_PURPLE = "#7c6dff";
export const BRAND_PURPLE_DARK = "#6457e8";
export const BRAND_PURPLE_LIGHT = "#eeebff";
export const BRAND_INK = "#111111";
export const BRAND_INK_SOFT = "#4b5563";
export const BRAND_BG = "#f8f8f6";

// Hero photography — placeholder Unsplash URLs. Replace with brand assets later.
// Pre-sized for split-screen left columns.
export const HERO_IMAGES = {
  livingRoom:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
  modernInterior:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
  highRise:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80",
};

// Marketing copy block used in two places — fund overview card + complete page.
export const FUND_OVERVIEW = {
  code: "are-i",
  name: "Access Real Estate I",
  shortName: "Access Real Estate I",
  legalName: "Access Real Estate I LLC",
  description:
    "Designed to target consistent income and long-term value creation through a diversified portfolio of residential real estate investments.",
  whatWeInvestIn:
    "A diversified portfolio of residential assets across Boston and surrounding suburbs, targeting stable income and long-term appreciation through value-add investments.",
  howWeCreateValue:
    "A vertically integrated model with local sourcing and hands-on management, focused on overlooked assets where active execution seeks to unlock value.",
  investmentFocus: "Residential Real Estate",
  market: "Greater Boston",
  structure: "Diversified Fund",
  management: "Access Investment Management, Inc.",
  minimumInvestment: 10000,
  investorType: "Accredited Investors",
};

export const ECOSYSTEM = [
  {
    code: "ARE I",
    fullName: "Access Real Estate I LLC",
    role: "INVESTMENT VEHICLE",
    logo: "/assets/ARE%20I.png",
  },
  {
    code: "AIM",
    fullName: "Access Investment Management, Inc.",
    role: "INVESTMENT MANAGER",
    logo: "/assets/AIM.png",
  },
  {
    code: "APA",
    fullName: "Access Property Advisors LLC",
    role: "OPERATOR",
    logo: "/assets/APA.png",
  },
  {
    code: "AP",
    fullName: "Access Properties",
    role: "INVESTOR PLATFORM",
    logo: "/assets/AP.png",
  },
];

export const SUPPORT_EMAIL = "investors@ap.boston";
