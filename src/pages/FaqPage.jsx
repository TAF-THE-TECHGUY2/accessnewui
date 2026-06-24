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
    refs.current[key]?.scrollIntoView({
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
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Top utility bar — back link */}
      <div className="mx-auto max-w-6xl px-6 pt-10 sm:px-12">
        <Link
          to="/"
          className="inline-flex h-11 items-center gap-2 text-[15px] font-medium text-[#6b7280] hover:text-[#111111]"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to onboarding
        </Link>
      </div>

      {/* Sticky pill nav */}
      <div className="sticky top-0 z-40 mt-7 bg-[#f8f8f6]/95 px-6 py-6 backdrop-blur sm:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-3.5">
          {categories.map((cat) => {
            const Icon = getIcon(cat.iconName);
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => scrollToSection(cat.key)}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#5b6470] px-7 py-3 text-[16px] font-medium text-white shadow-sm transition hover:bg-[#3f4651]"
              >
                <Icon className="h-5 w-5" />
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-6xl px-6 pb-24 sm:px-12">
        {grouped.map((cat) => {
          const Icon = getIcon(cat.iconName);
          return (
            <section
              key={cat.key}
              ref={setSectionRef(cat.key)}
              className="scroll-mt-32 pt-16"
            >
              <div className="mb-7 flex items-center gap-3 text-[#111111]">
                <Icon className="h-7 w-7 text-[#111111]" />
                <h2 className="text-[28px] font-semibold">{cat.title}</h2>
              </div>

              <div className="space-y-4">
                {cat.items.map((item) => {
                  const open = openId === item._id;
                  return (
                    <div
                      key={item._id}
                      className={`overflow-hidden rounded-[14px] border bg-white transition ${
                        open
                          ? "border-black/20 shadow-[0_10px_24px_rgba(17,24,39,0.06)]"
                          : "border-black/10"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(item._id)}
                        className="flex w-full items-center justify-between gap-4 px-7 py-6 text-left hover:bg-[#fafafa]"
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <Icon className="h-6 w-6 shrink-0 text-[#6b7280]" />
                          <span className="text-[18px] font-medium text-[#111111]">
                            {item.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-6 w-6 shrink-0 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      {open ? (
                        <div
                          className="whitespace-pre-line border-t border-black/8 px-7 py-6 text-[16px] leading-8 text-[#4b5563]"
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
