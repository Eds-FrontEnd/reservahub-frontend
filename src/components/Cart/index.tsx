// Cart.tsx

import React, { useEffect, useState } from "react";

import { useCart } from "../../contexts/CartContext";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
    case 24:
      return "24 Meses";
    case 1:
      return "Sem Fidelidade";
    default:
      return `${planMonths} Meses`;
  }
};

export const Cart: React.FC = () => {
  const {
    items,
    isOpen,
    total,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    savePurchasePayload,
  } = useCart();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] =
    useState<boolean>(false);

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

  const handleCheckout = () => {
    if (items.length === 0) return;

    const purchasePayload = {
      items,
      totalItems: items.reduce(
        (accumulator, item) => accumulator + item.quantity,
        0,
      ),
      total,
      createdAt: new Date().toISOString(),
    };

    savePurchasePayload(purchasePayload);

    clearCart();

    setIsPurchaseModalOpen(true);
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
                    <img src={IconBag} />
                  </span>

                  <h3>
                    Seu carrinho está vazio. Não vá embora de sacola vazia.
                  </h3>

                  <p>Adicione um smartphone para começar sua assinatura.</p>
                </div>
              ) : (
                <ul className="cart-drawer__items">
                  {items.map((item) => (
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

                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label={`Aumentar quantidade de ${item.product}`}
                            >
                              +
                            </button>
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
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="cart-drawer__footer">
                <div className="cart-drawer__summary">
                  <span>Total mensal</span>

                  <strong>{formatPrice(total)}</strong>
                </div>

                <button
                  type="button"
                  className="cart-drawer__checkout"
                  onClick={handleCheckout}
                >
                  Concluir assinatura
                </button>

                <button
                  type="button"
                  className="cart-drawer__clear"
                  onClick={clearCart}
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
        message="Sua assinatura foi realizada com sucesso. Agradecemos pela preferência!"
        icon={<CheckCircleIcon />}
        iconColor="var(--color-secondary)"
        titleColor="var(--color-secondary)"
        onClose={handleClosePurchaseModal}
        redirectUrl="/"
        redirectDelay={3000}
        closeUrl="/"
      />
    </>
  );
};

export default Cart;
