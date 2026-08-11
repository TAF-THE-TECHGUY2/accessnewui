import { useEffect, useState } from "react";
import { AlertCircle, Check, Info, Loader2, PlusCircle } from "lucide-react";

import {
  fetchFundPricePreview,
  recordInvestorInvestment,
} from "../../services/adminService";

const EMPTY = {
  amount: "",
  investmentDate: "",
  units: "",
  unitPrice: "",
  dateOaMipaSigned: "",
};

function Field({ label, name, value, onChange, type = "text", required, hint }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        step={type === "number" ? "any" : undefined}
        className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
      />
      {hint ? (
        <span className="mt-1 block text-[11px] text-gray-400">{hint}</span>
      ) : null}
    </label>
  );
}

/**
 * Records an additional investment against an existing investor.
 *
 * The create-investor form only handles the first one, so an investor with
 * several investments at different prices — the fund's normal case — previously
 * had no admin path at all.
 *
 * Units purchased is the authoritative input where the fund's records hold one;
 * the price is then contribution / units. The preview shows all three before
 * anything is written, because a wrong date silently yields a wrong unit count
 * that stays invisible until someone reconciles the position.
 */
function RecordInvestmentPanel({ investor, onInvestorUpdated }) {
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const fundCode = investor.investmentInfo?.fundCode ?? investor.fundCode;

  useEffect(() => {
    if (!form.investmentDate || !fundCode) {
      setPreview(null);
      setPreviewError(null);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);

    const timer = setTimeout(() => {
      fetchFundPricePreview(fundCode, {
        date: form.investmentDate,
        amount: Number(form.amount) || undefined,
        units: form.units ? Number(form.units) : undefined,
        unitPriceOverride: form.unitPrice ? Number(form.unitPrice) : undefined,
      })
        .then((data) => {
          if (!cancelled) setPreview(data);
        })
        .catch((err) => {
          if (cancelled) return;
          setPreview(null);
          setPreviewError(
            err?.response?.data?.message ||
              "Could not resolve a unit price for that date.",
          );
        })
        .finally(() => {
          if (!cancelled) setPreviewLoading(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fundCode, form.investmentDate, form.amount, form.units, form.unitPrice]);

  const handleChange = (event) => {
    setForm((curr) => ({ ...curr, [event.target.name]: event.target.value }));
    setDuplicateWarning(null);
  };

  const submit = async (event, allowDuplicate = false) => {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await recordInvestorInvestment(investor.id, {
        amount: Number(form.amount),
        investmentDate: form.investmentDate,
        units: form.units ? Number(form.units) : null,
        unitPrice: form.unitPrice ? Number(form.unitPrice) : null,
        dateOaMipaSigned: form.dateOaMipaSigned || null,
        allowDuplicate,
      });

      onInvestorUpdated(updated);
      setNotice(
        `Recorded $${Number(form.amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })} dated ${form.investmentDate}.`,
      );
      setForm(EMPTY);
      setPreview(null);
      setDuplicateWarning(null);
    } catch (err) {
      // 409 means an identical amount already exists on that date. Offer to
      // proceed rather than blocking outright — two genuinely identical same-day
      // investments are possible.
      if (err?.response?.status === 409) {
        setDuplicateWarning(
          err.response.data?.message ||
            "An identical investment already exists on that date.",
        );
      } else {
        const fieldError = err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat()[0]
          : null;
        setError(
          fieldError ||
            err?.response?.data?.message ||
            "Could not record the investment.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    Number(form.amount) > 0 && form.investmentDate && !busy;

  return (
    <section className="rounded-[22px] border border-black/10 bg-white p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-[12px] bg-[#eef5f4] p-2.5 text-[#0f4f4f]">
          <PlusCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-[20px] text-ink">
            Record an investment
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Adds a contribution to this investor&rsquo;s ledger, priced at the
            date of the deposit. Use this for historical entries and for
            additional investments at a different price.
          </p>
        </div>
      </div>

      {notice ? (
        <div className="mt-4 flex items-start gap-2 rounded-[10px] bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-[10px] bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Contribution ($)"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <Field
            label="Deposit date"
            name="investmentDate"
            type="date"
            value={form.investmentDate}
            onChange={handleChange}
            required
            hint="drives every holding-period figure"
          />
          <Field
            label="Units purchased"
            name="units"
            type="number"
            value={form.units}
            onChange={handleChange}
            hint="from the fund's records, if known"
          />
          <Field
            label="Unit price"
            name="unitPrice"
            type="number"
            value={form.unitPrice}
            onChange={handleChange}
            hint="ignored when units is set"
          />
          <Field
            label="OA / MIPA signed"
            name="dateOaMipaSigned"
            type="date"
            value={form.dateOaMipaSigned}
            onChange={handleChange}
            hint="optional, distinct from the deposit date"
          />
        </div>

        <p className="mt-2 text-[11px] leading-4 text-gray-500">
          Give <strong>units</strong> or a <strong>unit price</strong> — the other
          is derived from the contribution. Units takes precedence. With neither,
          the price falls back to the book value published on that date.
        </p>

        {previewLoading ? (
          <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Resolving the unit price…
          </p>
        ) : null}

        {previewError ? (
          <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-red-50 px-3 py-2.5 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{previewError}</span>
          </div>
        ) : null}

        {preview && !previewLoading ? (
          <div className="mt-3 rounded-[12px] border border-black/10 bg-[#f8faf9] p-4">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-gray-500" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                This will record
              </p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
                  Contribution
                </p>
                <p className="mt-0.5 text-[15px] font-semibold text-ink">
                  {preview.amount != null
                    ? `$${preview.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
                  Units
                </p>
                <p className="mt-0.5 text-[15px] font-semibold text-ink">
                  {preview.units != null
                    ? preview.units.toLocaleString("en-US", {
                        maximumFractionDigits: 6,
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
                  Unit price
                </p>
                <p className="mt-0.5 text-[15px] font-semibold text-ink">
                  ${preview.pricePerUnit.toFixed(6)}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {preview.priceSource}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-4 text-gray-500">
              {preview.bookValue != null ? (
                <>
                  Published book value on {preview.bookValueAsOf}:{" "}
                  <strong>${Number(preview.bookValue).toFixed(4)}</strong>
                </>
              ) : (
                <>
                  No book value is published on or before that date — the price
                  above comes from what you entered.
                </>
              )}
            </p>
          </div>
        ) : null}

        {duplicateWarning ? (
          <div className="mt-4 rounded-[12px] border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div>
                <p className="text-[13px] font-semibold text-amber-900">
                  Possible duplicate
                </p>
                <p className="mt-1 text-[12px] leading-5 text-amber-800">
                  {duplicateWarning}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-amber-800">
                  If this is a genuine second investment of the same amount on
                  the same day, record it anyway. Otherwise cancel — recording it
                  twice doubles the position.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => submit(e, true)}
                    disabled={busy}
                    className="inline-flex h-9 items-center rounded-[10px] bg-amber-700 px-4 text-xs font-medium text-white hover:bg-amber-800 disabled:opacity-50"
                  >
                    Record anyway
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicateWarning(null)}
                    className="inline-flex h-9 items-center rounded-[10px] border border-amber-300 px-4 text-xs font-medium text-amber-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-[#0f4f4f] px-5 text-sm font-medium text-white transition hover:bg-[#0c3f3f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            Record investment
          </button>
        </div>
      </form>
    </section>
  );
}

export default RecordInvestmentPanel;
