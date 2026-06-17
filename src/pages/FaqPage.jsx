import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  Calculator,
  ChevronDown,
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

  // 1. FAQ items — live, with static fallback
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/faq`)
      .then((r) => r.json())
      .then((data) =>
        setItems(Array.isArray(data) && data.length ? data : faqItems),
      )
      .catch(() => setItems(faqItems));
  }, []);

  // 2. Page config — live, with static fallback
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
  useEffect(() => {
    categories.forEach((cat) => {
      if (!refs.current[cat.key]) refs.current[cat.key] = React.createRef();
    });
  }, [categories]);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));
  const scrollToSection = (key) =>
    refs.current[key]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  const grouped = categories.map((cat) => ({
    ...cat,
    items: items.filter(
      (item) => (item.category || "").toLowerCase() === cat.key.toLowerCase(),
    ),
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="relative h-[597px] bg-cover bg-center"
        style={{
          backgroundImage: config.heroImage
            ? `url(${config.heroImage})`
            : "linear-gradient(135deg,#1f2937,#111827)",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />

        {/* Back to onboarding */}
        <div className="absolute left-6 top-6 z-10 sm:left-10 sm:top-8">
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-white/30 bg-white/10 px-4 text-[13px] font-medium text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to onboarding
          </Link>
        </div>

        <div className="relative flex h-full flex-col items-center justify-center px-4">
          <div className="w-full max-w-6xl">
            <div className="mx-auto rounded-xl border border-white/10 bg-black/70 px-6 py-7 shadow-lg backdrop-blur-md md:px-10">
              <h1 className="text-center text-3xl font-semibold text-white md:text-5xl">
                {config.heroTitle || "Frequently Asked Questions"}
              </h1>
            </div>
            {config.heroSubtitle ? (
              <div className="mx-auto mt-6 max-w-2xl rounded-md border border-white/10 bg-black/55 px-5 py-3 backdrop-blur-sm">
                <p className="text-center text-[15px] leading-relaxed text-white md:text-base">
                  {config.heroSubtitle}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Sticky category nav */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-5 py-4 pt-6 md:px-8 lg:px-16">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => {
              const Icon = getIcon(cat.iconName);
              return (
                <button
                  key={cat.key}
                  onClick={() => scrollToSection(cat.key)}
                  className="flex items-center gap-2 border border-gray-600 bg-gray-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                >
                  <Icon className="h-4 w-4" />
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Accordions */}
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 lg:px-16">
        {grouped.map((cat) => {
          const Icon = getIcon(cat.iconName);
          return (
            <section
              key={cat.key}
              className="scroll-mt-40 pt-20"
              ref={refs.current[cat.key]}
            >
              <div className="mb-6 flex items-center gap-3">
                <Icon className="h-6 w-6 text-gray-900" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {cat.title}
                </h2>
              </div>
              <div className="space-y-4">
                {cat.items.map((item) => {
                  const open = openId === item._id;
                  return (
                    <div
                      key={item._id}
                      className="mx-auto w-full max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      <button
                        onClick={() => toggle(item._id)}
                        className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 shrink-0 text-gray-800" />
                          <span className="text-[15px] font-semibold text-gray-900 md:text-base">
                            {item.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      {open ? (
                        <div
                          className="whitespace-pre-line px-5 pb-5 text-[14px] leading-relaxed text-gray-700 md:text-[15px]"
                          dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
