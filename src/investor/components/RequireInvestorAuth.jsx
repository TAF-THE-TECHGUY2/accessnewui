import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getInvestorAuthToken } from "../../services/investorApi";
import { refreshMemberSession } from "../../services/investorPortalService";

// Once per page load, not once per protected route -- remounting on navigation
// should not re-hit the API.
let memberSessionRefreshed = false;

function RequireInvestorAuth() {
  const location = useLocation();
  const token = getInvestorAuthToken();

  useEffect(() => {
    if (!token || memberSessionRefreshed) return;
    memberSessionRefreshed = true;
    refreshMemberSession();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireInvestorAuth;
