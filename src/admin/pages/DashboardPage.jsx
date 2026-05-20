import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  Clock3,
  FileText,
  Mail,
  ShieldAlert,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import LoadingState from "../components/LoadingState";
import StatusBadge from "../components/StatusBadge";
import { getDashboardSummary } from "../../services/adminService";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatStatusLabel,
  getInitials,
} from "../../utils/formatters";

const kycColors = ["#F0A33A", "#2F80C5", "#3F9388", "#D95C4C"];
const investmentColors = ["#F0A33A", "#2F80C5", "#3F9388", "#8B7FD7", "#D8D4CD"];

const quickActionStyles = [
  "bg-[#edf6f4] text-teal-700",
  "bg-[#eef4fb] text-blue-700",
  "bg-[#fff3df] text-orange-700",
  "bg-[#f1edf8] text-purple-700",
];

const quickActionIcons = [Users, ShieldAlert, Mail, FileText];

function DashboardCard({ children, className = "" }) {
  return (
    <section
      className={`rounded-[20px] border border-black/5 bg-white shadow-[0_8px_24px_rgba(15,61,62,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-xs leading-5 text-gray-500">{subtitle}</p>
        ) : null}
      </div>

      {action}
    </div>
  );
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const data = await getDashboardSummary();
      setDashboard(data);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const recentInvestorColumns = useMemo(
    () => [
      {
        header: "Investor",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf6f4] text-xs font-semibold text-teal-700">
              {getInitials(row.original.name)}
            </div>
            <div>
              <p className="text-sm font-semibold leading-4 text-ink">
                {row.original.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {row.original.country}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Email",
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">{row.original.email}</span>
        ),
      },
      {
        header: "Investment Amount",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-700">
            {formatCurrency(row.original.investmentAmount)}
          </span>
        ),
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
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {formatDate(row.original.joinedAt)}
          </span>
        ),
      },
      {
        header: "Profile",
        cell: ({ row }) => (
          <Link
            to={`/admin/investors/${row.original.id}`}
            className="text-sm font-semibold text-teal-700 transition hover:text-teal-900"
          >
            View profile
          </Link>
        ),
      },
    ],
    []
  );

  if (loading || !dashboard) {
    return <LoadingState label="Building your investor dashboard..." />;
  }

  const { metrics } = dashboard;

  const totalKyc = dashboard.kycOverview.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const investmentTotal = dashboard.investmentStatusBreakdown.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total Investors"
          value={formatNumber(metrics.totalInvestors)}
          hint="All investor profiles in the platform"
          delta="+18 this week"
          icon={Users}
        />
        <StatCard
          label="Pending KYC"
          value={formatNumber(metrics.pendingKyc)}
          hint="Profiles awaiting compliance clearance"
          delta="+7 this week"
          icon={ShieldAlert}
        />
        <StatCard
          label="Approved Investors"
          value={formatNumber(metrics.approvedInvestors)}
          hint="KYC cleared and eligible to proceed"
          delta="+22 this week"
          icon={BadgeCheck}
        />
        <StatCard
          label="Total Invested"
          value={formatCurrency(metrics.totalInvested)}
          hint="Total committed across investor accounts"
          delta="+12.4% this month"
          icon={Wallet}
        />
        <StatCard
          label="Active Investors"
          value={formatNumber(metrics.activeInvestors)}
          hint="Investor dashboards currently active"
          delta="+15 this week"
          icon={UserCheck}
        />
      </section>

      {/* Recent investors + KYC overview */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.75fr)]">
        <DashboardCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#f1ebe3] px-5 py-3.5">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">
                Recent Investors
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Latest profiles entering the investor pipeline.
              </p>
            </div>

            <Link
              to="/admin/investors"
              className="rounded-xl border border-[#d8e6e3] bg-white px-3.5 py-2 text-xs font-semibold text-teal-800 transition hover:bg-[#edf6f4]"
            >
              View all
            </Link>
          </div>

          <div className="[&_td]:py-3 [&_th]:py-3 [&_td]:text-sm [&_th]:text-[11px]">
            <DataTable
              columns={recentInvestorColumns}
              data={dashboard.recentInvestors}
              pageSize={5}
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#f1ebe3] px-5 py-3 text-xs text-slate-500">
            <span>
              Showing 1 to {Math.min(5, dashboard.recentInvestors.length)} of{" "}
              {formatNumber(metrics.totalInvestors)} results
            </span>

            <Link
              to="/admin/investors"
              className="font-semibold text-teal-700 transition hover:text-teal-900"
            >
              View all investors →
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard className="p-5">
          <CardHeader
            title="KYC Overview"
            subtitle="Verification pipeline and review pace."
            action={
              <button className="rounded-xl border border-[#eee6dc] bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                This Month
              </button>
            }
          />

          <div className="grid gap-3 md:grid-cols-[155px_1fr] xl:grid-cols-1 2xl:grid-cols-[155px_1fr]">
            <div className="relative h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboard.kycOverview}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={4}
                    stroke="#ffffff"
                    strokeWidth={4}
                  >
                    {dashboard.kycOverview.map((entry, index) => (
                      <Cell
                        key={entry.key || entry.name}
                        fill={kycColors[index % kycColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-ink">
                  {formatNumber(totalKyc)}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>

            <div className="space-y-2.5 self-center">
              {dashboard.kycOverview.map((item, index) => {
                const percentage = totalKyc
                  ? Math.round((item.value / totalKyc) * 100)
                  : 0;

                return (
                  <div
                    key={item.key || item.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: kycColors[index % kycColors.length],
                        }}
                      />
                      <span className="text-xs text-slate-600">{item.name}</span>
                    </div>

                    <span className="text-xs font-semibold text-ink">
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[16px] bg-[#faf7f2] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf6f4] text-teal-700">
                <Clock3 className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-slate-600">
                Average KYC Review Time
              </p>
            </div>

            <p className="text-sm font-bold text-ink">1.8 Days</p>
          </div>
        </DashboardCard>
      </section>

      {/* Activity + investment status + quick actions */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)_minmax(300px,0.8fr)]">
        <DashboardCard className="p-5">
          <CardHeader
            title="Recent Activity"
            subtitle="Latest operational events across onboarding and compliance."
            action={
              <button className="rounded-xl border border-[#eee6dc] bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                View all
              </button>
            }
          />

          <div className="divide-y divide-[#f1ebe3]">
            {dashboard.recentActivity.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf6f4] text-teal-700">
                  <Activity className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {activity.description}
                      </p>
                    </div>

                    <p className="shrink-0 text-[11px] text-gray-400">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard className="p-5">
          <CardHeader
            title="Investment Status"
            subtitle="Where investors sit in the capital lifecycle."
            action={
              <button className="rounded-xl border border-[#eee6dc] bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                This Month
              </button>
            }
          />

          <div className="grid items-center gap-3 md:grid-cols-[140px_1fr] xl:grid-cols-1 2xl:grid-cols-[140px_1fr]">
            <div className="relative h-[145px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboard.investmentStatusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={63}
                    paddingAngle={4}
                    stroke="#ffffff"
                    strokeWidth={4}
                  >
                    {dashboard.investmentStatusBreakdown.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={investmentColors[index % investmentColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-base font-bold text-ink">
                  {formatNumber(investmentTotal)}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>

            <div className="space-y-2">
              {dashboard.investmentStatusBreakdown.map((item, index) => {
                const percentage = investmentTotal
                  ? Math.round((item.value / investmentTotal) * 100)
                  : 0;

                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            investmentColors[index % investmentColors.length],
                        }}
                      />
                      <span className="text-xs text-slate-600">
                        {formatStatusLabel(item.name)}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-ink">
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#f1ebe3] pt-3">
            <span className="text-xs font-medium text-slate-600">
              Total Invested
            </span>
            <span className="text-base font-bold text-ink">
              {formatCurrency(metrics.totalInvested)}
            </span>
          </div>
        </DashboardCard>

        <DashboardCard className="p-5">
          <CardHeader title="Quick Actions" subtitle="Jump to key workflows." />

          <div className="grid grid-cols-2 gap-3">
            {dashboard.quickActions.slice(0, 4).map((action, index) => {
              const Icon = quickActionIcons[index % quickActionIcons.length];

              return (
                <Link
                  key={action.id}
                  to={action.to}
                  className="flex min-h-[88px] flex-col items-center justify-center rounded-[16px] bg-[#faf7f2] p-3 text-center transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,61,62,0.08)]"
                >
                  <div
                    className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${
                      quickActionStyles[index % quickActionStyles.length]
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <p className="text-xs font-semibold text-ink">{action.label}</p>
                </Link>
              );
            })}
          </div>
        </DashboardCard>
      </section>

      {/* System overview */}
      <DashboardCard className="p-5">
        <CardHeader
          title="System Overview"
          subtitle="Operational health across the Laravel-backed admin stack."
        />

        <div className="divide-y divide-[#f1ebe3]">
          {dashboard.systemOverview.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-5 py-2.5 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{item.detail}</p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-ink">{item.value}</p>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

export default DashboardPage;