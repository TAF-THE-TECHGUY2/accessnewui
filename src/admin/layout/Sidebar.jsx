import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Mail,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import logo from "../../assets/Logo.png";

const navigation = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Investors", to: "/admin/investors", icon: Users },
  { label: "KYC Verification", to: "/admin/kyc-verification", icon: ShieldCheck },
  { label: "Funds", to: "/admin/funds", icon: Briefcase },
  { label: "Communications", to: "/admin/communications", icon: Megaphone },
  { label: "Email Logs", to: "/admin/email-logs", icon: Mail },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const compact = isCollapsed && !isOpen;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-ink/35 transition md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col bg-gradient-to-b from-[#0F3D3E] to-[#1F5E5F] px-4 pb-4 pt-5 text-white shadow-panel transition-all duration-300 md:sticky md:w-full md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className={`mb-8 flex items-center justify-between gap-3 ${
            compact ? "md:mb-6 md:flex-col md:items-center" : ""
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              compact ? "md:flex-col md:gap-2" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 p-2 backdrop-blur">
              <img src={logo} alt="Access Properties" className="max-h-full w-auto" />
            </div>
            {!compact ? (
              <div>
                <p className="text-sm font-semibold tracking-[0.01em] text-white">
                  Access Properties
                </p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-teal-100/65">
                  Admin
                </p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="rounded-[16px] border border-white/10 bg-white/5 p-2 text-teal-100 transition duration-200 hover:bg-white/10 md:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="hidden rounded-[16px] border border-white/10 bg-white/5 p-2 text-teal-100 transition duration-200 hover:bg-white/10 md:flex"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4.5 w-4.5" />
            ) : (
              <ChevronLeft className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center rounded-[16px] px-3.5 py-2.5 text-[13px] font-medium transition duration-200 ${
                    compact ? "justify-center md:px-2.5" : "gap-3"
                  } ${
                    isActive
                      ? "bg-[#3F9388]/28 text-white shadow-soft"
                      : "text-teal-50/80 hover:bg-white/8 hover:text-white"
                  }`
                }
                title={compact ? item.label : undefined}
              >
                <Icon className="h-4.5 w-4.5 opacity-90" />
                {!compact ? <span>{item.label}</span> : null}
              </NavLink>
            );
          })}
        </nav>

        {!compact ? (
          <div className="mt-6 rounded-[18px] bg-white/10 p-4 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
                AU
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Admin User</p>
                <p className="truncate text-xs text-teal-50/70">
                  admin@accessproperties.com
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 hidden justify-center md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-teal-50/80 shadow-soft">
              AU
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
