import React, { useState, useId } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";

import mockSmartphones from "../../data/mock-smartphones.json";
// IMPORTAÇÃO CORRIGIDA (Adicionado o prefixo "type" ou vindo do componente ProductCard)
import { type SmartphoneSubscriptionItem } from "../../components/Product";
import { Button } from "../../components/Button";
import Modal from "../../components/Modal";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AutContext";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlanMonths(Number(e.target.value));
  };

  const handleSubscribe = () => {
    if (isOutOfStock) return;

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    navigate("/checkout", {
      state: { smartphone: item, planMonths: selectedPlanMonths },
    });
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
      <section
        className="product-detail-container"
        style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}
      >
        <figure className="phone-card__figure">
          <img
            src={item.image}
            alt={`Smartphone ${item.product} - Modelo ${item.model}`}
            className="phone-card__image"
          />
          <span className="phone-card__badge-plan">{item.planType}</span>
        </figure>

        <header className="phone-card__header">
          <span className="phone-card__model">{item.model}</span>
          <h1>{item.product}</h1>
        </header>

        <p className="phone-card__description">{item.description}</p>

        <ul
          className="phone-card__benefits"
          aria-label="Benefícios incluídos no plano"
        >
          {/* TIPAGEM DOS PARÂMETROS ADICIONADA AQUI */}
          {item.benefits.map((benefit: string, index: number) => (
            <li
              key={`${item.id}-benefit-${index}`}
              className="phone-card__benefit-item"
            >
              ✓ {benefit}
            </li>
          ))}
        </ul>

        <div className="phone-card__pricing">
          <span className="phone-card__price-value">{formattedPrice}</span>
          <span className="phone-card__price-period">/mês</span>
        </div>

        <div className="phone-card__status" role="status" aria-live="polite">
          {isOutOfStock ? (
            <span className="phone-card__stock--out">Aguardando novo lote</span>
          ) : (
            <span className="phone-card__stock--in">
              <AccessAlarmIcon className="animated-alarm-icon" /> {item.stock}{" "}
              unidades disponíveis
            </span>
          )}
        </div>

        <footer className="phone-card__actions">
          <div className="phone-card__field">
            <label htmlFor={planSelectId} className="phone-card__label">
              Plano:
            </label>
            <select
              id={planSelectId}
              value={selectedPlanMonths}
              onChange={handlePlanChange}
              disabled={isOutOfStock}
              className="phone-card__select"
            >
              <option value={12}>12 Meses (Upgrade grátis)</option>
              <option value={24}>24 Meses (Menor parcela)</option>
              <option value={1}>Sem Fidelidade (+15%)</option>
            </select>
          </div>

          <Button
            type="button"
            onClick={handleSubscribe}
            disabled={isOutOfStock}
            className="phone-card__button"
            backgroundColor="var(--color-secondary)"
          >
            {isOutOfStock ? "Avise quando chegar" : "Assinar Agora"}
          </Button>
        </footer>
      </section>

      <Modal
        open={isAuthModalOpen}
        title="Autenticação necessária"
        message="É preciso fazer login ou cadastrar uma conta para realizar a assinatura."
        buttonText="Ir para o Login"
        buttonUrl="/login"
        closeUrl="/login"
        onClose={handleCloseModal}
      />

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
      />
      <Footer />
    </main>
  );
};

export default ProductDetailPage;
