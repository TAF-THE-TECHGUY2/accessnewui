import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { fetchLegalPage } from "../services/investorService";

const TITLES = {
  "terms-of-use": "Terms of Use",
  "privacy-policy": "Privacy Policy",
};

/**
 * A legal page, rendered from what an admin wrote.
 *
 * Public: a visitor reaches this from the create-account form before they have
 * an account, and terms behind a login are no terms at all.
 */
function LegalPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setPage(null);
    setError(null);

    fetchLegalPage(slug)
      .then((p) => {
        if (!cancelled) setPage(p);
      })
      .catch(() => {
        if (!cancelled) setError("This page hasn't been published yet.");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const heading = page?.title || TITLES[slug] || "Legal";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[760px] px-5 py-10 md:px-8 md:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[14px] text-[#6b7280] transition hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <h1 className="font-display mt-6 text-[28px] leading-tight text-[#111111] md:text-[34px]">
          {heading}
        </h1>

        {page?.updatedAt ? (
          <p className="mt-2 text-[13px] text-[#6b7280]">
            Last updated{" "}
            {new Date(page.updatedAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        ) : null}

        {error ? (
          <p className="mt-8 text-[14px] text-[#6b7280]">{error}</p>
        ) : page ? (
          <div
            className="rich-text mt-8 text-[15px] leading-7 text-[#1f2937]"
            // Authored by an admin behind authentication and stripped of
            // executable markup on the way in — see App\Support\LegalHtml.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
          />
        ) : (
          <p className="mt-8 text-[14px] text-[#6b7280]">Loading…</p>
        )}
      </div>
    </div>
  );
}

export default LegalPage;
