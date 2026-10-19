import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../contexts/AutContext";

const AdminRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const storedUser = localStorage.getItem("authenticatedUser");

    if (!storedUser) {
      return <Navigate to="/" replace />;
    }

    const user: unknown = JSON.parse(storedUser);

    if (
      typeof user !== "object" ||
      user === null ||
      !("perfil" in user) ||
      typeof user.perfil !== "string" ||
      user.perfil.trim().toUpperCase() !== "ADMIN"
    ) {
      return <Navigate to="/" replace />;
    }

    return <Outlet />;
  } catch {
    return <Navigate to="/" replace />;
  }
};

export default AdminRoute;
