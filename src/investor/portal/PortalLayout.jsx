import {
  FileText,
  HelpCircle,
  LogOut,
  Megaphone,
  TrendingUp,
  User,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { logout } from "../../services/investorPortalService";

const TABS = [
  { to: "/dashboard", label: "Investment", icon: TrendingUp, end: true },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/documents", label: "Documents", icon: FileText },
  { to: "/dashboard/communications", label: "Communications", icon: Megaphone },
  { to: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
];

function PortalLayout({ investor, setInvestor }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-6 py-3 md:flex-nowrap">
          <NavLink
            to="/dashboard"
            className="flex shrink-0 items-center gap-3"
            aria-label="Access Properties investor portal"
          >
            {/* The asset is white-on-black with no transparency, so it needs
                inverting to read as a dark mark on the white bar. */}
            <img src="/assets/AP.png" alt="" className="h-9 w-auto invert" />
            <span className="text-[11px] font-medium uppercase leading-[1.35] tracking-[0.14em] text-[#111111]">
              Access
              <br />
              Properties
            </span>
          </NavLink>

          {/* The tabs sit on the bar's own bottom border, so the active
              underline reads as part of the chrome rather than a rule floating
              above the content. -mb-3 pulls them onto it against the py-3. */}
          <nav className="order-3 -mb-3 flex w-full flex-wrap justify-start gap-1 md:order-none md:mx-auto md:w-auto md:justify-center">
            {TABS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 border-b-2 px-4 pb-3 pt-2 text-sm font-medium transition ${
                    isActive
                      ? "border-black text-[#111111]"
                      : "border-transparent text-[#6b7280] hover:text-[#1f2937]"
                  }`
                }
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-[12px] border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-black/30 md:ml-0"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-6 py-8">
        <Outlet context={{ investor, setInvestor }} />
      </main>
    </div>
  );
}

export default PortalLayout;
