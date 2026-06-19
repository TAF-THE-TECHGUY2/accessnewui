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
    "The fund invests in a diversified portfolio of residential assets across Boston and its surrounding suburbs, targeting stable income and long-term appreciation through value-add investments.",
  whatWeInvestIn:
    "A diversified portfolio of residential assets across Boston and surrounding suburbs, targeting stable income and long-term appreciation through value-add investments.",
  howWeCreateValue:
    "A vertically integrated model with local sourcing and hands-on management, focused on overlooked assets where active execution seeks to unlock value.",
  investmentFocus: "Residential Real Estate",
  market: "Greater Boston",
  sponsor: "Access Properties LLC",
  structure: "Diversified Fund",
  management: "Access Investment Management, Inc.",
  minimumInvestment: 10000,
  investorType: "Accredited Investors",
  targetReturns: "Targeting 12–15% net IRR over the hold period",
  fees: "1.5% annual management fee · 20% performance fee above 8% preferred return",
  distributions: "Quarterly distributions of net operating income, subject to fund performance",
  documents: [
    { label: "Private Placement Memorandum (PPM)", href: "#" },
    { label: "Subscription Agreement", href: "#" },
    { label: "Limited Partnership Agreement", href: "#" },
    { label: "Form ADV Part 2", href: "#" },
  ],
  // Used by the View Fund Details modal — mirrors the portfolio card on the main site.
  detailStats: [
    { label: "Investment Focus", value: "Residential Real Estate" },
    { label: "Market", value: "Greater Boston" },
    { label: "Structure", value: "Diversified Fund" },
    { label: "Management", value: "Access Investment Management, Inc." },
    { label: "Inception", value: "2022" },
    { label: "Minimum Investment\n(Accredited Investors – Direct Offering)", value: "$10,000" },
    { label: "Minimum Investment\n(Non-Accredited – Through Third-Party Platform)", value: "$100" },
    { label: "Liquidity", value: "Structured Withdrawals" },
    { label: "Distributions", value: "Targeted annually" },
    { label: "Net Annual Return, 2025", value: "20.58%" },
    { label: "Net Total Return 2022-2025", value: "26.43%" },
    { label: "Net Total Return 2022-2025, Annualized", value: "6.19%" },
  ],
  footnote:
    "Non-accredited investors may access similar investments through a separate offering on a third-party platform. Terms and availability may differ. Distributions are not guaranteed and depend on investment results. Returns are presented net of fees and expenses unless otherwise noted. Past performance does not guarantee future results.",
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
