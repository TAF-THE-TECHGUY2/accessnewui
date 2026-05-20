import { useState } from "react";
import { X } from "lucide-react";
import PersonaInquiry from "persona-react";

import { recordPersonaCompletion } from "../../services/adminService";

const TEMPLATE_ID = import.meta.env.VITE_PERSONA_TEMPLATE_ID || "";
const ENVIRONMENT_ID = import.meta.env.VITE_PERSONA_ENVIRONMENT_ID || undefined;

function PersonaInquiryModal({ investor, onClose, onInvestorUpdated }) {
  const [completionError, setCompletionError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  if (!TEMPLATE_ID) {
    return (
      <Backdrop onClose={onClose}>
        <ModalShell title="Persona — configuration missing" onClose={onClose}>
          <p className="text-sm text-slate-600">
            <code>VITE_PERSONA_TEMPLATE_ID</code> is not set. Add the inquiry
            template id (from Persona dashboard → Templates → your template) to{" "}
            <code>access-properties/.env.local</code> and restart the dev
            server.
          </p>
        </ModalShell>
      </Backdrop>
    );
  }

  const handleComplete = async ({ inquiryId, status }) => {
    setIsRecording(true);
    setCompletionError(null);
    try {
      const updated = await recordPersonaCompletion(investor.id, {
        inquiryId,
        status,
      });
      onInvestorUpdated(updated);
      onClose();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to record Persona completion.";
      setCompletionError(message);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalShell title="Persona Identity Verification" onClose={onClose}>
        {completionError ? (
          <div className="mb-4 rounded-[12px] bg-[#fff1ef] p-3 text-sm text-red-700">
            {completionError}
          </div>
        ) : null}
        {isRecording ? (
          <p className="mb-4 text-sm text-slate-500">
            Recording Persona result…
          </p>
        ) : null}

        <div className="h-[640px] min-h-[640px] overflow-hidden rounded-[16px] border border-[#eadfd2] [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0">
          <PersonaInquiry
            templateId={TEMPLATE_ID}
            environmentId={ENVIRONMENT_ID}
            referenceId={investor.id}
            fields={{
              nameFirst: investor.name?.split(" ")[0],
              nameLast: investor.name?.split(" ").slice(1).join(" "),
              emailAddress: investor.email,
              phoneNumber: investor.phone,
            }}
            onLoad={() => {}}
            onComplete={({ inquiryId, status }) =>
              handleComplete({ inquiryId, status })
            }
            onCancel={({ inquiryId, sessionToken }) => {
              if (inquiryId) {
                handleComplete({ inquiryId, status: "cancelled" });
              } else {
                onClose();
              }
            }}
            onError={(error) =>
              setCompletionError(error?.message || "Persona widget error")
            }
          />
        </div>
      </ModalShell>
    </Backdrop>
  );
}

function Backdrop({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="flex max-h-[92vh] w-full max-w-[760px] flex-col rounded-[22px] bg-white p-6 shadow-[0_30px_80px_rgba(15,61,62,0.25)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition hover:bg-[#faf7f2] hover:text-ink"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

export default PersonaInquiryModal;
