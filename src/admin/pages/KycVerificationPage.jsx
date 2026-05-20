import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import FilterBar from "../components/FilterBar";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import LoadingState from "../components/LoadingState";
import {
  getKycQueue,
  updateKycReview,
} from "../../services/adminService";
import { formatDate, formatDateTime, getInitials } from "../../utils/formatters";

function KycVerificationPage() {
  const [queue, setQueue] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [filters, setFilters] = useState({
    kycStatus: "",
    documentType: "",
    accreditationStatus: "",
    submittedDate: "",
  });

  useEffect(() => {
    const loadQueue = async () => {
      setLoading(true);
      const data = await getKycQueue(filters);
      setQueue(data.items);
      setSummary(data.summary);
      setSelectedId((current) =>
        data.items.some((item) => item.id === current) ? current : data.items[0]?.id || null
      );
      setLoading(false);
    };

    loadQueue();
  }, [filters]);

  const selectedRecord = queue.find((item) => item.id === selectedId) || null;

  const columns = useMemo(
    () => [
      {
        header: "Investor",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 font-semibold text-teal-700">
              {getInitials(row.original.investorName)}
            </div>
            <div>
              <p className="font-semibold text-ink">{row.original.investorName}</p>
              <p className="text-xs text-slate-500">{row.original.investorEmail}</p>
            </div>
          </div>
        ),
      },
      {
        header: "Document Type",
        cell: ({ row }) => row.original.documentType,
      },
      {
        header: "Submitted Date",
        cell: ({ row }) => formatDate(row.original.submittedDate),
      },
      {
        header: "KYC Status",
        cell: ({ row }) => <StatusBadge status={row.original.kycStatus} />,
      },
      {
        header: "Accreditation",
        cell: ({ row }) => (
          <StatusBadge status={row.original.accreditationStatus} />
        ),
      },
      {
        header: "Documents",
        cell: ({ row }) => `${row.original.documents.length} files`,
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <button
            type="button"
            className="text-sm font-semibold text-teal-700 transition hover:text-teal-900"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedId(row.original.id);
            }}
          >
            Review
          </button>
        ),
      },
    ],
    []
  );

  const handleDecision = async (kycStatus) => {
    if (!selectedRecord) {
      return;
    }

    await updateKycReview(selectedRecord.investorId, {
      kycStatus,
      notes: reviewNotes[selectedRecord.id] || "",
    });

    const data = await getKycQueue(filters);
    setQueue(data.items);
    setSummary(data.summary);
  };

  if (loading && !summary) {
    return <LoadingState label="Loading KYC review queue..." />;
  }

  return (
    <div className="space-y-6">
      {summary ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Pending Review"
            value={summary.pendingReview}
            hint="Fresh submissions awaiting triage"
            icon={Clock3}
          />
          <StatCard
            label="Submitted"
            value={summary.submitted}
            hint="Profiles delivered to compliance"
            icon={FileText}
          />
          <StatCard
            label="Approved"
            value={summary.approved}
            hint="Cleared for funding workflows"
            icon={CheckCircle2}
          />
          <StatCard
            label="Rejected"
            value={summary.rejected}
            hint="Need revised or replacement documents"
            icon={XCircle}
          />
          <StatCard
            label="Average Review Time"
            value={summary.averageReviewTime}
            hint="Average turnaround across recent reviews"
            icon={ShieldCheck}
          />
        </section>
      ) : null}

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Search not enabled on this queue yet"
        searchDisabled
        filters={[
          {
            name: "kycStatus",
            label: "KYC Status",
            value: filters.kycStatus,
            onChange: (value) => setFilters((current) => ({ ...current, kycStatus: value })),
            options: [
              { value: "pending", label: "Pending" },
              { value: "submitted", label: "Submitted" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ],
          },
          {
            name: "documentType",
            label: "Document Type",
            value: filters.documentType,
            onChange: (value) =>
              setFilters((current) => ({ ...current, documentType: value })),
            options: [
              { value: "Passport", label: "Passport" },
              { value: "Proof of Address", label: "Proof of Address" },
              { value: "Certificate of Formation", label: "Certificate of Formation" },
              { value: "Beneficial Ownership", label: "Beneficial Ownership" },
              { value: "Articles of Incorporation", label: "Articles of Incorporation" },
              { value: "Tax Certificate", label: "Tax Certificate" },
            ],
          },
          {
            name: "accreditationStatus",
            label: "Accreditation",
            value: filters.accreditationStatus,
            onChange: (value) =>
              setFilters((current) => ({ ...current, accreditationStatus: value })),
            options: [
              { value: "accredited", label: "Accredited" },
              { value: "non_accredited", label: "Non accredited" },
            ],
          },
          {
            name: "submittedDate",
            label: "Submitted Date",
            value: filters.submittedDate,
            onChange: (value) =>
              setFilters((current) => ({ ...current, submittedDate: value })),
            options: Array.from(
              new Map(
                queue.map((item) => [
                  item.submittedDate.slice(0, 10),
                  {
                    value: item.submittedDate.slice(0, 10),
                    label: formatDate(item.submittedDate),
                  },
                ])
              ).values()
            ),
          },
        ]}
        onClear={() =>
          setFilters({
            kycStatus: "",
            documentType: "",
            accreditationStatus: "",
            submittedDate: "",
          })
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <DataTable
          columns={columns}
          data={queue}
          loading={loading}
          pageSize={8}
          onRowClick={(item) => setSelectedId(item.id)}
        />

        <aside className="admin-card p-5">
          {selectedRecord ? (
            <div className="space-y-5">
              <div>
                <p className="metric-kicker">Review Panel</p>
                <h3 className="mt-2 text-2xl font-semibold text-ink">
                  {selectedRecord.investorName}
                </h3>
              </div>

              <div className="rounded-3xl bg-sand-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 font-semibold text-teal-700">
                    {getInitials(selectedRecord.investorName)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{selectedRecord.investorEmail}</p>
                    <p className="text-sm text-slate-500">{selectedRecord.phone}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge status={selectedRecord.kycStatus} />
                  <StatusBadge status={selectedRecord.accreditationStatus} />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Documents list</p>
                <div className="space-y-3">
                  {selectedRecord.documents.map((document) => (
                    <div
                      key={document.id}
                      className="rounded-2xl border border-sand-200 bg-white p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{document.type}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {document.fileName}
                          </p>
                        </div>
                        <StatusBadge status={document.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-ink">
                  Document preview placeholder
                </p>
                <div className="grid min-h-[180px] place-items-center rounded-3xl border border-dashed border-sand-300 bg-sand-50 text-center text-sm text-slate-500">
                  Preview area for scanned IDs and supporting documents.
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  Review notes
                </label>
                <textarea
                  className="admin-textarea"
                  value={reviewNotes[selectedRecord.id] || ""}
                  onChange={(event) =>
                    setReviewNotes((current) => ({
                      ...current,
                      [selectedRecord.id]: event.target.value,
                    }))
                  }
                  placeholder="Capture review rationale, missing docs, or compliance comments..."
                />
                <p className="mt-2 text-xs text-slate-400">
                  Submitted {formatDateTime(selectedRecord.submittedDate)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="admin-button"
                  onClick={() => handleDecision("approved")}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="admin-button-danger"
                  onClick={() => handleDecision("rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[520px] place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
                  <User className="h-6 w-6" />
                </div>
                <p className="font-semibold text-ink">No review selected</p>
                <p className="mt-2 text-sm text-slate-500">
                  Pick an investor from the queue to begin a review.
                </p>
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

export default KycVerificationPage;
