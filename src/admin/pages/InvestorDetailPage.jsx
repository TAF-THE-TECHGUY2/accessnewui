import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  ShieldCheck,
  StickyNote,
  User,
  Wallet,
} from "lucide-react";

import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import InvestorProcessingPanel from "../components/InvestorProcessingPanel";
import InvestReadyPanel from "../components/InvestReadyPanel";
import InvestorAgreements from "../components/InvestorAgreements";
import AdminOverridePanel from "../components/AdminOverridePanel";
import {
  getInvestorById,
  updateInvestorStatuses,
} from "../../services/adminService";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getInitials,
} from "../../utils/formatters";

const tabs = [
  "Overview",
  "Processing",
  "KYC Documents",
  "Agreements",
  "Investments",
  "Activity",
  "Messages",
  "Notes",
];

function DetailCard({ icon: Icon, title, children, className = "" }) {
  return (
    <section
      className={`rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)] ${className}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf6f4] text-teal-700">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
      </div>

      {children}
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-ink">{value || "—"}</p>
    </div>
  );
}

function InvestorDetailPage() {
  const { id } = useParams();

  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [statuses, setStatuses] = useState({
    kycStatus: "pending",
    investmentStatus: "awaiting_kyc",
    dashboardStatus: "pending",
  });

  useEffect(() => {
    const loadInvestor = async () => {
      setLoading(true);

      const data = await getInvestorById(id);
      setInvestor(data);

      if (data) {
        setStatuses({
          kycStatus: data.kycStatus,
          investmentStatus: data.investmentStatus,
          dashboardStatus: data.dashboardStatus,
        });
      }

      setLoading(false);
    };

    loadInvestor();
  }, [id]);

  const persistStatuses = async (nextStatuses = statuses) => {
    if (!investor) return;

    const updated = await updateInvestorStatuses(investor.id, nextStatuses);

    setInvestor(updated);
    setStatuses({
      kycStatus: updated.kycStatus,
      investmentStatus: updated.investmentStatus,
      dashboardStatus: updated.dashboardStatus,
    });
  };

  if (loading) {
    return <LoadingState label="Loading investor profile..." />;
  }

  if (!investor) {
    return (
      <EmptyState
        title="Investor not found"
        description="The requested investor record could not be loaded."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/investors"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to investors
      </Link>

      {/* Header */}
      <section className="rounded-[26px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-[#edf6f4] text-2xl font-semibold text-teal-700">
              {getInitials(investor.name)}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                Access Properties Admin
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                {investor.name}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={investor.kycStatus} />
                <StatusBadge status={investor.investmentStatus} />
                <StatusBadge status={investor.dashboardStatus} />
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:min-w-[460px]">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal-700" />
              <span className="truncate">{investor.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-teal-700" />
              <span>{investor.phone}</span>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-teal-700" />
              <span>{investor.country}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-teal-700" />
              <span>Joined {formatDate(investor.joinedAt)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="rounded-[22px] border border-black/5 bg-white/80 p-2 shadow-[0_10px_30px_rgba(15,61,62,0.04)]">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-[16px] px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-[#0f4f4f] text-white shadow-sm"
                  : "text-slate-600 hover:bg-[#faf7f2]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Overview */}
      {activeTab === "Overview" ? (
        <section className="grid gap-6 xl:grid-cols-3">
          <DetailCard icon={User} title="Personal Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Investor Type" value={investor.personalInfo.investorType} />
              <InfoRow label="Entity Name" value={investor.personalInfo.entityName} />
              <InfoRow label="Tax ID Last 4" value={investor.personalInfo.taxIdLast4} />
              <InfoRow label="Residency" value={investor.personalInfo.residency} />
            </div>
          </DetailCard>

          <DetailCard icon={MapPin} title="Address Information">
            <div className="space-y-4">
              <InfoRow label="Address Line 1" value={investor.address.line1} />
              <InfoRow label="Address Line 2" value={investor.address.line2} />
              <InfoRow
                label="City / State / Postal"
                value={`${investor.address.city}, ${investor.address.state} ${investor.address.postalCode}`}
              />
              <InfoRow label="Country" value={investor.address.country} />
            </div>
          </DetailCard>

          <DetailCard icon={ShieldCheck} title="Status Management">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  KYC Status
                </label>
                <select
                  className="h-11 w-full rounded-[16px] border border-[#eadfd2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
                  value={statuses.kycStatus}
                  onChange={(event) =>
                    setStatuses((current) => ({
                      ...current,
                      kycStatus: event.target.value,
                    }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  Investment Status
                </label>
                <select
                  className="h-11 w-full rounded-[16px] border border-[#eadfd2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
                  value={statuses.investmentStatus}
                  onChange={(event) =>
                    setStatuses((current) => ({
                      ...current,
                      investmentStatus: event.target.value,
                    }))
                  }
                >
                  <option value="awaiting_kyc">Awaiting KYC</option>
                  <option value="awaiting_accreditation_verification">
                    Awaiting accreditation verification
                  </option>
                  <option value="awaiting_documents">Awaiting documents</option>
                  <option value="awaiting_legal_approval">
                    Awaiting legal approval
                  </option>
                  <option value="awaiting_funding">Awaiting funding</option>
                  <option value="funds_sent">Funds sent</option>
                  <option value="funds_confirmed">Funds confirmed</option>
                  <option value="pending_partner_review">
                    Pending partner review
                  </option>
                  <option value="redirected_to_partner">
                    Redirected to partner
                  </option>
                  <option value="partner_match_pending">
                    Partner match pending
                  </option>
                  <option value="partner_match_complete">
                    Partner match complete
                  </option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  Dashboard Status
                </label>
                <select
                  className="h-11 w-full rounded-[16px] border border-[#eadfd2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
                  value={statuses.dashboardStatus}
                  onChange={(event) =>
                    setStatuses((current) => ({
                      ...current,
                      dashboardStatus: event.target.value,
                    }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[16px] bg-[#edf6f4] px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-[#dcefeb]"
                onClick={() =>
                  persistStatuses({
                    ...statuses,
                    kycStatus: "approved",
                    dashboardStatus: "active",
                  })
                }
              >
                Approve KYC
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[16px] bg-[#fff1ef] px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-[#ffe1dc]"
                onClick={() =>
                  persistStatuses({
                    ...statuses,
                    kycStatus: "rejected",
                    dashboardStatus: "inactive",
                    investmentStatus: "inactive",
                  })
                }
              >
                Reject KYC
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#0f4f4f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3f3f]"
                onClick={() => persistStatuses()}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </DetailCard>

          <DetailCard icon={Wallet} title="Investment Information" className="xl:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow label="Fund" value={investor.investmentInfo.fundName} />
              <InfoRow
                label="Commitment"
                value={formatCurrency(investor.investmentInfo.commitment)}
              />
              <InfoRow
                label="Funded"
                value={formatCurrency(investor.investmentInfo.funded)}
              />
              <InfoRow label="Wallet Status" value={investor.investmentInfo.walletStatus} />
              <InfoRow label="Expected Yield" value={investor.investmentInfo.expectedYield} />
              <InfoRow
                label="Last Distribution"
                value={
                  investor.investmentInfo.lastDistribution
                    ? formatDate(investor.investmentInfo.lastDistribution)
                    : "N/A"
                }
              />
            </div>
          </DetailCard>

          <DetailCard icon={Activity} title="Activity Summary">
            <div className="divide-y divide-[#f1ebe3]">
              {investor.activity.slice(0, 4).map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="shrink-0 text-xs text-slate-400">
                      {formatDateTime(item.timestamp)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </DetailCard>
        </section>
      ) : null}

      {/* Processing */}
      {activeTab === "Processing" ? (
        <div className="flex flex-col gap-6">
          <InvestorProcessingPanel
            investor={investor}
            onInvestorUpdated={(updated) => {
              setInvestor(updated);
              setStatuses({
                kycStatus: updated.kycStatus,
                investmentStatus: updated.investmentStatus,
                dashboardStatus: updated.dashboardStatus,
              });
            }}
          />
          <InvestReadyPanel
            investorCode={investor.id}
            onInvestorUpdated={(updated) => {
              setInvestor(updated);
              setStatuses({
                kycStatus: updated.kycStatus,
                investmentStatus: updated.investmentStatus,
                dashboardStatus: updated.dashboardStatus,
              });
            }}
          />
          <AdminOverridePanel
            investor={investor}
            onInvestorUpdated={(updated) => {
              setInvestor(updated);
              setStatuses({
                kycStatus: updated.kycStatus,
                investmentStatus: updated.investmentStatus,
                dashboardStatus: updated.dashboardStatus,
              });
            }}
          />
        </div>
      ) : null}

      {/* KYC Documents */}
      {activeTab === "KYC Documents" ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {investor.documents.map((document) => (
            <section
              key={document.id}
              className="rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{document.type}</p>
                  <p className="mt-1 text-sm text-slate-500">{document.fileName}</p>
                </div>
                <StatusBadge status={document.status} />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Submitted {formatDateTime(document.submittedAt)}
              </p>
            </section>
          ))}
        </section>
      ) : null}

      {/* Investments */}
      {activeTab === "Investments" ? (
        <section className="rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] bg-[#faf7f2] p-5">
              <p className="metric-kicker">Commitment</p>
              <p className="mt-3 text-2xl font-semibold text-ink">
                {formatCurrency(investor.investmentInfo.commitment)}
              </p>
            </div>

            <div className="rounded-[20px] bg-[#faf7f2] p-5">
              <p className="metric-kicker">Funded</p>
              <p className="mt-3 text-2xl font-semibold text-ink">
                {formatCurrency(investor.investmentInfo.funded)}
              </p>
            </div>

            <div className="rounded-[20px] bg-[#faf7f2] p-5">
              <p className="metric-kicker">Wallet Status</p>
              <p className="mt-3 text-lg font-semibold text-ink">
                {investor.investmentInfo.walletStatus}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Activity */}
      {activeTab === "Activity" ? (
        <section className="space-y-4">
          {investor.activity.map((item) => (
            <section
              key={item.id}
              className="rounded-[22px] border border-black/5 bg-white p-5 shadow-[0_10px_30px_rgba(15,61,62,0.06)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-sm text-slate-400">
                  {formatDateTime(item.timestamp)}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </section>
          ))}
        </section>
      ) : null}

      {/* Messages */}
      {activeTab === "Messages" ? (
        <section className="space-y-4">
          {investor.messages.length ? (
            investor.messages.map((message) => (
              <section
                key={message.id}
                className="rounded-[22px] border border-black/5 bg-white p-5 shadow-[0_10px_30px_rgba(15,61,62,0.06)]"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[#edf6f4] p-3 text-teal-700">
                    <MessageSquare className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-ink">{message.subject}</p>
                    <p className="mt-2 text-sm text-slate-600">{message.preview}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Sent {formatDateTime(message.sentAt)}
                    </p>
                  </div>
                </div>
              </section>
            ))
          ) : (
            <EmptyState
              title="No messages yet"
              description="Outbound communication history will appear here."
            />
          )}
        </section>
      ) : null}

      {/* Agreements */}
      {activeTab === "Agreements" ? (
        <InvestorAgreements
          investorCode={investor.id}
          investorName={investor.name}
        />
      ) : null}

      {/* Notes */}
      {activeTab === "Notes" ? (
        <section className="space-y-4">
          {investor.notes.length ? (
            investor.notes.map((note) => (
              <section
                key={note.id}
                className="rounded-[22px] border border-black/5 bg-white p-5 shadow-[0_10px_30px_rgba(15,61,62,0.06)]"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                    <StickyNote className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm leading-6 text-slate-700">{note.body}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Added {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                </div>
              </section>
            ))
          ) : (
            <EmptyState
              title="No notes recorded"
              description="Internal investor notes will appear here when saved."
            />
          )}
        </section>
      ) : null}
    </div>
  );
}

export default InvestorDetailPage;