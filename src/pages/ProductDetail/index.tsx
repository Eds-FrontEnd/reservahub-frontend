import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import React, { useEffect, useId, useState } from "react";
import { useParams } from "react-router-dom";

import { SmartphoneService } from "../../services/SmartphoneService";

import { Button } from "../../components/Button";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import { type SmartphoneSubscriptionItem } from "../../components/Product";
import { useAuth } from "../../contexts/AutContext";
import { useCart } from "../../contexts/CartContext";

import NotFound from "../NotFound";
import "./ProductDetailStyle.css";

const PLANO_SEM_FIDELIDADE = 1;
const PLANO_ANUAL = 12;

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { addItem, items } = useCart();

  const [item, setItem] = useState<SmartphoneSubscriptionItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [selectedPlanMonths, setSelectedPlanMonths] =
    useState<number>(PLANO_ANUAL);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const planSelectId = useId();

  useEffect(() => {
    let active = true;

    const carregarSmartphone = async () => {
      setIsLoading(true);

      if (!id) {
        setItem(null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await SmartphoneService.buscarPorId(id);

        if (!active) return;

        setItem(data);
        setSelectedPlanMonths(
          data.planType.toLowerCase().includes("mensal")
            ? PLANO_SEM_FIDELIDADE
            : PLANO_ANUAL,
        );
        setImageLoading(true);
      } catch {
        if (!active) return;

        setItem(null);
        setModalMessage(
          "Tivemos um problema ao carregar os smartphones. Tente novamente mais tarde ou entre em contato com a nossa equipe para mais informações.",
        );
        setModalOpen(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void carregarSmartphone();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let active = true;

    const cancelarEscuta = SmartphoneService.escutarAtualizacoesEstoque(
      (idsProdutos) => {
        if (!active || !idsProdutos.includes(id)) return;

        void SmartphoneService.buscarPorId(id)
          .then((data) => {
            if (active) {
              setItem(data);
            }
          })
          .catch(() => {
            return;
          });
      },
    );

    return () => {
      active = false;
      cancelarEscuta();
    };
  }, [id]);

  if (isLoading) {
    return null;
  }

  if (!item) {
    return <NotFound />;
  }

  const isOutOfStock = item.stock <= 0;

  const cartQuantity = items
    .filter((cartItem) => cartItem.id === item.id)
    .reduce((total, cartItem) => total + cartItem.quantity, 0);

  const isStockLimitReached = cartQuantity >= item.stock;

  const handlePlanChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const planMonths = Number(event.target.value);

    setSelectedPlanMonths(
      planMonths === PLANO_ANUAL ? PLANO_ANUAL : PLANO_SEM_FIDELIDADE,
    );
  };

  const handleImageMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();

    setZoomPosition({
      x: ((event.clientX - left) / width) * 100,
      y: ((event.clientY - top) / height) * 100,
    });
  };

  const handleImageMouseEnter = () => {
    setIsZooming(true);
  };

  const handleImageMouseLeave = () => {
    setIsZooming(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  const handleSubscribe = () => {
    if (isOutOfStock || isStockLimitReached) return;

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    const planMonths =
      selectedPlanMonths === PLANO_ANUAL ? PLANO_ANUAL : PLANO_SEM_FIDELIDADE;

    addItem(item, planMonths);
  };

  const handleCloseAuthModal = () => {
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
        <figure
          className={`product-detail__figure ${
            isZooming ? "product-detail__figure--zooming" : ""
          }`}
          onMouseMove={handleImageMouseMove}
          onMouseEnter={handleImageMouseEnter}
          onMouseLeave={handleImageMouseLeave}
        >
          <img
            src={item.image}
            alt={`Smartphone ${item.product} - Modelo ${item.model}`}
            className={`product-detail__image ${
              isZooming ? "product-detail__image--zooming" : ""
            }`}
            style={
              isZooming
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
            onLoad={() => setImageLoading(false)}
          />

          {imageLoading && (
            <span
              className="product-detail__image-loading"
              aria-hidden="true"
            />
          )}

          <span
            className={`product-detail__badge-plan ${
              item.planType === "Mensal Flex"
                ? "product-detail__badge-plan--monthly"
                : item.planType === "Anual"
                  ? "product-detail__badge-plan--anual"
                  : ""
            }`}
            aria-label={`Plano: ${item.planType}`}
          >
            {item.planType}
          </span>
        </figure>

        <div className="product-detail__content">
          <header className="product-detail__header">
            <span
              className={`product-detail__model ${
                imageLoading ? "product-detail__shimmer" : ""
              }`}
            >
              {item.model}
            </span>

            <h1
              className={`product-detail__title ${
                imageLoading ? "product-detail__shimmer" : ""
              }`}
            >
              {item.product}
            </h1>
          </header>

          <p
            className={`product-detail__description ${
              imageLoading ? "product-detail__shimmer" : ""
            }`}
          >
            {item.description}
          </p>

          <ul
            className={`product-detail__benefits ${
              imageLoading ? "product-detail__shimmer" : ""
            }`}
            aria-label="Benefícios incluídos no plano"
          >
            {item.benefits.map((benefit, index) => (
              <li
                key={`${item.id}-benefit-${index}`}
                className="product-detail__benefit-item"
              >
                ✓ {benefit}
              </li>
            ))}
          </ul>

          <div
            className={`product-detail__pricing ${
              imageLoading ? "product-detail__shimmer" : ""
            }`}
          >
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
                <option value={PLANO_ANUAL}>12 Meses</option>
                <option value={PLANO_SEM_FIDELIDADE}>Mensal</option>
              </select>
            </div>

            <Button
              type="button"
              onClick={handleSubscribe}
              disabled={isOutOfStock || isStockLimitReached}
              className={`product-detail__button ${
                imageLoading ? "product-detail__button--shimmer" : ""
              }`}
              backgroundColor="var(--color-secondary)"
              hoverBackgroundColor="var(--color-primary)"
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
        onClose={handleCloseAuthModal}
      />

      <div className="product-detail__footer">
        <Footer />
      </div>

      <Modal
        open={modalOpen}
        title="Não foi possível carregar o smartphone"
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
};

export default ProductDetailPage;
