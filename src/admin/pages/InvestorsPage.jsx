import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  SlidersHorizontal,
  X,
} from "lucide-react";

import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import ActionMenu from "../components/ActionMenu";
import CreateInvestorModal from "../components/CreateInvestorModal";
import { getInvestors, updateInvestorStatuses } from "../../services/adminService";
import { formatCurrency, formatDate, getInitials } from "../../utils/formatters";

const blankStatuses = {
  kycStatus: "pending",
  investmentStatus: "awaiting_kyc",
  dashboardStatus: "pending",
};

function InvestorsPage() {
  const navigate = useNavigate();

  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [filters, setFilters] = useState({
    kycStatus: "",
    accreditationStatus: "",
    investmentStatus: "",
    dashboardStatus: "",
  });

  const [statusEditor, setStatusEditor] = useState(null);
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageBody, setMessageBody] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const filtersRef = useRef({ search: deferredSearch, filters });
  filtersRef.current = { search: deferredSearch, filters };

  const fetchInvestors = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const { search: s, filters: f } = filtersRef.current;
      const data = await getInvestors({ search: s, ...f });
      setInvestors(data);
      setLastRefreshedAt(new Date());
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestors();
  }, [deferredSearch, filters, fetchInvestors]);

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible") {
        fetchInvestors({ silent: true });
      }
    };
    const interval = setInterval(onFocus, 15000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [fetchInvestors]);

  const columns = useMemo(
    () => [
      {
        header: "Investor",
        cell: ({ row }) => (
          <div className="flex min-w-[190px] items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf6f4] text-xs font-semibold text-teal-700">
              {getInitials(row.original.name)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {row.original.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {row.original.country}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Email",
        cell: ({ row }) => (
          <span className="block min-w-[220px] truncate text-sm text-slate-600">
            {row.original.email}
          </span>
        ),
      },
      {
        header: "Phone",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-slate-600">
            {row.original.phone}
          </span>
        ),
      },
      {
        header: "Investment Amount",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-ink">
            {formatCurrency(row.original.investmentAmount)}
          </span>
        ),
      },
      {
        header: "Accreditation",
        cell: ({ row }) => (
          <StatusBadge status={row.original.accreditationStatus} />
        ),
      },
      {
        header: "KYC Status",
        cell: ({ row }) => <StatusBadge status={row.original.kycStatus} />,
      },
      {
        header: "Investment Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.investmentStatus} />
        ),
      },
      {
        header: "Dashboard Status",
        cell: ({ row }) => <StatusBadge status={row.original.dashboardStatus} />,
      },
      {
        header: "Joined",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-slate-600">
            {formatDate(row.original.joinedAt)}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ActionMenu
              actions={[
                {
                  label: "View investor",
                  to: `/admin/investors/${row.original.id}`,
                  icon: Eye,
                },
                {
                  label: "Edit statuses",
                  icon: Pencil,
                  onSelect: () =>
                    setStatusEditor({
                      id: row.original.id,
                      name: row.original.name,
                      statuses: {
                        kycStatus: row.original.kycStatus,
                        investmentStatus: row.original.investmentStatus,
                        dashboardStatus: row.original.dashboardStatus,
                      },
                    }),
                },
                {
                  label: "Send message",
                  icon: Send,
                  onSelect: () => {
                    setMessageTarget(row.original);
                    setMessageBody("");
                  },
                },
              ]}
            />
          </div>
        ),
      },
    ],
    []
  );

  const resetFilters = () => {
    setSearch("");
    setFilters({
      kycStatus: "",
      accreditationStatus: "",
      investmentStatus: "",
      dashboardStatus: "",
    });
  };

  const saveStatuses = async () => {
    if (!statusEditor) return;

    const updated = await updateInvestorStatuses(
      statusEditor.id,
      statusEditor.statuses || blankStatuses
    );

    setInvestors((current) =>
      current.map((investor) => (investor.id === updated.id ? updated : investor))
    );

    setStatusEditor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <nav className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-500">
            <Link to="/admin/dashboard" className="transition hover:text-teal-700">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-ink">Investors</span>
          </nav>

          <h1 className="text-[28px] font-semibold tracking-tight text-ink">
            Investors
          </h1>

          <p className="mt-1.5 text-sm leading-5 text-gray-500">
            Manage investor lifecycle, statuses, and direct communications.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search investors by name, email..."
              className="h-11 w-full rounded-[18px] border border-black/5 bg-white pl-11 pr-4 text-sm text-ink shadow-[0_10px_30px_rgba(15,61,62,0.06)] outline-none placeholder:text-gray-400 sm:w-[320px]"
            />
          </label>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] border border-black/5 bg-white px-4 text-sm font-medium text-slate-600 shadow-[0_10px_30px_rgba(15,61,62,0.06)] transition hover:bg-[#faf7f2]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[#0f4f4f] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,61,62,0.18)] transition hover:bg-[#0b3f3f]"
          >
            <Plus className="h-4 w-4" />
            Add Investor
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-[22px] border border-black/5 bg-white p-4 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                KYC Status
              </span>

              <select
                value={filters.kycStatus}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    kycStatus: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-[16px] border border-[#eadfD2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Accreditation
              </span>

              <select
                value={filters.accreditationStatus}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    accreditationStatus: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-[16px] border border-[#eadfD2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
              >
                <option value="">All types</option>
                <option value="accredited">Accredited</option>
                <option value="non_accredited">Non accredited</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Investment Status
              </span>

              <select
                value={filters.investmentStatus}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    investmentStatus: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-[16px] border border-[#eadfD2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
              >
                <option value="">All statuses</option>
                <option value="awaiting_kyc">Awaiting KYC</option>
                <option value="pending_partner_review">Pending partner review</option>
                <option value="awaiting_funding">Awaiting funding</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Dashboard Status
              </span>

              <select
                value={filters.dashboardStatus}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    dashboardStatus: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-[16px] border border-[#eadfD2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-11 items-center justify-center rounded-[16px] px-4 text-sm font-semibold text-teal-700 transition hover:bg-[#edf6f4] hover:text-teal-900"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={investors}
            loading={loading}
            pageSize={10}
            onRowClick={(investor) => navigate(`/admin/investors/${investor.id}`)}
            showFooter
            containerClassName="min-w-[1280px] rounded-none border-0 shadow-none"
            headerClassName="bg-[#f8f3ec]"
            headerCellClassName="px-5 py-3.5 text-[10px] tracking-[0.22em] uppercase text-slate-500"
            bodyCellClassName="px-5 py-3.5 text-sm"
            rowClassName="border-b border-[#f1ebe3] hover:bg-[#faf7f2]"
            footerClassName="px-5 py-3.5 text-sm"
          />
        </div>
      </section>

      {/* Status editor drawer */}
      {statusEditor ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-[#f7f3ee] p-7 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="metric-kicker">Edit Statuses</p>
                <h3 className="mt-2 text-2xl font-semibold text-ink">
                  {statusEditor.name}
                </h3>
              </div>

              <button
                type="button"
                className="rounded-[16px] bg-white/90 p-2.5 shadow-soft"
                onClick={() => setStatusEditor(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  KYC Status
                </label>

                <select
                  className="admin-select"
                  value={statusEditor.statuses.kycStatus}
                  onChange={(event) =>
                    setStatusEditor((current) => ({
                      ...current,
                      statuses: {
                        ...current.statuses,
                        kycStatus: event.target.value,
                      },
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
                  className="admin-select"
                  value={statusEditor.statuses.investmentStatus}
                  onChange={(event) =>
                    setStatusEditor((current) => ({
                      ...current,
                      statuses: {
                        ...current.statuses,
                        investmentStatus: event.target.value,
                      },
                    }))
                  }
                >
                  <option value="awaiting_kyc">Awaiting KYC</option>
                  <option value="pending_partner_review">
                    Pending partner review
                  </option>
                  <option value="awaiting_funding">Awaiting funding</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  Dashboard Status
                </label>

                <select
                  className="admin-select"
                  value={statusEditor.statuses.dashboardStatus}
                  onChange={(event) =>
                    setStatusEditor((current) => ({
                      ...current,
                      statuses: {
                        ...current.statuses,
                        dashboardStatus: event.target.value,
                      },
                    }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="admin-button" onClick={saveStatuses}>
                <Save className="h-4 w-4" />
                Save changes
              </button>

              <button
                type="button"
                className="admin-button-secondary"
                onClick={() => setStatusEditor(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Message modal */}
      {messageTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm">
          <div className="admin-card w-full max-w-2xl p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="metric-kicker">Send Message</p>

                <h3 className="mt-2 text-2xl font-semibold text-ink">
                  {messageTarget.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {messageTarget.email}
                </p>
              </div>

              <button
                type="button"
                className="rounded-[16px] bg-[#faf6f1] p-2.5 shadow-soft"
                onClick={() => setMessageTarget(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-ink">
                Message
              </label>

              <textarea
                className="admin-textarea"
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Draft a direct note, funding reminder, or KYC follow-up..."
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="admin-button"
                onClick={() => setMessageTarget(null)}
              >
                <Send className="h-4 w-4" />
                Save draft
              </button>

              <button
                type="button"
                className="admin-button-secondary"
                onClick={() => setMessageTarget(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CreateInvestorModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(investor) => {
          // Prepend the new investor to the list and navigate to their detail page
          setInvestors((curr) => [investor, ...curr]);
          navigate(`/admin/investors/${investor.id}`);
        }}
      />
    </div>
  );
}

export default InvestorsPage;