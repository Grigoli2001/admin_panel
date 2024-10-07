import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const SuperAdminRoute = () => {
  const { isSuperAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;
