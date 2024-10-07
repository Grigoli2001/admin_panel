import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const SuperAdminRoute = () => {
  const { isSuperAdmin } = useAuth();
  if (!isSuperAdmin) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;
