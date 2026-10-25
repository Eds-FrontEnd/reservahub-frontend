import React, { memo, useId, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const titleId = useId();
  const [imageLoading, setImageLoading] = useState(true);

  if (!item) return null;

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(item.monthlyPrice);

  const handleLearnMoreClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate(`/smartphones/${item.id}`);
  };

  return (
    <article aria-labelledby={titleId} className="phone-card">
      <figure className="phone-card__figure">
        <img
          src={item.image}
          alt={`Smartphone ${item.product} - Modelo ${item.model}`}
          loading="lazy"
          decoding="async"
          className="phone-card__image"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />

        {imageLoading && (
          <span className="phone-card__image-loading" aria-hidden="true" />
        )}

        <span
          className={`phone-card__badge-plan ${
            item.planType === "Mensal Flex"
              ? "phone-card__badge-plan--monthly"
              : item.planType === "Anual"
                ? "phone-card__badge-plan--annual"
                : ""
          }`}
          aria-label={`Plano: ${item.planType}`}
        >
          {item.planType}
        </span>
      </figure>

      <header className="phone-card__header">
        <span
          className={`phone-card__model ${
            imageLoading ? "phone-card__shimmer" : ""
          }`}
        >
          {item.model}
        </span>

        <h2
          id={titleId}
          className={`phone-card__title ${
            imageLoading ? "phone-card__shimmer" : ""
          }`}
        >
          {item.product}
        </h2>
      </header>

      <div
        className={`phone-card__pricing ${
          imageLoading ? "phone-card__shimmer" : ""
        }`}
      >
        <span className="phone-card__price-value">{formattedPrice}</span>

        <span className="phone-card__price-period">/mês</span>
      </div>

      <footer className="phone-card__actions">
        <Button
          type="button"
          className={`phone-card__button ${
            imageLoading ? "phone-card__button--shimmer" : ""
          }`}
          backgroundColor="var(--color-secondary)"
          hoverBackgroundColor="var(--color-primary)"
          onClick={handleLearnMoreClick}
        >
          {isAuthenticated ? "Saiba Mais" : "Entre para ver"}
        </Button>
      </footer>
    </article>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
