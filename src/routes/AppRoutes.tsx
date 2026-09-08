import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

const HomePage = lazy(() => import("../pages/Home"));
const LoginPage = lazy(() => import("../pages/Login"));
const RegisterPage = lazy(() => import("../pages/Register"));
const Product = lazy(() => import("../pages/Products"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetail/index"));

const PageLoader = () => (
  <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
    <p>Carregando...</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/smartphones" element={<Product />} />

        <Route element={<PrivateRoute />}>
          <Route path="/smartphones/:id" element={<ProductDetailPage />} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastrar" element={<RegisterPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
