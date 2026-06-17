import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Onboarding = lazy(() => import("../components/Onboarding"));
const FaqPage = lazy(() => import("../pages/FaqPage"));
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
const FundsPage = lazy(() => import("../admin/pages/FundsPage"));
const FundDetailPage = lazy(() => import("../admin/pages/FundDetailPage"));
const AdminCommunicationsPage = lazy(() => import("../admin/pages/CommunicationsPage"));
const InvestorLoginPage = lazy(() => import("../investor/pages/LoginPage"));
const InvestorDashboardPage = lazy(() => import("../investor/pages/DashboardPage"));
const InvestReadyCallbackPage = lazy(() => import("../investor/pages/InvestReadyCallbackPage"));
const RequireInvestorAuth = lazy(() => import("../investor/components/RequireInvestorAuth"));
const PortalInvestmentPage = lazy(() => import("../investor/portal/pages/InvestmentPage"));
const PortalProfilePage = lazy(() => import("../investor/portal/pages/ProfilePage"));
const PortalDocumentsPage = lazy(() => import("../investor/portal/pages/DocumentsPage"));
const PortalCommunicationsPage = lazy(() => import("../investor/portal/pages/CommunicationsPage"));

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
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/login" element={<InvestorLoginPage />} />
        <Route element={<RequireInvestorAuth />}>
          <Route path="/dashboard" element={<InvestorDashboardPage />}>
            <Route index element={<PortalInvestmentPage />} />
            <Route path="profile" element={<PortalProfilePage />} />
            <Route path="documents" element={<PortalDocumentsPage />} />
            <Route path="communications" element={<PortalCommunicationsPage />} />
          </Route>
          <Route path="/oauth/investready/callback" element={<InvestReadyCallbackPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="investors" element={<InvestorsPage />} />
            <Route path="investors/:id" element={<InvestorDetailPage />} />
            <Route path="kyc-verification" element={<KycVerificationPage />} />
            <Route path="funds" element={<FundsPage />} />
            <Route path="funds/:code" element={<FundDetailPage />} />
            <Route path="communications" element={<AdminCommunicationsPage />} />
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
