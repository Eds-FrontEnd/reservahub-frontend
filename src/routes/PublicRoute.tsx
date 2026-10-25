import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AutContext";

const getAuthenticatedProfile = (): string | null => {
  try {
    const storedUser = localStorage.getItem("authenticatedUser");

    if (!storedUser) {
      return null;
    }

    const user: unknown = JSON.parse(storedUser);

    if (
      typeof user !== "object" ||
      user === null ||
      !("perfil" in user) ||
      typeof user.perfil !== "string"
    ) {
      return null;
    }

    return user.perfil.trim().toUpperCase();
  } catch {
    return null;
  }
};

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const perfil = getAuthenticatedProfile();

  return <Navigate to={perfil === "ADMIN" ? "/admin/produtos" : "/"} replace />;
};

export default PublicRoute;
