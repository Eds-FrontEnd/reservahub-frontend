import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Loader from "../components/Loader";

const HomePage = lazy(() => import("../pages/Home"));
const LoginPage = lazy(() => import("../pages/Login"));
const RegisterPage = lazy(() => import("../pages/Register"));
const Product = lazy(() => import("../pages/Products"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetail/index"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
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
