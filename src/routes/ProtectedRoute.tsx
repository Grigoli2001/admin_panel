import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { LinearProgress } from "@mui/material";
import { DisabledBackground } from "../styles/customComponents";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <>
        <LinearProgress sx={{ zIndex: 2 }} />
        <DisabledBackground />
      </>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
