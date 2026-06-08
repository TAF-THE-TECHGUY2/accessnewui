import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

import {
  fetchFundingPaymentIntent,
  fetchFundingStatus,
} from "../../services/investorPortalService";

const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

function StripeFundingPanel({ investor, onInvestorUpdated }) {
  const [intent, setIntent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const data = await fetchFundingPaymentIntent();
      setIntent(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Could not load the funding payment. Please refresh.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePay = async () => {
    if (!intent?.clientSecret || !intent?.publishableKey) return;
    setConfirming(true);
    setError(null);

    try {
      const stripe = await loadStripe(intent.publishableKey);
      if (!stripe) throw new Error("Stripe.js failed to load.");

      // Step 1: open Financial Connections so the investor picks a bank
      // and attaches a payment_method to the PaymentIntent.
      const collectResult = await stripe.collectBankAccountForPayment({
        clientSecret: intent.clientSecret,
        params: {
          payment_method_type: "us_bank_account",
          payment_method_data: {
            billing_details: {
              name: investor?.name || "",
              email: investor?.email || "",
            },
          },
        },
      });

      if (collectResult.error) {
        setError(collectResult.error.message || "Bank linking failed.");
        return;
      }

      // The investor may have cancelled the modal — paymentIntent will still
      // exist but won't have a payment_method attached.
      if (!collectResult.paymentIntent?.payment_method) {
        setError("No bank account selected. Click the button again to retry.");
        return;
      }

      // The PI status after collect may already be past requires_confirmation
      // (Stripe's test mode often auto-confirms instantly). Only call confirm
      // if the PI is actually waiting for it.
      const piStatus = collectResult.paymentIntent.status;
      let finalStatus = piStatus;

      if (piStatus === "requires_confirmation") {
        const confirmResult = await stripe.confirmUsBankAccountPayment(intent.clientSecret);
        if (confirmResult.error) {
          setError(confirmResult.error.message || "Payment failed.");
          return;
        }
        finalStatus = confirmResult.paymentIntent?.status || "processing";
      }

      setStatus(finalStatus);
      const refreshed = await fetchFundingStatus();
      if (onInvestorUpdated && refreshed?.investmentStatus) {
        onInvestorUpdated({
          ...investor,
          investmentStatus: refreshed.investmentStatus,
          walletStatus: refreshed.walletStatus,
        });
      }
      await load();
    } catch (err) {
      setError(err?.message || "Payment failed.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[22px] border border-black/10 bg-white p-6 text-sm text-gray-500">
        Loading payment...
      </div>
    );
  }

  const succeeded =
    intent?.status === "succeeded" || investor?.investmentStatus === "active";
  const processing =
    intent?.status === "processing" ||
    status === "processing" ||
    investor?.investmentStatus === "funds_sent";

  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_14px_28px_rgba(17,24,39,0.08)]">
      <div className="flex items-start gap-3">
        <div className="rounded-[14px] bg-[#eef5f4] p-2.5 text-teal-700">
          <Banknote className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">
            Funding · Stripe ACH
          </p>
          <h3 className="font-display mt-1 text-[22px] leading-tight text-[#111111]">
            {succeeded
              ? "Payment received"
              : processing
              ? "ACH debit submitted"
              : `Fund your subscription — ${formatCurrency(intent?.amount, intent?.currency)}`}
          </h3>
          <p className="mt-2 text-sm text-[#4b5563]">
            {succeeded
              ? "Your funds have settled and your investment is active. You'll get a confirmation email shortly."
              : processing
              ? "Your ACH debit is in flight. It typically settles in 3-5 business days. We'll email you when funds confirm."
              : "Link your bank account through Stripe Financial Connections to pay via ACH. Fees are flat-capped at $5."}
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      {!succeeded && !processing ? (
        <button
          type="button"
          onClick={handlePay}
          disabled={confirming || !intent?.clientSecret}
          className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-black px-6 text-sm font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:bg-[#1f2937] disabled:opacity-60"
        >
          {confirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Launching Stripe...
            </>
          ) : (
            <>
              <Banknote className="h-4 w-4" /> Link bank & pay {formatCurrency(intent?.amount, intent?.currency)}
            </>
          )}
        </button>
      ) : null}

      {(succeeded || processing) && (
        <div className="mt-5 flex items-center gap-2 text-sm text-teal-700">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-mono text-xs text-gray-500">
            {intent?.paymentIntentId}
          </span>
        </div>
      )}
    </div>
  );
}

export default StripeFundingPanel;
