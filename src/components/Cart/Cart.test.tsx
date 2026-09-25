import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Cart from "../Cart/index";
import { useCart } from "../../contexts/CartContext";
import type { CartItem } from "../../contexts/CartContext";

import type { SmartphoneSubscriptionItem } from "../Product";

import "@testing-library/jest-dom";

jest.mock("../../contexts/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("../../assets/images/icons/icon-bag.svg", () => "icon-bag.svg");

jest.mock("../Modal", () => {
  return function MockModal({
    open,
    title,
    message,
    onClose,
    redirectUrl,
    redirectDelay,
    closeUrl,
  }: {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
    redirectUrl?: string;
    redirectDelay?: number;
    closeUrl?: string;
  }) {
    if (!open) {
      return null;
    }

    return (
      <div
        role="dialog"
        aria-label={title}
        data-testid="purchase-modal"
        data-redirect-url={redirectUrl}
        data-redirect-delay={redirectDelay}
        data-close-url={closeUrl}
      >
        <h2>{title}</h2>

        <p>{message}</p>

        <button type="button" onClick={onClose}>
          Fechar
        </button>
      </div>
    );
  };
});

const mockedUseCart = jest.mocked(useCart);

type CartContextValue = ReturnType<typeof useCart>;

const createProduct = (
  overrides: Partial<SmartphoneSubscriptionItem> = {},
): SmartphoneSubscriptionItem => ({
  id: "iphone-15-pro-max",
  product: "iPhone 15 Pro Max",
  model: "256GB",
  image: "/iphone-15-pro-max.png",
  monthlyPrice: 289.9,
  stock: 8,
  description: "iPhone 15 Pro Max com 256GB de armazenamento.",
  planType: "smartphone",
  benefits: [
    "Smartphone premium",
    "Assinatura mensal",
    "Suporte especializado",
  ],
  ...overrides,
});

const createCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  ...createProduct(),
  quantity: 1,
  planMonths: 24,
  ...overrides,
});

const createCartMock = (
  overrides: Partial<CartContextValue> = {},
): CartContextValue => ({
  items: [],
  isOpen: true,
  totalItems: 0,
  total: 0,
  addItem: jest.fn(),
  updateQuantity: jest.fn(),
  removeItem: jest.fn(),
  clearCart: jest.fn(),
  openCart: jest.fn(),
  closeCart: jest.fn(),
  savePurchasePayload: jest.fn(),
  ...overrides,
});

const mockCart = (
  overrides: Partial<CartContextValue> = {},
): CartContextValue => {
  const cart = createCartMock(overrides);

  mockedUseCart.mockReturnValue(cart);

  return cart;
};

const renderCart = () => render(<Cart />);

describe("Cart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("visibilidade", () => {
    it("deve renderizar o carrinho quando estiver aberto", () => {
      mockCart({
        isOpen: true,
      });

      renderCart();

      expect(
        screen.getByRole("dialog", {
          name: "Meu carrinho",
        }),
      ).toBeInTheDocument();
    });

    it("não deve renderizar o drawer quando estiver fechado", () => {
      mockCart({
        isOpen: false,
      });

      renderCart();

      expect(
        screen.queryByRole("dialog", {
          name: "Meu carrinho",
        }),
      ).not.toBeInTheDocument();
    });

    it("deve manter o modal de compra fechado inicialmente", () => {
      mockCart();

      renderCart();

      expect(screen.queryByTestId("purchase-modal")).not.toBeInTheDocument();
    });
  });

  describe("carrinho vazio", () => {
    it("deve exibir a mensagem de carrinho vazio", () => {
      mockCart({
        items: [],
      });

      renderCart();

      expect(
        screen.getByText(
          "Seu carrinho está vazio. Não vá embora de sacola vazia.",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText("Adicione um smartphone para começar sua assinatura."),
      ).toBeInTheDocument();
    });

    it("deve renderizar o ícone do carrinho vazio", () => {
      mockCart({
        items: [],
      });

      renderCart();

      const icon = document.querySelector(
        '.cart-drawer__empty img[src="icon-bag.svg"]',
      );

      expect(icon).toBeInTheDocument();
    });

    it("não deve exibir o rodapé quando o carrinho estiver vazio", () => {
      mockCart({
        items: [],
      });

      renderCart();

      expect(
        document.querySelector(".cart-drawer__footer"),
      ).not.toBeInTheDocument();
    });
  });

  describe("produto", () => {
    it("deve exibir as informações do produto", () => {
      const item = createCartItem();

      mockCart({
        items: [item],
        total: 289.9,
        totalItems: 1,
      });

      renderCart();

      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
      expect(screen.getByText("256GB")).toBeInTheDocument();
      expect(screen.getByText("Plano: 24 Meses")).toBeInTheDocument();

      const productItem = screen.getByRole("listitem");

      expect(productItem).toHaveTextContent("R$ 289,90");
      expect(productItem).toHaveTextContent("/mês");
    });

    it("deve exibir o plano de 24 meses", () => {
      const item = createCartItem({
        planMonths: 24,
      });

      mockCart({
        items: [item],
      });

      renderCart();

      expect(screen.getByText("Plano: 24 Meses")).toBeInTheDocument();
    });

    it("deve exibir o plano de 12 meses", () => {
      const item = createCartItem({
        planMonths: 12,
      });

      mockCart({
        items: [item],
      });

      renderCart();

      expect(screen.getByText("Plano: 12 Meses")).toBeInTheDocument();
    });

    it("deve exibir o plano sem fidelidade", () => {
      const item = createCartItem({
        planMonths: 1,
      });

      mockCart({
        items: [item],
      });

      renderCart();

      expect(screen.getByText("Plano: Sem Fidelidade")).toBeInTheDocument();
    });

    it("deve exibir o número de meses quando o plano não for 1, 12 ou 24", () => {
      const item = createCartItem({
        planMonths: 36,
      });

      mockCart({
        items: [item],
      });

      renderCart();

      expect(screen.getByText("Plano: 36 Meses")).toBeInTheDocument();
    });

    it("deve renderizar a imagem do produto com o alt correto", () => {
      const item = createCartItem();

      mockCart({
        items: [item],
      });

      renderCart();

      expect(
        screen.getByRole("img", {
          name: "iPhone 15 Pro Max - 256GB",
        }),
      ).toHaveAttribute("src", "/iphone-15-pro-max.png");
    });

    it("deve renderizar múltiplos produtos", () => {
      const firstItem = createCartItem({
        id: "iphone-15-pro-max",
        product: "iPhone 15 Pro Max",
        model: "256GB",
      });

      const secondItem = createCartItem({
        id: "galaxy-s24-ultra",
        product: "Galaxy S24 Ultra",
        model: "512GB",
        image: "/galaxy-s24-ultra.png",
        monthlyPrice: 319.9,
      });

      mockCart({
        items: [firstItem, secondItem],
        total: 609.8,
        totalItems: 2,
      });

      renderCart();

      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
      expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();

      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("deve exibir a quantidade correta do produto", () => {
      const item = createCartItem({
        quantity: 3,
      });

      mockCart({
        items: [item],
        totalItems: 3,
      });

      renderCart();

      const quantity = screen.getByText("3");

      expect(quantity).toBeInTheDocument();
      expect(quantity).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("quantidade", () => {
    it("deve diminuir a quantidade ao clicar no botão de menos", async () => {
      const updateQuantity = jest.fn();

      const item = createCartItem({
        quantity: 2,
      });

      mockCart({
        items: [item],
        updateQuantity,
        totalItems: 2,
      });

      renderCart();

      const decreaseButton = screen.getByRole("button", {
        name: "Diminuir quantidade de iPhone 15 Pro Max",
      });

      await userEvent.click(decreaseButton);

      expect(updateQuantity).toHaveBeenCalledTimes(1);
      expect(updateQuantity).toHaveBeenCalledWith("iphone-15-pro-max", -1);
    });

    it("deve aumentar a quantidade ao clicar no botão de mais", async () => {
      const updateQuantity = jest.fn();

      const item = createCartItem({
        quantity: 2,
      });

      mockCart({
        items: [item],
        updateQuantity,
        totalItems: 2,
      });

      renderCart();

      const increaseButton = screen.getByRole("button", {
        name: "Aumentar quantidade de iPhone 15 Pro Max",
      });

      await userEvent.click(increaseButton);

      expect(updateQuantity).toHaveBeenCalledTimes(1);
      expect(updateQuantity).toHaveBeenCalledWith("iphone-15-pro-max", 1);
    });

    it("deve desabilitar o botão de aumentar quando atingir o estoque máximo", () => {
      const item = createCartItem({
        quantity: 8,
        stock: 8,
      });

      mockCart({
        items: [item],
        totalItems: 8,
      });

      renderCart();

      const increaseButton = screen.getByRole("button", {
        name: "Estoque máximo de iPhone 15 Pro Max atingido",
      });

      expect(increaseButton).toBeDisabled();
    });

    it("deve habilitar o botão de aumentar quando não atingir o estoque máximo", () => {
      const item = createCartItem({
        quantity: 7,
        stock: 8,
      });

      mockCart({
        items: [item],
        totalItems: 7,
      });

      renderCart();

      const increaseButton = screen.getByRole("button", {
        name: "Aumentar quantidade de iPhone 15 Pro Max",
      });

      expect(increaseButton).toBeEnabled();
    });

    it("deve exibir tooltip no plural quando houver mais de uma unidade disponível", async () => {
      const user = userEvent.setup();

      const item = createCartItem({
        quantity: 8,
        stock: 8,
      });

      mockCart({
        items: [item],
        totalItems: 8,
      });

      renderCart();

      const increaseButton = screen.getByRole("button", {
        name: "Estoque máximo de iPhone 15 Pro Max atingido",
      });

      await user.hover(increaseButton);

      expect(await screen.findByRole("tooltip")).toHaveTextContent(
        "Estoque máximo atingido. Há apenas 8 unidades disponíveis para este smartphone.",
      );
    });

    it("deve exibir tooltip no singular quando houver apenas uma unidade disponível", async () => {
      const user = userEvent.setup();

      const item = createCartItem({
        quantity: 1,
        stock: 1,
      });

      mockCart({
        items: [item],
        totalItems: 1,
      });

      renderCart();

      const increaseButton = screen.getByRole("button", {
        name: "Estoque máximo de iPhone 15 Pro Max atingido",
      });

      await user.hover(increaseButton);

      expect(await screen.findByRole("tooltip")).toHaveTextContent(
        "Estoque máximo atingido. Há apenas 1 unidade disponível para este smartphone.",
      );
    });
  });

  describe("remoção", () => {
    it("deve remover o produto ao clicar em Remover", async () => {
      const removeItem = jest.fn();

      const item = createCartItem();

      mockCart({
        items: [item],
        removeItem,
        totalItems: 1,
      });

      renderCart();

      const removeButton = screen.getByRole("button", {
        name: "Remover iPhone 15 Pro Max do carrinho",
      });

      await userEvent.click(removeButton);

      expect(removeItem).toHaveBeenCalledTimes(1);
      expect(removeItem).toHaveBeenCalledWith("iphone-15-pro-max");
    });

    it("deve limpar o carrinho ao clicar em Limpar carrinho", async () => {
      const clearCart = jest.fn();

      const item = createCartItem();

      mockCart({
        items: [item],
        clearCart,
      });

      renderCart();

      await userEvent.click(
        screen.getByRole("button", {
          name: "Limpar carrinho",
        }),
      );

      expect(clearCart).toHaveBeenCalledTimes(1);
    });
  });

  describe("fechamento", () => {
    it("deve fechar o carrinho pelo botão X", async () => {
      const closeCart = jest.fn();

      mockCart({
        closeCart,
      });

      renderCart();

      await userEvent.click(
        screen.getByRole("button", {
          name: "Fechar carrinho",
        }),
      );

      expect(closeCart).toHaveBeenCalledTimes(1);
    });

    it("deve fechar o carrinho ao clicar no overlay", async () => {
      const closeCart = jest.fn();

      mockCart({
        closeCart,
      });

      renderCart();

      const overlay = document.querySelector(".cart-overlay");

      expect(overlay).toBeInTheDocument();

      fireEvent.click(overlay as Element);

      expect(closeCart).toHaveBeenCalledTimes(1);
    });

    it("deve fechar o carrinho ao pressionar Escape", () => {
      const closeCart = jest.fn();

      mockCart({
        closeCart,
        isOpen: true,
      });

      renderCart();

      fireEvent.keyDown(document, {
        key: "Escape",
      });

      expect(closeCart).toHaveBeenCalledTimes(1);
    });

    it("não deve fechar o carrinho ao pressionar outra tecla", () => {
      const closeCart = jest.fn();

      mockCart({
        closeCart,
        isOpen: true,
      });

      renderCart();

      fireEvent.keyDown(document, {
        key: "Enter",
      });

      expect(closeCart).not.toHaveBeenCalled();
    });

    it("não deve registrar o fechamento por Escape quando o carrinho estiver fechado", () => {
      const closeCart = jest.fn();

      mockCart({
        closeCart,
        isOpen: false,
      });

      renderCart();

      fireEvent.keyDown(document, {
        key: "Escape",
      });

      expect(closeCart).not.toHaveBeenCalled();
    });
  });

  describe("resumo", () => {
    it("deve exibir o total formatado corretamente", () => {
      const item = createCartItem();

      mockCart({
        items: [item],
        total: 289.9,
      });

      renderCart();

      const summary = document.querySelector(".cart-drawer__summary");

      expect(summary).toBeInTheDocument();
      expect(summary).toHaveTextContent("Total mensal");
      expect(summary).toHaveTextContent("R$ 289,90");
    });

    it("deve calcular e exibir corretamente um total com múltiplas unidades", () => {
      const item = createCartItem({
        quantity: 2,
      });

      mockCart({
        items: [item],
        total: 579.8,
        totalItems: 2,
      });

      renderCart();

      const summary = document.querySelector(".cart-drawer__summary");

      expect(summary).toHaveTextContent("R$ 579,80");
    });
  });

  describe("checkout", () => {
    it("não deve concluir a assinatura quando o carrinho estiver vazio", async () => {
      const savePurchasePayload = jest.fn();
      const clearCart = jest.fn();

      mockCart({
        items: [],
        savePurchasePayload,
        clearCart,
      });

      renderCart();

      expect(
        screen.queryByRole("button", {
          name: "Concluir assinatura",
        }),
      ).not.toBeInTheDocument();

      expect(savePurchasePayload).not.toHaveBeenCalled();
      expect(clearCart).not.toHaveBeenCalled();
    });

    it("deve salvar o payload da compra", async () => {
      const savePurchasePayload = jest.fn();
      const clearCart = jest.fn();

      const item = createCartItem({
        quantity: 2,
      });

      mockCart({
        items: [item],
        totalItems: 2,
        total: 579.8,
        savePurchasePayload,
        clearCart,
      });

      renderCart();

      await userEvent.click(
        screen.getByRole("button", {
          name: "Concluir assinatura",
        }),
      );

      expect(savePurchasePayload).toHaveBeenCalledTimes(1);

      const payload = savePurchasePayload.mock.calls[0][0] as {
        items: CartItem[];
        totalItems: number;
        total: number;
        createdAt: string;
      };

      expect(payload.items).toEqual([item]);
      expect(payload.totalItems).toBe(2);
      expect(payload.total).toBe(579.8);
      expect(payload.createdAt).toEqual(expect.any(String));
    });

    it("deve criar createdAt em formato ISO", async () => {
      const savePurchasePayload = jest.fn();

      const item = createCartItem();

      mockCart({
        items: [item],
        totalItems: 1,
        total: 289.9,
        savePurchasePayload,
      });

      renderCart();

      await userEvent.click(
        screen.getByRole("button", {
          name: "Concluir assinatura",
        }),
      );

      const payload = savePurchasePayload.mock.calls[0][0] as {
        createdAt: string;
      };

      expect(payload.createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    });

    it("deve limpar o carrinho após concluir a assinatura", async () => {
      const clearCart = jest.fn();

      const item = createCartItem();

      mockCart({
        items: [item],
        totalItems: 1,
        total: 289.9,
        clearCart,
      });

      renderCart();

      await userEvent.click(
        screen.getByRole("button", {
          name: "Concluir assinatura",
        }),
      );

      expect(clearCart).toHaveBeenCalledTimes(1);
    });

    it("deve abrir o modal após concluir a assinatura", async () => {
      const item = createCartItem();

      mockCart({
        items: [item],
        totalItems: 1,
        total: 289.9,
      });

      renderCart();

      await userEvent.click(
        screen.getByRole("button", {
          name: "Concluir assinatura",
        }),
      );

      expect(screen.getByTestId("purchase-modal")).toBeInTheDocument();

      expect(
        screen.getByRole("heading", {
          name: "Compra realizada!",
        }),
      ).toBeInTheDocument();
    });

    it("deve passar os parâmetros corretos para o modal", async () => {
      const item = createCartItem();

      mockCart({
        items: [item],
        totalItems: 1,
        total: 289.9,
      });

      renderCart();

      await userEvent.click(
        screen.getByRole("button", {
          name: "Concluir assinatura",
        }),
      );

      const modal = screen.getByTestId("purchase-modal");

      expect(modal).toHaveAttribute("data-redirect-url", "/");
      expect(modal).toHaveAttribute("data-redirect-delay", "3000");
      expect(modal).toHaveAttribute("data-close-url", "/");
    });

    it("deve fechar o modal ao clicar em Fechar", async () => {
      const item = createCartItem();

      mockCart({
        items: [item],
        totalItems: 1,
        total: 289.9,
      });

      renderCart();

      await userEvent.click(
        screen.getByRole("button", {
          name: "Concluir assinatura",
        }),
      );

      expect(screen.getByTestId("purchase-modal")).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole("button", {
          name: "Fechar",
        }),
      );

      await waitFor(() => {
        expect(screen.queryByTestId("purchase-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("acessibilidade", () => {
    it("deve possuir role dialog e aria-modal", () => {
      mockCart();

      renderCart();

      const dialog = screen.getByRole("dialog", {
        name: "Meu carrinho",
      });

      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "cart-title");
    });

    it("deve possuir aria-label na área de quantidade", () => {
      const item = createCartItem();

      mockCart({
        items: [item],
      });

      renderCart();

      expect(
        screen.getByLabelText("Quantidade de iPhone 15 Pro Max"),
      ).toBeInTheDocument();
    });

    it("deve utilizar aria-live para atualizar a quantidade", () => {
      const item = createCartItem();

      mockCart({
        items: [item],
      });

      renderCart();

      expect(screen.getByText("1")).toHaveAttribute("aria-live", "polite");
    });

    it("deve marcar o overlay como aria-hidden", () => {
      mockCart();

      renderCart();

      const overlay = document.querySelector(".cart-overlay");

      expect(overlay).toHaveAttribute("aria-hidden", "true");
    });
  });
});
