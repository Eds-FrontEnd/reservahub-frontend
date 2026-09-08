import React, { useId, memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

import Modal from "../Modal";
import { useAuth } from "../../contexts/AutContext";
import "./ProductStyle.css";
import { Button } from "../Button";

export interface SmartphoneSubscriptionItem {
  id: string;
  product: string;
  stock: number;
  description: string;
  model: string;
  image: string;
  monthlyPrice: number;
  planType: string;
  benefits: string[];
}

interface ProductCardProps {
  item: SmartphoneSubscriptionItem;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({ item }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const titleId = useId();

  if (!item) return null;

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(item.monthlyPrice);

  const handleLearnMoreClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    navigate(`/smartphones/${item.id}`);
  };

  const handleCloseModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <article aria-labelledby={titleId} className="phone-card">
        <figure className="phone-card__figure">
          <img
            src={item.image}
            alt={`Smartphone ${item.product} - Modelo ${item.model}`}
            loading="lazy"
            decoding="async"
            className="phone-card__image"
          />
          <span
            className="phone-card__badge-plan"
            aria-label={`Plano: ${item.planType}`}
          >
            {item.planType}
          </span>
        </figure>

        <header className="phone-card__header">
          <span className="phone-card__model">{item.model}</span>
          <h2 id={titleId} className="phone-card__title">
            {item.product}
          </h2>
        </header>

        <div className="phone-card__pricing">
          <span className="phone-card__price-value">{formattedPrice}</span>
          <span className="phone-card__price-period">/mês</span>
        </div>

        <footer className="phone-card__actions">
          <Button
            type="button"
            className="phone-card__button"
            backgroundColor="var(--color-secondary)"
            onClick={handleLearnMoreClick}
          >
            Saiba Mais
          </Button>
        </footer>
      </article>

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
    </>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
