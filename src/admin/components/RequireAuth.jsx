import { Navigate, Outlet, useLocation } from "react-router-dom";

function RequireAuth() {
  const location = useLocation();
  const token =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem("access_admin_token");

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAuth;
