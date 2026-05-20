import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getInvestorAuthToken } from "../../services/investorApi";

function RequireInvestorAuth() {
  const location = useLocation();
  const token = getInvestorAuthToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireInvestorAuth;
