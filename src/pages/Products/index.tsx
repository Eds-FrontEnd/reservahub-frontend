import React, { useState } from "react";
import "./ProductsStyle.css";

import mockSmartphones from "../../data/mock-smartphones.json";

import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard, {
  type SmartphoneSubscriptionItem,
} from "../../components/Product/index";
import { Button } from "../../components/Button";

const ITEMS_PER_PAGE = 4;

export const ProductsPage: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  const allSmartphones = mockSmartphones as SmartphoneSubscriptionItem[];
  const visibleSmartphones = allSmartphones.slice(0, visibleCount);
  const hasMore = visibleCount < allSmartphones.length;

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + ITEMS_PER_PAGE);
  };

  return (
    <main className="catalog-container">
      <Header />
      <header className="catalog-header">
        <h1>Clube de Assinatura de Smartphones</h1>
      </header>
      <section className="catalog-grid" aria-label="Lista de Smartphones">
        {visibleSmartphones.map((smartphone) => (
          <ProductCard key={smartphone.id} item={smartphone} />
        ))}
        <span className="catalog-button">
          {hasMore && (
            <Tooltip title="Carregar mais produtos" placement="top" arrow>
              <Button
                type="button"
                onClick={handleLoadMore}
                backgroundColor="var(--color-primary)"
                hoverBackgroundColor="var(--color-secondary)"
              >
                <AddIcon />
              </Button>
            </Tooltip>
          )}
        </span>
      </section>

      <Footer />
    </main>
  );
};

export default ProductsPage;
