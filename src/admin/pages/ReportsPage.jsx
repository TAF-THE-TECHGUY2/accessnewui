import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BadgeCheck, TrendingUp, UserPlus, Wallet } from "lucide-react";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import LoadingState from "../components/LoadingState";
import { getReportsData } from "../../services/adminService";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const pieColors = ["#3b8e84", "#d8a55d"];

function ReportsPage() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      const data = await getReportsData();
      setReports(data);
    };

    loadReports();
  }, []);

  if (!reports) {
    return <LoadingState label="Preparing reporting views..." />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="New Investors"
          value={formatNumber(reports.stats.newInvestors)}
          hint="Profiles created during the current month"
          icon={UserPlus}
        />
        <StatCard
          label="KYC Approved"
          value={formatNumber(reports.stats.kycApproved)}
          hint="Investors cleared for capital onboarding"
          icon={BadgeCheck}
        />
        <StatCard
          label="Total Invested"
          value={formatCurrency(reports.stats.totalInvested)}
          hint="Total commitments across mock investor data"
          icon={Wallet}
        />
        <StatCard
          label="Conversion Rate"
          value={reports.stats.conversionRate}
          hint="Qualified investors reaching approval stage"
          icon={TrendingUp}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Investment Amount Distribution"
          subtitle="Mock commitment volume by investor ticket size."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reports.investmentAmountDistribution}>
              <XAxis dataKey="range" stroke="#7b8794" fontSize={12} />
              <YAxis stroke="#7b8794" fontSize={12} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="#3b8e84" radius={[14, 14, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Accreditation Status"
          subtitle="Accredited versus non-accredited investor mix."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reports.accreditationStatusChart}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={108}
                paddingAngle={4}
              >
                {reports.accreditationStatusChart.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}

export default ReportsPage;
