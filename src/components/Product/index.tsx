import React, { useState, useCallback, useId, memo } from "react";

import "./ProductStyle.css";
import { Button } from "../Button";
import Modal from "../Modal";
import { useAuth } from "../../contexts/AutContext";

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
  onSubscribe?: (
    smartphone: SmartphoneSubscriptionItem,
    planMonths: number,
  ) => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(
  ({ item, onSubscribe }) => {
    if (!item) return null;

    const { isAuthenticated } = useAuth();
    const [selectedPlanMonths, setSelectedPlanMonths] = useState<number>(12);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

    // Identificadores acessíveis via useId (sem colições no DOM e limpos no unmount)
    const titleId = useId();
    const descriptionId = useId();
    const planSelectId = useId();

    const isOutOfStock = item.stock === 0;

    // Handler isolado e memoizado
    const handlePlanChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPlanMonths(Number(e.target.value));
      },
      [],
    );

    // Dispatch de ação sem vazamento de referências
    const handleSubscribe = useCallback(() => {
      if (isOutOfStock) return;

      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return;
      }

      if (onSubscribe) {
        onSubscribe(item, selectedPlanMonths);
      }
    }, [isOutOfStock, isAuthenticated, onSubscribe, item, selectedPlanMonths]);

    const handleCloseModal = useCallback(() => {
      setIsAuthModalOpen(false);
    }, []);

    // Formatação nativa de moeda
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(item.monthlyPrice);

    return (
      <>
        <article
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="phone-card"
        >
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
            <span
              className="phone-card__model"
              aria-label={`Modelo: ${item.model}`}
            >
              {item.model}
            </span>
            <h2 id={titleId} className="phone-card__title">
              {item.product}
            </h2>
          </header>

          <p id={descriptionId} className="phone-card__description">
            {item.description}
          </p>

          <ul
            className="phone-card__benefits"
            aria-label="Benefícios incluídos no plano"
          >
            {item.benefits.map((benefit, index) => (
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
              <span className="phone-card__stock--out">
                Aguardando novo lote
              </span>
            ) : (
              <span className="phone-card__stock--in">
                * {item.stock} unidades disponíveis
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
                aria-disabled={isOutOfStock}
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
              aria-disabled={isOutOfStock}
              className="phone-card__button"
              backgroundColor="var(--color-secondary)"
            >
              {isOutOfStock ? "Avise quando chegar" : "Assinar Agora"}
            </Button>
          </footer>
        </article>

        <Modal
          open={isAuthModalOpen}
          title="Autenticação necessária"
          message="É preciso fazer login ou cadastrar uma conta para realizar a assinatura."
          buttonText="Ir para o Login"
          buttonUrl="/login"
          closeUrl="/login"
          onClose={handleCloseModal}
        />
      </>
    );
  },
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
