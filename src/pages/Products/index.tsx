import React from "react";
import "./ProductsStyle.css";

import mockSmartphones from "../../data/mock-smartphones.json";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard, {
  type SmartphoneSubscriptionItem,
} from "../../components/Product/index";

export const ProductsPage: React.FC = () => {
  return (
    <main className="catalog-container">
      <Header />
      <header className="catalog-header">
        <h1>Clube de Assinatura de Smartphones</h1>
        <p>Escolha seu modelo ideal com seguro total e upgrade garantido.</p>
      </header>

      <section className="catalog-grid" aria-label="Lista de Smartphones">
        {(mockSmartphones as SmartphoneSubscriptionItem[]).map((smartphone) => (
          <ProductCard key={smartphone.id} item={smartphone} />
        ))}
      </section>
      <Footer />
    </main>
  );
};

export default ProductsPage;
