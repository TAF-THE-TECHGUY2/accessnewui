import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Onboarding = lazy(() => import("../components/Onboarding"));
const AdminLayout = lazy(() => import("../admin/layout/AdminLayout"));
const RequireAuth = lazy(() => import("../admin/components/RequireAuth"));
const LoginPage = lazy(() => import("../admin/pages/LoginPage"));
const DashboardPage = lazy(() => import("../admin/pages/DashboardPage"));
const InvestorsPage = lazy(() => import("../admin/pages/InvestorsPage"));
const InvestorDetailPage = lazy(() => import("../admin/pages/InvestorDetailPage"));
const KycVerificationPage = lazy(() => import("../admin/pages/KycVerificationPage"));
const EmailLogsPage = lazy(() => import("../admin/pages/EmailLogsPage"));
const ReportsPage = lazy(() => import("../admin/pages/ReportsPage"));
const SettingsPage = lazy(() => import("../admin/pages/SettingsPage"));
const InvestorLoginPage = lazy(() => import("../investor/pages/LoginPage"));
const InvestorDashboardPage = lazy(() => import("../investor/pages/DashboardPage"));
const RequireInvestorAuth = lazy(() => import("../investor/components/RequireInvestorAuth"));

function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-sand-100 text-sm font-medium text-slate-500">
          Loading Access Properties admin...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/login" element={<InvestorLoginPage />} />
        <Route element={<RequireInvestorAuth />}>
          <Route path="/dashboard" element={<InvestorDashboardPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="investors" element={<InvestorsPage />} />
            <Route path="investors/:id" element={<InvestorDetailPage />} />
            <Route path="kyc-verification" element={<KycVerificationPage />} />
            <Route path="email-logs" element={<EmailLogsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
