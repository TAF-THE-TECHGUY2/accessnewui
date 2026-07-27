import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  Calculator,
  Check,
  Coins,
  DollarSign,
  Lightbulb,
  Lock,
  Puzzle,
  Scale,
  Settings,
  Shield,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from "lucide-react";

import { faqConfig, faqItems } from "./faqFallback.js";

const API_BASE_URL = "https://api.ap.boston";

// Accent used to highlight the selected question card and its checkmark.
const ACCENT = "#1e2a5e";

const iconMap = {
  DollarSign,
  Scale,
  Settings,
  Calculator,
  Shield,
  ShieldCheck,
  Wrench,
  Briefcase,
  Building2,
  Lightbulb,
  TrendingUp,
  Coins,
  Lock,
  BadgeCheck,
  BarChart3,
  Puzzle,
};

const getIcon = (name) => {
  const key = String(name || "").trim().replace(/[\s_-]+/g, "").toLowerCase();
  const match = Object.keys(iconMap).find((k) => k.toLowerCase() === key);
  return iconMap[match] || Lightbulb;
};

export default function FaqPage() {
  const [items, setItems] = useState(faqItems);
  const [config, setConfig] = useState(faqConfig);
  const [openId, setOpenId] = useState(null);
  const refs = useRef({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/faq`)
      .then((r) => r.json())
      .then((data) =>
        setItems(Array.isArray(data) && data.length ? data : faqItems),
      )
      .catch(() => setItems(faqItems));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/pages/slug/faq`)
      .then((r) => r.json())
      .then((page) => {
        const section = page?.sections?.find((s) => s.type === "FAQ_PAGE");
        setConfig(section?.data || faqConfig);
      })
      .catch(() => setConfig(faqConfig));
  }, []);

  const categories = config.categories || [];

  // Store DOM nodes directly via ref callback so scrolling works on the first
  // click — no useEffect-then-render race condition.
  const setSectionRef = (key) => (node) => {
    if (node) refs.current[key] = node;
    else delete refs.current[key];
  };

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));
  const scrollToSection = (key) =>
    refs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });

  const grouped = categories.map((cat) => ({
    ...cat,
    items: items.filter(
      (item) => (item.category || "").toLowerCase() === cat.key.toLowerCase(),
    ),
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Back link */}
      <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8 lg:px-16">
        <Link
          to="/"
          className="inline-flex h-10 items-center gap-2 text-[14px] font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to onboarding
        </Link>
      </div>

      {/* Page title */}
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 lg:px-16">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">
          {config.heroTitle || "Frequently Asked Questions"}
        </h1>
        {config.heroSubtitle ? (
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-gray-500 md:text-base">
            {config.heroSubtitle}
          </p>
        ) : null}
      </div>

      {/* Sticky category nav */}
      <div className="sticky top-0 z-40 mt-8 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-5 py-4 pt-6 md:px-8 lg:px-16">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => {
              const Icon = getIcon(cat.iconName);
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => scrollToSection(cat.key)}
                  className="flex items-center gap-2 rounded-md bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                >
                  <Icon className="h-4 w-4" />
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category sections */}
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 lg:px-16">
        {grouped.map((cat) => {
          const Icon = getIcon(cat.iconName);
          const selected = cat.items.find((item) => item._id === openId);
          return (
            <section
              key={cat.key}
              ref={setSectionRef(cat.key)}
              className="scroll-mt-40 pt-20"
            >
              <div className="mb-2 flex items-center gap-3">
                <Icon className="h-6 w-6 text-gray-900" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {cat.title}
                </h2>
              </div>
              {cat.subtitle ? (
                <p className="mb-6 max-w-3xl text-[15px] leading-relaxed text-gray-500">
                  {cat.subtitle}
                </p>
              ) : (
                <div className="mb-6" />
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item) => {
                  const open = openId === item._id;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => toggle(item._id)}
                      className={`animate-fadeInUp flex items-center justify-between gap-2 rounded-md border bg-white px-4 py-3 text-left text-[15px] transition ${
                        open
                          ? "border-2 font-semibold shadow-sm"
                          : "border-gray-200 font-medium text-gray-800 hover:border-gray-400 hover:shadow-sm"
                      }`}
                      style={open ? { borderColor: ACCENT, color: ACCENT } : undefined}
                    >
                      <span>{item.question}</span>
                      {open ? (
                        <Check className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {selected ? (
                <div className="animate-fadeInUp mt-5 rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {selected.question}
                  </h3>
                  <div
                    className="whitespace-pre-line text-[14px] leading-relaxed text-gray-700 md:text-[15px]"
                    dangerouslySetInnerHTML={{ __html: selected.answerHtml }}
                  />
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </div>
  );
}
