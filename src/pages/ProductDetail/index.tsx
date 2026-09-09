import React, { useState, useId } from "react";
import { useParams } from "react-router-dom";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";

import mockSmartphones from "../../data/mock-smartphones.json";

import { type SmartphoneSubscriptionItem } from "../../components/Product";
import { Button } from "../../components/Button";
import Modal from "../../components/Modal";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AutContext";
import { useCart } from "../../contexts/CartContext";

import "./ProductDetailStyle.css";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { addItem, items } = useCart();

  const item = (mockSmartphones as SmartphoneSubscriptionItem[]).find(
    (phone) => phone.id === id,
  );

  const [selectedPlanMonths, setSelectedPlanMonths] = useState<number>(12);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const planSelectId = useId();

  if (!item) {
    return (
      <main className="catalog-container">
        <Header />
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Produto não encontrado</h2>
        </div>
        <Footer />
      </main>
    );
  }

  const isOutOfStock = item.stock === 0;

  const cartItem = items.find((cartItem) => cartItem.id === item.id);

  const cartQuantity = cartItem?.quantity ?? 0;

  const isStockLimitReached = cartQuantity >= item.stock;

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlanMonths(Number(e.target.value));
  };

  const handleSubscribe = () => {
    if (isOutOfStock || isStockLimitReached) return;

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    addItem(item, selectedPlanMonths);
  };

  const handleCloseModal = () => {
    setIsAuthModalOpen(false);
  };

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(item.monthlyPrice);

  return (
    <main className="catalog-container">
      <Header />

      <section className="product-detail">
        <figure className="product-detail__figure">
          <img
            src={item.image}
            alt={`Smartphone ${item.product} - Modelo ${item.model}`}
            className="product-detail__image"
          />

          <span className="product-detail__badge-plan">{item.planType}</span>
        </figure>

        <div className="product-detail__content">
          <header className="product-detail__header">
            <span className="product-detail__model">{item.model}</span>

            <h1 className="product-detail__title">{item.product}</h1>
          </header>

          <p className="product-detail__description">{item.description}</p>

          <ul
            className="product-detail__benefits"
            aria-label="Benefícios incluídos no plano"
          >
            {item.benefits.map((benefit: string, index: number) => (
              <li
                key={`${item.id}-benefit-${index}`}
                className="product-detail__benefit-item"
              >
                ✓ {benefit}
              </li>
            ))}
          </ul>

          <div className="product-detail__pricing">
            <span className="product-detail__price-value">
              {formattedPrice}
            </span>

            <span className="product-detail__price-period">/mês</span>
          </div>

          <div
            className="product-detail__status"
            role="status"
            aria-live="polite"
          >
            {isOutOfStock ? (
              <span className="product-detail__stock product-detail__stock--out">
                Aguardando novo lote
              </span>
            ) : isStockLimitReached ? (
              <span className="product-detail__stock product-detail__stock--out">
                Estoque máximo atingido
              </span>
            ) : (
              <span className="product-detail__stock product-detail__stock--in">
                <AccessAlarmIcon className="animated-alarm-icon" />{" "}
                {item.stock - cartQuantity} unidades disponíveis
              </span>
            )}
          </div>

          <footer className="product-detail__actions">
            <div className="product-detail__field">
              <label htmlFor={planSelectId} className="product-detail__label">
                Plano:
              </label>

              <select
                id={planSelectId}
                value={selectedPlanMonths}
                onChange={handlePlanChange}
                disabled={isOutOfStock || isStockLimitReached}
                className="product-detail__select"
              >
                <option value={12}>12 Meses (Upgrade grátis)</option>
                <option value={24}>24 Meses (Menor parcela)</option>
                <option value={1}>Sem Fidelidade (+15%)</option>
              </select>
            </div>

            <Button
              type="button"
              onClick={handleSubscribe}
              disabled={isOutOfStock || isStockLimitReached}
              className="product-detail__button"
              backgroundColor="var(--color-secondary)"
            >
              {isOutOfStock || isStockLimitReached
                ? "Avise-me"
                : "Assinar Agora"}
            </Button>
          </footer>
        </div>
      </section>

      <Modal
        open={isAuthModalOpen}
        title="Quaaaaaase!"
        message="É preciso fazer login ou cadastrar uma conta para realizar a assinatura."
        redirectUrl="/login"
        redirectDelay={3000}
        icon={<ReportGmailerrorredIcon />}
        iconColor="var(--color-secondary)"
        titleColor="var(--color-secondary)"
        buttonUrl="/login"
        closeUrl="/login"
        onClose={handleCloseModal}
      />

      <div className="product-detail__footer">
        <Footer />
      </div>
    </main>
  );
};

export default ProductDetailPage;
