import { LogOut, FileText, Megaphone, TrendingUp, User } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { logout } from "../../services/investorPortalService";

const TABS = [
  { to: "/dashboard", label: "Investment", icon: TrendingUp, end: true },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/documents", label: "Documents", icon: FileText },
  { to: "/dashboard/communications", label: "Communications", icon: Megaphone },
];

function PortalLayout({ investor, setInvestor }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const firstName = investor?.name?.trim().split(" ")[0] || "Investor";

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.8),transparent_26%),linear-gradient(135deg,#f5f5f5_0%,#ffffff_52%,#f3f4f6_100%)]" />
      </div>

      <div className="relative mx-auto max-w-[1180px] px-6 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
              Access Properties · Investor Portal
            </p>
            <h1 className="font-display mt-3 text-[40px] leading-[1.02] text-[#111111]">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-2 text-[14px] text-[#4b5563]">
              {investor?.investmentInfo?.fundName || "Your fund"} · {investor?.code}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 self-start rounded-[12px] border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink shadow-soft transition hover:border-black/30"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </header>

        <nav className="mt-8 flex flex-wrap gap-2 border-b border-black/10">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-t-[12px] border-b-2 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-black text-[#111111]"
                    : "border-transparent text-[#6b7280] hover:text-[#1f2937]"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="mt-8">
          <Outlet context={{ investor, setInvestor }} />
        </main>
      </div>
    </div>
  );
}

export default PortalLayout;
