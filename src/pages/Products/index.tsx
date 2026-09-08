import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import "./ProductsStyle.css";

import mockSmartphones from "../../data/mock-smartphones.json";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard, {
  type SmartphoneSubscriptionItem,
} from "../../components/Product/index";

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubscribe = useCallback(
    (smartphone: SmartphoneSubscriptionItem, planMonths: number) => {
      navigate("/checkout", {
        state: { smartphone, planMonths },
      });
    },
    [navigate],
  );

  return (
    <main className="catalog-container">
      <Header />
      <header className="catalog-header">
        <h1>Clube de Assinatura de Smartphones</h1>
        <p>Escolha seu modelo ideal com seguro total e upgrade garantido.</p>
      </header>

      <section className="catalog-grid" aria-label="Lista de Smartphones">
        {(mockSmartphones as SmartphoneSubscriptionItem[]).map((smartphone) => (
          <ProductCard
            key={smartphone.id}
            item={smartphone}
            onSubscribe={handleSubscribe}
          />
        ))}
      </section>
      <Footer />
    </main>
  );
};

export default ProductsPage;
