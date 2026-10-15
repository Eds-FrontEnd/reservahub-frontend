import React, { useEffect, useState } from "react";

import { useCart } from "../../contexts/CartContext";
import { CompraService } from "../../services/CompraService";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Tooltip from "@mui/material/Tooltip";

import IconBag from "../../assets/images/icons/icon-bag.svg";

import Modal from "../Modal";

import "./CartStyle.css";

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

const getPlanName = (planMonths: number): string => {
  switch (planMonths) {
    case 12:
      return "12 Meses";
    case 1:
      return "Sem Fidelidade";
    default:
      return `${planMonths} Meses`;
  }
};

const getDiscountPercent = (coupon: string): number | null => {
  const match = coupon
    .trim()
    .toUpperCase()
    .match(/^DESC(100|[1-9]\d?)%$/);

  if (!match) return null;

  return Number(match[1]);
};

const roundPrice = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const Cart: React.FC = () => {
  const {
    items,
    isOpen,
    total,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");

  const discountPercent = appliedCoupon
    ? (getDiscountPercent(appliedCoupon) ?? 0)
    : 0;

  const discountAmount = roundPrice((total * discountPercent) / 100);
  const totalWithDiscount = roundPrice(Math.max(0, total - discountAmount));

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeCart]);

  const handleApplyCoupon = () => {
    const normalizedCoupon = couponInput.trim().toUpperCase();

    if (!normalizedCoupon) {
      setAppliedCoupon("");
      setCouponError("");
      return;
    }

    const percentage = getDiscountPercent(normalizedCoupon);

    if (percentage === null) {
      setAppliedCoupon("");
      setCouponError("Cupom inválido. Confira o código e tente novamente.");
      return;
    }

    setAppliedCoupon(normalizedCoupon);
    setCouponInput(normalizedCoupon);
    setCouponError("");
    setCheckoutError("");
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setAppliedCoupon("");
    setCouponError("");
  };

  const handleCheckout = async () => {
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setCheckoutError("");

    try {
      const purchaseItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        planMonths: item.planMonths,
      }));

      if (appliedCoupon) {
        await CompraService.concluirCompra(purchaseItems, {
          coupon: appliedCoupon,
          discountPercent,
          discountAmount,
          totalWithDiscount,
        });
      } else {
        await CompraService.concluirCompra(purchaseItems);
      }

      clearCart();
      setCouponInput("");
      setAppliedCoupon("");
      setCouponError("");
      setIsPurchaseModalOpen(true);
    } catch (error: unknown) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir sua assinatura. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
  };

  return (
    <>
      {isOpen && (
        <>
          <div
            className="cart-overlay"
            onClick={closeCart}
            aria-hidden="true"
          />

          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            <header className="cart-drawer__header">
              <div>
                <span className="cart-drawer__eyebrow">Sua assinatura</span>
                <h2 id="cart-title">Meu carrinho</h2>
              </div>

              <button
                type="button"
                className="cart-drawer__close"
                onClick={closeCart}
                aria-label="Fechar carrinho"
              >
                x
              </button>
            </header>

            <div className="cart-drawer__content">
              {items.length === 0 ? (
                <div className="cart-drawer__empty">
                  <span aria-hidden="true">
                    <img src={IconBag} alt="" />
                  </span>

                  <h3>
                    Seu carrinho está vazio. Não vá embora de sacola vazia.
                  </h3>

                  <p>Adicione um smartphone para começar sua assinatura.</p>
                </div>
              ) : (
                <ul className="cart-drawer__items">
                  {items.map((item) => {
                    const isStockLimitReached = item.quantity >= item.stock;

                    const stockLimitMessage = `Estoque máximo atingido. Há apenas ${item.stock} ${
                      item.stock === 1
                        ? "unidade disponível"
                        : "unidades disponíveis"
                    } para este smartphone.`;

                    return (
                      <li
                        key={`${item.id}-${item.planMonths}`}
                        className="cart-item"
                      >
                        <img
                          src={item.image}
                          alt={`${item.product} - ${item.model}`}
                          className="cart-item__image"
                        />

                        <div className="cart-item__content">
                          <h3>{item.product}</h3>

                          <span className="cart-item__model">{item.model}</span>

                          <span className="cart-item__plan">
                            Plano: {getPlanName(item.planMonths)}
                          </span>

                          <strong className="cart-item__price">
                            {formatPrice(item.monthlyPrice)}
                            <small>/mês</small>
                          </strong>

                          <div className="cart-item__actions">
                            <div
                              className="cart-item__quantity"
                              aria-label={`Quantidade de ${item.product}`}
                            >
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                aria-label={`Diminuir quantidade de ${item.product}`}
                              >
                                -
                              </button>

                              <span aria-live="polite">{item.quantity}</span>

                              <Tooltip
                                title={
                                  isStockLimitReached
                                    ? stockLimitMessage
                                    : "Adicionar unidade"
                                }
                              >
                                <span>
                                  <button
                                    type="button"
                                    aria-label={
                                      isStockLimitReached
                                        ? `Estoque máximo de ${item.product} atingido`
                                        : `Aumentar quantidade de ${item.product}`
                                    }
                                    disabled={isStockLimitReached}
                                    onClick={() => updateQuantity(item.id, 1)}
                                  >
                                    +
                                  </button>
                                </span>
                              </Tooltip>
                            </div>

                            <button
                              type="button"
                              className="cart-item__remove"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remover ${item.product} do carrinho`}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="cart-drawer__footer">
                <div className="cart-drawer__coupon">
                  <label htmlFor="cart-coupon">Cupom de desconto</label>

                  <div className="cart-drawer__coupon-controls">
                    <input
                      id="cart-coupon"
                      name="coupon"
                      type="text"
                      value={couponInput}
                      onChange={(event) => {
                        setCouponInput(event.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      placeholder="Ex.: DESC10%"
                      autoComplete="off"
                      aria-invalid={Boolean(couponError)}
                      aria-describedby={
                        couponError ? "cart-coupon-error" : undefined
                      }
                      disabled={isSubmitting}
                    />

                    <button
                      type="button"
                      className="cart-drawer__coupon-apply"
                      onClick={handleApplyCoupon}
                      disabled={isSubmitting}
                    >
                      Aplicar
                    </button>
                  </div>

                  {couponError && (
                    <p
                      id="cart-coupon-error"
                      className="cart-drawer__error"
                      role="alert"
                    >
                      {couponError}
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="cart-drawer__coupon-applied">
                      <span>
                        Cupom {appliedCoupon} aplicado ({discountPercent}%)
                      </span>

                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        disabled={isSubmitting}
                        aria-label="Remover cupom"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>

                <div className="cart-drawer__summary">
                  <span>Total mensal</span>
                  <strong>{formatPrice(total)}</strong>
                </div>

                {appliedCoupon && (
                  <>
                    <div className="cart-drawer__summary">
                      <span>Desconto ({discountPercent}%)</span>
                      <strong>- {formatPrice(discountAmount)}</strong>
                    </div>

                    <div className="cart-drawer__summary">
                      <span>Total mensal com desconto</span>
                      <strong>{formatPrice(totalWithDiscount)}</strong>
                    </div>
                  </>
                )}

                {checkoutError && (
                  <p className="cart-drawer__error" role="alert">
                    {checkoutError}
                  </p>
                )}

                <button
                  type="button"
                  className="cart-drawer__checkout"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting
                    ? "Processando assinatura..."
                    : "Concluir assinatura"}
                </button>

                <button
                  type="button"
                  className="cart-drawer__clear"
                  onClick={clearCart}
                  disabled={isSubmitting}
                >
                  Limpar carrinho
                </button>
              </footer>
            )}
          </aside>
        </>
      )}

      <Modal
        open={isPurchaseModalOpen}
        title="Compra realizada!"
        message="Sua assinatura foi registrada com sucesso. Agradecemos pela preferência!"
        icon={<CheckCircleIcon />}
        iconColor="var(--color-secondary)"
        titleColor="var(--color-secondary)"
        onClose={handleClosePurchaseModal}
      />
    </>
  );
};

export default Cart;
