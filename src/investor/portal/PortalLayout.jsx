import { useEffect, useState } from "react";
import {
  FileText,
  HelpCircle,
  LogOut,
  Megaphone,
  Menu,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigating is the end of the menu's job. Without this it stays open over
  // the page the tap just went to.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 md:px-8">
          <NavLink
            to="/dashboard"
            className="flex shrink-0 items-center gap-3"
            aria-label="Access Properties investor portal"
          >
            {/* The asset is white-on-black with no transparency, so it needs
                inverting to read as a dark mark on the white bar. */}
            <img src="/assets/AP.png" alt="" className="h-8 w-auto invert md:h-9" />
            <span className="text-[11px] font-medium uppercase leading-[1.35] tracking-[0.14em] text-[#111111]">
              Access
              <br />
              Properties
            </span>
          </NavLink>

          {/* Below md the links would wrap into a block that lands on top of
              the logo, so they collapse into a menu instead. */}
          <nav className="mx-auto hidden -mb-3 md:flex md:flex-wrap md:justify-center md:gap-1">
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
            className="ml-auto hidden shrink-0 items-center gap-2 rounded-[12px] border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-black/30 md:inline-flex md:ml-0"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-black/10 text-ink md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <nav className="border-t border-black/10 bg-white px-4 pb-3 md:hidden">
            {TABS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 border-b border-black/5 py-3 text-[15px] font-medium transition ${
                    isActive ? "text-[#111111]" : "text-[#6b7280]"
                  }`
                }
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-black/10 px-4 py-2.5 text-[15px] font-medium text-ink"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-6">
        <Outlet context={{ investor, setInvestor }} />
      </main>
    </div>
  );
}

export default PortalLayout;
