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
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Top utility bar — back link */}
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-6">
        <Link
          to="/"
          className="inline-flex h-9 items-center gap-1.5 text-[12px] font-medium text-[#6b7280] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to onboarding
        </Link>
      </div>

      {/* Sticky pill nav */}
      <div className="sticky top-0 z-40 mt-4 bg-[#f8f8f6]/95 px-5 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const Icon = getIcon(cat.iconName);
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => scrollToSection(cat.key)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#5b6470] px-4 py-1.5 text-[12px] font-medium text-white shadow-sm transition hover:bg-[#3f4651]"
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl px-5 pb-16 sm:px-6">
        {grouped.map((cat) => {
          const Icon = getIcon(cat.iconName);
          return (
            <section
              key={cat.key}
              ref={refs.current[cat.key]}
              className="scroll-mt-24 pt-10"
            >
              <div className="mb-4 flex items-center gap-2 text-[#111111]">
                <Icon className="h-4 w-4 text-[#4b5563]" />
                <h2 className="text-[15px] font-semibold">{cat.title}</h2>
              </div>

              <div className="space-y-2.5">
                {cat.items.map((item) => {
                  const open = openId === item._id;
                  return (
                    <div
                      key={item._id}
                      className={`overflow-hidden rounded-[10px] border bg-white transition ${
                        open
                          ? "border-black/20 shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                          : "border-black/10"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(item._id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-[#fafafa]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0 text-[#6b7280]" />
                          <span className="truncate text-[13px] text-[#111111]">
                            {item.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      {open ? (
                        <div
                          className="whitespace-pre-line border-t border-black/8 px-4 py-4 text-[13px] leading-6 text-[#4b5563]"
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
