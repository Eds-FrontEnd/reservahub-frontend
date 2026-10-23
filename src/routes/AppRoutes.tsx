import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Loader from "../components/Loader";
import AdminLoginPage from "../pages/AdminLogin";
import AdminRoute from "./AdminRoute";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import { useAuth } from "../contexts/AutContext";
import AdminGraphic from "../pages/AdminGraphic";

const HomePage = lazy(() => import("../pages/Home"));
const LoginPage = lazy(() => import("../pages/Login"));
const RegisterPage = lazy(() => import("../pages/Register"));
const Product = lazy(() => import("../pages/Products"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetail"));
const SmartPhoneSubscription = lazy(() => import("../pages/Subscription"));
const ContactPage = lazy(() => import("../pages/Contact"));
const ResetPasswordPage = lazy(() => import("../pages/Reset"));
const AguardandoRespostaResetSenha = lazy(
  () => import("../pages/WaitingResetPassword"),
);
const AdminResetPasswordPage = lazy(
  () => import("../pages/AdminResetPassword"),
);
const AdminCouponsPage = lazy(() => import("../pages/AdminCoupons"));
const NotFound = lazy(() => import("../pages/NotFound"));

const HomeRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    try {
      const storedUser = localStorage.getItem("authenticatedUser");

      if (storedUser) {
        const user: unknown = JSON.parse(storedUser);

        if (
          typeof user === "object" &&
          user !== null &&
          "perfil" in user &&
          typeof user.perfil === "string" &&
          user.perfil.trim().toUpperCase() === "ADMIN"
        ) {
          return <Navigate to="/admin/grafico" replace />;
        }
      }
    } catch {
      return <HomePage />;
    }
  }

  return <HomePage />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/smartphones" element={<Product />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/como-funciona" element={<SmartPhoneSubscription />} />
        <Route
          path="/aguardando-resposta"
          element={<AguardandoRespostaResetSenha />}
        />
        <Route path="/recuperar-senha" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFound />} />

        <Route element={<PrivateRoute />}>
          <Route path="/smartphones/:id" element={<ProductDetailPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route
            path="/admin/solicitacoes-reset-senha"
            element={<AdminResetPasswordPage />}
          />
          <Route path="/admin/grafico" element={<AdminGraphic />} />
          <Route path="/admin/cupons" element={<AdminCouponsPage />} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/cadastrar" element={<RegisterPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
