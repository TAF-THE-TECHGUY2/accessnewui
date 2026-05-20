import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

const routeCopy = {
  "/admin/dashboard": {
    title: "Dashboard",
    subtitle:
      "Welcome back, Admin User. Here's what's happening with your investors.",
  },
  "/admin/investors": {
    hideIntro: true,
  },
  "/admin/kyc-verification": {
    title: "KYC Verification Queue",
    subtitle: "Review documents, capture notes, and resolve compliance blockers.",
  },
  "/admin/email-logs": {
    title: "Email Delivery Logs",
    subtitle: "Track lifecycle emails, reminders, and failed sends.",
  },
  "/admin/reports": {
    title: "Reporting & Insights",
    subtitle: "Understand investor conversion, accreditation mix, and capital flow.",
  },
  "/admin/settings": {
    title: "Platform Settings",
    subtitle: "Configure operations defaults and the Laravel API environment.",
  },
};

function TopNav({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const copy = routeCopy[location.pathname] || {
    title: "Investor Profile",
    subtitle: "Review investor identity, commitments, and activity details.",
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 bg-[#f7f3ee]/92 px-4 py-4 backdrop-blur md:px-6 xl:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {copy.hideIntro ? (
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="rounded-[16px] bg-white/90 p-2.5 text-teal-800 shadow-soft transition duration-200 hover:bg-white md:hidden"
              onClick={onMenuToggle}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="rounded-[16px] bg-white/90 p-2.5 text-teal-800 shadow-soft transition duration-200 hover:bg-white md:hidden"
              onClick={onMenuToggle}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="metric-kicker">Access Properties Admin</p>
              <h2 className="mt-1.5 text-xl font-semibold leading-tight text-ink md:text-2xl">
                {copy.title}
              </h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-5 text-gray-500">
                {copy.subtitle}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative hidden xl:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search investors, KYC, reports..."
              className="h-11 w-[280px] rounded-[16px] border border-black/5 bg-white pl-10 pr-4 text-sm text-ink shadow-soft outline-none placeholder:text-gray-400"
            />
          </label>

          <div className="flex items-center gap-3 rounded-[16px] bg-white/90 px-3.5 py-2.5 shadow-soft">
            <div className="rounded-full bg-[#eef5f4] p-2 text-teal-600">
              <Bell className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-[16px] bg-white/90 px-3.5 py-2.5 shadow-soft">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#123438] text-sm font-semibold text-white">
              AU
            </div>
            <div className="text-sm leading-tight">
              <p className="font-semibold text-ink">Admin User</p>
              <p className="text-xs text-gray-500">Access Properties</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-teal-800"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopNav;
